import { Link } from 'react-router-dom';
export default function Button({ to, variant = 'primary', size, className = '', children, ...rest }) {
  const cls = `btn btn-${variant}${size ? ` btn-${size}` : ''}${className ? ` ${className}` : ''}`;
  return to ? <Link to={to} className={cls} {...rest}>{children}</Link> : <button type="button" className={cls} {...rest}>{children}</button>;
}
export const Arrow = () => <span className="arr" aria-hidden="true">→</span>;
