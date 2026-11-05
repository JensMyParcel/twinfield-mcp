import { format, inspect } from 'node:util';

import { describe, expect, it } from 'vitest';

import { AccessToken } from '../../../src/domain/access-token.js';

const SECRET = 'eyJhbGciOi.secret-token-value';

describe('AccessToken', () => {
  it('reveals its value only through reveal()', () => {
    expect(AccessToken.of(SECRET).reveal()).toBe(SECRET);
  });

  it.each(['', ' ', '\t', 'a b', 'abc\n', ' abc', 'abc def'])('rejects %j', (value) => {
    expect(() => AccessToken.of(value)).toThrow(
      'An access token must be a non-empty string without white space.',
    );
  });

  it('does not show its value in the rejection of an invalid token', () => {
    const attempt = () => AccessToken.of(`${SECRET} x`);

    expect(attempt).toThrow('An access token must be');
    expect(attempt).not.toThrow(SECRET);
  });

  it('hides its value in toString, string conversion and JSON', () => {
    const token = AccessToken.of(SECRET);
    const shown = [
      token.toString(),
      String(token),
      JSON.stringify(token),
      JSON.stringify({ token }),
    ];

    expect(shown.join(' ')).not.toContain(SECRET);
    expect(token.toString()).toBe('AccessToken(redacted)');
    expect(JSON.stringify({ token })).toBe('{"token":"AccessToken(redacted)"}');
  });

  it('hides its value from util.inspect, console.log formatting and own property listings', () => {
    const token = AccessToken.of(SECRET);
    const shown = [
      inspect(token),
      inspect({ token }, { showHidden: true, depth: 5 }),
      format('%o %O %s', token, token, token),
      JSON.stringify(Object.entries(token)),
      Object.getOwnPropertyNames(token).join(),
    ].join(' ');

    expect(shown).not.toContain(SECRET);
    expect(inspect(token)).toBe('AccessToken(redacted)');
  });
});
