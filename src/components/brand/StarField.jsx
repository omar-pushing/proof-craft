import { useEffect, useRef } from 'react';

/** Falling four-point stars in the brand marker yellow. Pauses off screen and when motion is reduced. */
export default function StarField() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, x = c.getContext?.('2d');
    if (!x) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, stars = [], raf = 0, visible = true, t = 0;
    const make = (anywhere) => ({ x: Math.random() * w, y: anywhere ? Math.random() * h : -12, r: 1 + Math.random() * 2.4, v: 0.25 + Math.random() * 0.6, p: Math.random() * 6.28, sw: 0.1 + Math.random() * 0.35 });
    const size = () => {
      const r = c.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.max(18, Math.round(w / 12)) }, () => make(true));
    };
    const draw = () => {
      x.clearRect(0, 0, w, h); x.fillStyle = '#FFD84D';
      for (const s of stars) {
        const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.03 + s.p));
        x.save(); x.translate(s.x, s.y); x.globalAlpha = a; x.shadowColor = '#FFD84D'; x.shadowBlur = s.r * 4; x.beginPath();
        for (let i = 0; i < 8; i++) { const rr = i % 2 ? s.r * 0.45 : s.r * 1.7, an = (i * Math.PI) / 4; x.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
        x.closePath(); x.fill(); x.restore();
        if (!reduce) { s.y += s.v; s.x += Math.sin(t * 0.01 + s.p) * s.sw; if (s.y > h + 12) Object.assign(s, make(false)); }
      }
      t++;
    };
    const loop = () => { if (visible) draw(); raf = requestAnimationFrame(loop); };
    size();
    const ro = new ResizeObserver(size); ro.observe(c);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(c);
    if (reduce) draw(); else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);
  return <canvas ref={ref} className="stars" aria-hidden="true" />;
}
