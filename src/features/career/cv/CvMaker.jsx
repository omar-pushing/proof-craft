import { useDeferredValue, useEffect, useRef, useState } from 'react';
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
import { SAMPLE_CV } from './sample.js';
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
  const [tab, setTab] = useState('content'), [del, setDel] = useState(false), [view, setView] = useState('edit'), [full, setFull] = useState(false); const file = useRef(null), hist = useRef({}), undoRef = useRef(() => {}), redoRef = useRef(() => {});
  useEffect(() => { ensureCv(store, user.name); }, [store, user.name]);
  const cv = cvs.find((c) => c.id === activeId) || cvs[0];
  const shown = useDeferredValue(cv) ?? cv;
  useEffect(() => {
    const k = (e) => { if (!(e.ctrlKey || e.metaKey) || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return; const key = e.key.toLowerCase(); if (key === 'z' && !e.shiftKey) { e.preventDefault(); undoRef.current(); } else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redoRef.current(); } };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, []);
  if (!cv) return null;
  const H = (hist.current[cv.id] ||= { past: [], future: [], t: 0 });
  const put = (next) => store.set((s) => ({ cvs: s.cvs.map((c) => (c.id === next.id ? { ...next, updated: Date.now() } : c)) }));
  /** Edits made within 0.7 s of each other count as one undo step, so typing a word is one step, not one per letter. */
  const edit = (fn) => { const now = Date.now(); if (now - H.t > 700) { H.past.push(clone(cv)); if (H.past.length > 80) H.past.shift(); } H.t = now; H.future = []; const n = clone(cv); fn(n); put(n); };
  const undo = () => { const prev = H.past.pop(); if (!prev) return; H.future.push(clone(cv)); H.t = 0; put(prev); };
  const redo = () => { const next = H.future.pop(); if (!next) return; H.past.push(clone(cv)); H.t = 0; put(next); };
  undoRef.current = undo; redoRef.current = redo;
  const example = () => edit((c) => { Object.assign(c, { personal: { ...SAMPLE_CV.personal, photo: c.personal.photo }, summary: SAMPLE_CV.summary, education: clone(SAMPLE_CV.education), experience: clone(SAMPLE_CV.experience), projects: clone(SAMPLE_CV.projects), skills: clone(SAMPLE_CV.skills), languages: clone(SAMPLE_CV.languages) }); });
  const time = new Date(cv.updated || Date.now()).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const focusSection = (sec) => { setTab('content'); setView('edit'); setTimeout(() => { const el = document.querySelector(`[data-acc="${sec}"]`); if (!el) return; el.open = true; el.scrollIntoView?.({ behavior: 'smooth', block: 'start' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1400); }, 80); };
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
      <div className="seg seg-full cv-view" role="group" aria-label={t('View')}>{[['edit', 'Edit'], ['preview', 'Preview']].map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} aria-pressed={view === k} onClick={() => setView(k)}>{t(l)}</button>)}</div>
      <div className="cv-grid" data-view={view}>
        <div className="cv-edit">
          <div className="cv-tools"><div className="row"><Button variant="secondary" size="sm" onClick={undo} disabled={!H.past.length} aria-label={t('Undo')}>↶ {t('Undo')}</Button><Button variant="secondary" size="sm" onClick={redo} disabled={!H.future.length} aria-label={t('Redo')}>↷ {t('Redo')}</Button></div><span className="saved" role="status">✓ {t('Saved')} · {time}</span></div>
          <div className="tabs" role="tablist" aria-label={t('CV Maker')}>{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{t(l)}</button>)}</div>
          {tab === 'content' && <ContentEditor cv={cv} edit={edit} evidenceCount={evidence.length} onEvidence={() => { evidence.forEach((e) => addEvidenceToCv(store, e, user.name)); toast('Evidence added as projects'); }} />}
          {tab === 'template' && <TemplatePicker cv={cv} edit={edit} onExample={example} />}{tab === 'design' && <DesignPanel cv={cv} edit={edit} />}{tab === 'sections' && <SectionsPanel cv={cv} edit={edit} />}
        </div>
        <div className="cv-side"><Preview cv={shown} onPick={focusSection} /><div className="row"><Button variant="secondary" size="sm" onClick={() => setFull(true)}>{t('Full-size preview')}</Button><small className="muted">{t('Click a section in the preview to edit it.')}</small></div></div>
      </div>
      <Dialog open={full} onClose={() => setFull(false)} title={t('Full-size preview')} wide><Preview cv={shown} /></Dialog>
      <Dialog open={del} onClose={() => setDel(false)} title={t('Delete this CV?')}><p>{cv.title}</p><div className="row"><Button onClick={remove}>{t('Yes, delete')}</Button><Button variant="secondary" onClick={() => setDel(false)}>{t('Cancel')}</Button></div></Dialog>
    </div>
  );
}
