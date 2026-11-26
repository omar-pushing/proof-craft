import { AuthError, AUTH_ERROR } from './errors.js';
import { getUser, listUsers, loginUser, signInGoogle, signOut as localSignOut, signUp, updateUser } from '@/state/session.js';

const challenges = new Map();
const PREVIEW_CODE = '246810';
const TEN_MINUTES = 10 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

export const maskIdentifier = (channel, value = '') => channel === 'email'
  ? value.replace(/^(.{1,2})(.*)(@.*)$/, (_, start, middle, domain) => `${start}${'•'.repeat(Math.min(5, middle.length))}${domain}`)
  : `${value.slice(0, 4)} •••• ${value.slice(-3)}`;

/** Development-only asynchronous auth driver. Never use its fixed code in production. */
export const localAuthDriver = {
  /** @param {{intent:'sign-in'|'register'|'verify-secondary',channel:'email'|'phone',identifier:string}} input */
  async requestChallenge(input) {
    if (!navigator.onLine) throw new AuthError(AUTH_ERROR.OFFLINE);
    const now = Date.now();
    const existing = [...challenges.values()].find((x) => x.channel === input.channel && x.identifier === input.identifier && now - x.sentAt < THIRTY_SECONDS);
    if (existing) throw new AuthError(AUTH_ERROR.RATE_LIMITED);
    const id = crypto.randomUUID ? crypto.randomUUID() : `${now}-${Math.random()}`;
    const challenge = { id, ...input, code: PREVIEW_CODE, sentAt: now, expiresAt: now + TEN_MINUTES, attempts: 0 };
    challenges.set(id, challenge);
    return { challengeId: id, expiresAt: challenge.expiresAt, resendAfter: now + THIRTY_SECONDS, maskedDestination: maskIdentifier(input.channel, input.identifier), previewCode: PREVIEW_CODE };
  },

  /** @param {{challengeId:string,code:string}} input */
  async verifyChallenge({ challengeId, code }) {
    const challenge = challenges.get(challengeId);
    if (!challenge || Date.now() > challenge.expiresAt) throw new AuthError(AUTH_ERROR.EXPIRED_CODE);
    challenge.attempts += 1;
    if (String(code).trim() !== challenge.code) throw new AuthError(AUTH_ERROR.INVALID_CODE);
    const user = listUsers().find((u) => challenge.channel === 'email'
      ? u.email?.toLowerCase() === challenge.identifier.toLowerCase()
      : u.phone === challenge.identifier);
    if (challenge.intent === 'sign-in') {
      if (!user) throw new AuthError(AUTH_ERROR.ACCOUNT_NOT_FOUND);
      const verified = user.verification?.[challenge.channel] ?? true;
      if (!verified) throw new AuthError(AUTH_ERROR.UNVERIFIED_IDENTIFIER);
      loginUser(user.id); challenges.delete(challengeId); return { status: 'signed-in', user };
    }
    if (challenge.intent === 'verify-secondary') {
      if (!user) throw new AuthError(AUTH_ERROR.ACCOUNT_NOT_FOUND);
      updateUser(user.id, { verification: { ...(user.verification || {}), [challenge.channel]: true } });
      challenges.delete(challengeId); return { status: 'verified', user: { ...user, verification: { ...(user.verification || {}), [challenge.channel]: true } } };
    }
    challenges.delete(challengeId);
    return { status: 'verified', identity: { channel: challenge.channel, identifier: challenge.identifier, verified: true } };
  },

  /** @param {{credential?:string,profile?:object}} input */
  async continueWithGoogle({ profile }) {
    if (!profile?.email) throw new AuthError(AUTH_ERROR.GOOGLE_BLOCKED);
    const existing = signInGoogle(profile);
    if (existing) return { status: 'signed-in', user: existing };
    return { status: 'registration-required', identity: { channel: 'google', identifier: profile.email, verified: true, profile } };
  },

  /** @param {{identity:object,profile:object,consents:object}} input */
  async completeRegistration({ identity, profile, consents }) {
    const result = signUp({
      ...profile,
      provider: identity.channel,
      sub: identity.profile?.sub || '',
      picture: identity.profile?.picture || '',
      profile: profile.answers,
      consent: consents,
      verification: { email: identity.channel === 'email' || identity.channel === 'google', phone: identity.channel === 'phone' },
    });
    if (result.error) throw new AuthError(AUTH_ERROR.DUPLICATE_IDENTIFIER, result.error);
    return { status: 'signed-in', user: result.user };
  },

  async getSession() { return getUser(); },
  async signOut() { localSignOut(); },
  async revokeSession() { localSignOut(); },
  async verifySecondaryIdentifier(input) {
    return this.requestChallenge({ ...input, intent: 'verify-secondary' });
  },
};
