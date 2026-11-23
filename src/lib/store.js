import { useSyncExternalStore } from 'react';

/**
 * Tiny external store with optional versioned localStorage persistence.
 * Selectors passed to useStore must return stable references (primitives or
 * existing objects), never freshly built objects.
 */
export function createStore(initial, { key, version = 1 } = {}) {
  let state = initial;
  if (key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { const p = JSON.parse(raw); if (p.v === version) state = { ...initial, ...p.d }; }
    } catch { /* corrupted storage falls back to defaults */ }
  }
  const subs = new Set();
  let timer;
  const persist = () => {
    if (!key) return;
    clearTimeout(timer);
    timer = setTimeout(() => { try { localStorage.setItem(key, JSON.stringify({ v: version, d: state })); } catch { /* quota or private mode */ } }, 150);
  };
  return {
    get: () => state,
    set(patch) { state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }; subs.forEach((f) => f()); persist(); },
    replace(next) { state = next; subs.forEach((f) => f()); persist(); },
    subscribe: (f) => (subs.add(f), () => subs.delete(f)),
  };
}
export const useStore = (store, selector = (s) => s) => useSyncExternalStore(store.subscribe, () => selector(store.get()));
