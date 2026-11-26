import { apiAuthDriver } from './apiDriver.js';
import { localAuthDriver } from './localDriver.js';

export { AUTH_ERROR, AuthError } from './errors.js';
export { maskIdentifier } from './localDriver.js';

/** Swap to the API driver only when the production backend is explicitly configured. */
export const auth = import.meta.env.VITE_API_URL ? apiAuthDriver : localAuthDriver;
