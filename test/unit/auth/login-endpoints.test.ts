import { describe, expect, it } from 'vitest';

import { LOGIN_SCOPES, LoginEndpoints } from '../../../src/auth/login-endpoints.js';

describe('LoginEndpoints', () => {
  it('points every endpoint at the Twinfield identity server over https', () => {
    const urls = Object.values(LoginEndpoints).map((url) => url.toString());

    expect(urls).toEqual([
      'https://login.twinfield.com/auth/authentication/connect/authorize',
      'https://login.twinfield.com/auth/authentication/connect/token',
      'https://login.twinfield.com/auth/authentication/connect/accesstokenvalidation',
      'https://login.twinfield.com/auth/authentication/connect/userinfo',
    ]);
  });

  it('asks for the mandatory organisation user scope and for a refresh token', () => {
    expect(LOGIN_SCOPES).toContain('twf.organisationUser');
    expect(LOGIN_SCOPES).toContain('offline_access');
  });
});
