import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import { award, useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';
import { copyText } from '@/lib/download.js';
import { toast } from '@/state/toast.js';
import { uid } from '@/lib/id.js';

export default function ResearchDesk() {
  const { t } = useT(); const store = useUserStore(); const src = useData((s) => s.sources);
  const add = (e) => { e.preventDefault(); const f = new FormData(e.target); store.set((s) => ({ sources: [...s.sources, { id: uid(), title: String(f.get('title')).trim(), ref: String(f.get('ref')).trim(), note: String(f.get('note')).trim() }] })); award(store, 'src', 5); e.target.reset(); };
  const text = src.map((x, i) => `${i + 1}. ${x.title}${x.ref ? ` (${x.ref})` : ''}\n   ${x.note}`).join('\n');
  return (
    <>
      <PageHead title="Research Desk" desc="Keep every source with what it told you, then copy the list into your report." />
      <div className="split">
        <form className="panel form" onSubmit={add}><label>{t('Source title')}<input name="title" required maxLength={160} /></label><label>{t('Link or reference')}<input name="ref" maxLength={200} /></label>
          <label>{t('Key finding')}<textarea name="note" rows={3} required maxLength={400} /></label><Button type="submit">{t('Add source')}</Button></form>
        <div className="stack">{src.length === 0 ? <Empty>No sources yet. Add one source and what it told you.</Empty> : (<>{src.map((x) => <article key={x.id} className="panel"><b>{x.title}</b>{x.ref && <small className="muted">{x.ref}</small>}<p>{x.note}</p><Button variant="ghost" size="sm" onClick={() => store.set((s) => ({ sources: s.sources.filter((y) => y.id !== x.id) }))}>{t('Remove')}</Button></article>)}
          <Button variant="secondary" onClick={async () => toast((await copyText(text)) ? 'Copied' : 'Copy is blocked here')}>{t('Copy all as text')}</Button></>)}</div>
      </div>
    </>
  );
}
