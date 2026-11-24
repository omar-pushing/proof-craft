import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button, { Arrow } from '@/components/ui/Button.jsx';
import GoogleButton from './GoogleButton.jsx';
import Register from './Register.jsx';
import { signInExisting, signInGoogle, signInPhone, useSession } from '@/state/session.js';
import { normalizePhone } from '@/lib/phone.js';
import { useT } from '@/i18n/index.js';

export default function SignIn() {
  const { t } = useT(); const nav = useNavigate(), [sp, setSp] = useSearchParams(); const users = useSession((s) => s.users);
  const next = sp.get('next') || '/app/today'; const [tab, setTab] = useState(sp.get('tab') === 'signin' ? 'signin' : 'register');
  const [google, setGoogle] = useState(null), [phone, setPhone] = useState(''), [err, setErr] = useState('');
  const done = () => nav(next, { replace: true });
  const switchTab = (k) => { setTab(k); setErr(''); setGoogle(null); setSp({ ...(sp.get('next') ? { next: sp.get('next') } : {}), tab: k }, { replace: true }); };
  const onGoogle = (info) => { if (signInGoogle(info)) return done(); setGoogle(info); setTab('register'); };
  const login = (e) => { e.preventDefault(); const ph = normalizePhone(phone); if (!ph.ok) return setErr('That phone number does not look right.'); if (signInPhone(ph.e164)) return done(); setErr('No account uses this number yet.'); };
  return (
    <section className="container auth">
      <div className="auth-card panel">
        <h1>{tab === 'register' ? t('Create your free account') : t('Welcome back')}</h1>
        <div className="seg seg-full" role="tablist" aria-label={t('Account')}>{[['register', 'Create account'], ['signin', 'Sign in']].map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => switchTab(k)}>{t(l)}</button>)}</div>
        {tab === 'register' ? <Register key={google?.sub || 'plain'} google={google} onDone={(u, g) => (g ? onGoogle(g) : done(u))} onSwitch={() => switchTab('signin')} /> : (
          <div className="stack">
            <GoogleButton onProfile={onGoogle} /><p className="or"><span>{t('or with your phone')}</span></p>
            <form className="form" onSubmit={login} noValidate>
              <label>{t('Phone number')}<input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="010 1234 5678" aria-invalid={!!err} /></label>
              {err && <p className="err" role="alert">{t(err)} <button className="linkish" type="button" onClick={() => switchTab('register')}>{t('Create account')}</button></p>}
              <Button type="submit">{t('Sign in')} <Arrow /></Button>
              <p className="help">{t('Preview build: phone numbers are not verified yet. Production confirms them with a code sent by SMS.')}</p>
            </form>
            {users.length > 0 && (<div className="stack"><p className="help">{t('On this device')}</p><div className="row wrap">{users.map((u) => <Button key={u.id} variant="secondary" size="sm" onClick={() => { signInExisting(u.id); done(); }}>{u.name}</Button>)}</div></div>)}
          </div>)}
        <p className="help">{t('ProofCraft never asks for university portal passwords.')}</p>
      </div>
    </section>
  );
}
