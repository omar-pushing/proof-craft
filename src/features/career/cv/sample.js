import { emptyEntry, newCv } from '@/domain/cv.js';
/** Fictional CV used only for template thumbnails. */
export const SAMPLE_CV = (() => {
  const cv = newCv({ name: 'Nour Hassan' });
  cv.personal = { ...cv.personal, headline: 'Computer Science student · Data and software', email: 'nour@example.com', phone: '+20 100 000 0000', location: 'Damietta, Egypt', links: [{ id: 'l', label: 'LinkedIn', url: 'linkedin.com/in/nour' }] };
  cv.summary = 'Final-year student who builds data tools for campus clubs. Strong in SQL and Python, looking for a junior analyst internship.';
  cv.education = [{ ...emptyEntry('education'), school: 'Damietta University', degree: 'B.Sc. Computer Science', start: '2023-09', end: '2027-06', gpa: '3.5 / 4.0' }];
  cv.experience = [{ ...emptyEntry('experience'), role: 'Data intern', org: 'Baianat', start: '2025-07', end: '2025-09', bullets: ['Built a dashboard used by 40 staff', 'Cut report time from 3 hours to 20 minutes'] }];
  cv.projects = [{ ...emptyEntry('projects'), name: 'Clinic booking database', tech: 'SQL, Python', bullets: ['Designed a 9-table schema for a campus clinic', 'Removed double bookings in testing'] }];
  cv.skills = [{ id: 's', group: 'Technical', items: 'SQL, Python, Excel, Power BI, Git' }];
  cv.languages = [{ id: 'a', name: 'Arabic', level: 'Native' }, { id: 'e', name: 'English', level: 'Advanced' }];
  return cv;
})();
