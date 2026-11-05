import { describe, expect, it } from 'vitest';

import { LoginEndpoints } from '../../../src/auth/login-endpoints.js';
import { OAuthError } from '../../../src/auth/token-endpoint.js';
import { TokenValidator } from '../../../src/auth/token-validator.js';
import { AccessToken } from '../../../src/domain/access-token.js';
import { RecordingTransport, httpResponse, jsonResponse } from '../../support/io-http.js';

const accessToken = AccessToken.of('access+/=1');

function validatorAnswering(...responses: Parameters<typeof RecordingTransport.answering>) {
  const http = RecordingTransport.answering(...responses);

  return { http, validator: new TokenValidator(http) };
}

describe('TokenValidator', () => {
  it('sends the token in the query string of a GET without a body', async () => {
    const { http, validator } = validatorAnswering(
      jsonResponse({ 'twf.clusterUrl': 'https://api.accounting.twinfield.com' }),
    );

    await validator.cluster(accessToken);

    const request = http.only();
    expect(request.method).toBe('GET');
    expect(`${request.url.origin}${request.url.pathname}`).toBe(
      LoginEndpoints.accessTokenValidation.toString(),
    );
    expect(request.url.searchParams.get('token')).toBe('access+/=1');
    expect(request.headers).toEqual({ accept: 'application/json' });
    expect(request.body).toBeUndefined();
  });

  it('leaves the shared endpoint URL without the token', async () => {
    const { validator } = validatorAnswering(
      jsonResponse({ 'twf.clusterUrl': 'https://api.accounting.twinfield.com' }),
    );

    await validator.cluster(accessToken);

    expect(LoginEndpoints.accessTokenValidation.search).toBe('');
  });

  it('returns the cluster of the organisation', async () => {
    const { validator } = validatorAnswering(
      jsonResponse({ 'twf.clusterUrl': 'https://api.us.twinfield.com', sub: 'user' }),
    );

    const cluster = await validator.cluster(accessToken);

    expect(cluster.toString()).toBe('https://api.us.twinfield.com');
  });

  it.each([
    'https://api.example.com',
    'https://api.accounting.twinfield.com.example.org',
    'https://evil.com/?https://api.accounting.twinfield.com',
    'http://api.accounting.twinfield.com',
    'https://api.accounting.twinfield.com:8443',
    'https://user@api.accounting.twinfield.com',
    'https://api.accounting.twinfield.com/webservices',
    'not a url',
  ])('fails closed on the cluster URL %s', async (clusterUrl) => {
    const { validator } = validatorAnswering(jsonResponse({ 'twf.clusterUrl': clusterUrl }));

    await expect(validator.cluster(accessToken)).rejects.toThrow(/cluster/i);
  });

  it.each([400, 401, 500, 204])('rejects HTTP %i without showing the body', async (status) => {
    const { validator } = validatorAnswering(httpResponse(status, 'access+/=1 is bad'));

    const error = await validator.cluster(accessToken).catch((caught: unknown) => caught);

    expect(error).toEqual(new OAuthError(`Access token validation failed with HTTP ${status}.`));
  });

  it.each([
    ['no claim', JSON.stringify({ sub: 'user' })],
    ['an empty claim', JSON.stringify({ 'twf.clusterUrl': '' })],
    ['a claim that is not a string', JSON.stringify({ 'twf.clusterUrl': ['https://x'] })],
    ['a body that is not JSON', '<html></html>'],
  ])('rejects an answer with %s', async (_, body) => {
    const { validator } = validatorAnswering(httpResponse(200, body));

    await expect(validator.cluster(accessToken)).rejects.toThrow(
      new OAuthError('Access token validation returned no twf.clusterUrl claim.'),
    );
  });
});
