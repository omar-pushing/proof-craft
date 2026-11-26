const AUDIT = 'pc:admin:audit';
const PRIVACY = 'pc:admin:privacy';
const FLAGS = 'pc:admin:flags';
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { localStorage.setItem(key, JSON.stringify(value)); return value; };

export const admin = {
  audit() { return read(AUDIT, []); },
  record({ actor, action, target, reason, result = 'success' }) {
    const event = { id: crypto.randomUUID?.() || `${Date.now()}`, actor, action, target, reason, result, at: Date.now() };
    write(AUDIT, [event, ...read(AUDIT, [])]); return event;
  },
  privacyRequests() { return read(PRIVACY, []); },
  updatePrivacy(id, patch, actor, reason) { const list = read(PRIVACY, []).map((item) => item.id === id ? { ...item, ...patch } : item); write(PRIVACY, list); this.record({ actor, action: 'privacy_request_updated', target: id, reason }); return list; },
  flags() { return read(FLAGS, [{ id: 'new-study-plan', name: 'New study-plan flow', enabled: true, audience: 'All users' }, { id: 'career-evidence', name: 'Career evidence prompts', enabled: true, audience: 'English and Arabic' }, { id: 'team-reminders', name: 'Workspace reminders', enabled: false, audience: 'Internal preview' }]); },
  setFlag(id, enabled, actor, reason) { const list = this.flags().map((flag) => flag.id === id ? { ...flag, enabled } : flag); write(FLAGS, list); this.record({ actor, action: enabled ? 'feature_enabled' : 'feature_disabled', target: id, reason }); return list; },
};
