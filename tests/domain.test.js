import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rate, STEPS, queue, parseCards, forecast } from '../src/domain/srs.js';
import { weighted, gpa, gpaFor, SCALES, neededAverage } from '../src/domain/grades.js';
import { planExam } from '../src/domain/examPlan.js';
import { analyse, extractKeywords, isActionVerb } from '../src/domain/ats.js';
import { newCv, cvPlainText, toJsonResume, fromJsonResume, completeness, emptyEntry } from '../src/domain/cv.js';
import { stats, moveStage, toCsv } from '../src/domain/tracker.js';
import { sanitizeShare, encodeShare, decodeShare } from '../src/lib/share.js';
import { toIcs } from '../src/lib/ics.js';

test('spaced review ladder: got, easy, hard, again', () => {
  let c = { n: 0 }; const got = []; for (let i = 0; i < 6; i++) { c = rate(c, 'got', '2026-01-01'); got.push(c.due); }
  assert.deepEqual([got[0], got[1], got[5]], ['2026-01-02', '2026-01-04', '2026-01-31']); assert.equal(STEPS.length, 5);
  assert.ok(rate({ n: 0 }, 'easy', '2026-01-01').due > rate({ n: 0 }, 'got', '2026-01-01').due);
  assert.ok(rate({ n: 2 }, 'hard', '2026-01-01').due <= rate({ n: 2 }, 'got', '2026-01-01').due); assert.equal(rate({ n: 3 }, 'again', '2026-01-01').n, 0);
});
test('daily new-card limit, import parsing and forecast', () => {
  const cards = Array.from({ length: 15 }, (_, i) => ({ id: i, due: '2026-01-01', reps: 0 })).concat([{ id: 99, due: '2026-01-01', reps: 3 }]);
  assert.equal(queue(cards, { newLimit: 10, now: '2026-01-01' }).length, 11); assert.equal(queue(cards, { newLimit: 10, newToday: 10, now: '2026-01-01' }).length, 1);
  assert.deepEqual(parseCards('What is 1NF;Atomic values\n"A, B","C ""x"""\nbad line').map((c) => c.q), ['What is 1NF', 'A, B']);
  assert.equal(forecast([{ due: '2026-01-02' }], 3, '2026-01-01')[1].count, 1);
});
test('grades: ungraded is not zero; GPA scale; needed average', () => {
  const r = weighted([{ weight: 40, grade: 80 }, { weight: 60, grade: '' }], 90); assert.equal(r.average, 80); assert.ok(Math.abs(r.needed - 96.67) < 0.01);
  assert.equal(gpaFor(95, SCALES.egypt.rows), 4); assert.equal(gpaFor(71, SCALES.egypt.rows), 2); assert.equal(gpaFor(59, SCALES.us.rows), 0);
  const g = gpa([{ pct: 90, gp: 3.7, credits: 3 }, { pct: 80, gp: 3, credits: 3 }], { gpa: 3, credits: 30 }); assert.ok(Math.abs(g.semester - 3.35) < 1e-9); assert.ok(g.cumulative < g.semester);
  const c1 = { credits: 3, res: weighted([{ weight: 50, grade: 70 }, { weight: 50, grade: '' }], 80) };
  const need = neededAverage([c1], SCALES.us.rows, 3); assert.ok(need > 80 && need < 100); assert.equal(neededAverage([c1], SCALES.us.rows, 4.5), null);
});
test('exam plan: weak topics get more sessions, nothing after exam, review day, uncovered reported', () => {
  const p = planExam({ date: '2026-01-15', from: '2026-01-02', topics: [{ name: 'A', confidence: 1 }, { name: 'B', confidence: 5 }], week: Array(7).fill(60) });
  const n = (t) => p.sessions.filter((s) => s.topic === t && ['learn', 'practice'].includes(s.kind)).length;
  assert.ok(n('A') > n('B')); assert.ok(p.sessions.every((s) => s.due < '2026-01-15')); assert.ok(p.sessions.some((s) => s.kind === 'review'));
  const days = p.sessions.filter((s) => s.topic === 'A').map((s) => s.due); assert.equal(new Set(days).size, days.length);
  const tight = planExam({ date: '2026-01-04', from: '2026-01-02', topics: [{ name: 'X', confidence: 1 }], week: Array(7).fill(30) }); assert.ok(tight.uncovered.includes('X'));
  const off = planExam({ date: '2026-01-10', from: '2026-01-02', topics: [{ name: 'A', confidence: 3 }], offDays: ['2026-01-03'], week: Array(7).fill(60) }); assert.ok(off.sessions.every((s) => s.due !== '2026-01-03'));
});
test('keyword extraction finds skills, aliases and requirement terms', () => {
  const jd = 'Junior Data Analyst\nRequirements\n- SQL and Excel for data analysis\n- Build dashboards in Power BI\n- Strong communication\nNice to have\n- Python\nYou will analyse data and report to the data team. SQL queries every day.';
  const k = extractKeywords(jd).map((x) => x.term); for (const t of ['SQL', 'Excel', 'Power BI', 'Python', 'Communication']) assert.ok(k.includes(t), t);
  assert.equal(extractKeywords(jd).find((x) => x.term === 'Python').preferred, true);
});
test('ATS analysis: findings, job match, no hiring score', () => {
  const cv = newCv({ name: 'Nour Hassan' }); cv.personal.email = 'nour@mail.com'; cv.summary = 'Data student who builds dashboards and analyses survey data for campus clubs with SQL and Excel every week.';
  cv.education = [{ ...emptyEntry('education'), school: 'Damietta University', degree: 'B.Sc.', end: '2027-06', gpa: '3.4' }];
  cv.projects = [{ ...emptyEntry('projects'), name: 'Clinic DB', tech: 'SQL', bullets: ['Designed a 9-table SQL schema for a campus clinic app', 'Responsible for testing', 'helped with docs'] }];
  cv.skills = [{ id: 's', group: 'Tech', items: 'SQL, Excel, Python, Git, Figma, Docker' }];
  const r = analyse({ cv, jd: 'Requirements\nSQL, Excel, Power BI dashboards, communication.' });
  assert.equal(r.score, undefined); assert.ok(r.findings.some((f) => f.id === 'weak')); assert.ok(r.findings.some((f) => f.id === 'phone'));
  assert.ok(r.match.found.some((k) => k.term === 'SQL')); assert.ok(r.match.missing.some((k) => k.term === 'Power BI')); assert.ok(r.match.coverage > 0 && r.match.coverage < 100);
  cv.template = 'sidebar'; assert.ok(analyse({ cv }).findings.some((f) => f.id === 'columns' && f.sev === 'improve'));
  assert.ok(isActionVerb('Designed') && !isActionVerb('Responsible'));
});
test('CV model: plain text, JSON Resume round trip, completeness', () => {
  const cv = newCv({ name: 'Nour' }); cv.experience = [{ ...emptyEntry('experience'), role: 'Intern', org: 'Baianat', start: '2025-07', end: '2025-09', bullets: ['Built a dashboard for 40 users'] }];
  assert.match(cvPlainText(cv), /EXPERIENCE\nIntern, Baianat\nJul 2025 – Sep 2025\n- Built a dashboard/); 
  const back = fromJsonResume(toJsonResume(cv)); assert.equal(back.experience[0].org, 'Baianat'); assert.equal(back.experience[0].bullets[0], 'Built a dashboard for 40 users');
  assert.ok(completeness(cv).percent < 60); assert.ok(completeness(cv).missing.includes('email'));
});
test('tracker funnel, stage history and csv escaping', () => {
  let a = { role: 'Intern', company: 'A, "B"', stage: 'Saved', history: [] }; a = moveStage(a, 'Applied', '2026-01-02'); a = moveStage(a, 'Interview', '2026-01-09');
  const s = stats([a, { stage: 'Applied', history: [] }, { stage: 'Saved', history: [] }]); assert.equal(s.applied, 2); assert.equal(s.interviews, 1); assert.equal(s.response, 50);
  assert.match(toCsv([a]), /"A, ""B"""/); assert.equal(a.applied, '2026-01-02');
});
test('share links round-trip and reject hostile payloads', async () => {
  const tok = await encodeShare({ kind: 'plan', title: 'Exam', by: 'Nour', date: '2026-02-01', sessions: [{ title: 'x', due: '2026-01-10', mins: 25 }] });
  assert.equal((await decodeShare(tok)).sessions[0].mins, 25); assert.equal(sanitizeShare({ kind: 'script' }), null); assert.equal(await decodeShare('zzzz'), null);
});
test('ics uses exclusive end date', () => { assert.match(toIcs([{ id: 'a', title: 'Lab, report', due: '2026-03-31' }]), /DTEND;VALUE=DATE:20260401/); });
