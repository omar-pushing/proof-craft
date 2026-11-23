import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/Icon.jsx';
import { Bar } from '@/components/ui/Bits.jsx';
import { NAV } from '@/app/nav.js';
import { useT } from '@/i18n/index.js';
import { useData } from '@/state/userData.js';
import { level } from '@/features/progress/badges.js';

function Mini() {
  const { t } = useT(); const xp = useData((s) => s.xp), streak = useData((s) => s.streak);
  return (<div className="mini"><div className="row between"><b>{t('Level')} {level(xp)}</b><small>{streak} {t('Day streak')}</small></div><Bar value={xp % 100} /></div>);
}

export default function AppShell() {
  const { t } = useT(); const wide = useLocation().pathname.includes('/career/cv');
  return (
    <div className={`container app-shell${wide ? ' wide' : ''}`}>
      <aside className="side" aria-label={t('Workspace')}>
        <nav className="side-nav">
          {NAV.map((n) => <NavLink key={n.id} to={n.to} className="side-link"><Icon name={n.icon} /><span>{t(n.label)}</span></NavLink>)}
          <NavLink to="/app/settings" className="side-link side-end"><Icon name="settings" /><span>{t('Settings')}</span></NavLink>
        </nav>
        <Mini />
      </aside>
      <main className="app-main"><Outlet /></main>
    </div>
  );
}
