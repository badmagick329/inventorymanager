export const SHORT_STALE_TIME = 10 * 1000;
export const TOKEN_KEY = 'auth-token';
// Shared by login and logout so the clearing cookie always matches the one it
// replaces. Secure is limited to production so `next dev` over plain HTTP can
// still log in.
export const TOKEN_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
} as const;
export const ICON_SM = 16;
export const ICON_MD = 24;
export const ICON_LG = 48;
export const DELAY_500 = 500;
export const DELAY_1000 = 1000;
