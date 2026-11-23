import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import Dialog from '@/components/ui/Dialog.jsx';
import { emptyData, useUserStore } from '@/state/userData.js';
import { signOut, useUser } from '@/state/session.js';
import { download } from '@/lib/download.js';
import { toast } from '@/state/toast.js';
import { useT } from '@/i18n/index.js';

export default function Settings() {
  const { t } = useT(); const store = useUserStore(); const user = useUser(); const nav = useNavigate(); const [ask, setAsk] = useState(false);
  return (
    <>
      <PageHead title="Settings" desc="Your data belongs to you. Export it or delete it at any time." />
      <section className="panel"><h2>{t('Account')}</h2><p>{user.name}</p></section>
      <section className="panel"><h2>{t('Export your data')}</h2><p className="help">{t('Downloads your tasks, cards, evidence, CV and applications as one JSON file.')}</p><Button variant="secondary" onClick={() => download('proofcraft-data.json', JSON.stringify(store.get(), null, 2), 'application/json')}>{t('Download my data')}</Button></section>
      <section className="panel"><h2>{t('Delete your data')}</h2><p className="help">{t('Removes everything saved in your account and signs you out. Workspaces you share with others are not deleted.')}</p><Button variant="secondary" onClick={() => setAsk(true)}>{t('Delete my data')}</Button></section>
      <Dialog open={ask} onClose={() => setAsk(false)} title={t('Delete your data?')}>
        <p>{t('This cannot be undone.')}</p>
        <div className="row"><Button onClick={() => { store.replace(emptyData()); signOut(); toast('Your data was deleted.'); nav('/'); }}>{t('Yes, delete')}</Button><Button variant="secondary" onClick={() => setAsk(false)}>{t('Cancel')}</Button></div>
      </Dialog>
    </>
  );
}
