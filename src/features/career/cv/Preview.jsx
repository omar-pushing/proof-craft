import { useEffect, useRef, useState } from 'react';
import CvDocument from './CvDocument.jsx';
import { PAPERS } from '@/domain/cvTemplates.js';
import { useT } from '@/i18n/index.js';

const PAGE_H = { a4: 1123, letter: 1056 };
/** Scales the real page to the column width and marks where pages break. Print uses the same markup at full size. */
export default function Preview({ cv }) {
  const { t } = useT(); const box = useRef(null), page = useRef(null); const [scale, setScale] = useState(0.8), [h, setH] = useState(0);
  const paper = PAPERS[cv.design.paper] || PAPERS.a4, ph = PAGE_H[cv.design.paper] || PAGE_H.a4;
  useEffect(() => { const el = box.current, ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / paper.px))); ro.observe(el); setScale(Math.min(1, el.clientWidth / paper.px)); return () => ro.disconnect(); }, [paper.px]);
  useEffect(() => { const el = page.current, ro = new ResizeObserver(() => setH(el.offsetHeight)); ro.observe(el); setH(el.offsetHeight); return () => ro.disconnect(); }, []);
  const pages = Math.max(1, Math.ceil((h - 4) / ph));
  return (
    <div className="cv-preview" ref={box}>
      <div className="cv-preview-bar"><span>{t('Live preview')}</span><span className={pages > 1 ? 'warn' : ''}>{pages} {pages > 1 ? t('pages') : t('page')} · {paper.name}</span></div>
      <div className="cv-frame" style={{ height: Math.max(h, ph) * scale }}>
        <div className="cv-print-root"><div className="cv-scale" style={{ width: paper.px, transform: `scale(${scale})` }}>
          <div ref={page}><CvDocument cv={cv} /></div>
          {Array.from({ length: Math.max(pages, 1) - (h > ph ? 0 : 1) }, (_, k) => k + 1).filter((k) => k * ph < Math.max(h, ph) && h > ph).map((k) => <i key={k} className="cv-break" style={{ top: k * ph }} />)}
        </div></div>
      </div>
      {pages > 1 && <p className="help">{t('This CV runs over one page. For a first CV, one page is usually best.')}</p>}
    </div>
  );
}
