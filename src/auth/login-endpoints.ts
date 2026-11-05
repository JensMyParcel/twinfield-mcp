const LOGIN_ORIGIN = 'https://login.twinfield.com';
const CONNECT = '/auth/authentication/connect';

/** The fixed Twinfield identity endpoints. They are not configurable on purpose. */
export const LoginEndpoints = {
  authorize: new URL(`${CONNECT}/authorize`, LOGIN_ORIGIN),
  token: new URL(`${CONNECT}/token`, LOGIN_ORIGIN),
  accessTokenValidation: new URL(`${CONNECT}/accesstokenvalidation`, LOGIN_ORIGIN),
  userInfo: new URL(`${CONNECT}/userinfo`, LOGIN_ORIGIN),
} as const;

/** `twf.organisationUser` is mandatory to log in; `offline_access` returns a refresh token. */
export const LOGIN_SCOPES = [
  'openid',
  'twf.user',
  'twf.organisation',
  'twf.organisationUser',
  'offline_access',
] as const;
