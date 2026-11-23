import { SCHEMA, bulletsOf, cvPlainText, skillList, visibleSections, HEADINGS } from './cv.js';
import { templateById } from './cvTemplates.js';

/**
 * Smart CV check, run entirely in the browser. Ideas borrowed from open-source matchers (keyword extraction from the job
 * description, text similarity) and from published ATS formatting guidance. It never invents a "score" and never predicts hiring.
 */
const STOP = new Set('a an the and or of to in for on with at by from as is are was were be been being this that these those it its we you your our their they he she them his her i me my not no nor but if then than so such can could will would should may might must shall do does did done have has had having about above after again all also any both each few more most other some very just into over under up down out off per via etc using use used within across including include includes eg ie who whom which what when where why how'.split(' '));
const GENERIC = new Set('experience ability abilities work working team teams looking candidate candidates responsibilities responsibility requirements requirement required preferred strong skills skill role roles position job company years year plus knowledge understanding excellent good great well able join opportunity opportunities benefits apply seeking needed need new help support provide provides ensure make including related relevant degree bachelor environment fast-paced dynamic'.split(' '));
const SKILLS = {
  JavaScript: ['js', 'javascript', 'ecmascript', 'es6'], TypeScript: ['typescript', 'ts'], React: ['react', 'reactjs', 'react.js'], 'Node.js': ['node', 'nodejs', 'node.js'], Python: ['python'], SQL: ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite'], MongoDB: ['mongodb', 'mongo'],
  Java: ['java'], 'C++': ['c++'], 'C#': ['c#'], '.NET': ['.net', 'dotnet'], PHP: ['php'], Laravel: ['laravel'], Django: ['django'], Flutter: ['flutter'], Android: ['android'], iOS: ['ios', 'swift'], HTML: ['html', 'html5'], CSS: ['css', 'css3', 'tailwind', 'sass'],
  Git: ['git', 'github', 'gitlab'], Docker: ['docker', 'containers'], AWS: ['aws', 'amazon web services'], Azure: ['azure'], Linux: ['linux', 'ubuntu'], 'REST APIs': ['rest', 'restful', 'rest api', 'rest apis', 'api', 'apis'], 'CI/CD': ['ci/cd', 'cicd', 'continuous integration'],
  'Machine Learning': ['machine learning', 'ml'], 'Deep Learning': ['deep learning', 'neural networks'], NLP: ['nlp', 'natural language processing'], 'Data Analysis': ['data analysis', 'data analytics', 'analytics', 'analysing data', 'analyzing data'], 'Data Visualization': ['data visualization', 'data visualisation', 'dashboards'],
  Excel: ['excel', 'spreadsheets', 'microsoft excel'], 'Power BI': ['power bi', 'powerbi'], Tableau: ['tableau'], Figma: ['figma'], 'UI/UX': ['ui/ux', 'ux', 'ui design', 'user experience', 'user interface'], Photoshop: ['photoshop', 'adobe photoshop'],
  Agile: ['agile', 'scrum', 'kanban', 'sprint', 'sprints'], 'Project Management': ['project management', 'project manager'], Communication: ['communication', 'communicating', 'communicate'], Teamwork: ['teamwork', 'collaboration', 'collaborative', 'collaborate'], Leadership: ['leadership', 'led', 'leading'],
  'Problem Solving': ['problem solving', 'problem-solving'], 'Public Speaking': ['public speaking', 'presentations', 'presenting'], 'Customer Service': ['customer service', 'customer support'], Marketing: ['marketing', 'digital marketing'], SEO: ['seo', 'search engine optimization'],
  'Content Writing': ['content writing', 'copywriting', 'content creation'], Accounting: ['accounting', 'bookkeeping'], Research: ['research', 'researching'], Networking: ['networking', 'tcp/ip'], Cybersecurity: ['cybersecurity', 'cyber security', 'information security'],
  Testing: ['testing', 'qa', 'unit testing', 'test cases'], Databases: ['database', 'databases', 'dbms'], Arabic: ['arabic'], English: ['english'],
};
const ALIAS = new Map(); Object.entries(SKILLS).forEach(([c, al]) => al.forEach((a) => ALIAS.set(a, c)));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (text, term) => new RegExp(`(?<![a-z0-9+#\\u0600-\\u06FF])${esc(term)}(?![a-z0-9+#\\u0600-\\u06FF])`, 'i').test(text);
const TOK = /[a-z][a-z0-9+#./-]*[a-z0-9+#]|[a-z]|[\u0600-\u06FF]+/gi;
const tokens = (t) => (t.toLowerCase().match(TOK) || []);
export const stem = (w) => (w.length > 5 && /ing$/.test(w) ? w.slice(0, -3) : w.length > 4 && /ed$/.test(w) ? w.slice(0, -2) : w.length > 4 && /es$/.test(w) ? w.slice(0, -2) : w.length > 3 && /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w);

/** Pulls the terms an employer cares about: known skills first, then repeated noun-like phrases. Terms under "preferred" headings are marked optional. */
export function extractKeywords(jd, max = 24) {
  const found = new Map(); let mode = 'normal';
  const add = (term, w, kind, pref) => { const e = found.get(term) || { term, w: 0, n: 0, kind, preferred: true }; e.w += w; e.n += 1; e.preferred = e.preferred && pref; found.set(term, e); };
  for (const raw of jd.split('\n')) {
    const l = raw.toLowerCase().trim(); if (!l) continue;
    if (l.length < 70 && /^(requirements?|qualifications?|what you('|’)ll need|must have|required|skills|what we('|’)re looking for)/.test(l)) mode = 'req';
    else if (l.length < 70 && /(preferred|nice to have|bonus|good to have|a plus)/.test(l)) mode = 'pref';
    else if (l.length < 70 && /^(responsibilities|about|benefits|what you('|’)ll do|who we are)/.test(l)) mode = 'normal';
    const w = mode === 'req' ? 1.6 : 1, pref = mode === 'pref' || /\b(preferred|nice to have|bonus|a plus)\b/.test(l);
    const seen = new Set();
    for (const [alias, canon] of ALIAS) if (!seen.has(canon) && has(l, alias)) { seen.add(canon); add(canon, 3 * w, 'skill', pref); }
    const tk = tokens(l);
    for (let n = 1; n <= 3; n++) for (let i = 0; i + n <= tk.length; i++) {
      const g = tk.slice(i, i + n);
      if (STOP.has(g[0]) || STOP.has(g[n - 1]) || g.some((x) => GENERIC.has(x) || /^\d+$/.test(x)) || g.some((x) => x.length < 2)) continue;
      if (n === 1 && (g[0].length < 4 || ALIAS.has(g[0]))) continue;
      if (n > 1 && g.some((x) => STOP.has(x))) continue;
      const key = g.join(' '); if (ALIAS.has(key)) continue;
      add(key, (n === 1 ? 1 : 1.5 * n) * w, 'term', pref);
    }
  }
  let list = [...found.values()].filter((e) => e.kind === 'skill' || e.n >= 2 || (e.w >= 2.4 && e.term.includes(' ')));
  list.sort((a, b) => b.w - a.w);
  const chosen = [];
  for (const e of list) { if (chosen.some((c) => c.kind === 'term' && e.kind === 'term' && (c.term.includes(e.term) || e.term.includes(c.term)))) continue; chosen.push(e); if (chosen.length >= max) break; }
  return chosen.map((e) => ({ term: e.term, weight: Math.round(e.w * 10) / 10, kind: e.kind, preferred: e.preferred }));
}

function presence(text, stems, kw) {
  const aliases = SKILLS[kw.term] ? SKILLS[kw.term].concat(kw.term.toLowerCase()) : [kw.term];
  let count = 0; for (const a of aliases) { const m = text.match(new RegExp(`(?<![a-z0-9+#])${esc(a)}(?![a-z0-9+#])`, 'gi')); if (m) count += m.length; }
  if (count) return { found: true, partial: false, count };
  const parts = kw.term.split(' ').map(stem); if (parts.length > 1 && parts.every((p) => stems.has(p))) return { found: true, partial: true, count: 1 };
  if (parts.length === 1 && stems.has(parts[0])) return { found: true, partial: false, count: 1 };
  return { found: false, partial: false, count: 0 };
}
function cosine(a, b) {
  const va = new Map(), vb = new Map(); const feed = (m, t) => { const tk = tokens(t).filter((x) => !STOP.has(x) && !GENERIC.has(x)).map(stem); tk.forEach((x, i) => { m.set(x, (m.get(x) || 0) + 1); if (i) m.set(tk[i - 1] + ' ' + x, (m.get(tk[i - 1] + ' ' + x) || 0) + 1); }); };
  feed(va, a); feed(vb, b); let dot = 0, na = 0, nb = 0; for (const [k, v] of va) { na += (1 + Math.log(v)) ** 2; if (vb.has(k)) dot += (1 + Math.log(v)) * (1 + Math.log(vb.get(k))); } for (const v of vb.values()) nb += (1 + Math.log(v)) ** 2;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

const NOT_VERB = new Set(['need', 'speed', 'seed', 'feed', 'bed', 'red', 'hundred', 'embedded', 'weed', 'indeed']);
const IRREG = new Set('led built ran wrote made won taught grew drove spoke sold began chose gave held kept met paid put set thought understood cut hit drew sent spent took brought found got did saw stood wrote forged shaped'.split(' '));
const BASE = new Set('lead build manage create design develop write analyse analyze organise organize coordinate teach present research test implement deliver maintain improve launch run support translate'.split(' '));
export const isActionVerb = (w) => { w = w.toLowerCase(); return IRREG.has(w) || BASE.has(w) || (w.length > 3 && w.endsWith('ed') && !NOT_VERB.has(w)); };
const WEAK = /\b(responsible for|duties (?:included|include)|worked on|helped (?:with|to)?|assisted (?:with|in)|tasked with|in charge of|involved (?:in|with)|participated in)\b/i;
const BUZZ = ['hard-working', 'hardworking', 'team player', 'go-getter', 'synergy', 'results-driven', 'self-motivated', 'detail-oriented', 'passionate', 'think outside the box', 'guru', 'ninja', 'rockstar', 'dynamic'];
const PRONOUN = /(^|[\s,;])(i|my|me|myself)(?=[\s,;.])/i;
const hasNumber = (s) => /\d/.test(s.replace(/\b(19|20)\d\d\b/g, ''));
const wc = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/** @param {{cv?:object,text?:string,jd?:string}} input */
export function analyse({ cv, text, jd = '' }) {
  const plain = cv ? cvPlainText(cv) : text || ''; const lang = cv?.lang || (/[\u0600-\u06FF]/.test(plain) ? 'ar' : 'en'); const en = lang === 'en';
  const lower = plain.toLowerCase(), stems = new Set(tokens(plain).map(stem)), words = wc(plain);
  const F = []; const push = (sev, cat, id, title, fix, items) => F.push({ sev, cat, id, title, fix, items });
  const ok = (id, title, cat) => F.push({ sev: 'good', cat, id, title });
  let bullets = [];
  if (cv) { for (const s of ['experience', 'projects', 'volunteering']) cv[s].forEach((e) => bulletsOf(e).forEach((b) => bullets.push({ text: b, section: s, entry: e[SCHEMA[s].primary] || '', current: !!e.current }))); }
  else {
    const lines = plain.split('\n'); const marked = lines.filter((l) => /^\s*[-•*▪●]\s*/.test(l)).map((l) => l.replace(/^\s*[-•*▪●]\s*/, '').trim());
    bullets = (marked.length ? marked : lines.map((l) => l.trim()).filter((l) => wc(l) >= 7 && wc(l) <= 40)).map((t) => ({ text: t, section: '', entry: '' }));
  }

  // Parseability
  const email = plain.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  email ? ok('email', 'Email address found', 'Parseability') : push('critical', 'Parseability', 'email', 'No email address', 'Add a professional email address near the top.');
  /(\+?\d[\d\s().-]{7,})/.test(plain) ? ok('phone', 'Phone number found', 'Parseability') : push('improve', 'Parseability', 'phone', 'No phone number', 'Add a phone number with the country code.');
  if (cv) {
    const heads = visibleSections(cv).filter((s) => s !== 'summary' && (s === 'skills' ? skillList(cv).length : cv[s]?.length));
    const need = ['education', 'skills']; const miss = need.filter((s) => !heads.includes(s));
    miss.length ? push('critical', 'Parseability', 'headings', 'Standard sections are missing', `Add: ${miss.map((s) => HEADINGS.en[s]).join(', ')}.`) : ok('headings', 'Standard section headings present', 'Parseability');
    heads.some((s) => ['experience', 'projects', 'volunteering'].includes(s)) ? ok('proof', 'Shows experience or projects', 'Content') : push('critical', 'Content', 'proof', 'No experience, project or volunteering entry', 'Add at least one project or activity with results. Coursework projects count.');
    const tpl = templateById(cv.template); tpl.cols === 2 ? push('improve', 'Parseability', 'columns', `The ${tpl.name} template uses two columns`, 'Many parsers read columns out of order. Use a single-column template for online applications and keep this one for handing out.') : ok('columns', 'Single-column layout', 'Parseability');
    ['arial', 'calibri', 'georgia', 'times', 'verdana'].includes(cv.design.font) || lang === 'ar' ? ok('font', 'Common font', 'Parseability') : push('improve', 'Parseability', 'font', 'Unusual font', 'Use Arial, Calibri, Georgia or Times New Roman.');
    const sizes = cv.design.size; sizes >= 10 && sizes <= 12 ? ok('size', 'Readable font size', 'Parseability') : push('improve', 'Parseability', 'size', `Font size ${sizes} pt`, 'Keep body text between 10 and 12 pt.');
    const rows = [...cv.experience, ...cv.education, ...cv.projects, ...cv.volunteering];
    const nodate = rows.filter((e) => !(e.start || e.end || e.date || e.current)); nodate.length && cv.experience.length ? push('improve', 'Parseability', 'dates', `${nodate.length} entr${nodate.length > 1 ? 'ies have' : 'y has'} no dates`, 'Give every job and education entry a start and end date.') : ok('dates', 'Entries have dates', 'Parseability');
    const bad = cv.experience.filter((e) => e.start && e.end && !e.current && e.start > e.end); bad.length && push('critical', 'Parseability', 'daterange', 'An end date is before its start date', 'Check the dates of: ' + bad.map((e) => e.role || e.org).join(', '));
    const ends = cv.experience.map((e) => (e.current ? '9999-99' : e.end || '0')); ends.every((x, i) => !i || ends[i - 1] >= x) || push('improve', 'Content', 'order', 'Experience is not newest first', 'List the most recent role first.');
  } else {
    if (/\t/.test(plain) || (plain.match(/\|/g) || []).length > 6) push('improve', 'Parseability', 'table', 'Tabs or many | characters suggest a table or columns', 'Tables and columns can scramble reading order. Use one column.');
    if (/\p{Extended_Pictographic}/u.test(plain)) push('improve', 'Parseability', 'emoji', 'Emoji or icons found', 'Remove emoji and icons. Parsers ignore or misread them.');
    const mixed = /\b(0?\d)\/(20\d\d)\b/.test(plain) && /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* 20\d\d\b/i.test(plain); mixed && push('improve', 'Parseability', 'datefmt', 'Mixed date formats', 'Use one format such as "Sep 2024" everywhere.');
    const hasHead = (h) => new RegExp(`^\\s*${h}`, 'im').test(plain); const missing = ['education', 'skills'].filter((h) => !hasHead(h)); missing.length ? push('critical', 'Parseability', 'headings', 'Standard headings are missing', `Add a heading for: ${missing.join(', ')}.`) : ok('headings', 'Standard section headings present', 'Parseability');
  }
  // Content and language
  if (cv) { const sw = wc(cv.summary); sw === 0 ? push('improve', 'Content', 'summary', 'No summary', 'Add 2 to 3 lines: who you are, your strongest skills, what you want.') : sw < 20 || sw > 70 ? push('improve', 'Content', 'summary', `Summary is ${sw} words`, 'Aim for 25 to 60 words.') : ok('summary', 'Summary length is good', 'Content'); }
  if (en && bullets.length) {
    const lens = bullets.filter((b) => wc(b.text) > 30 || wc(b.text) < 6); lens.length ? push('improve', 'Content', 'length', `${lens.length} bullet${lens.length > 1 ? 's are' : ' is'} too long or too short`, 'Aim for 8 to 25 words: what you did, how, and the result.', lens.slice(0, 4).map((b) => b.text)) : ok('length', 'Bullet length is good', 'Content');
    const verbs = bullets.filter((b) => isActionVerb(b.text.split(/\s+/)[0].replace(/[^a-z]/gi, ''))); verbs.length / bullets.length >= 0.7 ? ok('verbs', 'Bullets start with action verbs', 'Language') : push('improve', 'Language', 'verbs', 'Many bullets do not start with an action verb', 'Start with Built, Designed, Led, Analysed, Organised and similar.', bullets.filter((b) => !verbs.includes(b)).slice(0, 4).map((b) => b.text));
    const weak = bullets.filter((b) => WEAK.test(b.text)); weak.length ? push('improve', 'Language', 'weak', 'Weak phrases found', 'Replace "responsible for" and "worked on" with what you achieved.', weak.slice(0, 4).map((b) => b.text)) : ok('weak', 'No weak phrases', 'Language');
    const q = bullets.filter((b) => hasNumber(b.text)); q.length / bullets.length >= 0.4 ? ok('numbers', 'Enough bullets include numbers', 'Impact') : push('improve', 'Impact', 'numbers', `Only ${q.length} of ${bullets.length} bullets include a number`, 'Add a number to at least 4 in 10 bullets: users, hours, percentages, team size, marks.');
    const first = {}; bullets.forEach((b) => { const w = b.text.split(/\s+/)[0].toLowerCase(); first[w] = (first[w] || 0) + 1; }); const rep = Object.entries(first).filter(([, n]) => n >= 3).map(([w, n]) => `${w} (${n}×)`); rep.length && push('improve', 'Language', 'repeat', 'Repeated opening words', 'Vary your verbs: ' + rep.join(', '));
    const pron = bullets.filter((b) => PRONOUN.test(b.text)); pron.length && push('improve', 'Language', 'pronoun', 'First-person pronouns in bullets', 'Drop "I" and "my". Start with the verb.', pron.slice(0, 3).map((b) => b.text));
    if (cv) { const tense = bullets.filter((b) => !b.current && /^(manage|lead|build|create|design|develop|write|organi[sz]e|coordinate|teach)s?\b/i.test(b.text)); tense.length && push('improve', 'Language', 'tense', 'Past roles use present tense', 'Use past tense for finished roles and present tense only for your current one.', tense.slice(0, 3).map((b) => b.text)); }
  }
  const buzz = BUZZ.filter((b) => has(lower, b)); buzz.length && push('improve', 'Language', 'buzz', 'Buzzwords found', `Show it with evidence instead of saying: ${buzz.join(', ')}.`);
  if (cv) {
    const listed = skillList(cv), body = [...cv.experience, ...cv.projects, ...cv.volunteering, { bullets: [cv.summary] }].flatMap((e) => [...bulletsOf(e), e.tech || '', e.role || '']).join(' ').toLowerCase();
    const unproven = listed.filter((s) => !has(body, s.toLowerCase()) && !(ALIAS.get(s.toLowerCase()) && [...ALIAS].some(([a, c]) => c === ALIAS.get(s.toLowerCase()) && has(body, a)))); listed.length >= 4 && unproven.length / listed.length > 0.6 ? push('improve', 'Content', 'unproven', 'Most skills are not backed by a project or job', 'Mention your top skills inside a bullet that shows how you used them.', unproven.slice(0, 8)) : listed.length && ok('proven', 'Skills are backed by your work', 'Content');
    listed.length < 6 ? push('improve', 'Content', 'skillcount', `${listed.length} skills listed`, 'List 6 to 20 relevant skills.') : listed.length > 25 && push('improve', 'Content', 'skillcount', `${listed.length} skills listed`, 'Trim to the 20 most relevant to the role.');
    const dup = listed.filter((s, i) => listed.findIndex((x) => x.toLowerCase() === s.toLowerCase()) !== i); dup.length && push('improve', 'Content', 'dupskill', 'Duplicate skills', dup.join(', '));
    cv.education.some((e) => e.gpa) || push('improve', 'Content', 'gpa', 'No GPA or grade', 'Add your GPA or grade if it is strong. Employers often ask for it for first jobs.');
  }
  const pages = Math.max(1, Math.ceil(words / 520));
  words < 150 ? push('improve', 'Length', 'len', `Only ${words} words`, 'A student CV usually has 250 to 550 words.') : words > 700 ? push('improve', 'Length', 'len', `${words} words (about ${pages} pages)`, 'Keep a first CV to one page. Cut the oldest and least relevant lines.') : ok('len', `${words} words, about ${pages} page${pages > 1 ? 's' : ''}`, 'Length');

  // Job match
  let match = null;
  if (jd.trim().length > 30) {
    const kws = extractKeywords(jd).map((k) => ({ ...k, ...presence(lower, stems, k) }));
    const total = kws.filter((k) => !k.preferred).reduce((a, k) => a + k.weight, 0) + kws.filter((k) => k.preferred).reduce((a, k) => a + k.weight * 0.5, 0);
    const got = kws.reduce((a, k) => a + (k.found ? k.weight * (k.preferred ? 0.5 : 1) * (k.partial ? 0.6 : 1) : 0), 0);
    match = { coverage: total ? Math.round((got / total) * 100) : 0, similarity: Math.round(cosine(plain, jd) * 100), keywords: kws, missing: kws.filter((k) => !k.found), found: kws.filter((k) => k.found) };
    const stuffed = kws.filter((k) => k.count > 6); stuffed.length && push('improve', 'Job match', 'stuff', 'Keywords repeated too often', `Use each term naturally: ${stuffed.map((k) => k.term).join(', ')}.`);
    match.missing.filter((k) => !k.preferred).length > 3 && push('improve', 'Job match', 'missing', `${match.missing.filter((k) => !k.preferred).length} required terms are missing`, 'Add the ones that are true for you, inside a bullet or your skills list.', match.missing.filter((k) => !k.preferred).slice(0, 8).map((k) => k.term));
  }
  const weakBullets = bullets.map((b) => { const issues = []; if (en) { if (!isActionVerb(b.text.split(/\s+/)[0].replace(/[^a-z]/gi, ''))) issues.push('Start with an action verb'); if (WEAK.test(b.text)) issues.push('Replace the weak phrase'); if (!hasNumber(b.text)) issues.push('Add a number'); if (wc(b.text) > 30) issues.push('Shorten to 25 words or fewer'); } return { ...b, issues }; }).filter((b) => b.issues.length).sort((a, b) => b.issues.length - a.issues.length).slice(0, 8);
  const order = { critical: 0, improve: 1, good: 2 };
  return { words, pages, bullets: bullets.length, findings: F.sort((a, b) => order[a.sev] - order[b.sev]), match, weakBullets, counts: { critical: F.filter((f) => f.sev === 'critical').length, improve: F.filter((f) => f.sev === 'improve').length, good: F.filter((f) => f.sev === 'good').length } };
}
