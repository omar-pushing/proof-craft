import { niceDate } from '@/lib/dates.js';
import { uid } from '@/lib/id.js';
import { addDays, todayISO } from '@/lib/dates.js';

/** Read-only rendering of a plan or deck snapshot. Used by share links and by workspace posts. */
export function SharedView({ data, lang }) {
  if (data.kind === 'plan') {
    return (<div className="panel"><p className="muted">{data.date && `${niceDate(data.date, lang)}`}</p><ul className="list">{data.sessions.map((s, i) => <li key={i} className="item"><div className="grow"><b>{s.title}</b><small className="muted">{niceDate(s.due, lang)} · {s.mins} min</small></div></li>)}</ul></div>);
  }
  return (<div className="panel"><ul className="list">{data.cards.map((c, i) => <li key={i} className="item"><details className="grow"><summary>{c.q}</summary><p>{c.a}</p></details></li>)}</ul></div>);
}

/** Copies shared content into the signed-in user's own data with fresh ids. */
export function importShared(store, data) {
  if (data.kind === 'plan') store.set((s) => ({ tasks: [...s.tasks, ...data.sessions.filter((x) => x.due).map((x) => ({ id: uid(), title: x.title, course: data.title, due: x.due, done: false }))] }));
  else store.set((s) => ({ cards: [...s.cards, ...data.cards.map((c) => ({ id: uid(), q: c.q, a: c.a, due: todayISO(), n: 0 }))] }));
}
