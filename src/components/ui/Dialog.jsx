import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { useT } from '@/i18n/index.js';

/** Native <dialog>: focus trap, Escape and inert background come from the browser. */
export default function Dialog({ open, onClose, title, children, wide = false }) {
  const ref = useRef(null); const { t } = useT();
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
    if (!open && d.open) { if (d.close) d.close(); else d.removeAttribute('open'); }
  }, [open]);
  return (
    <dialog ref={ref} className={`dlg${wide ? ' wide' : ''}`} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby="dlg-title">
      {open && (
        <div className="dlg-in">
          <div className="row between"><h2 id="dlg-title">{title}</h2><button className="iconbtn" onClick={onClose} aria-label={t('Close')}><Icon name="x" /></button></div>
          {children}
        </div>
      )}
    </dialog>
  );
}
