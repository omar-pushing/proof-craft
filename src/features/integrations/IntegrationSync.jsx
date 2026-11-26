import { useEffect, useRef } from 'react';
import { useData } from '@/state/userData.js';
import { integrationDriver, refreshIntegrations, useIntegrations } from '@/services/integrations/index.js';

/** Debounced, idempotent sync boundary. The backend owns OAuth tokens and provider writes. */
export default function IntegrationSync() {
  const tasks = useData((s) => s.tasks), plans = useData((s) => s.plans), cvs = useData((s) => s.cvs), evidence = useData((s) => s.evidence), prefs = useData((s) => s.integrationPrefs || { driveAuto: true, calendarAuto: true });
  const drive = useIntegrations((s) => s.drive), calendar = useIntegrations((s) => s.calendar); const last = useRef({});
  useEffect(() => { refreshIntegrations(); }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (prefs.calendarAuto && calendar?.state === 'connected') { const payload = { tasks: tasks.filter((item) => item.due).map(({ id, title, course, due, mins, done }) => ({ id, title, course, due, mins, done })), plans: plans.map(({ id, name, date }) => ({ id, name, date })), reminderMins: prefs.reminderMins }; const hash = JSON.stringify(payload); if (last.current.calendar !== hash) { last.current.calendar = hash; integrationDriver.syncCalendar(payload).catch(() => { last.current.calendar = ''; }); } }
      if (prefs.driveAuto && drive?.state === 'connected') { const payload = { cvs: cvs.map(({ id, title, updated }) => ({ id, title, updated })), evidence: evidence.map(({ id, title, problem, part, result }) => ({ id, title, problem, part, result })) }; const hash = JSON.stringify(payload); if (last.current.drive !== hash) { last.current.drive = hash; integrationDriver.syncDrive(payload).catch(() => { last.current.drive = ''; }); } }
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [tasks, plans, cvs, evidence, drive?.state, calendar?.state, prefs.driveAuto, prefs.calendarAuto, prefs.reminderMins]);
  return null;
}
