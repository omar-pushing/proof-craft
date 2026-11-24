import { useMemo, useState } from 'react';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import { feedback, useAllFeedback } from '@/services/feedback/index.js';
import { isAdmin, updateUser, useSession, useUser } from '@/state/session.js';
import { APP } from '@/config/app.js';
import { download } from '@/lib/download.js';
import { useT } from '@/i18n/index.js';

const STATUS = ['new', 'in progress', 'done', 'closed'];
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const count = (arr, key) => arr.reduce((m, u) => { const k = key(u); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});

/** Admin workspace: feedback triage and aggregate sign-up insights. Authorisation is only a client check in this build; the API must enforce it. */
export default function AdminInbox() {
  const { t, lang } = useT(); const me = useUser(), all = useAllFeedback(), users = useSession((s) => s.users);
  const [st, setSt] = useState(''), [ty, setTy] = useState(''), [find, setFind] = useState('');
  const list = useMemo(() => all.filter((x) => (!st || x.status === st) && (!ty || x.type === ty) && (!find || `${x.message} ${x.name} ${x.contact}`.toLowerCase().includes(find.toLowerCase()))), [all, st, ty, find]);
  if (!isAdmin(me)) return (<><PageHead title="Admin" /><Empty>This area is for ProofCraft admins.</Empty>{APP.previewAdmin && <Button variant="secondary" onClick={() => updateUser(me.id, { admin: true })}>{t('Enable admin tools (preview only)')}</Button>}</>);
  const rated = all.filter((x) => x.rating), avg = rated.length ? (rated.reduce((a, x) => a + x.rating, 0) / rated.length).toFixed(1) : '–';
  const prof = users.map((u) => u.profile || {}), n = users.length || 1;
  const pct = (k) => `${Math.round((k / n) * 100)}%`;
  const when = (at) => new Date(at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const heard = Object.entries(count(prof, (p) => p.heard)).sort((a, b) => b[1] - a[1]), goals = Object.entries(prof.flatMap((p) => p.goals || []).reduce((m, g) => ((m[g] = (m[g] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <PageHead title="Admin" desc="Read and triage feedback, and see aggregate numbers about who signs up. Individual sensitive answers are never listed here.">
        <Button variant="secondary" size="sm" onClick={() => download('feedback.csv', ['Date,Type,Status,Rating,Name,Contact,Can contact,Page,Message,Note', ...all.map((x) => [new Date(x.at).toISOString(), x.type, x.status, x.rating, x.name, x.contact, x.canContact, x.context?.path, x.message, x.note].map(q).join(','))].join('\n'), 'text/csv')} disabled={!all.length}>{t('Export CSV')}</Button>
      </PageHead>
      <div className="stats4">{[[all.length, 'Messages'], [all.filter((x) => x.status === 'new').length, 'New'], [all.filter((x) => x.type === 'bug').length, 'Bugs'], [avg, 'Average rating'], [users.length, 'Accounts on this device']].map(([v, l]) => <div key={l} className="statcard"><b>{v}</b><small>{t(l)}</small></div>)}</div>
      <section className="panel"><h2>{t('Sign-up insights')}</h2>
        <div className="stats4 three"><div className="statcard"><b>{pct(prof.filter((p) => p.isStudent === 'yes').length)}</b><small>{t('are students')}</small></div><div className="statcard"><b>{pct(users.filter((u) => u.consent?.marketing).length)}</b><small>{t('agreed to updates')}</small></div><div className="statcard"><b>{pct(users.filter((u) => u.provider === 'google').length)}</b><small>{t('used Google')}</small></div></div>
        <div className="split"><div><h3 className="group-h">{t('How they heard about us')}</h3><ul className="list">{heard.length ? heard.map(([k, v]) => <li key={k} className="item"><span className="grow">{t(k)}</span><b>{v}</b></li>) : <li className="muted">{t('No answers yet.')}</li>}</ul></div>
          <div><h3 className="group-h">{t('What they want to do first')}</h3><ul className="list">{goals.length ? goals.map(([k, v]) => <li key={k} className="item"><span className="grow">{t(k)}</span><b>{v}</b></li>) : <li className="muted">{t('No answers yet.')}</li>}</ul></div></div>
        <p className="help">{t('Figures are counts over accounts in this browser. In production they come from the server and small groups are hidden.')}</p></section>
      <div className="row toolbar"><label className="grow inline-sel">{t('Search')}<input type="search" value={find} onChange={(e) => setFind(e.target.value)} /></label>
        <label className="inline-sel">{t('Status')}<select value={st} onChange={(e) => setSt(e.target.value)}><option value="">{t('All')}</option>{STATUS.map((s) => <option key={s} value={s}>{t(s)}</option>)}</select></label>
        <label className="inline-sel">{t('Type')}<select value={ty} onChange={(e) => setTy(e.target.value)}><option value="">{t('All')}</option>{['bug', 'idea', 'question', 'praise'].map((s) => <option key={s} value={s}>{t(s)}</option>)}</select></label></div>
      {list.length === 0 ? <Empty>No feedback matches. Messages sent with the Feedback button appear here.</Empty> : list.map((x) => (
        <article key={x.id} className="panel fb"><div className="row between"><div className="row"><span className={`kind fk-${x.type}`}>{t(x.type)}</span>{x.rating && <span className="muted">★ {x.rating}/5</span>}<small className="muted">{when(x.at)}</small></div>
          <select value={x.status} aria-label={t('Status')} onChange={(e) => feedback.update(x.id, { status: e.target.value })}>{STATUS.map((s) => <option key={s} value={s}>{t(s)}</option>)}</select></div>
          <p className="pre">{x.message}</p><small className="muted">{x.name || t('Anonymous')}{x.canContact && x.contact ? ` · ${x.contact}` : x.contact ? ` · ${t('contact not permitted')}` : ''} · {x.context?.path} · {x.context?.lang}</small>
          <label>{t('Internal note')}<textarea rows={2} defaultValue={x.note} maxLength={500} onBlur={(e) => feedback.update(x.id, { note: e.target.value })} /></label>
          <div className="row"><Button variant="ghost" size="sm" onClick={() => feedback.remove(x.id)}>{t('Delete')}</Button></div></article>))}
    </>
  );
}
