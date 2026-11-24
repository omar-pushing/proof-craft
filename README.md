# ProofCraft

A free workspace for college students: plan the semester, study for exams, work on projects with a group, and turn finished work into a CV.
React 18 + Vite + React Router. English and Arabic (RTL), light and dark themes.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # domain logic tests (node:test, no extra deps)
npm run build        # production build in dist/ (code-split, sourcemaps)
npm run build:preview  # one self-contained dist/index.html for sharing
```

## Architecture

```
src/
  app/            routes (lazy loaded) and the navigation map (nav.js is the single source for sidebar, tabs, routes)
  components/
    brand/        approved nib geometry (paths.js), Logo with the writing animation, footer StarField
    layout/       Header, Footer, AppShell, Group (tab sets), PublicLayout
    ui/           Button, Dialog (native <dialog>), Toast, Icon, small shared bits
  domain/         pure logic with tests: srs, grades, examPlan, ats. No React, no storage.
  features/       one folder per product area: landing, blog, auth, today, study, projects, career, share, progress, settings
  i18n/           useT() plus ar.js. English strings are the keys; missing Arabic falls back to English.
  lib/            store (external store + persistence), share (URL snapshots), ics, dates, ids, download
  services/collab driver interface for shared workspaces: localDriver (default) and apiDriver (contract)
  state/          prefs (theme, language), session, per-user data store, toast
  styles/         tokens.css (semantic tokens, light + dark), base, components, layout, landing, app
```

Conventions
- Components read semantic tokens (`--bg`, `--surface`, `--text`, `--action`...). No raw colours in component rules, so dark mode needs no overrides.
- Business rules live in `domain/` and are unit tested. Features import domain, never the reverse.
- All persisted state goes through `lib/store.js` with a version number, so schema changes can migrate.
- The brand mark is never edited, rotated or recoloured; only `--nib` and `--nib-key` change by theme.
- New copy: write the English string in `t('...')`, add the Arabic to `i18n/ar.js`.

## CV Maker and ATS Check

- `domain/cv.js` is the CV model: personal details, summary, skills groups, 9 list sections (experience, education, projects, certifications, awards, languages, volunteering, publications, references), custom sections, section order and visibility, design settings, English or Arabic. One `SCHEMA` drives the editor, the templates and the exporters.
- `domain/cvTemplates.js` lists 12 templates (10 single-column, 2 two-column flagged as parser-risky). Layout is pure CSS in `styles/cv.css`, so adding a template means a registry entry plus one CSS block.
- Exports: PDF through the browser print dialog (`@page` size and margin follow the design), Word (.doc, semantic single-column HTML), plain text, JSON Resume. JSON Resume import maps back to the model, so a CV can move to and from other builders.
- `domain/ats.js` is pure and tested: keyword extraction from a job description (known skills with aliases and acronyms, repeated phrases, weight by Requirements and Nice to have sections), presence matching with light stemming, text similarity, and about 30 formatting, content and language findings (parseability, dates, bullet length, action verbs, weak phrases, numbers, tense, pronouns, buzzwords, skills not backed by work, layout columns, length). There is deliberately no overall score.
- Prior art studied: Reactive Resume (MIT) for the template and export feature set, Resume Matcher (Apache-2.0) for keyword and similarity matching, and university career-centre ATS guidance for the formatting rules. No code was copied; the ML models those tools use are replaced by transparent rules that run in the browser.

## Design system

`styles/tokens.css` defines colour, space (`--s-1..8`), type, radius and motion tokens for light and dark. Dark mode only redefines token values; surfaces use `--surface`, `--surface-2`, `--field`, text uses `--text` and `--muted` (both above 7:1 on their backgrounds). Reusable patterns live in `components.css` and `extras.css`: panel, item rows, status (colour plus a word), chip, stat card, segmented control, accordion, tabs, dialog, toast. New screens should compose these instead of adding one-off styles. CV pages are always white because they are documents.

## Fonts

English keeps Young Serif and Readex Pro. Arabic uses Thmanyah when the files are present (see `public/fonts/thmanyah/README.txt`; the licence forbids redistributing them, so they are not in this repo). `unicode-range` limits Thmanyah to Arabic glyphs.

## Accounts, consent and Google sign-in

- Sign-up is three short steps: name, phone (Egyptian numbers normalised to E.164) and optional email; then optional questions (student or not, university, goals, how you heard, an optional money question with its own consent); then terms, age and marketing consent. `docs/data-collection.md` lists every field, why it exists and how sensitive it is.
- Consent is stored with the account (terms and privacy version, timestamp, marketing, hardship) and can be changed in Settings.
- Google: set `VITE_GOOGLE_CLIENT_ID`. The button uses Google Identity Services and returns an ID token. The browser only decodes it; a real deployment must verify the token on the server (`POST /auth/google`: signature, audience, expiry, `email_verified`) before creating a session. Without a client ID the button is shown disabled with an explanation.
- Phone numbers are not verified in this build. Production should send an SMS code (or rely on Google) before trusting a number.

## Feedback and admin

`services/feedback` is a driver interface like collaboration (`submit`, `update`, `remove`, `listMine`, `listAll`). Users send feedback from the sidebar, footer or Settings; the context attached is only the page, language, theme and browser type. `/app/admin` shows an inbox (status, notes, CSV export) and aggregate sign-up insights. Admin rights are a client hint here (`VITE_ADMIN_EMAILS`, or the preview-only switch); the API must enforce them.

## Legal pages

`features/legal` holds Privacy Policy, Terms of Use and Cookies and storage, driven by `config/legal.js`. They are drafts written for this product and Egypt's PDPL, not legal advice. Have a lawyer review them and fill in the entity, address and emails. The Arabic version shows a plain-language summary only; the full Arabic legal text still needs a professional translation.

## Study Timer

Timer (presets, custom, Pomodoro) and stopwatch (laps). State is wall-clock based and persisted, so it survives navigation and reloads. `TimerEngine` in the app shell finishes countdowns on any page, updates the tab title and shows a chip in the sidebar. Sessions go to a log with subject tags, a daily goal and a 7-day chart.

## Adding a CV template

Add an entry to `domain/cvTemplates.js` (id, name, columns, tags, photo flag) and a `.tpl-<id>` block in `styles/cv.css` using the `--cv-*` variables. The thumbnail, filter, ATS column warning and exports pick it up automatically.

## Collaboration contract

Shared workspaces go through `services/collab`. `localDriver` keeps them in this browser (tabs sync through the `storage` event; each tab signs in as its own user, so two tabs act as two people). It enforces roles on every call, exactly what the API must do.
To go multi-device, implement `apiDriver` with the same methods and set `VITE_COLLAB_DRIVER=api`:

`snapshot()`, `subscribe(fn)`, `create({name,desc,owner})`, `join(code,user)`, `addTask`, `moveTask`, `removeTask`, `comment`, `share`, `setRole`, `removeMember`, `leave`.

Suggested API: `POST /workspaces`, `POST /workspaces/join`, `PATCH /workspaces/:id/tasks/:taskId`, `POST /workspaces/:id/comments|shared`, `PATCH /workspaces/:id/members/:memberId`, plus an SSE or WebSocket stream per workspace that pushes the new snapshot. Authorise by membership role on the server; never trust the client.

## Sharing

A plan or deck share link is a deflate-compressed JSON snapshot inside the URL (`#/s/<token>`). It is read-only, needs no server, and is sanitised on open (kind whitelist, size caps, string coercion).

## Before launch

- Replace `state/session.js` with OAuth (Google); keep `useUser()` and `uid` as the interface.
- Implement `apiDriver` and a real newsletter signup (the footer form currently shows a notice).
- Arabic copy needs a native review. Run an accessibility pass with real assistive tech.
- PDF and DOCX import for ATS Check, and DOCX export for the CV, are not built.
- Newsletter posts in `features/blog/posts.js` are sample editions; move them to a CMS or API.
- Switch `HashRouter` to `BrowserRouter` once the host rewrites unknown paths to `index.html`.
