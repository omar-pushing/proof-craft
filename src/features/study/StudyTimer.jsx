import { useEffect, useState } from 'react';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Bar, Empty } from '@/components/ui/Bits.jsx';
import { bySubject, elapsedMs, fmtClock, minsOn, POMO, PRESETS, remainingMs, weekTotals } from '@/domain/timer.js';
import { discardTimer, finishTimer, lapTimer, pauseTimer, resumeTimer, startTimer } from '@/state/timerActions.js';
import { useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';
import { addDays, niceDate, todayISO } from '@/lib/dates.js';

export const useNow = (on) => { const [n, setN] = useState(Date.now()); useEffect(() => { if (!on) return; setN(Date.now()); const id = setInterval(() => setN(Date.now()), 250); return () => clearInterval(id); }, [on]); return n; };
const R = 92, C = 2 * Math.PI * R;

export default function StudyTimer() {
  const { t, lang } = useT(); const store = useUserStore();
  const active = useData((s) => s.activeTimer), log = useData((s) => s.timeLog), goal = useData((s) => s.goalMins), sound = useData((s) => s.soundOn), plans = useData((s) => s.plans), decks = useData((s) => s.decks), courses = useData((s) => s.courses);
  const [mode, setMode] = useState(active?.mode || 'timer'), [mins, setMins] = useState(25), [pomo, setPomo] = useState('off'), [subject, setSubject] = useState('');
  const now = useNow(!!active?.running); const td = todayISO();
  const shownMode = active ? active.mode : mode;
  const ms = active ? (active.mode === 'timer' ? remainingMs(active, now) : elapsedMs(active, now)) : mode === 'timer' ? mins * 60000 : 0;
  const frac = active?.mode === 'timer' && active.targetMs ? 1 - remainingMs(active, now) / active.targetMs : 0;
  const names = [...new Set([...plans.map((p) => p.name), ...decks.map((d) => d.name), ...courses.map((c) => c.name)].filter(Boolean))];
  const today = minsOn(log, td), week = weekTotals(log), maxW = Math.max(goal, ...week.map((w) => w.mins), 1), subj = bySubject(log, addDays(td, -6));
  return (
    <>
      <PageHead title="Study Timer" desc="Time your study with a countdown or a stopwatch, tag it with a subject, and see how your week adds up against your daily goal. It keeps running if you leave this page." />
      <div className="split">
        <section className="panel timer-panel">
          <div className="seg seg-full" role="tablist" aria-label={t('Mode')}>{[['timer', 'Timer'], ['stopwatch', 'Stopwatch']].map(([k, l]) => <button key={k} role="tab" aria-selected={shownMode === k} disabled={!!active && active.mode !== k} className={shownMode === k ? 'on' : ''} onClick={() => setMode(k)}>{t(l)}</button>)}</div>
          <div className="dial" role="timer" aria-label={t(active?.phase === 'break' ? 'Break' : 'Focus')}>
            <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r={R} className="dial-bg" /><circle cx="100" cy="100" r={R} className="dial-fg" strokeDasharray={C} strokeDashoffset={C * (1 - (shownMode === 'timer' ? frac : 0))} transform="rotate(-90 100 100)" /></svg>
            <div className="dial-in"><b className="clock">{fmtClock(ms)}</b><small className="muted">{active ? t(active.phase === 'break' ? 'Break' : active.running ? 'Focus' : 'Paused') : t('Ready')}{active?.subject ? ` · ${active.subject}` : ''}</small></div>
          </div>
          {!active && (<div className="form">
            {mode === 'timer' && <><div className="row wrap" role="group" aria-label={t('Length')}>{PRESETS.map((m) => <button key={m} className={`chip-toggle${mins === m ? ' on' : ''}`} aria-pressed={mins === m} onClick={() => setMins(m)}>{m} {t('min')}</button>)}<label className="inline-sel">{t('Custom')}<input type="number" min={1} max={600} value={mins} onChange={(e) => setMins(Math.max(1, Math.min(600, +e.target.value || 1)))} style={{ maxWidth: 90 }} /></label></div>
              <label>{t('Pomodoro')}<select value={pomo} onChange={(e) => setPomo(e.target.value)}><option value="off">{t('Off')}</option>{Object.keys(POMO).filter((k) => k !== 'off').map((k) => <option key={k} value={k}>{k} ({t('focus / break')})</option>)}</select></label></>}
            <label>{t('What are you studying?')}<input list="subjects" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={60} placeholder={t('Subject (optional)')} /><datalist id="subjects">{names.map((n) => <option key={n} value={n} />)}</datalist></label>
            <Button onClick={() => startTimer(store, { mode, minutes: pomo !== 'off' && mode === 'timer' ? POMO[pomo][0] : mins, subject, pomo: mode === 'timer' ? pomo : 'off' })}>{t('Start')}</Button></div>)}
          {active && (<div className="row center">
            {active.running ? <Button variant="secondary" onClick={() => pauseTimer(store)}>{t('Pause')}</Button> : <Button onClick={() => resumeTimer(store)}>{t('Resume')}</Button>}
            {active.mode === 'stopwatch' && <Button variant="secondary" onClick={() => lapTimer(store)} disabled={!active.running}>{t('Lap')}</Button>}
            <Button onClick={() => finishTimer(store)}>{t('Finish and save')}</Button><Button variant="ghost" onClick={() => discardTimer(store)}>{t('Discard')}</Button></div>)}
          {active?.laps.length > 0 && <ol className="laps">{active.laps.map((l, i) => <li key={i}><span>{t('Lap')} {i + 1}</span><b>{fmtClock(l)}</b><small className="muted">+{fmtClock(l - (active.laps[i - 1] || 0))}</small></li>)}</ol>}
          <label className="check"><input type="checkbox" checked={sound} onChange={(e) => store.set({ soundOn: e.target.checked })} /> {t('Play a sound when a timer ends')}</label>
        </section>
        <div className="stack">
          <section className="panel"><div className="row between"><h2>{t('Today')}</h2><label className="inline-sel">{t('Daily goal (min)')}<input type="number" min={15} max={720} step={15} value={goal} onChange={(e) => store.set({ goalMins: Math.max(15, Math.min(720, +e.target.value || 120)) })} style={{ maxWidth: 100 }} /></label></div>
            <p className="big"><b>{today}</b> / {goal} {t('min')}</p><Bar value={(today / goal) * 100} />{today >= goal && <p className="notice ok">{t('Goal reached. Well done.')}</p>}</section>
          <section className="panel"><h2>{t('Last 7 days')}</h2><div className="fbars" role="img" aria-label={week.map((w) => `${w.date}: ${w.mins}`).join(', ')}>{week.map((w) => <div key={w.date} className="fbar"><i style={{ height: `${(w.mins / maxW) * 100}%` }} /><b>{w.mins}</b><small>{w.date === td ? t('Today') : niceDate(w.date, lang).split(' ')[0]}</small></div>)}</div>
            {subj.length > 0 && <ul className="list">{subj.map((s) => <li key={s.subject} className="item"><span className="grow">{s.subject === 'No subject' ? t(s.subject) : s.subject}</span><b>{s.mins} {t('min')}</b></li>)}</ul>}</section>
        </div>
      </div>
      <section className="panel"><h2>{t('Recent sessions')}</h2>{log.length === 0 ? <Empty>No sessions yet. Start a timer and your study time appears here.</Empty> : <ul className="list">{log.slice(0, 15).map((x) => <li key={x.id} className="item"><div className="grow"><b>{x.subject || t('No subject')}</b><small className="muted">{niceDate(x.date, lang)} · {t(x.mode === 'timer' ? 'Timer' : 'Stopwatch')}</small></div><b>{x.mins} {t('min')}</b><Button variant="ghost" size="sm" onClick={() => store.set((s) => ({ timeLog: s.timeLog.filter((y) => y.id !== x.id) }))} aria-label={`${t('Remove')} ${x.subject}`}>×</Button></li>)}</ul>}</section>
    </>
  );
}
