const unavailable = () => { throw Object.assign(new Error('Google connections require the production OAuth backend.'), { code: 'requires_backend' }); };
export const localIntegrations = {
  async status() { return { drive: { state: 'disconnected' }, calendar: { state: 'disconnected' } }; },
  connect: unavailable, disconnect: unavailable,
  async syncCalendar() { return { skipped: true }; }, async syncDrive() { return { skipped: true }; },
};
