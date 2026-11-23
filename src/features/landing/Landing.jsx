import { Link } from 'react-router-dom';
import Button, { Arrow } from '@/components/ui/Button.jsx';
import GamePanel from '@/features/progress/GamePanel.jsx';
import { PostCard } from '@/features/blog/BlogIndex.jsx';
import { POSTS } from '@/features/blog/posts.js';
import { Mocks } from './Mocks.jsx';
import { useReveal } from './useReveal.js';
import { useT } from '@/i18n/index.js';

const FEATURES = [
  { tag: 'Plan', title: 'Know what is due before it is late', body: 'Put every deadline in one agenda. Today separates what is overdue, due today and coming up, and lists the tasks your teammates assigned to you.', points: ['Add a task in seconds, with or without a course', 'Overdue, due today and upcoming are written out, not just coloured', 'Export your deadlines to any calendar app'], to: '/app/today', cta: 'Open Today', mock: 'plan' },
  { tag: 'Study', title: 'Study with a plan, not a panic', body: 'Enter the exam date, your topics and the minutes you really have each day. ProofCraft spreads short sessions across the days and tells you what does not fit. Then review your own cards at 1, 3, 7, 14 and 30 days.', points: ['You confirm the plan before it reaches Today', 'Cards you miss come back tomorrow', 'The grade planner shows the average you need on the work left'], to: '/app/study/exam', cta: 'Open Exam Planner', mock: 'study' },
  { tag: 'Projects', title: 'Work on a project with your group', body: 'Create a workspace, invite classmates with a code and give each person a role. Everyone sees the same board, shared notes and discussion, and every change is logged.', points: ['Owner, editor and viewer roles', 'Assign tasks and see who joined and what changed', 'Tasks assigned to you show up on Today'], to: '/app/projects/workspaces', cta: 'Create a workspace', mock: 'team' },
  { tag: 'Share', title: 'Send a study plan in one link', body: 'Share an exam plan or a flashcard deck with a friend. They open a read-only copy and can add it to their own account in one click. The link carries the plan itself, so nothing is uploaded.', points: ['Plans and decks open without an account', 'A link is a snapshot, so your later edits stay private', 'Or post the plan inside a workspace for the whole group'], to: '/app/study/exam', cta: 'Plan an exam', mock: 'share' },
  { tag: 'Career', title: 'Apply with work you can point to', body: 'Save what you did on each project, pick one of 12 templates and export to PDF, Word or text. ATS Check reads your CV the way a parser would and compares it with the job post you paste.', points: ['Evidence feeds your CV and your interview answers', 'Single-column templates that parsers read in the right order', 'Track every application with deadlines and follow-ups'], to: '/app/career/cv', cta: 'Open CV Maker', mock: 'career' },
];
const STEPS = [['Plan', 'Put every deadline and exam in Today.'], ['Study', 'Short sessions and spaced reviews keep it fresh.'], ['Work together', 'One board and one discussion for the group.'], ['Apply', 'Turn finished work into a CV and interview answers.']];
const FAQ = [['Do I need a university email?', 'No. ProofCraft never asks for university portal passwords.'], ['Does it cost anything?', 'No. Registration and every student tool are free.'], ['Who can see my work?', 'Only you, plus the people you invite to a workspace or send a link to. Public pages exist only when you publish them.'], ['How does sharing work?', 'A share link holds a snapshot of the plan or deck. Anyone with the link can read it. Workspaces are visible to their members only.'], ['What does ATS Check do?', 'It checks formatting and writing the way a parser would, and shows which keywords from a job post your CV covers. It does not give a hiring score and cannot predict any employer system.'], ['Which languages are supported?', 'The workspace works in English and Arabic.']];
const EXAMPLE = { xp: 140, streak: 6, counts: { done: 5, plan: 1, card: 10, team: 1 } };

export default function Landing() {
  const { t } = useT(); useReveal();
  const jump = () => document.getElementById('toolkit')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-paper" aria-hidden="true" />
        <div className="container hero-in">
          <h1 id="hero-title"><span>{t('Plan college.')}</span> <span className="hl">{t('Prepare for your career.')}</span></h1>
          <p className="hero-sub">{t('A free workspace for college students. Plan your semester, study for exams, work on projects with your group, and turn what you finish into a CV.')}</p>
          <div className="hero-cta"><Button to="/sign-in">{t('Create free account')} <Arrow /></Button><Button variant="secondary" onClick={jump}>{t('See what is inside')} <Arrow /></Button></div>
          <p className="hero-note">{t('Free. No university email needed.')}</p>
        </div>
      </section>

      <section className="section" id="toolkit" tabIndex={-1}><div className="container features">
        {FEATURES.map((f, i) => { const Mock = Mocks[f.mock]; return (
          <div key={f.tag} className={`feature reveal${i % 2 ? ' rev' : ''}`}>
            <div className="feature-text"><span className="tag">{t(f.tag)}</span><h2>{t(f.title)}</h2><p>{t(f.body)}</p><ul className="checks">{f.points.map((p) => <li key={p}>{t(p)}</li>)}</ul><Button to={f.to}>{t(f.cta)} <Arrow /></Button></div>
            <div className="frame"><Mock /></div>
          </div>); })}
      </div></section>

      <section className="section alt" id="how" tabIndex={-1}><div className="container"><h2>{t('From coursework to your first job')}</h2>
        <ol className="steps">{STEPS.map(([a, b], i) => <li key={a} className="step reveal" style={{ '--i': i }}><span className="num">{i + 1}</span><h3>{t(a)}</h3><p>{t(b)}</p></li>)}</ol></div></section>

      <section className="section"><div className="container two">
        <div className="reveal"><h2>{t('Earn XP for what you actually finish')}</h2><p className="lede">{t('Finish a task, rate a card, confirm a plan or join a team and you earn XP. Keep a daily streak and unlock badges as your CV takes shape. Your progress is private and never ranked against anyone.')}</p><Button to="/sign-in">{t('Create free account')} <Arrow /></Button></div>
        <div className="reveal"><GamePanel data={EXAMPLE} example /></div>
      </div></section>

      <section className="section alt"><div className="container"><div className="row between"><h2>{t('From the newsletter')}</h2><Button to="/newsletter" variant="secondary" size="sm">{t('Read all articles')} <Arrow /></Button></div>
        <div className="posts">{POSTS.map((p) => <div key={p.slug} className="reveal"><PostCard p={p} /></div>)}</div></div></section>

      <section className="section"><div className="container narrow"><h2>{t('Questions')}</h2><div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{t(q)}</summary><p>{t(a)}</p></details>)}</div></div></section>

      <section className="cta-band"><div className="container"><h2>{t('Start with this week')}</h2><p>{t('Add one deadline and see it on Today.')}</p><Button to="/sign-in" variant="marker">{t('Create free account')} <Arrow /></Button></div></section>
    </>
  );
}
