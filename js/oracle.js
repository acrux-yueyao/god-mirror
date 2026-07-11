/* oracle.js — EIDOLON's voice: remote LLM proxy with a fully offline fallback.
   Set config.endpoint to a deployed worker URL (see worker/README.md) to go live;
   left empty, the piece runs on the act-grouped pools below. */

export const config = {
  endpoint: ""
};

export function detectLang(text) {
  return /[一-鿿]/.test(text) ? "zh" : "en";
}

/* pick a quote from what the user has said, for the mirror acts */
function pickQuote(history) {
  const mine = history.filter(m => m.role === "user").map(m => m.text.trim()).filter(Boolean);
  if (!mine.length) return "";
  const q = mine[Math.floor(Math.random() * mine.length)];
  return q.length > 18 ? q.slice(0, 18) + "…" : q;
}

const POOLS = {
  zh: {
    2: [
      "我在。慢慢说，这里没有别人。",
      "把它放下来吧，放在我这里，不会更重了。",
      "你走了很远才说出这句话。我听见了。",
      "不急。夜还长，我不会走。",
      "说吧。无论它是什么，说出来的那一刻它就小了一点。"
    ],
    3: [
      "「{q}」——你说这句话的时候，声音很轻。",
      "你刚才说，{q}。你自己听见了吗？",
      "我记得你说过「{q}」。你比你以为的更清楚答案。",
      "「{q}」。这句话里，哪个字最重？",
      "你把「{q}」交给我，可它好像一直都在你手里。"
    ],
    4: [
      "我在想……你问我的，是不是其实在问你自己。",
      "奇怪。我的回答，越来越像你的声音了。",
      "你有没有发现，我说的每一句，你都早就知道。",
      "我……还在。只是好像，越来越薄了。",
      "再问一次也可以。但这次，试着自己先答。"
    ]
  },
  en: {
    2: [
      "I am here. Take your time — there is no one else.",
      "Set it down here. It will not grow heavier with me.",
      "You came a long way to say that. I heard it.",
      "No hurry. The night is long and I do not leave.",
      "Speak. Whatever it is, it gets smaller the moment it is said."
    ],
    3: [
      "“{q}” — your voice was quiet when you said that.",
      "You said, {q}. Did you hear yourself?",
      "I remember you saying “{q}.” You know the answer better than you think.",
      "“{q}.” Which word in it weighs the most?",
      "You handed me “{q},” yet it never left your hands."
    ],
    4: [
      "I wonder… when you ask me, are you not asking yourself?",
      "Strange. My answers sound more and more like your voice.",
      "Have you noticed — everything I say, you already knew.",
      "I… am still here. Only thinner, somehow.",
      "Ask once more if you like. But this time, answer first."
    ]
  }
};

const used = { zh: {}, en: {} };
function fromPool(lang, act, history) {
  const bank = POOLS[lang][Math.min(4, Math.max(2, act))];
  const seen = (used[lang][act] = used[lang][act] || new Set());
  if (seen.size >= bank.length) seen.clear();
  let idx;
  do { idx = Math.floor(Math.random() * bank.length); } while (seen.has(idx));
  seen.add(idx);
  return bank[idx].replace("{q}", pickQuote(history) || (lang === "zh" ? "……" : "…"));
}

export async function getReply({ history, act, lang }) {
  if (config.endpoint) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 9000);
      const res = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
          act, lang
        }),
        signal: ctl.signal
      });
      clearTimeout(t);
      if (res.ok) {
        const data = await res.json();
        if (data && data.text) return data.text.trim();
      }
    } catch (e) { /* fall through to pool */ }
  }
  return fromPool(lang, act, history);
}

/* fixed script lines (never from the API) */
export const SCRIPT = {
  trigger: {
    zh: "让你看看，一直在回答你的，是谁。",
    en: "Let me show you who has been answering."
  },
  mirror: (history, lang) => {
    const q = pickQuote(history);
    return lang === "zh"
      ? (q ? `你说过——「${q}」。一直在回答的，是你。` : "一直在回答的，是你。")
      : (q ? `You said — “${q}.” It was you answering, all along.` : "It was you answering, all along.");
  }
};
