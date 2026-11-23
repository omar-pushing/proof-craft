import { NavLink, Outlet } from 'react-router-dom';
import { NAV } from '@/app/nav.js';
import { useT } from '@/i18n/index.js';

export default function Group({ id }) {
  const { t } = useT(); const n = NAV.find((x) => x.id === id);
  return (<><p className="kicker">{t(n.label)}</p><nav className="tabs" aria-label={t(n.label)}>{n.children.map(([c, l]) => <NavLink key={c} to={`${n.to}/${c}`} className="tab">{t(l)}</NavLink>)}</nav><Outlet /></>);
}
