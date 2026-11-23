import { newCv, emptyEntry } from '@/domain/cv.js';
import { uid } from '@/lib/id.js';

/** Returns the active CV id, creating a first CV from the user's name when none exists. */
export function ensureCv(store, name = '') {
  const s = store.get();
  if (s.cvs.length) return s.activeCv && s.cvs.some((c) => c.id === s.activeCv) ? s.activeCv : s.cvs[0].id;
  const cv = newCv({ name, title: 'My CV' }); store.set({ cvs: [cv], activeCv: cv.id }); return cv.id;
}
/** Evidence becomes a project entry: problem and part and result turn into bullets. Skips duplicates by evidence id. */
export function addEvidenceToCv(store, ev, userName) {
  const id = ensureCv(store, userName);
  store.set((s) => ({ cvs: s.cvs.map((c) => (c.id !== id || c.projects.some((p) => p.evidenceId === ev.id) ? c : { ...c, updated: Date.now(), projects: [...c.projects, { ...emptyEntry('projects'), id: uid(), evidenceId: ev.id, name: ev.title, role: '', bullets: [ev.part, ev.result].filter(Boolean).map((x) => x.replace(/\.$/, '')) }] })), activeCv: id }));
}
