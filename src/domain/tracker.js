export const STAGES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];
export const TYPES = ['Internship', 'Full-time', 'Part-time', 'Freelance', 'Volunteer'];
export const MODES = ['On-site', 'Hybrid', 'Remote'];
export const SOURCES = ['Company site', 'LinkedIn', 'Referral', 'Career fair', 'Other'];
export const TERMINAL = ['Offer', 'Rejected'];
/** Funnel numbers shown on the tracker. "Response" counts anything that moved past Applied. */
export function stats(apps) {
  const applied = apps.filter((a) => a.stage !== 'Saved'), moved = apps.filter((a) => ['Interview', 'Offer', 'Rejected'].includes(a.stage) || (a.history || []).some((h) => ['Interview', 'Offer', 'Rejected'].includes(h.stage)));
  return { total: apps.length, applied: applied.length, interviews: apps.filter((a) => a.stage === 'Interview' || (a.history || []).some((h) => h.stage === 'Interview')).length, offers: apps.filter((a) => a.stage === 'Offer').length, response: applied.length ? Math.round((moved.length / applied.length) * 100) : null };
}
export const dueFollowUps = (apps, today) => apps.filter((a) => a.followUp && a.followUp <= today && !TERMINAL.includes(a.stage));
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
export const toCsv = (apps) => ['Role,Company,Stage,Type,Mode,Location,Source,Applied,Deadline,Follow-up,Link,Notes', ...apps.map((a) => [a.role, a.company, a.stage, a.type, a.mode, a.location, a.source, a.applied, a.deadline, a.followUp, a.link, a.notes].map(q).join(','))].join('\n');
export function moveStage(app, stage, now = new Date().toISOString().slice(0, 10)) {
  if (app.stage === stage) return app;
  return { ...app, stage, applied: stage === 'Applied' && !app.applied ? now : app.applied, history: [...(app.history || []), { stage, at: now }] };
}
