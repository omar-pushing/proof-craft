import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import GoogleButton from './GoogleButton.jsx';
import Register from './Register.jsx';
import { auth, AUTH_ERROR } from '@/services/auth/index.js';
import { COUNTRY_CODES, normalizePhone, validEmail } from '@/lib/phone.js';
import { useT } from '@/i18n/index.js';

const messages = {
  [AUTH_ERROR.INVALID_CODE]: 'That code is not correct. Check it and try again.',
  [AUTH_ERROR.EXPIRED_CODE]: 'That code has expired. Request a new one.',
  [AUTH_ERROR.RATE_LIMITED]: 'Please wait before requesting another code.',
  [AUTH_ERROR.ACCOUNT_NOT_FOUND]: 'We could not find an account with that email or phone number.',
  [AUTH_ERROR.UNVERIFIED_IDENTIFIER]: 'This email or phone number has not been verified yet. Sign in with your verified method.',
  [AUTH_ERROR.GOOGLE_BLOCKED]: 'Google sign-in could not be completed. Try email or phone instead.',
  [AUTH_ERROR.OFFLINE]: 'You appear to be offline. Reconnect and try again.',
  [AUTH_ERROR.SERVER_FAILURE]: 'Something went wrong on our side. Try again shortly.',
};

export default function SignIn() {
  const { t } = useT(); const nav = useNavigate(); const [sp, setSp] = useSearchParams();
  const next = sp.get('next') || '/app/today';
  const [tab, setTab] = useState(sp.get('tab') === 'signin' ? 'signin' : 'register');
  const [method, setMethod] = useState('email'), [stage, setStage] = useState('method');
  const [email, setEmail] = useState(''), [phone, setPhone] = useState(''), [country, setCountry] = useState('+20');
  const [challenge, setChallenge] = useState(null), [code, setCode] = useState(''), [identity, setIdentity] = useState(null);
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!challenge) return undefined;
    const tick = () => setSeconds(Math.max(0, Math.ceil((challenge.resendAfter - Date.now()) / 1000)));
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [challenge]);

  const done = () => nav(next, { replace: true });
  const switchTab = (value) => {
    setTab(value); setStage('method'); setIdentity(null); setChallenge(null); setCode(''); setErr('');
    setSp({ ...(sp.get('next') ? { next: sp.get('next') } : {}), tab: value }, { replace: true });
  };
  const readableError = (error) => t(messages[error?.code] || 'We could not complete that request. Try again.');
  const identifier = () => {
    if (method === 'email') { const value = email.trim().toLowerCase(); if (!validEmail(value)) throw new Error(t('Enter a valid email address.')); return value; }
    const value = normalizePhone(phone, country); if (!value.ok) throw new Error(t('That phone number does not look right.')); return value.e164;
  };
  const requestCode = async (event) => {
    event?.preventDefault(); setErr(''); setBusy(true);
    try { const value = identifier(); const result = await auth.requestChallenge({ intent: tab === 'signin' ? 'sign-in' : 'register', channel: method, identifier: value }); setChallenge({ ...result, identifier: value, channel: method }); setCode(''); setStage('code'); }
    catch (error) { setErr(error.code ? readableError(error) : error.message); } finally { setBusy(false); }
  };
  const verify = async (event) => {
    event.preventDefault(); setErr(''); if (!/^\d{6}$/.test(code)) return setErr(t('Enter the six-digit code.'));
    setBusy(true); try { const result = await auth.verifyChallenge({ challengeId: challenge.challengeId, code }); if (result.status === 'signed-in') done(); else { setIdentity(result.identity); setStage('profile'); } }
    catch (error) { setErr(readableError(error)); } finally { setBusy(false); }
  };
  const onGoogle = async (profile) => {
    setErr(''); setBusy(true); try { const result = await auth.continueWithGoogle({ profile }); if (result.status === 'signed-in') done(); else { setTab('register'); setIdentity(result.identity); setStage('profile'); } }
    catch (error) { setErr(readableError(error)); } finally { setBusy(false); }
  };

  if (stage === 'profile') return <section className="container auth"><div className="auth-card panel"><Register identity={identity} onDone={done} onSwitch={() => switchTab('signin')} /></div></section>;

  return <section className="container auth"><div className="auth-card panel">
    <header className="auth-heading"><p className="eyebrow">{t('Your ProofCraft account')}</p><h1>{tab === 'register' ? t('Create your free account') : t('Welcome back')}</h1><p>{t(tab === 'register' ? 'Start with the method you want to verify today.' : 'Choose any verified method linked to your account.')}</p></header>
    <div className="seg seg-full" role="tablist" aria-label={t('Account')}>{[['register', 'Create account'], ['signin', 'Sign in']].map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'on' : ''} onClick={() => switchTab(key)}>{t(label)}</button>)}</div>
    {stage === 'method' ? <div className="stack auth-methods">
      <GoogleButton onProfile={onGoogle} /><p className="or"><span>{t('or use email or phone')}</span></p>
      <div className="seg seg-full" role="tablist" aria-label={t('Sign-in method')}>{[['email', 'Email'], ['phone', 'Phone']].map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={method === key} className={method === key ? 'on' : ''} onClick={() => { setMethod(key); setErr(''); }}>{t(label)}</button>)}</div>
      <form className="form" onSubmit={requestCode} noValidate>
        {method === 'email' ? <label>{t('Email address')}<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required aria-invalid={!!err} /></label> : <label>{t('Phone number')}<span className="phone-field"><select value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t('Country calling code')}>{COUNTRY_CODES.map(([iso, name, dial]) => <option key={iso} value={dial}>{name} ({dial})</option>)}</select><input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel-national" aria-label={t('Phone number')} placeholder={country === '+20' ? '010 1234 5678' : t('Phone number')} required aria-invalid={!!err} /></span></label>}
        {err && <p className="err" role="alert">{err}</p>}<Button type="submit" disabled={busy}>{busy ? t('Sending code…') : t('Continue with {method}', { method: t(method === 'email' ? 'email' : 'phone') })}</Button>
      </form>
    </div> : <div className="stack otp-card">
      <button type="button" className="linkish back-link" onClick={() => { setStage('method'); setChallenge(null); setErr(''); }}>{t('Change sign-in method')}</button>
      <div><p className="eyebrow">{t('Check your {method}', { method: t(challenge.channel) })}</p><h2>{t('Enter your six-digit code')}</h2><p>{t('We sent a code to {destination}. It expires in 10 minutes.', { destination: challenge.maskedDestination })}</p></div>
      <form className="form" onSubmit={verify} noValidate>
        <label>{t('Verification code')}<input className="otp-input" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus aria-invalid={!!err} aria-describedby="otp-error otp-help" /></label>
        {err && <p id="otp-error" className="err" role="alert">{err}</p>}<p id="otp-help" className="dev-otp"><b>{t('Preview only')}</b> · {t('Use code {code}. Production codes are delivered by the backend.', { code: challenge.previewCode })}</p>
        <Button type="submit" disabled={busy}>{busy ? t('Checking…') : t('Verify and continue')}</Button>
      </form>
      <div className="row between wrap"><span className="help">{seconds ? t('You can resend in {seconds}s', { seconds }) : t('Did not receive it?')}</span><button type="button" className="linkish" disabled={seconds > 0 || busy} onClick={requestCode}>{t('Resend code')}</button></div>
    </div>}
    <p className="help auth-safety">{t('ProofCraft never asks for university portal passwords.')}</p>
  </div></section>;
}
