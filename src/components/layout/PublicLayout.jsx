import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { useT } from '@/i18n/index.js';

export default function PublicLayout() {
  const { t } = useT();
  return (<><a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('Skip to main content')}</a><Header /><div id="main" tabIndex={-1}><Outlet /></div><Footer /></>);
}
