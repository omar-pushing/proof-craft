import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import Dialog from '@/components/ui/Dialog.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import { MODES, SOURCES, STAGES, TYPES, moveStage, stats, toCsv } from '@/domain/tracker.js';
import { award, useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';
import { download } from '@/lib/download.js';
import { niceDate, todayISO } from '@/lib/dates.js';
import { uid } from '@/lib/id.js';

const blank = () => ({ id: uid(), role: '', company: '', stage: 'Saved', type: 'Internship', mode: 'On-site', location: '', source: 'Company site', link: '', applied: '', deadline: '', followUp: '', contact: '', cvId: '', jd: '', notes: '', history: [] });
const daysLeft = (iso) => Math.round((new Date(iso + 'T00:00:00') - new Date(todayISO() + 'T00:00:00')) / 864e5);

export default function Tracker() {
  const { t, lang } = useT(); const store = useUserStore(), nav = useNavigate();
  const apps = useData((s) => s.tracker), cvs = useData((s) => s.cvs); const [view, setView] = useState('board'), [q, setQ] = useState(''), [edit, setEdit] = useState(null);
  const s = useMemo(() => stats(apps), [apps]);
  const shown = apps.filter((a) => !q || `${a.role} ${a.company} ${a.location}`.toLowerCase().includes(q.toLowerCase()));
  const save = (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); const base = edit.isNew ? blank() : apps.find((a) => a.id === edit.id); const stageChanged = f.stage !== base.stage;
    let next = { ...base, ...f, role: f.role.trim(), company: f.company.trim() }; if (stageChanged) next = moveStage({ ...next, stage: base.stage }, f.stage);
    store.set((st) => ({ tracker: edit.isNew ? [...st.tracker, next] : st.tracker.map((a) => (a.id === next.id ? next : a)) })); if (edit.isNew) award(store, 'app', 15); setEdit(null);
  };
  const move = (a, stage) => store.set((st) => ({ tracker: st.tracker.map((x) => (x.id === a.id ? moveStage(x, stage) : x)) }));
  const remove = (id) => store.set((st) => ({ tracker: st.tracker.filter((a) => a.id !== id) }));
  const Card = ({ a }) => (
    <article className="app-card">
      <div className="row between nowrap"><b>{a.role}</b>{a.type && <span className="tag">{t(a.type)}</span>}</div><span className="muted">{a.company}{a.location ? ` · ${a.location}` : ''}{a.mode ? ` · ${t(a.mode)}` : ''}</span>
      {a.deadline && <small className={daysLeft(a.deadline) < 0 ? 'bad-t' : daysLeft(a.deadline) <= 3 ? 'warn-t' : 'muted'}>{t('Deadline')}: {niceDate(a.deadline, lang)} ({daysLeft(a.deadline) < 0 ? t('passed') : `${daysLeft(a.deadline)} ${t('days')}`})</small>}
      {a.followUp && <small className={a.followUp <= todayISO() ? 'warn-t' : 'muted'}>{t('Follow up')}: {niceDate(a.followUp, lang)}</small>}
      <div className="row"><select value={a.stage} aria-label={`${t('Status')}: ${a.role}`} onChange={(e) => move(a, e.target.value)}>{STAGES.map((x) => <option key={x} value={x}>{t(x)}</option>)}</select></div>
      <div className="row"><Button size="sm" variant="secondary" onClick={() => setEdit({ id: a.id })}>{t('Edit')}</Button>{a.jd && <Button size="sm" variant="secondary" onClick={() => nav('/app/career/ats', { state: { jd: a.jd, cvId: a.cvId || cvs[0]?.id } })}>{t('Check CV')}</Button>}{a.link && <a className="btn btn-ghost btn-sm" href={/^https?:\/\//.test(a.link) ? a.link : `https://${a.link}`} target="_blank" rel="noopener noreferrer">{t('Open post')}</a>}<Button size="sm" variant="ghost" onClick={() => remove(a.id)}>{t('Remove')}</Button></div>
    </article>);
  const cur = edit && (edit.isNew ? blank() : apps.find((a) => a.id === edit.id));
  return (
    <>
      <PageHead title="Application Tracker" desc="Log roles you want and roles you applied for. Move them through the stages, set deadlines and follow-ups, and keep the job post next to the CV you sent.">
        <Button onClick={() => setEdit({ isNew: true })}>{t('Add application')}</Button><Button variant="secondary" size="sm" onClick={() => download('applications.csv', toCsv(apps), 'text/csv')} disabled={!apps.length}>{t('Export CSV')}</Button>
      </PageHead>
      <div className="stats4">{[['Tracked', apps.length], ['Applied', s.applied], ['Interviews', s.interviews], ['Offers', s.offers]].map(([l, n]) => <div key={l} className="statcard"><b>{n}</b><small>{t(l)}</small></div>)}<div className="statcard"><b>{s.response == null ? '–' : `${s.response}%`}</b><small>{t('Response rate')}</small></div></div>
      <div className="row toolbar"><label className="grow inline-sel">{t('Search')}<input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Role, company or city')} /></label>
        <div className="seg" role="group" aria-label={t('View')}>{['board', 'list'].map((v) => <button key={v} className={view === v ? 'on' : ''} aria-pressed={view === v} onClick={() => setView(v)}>{t(v === 'board' ? 'Board' : 'List')}</button>)}</div></div>
      {apps.length === 0 ? <Empty>No applications yet. Add the first role you want, even before you apply.</Empty> : view === 'board' ? (
        <div className="kanban">{STAGES.map((st) => <section key={st} className="col" aria-label={t(st)}><h2 className="col-h">{t(st)} <span className="muted">{shown.filter((a) => a.stage === st).length}</span></h2>{shown.filter((a) => a.stage === st).map((a) => <Card key={a.id} a={a} />)}</section>)}</div>
      ) : <div className="stack">{shown.map((a) => <Card key={a.id} a={a} />)}</div>}
      <Dialog open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? t('Add application') : t('Edit application')}>
        {cur && <form className="form" onSubmit={save} key={cur.id}>
          <div className="grid-2"><label>{t('Role')}<input name="role" required maxLength={120} defaultValue={cur.role} /></label><label>{t('Company')}<input name="company" required maxLength={120} defaultValue={cur.company} /></label>
            <label>{t('Status')}<select name="stage" defaultValue={cur.stage}>{STAGES.map((x) => <option key={x} value={x}>{t(x)}</option>)}</select></label><label>{t('Type')}<select name="type" defaultValue={cur.type}>{TYPES.map((x) => <option key={x} value={x}>{t(x)}</option>)}</select></label>
            <label>{t('Work mode')}<select name="mode" defaultValue={cur.mode}>{MODES.map((x) => <option key={x} value={x}>{t(x)}</option>)}</select></label><label>{t('City')}<input name="location" maxLength={80} defaultValue={cur.location} /></label>
            <label>{t('Found through')}<select name="source" defaultValue={cur.source}>{SOURCES.map((x) => <option key={x} value={x}>{t(x)}</option>)}</select></label><label>{t('Link to the post')}<input name="link" maxLength={300} defaultValue={cur.link} /></label>
            <label>{t('Applied on')}<input type="date" name="applied" defaultValue={cur.applied} /></label><label>{t('Deadline')}<input type="date" name="deadline" defaultValue={cur.deadline} /></label>
            <label>{t('Follow up on')}<input type="date" name="followUp" defaultValue={cur.followUp} /></label><label>{t('Contact person')}<input name="contact" maxLength={120} defaultValue={cur.contact} /></label></div>
          <label>{t('CV you sent')}<select name="cvId" defaultValue={cur.cvId}><option value="">{t('Not set')}</option>{cvs.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
          <label>{t('Job description')}<textarea name="jd" rows={5} maxLength={8000} defaultValue={cur.jd} placeholder={t('Paste the post here to check your CV against it later.')} /></label>
          <label>{t('Notes')}<textarea name="notes" rows={3} maxLength={1000} defaultValue={cur.notes} /></label>
          {cur.history?.length > 0 && <div><span className="lbl">{t('History')}</span><ul className="list">{cur.history.map((h, i) => <li key={i} className="item"><span className="grow">{t(h.stage)}</span><small className="muted">{niceDate(h.at, lang)}</small></li>)}</ul></div>}
          <div className="row"><Button type="submit">{t('Save')}</Button><Button variant="secondary" onClick={() => setEdit(null)}>{t('Cancel')}</Button></div></form>}
      </Dialog>
    </>
  );
}
