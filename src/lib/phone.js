/**
 * Normalises a phone number to E.164. Numbers without a country code are read as Egyptian.
 * Egyptian mobiles are +20 1[0125]xxxxxxxx (010 Vodafone, 011 Etisalat, 012 Orange, 015 WE).
 */
export function normalizePhone(input) {
  let s = String(input || '').replace(/[\s().-]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if (!s) return { ok: false, error: 'required' };
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!s.startsWith('+')) s = s.startsWith('0') ? '+20' + s.slice(1) : s.startsWith('20') && s.length === 12 ? '+' + s : '+20' + s;
  if (!/^\+\d+$/.test(s)) return { ok: false, error: 'format' };
  if (s.startsWith('+20')) return /^\+201[0125]\d{8}$/.test(s) ? { ok: true, e164: s } : { ok: false, error: 'egypt' };
  return /^\+[1-9]\d{7,14}$/.test(s) ? { ok: true, e164: s } : { ok: false, error: 'format' };
}
export const maskPhone = (p) => (p ? `${p.slice(0, 5)}••••${p.slice(-3)}` : '');
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
