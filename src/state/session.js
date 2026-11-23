import { createStore, useStore } from '@/lib/store.js';
import { uid } from '@/lib/id.js';
/**
 * Each browser tab has its own signed-in user (sessionStorage) while profiles live in localStorage.
 * That lets two tabs act as two people, which is how shared workspaces are exercised in this build.
 * Production replaces this module with OAuth; the rest of the app only reads { uid, user }.
 */
const USERS = 'pc:users';
const readUsers = () => { try { return JSON.parse(localStorage.getItem(USERS)) || []; } catch { return []; } };
const readUid = () => { try { return sessionStorage.getItem('pc:uid'); } catch { return null; } };
export const session = createStore({ uid: readUid(), users: readUsers() });
export const useSession = (sel) => useStore(session, sel);
export const useUser = () => useSession((s) => s.users.find((u) => u.id === s.uid) || null);
export const getUser = () => { const s = session.get(); return s.users.find((u) => u.id === s.uid) || null; };
export function signIn(name) {
  const clean = name.trim().slice(0, 40); if (!clean) return null;
  const users = readUsers(); let u = users.find((x) => x.name.toLowerCase() === clean.toLowerCase());
  if (!u) { u = { id: uid(), name: clean }; users.push(u); try { localStorage.setItem(USERS, JSON.stringify(users)); } catch { /* ignore */ } }
  try { sessionStorage.setItem('pc:uid', u.id); } catch { /* ignore */ }
  session.set({ uid: u.id, users }); return u;
}
export function signOut() { try { sessionStorage.removeItem('pc:uid'); } catch { /* ignore */ } session.set({ uid: null }); }
