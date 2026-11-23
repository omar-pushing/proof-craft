import { lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout.jsx';
import AppShell from '@/components/layout/AppShell.jsx';
import Group from '@/components/layout/Group.jsx';
import { useSession } from '@/state/session.js';

const page = (loader, name = 'default') => lazy(() => loader().then((m) => ({ default: m[name] })));
const Landing = page(() => import('@/features/landing/Landing.jsx'));
const BlogIndex = page(() => import('@/features/blog/BlogIndex.jsx'));
const Article = page(() => import('@/features/blog/Article.jsx'));
const Privacy = page(() => import('@/features/settings/Privacy.jsx'));
const SignIn = page(() => import('@/features/auth/SignIn.jsx'));
const SharePage = page(() => import('@/features/share/SharePage.jsx'));
const JoinPage = page(() => import('@/features/share/JoinPage.jsx'));
const Today = page(() => import('@/features/today/TodayPage.jsx'));
const Exam = page(() => import('@/features/study/ExamPlanner.jsx'));
const Lab = page(() => import('@/features/study/StudyLab.jsx'));
const Grades = page(() => import('@/features/study/GradePlanner.jsx'));
const Workspaces = page(() => import('@/features/projects/Workspaces.jsx'));
const WorkspaceView = page(() => import('@/features/projects/WorkspaceView.jsx'));
const Research = page(() => import('@/features/projects/ResearchDesk.jsx'));
const Evidence = page(() => import('@/features/career/Evidence.jsx'));
const Cv = page(() => import('@/features/career/cv/CvMaker.jsx'));
const Ats = page(() => import('@/features/career/AtsCheck.jsx'));
const Tracker = page(() => import('@/features/career/Tracker.jsx'));
const Interview = page(() => import('@/features/career/InterviewPrep.jsx'));
const Settings = page(() => import('@/features/settings/Settings.jsx'));

function RequireAuth({ children }) {
  const uid = useSession((s) => s.uid); const { pathname } = useLocation();
  return uid ? children : <Navigate to={`/sign-in?next=${encodeURIComponent(pathname)}`} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="newsletter" element={<BlogIndex />} />
        <Route path="newsletter/:slug" element={<Article />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="s/:payload" element={<SharePage />} />
        <Route path="join/:code" element={<RequireAuth><JoinPage /></RequireAuth>} />
        <Route path="app" element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route index element={<Navigate to="today" replace />} />
          <Route path="today" element={<Today />} />
          <Route path="study" element={<Group id="study" />}>
            <Route index element={<Navigate to="exam" replace />} />
            <Route path="exam" element={<Exam />} /><Route path="lab" element={<Lab />} /><Route path="grades" element={<Grades />} />
          </Route>
          <Route path="projects" element={<Group id="projects" />}>
            <Route index element={<Navigate to="workspaces" replace />} />
            <Route path="workspaces" element={<Workspaces />} /><Route path="workspaces/:id" element={<WorkspaceView />} /><Route path="research" element={<Research />} />
          </Route>
          <Route path="career" element={<Group id="career" />}>
            <Route index element={<Navigate to="evidence" replace />} />
            <Route path="evidence" element={<Evidence />} /><Route path="cv" element={<Cv />} /><Route path="ats" element={<Ats />} />
            <Route path="tracker" element={<Tracker />} /><Route path="applications" element={<Navigate to="../tracker" replace />} /><Route path="interview" element={<Interview />} />
          </Route>
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="today" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
