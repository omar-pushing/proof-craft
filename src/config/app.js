/** Deployment settings. Everything environment-specific lives here or in .env files. */
export const APP = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  adminEmails: (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  previewAdmin: import.meta.env.VITE_PREVIEW_ADMIN === '1' || import.meta.env.DEV,
  /** Hardship is financial data, which Egypt's PDPL treats as sensitive. Turn off until the controller has legal sign-off and any licence it needs. */
  collectHardship: import.meta.env.VITE_COLLECT_HARDSHIP !== '0',
  version: '1.0.0',
};
