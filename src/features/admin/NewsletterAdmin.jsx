import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import ProofIcon from '@/components/system/ProofIcon.jsx';
import { removeNewsletterArticle, removeNewsletterCategory, saveNewsletterArticle, saveNewsletterCategory, useNewsletterArticles, useNewsletterCategories } from '@/services/articles/localStore.js';
import { POSTS } from '@/features/blog/posts.js';

const INITIAL = { title: '', dek: '', categoryId: 'study', mins: 4, image: '', imageAlt: '', sectionTitle: '', body: '', quote: '' };
const CATEGORY_INITIAL = { name: '', icon: 'evidence', tone: 'green' };
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || `article-${Date.now()}`;

function optimiseImage(file) {
  return new Promise((resolve, reject) => {
    if (!TYPES.has(file.type)) return reject(new Error('Choose a JPEG, PNG, or WebP image.'));
    if (file.size > 8 * 1024 * 1024) return reject(new Error('The source image must be smaller than 8 MB.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('The selected file is not a valid image.'));
      image.onload = () => {
        const scale = Math.min(1, 1600 / image.naturalWidth, 1000 / image.naturalHeight); const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale)); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/webp', .82); if (data.length > 2_500_000) return reject(new Error('The optimised image is still too large. Choose a simpler or smaller image.')); resolve(data);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function NewsletterAdmin({ onConfirm }) {
  const articles = useNewsletterArticles(); const categories = useNewsletterCategories();
  const [form, setForm] = useState(INITIAL); const [categoryForm, setCategoryForm] = useState(CATEGORY_INITIAL); const [categoryError, setCategoryError] = useState(''); const [error, setError] = useState(''); const [processing, setProcessing] = useState(false); const [fileKey, setFileKey] = useState(0);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value })); const selectedCategory = categories.find((category) => category.id === form.categoryId) || categories[0];
  const chooseImage = async (event) => { const file = event.target.files?.[0]; if (!file) return; setProcessing(true); setError(''); try { set('image', await optimiseImage(file)); } catch (err) { set('image', ''); setError(err.message); } finally { setProcessing(false); } };
  const addCategory = (event) => {
    event.preventDefault(); const name = categoryForm.name.trim(); setCategoryError(''); if (!name) return;
    if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) { setCategoryError('A category with this name already exists.'); return; }
    const category = { id: crypto.randomUUID?.() || `category-${Date.now()}`, name, icon: categoryForm.icon, tone: categoryForm.tone, locked: false };
    onConfirm(`Create the “${name}” category?`, 'article_category_created', category.id, () => { saveNewsletterCategory(category); setCategoryForm(CATEGORY_INITIAL); setForm((current) => ({ ...current, categoryId: category.id })); });
  };
  const submit = (event) => {
    event.preventDefault(); setError(''); if (!form.image) { setError('Add an article image before publishing.'); return; } if (!selectedCategory) { setError('Choose an article category.'); return; }
    const baseSlug = slugify(form.title); const slug = [...articles, ...POSTS].some((item) => item.slug === baseSlug) ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
    const article = { id: crypto.randomUUID?.() || `${Date.now()}`, slug, title: form.title.trim(), dek: form.dek.trim(), categoryId: selectedCategory.id, tag: selectedCategory.name, categoryIcon: selectedCategory.icon, categoryTone: selectedCategory.tone, mins: Number(form.mins) || 4, image: form.image, imageAlt: form.imageAlt.trim(), quote: form.quote.trim(), sections: [[form.sectionTitle.trim(), form.body.trim()]], published: true, publishedAt: Date.now() };
    onConfirm(`Publish “${article.title}”?`, 'article_published', slug, () => { saveNewsletterArticle(article); setForm({ ...INITIAL, categoryId: categories[0]?.id || 'study' }); setFileKey((value) => value + 1); });
  };
  const ready = form.title.trim() && form.dek.trim() && form.image && form.imageAlt.trim() && form.sectionTitle.trim() && form.body.trim() && selectedCategory && !processing;
  return <><header className="admin-page-head"><div><span>Content publishing</span><h1>Newsletter articles</h1><p>Create as many articles and categories as the production content service supports. Every article uses the same public card on the landing page and newsletter.</p></div></header>
    <section className="admin-card category-manager"><div><h2>Article categories</h2><p>Add a category, choose its ProofCraft icon and colour, then use it while publishing.</p></div><form onSubmit={addCategory}><label>Category name<input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required maxLength="40" /></label><label>Icon<select value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}><option value="study">Study</option><option value="career">Career</option><option value="projects">Projects</option><option value="plan">Plan</option><option value="evidence">Evidence</option></select></label><label>Colour<select value={categoryForm.tone} onChange={(e) => setCategoryForm({ ...categoryForm, tone: e.target.value })}><option value="blue">Blue</option><option value="yellow">Yellow</option><option value="green">Green</option><option value="ink">Ink</option></select></label><Button type="submit">Add category</Button></form>{categoryError && <p className="admin-form-error" role="alert">{categoryError}</p>}<div className="category-list">{categories.map((category) => { const used = articles.some((article) => article.categoryId === category.id); return <div key={category.id}><ProofIcon name={category.icon} tone={category.tone} size="sm" /><span><b>{category.name}</b><small>{category.locked ? 'Core category' : used ? 'In use' : 'Custom category'}</small></span>{!category.locked && <button type="button" disabled={used} title={used ? 'Move or remove articles in this category first' : undefined} onClick={() => onConfirm(`Remove the “${category.name}” category?`, 'article_category_removed', category.id, () => removeNewsletterCategory(category.id))}>Remove</button>}</div>; })}</div></section>
    <div className="article-editor-grid"><form className="admin-card article-editor" onSubmit={submit}><div className="admin-form-grid"><label>Article title<input value={form.title} onChange={(e) => set('title', e.target.value)} required maxLength="120" /></label><label>Category<select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="admin-span-2">Short description<textarea value={form.dek} onChange={(e) => set('dek', e.target.value)} required rows="3" maxLength="220" /></label><label>Reading time<input type="number" min="1" max="30" value={form.mins} onChange={(e) => set('mins', e.target.value)} required /></label><label>Article image<input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} required={!form.image} /></label><small className="admin-span-2 upload-help">JPEG, PNG, or WebP. Use a landscape image around 1600 × 900. It is resized before the preview is stored.</small><label className="admin-span-2">Image description for screen readers<input value={form.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} required maxLength="180" placeholder="Describe what is useful in the image" /></label><label className="admin-span-2">First section heading<input value={form.sectionTitle} onChange={(e) => set('sectionTitle', e.target.value)} required maxLength="120" /></label><label className="admin-span-2">Article body<textarea value={form.body} onChange={(e) => set('body', e.target.value)} required rows="9" /></label><label className="admin-span-2">Pull quote <span className="optional">Optional</span><input value={form.quote} onChange={(e) => set('quote', e.target.value)} maxLength="180" /></label></div>{error && <p className="admin-form-error" role="alert">{error}</p>}<Button type="submit" disabled={!ready}>{processing ? 'Preparing image…' : 'Review and publish'}</Button></form>
      <aside className="admin-card article-live-preview" aria-live="polite"><span className="admin-kicker">Card preview</span><div className="admin-article-card">{form.image ? <img src={form.image} alt={form.imageAlt || ''} /> : <div className="admin-image-placeholder">Your article image appears here</div>}<div><small>{selectedCategory?.name || 'Category'} · {form.mins || 4} min read</small><h2>{form.title || 'Your article title'}</h2><p>{form.dek || 'The short description appears here on the landing page and newsletter.'}</p></div></div></aside></div>
    <section className="admin-card"><div className="row between wrap"><div><h2>Published from this preview</h2><p>The frontend has no article-count limit. Browser storage is only a preview; production capacity comes from the content database and image storage.</p></div></div>{articles.length ? <div className="published-articles">{articles.map((article) => <article key={article.slug}><img src={article.image} alt="" /><div><b>{article.title}</b><small>{article.tag} · {article.mins} min read</small></div><Link to={`/newsletter/${article.slug}`}>View</Link><button type="button" onClick={() => onConfirm(`Remove “${article.title}”?`, 'article_removed', article.slug, () => removeNewsletterArticle(article.slug))}>Remove</button></article>)}</div> : <p>No articles have been published from this browser yet.</p>}</section>
  </>;
}
