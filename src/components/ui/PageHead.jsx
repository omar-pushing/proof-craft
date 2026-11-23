import { useT } from '@/i18n/index.js';
export default function PageHead({ title, desc, children }) {
  const { t } = useT();
  return (<header className="page-head"><div><h1>{t(title)}</h1>{desc && <p className="lede">{t(desc)}</p>}</div>{children && <div className="row">{children}</div>}</header>);
}
