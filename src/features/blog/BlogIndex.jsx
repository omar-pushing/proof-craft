import { Link } from 'react-router-dom';
import { POSTS } from './posts.js';
import { useT } from '@/i18n/index.js';

export function PostCard({ p }) {
  const { t } = useT();
  return (<Link to={`/newsletter/${p.slug}`} className="post"><div className={`cover c${p.cover}`} /><div className="post-body"><span className="tag">{t(p.tag)}</span><h3>{p.title}</h3><p className="muted">{p.dek}</p><small className="muted">{p.mins} {t('min read')}</small></div></Link>);
}
export default function BlogIndex() {
  const { t } = useT();
  return (<section className="section"><div className="container"><p className="kicker">{t('Newsletter')}</p><h1 className="h1-s">{t('Practical guides for college students')}</h1><p className="lede">{t('One idea per article. Read them without an account.')}</p><div className="posts">{POSTS.map((p) => <PostCard key={p.slug} p={p} />)}</div></div></section>);
}
