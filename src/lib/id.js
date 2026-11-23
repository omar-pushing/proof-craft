export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const code = () => Array.from({ length: 6 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
