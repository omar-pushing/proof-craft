export default function ProofCard({ as: Tag = 'section', tone = 'plain', className = '', children, ...props }) {
  return <Tag className={`proof-card proof-card-${tone}${className ? ` ${className}` : ''}`} {...props}>{children}</Tag>;
}
