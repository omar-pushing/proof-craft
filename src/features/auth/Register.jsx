import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import { GOALS, HEARD, STATUS, YEARS } from './options.js';
import { APP } from '@/config/app.js';
import { useT } from '@/i18n/index.js';
import { COUNTRY_CODES, normalizePhone, validEmail } from '@/lib/phone.js';
import { auth, AUTH_ERROR } from '@/services/auth/index.js';

const splitName = (name = '') => { const bits = name.trim().split(/\s+/); return { firstName: bits.shift() || '', lastName: bits.join(' ') }; };
function Radio({ name, value, onChange, options, label }) { const { t } = useT(); return <fieldset className="choice"><legend>{t(label)}</legend><div className="row wrap">{options.map(([v, l]) => <label key={v} className={`pill-radio${value === v ? ' on' : ''}`}><input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />{t(l)}</label>)}</div></fieldset>; }

export default function Register({ identity, onDone, onSwitch }) {
  const { t } = useT(); const google = identity?.profile; const googleName = splitName(google?.name);
  const primary = identity?.channel; const primaryEmail = primary === 'google' || primary === 'email';
  const [step, setStep] = useState(1), [err, setErr] = useState({}), [busy, setBusy] = useState(false);
  const [a, setA] = useState({ firstName: googleName.firstName, lastName: googleName.lastName, country: '+20', phone: primary === 'phone' ? identity.identifier : '', email: primaryEmail ? identity.identifier : '' });
  const [p, setP] = useState({ isStudent: '', university: '', faculty: '', year: '', status: '', hardship: '', goals: [], heard: '', heardOther: '' });
  const [c, setC] = useState({ terms: false, privacy: false, newsletter: false, hardship: false });
  const sa = (key) => (event) => setA({ ...a, [key]: event.target.value }); const sp = (key, value) => setP((current) => ({ ...current, [key]: value }));
  const next1 = (event) => {
    event.preventDefault(); const errors = {}; const normalized = primary === 'phone' ? { ok: true, e164: identity.identifier } : normalizePhone(a.phone, a.country);
    if (!a.firstName.trim()) errors.firstName = 'Enter your first name.'; if (!a.lastName.trim()) errors.lastName = 'Enter your last name.';
    if (!normalized.ok) errors.phone = 'That phone number does not look right.';
    if (!a.email.trim()) errors.email = 'Enter your email address.'; else if (!validEmail(a.email)) errors.email = 'That email does not look right.';
    setErr(errors); if (!Object.keys(errors).length) { setA({ ...a, phone: normalized.e164 }); setStep(2); }
  };
  const toggleGoal = (goal) => sp('goals', p.goals.includes(goal) ? p.goals.filter((x) => x !== goal) : p.goals.length < 2 ? [...p.goals, goal] : p.goals);
  const askHardship = APP.collectHardship && p.isStudent === 'yes'; const answered = askHardship && p.hardship !== '' && p.hardship !== 'skip';
  const next2 = (event) => { event.preventDefault(); const errors = {}; if (!p.isStudent) errors.isStudent = 'Choose the option that describes you.'; if (!p.goals.length) errors.goals = 'Choose at least one goal so we can personalise your toolkit.'; setErr(errors); if (!Object.keys(errors).length) setStep(3); };
  const submit = async (event) => {
    event.preventDefault(); const errors = {};
    if (!c.terms) errors.terms = 'You need to accept the Terms of Use.'; if (!c.privacy) errors.privacy = 'You need to confirm that you have read the Privacy Policy.'; if (answered && !c.hardship) errors.hardship = 'Tick the box to share this, or choose “Prefer not to say”.';
    setErr(errors); if (Object.keys(errors).length) return; setBusy(true);
    try { await auth.completeRegistration({ identity, profile: { firstName: a.firstName, lastName: a.lastName, email: a.email, phone: a.phone, answers: { ...p, hardship: askHardship ? (answered ? p.hardship : '') : '' } }, consents: { marketing: c.newsletter, hardship: answered } }); onDone(); }
    catch (error) { setErr({ top: error.code === AUTH_ERROR.DUPLICATE_IDENTIFIER ? 'An account already uses this email or phone number. Sign in instead.' : 'We could not create your account. Try again.' }); setStep(1); } finally { setBusy(false); }
  };
  const status = (kind) => kind === primary || (kind === 'email' && primary === 'google') ? <span className="verify-state verified">{t('Verified')}</span> : <span className="verify-state">{t('Required · verify later in Settings')}</span>;

  return <div className="stack">
    <header className="auth-heading"><p className="eyebrow">{t('Complete your profile')}</p><h1>{t('A few details, then your toolkit is ready')}</h1><p>{t('Your verified sign-up method is saved. Add the missing details to personalise ProofCraft.')}</p></header>
    <ol className="steps-dots" aria-label={t('Progress')}>{[1, 2, 3].map((number) => <li key={number} className={number === step ? 'on' : number < step ? 'done' : ''} aria-current={number === step ? 'step' : undefined}><span>{number}</span>{t(['Account', 'Your profile', 'Preferences'][number - 1])}</li>)}</ol>
    {err.top && <p className="notice bad" role="alert">{t(err.top)} <button className="linkish" type="button" onClick={onSwitch}>{t('Sign in')}</button></p>}
    {step === 1 && <form className="form" onSubmit={next1} noValidate>
      <div className="grid-2 name-fields"><label>{t('First name')}<input value={a.firstName} onChange={sa('firstName')} autoComplete="given-name" required maxLength={40} aria-invalid={!!err.firstName} /><span className="err">{err.firstName && t(err.firstName)}</span></label><label>{t('Last name')}<input value={a.lastName} onChange={sa('lastName')} autoComplete="family-name" required maxLength={40} aria-invalid={!!err.lastName} /><span className="err">{err.lastName && t(err.lastName)}</span></label></div>
      <label><span className="label-row">{t('Email address')}{status('email')}</span><input value={a.email} onChange={sa('email')} type="email" autoComplete="email" readOnly={primaryEmail} required aria-invalid={!!err.email} /><span className={err.email ? 'err' : 'help'}>{err.email ? t(err.email) : !primaryEmail && t('You can verify this email later from Settings before using it to sign in.')}</span></label>
      <label><span className="label-row">{t('Phone number')}{status('phone')}</span><span className="phone-field"><select value={a.country} onChange={sa('country')} disabled={primary === 'phone'} aria-label={t('Country calling code')}>{COUNTRY_CODES.map(([iso, name, dial]) => <option key={iso} value={dial}>{name} ({dial})</option>)}</select><input value={a.phone} onChange={sa('phone')} type="tel" inputMode="tel" autoComplete="tel-national" aria-label={t('Phone number')} readOnly={primary === 'phone'} required aria-invalid={!!err.phone} /></span><span className={err.phone ? 'err' : 'help'}>{err.phone ? t(err.phone) : primary !== 'phone' && t('You can verify this phone later from Settings before using it to sign in.')}</span></label>
      <Button type="submit">{t('Continue')}</Button><p className="help">{t('Already have an account?')} <button className="linkish" type="button" onClick={onSwitch}>{t('Sign in')}</button></p>
    </form>}
    {step === 2 && <form className="form" onSubmit={next2} noValidate>
      <p className="lede">{t('Two quick answers help us put the right tools first. The remaining questions are optional.')}</p>
      <Radio name="stu" label="Are you a student?" value={p.isStudent} onChange={(value) => sp('isStudent', value)} options={[["yes", "Yes, I am a student"], ["no", "No, not right now"]]} />{err.isStudent && <span className="err" role="alert">{t(err.isStudent)}</span>}
      {p.isStudent === 'yes' && <div className="grid-2"><label>{t('University')}<input value={p.university} onChange={(e) => sp('university', e.target.value)} maxLength={80} /></label><label>{t('Faculty or major')}<input value={p.faculty} onChange={(e) => sp('faculty', e.target.value)} maxLength={80} /></label><label>{t('Year')}<select value={p.year} onChange={(e) => sp('year', e.target.value)}><option value="">{t('Choose')}</option>{YEARS.map((year) => <option key={year} value={year}>{t(year)}</option>)}</select></label></div>}
      {p.isStudent === 'no' && <label>{t('What describes you best?')}<select value={p.status} onChange={(e) => sp('status', e.target.value)}><option value="">{t('Choose')}</option>{STATUS.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>}
      {askHardship && <Radio name="hard" label="Is money a challenge for your studies right now?" value={p.hardship} onChange={(value) => sp('hardship', value)} options={[["yes", "Yes"], ["no", "Not really"], ["skip", "Prefer not to say"]]} />}
      <fieldset className="choice"><legend>{t('What do you want to do first? (up to 2)')}</legend><div className="row wrap">{GOALS.map((goal) => <label key={goal} className={`pill-radio${p.goals.includes(goal) ? ' on' : ''}`}><input type="checkbox" checked={p.goals.includes(goal)} onChange={() => toggleGoal(goal)} />{t(goal)}</label>)}</div></fieldset>{err.goals && <span className="err" role="alert">{t(err.goals)}</span>}
      <label>{t('How did you hear about us?')} <span className="opt">({t('optional')})</span><select value={p.heard} onChange={(e) => sp('heard', e.target.value)}><option value="">{t('Choose')}</option>{HEARD.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>{p.heard === 'Other' && <label>{t('Tell us where')}<input value={p.heardOther} onChange={(e) => sp('heardOther', e.target.value)} maxLength={80} /></label>}
      <div className="row"><Button variant="secondary" onClick={() => setStep(1)}>{t('Back')}</Button><Button type="submit">{t('Continue')}</Button></div>
    </form>}
    {step === 3 && <form className="form" onSubmit={submit} noValidate>
      <p className="lede">{t('One last step. Required choices are marked clearly; newsletter updates are optional.')}</p>
      <label className="check"><input type="checkbox" checked={c.terms} onChange={(e) => setC({ ...c, terms: e.target.checked })} required /><span>{t('I accept the')} <Link to="/terms" target="_blank">{t('Terms of Use')}</Link>. <b>{t('Required')}</b></span></label>{err.terms && <span className="err" role="alert">{t(err.terms)}</span>}
      <label className="check"><input type="checkbox" checked={c.privacy} onChange={(e) => setC({ ...c, privacy: e.target.checked })} required /><span>{t('I have read the')} <Link to="/privacy" target="_blank">{t('Privacy Policy')}</Link>. <b>{t('Required')}</b></span></label>{err.privacy && <span className="err" role="alert">{t(err.privacy)}</span>}
      {answered && <><label className="check"><input type="checkbox" checked={c.hardship} onChange={(e) => setC({ ...c, hardship: e.target.checked })} /><span>{t('I agree that ProofCraft may store my answer about money and my studies. It is used only to point me to free support and is never shown to other users. I can withdraw it any time in Settings.')}</span></label>{err.hardship && <span className="err">{t(err.hardship)}</span>}</>}
      <label className="check"><input type="checkbox" checked={c.newsletter} onChange={(e) => setC({ ...c, newsletter: e.target.checked })} /><span>{t('Send me the ProofCraft newsletter with useful updates and opportunities. Optional; unsubscribe any time.')}</span></label>
      <div className="row"><Button variant="secondary" onClick={() => setStep(2)}>{t('Back')}</Button><Button type="submit" disabled={busy}>{busy ? t('Creating account…') : t('Create my account')}</Button></div><p className="help">{t('We keep only what we need. You can export or delete your data at any time in Settings.')}</p>
    </form>}
  </div>;
}
