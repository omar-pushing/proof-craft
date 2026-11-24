import { APP } from '@/config/app.js';

/**
 * Google Identity Services (the current "Sign in with Google" button). It returns an ID token (JWT) in the browser.
 * IMPORTANT: decoding it here only reads the profile. A production backend must verify the token signature, audience and expiry
 * (POST /auth/google) before creating a session. Client-side checks below are a convenience, not security.
 */
let loading;
export const googleEnabled = () => !!APP.googleClientId;
export function loadGoogle() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google);
    const s = Object.assign(document.createElement('script'), { src: 'https://accounts.google.com/gsi/client', async: true, defer: true });
    s.onload = () => resolve(window.google); s.onerror = () => { loading = null; reject(new Error('google-blocked')); }; document.head.append(s);
  });
  return loading;
}
export function decodeCredential(jwt) {
  try {
    const p = JSON.parse(decodeURIComponent(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')));
    if (p.aud !== APP.googleClientId || (p.exp && p.exp * 1000 < Date.now())) return null;
    return { sub: p.sub, name: p.name || '', email: p.email || '', emailVerified: !!p.email_verified, picture: p.picture || '' };
  } catch { return null; }
}
