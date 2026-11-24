import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/brand/Logo.jsx';
import Icon from '@/components/ui/Icon.jsx';
import Button from '@/components/ui/Button.jsx';
import { useT } from '@/i18n/index.js';
import { prefs, toggleLang, toggleTheme } from '@/state/prefs.js';
import { signOut, useUser } from '@/state/session.js';
import { useStore } from '@/lib/store.js';

export function Toggles() {
  const { t, lang } = useT(); const theme = useStore(prefs, (s) => s.theme);
  return (<>
    <button className="iconbtn" onClick={toggleLang} aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'} lang={lang === 'ar' ? 'en' : 'ar'}><Icon name="globe" /><span className="iconbtn-t">{lang === 'ar' ? 'EN' : 'ع'}</span></button>
    <button className="iconbtn" onClick={toggleTheme} aria-label={theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')} aria-pressed={theme === 'dark'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
  </>);
}

export default function Header() {
  const { t } = useT(); const user = useUser(); const loc = useLocation(); const nav = useNavigate(); const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k); document.body.classList.add('lock');
    return () => { document.removeEventListener('keydown', k); document.body.classList.remove('lock'); };
  }, [open]);
  const jump = (id) => { setOpen(false); const go = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); if (loc.pathname === '/') go(); else { nav('/'); setTimeout(go, 140); } };
  const links = user
    ? [<NavLink key="w" to="/app/today">{t('Workspace')}</NavLink>, <NavLink key="n" to="/newsletter">{t('Newsletter')}</NavLink>]
    : [<button key="a" className="navlink" onClick={() => jump('toolkit')}>{t('Toolkit')}</button>, <button key="b" className="navlink" onClick={() => jump('how')}>{t('How it works')}</button>, <NavLink key="n" to="/newsletter">{t('Newsletter')}</NavLink>];
  const leave = () => { signOut(); nav('/'); };
  return (
    <>
    <header className="site">
      <div className="container bar-row">
        <Logo animate />
        <nav className="nav" aria-label={t('Main')}>{links}</nav>
        <div className="actions">
          <Toggles />
          {user ? <Button variant="secondary" size="sm" className="hide-sm" onClick={leave}>{t('Sign out')}</Button>
            : <><Link className="navlink hide-sm" to="/sign-in?tab=signin">{t('Sign in')}</Link><Button to="/sign-in" size="sm" className="hide-sm">{t('Create free account')}</Button></>}
          <button className="iconbtn burger" aria-expanded={open} aria-controls="drawer" aria-label={t('Menu')} onClick={() => setOpen(!open)}><Icon name={open ? 'x' : 'menu'} /></button>
        </div>
      </div>
    </header>
      <div id="drawer" className={`drawer${open ? ' open' : ''}`}>
        <nav className="drawer-in" aria-label={t('Menu')}>
          {links}
          {user ? <Button variant="secondary" onClick={leave}>{t('Sign out')}</Button>
            : <><Link className="navlink" to="/sign-in?tab=signin">{t('Sign in')}</Link><Button to="/sign-in">{t('Create free account')}</Button></>}
        </nav>
      </div>
    </>
  );
}
