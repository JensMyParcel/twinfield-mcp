import { describe, expect, it } from 'vitest';

import { LoginEndpoints } from '../../../src/auth/login-endpoints.js';
import { OAuthError } from '../../../src/auth/token-endpoint.js';
import { UserInfoEndpoint } from '../../../src/auth/user-info-endpoint.js';
import { AccessToken } from '../../../src/domain/access-token.js';
import { RecordingTransport, httpResponse, jsonResponse } from '../../support/io-http.js';

const accessToken = AccessToken.of('access-1');

function endpointAnswering(...responses: Parameters<typeof RecordingTransport.answering>) {
  const http = RecordingTransport.answering(...responses);

  return { http, userInfo: new UserInfoEndpoint(http) };
}

describe('UserInfoEndpoint', () => {
  it('sends the access token as a bearer token', async () => {
    const { http, userInfo } = endpointAnswering(jsonResponse({ sub: 'user-1' }));

    await userInfo.claims(accessToken);

    const request = http.only();
    expect(request.method).toBe('GET');
    expect(request.url.toString()).toBe(LoginEndpoints.userInfo.toString());
    expect(request.headers).toEqual({
      authorization: 'Bearer access-1',
      accept: 'application/json',
    });
  });

  it('returns every claim of the user', async () => {
    const claims = { sub: 'user-1', 'twf.organisationCode': 'ORG', roles: ['a'] };
    const { userInfo } = endpointAnswering(jsonResponse(claims));

    await expect(userInfo.claims(accessToken)).resolves.toEqual(claims);
  });

  it.each([401, 403, 500])('rejects HTTP %i without showing the body', async (status) => {
    const { userInfo } = endpointAnswering(httpResponse(status, 'access-1 <html>'));

    await expect(userInfo.claims(accessToken)).rejects.toThrow(
      new OAuthError(`The user info endpoint answered HTTP ${status}.`),
    );
  });

  it.each([
    ['a body that is not JSON', '<html></html>'],
    ['JSON null', 'null'],
    ['a JSON string', '"user-1"'],
    ['a JSON array', '[{"sub":"user-1"}]'],
  ])('rejects an answer with %s', async (_, body) => {
    const { userInfo } = endpointAnswering(httpResponse(200, body));

    await expect(userInfo.claims(accessToken)).rejects.toThrow(
      new OAuthError('The user info endpoint returned an unexpected response.'),
    );
  });
});
