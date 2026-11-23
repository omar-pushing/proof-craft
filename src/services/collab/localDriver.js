import { uid, code } from '../../lib/id.js';

/**
 * Local collaboration driver: workspaces live in this browser's localStorage and sync across tabs
 * through the storage event. Every operation checks the caller's role, mirroring what the API must enforce.
 * The method set is the contract an API driver has to implement (see README).
 */
const KEY = 'pc:ws';
const clone = (v) => JSON.parse(JSON.stringify(v));
const subs = new Set();
let cache = { raw: undefined, val: {} };
const snapshot = () => {
  let raw = null; try { raw = localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw !== cache.raw) { let val = {}; try { val = raw ? JSON.parse(raw) : {}; } catch { /* ignore */ } cache = { raw, val }; }
  return cache.val;
};
const emit = () => subs.forEach((f) => f());
if (typeof addEventListener !== 'undefined') addEventListener('storage', (e) => { if (e.key === KEY) emit(); });
const commit = (m) => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ } emit(); };
const note = (ws, by, text) => { if (text) ws.activity = [{ id: uid(), at: Date.now(), by, text }, ...ws.activity].slice(0, 60); };
const roleOf = (ws, id) => ws.members.find((m) => m.id === id)?.role;
const LABEL = { todo: 'To do', doing: 'Doing', done: 'Done' };

function mutate(id, user, need, fn) {
  const m = clone(snapshot()); const ws = m[id];
  if (!ws) throw new Error('not-found');
  const r = roleOf(ws, user.id);
  const ok = need === 'owner' ? r === 'owner' : need === 'edit' ? r === 'owner' || r === 'editor' : !!r;
  if (!ok) throw new Error('forbidden');
  const out = fn(ws); note(ws, user.name, out?.log); commit(m); return out?.value;
}

export const localDriver = {
  isLocal: true, snapshot, subscribe: (f) => (subs.add(f), () => subs.delete(f)),
  create({ name, desc, owner }) {
    const m = clone(snapshot()), id = uid();
    const ws = { id, name: name.slice(0, 80), desc: (desc || '').slice(0, 200), code: code(), created: Date.now(), members: [{ id: owner.id, name: owner.name, role: 'owner' }], tasks: [], shared: [], comments: [], activity: [] };
    note(ws, owner.name, 'created this workspace'); m[id] = ws; commit(m); return id;
  },
  join(codeText, user) {
    const m = clone(snapshot()); const ws = Object.values(m).find((w) => w.code === codeText.trim().toUpperCase());
    if (!ws) return null;
    if (!ws.members.some((x) => x.id === user.id)) { ws.members.push({ id: user.id, name: user.name, role: 'editor' }); note(ws, user.name, 'joined the workspace'); commit(m); }
    return ws.id;
  },
  addTask: (id, user, { title, assignee, due }) => mutate(id, user, 'edit', (ws) => { ws.tasks.push({ id: uid(), title: title.slice(0, 140), assignee: assignee || null, due: due || '', status: 'todo' }); return { log: `added “${title.slice(0, 60)}”` }; }),
  moveTask: (id, user, taskId, status) => mutate(id, user, 'edit', (ws) => { const t = ws.tasks.find((x) => x.id === taskId); if (!t) return {}; t.status = status; return { log: `moved “${t.title.slice(0, 50)}” to ${LABEL[status]}` }; }),
  removeTask: (id, user, taskId) => mutate(id, user, 'edit', (ws) => { ws.tasks = ws.tasks.filter((x) => x.id !== taskId); return {}; }),
  comment: (id, user, text) => mutate(id, user, 'edit', (ws) => { ws.comments.push({ id: uid(), by: user.id, name: user.name, at: Date.now(), text: text.slice(0, 600) }); return {}; }),
  share: (id, user, item) => mutate(id, user, 'edit', (ws) => { ws.shared.unshift({ id: uid(), at: Date.now(), by: user.name, ...item }); return { log: `shared “${String(item.title).slice(0, 50)}”` }; }),
  setRole: (id, user, memberId, role) => mutate(id, user, 'owner', (ws) => { const m = ws.members.find((x) => x.id === memberId); if (m && m.role !== 'owner') { m.role = role; return { log: `made ${m.name} ${role}` }; } return {}; }),
  removeMember: (id, user, memberId) => mutate(id, user, 'owner', (ws) => { const m = ws.members.find((x) => x.id === memberId); if (m && m.role !== 'owner') { ws.members = ws.members.filter((x) => x.id !== memberId); ws.tasks.forEach((t) => { if (t.assignee === memberId) t.assignee = null; }); return { log: `removed ${m.name}` }; } return {}; }),
  leave: (id, user) => mutate(id, user, 'member', (ws) => { if (roleOf(ws, user.id) !== 'owner') { ws.members = ws.members.filter((x) => x.id !== user.id); return { log: 'left the workspace' }; } return {}; }),
};
