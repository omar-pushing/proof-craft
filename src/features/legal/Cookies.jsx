import LegalPage from './LegalPage.jsx';
import { LEGAL as L } from '@/config/legal.js';

const sections = [
  { id: 'short', h: 'The short version', p: ['ProofCraft does not use advertising or analytics cookies, and does not track you across other websites. It saves some information on your device so the app works. Without it, you would have to start over every visit.'] },
  { id: 'list', h: 'What is saved on your device', p: [{ ul: [
    'Preferences (pc:prefs): your language and light or dark theme.',
    'Account on this device (pc:users, and pc:uid for the current tab): your profile and who is signed in.',
    'Your work (pc:data:…): tasks, plans, cards, grades, CVs, applications and notes.',
    'Workspaces and feedback (pc:ws, pc:feedback): copies kept so shared features work.',
    'Animation flags (pc:logo, pc:splash): so the logo animation plays once per visit.'] }, 'All of this is strictly necessary for features you ask for. You can delete it any time: use Settings, or clear this site\'s data in your browser.'] },
  { id: 'third', h: 'Other companies', p: [{ ul: ['Fonts: the site loads fonts from Google Fonts, which means your browser contacts Google when a page opens. We plan to host fonts ourselves.', 'Google sign-in: only if you click it. Google then sets cookies under its own policy.'] }] },
  { id: 'change', h: 'Changes', p: ['If we ever add optional analytics, we will ask for your permission first and list it here. Use the feedback form inside ProofCraft for questions.'] },
];
export default function Cookies() { return <LegalPage title="Cookies and storage" updated={L.updated} intro="What ProofCraft saves in your browser, and why." sections={sections} />; }
