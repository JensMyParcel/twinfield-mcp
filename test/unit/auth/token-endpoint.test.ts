import { describe, expect, it } from 'vitest';

import { LoginEndpoints } from '../../../src/auth/login-endpoints.js';
import { OAuthError, TokenEndpoint } from '../../../src/auth/token-endpoint.js';
import { ClientCredentials, RefreshToken } from '../../../src/domain/credentials.js';
import { FakeClock } from '../../support/fake-twinfield.js';
import { RecordingTransport, httpResponse, jsonResponse } from '../../support/io-http.js';

const SECRET = 'very-secret-value';
const GRANT = { access_token: 'access-1', expires_in: 3600, refresh_token: 'refresh-2' };

function endpointAnswering(...responses: Parameters<typeof RecordingTransport.answering>) {
  const http = RecordingTransport.answering(...responses);
  const clock = new FakeClock();
  const tokens = new TokenEndpoint(http, ClientCredentials.of('client-id', SECRET), clock);

  return { http, clock, tokens };
}

const refreshToken = RefreshToken.of('refresh-1');

describe('TokenEndpoint', () => {
  it('posts the refresh grant as a form with Basic client authentication', async () => {
    const { http, tokens } = endpointAnswering(jsonResponse(GRANT));

    await tokens.refresh(refreshToken);

    const request = http.only();
    expect(request.method).toBe('POST');
    expect(request.url.toString()).toBe(LoginEndpoints.token.toString());
    expect(request.headers).toEqual({
      authorization: `Basic ${Buffer.from(`client-id:${SECRET}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    });
    expect(Object.fromEntries(new URLSearchParams(request.body))).toEqual({
      grant_type: 'refresh_token',
      refresh_token: 'refresh-1',
    });
  });

  it('posts the authorization code grant with the redirect URI', async () => {
    const { http, tokens } = endpointAnswering(jsonResponse(GRANT));

    await tokens.exchangeCode('code+/=1', new URL('http://localhost:8642/callback'));

    expect(Object.fromEntries(new URLSearchParams(http.only().body))).toEqual({
      grant_type: 'authorization_code',
      code: 'code+/=1',
      redirect_uri: 'http://localhost:8642/callback',
    });
  });

  it('returns the access token, its expiry from the clock and the rotated refresh token', async () => {
    const { clock, tokens } = endpointAnswering(jsonResponse(GRANT));

    const grant = await tokens.refresh(refreshToken);

    expect(grant.accessToken.reveal()).toBe('access-1');
    expect(grant.expiresAt.getTime()).toBe(clock.now().getTime() + 3_600_000);
    expect(grant.refreshToken?.reveal()).toBe('refresh-2');
  });

  it('returns a grant without a refresh token when Twinfield sends none', async () => {
    const { tokens } = endpointAnswering(jsonResponse({ access_token: 'access-1', expires_in: 1 }));

    const grant = await tokens.refresh(refreshToken);

    expect('refreshToken' in grant).toBe(false);
  });

  it('shows only the OAuth error code of a refused request', async () => {
    const { tokens } = endpointAnswering(
      jsonResponse(
        { error: 'invalid_grant', error_description: `client ${SECRET} token refresh-1` },
        400,
      ),
    );

    const error = await tokens.refresh(refreshToken).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(OAuthError);
    expect((error as OAuthError).message).toBe(
      'The token endpoint refused the request: invalid_grant.',
    );
  });

  it.each([
    ['an HTML page', httpResponse(502, `<html>${SECRET}</html>`)],
    ['an error code that is not a plain OAuth code', jsonResponse({ error: `bad ${SECRET}` }, 400)],
    ['an error code longer than 100 characters', jsonResponse({ error: 'a'.repeat(101) }, 400)],
    ['an error that is not a string', jsonResponse({ error: { secret: SECRET } }, 401)],
    ['an empty body', httpResponse(500, '')],
  ])('hides the body of a refused request with %s', async (_, response) => {
    const { tokens } = endpointAnswering(response);

    const error = await tokens.refresh(refreshToken).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(OAuthError);
    expect((error as OAuthError).message).toBe(
      'The token endpoint refused the request: unknown error.',
    );
  });

  it('treats a non-200 success code as refused', async () => {
    const { tokens } = endpointAnswering(jsonResponse(GRANT, 201));

    await expect(tokens.refresh(refreshToken)).rejects.toThrow('refused the request');
  });

  it.each([
    ['a body that is not JSON', 'access_token=access-1'],
    ['JSON null', 'null'],
    ['no access token', JSON.stringify({ expires_in: 3600 })],
    ['an empty access token', JSON.stringify({ access_token: '', expires_in: 3600 })],
    ['no expiry', JSON.stringify({ access_token: 'a' })],
    ['an expiry of zero', JSON.stringify({ access_token: 'a', expires_in: 0 })],
    ['a negative expiry', JSON.stringify({ access_token: 'a', expires_in: -60 })],
    ['a fractional expiry', JSON.stringify({ access_token: 'a', expires_in: 1.5 })],
    ['an expiry as a string', JSON.stringify({ access_token: 'a', expires_in: '3600' })],
    ['an empty refresh token', JSON.stringify({ ...GRANT, refresh_token: '' })],
  ])('rejects a 200 answer with %s', async (_, body) => {
    const { tokens } = endpointAnswering(httpResponse(200, body));

    await expect(tokens.refresh(refreshToken)).rejects.toThrow(
      new OAuthError('The token endpoint returned an unexpected response.'),
    );
  });

  it('rejects an access token with white space without showing it', async () => {
    const { tokens } = endpointAnswering(jsonResponse({ ...GRANT, access_token: 'acc ess' }));

    const error = await tokens.refresh(refreshToken).catch((caught: unknown) => caught);

    expect((error as Error).message).not.toContain('acc ess');
  });

  it('passes a transport failure through', async () => {
    const failure = new Error('connection reset');
    const tokens = new TokenEndpoint(
      new RecordingTransport(() => Promise.reject(failure)),
      ClientCredentials.of('client-id', SECRET),
      new FakeClock(),
    );

    await expect(tokens.refresh(refreshToken)).rejects.toBe(failure);
  });
});
