/** Snapshot sharing: the plan or deck is compressed into the URL itself, so no server is involved. */
const b64u = (b) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}
export async function encodeShare(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream === 'undefined') return 'r' + b64u(raw);
  return 'z' + b64u(await pipe(raw, new CompressionStream('deflate-raw')));
}
export async function decodeShare(token) {
  try {
    let bytes = unb64u(token.slice(1));
    if (token[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    return sanitizeShare(JSON.parse(new TextDecoder().decode(bytes)));
  } catch { return null; }
}
const str = (v, n) => String(v ?? '').slice(0, n);
/** Shared links are untrusted input: whitelist kinds, cap sizes, coerce every field. */
export function sanitizeShare(o) {
  if (!o || (o.kind !== 'plan' && o.kind !== 'deck')) return null;
  const base = { kind: o.kind, title: str(o.title, 120), by: str(o.by, 40) };
  if (o.kind === 'plan') {
    return { ...base, date: str(o.date, 10), sessions: (Array.isArray(o.sessions) ? o.sessions : []).slice(0, 200).map((s) => ({ title: str(s.title, 160), due: str(s.due, 10), mins: Math.min(600, Math.max(0, +s.mins || 0)) })) };
  }
  return { ...base, cards: (Array.isArray(o.cards) ? o.cards : []).slice(0, 300).map((c) => ({ q: str(c.q, 300), a: str(c.a, 600) })) };
}
export const shareUrl = (token) => `${location.origin}${location.pathname}#/s/${token}`;
