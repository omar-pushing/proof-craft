/** Sample editions. In production these come from the newsletter API (see README). */
export const POSTS = [
  { slug: 'first-cv-before-your-first-job', title: 'Write your first CV before you have a job', tag: 'Career', mins: 4, cover: 0, tool: ['/app/career/evidence', 'Save your first evidence'],
    dek: 'Employers read a student CV for evidence. Start from the projects you already finished.', quote: 'A number turns a claim into evidence.',
    sections: [['Start with one finished project', 'Pick something you completed this year: a database for a course, a survey for a club, an event you helped run. Write the problem it solved in one line, then what you did yourself, then what changed.'],
      ['Count something', 'Nine tables, forty survey answers, three hours saved each week. A single number makes a bullet specific. If you cannot find one, ask a teammate or look at the brief.'],
      ['Check it before you send it', 'Start each bullet with a verb, keep it under 25 words, and use plain headings: Education, Projects, Skills. A readability check on your own text catches what you stop seeing after the tenth read.']] },
  { slug: 'plan-an-exam-with-ten-days', title: 'Plan an exam when you have ten days', tag: 'Study', mins: 5, cover: 1, tool: ['/app/study/exam', 'Open Exam Planner'],
    dek: 'Ten days is enough if every day has a small, specific job.', quote: 'Practice first, recall later.',
    sections: [['List topics in the order they scare you', 'Put the topic you avoid first. It gets the earliest session, which leaves time to come back to it.'],
      ['Count real minutes', 'Not the minutes you wish you had. If you have 45 on a normal day and 20 on lab days, enter 20. A plan you can keep beats one that looks full.'],
      ['Schedule recall, not rereading', 'After the first practice session on a topic, schedule a shorter recall session a few days later. Try to answer from memory before you open the notes.']] },
  { slug: 'group-project-without-the-last-night', title: 'Run a group project without the last-night scramble', tag: 'Projects', mins: 6, cover: 2, tool: ['/app/projects/workspaces', 'Create a workspace'],
    dek: 'Most group projects fail on unclear ownership, not on effort.', quote: 'Every task has one name next to it.',
    sections: [['Give every task one owner', 'Shared ownership means nobody checks. Put one name on each task, even if two people will help.'],
      ['Keep one board', 'Messages scroll away. A board shows what is done, what is in progress and what is stuck, so the Thursday check takes five minutes.'],
      ['Decide who can change what', 'Let the person who submits the work be the owner. Teammates edit tasks and notes. A supervisor or friend can be a viewer who reads without changing anything.']] },
];
