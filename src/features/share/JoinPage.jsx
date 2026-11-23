import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import { collab } from '@/services/collab/index.js';
import { getUser } from '@/state/session.js';
import { award, currentStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';

export default function JoinPage() {
  const { t } = useT(); const { code } = useParams(); const nav = useNavigate(); const [failed, setFailed] = useState(false);
  useEffect(() => {
    const id = collab.join(code, getUser());
    if (id) { award(currentStore(), 'team', 15); nav(`/app/projects/workspaces/${id}`, { replace: true }); } else setFailed(true);
  }, [code, nav]);
  if (!failed) return <section className="container narrow"><p role="status">{t('Joining workspace…')}</p></section>;
  return (
    <section className="container narrow"><h1>{t('We could not find that workspace')}</h1><p className="lede">{t('Check the invite code with the person who sent it.')}</p>
      {collab.isLocal && <p className="help">{t('This preview keeps workspaces in the browser where they were created. Open the invite in that browser, for example in a second tab.')}</p>}
      <Button to="/app/projects/workspaces">{t('Go to Workspaces')}</Button></section>
  );
}
