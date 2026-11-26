export const AUTH_ERROR = Object.freeze({
  INVALID_CODE: 'invalid_code', EXPIRED_CODE: 'expired_code', RATE_LIMITED: 'rate_limited',
  DUPLICATE_IDENTIFIER: 'duplicate_identifier', CHANNEL_UNAVAILABLE: 'channel_unavailable',
  GOOGLE_BLOCKED: 'google_blocked', OFFLINE: 'offline', SERVER_FAILURE: 'server_failure',
  ACCOUNT_NOT_FOUND: 'account_not_found', UNVERIFIED_IDENTIFIER: 'unverified_identifier',
});

export class AuthError extends Error {
  constructor(code, message = code) { super(message); this.name = 'AuthError'; this.code = code; }
}
