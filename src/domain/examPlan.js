import { addDays, todayISO } from '../lib/dates.js';
import { uid } from '../lib/id.js';

export const KINDS = { learn: 'Learn', practice: 'Practice', recall: 'Recall', review: 'Final review', mock: 'Mock exam' };
const dow = (iso) => (new Date(iso + 'T00:00:00').getDay() + 6) % 7; // Monday = 0
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/**
 * Builds a study schedule backwards from the exam.
 *  - weak topics (low confidence) get more sessions, strongest get the fewest
 *  - a topic never gets two sessions on the same day, and a recall session follows at least two days after its first one
 *  - the last free day is kept for a final review, and a mock exam is placed a few days before when it fits
 *  - nothing is scheduled on or after the exam date, or on days you mark as off
 * Returns what could not be placed, so the plan never pretends to fit.
 */
export function planExam({ date, topics, week = [45, 45, 45, 45, 45, 45, 45], offDays = [], sessionLen = 30, mockMins = 0, from = addDays(todayISO(), 1) }) {
  const days = []; for (let d = from; d < date; d = addDays(d, 1)) if (!offDays.includes(d)) days.push(d);
  const room = Object.fromEntries(days.map((d) => [d, Math.max(0, +week[dow(d)] || 0)]));
  const sessions = [], uncovered = [], notes = [];
  const put = (day, topic, kind, mins, title) => { room[day] -= mins; sessions.push({ id: uid(), topic, kind, due: day, mins, title: title || `${topic} · ${KINDS[kind]}` }); };
  const useful = days.filter((d) => room[d] >= 15);
  const reviewDay = useful.length >= 3 ? useful[useful.length - 1] : null;
  if (reviewDay) { const m = Math.min(room[reviewDay], Math.max(20, topics.length * 8)); put(reviewDay, 'All topics', 'review', m, 'All topics · Final review'); }
  if (mockMins > 0) {
    const cands = days.filter((d) => d < (reviewDay || date) && room[d] >= mockMins).reverse();
    cands.length ? put(cands[Math.min(1, cands.length - 1)], 'Full paper', 'mock', mockMins, 'Full paper · Mock exam') : notes.push('mock');
  }
  const last = {}; const first = {};
  const need = (t) => clamp(Math.round((6 - clamp(t.confidence ?? 3, 1, 5)) * 0.8), 1, 4);
  const order = [...topics].sort((a, b) => (a.confidence ?? 3) - (b.confidence ?? 3));
  const maxN = Math.max(0, ...order.map(need));
  const lastPractice = reviewDay ? days.filter((d) => d < reviewDay) : days;
  for (let round = 0; round < maxN; round++) {
    for (const t of order) {
      if (round >= need(t)) continue;
      const kind = round === 0 ? 'learn' : 'practice';
      const options = lastPractice.filter((d) => d !== last[t.name]?.slice(-1)[0] && (!last[t.name] || d > last[t.name].slice(-1)[0]) && room[d] >= 20);
      const day = [...options].sort((a, b) => room[b] - room[a] || a.localeCompare(b))[0];
      if (!day) { uncovered.push(t.name); continue; }
      const mins = Math.min(sessionLen, room[day]); put(day, t.name, kind, mins);
      (last[t.name] ||= []).push(day); first[t.name] ??= day;
    }
  }
  for (const t of order) {
    if (!first[t.name]) continue;
    const later = lastPractice.filter((d) => d >= addDays(first[t.name], 2) && room[d] >= 15).sort((a, b) => room[b] - room[a] || a.localeCompare(b))[0];
    if (later) put(later, t.name, 'recall', Math.min(15, room[later]));
  }
  sessions.sort((a, b) => a.due.localeCompare(b.due) || a.kind.localeCompare(b.kind));
  const load = {}; sessions.forEach((s) => { load[s.due] = (load[s.due] || 0) + s.mins; });
  return { sessions, uncovered: [...new Set(uncovered)], notes, days: days.length, totalMins: sessions.reduce((a, s) => a + s.mins, 0), load };
}
