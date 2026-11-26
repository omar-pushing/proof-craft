import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProofIcon from '@/components/system/ProofIcon.jsx';
import { buildNudges } from '@/services/notifications/nudges.js';
import { todayISO } from '@/lib/dates.js';
import { useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';

export default function NotificationCenter() {
  const { t } = useT(); const store = useUserStore(); const location = useLocation(); const panel = useRef(null); const tasks = useData((s) => s.tasks), plans = useData((s) => s.plans), cards = useData((s) => s.cards), tracker = useData((s) => s.tracker); const prefs = useData((s) => s.notificationPrefs || { leadDays: 2, browser: false }); const seen = useData((s) => s.nudgeSeen || {}); const [permission, setPermission] = useState(() => typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  const today = todayISO(); const nudges = useMemo(() => buildNudges({ tasks, plans, cards, tracker }, today, prefs.leadDays), [tasks, plans, cards, tracker, today, prefs.leadDays]); const unread = nudges.filter((item) => !seen[item.id]).length;
  useEffect(() => {
    if (!prefs.browser || permission !== 'granted' || !nudges.length) return;
    const key = `pc:notified:${today}`; let sent = []; try { sent = JSON.parse(localStorage.getItem(key)) || []; } catch { /* ignore */ }
    const next = nudges.find((item) => !sent.includes(item.id) && (item.tone === 'urgent' || item.tone === 'today')); if (!next) return;
    const note = new Notification(`ProofCraft · ${next.title}`, { body: `${next.body}: ${next.meta}`, tag: next.id, renotify: false }); note.onclick = () => { window.focus(); window.location.hash = `#${next.to}`; };
    try { localStorage.setItem(key, JSON.stringify([...sent, next.id])); } catch { /* ignore */ }
  }, [nudges, prefs.browser, permission, today]);
  useEffect(() => { panel.current?.removeAttribute('open'); }, [location.pathname]);
  const enable = async () => { if (typeof Notification === 'undefined') return; const value = await Notification.requestPermission(); setPermission(value); if (value === 'granted') store.set({ notificationPrefs: { ...prefs, browser: true } }); };
  const markAll = () => store.set({ nudgeSeen: { ...seen, ...Object.fromEntries(nudges.map((item) => [item.id, true])) } });
  return <details ref={panel} className="notification-center"><summary aria-label={t('Notifications')}><ProofIcon name="notification" size="sm" tone={unread ? 'yellow' : 'ink'} />{unread > 0 && <span>{unread}</span>}</summary><div className="notification-pop"><header><div><span className="ds-kicker">{t('Your next moves')}</span><h2>{t('Notifications')}</h2></div>{unread > 0 && <button onClick={markAll}>{t('Mark all read')}</button>}</header>
    {nudges.length ? <ul>{nudges.map((item) => <li key={item.id} className={`nudge-${item.tone}${seen[item.id] ? ' read' : ''}`}><Link to={item.to} onClick={() => store.set({ nudgeSeen: { ...seen, [item.id]: true } })}><span /><div><small>{t(item.title)}</small><b>{item.body}</b><em>{t(item.meta)}</em></div></Link></li>)}</ul> : <div className="notification-empty"><ProofIcon name="notification" tone="green" /><b>{t('Nothing needs attention right now')}</b><p>{t('ProofCraft will surface approaching tasks, exams, reviews and follow-ups here.')}</p></div>}
    <footer>{permission !== 'granted' ? <button onClick={enable} disabled={permission === 'denied' || permission === 'unsupported'}>{t(permission === 'denied' ? 'Device notifications are blocked in your browser' : permission === 'unsupported' ? 'Device notifications are not supported here' : 'Enable free device reminders')}</button> : <span>{t('Device reminders are on')}</span>}<Link to="/app/integrations">{t('Reminder settings')}</Link></footer>
  </div></details>;
}
