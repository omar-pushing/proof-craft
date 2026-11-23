/** Single source of truth for workspace navigation. Sidebar, group tabs and routes all read this. */
export const NAV = [
  { id: 'today', to: '/app/today', label: 'Today', icon: 'today' },
  { id: 'study', to: '/app/study', label: 'Study', icon: 'study', children: [['exam', 'Exam Planner'], ['lab', 'Study Lab'], ['grades', 'Grade Planner']] },
  { id: 'projects', to: '/app/projects', label: 'Projects', icon: 'users', children: [['workspaces', 'Workspaces'], ['research', 'Research Desk']] },
  { id: 'career', to: '/app/career', label: 'Career', icon: 'briefcase', children: [['evidence', 'Evidence'], ['cv', 'CV Maker'], ['ats', 'ATS Check'], ['tracker', 'Application Tracker'], ['interview', 'Interview Prep']] },
];
