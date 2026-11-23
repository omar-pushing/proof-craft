import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NibMark from './NibMark.jsx';
import { writeWordmark } from './writeWordmark.js';

export const WORD = 'ProofCraft';
/** The wordmark as letter spans, so each letter can be uncovered by the nib. */
export function Wordmark({ wordRef }) { return <span className="wm" ref={wordRef} aria-hidden="true">{[...WORD].map((c, i) => <span className="ch" key={i}>{c}</span>)}</span>; }

export default function Logo({ animate = false }) {
  const nib = useRef(null), word = useRef(null), played = useRef(false);
  const play = () => writeWordmark(nib.current, word.current);
  useEffect(() => {
    if (!animate || played.current) return; played.current = true;
    let seen = false; try { seen = sessionStorage.getItem('pc:logo') === '1'; sessionStorage.setItem('pc:logo', '1'); } catch { /* ignore */ }
    if (seen) return;
    const run = () => setTimeout(play, 250); document.fonts?.ready ? document.fonts.ready.then(run) : run();
  }, [animate]);
  return (<Link to="/" className="lockup" aria-label="ProofCraft" onClick={() => setTimeout(play, 60)}><NibMark ref={nib} /><Wordmark wordRef={word} /></Link>);
}
