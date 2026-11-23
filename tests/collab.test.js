import { test, before } from 'node:test';
import assert from 'node:assert/strict';

before(() => {
  const mem = new Map();
  globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
});

test('workspace roles are enforced on every call', async () => {
  const { localDriver: d } = await import('../src/services/collab/localDriver.js');
  const owner = { id: 'o', name: 'Nour' }, friend = { id: 'f', name: 'Karim' }, stranger = { id: 's', name: 'Eve' };
  const id = d.create({ name: 'Clinic', desc: '', owner });
  const code = d.snapshot()[id].code;
  assert.equal(d.join('wrong', friend), null);
  assert.equal(d.join(code.toLowerCase(), friend), id);
  d.addTask(id, friend, { title: 'Write tests', assignee: 'f' });
  assert.throws(() => d.addTask(id, stranger, { title: 'x' }), /forbidden/);
  d.setRole(id, owner, 'f', 'viewer');
  assert.throws(() => d.addTask(id, friend, { title: 'x' }), /forbidden/);
  assert.throws(() => d.setRole(id, friend, 'f', 'editor'), /forbidden/);
  const t = d.snapshot()[id].tasks[0];
  d.setRole(id, owner, 'f', 'editor'); d.moveTask(id, friend, t.id, 'done');
  assert.equal(d.snapshot()[id].tasks[0].status, 'done');
  d.removeMember(id, owner, 'f');
  assert.equal(d.snapshot()[id].members.length, 1); assert.equal(d.snapshot()[id].tasks[0].assignee, null);
  assert.ok(d.snapshot()[id].activity.length >= 4);
});
