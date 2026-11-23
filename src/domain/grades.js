/** Ungraded work is never counted as zero. Weights are percentages of the whole course. */
export function weighted(items, target) {
  const num = (v) => (v === '' || v == null || Number.isNaN(+v) ? null : +v);
  const rows = items.map((i) => ({ w: num(i.weight) ?? 0, g: num(i.grade) })).filter((r) => r.w > 0);
  const all = rows.reduce((a, r) => a + r.w, 0);
  const graded = rows.filter((r) => r.g !== null);
  const wG = graded.reduce((a, r) => a + r.w, 0);
  const earned = graded.reduce((a, r) => a + (r.g * r.w) / 100, 0);
  const remaining = all - wG;
  return { all, graded: wG, remaining, earned, average: wG ? (earned / wG) * 100 : null, needed: remaining > 0 ? ((target - earned) / remaining) * 100 : null };
}

/** Grade scales are editable because faculties differ. Presets are common defaults, not official rules. */
export const SCALES = {
  egypt: { name: 'Common Egyptian university scale', rows: [[97, 4, 'A+'], [93, 4, 'A'], [89, 3.7, 'A-'], [84, 3.3, 'B+'], [80, 3, 'B'], [76, 2.7, 'B-'], [73, 2.3, 'C+'], [70, 2, 'C'], [67, 1.7, 'C-'], [64, 1.3, 'D+'], [60, 1, 'D'], [0, 0, 'F']] },
  us: { name: 'US 4.0 scale', rows: [[93, 4, 'A'], [90, 3.7, 'A-'], [87, 3.3, 'B+'], [83, 3, 'B'], [80, 2.7, 'B-'], [77, 2.3, 'C+'], [73, 2, 'C'], [70, 1.7, 'C-'], [67, 1.3, 'D+'], [63, 1, 'D'], [60, 0.7, 'D-'], [0, 0, 'F']] },
};
export const scaleRow = (pct, rows) => [...rows].sort((a, b) => b[0] - a[0]).find((r) => pct >= r[0]) || [0, 0, 'F'];
export const gpaFor = (pct, rows) => scaleRow(pct, rows)[1];
export const letterFor = (pct, rows) => scaleRow(pct, rows)[2];

/** Credit-weighted GPA of courses with a percentage each. prior = {gpa, credits}. */
export function gpa(courses, prior) {
  const list = courses.filter((c) => c.pct != null && c.credits > 0); const cr = list.reduce((a, c) => a + c.credits, 0);
  const sem = cr ? list.reduce((a, c) => a + c.gp * c.credits, 0) / cr : null;
  const pc = +prior?.credits || 0, pg = +prior?.gpa || 0;
  return { semester: sem, credits: cr, cumulative: cr || pc ? ((sem || 0) * cr + pg * pc) / (cr + pc) : null };
}
/** One percentage on all remaining work that lands the semester GPA on target, found by bisection. Returns null if unreachable. */
export function neededAverage(courses, rows, targetGpa) {
  const at = (x) => { const cs = courses.map((c) => { const r = c.res; const pct = r.all ? r.earned + (r.remaining * x) / 100 : null; return { credits: c.credits, pct, gp: pct == null ? 0 : gpaFor(pct, rows) }; }); return gpa(cs).semester; };
  if (at(100) < targetGpa) return null; if (at(0) >= targetGpa) return 0;
  let lo = 0, hi = 100; for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; at(mid) >= targetGpa ? (hi = mid) : (lo = mid); } return Math.ceil(hi * 10) / 10;
}
