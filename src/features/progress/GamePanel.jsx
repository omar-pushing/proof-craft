import { Bar } from '@/components/ui/Bits.jsx';
import { useT } from '@/i18n/index.js';
import { BADGES, level } from './badges.js';

/** Presentational: receives progress data, so the landing page can show an example with fictional numbers. */
export default function GamePanel({ data, example = false }) {
  const { t } = useT();
  return (
    <section className="panel game" aria-label={t('Progress')}>
      <div className="game-top">
        <div><small>{t('Level')}</small><b className="lvl">{level(data.xp)}</b></div>
        <div className="grow"><Bar value={data.xp % 100} /><small><b>{100 - (data.xp % 100)}</b> {t('XP to next level')}</small></div>
      </div>
      <div className="stats">
        <div><b>{data.streak}</b><small>{t('Day streak')}</small></div>
        <div><b>{data.counts.done || 0}</b><small>{t('Tasks done')}</small></div>
        <div><b>{data.xp}</b><small>{t('Total XP')}</small></div>
      </div>
      <ul className="badges">{BADGES.map(([n, k, c]) => { const on = (data.counts[k] || 0) >= c; return <li key={n} className={`badge${on ? ' on' : ''}`}><i />{t(n)}<span className="sr">{on ? '' : ` (${t('locked')})`}</span></li>; })}</ul>
      {example && <small className="muted">{t('Example · fictional data')}</small>}
    </section>
  );
}
