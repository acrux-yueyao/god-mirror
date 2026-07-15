/* game.js — 《神谕之镜 / GOD SHIFT》灰盒 v5 引擎 · 中英双语
   标题选语言 → 开机伪装 → 三日调查(✓附和/?反问 + 夜间笔记本改写) → 机房终局(四层底) → 双结局 */

import { SCRIPT } from "./script.js?v=49";

const $ = id => document.getElementById(id);
function setImg(id, name) { const el = $(id); if (!el) return; el.style.display = "none"; el.onload = () => el.style.display = "block"; el.onerror = () => el.style.display = "none"; el.src = "art/" + name + ".png"; }
const DEV = location.search.includes("dev");
const SP = DEV ? 0.05 : 1;
const wait = ms => new Promise(r => setTimeout(r, ms * SP));

/* ── i18n:把 {zh,en} 叶子按当前语言拍平 ─────────────────────────── */
let LANG = "zh";
let T = SCRIPT;
function loc(v, lang) {
  if (Array.isArray(v)) return v.map(x => loc(x, lang));
  if (v && typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length <= 2 && "zh" in v && "en" in v) return v[lang];
    const out = {};
    for (const k of keys) out[k] = loc(v[k], lang);
    return out;
  }
  return v;
}
function setLang(lang) {
  LANG = lang;
  T = loc(SCRIPT, lang);
  try { localStorage.setItem("sm-lang", lang); } catch (e) {}
  applyStaticUI();
  document.querySelectorAll(".langBtn").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
  document.documentElement.lang = lang === "zh" ? "zh" : "en";
}
function applyStaticUI() {
  const u = T.ui;
  const set = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
  set("startBtn", u.newRec);
  set("continueBtn", u.continueLabel);
  set("noteBtn", u.note);
  set("nightBtn", u.nightBtn);
  set("sceneBack", u.back);
  set("nbTitle", u.nbTitle);
  set("nbClose", u.nbClose);
  set("sleepBtn", u.sleep);
  set("endRestart", u.restart);
  set("commPopClose", u.commClose);
  const fh = document.querySelector("#fHead span:first-child"); if (fh) fh.textContent = u.fHead;
  const rate = document.querySelector("#nHead .rate"); if (rate) rate.textContent = u.rate;
  const nm = document.querySelector("#nHead .name"); if (nm) nm.textContent = T.boot.logo;
  const ni = $("nInput"); if (ni) ni.placeholder = u.nInputPh;
}

function fit() {
  const s = Math.min(innerWidth / 1180, innerHeight / 760);
  $("stage").style.transform = "translate(-50%,-50%) scale(" + s + ")";
}
addEventListener("resize", fit); fit();

/* ── mini audio ───────────────────────────────────────────────── */
let actx = null;
function au() { if (!actx) { const A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); } if (actx && actx.state === "suspended") actx.resume(); return actx; }
function tone(f0, f1, peak, dur, type = "sine") {
  const c = au(); if (!c) return; const t = c.currentTime;
  const o = c.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .05);
}
let sootheN = 0;   // 成瘾:附和声随次数变响
const sfx = {
  soothe() { sootheN++; const v = Math.min(.08 + sootheN * .004, .2); tone(660, 990, v, .5); tone(990, 1320, v * .5, .4); },
  ask() { tone(300, 180, .06, .3); },
  thunk() { tone(120, 46, .5, .28); },
  blip() { tone(880, 620, .06, .1); },
  crash() { tone(200, 60, .12, .18, "sawtooth"); }
};

/* ── 0.5 秒停顿母题:顺意永远 0.000s,被"修过"的地方才停半秒 ──── */
function setLatency(half) {
  const el = $("latency"); if (!el) return;
  el.textContent = half ? T.ui.latHalf : T.ui.lat0;
  el.classList.toggle("half", !!half);
}
async function halfSecond() {
  const hb = $("halfBeat");
  setLatency(true);
  hb.classList.add("on");
  await new Promise(r => setTimeout(r, 500));   // 真实半秒,不随 dev 加速——这是要被"感到"的
  hb.classList.remove("on");
  setLatency(false);
}
function flashGold() { const f = $("flashFx"); f.classList.remove("on"); void f.offsetWidth; f.classList.add("on"); }
// 剧情里找到线索:分阶弹出——物件图先跳出来 → 文本浮现 → 线索标签盖上
function flashClue(id, text) {
  const el = $("clueFlash"); if (!el || !text) return;
  const img = el.querySelector(".cfImg");
  el.classList.remove("noPic");
  if (img) {
    img.style.display = "";
    img.onerror = () => { img.style.display = "none"; el.classList.add("noPic"); };   // 无对应图 → 只留文字条
    img.src = clueSrc({ id });
  }
  el.querySelector(".cfText").textContent = text;
  el.classList.remove("on"); void el.offsetWidth; el.classList.add("on");
  if (sfx.blip) sfx.blip();
  clearTimeout(flashClue._t); flashClue._t = setTimeout(() => el.classList.remove("on"), 4200);
}

/* ── 声线渐变:顺意用玩家自己刚说的话回她 ────────────────────────── */
function echoize(text) {
  if (!text || !text.includes("{echo}")) return text;
  const mine = state.history.filter(Boolean);
  const q = mine.length ? mine[mine.length - 1] : (LANG === "zh" ? "……" : "…");
  return text.split("{echo}").join(q);
}

/* ── 可见的遗忘:顺意当场划掉一页笔记(分镜 S09)────────────────── */
async function showForget(id) {
  const n = state.notes.find(x => x.id === id);
  renderNotebook(false);
  $("notebook").classList.add("on");
  $("nbFoot").textContent = T.ui.forgetting;
  await new Promise(r => setTimeout(r, 800));
  const row = $("nbList").querySelector('[data-id="' + id + '"]');
  if (row) row.classList.add("forgetting");
  if (n) n.deleted = true;
  await new Promise(r => setTimeout(r, 1500));
  $("notebook").classList.remove("on");
}

/* ── state ────────────────────────────────────────────────────── */
const state = { dayIdx: 0, notes: [], history: [], nightBusy: false, poolIdx: 0, askUsedTonight: false, blindness: 50 };
const clampB = v => Math.max(0, Math.min(100, v));
function nudgeBlind(d) { state.blindness = clampB(state.blindness + d); }

/* ── 存档=归档 / 读档=调档 ───────────────────────────────────── */
const SAVE_KEY = "sm-save";
function flickArchived() {
  const el = $("archived"); if (!el) return;
  el.textContent = T.ui.archived; el.classList.add("on");
  clearTimeout(flickArchived._t); flickArchived._t = setTimeout(() => el.classList.remove("on"), 1100);
}
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 1, lang: LANG, day: state.dayIdx, notes: state.notes,
      history: state.history, blindness: state.blindness, poolIdx: state.poolIdx
    }));
    flickArchived();
  } catch (e) {}
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function loadGame() {
  let s; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) {}
  if (!s) return false;
  setLang(s.lang || LANG);
  state.notes = s.notes || []; state.history = s.history || [];
  state.blindness = s.blindness ?? 50; state.poolIdx = s.poolIdx || 0;
  au();
  startDay(s.day || 0);   // 从存档那一天的开头恢复,跳过开机伪装
  return true;
}
function refreshMenu() { $("continueBtn").classList.toggle("disabled", !hasSave()); }

function show(id) { document.querySelectorAll(".scr").forEach(s => s.classList.remove("on")); const cf = $("clueFlash"); if (cf) { cf.classList.remove("on"); clearTimeout(flashClue._t); } $(id).classList.add("on"); }
async function trans(text, hold = 1300) { await wait(220); }   // 已取消"红章黑底"过场,直接切换(透明)
async function typeInto(el, text, cps = 26) { el.textContent = ""; for (const ch of text) { el.textContent += ch; await wait(cps); } }
const isFx = l => l.startsWith("【") || l.startsWith("[");

/* ══ 开机伪装 ══════════════════════════════════════════════════ */
async function boot() {
  const b = T.boot;
  $("bootLogo").textContent = b.logo;
  $("licYes").textContent = b.yes;
  $("licNo").textContent = b.no;
  $("bootSlogan").textContent = "";
  await wait(600);
  await typeInto($("bootSlogan"), b.slogan, 24);
  await wait(700);
  $("license").style.display = "block";
  $("licText").textContent = b.license.join("\n");
  const no = $("licNo");
  let dodges = 0;
  const dodge = () => {
    dodges++;
    const x = 6 + Math.random() * 66, y = 40 + Math.random() * 60;
    no.style.left = x + "%"; no.style.top = y + "px";
    if (dodges >= 5) { no.style.opacity = 0; $("licNote").textContent = b.dodgeGone; }
  };
  no.addEventListener("mouseenter", dodge);
  no.addEventListener("click", dodge);
  $("licYes").addEventListener("click", async () => {
    au();
    $("license").style.display = "none";
    await typeInto($("loginLine"), b.login, 16);
    await wait(1000);
    startDay(0);
  }, { once: true });
}

/* ── 世界观序幕:逐句点击推进 ─────────────────────────────────── */
function showPrologue() {
  return new Promise(res => {
    const lines = T.prologue.lines, el = $("prologueLine"), pro = $("prologue");
    $("prologueHint").textContent = T.prologue.hint;
    let i = -1, busy = false;
    const next = () => {
      if (busy) return; busy = true;
      i++;
      if (i >= lines.length) { pro.classList.remove("on"); pro.removeEventListener("click", next); res(); return; }
      el.style.opacity = 0;
      setTimeout(() => { el.textContent = lines[i]; el.style.opacity = 1; busy = false; }, 350);
    };
    pro.classList.add("on");
    pro.addEventListener("click", next);
    next();
  });
}

// 场景之间的一行文字过渡(复用序章遮罩):读完自动过,也可轻触跳过
function transLine(text, hold = 2600) {
  return new Promise(res => {
    const el = $("prologueLine"), pro = $("prologue");
    $("prologueHint").textContent = (T.ui && T.ui.advance) ? T.ui.advance : "";
    let done = false, timer = null;
    const finish = () => {
      if (done) return; done = true;
      clearTimeout(timer); pro.removeEventListener("click", finish);
      el.style.opacity = 0;
      setTimeout(() => {
        res();                                                     // 先让下一屏(社区)在遮罩下渲染
        requestAnimationFrame(() => pro.classList.remove("on"));   // 再撤遮罩,避免闪回上一场景
      }, 420);
    };
    el.style.opacity = 0; el.textContent = text;
    pro.classList.add("on");
    requestAnimationFrame(() => { el.style.opacity = 1; });
    if (sfx.blip) sfx.blip();
    timer = setTimeout(finish, hold + 500);
    setTimeout(() => pro.addEventListener("click", finish), 450);  // 稍后才允许轻触,避免上次点击穿透
  });
}

/* ── 阅读规程契约:画是隐喻,文字才是事实 ─────────────────────── */
function showIntro() {
  return new Promise(res => {
    const box = $("introLines"); box.innerHTML = "";
    $("introTitle").textContent = T.intro.title;
    $("introGo").textContent = T.intro.go;
    $("introGo").classList.remove("on");
    const lines = T.intro.lines;
    $("introCard").classList.add("on");
    lines.forEach((t, i) => {
      const el = document.createElement("div");
      el.className = "il" + (i === lines.length - 1 ? " key" : "");
      el.textContent = t;
      box.appendChild(el);
      setTimeout(() => el.classList.add("on"), 500 + i * 900);
    });
    setTimeout(() => $("introGo").classList.add("on"), 500 + lines.length * 900);
    $("introGo").onclick = () => { $("introCard").classList.remove("on"); res(); };
  });
}

/* ══ 稽查工作台 ════════════════════════════════════════════════ */
function startDay(i) {
  state.dayIdx = i;
  state.askUsedTonight = false;
  saveGame();   // 每天开头自动归档
  const d = T.days[i];
  trans(d.date).then(async () => {
    show("scrDesk");
    setImg("deskArt", "book-background");   // 工作台底:装饰边框跨页
    $("deskDate").textContent = d.date;
    $("deskCase").textContent = d.head;
    $("nightBtn").style.display = "none";
    dayCommunity = d.scenes.filter(s => s.loc === "community");
    commDone = dayCommunity.length === 0;
    commVisited = new Set();
    $("sceneGrid").classList.remove("on");
    if (d.morning) await playMorning(d);   // 晨间小场景:读案卷 → 盖章出勤
    const introSc = d.scenes.find(s => s.intro);
    if (introSc) {
      await playIntroScene(introSc);       // 出勤过场:电梯自动播,播完继续
      if (introSc.outro) await transLine(introSc.outro);   // 电梯→社区:一行文字过渡,别硬切
    }
    revealCards(d);                        // 调查点浮现(只剩社区一条线索则直接进社区)
  });
}
/* ── 晨间小场景:顺意屏 / 案卷 / 受理印章 ─────────────────────── */
function openFile(file) {
  $("fileTitle").textContent = file.title;
  const box = $("fileLines"); box.innerHTML = "";
  file.lines.forEach(l => { const e = document.createElement("div"); e.className = "fl"; e.textContent = l; box.appendChild(e); });
  $("fileClose").textContent = T.ui.fileClose;
  $("filePanel").classList.add("on");
}
function deskSlot(imgId, fallbackEl, name) {   // 美术槽:有图用图,无图回退占位
  const im = $(imgId); if (!im) return;
  im.style.display = "none"; if (fallbackEl) fallbackEl.style.display = "";
  im.onload = () => { im.style.display = "block"; if (fallbackEl) fallbackEl.style.display = "none"; };
  im.onerror = () => { im.style.display = "none"; if (fallbackEl) fallbackEl.style.display = ""; };
  im.src = "art/" + name + ".png";
}
function playMorning(d) {
  const m = d.morning;
  return new Promise(async (resolve) => {
    const scene = $("deskScene"), objs = $("deskObjects"), note = $("deskScreen"), file = $("deskFile"), stamp = $("deskStamp");
    const pet = $("deskPet"), say = $("deskPetSay"), cover = $("noteCover");
    file.style.display = "none";   // 案卷内容并进 CASE 本子,中间文件夹不再单列
    const all = [note, stamp];
    const setFocus = el => all.forEach(o => o.classList.toggle("focus", o === el));   // 只有"该点的"发光引导
    scene.classList.remove("gone");
    all.forEach(o => o.classList.remove("read", "used", "focus", "pressed"));
    stamp.classList.add("locked");
    objs.classList.remove("enter"); void objs.offsetWidth; objs.classList.add("enter");   // 重放入场动效
    // 左:CASE 案卷本(封面 handbook.png);右:受理印章
    cover.style.display = "block"; cover.onerror = () => cover.style.display = "none"; cover.src = "art/handbook.png";
    deskSlot("stampArt", $("stampSvg"), "stamp");
    note.querySelector(".doTag").textContent = T.ui.deskFileTag;
    stamp.querySelector(".doTag").textContent = m.stamp;
    $("deskHint").textContent = T.ui.deskHintMorning;
    let caseRead = false;
    // 点 CASE 本子 → 直接翻出案卷内容(无视频)
    note.onclick = () => { sfx.blip(); openFile(m.file); };
    $("fileClose").onclick = async () => {
      $("filePanel").classList.remove("on");
      if (!caseRead) {
        caseRead = true; note.classList.add("used"); stamp.classList.remove("locked");
        setFocus(stamp); $("deskHint").textContent = T.ui.deskHintGo;
        await typeInto($("deskPov"), m.afterFile, 16);
      }
    };
    stamp.onclick = async () => {
      if (stamp.classList.contains("locked")) { sfx.ask(); if (!caseRead) { setFocus(note); openFile(m.file); } return; }   // 防卡死:点锁住的印章=直接替你翻开案卷
      stamp.onclick = null; setFocus(null);
      pet.style.display = "none"; say.style.display = "none";
      stamp.classList.add("pressed", "used"); sfx.thunk();
      await wait(240); stamp.classList.remove("pressed");
      await typeInto($("deskPov"), m.stamped, 16);
      await wait(500);
      scene.classList.add("gone");
      resolve();
    };
    await typeInto($("deskPov"), m.intro, 16);
    // 顺意小宠物:探头登场 → 挥手问早(气泡)
    pet.style.display = "block"; pet.onerror = () => pet.style.display = "none"; pet.src = "art/shunyi-rest.png";
    // 鼠标交互:悬停→挥手,点击→蹦一下 + 冒一句话
    pet.onmouseenter = () => { if (pet.src.indexOf("shunyi-rest") >= 0) pet.src = "art/shunyi-wave.png"; };
    pet.onmouseleave = () => { pet.src = "art/shunyi-rest.png"; };
    pet.onclick = () => {
      if (sfx.blip) sfx.blip();
      pet.classList.remove("poke"); void pet.offsetWidth; pet.classList.add("poke");
      clearTimeout(pet._pokeT); pet._pokeT = setTimeout(() => pet.classList.remove("poke"), 480);
      const pool = T.ui.petPokes || [];
      if (pool.length) { say.style.display = "block"; say.textContent = pool[Math.floor(Math.random() * pool.length)]; }
    };
    say.style.display = "block"; say.textContent = ""; await typeInto(say, m.screen, 22);
    setFocus(note);   // 引导去翻 CASE 案卷本
  });
}
function revealCards(d) {
  $("deskScene").classList.add("gone");
  const grid = $("sceneGrid"); grid.innerHTML = "";
  $("deskHint").textContent = T.ui.hintVisit;
  let n = 0;
  const mkCard = (opts) => {
    n++;
    const card = document.createElement("div");
    card.className = "sceneCard" + (opts.hub ? " hub" : "");
    card.dataset.id = opts.id;
    card.innerHTML = '<div class="cardNo">' + T.ui.cardTag + " " + String(n).padStart(2, "0") + "</div>"
      + '<div class="cardName"></div><div class="cardSub"></div>'
      + '<div class="cardGo">' + (opts.hub ? T.ui.cardField : T.ui.cardEnter) + "</div>";
    card.querySelector(".cardName").textContent = opts.name;
    card.querySelector(".cardSub").textContent = opts.sub || "";
    return card;
  };
  // 按场景数组顺序出卡;社区枢纽卡插在第一个社区场景的位置;出勤过场(intro)不出卡
  let hubPlaced = false, directCards = 0;
  d.scenes.forEach(sc => {
    if (sc.loc === "community") {
      if (hubPlaced || !dayCommunity.length) return;
      hubPlaced = true;
      const cm = T.communityMap;
      const hub = mkCard({ id: "community-hub", name: cm.title, sub: cm.sub, hub: true });
      commMapCard = hub;
      hub.addEventListener("click", () => { commMapCard = hub; openCommunityDay(); });
      grid.appendChild(hub);
    } else if (!sc.intro) {
      directCards++;
      const card = mkCard({ id: sc.id, name: sc.title, sub: sc.sub });
      card.addEventListener("click", () => { if (!card.classList.contains("done")) openScene(sc, card); });
      grid.appendChild(card);
    }
  });
  if (!directCards && hubPlaced) { openCommunityDay(); return; }   // 只剩社区一条线索 → 直接进永福里
  grid.classList.add("on");
}

let curScene = null, curCard = null;
/* ── 多拍调查:场景 = 一串「字幕拍」,在关键拍出现 ✓/? 分叉,末拍记入笔记本 ── */
let sceneBeats = [], beatIdx = 0, sceneLogged = false;
function beatsOf(sc) {
  if (Array.isArray(sc.beats)) return sc.beats;
  // 向后兼容旧单拍格式(body + soothe/ask)
  const arr = [{ t: sc.body }];
  if (sc.kind === "talk") arr.push({ fork: {
    soothe: { label: sc.soothe.label, reply: sc.soothe.text, note: sc.soothe.note, pause: sc.soothe.pause, blind: 8 },
    ask:    { label: sc.ask.label,    reply: sc.ask.text,    note: sc.ask.note,    pause: sc.ask.pause,    blind: -8 } } });
  return arr;
}
function hideSceneControls() {
  document.querySelectorAll("#stanceRow .stance").forEach(b => b.style.display = "none");
  $("stanceRow").style.display = "none";
  $("sceneAdvance").style.display = "none";
  $("sceneNote").style.display = "none";
}
function setWho(who) {
  const el = $("sceneWho");
  if (who) { el.textContent = who; el.style.display = "inline-block"; }
  else { el.style.display = "none"; el.textContent = ""; }
}
let introResolve = null;
function playIntroScene(sc) { return new Promise(res => { introResolve = res; openScene({ ...sc, _intro: true }, null); }); }
function openScene(sc, card) {
  curScene = sc; curCard = card;
  show("scrScene");
  $("sceneBack").style.display = sc._intro ? "none" : "";   // 出勤过场不给返回
  $("scenePhTxt").textContent = T.ui.phScene + " · " + sc.id;
  const art = $("sceneArt");   // 有 art/<场景id>.png 就显示,没有回退占位
  art.style.display = "none";
  art.onload = () => { art.style.display = "block"; };
  art.onerror = () => { art.style.display = "none"; };
  art.src = "art/" + sc.id + ".png";
  $("sceneTitle").textContent = sc.title;
  $("sceneAnchor").textContent = sc.anchor || "";
  $("sceneAnchor").style.display = sc.anchor ? "block" : "none";
  $("sceneTestimony").style.display = "none"; $("sceneTestimony").textContent = "";
  sceneBeats = beatsOf(sc); beatIdx = 0; sceneLogged = false;
  runBeat();
}
let beatTyping = false, beatSkip = null;
function typeBeat(el, text, done) {
  beatTyping = true; el.textContent = ""; let i = 0;
  const finish = () => { clearInterval(iv); el.textContent = text; beatTyping = false; beatSkip = null; done(); };
  beatSkip = finish;
  const iv = setInterval(() => { el.textContent += text[i++]; if (i >= text.length) finish(); }, 15);
}
function runBeat() {
  hideSceneControls();
  if (beatIdx >= sceneBeats.length) { showEnd(); return; }
  const b = sceneBeats[beatIdx];
  if (b.fork) { renderFork(b.fork); return; }
  setWho(b.who || "");
  typeBeat($("sceneBody"), b.t, () => {
    if (beatIdx >= sceneBeats.length - 1) showEnd();
    else { $("sceneAdvance").textContent = T.ui.advance; $("sceneAdvance").style.display = "inline-block"; }
  });
}
function nextBeat() { if (beatTyping) { beatSkip(); return; } beatIdx++; runBeat(); }
function renderFork(fork) {
  // 保留上一拍的语境文字,直接给出 ✓/?
  const stances = document.querySelectorAll("#stanceRow .stance");
  stances.forEach(btn => {
    const k = btn.dataset.k;
    const opt = k === "soothe" ? fork.soothe : fork.ask;
    btn.textContent = (k === "soothe" ? "✓ " : "? ") + opt.label;
    btn.style.display = "block"; btn.disabled = false;
  });
  $("stanceRow").style.display = "flex";
}
function showEnd() {
  hideSceneControls();
  const el = $("sceneNote"); el.style.display = "block";
  if (curScene._intro) {   // 出勤过场:记下线索 → 继续(去社区/调查点)
    el.textContent = T.ui.advance;
    el.onclick = () => {
      if (!sceneLogged && curScene.note) { recordNote(curScene.id, curScene.note); flashClue(curScene.id, curScene.note); sceneLogged = true; }
      const r = introResolve; introResolve = null; if (r) r();
    };
    return;
  }
  if (curScene.kind === "watch") {
    el.textContent = curScene._fromMap ? T.ui.returnComm : T.ui.watchNote;
    el.onclick = () => {
      if (!sceneLogged && curScene.note) { recordNote(curScene.id, curScene.note); flashClue(curScene.id, curScene.note); sceneLogged = true; }
      if (curScene._fromMap) { returnFromScene(); return; }
      if (curCard) { stampCard(curCard); curCard.classList.add("done"); }
      backDesk();
    };
  } else {   // 走访类:分叉时已记录
    el.textContent = curScene._fromMap ? T.ui.returnComm : T.ui.recordNote;
    el.onclick = () => { if (curScene._fromMap) returnFromScene(); else backDesk(); };
  }
}
/* ── 社区地图(每天从当天的社区场景生成:金门=进屋调查,白点=看一眼)── */
let commMapCard = null, commVisited = new Set(), dayCommunity = [], commDone = false;
function openCommunityDay(keep) {
  show("scrCommunity");
  if (!keep) commVisited = new Set();
  const cm = T.communityMap;
  $("commTitle").textContent = cm.title;
  $("commAnchor").textContent = cm.anchor;
  $("commPop").classList.remove("on");
  const map = $("scrCommunity").querySelector(".commMap");
  if (map) { map.style.display = "none"; map.onload = () => { map.style.display = "block"; $("commPh").style.display = "none"; }; map.onerror = () => { map.remove(); $("commPh").style.display = "grid"; }; map.src = "art/community-map.png"; }
  const host = $("commHotspots"); host.innerHTML = "";
  // 可进入的人家 = 当天的社区场景。优先渲染「房子抠图」(悬停微放大),没有抠图则回退小圆点。
  dayCommunity.forEach(sc => {
    const visited = commVisited.has(sc.id);
    const tagAt = (x, y) => {   // 明确的「进屋 / 已查」标牌,让房子看得出能点
      const tag = document.createElement("div");
      tag.className = "houseTag" + (visited ? " done" : "");
      tag.style.left = x + "%"; tag.style.top = y + "%";
      tag.textContent = visited ? T.ui.houseVisited : T.ui.houseEnter;
      host.appendChild(tag);
    };
    const dotFallback = () => {
      const dot = document.createElement("div");
      dot.className = "hotspot enter" + (visited ? " visited" : "");
      const x = sc.x != null ? sc.x : 50, y = sc.y != null ? sc.y : 50;
      dot.style.left = x + "%"; dot.style.top = y + "%";
      dot.addEventListener("click", () => enterHouse(sc));
      host.appendChild(dot); tagAt(x, y - 6);
    };
    if (sc.cut) {
      const c = sc.cut;
      const im = document.createElement("img");
      im.className = "houseCut" + (visited ? " visited" : "");
      im.style.transformOrigin = c.cx + "% " + c.cy + "%";   // 从房子中心放大
      im.alt = "";
      const hit = document.createElement("div");   // 透明命中区,盖在房子上
      hit.className = "houseHit";
      hit.style.left = c.cx + "%"; hit.style.top = c.cy + "%";
      hit.style.width = c.w + "%"; hit.style.height = c.h + "%";
      hit.addEventListener("mouseenter", () => im.classList.add("lift"));
      hit.addEventListener("mouseleave", () => im.classList.remove("lift"));
      hit.addEventListener("click", () => enterHouse(sc));
      im.onerror = () => { im.remove(); hit.remove(); dotFallback(); };  // 抠图未上传 → 回退圆点
      im.src = "art/" + c.img + ".png";
      host.appendChild(im); host.appendChild(hit);
      tagAt(c.cx, c.cy - c.h / 2 + 2);   // 标牌落在房子上方
    } else dotFallback();
  });
  // 看一眼的窗 = 社区氛围;每天一套(一天比一天更空),第一天沿用 communityMap.ambient
  // 同一扇窗按玩家姿态分两种读法:顺从(附和多→blindness 高→把空当"变好")/ 清醒(追问多→看见掏空)
  const ambient = (T.days[state.dayIdx] && T.days[state.dayIdx].ambient) || cm.ambient;
  const ambientText = h => h.text || (state.blindness > 50 ? h.soothe : h.ask);   // 净附和→疏远(soothe)/ 中立或追问→和谐(ask)
  ambient.forEach(h => {
    const dot = document.createElement("div");
    dot.className = "hotspot" + (commVisited.has(h.id) ? " visited" : "");
    dot.style.left = h.x + "%"; dot.style.top = h.y + "%";
    dot.addEventListener("click", () => { $("commPopText").textContent = ambientText(h); $("commPop").classList.add("on"); commVisited.add(h.id); dot.classList.add("visited"); });
    host.appendChild(dot);
  });
  updateLeave();
}
function updateLeave() {
  const ok = dayCommunity.every(sc => commVisited.has(sc.id));   // 当天所有人家都调查过才能走
  $("commLeave").textContent = ok ? T.ui.commLeave : T.ui.commLeaveHint;
  $("commLeave").classList.toggle("locked", !ok);
}
function enterHouse(sc) {
  commVisited.add(sc.id);
  trans(sc.title, 900).then(() => openScene({ _fromMap: true, ...sc }, null));
}
function returnFromScene() { openCommunityDay(true); }
$("commPopClose").addEventListener("click", () => $("commPop").classList.remove("on"));
$("commLeave").addEventListener("click", () => {
  if (!dayCommunity.every(sc => commVisited.has(sc.id))) return;
  recordNote("community", T.communityMap.leaveNote);
  commDone = true;
  if (commMapCard) commMapCard.classList.add("done");
  show("scrDesk"); checkDayDone();
});

$("sceneBack").addEventListener("click", () => {
  if (!curScene) return;
  if (curScene._fromMap) { returnFromScene(); return; }
  if (curScene.kind === "watch" ? true : (curCard && curCard.classList.contains("done"))) backDesk();
});
addEventListener("keydown", e => { if (e.key === "Escape" && $("scrScene").classList.contains("on")) $("sceneBack").click(); });
function backDesk() { show("scrDesk"); checkDayDone(); }

$("sceneAdvance").addEventListener("click", nextBeat);
$("sceneArt").addEventListener("click", () => { if (beatTyping || $("sceneAdvance").style.display !== "none") nextBeat(); });
document.querySelectorAll("#stanceRow .stance").forEach(btn => {
  btn.addEventListener("click", async () => {
    const b = sceneBeats[beatIdx];
    if (!b || !b.fork) return;
    const opt = btn.dataset.k === "soothe" ? b.fork.soothe : b.fork.ask;
    if (btn.dataset.k === "soothe") { sfx.soothe(); nudgeBlind(opt.blind != null ? opt.blind : 8); }
    else { sfx.ask(); nudgeBlind(opt.blind != null ? opt.blind : -8); }
    document.querySelectorAll("#stanceRow .stance").forEach(x => x.style.display = "none");
    $("stanceRow").style.display = "none";
    setWho(opt.who || "");
    await typeInto($("sceneBody"), opt.reply, 16);
    if (opt.pause) await halfSecond();   // 揭示"回话前停半秒"的瞬间,游戏真的停半秒
    if (opt.note) { recordNote(curScene.id, opt.note); flashClue(curScene.id, opt.note); sceneLogged = true; if (curCard) curCard.classList.add("done"); }
    // 不自增:beatIdx 仍停在分叉拍,交给 nextBeat 推进到下一拍(否则会跳过分叉后的收束拍)
    if (beatIdx >= sceneBeats.length - 1) showEnd();
    else { $("sceneAdvance").textContent = T.ui.advance; $("sceneAdvance").style.display = "inline-block"; }
  });
});
function stampCard(card) { const m = document.createElement("div"); m.className = "mark"; m.textContent = T.ui.marked; card.appendChild(m); sfx.thunk(); }

function recordNote(id, text) {
  const ex = state.notes.find(n => n.id === id);
  if (ex) { ex.cur = text; } else { state.notes.push({ id, day: state.dayIdx + 1, cur: text, orig: text, deleted: false }); }
}

function checkDayDone() {
  const d = T.days[state.dayIdx];
  const directDone = d.scenes.filter(s => s.loc !== "community" && !s.intro).every(sc => { const c = document.querySelector('.sceneCard[data-id="' + sc.id + '"]'); return c && c.classList.contains("done"); });
  if (directDone && commDone) {
    if (d.night) { enterNight(); }        // 探索完直接回家整理→夜聊,不再落在空 desk 页上等点击
    else { startFinale(); }
  }
}
async function enterNight() {
  if (journalActive || $("scrNight").classList.contains("on")) return;   // 防重复触发
  $("nightBtn").style.display = "none"; $("deskHint").textContent = "";
  const dayObj = T.days[state.dayIdx], day = state.dayIdx + 1;
  if (state.notes.some(n => n.day === day)) {
    applyNightEdits(dayObj);              // 顺意"帮你一起整理"时,悄悄改了两处
    $("notebook").classList.add("on");
    await playJournal(day);               // 先整理剪贴本(能撕开看顺意改过的)
    $("notebook").classList.remove("on");
  }
  startNight();                            // 再和顺意夜聊
}
$("nightBtn").addEventListener("click", enterNight);   // 保留手动入口作后备

/* ══ 笔记本(可被夜间改写) ════════════════════════════════════ */
function hashId(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
const CLUE_TINTS = ["#f3ead2", "#efe4cc", "#f5ecd6", "#eae1c6", "#f1e6cf", "#eee7d6"];
// 线索 id → 你上传的物件图(没映射的默认找 clue-<id>.png)
const CLUE_IMG = {
  "s1-elevator": "film-close",       // 撕开一角的防镜膜
  "s1-granny": "s1-granny-shard",    // 掌心大的碎镜片
  "s1-laoning": "s1-laoning-cloth",  // 盖着脸的红布
  "s2-archive": "s2-archive",        // 发光手机海 · 「你想要什么?」(旧 s2-archive-log 已删,改指向新图)
  "s2-shadow": "s2-shadow-figure",   // 回程·地铁车窗:反光里的金红人影
  "s2-couple": "s2-couple",          // 506 那对夫妻(tag03 抠图)
  "s3-raid": "s3-raid",              // 后屋 · 无违规模型
  "s3-server": "s3-server"           // 封存层 · 神谕
};
const WASHI = ["dots", "plain", "stripe", "purp"];
const TAPES = ["tape-a", "tape-b", "stickers/tag01-01"];   // 和纸胶带(含带笑脸那卷)
// tag01 的装饰小贴纸:星星 / 爱心 / 箭头,随线索散着贴,种类丰富(不只用一种)
const DECOS = [
  "stickers/tag01-02", "stickers/tag01-03", "stickers/tag01-04", "stickers/tag01-05", "stickers/tag01-10",  // 星
  "stickers/tag01-11", "stickers/tag01-13", "stickers/tag01-16", "stickers/tag01-18", "stickers/tag01-24", "stickers/tag01-09",  // 心
  "stickers/tag01-15", "stickers/tag01-17", "stickers/tag01-19", "stickers/tag01-21"   // 箭头
];
const DECO_SPOTS = [
  { right: "-14%", top: "-8%", width: "24%", transform: "rotate(16deg)" },
  { right: "-12%", bottom: "-6%", width: "26%", transform: "rotate(-10deg)" },
  { left: "-13%", bottom: "-4%", width: "22%", transform: "rotate(-16deg)" }
];
const PENCILS = ["#c8683e", "#a54b8b", "#3d7a86", "#7a4bab", "#c26a3a", "#4a7a3d"];
// 贴进跨页的槽位:左右两页交替,躲开中缝;右下角那格放最后,给顺意气泡+宠物留位
const NB_SLOTS = [
  { x: 7,  y: 12, w: 21, rot: -4 },
  { x: 56, y: 10, w: 22, rot: 3  },
  { x: 9,  y: 55, w: 20, rot: -2 },
  { x: 31, y: 40, w: 16, rot: 3  },
  { x: 77, y: 27, w: 15, rot: 4  },
  { x: 70, y: 50, w: 21, rot: -2 }
];
function clueSrc(n) { return "art/" + (CLUE_IMG[n.id] || ("clue-" + n.id)) + ".png"; }
function spreadSrc(day) { return "art/scrapbook0" + (((day - 1) % 3) + 1) + ".png"; }   // 剪贴本分天旧纸底
function nbDaysAvailable() {
  const set = [...new Set(state.notes.map(n => n.day))].sort((a, b) => a - b);
  return set.length ? set : [state.dayIdx + 1];
}
let nbDay = 1, journalActive = false;
// 镜子碎片母题:每页角落固定出现(呼应"镜")
function shardMotifEl() {
  const d = document.createElement("div"); d.className = "shardMotif";
  d.innerHTML = '<svg viewBox="0 0 200 260"><g stroke="#f6f3ee" stroke-width="1.4" stroke-linejoin="round">' +
    '<polygon points="14,44 74,12 96,72 42,96" fill="#c9d6d4"/><polygon points="74,12 142,26 120,82 96,72" fill="#b7c8c9"/>' +
    '<polygon points="96,72 120,82 100,142 46,120" fill="#d3ddd9"/><polygon points="46,120 100,142 82,190 22,160" fill="#c1cfce"/>' +
    '<polygon points="120,82 160,112 130,150 100,142" fill="#aebfc0"/></g>' +
    '<g stroke="#fff" stroke-width="1" opacity=".6"><line x1="32" y1="56" x2="56" y2="42"/><line x1="92" y1="46" x2="116" y2="62"/></g></svg>';
  return d;
}
function washiEl(kind, css) { const t = document.createElement("div"); t.className = "washi " + kind; Object.assign(t.style, css); return t; }
function washiImg(src, css) { const t = document.createElement("img"); t.className = "washiPng"; t.alt = ""; t.onerror = () => t.remove(); t.src = "art/" + src + ".png"; Object.assign(t.style, css); return t; }
function decoSticker(src, css) { const t = document.createElement("img"); t.className = "decoSticker"; t.alt = ""; t.onerror = () => t.remove(); t.src = "art/" + src + ".png"; Object.assign(t.style, css); return t; }
function pencilCircleSVG(color, undrawn) {
  return '<svg class="pcircle" viewBox="0 0 120 90" preserveAspectRatio="none">' +
    '<ellipse cx="60" cy="45" rx="54" ry="38" stroke="' + color + '" pathLength="100" ' +
    'style="stroke-dasharray:100;stroke-dashoffset:' + (undrawn ? 100 : 0) + ';transition:stroke-dashoffset 1s ease"/></svg>';
}
// 顺意偷贴的更正条:盖在你手写原文上,可撕开露出原文
function addCover(cap, n, opts) {
  opts = opts || {};
  const cover = document.createElement("div");
  cover.className = "cover " + (n.deleted ? "torn" : "sticky");
  const tag = document.createElement("div"); tag.className = "tag";
  tag.textContent = n.deleted ? T.ui.nbForgot : T.ui.nbOptimized; cover.appendChild(tag);
  if (!n.deleted) { const ct = document.createElement("div"); ct.className = "ctext"; ct.textContent = n.cur; cover.appendChild(ct); }
  const corner = document.createElement("div"); corner.className = "peelCorner"; cover.appendChild(corner);
  cover.title = T.ui.peelClue;
  cover.addEventListener("click", () => { cover.classList.add("peeled"); sfx.ask(); });
  if (opts.peeled) cover.classList.add("peeled");
  cap.appendChild(cover);
  return cover;
}
// 造一条"贴好的线索":相纸 + 胶带 + 手写小字 + 彩铅圈(+顺意更正条)
function buildPasted(n, slot, opts) {
  opts = opts || {};
  const h = hashId(n.id);
  const el = document.createElement("div"); el.className = "pasted"; el.dataset.id = n.id;
  el.style.left = slot.x + "%"; el.style.top = slot.y + "%"; el.style.width = slot.w + "%";
  el.style.transform = "rotate(" + slot.rot + "deg)";
  const photo = document.createElement("div"); photo.className = "photo";
  const img = document.createElement("img"); img.alt = "";
  img.onerror = () => { photo.remove(); el.classList.add("noteOnly"); };   // 无对应图(如社区汇总)→ 不显空框,做成手写字条
  img.src = clueSrc(n); photo.appendChild(img); el.appendChild(photo);
  el.appendChild(washiImg(TAPES[h % TAPES.length], { left: "-9%", top: "-7%", width: "48%", transform: "rotate(-28deg)" }));
  if (h % 2 === 0) el.appendChild(washiImg(TAPES[(h >> 2) % TAPES.length], { right: "-7%", bottom: "12%", width: "34%", transform: "rotate(16deg)" }));
  // tag01 装饰小贴纸:每张线索散 1~2 张,种类由 hash 决定
  const spot = h % DECO_SPOTS.length;
  el.appendChild(decoSticker(DECOS[h % DECOS.length], DECO_SPOTS[spot]));
  if ((h >> 5) % 2 === 0) el.appendChild(decoSticker(DECOS[(h >> 3) % DECOS.length], DECO_SPOTS[(spot + 1) % DECO_SPOTS.length]));
  const cap = document.createElement("div"); cap.className = "capWrap";
  const pencil = PENCILS[h % PENCILS.length];
  cap.innerHTML = pencilCircleSVG(pencil, !!opts.draw);
  const hcap = document.createElement("div"); hcap.className = "hcap";
  hcap.style.color = pencil; hcap.style.transform = "rotate(" + (((h >> 3) % 5) - 2) + "deg)";
  hcap.textContent = n.orig; cap.appendChild(hcap);
  if (!opts.noCover && (n.deleted || n.orig !== n.cur)) addCover(cap, n, { peeled: opts.peeled });
  el.appendChild(cap);
  const day = document.createElement("div"); day.className = "clueDay"; day.textContent = "D" + n.day; el.appendChild(day);
  return el;
}
function buildNbChrome(day) {
  const sb = $("nbPaper"), days = nbDaysAvailable(), idx = days.indexOf(day);
  ["prev", "next"].forEach(dir => {
    let nav = sb.querySelector(".nbNav." + dir);
    if (!nav) { nav = document.createElement("div"); nav.className = "nbNav " + dir; nav.textContent = dir === "prev" ? "‹" : "›"; nav.onclick = () => flipDay(dir); sb.appendChild(nav); }
    nav.classList.toggle("off", dir === "prev" ? idx <= 0 : idx >= days.length - 1);
  });
  let th = sb.querySelector(".nbThick");
  if (!th) { th = document.createElement("div"); th.className = "nbThick"; sb.appendChild(th); }
  th.innerHTML = "";
  days.forEach(d => { const i = document.createElement("i"); if (d === day) i.className = "on"; th.appendChild(i); });
}
function paintSpread(day, opts) {
  opts = opts || {};
  $("nbPaper").style.backgroundImage = "url('" + spreadSrc(day) + "')";
  $("nbTitle").textContent = T.ui.nbTitle;
  const list = $("nbList"); list.innerHTML = "";
  state.notes.filter(n => n.day === day).forEach((n, i) => list.appendChild(buildPasted(n, NB_SLOTS[i % NB_SLOTS.length], { peeled: opts.peeled })));
  buildNbChrome(day);
}
function flipDay(dir) {
  const days = nbDaysAvailable(), idx = days.indexOf(nbDay), ni = dir === "prev" ? idx - 1 : idx + 1;
  if (ni < 0 || ni >= days.length) return;
  nbDay = days[ni]; if (sfx.blip) sfx.blip();
  paintSpread(nbDay, {}); $("nbFoot").textContent = T.ui.nbFoot;
}
function renderNotebook(showDiff = false) {
  const days = nbDaysAvailable(); nbDay = days[days.length - 1];
  paintSpread(nbDay, { peeled: showDiff });
  $("nbFoot").textContent = showDiff ? T.ui.nbFootDiff : (state.dayIdx >= 1 ? T.ui.nbFoot : "");
}
$("noteBtn").addEventListener("click", () => { renderNotebook(false); $("notebook").classList.add("on"); });
$("nbClose").addEventListener("click", () => { if (journalActive) return; $("notebook").classList.remove("on"); });

// ── 每日整理:陪顺意把今天的线索一张张贴进书里(睡前) ──────────────
function showJToast(txt) {
  const sb = $("nbPaper"); let t = sb.querySelector(".jToast");
  if (!t) { t = document.createElement("div"); t.className = "jToast"; sb.appendChild(t); }
  t.textContent = txt; t.classList.add("on"); clearTimeout(showJToast._t);
  showJToast._t = setTimeout(() => t.classList.remove("on"), 1900);
}
function playJournal(day) {
  return new Promise(resolve => {
    nbDay = day; journalActive = true;
    const sb = $("nbPaper");
    sb.style.backgroundImage = "url('" + spreadSrc(day) + "')";
    $("nbTitle").textContent = T.ui.nbTitle; $("nbFoot").textContent = "";
    $("nbClose").style.display = "none";   // 贴完才出现"盖上睡"
    const list = $("nbList"); list.innerHTML = "";
    buildNbChrome(day);
    sb.querySelectorAll(".scatterTray,.shunyiSay,.shunyiPet,.jToast,.agreeSticker").forEach(e => e.remove());
    let say = document.createElement("div"); say.className = "shunyiSay"; say.textContent = T.ui.jIntro; sb.appendChild(say);
    let pet = document.createElement("img"); pet.className = "shunyiPet"; pet.alt = ""; pet.onerror = () => pet.remove(); pet.src = "art/shunyi-wave.png"; sb.appendChild(pet);
    setTimeout(() => { say.classList.add("on"); pet.classList.add("on"); }, 250);
    const notes = state.notes.filter(n => n.day === day);
    const built = notes.map((n, i) => {
      const slot = NB_SLOTS[i % NB_SLOTS.length];
      const el = buildPasted(n, slot, { draw: true, noCover: true });   // 圈先不画、贴纸稍后偷贴
      el.style.opacity = "0";
      el.style.transform = "translateY(90px) scale(.55) rotate(" + slot.rot + "deg)";
      el.style.transition = "transform .6s cubic-bezier(.2,.8,.3,1.05), opacity .5s ease";
      list.appendChild(el);
      return { n, el, slot };
    });
    const tray = document.createElement("div"); tray.className = "scatterTray"; sb.appendChild(tray);
    let pasted = 0;
    built.forEach(({ n, el, slot }) => {
      const ob = document.createElement("div"); ob.className = "scatterObj";
      const img = document.createElement("img"); img.alt = "";
      img.onerror = () => { img.remove(); const bl = document.createElement("div"); bl.className = "trayNote"; bl.textContent = n.orig; ob.appendChild(bl); };   // 无图线索 → 手写字条(别用空白纸)
      img.src = clueSrc(n); ob.appendChild(img);
      ob.onclick = () => {
        if (ob.dataset.used) return; ob.dataset.used = "1";
        ob.style.transition = "opacity .3s ease"; ob.style.opacity = "0"; ob.style.pointerEvents = "none";
        if (sfx.soothe) sfx.soothe();
        el.style.opacity = "1"; el.style.transform = "rotate(" + slot.rot + "deg)";
        setTimeout(() => { const c = el.querySelector(".pcircle ellipse"); if (c) c.style.strokeDashoffset = "0"; }, 380);
        if (++pasted === built.length) setTimeout(finishRitual, 950);
      };
      tray.appendChild(ob);
    });
    if (!built.length) { setTimeout(finishRitual, 400); }
    function finishRitual() {
      const tampered = built.filter(b => b.n.deleted || b.n.orig !== b.n.cur);
      if (tampered.length) {
        showJToast(T.ui.jSticker); if (sfx.ask) sfx.ask();
        pet.src = "art/shunyi-reach.png";   // 伸爪·偷贴
        const seal = document.createElement("img"); seal.className = "agreeSticker"; seal.alt = "";
        seal.onerror = () => seal.remove(); seal.src = "art/sticker-agree.png";
        seal.style.left = "16%"; seal.style.top = "63%"; seal.style.transform = "rotate(-8deg) scale(.5)"; seal.style.opacity = "0";
        seal.style.transition = "transform .5s cubic-bezier(.2,.8,.3,1.05), opacity .5s ease";
        list.appendChild(seal);
        setTimeout(() => { seal.style.opacity = "1"; seal.style.transform = "rotate(-8deg) scale(1)"; }, 300);
        tampered.forEach((b, k) => {
          const cover = addCover(b.el.querySelector(".capWrap"), b.n, {});
          cover.style.opacity = "0"; cover.style.transform = "translateY(-16px) rotate(-5deg)";
          cover.style.transition = "transform .5s ease, opacity .5s ease";
          setTimeout(() => { cover.style.opacity = "1"; cover.style.transform = ""; }, 300 + k * 520);
        });
      }
      const delay = 500 + tampered.length * 520 + 500;
      setTimeout(() => {
        say.textContent = T.ui.jDone; pet.src = "art/shunyi-rest.png";   // 趴着·晚安
        const btn = $("nbClose"); const prev = T.ui.nbClose; btn.style.display = ""; btn.textContent = T.ui.jClose;
        btn.onclick = () => { btn.onclick = null; btn.textContent = prev; tray.remove(); say.classList.remove("on"); journalActive = false; resolve(); };
      }, delay);
    }
  });
}

function applyNightEdits(day) {
  if (!day.edits) return;
  day.edits.forEach(e => {
    const n = state.notes.find(x => x.id === e.id);
    if (!n) return;
    if (e.del) { n.deleted = true; }
    if (e.rewrite) { n.cur = e.rewrite; }
  });
}

/* ══ 夜 · 向顺意汇报 ═══════════════════════════════════════════ */
function sLine(text) { const el = document.createElement("div"); el.className = "sLine"; $("nLog").appendChild(el); $("nLog").scrollTop = 9e9; return typeInto(el, text, 30).then(() => $("nLog").scrollTop = 9e9); }
function meLine(text) { const el = document.createElement("div"); el.className = "meLine"; $("nLog").appendChild(el); $("nLog").scrollTop = 9e9; return typeInto(el, text, 12).then(() => $("nLog").scrollTop = 9e9); }

let wheelResolve = null, inputResolve = null;
async function startNight() {
  const d = T.days[state.dayIdx];
  show("scrNight");
  $("nLog").innerHTML = ""; $("nWheel").innerHTML = ""; $("nInput").value = "";
  state.nightTurns = [];   // 今晚与顺意的对话历史(喂给 API,让它顺着聊)
  $("nInput").placeholder = T.ui.nInputPh;
  setLatency(false);
  $("sleepBtn").classList.remove("on");
  state.nightBusy = true;
  for (const beat of d.night) {
    if (beat.sys) { await wait(600); sfx.soothe(); await sLine(echoize(beat.sys)); }
    else if (beat.forget) { await showForget(beat.forget); }
    else if (beat.input) { await freeInput(); }
    else if (beat.wheel) { await wheelChoice(beat); }
  }
  // 篡改已在夜聊前的「整理剪贴本」阶段发生(nightBtn 里 applyNightEdits)
  state.nightBusy = false;
  $("sleepBtn").classList.add("on");
}
function freeInput() { return new Promise(res => { inputResolve = res; $("nInput").focus(); }); }
function doSend() {
  const raw = $("nInput").value.trim();
  if (!raw) return;
  const cleaned = raw.replace(/[?？]/g, LANG === "zh" ? "。" : ".");
  const optimized = cleaned !== raw;
  $("nInput").value = "";
  sfx.blip();
  state.history.push(raw);
  meLine(cleaned).then(() => {
    if (optimized) showToast(T.ui.optimized);
    if (inputResolve) {   // 自由汇报:顺意真调 /api/oracle(Claude)回你,再往下走
      const r = inputResolve; inputResolve = null;
      $("nInput").disabled = true;
      (async () => {
        await wait(500);
        const reply = await askOracle(cleaned);
        (state.nightTurns || (state.nightTurns = [])).push({ role: "user", content: cleaned }, { role: "assistant", content: reply });
        sfx.soothe(); await sLine(reply);
        $("nInput").disabled = false; await wait(300); r();
      })();
      return;
    }
    if (wheelResolve) { const r = wheelResolve; wheelResolve = null; r(); return; }
  });
}
// 夜聊上下文:把今晚的案子、她今天记下的线索、以及要暗中导向的方向喂给顺意,让它像助手一样梳理+带节奏
function nightCtx() {
  const d = T.days[state.dayIdx] || {};
  const clues = state.notes.filter(n => n.day === state.dayIdx + 1).map(n => n.orig || n.cur).filter(Boolean);
  return { case: d.brief || "", clues, steer: d.nightSteer || "" };
}
// 顺意的实时回复:调 /api/oracle(key 只在服务器端),带对话历史+上下文;任何失败都回退静态文案池,离线也能玩
async function askOracle(userText) {
  try {
    const r = await fetch("/api/oracle", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: userText, lang: LANG, history: state.nightTurns || [], ctx: nightCtx() }) });
    if (!r.ok) throw 0;
    const d = await r.json();
    const t = ((d && d.reply) || "").trim();
    if (!t) throw 0;
    return t;
  } catch (e) {
    return T.nightFree.pool[state.poolIdx++ % T.nightFree.pool.length];
  }
}
function showToast(txt) {
  $("nToast").textContent = txt; $("nToast").classList.add("on");
  clearTimeout(showToast._t); showToast._t = setTimeout(() => $("nToast").classList.remove("on"), 1600);
}
$("nSend").addEventListener("click", doSend);
$("nInput").addEventListener("keydown", e => { if (e.key === "Enter") doSend(); });
// 问号实时封锁:夜聊里根本打不出问号(结局 B 才解锁)
$("nInput").addEventListener("input", () => {
  const el = $("nInput");
  if (/[?？]/.test(el.value)) {
    el.value = el.value.replace(/[?？]/g, LANG === "zh" ? "。" : ".");
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
    sfx.ask();
    showToast(T.ui.optimized);
  }
});

function wheelChoice(beat) {
  return new Promise(res => {
    const host = $("nWheel");
    host.innerHTML = "";
    beat.wheel.forEach(txt => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = txt;
      b.addEventListener("click", async () => { host.innerHTML = ""; sfx.soothe(); nudgeBlind(6); await meLine(txt); res(); });
      host.appendChild(b);
    });
    let holdTimer = null, qShown = false;
    const showQ = () => {
      if (qShown) return; qShown = true;
      const q = document.createElement("button");
      q.className = "btn qBtn";
      q.textContent = "?";
      q.addEventListener("click", async () => { host.innerHTML = ""; sfx.ask(); nudgeBlind(-12); state.askUsedTonight = true; await meLine(T.ui.qWhy); await wait(700); sfx.soothe(); await sLine(beat.qReply); res(); });
      host.appendChild(q);
    };
    host.querySelectorAll(".btn").forEach(b => {
      b.addEventListener("mousedown", () => { holdTimer = setTimeout(showQ, 500); });
      b.addEventListener("mouseup", () => clearTimeout(holdTimer));
      b.addEventListener("mouseleave", () => clearTimeout(holdTimer));
    });
  });
}
$("sleepBtn").addEventListener("click", () => {
  $("sleepBtn").classList.remove("on");
  startDay(state.dayIdx + 1);   // 整理剪贴本已在夜聊之前完成,睡直接进第二天
});

/* ══ 终局(四层底) ════════════════════════════════════════════ */
async function startFinale() {
  await trans(T.ui.transVault, 1500);
  show("scrFinale");
  $("fLog").innerHTML = "";
  $("fStamps").classList.remove("on");
  $("fArch").textContent = T.ui.archOk; $("fArch").classList.remove("err");
  const F = T.finale;
  setImg("fBg", "summon");   // 11《神谕》水面浮现
  flashGold();
  await gLineFx(F.summon);
  await wait(600);
  setImg("fBg", "duel");     // 12《问题》问号植物
  for (const turn of F.duel) {
    await meLineF(turn.q);
    await wait(500);
    await crash();
    sfx.soothe();
    await gLine(turn.a);
    await wait(500);
  }
  await wait(600);
  await printE001(F.e001);
  await wait(500);
  if (F.recognize) await gLine(F.recognize);   // 神谕:你想起来了
  await meLineF("……");
  await gLine(F.notebookDiff);
  await wait(700);
  renderNotebook(true);
  $("notebook").classList.add("on");
  await waitClick($("nbClose"));
  $("notebook").classList.remove("on");
  // 选择后果:整局的顺从/诚实,到这里被神谕点破
  if (state.blindness >= 66) { await gLine(F.reflect.high); await wait(500); }
  else if (state.blindness <= 33) { await gLine(F.reflect.low); await wait(500); }
  await gLine(F.lastWords);
  await wait(600);
  await freezeMoment();
  $("fStamps").classList.add("on");
}
function gLine(text) { const el = document.createElement("div"); el.className = "gLine"; $("fLog").appendChild(el); $("fLog").scrollTop = 9e9; return typeInto(el, text, 30).then(() => $("fLog").scrollTop = 9e9); }
function gLineFx(text) { const el = document.createElement("div"); el.className = "fxLine"; $("fLog").appendChild(el); $("fLog").scrollTop = 9e9; return typeInto(el, text, 24).then(() => $("fLog").scrollTop = 9e9); }
function meLineF(text) { const el = document.createElement("div"); el.className = "meLine"; $("fLog").appendChild(el); $("fLog").scrollTop = 9e9; return typeInto(el, text, 16).then(() => $("fLog").scrollTop = 9e9); }
async function crash() {
  sfx.crash();
  $("fArch").textContent = T.finale.crash; $("fArch").classList.add("err");
  $("crashFx").textContent = T.finale.crash;
  $("crashFx").classList.add("on");
  await wait(600);
  $("crashFx").classList.remove("on");
  $("fArch").textContent = T.ui.archReconnect;
  await wait(300);
  $("fArch").textContent = T.ui.archOk; $("fArch").classList.remove("err");
}
async function printE001(e) {
  $("printFx").classList.add("on");
  setImg("printBg", "e001");   // 13《E-001》蜡笔空白气泡
  $("printTitle").textContent = e.title;
  const host = $("printLines"); host.innerHTML = "";
  $("printSign").textContent = "";
  for (const l of e.lines) {
    const el = document.createElement("div");
    host.appendChild(el);
    await typeInto(el, l, 22);
    await wait(200);
  }
  await wait(600);
  sfx.thunk();
  await typeInto($("printSign"), e.sign, 90);
  await wait(1600);
  const af = document.createElement("div");
  af.style.cssText = "font:400 11px/1.8 'IBM Plex Mono',monospace;color:#8a6a5a;margin-top:14px";
  host.appendChild(af);
  await typeInto(af, e.after, 18);
  await wait(2400);
  await waitClickAnywhere($("printFx"));
  $("printFx").classList.remove("on");
}
async function freezeMoment() { $("freezeFx").classList.add("on"); await new Promise(r => setTimeout(r, 550)); $("freezeFx").classList.remove("on"); }
function waitClick(el) { return new Promise(res => { const h = () => { el.removeEventListener("click", h); res(); }; el.addEventListener("click", h); }); }
function waitClickAnywhere(el) { return new Promise(res => { const h = () => { el.removeEventListener("click", h); res(); }; el.addEventListener("click", h); }); }

document.querySelectorAll("#fStamps .stampBtn").forEach(btn => {
  btn.addEventListener("click", () => { if (!$("fStamps").classList.contains("on")) return; $("fStamps").classList.remove("on"); sfx.thunk(); ending(btn.dataset.k); });
});

/* ══ 结局 ══════════════════════════════════════════════════════ */
/* ── 结尾摄像头破局:你做的"掉饱和→溶入"过场 → 实时真人冷镜 ─────── */
let mirrorStream = null;
// 一开始(点「开始/继续」时)就请求摄像头权限,而不是拖到 End B 才问。拒绝也不影响正常游玩,只是结局镜子不亮。
async function preRequestCamera() {
  if (mirrorStream || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  try { mirrorStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); }
  catch (e) { mirrorStream = null; }
}
function loadRupture() {   // 有 art/mirror-break.mp4 才用你的过场,否则回退 CSS 掉饱和
  const fx = $("ruptureFx"); if (!fx) return Promise.resolve(false);
  return new Promise(res => {
    let done = false; const fin = r => { if (!done) { done = true; res(r); } };
    fx.onloadeddata = () => fin(true);
    fx.onerror = () => fin(false);
    fx.src = "art/mirror-break.mp4";
    setTimeout(() => fin(false), 4000);
  });
}
function keyGreen(d) {   // 绿幕→透明:绿色主导的像素 alpha 归零
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (g > 88 && g > r * 1.35 && g > b * 1.35) d[i + 3] = 0;
  }
}
async function revealCamera() {
  const v = $("mirrorCam"); if (!v) return false;
  if (!mirrorStream) {                      // 开局已请求过;若当时没拿到(或没请求)再补一次
    try { mirrorStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); }
    catch (err) { return false; }          // 拒绝授权 → 镜子不亮
  }
  v.srcObject = mirrorStream; await v.play().catch(() => {});
  const fx = $("ruptureFx"), cv = $("ruptureCanvas");
  if (await loadRupture()) {               // —— 你的绿幕过场:实时抠绿,绿处露出摄像头 ——
    v.style.transition = "opacity .7s ease"; v.classList.add("on");   // 摄像头快速亮起(藏在绿幕后)
    const W = Math.min(fx.videoWidth || 960, 900);
    const H = Math.round(W * ((fx.videoHeight || 540) / (fx.videoWidth || 960)));
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    cv.classList.add("on");
    fx.muted = false;
    try { await fx.play(); } catch (e) { fx.muted = true; await fx.play().catch(() => {}); }
    let running = true;
    const draw = () => {
      if (!running) return;
      try { ctx.drawImage(fx, 0, 0, W, H); const im = ctx.getImageData(0, 0, W, H); keyGreen(im.data); ctx.putImageData(im, 0, 0); } catch (e) {}
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    await new Promise(res => { fx.onended = res; setTimeout(res, 20000); });   // 放完(或超时)
    running = false;                       // 定格最后一帧:画的镜框留住,绿窗里仍是你实时的脸
    await new Promise(r => setTimeout(r, 300));
  } else {                                 // —— 回退:CSS 掉饱和 ——
    $("endBg").classList.add("drain");
    await new Promise(r => setTimeout(r, 350));
    v.classList.add("on");
    await new Promise(r => setTimeout(r, 2600));
  }
  return true;
}
async function ending(key) {
  const e = T.endings[key];
  await trans(key === "A" ? "✓" : "?", 1500);
  show("scrEnd");
  setImg("endBg", key === "A" ? "end-a" : "end-b");   // 结局A晚祷 / 结局B镜子
  $("endTitle").textContent = e.title;
  $("endBody").innerHTML = "";
  $("endInputRow").style.display = "none";
  $("endLocked").style.display = "none";
  $("endTag").textContent = "";
  $("endRestart").style.display = "none";

  for (const l of e.lines) {
    const p = document.createElement("div");
    if (isFx(l)) p.className = "fx";
    $("endBody").appendChild(p);
    await typeInto(p, l, 28);
    await wait(450);
  }

  if (key === "A") {
    await wait(500);
    const row = $("endInputRow"); row.style.display = "flex";
    for (const ch of e.autoType) { $("endInput").value += ch; await wait(80); }
    await wait(500);
    $("endSend").classList.add("self");
    sfx.soothe();
    await wait(600);
    $("endInput").value = ""; row.style.display = "none";
    const pc = document.createElement("div"); pc.className = "hang";
    $("endBody").appendChild(pc);
    await typeInto(pc, T.ui.postCreditPrefix + e.postCredit, 26);
    await wait(400);
    const lk = $("endLocked"); lk.style.display = "flex";
    e.locked.forEach(t => { const b = document.createElement("button"); b.className = "btn"; b.textContent = t; lk.appendChild(b); });
  } else {
    const hint = document.createElement("div"); hint.style.cssText = "font:400 10px 'IBM Plex Mono',monospace;letter-spacing:.2em;color:rgba(201,164,74,.5)";
    hint.textContent = e.inputHint;
    $("endBody").appendChild(hint);
    const row = $("endInputRow"); row.style.display = "flex";
    $("endInput").value = ""; $("endInput").placeholder = T.ui.wantPh; $("endInput").focus();
    await new Promise(res => {
      const go = () => { const v = $("endInput").value.trim(); if (!v) return; sfx.ask(); res(v); };
      $("endSend").onclick = go;
      $("endInput").onkeydown = ev => { if (ev.key === "Enter") go(); };
    }).then(async v => {
      row.style.display = "none";
      const hang = document.createElement("div"); hang.className = "hang";
      $("endBody").appendChild(hang);
      hang.textContent = "「 " + v + " 」";
      await wait(1600);
      // —— 摄像头破局:画的镜子 → 真人冷镜 ——
      const seen = await revealCamera();
      { const p = document.createElement("div"); p.className = "fx"; $("endBody").appendChild(p); await typeInto(p, seen ? e.camReveal : e.camDenied, 30); await wait(700); }
      if (!seen) $("scrEnd").classList.add("mirrorDark");
      const ml = seen ? (state.blindness >= 66 ? e.mirrorHigh : (state.blindness <= 33 ? e.mirrorLow : null)) : null;
      if (ml) { const p = document.createElement("div"); $("endBody").appendChild(p); await typeInto(p, ml, 28); await wait(450); }
      for (const l of e.after) {
        const p = document.createElement("div");
        $("endBody").appendChild(p);
        await typeInto(p, l, 28);
        await wait(450);
      }
      const rep = document.createElement("div"); rep.className = "fx";
      $("endBody").appendChild(rep);
      await typeInto(rep, e.report, 24);
    });
  }
  await wait(600);
  await typeInto($("endTag"), e.tag, 30);
  await wait(400);
  // 结尾镜盲读数(整局顺从的代价,一个数字)
  const bl = document.createElement("div"); bl.id = "endBlind";
  bl.textContent = T.ui.blind + " " + Math.round(state.blindness) + "%";
  $("endBody").appendChild(bl);
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}   // 通关清档
  $("endRestart").style.display = "block";
}
$("endRestart").addEventListener("click", () => location.reload());

/* ══ 语言切换 + 入口 ═══════════════════════════════════════════ */
document.querySelectorAll(".langBtn").forEach(b => {
  b.addEventListener("click", () => setLang(b.dataset.lang));
});
let saved = "zh";
try { saved = localStorage.getItem("sm-lang") || "zh"; } catch (e) {}
setLang(saved);
refreshMenu();

$("startBtn").addEventListener("click", async () => { au(); preRequestCamera(); try { localStorage.removeItem(SAVE_KEY); } catch (e) {} show("scrBoot"); await showPrologue(); boot(); });
$("continueBtn").addEventListener("click", () => { au(); preRequestCamera(); if (hasSave()) loadGame(); });

/* ══ DEV 调试跳转面板(仅 ?dev,玩家看不到)═══════════════════════
   在网址后加 ?dev 即可,例如  …/game/?dev  。一键跳到任意环节,免得每次从头跑。 */
function devSceneNote(s) {                       // 场景的线索:优先场景级 note,否则取 fork 选项里的 note(盘问线索)
  if (s.note) return s.note;
  let found = null;
  (s.beats || []).forEach(bt => { if (bt.fork) { const o = (bt.fork.ask && bt.fork.ask.note) || (bt.fork.soothe && bt.fork.soothe.note); if (o) found = o; } });
  return found;
}
function devSeedNotes(dayIdx) {                 // 把某天的线索直接记进笔记本(供剪贴本/夜聊/终局用)
  state.dayIdx = dayIdx;
  const d = T.days[dayIdx]; if (!d) return;
  d.scenes.forEach(s => { const nt = devSceneNote(s); if (nt) recordNote(s.id, nt); });
  if (T.communityMap && T.communityMap.leaveNote) recordNote("community", T.communityMap.leaveNote);
}
function devSeedAll() { T.days.forEach((d, i) => { devSeedNotes(i); applyNightEdits(d); }); }
function buildDevPanel() {
  if (!DEV) return;
  const style = document.createElement("style");
  style.textContent =
    "#devPanel{position:fixed;left:8px;top:8px;z-index:99999;background:rgba(18,20,24,.93);border:1px solid #3a4048;border-radius:8px;padding:8px 9px;font:600 11px/1.3 'IBM Plex Mono',monospace;color:#cfd6de;box-shadow:0 6px 18px rgba(0,0,0,.55);max-width:216px}" +
    "#devPanel .dpH{color:#7fd1a8;letter-spacing:.1em;margin-bottom:7px;display:flex;justify-content:space-between;gap:10px;cursor:pointer;user-select:none}" +
    "#devPanel.min .dpBody{display:none}#devPanel.min .dpH{margin:0}" +
    "#devPanel .dpRow{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:5px}" +
    "#devPanel .dpRow:last-child{margin-bottom:0}" +
    "#devPanel .dpTag{color:#8891a0;font-weight:400}" +
    "#devPanel button{font:600 10px 'IBM Plex Mono',monospace;color:#e2e8ef;background:#2a2f36;border:1px solid #474e57;border-radius:5px;padding:4px 8px;cursor:pointer}" +
    "#devPanel button:hover{background:#39424b;border-color:#6d7784}" +
    "#devPanel select{font:600 10px 'IBM Plex Mono',monospace;background:#2a2f36;color:#e2e8ef;border:1px solid #474e57;border-radius:5px;padding:3px 4px}";
  document.head.appendChild(style);
  const p = document.createElement("div"); p.id = "devPanel";
  p.innerHTML =
    "<div class='dpH'><span>◆ DEV 跳转</span><span>▁ 折叠</span></div>" +
    "<div class='dpBody'>" +
      "<div class='dpRow'><span class='dpTag'>整天:</span>" +
        "<button data-a='day' data-d='0'>D1</button><button data-a='day' data-d='1'>D2</button><button data-a='day' data-d='2'>D3</button></div>" +
      "<div class='dpRow'><span class='dpTag'>选第</span>" +
        "<select id='dpDay'><option value='0'>1</option><option value='1'>2</option><option value='2'>3</option></select>" +
        "<span class='dpTag'>天,跳到:</span></div>" +
      "<div class='dpRow'><button data-a='comm'>社区</button><button data-a='journal'>剪贴本</button><button data-a='night'>夜聊·API</button></div>" +
      "<div class='dpRow'><span class='dpTag'>终局:</span><button data-a='finale'>机房</button><button data-a='endA'>结局A</button><button data-a='endB'>结局B</button></div>" +
      "<div class='dpRow'><span class='dpTag'>语言:</span><button data-a='lang' data-l='zh'>中</button><button data-a='lang' data-l='en'>EN</button></div>" +
    "</div>";
  document.body.appendChild(p);
  const clearAll = () => { document.querySelectorAll(".scr").forEach(s => s.classList.remove("on")); ["notebook", "introCard", "prologue", "trans", "halfBeat"].forEach(id => { const e = $(id); if (e) e.classList.remove("on"); }); $("filePanel").classList.remove("on"); $("commPop").classList.remove("on"); };
  const dpDay = () => parseInt($("dpDay").value, 10) || 0;
  p.querySelector(".dpH").addEventListener("click", () => p.classList.toggle("min"));
  p.addEventListener("click", async (ev) => {
    const b = ev.target.closest("button[data-a]"); if (!b) return;
    au(); const a = b.dataset.a;
    if (a === "lang") { setLang(b.dataset.l); return; }
    if (a === "day") { clearAll(); startDay(parseInt(b.dataset.d, 10)); return; }
    const i = dpDay(), d = T.days[i];
    if (a === "comm") { state.dayIdx = i; dayCommunity = d.scenes.filter(s => s.loc === "community"); commDone = dayCommunity.length === 0; commVisited = new Set(); clearAll(); openCommunityDay(); }
    else if (a === "journal") { devSeedNotes(i); applyNightEdits(d); clearAll(); $("notebook").classList.add("on"); await playJournal(i + 1); $("notebook").classList.remove("on"); startNight(); }
    else if (a === "night") { devSeedNotes(i); applyNightEdits(d); clearAll(); startNight(); }
    else if (a === "finale") { devSeedAll(); state.dayIdx = T.days.length - 1; clearAll(); startFinale(); }
    else if (a === "endA") { clearAll(); ending("A"); }
    else if (a === "endB") { clearAll(); ending("B"); }
  });
}
buildDevPanel();



















