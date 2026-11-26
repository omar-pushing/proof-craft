import Button from '@/components/ui/Button.jsx';
import { useT } from '@/i18n/index.js';

export default function AccountUnavailable() {
  const { t } = useT();
  return <section className="container auth"><div className="auth-card panel">
    <header className="auth-heading"><p className="eyebrow">{t('Public showcase')}</p><h1>{t('Accounts are not open yet')}</h1><p>{t('We are preparing secure sign-in. For now, ProofCraft is a product showcase; accounts and saved work are unavailable.')}</p></header>
    <Button to="/">{t('Explore the public showcase')}</Button>
  </div></section>;
}
