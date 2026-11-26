# ProofCraft production handoff

## Verified in this package

- Responsive English and Arabic landing, registration, navigation and product previews.
- Required first name, last name, email, country-aware phone number, Terms and Privacy confirmations.
- Google registration continues through the same missing-profile and consent steps.
- Newsletter consent is optional and separate from required legal consent.
- No public ProofCraft email address is shown until a real monitored address exists.
- No age gate or age-based eligibility copy.
- 32 CV templates, including 26 single-column ATS-safe choices and clearly flagged multi-column options.
- Production and self-contained preview builds pass; domain tests pass; `npm audit` reports no known vulnerabilities.

## Build

```bash
npm install
npm test
npm run build
```

Deploy `dist/` to `https://proofcraft.online`. The current HashRouter works on static hosting without rewrite rules.

## Required server integrations before accepting real accounts

The UI is deployable, but the included browser storage drivers are a preview data layer. Before accepting real user data:

1. Verify Google ID tokens on the server (signature, audience, expiry and verified email) and set `VITE_GOOGLE_CLIENT_ID`.
2. Add SMS verification and recovery for phone sign-in.
3. Replace the local account, collaboration and feedback drivers with authenticated API implementations and enforce roles server-side.
4. Connect the optional newsletter consent to the chosen newsletter provider. Do not send messages without the recorded opt-in.
5. Keep `VITE_COLLECT_HARDSHIP=0` until legal review and any required authorization for sensitive financial data are complete.
6. Have counsel review the legal pages and have a native Arabic editor review the full Arabic experience before public launch.

Never configure `VITE_PREVIEW_ADMIN=1` in production.
