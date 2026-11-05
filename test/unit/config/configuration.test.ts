import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { Configuration, ConfigurationError } from '../../../src/config/configuration.js';

const REQUIRED = { TWINFIELD_CLIENT_ID: 'client', TWINFIELD_CLIENT_SECRET: 'secret' };
const HOME = '/home/test';

const load = (env: Record<string, string>): Configuration =>
  Configuration.fromEnvironment(env, HOME);

const failure = (env: Record<string, string>): ConfigurationError => {
  try {
    load(env);
  } catch (error) {
    expect(error).toBeInstanceOf(ConfigurationError);

    return error as ConfigurationError;
  }

  throw new Error('The configuration was accepted.');
};

describe('Configuration', () => {
  it('uses the defaults when only the client is set', () => {
    const configuration = load(REQUIRED);

    expect(configuration.client.clientId).toBe('client');
    expect(configuration.client.basicAuthorization()).toBe(
      `Basic ${Buffer.from('client:secret').toString('base64')}`,
    );
    expect(configuration.refreshToken).toBeUndefined();
    expect(configuration.credentialsFile).toBe(
      join(HOME, '.config', 'twinfield-mcp', 'credentials.json'),
    );
    expect(configuration.defaultCompany).toBeUndefined();
    expect(configuration.redirectUri.toString()).toBe('http://localhost:8642/callback');
    expect(configuration.httpTimeoutMs).toBe(60_000);
  });

  it('reads every optional setting', () => {
    const configuration = load({
      ...REQUIRED,
      TWINFIELD_REFRESH_TOKEN: 'refresh-1',
      TWINFIELD_CREDENTIALS_FILE: '/etc/twinfield.json',
      TWINFIELD_COMPANY: 'NLA001234',
      TWINFIELD_REDIRECT_URI: 'http://127.0.0.1:9000/done',
      TWINFIELD_HTTP_TIMEOUT_MS: '5000',
    });

    expect(configuration.refreshToken?.reveal()).toBe('refresh-1');
    expect(configuration.credentialsFile).toBe('/etc/twinfield.json');
    expect(configuration.defaultCompany?.value).toBe('NLA001234');
    expect(configuration.redirectUri.toString()).toBe('http://127.0.0.1:9000/done');
    expect(configuration.httpTimeoutMs).toBe(5_000);
  });

  it('ignores variables it does not know', () => {
    expect(() => load({ ...REQUIRED, PATH: '/usr/bin', TWINFIELD_OTHER: 'x' })).not.toThrow();
  });

  it.each([
    ['TWINFIELD_CLIENT_ID', { TWINFIELD_CLIENT_SECRET: 'secret' }],
    ['TWINFIELD_CLIENT_SECRET', { TWINFIELD_CLIENT_ID: 'client' }],
  ])('stops and names %s when it is missing', (name, env) => {
    expect(failure(env).message).toBe(`${name} is required`);
  });

  it.each(['TWINFIELD_CLIENT_ID', 'TWINFIELD_CLIENT_SECRET'])(
    'names %s when it is empty',
    (name) => {
      expect(failure({ ...REQUIRED, [name]: '' }).message).toBe(`${name} is required`);
    },
  );

  it('reports every invalid variable at once', () => {
    expect(failure({ TWINFIELD_CLIENT_ID: '', TWINFIELD_CLIENT_SECRET: '' }).message).toBe(
      'TWINFIELD_CLIENT_ID is required; TWINFIELD_CLIENT_SECRET is required',
    );
  });

  it('rejects a client secret with white space without showing it', () => {
    const error = failure({ ...REQUIRED, TWINFIELD_CLIENT_SECRET: 'sec ret' });

    expect(error.message).toBe('The client secret must be a non-empty string without white space.');
  });

  it('rejects a client id with white space', () => {
    expect(failure({ ...REQUIRED, TWINFIELD_CLIENT_ID: 'cli ent' }).message).toContain(
      'The client id',
    );
  });

  it.each(['', 'refresh 1'])('rejects the refresh token %j', (token) => {
    expect(failure({ ...REQUIRED, TWINFIELD_REFRESH_TOKEN: token })).toBeInstanceOf(
      ConfigurationError,
    );
  });

  it.each(['', '00 1', 'a'.repeat(33), '001;DROP', 'ÄBC'])('rejects the company %j', (company) => {
    expect(failure({ ...REQUIRED, TWINFIELD_COMPANY: company })).toBeInstanceOf(ConfigurationError);
  });

  it.each([
    'http://localhost:8642/callback',
    'http://127.0.0.1:1/',
    'http://[::1]:8642/callback',
    'http://LOCALHOST:8642/callback',
  ])('accepts the loopback redirect URI %s', (uri) => {
    expect(load({ ...REQUIRED, TWINFIELD_REDIRECT_URI: uri }).redirectUri.toString()).toBe(
      new URL(uri).toString(),
    );
  });

  it.each([
    ['https on loopback', 'https://localhost:8642/callback'],
    ['a public host', 'http://example.com:8642/callback'],
    ['a host that starts with localhost', 'http://localhost.example.com:8642/callback'],
    ['a LAN address', 'http://192.168.1.10:8642/callback'],
    ['the any address', 'http://0.0.0.0:8642/callback'],
    ['no port', 'http://localhost/callback'],
    ['the default port, which URL drops', 'http://localhost:80/callback'],
    ['a value that is not a URL', 'localhost:8642'],
    ['an empty value', ''],
  ])('rejects a redirect URI with %s', (_, uri) => {
    expect(failure({ ...REQUIRED, TWINFIELD_REDIRECT_URI: uri })).toBeInstanceOf(
      ConfigurationError,
    );
  });

  it('explains the redirect URI rule', () => {
    expect(failure({ ...REQUIRED, TWINFIELD_REDIRECT_URI: 'http://example.com:1/x' }).message).toBe(
      'TWINFIELD_REDIRECT_URI must be http://localhost:<port>/<path>.',
    );
  });

  it.each([
    ['1000', 1_000],
    ['600000', 600_000],
  ])('accepts the timeout bound %s', (value, expected) => {
    expect(load({ ...REQUIRED, TWINFIELD_HTTP_TIMEOUT_MS: value }).httpTimeoutMs).toBe(expected);
  });

  it.each(['999', '600001', '0', '-1000', '1500.5', 'abc', '', 'Infinity'])(
    'rejects the timeout %j',
    (value) => {
      expect(failure({ ...REQUIRED, TWINFIELD_HTTP_TIMEOUT_MS: value })).toBeInstanceOf(
        ConfigurationError,
      );
    },
  );
});
