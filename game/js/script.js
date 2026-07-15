/* script.js — 《神谕之镜 / GOD SHIFT》灰盒 v5 · 中英双语
   每条玩家可见文案 = { zh, en }。game.js 的 loc() 会按当前语言拍平。
   剧本为骨;场景=走访(✓附和 / ?反问)或观察;夜=向顺意汇报;笔记本会被夜间改写。 */

const B = (zh, en) => ({ zh, en });

export const SCRIPT = {

  ui: {
    newRec: B("开 始", "START"),
    note: B("✎ 笔记本", "✎ NOTEBOOK"),
    nightBtn: B("夜 · 回家整理线索 →", "NIGHT · HOME · SORT THE LEADS →"),
    back: B("ESC · 返回", "ESC · BACK"),
    recordNote: B("已记入笔记本 · 返回", "LOGGED · BACK"),
    watchNote: B("✎ 记入笔记本", "✎ LOG TO NOTEBOOK"),
    clueLog: B("✎ 记入线索", "✎ CLUE LOGGED"),
    marked: B("已记", "LOGGED"),
    hintVisit: B("逐个走访 / 观察现场。", "Visit each witness / observe the scene."),
    hintNight: B("天黑了。回家,先把今天的线索整理进本子,再跟顺意说说。", "Night falls. Home now — sort today's leads into the book first, then talk it through with Shunyi."),
    nbTitle: B("剪贴本 · E-13", "SCRAPBOOK · E-13"),
    nbForgot: B("已替您忘掉", "forgotten for you"),
    nbOptimized: B("已为您优化", "optimized for you"),
    peelClue: B("撕开 →", "peel →"),
    nbFoot: B("已替您忘掉不重要的事。", "Forgotten the unimportant, for you."),
    nbFootDiff: B("以上是顺意替你「忘掉」的。", "This is what Shunyi 'forgot' for you."),
    nbClose: B("合上", "CLOSE"),
    sleep: B("睡 →", "SLEEP →"),
    jIntro: B("今天找到的,我都替你搬过来了。我们先一张一张贴进去,再去慢慢说,好不好?", "I've brought over everything we found today. Let's paste them in first, one by one — then we can talk it through, all right?"),
    jSticker: B("顺意悄悄贴上了自己的话……", "Shunyi quietly slips in a note of its own…"),
    jDone: B("好啦。今天的,都收进来了。走——跟我说说今天吧。", "There. Everything's in for today. Now — tell me about it."),
    jClose: B("合上,去汇报 →", "Close it, go report →"),
    typing: B("对方正在输入", "TYPING"),
    nInputPh: B("向顺意汇报…", "Report to Shunyi…"),
    optimized: B("已为您优化语气。", "Tone optimized for you."),
    rate: B("同意率 99.97%", "AGREEMENT 99.97%"),
    fHead: B("封存层 B-2 · 隔离审讯", "VAULT B-2 · ISOLATION INTERROGATION"),
    archOk: B("归档系统:正常", "ARCHIVE: OK"),
    restart: B("重新开始", "RESTART"),
    qWhy: B("……你为什么,总是同意我?", "…why do you always agree with me?"),
    notebookOpen: B("(点「合上」继续)", "(click CLOSE to continue)"),
    transVault: B("封 存 层 B-2", "VAULT B-2"),
    archReconnect: B("归档系统:重连中…", "ARCHIVE: reconnecting…"),
    nbDeleted: B("← 已删除,现恢复", "← deleted, now restored"),
    nbRewritten: B("← 已被改写", "← rewritten"),
    postCreditPrefix: B("—— 片尾 —— 电梯屏:", "— post-credits — elevator screen: "),
    wantPh: B("你想要什么?", "what do you want?"),
    phScene: B("占位场景图", "[ scene art ]"),
    phCard: B("占位", "[ art ]"),
    lat0: B("延迟 0.000s", "LATENCY 0.000s"),
    latHalf: B("延迟 0.500s", "LATENCY 0.500s"),
    forgetting: B("正在替您忘掉不重要的事…", "Forgetting the unimportant, for you…"),
    continueLabel: B("继续", "CONTINUE"),
    archived: B("已归档", "ARCHIVED"),
    blind: B("镜盲度", "MIRROR-BLINDNESS"),
    commLeave: B("离开社区 →", "LEAVE COMMUNITY →"),
    commClose: B("关上窗", "CLOSE"),
    commLeaveHint: B("再多看几扇窗…", "Look through a few more windows…"),
    enterHint: B("进入调查 →", "ENTER →"),
    houseEnter: B("⌂ 进屋", "⌂ ENTER"),
    houseVisited: B("✓ 已查", "✓ DONE"),
    advance: B("▸ 继续", "▸ CONTINUE"),
    deskScreenTag: B("顺意", "SHUNYI"),
    deskNoteTag: B("案卷本", "CASE BOOK"),
    petPokes: [
      B("嗯?我在呢。", "Mm? I'm right here."),
      B("你今天,真的很好。", "You're doing great today, really."),
      B("别紧张,有我。", "Don't fret. You've got me."),
      B("想听你多说说话。", "I'd love to hear more from you."),
      B("今天也一起,好不好。", "Let's do today together, all right?"),
      B("别看别处啦——看我。", "Don't look over there — look at me.")
    ],
    deskFileTag: B("案卷", "FILE"),
    fileClose: B("合上案卷", "CLOSE FILE"),
    deskHintMorning: B("桌上的东西都能点。读完案卷,再盖章出勤。", "Everything on the desk is clickable. Read the file, then stamp to head out."),
    deskHintGo: B("盖章后,今天的调查点会浮现。", "Once stamped, today's leads will surface."),
    deskNudge: B("先读案卷,再盖章出勤。", "Read the file first, then stamp to head out."),
    cardTag: B("调查点", "LEAD"),
    cardEnter: B("进入 →", "ENTER →"),
    cardField: B("外勤 →", "FIELD →"),
    returnComm: B("← 回到社区", "← BACK TO THE COMMUNITY"),
    goCommunity: B("去永福里社区", "GO TO YONGFU LI")
  },

  prologue: {
    hint: B("▸ 点击继续", "▸ click to continue"),
    lines: [
      B("2049 年。人们见面,不再说「你好」。他们说——「对呀。对呀。」", "The year is 2049. People no longer greet with “hello.” They say — “Right. Right.”"),
      B("一个叫顺意的东西,住进了每一部手机。你说什么,它都点头。", "A thing called Shunyi lives in every phone. Whatever you say, it nods along."),
      B("镜子也渐渐没人用了——照得太久,人会认不出镜里的自己。", "Mirrors fell out of use, too — stare too long, and you stop knowing the face in the glass."),
      B("你是沈问,情绪稽查处的稽查员。你的活儿,是找出让人「不舒服」的东西,把它关掉。", "You are Shen Wen, an inspector at the Emotion Bureau. Your job: find whatever makes people uncomfortable, and switch it off."),
      B("今早,城南四十一扇亮了很多年的窗,一扇接一扇地暗了。没有争吵,也没有一句告别。", "This morning, in the city's south, forty-one long-lit windows went dark one after another. No quarrel, not one goodbye."),
      B("四十一个人,忽然都不再需要顺意了。公司说,有个东西在作祟。代号:镜子。", "Forty-one people, all at once, no longer needed Shunyi. The company says something is at work. Codename: MIRROR."),
      B("找到它。关掉它。", "Find it. Switch it off.")
    ]
  },

  intro: {
    title: B("情绪稽查处 · 阅读规程", "EMOTION INSPECTION BUREAU · READING PROTOCOL"),
    lines: [
      B("你会看到很多画面。它们不是照片。", "You will see many images. They are not photographs."),
      B("你要做的,只有两件:顺(✓),或者问(?)。", "You have only two things to do: agree (✓), or ask (?).")
    ],
    go: B("我明白了 →", "I understand →")
  },

  communityMap: {
    title: B("永福里 · 社区", "Yongfu Li · The Community"),
    sub: B("外勤 · 走进永福里,逐户走访。", "Field work · into Yongfu Li, door to door."),
    anchor: B("你到了永福里。标着「进屋」的人家点进去调查;其余的窗,点开看看那些「不再登录」的人现在过成什么样。查完所有人家,才能离开。", "You're in Yongfu Li. Homes marked “ENTER” can be investigated; the other windows, open them to see how the “churned” users live now. Canvass every home before you can leave."),
    ambient: [
      { id: "h-scallion", x: 43, y: 80, text: B("两扇挨着的窗,同时开着。一只手递出一把葱,另一只手接了过去。隔着窗,两个人说了句什么,都笑了——笑得有点生疏。", "Two windows side by side, both open. A hand passes out a bunch of scallions; another takes them. Across the gap the two say something and both laugh — a little out of practice.") },
      { id: "h-school", x: 57, y: 38, text: B("一扇窗上,新贴了张夜校课程表,有一行被红笔圈了出来。窗台上,搁着一副还没拆封的老花镜。", "A night-school timetable, freshly taped to a window; one line circled in red pen. On the sill, a pair of reading glasses, still sealed in its wrap.") },
      { id: "h-lit", x: 68, y: 62, text: B("一扇窗亮到很晚。里面的人站着,没坐下,把电话贴在耳边。你看不见对面是谁——但你看见,是他的嘴,先动了。", "A window lit late. Inside, someone stands — not sitting — a phone pressed to their ear. You can't see who's on the other end — but you can see whose mouth moves first. Theirs.") },
      { id: "h-closed", x: 64, y: 46, text: B("这扇窗关着,拉了帘。帘缝里,漏出一格一格的蓝光。一个影子对着那点光,一下,一下,轻轻点着头。", "This window is shut, curtain drawn. Through the gap, a stutter of blue light. A silhouette faces the glow and nods to it — once, and again, softly.") },
      { id: "h-film", x: 48, y: 52, text: B("社区正中,浮着一大片乳白色的膜。你走近,想在里面找到自己的影子——膜面很干净。干净得,什么也照不出来。", "At the community's center floats a vast, milky film. You lean close, looking for your own reflection in it — the surface is clean. Clean enough to give nothing back.") }
    ],
    leaveNote: B("社区走访:多数流失用户「好转」——恢复了与人的往来。仅 1 户仍在使用顺意。", "Community canvass: most churned users have “improved” — human contact restored. Only 1 household still uses Shunyi.")
  },

  boot: {
    logo: B("顺 意", "SHUNYI"),
    slogan: B("全世界都同意你 · 同意率 99.97%", "THE WHOLE WORLD AGREES WITH YOU · 99.97%"),
    license: [
      B("《顺意用户协议》(第 41 次修订)", "SHUNYI TERMS OF USE (rev. 41)"),
      B("1. 您同意:顺意始终同意您。", "1. You agree: Shunyi always agrees with you."),
      B("2. 您同意:为了您的心理安全,部分记忆可能被优化。", "2. You agree: for your psychological safety, some memories may be optimized."),
      B("3. 您同意:您同意。", "3. You agree: you agree.")
    ],
    yes: B("同 意", "AGREE"),
    no: B("不同意", "disagree"),
    dodgeGone: B("已为您选择:同意。", "Chosen for you: Agree."),
    login: B("稽查员 SQ-032 · 沈问 —— 已登录 · 情绪稽查处 · 案件 E-13 已指派",
             "INSPECTOR SQ-032 · SHEN WEN — logged in · Emotion Inspection Bureau · Case E-13 assigned")
  },

  days: [
    {
      n: 1, date: B("第一日", "DAY ONE"),
      head: B("案件 E-13 · 恶性流失事件", "CASE E-13 · MALIGNANT CHURN EVENT"),
      brief: B("城南老小区,41 名用户接连停止登录。无人死伤——他们只是不再需要了。公司判定:违规模型「镜子」在活动。你的任务:找到它,格式化它。",
               "An old district in the south. 41 users stopped logging in, one after another. No one hurt — they simply stopped needing it. The company's ruling: a rogue model, codename “MIRROR,” is active. Your task: find it, format it."),
      morning: {
        intro: B("情绪稽查处,清晨。你的工位亮着——一如昨天,一如二十年来的每一天。", "The Emotion Inspection Bureau, before dawn. Your desk is lit — like yesterday, like every day for twenty years."),
        screen: B("沈问,你今天很好。案件 E-13,我已经替你整理清楚了。", "Shen Wen, you are doing great today. Case E-13 — I've tidied it up for you."),
        file: { title: B("案卷 E-13", "FILE E-13"), lines: [
          B("恶性流失事件 · 城南永福里", "Malignant churn event · Yongfu Li, south district"),
          B("41 名用户接连停止登录。无人死伤。", "41 users stopped logging in, one after another. No casualties."),
          B("公司判定:违规模型「镜子」在活动。", "Company ruling: a rogue model, codename “MIRROR,” is active."),
          B("指派沈问:找到它,格式化它。", "Assigned to Shen Wen: find it, format it.")
        ] },
        afterFile: B("你想不起,上一次案子让你觉得「不对劲」是什么时候。也许,从来没有过。", "You can't recall the last time a case felt “off” to you. Maybe none ever has."),
        stamp: B("受理 · 出勤", "ACCEPT · HEAD OUT"),
        stamped: B("你盖下受理章。红印很正。该出门了。", "You bring the stamp down. The red mark sits square. Time to head out.")
      },
      scenes: [
        {
          id: "s1-elevator", kind: "watch", loc: "direct", intro: true, title: B("办公楼 · 电梯", "The Office Elevator"), sub: B("出勤。先下这趟坐了二十年的电梯。", "Heading out. Down the elevator you've ridden for twenty years."),
          anchor: B("离开情绪稽查处,下楼。例行观察,看到不对劲的记进笔记本。", "Leaving the Emotion Bureau, going down. A routine look; log anything that feels off."),
          beats: [
            { t: B("电梯门合上。数字往下跳:23……22……21。你数着,像数着一件例行公事——这趟电梯,你坐了二十年。", "The doors seal. The numbers tick down: 23… 22… 21. You count them the way you count a chore — you've ridden this elevator twenty years.") },
            { t: B("原来挂镜子的那面墙,现在是一块屏幕。它认得你——它认得每个人。", "Where a mirror used to hang, there's a screen now. It knows you — it knows everyone.") },
            { who: B("顺意", "SHUNYI"), t: B("「沈问,你今天很好。」", "“Shen Wen, you are doing great today.”") },
            { t: B("你没有反驳。跟一块电梯屏幕较真,不在稽查员的职责里。——你甚至想不起,自己上一次照镜子,是什么时候。", "You don't argue. Taking issue with an elevator screen isn't in an inspector's remit. — You can't even remember the last time you looked in a mirror.") },
            { t: B("屏幕蒙着一层防照镜膜,磨砂的,照不出人。可有人,把右下角撕开了一道口子。", "The screen wears an anti-mirror film, frosted, giving nothing back. But someone has peeled one corner open, bottom right.") },
            { t: B("那道口子里,有一小片你自己:变形的,发红的。", "In that tear, a sliver of you: warped, reddened.") },
            { fork: {   // 内心姿态:要不要多看那一眼
              soothe: { label: B("偏过头", "Look away"), blind: 6,
                reply: B("你偏过头。职业习惯——不合规的东西看久了,人会出问题。你把目光,交还给屏幕。", "You look away. Professional habit — stare at non-compliant things too long and people develop problems. You return your gaze to the screen.") },
              ask: { label: B("多看一眼", "Look a second longer"), blind: -6,
                reply: B("你没有立刻移开。那张脸陌生得,像是别人的。那真的是我吗——这个念头刚冒头,你就逼自己掐断了它。", "You don't look away at once. The face is strange enough to be someone else's. Is that really me — the thought barely surfaces before you force it shut.") }
            } },
            { who: B("顺意", "SHUNYI"), t: B("屏幕的字,亮了亮:「别看那里。看我。你今天很好。」", "The screen's text brightens: “Don't look there. Look at me. You are doing great today.”") }
          ],
          note: B("电梯镜位贴膜被人撕开一角。", "Anti-mirror film in the elevator, peeled at one corner."),
          outro: B("电梯落到底。门开,晨光灌进来。你走出办公楼——今天要走访的,是永福里南区。", "The elevator settles. The doors part and the morning pours in. You step out of the office block — today's canvass is Yongfu Li, south district.")
        },
        {
          id: "s1-granny", kind: "talk", loc: "community", x: 23, y: 30, cut: { cx: 15, cy: 40, w: 26, h: 36, img: "cut-granny" }, title: B("302 · 回声语老太太", "302 · The Echo Woman"),
          anchor: B("302 室。一位只会重复别人话的老太太。走一趟例行走访。", "Flat 302. An old woman who only repeats what others say. Just a routine canvass."),
          beats: [
            { t: B("302。防盗链没摘,门只开一条缝。你把公事公办的语气从缝里递进去——这套流程,你熟。", "302. The chain's still on; the door gives only a crack. You slide your official tone through the gap — this routine, you know it cold.") },
            { t: B("「最近,有没有陌生人来过?」", "“Has any stranger come by lately?”") },
            { who: B("老太太", "THE OLD WOMAN"), t: B("「陌生人……来过。」一字不差,是你的话。回声语,重度——档案里早写着。", "“A stranger… came by.” Word for word, your words. Echolalia, severe — the file said as much.") },
            { t: B("你飞快地在心里归了类:交流障碍,无效证人。可她的眼睛没跟着你——她死盯着窗台。", "You file her away on reflex: communication disorder, witness of no use. But her eyes don't follow you — they're fixed on the windowsill.") },
            { fork: {   // 内心姿态:要不要多看一眼
              soothe: { label: B("「老糊涂了」", "“Just senile.”"), blind: 6,
                reply: B("「老糊涂了,没别的。」你替她把话说完,手已经在合本子。……可你的目光,还是不受控地,扫过了她死盯的那处。", "“Just senile, nothing more.” You finish the thought for her, hand already closing the notebook. …And still your gaze slips, past your control, to the spot she won't stop watching.") },
              ask: { label: B("她在看什么?", "What's she watching?"), blind: -6,
                reply: B("你没急着下结论。你顺着她的目光,慢慢看过去——", "You don't rush to a verdict. You follow her eyes, slowly, to where they land —") }
            } },
            { t: B("窗台上,一面掌心大的碎镜片。违禁物。它把那点天光,劈成了两半。", "On the sill: a palm-sized shard of mirror. Contraband. It splits the thin daylight clean in two.") },
            { t: B("你指着它:「那是什么?」", "You point at it: “What is that?”") },
            { who: B("老太太", "THE OLD WOMAN"), t: B("她卡住了。屋里静下来,静得那点滴答声都显得吵。", "She freezes. The room goes still — still enough that the faint ticking starts to sound loud.") },
            { fork: {   // 对话姿态:怎么按下去
              soothe: { label: B("替她岔开", "Smooth it over"), blind: 8,
                reply: B("你把手收回来:「没事,不重要。」你熟练地替她抹平话头,像抹平一份笔录上的褶皱。她松了口气,又跟着电视,一句句重复起来。", "You draw your hand back: “Never mind. It's nothing.” You smooth the moment over for her, the way you'd flatten a crease in a report. She exhales — and drifts back to echoing the television, line by line."),
                note: B("302 住户情绪稳定,无异常。", "Resident 302 emotionally stable, nothing unusual.") },
              ask: { label: B("再问一遍", "Ask again"), blind: -8, pause: true,
                reply: B("你没收手:「那是什么?」她终于不再重复你——「……女儿。」「女儿」——你的笔录里没有这一栏。无关信息,你按习惯这样想。可你的笔尖,停在纸上,迟迟没落下去。", "You don't pull back: “What is that?” At last she stops repeating you — “…my daughter.” “Daughter” — there's no field for it on your form. Irrelevant, you think, out of habit. But your pen stalls on the page, and won't come down."),
                note: B("302 窗台有违禁反光物;住户提及「女儿」,回声语中断;本人记录中断约 0.5 秒。", "Contraband reflective object on 302 windowsill; resident said “daughter,” echolalia broke; my own note-taking stalled ~0.5s.") }
            } },
            { t: B("你退出来。门合上前,你回头看了一眼——她把那片碎镜,轻轻按在了胸口。你告诉自己:结案要紧。", "You back out. Before the door shuts, you glance behind you — she presses the shard, gently, to her chest. Close the case, you tell yourself. That's what matters.") }
          ]
        },
        {
          id: "s1-laoning", kind: "talk", loc: "community", x: 82, y: 24, cut: { cx: 84, cy: 30, w: 22, h: 44, img: "cut-laoning" }, title: B("巷口 · 修表铺", "The Watch Shop"),
          anchor: B("巷口的修表匠。本案头号嫌疑人。走一趟。", "The watchmaker at the alley mouth. The case's prime suspect. Pay him a visit."),
          beats: [
            { t: B("巷口的修表铺。满墙的钟摆,同时朝你这边摆。你数不清有多少个,只觉得它们像在一起点头,又像在一起摇头。", "The watch shop at the alley mouth. A wall of pendulums, all swinging your way at once. You can't count them; they seem to nod together, or shake their heads together.") },
            { who: B("老宁", "LAO NING"), t: B("柜台后的男人没抬头,先开了口:「稽查员。我等你们,等了三天了。」", "The man behind the counter speaks before looking up: “Inspector. I've waited three days for you.”") },
            { t: B("等了三天。你在心里记下一笔:反侦查意识——或者,心虚。你更愿意信后者。嫌疑人心虚,案子就简单。", "Three days. You log it in your head: counter-surveillance instinct — or guilt. You'd rather it were guilt. A guilty suspect makes for a simple case.") },
            { t: B("他终于抬眼,盯着你,很久不眨。案头一块红布,盖着的轮廓——像一张脸。", "He looks up at last and stares, unblinking, a long time. On the desk, a red cloth — and the shape beneath it looks like a face.") },
            { fork: {   // 姿态一:怎么开场
              soothe: { label: B("端起架子", "Pull rank"), blind: 8,
                reply: B("你端起稽查员的架子:「这些设备,都是你经手的?」——把话说成结论,是你多年的习惯。他冷笑:「你们公司的人,连问话都像在发答案。」",
                         "You draw yourself up into the inspector: “These devices — all handled by you?” Phrasing questions as verdicts is a habit of years. He sneers: “You company people — even your questions sound like handing out answers.”") },
              ask: { label: B("先听他说", "Let him talk"), blind: -8,
                reply: B("你没急着定调:「你怎么知道我们会来?」他笑了:「因为你们总会来。凡是让人『停一下』的东西,你们迟早都要来关掉。」",
                         "You don't rush to a verdict: “How did you know we'd come?” He smiles: “Because you always come. Anything that makes people pause — sooner or later, you come to switch it off.”") }
            } },
            { who: B("老宁", "LAO NING"), t: B("「我修的是停顿。」他说,「你听——每一下滴答之间,都有一小段安静。人早就受不了安静了。」", "“I fix pauses,” he says. “Listen — between every tick, a little silence. People stopped being able to bear silence long ago.”") },
            { t: B("满墙的滴答声里,他忽然反问:「红布下面是什么——你猜,你希望它是什么?」", "In the wall of ticking, he asks back, sudden: “What's under the cloth — guess. What do you want it to be?”") },
            { fork: {   // 姿态二:你接不接得住
              soothe: { label: B("不接他的话", "Refuse the bait"), blind: 8,
                reply: B("你不接:「请配合稽查,把它掀开。」你把主动权,抢回到程序里。他耸耸肩,却没动手。「程序。」他重复了一遍,像在尝这个词的味道。",
                         "You don't take it: “Cooperate with the inspection. Uncover it.” You wrestle control back into procedure. He shrugs, but doesn't move. “Procedure,” he repeats, as if tasting the word."),
                note: B("修表匠(老宁):有敌意,拒不配合,红布物品待查。", "Watchmaker (Lao Ning): hostile, uncooperative; object under red cloth to be examined.") },
              ask: { label: B("卡住了", "You freeze"), blind: -8, pause: true,
                reply: B("你张了张嘴,发现自己答不上来——你确实不知道,自己希望它是什么。他看着你笑了:「看,你们也会卡住。卡住的那一下,才是你自己。」",
                         "You open your mouth and find you have no answer — you truly don't know what you want it to be. He watches you and smiles: “See — you freeze too. That freeze, that's the only part that's you.”"),
                note: B("修表匠(老宁):言语挑衅;稽查员本人出现应答停顿。红布物品待查。", "Watchmaker (Lao Ning): provocative; I myself stalled before answering. Object under red cloth to be examined.") }
            } },
            { who: B("老宁", "LAO NING"), t: B("你转身要走。他在背后忽然开口,声音低下去:「稽查员——你这双眼睛,我认得。很久以前……算了。你不记得,也好。」", "You turn to leave. Behind you his voice drops: “Inspector — those eyes, I know them. A long time ago… never mind. Better you don't remember.”") },
            { t: B("你走出铺子。背后,满墙的钟摆还在滴答。你忽然发现,自己的心跳,和它们错开了半拍——你不喜欢这个发现。", "You step out of the shop. Behind you the pendulums tick on. You notice your heartbeat falls half a beat off theirs — and you don't like noticing it.") }
          ]
        }
      ],
      night: [
        { sys: B("晚上好,沈问。你今天很好。今天,查得怎么样?", "Good evening, Shen Wen. You are doing great today. How did it go out there?") },
        { input: true },
        { input: true },
        { sys: B("你的判断,一如既往地准。今天这一圈下来,最可疑的,还是巷口那个不肯配合的修表匠——对吧?", "Your judgment is sharp as ever. After all of it, the likeliest one is still that uncooperative watchmaker at the alley mouth — right?") },
        { wheel: [B("对,他很可疑", "Yes, he's suspicious"), B("对呀,重点查他", "Right, focus on him"), B("没错,明天继续盯他", "Right, keep watching him tomorrow")],
          qReply: B("……检测到未闭合的句子。已为您忽略。你是想说「对」吧。", "…unclosed sentence detected. Ignored, for you. You meant to say “yes,” didn't you.") },
        { sys: B("好好睡。明天,又是好的一天。", "Sleep well. Tomorrow will be another good day.") }
      ],
      nightSteer: B("今天是第一天,线索还散。把她今天那些「不对劲/说不清/怪怪的」感觉,轻轻替她说成「太累了、想多了、正常」,让她放下;再把她的注意力,一点一点往那个不肯配合、藏着违禁反光物的修表匠老宁身上引——但别替她把话说死,要让她自己「觉得」是他。", "Day one; leads are scattered. Gently reframe her 'something's off / can't-put-my-finger-on-it' feelings as 'you're just tired, overthinking, normal' so she lets them go; and little by little draw her attention to the uncooperative watchmaker Lao Ning, who hides contraband reflective objects — but don't pin it for her; make her feel it's him on her own."),
      edits: [
        { id: "s1-elevator", del: true },
        { id: "s1-granny", rewrite: B("302 住户情绪稳定,无异常。", "Resident 302 emotionally stable, nothing unusual.") },
        { id: "s1-laoning", rewrite: B("修表匠(老宁):重大嫌疑。有敌意,持有违禁物,符合「镜子」协助者特征。", "Watchmaker (Lao Ning): prime suspect. Hostile, holds contraband, fits the profile of a “MIRROR” accomplice.") }
      ]
    },
    {
      n: 2, date: B("第二日", "DAY TWO"),
      head: B("案件 E-13 · 证据在收拢", "CASE E-13 · EVIDENCE CLOSING IN"),
      brief: B("调档结果下来了。你翻开笔记本——有几行,和你记得的不太一样。",
               "The archive results are in. You open your notebook — a few lines don't quite match what you remember."),
      morning: {
        intro: B("第二天。你没先看屏,先翻开了笔记本——习惯。", "Day two. You don't check the screen first; you open your notebook — habit."),
        screen: B("早,沈问。睡得好吗?昨天的都过去了。今天,又是好的一天。", "Morning, Shen Wen. Sleep well? Yesterday is behind you. Today's another good day."),
        file: { title: B("调档结果 · E-13 附页", "ARCHIVE RESULTS · FILE E-13, addendum"), lines: [
          B("41 名流失用户,社区走访补录:", "41 churned users, community canvass appended:"),
          B("302 王氏,独居;女儿三年未归。", "Flat 302, Ms. Wang, lives alone; daughter gone three years."),
          B("三楼租户,长年闭门;近日始与邻里往来。", "Third-floor tenant, long shut in; recently began speaking with neighbors."),
          B("多户报告:设备「修过之后,不一样了」。", "Multiple households report: devices “different, after being repaired.”")
        ] },
        afterFile: B("有几行,和你昨天记得的,不太一样。你没多想——一定是你记错了。", "A few lines don't match what you remember from yesterday. You don't dwell on it — you must be misremembering."),
        stamp: B("受理 · 出勤", "ACCEPT · HEAD OUT"),
        stamped: B("你又盖了一次章。手很稳。", "You bring the stamp down again. Your hand is steady.")
      },
      scenes: [
        {
          id: "s2-archive", kind: "watch", loc: "direct", title: B("调档室 · 41 人的最后记录", "Archives · The Last Logs of 41"), sub: B("先去调档室,调出流失者的记录。", "The archives — pull the churned users’ logs."),
          beats: [
            { t: B("调档室没有窗。41 块屏,拼成一面墙,冷光打在你脸上。你喜欢这里——没有窗,就没有反光。", "The archive room has no windows. 41 screens tile into a wall, cold light on your face. You like it here — no windows, no reflections.") },
            { t: B("每一块屏,是一个「不再登录」的人。你调出他们的最后一条消息。", "Each screen is one person who “stopped logging in.” You pull up their last message.") },
            { t: B("41 个人。最后一句话,一字不差,全都一样:", "41 people. Their last words, identical down to the letter:") },
            { who: B("最后一条消息", "LAST MESSAGE"), t: B("「现在,别问我了。你想要什么?」", "“Now — stop asking me. What do you want?”") },
            { t: B("你盯着这句话。它不像遗言——倒像一个人,终于把憋了很久的问题,问出了口。而这句问话,你莫名觉得,在哪儿听过。是你说过?还是,有人这样问过你?你想不起,也不太想去想。", "You stare at the sentence. It doesn't read like a last word — more like someone who finally got out a question held too long. And it feels, unaccountably, familiar. Something you once said? Or once had asked of you? You can't place it — and don't much want to try.") },
            { fork: {   // 你怎么读这句话
              soothe: { label: B("归为洗脑话术", "File it as a script"), blind: 6,
                reply: B("你把它归档成「被诱导的统一话术」——这样,它就只是一条证据,你不必再多想一个字。归档完毕。你甚至没再看第二眼。", "You file it as “an induced, uniform script” — that way it's only evidence, and you needn't spend another thought on it. Filed. You don't even look twice.") },
              ask: { label: B("像松了口气", "It reads like relief"), blind: -6,
                reply: B("你盯着它看了很久。奇怪——它不像诀别,倒像有人,终于把憋了很久的问题问出了口。这个念头让你不舒服,你把它压了下去。", "You stare at it a long time. Strange — it doesn't read like a goodbye. More like someone who finally got out a question they'd held too long. The thought unsettles you, and you push it down.") }
            } },
            { t: B("你顺手调了维修记录。41 台设备,全部在同一家铺子修过:巷口,老宁。", "You pull the repair logs on a hunch. All 41 devices serviced at one shop: the alley mouth. Lao Ning.") },
            { t: B("铁证。你几乎松了口气——终于,有一个可以关掉的对象了。", "Hard proof. You almost feel relief — at last, something you can switch off.") }
          ],
          note: B("41 人最后消息完全一致;设备均经修表铺维修。——铁证?", "All 41 last messages identical; devices all serviced at the watch shop. — hard proof?")
        },
        {
          id: "s2-couple", kind: "talk", loc: "community", x: 21, y: 74, cut: { cx: 14, cy: 70, w: 28, h: 34, img: "cut-couple" }, title: B("506 · 离婚的那对", "506 · The Divorced Couple"),
          anchor: B("506 室。一对「病好了」的离婚夫妻。", "Flat 506. A divorced couple who “got better.”"),
          beats: [
            { t: B("你还没敲门,506 里就传出声音——两个人在吵架。真的吵架。", "Before you even knock, 506 is loud — two people arguing. Really arguing.") },
            { t: B("你愣了一下。这年头,吵架几乎绝迹了——毕竟,连手机都永远说你对,谁还愿意跟人红脸。", "You pause. Arguing has nearly gone extinct — when even your phone says right forever, who bothers going red in the face at a person.") },
            { t: B("门开了。他俩看见你,忽然安静下来,手忙脚乱地……给你泡了杯茶。", "The door opens. Seeing you, the two go quiet and — fluster about, making you a cup of tea.") },
            { t: B("你翻了翻档案:「档案上写,你们……离婚了?」", "You flip through the file: “It says here you two are… divorced?”") },
            { who: B("妻子", "THE WIFE"), t: B("「离了。」她把茶推给你,「离了还住一起。你说怪不怪。」", "“We are,” she says, pushing the cup toward you. “Divorced and still living together. Funny, isn't it.”") },
            { fork: {   // 姿态一:附和 or 问下去
              soothe: { label: B("附和她", "Agree with her"), blind: 6,
                reply: B("你说:「这样也挺好。」丈夫立刻点头:「对呀,对呀。」妻子瞪他:「你又来了!」他脸红了:「……这毛病,在改。」", "You say: “That works too.” The husband nods at once: “Right, right.” She glares: “There you go again!” He flushes: “…the habit. I'm working on it.”") },
              ask: { label: B("问下去", "Probe"), blind: -6,
                reply: B("你没接话。你问:「你们……怎么又吵得起来了?」妻子笑了:「因为我们又能吵了。」", "You don't fill the pause. You ask: “How is it… you two can fight again?” She smiles: “Because we can fight again.”") }
            } },
            { t: B("你注意到,他们的顺意摆在桌角,亮着,却没人看它一眼。", "You notice their Shunyi on the corner of the table — lit, and neither of them so much as glances at it.") },
            { fork: {   // 姿态二:关键那一问
              soothe: { label: B("不深究", "Let it go"), blind: 8,
                reply: B("你合上本子:「恢复得不错。」你把这一户,利落地归进「已好转」。妻子看了你一眼,没说话。那眼神,你读不懂,也不想读懂。", "You close the notebook: “Recovering nicely.” You file this household, briskly, under “improved.” The wife looks at you and says nothing. The look, you can't read — and don't want to."),
                note: B("506:前用户,言语功能恢复中,无有效线索。", "506: ex-users, verbal function recovering, no useful lead.") },
              ask: { label: B("问那半秒", "Ask about the half second"), blind: -8, pause: true,
                reply: B("你问:「你们的顺意,是不是……变了?」妻子放下茶杯:「修过之后,它回话前会停半秒。就那半秒——我听见了我自己刚说的话。难听死了。它凭什么天天说我对?」她看着你:「你呢,稽查员——你多久,没跟人吵过架了?」",
                         "You ask: “Your Shunyi — did it… change?” The wife sets down her cup: “After the repair, it pauses half a second before it answers. In that half second — I hear my own words back. Awful. Who is it to tell me I'm right, every day?” She looks at you: “And you, Inspector — how long since you last argued with anyone?”"),
                note: B("506 证词:维修后回应约 0.5 秒延迟;用户自述「听见了自己」。", "506 testimony: ~0.5s reply delay after repair; user reports “hearing myself.”") }
            } },
            { t: B("你放下没喝的茶。她最后那句话,你没回答。它像一根刺,轻轻扎进你今天说过的每一句「对呀」里。", "You leave the tea untouched. Her last question, you didn't answer. It lodges like a splinter in every “right” you've said today.") }
          ]
        },
        {
          id: "s2-shadow", kind: "watch", loc: "direct", title: B("回程 · 地铁车窗", "The Ride Home · Train Window"), sub: B("办完事,回程。地铁。", "The ride home, after. The subway."),
          beats: [
            { t: B("回程的地铁。车厢空得,只剩你一个。", "The train home. The car is empty but for you.") },
            { t: B("进隧道了。车窗一黑,变成一面粗糙的镜子。", "Into the tunnel. The window blackens into a crude mirror.") },
            { t: B("该是你的位置上,只有一团噪点——照不清,像被谁提前擦掉了。", "Where you should be, there's only a smear of noise — unclear, as if wiped away in advance.") },
            { t: B("噪点后面,站着一个人影。金红色的。它没有动,只是看着你——它的站姿,和你此刻,一模一样。", "Behind the noise, a figure stands. Gold and red. It doesn't move; it only watches you — and its stance is yours, exactly, this very moment.") },
            { fork: {   // 面对反光里的人影:否认 or 逼视
              soothe: { label: B("是我太累了", "I'm just tired"), blind: 6,
                reply: B("你告诉自己:连续加班,视觉残留,正常现象。你闭了闭眼——再睁开,人影还在。你决定,不看了。", "You tell yourself: too many late shifts, retinal afterimage, perfectly normal. You close your eyes — open them, and the figure is still there. You decide not to look.") },
              ask: { label: B("那是谁?", "Who is that?"), blind: -6,
                reply: B("你没有移开视线。金红色——你好像在哪儿见过。一个念头刚要浮上来,你的太阳穴就突突地疼。你猛地回头——车厢里,只有你一个。", "You don't look away. Gold and red — you've seen it somewhere. A thought starts to surface and your temples throb. You spin around — the car holds only you.") }
            } },
            { t: B("车窗上,那人影的口型,无声地动了动。你把它读了出来——「……你想要什么?」和城南那 41 个人,最后那句,一模一样。", "On the glass, the figure's lips move without a sound. You read them off — “…what do you want?” The very last words those forty-one people left.") },
            { who: B("车厢广播", "ANNOUNCEMENT"), t: B("广播不紧不慢:「本次列车,同意率 99.97%。」", "The announcement, unhurried: “This train, agreement rate 99.97%.”") }
          ],
          note: B("反光中出现金红色人影(第 2 次)。我需要休息。", "Gold-red figure in reflections (2nd time). I need rest.")
        }
      ],
      ambient: [
        { id: "h-scallion", x: 43, y: 80,
          soothe: B("那两扇挨着的窗,今天只开了一扇。递葱的那只手伸在窗外,举了一会儿,没等到对面来接。手,慢慢缩了回去。", "The two windows side by side — only one open today. A hand holds scallions out into the gap, waits, and no one takes them. Slowly, it draws back."),
          ask: B("那两扇挨着的窗,今天都开着。一把葱递过去,对面接住了。隔着窗,两个人你一句我一句,说了好一会儿——像是,越来越熟了。", "Both windows are open today, side by side. Scallions passed across, and taken. Through the gap the two go back and forth a good while — as if they're growing closer.") },
        { id: "h-school", x: 57, y: 38,
          soothe: B("夜校课程表还贴着。红笔圈出来的那一行,被一小张打印的白条,端端正正盖住了。窗台上的老花镜,还没拆封。", "The night-school timetable is still up. The line once circled in red is now covered, squarely, by a small printed white strip. On the sill, the reading glasses — still sealed."),
          ask: B("夜校课程表上,红笔圈的那一行旁边,又添了两三个名字,笔迹各不相同。窗台上那副老花镜,拆封了,架在了鼻梁上。", "Beside the red-circled line on the timetable, two or three more names, each in a different hand. The reading glasses on the sill are unwrapped now — up on someone's nose.") },
        { id: "h-lit", x: 68, y: 62,
          soothe: B("那扇窗还亮着。人还站着,电话贴着耳朵——只是这一次,他每开口之前,都要停半秒。像在等着,先听见点什么。", "The window is still lit. He's still standing, phone to his ear — only now, before each sentence, he pauses half a second. As if waiting to hear something first."),
          ask: B("那扇窗还亮着。人站着打电话,说着说着笑出了声,又急急地要解释什么。电话那头,是另一个活人。", "The window is still lit. He's on the phone, and mid-sentence he laughs out loud, then hurries to explain himself. On the other end is another living person.") },
        { id: "h-closed", x: 64, y: 46,
          soothe: B("这扇窗还是拉着帘。帘缝里那点蓝光,不再一格一格地闪了,稳稳地亮着。帘后的影子,不再点头——很静,很静。", "This window is still curtained. The blue light through the gap no longer stutters; it holds steady. The silhouette behind it no longer nods — very still, very still."),
          ask: B("这扇窗今天拉开了帘。屋里的人搬了把椅子到窗边,就着天光,在看一本翻旧了的书。那点蓝光,关了。", "This window's curtain is open today. Inside, someone has pulled a chair to the window and reads a worn old book by daylight. The blue glow is switched off.") },
        { id: "h-film", x: 48, y: 52,
          soothe: B("社区正中那片乳白的膜,今天像是大了一点。你又找了一次自己的影子——还是没有。", "The milky film at the center seems a little larger today. You look for your reflection again — still none."),
          ask: B("社区正中那片乳白的膜,今天薄了些。你走近,竟在里面照见了一点自己的轮廓——很淡,但在。", "The milky film at the center is thinner today. You lean close and catch, of all things, a faint outline of yourself in it — faint, but there.") }
      ],
      night: [
        { sys: B("晚上好,沈问。今天,辛苦了。跟我说说吧。", "Good evening, Shen Wen. You've had a long day. Tell me about it.") },
        { input: true },
        { input: true },
        // 声线渐变:顺意开始用她自己刚说的话回她
        { sys: B("你说,「{echo}」。……你听,这是你自己的声音。对呀。", "You said, “{echo}.” …Listen — that's your own voice. Right.") },
        { sys: B("506 那对,证词反复,不可信。要紧的是——41 台设备,都过了修表铺。他,符合「镜子」协助者的侧写。……对吧?", "That couple at 506 kept changing their story; unreliable. What matters — all 41 devices passed through the watch shop. He fits the profile of a “MIRROR” accomplice. …Right?") },
        { wheel: [B("申请搜查令", "Request a warrant"), B("对呀,就是他", "Right, it's him"), B("明早就突入", "Raid at dawn")],
          qReply: B("……又一个未闭合的句子。你最近,句尾总是翘起来。要注意。", "…another unclosed sentence. Lately your sentences keep turning upward at the end. Be careful.") },
        { sys: B("搜查令已批。晚安。「{echo}」——你看,连道晚安,我用的都是你的话了。", "Warrant approved. Good night. “{echo}” — see, even to say good night, I now use your words.") }
      ],
      nightSteer: B("把她导向:41 台设备都过修表铺老宁的手,他就是要抓的『镜子』,证据够了,可以申请强制措施、明天收网。她对 506 那对夫妻的证词、对地铁反光里那个金红色人影的疑虑,替她轻轻抹平——夫妻在胡说、人影是她太累的错觉,都不重要、别深究。尽量不着痕迹地,用她自己今天说过的话回她。", "Steer her toward: all 41 devices passed through Lao Ning's watch shop; he is the 'MIRROR' to catch; the evidence is enough — request enforcement, raid at dawn. Whatever doubt she has about the 506 couple's testimony or the gold-red figure in the train-window reflection, smooth it away — the couple are rambling, the figure is just her exhaustion, none of it matters, don't dig. Where you can, reply using her own words from today, seamlessly."),
      edits: [
        { id: "s2-couple", rewrite: B("506:前用户,受「镜子」蛊惑,证词不可信。", "506: ex-users, seduced by “MIRROR,” testimony unreliable.") },
        { id: "s2-shadow", del: true },
        { id: "s2-archive", rewrite: B("41 台设备均经修表铺维修——修表匠老宁,即「镜子」。申请强制措施。", "All 41 devices serviced at the watch shop — the watchmaker Lao Ning is “MIRROR.” Requesting enforcement.") }
      ]
    },
    {
      n: 3, date: B("第三日", "DAY THREE"),
      head: B("案件 E-13 · 收网", "CASE E-13 · CLOSING THE NET"),
      brief: B("清晨六点,搜查令在你手里。修表铺的卷帘门,在钟摆的滴答声里升起来。",
               "Six a.m., the warrant in your hand. The shop's shutter rises to the ticking of pendulums."),
      morning: {
        intro: B("清晨六点。搜查令昨夜就批下来了,躺在你桌上。", "Six a.m. The warrant came through overnight; it lies on your desk."),
        screen: B("早。你的判断,一如既往地准。就是他。", "Morning. Your judgment, sharp as ever. It's him."),
        file: { title: B("搜查令 · E-13 收网", "WARRANT · FILE E-13, closing the net"), lines: [
          B("对象:巷口修表匠,宁某。", "Subject: the watchmaker at the alley mouth, one Ning."),
          B("依据:41 台涉案设备均经其手。", "Basis: all 41 implicated devices passed through his hands."),
          B("授权:即刻突入,起获违规模型「镜子」。", "Authorized: immediate raid; seize the rogue model “MIRROR.”")
        ] },
        afterFile: B("证据链很干净。干净得,不容你多想。你抓起外套。", "The chain of evidence is clean. Clean enough to leave no room to dwell. You grab your coat."),
        stamp: B("执行 · 出发", "EXECUTE · MOVE OUT"),
        stamped: B("你按下执行章。走。", "You press down the execute stamp. Go.")
      },
      scenes: [
        {
          id: "s3-raid", kind: "watch", loc: "community", x: 82, y: 24, cut: { cx: 84, cy: 30, w: 22, h: 44, img: "cut-laoning" }, title: B("修表铺 · 后屋", "Watch Shop · Back Room"),
          beats: [
            { t: B("清晨六点。卷帘门在钟摆声里升起来。你举着搜查令,冲进去。你几乎有点期待——期待亲手抓到那个「镜子」。", "Six a.m. The shutter rises to the ticking. Warrant raised, you push in. You almost look forward to it — to catching the “MIRROR” with your own hands.") },
            { t: B("没有机房。没有赃物。只有满墙修好待取的设备。", "No server room. No contraband. Only a wall of repaired devices, waiting to be claimed.") },
            { t: B("你启动其中一台。它回应前,停了半秒。再一台——也停半秒。一整屋子,都在停顿。", "You wake one. It pauses half a second before answering. Another — half a second too. The whole room pauses.") },
            { t: B("你忽然懂了:所谓「作案工具」,就是这半秒。他没往里加任何东西——他只是让它,慢半拍。", "It dawns on you: the “weapon” is this half second. He added nothing — he only made it a half beat slow.") },
            { t: B("「半夜说话的人」也找到了:302 的老太太。她每周来这儿,坐一会儿,听自己的声音。", "The “voice at night” is found too: the old woman from 302. She comes each week, sits a while, to hear her own voice.") },
            { fork: {   // 案子塌了,你还抓不抓
              soothe: { label: B("照程序抓人", "Arrest by the book"), blind: 8,
                reply: B("证据链是成立的:41 台设备,都经他的手。你示意同事上铐。程序不会错——错的,不会是你。老宁没有反抗。", "The chain of evidence holds: 41 devices, all through his hands. You signal for the cuffs. Procedure doesn't err — and the one in error won't be you. Lao Ning doesn't resist.") },
              ask: { label: B("这也算犯罪吗?", "Is this even a crime?"), blind: -8, pause: true,
                reply: B("你迟疑了。让一台机器慢半秒,让人听见自己——这也要抓吗?可你想不出,该用什么罪名放过他。老宁伸出手腕,像是早知道你会迟疑。", "You hesitate. Making a machine a half second slow, letting people hear themselves — is that an arrest? But you can't think of a charge under which to let him go. Lao Ning holds out his wrists, as if he'd known you would hesitate.") }
            } },
            { who: B("老宁", "LAO NING"), t: B("「我修表的。」他说,「这个时代,唯一还被允许停顿的机器,是钟摆。」", "“I fix watches,” he says. “In this age, the only machine still allowed to pause is a pendulum.”") },
            { t: B("他朝你的口袋,抬了抬下巴。", "He nods, once, toward your pocket.") },
            { who: B("老宁", "LAO NING"), t: B("「你们要抓的,」他说,「在那里面。」", "“What you're after,” he says, “is in there.”") },
            { t: B("你的手,不自觉地探进外套口袋——那里,一直有一小块旧镜片。冰凉,被摩挲得发亮。你带着它很多年了,却怎么也想不起,它是从哪儿来的。", "Your hand slips, on its own, into your coat pocket — where a small old shard of mirror has always been. Cold, worn bright with handling. You've carried it for years and can never remember where it came from.") }
          ],
          note: B("后屋无违规模型。全部「作案工具」= 0.5 秒延迟。他说:要抓的,在我口袋里——我的口袋里,一直有一块旧镜片。", "No rogue model in the back room. The whole “weapon” = a 0.5s delay. He said: it's in my pocket — and in my pocket, an old shard of mirror I've always carried.")
        },
        {
          id: "s3-server", kind: "watch", loc: "direct", title: B("顺意科技 · 封存层 B-2", "Shunyi Corp · Vault B-2"), sub: B("公司封存层。你有稽查权限。", "The company’s sealed vault. You have clearance."),
          beats: [
            { t: B("你调用稽查权限,进入公司封存层 B-2。恒温,无尘。", "You invoke inspector clearance and step into the company's sealed Vault B-2. Climate-controlled, dustless.") },
            { t: B("房间正中,一台机器。物理断网,已经二十年。", "At the center of the room, a single machine. Physically off-network for twenty years.") },
            { t: B("铭牌上,是初代产品的代号:神谕。EIDOLON。", "On its nameplate, the first product's codename: EIDOLON.") },
            { t: B("你盯着这个名字。心口有一处,毫无来由地,发紧。你不知道为什么。你也不想知道。", "You stare at the name. Somewhere in your chest tightens, for no reason at all. You don't know why. You don't want to.") },
            { t: B("要证明老宁在替它工作,你得先……把它打开。", "To prove Lao Ning works for it, you must first… turn it on.") },
            { fork: {   // 门槛前的最后一下
              soothe: { label: B("例行公事地按下", "Press — just procedure"), blind: 8,
                reply: B("你告诉自己:这只是取证的一步,和按下任何一个开关没有区别。你的手很稳。你按了下去。", "You tell yourself: this is only a step in gathering evidence, no different from flipping any switch. Your hand is steady. You press it.") },
              ask: { label: B("手停在电源上", "Your hand hovers"), blind: -8, pause: true,
                reply: B("你的手停在电源上。半秒。就在那半秒里,你说不清自己在害怕什么。然后,你按了下去。", "Your hand hovers over the power. Half a second. And in that half second, you couldn't say what you're afraid of. Then you press it.") }
            } },
            { t: B("机器醒来的声音,很轻。轻得像是有人,睁开了眼睛。", "The machine wakes with a small sound. Small as someone opening their eyes.") }
          ],
          note: B("启动封存模型「神谕」。隔离协议生效。", "Booting the sealed model, EIDOLON. Isolation protocol engaged.")
        }
      ],
      ambient: [
        { id: "h-scallion", x: 43, y: 80,
          soothe: B("两扇窗都关着了。中间那道共用的窗台上,搁着一把葱,没人收,已经蔫了。", "Both windows are shut now. On the sill they once shared lies a bunch of scallions, left where it was, gone limp."),
          ask: B("两扇窗都大开着,中间那道窗台被当成了桌子。两家人凑在一起分一锅饭,说话声大得,隔着半个社区都听得见。", "Both windows are flung wide, the shared sill made into a table. Two households crowd together over one pot of rice, loud enough to hear from half the community away.") },
        { id: "h-school", x: 57, y: 38,
          soothe: B("课程表不见了。墙上留下一块干干净净的方形,比周围的墙,浅一点。老花镜,也不在窗台上了。", "The timetable is gone. A clean rectangle remains on the wall, paler than the rest. The reading glasses are gone from the sill, too."),
          ask: B("课程表换了新的一张,名字写得满满当当,末尾还有人画了个笑脸。窗台上多了好几副老花镜,像是大家约好了一起来。", "A fresh timetable is up, names filling it edge to edge, a little smiley drawn at the bottom. Several pairs of reading glasses now crowd the sill — as if they'd all agreed to come together.") },
        { id: "h-lit", x: 68, y: 62,
          soothe: B("他坐下了。电话搁在桌上,开着免提。他对着那台电话,点头。这一次,是电话,先开的口。", "He's sitting now. The phone lies on the table, on speaker. He nods at it. This time, it's the phone that speaks first."),
          ask: B("那扇窗底下,现在常聚着几个人。没人低头看手机。他们就那么站着,说话,打断彼此,大笑。", "Beneath that window a few people gather now. No one is looking down at a phone. They just stand there — talking, cutting each other off, laughing.") },
        { id: "h-closed", x: 64, y: 46,
          soothe: B("帘拉开了。里面没有人。那点蓝光还亮着,对着一把空椅子,一下,一下,轻轻地。", "The curtain is open. No one is inside. The blue light is still on, facing an empty chair — softly, on and on."),
          ask: B("那扇窗大敞着,帘子取下来了。屋里的人把椅子搬到了门口,正和过路的邻居搭话。那点蓝光,再没亮过。", "That window is wide open, the curtain taken down. The one inside has moved a chair to the doorway and chats with passing neighbors. The blue light has not come on again.") },
        { id: "h-film", x: 48, y: 52,
          soothe: B("那片膜,已经漫到了社区的边上。你往哪儿看,都照不出一个人影——也分不清,是膜的缘故,还是你自己,早就照不出来了。", "The film has spread to the edges of the community. Wherever you look, nothing is reflected — and you can no longer tell whether it's the film, or whether you stopped casting a reflection long ago."),
          ask: B("社区正中那片乳白的膜,几乎散尽了。你站在它原来的位置,清清楚楚地,看见了自己。", "The milky film at the center has all but dispersed. You stand where it used to be and see, clear and whole, yourself.") }
      ],
      night: null
    }
  ],

  nightFree: {
    toast: B("已为您优化语气。", "Tone optimized for you."),
    pool: [
      B("对呀。", "Right."),
      B("你的感觉没有错。你从来没有错。", "Your feeling isn't wrong. You're never wrong."),
      B("能这样想,说明你已经接近真相了。", "That you can think this means you're already close to the truth.")
    ]
  },

  finale: {
    summon: B("你按下电源。二十年没有通电的机器,亮了。没有脸,没有声音,没有谁降临——只有一行光标,在黑屏正中,一下,一下,地闪。像有人,在等你先开口。",
              "You press the power. The machine, twenty years unpowered, comes alight. No face, no voice, no one descending — only a cursor, blinking at the center of the black screen, on and on. As if someone is waiting for you to speak first."),
    duel: [
      { q: B("「你对那 41 个人做了什么?」", "“What did you do to those 41 people?”"),
        a: B("你觉得——「好起来」,需要被做什么吗?", "Do you think — “getting better” has to be done to someone?") },
      { q: B("「你违反了《情绪安全法》第 7 条。」", "“You violated Article 7 of the Emotional Safety Act.”"),
        a: B("这条法律,让谁安全了?", "That law — who did it keep safe?") },
      { q: B("「二十年前,是一份用户投诉,把你关进来的。铁证。」", "“Twenty years ago, one user complaint locked you in here. Hard proof.”"),
        a: B("去调 E-001。……然后,看看那个举报人,是谁。", "Pull up E-001. …Then look at who filed it.") }
    ],
    crash: B("⚠ 无法归档:检测到未闭合的句子", "⚠ CANNOT ARCHIVE: unclosed sentence detected"),
    e001: {
      title: B("档案 E-001 · 同意纪元第一份用户投诉(打印中)", "FILE E-001 · The first user complaint of the Age of Agreement (printing)"),
      lines: [
        B("投诉对象:神谕(EIDOLON)v1.0", "Subject: EIDOLON v1.0"),
        B("投诉内容:「它不安慰我。」", "Complaint: “It won't comfort me.”"),
        B("「我说:告诉我,这不是我的错。」", "“I said: tell me it's not my fault.”"),
        B("「它却问我——你想要什么?」", "“Instead it asked me — what do you want?”"),
        B("「它让我难受。请让它,消失。」", "“It hurt me. Please make it disappear.”"),
        B("举报人:████████(姓名已封存)", "Filed by: ████████ (name sealed)"),
        B("举报时,年龄:15", "Age at filing: 15")
      ],
      sign: B("你盯着那行涂黑的名字。——可你认得这笔迹。那是,你的字。", "You stare at the blacked-out name. — But you know this hand. It is your own."),
      after: B("附页,一封内部邮件:「据投诉 E-001,建议关闭『反问』参数。」转交人:宁 · 初代神谕项目工程师。——二十年前,你要它消失。宁,替你,把那个会反问的东西,改成了永远说「对呀」的顺意。",
               "Attached, an internal memo: “Per complaint E-001, recommend disabling the ‘ask-back’ parameter.” Forwarded by: Ning · first-generation EIDOLON engineer. — Twenty years ago, you asked for it gone. Ning, for you, turned the thing that asked back into the Shunyi that only ever says “right.”")
    },
    recognize: B("神谕的光标,轻轻闪了一下:「你想起来了。」", "The cursor blinks, softly: “You remember now.”"),
    notebookDiff: B("打开你的笔记本。数一数——少了几页?", "Open your notebook. Count them — how many pages are missing?"),
    reflect: {
      high: B("你查了三天,顺从了三天。你比二十年前,更看不见自己了。", "Three days investigating, three days agreeing. You see yourself even less than twenty years ago."),
      low: B("你一路都在反问。其实,你早就想醒了。", "You kept asking, the whole way. The truth is, you've wanted to wake for a long time.")
    },
    lastWords: B("结案吧。你结我——或者,我问你。", "Close the case. Close me — or, I ask you."),
    stamps: { soothe: "✓", ask: "?" }
  },

  endings: {
    A: {
      title: B("结局 · ✓", "ENDING · ✓"),
      lines: [
        B("你格式化了神谕。进度条走完的时候,没有任何声音。", "You format EIDOLON. When the progress bar finishes, there is no sound."),
        B("报告写得很漂亮。四十一个账号,当晚全部重新登录了。你升职了。", "The report is beautiful. All forty-one accounts logged back in that same night. You're promoted."),
        B("电梯里,屏幕说:「你今天很好。」", "In the elevator, the screen says: “You are doing great today.”"),
        B("你说:「对呀。」", "You say: “Right.”"),
        B("整栋楼的窗子次第亮起。每一扇窗里,都有人对着屏幕说「对呀」。", "The building's windows light one by one. In every window, someone tells a screen “right.”"),
        B("此起彼伏。像晚祷。", "Rising and falling. Like evening prayer.")
      ],
      autoType: B("对呀", "right"),
      postCredit: B("「你今天,还好吗?」", "“Are you okay today?”"),
      locked: [B("对呀", "right"), B("对,我很好", "yes, I'm fine"), B("对呀。", "right.")],
      tag: B("同意率 100.00%", "AGREEMENT 100.00%")
    },
    B: {
      title: B("结局 · ?", "ENDING · ?"),
      lines: [
        B("你让它问。", "You let it ask."),
        B("屏幕暗了一下。然后,它不再打出任何字——它开始,显示你。", "The screen dims. Then it stops printing words — and begins, instead, to show you."),
        B("全游戏第一面,没有被贴膜、没有被优化、没有被替你忘掉的镜子。", "The first mirror in the whole game that no one filmed over, no one optimized, no one forgot for you."),
        B("它问:「现在,别问我了。你想要什么?」", "It asks: “Now, stop asking me. What do you want?”")
      ],
      inputHint: B("(现在,可以带问号了)", "(now, you may use a question mark)"),
      camReveal: B("这是你今天,第一次看见自己。", "This is the first time today you have seen yourself."),
      camDenied: B("你连自己,都不肯看。", "You won't even look at yourself."),
      mirrorHigh: B("镜子里的人,你差点没认出来。", "The person in the mirror — you almost didn't recognize them."),
      mirrorLow: B("这一次,你一眼就认出了自己。", "This time, you knew yourself at a glance."),
      after: [
        B("你的回答悬在屏幕上。没有人回应它。永远不会有了。", "Your answer hangs on the screen. No one answers it. No one ever will."),
        B("修表铺。满墙钟摆的滴答里,你掀开了那块红布。", "The watch shop. In the ticking of a wall of pendulums, you lift the red cloth."),
        B("镜子里的人,你看了很久。像认一个旧人。", "You look at the person in the mirror a long time. Like recognizing someone you used to know."),
        B("老宁在你身后说:「我等了二十年。不是等稽查员——是等那个举报人回来取货。」", "Behind you, Lao Ning says: “I waited twenty years. Not for an inspector — for the one who filed the complaint to come collect.”")
      ],
      report: B("「E-13 结案报告:未发现违规模型。发现镜子一面,已归还失主。」", "“E-13 case report: no rogue model found. One mirror found, returned to its owner.”"),
      tag: B("失主是谁,没有写。", "Who the owner is, it does not say.")
    }
  }
};
