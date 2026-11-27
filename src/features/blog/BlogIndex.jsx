import { useState } from 'react';
import { POSTS } from './posts.js';
import { useT } from '@/i18n/index.js';
import { useNewsletterArticles } from '@/services/articles/localStore.js';
import ArticleCard from './ArticleCard.jsx';
export default function BlogIndex() {
  const { t } = useT(); const custom = useNewsletterArticles(); const posts = [...custom.filter((post) => post.published), ...POSTS]; const categories = [...new Set(posts.map((post) => post.tag))]; const [selected, setSelected] = useState('all'); const active = selected === 'all' || categories.includes(selected) ? selected : 'all'; const visible = active === 'all' ? posts : posts.filter((post) => post.tag === active);
  return (<section className="section"><div className="container"><p className="kicker">{t('Newsletter')}</p><h1 className="h1-s">{t('Practical guides for college students')}</h1><p className="lede">{t('One idea per article. Read them without an account.')}</p><div className="article-filters" role="group" aria-label={t('Filter articles by category')}><button type="button" aria-pressed={active === 'all'} onClick={() => setSelected('all')}>{t('All articles')}</button>{categories.map((category) => <button key={category} type="button" aria-pressed={active === category} onClick={() => setSelected(category)}>{t(category)}</button>)}</div><div className="article-grid">{visible.map((article) => <ArticleCard key={article.slug} article={article} />)}</div></div></section>);
}
