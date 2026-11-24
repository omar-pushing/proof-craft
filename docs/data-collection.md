# What ProofCraft asks users for, and why

Principle: ask for what you will act on. Everything beyond sign-up is optional and asked after the account exists. Based on progressive-profiling guidance (fewer required fields, more completions) and on Egypt's Personal Data Protection Law No. 151 of 2020 (purpose limitation, minimisation, explicit consent for sensitive data).

| Field | Required | Why we ask | Used for | Sensitivity |
|---|---|---|---|---|
| Full name | yes | Teammates and the account need a name | Workspaces, greeting, CV default | personal |
| Mobile phone | yes | Account identity and recovery without a password | Sign-in (SMS code in production) | personal |
| Email | no | Only for important account messages | Notices, recovery fallback | personal |
| Are you a student? | no | Decides which tools and suggestions come first | Onboarding, which fields to show | low |
| University, faculty, year | no | Course and exam suggestions, community stats | Personalisation, aggregate reporting | low |
| If not a student: status | no | Offers CV and application tools first to graduates and job seekers | Personalisation | low |
| Is money a challenge for your studies? | no, own consent | To point people to free support and resources | Routing to support. Never shown to other users, never used to deny features | **financial = sensitive under PDPL** |
| What do you want to do first (max 2) | no | Chooses the first screen | Personalisation | low |
| How did you hear about us | no | Measures which outreach works | Aggregate reporting | low |
| Marketing opt-in | no, unticked | Consent to updates | Email or SMS updates | consent record |
| Terms, privacy and age confirmation | yes | Record of what was accepted and when | Consent record (version and date) | legal |

Not collected: national ID, portal passwords, payment details, precise location, contacts, date of birth.

## Before launch
- Get legal sign-off on the privacy policy, terms and the hardship question. Egypt's PDPL treats financial data as sensitive and several summaries say processing needs the Data Protection Center's licence or permit. If that is not in place, set `VITE_COLLECT_HARDSHIP=0`.
- Direct electronic marketing also needs consent (the checkbox) and, per the law, registration with the Center.
- Confirm the age rule. Summaries differ on when a guardian's consent is needed for minors; the sign-up asks for 18+ or a guardian's agreement.
- Fill `src/config/legal.js` with the registered entity name, address and contact emails.
- Host fonts yourself (Google Fonts sends visitors' IPs to Google).
- Admin screens must be protected on the server. The client check is only a convenience.
