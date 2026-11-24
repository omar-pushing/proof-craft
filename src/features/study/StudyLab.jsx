import { useEffect, useMemo, useState } from 'react';
import PageHead from '@/components/ui/PageHead.jsx';
import Button from '@/components/ui/Button.jsx';
import { Empty } from '@/components/ui/Bits.jsx';
import ShareDialog from '@/features/share/ShareDialog.jsx';
import { cardsToCsv, forecast, parseCards, queue, rate, retention } from '@/domain/srs.js';
import { award, useData, useUserStore } from '@/state/userData.js';
import { useT } from '@/i18n/index.js';
import { niceDate, todayISO } from '@/lib/dates.js';
import { download } from '@/lib/download.js';
import { toast } from '@/state/toast.js';
import { minsOn } from '@/domain/timer.js';
import Button2 from '@/components/ui/Button.jsx';
import { uid } from '@/lib/id.js';

const RATINGS = [['again', 'Again', 'secondary'], ['hard', 'Hard', 'secondary'], ['got', 'Got it', 'primary'], ['easy', 'Easy', 'secondary']];
const dd = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);

export default function StudyLab() {
  const { t, lang } = useT(); const store = useUserStore();
  const decks = useData((s) => s.decks), deckId = useData((s) => s.deckId), cards = useData((s) => s.cards), log = useData((s) => s.reviewLog), ns = useData((s) => s.newStats), perDay = useData((s) => s.newPerDay), timeLog = useData((s) => s.timeLog);
  const [mode, setMode] = useState('due'), [shown, setShown] = useState(false), [tab, setTab] = useState('review'), [share, setShare] = useState(false), [find, setFind] = useState(''), [paste, setPaste] = useState(''), [newDeck, setNewDeck] = useState('');
  const td = todayISO(), deck = decks.find((d) => d.id === deckId) || decks[0], mine = useMemo(() => cards.filter((c) => c.deckId === deck.id), [cards, deck.id]);
  const newToday = ns.date === td ? ns.count : 0;
  const q = useMemo(() => { const r = queue(mine, { newLimit: perDay, newToday, cram: mode === 'cram' }); return mode === 'cram' ? [...r].sort((a, b) => (a.cramAt || 0) - (b.cramAt || 0)) : r; }, [mine, perDay, newToday, mode]);
  const card = q[0];
  const give = (r) => {
    if (!card) return;
    if (mode === 'cram') store.set((s) => ({ cards: s.cards.map((c) => (c.id === card.id ? { ...c, cramAt: Date.now() } : c)) }));
    else { const up = rate(card, r); store.set((s) => ({ cards: s.cards.map((c) => (c.id === card.id ? up : c)), reviewLog: [...s.reviewLog, { d: td, r }].slice(-400), newStats: !card.reps ? { date: td, count: (s.newStats.date === td ? s.newStats.count : 0) + 1 } : s.newStats })); award(store, 'card', 5); }
    setShown(false);
  };
  useEffect(() => {
    const k = (e) => { if (tab !== 'review' || !card || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return; if (!shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); setShown(true); } else if (shown && '1234'.includes(e.key) && e.key) give(RATINGS[+e.key - 1][0]); };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  });
  const addCard = (e) => { e.preventDefault(); const f = new FormData(e.target); store.set((s) => ({ cards: [...s.cards, { id: uid(), deckId: deck.id, q: String(f.get('q')).trim(), a: String(f.get('a')).trim(), due: td, n: 0, reps: 0 }] })); e.target.reset(); e.target.elements.q?.focus(); };
  const doImport = () => { const list = parseCards(paste); if (!list.length) return toast('No cards found. Use one "question;answer" per line.'); store.set((s) => ({ cards: [...s.cards, ...list.map((c) => ({ id: uid(), deckId: deck.id, ...c, due: td, n: 0, reps: 0 }))] })); setPaste(''); toast(`${list.length} cards imported`); };
  const addDeck = (e) => { e.preventDefault(); const name = newDeck.trim(); if (!name) return; const id = uid(); store.set((s) => ({ decks: [...s.decks, { id, name }], deckId: id })); setNewDeck(''); };
  const delDeck = () => { if (decks.length < 2) return; store.set((s) => { const rest = s.decks.filter((d) => d.id !== deck.id); return { decks: rest, deckId: rest[0].id, cards: s.cards.filter((c) => c.deckId !== deck.id) }; }); };
  const fc = forecast(mine, 7), maxF = Math.max(1, ...fc.map((x) => x.count)), ret = retention(log), reviewsToday = log.filter((x) => x.d === td).length;
  const list = mine.filter((c) => !find || `${c.q} ${c.a}`.toLowerCase().includes(find.toLowerCase()));
  return (
    <>
      <PageHead title="Study Lab" desc="Write your own cards, recall the answer before you reveal it, then rate yourself. Missed cards return tomorrow; correct ones come back after 1, 3, 7, 14 and 30 days.">
        <Button variant="secondary" size="sm" onClick={() => setShare(true)} disabled={!mine.length}>{t('Share deck')}</Button>
      </PageHead>
      <div className="stats4">{[[q.length, 'Due now'], [`${Math.min(newToday, perDay)}/${perDay}`, 'New today'], [reviewsToday, 'Reviewed today'], [ret == null ? '–' : `${ret}%`, 'Retention'], [`${minsOn(timeLog, td)} min`, 'Focus today']].map(([n, l]) => <div key={l} className="statcard"><b>{n}</b><small>{t(l)}</small></div>)}</div>
      <div className="row toolbar"><label className="inline-sel">{t('Deck')}<select value={deck.id} onChange={(e) => store.set({ deckId: e.target.value })}>{decks.map((d) => <option key={d.id} value={d.id}>{d.name} ({cards.filter((c) => c.deckId === d.id).length})</option>)}</select></label>
        <div className="seg" role="tablist" aria-label={t('Study Lab')}>{[['review', 'Review'], ['cards', 'Cards'], ['stats', 'Progress']].map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t(l)}</button>)}</div></div>

      {tab === 'review' && (<div className="split"><section className="panel">
        <div className="row between"><h2>{t('Review')}</h2><div className="seg" role="group" aria-label={t('Mode')}>{[['due', 'Due'], ['cram', 'Cram all']].map(([k, l]) => <button key={k} className={mode === k ? 'on' : ''} aria-pressed={mode === k} onClick={() => { setMode(k); setShown(false); }}>{t(l)}</button>)}</div></div>
        {card ? (<div className="flash"><p className="q">{card.q}</p>
          {shown ? (<><p className="a">{card.a}</p><div className="rates">{RATINGS.map(([k, l, v], i) => <Button key={k} variant={v} onClick={() => give(k)}><span>{t(l)}</span>{mode !== 'cram' && <small>{dd(td, rate(card, k).due)}{t('d')}</small>}<kbd>{i + 1}</kbd></Button>)}</div></>)
            : <Button onClick={() => setShown(true)}>{t('Reveal answer')} <kbd>Space</kbd></Button>}</div>)
          : <Empty>{mine.length ? (mode === 'due' ? 'All done for now. New cards are limited per day; change the limit under Cards, or use Cram all.' : 'No cards.') : 'No cards yet. Add your first card under Cards, or import a list.'}</Empty>}
        {mode === 'cram' && <p className="help">{t('Cram mode does not change your review schedule.')}</p>}</section>
        <section className="panel"><h2>{t('Study Timer')}</h2><p className="muted">{t('Time your study sessions with a timer or a stopwatch.')}</p><Button2 to="/app/study/timer" variant="secondary">{t('Open Study Timer')}</Button2></section></div>)}

      {tab === 'cards' && (<>
        <div className="split"><form className="panel form" onSubmit={addCard}><h2>{t('Add a card')}</h2><label>{t('Question')}<input name="q" required maxLength={300} /></label><label>{t('Answer')}<textarea name="a" required rows={2} maxLength={600} /></label><Button type="submit">{t('Save card')}</Button></form>
          <section className="panel form"><h2>{t('Import cards')}</h2><label>{t('One card per line: question;answer')}<textarea rows={4} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'What is 1NF;Atomic column values\nWhat is a foreign key;A column that references another table'} /></label><div className="row"><Button variant="secondary" onClick={doImport} disabled={!paste.trim()}>{t('Import')}</Button><Button variant="ghost" size="sm" onClick={() => download(`${deck.name}.csv`, cardsToCsv(mine), 'text/csv')} disabled={!mine.length}>{t('Export CSV')}</Button></div></section></div>
        <section className="panel"><div className="row between"><h2>{t('Decks')}</h2><label className="inline-sel">{t('New cards per day')}<input type="number" min={0} max={100} value={perDay} onChange={(e) => store.set({ newPerDay: Math.max(0, Math.min(100, +e.target.value || 0)) })} style={{ maxWidth: 90 }} /></label></div>
          <form className="row" onSubmit={addDeck}><input aria-label={t('New deck name')} value={newDeck} onChange={(e) => setNewDeck(e.target.value)} placeholder={t('New deck, e.g. Database Systems')} maxLength={50} style={{ maxWidth: 320 }} /><Button type="submit" variant="secondary" size="sm">{t('Add deck')}</Button><Button type="button" variant="ghost" size="sm" onClick={delDeck} disabled={decks.length < 2}>{t('Delete this deck')}</Button></form></section>
        <section className="panel"><div className="row between"><h2>{t('Your cards')} ({mine.length})</h2><input type="search" aria-label={t('Search cards')} placeholder={t('Search cards')} value={find} onChange={(e) => setFind(e.target.value)} style={{ maxWidth: 260 }} /></div>
          <ul className="list">{list.map((c) => <li key={c.id} className="item top"><details className="grow"><summary><b>{c.q}</b> <small className="muted">· {t('Next review')}: {niceDate(c.due, lang)}</small></summary>
            <div className="form"><label>{t('Question')}<input value={c.q} onChange={(e) => store.set((s) => ({ cards: s.cards.map((x) => (x.id === c.id ? { ...x, q: e.target.value } : x)) }))} /></label><label>{t('Answer')}<textarea rows={2} value={c.a} onChange={(e) => store.set((s) => ({ cards: s.cards.map((x) => (x.id === c.id ? { ...x, a: e.target.value } : x)) }))} /></label></div></details>
            <Button variant="ghost" size="sm" onClick={() => store.set((s) => ({ cards: s.cards.filter((x) => x.id !== c.id) }))} aria-label={`${t('Remove')}: ${c.q}`}>{t('Remove')}</Button></li>)}</ul></section></>)}

      {tab === 'stats' && (<section className="panel"><h2>{t('Reviews due in the next 7 days')}</h2><div className="fbars" role="img" aria-label={fc.map((x) => `${x.date}: ${x.count}`).join(', ')}>{fc.map((x, i) => <div key={x.date} className="fbar"><i style={{ height: `${(x.count / maxF) * 100}%` }} /><b>{x.count}</b><small>{i === 0 ? t('Today') : niceDate(x.date, lang).split(' ')[0]}</small></div>)}</div>
        <p className="help">{t('Retention is the share of your last 100 reviews that you rated Got it or Easy.')}</p></section>)}
      <ShareDialog open={share} onClose={() => setShare(false)} payload={{ kind: 'deck', title: deck.name, cards: mine.map(({ q: qq, a }) => ({ q: qq, a })) }} />
    </>
  );
}
