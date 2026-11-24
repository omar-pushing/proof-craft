import { memo, useEffect, useMemo, useRef, useState } from 'react';
import CvDocument from './CvDocument.jsx';
import { SAMPLE_CV } from './sample.js';
import Button from '@/components/ui/Button.jsx';
import { ACCENTS, BULLETS, FONTS, PAPERS, SKILL_STYLES, TAGS, TEMPLATES } from '@/domain/cvTemplates.js';
import { HEADINGS, SECTION_ORDER, defaultDesign } from '@/domain/cv.js';
import { useT } from '@/i18n/index.js';

/** Miniature of a template filled with fictional data, scaled to its box. Memoised so typing in the editor never re-renders it. */
const Thumb = memo(function Thumb({ id, accent, font }) {
  const box = useRef(null); const [k, setK] = useState(0.2);
  const cv = useMemo(() => ({ ...SAMPLE_CV, template: id, design: { ...SAMPLE_CV.design, accent, font }, personal: { ...SAMPLE_CV.personal, photo: PHOTO } }), [id, accent, font]);
  useEffect(() => { const el = box.current, ro = new ResizeObserver(() => setK(el.clientWidth / 794)); ro.observe(el); setK(el.clientWidth / 794); return () => ro.disconnect(); }, []);
  return <span className="tpl-thumb" ref={box} aria-hidden="true"><span className="tpl-scale" style={{ transform: `scale(${k})` }}><CvDocument cv={cv} /></span></span>;
});
const PHOTO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#c9cfe8"/><circle cx="50" cy="38" r="18" fill="#7a85c1"/><path d="M14 100c0-24 16-38 36-38s36 14 36 38z" fill="#7a85c1"/></svg>');

export function TemplatePicker({ cv, edit, onExample }) {
  const { t } = useT(); const [tag, setTag] = useState('all');
  const list = TEMPLATES.filter((x) => tag === 'all' || (tag === 'ats' ? x.ats : x.tags.includes(tag)));
  return (
    <div className="stack">
      <div className="row between"><p className="help grow">{t('Single-column templates are the safest for online applications. Two-column templates look good in person but some parsers read them out of order.')}</p><Button variant="secondary" size="sm" onClick={onExample}>{t('Preview with example data')}</Button></div>
      <div className="chips" role="group" aria-label={t('Filter templates')}>{TAGS.map(([k, l]) => <button key={k} className={`chip-toggle${tag === k ? ' on' : ''}`} aria-pressed={tag === k} onClick={() => setTag(k)}>{t(l)}</button>)}<span className="muted count">{list.length} {t('templates')}</span></div>
      <div className="tpl-grid" role="radiogroup" aria-label={t('Templates')}>
        {list.map((tp) => (
          <button key={tp.id} role="radio" aria-checked={cv.template === tp.id} className={`tpl-card${cv.template === tp.id ? ' on' : ''}`} onClick={() => edit((c) => { c.template = tp.id; })}>
            <Thumb id={tp.id} accent={cv.design.accent} font={cv.design.font} />
            <b>{t(tp.name)}</b><span className={`status ${tp.ats ? 'ok' : 'warn'}`}>{tp.ats ? t('Single column') : t('Two columns')}</span><small className="muted">{t(tp.desc)}</small>
          </button>))}
      </div>
    </div>
  );
}

export function DesignPanel({ cv, edit }) {
  const { t } = useT(); const d = cv.design; const set = (k, v) => edit((c) => { c.design[k] = v; });
  const Range = ({ k, label, min, max, step, unit }) => <label>{t(label)}: <b>{d[k]}{unit}</b><input type="range" min={min} max={max} step={step} value={d[k]} onChange={(e) => set(k, +e.target.value)} /></label>;
  const Sel = ({ k, label, opts }) => <label>{t(label)}<select value={d[k]} onChange={(e) => set(k, e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}</select></label>;
  return (
    <div className="form">
      <fieldset><legend>{t('Accent colour')}</legend><div className="swatches">{ACCENTS.map((c) => <button key={c} className={`swatch${d.accent === c ? ' on' : ''}`} style={{ background: c }} onClick={() => set('accent', c)} aria-label={c} aria-pressed={d.accent === c} />)}<label className="swatch-custom">{t('Custom')}<input type="color" value={d.accent} onChange={(e) => set('accent', e.target.value)} /></label></div></fieldset>
      <div className="grid-2"><label>{t('Font')}<select value={d.font} onChange={(e) => set('font', e.target.value)}>{FONTS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label><Sel k="paper" label="Paper" opts={Object.entries(PAPERS).map(([k, p]) => [k, p.name])} /></div>
      <span className="help">{t('English CVs use common fonts that every system can read. Arabic CVs use Thmanyah Sans when available.')}</span>
      <div className="grid-2"><Range k="size" label="Text size" min={9} max={12.5} step={0.5} unit=" pt" /><Range k="line" label="Line spacing" min={1.1} max={1.7} step={0.05} unit="" /><Range k="margin" label="Page margin" min={8} max={25} step={1} unit=" mm" /><Range k="gap" label="Section spacing" min={6} max={24} step={1} unit=" px" /></div>
      <div className="grid-2"><Sel k="bullet" label="Bullet style" opts={BULLETS} /><Sel k="skills" label="Skills layout" opts={SKILL_STYLES} /><Sel k="dates" label="Dates" opts={[['right', 'On the right'], ['below', 'Under the title']]} /><Sel k="nameCase" label="Name" opts={[['normal', 'As typed'], ['upper', 'CAPITALS']]} /></div>
      <label>{t('CV language')}<select value={cv.lang} onChange={(e) => edit((c) => { c.lang = e.target.value; })}><option value="en">English</option><option value="ar">العربية</option></select><span className="help">{t('Changes section headings, dates and the reading direction.')}</span></label>
      <Button variant="ghost" size="sm" onClick={() => edit((c) => { c.design = defaultDesign(); })}>{t('Reset design')}</Button>
    </div>
  );
}

export function SectionsPanel({ cv, edit }) {
  const { t } = useT(); const H = HEADINGS.en;
  const move = (i, dir) => edit((c) => { const j = i + dir; if (j < 0 || j >= c.order.length) return; [c.order[i], c.order[j]] = [c.order[j], c.order[i]]; });
  const toggle = (s) => edit((c) => { c.hidden = c.hidden.includes(s) ? c.hidden.filter((x) => x !== s) : [...c.hidden, s]; });
  return (
    <div className="stack">
      <p className="help">{t('Students usually lead with Education, then projects and experience. Hide sections you do not need. Sections with no content are left out automatically.')}</p>
      <ul className="list">{cv.order.map((s, i) => (
        <li key={s} className="item"><span className="grow"><b>{t(H[s])}</b></span>
          <label className="check"><input type="checkbox" checked={!cv.hidden.includes(s)} onChange={() => toggle(s)} /> {t('Show')}</label>
          <Button variant="secondary" size="sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${t('Move up')}: ${t(H[s])}`}>↑</Button><Button variant="secondary" size="sm" onClick={() => move(i, 1)} disabled={i === cv.order.length - 1} aria-label={`${t('Move down')}: ${t(H[s])}`}>↓</Button></li>))}</ul>
      <Button variant="ghost" size="sm" onClick={() => edit((c) => { c.order = [...SECTION_ORDER]; c.hidden = []; })}>{t('Reset order')}</Button>
    </div>
  );
}
