import { useNavigate, useSearchParams } from 'react-router-dom';
import Button, { Arrow } from '@/components/ui/Button.jsx';
import { signIn, useSession } from '@/state/session.js';
import { useT } from '@/i18n/index.js';

export default function SignIn() {
  const { t } = useT(); const nav = useNavigate(); const [sp] = useSearchParams(); const users = useSession((s) => s.users);
  const next = sp.get('next') || '/app/today';
  const go = (name) => { if (signIn(name)) nav(next, { replace: true }); };
  return (
    <section className="container auth">
      <div className="auth-card panel">
        <h1>{t('Create your free account')}</h1>
        <p className="lede">{t('Choose the name your teammates will see. ProofCraft never asks for university portal passwords.')}</p>
        <form className="form" onSubmit={(e) => { e.preventDefault(); go(new FormData(e.target).get('name')); }}>
          <label>{t('Your name')}<input name="name" required maxLength={40} autoComplete="name" placeholder="Nour Hassan" /></label>
          <Button type="submit">{t('Continue')} <Arrow /></Button>
        </form>
        {users.length > 0 && (<div className="stack"><p className="help">{t('Or continue as')}</p><div className="row wrap">{users.map((u) => <Button key={u.id} variant="secondary" size="sm" onClick={() => go(u.name)}>{u.name}</Button>)}</div></div>)}
        <p className="help">{t('Preview sign-in: names are stored in this browser. Production signs in with Google.')}</p>
      </div>
    </section>
  );
}
