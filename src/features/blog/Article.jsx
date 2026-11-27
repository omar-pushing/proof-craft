import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { POSTS } from './posts.js';
import Button, { Arrow } from '@/components/ui/Button.jsx';
import { useT } from '@/i18n/index.js';
import { useNewsletterArticles } from '@/services/articles/localStore.js';

export default function Article() {
  const { slug } = useParams(); const { t } = useT(); const custom = useNewsletterArticles(); const posts = [...custom.filter((post) => post.published), ...POSTS]; const i = posts.findIndex((p) => p.slug === slug); const p = posts[i];
  useEffect(() => {
    const bar = document.getElementById('read-bar'); if (!bar) return;
    const on = () => { const d = document.documentElement; bar.style.transform = `scaleX(${Math.min(1, window.scrollY / Math.max(1, d.scrollHeight - innerHeight))})`; };
    on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on);
  }, [slug]);
  useEffect(() => { if (p) document.title = `${p.title} · ProofCraft`; return () => { document.title = 'ProofCraft'; }; }, [p]);
  if (!p) return <Navigate to="/newsletter" replace />;
  const next = posts[(i + 1) % posts.length];
  return (
    <>
      <div id="read-bar" className="read-bar" aria-hidden="true" />
      <article className="article container narrow">
        <Link to="/newsletter" className="back"><span className="arr back">←</span> {t('All articles')}</Link>
        {p.image ? <img className="article-hero-image" src={p.image} alt={t(p.imageAlt || '')} /> : <div className={`cover tall c${p.cover}`} />}
        <p className="meta"><span className="tag">{t(p.tag)}</span> <span className="muted">{p.mins} {t('min read')}</span></p>
        <h1 className="h1-s">{t(p.title)}</h1><p className="dek">{t(p.dek)}</p>
        {p.sections.map(([h, body], k) => (<div key={`${h}-${k}`}><h2>{t(h)}</h2><p className="article-copy">{t(body)}</p>{k === 0 && p.quote && <blockquote>{t(p.quote)}</blockquote>}</div>))}
        {p.tool && <aside className="try"><div><b>{t('Try it now')}</b><p className="muted">{t('Put this into practice in your free workspace.')}</p></div><Button to={p.tool[0]}>{t(p.tool[1])} <Arrow /></Button></aside>}
        <div className="next"><small className="muted">{t('Next article')}</small><Link to={`/newsletter/${next.slug}`}><h3>{t(next.title)}</h3></Link></div>
      </article>
    </>
  );
}
