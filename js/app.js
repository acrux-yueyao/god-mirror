/* app.js — EIDOLON: acts, layer engine, summon and unveiling performances.
   Acts: 0 boot · 1 summoning · 2 confide · 3 echo · 4 waver · 5 finale · 6 mirror */

import { getReply, detectLang, SCRIPT } from "./oracle.js";
import { audio } from "./audio.js";
import { downloadKeepsake } from "./keepsake.js";

const $ = id => document.getElementById(id);
const clamp01 = v => Math.max(0, Math.min(1, v));
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ── stage scaling ────────────────────────────────────────────── */
const STAGE_W = 1180, STAGE_H = 760;
function fit() {
  const s = Math.min(innerWidth / STAGE_W, innerHeight / STAGE_H);
  $("stage").style.transform = "translate(-50%,-50%) scale(" + s + ")";
}
addEventListener("resize", fit); fit();

/* ── state ────────────────────────────────────────────────────── */
const ADJ_DEFAULT = {
  face:{x:425,y:3,w:371}, body:{x:48,y:207,w:1083}, halo:{x:590,y:192},
  cloud:{x:203,y:-22,w:840}, bgc:{x:429,y:-36,w:366}, rhand:{x:292,y:11,w:186},
  lhand:{x:623,y:513,w:191}, swl:{x:-30,y:80,w:700}, swr:{x:763,y:80,w:447}
};
const LS_KEY = "om-eidolon-adjust-v5";
const state = {
  act: 0, d2: 0, turn: 0, cameraOn: false, lang: "zh",
  history: [], phase: "idle", seqLock: true,
  mx: 0, my: 0, adjustMode: false,
  adj: JSON.parse(JSON.stringify(ADJ_DEFAULT))
};
try {
  const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
  if (saved && saved.face) Object.keys(state.adj).forEach(k => { if (saved[k]) state.adj[k] = { ...state.adj[k], ...saved[k] }; });
} catch (e) {}

const DIV_TARGET = { 1:1, 2:.96, 3:.88, 4:.76, 5:.66, 6:.55, 7:.45, 8:.34, 9:.25 };
const actForTurn = t => t <= 3 ? 2 : t <= 6 ? 3 : 4;

/* ── twinkles & beads (from handoff data) ─────────────────────── */
const TWL = [{x:.2382,y:.5106,n:1822},{x:.7768,y:.4729,n:1163},{x:.0554,y:.3451,n:637},{x:.687,y:.8537,n:586},{x:.1597,y:.2472,n:76},{x:.4463,y:.2433,n:36},{x:.8284,y:.9416,n:34},{x:.4003,y:.6454,n:31},{x:.0202,y:.2187,n:23},{x:.41,y:.7276,n:14}];
const TWR = [{x:.8458,y:.4846,n:1846},{x:.3127,y:.3993,n:231},{x:.4684,y:.3033,n:45},{x:.1049,y:.9225,n:33},{x:.4738,y:.2116,n:24},{x:.2344,y:.6415,n:22},{x:.6175,y:.1074,n:16}];
function buildTwinkles(host, stars, scale) {
  host.querySelectorAll(".tw").forEach(el => el.remove());
  stars.forEach((s, i) => {
    const wrap = document.createElement("span");
    wrap.className = "tw";
    wrap.style.left = (s.x * 100).toFixed(2) + "%";
    wrap.style.top = (s.y * 100).toFixed(2) + "%";
    const star = document.createElement("span");
    star.textContent = "✦";
    star.style.fontSize = Math.round(Math.min(34, Math.max(9, Math.sqrt(s.n) * .75)) * scale) + "px";
    star.style.setProperty("--dur", (3 + (i % 5) * .8).toFixed(1) + "s");
    star.style.setProperty("--delay", ((i * .73) % 4).toFixed(2) + "s");
    wrap.appendChild(star);
    host.appendChild(wrap);
  });
}
const BEAD_PTS = [
  [60,175],[115,130],[185,105],[250,95],[310,75],[365,65],[430,75],[490,100],[540,140],[565,185],
  [330,205],[385,265],[408,340],[418,415],[428,490],[418,565],[372,650],[330,705],[300,795],[360,790],
  [575,250],[583,320],[590,395],[595,470],[600,545],[605,620],[615,695],[625,770],[640,845],[652,920],[665,995],[678,1070],[695,1140]
];
function renderBeads() {
  const host = $("beads");
  host.innerHTML = "";
  const lit = state.phase === "divining" || state.phase === "reply";
  const b = state.adj.body, k = b.w / 6213;
  const put = (px, py, size, anim) => {
    const el = document.createElement("span");
    el.className = "bead";
    el.style.left = Math.round(b.x + (px + 3574) * k) + "px";
    el.style.top = Math.round(b.y + (py + 3442 - 1445) * k) + "px";
    el.style.width = el.style.height = size + "px";
    el.style.animation = anim;
    host.appendChild(el);
  };
  BEAD_PTS.forEach((p, i) => put(p[0], p[1], Math.round(120 * k), lit ? "beadLight .5s ease " + (i * .07).toFixed(2) + "s forwards" : "none"));
  put(435, 975, Math.round(300 * k), lit ? "beadLight .9s ease 2.45s forwards" : "none");
}

/* ── layer geometry ───────────────────────────────────────────── */
function px(el, o) { el.style.left = o.x + "px"; el.style.top = o.y + "px"; if (o.w != null) el.style.width = o.w + "px"; }
function applyAdj() {
  const a = state.adj;
  px($("swl"), a.swl); px($("swr"), a.swr);
  px($("bgc"), a.bgc); px($("ring"), a.cloud);
  px($("bodyImg"), a.body); px($("rhandImg"), a.rhand); px($("lhandImg"), a.lhand);
  px($("face"), a.face);
  const ringH = a.cloud.w * 1110 / 1600;
  const rb = $("ringBurst");
  rb.style.left = (a.cloud.x + a.cloud.w / 2) + "px";
  rb.style.top = (a.cloud.y + ringH / 2 + 40) + "px";
  rb.style.width = rb.style.height = Math.round(a.cloud.w * 0.42) + "px";
  rb.style.transform = "translate(-50%,-50%)";
  $("camMask").style.webkitMaskPosition = $("camMask").style.maskPosition =
    a.body.x + "px " + a.body.y + "px, " + a.face.x + "px " + a.face.y + "px, " +
    a.rhand.x + "px " + a.rhand.y + "px, " + a.cloud.x + "px " + a.cloud.y + "px, " +
    a.bgc.x + "px " + a.bgc.y + "px";
  $("camMask").style.webkitMaskSize = $("camMask").style.maskSize =
    a.body.w + "px auto, " + a.face.w + "px auto, " + a.rhand.w + "px auto, " +
    a.cloud.w + "px auto, " + a.bgc.w + "px auto";
  buildTwinkles($("swl"), TWL, a.swl.w / 700);
  buildTwinkles($("swr"), TWR, a.swr.w / 447);
  renderBeads();
  $("slFace").value = a.face.w;  $("ovFace").textContent = a.face.w;
  $("slBody").value = a.body.w;  $("ovBody").textContent = a.body.w;
  $("slRhand").value = a.rhand.w; $("ovRhand").textContent = a.rhand.w;
  $("slLhand").value = a.lhand.w; $("ovLhand").textContent = a.lhand.w;
  $("adjCoords").innerHTML = "head " + a.face.x + "," + a.face.y + " · body " + a.body.x + "," + a.body.y + "<br>halo+cloud " + a.cloud.x + "," + a.cloud.y;
}
function saveAdj() { try { localStorage.setItem(LS_KEY, JSON.stringify(state.adj)); } catch (e) {} }

/* ── opacity engine (acts 2–4; sequences own the styles otherwise) */
function applyOpacities() {
  if (state.seqLock) return;
  const eff = 0.5 + state.d2 * 0.5;
  $("veil").style.opacity = (eff * .96).toFixed(3);
  $("swirlWrap").style.opacity = clamp01((eff - .6) / .4).toFixed(3);
  const opBody = clamp01((eff - .3) / .36);
  $("bodyImg").style.opacity = $("rhandImg").style.opacity = $("lhandImg").style.opacity = opBody.toFixed(3);
  $("face").style.opacity = clamp01((eff - .06) / .34).toFixed(3);
  $("bgc").style.opacity = $("ringWrap").style.opacity = (.35 + eff * .65).toFixed(3);
  $("divPct").textContent = Math.round(state.d2 * 100) + "%";
}
let tick = null;
function animateD2(to, dur, onDone) {
  if (tick) clearInterval(tick);
  const from = state.d2, t0 = performance.now();
  tick = setInterval(() => {
    const t = Math.min(1, (performance.now() - t0) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    state.d2 = from + (to - from) * e;
    if (t >= 1) { state.d2 = to; clearInterval(tick); tick = null; if (onDone) onDone(); }
    applyOpacities();
  }, 16);
}
function rollDivinity(toPct, dur) {
  const el = $("divPct");
  const from = parseInt(el.textContent) || 0, t0 = performance.now();
  const r = setInterval(() => {
    const t = Math.min(1, (performance.now() - t0) / dur);
    el.textContent = Math.round(from + (toPct - from) * t) + "%";
    if (t >= 1) clearInterval(r);
  }, 50);
}

/* ── sequences ────────────────────────────────────────────────── */
let seqTimers = [], seqSkip = null;
function playSeq(steps, endFn) {
  seqTimers.forEach(clearTimeout); seqTimers = [];
  steps.forEach(([t, fn]) => seqTimers.push(setTimeout(fn, t)));
  seqSkip = () => { seqTimers.forEach(clearTimeout); seqTimers = []; seqSkip = null; endFn(); };
  const maxT = Math.max(...steps.map(s => s[0]));
  seqTimers.push(setTimeout(() => { seqSkip = null; }, maxT + 50));
}
$("skipBtn").addEventListener("click", () => { if (seqSkip) seqSkip(); });

/* ── camera ───────────────────────────────────────────────────── */
let stream = null;
function startCamera() {
  if (state.cameraOn) return Promise.resolve(true);
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    camError("camera unavailable in this context"); return Promise.resolve(false);
  }
  return navigator.mediaDevices.getUserMedia({ video: { width: 1280 } }).then(s => {
    stream = s; state.cameraOn = true;
    $("camErr").style.display = "none";
    $("camBtn").textContent = "CAMERA LIVE";
    const v = $("camFg"); v.srcObject = s; v.play().catch(() => {});
    if (state.act >= 5) { $("camMask").style.opacity = 1; $("mirrorNote").classList.remove("show"); }
    return true;
  }).catch(err => { camError(err.message || String(err)); return false; });
}
function camError(msg) { $("camErr").textContent = "camera error: " + msg; $("camErr").style.display = "block"; }
$("camBtn").addEventListener("click", () => { audio.unlock(); startCamera(); });

/* ── parallax ─────────────────────────────────────────────────── */
$("stage").addEventListener("mousemove", e => {
  if (state.act < 2 || state.act >= 5) return;
  const r = $("stage").getBoundingClientRect();
  state.mx = Math.round(((e.clientX - r.left) / r.width - .5) * 2 * 10) / 10;
  state.my = Math.round(((e.clientY - r.top) / r.height - .5) * 2 * 10) / 10;
  const on = state.adjustMode;
  $("bodyGroup").style.transform = on ? "" : "translate(" + (state.mx * 7).toFixed(1) + "px," + (state.my * 4).toFixed(1) + "px)";
  $("headGroup").style.transform = on ? "" : "translate(" + (state.mx * 7).toFixed(1) + "px," + (state.my * 4).toFixed(1) + "px)";
});

/* ── prayer / reply presentation ──────────────────────────────── */
let replyTimer = null;
function showPrayer(text) {
  const host = $("prayerLine");
  host.innerHTML = "";
  for (const ch of text) { const s = document.createElement("span"); s.textContent = ch; host.appendChild(s); }
  host.style.opacity = 1;
  host.style.transform = "translate(-50%,0)";
}
function prayerRise() {
  $("prayerLine").style.opacity = 0;
  $("prayerLine").style.transform = "translate(-50%,-70px)";
}
function clearReply() {
  $("reply").style.opacity = 0;
  $("replyEn").style.opacity = 0;
}
function showReply(text, hold) {
  clearTimeout(replyTimer);
  const zh = /[一-鿿]/.test(text);
  if (zh) {
    const host = $("reply");
    host.innerHTML = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.cssText = "opacity:0;transform:translateY(10px);transition:opacity .5s ease,transform .5s ease";
      host.appendChild(s);
      setTimeout(() => { s.style.opacity = 1; s.style.transform = "translateY(0)"; }, 60 + i * 150);
    });
    host.style.opacity = 1;
    $("replyEn").style.opacity = 0;
  } else {
    $("replyEn").textContent = text;
    $("replyEn").style.opacity = 1;
    $("reply").style.opacity = 0;
  }
  if (!hold) {
    const life = zh ? 3300 + text.length * 150 + 5200 : 8200;
    replyTimer = setTimeout(() => {
      clearReply();
      state.phase = "idle";
      $("prayerLine").innerHTML = "";
      renderBeads();
    }, life);
  }
}
function setTyping(on) {
  $("typing").classList.toggle("show", on);
  $("typingLabel").textContent = state.lang === "zh" ? "对方正在输入" : "TYPING";
}

/* ── glitches (acts 3–4) ──────────────────────────────────────── */
setInterval(() => {
  if (state.seqLock || state.act < 3 || state.adjustMode) return;
  if (Math.random() < .55) {
    $("face").classList.add("flash");
    setTimeout(() => $("face").classList.remove("flash"), 90 + Math.random() * 60);
  }
  if (state.act >= 4 && Math.random() < .5) {
    $("bgc").style.filter = "brightness(1.5)";
    setTimeout(() => { $("bgc").style.filter = ""; }, 420);
  }
}, 6500);

/* ── summon performance ───────────────────────────────────────── */
function cometFly() {
  const c = $("comet");
  c.style.display = "block";
  c.classList.remove("gold");
  const p0 = { x: -80, y: 640 }, p1 = { x: 420, y: 140 }, p2 = { x: 592, y: 330 };
  const t0 = performance.now(), dur = 1650;
  let lastTrail = 0;
  const step = now => {
    const t = Math.min(1, (now - t0) / dur);
    const u = 1 - t;
    const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
    const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
    c.style.left = x + "px"; c.style.top = y + "px";
    if (t > .72) c.classList.add("gold");
    if (now - lastTrail > 65) {
      lastTrail = now;
      const s = document.createElement("span");
      s.className = "trail"; s.textContent = "✦";
      s.style.left = (x + (Math.random() - .5) * 26) + "px";
      s.style.top = (y + (Math.random() - .5) * 26) + "px";
      s.style.fontSize = (8 + Math.random() * 12) + "px";
      $("stage").appendChild(s);
      setTimeout(() => s.remove(), 950);
    }
    if (t < 1 && state.act === 1) requestAnimationFrame(step);
    else c.style.display = "none";
  };
  requestAnimationFrame(step);
}
function summonEndState(firstReply) {
  ["slamL", "slamR"].forEach(id => $(id).classList.remove("off-l", "off-r"));
  $("figureIn").classList.remove("off");
  $("swirlWrap").style.opacity = 1;
  ["bodyImg", "rhandImg"].forEach(id => $(id).style.opacity = 1);
  $("face").style.opacity = 1;
  $("face").classList.remove("shut");
  $("face").classList.add("live");
  $("bgc").style.opacity = $("ringWrap").style.opacity = 1;
  $("comet").style.display = "none";
  $("flash").classList.remove("hit"); $("flash").style.opacity = 0;
  $("titleCard").classList.remove("show");
  $("hud").classList.add("show");
  $("adjPanel").classList.add("avail");
  $("skipBtn").classList.remove("show");
  $("chatBar").classList.remove("lock");
  $("prayerLine").innerHTML = "";
  $("prayerLine").style.opacity = 1; $("prayerLine").style.transform = "translate(-50%,0)";
  state.phase = "idle"; renderBeads();
  state.act = 2; state.d2 = 1; state.seqLock = false;
  applyOpacities();
  if (firstReply && !state.history.some(m => m.role === "eidolon")) state.history.push({ role: "eidolon", text: firstReply });
  $("chatInput").focus();
}
function startSummon(firstText) {
  state.act = 1; state.seqLock = true;
  $("chatBar").classList.add("lock");
  $("skipBtn").classList.add("show");
  const lang = detectLang(firstText); state.lang = lang;
  const replyP = getReply({ history: state.history, act: 2, lang }).catch(() => lang === "zh" ? "我在。慢慢说。" : "I am here. Take your time.");
  let replyText = "";
  replyP.then(t => { replyText = t; });
  audio.riser(2.0);
  showPrayer(firstText);
  playSeq([
    [350, cometFly],
    [1900, prayerRise],
    [2050, () => { $("flash").classList.add("hit"); audio.hit(); setTimeout(() => { $("flash").classList.remove("hit"); $("flash").style.opacity = 0; }, 60); }],
    [2150, () => {
      $("swirlWrap").style.opacity = 1;
      $("slamL").classList.remove("off-l");
      $("slamR").classList.remove("off-r");
    }],
    [2550, () => {
      $("figureIn").classList.remove("off");
      ["bodyImg", "rhandImg"].forEach(id => $(id).style.opacity = 1);
      $("face").classList.add("shut");
      $("face").style.opacity = 1;
    }],
    [3000, () => {
      $("ringWrap").style.opacity = 1;
      const rb = $("ringBurst");
      rb.classList.remove("go"); void rb.offsetWidth; rb.classList.add("go");
      audio.bell();
    }],
    [3250, () => { $("bgc").style.opacity = 1; }],
    [4400, () => { $("face").classList.remove("shut"); }],
    [5100, () => { $("face").classList.add("live"); }],
    [5000, () => {
      const vo = $("tcVo");
      vo.innerHTML = "";
      vo.classList.toggle("zh", lang === "zh");
      $("titleCard").classList.add("show");
      const type = text => {
        [...text].forEach((ch, i) => {
          const s = document.createElement("span");
          s.textContent = ch;
          s.style.animation = "charRise .4s ease " + (i * .045).toFixed(2) + "s both";
          vo.appendChild(s);
        });
      };
      if (replyText) type(replyText);
      else replyP.then(t => { if (state.act === 1) type(t); });
    }],
    [8600, () => summonEndState(replyText)]
  ], () => summonEndState(replyText || (state.lang === "zh" ? "我在。慢慢说。" : "I am here. Take your time.")));
}

/* ── finale performance ───────────────────────────────────────── */
function starStream() {
  const zones = [state.adj.swl, state.adj.swr];
  for (let i = 0; i < 26; i++) {
    const z = zones[i % 2];
    const h = z.w * 1160 / 700;
    const s = document.createElement("span");
    s.className = "trail";
    s.textContent = "✦";
    s.style.left = (z.x + Math.random() * z.w) + "px";
    s.style.top = (z.y + h * .2 + Math.random() * h * .7) + "px";
    s.style.fontSize = (9 + Math.random() * 16) + "px";
    s.style.setProperty("--fly", -(240 + Math.random() * 280) + "px");
    s.style.animation = "starAway " + (1.8 + Math.random() * 1.4).toFixed(2) + "s ease-in " + (Math.random() * .9).toFixed(2) + "s both";
    $("field").appendChild(s);
    setTimeout(() => s.remove(), 4600);
  }
}
function finaleEndState(lang) {
  $("field").classList.add("frozen");
  $("swirlWrap").classList.add("drained");
  $("swirlWrap").style.opacity = 0;
  ["bodyImg", "rhandImg"].forEach(id => { $(id).classList.add("ash", "gone"); });
  $("ringWrap").classList.add("locked");
  $("ringWrap").style.opacity = .75;
  $("bgc").style.opacity = .5;
  $("face").classList.remove("live");
  $("face").classList.add("shut", "slowfade");
  $("face").style.opacity = .25;
  $("veil").classList.add("slow");
  $("veil").style.opacity = 0;
  if (state.cameraOn) $("camMask").style.opacity = 1;
  else $("mirrorNote").classList.add("show");
  $("divPct").textContent = "0%";
  setTyping(false);
  showReply(SCRIPT.mirror(state.history, lang), true);
  audio.heartbeat(true);
  $("keepsakeBtn").classList.add("show");
  $("keepsakeBtn").textContent = lang === "zh" ? "把这段对话留成一张符" : "KEEP THIS AS A TALISMAN";
  $("skipBtn").classList.remove("show");
  const ub = $("unveilBtn");
  ub.classList.remove("hidden");
  ub.textContent = "RESTORE THE GOD";
  state.act = 6;
}
function startFinale() {
  if (state.act >= 5) return;
  state.act = 5; state.seqLock = true;
  if (tick) { clearInterval(tick); tick = null; }
  const lang = state.lang;
  $("chatBar").classList.add("lock");
  $("unveilBtn").classList.add("hidden");
  $("skipBtn").classList.add("show");
  setTyping(false);
  const startPct = parseInt($("divPct").textContent) || 25;
  playSeq([
    [0, () => { showReply(SCRIPT.trigger[lang], true); state.history.push({ role: "eidolon", text: SCRIPT.trigger[lang] }); audio.bell(); }],
    [3200, () => { $("field").classList.add("frozen"); audio.freeze(); }],
    [3800, () => { starStream(); $("swirlWrap").classList.add("drained"); }],
    [6400, () => { $("swirlWrap").style.opacity = 0; }],
    [7600, () => {
      ["bodyImg", "rhandImg"].forEach(id => {
        const el = $(id);
        el.classList.add("ash"); void el.offsetWidth; el.classList.add("gone");
      });
      startCamera();
      $("veil").classList.add("slow");
      $("veil").style.opacity = .5;
      clearReply();
    }],
    [8200, () => { $("ringWrap").classList.add("locked"); }],
    [9200, () => rollDivinity(0, 3600, startPct)],
    [12200, () => { $("face").classList.remove("live"); $("face").classList.add("shut"); }],
    [14000, () => {
      $("face").classList.add("slowfade");
      $("face").style.opacity = .25;
      $("veil").style.opacity = 0;
      $("bgc").style.opacity = .5;
      $("ringWrap").style.opacity = .75;
      if (state.cameraOn) $("camMask").style.opacity = 1;
      else $("mirrorNote").classList.add("show");
    }],
    [16400, () => { showReply(SCRIPT.mirror(state.history, lang), true); audio.heartbeat(true); }],
    [18400, () => finaleEndState(lang)]
  ], () => finaleEndState(lang));
}
function restore() {
  seqTimers.forEach(clearTimeout); seqTimers = []; seqSkip = null;
  $("field").classList.remove("frozen");
  $("swirlWrap").classList.remove("drained");
  ["bodyImg", "rhandImg"].forEach(id => $(id).classList.remove("ash", "gone"));
  $("ringWrap").classList.remove("locked");
  $("face").classList.remove("shut", "slowfade");
  $("face").classList.add("live");
  $("face").style.opacity = 1;
  $("camMask").style.opacity = 0;
  $("mirrorNote").classList.remove("show");
  $("keepsakeBtn").classList.remove("show");
  $("veil").classList.remove("slow");
  clearReply();
  audio.restore();
  state.turn = 3; state.act = 2; state.d2 = .88; state.phase = "idle"; state.seqLock = false;
  applyOpacities();
  $("unveilBtn").textContent = "BEGIN THE UNVEILING";
  $("chatBar").classList.remove("lock");
}
$("unveilBtn").addEventListener("click", () => {
  audio.unlock();
  if (state.act === 6) restore();
  else if (state.act >= 2 && state.act <= 4) startFinale();
});
$("keepsakeBtn").addEventListener("click", () => downloadKeepsake({ history: state.history, lang: state.lang }));

/* ── conversation ─────────────────────────────────────────────── */
let busy = false;
async function converse(text) {
  busy = true;
  state.turn++;
  state.lang = detectLang(text);
  state.history.push({ role: "user", text });
  audio.blip();
  showPrayer(text);
  state.phase = "typing";
  if (state.turn >= 10) {
    await wait(900);
    prayerRise();
    setTyping(true);
    await wait(1600);
    setTyping(false);
    state.phase = "reply";
    busy = false;
    startFinale();
    return;
  }
  state.act = actForTurn(state.turn);
  const replyP = getReply({ history: state.history, act: state.act, lang: state.lang })
    .catch(() => state.lang === "zh" ? "……我在。" : "…I am here.");
  await wait(700);
  state.phase = "divining";
  prayerRise();
  renderBeads();
  setTyping(true);
  if (state.act === 4) {
    setTimeout(() => $("typing").classList.add("stall"), 900);
    setTimeout(() => $("typing").classList.remove("stall"), 1700);
    setTimeout(() => $("typing").classList.add("stall"), 2600);
    setTimeout(() => $("typing").classList.remove("stall"), 3100);
  }
  const minWait = state.act === 4 ? 3400 + Math.random() * 1200 : 1800 + Math.random() * 900;
  const [reply] = await Promise.all([replyP, wait(minWait)]);
  setTyping(false);
  state.phase = "reply";
  renderBeads();
  state.history.push({ role: "eidolon", text: reply });
  showReply(reply);
  audio.bell();
  animateD2(DIV_TARGET[state.turn] ?? .25, 2200);
  busy = false;
}
function onSend() {
  const input = $("chatInput");
  const text = input.value.trim();
  if (!text || busy || state.act === 1 || state.act >= 5) return;
  audio.unlock();
  input.value = "";
  if (state.act === 0) { state.turn = 1; state.history.push({ role: "user", text }); startSummon(text); return; }
  converse(text);
}
$("sendBtn").addEventListener("click", onSend);
$("chatInput").addEventListener("keydown", e => {
  if (e.key === "Enter") onSend();
  if (e.key === "Escape") $("chatInput").value = "";
});

/* ── mute ─────────────────────────────────────────────────────── */
$("muteBtn").addEventListener("click", () => {
  audio.unlock();
  audio.setMuted(!audio.muted);
  $("muteBtn").textContent = audio.muted ? "SOUND ○" : "SOUND ◉";
});

/* ── adjust mode ──────────────────────────────────────────────── */
const DRAGGABLE = { swl:$("swl"), swr:$("swr"), bgc:$("bgc"), cloud:$("ring"), body:$("bodyImg"), rhand:$("rhandImg"), lhand:$("lhandImg"), face:$("face") };
function setAdjustUI() {
  const on = state.adjustMode;
  $("adjToggle").textContent = on ? "ADJUST: ON — 完成" : "ADJUST 调整模式";
  $("adjToggle").classList.toggle("on", on);
  $("adjBody").classList.toggle("show", on);
  for (const [key, el] of Object.entries(DRAGGABLE)) {
    el.style.cursor = on ? "move" : "default";
    el.style.outline = on ? "1px dashed rgba(232,200,50,.55)" : "none";
    if (!["swl","swr","bgc"].includes(key)) el.style.pointerEvents = on ? "auto" : "none";
  }
  if (on) { $("bodyGroup").style.transform = ""; $("headGroup").style.transform = ""; }
}
$("adjToggle").addEventListener("click", () => { state.adjustMode = !state.adjustMode; setAdjustUI(); });
$("adjReset").addEventListener("click", () => { state.adj = JSON.parse(JSON.stringify(ADJ_DEFAULT)); applyAdj(); saveAdj(); });
function stageScale() { return $("stage").getBoundingClientRect().width / STAGE_W; }
for (const [key, el] of Object.entries(DRAGGABLE)) {
  el.addEventListener("mousedown", e => {
    if (!state.adjustMode) return;
    e.preventDefault(); e.stopPropagation();
    const sc = stageScale(), sx = e.clientX, sy = e.clientY;
    const keys = key === "body" ? ["face","body","rhand","lhand"] : [key];
    const starts = {}; keys.forEach(k => starts[k] = { ...state.adj[k] });
    const move = ev => {
      keys.forEach(k => {
        state.adj[k].x = Math.round(starts[k].x + (ev.clientX - sx) / sc);
        state.adj[k].y = Math.round(starts[k].y + (ev.clientY - sy) / sc);
      });
      applyAdj();
    };
    const up = () => { removeEventListener("mousemove", move); removeEventListener("mouseup", up); saveAdj(); };
    addEventListener("mousemove", move); addEventListener("mouseup", up);
  });
  el.addEventListener("wheel", e => {
    if (!state.adjustMode) return;
    e.preventDefault(); e.stopPropagation();
    const L = state.adj[key];
    if (!L || L.w == null) return;
    const f = e.deltaY < 0 ? 1.03 : 1 / 1.03;
    const nw = Math.max(60, Math.round(L.w * f));
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = rect.width ? (e.clientX - rect.left) / rect.width : .5;
    const relY = rect.height ? (e.clientY - rect.top) / rect.height : .5;
    const dh = (nw - L.w) * (rect.height / rect.width || 1);
    L.x = Math.round(L.x - (nw - L.w) * relX);
    L.y = Math.round(L.y - dh * relY);
    L.w = nw;
    applyAdj(); saveAdj();
  }, { passive: false });
}
const sliderMap = { slFace:"face", slBody:"body", slRhand:"rhand", slLhand:"lhand" };
for (const [id, key] of Object.entries(sliderMap)) {
  $(id).addEventListener("input", e => { state.adj[key].w = Number(e.target.value); applyAdj(); saveAdj(); });
}

/* ── boot: preload then open the line ─────────────────────────── */
const LAYERS = ["body","face-open","face-closed","hand-right","ring","cloud-eye","swirl-left","swirl-right"].map(n => "layers/" + n + ".png");
function preload() {
  let done = 0;
  const bump = () => {
    done++;
    const pct = Math.round(done / LAYERS.length * 100);
    $("bootLine").querySelector("i").style.width = pct + "%";
    $("bootPct").textContent = "CONNECTING … " + pct + "%";
  };
  return Promise.all(LAYERS.map(src => new Promise(res => {
    const img = new Image();
    img.onload = img.onerror = () => { bump(); res(); };
    img.src = src;
  })));
}
applyAdj();
$("slamL").classList.add("off-l");
$("slamR").classList.add("off-r");
$("figureIn").classList.add("off");
preload().then(async () => {
  await wait(400);
  $("boot").classList.add("gone");
  $("chatBar").classList.add("show");
  $("chatInput").placeholder = "Speak…";
});
