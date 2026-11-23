import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import Dialog from '@/components/ui/Dialog.jsx';
import { Bar } from '@/components/ui/Bits.jsx';
import ContentEditor from './ContentEditor.jsx';
import Preview from './Preview.jsx';
import { DesignPanel, SectionsPanel, TemplatePicker } from './Panels.jsx';
import { MISSING_LABEL, completeness, cvPlainText, cvToHtml, fromJsonResume, newCv, toJsonResume } from '@/domain/cv.js';
import { PAPERS } from '@/domain/cvTemplates.js';
import { award, useData, useUserStore } from '@/state/userData.js';
import { addEvidenceToCv, ensureCv } from '@/state/cvActions.js';
import { useUser } from '@/state/session.js';
import { useT } from '@/i18n/index.js';
import { copyText, download } from '@/lib/download.js';
import { toast } from '@/state/toast.js';
import { uid } from '@/lib/id.js';

const TABS = [['content', 'Content'], ['template', 'Template'], ['design', 'Design'], ['sections', 'Sections']];
const clone = (v) => JSON.parse(JSON.stringify(v));

export default function CvMaker() {
  const { t } = useT(); const store = useUserStore(), user = useUser(), nav = useNavigate();
  const cvs = useData((s) => s.cvs), activeId = useData((s) => s.activeCv), evidence = useData((s) => s.evidence);
  const [tab, setTab] = useState('content'), [del, setDel] = useState(false); const file = useRef(null);
  useEffect(() => { ensureCv(store, user.name); }, [store, user.name]);
  const cv = cvs.find((c) => c.id === activeId) || cvs[0];
  if (!cv) return null;
  const edit = (fn) => store.set((s) => ({ cvs: s.cvs.map((c) => { if (c.id !== cv.id) return c; const n = clone(c); fn(n); n.updated = Date.now(); return n; }) }));
  const pick = (id) => store.set({ activeCv: id });
  const add = () => { const n = newCv({ name: cv.personal.name || user.name, title: `${t('CV')} ${cvs.length + 1}` }); n.personal = { ...clone(cv.personal) }; store.set((s) => ({ cvs: [...s.cvs, n], activeCv: n.id })); };
  const dup = () => { const n = { ...clone(cv), id: uid(), title: `${cv.title} (${t('copy')})`, updated: Date.now() }; store.set((s) => ({ cvs: [...s.cvs, n], activeCv: n.id })); };
  const remove = () => { store.set((s) => { const rest = s.cvs.filter((c) => c.id !== cv.id); return { cvs: rest, activeCv: rest[0]?.id || null }; }); setDel(false); };
  const done = (kind) => { award(store, 'cv', 20); toast(kind); };
  const text = cvPlainText(cv), comp = completeness(cv), base = (cv.personal.name || 'cv').trim().replace(/\s+/g, '-').toLowerCase();
  const print = () => {
    const paper = PAPERS[cv.design.paper], st = document.createElement('style'); st.textContent = `@page{size:${paper.name};margin:${cv.design.margin}mm}`; document.head.append(st);
    const t0 = document.title; document.title = `${cv.personal.name || 'CV'} - CV`; window.print(); setTimeout(() => { st.remove(); document.title = t0; }, 800); award(store, 'cv', 20);
  };
  const importFile = (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return; if (f.size > 500000) return toast('This file is too large.');
    const r = new FileReader(); r.onload = () => { try { const j = JSON.parse(String(r.result)); const n = j.personal && j.order ? { ...newCv(), ...j, id: uid(), title: `${j.title || 'Imported'} (${t('imported')})` } : { ...fromJsonResume(j), title: `${j.basics?.name || 'Imported'} (${t('imported')})` }; store.set((s) => ({ cvs: [...s.cvs, n], activeCv: n.id })); toast('CV imported'); } catch { toast('That file could not be read as a CV.'); } };
    r.readAsText(f);
  };
  return (
    <div className="cv-maker">
      <PageHead title="CV Maker" desc="Build one or more CVs from structured fields, pick a template, and export. Your data stays in this browser." />
      <section className="panel cv-bar" aria-label={t('Your CVs')}>
        <div className="row">
          <label className="inline-sel">{t('Your CVs')}<select value={cv.id} onChange={(e) => pick(e.target.value)}>{cvs.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
          <label className="inline-sel grow">{t('Name this CV')}<input value={cv.title} maxLength={60} onChange={(e) => edit((c) => { c.title = e.target.value; })} /></label>
          <Button variant="secondary" size="sm" onClick={add}>{t('New')}</Button><Button variant="secondary" size="sm" onClick={dup}>{t('Duplicate')}</Button><Button variant="ghost" size="sm" onClick={() => setDel(true)} disabled={cvs.length < 2}>{t('Delete')}</Button>
        </div>
        <div className="row cv-export">
          <b>{t('Export')}</b>
          <Button size="sm" onClick={print}>{t('PDF (print)')}</Button><Button variant="secondary" size="sm" onClick={() => { download(`${base}.doc`, cvToHtml(cv), 'application/msword'); done('Word file downloaded'); }}>{t('Word (.doc)')}</Button>
          <Button variant="secondary" size="sm" onClick={() => { download(`${base}.txt`, text); done('Text file downloaded'); }}>{t('Text (.txt)')}</Button><Button variant="secondary" size="sm" onClick={() => { download(`${base}.json`, JSON.stringify(toJsonResume(cv), null, 2), 'application/json'); toast('JSON Resume downloaded'); }}>JSON Resume</Button>
          <Button variant="ghost" size="sm" onClick={async () => { toast((await copyText(text)) ? 'Copied' : 'Copy is blocked here'); award(store, 'cv', 20); }}>{t('Copy text')}</Button>
          <Button variant="ghost" size="sm" onClick={() => file.current?.click()}>{t('Import JSON')}</Button><input ref={file} type="file" accept="application/json,.json" hidden onChange={importFile} />
        </div>
        <div className="comp"><div className="row between"><span>{t('CV completeness')}: <b>{comp.percent}%</b></span><Button variant="secondary" size="sm" onClick={() => nav('/app/career/ats', { state: { cvId: cv.id } })}>{t('Run ATS Check')}</Button></div><Bar value={comp.percent} />{comp.missing.length > 0 && <small className="muted">{t('Next')}: {t(MISSING_LABEL[comp.missing[0]])}</small>}</div>
      </section>
      <div className="cv-grid">
        <div className="cv-edit">
          <div className="tabs" role="tablist" aria-label={t('CV Maker')}>{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{t(l)}</button>)}</div>
          {tab === 'content' && <ContentEditor cv={cv} edit={edit} evidenceCount={evidence.length} onEvidence={() => { evidence.forEach((e) => addEvidenceToCv(store, e, user.name)); toast('Evidence added as projects'); }} />}
          {tab === 'template' && <TemplatePicker cv={cv} edit={edit} />}{tab === 'design' && <DesignPanel cv={cv} edit={edit} />}{tab === 'sections' && <SectionsPanel cv={cv} edit={edit} />}
        </div>
        <div className="cv-side"><Preview cv={cv} /></div>
      </div>
      <Dialog open={del} onClose={() => setDel(false)} title={t('Delete this CV?')}><p>{cv.title}</p><div className="row"><Button onClick={remove}>{t('Yes, delete')}</Button><Button variant="secondary" onClick={() => setDel(false)}>{t('Cancel')}</Button></div></Dialog>
    </div>
  );
}
