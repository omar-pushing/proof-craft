import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button, { Arrow } from '@/components/ui/Button.jsx';
import { Avatar, Empty } from '@/components/ui/Bits.jsx';
import { SharedView, importShared } from '@/features/share/SharedView.jsx';
import { collab, canEdit, roleOf, useWorkspace } from '@/services/collab/index.js';
import { useUser } from '@/state/session.js';
import { award, useUserStore } from '@/state/userData.js';
import { toast } from '@/state/toast.js';
import { copyText } from '@/lib/download.js';
import { niceDate } from '@/lib/dates.js';
import { useT } from '@/i18n/index.js';

const COLS = [['todo', 'To do'], ['doing', 'Doing'], ['done', 'Done']];
const TABS = [['board', 'Board'], ['shared', 'Shared'], ['talk', 'Discussion'], ['people', 'People'], ['activity', 'Activity']];

export default function WorkspaceView() {
  const { id } = useParams(); const { t, lang } = useT(); const user = useUser(); const store = useUserStore(); const ws = useWorkspace(id); const [tab, setTab] = useState('board');
  if (!ws) return <><Empty>This workspace was not found.</Empty><Button to="/app/projects/workspaces" variant="secondary">{t('Back to Workspaces')}</Button></>;
  const role = roleOf(ws, user.id);
  if (!role) return <><Empty>You are not a member of this workspace.</Empty><Button to="/app/projects/workspaces" variant="secondary">{t('Back to Workspaces')}</Button></>;
  const edit = canEdit(role), owner = role === 'owner';
  const run = (fn) => { try { fn(); } catch { toast('You do not have permission to do that.'); } };
  const link = `${location.origin}${location.pathname}#/join/${ws.code}`;
  const when = (at) => new Date(at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const nameOf = (uid) => ws.members.find((m) => m.id === uid)?.name;
  const addTask = (e) => { e.preventDefault(); const f = new FormData(e.target); run(() => collab.addTask(id, user, { title: String(f.get('title')).trim(), assignee: f.get('assignee'), due: f.get('due') })); e.target.reset(); };
  const move = (task, status) => { run(() => collab.moveTask(id, user, task.id, status)); if (status === 'done') award(store, 'done', 10); };
  const note = (e) => { e.preventDefault(); const f = new FormData(e.target); run(() => collab.share(id, user, { kind: 'note', title: String(f.get('title')).trim(), text: String(f.get('text')).trim() })); e.target.reset(); };
  const talk = (e) => { e.preventDefault(); const f = new FormData(e.target); run(() => collab.comment(id, user, String(f.get('text')))); e.target.reset(); };
  return (
    <>
      <header className="page-head"><div><Link to="/app/projects/workspaces" className="back"><span className="arr back">←</span> {t('Workspaces')}</Link><h1>{ws.name}</h1>{ws.desc && <p className="lede">{ws.desc}</p>}</div>
        <div className="row"><span className="avatars">{ws.members.slice(0, 5).map((m) => <Avatar key={m.id} name={m.name} />)}</span></div></header>
      <section className="panel invite"><div className="grow"><b>{t('Invite classmates')}</b><p className="help">{t('Anyone who joins with this code can edit. You can change roles in People.')}</p></div>
        <code className="code" aria-label={t('Invite code')}>{ws.code}</code>
        <Button size="sm" onClick={async () => toast((await copyText(link)) ? 'Invite link copied' : 'Copy is blocked here. Share the code instead.')}>{t('Copy invite link')}</Button></section>
      <div className="tabs" role="tablist" aria-label={ws.name}>{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{t(l)}</button>)}</div>

      {tab === 'board' && (<>
        {edit && <form className="panel form" onSubmit={addTask}><h2>{t('Add a task')}</h2><div className="grid-3"><label>{t('Task')}<input name="title" required maxLength={140} /></label>
          <label>{t('Assign to')}<select name="assignee"><option value="">{t('Nobody yet')}</option>{ws.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>{t('Due date')}<input type="date" name="due" /></label></div><Button type="submit">{t('Add task')}</Button></form>}
        <div className="board">{COLS.map(([k, label], ci) => (
          <section key={k} className="col" aria-label={t(label)}><h2 className="col-h">{t(label)} <span className="muted">{ws.tasks.filter((x) => x.status === k).length}</span></h2>
            {ws.tasks.filter((x) => x.status === k).map((x) => (
              <article key={x.id} className="tcard"><b>{x.title}</b>
                <small className="muted">{x.assignee ? nameOf(x.assignee) : t('Unassigned')}{x.due ? ` · ${niceDate(x.due, lang)}` : ''}</small>
                {edit && <div className="row">{ci > 0 && <Button variant="secondary" size="sm" onClick={() => move(x, COLS[ci - 1][0])} aria-label={`${t('Move to')} ${t(COLS[ci - 1][1])}: ${x.title}`}><span className="arr back" aria-hidden="true">←</span> {t(COLS[ci - 1][1])}</Button>}
                  {ci < 2 && <Button size="sm" onClick={() => move(x, COLS[ci + 1][0])} aria-label={`${t('Move to')} ${t(COLS[ci + 1][1])}: ${x.title}`}>{t(COLS[ci + 1][1])} <Arrow /></Button>}
                  <Button variant="ghost" size="sm" onClick={() => run(() => collab.removeTask(id, user, x.id))} aria-label={`${t('Remove')}: ${x.title}`}>{t('Remove')}</Button></div>}
              </article>))}
            {!ws.tasks.some((x) => x.status === k) && <p className="muted col-empty">{t('Nothing here')}</p>}
          </section>))}</div></>)}

      {tab === 'shared' && (<>
        {edit && <form className="panel form" onSubmit={note}><h2>{t('Add a note or link')}</h2><label>{t('Title')}<input name="title" required maxLength={100} /></label><label>{t('Text or link')}<textarea name="text" rows={3} required maxLength={600} /></label><Button type="submit">{t('Post')}</Button></form>}
        {ws.shared.length === 0 ? <Empty>Nothing shared yet. Post a note here, or share a study plan or deck from the Study tools.</Empty> : ws.shared.map((s) => (
          <article key={s.id} className="panel"><div className="row between"><h2>{s.title}</h2><small className="muted">{s.by} · {when(s.at)}</small></div>
            {s.kind === 'note' ? <p className="pre">{s.text}</p> : <SharedView data={s.data} lang={lang} />}
            {s.kind === 'plan' && <Button size="sm" onClick={() => { importShared(store, s.data); toast('Added to your Today'); }}>{t('Add sessions to my Today')}</Button>}
            {s.kind === 'deck' && <Button size="sm" onClick={() => { importShared(store, s.data); toast('Added to your Study Lab'); }}>{t('Add cards to my Study Lab')}</Button>}</article>))}</>)}

      {tab === 'talk' && (<section className="panel"><ul className="list">{ws.comments.length === 0 && <li className="muted">{t('No messages yet.')}</li>}
        {ws.comments.map((c) => <li key={c.id} className="item top"><Avatar name={c.name} /><div className="grow"><b>{c.name}</b> <small className="muted">{when(c.at)}</small><p className="pre">{c.text}</p></div></li>)}</ul>
        {edit ? <form className="form" onSubmit={talk}><label>{t('Message')}<textarea name="text" rows={3} required maxLength={600} /></label><Button type="submit">{t('Send')}</Button></form> : <p className="help">{t('Viewers can read the discussion but cannot post.')}</p>}</section>)}

      {tab === 'people' && (<section className="panel"><ul className="list">{ws.members.map((m) => (
        <li key={m.id} className="item"><Avatar name={m.name} /><div className="grow"><b>{m.name}{m.id === user.id ? ` (${t('you')})` : ''}</b></div>
          {owner && m.role !== 'owner' ? (<><select value={m.role} aria-label={`${t('Role')}: ${m.name}`} onChange={(e) => run(() => collab.setRole(id, user, m.id, e.target.value))}><option value="editor">{t('Editor')}</option><option value="viewer">{t('Viewer')}</option></select>
            <Button variant="ghost" size="sm" onClick={() => run(() => collab.removeMember(id, user, m.id))}>{t('Remove')}</Button></>) : <span className="status neutral">{t(m.role === 'owner' ? 'Owner' : m.role === 'editor' ? 'Editor' : 'Viewer')}</span>}</li>))}</ul>
        <p className="help">{t('Owner manages people. Editors change the board, shared items and discussion. Viewers read only.')}</p>
        {!owner && <Button variant="secondary" size="sm" onClick={() => { run(() => collab.leave(id, user)); }}>{t('Leave workspace')}</Button>}</section>)}

      {tab === 'activity' && (<section className="panel"><ul className="list">{ws.activity.map((a) => <li key={a.id} className="item"><div className="grow"><b>{a.by}</b> {a.text}</div><small className="muted">{when(a.at)}</small></li>)}</ul></section>)}
    </>
  );
}
