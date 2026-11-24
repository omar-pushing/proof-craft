import { uid } from '../../lib/id.js';
/**
 * Feedback inbox driver. The preview keeps messages in this browser so the whole flow (send, triage, reply status) can be tried.
 * The API driver must implement the same methods: submit(item), listAll() (admin only), listMine(userId), update(id, patch) (admin only).
 */
const KEY = 'pc:feedback'; const subs = new Set(); let cache = { raw: undefined, val: [] };
const snapshot = () => { let raw = null; try { raw = localStorage.getItem(KEY); } catch { /* ignore */ } if (raw !== cache.raw) { let val = []; try { val = raw ? JSON.parse(raw) : []; } catch { /* ignore */ } cache = { raw, val }; } return cache.val; };
const emit = () => subs.forEach((f) => f()); if (typeof addEventListener !== 'undefined') addEventListener('storage', (e) => e.key === KEY && emit());
const commit = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* ignore */ } emit(); };
export const TYPES = ['bug', 'idea', 'praise', 'question'];
export const localFeedback = {
  isLocal: true, snapshot, subscribe: (f) => (subs.add(f), () => subs.delete(f)),
  submit({ type, message, rating, userId, name, contact, canContact, context }) {
    if (!TYPES.includes(type)) throw new Error('type'); const m = String(message || '').trim(); if (m.length < 5) throw new Error('short');
    const item = { id: uid(), at: Date.now(), type, message: m.slice(0, 1500), rating: rating ? Math.min(5, Math.max(1, +rating)) : null, userId: userId || null, name: String(name || '').slice(0, 60), contact: String(contact || '').slice(0, 80), canContact: !!canContact, context: context || {}, status: 'new', note: '' };
    commit([item, ...snapshot()].slice(0, 500)); return item;
  },
  update(id, patch) { commit(snapshot().map((x) => (x.id === id ? { ...x, status: patch.status ?? x.status, note: patch.note ?? x.note } : x))); },
  remove(id) { commit(snapshot().filter((x) => x.id !== id)); },
};
