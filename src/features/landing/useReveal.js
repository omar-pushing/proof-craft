import { useEffect } from 'react';
/** Adds .in to .reveal elements as they enter the viewport. CSS shows everything when motion is reduced or JS is late. */
export function useReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll('.reveal')];
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}
