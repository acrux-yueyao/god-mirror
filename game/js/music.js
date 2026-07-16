/* music.js — 《神谕之镜》自适应合成音景(零素材,WebAudio 现场合成)
   情绪:prologue 序夜 / day 白日走访(八音盒) / night 夜聊(低垫) / vault 封存层(深鸣) / endA 晚祷 / mirror 镜(近无声)
   母题:duck() = 0.5 秒"屏息"——诚实停顿时,连音乐也想一想再继续。 */

const LEVEL = 0.16;               // 总闸(再乘各情绪电平,整体保持很轻)
const MOODS = {
  prologue: { chord: [110.0, 164.8],            fc: 520,  lv: .30, pluck: null },
  day:      { chord: [146.8, 220.0, 370.0],     fc: 980,  lv: .34, pluck: { notes: [587.3, 659.3, 740.0, 880.0, 987.8], gapMin: 2200, gapMax: 5600, oct: 1 } },
  night:    { chord: [123.5, 185.0, 293.7],     fc: 640,  lv: .30, pluck: { notes: [493.9, 587.3, 740.0], gapMin: 6000, gapMax: 12000, oct: 1 } },
  vault:    { chord: [82.4, 123.5, 164.8],      fc: 380,  lv: .38, pluck: { notes: [220.0, 246.9], gapMin: 8000, gapMax: 15000, oct: 1, bell: true } },
  endA:     { chord: [146.8, 220.0, 293.7],     fc: 760,  lv: .32, pluck: { notes: [880.0, 740.0, 587.3], gapMin: 3800, gapMax: 4200, oct: 1, seq: true } },
  mirror:   { chord: [220.0],                   fc: 300,  lv: .06, pluck: null }
};

export const MUSIC = {
  ctx: null, master: null, cur: null, curName: null, muted: false, _timer: null, _seqI: 0,

  init(ctx) {
    if (this.ctx || !ctx) return;
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : LEVEL;
    this.master.connect(ctx.destination);
    try { this.muted = localStorage.getItem("sm-mute") === "1"; } catch (e) {}
    this.master.gain.value = this.muted ? 0 : LEVEL;
  },

  setMood(name) {
    if (!this.ctx || name === this.curName || !MOODS[name]) return;
    const ctx = this.ctx, m = MOODS[name], t = ctx.currentTime;
    // 旧垫淡出
    if (this.cur) {
      const old = this.cur;
      old.gain.gain.cancelScheduledValues(t);
      old.gain.gain.setTargetAtTime(0.0001, t, 0.9);
      setTimeout(() => { try { old.oscs.forEach(o => o.stop()); old.lfo.stop(); } catch (e) {} }, 3200);
    }
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    // 新垫:和弦音 ×(正弦 + 微失谐三角),低通 + 极慢 LFO 呼吸
    const gain = ctx.createGain(); gain.gain.value = 0.0001;
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = m.fc; filter.Q.value = 0.4;
    gain.connect(filter); filter.connect(this.master);
    const oscs = [];
    m.chord.forEach(f => {
      const o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = f;
      const g1 = ctx.createGain(); g1.gain.value = 1 / m.chord.length;
      o1.connect(g1); g1.connect(gain); o1.start(); oscs.push(o1);
      const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = f * 1.003;
      const g2 = ctx.createGain(); g2.gain.value = 0.35 / m.chord.length;
      o2.connect(g2); g2.connect(gain); o2.start(); oscs.push(o2);
    });
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain(); lfoG.gain.value = m.fc * 0.25;
    lfo.connect(lfoG); lfoG.connect(filter.frequency); lfo.start();
    gain.gain.setTargetAtTime(m.lv, t, 1.6);
    this.cur = { gain, filter, oscs, lfo };
    this.curName = name;
    this._seqI = 0;
    if (m.pluck) this._schedulePluck(m.pluck);
  },

  _schedulePluck(p) {
    const next = () => {
      const gap = p.seq ? p.gapMin : (p.gapMin + Math.random() * (p.gapMax - p.gapMin));
      this._timer = setTimeout(() => { this._pluck(p); next(); }, gap);
    };
    next();
  },

  _pluck(p) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const f = p.seq ? p.notes[this._seqI++ % p.notes.length] : p.notes[(Math.random() * p.notes.length) | 0];
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(p.bell ? 0.10 : 0.07, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (p.bell ? 3.2 : 1.4));
    g.connect(this.master);
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
    o.connect(g); o.start(t); o.stop(t + (p.bell ? 3.4 : 1.6));
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2;   // 八音盒泛音
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(0.02, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o2.connect(g2); g2.connect(this.master); o2.start(t); o2.stop(t + 0.8);
  },

  duck(ms) {   // 0.5 秒母题:音乐屏住呼吸,再慢慢回来
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(LEVEL * 0.12, t, 0.05);
    this.master.gain.setTargetAtTime(LEVEL, t + (ms || 500) / 1000, 0.4);
  },

  toggle() {
    this.muted = !this.muted;
    try { localStorage.setItem("sm-mute", this.muted ? "1" : "0"); } catch (e) {}
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : LEVEL, this.ctx.currentTime, 0.15);
    return this.muted;
  }
};
