import { useT } from '@/i18n/index.js';
export function Status({ tone = 'neutral', children }) { const { t } = useT(); return <span className={`status ${tone}`}>{t(children)}</span>; }
export function Avatar({ name, size }) { return <span className={`av${size ? ` av-${size}` : ''}`} title={name} aria-label={name}>{(name || '?').trim().slice(0, 1).toUpperCase()}</span>; }
export function Empty({ children }) { const { t } = useT(); return <div className="empty">{t(children)}</div>; }
export function Bar({ value }) { return <div className="bar" role="presentation"><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>; }
