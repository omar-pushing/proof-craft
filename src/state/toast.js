import { createStore } from '@/lib/store.js';
export const toastStore = createStore({ msg: '', n: 0 });
export const toast = (msg) => toastStore.set((s) => ({ msg, n: s.n + 1 }));
