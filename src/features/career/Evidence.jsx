import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import { award, useData, useUserStore } from '@/state/userData.js';
import { addEvidenceToCv } from '@/state/cvActions.js';
import { useUser } from '@/state/session.js';
import { useT } from '@/i18n/index.js';
import { uid } from '@/lib/id.js';

const clean = (v) => String(v).trim().replace(/\.$/, '');
export default function Evidence() {
  const { t } = useT(); const store = useUserStore(); const nav = useNavigate(); const list = useData((s) => s.evidence); const cvs = useData((s) => s.cvs); const user = useUser(); const inCv = (id) => cvs.some((c) => c.projects.some((p) => p.evidenceId === id));
  const add = (e) => { e.preventDefault(); const f = new FormData(e.target); store.set((s) => ({ evidence: [...s.evidence, { id: uid(), title: clean(f.get('title')), problem: clean(f.get('problem')), part: clean(f.get('part')), result: clean(f.get('result')) }] })); award(store, 'evidence', 20); e.target.reset(); };
  const useInCv = (x) => { addEvidenceToCv(store, x, user.name); nav('/app/career/cv'); };
  return (
    <>
      <PageHead title="Evidence" desc="For each project, write the problem, what you did yourself and the result. The same entry feeds your CV and your interview answers." />
      <div className="split">
        <form className="panel form" onSubmit={add}>
          <label>{t('Project title')}<input name="title" required maxLength={120} placeholder="Clinic booking database" /></label>
          <label>{t('Problem it solved')}<input name="problem" required maxLength={200} placeholder="The campus clinic double-booked appointments" /></label>
          <label>{t('What you did yourself')}<input name="part" required maxLength={200} placeholder="Designed a 9-table schema in a group of four" /></label>
          <label>{t('Result')}<input name="result" required maxLength={200} placeholder="No double bookings in testing" /></label>
          <Button type="submit">{t('Save evidence')}</Button>
        </form>
        <div className="stack">{list.length === 0 ? <Empty>No evidence yet. Save one project and it becomes a CV entry and an interview answer.</Empty> : list.map((x) => (
          <article key={x.id} className="panel"><b>{x.title}</b><p>{x.problem}. {x.part}. {x.result}.</p>
            <div className="row"><Button size="sm" onClick={() => useInCv(x)}>{inCv(x.id) ? t('Open in CV Maker') : t('Add to CV')}</Button><Button size="sm" variant="secondary" onClick={() => nav('/app/career/interview', { state: { seed: x } })}>{t('Use in Interview Prep')}</Button>
              <Button size="sm" variant="ghost" onClick={() => store.set((s) => ({ evidence: s.evidence.filter((y) => y.id !== x.id) }))}>{t('Remove')}</Button></div></article>))}</div>
      </div>
    </>
  );
}
