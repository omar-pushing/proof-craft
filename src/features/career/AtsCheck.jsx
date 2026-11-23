import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import { analyse } from '@/domain/ats.js';
import { award, useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';
import { toast } from '@/state/toast.js';

const SEV = { critical: ['bad', 'Fix first'], improve: ['warn', 'Improve'], good: ['ok', 'Passed'] };
function Meter({ label, value, hint }) {
  const { t } = useT();
  return (<div className="metric"><small className="muted">{t(label)}</small><b>{value == null ? '–' : `${value}%`}</b><div className="bar"><i style={{ width: `${value || 0}%` }} /></div><small className="muted">{t(hint)}</small></div>);
}

export default function AtsCheck() {
  const { t } = useT(); const store = useUserStore(); const loc = useLocation(); const seed = loc.state || {};
  const cvs = useData((s) => s.cvs), tracker = useData((s) => s.tracker).filter((a) => a.jd);
  const [src, setSrc] = useState(seed.cvId || cvs[0]?.id || 'paste'); const [text, setText] = useState(''); const [jd, setJd] = useState(seed.jd || ''); const [res, setRes] = useState(null); const [err, setErr] = useState(''); const [showPassed, setShowPassed] = useState(false);
  const cv = cvs.find((c) => c.id === src);
  const run = () => {
    if (!cv && !text.trim()) { setErr('Paste some CV text first.'); return; } setErr('');
    setRes(analyse(cv ? { cv, jd } : { text, jd })); award(store, 'ats', 15);
  };
  useEffect(() => { if (seed.cvId && cv) setRes(analyse({ cv, jd })); /* eslint-disable-next-line */ }, []);
  const onFile = (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 200000) return setErr('This file is too large. Paste the text instead.'); const r = new FileReader(); r.onload = () => { setText(String(r.result)); setSrc('paste'); setErr(''); }; r.readAsText(f); };
  const addSkill = (term) => { store.set((s) => ({ cvs: s.cvs.map((c) => (c.id !== cv.id ? c : { ...c, skills: c.skills.map((g, i) => (i === 0 ? { ...g, items: g.items.trim() ? `${g.items.trim().replace(/,$/, '')}, ${term}` : term } : g)) })) })); toast(`${term} added to Skills`); setTimeout(() => setRes(analyse({ cv: store.get().cvs.find((c) => c.id === cv.id), jd })), 0); };
  const groups = res ? ['critical', 'improve'].map((k) => [k, res.findings.filter((f) => f.sev === k)]).filter(([, l]) => l.length) : [];
  return (
    <>
      <PageHead title="ATS Check" desc="Reads your CV the way a parser would and compares it with a job description. It shows what to fix. It does not give a hiring score and cannot predict any employer's system." />
      <div className="split">
        <div className="panel form">
          <label>{t('CV to check')}<select value={src} onChange={(e) => setSrc(e.target.value)}>{cvs.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}<option value="paste">{t('Paste text instead')}</option></select></label>
          {!cv && <><label>{t('CV text')}<textarea rows={9} value={text} onChange={(e) => setText(e.target.value)} /></label><label className="btn btn-secondary btn-sm file">{t('Open a .txt file')}<input type="file" accept=".txt,text/plain" hidden onChange={onFile} /></label></>}
          <label>{t('Job description (optional but recommended)')}<textarea rows={8} value={jd} onChange={(e) => setJd(e.target.value)} placeholder={t('Paste the full job post. Headings such as Requirements and Nice to have are understood.')} /></label>
          {tracker.length > 0 && <label>{t('Or load from your tracker')}<select defaultValue="" onChange={(e) => { const a = tracker.find((x) => x.id === e.target.value); if (a) setJd(a.jd); }}><option value="">{t('Choose an application')}</option>{tracker.map((a) => <option key={a.id} value={a.id}>{a.role} · {a.company}</option>)}</select></label>}
          {err && <p className="err" role="alert">{t(err)}</p>}
          <Button onClick={run}>{t('Run check')}</Button>
          <p className="help">{t('Everything stays in your browser. PDF and DOCX files are not read yet: paste the text, open a .txt file, or check a CV built in CV Maker.')}</p>
        </div>
        <div aria-live="polite">{!res ? <Empty>Results appear here: keyword coverage, formatting and writing findings, and the weakest bullets.</Empty> : (<>
          <section className="panel"><div className="metrics"><Meter label="Keyword coverage" value={res.match?.coverage} hint={res.match ? 'Share of the role terms your CV contains' : 'Add a job description'} /><Meter label="Text similarity" value={res.match?.similarity} hint={res.match ? 'Wording overlap with the job post' : 'Add a job description'} /></div>
            <div className="chips"><span className="chip bad">{res.counts.critical} {t('to fix first')}</span><span className="chip warn">{res.counts.improve} {t('to improve')}</span><span className="chip ok">{res.counts.good} {t('passed')}</span><span className="chip">{res.words} {t('words')} · {res.pages} {res.pages > 1 ? t('pages') : t('page')}</span></div></section>
          {res.match && (<section className="panel"><h2>{t('Role keywords')}</h2>
            {res.match.missing.length > 0 && <><h3 className="group-h">{t('Missing')}</h3><div className="chips">{res.match.missing.map((k) => <span key={k.term} className="chip warn kw">{k.term}<small>{k.preferred ? t('preferred') : t('required')}</small>{cv && k.kind === 'skill' && <button className="chip-btn" onClick={() => addSkill(k.term)} aria-label={`${t('Add to Skills')}: ${k.term}`}>+</button>}</span>)}</div><p className="help">{t('Add a keyword only if it is true for you, ideally inside a bullet that shows how you used it.')}</p></>}
            {res.match.found.length > 0 && <><h3 className="group-h">{t('Found')}</h3><div className="chips">{res.match.found.map((k) => <span key={k.term} className="chip ok kw">{k.term}<small>{k.partial ? t('partly') : `${k.count}×`}</small></span>)}</div></>}</section>)}
          {groups.map(([sev, list]) => (<section key={sev} className="panel"><h2><span className={`status ${SEV[sev][0]}`}>{t(SEV[sev][1])}</span></h2><ul className="list">{list.map((f) => (
            <li key={f.id} className="item top"><div className="grow"><b>{f.title}</b><small className="muted">{f.cat}</small><p className="fixline">{f.fix}</p>{f.items?.length > 0 && <ul className="ex">{f.items.map((x, i) => <li key={i}>{x}</li>)}</ul>}</div></li>))}</ul></section>))}
          {res.weakBullets.length > 0 && <section className="panel"><h2>{t('Weakest bullets')}</h2><p className="help">{t('A strong bullet is: action verb, what you did, how, and a result with a number.')}</p><ul className="list">{res.weakBullets.map((b, i) => <li key={i} className="item top"><div className="grow"><span>{b.text}</span><small className="muted">{b.entry}</small><div className="chips">{b.issues.map((x) => <span key={x} className="chip warn">{t(x)}</span>)}</div></div></li>)}</ul></section>}
          <section className="panel"><button className="linkish" onClick={() => setShowPassed(!showPassed)} aria-expanded={showPassed}>{t('Passed checks')} ({res.counts.good})</button>{showPassed && <ul className="list">{res.findings.filter((f) => f.sev === 'good').map((f) => <li key={f.id} className="item"><span className="status ok">{f.title}</span></li>)}</ul>}
            <p className="help">{t('These are practical checks based on common formatting and writing guidance, not a prediction of any employer system.')}</p></section></>)}
        </div>
      </div>
    </>
  );
}
