/** Template registry. Layout lives in styles/cv.css under .tpl-<id>; data and exporters are shared. cols=2 layouts are flagged because many parsers read columns out of order. */
export const TEMPLATES = [
  { id: 'classic', name: 'Classic', cols: 1, ats: true, desc: 'Centred header and ruled headings. The safest default for any employer.' },
  { id: 'harvard', name: 'Harvard', cols: 1, ats: true, desc: 'Traditional serif, dense and formal. Good for law, finance and graduate applications.' },
  { id: 'modern', name: 'Modern', cols: 1, ats: true, desc: 'Left-aligned header with an accent bar and accent headings.' },
  { id: 'minimal', name: 'Minimal', cols: 1, ats: true, desc: 'Light and airy. Small caps headings, lots of white space.' },
  { id: 'compact', name: 'Compact', cols: 1, ats: true, desc: 'Tight spacing to keep a student CV on one page.' },
  { id: 'executive', name: 'Executive', cols: 1, ats: true, desc: 'Accent band behind the name. Confident without graphics.' },
  { id: 'academic', name: 'Academic', cols: 1, ats: true, desc: 'Serif CV style for research, scholarships and publications.' },
  { id: 'tech', name: 'Tech', cols: 1, ats: true, desc: 'Mono accents for headings, skills first. Suits software roles.' },
  { id: 'bold', name: 'Bold', cols: 1, ats: true, desc: 'Large name and shaded headings for roles where presence matters.' },
  { id: 'timeline', name: 'Timeline', cols: 1, ats: true, desc: 'Accent line and dots down the page. Single column, still plain text.' },
  { id: 'sidebar', name: 'Sidebar', cols: 2, ats: false, desc: 'Accent sidebar with contact, skills and languages. Great for people, riskier for parsers.' },
  { id: 'split', name: 'Split', cols: 2, ats: false, desc: 'Narrow right column for skills and details beside the main story.' },
];
export const SIDE_SECTIONS = ['skills', 'languages', 'certifications', 'awards', 'references'];
export const FONTS = [['arial', 'Arial', 'Arial, Helvetica, sans-serif'], ['calibri', 'Calibri', 'Calibri, Carlito, Arial, sans-serif'], ['georgia', 'Georgia', 'Georgia, "Times New Roman", serif'], ['times', 'Times New Roman', '"Times New Roman", Times, serif'], ['verdana', 'Verdana', 'Verdana, Geneva, sans-serif']];
export const AR_FONT = '"Thmanyah Sans", "Readex Pro", "Noto Naskh Arabic", Arial, sans-serif';
export const ACCENTS = ['#2F45D0', '#0E7C66', '#B42318', '#8A5A00', '#6B3FA0', '#161A2E', '#0B6FA4', '#C2410C'];
export const PAPERS = { a4: { w: '210mm', h: '297mm', px: 794, name: 'A4' }, letter: { w: '8.5in', h: '11in', px: 816, name: 'Letter' } };
export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
