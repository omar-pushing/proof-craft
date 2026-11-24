import { Link } from 'react-router-dom';
import NibMark from '@/components/brand/NibMark.jsx';
import StarField from '@/components/brand/StarField.jsx';
import Button from '@/components/ui/Button.jsx';
import { toast } from '@/state/toast.js';
import { openFeedback } from '@/state/ui.js';
import { useT } from '@/i18n/index.js';

export default function Footer() {
  const { t } = useT();
  const subscribe = (e) => { e.preventDefault(); toast('Preview build: newsletter signup connects to the newsletter service in production.'); e.target.reset(); };
  return (
    <footer className="site">
      <StarField />
      <div className="container foot-grid">
        <div>
          <div className="foot-brand"><NibMark /><span>ProofCraft</span></div>
          <p className="foot-line">{t('Your work is the key.')}</p>
          <p className="foot-muted">{t('A free workspace where students turn college work into proof employers can review.')}</p>
          <form className="foot-news" onSubmit={subscribe}>
            <label className="sr" htmlFor="foot-email">{t('Email')}</label>
            <input id="foot-email" type="email" required placeholder={t('Your email')} />
            <Button variant="marker" size="sm" type="submit">{t('Subscribe')}</Button>
          </form>
        </div>
        <div><h2 className="foot-h">{t('Product')}</h2><Link to="/app/today">{t('Today')}</Link><Link to="/app/study">{t('Study')}</Link><Link to="/app/projects">{t('Projects')}</Link><Link to="/app/career">{t('Career')}</Link></div>
        <div><h2 className="foot-h">{t('Learn')}</h2><Link to="/newsletter">{t('Newsletter')}</Link><Link to="/privacy">{t('Privacy Policy')}</Link><Link to="/terms">{t('Terms of Use')}</Link><Link to="/cookies">{t('Cookies and storage')}</Link><button className="foot-link" onClick={() => openFeedback('idea')}>{t('Send feedback')}</button></div>
        <div><h2 className="foot-h">{t('Account')}</h2><Link to="/sign-in?tab=signin">{t('Sign in')}</Link><Link to="/app/settings">{t('Settings')}</Link></div>
      </div>
      <div className="container foot-bottom"><span>© 2026 ProofCraft</span><span>proofcraft.online</span></div>
    </footer>
  );
}
