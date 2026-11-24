import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import Dialog from '@/components/ui/Dialog.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import { GOALS, HEARD, STATUS, YEARS } from '@/features/auth/options.js';
import { APP } from '@/config/app.js';
import { LEGAL } from '@/config/legal.js';
import { useUserStore } from '@/state/userData.js';
import { deleteAccount, isAdmin, updateUser, useUser } from '@/state/session.js';
import { useMyFeedback } from '@/services/feedback/index.js';
import { openFeedback } from '@/state/ui.js';
import { normalizePhone, validEmail } from '@/lib/phone.js';
import { download } from '@/lib/download.js';
import { toast } from '@/state/toast.js';
import { useT } from '@/i18n/index.js';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { t, lang } = useT(); const store = useUserStore(), user = useUser(), nav = useNavigate(), mine = useMyFeedback(user.id);
  const [ask, setAsk] = useState(false), [err, setErr] = useState({}); const p = user.profile || {}, c = user.consent || {};
  const saveProfile = (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)), er = {}; const ph = normalizePhone(f.phone);
    if (f.name.trim().length < 2) er.name = 'Enter your name.'; if (!ph.ok) er.phone = 'That phone number does not look right.'; if (f.email && !validEmail(f.email)) er.email = 'That email does not look right.';
    setErr(er); if (Object.keys(er).length) return;
    updateUser(user.id, { name: f.name.trim(), phone: ph.e164, email: f.email.trim(), profile: { university: f.university, faculty: f.faculty, year: f.year, status: f.status, heard: f.heard } }); toast('Saved');
  };
  const exportAll = () => download('proofcraft-data.json', JSON.stringify({ account: { ...user, picture: undefined }, data: store.get() }, null, 2), 'application/json');
  return (
    <>
      <PageHead title="Settings" desc="Your profile, your consents and your data. You are in control of all three." />
      <form className="panel form" onSubmit={saveProfile} key={user.updated}><h2>{t('Profile')}</h2>
        <div className="grid-2"><label>{t('Full name')}<input name="name" defaultValue={user.name} maxLength={60} required /><span className="err">{err.name && t(err.name)}</span></label><label>{t('Phone number')}<input name="phone" type="tel" defaultValue={user.phone} /><span className="err">{err.phone && t(err.phone)}</span></label>
          <label>{t('Email')} <span className="opt">({t('optional')})</span><input name="email" type="email" defaultValue={user.email} readOnly={user.provider === 'google'} /><span className="err">{err.email && t(err.email)}</span></label>
          <label>{t('University')}<input name="university" defaultValue={p.university || ''} maxLength={80} /></label><label>{t('Faculty or major')}<input name="faculty" defaultValue={p.faculty || ''} maxLength={80} /></label>
          <label>{t('Year')}<select name="year" defaultValue={p.year || ''}><option value="">{t('Choose')}</option>{YEARS.map((y) => <option key={y} value={y}>{t(y)}</option>)}</select></label>
          <label>{t('What describes you best?')}<select name="status" defaultValue={p.status || ''}><option value="">{t('Choose')}</option>{STATUS.map((y) => <option key={y} value={y}>{t(y)}</option>)}</select></label>
          <label>{t('How did you hear about us?')}<select name="heard" defaultValue={p.heard || ''}><option value="">{t('Choose')}</option>{HEARD.map((y) => <option key={y} value={y}>{t(y)}</option>)}</select></label></div>
        <Button type="submit">{t('Save')}</Button></form>
      <section className="panel"><h2>{t('Your consents')}</h2>
        <label className="check"><input type="checkbox" checked={!!c.marketing} onChange={(e) => updateUser(user.id, { consent: { marketing: e.target.checked } })} /> {t('Send me occasional updates about ProofCraft and opportunities.')}</label>
        {APP.collectHardship && p.hardship && <div className="item"><div className="grow"><b>{t('Your answer about money and studies')}</b><small className="muted">{t(p.hardship === 'yes' ? 'Yes' : 'Not really')}</small></div><Button variant="secondary" size="sm" onClick={() => updateUser(user.id, { profile: { hardship: '' }, consent: { hardship: false } })}>{t('Withdraw and remove')}</Button></div>}
        <p className="help">{t('Accepted')} <Link to="/terms">{t('Terms of Use')}</Link> {t('and')} <Link to="/privacy">{t('Privacy Policy')}</Link> ({c.termsVersion || LEGAL.termsVersion}) · {new Date(c.at || user.created).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</p></section>
      <section className="panel"><div className="row between"><h2>{t('Your feedback')}</h2><Button size="sm" onClick={() => openFeedback('idea')}>{t('Send feedback')}</Button></div>
        {mine.length === 0 ? <Empty>You have not sent feedback yet. Tell us what to improve.</Empty> : <ul className="list">{mine.slice(0, 8).map((x) => <li key={x.id} className="item top"><div className="grow"><b>{t(x.type)}</b><p className="pre">{x.message}</p></div><span className="status neutral">{t(x.status)}</span></li>)}</ul>}</section>
      {(isAdmin(user) || APP.previewAdmin) && <section className="panel"><h2>Admin</h2>{isAdmin(user) ? <Button to="/app/admin" variant="secondary">{t('Open admin inbox')}</Button> : <><p className="help">{t('Preview builds can switch admin tools on for testing. Production decides admins on the server.')}</p><Button variant="secondary" onClick={() => updateUser(user.id, { admin: true })}>{t('Enable admin tools (preview only)')}</Button></>}</section>}
      <section className="panel"><h2>{t('Export your data')}</h2><p className="help">{t('Downloads your account details and everything you saved as one JSON file.')}</p><Button variant="secondary" onClick={exportAll}>{t('Download my data')}</Button></section>
      <section className="panel"><h2>{t('Delete your account')}</h2><p className="help">{t('Removes your account and everything saved in it, then signs you out. Content you posted in shared workspaces stays visible to those members until they remove it.')}</p><Button variant="secondary" onClick={() => setAsk(true)}>{t('Delete my account')}</Button></section>
      <Dialog open={ask} onClose={() => setAsk(false)} title={t('Delete your account?')}><p>{t('This cannot be undone.')}</p><div className="row"><Button onClick={() => { deleteAccount(user.id); toast('Your account was deleted.'); nav('/'); }}>{t('Yes, delete')}</Button><Button variant="secondary" onClick={() => setAsk(false)}>{t('Cancel')}</Button></div></Dialog>
    </>
  );
}
