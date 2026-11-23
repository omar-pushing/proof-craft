import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Avatar, Empty } from '@/components/ui/Bits.jsx';
import { collab, roleOf, useMyWorkspaces } from '@/services/collab/index.js';
import { useUser } from '@/state/session.js';
import { award, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';

export default function Workspaces() {
  const { t } = useT(); const user = useUser(); const store = useUserStore(); const nav = useNavigate(); const list = useMyWorkspaces(); const [err, setErr] = useState('');
  const create = (e) => { e.preventDefault(); const f = new FormData(e.target); const id = collab.create({ name: String(f.get('name')).trim(), desc: String(f.get('desc')).trim(), owner: user }); award(store, 'team', 15); nav(`/app/projects/workspaces/${id}`); };
  const join = (e) => { e.preventDefault(); const id = collab.join(String(new FormData(e.target).get('code')), user); if (id) { award(store, "team", 15); nav(`/app/projects/workspaces/${id}`); } else setErr('No workspace has that code.'); };
  return (
    <>
      <PageHead title="Workspaces" desc="A shared space for a group project: one board, shared notes and plans, and a discussion everyone sees." />
      {list.length === 0 ? <Empty>You are not in a workspace yet. Create one for your group project, or join with an invite code.</Empty> : (
        <div className="cards">{list.map((w) => (
          <Link key={w.id} to={`/app/projects/workspaces/${w.id}`} className="card ws-card"><h2>{w.name}</h2><p className="muted">{w.desc || t('No description')}</p>
            <div className="row between"><span className="avatars">{w.members.slice(0, 4).map((m) => <Avatar key={m.id} name={m.name} />)}</span><small className="muted">{t(roleOf(w, user.id) === 'owner' ? 'Owner' : roleOf(w, user.id) === 'editor' ? 'Editor' : 'Viewer')} · {w.tasks.filter((x) => x.status !== 'done').length} {t('open')}</small></div></Link>))}</div>)}
      <div className="split">
        <form className="panel form" onSubmit={create}><h2>{t('New workspace')}</h2>
          <label>{t('Name')}<input name="name" required maxLength={80} placeholder="Clinic booking database" /></label>
          <label>{t('What is it for?')}<input name="desc" maxLength={200} placeholder="Software Engineering group project, due 15 Jan" /></label>
          <Button type="submit">{t('Create workspace')}</Button></form>
        <form className="panel form" onSubmit={join}><h2>{t('Join with a code')}</h2>
          <label>{t('Invite code')}<input name="code" required maxLength={12} autoCapitalize="characters" placeholder="K7M2QX" /></label>
          {err && <p className="err" role="alert">{t(err)}</p>}
          <Button type="submit" variant="secondary">{t('Join workspace')}</Button></form>
      </div>
    </>
  );
}
