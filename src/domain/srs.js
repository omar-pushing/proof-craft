import { addDays, todayISO } from '../lib/dates.js';
/** Documented schedule: consecutive "Got it" ratings move through 1, 3, 7, 14, 30 days. Easy skips one step. Hard returns tomorrow and keeps progress. Again returns tomorrow and resets. */
export const STEPS = [1, 3, 7, 14, 30];
export function rate(card, rating, now = todayISO()) {
  const n = card.n || 0, step = (k) => STEPS[Math.min(k, STEPS.length - 1)];
  if (rating === 'easy') return { ...card, n: n + 2, due: addDays(now, step(n + 1)), last: now, reps: (card.reps || 0) + 1 };
  if (rating === 'got') return { ...card, n: n + 1, due: addDays(now, step(n)), last: now, reps: (card.reps || 0) + 1 };
  if (rating === 'hard') return { ...card, due: addDays(now, 1), last: now, reps: (card.reps || 0) + 1 };
  return { ...card, n: 0, due: addDays(now, 1), last: now, reps: (card.reps || 0) + 1, lapses: (card.lapses || 0) + 1 };
}
export const dueCards = (cards, now = todayISO()) => cards.filter((c) => c.due <= now);
/** Due queue honouring a daily limit of brand-new cards. */
export function queue(cards, { newLimit = 10, newToday = 0, now = todayISO(), cram = false } = {}) {
  if (cram) return [...cards];
  let allow = Math.max(0, newLimit - newToday);
  return cards.filter((c) => c.due <= now).filter((c) => { if (c.reps) return true; if (allow > 0) { allow--; return true; } return false; });
}
export function forecast(cards, days = 7, now = todayISO()) {
  return Array.from({ length: days }, (_, i) => { const d = addDays(now, i); return { date: d, count: cards.filter((c) => (i === 0 ? c.due <= d : c.due === d)).length }; });
}
export function retention(log, last = 100) { const l = log.slice(-last); return l.length ? Math.round((l.filter((r) => r.r === 'got' || r.r === 'easy').length / l.length) * 100) : null; }
/** Parses "question;answer", "question<TAB>answer" or "question,answer" lines. Quoted CSV fields are supported. */
export function parseCards(text) {
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const l = line.trim(); if (!l) continue;
    const m = /^"((?:[^"]|"")*)"\s*[,;\t]\s*"((?:[^"]|"")*)"$/.exec(l) || /^([^;\t]+?)\s*[;\t]\s*(.+)$/.exec(l) || /^([^,]+?)\s*,\s*(.+)$/.exec(l);
    if (m) out.push({ q: m[1].replace(/""/g, '"').trim().slice(0, 300), a: m[2].replace(/""/g, '"').trim().slice(0, 600) });
  }
  return out.filter((c) => c.q && c.a);
}
export const cardsToCsv = (cards) => cards.map((c) => `"${c.q.replace(/"/g, '""')}","${c.a.replace(/"/g, '""')}"`).join('\n');
