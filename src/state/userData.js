import { createStore, useStore } from '@/lib/store.js';
import { session, useSession } from './session.js';
import { toast } from './toast.js';
import { addDays, todayISO } from '@/lib/dates.js';
import { uid } from '@/lib/id.js';
import { SCALES } from '@/domain/grades.js';

export const emptyData = () => ({
  tasks: [], plans: [], cards: [], decks: [{ id: 'general', name: 'General' }], deckId: 'general', reviewLog: [], newStats: { date: '', count: 0 }, focus: {}, timeLog: [], goalMins: 120, activeTimer: null, soundOn: true, newPerDay: 10,
  courses: [], scale: 'egypt', scaleRows: SCALES.egypt.rows, prior: { gpa: '', credits: '' }, targetGpa: '',
  evidence: [], sources: [], tracker: [], stories: [], cvs: [], activeCv: null, onboarded: false, xp: 0, streak: 0, last: '', counts: {},
  integrationPrefs: { driveAuto: true, calendarAuto: true, reminderMins: 60 }, notificationPrefs: { leadDays: 2, browser: false }, nudgeSeen: {},
});
const stores = new Map();

/** Brings data saved by earlier versions forward (Applications became the Application Tracker; cards gained decks; one grade list became courses). */
function migrate(store) {
  const s = store.get(), p = {};
  if (s.apps?.length && !s.tracker?.length) p.tracker = s.apps.map((a) => ({ id: a.id, role: a.role, company: a.company, stage: a.stage === 'Closed' ? 'Rejected' : a.stage, history: [], type: '', mode: '', location: '', source: '', applied: '', deadline: '', followUp: '', link: '', contact: '', notes: '', jd: '', cvId: '' }));
  if (s.apps) p.apps = undefined;
  if (s.cards?.some((c) => !c.deckId)) p.cards = s.cards.map((c) => (c.deckId ? c : { ...c, deckId: 'general', reps: c.reps || c.n || 0 }));
  if (s.grades?.items?.length && !s.courses?.length) { p.courses = [{ id: uid(), name: 'Course 1', credits: 3, target: +s.grades.target || 70, items: s.grades.items }]; p.grades = undefined; }
  if (Object.keys(p).length) store.set(p);
}
/** One persisted store per signed-in user, so profiles never leak into each other. */
export const userStore = (uid_) => { if (!stores.has(uid_)) { const st = createStore(emptyData(), { key: `pc:data:${uid_}`, version: 1 }); migrate(st); stores.set(uid_, st); } return stores.get(uid_); };
export const useUserStore = () => userStore(useSession((s) => s.uid));
export function useData(selector) { const st = useUserStore(); return useStore(st, selector); }
export const currentStore = () => userStore(session.get().uid);

export function award(store, kind, xp) {
  store.set((s) => {
    const d = todayISO();
    const streak = s.last === d ? s.streak : s.last === addDays(d, -1) ? s.streak + 1 : 1;
    return { xp: s.xp + xp, streak, last: d, counts: { ...s.counts, [kind]: (s.counts[kind] || 0) + 1 } };
  });
  toast(`+${xp} XP`);
}
