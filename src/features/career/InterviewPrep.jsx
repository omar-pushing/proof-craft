import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import { award, useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';
import { copyText } from '@/lib/download.js';
import { toast } from '@/state/toast.js';
import { uid } from '@/lib/id.js';

const QUESTIONS = ['Tell me about yourself', 'Tell me about a time you worked in a team', 'Describe a challenge you overcame', 'Why do you want this internship?', 'Tell me about a time you led others', 'Describe a mistake and what you learned', 'How do you handle tight deadlines?', 'What is your biggest strength?'];
const F = [['s', 'Situation', 'What was the context?'], ['t', 'Task', 'What were you responsible for?'], ['a', 'Action', 'What did you do yourself?'], ['r', 'Result', 'What changed? Use a number if you can.']];
const clean = (x) => x.trim().replace(/\.$/, '');

export default function InterviewPrep() {
  const { t } = useT(); const store = useUserStore(); const evidence = useData((s) => s.evidence), stories = useData((s) => s.stories); const seed = useLocation().state?.seed;
  const [q, setQ] = useState(QUESTIONS[2]); const [v, setV] = useState({ s: seed?.problem || '', t: '', a: seed?.part || '', r: seed?.result || '' }); const [out, setOut] = useState('');
  const load = (id) => { const e = evidence.find((x) => x.id === id); if (e) setV({ s: e.problem, t: '', a: e.part, r: e.result }); };
  const answer = `${clean(v.s)}. ${clean(v.t)}. I ${clean(v.a).replace(/^I\s+/i, '')}. ${clean(v.r)}.`; const words = answer.trim().split(/\s+/).length;
  const build = (e) => { e.preventDefault(); setOut(answer); award(store, 'star', 15); };
  const save = () => { store.set((s) => ({ stories: [{ id: uid(), q, text: out }, ...s.stories] })); toast('Saved'); };
  return (
    <>
      <PageHead title="Interview Prep" desc="Pick a question, build a Situation, Task, Action, Result answer from your own work, then practise saying it aloud. Aim for about two minutes." />
      <div className="split">
        <form className="panel form" onSubmit={build}>
          <label>{t('Question')}<select value={q} onChange={(e) => setQ(e.target.value)}>{QUESTIONS.map((x) => <option key={x} value={x}>{t(x)}</option>)}</select></label>
          {evidence.length > 0 && <label>{t('Start from evidence')}<select defaultValue="" onChange={(e) => load(e.target.value)}><option value="">{t('Choose a project')}</option>{evidence.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></label>}
          {F.map(([k, l, h]) => <label key={k}>{t(l)}<textarea rows={2} required value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /><span className="help">{t(h)}</span></label>)}
          <Button type="submit">{t('Build my answer')}</Button>
        </form>
        <div aria-live="polite"><section className="panel"><h2>{t('Your answer')}</h2>{out ? <><p className="pre">{out}</p><p className="help">{words} {t('words')} · ≈ {Math.max(1, Math.round((words / 130) * 60))} {t('seconds spoken')}</p><div className="row"><Button size="sm" onClick={save}>{t('Save answer')}</Button><Button variant="secondary" size="sm" onClick={async () => toast((await copyText(out)) ? 'Copied' : 'Copy is blocked here')}>{t('Copy answer')}</Button></div></> : <Empty>Your answer appears here.</Empty>}</section>
          {stories.length > 0 && <section className="panel"><h2>{t('Saved answers')}</h2><ul className="list">{stories.map((s) => <li key={s.id} className="item top"><div className="grow"><b>{t(s.q)}</b><p className="pre">{s.text}</p></div><Button variant="ghost" size="sm" onClick={() => store.set((st) => ({ stories: st.stories.filter((x) => x.id !== s.id) }))}>{t('Remove')}</Button></li>)}</ul></section>}</div>
      </div>
    </>
  );
}
