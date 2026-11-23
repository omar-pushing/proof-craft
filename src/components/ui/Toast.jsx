import { useEffect, useState } from 'react';
import { toastStore } from '@/state/toast.js';
import { useStore } from '@/lib/store.js';
import { useT } from '@/i18n/index.js';

export default function Toast() {
  const { t } = useT(); const n = useStore(toastStore, (s) => s.n), msg = useStore(toastStore, (s) => s.msg); const [on, setOn] = useState(false);
  useEffect(() => { if (!n) return; setOn(true); const id = setTimeout(() => setOn(false), 2600); return () => clearTimeout(id); }, [n]);
  return <div className={`toast${on ? ' on' : ''}`} role="status" aria-live="polite">{msg && t(msg)}</div>;
}
