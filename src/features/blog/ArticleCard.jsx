import { Link } from 'react-router-dom';
import ProofIcon from '@/components/system/ProofIcon.jsx';
import { useT } from '@/i18n/index.js';

const ICONS = { Career: ['career', 'blue'], Study: ['study', 'yellow'], Projects: ['projects', 'ink'] };

/** One public article card shared by the landing page and newsletter index. */
export default function ArticleCard({ article }) {
  const { t } = useT(); const [fallbackIcon, fallbackTone] = ICONS[article.tag] || ['evidence', 'green']; const icon = article.categoryIcon || fallbackIcon; const tone = article.categoryTone || fallbackTone;
  return <Link to={`/newsletter/${article.slug}`} className="article-card"><div className={`article-card-cover${article.image ? '' : ` c${article.cover}`}`}>{article.image && <img src={article.image} alt={t(article.imageAlt || '')} />}</div><div className="article-card-body"><div className="article-card-meta"><ProofIcon name={icon} tone={tone} size="sm" /><span>{t(article.tag)}</span><small>{article.mins} {t('min read')}</small></div><h3>{t(article.title)}</h3><p>{t(article.dek)}</p></div></Link>;
}

