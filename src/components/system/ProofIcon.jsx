import NibMark from '@/components/brand/NibMark.jsx';

const GLYPHS = {
  home: <><path d="M5 11.5 12 5l7 6.5V19H8v-6h8v6" /><circle cx="12" cy="13" r="1.5" className="proof-glyph-key" /></>,
  plan: <><rect x="5" y="5.5" width="14" height="13.5" rx="2.5" /><path d="M8 4v3M16 4v3M5 10h14M8.5 14h4" /><circle cx="16" cy="14" r="1.5" className="proof-glyph-key" /></>,
  today: <><rect x="5" y="5.5" width="14" height="13.5" rx="2.5" /><path d="M8 4v3M16 4v3M5 10h14M8 14h3" /><circle cx="16" cy="14" r="1.5" className="proof-glyph-key" /></>,
  study: <><path d="M4.5 6.5c3.3-.7 5.8.1 7.5 2v10c-1.7-1.9-4.2-2.7-7.5-2V6.5ZM19.5 6.5c-3.3-.7-5.8.1-7.5 2v10c1.7-1.9 4.2-2.7 7.5-2V6.5Z" /><circle cx="16.5" cy="11" r="1.5" className="proof-glyph-key" /></>,
  projects: <><rect x="4.5" y="5" width="6" height="5" rx="1.5" /><rect x="13.5" y="14" width="6" height="5" rx="1.5" /><path d="M10.5 7.5H16a2 2 0 0 1 2 2V14M13.5 16.5H8a2 2 0 0 1-2-2V10" /><circle cx="12" cy="12" r="1.5" className="proof-glyph-key" /></>,
  share: <><path d="M9.5 8.5 14 6a3 3 0 1 1 1.2 4.1l-6.4 3.8A3 3 0 1 1 10 18l4.5-2.5" /><circle cx="12" cy="12" r="1.5" className="proof-glyph-key" /></>,
  career: <><rect x="4.5" y="8" width="15" height="11" rx="2.5" /><path d="M9 8V5.5h6V8M4.5 12.5h15M10 12.5v2h4v-2" /><circle cx="12" cy="13.5" r="1.3" className="proof-glyph-key" /></>,
  notification: <><path d="M7 17h10l-1.2-2V11a3.8 3.8 0 0 0-7.6 0v4L7 17ZM10 19h4" /><circle cx="17.5" cy="7" r="1.7" className="proof-glyph-key" /></>,
  settings: <><path d="M5 7h8M17 7h2M5 12h2M11 12h8M5 17h8M17 17h2" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="15" cy="17" r="2" className="proof-glyph-key" /></>,
  connections: <><path d="M8.5 14.5 6 17m9.5-7.5L18 7M9 7h6M7 9v6M17 9v6M9 17h6" /><circle cx="7" cy="7" r="2" /><circle cx="17" cy="7" r="2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" className="proof-glyph-key" /></>,
  feedback: <><path d="M5 6h14v10H10l-4 3v-3H5V6Z" /><path d="M8.5 10h7M8.5 13h4" /><circle cx="17" cy="16" r="1.5" className="proof-glyph-key" /></>,
  admin: <><path d="M12 4.5 18.5 7v5c0 4-2.7 6.4-6.5 7.5C8.2 18.4 5.5 16 5.5 12V7L12 4.5Z" /><path d="m9 12 2 2 4-4" /><circle cx="17" cy="7" r="1.5" className="proof-glyph-key" /></>,
  drive: <><path d="M5 6.5h5l2 2h7v9.5H5V6.5Z" /><path d="M5 11h14" /><circle cx="15.5" cy="14.5" r="1.5" className="proof-glyph-key" /></>,
  calendar: <><rect x="5" y="5.5" width="14" height="13.5" rx="2.5" /><path d="M8 4v3M16 4v3M5 10h14M8 14h3" /><circle cx="16" cy="14" r="1.5" className="proof-glyph-key" /></>,
  workspace: <><rect x="5" y="5" width="6" height="6" rx="1.5" /><rect x="13" y="5" width="6" height="6" rx="1.5" /><rect x="5" y="13" width="6" height="6" rx="1.5" /><rect x="13" y="13" width="6" height="6" rx="1.5" /><circle cx="16" cy="16" r="1.5" className="proof-glyph-key" /></>,
  evidence: <><path d="M7 4.5h8l3 3V19H7V4.5Z" /><path d="M15 4.5V8h3M10 11h5M10 14h3" /><circle cx="15.5" cy="16" r="1.5" className="proof-glyph-key" /></>,
  timer: <><circle cx="12" cy="13" r="6.5" /><path d="M10 4h4M12 6.5V13l3 2" /><circle cx="12" cy="13" r="1.5" className="proof-glyph-key" /></>,
};

/** Custom ProofCraft feature glyphs. The nib is reserved for the brand mark. */
export default function ProofIcon({ name = 'brand', tone = 'blue', size = 'md', className = '' }) {
  const classes = `proof-icon proof-icon-${tone} proof-icon-${size} proof-icon-${name} ${className}`.trim();
  if (name === 'brand' || !GLYPHS[name]) return <span className={classes} aria-hidden="true"><NibMark /></span>;
  return <span className={classes} aria-hidden="true"><svg className="proof-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">{GLYPHS[name]}</svg></span>;
}
