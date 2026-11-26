import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bar } from '@/components/ui/Bits.jsx';
import { NAV } from '@/app/nav.js';
import { useT } from '@/i18n/index.js';
import { useData } from '@/state/userData.js';
import { level } from '@/features/progress/badges.js';
import TimerEngine from '@/features/study/TimerEngine.jsx';
import { isAdmin, useUser } from '@/state/session.js';
import { openFeedback } from '@/state/ui.js';
import ProofIcon from '@/components/system/ProofIcon.jsx';
import IntegrationSync from '@/features/integrations/IntegrationSync.jsx';

function Mini() {
  const { t } = useT(); const xp = useData((s) => s.xp), streak = useData((s) => s.streak);
  return (<div className="mini"><div className="row between"><b>{t('Level')} {level(xp)}</b><small>{streak} {t('Day streak')}</small></div><Bar value={xp % 100} /></div>);
}

export default function AppShell() {
  const { t } = useT(); const user = useUser(); const location = useLocation(); const wide = location.pathname.includes('/career/cv');
  const current = NAV.flatMap((n) => n.children?.map(([id, label]) => ({ label, to: `${n.to}/${id}` })) || [{ label: n.label, to: n.to }]).find((x) => location.pathname.startsWith(x.to));
  return (
    <div className={`container app-shell${wide ? ' wide' : ''}`}>
      <aside className="side" aria-label={t('Workspace')}>
        <details className="tool-menu">
          <summary><span><small>{t('Current tool')}</small><b>{t(current?.label || 'Today')}</b></span><span aria-hidden="true">⌄</span></summary>
          <nav className="tool-menu-grid" aria-label={t('All tools')}>{NAV.map((n) => <div key={n.id}><b>{t(n.label)}</b>{n.children ? n.children.map(([id, label]) => <NavLink key={id} to={`${n.to}/${id}`}>{t(label)}</NavLink>) : <NavLink to={n.to}>{t(n.label)}</NavLink>}</div>)}</nav>
        </details>
        <nav className="side-nav">
          {NAV.map((n, index) => <div key={n.id} className="side-group"><NavLink to={n.to} className="side-link"><ProofIcon name={n.icon} size="sm" tone={['blue', 'yellow', 'green', 'ink', 'blue'][index % 5]} /><span>{t(n.label)}</span></NavLink>{n.children && <div className="side-sub">{n.children.map(([id, label]) => <NavLink key={id} to={`${n.to}/${id}`}>{t(label)}</NavLink>)}</div>}</div>)}
          {isAdmin(user) && <NavLink to="/admin" className="side-link"><ProofIcon name="admin" size="sm" tone="ink" /><span>Admin</span></NavLink>}
          <NavLink to="/app/settings" className="side-link side-end"><ProofIcon name="settings" size="sm" tone="yellow" /><span>{t('Settings')}</span></NavLink>
          <NavLink to="/app/integrations" className="side-link"><ProofIcon name="connections" size="sm" tone="green" /><span>{t('Connections')}</span></NavLink>
          <button className="side-link side-btn" onClick={() => openFeedback('idea')}><ProofIcon name="feedback" size="sm" tone="blue" /><span>{t('Send feedback')}</span></button>
        </nav>
        <TimerEngine /><Mini />
      </aside>
      <IntegrationSync /><main className="app-main"><Outlet /></main>
    </div>
  );
}
