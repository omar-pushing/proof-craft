# Deploy ProofCraft to Vercel

## Project settings

Import the source project, then make sure Vercel's Root Directory is the folder that contains `package.json`, `vite.config.js` and `vercel.json`.

The repository now provides the remaining settings in `vercel.json`:

- Framework: Vite
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `24.x`, pinned in `package.json`

Do not set the output directory to the project root and do not deploy the self-contained preview build. Vercel should run the normal production build.

## Environment variables

Vite embeds `VITE_` variables while it builds. Add them to the relevant Vercel environments, then redeploy after every change.

For a frontend preview that intentionally stores test data in the browser:

```text
VITE_COLLAB_DRIVER=local
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=
VITE_ADMIN_EMAILS=
VITE_PREVIEW_ADMIN=0
VITE_COLLECT_HARDSHIP=0
```

For a real production deployment, set `VITE_API_URL` to the HTTPS backend origin and set `VITE_GOOGLE_CLIENT_ID` to the Web OAuth client ID. Keep `VITE_PREVIEW_ADMIN=0`. Do not switch `VITE_COLLAB_DRIVER` to `api` until the collaboration API driver and corresponding backend endpoints are implemented.

`VITE_ADMIN_EMAILS` is only a visual client hint. The backend must authorize every admin request independently.

## Google authentication

In Google Cloud Console, add every deployed frontend origin that is allowed to use the Web OAuth client, including the production domain. Preview deployment URLs should only be added when they are deliberately used for authentication testing. The backend must verify Google ID tokens and must not trust the browser-decoded profile.

## Routing

The current application uses `HashRouter`, so routes such as `/#/app/today` are resolved in the browser and do not need a catch-all Vercel rewrite. Do not add a rewrite that sends asset requests to `index.html`.

## Deployment checklist

1. Import the Git repository or upload the source project ZIP.
2. Select the directory containing `package.json` as Root Directory.
3. Confirm the Vite framework preset is detected.
4. Add environment variables for Preview and Production separately.
5. Deploy and check the build log for `vite build` and a generated `dist` directory.
6. Open `/`, `/#/sign-in`, `/#/app/today` and an Arabic page.
7. Check the browser console and test a full sign-in or registration flow.

## Common failures

- `No package.json found`: the Root Directory is one level too high or too low.
- `vite: command not found`: use `npm ci`; do not omit development dependencies during the build.
- Blank page with successful build: confirm the Output Directory is `dist` and remove conflicting rewrites.
- Google button disabled: set `VITE_GOOGLE_CLIENT_ID` and redeploy.
- API requests still use an old URL: update `VITE_API_URL` in the correct Vercel environment and redeploy because Vite variables are build-time values.
- Local data disappears on another device: the preview driver uses browser storage by design; connect the production backend before accepting real accounts.
