import { addDays, todayISO } from '../lib/dates.js';
/** Timer state keeps wall-clock times, so it stays correct while the tab is in the background or after navigating away. */
export const elapsedMs = (t, now = Date.now()) => (t.running ? t.accMs + (now - t.startedAt) : t.accMs);
export const remainingMs = (t, now = Date.now()) => Math.max(0, (t.targetMs || 0) - elapsedMs(t, now));
export function fmtClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const p = (n) => String(n).padStart(2, '0'); return h ? `${h}:${p(m)}:${p(r)}` : `${p(m)}:${p(r)}`;
}
export const minsOn = (log, d) => Math.round(log.filter((x) => x.date === d).reduce((a, x) => a + x.mins, 0));
export const weekTotals = (log, end = todayISO()) => Array.from({ length: 7 }, (_, i) => { const date = addDays(end, i - 6); return { date, mins: minsOn(log, date) }; });
export function bySubject(log, from, to = todayISO()) {
  const m = {}; log.filter((x) => x.date >= from && x.date <= to).forEach((x) => { const k = x.subject || 'No subject'; m[k] = (m[k] || 0) + x.mins; });
  return Object.entries(m).map(([subject, mins]) => ({ subject, mins })).sort((a, b) => b.mins - a.mins);
}
/** Whole minutes, at least 1. Sessions under 30 seconds are not logged. */
export const sessionMins = (ms) => (ms < 30000 ? 0 : Math.max(1, Math.round(ms / 60000)));
export const PRESETS = [15, 25, 45, 60, 90];
export const POMO = { off: null, '25/5': [25, 5], '50/10': [50, 10] };
