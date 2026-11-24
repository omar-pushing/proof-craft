import { elapsedMs, POMO, remainingMs, sessionMins } from '@/domain/timer.js';
import { todayISO } from '@/lib/dates.js';
import { uid } from '@/lib/id.js';
import { toast } from './toast.js';
import { beep } from '@/lib/sound.js';

const log = (store, t, ms) => { const mins = sessionMins(ms); if (!mins) return 0; store.set((s) => ({ timeLog: [{ id: uid(), date: todayISO(), at: Date.now(), mins, subject: t.subject || '', mode: t.mode }, ...s.timeLog].slice(0, 1000) })); return mins; };
export const startTimer = (store, { mode, minutes = 25, subject = '', pomo = 'off' }) => store.set({ activeTimer: { mode, subject, pomo, phase: 'focus', targetMs: mode === 'timer' ? minutes * 60000 : 0, accMs: 0, startedAt: Date.now(), running: true, laps: [] } });
export const pauseTimer = (store) => store.set((s) => (s.activeTimer?.running ? { activeTimer: { ...s.activeTimer, accMs: elapsedMs(s.activeTimer), startedAt: null, running: false } } : {}));
export const resumeTimer = (store) => store.set((s) => (s.activeTimer && !s.activeTimer.running ? { activeTimer: { ...s.activeTimer, startedAt: Date.now(), running: true } } : {}));
export const discardTimer = (store) => store.set({ activeTimer: null });
export const lapTimer = (store) => store.set((s) => (s.activeTimer ? { activeTimer: { ...s.activeTimer, laps: [...s.activeTimer.laps, elapsedMs(s.activeTimer)] } } : {}));
export function finishTimer(store) {
  const t = store.get().activeTimer; if (!t) return; const m = t.phase === 'break' ? 0 : log(store, t, elapsedMs(t));
  store.set({ activeTimer: null }); toast(m ? `${m} min saved to your study time` : 'Timer stopped. Sessions under 30 seconds are not saved.');
}
/** Called every half second by TimerEngine in the app shell, so a countdown finishes even when you are on another page. */
export function tick(store) {
  const s = store.get(), t = s.activeTimer; if (!t || t.mode !== 'timer' || !t.running || remainingMs(t) > 0) return;
  if (s.soundOn) beep();
  if (t.phase === 'focus') {
    const m = log(store, t, t.targetMs), cfg = POMO[t.pomo];
    if (cfg) { store.set({ activeTimer: { ...t, phase: 'break', targetMs: cfg[1] * 60000, accMs: 0, startedAt: Date.now(), running: true } }); toast(`Focus done: ${m} min saved. Take a ${cfg[1]} minute break.`); }
    else { store.set({ activeTimer: null }); toast(`Done. ${m} min saved to your study time.`); }
  } else { store.set({ activeTimer: null }); toast('Break over. Ready for the next round?'); }
}
