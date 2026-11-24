/** Three short tones. Browsers may block audio until the user has interacted with the page, so this fails silently. */
export function beep() {
  try {
    const C = window.AudioContext || window.webkitAudioContext, c = new C();
    [0, 0.28, 0.56].forEach((t, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880 + i * 110; o.connect(g); g.connect(c.destination); const s = c.currentTime + t; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.2, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.22); o.start(s); o.stop(s + 0.24); });
    setTimeout(() => c.close(), 1400);
  } catch { /* silent */ }
}
