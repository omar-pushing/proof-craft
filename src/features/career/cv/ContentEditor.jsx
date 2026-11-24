import Button from '@/components/ui/Button.jsx';
import { LEVELS, LIST_SECTIONS, SCHEMA, emptyEntry } from '@/domain/cv.js';
import { isActionVerb } from '@/domain/ats.js';
import { useT } from '@/i18n/index.js';
import { uid } from '@/lib/id.js';
import { squarePhoto } from '@/lib/image.js';
import { toast } from '@/state/toast.js';

const swap = (arr, i, d) => { const j = i + d; if (j >= 0 && j < arr.length) [arr[i], arr[j]] = [arr[j], arr[i]]; };
const wc = (s) => s.trim().split(/\s+/).filter(Boolean).length;

function BulletHint({ text, lang }) {
  const { t } = useT(); if (!text.trim() || lang === 'ar') return null; const n = wc(text), hints = [];
  if (!isActionVerb(text.trim().split(/\s+/)[0].replace(/[^a-z]/gi, ''))) hints.push(t('Start with a verb'));
  if (!/\d/.test(text)) hints.push(t('Add a number')); if (n > 25) hints.push(t('Shorten'));
  return <small className={hints.length ? 'hint warn' : 'hint ok'}>{n} {t('words')}{hints.length ? ` · ${hints.join(' · ')}` : ` · ${t('Looks strong')}`}</small>;
}
function Bullets({ value, onChange, lang }) {
  const { t } = useT();
  return (<div className="bullets">{value.map((b, i) => (
    <div key={i} className="bullet"><div className="row nowrap"><input value={b} aria-label={`${t('Achievement')} ${i + 1}`} placeholder={t('Built X that helped Y, measured by Z')} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />
      <Button variant="ghost" size="sm" onClick={() => onChange(value.length > 1 ? value.filter((_, k) => k !== i) : [''])} aria-label={t('Remove')}>×</Button></div><BulletHint text={b} lang={lang} /></div>))}
    <Button variant="secondary" size="sm" onClick={() => onChange([...value, ''])}>{t('Add achievement')}</Button></div>);
}
function Input({ f, value, onChange, lang }) {
  const { t } = useT(); const [k, label, type] = f;
  if (type === 'bullets') return <div className="span-2"><span className="lbl">{t(label)}</span><Bullets value={value} onChange={onChange} lang={lang} /></div>;
  if (type === 'check') return <label className="check"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {t(label)}</label>;
  if (type === 'textarea') return <label className="span-2">{t(label)}<textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} maxLength={400} /></label>;
  if (type === 'level') return <label>{t(label)}<select value={value} onChange={(e) => onChange(e.target.value)}>{LEVELS.map((l) => <option key={l} value={l}>{t(l)}</option>)}</select></label>;
  if (type === 'month') return <label>{t(label)}<input type="month" value={value} placeholder="YYYY-MM" onChange={(e) => onChange(e.target.value)} disabled={k === 'end' && false} /></label>;
  return <label>{t(label)}<input value={value} maxLength={160} onChange={(e) => onChange(e.target.value)} /></label>;
}

function ListSection({ cv, s, edit, open }) {
  const { t } = useT(); const sc = SCHEMA[s], list = cv[s];
  return (
    <details className="acc" open={open} data-acc={s}><summary><b>{t(sc.title)}</b><span className="muted">{list.length}</span></summary>
      <div className="acc-body">
        {list.map((e, i) => (
          <details key={e.id} className="entry" open={list.length === 1 || i === list.length - 1 && !e[sc.primary]}>
            <summary>{e[sc.primary] || <span className="muted">{t('New entry')}</span>}{e[sc.secondary] ? <span className="muted"> · {e[sc.secondary]}</span> : null}</summary>
            <div className="fields">{sc.fields.map((f) => <Input key={f[0]} f={f} lang={cv.lang} value={e[f[0]]} onChange={(v) => edit((c) => { c[s][i][f[0]] = v; if (f[0] === 'current' && v) c[s][i].end = ''; })} />)}</div>
            <div className="row"><Button variant="secondary" size="sm" onClick={() => edit((c) => swap(c[s], i, -1))} disabled={i === 0} aria-label={t('Move up')}>↑</Button><Button variant="secondary" size="sm" onClick={() => edit((c) => swap(c[s], i, 1))} disabled={i === list.length - 1} aria-label={t('Move down')}>↓</Button><Button variant="ghost" size="sm" onClick={() => edit((c) => { c[s].splice(i, 1); })}>{t('Remove')}</Button></div>
          </details>))}
        <Button variant="secondary" size="sm" onClick={() => edit((c) => { c[s].push(emptyEntry(s)); })}>{t('Add entry')}</Button>
      </div>
    </details>
  );
}

export default function ContentEditor({ cv, edit, onEvidence, evidenceCount }) {
  const { t } = useT(); const p = cv.personal; const set = (k) => (e) => edit((c) => { c.personal[k] = e.target.value; });
  return (
    <div className="stack">
      <details className="acc" open data-acc="personal"><summary><b>{t('Personal details')}</b></summary>
        <div className="acc-body"><div className="fields">
          <label>{t('Full name')}<input value={p.name} onChange={set('name')} autoComplete="name" /></label><label>{t('Headline')}<input value={p.headline} onChange={set('headline')} placeholder={t('Computer Science student · Data and software')} /></label>
          <label>{t('Email')}<input type="email" value={p.email} onChange={set('email')} autoComplete="email" /></label><label>{t('Phone')}<input type="tel" value={p.phone} onChange={set('phone')} autoComplete="tel" placeholder="+20 …" /></label>
          <label className="span-2">{t('Location')}<input value={p.location} onChange={set('location')} placeholder="Damietta, Egypt" /></label></div>
          <div className="photo-row">{p.photo ? <img className="photo-prev" src={p.photo} alt="" /> : <span className="photo-prev empty" aria-hidden="true" />}
            <div className="stack"><span className="lbl">{t('Photo (optional)')}</span><div className="row"><label className="btn btn-secondary btn-sm file">{t(p.photo ? 'Change photo' : 'Add photo')}<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={async (e) => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { const d = await squarePhoto(f); edit((c) => { c.personal.photo = d; }); } catch { toast('Use a JPG, PNG or WebP image under 8 MB.'); } }} /></label>{p.photo && <Button variant="ghost" size="sm" onClick={() => edit((c) => { c.personal.photo = ''; })}>{t('Remove')}</Button>}</div>
              <small className="muted">{t('Only photo templates show it. Many employers abroad prefer CVs without a photo, so keep a photo-free version too.')}</small></div></div>
          <span className="lbl">{t('Links')}</span>
          {p.links.map((l, i) => (<div key={l.id} className="row nowrap"><input aria-label={t('Label')} value={l.label} placeholder="LinkedIn" onChange={(e) => edit((c) => { c.personal.links[i].label = e.target.value; })} style={{ maxWidth: 140 }} /><input aria-label={t('Link')} value={l.url} placeholder="linkedin.com/in/…" onChange={(e) => edit((c) => { c.personal.links[i].url = e.target.value; })} /><Button variant="ghost" size="sm" onClick={() => edit((c) => { c.personal.links.splice(i, 1); })} aria-label={t('Remove')}>×</Button></div>))}
          <Button variant="secondary" size="sm" onClick={() => edit((c) => { c.personal.links.push({ id: uid(), label: '', url: '' }); })}>{t('Add link')}</Button></div></details>
      <details className="acc" open data-acc="summary"><summary><b>{t('Summary')}</b><span className="muted">{wc(cv.summary)} {t('words')}</span></summary>
        <div className="acc-body"><label>{t('Two or three lines: who you are, your strongest skills, what you want.')}<textarea rows={4} value={cv.summary} maxLength={600} onChange={(e) => edit((c) => { c.summary = e.target.value; })} /></label>
          <small className={wc(cv.summary) >= 25 && wc(cv.summary) <= 60 ? 'hint ok' : 'hint warn'}>{t('Aim for 25 to 60 words.')}</small></div></details>
      <ListSection cv={cv} s="education" edit={edit} open /><ListSection cv={cv} s="experience" edit={edit} />
      <details className="acc"><summary><b>{t('Projects')}</b><span className="muted">{cv.projects.length}</span></summary><div className="acc-body"><Button variant="secondary" size="sm" onClick={onEvidence} disabled={!evidenceCount}>{t('Import from Evidence')} ({evidenceCount})</Button></div></details>
      <ListSection cv={cv} s="projects" edit={edit} />
      <details className="acc" open data-acc="skills"><summary><b>{t('Skills')}</b></summary>
        <div className="acc-body">{cv.skills.map((g, i) => (<div key={g.id} className="row nowrap top"><input aria-label={t('Group')} value={g.group} placeholder={t('Group, e.g. Technical')} style={{ maxWidth: 170 }} onChange={(e) => edit((c) => { c.skills[i].group = e.target.value; })} /><textarea aria-label={t('Skills, separated by commas')} rows={2} value={g.items} placeholder="SQL, Python, Excel" onChange={(e) => edit((c) => { c.skills[i].items = e.target.value; })} /><Button variant="ghost" size="sm" onClick={() => edit((c) => { c.skills.splice(i, 1); })} aria-label={t('Remove')}>×</Button></div>))}
          <Button variant="secondary" size="sm" onClick={() => edit((c) => { c.skills.push({ id: uid(), group: '', items: '' }); })}>{t('Add skill group')}</Button></div></details>
      {LIST_SECTIONS.filter((s) => !['education', 'experience', 'projects'].includes(s)).map((s) => <ListSection key={s} cv={cv} s={s} edit={edit} />)}
      <details className="acc" data-acc="custom"><summary><b>{t('Custom sections')}</b><span className="muted">{cv.custom.length}</span></summary>
        <div className="acc-body">{cv.custom.map((c0, i) => (<div key={c0.id} className="stack"><input aria-label={t('Title')} placeholder={t('Section title')} value={c0.title} onChange={(e) => edit((c) => { c.custom[i].title = e.target.value; })} /><textarea aria-label={t('Text')} rows={3} value={c0.text} onChange={(e) => edit((c) => { c.custom[i].text = e.target.value; })} /><Button variant="ghost" size="sm" onClick={() => edit((c) => { c.custom.splice(i, 1); })}>{t('Remove')}</Button></div>))}
          <Button variant="secondary" size="sm" onClick={() => edit((c) => { c.custom.push({ id: uid(), title: '', text: '' }); })}>{t('Add custom section')}</Button></div></details>
    </div>
  );
}
