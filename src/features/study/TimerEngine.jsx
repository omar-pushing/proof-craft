import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { elapsedMs, fmtClock, remainingMs } from '@/domain/timer.js';
import { tick } from '@/state/timerActions.js';
import { useData, useUserStore } from '@/state/userData.js';
import { useNow } from '@/lib/useNow.js';
import { useT } from '@/i18n/index.js';

/** Always mounted inside the app shell: finishes countdowns on any page, shows the running time in the tab title and in the sidebar. */
export default function TimerEngine() {
  const { t } = useT(); const store = useUserStore(); const a = useData((s) => s.activeTimer); const now = useNow(!!a?.running);
  useEffect(() => { const id = setInterval(() => tick(store), 500); return () => clearInterval(id); }, [store]);
  const text = a ? fmtClock(a.mode === 'timer' ? remainingMs(a, now) : elapsedMs(a, now)) : '';
  useEffect(() => { if (!a) return; const old = document.title; document.title = `${text} · ProofCraft`; return () => { document.title = old; }; }, [a, text]);
  if (!a) return null;
  return <NavLink to="/app/study/timer" className="timer-chip" aria-label={`${t('Study Timer')}: ${text}`}><i className={a.running ? 'live' : ''} />{text}<span>{a.subject || t(a.mode === 'timer' ? 'Timer' : 'Stopwatch')}</span></NavLink>;
}
