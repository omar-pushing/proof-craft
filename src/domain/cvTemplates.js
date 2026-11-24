/**
 * Template registry. Layout lives in styles/cv.css under .tpl-<id>; data and exporters are shared.
 * cols=2 layouts are flagged because many parsers read columns out of order. photo=true templates show the optional profile photo.
 */
export const TEMPLATES = [
  { id: 'classic', name: 'Classic', cols: 1, ats: true, tags: ['classic'], desc: 'Centred header and ruled headings. The safest default for any employer.' },
  { id: 'simple', name: 'Simple', cols: 1, ats: true, tags: ['classic'], desc: 'Plain black on white with bold headings and no rules. The most parser-friendly look.' },
  { id: 'harvard', name: 'Harvard', cols: 1, ats: true, tags: ['classic', 'academic'], desc: 'Traditional serif, dense and formal. Good for law, finance and graduate applications.' },
  { id: 'elegant', name: 'Elegant', cols: 1, ats: true, tags: ['classic'], desc: 'Centred serif name with a hairline accent and small-caps headings.' },
  { id: 'ivy', name: 'Ivy', cols: 1, ats: true, tags: ['classic', 'academic'], desc: 'Compact academic layout with dates on the left of each entry line.' },
  { id: 'academic', name: 'Academic', cols: 1, ats: true, tags: ['academic'], desc: 'Serif CV style for research, scholarships and publications.' },
  { id: 'modern', name: 'Modern', cols: 1, ats: true, tags: ['modern'], desc: 'Left-aligned header with an accent bar and accent headings.' },
  { id: 'professional', name: 'Professional', cols: 1, ats: true, tags: ['modern'], desc: 'Clean business layout with an accent rule under the header.' },
  { id: 'corporate', name: 'Corporate', cols: 1, ats: true, tags: ['modern'], desc: 'Shaded name bar and bold navy-style headings for banking, consulting and audit.' },
  { id: 'nordic', name: 'Nordic', cols: 1, ats: true, tags: ['modern'], desc: 'Light weight, soft grey headings and generous white space.' },
  { id: 'minimal', name: 'Minimal', cols: 1, ats: true, tags: ['modern'], desc: 'Airy small-caps headings with lots of space.' },
  { id: 'compact', name: 'Compact', cols: 1, ats: true, tags: ['modern'], desc: 'Tight spacing to keep a student CV on one page.' },
  { id: 'executive', name: 'Executive', cols: 1, ats: true, tags: ['modern'], desc: 'Accent band behind the name. Confident without graphics.' },
  { id: 'tech', name: 'Tech', cols: 1, ats: true, tags: ['modern'], desc: 'Mono accents for headings. Suits software and data roles.' },
  { id: 'bold', name: 'Bold', cols: 1, ats: true, tags: ['creative'], desc: 'Large name and shaded headings for roles where presence matters.' },
  { id: 'stacked', name: 'Stacked', cols: 1, ats: true, tags: ['creative'], desc: 'Big spaced capitals for the name and accent blocks beside headings.' },
  { id: 'banner', name: 'Banner', cols: 1, ats: true, tags: ['creative'], desc: 'Full-width accent banner with name and contact details.' },
  { id: 'metro', name: 'Metro', cols: 1, ats: true, tags: ['creative'], desc: 'Headings sit in a left label column. Reading order stays top to bottom.' },
  { id: 'pill', name: 'Pill', cols: 1, ats: true, tags: ['creative'], desc: 'Rounded accent heading tags. Friendly for first CVs.' },
  { id: 'fresh', name: 'Fresh', cols: 1, ats: true, tags: ['creative'], desc: 'A thick accent edge down the page with soft headings.' },
  { id: 'timeline', name: 'Timeline', cols: 1, ats: true, tags: ['creative'], desc: 'Accent line and dots down the page. Single column, still plain text.' },
  { id: 'portrait', name: 'Portrait', cols: 1, ats: true, photo: true, tags: ['photo', 'modern'], desc: 'Round photo beside the name. Common in Arabic-speaking markets.' },
  { id: 'sidebar', name: 'Sidebar', cols: 2, ats: false, tags: ['twocol'], desc: 'Accent sidebar with contact, skills and languages.' },
  { id: 'split', name: 'Split', cols: 2, ats: false, tags: ['twocol'], desc: 'Narrow right column for skills and details beside the main story.' },
  { id: 'sidebar-photo', name: 'Sidebar photo', cols: 2, ats: false, photo: true, tags: ['twocol', 'photo'], desc: 'Tinted sidebar with your photo, contact and skills.' },
  { id: 'creative', name: 'Creative', cols: 2, ats: false, photo: true, tags: ['twocol', 'photo', 'creative'], desc: 'Dark sidebar with a photo and light main column.' },
];
export const TAGS = [['all', 'All'], ['ats', 'ATS-safe'], ['classic', 'Classic'], ['modern', 'Modern'], ['creative', 'Creative'], ['academic', 'Academic'], ['photo', 'With photo'], ['twocol', 'Two columns']];
export const SIDE_SECTIONS = ['skills', 'languages', 'certifications', 'awards', 'references'];
export const FONTS = [['arial', 'Arial', 'Arial, Helvetica, sans-serif'], ['calibri', 'Calibri', 'Calibri, Carlito, Arial, sans-serif'], ['georgia', 'Georgia', 'Georgia, "Times New Roman", serif'], ['times', 'Times New Roman', '"Times New Roman", Times, serif'], ['verdana', 'Verdana', 'Verdana, Geneva, sans-serif'], ['cambria', 'Cambria', 'Cambria, Georgia, serif'], ['tahoma', 'Tahoma', 'Tahoma, Geneva, sans-serif']];
export const AR_FONT = '"Thmanyah Sans", "Readex Pro", "Noto Naskh Arabic", Arial, sans-serif';
export const ACCENTS = ['#2F45D0', '#0E7C66', '#B42318', '#8A5A00', '#6B3FA0', '#161A2E', '#0B6FA4', '#C2410C', '#0F766E', '#BE185D'];
export const BULLETS = [['dot', '• Dot'], ['dash', '– Dash'], ['square', '▪ Square'], ['arrow', '› Arrow']];
export const SKILL_STYLES = [['inline', 'Comma list'], ['chips', 'Tags'], ['columns', 'Columns']];
export const PAPERS = { a4: { w: '210mm', h: '297mm', px: 794, name: 'A4' }, letter: { w: '8.5in', h: '11in', px: 816, name: 'Letter' } };
export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
