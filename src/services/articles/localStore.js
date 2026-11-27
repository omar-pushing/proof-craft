import { createStore, useStore } from '@/lib/store.js';

/** Preview CMS. Production should replace data URLs with object-storage URLs returned by the content API. */
const KEY = 'pc:newsletter:articles';
export const DEFAULT_NEWSLETTER_CATEGORIES = [
  { id: 'study', name: 'Study', icon: 'study', tone: 'yellow', locked: true },
  { id: 'career', name: 'Career', icon: 'career', tone: 'blue', locked: true },
  { id: 'projects', name: 'Projects', icon: 'projects', tone: 'ink', locked: true },
];
const store = createStore({ articles: [], categories: DEFAULT_NEWSLETTER_CATEGORIES }, { key: KEY, version: 1 });

// Keep the public preview in sync when the admin editor is open in another tab.
if (typeof window !== 'undefined') window.addEventListener('storage', (event) => {
  if (event.key !== KEY || !event.newValue) return;
  try { const value = JSON.parse(event.newValue); if (value.v === 1 && Array.isArray(value.d?.articles)) store.replace({ articles: value.d.articles, categories: Array.isArray(value.d?.categories) ? value.d.categories : DEFAULT_NEWSLETTER_CATEGORIES }); } catch { /* ignore invalid external data */ }
});

export const useNewsletterArticles = () => useStore(store, (state) => state.articles);
export const useNewsletterCategories = () => useStore(store, (state) => state.categories);
export const listNewsletterArticles = () => store.get().articles;

export function saveNewsletterArticle(article) {
  const next = [article, ...store.get().articles.filter((item) => item.slug !== article.slug)];
  store.set({ articles: next });
  return article;
}

export function removeNewsletterArticle(slug) {
  store.set({ articles: store.get().articles.filter((item) => item.slug !== slug) });
}

export function saveNewsletterCategory(category) {
  const name = String(category.name || '').trim().slice(0, 40);
  if (!name || store.get().categories.some((item) => item.name.toLowerCase() === name.toLowerCase())) return false;
  store.set({ categories: [...store.get().categories, { ...category, name }] });
  return true;
}

export function removeNewsletterCategory(id) {
  const state = store.get();
  if (state.categories.find((item) => item.id === id)?.locked || state.articles.some((article) => article.categoryId === id)) return false;
  store.set({ categories: state.categories.filter((item) => item.id !== id) });
  return true;
}

