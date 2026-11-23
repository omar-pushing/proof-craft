import { HEADINGS, LEVEL_AR, SCHEMA, bulletsOf, dateRange, linksOf, visibleSections } from '@/domain/cv.js';
import { AR_FONT, FONTS, PAPERS, SIDE_SECTIONS, templateById } from '@/domain/cvTemplates.js';

const clean = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
export const hasContent = (cv, s) => s === 'summary' ? !!cv.summary.trim() : s === 'skills' ? cv.skills.some((g) => g.items.trim())
  : cv[s]?.some((e) => Object.entries(e).some(([k, v]) => k !== 'id' && k !== 'current' && k !== 'evidenceId' && (Array.isArray(v) ? v.some((x) => x.trim()) : v && v !== 'Fluent')) || (s === 'languages' && e.name));

function Entry({ cv, s, e }) {
  const sc = SCHEMA[s], lang = cv.lang, range = dateRange(e, lang), sub = [e[sc.secondary], e.field].filter(Boolean).join(', ');
  const bl = bulletsOf(e);
  return (
    <div className="cv-entry">
      <div className="cv-row"><span className="cv-main"><b>{e[sc.primary]}</b>{sub && <span className="cv-sub">{e[sc.primary] ? ' · ' : ''}{sub}</span>}{e.location && <span className="cv-loc"> · {e.location}</span>}</span>{range && <span className="cv-date">{range}</span>}</div>
      {e.tech && <p className="cv-meta">{e.tech}</p>}{e.gpa && <p className="cv-meta">GPA: {e.gpa}</p>}{e.notes && <p className="cv-meta">{e.notes}</p>}{e.note && <p className="cv-meta">{e.note}</p>}{e.contact && <p className="cv-meta">{e.contact}</p>}
      {e.link && <p className="cv-meta">{clean(e.link)}</p>}
      {bl.length > 0 && <ul>{bl.map((b, i) => <li key={i}>{b}</li>)}</ul>}
    </div>
  );
}
function Block({ cv, s }) {
  if (s === 'summary') return <p>{cv.summary}</p>;
  if (s === 'skills') return <div className="cv-skills">{cv.skills.filter((g) => g.items.trim()).map((g) => <p key={g.id}>{g.group && <b>{g.group}: </b>}{g.items}</p>)}</div>;
  if (s === 'languages') return <p>{cv.languages.filter((l) => l.name).map((l) => `${l.name} (${cv.lang === 'ar' ? LEVEL_AR[l.level] || l.level : l.level})`).join(' · ')}</p>;
  return cv[s].filter((e) => Object.entries(e).some(([k, v]) => k !== 'id' && k !== 'current' && (Array.isArray(v) ? v.some((x) => x.trim()) : v))).map((e) => <Entry key={e.id} cv={cv} s={s} e={e} />);
}

/** Renders one CV. Template layout is pure CSS (styles/cv.css), so the same markup serves preview, thumbnails and print. */
export default function CvDocument({ cv }) {
  const lang = cv.lang, H = HEADINGS[lang] || HEADINGS.en, tpl = templateById(cv.template), d = cv.design, p = cv.personal, paper = PAPERS[d.paper] || PAPERS.a4;
  const font = lang === 'ar' ? AR_FONT : FONTS.find((f) => f[0] === d.font)?.[2] || FONTS[0][2];
  const style = { '--cv-accent': d.accent, '--cv-font': font, '--cv-size': `${d.size}pt`, '--cv-line': d.line, '--cv-margin': `${d.margin}mm`, '--cv-gap': `${d.gap}px`, width: paper.w, minHeight: paper.h };
  const sections = visibleSections(cv).filter((s) => hasContent(cv, s));
  const side = tpl.cols === 2 ? sections.filter((s) => SIDE_SECTIONS.includes(s)) : [], main = sections.filter((s) => !side.includes(s));
  const contact = [p.email, p.phone, p.location, ...linksOf(cv).map((l) => clean(l.url))].filter(Boolean);
  const Sec = ({ s }) => <section className={`cv-sec cv-${s}`}><h2>{H[s]}</h2><Block cv={cv} s={s} /></section>;
  const head = (<header className="cv-head"><h1>{p.name || '\u00A0'}</h1>{p.headline && <p className="cv-title">{p.headline}</p>}{tpl.id !== 'sidebar' && <p className="cv-contact">{contact.map((x, i) => <span key={i}>{x}</span>)}</p>}</header>);
  const custom = cv.custom.filter((c) => c.title && c.text.trim()).map((c) => <section key={c.id} className="cv-sec"><h2>{c.title}</h2><p>{c.text}</p></section>);
  return (
    <article className={`cv-page tpl-${tpl.id} cols-${tpl.cols}`} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} style={style}>
      {head}
      {tpl.cols === 2 ? (
        <div className="cv-cols"><div className="cv-mainc">{main.map((s) => <Sec key={s} s={s} />)}{custom}</div>
          <aside className="cv-sidec">{tpl.id === 'sidebar' && <section className="cv-sec cv-contactblock"><h2>{H.contact}</h2>{contact.map((x, i) => <p key={i}>{x}</p>)}</section>}{side.map((s) => <Sec key={s} s={s} />)}</aside></div>
      ) : (<>{main.map((s) => <Sec key={s} s={s} />)}{custom}</>)}
    </article>
  );
}
