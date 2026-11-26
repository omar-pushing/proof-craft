import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { useT } from '@/i18n/index.js';
import { APP } from '@/config/app.js';

export default function PublicLayout() {
  const { t } = useT();
  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('Skip to main content')}</a>
      <Header />
      {APP.publicShowcase && <div className="container"><p className="notice warn showcase-banner" role="status">{t('Public showcase: accounts, saved work, and integrations are not active. Examples are illustrative; do not enter personal information.')}</p></div>}
      <div id="main" tabIndex={-1}><Outlet /></div>
      <Footer />
    </>
  );
}
