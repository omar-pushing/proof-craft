/**
 * Production boundary. The backend should implement these calls with secure, same-site sessions.
 * This file deliberately fails loudly until VITE_API_URL is configured and endpoints exist.
 */
const base = () => import.meta.env.VITE_API_URL;
async function request(path, options = {}) {
  if (!base()) throw new Error('The production authentication API is not configured.');
  const response = await fetch(`${base()}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || 'Authentication request failed.'), { code: data.code || 'server_failure', status: response.status });
  return data;
}
export const apiAuthDriver = {
  requestChallenge: (body) => request('/auth/challenges', { method: 'POST', body: JSON.stringify(body) }),
  verifyChallenge: ({ challengeId, code }) => request(`/auth/challenges/${challengeId}/verify`, { method: 'POST', body: JSON.stringify({ code }) }),
  continueWithGoogle: ({ credential }) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  completeRegistration: (body) => request('/auth/registrations/complete', { method: 'POST', body: JSON.stringify(body) }),
  getSession: () => request('/me'),
  signOut: () => request('/auth/logout', { method: 'POST' }),
  revokeSession: (body = {}) => request('/auth/sessions/revoke', { method: 'POST', body: JSON.stringify(body) }),
  verifySecondaryIdentifier: (body) => request('/auth/identifiers/verify', { method: 'POST', body: JSON.stringify(body) }),
};
