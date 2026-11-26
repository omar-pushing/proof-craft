import { Link, useLocation, useNavigate } from 'react-router-dom';
import NibMark from '@/components/brand/NibMark.jsx';
import StarField from '@/components/brand/StarField.jsx';
import { openFeedback } from '@/state/ui.js';
import { useT } from '@/i18n/index.js';
import { APP } from '@/config/app.js';

export default function Footer() {
  const { t } = useT(); const navigate = useNavigate(); const location = useLocation();
  const jump = (id) => {
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (location.pathname === '/') scroll();
    else { navigate('/'); window.setTimeout(scroll, 140); }
  };
  return (
    <footer className="site">
      <StarField />
      <div className={`container foot-grid${APP.publicShowcase ? ' showcase-footer' : ''}`}>
        <div>
          <div className="foot-brand"><NibMark /><span>ProofCraft</span></div>
          <p className="foot-line">{t('Your work is the key.')}</p>
          <p className="foot-muted">{t(APP.publicShowcase ? 'A preview of a student workspace. Accounts are not open yet.' : 'A free workspace where students turn college work into proof employers can review.')}</p>
        </div>
        <div><h2 className="foot-h">{t(APP.publicShowcase ? 'Explore' : 'Product')}</h2>{APP.publicShowcase
          ? <><button className="foot-link" onClick={() => jump('toolkit')}>{t('Toolkit')}</button><button className="foot-link" onClick={() => jump('how')}>{t('How it works')}</button></>
          : <><Link to="/app/today">{t('Today')}</Link><Link to="/app/study">{t('Study')}</Link><Link to="/app/projects">{t('Projects')}</Link><Link to="/app/career">{t('Career')}</Link></>}</div>
        <div><h2 className="foot-h">{t('Learn')}</h2><Link to="/newsletter">{t('Newsletter')}</Link><Link to="/privacy">{t('Privacy Policy')}</Link><Link to="/terms">{t('Terms of Use')}</Link><Link to="/cookies">{t('Cookies and storage')}</Link>{!APP.publicShowcase && <button className="foot-link" onClick={() => openFeedback('idea')}>{t('Send feedback')}</button>}</div>
        {!APP.publicShowcase && <div><h2 className="foot-h">{t('Account')}</h2><Link to="/sign-in?tab=signin">{t('Sign in')}</Link><Link to="/app/settings">{t('Settings')}</Link></div>}
      </div>
      <div className="container foot-bottom"><span>© 2026 ProofCraft</span><span>proofcraft.online</span></div>
    </footer>
  );
}
