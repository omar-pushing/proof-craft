import { useEffect, useRef, useState } from 'react';
import NibMark from './NibMark.jsx';
import { Wordmark } from './Logo.jsx';
import { prefersReducedMotion, writeWordmark } from './writeWordmark.js';

/** Shown once per browser session. Uses the same nib animation as the header logo, then fades away. */
export const shouldSplash = () => { try { return sessionStorage.getItem('pc:splash') !== '1' && !prefersReducedMotion(); } catch { return false; } };
export default function Splash({ onDone }) {
  const nib = useRef(null), word = useRef(null); const [out, setOut] = useState(false);
  useEffect(() => {
    try { sessionStorage.setItem('pc:splash', '1'); sessionStorage.setItem('pc:logo', '1'); } catch { /* ignore */ }
    let alive = true; const finish = () => { if (!alive) return; setOut(true); setTimeout(() => alive && onDone(), 420); };
    const start = () => { const a = writeWordmark(nib.current, word.current, { speed: 1.25 }); if (!a) return finish(); a.finished.then(() => setTimeout(finish, 350)).catch(finish); };
    const failsafe = setTimeout(finish, 6000);
    document.fonts?.ready ? document.fonts.ready.then(() => requestAnimationFrame(start)) : start();
    return () => { alive = false; clearTimeout(failsafe); };
  }, [onDone]);
  return (<div className={`splash${out ? ' out' : ''}`} role="status" aria-label="ProofCraft"><div className="lockup splash-lock"><NibMark ref={nib} /><Wordmark wordRef={word} /></div><p className="splash-line">Your work is the key.</p></div>);
}
