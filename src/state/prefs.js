import { createStore } from '@/lib/store.js';
const system = () => (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
export const prefs = createStore({ lang: 'en', theme: system() }, { key: 'pc:prefs' });
export const toggleTheme = () => prefs.set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' }));
export const toggleLang = () => prefs.set((s) => ({ lang: s.lang === 'ar' ? 'en' : 'ar' }));
