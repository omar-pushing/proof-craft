import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import { LEGAL } from '@/config/legal.js';
import { APP } from '@/config/app.js';
import { useT } from '@/i18n/index.js';
import { openFeedback } from '@/state/ui.js';

const Block = ({ b }) => (typeof b === 'string' ? <p>{b}</p> : b.ul ? <ul>{b.ul.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p><b>{b.b}</b> {b.t}</p>);
export default function LegalPage({ title, updated, intro, summaryAr, sections }) {
  const { t, lang } = useT();
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <section className="container legal">
      <aside className="toc" aria-label={t('On this page')}><b>{t('On this page')}</b>{sections.map((s, i) => <button key={s.id} className="toc-link" onClick={() => go(s.id)}>{i + 1}. {s.h}</button>)}<Button variant="secondary" size="sm" onClick={() => window.print()}>{t('Print')}</Button></aside>
      <article className="prose">
        <p className="kicker">{t('Legal')}</p><h1>{title}</h1><p className="muted">{t('Last updated')}: {updated} · {LEGAL.entity}</p>
        {APP.publicShowcase && <aside className="notice warn" role="note">{t('Draft legal information: these pages have not been reviewed by counsel and are not final policies.')}</aside>}
        {lang === 'ar' && summaryAr && <aside className="notice ok" dir="rtl"><b>ملخص بسيط</b><ul>{summaryAr.map((x, i) => <li key={i}>{x}</li>)}</ul><small>النص الكامل بالإنجليزية هو المرجع حاليًا.</small></aside>}
        <p className="lede">{intro}</p>
        {sections.map((s, i) => (<section key={s.id} id={s.id}><h2>{i + 1}. {s.h}</h2>{s.p.map((b, k) => <Block key={k} b={b} />)}</section>))}
        <p className="help"><Link to="/privacy">{t('Privacy Policy')}</Link> · <Link to="/terms">{t('Terms of Use')}</Link> · <Link to="/cookies">{t('Cookies and storage')}</Link>{!APP.publicShowcase && <> · <button className="linkish" onClick={() => openFeedback('question')}>{t('Questions about this page?')}</button></>}</p>
      </article>
    </section>
  );
}
