import { useT } from '@/i18n/index.js';
export default function Privacy() {
  const { t } = useT();
  return (<section className="container narrow prose"><h1>{t('Privacy')}</h1>
    <h2>{t('Local first')}</h2><p>{t('In this preview, your tasks, cards, CV and notes are saved in your browser. CV and readability checks run in your browser too.')}</p>
    <h2>{t('Sharing')}</h2><p>{t('A share link contains a snapshot of the plan or deck you chose. Anyone who has the link can read it. Workspaces are visible only to their members.')}</p>
    <h2>{t('Measurement')}</h2><p>{t('Product measurement is off. It will never record your text, grades, CVs or contact details.')}</p>
    <h2>{t('Your data')}</h2><p>{t('You can export or delete your data in Settings.')}</p></section>);
}
