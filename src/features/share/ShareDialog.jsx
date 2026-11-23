import { useEffect, useState } from 'react';
import Dialog from '@/components/ui/Dialog.jsx';
import Button from '@/components/ui/Button.jsx';
import { useT } from '@/i18n/index.js';
import { useUser } from '@/state/session.js';
import { award, useUserStore } from '@/state/userData.js';
import { toast } from '@/state/toast.js';
import { collab, canEdit, roleOf, useMyWorkspaces } from '@/services/collab/index.js';
import { encodeShare, sanitizeShare, shareUrl } from '@/lib/share.js';
import { copyText } from '@/lib/download.js';

/** Two ways to share: a read-only snapshot link for anyone, or a post inside a workspace for the group. */
export default function ShareDialog({ open, onClose, payload }) {
  const { t } = useT(); const user = useUser(); const store = useUserStore(); const mine = useMyWorkspaces();
  const [link, setLink] = useState(''); const [wsId, setWsId] = useState('');
  const targets = mine.filter((w) => canEdit(roleOf(w, user.id)));
  useEffect(() => {
    if (!open) return; let alive = true; setLink('');
    encodeShare({ ...payload, by: user.name }).then((tok) => alive && setLink(shareUrl(tok)));
    return () => { alive = false; };
  }, [open, payload, user.name]);
  useEffect(() => { if (open && !wsId && targets[0]) setWsId(targets[0].id); }, [open, targets, wsId]);
  const copy = async () => { const ok = await copyText(link); toast(ok ? 'Link copied' : 'Copy is blocked here. Select the link and copy it.'); if (ok) award(store, 'share', 10); };
  const post = () => { collab.share(wsId, user, { kind: payload.kind, title: payload.title, data: sanitizeShare({ ...payload, by: user.name }) }); award(store, 'share', 10); toast('Shared to workspace'); onClose(); };
  return (
    <Dialog open={open} onClose={onClose} title={t('Share')}>
      <div className="stack">
        <div><h3>{t('Send a link')}</h3><p className="help">{t('Anyone with the link sees a read-only copy as it is now. Later edits stay private until you share again.')}</p>
          <div className="linkbox"><input readOnly value={link || '…'} aria-label={t('Share link')} onFocus={(e) => e.target.select()} /><Button size="sm" onClick={copy} disabled={!link}>{t('Copy link')}</Button></div>
          {navigator.share && <Button variant="secondary" size="sm" onClick={() => navigator.share({ title: payload.title, url: link }).catch(() => {})} disabled={!link}>{t('Send…')}</Button>}</div>
        <div><h3>{t('Share with a workspace')}</h3>
          {targets.length ? <div className="linkbox"><select value={wsId} onChange={(e) => setWsId(e.target.value)} aria-label={t('Workspace')}>{targets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select><Button size="sm" onClick={post}>{t('Post to workspace')}</Button></div>
            : <p className="help">{t('Create a workspace in Projects to share with your group.')}</p>}</div>
      </div>
    </Dialog>
  );
}
