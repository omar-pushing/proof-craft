import { uid } from '../lib/id.js';

export const LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];
/** One schema drives the editor, the templates and every exporter. Field types: text, textarea, month, check, bullets, level. */
export const SCHEMA = {
  experience: { title: 'Experience', primary: 'role', secondary: 'org', fields: [['role', 'Job title', 'text'], ['org', 'Company', 'text'], ['location', 'Location', 'text'], ['start', 'Start', 'month'], ['end', 'End', 'month'], ['current', 'I work here now', 'check'], ['bullets', 'Achievements', 'bullets']] },
  education: { title: 'Education', primary: 'school', secondary: 'degree', fields: [['school', 'School', 'text'], ['degree', 'Degree', 'text'], ['field', 'Field of study', 'text'], ['location', 'Location', 'text'], ['start', 'Start', 'month'], ['end', 'End or expected', 'month'], ['gpa', 'GPA or grade', 'text'], ['notes', 'Coursework and honours', 'textarea']] },
  projects: { title: 'Projects', primary: 'name', secondary: 'role', fields: [['name', 'Project name', 'text'], ['role', 'Your role', 'text'], ['tech', 'Tools and technologies', 'text'], ['link', 'Link', 'text'], ['start', 'Start', 'month'], ['end', 'End', 'month'], ['bullets', 'Achievements', 'bullets']] },
  certifications: { title: 'Certifications', primary: 'name', secondary: 'issuer', fields: [['name', 'Certificate', 'text'], ['issuer', 'Issuer', 'text'], ['date', 'Date', 'month'], ['link', 'Link', 'text']] },
  awards: { title: 'Awards', primary: 'title', secondary: 'issuer', fields: [['title', 'Award', 'text'], ['issuer', 'Awarded by', 'text'], ['date', 'Date', 'month'], ['note', 'Note', 'text']] },
  languages: { title: 'Languages', primary: 'name', secondary: 'level', fields: [['name', 'Language', 'text'], ['level', 'Level', 'level']] },
  volunteering: { title: 'Volunteering', primary: 'role', secondary: 'org', fields: [['role', 'Role', 'text'], ['org', 'Organisation', 'text'], ['location', 'Location', 'text'], ['start', 'Start', 'month'], ['end', 'End', 'month'], ['current', 'Ongoing', 'check'], ['bullets', 'Achievements', 'bullets']] },
  publications: { title: 'Publications', primary: 'title', secondary: 'venue', fields: [['title', 'Title', 'text'], ['venue', 'Venue', 'text'], ['date', 'Date', 'month'], ['link', 'Link', 'text']] },
  references: { title: 'References', primary: 'name', secondary: 'role', fields: [['name', 'Name', 'text'], ['role', 'Role and organisation', 'text'], ['contact', 'Contact', 'text']] },
};
export const LIST_SECTIONS = Object.keys(SCHEMA);
export const SECTION_ORDER = ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'awards', 'languages', 'volunteering', 'publications', 'references'];
export const HEADINGS = {
  en: { summary: 'Summary', experience: 'Experience', education: 'Education', projects: 'Projects', skills: 'Skills', certifications: 'Certifications', awards: 'Awards', languages: 'Languages', volunteering: 'Volunteering', publications: 'Publications', references: 'References', present: 'Present', contact: 'Contact' },
  ar: { summary: 'الملخص المهني', experience: 'الخبرات', education: 'التعليم', projects: 'المشاريع', skills: 'المهارات', certifications: 'الشهادات', awards: 'الجوائز', languages: 'اللغات', volunteering: 'العمل التطوعي', publications: 'المنشورات', references: 'المراجع', present: 'حتى الآن', contact: 'التواصل' },
};
export const LEVEL_AR = { Native: 'اللغة الأم', Fluent: 'طلاقة', Advanced: 'متقدم', Intermediate: 'متوسط', Basic: 'أساسي' };

export const emptyEntry = (section) => ({ id: uid(), ...Object.fromEntries(SCHEMA[section].fields.map(([k, , t]) => [k, t === 'bullets' ? [''] : t === 'check' ? false : t === 'level' ? 'Fluent' : ''])) });
export const defaultDesign = () => ({ accent: '#2F45D0', font: 'arial', size: 10.5, line: 1.35, margin: 15, paper: 'a4', gap: 12 });
export function newCv({ name = '', lang = 'en', title = 'My CV' } = {}) {
  return { id: uid(), title, lang, template: 'classic', design: defaultDesign(), updated: Date.now(),
    personal: { name, headline: '', email: '', phone: '', location: '', links: [{ id: uid(), label: 'LinkedIn', url: '' }] },
    summary: '', skills: [{ id: uid(), group: 'Technical', items: '' }], custom: [], ...Object.fromEntries(LIST_SECTIONS.map((s) => [s, []])),
    order: [...SECTION_ORDER], hidden: [] };
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtMonth(v, lang = 'en') {
  const m = /^(\d{4})-(\d{2})$/.exec(v || ''); if (!m) return v || '';
  if (lang === 'ar') return new Date(+m[1], +m[2] - 1, 1).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' });
  return `${MONTHS_EN[+m[2] - 1]} ${m[1]}`;
}
export function dateRange(e, lang = 'en') {
  const H = HEADINGS[lang]; const s = fmtMonth(e.start, lang), en = e.current ? H.present : fmtMonth(e.end, lang);
  if (e.date) return fmtMonth(e.date, lang);
  return [s, en].filter(Boolean).join(' – ');
}
export const bulletsOf = (e) => (e.bullets || []).map((b) => b.trim()).filter(Boolean);
export const skillList = (cv) => cv.skills.flatMap((g) => g.items.split(/[,،;\n]/).map((x) => x.trim()).filter(Boolean));
export const linksOf = (cv) => cv.personal.links.filter((l) => l.url.trim());
export const visibleSections = (cv) => cv.order.filter((s) => !cv.hidden.includes(s));

/** Plain text in reading order. This is what the ATS Check reads and what the .txt export contains. */
export function cvPlainText(cv) {
  const H = HEADINGS[cv.lang] || HEADINGS.en, p = cv.personal, out = [];
  out.push([p.name, p.headline].filter(Boolean).join('\n'));
  out.push([p.email, p.phone, p.location, ...linksOf(cv).map((l) => l.url)].filter(Boolean).join(' | '));
  for (const s of visibleSections(cv)) {
    let body = '';
    if (s === 'summary') body = cv.summary.trim();
    else if (s === 'skills') body = cv.skills.filter((g) => g.items.trim()).map((g) => (g.group ? `${g.group}: ` : '') + g.items.trim()).join('\n');
    else if (SCHEMA[s]) {
      const sc = SCHEMA[s];
      body = cv[s].map((e) => [[e[sc.primary], e[sc.secondary], e.field, e.location].filter(Boolean).join(', '), dateRange(e, cv.lang), e.tech && `Tools: ${e.tech}`, e.gpa && `GPA: ${e.gpa}`, e.notes, ...bulletsOf(e).map((b) => `- ${b}`)].filter(Boolean).join('\n')).join('\n\n');
    }
    if (body.trim()) out.push(`${H[s].toUpperCase()}\n${body}`);
  }
  cv.custom.filter((c) => c.title && c.text.trim()).forEach((c) => out.push(`${c.title.toUpperCase()}\n${c.text.trim()}`));
  return out.filter((x) => x && x.trim()).join('\n\n');
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** Single-column semantic HTML. Word opens it as an editable document, so the .doc export stays ATS-safe. */
export function cvToHtml(cv) {
  const H = HEADINGS[cv.lang] || HEADINGS.en, p = cv.personal, sc = SCHEMA; const rtl = cv.lang === 'ar';
  const parts = [`<h1>${esc(p.name)}</h1>`, p.headline && `<p><b>${esc(p.headline)}</b></p>`, `<p>${[p.email, p.phone, p.location, ...linksOf(cv).map((l) => l.url)].filter(Boolean).map(esc).join(' | ')}</p>`];
  for (const s of visibleSections(cv)) {
    let body = '';
    if (s === 'summary') body = cv.summary.trim() && `<p>${esc(cv.summary)}</p>`;
    else if (s === 'skills') body = cv.skills.filter((g) => g.items.trim()).map((g) => `<p>${g.group ? `<b>${esc(g.group)}:</b> ` : ''}${esc(g.items)}</p>`).join('');
    else if (sc[s]) body = cv[s].map((e) => `<p><b>${esc(e[sc[s].primary])}</b>${e[sc[s].secondary] ? `, ${esc(e[sc[s].secondary])}` : ''}${dateRange(e, cv.lang) ? ` (${esc(dateRange(e, cv.lang))})` : ''}</p>${bulletsOf(e).length ? `<ul>${bulletsOf(e).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}`).join('');
    if (body) parts.push(`<h2>${esc(H[s])}</h2>${body}`);
  }
  return `<!doctype html><html${rtl ? ' dir="rtl"' : ''}><head><meta charset="utf-8"><title>${esc(p.name)}</title></head><body style="font-family:Arial,sans-serif;font-size:11pt">${parts.filter(Boolean).join('')}</body></html>`;
}

/** JSON Resume (jsonresume.org) mapping, so a CV can move to and from other builders. */
export function toJsonResume(cv) {
  const p = cv.personal;
  return { basics: { name: p.name, label: p.headline, email: p.email, phone: p.phone, summary: cv.summary, location: { address: p.location }, profiles: linksOf(cv).map((l) => ({ network: l.label, url: l.url })) },
    work: cv.experience.map((e) => ({ name: e.org, position: e.role, location: e.location, startDate: e.start, endDate: e.current ? '' : e.end, highlights: bulletsOf(e) })),
    education: cv.education.map((e) => ({ institution: e.school, studyType: e.degree, area: e.field, startDate: e.start, endDate: e.end, score: e.gpa })),
    projects: cv.projects.map((e) => ({ name: e.name, description: e.role, url: e.link, keywords: e.tech.split(',').map((x) => x.trim()).filter(Boolean), highlights: bulletsOf(e) })),
    skills: cv.skills.map((g) => ({ name: g.group, keywords: g.items.split(',').map((x) => x.trim()).filter(Boolean) })),
    certificates: cv.certifications.map((e) => ({ name: e.name, issuer: e.issuer, date: e.date, url: e.link })),
    awards: cv.awards.map((e) => ({ title: e.title, awarder: e.issuer, date: e.date, summary: e.note })),
    languages: cv.languages.map((e) => ({ language: e.name, fluency: e.level })),
    volunteer: cv.volunteering.map((e) => ({ organization: e.org, position: e.role, startDate: e.start, endDate: e.current ? '' : e.end, highlights: bulletsOf(e) })),
    publications: cv.publications.map((e) => ({ name: e.title, publisher: e.venue, releaseDate: e.date, url: e.link })),
    references: cv.references.map((e) => ({ name: e.name, reference: e.role })) };
}
export function fromJsonResume(j, base = newCv()) {
  const s = (v) => String(v ?? '').slice(0, 500), m = (v) => (/^\d{4}-\d{2}/.test(v || '') ? String(v).slice(0, 7) : /^\d{4}$/.test(v || '') ? `${v}-01` : '');
  const b = j?.basics || {}, a = (x) => (Array.isArray(x) ? x.slice(0, 50) : []);
  const cv = { ...base, personal: { ...base.personal, name: s(b.name), headline: s(b.label), email: s(b.email), phone: s(b.phone), location: s(b.location?.address || b.location?.city), links: a(b.profiles).map((p) => ({ id: uid(), label: s(p.network), url: s(p.url) })) }, summary: s(b.summary) };
  cv.experience = a(j.work).map((w) => ({ id: uid(), role: s(w.position), org: s(w.name), location: s(w.location), start: m(w.startDate), end: m(w.endDate), current: !w.endDate, bullets: a(w.highlights).map(s) }));
  cv.education = a(j.education).map((w) => ({ id: uid(), school: s(w.institution), degree: s(w.studyType), field: s(w.area), location: '', start: m(w.startDate), end: m(w.endDate), gpa: s(w.score), notes: '' }));
  cv.projects = a(j.projects).map((w) => ({ id: uid(), name: s(w.name), role: s(w.description), tech: a(w.keywords).join(', '), link: s(w.url), start: '', end: '', bullets: a(w.highlights).map(s) }));
  cv.skills = a(j.skills).map((w) => ({ id: uid(), group: s(w.name), items: a(w.keywords).join(', ') }));
  cv.certifications = a(j.certificates).map((w) => ({ id: uid(), name: s(w.name), issuer: s(w.issuer), date: m(w.date), link: s(w.url) }));
  cv.awards = a(j.awards).map((w) => ({ id: uid(), title: s(w.title), issuer: s(w.awarder), date: m(w.date), note: s(w.summary) }));
  cv.languages = a(j.languages).map((w) => ({ id: uid(), name: s(w.language), level: LEVELS.includes(w.fluency) ? w.fluency : 'Fluent' }));
  cv.volunteering = a(j.volunteer).map((w) => ({ id: uid(), role: s(w.position), org: s(w.organization), location: '', start: m(w.startDate), end: m(w.endDate), current: !w.endDate, bullets: a(w.highlights).map(s) }));
  cv.publications = a(j.publications).map((w) => ({ id: uid(), title: s(w.name), venue: s(w.publisher), date: m(w.releaseDate), link: s(w.url) }));
  cv.references = a(j.references).map((w) => ({ id: uid(), name: s(w.name), role: s(w.reference), contact: '' }));
  if (!cv.skills.length) cv.skills = [{ id: uid(), group: 'Skills', items: '' }];
  return cv;
}

/** Share of a complete student CV that is filled in, with the next things to add. */
export function completeness(cv) {
  const p = cv.personal, checks = [['name', !!p.name.trim()], ['email', /\S+@\S+\.\S+/.test(p.email)], ['phone', !!p.phone.trim()], ['location', !!p.location.trim()], ['link', linksOf(cv).length > 0], ['summary', cv.summary.trim().split(/\s+/).length >= 20],
    ['education', cv.education.some((e) => e.school)], ['work', cv.experience.some((e) => e.role) || cv.projects.some((e) => e.name)], ['bullets', [...cv.experience, ...cv.projects].some((e) => bulletsOf(e).length >= 2)], ['skills', skillList(cv).length >= 6]];
  return { percent: Math.round((checks.filter((c) => c[1]).length / checks.length) * 100), missing: checks.filter((c) => !c[1]).map((c) => c[0]) };
}
export const MISSING_LABEL = { name: 'Add your name', email: 'Add a valid email', phone: 'Add a phone number', location: 'Add your city', link: 'Add a LinkedIn or portfolio link', summary: 'Write a summary of 20 words or more', education: 'Add your education', work: 'Add an experience or a project', bullets: 'Give one entry two or more achievements', skills: 'List at least six skills' };
