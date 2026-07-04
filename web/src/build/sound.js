// Tiny Web-Audio click sounds for the builder — synthesized on the fly, so no
// audio files (and no CSP/asset concerns). The AudioContext is created lazily
// and resumed on the first user gesture (a click), which satisfies autoplay
// policies. All wrapped in try/catch so audio never breaks the app.
let ctx = null;

function ac() {
  try {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip({ type, f0, f1, peak, dur }) {
  const c = ac();
  if (!c) return;
  try {
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch {
    /* ignore */
  }
}

/** Snappy click when a brick snaps into place. */
export function playPlace() {
  blip({ type: "triangle", f0: 620, f1: 280, peak: 0.14, dur: 0.09 });
}
/** Lower thunk when a brick is removed. */
export function playRemove() {
  blip({ type: "sawtooth", f0: 300, f1: 130, peak: 0.1, dur: 0.11 });
}
/** Soft tick when a brick is picked up to move. */
export function playPick() {
  blip({ type: "sine", f0: 480, f1: 760, peak: 0.09, dur: 0.06 });
}
