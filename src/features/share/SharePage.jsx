import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import { useT } from '@/i18n/index.js';
import { useSession } from '@/state/session.js';
import { currentStore } from '@/state/userData.js';
import { decodeShare } from '@/lib/share.js';
import { niceDate } from '@/lib/dates.js';
import { uid } from '@/lib/id.js';
import { toast } from '@/state/toast.js';
import { importShared, SharedView } from './SharedView.jsx';

export default function SharePage() {
  const { t, lang } = useT(); const { payload } = useParams(); const nav = useNavigate(); const signed = useSession((s) => !!s.uid);
  const [data, setData] = useState(undefined);
  useEffect(() => { let alive = true; decodeShare(payload).then((d) => alive && setData(d)); return () => { alive = false; }; }, [payload]);
  if (data === undefined) return <section className="container narrow"><p role="status">{t('Opening shared link…')}</p></section>;
  if (!data) return <section className="container narrow"><h1>{t('This link cannot be opened')}</h1><p className="lede">{t('It may be cut off or edited. Ask the sender to share it again.')}</p><Button to="/">{t('Go to ProofCraft')}</Button></section>;
  const add = () => { importShared(currentStore(), data); toast('Added to your account'); nav(data.kind === 'plan' ? '/app/today' : '/app/study/lab'); };
  return (
    <section className="container narrow">
      <p className="kicker">{t('Shared with you')}{data.by ? ` · ${data.by}` : ''}</p>
      <h1>{data.title}</h1>
      <SharedView data={data} lang={lang} />
      <div className="row">
        {signed ? <Button onClick={add}>{data.kind === 'plan' ? t('Add sessions to my Today') : t('Add cards to my Study Lab')}</Button>
          : <Button to={`/sign-in?next=${encodeURIComponent(`/s/${payload}`)}`}>{t('Create a free account to add this')}</Button>}
        <Button to="/" variant="secondary">{t('What is ProofCraft?')}</Button>
      </div>
    </section>
  );
}
