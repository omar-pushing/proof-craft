import { Suspense, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from '@/app/routes.jsx';
import Toast from '@/components/ui/Toast.jsx';
import FeedbackDialog from '@/features/feedback/FeedbackDialog.jsx';
import Splash, { shouldSplash } from '@/components/brand/Splash.jsx';
import NibMark from '@/components/brand/NibMark.jsx';
import { prefs } from '@/state/prefs.js';
import { useStore } from '@/lib/store.js';

function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }

export default function App() {
  const [splash, setSplash] = useState(shouldSplash); const done = useCallback(() => setSplash(false), []);
  const theme = useStore(prefs, (s) => s.theme), lang = useStore(prefs, (s) => s.lang);
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = theme; r.lang = lang; r.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'dark' ? '#0E1120' : '#FAF8F3');
  }, [theme, lang]);
  return (<>{splash && <Splash onDone={done} />}<ScrollToTop /><Suspense fallback={<div className="boot" role="status" aria-label="Loading"><NibMark className="boot-nib" /></div>}><AppRoutes /></Suspense><Toast /><FeedbackDialog /></>);
}
