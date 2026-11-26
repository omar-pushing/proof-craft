export const COUNTRY_CODES = [
  ['EG', 'Egypt', '+20'], ['SA', 'Saudi Arabia', '+966'], ['AE', 'United Arab Emirates', '+971'],
  ['JO', 'Jordan', '+962'], ['KW', 'Kuwait', '+965'], ['QA', 'Qatar', '+974'], ['BH', 'Bahrain', '+973'],
  ['OM', 'Oman', '+968'], ['LB', 'Lebanon', '+961'], ['IQ', 'Iraq', '+964'], ['PS', 'Palestine', '+970'],
  ['SY', 'Syria', '+963'], ['YE', 'Yemen', '+967'], ['SD', 'Sudan', '+249'], ['LY', 'Libya', '+218'],
  ['TN', 'Tunisia', '+216'], ['DZ', 'Algeria', '+213'], ['MA', 'Morocco', '+212'],
  ['US', 'United States / Canada', '+1'], ['GB', 'United Kingdom', '+44'], ['IE', 'Ireland', '+353'],
  ['FR', 'France', '+33'], ['DE', 'Germany', '+49'], ['IT', 'Italy', '+39'], ['ES', 'Spain', '+34'],
  ['NL', 'Netherlands', '+31'], ['BE', 'Belgium', '+32'], ['CH', 'Switzerland', '+41'], ['AT', 'Austria', '+43'],
  ['SE', 'Sweden', '+46'], ['NO', 'Norway', '+47'], ['DK', 'Denmark', '+45'], ['FI', 'Finland', '+358'],
  ['PL', 'Poland', '+48'], ['GR', 'Greece', '+30'], ['TR', 'Türkiye', '+90'], ['RU', 'Russia', '+7'],
  ['IN', 'India', '+91'], ['PK', 'Pakistan', '+92'], ['BD', 'Bangladesh', '+880'], ['CN', 'China', '+86'],
  ['JP', 'Japan', '+81'], ['KR', 'South Korea', '+82'], ['ID', 'Indonesia', '+62'], ['MY', 'Malaysia', '+60'],
  ['SG', 'Singapore', '+65'], ['PH', 'Philippines', '+63'], ['AU', 'Australia', '+61'], ['NZ', 'New Zealand', '+64'],
  ['ZA', 'South Africa', '+27'], ['NG', 'Nigeria', '+234'], ['KE', 'Kenya', '+254'], ['GH', 'Ghana', '+233'],
  ['BR', 'Brazil', '+55'], ['MX', 'Mexico', '+52'], ['AR', 'Argentina', '+54'], ['CL', 'Chile', '+56'],
];

/** Normalises a national or international phone number to E.164. */
export function normalizePhone(input, countryCode = '+20') {
  let s = String(input || '').replace(/[\s().-]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if (!s) return { ok: false, error: 'required' };
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!s.startsWith('+')) {
    const dial = /^\+\d{1,4}$/.test(countryCode) ? countryCode : '+20';
    const national = s.replace(/^0+/, '');
    s = dial === '+20' && national.startsWith('20') && national.length === 12 ? '+' + national : dial + national;
  }
  if (!/^\+\d+$/.test(s)) return { ok: false, error: 'format' };
  if (s.startsWith('+20')) return /^\+201[0125]\d{8}$/.test(s) ? { ok: true, e164: s } : { ok: false, error: 'egypt' };
  return /^\+[1-9]\d{7,14}$/.test(s) ? { ok: true, e164: s } : { ok: false, error: 'format' };
}
export const maskPhone = (p) => (p ? `${p.slice(0, 5)}••••${p.slice(-3)}` : '');
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
