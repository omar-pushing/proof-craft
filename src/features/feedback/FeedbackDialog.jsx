import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Dialog from '@/components/ui/Dialog.jsx';
import Button from '@/components/ui/Button.jsx';
import { feedback } from '@/services/feedback/index.js';
import { ui, closeFeedback } from '@/state/ui.js';
import { useStore } from '@/lib/store.js';
import { useUser } from '@/state/session.js';
import { toast } from '@/state/toast.js';
import { useT } from '@/i18n/index.js';
import { APP } from '@/config/app.js';
import { prefs } from '@/state/prefs.js';

const TYPES = [['bug', 'Something is broken'], ['idea', 'I have an idea'], ['question', 'I have a question'], ['praise', 'Something works well']];
/** One dialog, opened from the sidebar, the footer or anywhere via openFeedback(). Attaches only the page, language and browser type. */
export default function FeedbackDialog() {
  const { t, lang } = useT(); const open = useStore(ui, (s) => s.feedbackOpen), initial = useStore(ui, (s) => s.feedbackType); const user = useUser(), loc = useLocation(), theme = useStore(prefs, (s) => s.theme);
  const [type, setType] = useState('idea'), [message, setMessage] = useState(''), [rating, setRating] = useState(0), [ok, setOk] = useState(false), [contact, setContact] = useState(''), [err, setErr] = useState('');
  useEffect(() => { if (open) { setType(initial); setErr(''); } }, [open, initial]);
  const send = (e) => {
    e.preventDefault(); if (message.trim().length < 5) return setErr('Please write a little more so we can act on it.');
    feedback.submit({ type, message, rating, userId: user?.id, name: user?.name, contact: user ? (user.email || user.phone) : contact, canContact: ok, context: { path: loc.pathname, lang, theme, app: APP.version, ua: navigator.userAgent.slice(0, 90) } });
    toast('Thank you. Your feedback reached the team.'); setMessage(''); setRating(0); setOk(false); closeFeedback();
  };
  return (
    <Dialog open={open} onClose={closeFeedback} title={t('Send feedback')}>
      <form className="form" onSubmit={send} noValidate>
        <fieldset className="choice"><legend>{t('What is it about?')}</legend><div className="row wrap">{TYPES.map(([k, l]) => <label key={k} className={`pill-radio${type === k ? ' on' : ''}`}><input type="radio" name="fbt" checked={type === k} onChange={() => setType(k)} />{t(l)}</label>)}</div></fieldset>
        <label>{t('Your message')}<textarea rows={5} value={message} maxLength={1500} onChange={(e) => setMessage(e.target.value)} placeholder={t(type === 'bug' ? 'What did you do, what happened, and what did you expect?' : 'Tell us in your own words.')} aria-invalid={!!err} /><span className="help">{message.length}/1500</span></label>
        <fieldset className="choice"><legend>{t('How is ProofCraft working for you? (optional)')}</legend><div className="row">{[1, 2, 3, 4, 5].map((n) => <label key={n} className={`pill-radio round${rating === n ? ' on' : ''}`}><input type="radio" name="rate" checked={rating === n} onChange={() => setRating(n)} aria-label={`${n} / 5`} />{n}</label>)}</div></fieldset>
        {!user && <label>{t('Email or phone (optional)')}<input value={contact} onChange={(e) => setContact(e.target.value)} maxLength={80} /></label>}
        <label className="check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>{user ? t('You may contact me about this using my account details.') : t('You may contact me about this using the details above.')}</span></label>
        {err && <p className="err" role="alert">{t(err)}</p>}
        <p className="help">{t('We attach the page you are on, your language and your browser type, nothing else.')} <Link to="/privacy" onClick={closeFeedback}>{t('Privacy Policy')}</Link></p>
        <div className="row"><Button type="submit">{t('Send')}</Button><Button variant="secondary" onClick={closeFeedback}>{t('Cancel')}</Button></div>
      </form>
    </Dialog>
  );
}
