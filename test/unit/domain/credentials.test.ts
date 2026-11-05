import { format, inspect } from 'node:util';

import { describe, expect, it } from 'vitest';

import { ClientCredentials, RefreshToken } from '../../../src/domain/credentials.js';

const REFRESH = 'refresh-secret-value';
const CLIENT_SECRET = 'client-secret-value';

describe('RefreshToken', () => {
  it('reveals its value only through reveal()', () => {
    expect(RefreshToken.of(REFRESH).reveal()).toBe(REFRESH);
  });

  it.each(['', '  ', 'a b', 'a\nb', '\tab'])('rejects %j', (value) => {
    expect(() => RefreshToken.of(value)).toThrow(
      'A refresh token must be a non-empty string without white space.',
    );
  });

  it('compares by value', () => {
    expect(RefreshToken.of(REFRESH).equals(RefreshToken.of(REFRESH))).toBe(true);
    expect(RefreshToken.of(REFRESH).equals(RefreshToken.of(`${REFRESH}2`))).toBe(false);
  });

  it('hides its value in toString, string conversion and JSON', () => {
    const token = RefreshToken.of(REFRESH);
    const shown = [token.toString(), String(token), JSON.stringify({ token })].join(' ');

    expect(shown).not.toContain(REFRESH);
    expect(JSON.stringify(token)).toBe('"RefreshToken(redacted)"');
  });

  it('hides its value from util.inspect, console.log formatting and own property listings', () => {
    const token = RefreshToken.of(REFRESH);
    const shown = [
      inspect(token),
      inspect({ token }, { showHidden: true, depth: 5 }),
      format('%o %O %s', token, token, token),
      JSON.stringify(Object.entries(token)),
      Object.getOwnPropertyNames(token).join(),
    ].join(' ');

    expect(shown).not.toContain(REFRESH);
    expect(inspect(token)).toBe('RefreshToken(redacted)');
  });
});

describe('ClientCredentials', () => {
  it('builds the Basic authorization header from id and secret', () => {
    const credentials = ClientCredentials.of('client', CLIENT_SECRET);
    const encoded = Buffer.from(`client:${CLIENT_SECRET}`).toString('base64');

    expect(credentials.basicAuthorization()).toBe(`Basic ${encoded}`);
    expect(credentials.clientId).toBe('client');
  });

  it('encodes non-ASCII characters as UTF-8', () => {
    const header = ClientCredentials.of('clïent', 'sécret').basicAuthorization();

    expect(Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8')).toBe(
      'clïent:sécret',
    );
  });

  it.each([
    ['', CLIENT_SECRET, 'The client id must be a non-empty string without white space.'],
    ['a b', CLIENT_SECRET, 'The client id must be a non-empty string without white space.'],
    ['client', '', 'The client secret must be a non-empty string without white space.'],
    ['client', 'a\tb', 'The client secret must be a non-empty string without white space.'],
  ])('rejects id %j with secret %j', (clientId, clientSecret, message) => {
    expect(() => ClientCredentials.of(clientId, clientSecret)).toThrow(message);
  });

  it('shows the client id but hides the secret in toString, string conversion and JSON', () => {
    const credentials = ClientCredentials.of('client', CLIENT_SECRET);
    const shown = [
      credentials.toString(),
      String(credentials),
      JSON.stringify({ credentials }),
    ].join(' ');

    expect(shown).not.toContain(CLIENT_SECRET);
    expect(credentials.toString()).toBe('ClientCredentials(client, secret redacted)');
    expect(JSON.stringify(credentials)).toBe('"ClientCredentials(client, secret redacted)"');
  });

  it('hides the secret from util.inspect, console.log formatting and own property listings', () => {
    const token = ClientCredentials.of('client', CLIENT_SECRET);
    const shown = [
      inspect(token),
      inspect({ token }, { showHidden: true, depth: 5 }),
      format('%o %O %s', token, token, token),
      JSON.stringify(Object.entries(token)),
      Object.getOwnPropertyNames(token).join(),
    ].join(' ');

    expect(shown).not.toContain(CLIENT_SECRET);
    expect(inspect(token)).toBe('ClientCredentials(client, secret redacted)');
  });
});
