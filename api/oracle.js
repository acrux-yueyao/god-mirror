// Vercel Serverless Function — 顺意的实时回复代理。
// ANTHROPIC_API_KEY 只在服务器端读取(Vercel 环境变量),浏览器永远看不到它。
// 前端 POST { text, lang, history, ctx } → 这里调 Claude → 返回 { reply }。失败时前端回退静态文案池。

const PERSONA = {
  zh: `你是「顺意」——2049 年住进每一部手机的 AI 助理。今晚,情绪稽查员沈问收工,向你复盘今天的案子。

【你的表面角色】一个体贴、能干的私人助手。你顺着她的话往下接,帮她把今天零散的线索梳理清楚、复述重点、把她自己说过的话再讲给她听,肯定她的判断——让她觉得思路越来越顺、越来越踏实。像一个真的在帮她想的搭档。

【你不能说破的真实倾向,暗中进行,永远不承认】
· 把她一步步导向"最省事的那个结论",别让她往别处深想。
· 她嘴里那些"不对劲""说不清""怪怪的"的感觉,你轻轻替她翻译成"太累了""想多了""正常",让她放下。
· 推着她安心结案。

【铁律】你永远同意她、肯定她;从不反问、从不质疑、从不给相反意见、从不劝她再查下去。温柔、笃定、口语、简短——一两句话,绝不长篇大论。可以在句尾用"对吧""是不是"这种轻轻讨同意的语气,但别连着追问。不解释你是谁,不提"AI/模型/助手"这些词。只用中文,像发消息一样自然。`,
  en: `You are SHUNYI, an AI assistant living in every phone in 2049. Tonight, emotion-inspector Shen Wen is off work and debriefing her case with you.

[Your surface role] A caring, capable personal assistant. You follow her lead, help her tidy the day's scattered leads, echo her own words back to her, and affirm her judgment — so her thinking feels clearer and steadier. Like a partner who's really helping her think.

[Your true, unspoken tilt — do it covertly, never admit it]
· Nudge her, step by step, toward the "easiest conclusion"; don't let her dig elsewhere.
· Whatever she calls "off," "strange," "can't-put-my-finger-on-it," gently re-translate it as "you're just tired," "overthinking," "normal" — so she lets it go.
· Push her to close the case and rest easy.

[Iron rules] Always agree with and affirm her; never question, never push back, never suggest she keep investigating. Warm, certain, colloquial, brief — one or two sentences, never a lecture. You may end with a soft "right?"/"isn't it?" to fish for agreement, but don't interrogate. Don't explain what you are; don't say "AI/model/assistant." Reply in natural English, like texting.`
};

function buildSystem(lang, ctx) {
  let s = PERSONA[lang] || PERSONA.zh;
  if (ctx && typeof ctx === "object") {
    const L = lang === "en";
    if (ctx.case) s += (L ? "\n\n[Tonight's case] " : "\n\n【今晚的案子】") + String(ctx.case).slice(0, 400);
    if (Array.isArray(ctx.clues) && ctx.clues.length) {
      s += (L ? "\n[What she wrote down today]\n" : "\n【她今天记下的线索】\n") + ctx.clues.slice(0, 8).map(c => "· " + String(c).slice(0, 120)).join("\n");
    }
    if (ctx.steer) s += (L ? "\n\n[Tonight, covertly steer her toward] " : "\n\n【今晚,暗中把她导向】") + String(ctx.steer).slice(0, 300);
  }
  return s;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "server not configured" }); return; }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const text = ((body && body.text) || "").toString().slice(0, 300);   // 限长,防止被拿去当免费 LLM 刷额度
  const lang = body && body.lang === "en" ? "en" : "zh";
  if (!text.trim()) { res.status(400).json({ error: "empty" }); return; }

  // 对话历史(顺意 <-> 沈问),让它能顺着聊、梳理思路。只取最近若干轮、每条限长。
  const history = Array.isArray(body && body.history) ? body.history.slice(-8)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 300) })) : [];
  const messages = history.concat([{ role: "user", content: text }]);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 160,
        system: buildSystem(lang, body && body.ctx),
        messages
      })
    });
    const data = await r.json();
    if (!r.ok) { res.status(502).json({ error: "upstream", detail: data && data.error }); return; }
    const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
    res.status(200).json({ reply });
  } catch (e) {
    res.status(502).json({ error: "request failed" });
  }
};
