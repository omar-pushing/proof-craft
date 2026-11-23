/**
 * Writes the wordmark with the nib. Each letter is uncovered left to right while the nib tip follows its right edge,
 * dipping a little on each stroke. Then the nib lifts and glides back to its place.
 * Only translation is used: the mark is never rotated or reshaped. Returns the nib animation (or null when unsupported).
 */
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export function writeWordmark(nib, word, { speed = 1 } = {}) {
  if (prefersReducedMotion() || !nib?.animate || !word) return null;
  const letters = [...word.children];
  const box = word.getBoundingClientRect(), nb = nib.getBoundingClientRect(), tipX = nb.left + nb.width / 2, dip = nb.height / 36;
  const START = 450 / speed, STEP = 170 / speed, HOLD = 260 / speed, BACK = 800 / speed, total = START + letters.length * STEP + HOLD + BACK;
  letters.forEach((el, i) => el.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: STEP * 1.1, delay: START + i * STEP + (i % 3) * 14 / speed, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'backwards' }));
  const frames = [{ offset: 0, transform: 'translate(0,0)' }, { offset: (START - 120 / speed) / total, transform: `translate(0,${-2 * dip}px)` }];
  letters.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    frames.push({ offset: (START + (i + 1) * STEP) / total, transform: `translate(${box.left + (r.right - box.left) - tipX - r.width * 0.12}px, ${(i % 2 ? -2.5 : 1.5) * dip}px)` });
  });
  const lastX = frames[frames.length - 1].transform.match(/translate\(([-\d.]+)px/)[1];
  frames.push({ offset: (total - BACK) / total, transform: `translate(${lastX}px,${-6 * dip}px)` });
  frames.push({ offset: (total - BACK * 0.45) / total, transform: `translate(${lastX * 0.35}px,${-12 * dip}px)` });
  frames.push({ offset: 1, transform: 'translate(0,0)' });
  return nib.animate(frames, { duration: total, easing: 'ease-in-out' });
}
