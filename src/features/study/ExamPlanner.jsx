import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Bar, Empty } from '@/components/ui/Bits.jsx';
import ShareDialog from '@/features/share/ShareDialog.jsx';
import { KINDS, planExam } from '@/domain/examPlan.js';
import { award, useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';
import { addDays, niceDate, todayISO } from '@/lib/dates.js';
import { uid } from '@/lib/id.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PRESETS = { Light: [30, 30, 30, 30, 30, 60, 60], Normal: [45, 45, 45, 45, 45, 90, 90], Intense: [90, 90, 90, 90, 90, 150, 150] };
const CONF = [[1, 'Not started'], [2, 'Shaky'], [3, 'OK'], [4, 'Good'], [5, 'Strong']];
const blankForm = () => ({ name: '', date: addDays(todayISO(), 14), topics: [{ id: uid(), name: '', confidence: 2 }], week: [...PRESETS.Normal], sessionLen: 30, mock: false, mockMins: 90, offDays: [] });
const daysTo = (iso) => Math.round((new Date(iso + 'T00:00:00') - new Date(todayISO() + 'T00:00:00')) / 864e5);

export default function ExamPlanner() {
  const { t, lang } = useT(); const store = useUserStore(), nav = useNavigate(); const plans = useData((s) => s.plans), tasks = useData((s) => s.tasks);
  const [f, setF] = useState(blankForm), [res, setRes] = useState(null), [error, setError] = useState(''), [share, setShare] = useState(null), [off, setOff] = useState('');
  const set = (k, v) => setF((x) => ({ ...x, [k]: v })); const setTopic = (i, k, v) => set('topics', f.topics.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const run = (e) => {
    e.preventDefault(); const topics = f.topics.filter((x) => x.name.trim()).map((x) => ({ name: x.name.trim(), confidence: +x.confidence }));
    if (f.date <= todayISO()) return setError('Choose an exam date after today.'); if (!topics.length) return setError('Add at least one topic.'); setError('');
    setRes({ name: f.name.trim(), date: f.date, topics, ...planExam({ date: f.date, topics, week: f.week.map(Number), offDays: f.offDays, sessionLen: +f.sessionLen, mockMins: f.mock ? +f.mockMins : 0 }) });
  };
  const confirm = () => {
    const planId = uid();
    store.set((s) => ({ tasks: [...s.tasks, ...res.sessions.map((x) => ({ id: uid(), planId, title: x.title, course: res.name, due: x.due, mins: x.mins, kind: x.kind, done: false }))], plans: [...s.plans, { id: planId, name: res.name, date: res.date, topics: res.topics, week: f.week, sessionLen: f.sessionLen, created: todayISO() }] }));
    award(store, 'plan', 15); setRes(null); nav('/app/today');
  };
  const byDate = res ? res.sessions.reduce((m, s) => ((m[s.due] ||= []).push(s), m), {}) : {};
  const payload = (p) => ({ kind: 'plan', title: p.name, date: p.date, sessions: tasks.filter((x) => x.planId === p.id).map((x) => ({ title: x.title, due: x.due, mins: x.mins || 0 })) });
  const replan = (p) => { store.set((s) => ({ tasks: s.tasks.filter((x) => x.planId !== p.id || x.done), plans: s.plans.filter((x) => x.id !== p.id) })); setF({ ...blankForm(), name: p.name, date: p.date, topics: p.topics.map((x) => ({ id: uid(), ...x })), week: p.week, sessionLen: p.sessionLen }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <>
      <PageHead title="Exam Planner" desc="Tell ProofCraft the exam date, how confident you feel about each topic and how many minutes you really have on each weekday. It builds a schedule backwards from the exam, and you confirm it before anything reaches Today." />
      <div className="split">
        <form className="panel form" onSubmit={run}>
          <div className="grid-2"><label>{t('Exam name')}<input value={f.name} onChange={(e) => set('name', e.target.value)} required maxLength={80} placeholder="Database Systems midterm" /></label><label>{t('Exam date')}<input type="date" value={f.date} min={addDays(todayISO(), 1)} onChange={(e) => set('date', e.target.value)} required /></label></div>
          <fieldset><legend>{t('Topics and how you feel about them')}</legend>
            {f.topics.map((x, i) => (<div key={x.id} className="row nowrap"><input aria-label={t('Topic')} value={x.name} maxLength={80} placeholder={t('Topic, e.g. Normalisation')} onChange={(e) => setTopic(i, 'name', e.target.value)} /><select aria-label={t('Confidence')} value={x.confidence} onChange={(e) => setTopic(i, 'confidence', e.target.value)} style={{ maxWidth: 150 }}>{CONF.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}</select><Button variant="ghost" size="sm" onClick={() => set('topics', f.topics.length > 1 ? f.topics.filter((_, j) => j !== i) : f.topics)} aria-label={t('Remove')}>×</Button></div>))}
            <Button variant="secondary" size="sm" onClick={() => set('topics', [...f.topics, { id: uid(), name: '', confidence: 2 }])} disabled={f.topics.length >= 30}>{t('Add topic')}</Button><span className="help">{t('Weaker topics get more sessions.')}</span></fieldset>
          <fieldset><legend>{t('Minutes you can study each day')}</legend>
            <div className="week">{DAYS.map((d, i) => <label key={d}>{t(d)}<input type="number" min={0} max={600} step={5} value={f.week[i]} onChange={(e) => set('week', f.week.map((v, j) => (j === i ? e.target.value : v)))} /></label>)}</div>
            <div className="row">{Object.keys(PRESETS).map((k) => <Button key={k} variant="secondary" size="sm" onClick={() => set('week', [...PRESETS[k]])}>{t(k)}</Button>)}</div></fieldset>
          <div className="grid-2"><label>{t('Session length')}<select value={f.sessionLen} onChange={(e) => set('sessionLen', e.target.value)}>{[25, 30, 45, 60].map((m) => <option key={m} value={m}>{m} {t('min')}</option>)}</select></label>
            <label className="check mt">{<input type="checkbox" checked={f.mock} onChange={(e) => set('mock', e.target.checked)} />} {t('Include a mock exam')}{f.mock && <input type="number" aria-label={t('Mock exam minutes')} min={30} max={240} value={f.mockMins} onChange={(e) => set('mockMins', e.target.value)} style={{ maxWidth: 90 }} />}</label></div>
          <fieldset><legend>{t('Days off')}</legend><div className="row"><input type="date" value={off} min={addDays(todayISO(), 1)} onChange={(e) => setOff(e.target.value)} aria-label={t('Day off')} style={{ maxWidth: 190 }} /><Button variant="secondary" size="sm" onClick={() => { if (off && !f.offDays.includes(off)) set('offDays', [...f.offDays, off].sort()); setOff(''); }}>{t('Add day off')}</Button></div>
            <div className="chips">{f.offDays.map((d) => <span key={d} className="chip">{niceDate(d, lang)}<button type="button" className="chip-btn" onClick={() => set('offDays', f.offDays.filter((x) => x !== d))} aria-label={`${t('Remove')} ${d}`}>×</button></span>)}</div></fieldset>
          {error && <p className="err" role="alert">{t(error)}</p>}
          <Button type="submit">{t('Build my plan')}</Button>
        </form>
        <div aria-live="polite">
          {res ? (
            <section className="panel"><h2>{res.name || t('Your plan')}</h2><p className="muted">{niceDate(res.date, lang)} · {daysTo(res.date)} {t('days left')}</p>
              <div className="stats4 three"><div className="statcard"><b>{res.sessions.length}</b><small>{t('sessions')}</small></div><div className="statcard"><b>{Math.round(res.totalMins / 6) / 10}</b><small>{t('hours in total')}</small></div><div className="statcard"><b>{res.days}</b><small>{t('study days')}</small></div></div>
              {res.uncovered.length > 0 && <p className="notice warn">{t('These topics did not get all their sessions:')} <b>{res.uncovered.join(', ')}</b>. {t('Add minutes, remove a day off or move the date.')}</p>}
              {res.notes.includes('mock') && <p className="notice warn">{t('No day has enough free time for the mock exam.')}</p>}
              {res.sessions.length === 0 && <p className="notice bad">{t('No sessions fit. Check the date and your daily minutes.')}</p>}
              {Object.entries(byDate).map(([d, list]) => (<div key={d} className="day"><h3 className="group-h">{niceDate(d, lang)} <span className="muted">{list.reduce((a, s) => a + s.mins, 0)} {t('min')}</span></h3>
                <ul className="list">{list.map((s) => <li key={s.id} className="item"><span className={`kind k-${s.kind}`}>{t(KINDS[s.kind])}</span><span className="grow">{s.topic}</span><small className="muted">{s.mins} {t('min')}</small><Button variant="ghost" size="sm" onClick={() => setRes({ ...res, sessions: res.sessions.filter((x) => x.id !== s.id) })} aria-label={`${t('Remove')} ${s.title}`}>×</Button></li>)}</ul></div>))}
              <div className="row"><Button onClick={confirm} disabled={!res.sessions.length}>{t('Confirm and add to Today')}</Button><Button variant="secondary" onClick={() => setShare({ kind: 'plan', title: res.name || 'Study plan', date: res.date, sessions: res.sessions.map(({ title, due, mins }) => ({ title, due, mins })) })} disabled={!res.sessions.length}>{t('Share')}</Button><Button variant="ghost" onClick={() => setRes(null)}>{t('Discard')}</Button></div>
            </section>
          ) : <Empty>Your plan appears here first. Nothing is added to Today until you confirm.</Empty>}
        </div>
      </div>
      {plans.length > 0 && (<section className="panel"><h2>{t('Your plans')}</h2><ul className="list">{plans.map((p) => { const mine = tasks.filter((x) => x.planId === p.id), done = mine.filter((x) => x.done).length, left = daysTo(p.date);
        return (<li key={p.id} className="item top"><div className="grow"><b>{p.name || t('Study plan')}</b><small className="muted">{niceDate(p.date, lang)} · {left >= 0 ? `${left} ${t('days left')}` : t('Exam passed')}</small><Bar value={mine.length ? (done / mine.length) * 100 : 0} /><small className="muted">{done} / {mine.length} {t('sessions done')}</small></div>
          <div className="row"><Button variant="secondary" size="sm" onClick={() => setShare(payload(p))}>{t('Share')}</Button><Button variant="secondary" size="sm" onClick={() => replan(p)} disabled={left <= 0}>{t('Re-plan remaining')}</Button><Button variant="ghost" size="sm" onClick={() => store.set((s) => ({ tasks: s.tasks.filter((x) => x.planId !== p.id || x.done), plans: s.plans.filter((x) => x.id !== p.id) }))}>{t('Delete')}</Button></div></li>); })}</ul></section>)}
      <ShareDialog open={!!share} onClose={() => setShare(null)} payload={share || {}} />
    </>
  );
}
