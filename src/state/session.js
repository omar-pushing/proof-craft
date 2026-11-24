import { createStore, useStore } from '@/lib/store.js';
import { uid } from '@/lib/id.js';
import { APP } from '@/config/app.js';
import { LEGAL } from '@/config/legal.js';

/**
 * Accounts. In this build profiles live in this browser (localStorage) and each tab has its own signed-in user (sessionStorage),
 * so two tabs can act as two people. Phone numbers are NOT verified here: production must verify by SMS code or by Google.
 * The rest of the app only uses { uid, useUser() }, so replacing this module with a real backend does not touch features.
 */
const USERS = 'pc:users';
const readUsers = () => { try { return JSON.parse(localStorage.getItem(USERS)) || []; } catch { return []; } };
const readUid = () => { try { return sessionStorage.getItem('pc:uid'); } catch { return null; } };
export const session = createStore({ uid: readUid(), users: readUsers() });
export const useSession = (sel) => useStore(session, sel);
export const useUser = () => useSession((s) => s.users.find((u) => u.id === s.uid) || null);
export const getUser = () => { const s = session.get(); return s.users.find((u) => u.id === s.uid) || null; };
const save = (users) => { try { localStorage.setItem(USERS, JSON.stringify(users)); } catch { /* ignore */ } session.set({ users }); };
const login = (id) => { try { sessionStorage.setItem('pc:uid', id); } catch { /* ignore */ } session.set({ uid: id }); };
export const isAdmin = (u) => !!u && (u.admin === true || APP.adminEmails.includes((u.email || '').toLowerCase()));

/** @returns {{user?:object,error?:'phone-exists'|'email-exists'}} */
export function signUp({ name, phone, email = '', provider = 'phone', sub = '', picture = '', profile = {}, consent = {} }) {
  const users = readUsers();
  if (users.some((u) => u.phone && u.phone === phone)) return { error: 'phone-exists' };
  if (email && users.some((u) => u.email && u.email.toLowerCase() === email.toLowerCase())) return { error: 'email-exists' };
  const user = { id: uid(), name: name.trim().slice(0, 60), phone, email: email.trim(), provider, sub, picture, created: Date.now(), admin: false, profile,
    consent: { termsVersion: LEGAL.termsVersion, privacyVersion: LEGAL.privacyVersion, at: Date.now(), marketing: false, hardship: false, ...consent } };
  save([...users, user]); login(user.id); return { user };
}
export function signInPhone(phone) { const u = readUsers().find((x) => x.phone === phone); if (u) login(u.id); return u || null; }
export function signInGoogle({ sub, email }) { const u = readUsers().find((x) => (x.sub && x.sub === sub) || (email && x.email && x.email.toLowerCase() === email.toLowerCase())); if (u) login(u.id); return u || null; }
export function signInExisting(id) { if (readUsers().some((u) => u.id === id)) login(id); }
export function updateUser(id, patch) {
  save(readUsers().map((u) => (u.id !== id ? u : { ...u, ...patch, profile: { ...u.profile, ...(patch.profile || {}) }, consent: { ...u.consent, ...(patch.consent || {}) } })));
}
export function signOut() { try { sessionStorage.removeItem('pc:uid'); } catch { /* ignore */ } session.set({ uid: null }); }
export function deleteAccount(id) {
  save(readUsers().filter((u) => u.id !== id));
  try { localStorage.removeItem(`pc:data:${id}`); } catch { /* ignore */ }
  signOut();
}
