import { addDays } from './dates.js';
const esc = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
/** All-day events with stable UIDs and an exclusive DTEND, as RFC 5545 expects. */
export function toIcs(tasks) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const ev = tasks.filter((t) => t.due).map((t) => ['BEGIN:VEVENT', `UID:proofcraft.online-${t.id}`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${t.due.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${addDays(t.due, 1).replace(/-/g, '')}`, `SUMMARY:${esc(t.title)}`, 'END:VEVENT'].join('\r\n'));
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ProofCraft//EN', ...ev, 'END:VCALENDAR'].join('\r\n');
}
