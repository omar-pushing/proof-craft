import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button, { Arrow } from '@/components/ui/Button.jsx';
import GoogleButton from './GoogleButton.jsx';
import { GOALS, HEARD, STATUS, YEARS } from './options.js';
import { APP } from '@/config/app.js';
import { useT } from '@/i18n/index.js';
import { normalizePhone, validEmail } from '@/lib/phone.js';
import { signUp } from '@/state/session.js';

const ERR = { required: 'Enter your phone number.', format: 'That phone number does not look right.', egypt: 'Egyptian mobile numbers look like 010 1234 5678.' };
function Radio({ name, value, onChange, options, label }) {
  const { t } = useT();
  return (<fieldset className="choice"><legend>{t(label)}</legend><div className="row wrap">{options.map(([v, l]) => <label key={v} className={`pill-radio${value === v ? ' on' : ''}`}><input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />{t(l)}</label>)}</div></fieldset>);
}

/** Three short steps: account (name, phone, optional email), optional questions, consent. Only step 1 and 3 block sign-up. */
export default function Register({ google, onDone, onSwitch }) {
  const { t } = useT();
  const [step, setStep] = useState(1), [err, setErr] = useState({}), [busy, setBusy] = useState(false);
  const [a, setA] = useState({ name: google?.name || '', phone: '', email: google?.email || '' });
  const [p, setP] = useState({ isStudent: '', university: '', faculty: '', year: '', status: '', hardship: '', goals: [], heard: '', heardOther: '' });
  const [c, setC] = useState({ age: false, terms: false, marketing: false, hardship: false });
  const sa = (k) => (e) => setA({ ...a, [k]: e.target.value }), sp = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const next1 = (e) => {
    e.preventDefault(); const er = {}; const ph = normalizePhone(a.phone);
    if (a.name.trim().length < 2) er.name = 'Enter your name.'; if (!ph.ok) er.phone = ERR[ph.error]; if (a.email && !validEmail(a.email)) er.email = 'That email does not look right.';
    setErr(er); if (!Object.keys(er).length) { setA({ ...a, phone: ph.e164 }); setStep(2); }
  };
  const toggleGoal = (g) => sp('goals', p.goals.includes(g) ? p.goals.filter((x) => x !== g) : p.goals.length < 2 ? [...p.goals, g] : p.goals);
  const askHardship = APP.collectHardship && p.isStudent === 'yes', answered = askHardship && p.hardship !== '' && p.hardship !== 'skip';
  const submit = (e) => {
    e.preventDefault(); const er = {};
    if (!c.age) er.age = 'Please confirm your age.'; if (!c.terms) er.terms = 'You need to accept the Terms and the Privacy Policy.'; if (answered && !c.hardship) er.hardship = 'Tick the box to share this, or choose "Prefer not to say".';
    setErr(er); if (Object.keys(er).length) return; setBusy(true);
    const profile = { ...p, hardship: askHardship ? (answered ? p.hardship : '') : '' };
    const r = signUp({ name: a.name, phone: a.phone, email: a.email, provider: google ? 'google' : 'phone', sub: google?.sub || '', picture: google?.picture || '', profile, consent: { marketing: c.marketing, hardship: answered } });
    setBusy(false);
    if (r.error) { setErr({ top: r.error === 'phone-exists' ? 'An account with this phone number already exists. Sign in instead.' : 'An account with this email already exists. Sign in instead.' }); setStep(1); return; }
    onDone(r.user);
  };
  return (
    <div className="stack">
      <ol className="steps-dots" aria-label={t('Progress')}>{[1, 2, 3].map((n) => <li key={n} className={n === step ? 'on' : n < step ? 'done' : ''} aria-current={n === step ? 'step' : undefined}><span>{n}</span>{t(['Account', 'About you', 'Consent'][n - 1])}</li>)}</ol>
      {err.top && <p className="notice bad" role="alert">{t(err.top)} <button className="linkish" type="button" onClick={onSwitch}>{t('Sign in')}</button></p>}

      {step === 1 && (<form className="form" onSubmit={next1} noValidate>
        {!google && <><GoogleButton onProfile={(g) => onDone(null, g)} /><p className="or"><span>{t('or with your phone')}</span></p></>}
        {google && <p className="notice ok">{t('Signed in with Google as {n}. Add your phone number to finish.', { n: google.email })}</p>}
        <label>{t('Full name')}<input value={a.name} onChange={sa('name')} autoComplete="name" required maxLength={60} aria-invalid={!!err.name} aria-describedby="e-name" /><span id="e-name" className="err">{err.name && t(err.name)}</span></label>
        <label>{t('Phone number')}<input value={a.phone} onChange={sa('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="010 1234 5678" required aria-invalid={!!err.phone} aria-describedby="e-phone" /><span id="e-phone" className={err.phone ? 'err' : 'help'}>{err.phone ? t(err.phone) : t('Egyptian numbers work as they are. For other countries start with + and the country code.')}</span></label>
        <label>{t('Email')} <span className="opt">({t('optional')})</span><input value={a.email} onChange={sa('email')} type="email" autoComplete="email" readOnly={!!google} aria-invalid={!!err.email} aria-describedby="e-email" /><span id="e-email" className={err.email ? 'err' : 'help'}>{err.email ? t(err.email) : t('Only used for important account messages. You can skip it.')}</span></label>
        <Button type="submit">{t('Continue')} <Arrow /></Button>
        <p className="help">{t('Already have an account?')} <button className="linkish" type="button" onClick={onSwitch}>{t('Sign in')}</button></p>
      </form>)}

      {step === 2 && (<form className="form" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
        <p className="lede">{t('Optional. These answers help us show you the right things first. Skip any you like.')}</p>
        <Radio name="stu" label="Are you a student?" value={p.isStudent} onChange={(v) => sp('isStudent', v)} options={[['yes', 'Yes, I am a student'], ['no', 'No, not right now']]} />
        {p.isStudent === 'yes' && <div className="grid-2"><label>{t('University')}<input value={p.university} onChange={(e) => sp('university', e.target.value)} maxLength={80} placeholder="Damietta University" /></label><label>{t('Faculty or major')}<input value={p.faculty} onChange={(e) => sp('faculty', e.target.value)} maxLength={80} /></label>
          <label>{t('Year')}<select value={p.year} onChange={(e) => sp('year', e.target.value)}><option value="">{t('Choose')}</option>{YEARS.map((y) => <option key={y} value={y}>{t(y)}</option>)}</select></label></div>}
        {p.isStudent === 'no' && <label>{t('What describes you best?')}<select value={p.status} onChange={(e) => sp('status', e.target.value)}><option value="">{t('Choose')}</option>{STATUS.map((y) => <option key={y} value={y}>{t(y)}</option>)}</select></label>}
        {askHardship && <Radio name="hard" label="Is money a challenge for your studies right now?" value={p.hardship} onChange={(v) => sp('hardship', v)} options={[['yes', 'Yes'], ['no', 'Not really'], ['skip', 'Prefer not to say']]} />}
        <fieldset className="choice"><legend>{t('What do you want to do first? (up to 2)')}</legend><div className="row wrap">{GOALS.map((g) => <label key={g} className={`pill-radio${p.goals.includes(g) ? ' on' : ''}`}><input type="checkbox" checked={p.goals.includes(g)} onChange={() => toggleGoal(g)} />{t(g)}</label>)}</div></fieldset>
        <label>{t('How did you hear about us?')}<select value={p.heard} onChange={(e) => sp('heard', e.target.value)}><option value="">{t('Choose')}</option>{HEARD.map((y) => <option key={y} value={y}>{t(y)}</option>)}</select></label>
        {p.heard === 'Other' && <label>{t('Tell us where')}<input value={p.heardOther} onChange={(e) => sp('heardOther', e.target.value)} maxLength={80} /></label>}
        <div className="row"><Button variant="secondary" onClick={() => setStep(1)}>{t('Back')}</Button><Button type="submit">{t('Continue')} <Arrow /></Button><Button variant="ghost" onClick={() => setStep(3)}>{t('Skip for now')}</Button></div>
      </form>)}

      {step === 3 && (<form className="form" onSubmit={submit} noValidate>
        <label className="check"><input type="checkbox" checked={c.age} onChange={(e) => setC({ ...c, age: e.target.checked })} /><span>{t('I am 18 or older, or a parent or guardian has agreed for me to use ProofCraft.')}</span></label>{err.age && <span className="err">{t(err.age)}</span>}
        <label className="check"><input type="checkbox" checked={c.terms} onChange={(e) => setC({ ...c, terms: e.target.checked })} /><span>{t('I accept the')} <Link to="/terms" target="_blank">{t('Terms of Use')}</Link> {t('and have read the')} <Link to="/privacy" target="_blank">{t('Privacy Policy')}</Link>.</span></label>{err.terms && <span className="err">{t(err.terms)}</span>}
        {answered && <><label className="check"><input type="checkbox" checked={c.hardship} onChange={(e) => setC({ ...c, hardship: e.target.checked })} /><span>{t('I agree that ProofCraft may store my answer about money and my studies. It is used only to point me to free support and is never shown to other users. I can withdraw it any time in Settings.')}</span></label>{err.hardship && <span className="err">{t(err.hardship)}</span>}</>}
        <label className="check"><input type="checkbox" checked={c.marketing} onChange={(e) => setC({ ...c, marketing: e.target.checked })} /><span>{t('Send me occasional updates about ProofCraft and opportunities. (optional)')}</span></label>
        <div className="row"><Button variant="secondary" onClick={() => setStep(2)}>{t('Back')}</Button><Button type="submit" disabled={busy}>{t('Create my account')}</Button></div>
        <p className="help">{t('We keep only what we need. You can export or delete your data at any time in Settings.')}</p>
      </form>)}
    </div>
  );
}
