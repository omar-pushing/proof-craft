const api = import.meta.env.VITE_API_URL || '';
async function request(path, options = {}) {
  const response = await fetch(`${api}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || 'Integration request failed.'), { code: data.code || 'integration_failed' });
  return data;
}
export const apiIntegrations = {
  status: () => request('/integrations'),
  connect(provider, returnTo) { window.location.assign(`${api}/integrations/${provider}/connect?returnTo=${encodeURIComponent(returnTo)}`); },
  disconnect: (provider) => request(`/integrations/${provider}`, { method: 'DELETE' }),
  syncCalendar: (payload) => request('/integrations/google-calendar/sync', { method: 'POST', body: JSON.stringify(payload) }),
  syncDrive: (payload) => request('/integrations/google-drive/sync', { method: 'POST', body: JSON.stringify(payload) }),
};
