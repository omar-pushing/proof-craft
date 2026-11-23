import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Empty, Status } from '@/components/ui/Bits.jsx';
import { dueFollowUps, TERMINAL } from '@/domain/tracker.js';
import GamePanel from '@/features/progress/GamePanel.jsx';
import { award, useData, useUserStore } from '@/state/userData.js';
import { useUser } from '@/state/session.js';
import { useMyWorkspaces } from '@/services/collab/index.js';
import { useT } from '@/i18n/index.js';
import { niceDate, todayISO } from '@/lib/dates.js';
import { uid } from '@/lib/id.js';
import { toIcs } from '@/lib/ics.js';
import { download } from '@/lib/download.js';

const START = [['/app/study/exam', 'Prepare for an exam', 'Turn an exam date into short sessions.'], ['/app/study/lab', 'Make flashcards', 'Recall first, then rate yourself.'], ['/app/projects/workspaces', 'Start a group project', 'Invite classmates with a link.'], ['/app/career/evidence', 'Save your first evidence', 'The start of a CV built from real work.']];

export default function TodayPage() {
  const { t, lang } = useT(); const store = useUserStore(); const user = useUser();
  const tasks = useData((s) => s.tasks), onboarded = useData((s) => s.onboarded), tracker = useData((s) => s.tracker), plans = useData((s) => s.plans), xp = useData((s) => s.xp), streak = useData((s) => s.streak), counts = useData((s) => s.counts);
  const workspaces = useMyWorkspaces(); const td = todayISO();
  const assigned = useMemo(() => workspaces.flatMap((w) => w.tasks.filter((x) => x.assignee === user.id && x.status !== 'done').map((x) => ({ ...x, ws: w }))), [workspaces, user.id]);
  const open = tasks.filter((x) => !x.done).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'));
  const groups = [['Overdue', 'bad', open.filter((x) => x.due && x.due < td)], ['Due today', 'warn', open.filter((x) => x.due === td)], ['Upcoming', 'neutral', open.filter((x) => !x.due || x.due > td)]];
  const done = tasks.filter((x) => x.done);
  const dl = (iso) => Math.round((new Date(iso + 'T00:00:00') - new Date(td + 'T00:00:00')) / 864e5);
  const reminders = [...dueFollowUps(tracker, td).map((a) => ({ id: a.id + 'f', a, text: 'Follow up', date: a.followUp })), ...tracker.filter((a) => a.deadline && !TERMINAL.includes(a.stage) && a.stage !== 'Applied' && dl(a.deadline) >= 0 && dl(a.deadline) <= 7).map((a) => ({ id: a.id + 'd', a, text: 'Deadline', date: a.deadline }))];
  const exams = plans.filter((p) => dl(p.date) >= 0).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const add = (e) => { e.preventDefault(); const f = new FormData(e.target); store.set((s) => ({ tasks: [...s.tasks, { id: uid(), title: String(f.get('title')).trim(), course: String(f.get('course')).trim(), due: f.get('due') || '', done: false }] })); e.target.reset(); };
  const finish = (id) => { store.set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: true } : x)) })); award(store, 'done', 10); };
  const remove = (id) => store.set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) }));
  return (
    <>
      <PageHead title="Today" desc="What is overdue, due today and coming up.">
        <Button variant="secondary" size="sm" onClick={() => download('proofcraft-deadlines.ics', toIcs(tasks.filter((x) => !x.done)), 'text/calendar')} disabled={!open.some((x) => x.due)}>{t('Export calendar (.ics)')}</Button>
      </PageHead>
      {!onboarded && (<section className="panel"><div className="row between"><h2>{t('Start with one thing')}</h2><Button variant="ghost" size="sm" onClick={() => store.set({ onboarded: true })}>{t('Hide')}</Button></div><div className="tiles">{START.map(([to, a, b]) => <Link key={to} to={to} className="tile"><b>{t(a)}</b><span>{t(b)}</span></Link>)}</div></section>)}
      <GamePanel data={{ xp, streak, counts }} />
      {assigned.length > 0 && (<section className="panel"><h2>{t('Assigned to you in workspaces')}</h2><ul className="list">{assigned.map((x) => <li key={x.id} className="item"><div className="grow"><b>{x.title}</b><small className="muted">{x.ws.name}{x.due ? ` · ${niceDate(x.due, lang)}` : ''}</small></div><Button to={`/app/projects/workspaces/${x.ws.id}`} variant="secondary" size="sm">{t('Open')}</Button></li>)}</ul></section>)}
      {(exams.length > 0 || reminders.length > 0) && (<div className="split">
        {exams.length > 0 && <section className="panel"><h2>{t('Upcoming exams')}</h2><ul className="list">{exams.map((p) => { const mine = tasks.filter((x) => x.planId === p.id); return <li key={p.id} className="item"><div className="grow"><b>{p.name || t('Study plan')}</b><small className="muted">{niceDate(p.date, lang)} · {mine.filter((x) => x.done).length}/{mine.length} {t('sessions done')}</small></div><span className="countdown"><b>{dl(p.date)}</b> {t('days')}</span></li>; })}</ul></section>}
        {reminders.length > 0 && <section className="panel"><h2>{t('Applications to act on')}</h2><ul className="list">{reminders.map((r) => <li key={r.id} className="item"><div className="grow"><b>{r.a.role}</b><small className="muted">{r.a.company} · {t(r.text)}: {niceDate(r.date, lang)}</small></div><Button to="/app/career/tracker" variant="secondary" size="sm">{t('Open')}</Button></li>)}</ul></section>}</div>)}
      <section className="panel">
        <h2>{t('Your tasks')}</h2>
        {open.length === 0 ? <Empty>Nothing due yet. Add a task below, or start with one of the tools above.</Empty>
          : groups.map(([label, tone, list]) => list.length > 0 && (
            <div key={label} className="group"><h3 className="group-h">{t(label)} <span className="muted">{list.length}</span></h3>
              <ul className="list">{list.map((x) => (
                <li key={x.id} className="item"><div className="grow"><b>{x.title}</b><small className="muted">{[x.course, x.mins && `${x.mins} ${t('min')}`, x.due && niceDate(x.due, lang)].filter(Boolean).join(' · ')}</small></div>
                  <Status tone={tone}>{label}</Status><Button size="sm" onClick={() => finish(x.id)} aria-label={`${t('Done')}: ${x.title}`}>{t('Done')}</Button><Button variant="secondary" size="sm" onClick={() => remove(x.id)} aria-label={`${t('Remove')}: ${x.title}`}>{t('Remove')}</Button></li>))}</ul></div>))}
        {done.length > 0 && <details className="done-list"><summary>{t('Completed')} ({done.length})</summary><ul className="list">{done.map((x) => <li key={x.id} className="item"><span className="grow done">{x.title}</span><Button variant="ghost" size="sm" onClick={() => remove(x.id)}>{t('Remove')}</Button></li>)}</ul></details>}
      </section>
      <form className="panel form" onSubmit={add}>
        <h2>{t('Add task')}</h2>
        <div className="grid-3"><label>{t('Task')}<input name="title" required maxLength={140} /></label><label>{t('Course (optional)')}<input name="course" maxLength={60} /></label><label>{t('Due date')}<input type="date" name="due" /></label></div>
        <Button type="submit">{t('Add task')}</Button>
      </form>
    </>
  );
}
