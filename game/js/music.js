/* music.js — 《神谕之镜》音景 v3:无音垫、无持续音——只有离散的音符,音符之间是真正的安静。
   情绪 = 音符集 + 节奏:prologue 稀疏夜铃 / day 八音盒 / night 更低更稀 / vault 深钟 / endA 晚祷三音 / mirror 全然无声
   母题:duck() = 0.5 秒"屏息"。 */

const LEVEL = 0.16;
const MOODS = {
  prologue: { notes: [329.6, 493.9],                         gapMin: 5000, gapMax: 9000,  peak: .05 },
  day:      { notes: [587.3, 659.3, 740.0, 880.0, 987.8],    gapMin: 2200, gapMax: 5600,  peak: .07 },
  night:    { notes: [493.9, 587.3, 740.0],                  gapMin: 6000, gapMax: 12000, peak: .055 },
  vault:    { notes: [220.0, 246.9],                         gapMin: 8000, gapMax: 15000, peak: .10, bell: true },
  endA:     { notes: [880.0, 740.0, 587.3],                  gapMin: 3800, gapMax: 4200,  peak: .06, seq: true },
  mirror:   null
};

export const MUSIC = {
  ctx: null, master: null, curName: null, muted: false, _timer: null, _seqI: 0,

  init(ctx) {
    if (this.ctx || !ctx) return;
    this.ctx = ctx;
    this.master = ctx.createGain();
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 120; hp.Q.value = 0.5;
    this.master.connect(hp); hp.connect(ctx.destination);
    try { this.muted = localStorage.getItem("sm-mute") === "1"; } catch (e) {}
    this.master.gain.value = this.muted ? 0 : LEVEL;
  },

  setMood(name) {
    if (!this.ctx || name === this.curName) return;
    this.curName = name;
    this._seqI = 0;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    const m = MOODS[name];
    if (m) this._schedule(m);
  },

  _schedule(m) {
    const next = () => {
      const gap = m.seq ? m.gapMin : (m.gapMin + Math.random() * (m.gapMax - m.gapMin));
      this._timer = setTimeout(() => { this._pluck(m); next(); }, gap);
    };
    next();
  },

  _pluck(m) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const f = m.seq ? m.notes[this._seqI++ % m.notes.length] : m.notes[(Math.random() * m.notes.length) | 0];
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(m.peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (m.bell ? 3.2 : 1.4));
    g.connect(this.master);
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
    o.connect(g); o.start(t); o.stop(t + (m.bell ? 3.4 : 1.6));
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2;   // 八音盒泛音
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(m.peak * 0.28, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o2.connect(g2); g2.connect(this.master); o2.start(t); o2.stop(t + 0.8);
  },

  duck(ms) {   // 0.5 秒母题:声音屏住呼吸,再慢慢回来
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
