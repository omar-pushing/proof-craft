const daysBetween = (from, to) => Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 864e5);

/** Pure, privacy-safe reminder engine. It works entirely from the signed-in user's local structured dates. */
export function buildNudges({ tasks = [], plans = [], cards = [], tracker = [] }, today, leadDays = 2) {
  const result = [];
  for (const task of tasks.filter((item) => !item.done && item.due)) {
    const days = daysBetween(today, task.due);
    if (days < 0) result.push({ id: `task-${task.id}-${today}`, tone: 'urgent', title: 'Task overdue', body: task.title, meta: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} late`, to: '/app/today' });
    else if (days === 0) result.push({ id: `task-${task.id}-${today}`, tone: 'today', title: 'Task due today', body: task.title, meta: task.course || 'Due today', to: '/app/today' });
    else if (days <= leadDays) result.push({ id: `task-${task.id}-${today}`, tone: 'soon', title: 'Task coming up', body: task.title, meta: `Due in ${days} day${days === 1 ? '' : 's'}`, to: '/app/today' });
  }
  for (const plan of plans) { const days = daysBetween(today, plan.date); if (days >= 0 && days <= Math.max(leadDays, 3)) result.push({ id: `exam-${plan.id}-${today}`, tone: days === 0 ? 'urgent' : 'soon', title: days === 0 ? 'Exam today' : 'Exam approaching', body: plan.name || 'Study plan', meta: days === 0 ? 'Open your plan' : `${days} day${days === 1 ? '' : 's'} remaining`, to: '/app/study/exam' }); }
  const dueCards = cards.filter((card) => card.due && String(card.due).slice(0, 10) <= today).length;
  if (dueCards) result.push({ id: `cards-${today}`, tone: 'today', title: 'Review ready', body: `${dueCards} card${dueCards === 1 ? '' : 's'} due`, meta: 'A short review keeps the spacing intact', to: '/app/study/lab' });
  for (const item of tracker.filter((entry) => entry.followUp && entry.followUp <= today && !['Accepted', 'Rejected', 'Withdrawn'].includes(entry.stage))) result.push({ id: `follow-${item.id}-${today}`, tone: 'soon', title: 'Follow-up due', body: [item.role, item.company].filter(Boolean).join(' · '), meta: 'Application tracker', to: '/app/career/tracker' });
  const order = { urgent: 0, today: 1, soon: 2 };
  return result.sort((a, b) => order[a.tone] - order[b.tone]).slice(0, 12);
}
