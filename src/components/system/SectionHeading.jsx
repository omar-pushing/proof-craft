import ProofIcon from './ProofIcon.jsx';

export default function SectionHeading({ eyebrow, title, body, align = 'start', icon = 'plan' }) {
  return <header className={`ds-section-head ds-section-head-${align}`}><ProofIcon name={icon} size="sm" /><span>{eyebrow}</span><h2>{title}</h2>{body && <p>{body}</p>}</header>;
}
