import { Avatar, Status } from '@/components/ui/Bits.jsx';
import { useT } from '@/i18n/index.js';

/** Static, decorative examples built from the same primitives as the real tools. Content is fictional. */
export function Win({ title, children }) {
  const { t } = useT();
  return (<div className="win"><div className="win-bar"><i /><i /><i /><span>{t(title)}</span></div><div className="win-body">{children}</div><small className="win-note">{t('Example · fictional data')}</small></div>);
}
const Row = ({ a, b, tone, s }) => <div className="item"><div className="grow"><b>{a}</b><small className="muted">{b}</small></div><Status tone={tone}>{s}</Status></div>;

export const Mocks = {
  plan: () => (<Win title="Today"><Row a="ER diagram" b="Database Systems" tone="warn" s="Due today" /><Row a="Problem set 6" b="Calculus II" tone="bad" s="Overdue" /><Row a="Draft the introduction" b="Technical Writing" tone="neutral" s="Upcoming" /></Win>),
  study: () => { const { t } = useT(); return (<Win title="Study Lab"><div className="flash"><p className="q">What does normalisation remove from a table?</p><p className="a">{t('Redundant data that causes update anomalies.')}</p><div className="row"><span className="btn btn-secondary btn-sm">{t('Again')}</span><span className="btn btn-secondary btn-sm">{t('Hard')}</span><span className="btn btn-primary btn-sm">{t('Got it')}</span></div></div></Win>); },
  team: () => { const { t } = useT(); return (<Win title="Workspace"><div className="row between"><b>Clinic booking database</b><span className="avatars"><Avatar name="Nour" /><Avatar name="Karim" /><Avatar name="Salma" /></span></div>
    <div className="mini-board">{[['To do', ['Write test cases']], ['Doing', ['Schema review · Karim']], ['Done', ['ER diagram · Nour']]].map(([c, l]) => <div key={c} className="col"><h4 className="col-h">{t(c)}</h4>{l.map((x) => <div key={x} className="tcard"><small>{x}</small></div>)}</div>)}</div></Win>); },
  share: () => { const { t } = useT(); return (<Win title="Share"><p className="help">{t('Anyone with the link sees a read-only copy as it is now. Later edits stay private until you share again.')}</p><div className="linkbox"><input readOnly value="proofcraft.online/#/s/zK4p9Q…" aria-label="Example link" /><span className="btn btn-primary btn-sm">{t('Copy link')}</span></div><p className="help">{t('Share with a workspace')}: <b>Clinic booking database</b></p></Win>); },
  career: () => (<Win title="ATS Check"><Row a="Bullets start with an action verb" b="" tone="ok" s="Passed" /><Row a="Evidence includes a number" b="" tone="ok" s="Passed" /><Row a="Contact details" b="Add an email address." tone="warn" s="Needs a fix" /></Win>),
};
