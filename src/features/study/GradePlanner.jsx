import { useState } from 'react';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import { SCALES, gpa, gpaFor, letterFor, neededAverage, weighted } from '@/domain/grades.js';
import { useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';
import { uid } from '@/lib/id.js';

const r1 = (n) => Math.round(n * 10) / 10, r2 = (n) => Math.round(n * 100) / 100;
export default function GradePlanner() {
  const { t } = useT(); const store = useUserStore();
  const courses = useData((s) => s.courses), scale = useData((s) => s.scale), rows = useData((s) => s.scaleRows), prior = useData((s) => s.prior), targetGpa = useData((s) => s.targetGpa);
  const [sel, setSel] = useState(courses[0]?.id);
  const upd = (id, fn) => store.set((s) => ({ courses: s.courses.map((c) => (c.id === id ? fn(c) : c)) }));
  const data = courses.map((c) => { const res = weighted(c.items, +c.target || 0), assume = c.assume ?? res.average ?? 70, pct = res.all ? ((res.earned + (res.remaining * assume) / 100) * 100) / res.all : null; return { ...c, res, assume, pct, gp: pct == null ? 0 : gpaFor(pct, rows) }; });
  const g = gpa(data, prior), need = targetGpa !== '' && data.length ? neededAverage(data, rows, +targetGpa) : undefined;
  const cur = data.find((c) => c.id === sel) || data[0];
  const addCourse = (e) => { e.preventDefault(); const f = new FormData(e.target), id = uid(); store.set((s) => ({ courses: [...s.courses, { id, name: String(f.get('name')).trim(), credits: +f.get('credits') || 3, target: 80, items: [] }] })); setSel(id); e.target.reset(); };
  return (
    <>
      <PageHead title="Grade Planner" desc="Enter each course's assessments and weights. Leave a grade empty for work not marked yet: it is never counted as zero. Results are scenarios, not official grades." />
      <section className="panel form"><h2>{t('Grading scale')}</h2>
        <div className="grid-3"><label>{t('Scale')}<select value={scale} onChange={(e) => { const k = e.target.value; store.set({ scale: k, ...(SCALES[k] ? { scaleRows: SCALES[k].rows } : {}) }); }}>{Object.entries(SCALES).map(([k, v]) => <option key={k} value={k}>{t(v.name)}</option>)}<option value="custom">{t('Custom')}</option></select></label>
          <label>{t('GPA before this semester')}<input type="number" step="0.01" min={0} max={4} value={prior.gpa} onChange={(e) => store.set({ prior: { ...prior, gpa: e.target.value } })} /></label><label>{t('Credit hours before this semester')}<input type="number" min={0} max={300} value={prior.credits} onChange={(e) => store.set({ prior: { ...prior, credits: e.target.value } })} /></label></div>
        <details><summary>{t('Edit the scale')}</summary><p className="help">{t('Scales differ between faculties. Check yours and edit the rows.')}</p>
          <div className="scale">{rows.map((r, i) => <div key={i} className="scale-row"><label>{t('From %')}<input type="number" value={r[0]} onChange={(e) => store.set({ scale: 'custom', scaleRows: rows.map((x, j) => (j === i ? [+e.target.value, x[1], x[2]] : x)) })} /></label><label>GPA<input type="number" step="0.1" value={r[1]} onChange={(e) => store.set({ scale: 'custom', scaleRows: rows.map((x, j) => (j === i ? [x[0], +e.target.value, x[2]] : x)) })} /></label><label>{t('Letter')}<input value={r[2]} maxLength={3} onChange={(e) => store.set({ scale: 'custom', scaleRows: rows.map((x, j) => (j === i ? [x[0], x[1], e.target.value] : x)) })} /></label></div>)}</div></details></section>

      <div className="tabs" role="tablist" aria-label={t('Courses')}>{data.map((c) => <button key={c.id} role="tab" aria-selected={cur?.id === c.id} className={`tab${cur?.id === c.id ? ' active' : ''}`} onClick={() => setSel(c.id)}>{c.name || t('Course')}</button>)}</div>
      <form className="panel form" onSubmit={addCourse}><h2>{t('Add a course')}</h2><div className="grid-3"><label>{t('Course name')}<input name="name" required maxLength={60} placeholder="Database Systems" /></label><label>{t('Credit hours')}<input name="credits" type="number" min={1} max={12} defaultValue={3} /></label><div className="end"><Button type="submit">{t('Add course')}</Button></div></div></form>

      {cur ? (<section className="panel"><div className="row between"><h2>{cur.name}</h2><Button variant="ghost" size="sm" onClick={() => { store.set((s) => ({ courses: s.courses.filter((c) => c.id !== cur.id) })); setSel(undefined); }}>{t('Delete course')}</Button></div>
        <div className="grade-head"><span>{t('Item')}</span><span>{t('Weight %')}</span><span>{t('Grade %')}</span><span /></div>
        {cur.items.map((i) => (<div key={i.id} className="grade-row"><input aria-label={t('Item')} value={i.name} maxLength={60} placeholder="Midterm" onChange={(e) => upd(cur.id, (c) => ({ ...c, items: c.items.map((x) => (x.id === i.id ? { ...x, name: e.target.value } : x)) }))} />
          <input aria-label={t('Weight %')} type="number" min={0} max={100} value={i.weight} onChange={(e) => upd(cur.id, (c) => ({ ...c, items: c.items.map((x) => (x.id === i.id ? { ...x, weight: e.target.value } : x)) }))} />
          <input aria-label={t('Grade %')} type="number" min={0} max={100} value={i.grade} onChange={(e) => upd(cur.id, (c) => ({ ...c, items: c.items.map((x) => (x.id === i.id ? { ...x, grade: e.target.value } : x)) }))} />
          <Button variant="ghost" size="sm" onClick={() => upd(cur.id, (c) => ({ ...c, items: c.items.filter((x) => x.id !== i.id) }))} aria-label={`${t('Remove')} ${i.name}`}>×</Button></div>))}
        <div className="row"><Button variant="secondary" onClick={() => upd(cur.id, (c) => ({ ...c, items: [...c.items, { id: uid(), name: '', weight: '', grade: '' }] }))}>{t('Add item')}</Button>
          {!cur.items.length && <Button variant="ghost" size="sm" onClick={() => upd(cur.id, (c) => ({ ...c, items: [['Quizzes', 10], ['Assignments', 20], ['Midterm', 20], ['Final exam', 50]].map(([name, weight]) => ({ id: uid(), name, weight, grade: '' })) }))}>{t('Start from a typical split')}</Button>}</div>
        <div className="grid-2 mt"><label>{t('Target for this course %')}<input type="number" min={0} max={100} value={cur.target} onChange={(e) => upd(cur.id, (c) => ({ ...c, target: e.target.value }))} /></label>
          <label>{t('If you score this on the rest')}: <b>{r1(cur.assume)}%</b><input type="range" min={0} max={100} step={1} value={cur.assume} onChange={(e) => upd(cur.id, (c) => ({ ...c, assume: +e.target.value }))} /></label></div>
        {cur.res.all === 0 ? <p className="muted">{t('Add items with a weight to see your result.')}</p> : (<div className="stats4"><div className="statcard"><b>{cur.res.average == null ? '–' : `${r1(cur.res.average)}%`}</b><small>{t('Average on graded work')}</small></div><div className="statcard"><b>{cur.res.graded}%</b><small>{t('of course weight graded')}</small></div><div className="statcard"><b>{cur.res.needed == null ? '–' : `${r1(cur.res.needed)}%`}</b><small>{t('Needed on the rest')}</small></div><div className="statcard"><b>{cur.pct == null ? '–' : `${r1(cur.pct)}%`} · {cur.pct == null ? '' : letterFor(cur.pct, rows)}</b><small>{t('Projected')}</small></div></div>)}
        {cur.res.all > 0 && cur.res.all !== 100 && <p className="notice warn">{t('Weights add up to {n}%, not 100%. Check them before you rely on this.', { n: r1(cur.res.all) })}</p>}
        {cur.res.needed != null && cur.res.needed > 100 && <p className="notice bad">{t('This target is not reachable with the work left.')}</p>}
        {cur.res.needed != null && cur.res.needed < 0 && <p className="notice ok">{t('You have already reached this target.')}</p>}</section>) : <Empty>Add your first course to start.</Empty>}

      {data.length > 0 && (<section className="panel" aria-live="polite"><h2>{t('Semester')}</h2>
        <table className="tbl"><thead><tr><th>{t('Course')}</th><th>{t('Credits')}</th><th>{t('Projected')}</th><th>{t('Letter')}</th><th>GPA</th></tr></thead><tbody>{data.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.credits}</td><td>{c.pct == null ? '–' : `${r1(c.pct)}%`}</td><td>{c.pct == null ? '–' : letterFor(c.pct, rows)}</td><td>{c.pct == null ? '–' : c.gp}</td></tr>)}</tbody></table>
        <div className="stats4 three"><div className="statcard"><b>{g.semester == null ? '–' : r2(g.semester)}</b><small>{t('Semester GPA')}</small></div><div className="statcard"><b>{g.cumulative == null ? '–' : r2(g.cumulative)}</b><small>{t('Cumulative GPA')}</small></div><div className="statcard"><b>{g.credits}</b><small>{t('credit hours')}</small></div></div>
        <label className="inline-sel">{t('Semester GPA I want')}<input type="number" step="0.05" min={0} max={4} value={targetGpa} onChange={(e) => store.set({ targetGpa: e.target.value })} style={{ maxWidth: 110 }} /></label>
        {need === null && <p className="notice bad">{t('That GPA is not reachable with the work left.')}</p>}{need === 0 && <p className="notice ok">{t('You are already on track for that GPA.')}</p>}{typeof need === 'number' && need > 0 && <p className="notice">{t('You need about {n}% on all the remaining work, across your courses.', { n: need })}</p>}
        <p className="help">{t('Projected grades use the score you set for the rest of each course. They are scenarios, not official results.')}</p></section>)}
    </>
  );
}
