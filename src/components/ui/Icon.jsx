const P = {
  today: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4', study: 'M2 8l10-4 10 4-10 4zM6 10v5c3 2 9 2 12 0v-5', users: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 010 6M18 14c2 .7 3 2.7 3 6',
  briefcase: 'M3 8h18v12H3zM9 8V5h6v3', sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
  moon: 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z', menu: 'M4 7h16M4 12h16M4 17h16', x: 'M6 6l12 12M18 6L6 18', share: 'M8 12l8-5M8 12l8 5M6 14a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-2-4-2 .8-1.6-1L15 4h-4l-.4 2.8-1.6 1L7 7l-2 4 2 1v1l-2 1 2 4 2-.8 1.6 1L11 20h4l.4-2.8 1.6-1 2 .8 2-4-2-1z', globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z',
  copy: 'M9 9h11v11H9zM5 15V4h11', check: 'M5 12l5 5 9-10', plus: 'M12 5v14M5 12h14', print: 'M7 9V3h10v6M7 17H4v-6h16v6h-3M7 14h10v7H7z',
};
export default function Icon({ name, size = 20 }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[name]} /></svg>;
}
