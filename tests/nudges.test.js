import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNudges } from '../src/services/notifications/nudges.js';

test('nudges prioritise overdue and due-today work, then nearby dates', () => {
  const items = buildNudges({ tasks: [
    { id: 'late', title: 'Late task', due: '2026-11-24', done: false },
    { id: 'today', title: 'Today task', due: '2026-11-26', done: false },
    { id: 'soon', title: 'Soon task', due: '2026-11-28', done: false },
    { id: 'far', title: 'Far task', due: '2026-12-10', done: false },
    { id: 'done', title: 'Finished', due: '2026-11-20', done: true },
  ] }, '2026-11-26', 2);
  assert.deepEqual(items.map((item) => item.body), ['Late task', 'Today task', 'Soon task']);
  assert.deepEqual(items.map((item) => item.tone), ['urgent', 'today', 'soon']);
});

test('nudges include approaching exams, due reviews and application follow-ups', () => {
  const items = buildNudges({ plans: [{ id: 'p', name: 'Databases', date: '2026-11-28' }], cards: [{ id: 'c', due: '2026-11-26' }], tracker: [{ id: 'a', role: 'Intern', company: 'Example', stage: 'Applied', followUp: '2026-11-26' }] }, '2026-11-26', 2);
  assert.equal(items.some((item) => item.id.startsWith('exam-')), true);
  assert.equal(items.some((item) => item.id.startsWith('cards-')), true);
  assert.equal(items.some((item) => item.id.startsWith('follow-')), true);
});
