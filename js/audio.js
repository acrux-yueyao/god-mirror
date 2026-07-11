/* audio.js — fully synthesized soundscape, no audio assets.
   pad: constant low drone · blip: message sent · bell: reply arrives
   riser/hit: summon sequence · freeze: sudden hush · heartbeat: the mirror's pulse */

let ctx = null, master = null, padGain = null, hbGain = null, hbTimer = null, sineGain = null;
let muted = false;

function ensure() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(ctx.destination);
  startPad();
  return true;
}

function startPad() {
  padGain = ctx.createGain();
  padGain.gain.value = 0.035;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 240; lp.Q.value = 0.6;
  padGain.connect(lp); lp.connect(master);
  [[55, "sine", 0], [82.4, "triangle", 3], [110.5, "sine", -4]].forEach(([f, type, det]) => {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.value = f; o.detune.value = det;
    const g = ctx.createGain(); g.gain.value = 0.5;
    o.connect(g); g.connect(padGain);
    o.start();
  });
}

function env(gainNode, t0, peak, decay) {
  gainNode.gain.setValueAtTime(0.0001, t0);
  gainNode.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
}

export const audio = {
  unlock() { ensure(); },

  setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05); },
  get muted() { return muted; },

  blip() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(620, t + 0.09);
    const g = ctx.createGain(); env(g, t, 0.08, 0.12);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.15);
  },

  bell() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    [[523.25, 0.14, 2.2], [1046.5, 0.05, 1.4], [786, 0.03, 1.7]].forEach(([f, peak, decay]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 8;
      const g = ctx.createGain(); env(g, t, peak, decay);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + decay + 0.1);
    });
  },

  riser(dur = 2.0) {
    if (!ensure()) return;
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (i / d.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.3);
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(1240, t + dur);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.05, t + dur);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.2);
    o.connect(og); og.connect(master); o.start(t); o.stop(t + dur + 0.25);
  },

  hit() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.5);
    const g = ctx.createGain(); env(g, t, 0.5, 0.9);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 1);
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1800;
    const ng = ctx.createGain(); env(ng, t, 0.18, 0.3);
    src.connect(hp); hp.connect(ng); ng.connect(master); src.start(t);
  },

  freeze() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    if (padGain) padGain.gain.setTargetAtTime(0.004, t, 0.4);
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 1760;
    sineGain = ctx.createGain();
    sineGain.gain.setValueAtTime(0.0001, t);
    sineGain.gain.exponentialRampToValueAtTime(0.014, t + 1.2);
    o.connect(sineGain); sineGain.connect(master); o.start(t);
  },

  heartbeat(on) {
    if (!ensure()) return;
    if (hbTimer) { clearInterval(hbTimer); hbTimer = null; }
    if (sineGain) { sineGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.6); sineGain = null; }
    if (!on) { if (hbGain) hbGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3); return; }
    if (!hbGain) { hbGain = ctx.createGain(); hbGain.gain.value = 0; hbGain.connect(master); }
    hbGain.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
    const thump = (delay) => {
      const t = ctx.currentTime + delay;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(64, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.14);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.26, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); g.connect(hbGain); o.start(t); o.stop(t + 0.3);
    };
    const beat = () => { thump(0); thump(0.32); };
    beat();
    hbTimer = setInterval(beat, 1150);
  },

  restore() {
    if (!ctx) return;
    this.heartbeat(false);
    if (padGain) padGain.gain.setTargetAtTime(0.035, ctx.currentTime, 0.8);
  }
};
