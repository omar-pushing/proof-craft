import { forwardRef } from 'react';
import { BODY, KEYHOLE, VIEWBOX } from './paths.js';

/** The approved mark. Colours come from CSS variables so one drawing serves light and dark themes. */
const NibMark = forwardRef(function NibMark({ className = '', style }, ref) {
  return (
    <svg ref={ref} className={`nib ${className}`} style={style} viewBox={VIEWBOX} aria-hidden="true" focusable="false">
      <path className="nib-body" fillRule="evenodd" d={BODY} />
      <path className="nib-key" d={KEYHOLE} />
    </svg>
  );
});
export default NibMark;
