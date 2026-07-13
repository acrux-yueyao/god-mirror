/* game.js — 《神谕之镜 / GOD SHIFT》灰盒 v5 引擎 · 中英双语
   标题选语言 → 开机伪装 → 三日调查(✓附和/?反问 + 夜间笔记本改写) → 机房终局(四层底) → 双结局 */

import { SCRIPT } from "./script.js?v=18";

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

function show(id) { document.querySelectorAll(".scr").forEach(s => s.classList.remove("on")); $(id).classList.add("on"); }
async function trans(text, hold = 1300) { $("transStamp").textContent = text; $("trans").classList.add("on"); sfx.thunk(); await wait(hold); $("trans").classList.remove("on"); }
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
    await showPrologue();  // 世界观序幕
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
    setImg("deskArt", "morning-" + d.n);   // 可选晨间背景,没有则回退深色桌面
    $("deskDate").textContent = d.date;
    $("deskCase").textContent = d.head;
    $("nightBtn").style.display = "none";
    dayCommunity = d.scenes.filter(s => s.loc === "community");
    commDone = dayCommunity.length === 0;
    commVisited = new Set();
    $("sceneGrid").classList.remove("on");
    if (d.morning) await playMorning(d);   // 晨间小场景:读案卷 → 盖章出勤
    revealCards(d);                        // 盖章后,调查点浮现
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
    const scene = $("deskScene"), objs = $("deskObjects"), screen = $("deskScreen"), file = $("deskFile"), stamp = $("deskStamp");
    const all = [screen, file, stamp];
    const setFocus = el => all.forEach(o => o.classList.toggle("focus", o === el));   // 只有"该点的"发光引导
    scene.classList.remove("gone");
    all.forEach(o => o.classList.remove("read", "used", "focus", "pressed"));
    stamp.classList.add("locked");
    objs.classList.remove("enter"); void objs.offsetWidth; objs.classList.add("enter");   // 重放入场动效
    // 三样物件都留美术槽:有 art/<name>.png 就用你画的,没有则回退 CSS/SVG 占位
    deskSlot("screenArt", screen.querySelector(".scrGlow"), "desk-screen");
    deskSlot("fileArt", file.querySelector(".fileTab"), "desk-file");
    deskSlot("stampArt", $("stampSvg"), "stamp");
    $("deskScreenText").textContent = "";
    screen.querySelector(".doTag").textContent = T.ui.deskScreenTag;
    file.querySelector(".doTag").textContent = T.ui.deskFileTag;
    stamp.querySelector(".doTag").textContent = m.stamp;
    $("deskHint").textContent = T.ui.deskHintMorning;
    let fileRead = false;
    screen.onclick = async () => {
      sfx.blip(); screen.classList.add("read", "used");
      if (!file.classList.contains("used")) setFocus(file);
      $("deskScreenText").textContent = ""; await typeInto($("deskScreenText"), m.screen, 22);
    };
    file.onclick = () => openFile(m.file);
    $("fileClose").onclick = async () => {
      $("filePanel").classList.remove("on");
      if (!fileRead) {
        fileRead = true; file.classList.add("used"); stamp.classList.remove("locked");
        setFocus(stamp); $("deskHint").textContent = T.ui.deskHintGo;
        await typeInto($("deskPov"), m.afterFile, 16);
      }
    };
    stamp.onclick = async () => {
      if (stamp.classList.contains("locked")) { sfx.ask(); if (!file.classList.contains("used")) setFocus(file); await typeInto($("deskPov"), T.ui.deskNudge, 16); return; }
      stamp.onclick = null; setFocus(null);
      stamp.classList.add("pressed", "used"); sfx.thunk();
      await wait(240); stamp.classList.remove("pressed");
      await typeInto($("deskPov"), m.stamped, 16);
      await wait(500);
      scene.classList.add("gone");
      resolve();
    };
    await typeInto($("deskPov"), m.intro, 16);
    setFocus(screen);   // 引导从顺意屏开始
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
  d.scenes.filter(s => s.loc !== "community").forEach(sc => {
    const card = mkCard({ id: sc.id, name: sc.title, sub: sc.sub });
    card.addEventListener("click", () => { if (!card.classList.contains("done")) openScene(sc, card); });
    grid.appendChild(card);
  });
  if (dayCommunity.length) {
    const cm = T.communityMap;
    const hub = mkCard({ id: "community-hub", name: cm.title, sub: cm.sub, hub: true });
    hub.addEventListener("click", () => { commMapCard = hub; openCommunityDay(); });
    grid.appendChild(hub);
  }
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
function openScene(sc, card) {
  curScene = sc; curCard = card;
  show("scrScene");
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
  if (curScene.kind === "watch") {
    el.textContent = curScene._fromMap ? T.ui.returnComm : T.ui.watchNote;
    el.onclick = () => {
      if (!sceneLogged && curScene.note) { recordNote(curScene.id, curScene.note); sceneLogged = true; }
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
    const dotFallback = () => {
      const dot = document.createElement("div");
      dot.className = "hotspot enter" + (commVisited.has(sc.id) ? " visited" : "");
      dot.style.left = (sc.x != null ? sc.x : 50) + "%"; dot.style.top = (sc.y != null ? sc.y : 50) + "%";
      dot.addEventListener("click", () => enterHouse(sc));
      host.appendChild(dot);
    };
    if (sc.cut) {
      const c = sc.cut;
      const im = document.createElement("img");
      im.className = "houseCut" + (commVisited.has(sc.id) ? " visited" : "");
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
    } else dotFallback();
  });
  // 看一眼的窗 = 社区氛围
  cm.ambient.forEach(h => {
    const dot = document.createElement("div");
    dot.className = "hotspot" + (commVisited.has(h.id) ? " visited" : "");
    dot.style.left = h.x + "%"; dot.style.top = h.y + "%";
    dot.addEventListener("click", () => { $("commPopText").textContent = h.text; $("commPop").classList.add("on"); commVisited.add(h.id); dot.classList.add("visited"); });
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
    if (opt.note) { recordNote(curScene.id, opt.note); sceneLogged = true; if (curCard) curCard.classList.add("done"); }
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
  const directDone = d.scenes.filter(s => s.loc !== "community").every(sc => { const c = document.querySelector('.sceneCard[data-id="' + sc.id + '"]'); return c && c.classList.contains("done"); });
  if (directDone && commDone) {
    if (d.night) { $("nightBtn").style.display = "block"; $("deskHint").textContent = T.ui.hintNight; }
    else { startFinale(); }
  }
}
$("nightBtn").addEventListener("click", () => startNight());

/* ══ 笔记本(可被夜间改写) ════════════════════════════════════ */
function hashId(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
const CLUE_TINTS = ["#f3ead2", "#efe4cc", "#f5ecd6", "#eae1c6", "#f1e6cf", "#eee7d6"];
// 线索 id → 你上传的物件图(没映射的默认找 clue-<id>.png)
const CLUE_IMG = {
  "s1-elevator": "film-close",       // 撕开一角的防镜膜
  "s1-granny": "s1-granny-shard",    // 掌心大的碎镜片
  "s1-laoning": "s1-laoning-cloth",  // 盖着脸的红布
  "s2-archive": "s2-archive-log",    // 41 条同样的记录
  "s2-shadow": "s2-shadow-figure"    // 反光里的金红人影
};
/* 剪贴本:每条线索=贴上去的一张;顺意的篡改=盖在上面的印刷便利贴(可撕开露出你的原文) */
function renderNotebook(showDiff = false) {
  const list = $("nbList"); list.innerHTML = "";
  let lastDay = null;
  state.notes.forEach(n => {
    if (n.day !== lastDay) {
      lastDay = n.day;
      const dv = document.createElement("div"); dv.className = "dayDivider";
      dv.textContent = (T.days[n.day - 1] ? T.days[n.day - 1].date : "D" + n.day);
      list.appendChild(dv);
    }
    const h = hashId(n.id);
    const clue = document.createElement("div"); clue.className = "clue"; clue.dataset.id = n.id;
    clue.style.background = CLUE_TINTS[h % CLUE_TINTS.length];
    clue.style.transform = "rotate(" + ((h % 7) - 3) + "deg)";
    const obj = document.createElement("img"); obj.className = "clueObj"; obj.alt = "";   // 物件美术槽
    obj.onload = () => obj.style.display = "block"; obj.onerror = () => {};
    obj.src = "art/" + (CLUE_IMG[n.id] || ("clue-" + n.id)) + ".png";
    clue.appendChild(obj);
    const txt = document.createElement("div"); txt.className = "clueText"; txt.textContent = n.orig;   // 底=你的原文
    clue.appendChild(txt);
    const day = document.createElement("div"); day.className = "clueDay"; day.textContent = "D" + n.day; clue.appendChild(day);
    if (n.deleted || n.orig !== n.cur) {          // 顺意动过手 → 盖一张更正
      const cover = document.createElement("div");
      cover.className = "cover " + (n.deleted ? "torn" : "sticky");
      const tag = document.createElement("div"); tag.className = "tag";
      tag.textContent = n.deleted ? T.ui.nbForgot : T.ui.nbOptimized; cover.appendChild(tag);
      if (!n.deleted) { const ct = document.createElement("div"); ct.textContent = n.cur; cover.appendChild(ct); }
      const corner = document.createElement("div"); corner.className = "peelCorner"; cover.appendChild(corner);
      cover.title = T.ui.peelClue;
      cover.addEventListener("click", () => { cover.classList.add("peeled"); sfx.ask(); });
      if (showDiff) cover.classList.add("peeled");   // 结局:全撕开,露出真相
      clue.appendChild(cover);
    }
    list.appendChild(clue);
  });
  $("nbFoot").textContent = showDiff ? T.ui.nbFootDiff : (state.dayIdx >= 1 ? T.ui.nbFoot : "");
  const bg = $("nbBg");   // 忘掉(擦白)↔ 归还(飞纸):底层记忆图
  if (bg) { bg.style.display = "none"; bg.onload = () => bg.style.display = "block"; bg.onerror = () => bg.style.display = "none"; bg.src = "art/" + (showDiff ? "diff" : "forget") + ".png"; }
}
$("noteBtn").addEventListener("click", () => { renderNotebook(false); $("notebook").classList.add("on"); });
$("nbClose").addEventListener("click", () => $("notebook").classList.remove("on"));

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

let wheelResolve = null;
async function startNight() {
  const d = T.days[state.dayIdx];
  show("scrNight");
  $("nLog").innerHTML = ""; $("nWheel").innerHTML = ""; $("nInput").value = "";
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
  applyNightEdits(d);
  state.nightBusy = false;
  $("sleepBtn").classList.add("on");
}
function freeInput() { return new Promise(res => { wheelResolve = res; $("nInput").focus(); }); }
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
    if (wheelResolve) { const r = wheelResolve; wheelResolve = null; r(); return; }
    (async () => { await wait(400); const reply = await askOracle(cleaned); sfx.soothe(); await sLine(reply); })();
  });
}
// 顺意的实时回复:调 /api/oracle(key 只在服务器端);任何失败都回退静态文案池,离线也能玩
async function askOracle(userText) {
  try {
    const r = await fetch("/api/oracle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: userText, lang: LANG }) });
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
$("sleepBtn").addEventListener("click", () => { $("sleepBtn").classList.remove("on"); startDay(state.dayIdx + 1); });

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
  try { mirrorStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); }
  catch (err) { return false; }            // 拒绝授权 → 镜子不亮
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

$("startBtn").addEventListener("click", () => { au(); try { localStorage.removeItem(SAVE_KEY); } catch (e) {} show("scrBoot"); boot(); });
$("continueBtn").addEventListener("click", () => { if (hasSave()) loadGame(); });
