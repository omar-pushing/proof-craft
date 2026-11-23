import { useCallback } from 'react';
import { prefs } from '@/state/prefs.js';
import { useStore } from '@/lib/store.js';
import ar from './ar.js';

/** English strings are the keys. Missing Arabic entries fall back to English, so new copy never renders blank. */
export function useT() {
  const lang = useStore(prefs, (s) => s.lang);
  const t = useCallback((key, vars) => {
    let s = (lang === 'ar' && ar[key]) || key;
    if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  }, [lang]);
  return { t, lang };
}
