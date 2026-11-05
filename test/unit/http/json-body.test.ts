import { describe, expect, it } from 'vitest';

import { parseJson } from '../../../src/http/json-body.js';

describe('parseJson', () => {
  it('returns the parsed value of a JSON body', () => {
    expect(parseJson('{"a":[1,"b",null]}')).toEqual({ a: [1, 'b', null] });
  });

  it.each([
    ['an empty body', ''],
    ['an HTML page', '<html><body>Bad gateway</body></html>'],
    ['truncated JSON', '{"access_token":"abc'],
    ['a form body', 'error=invalid_grant'],
  ])('returns undefined for %s, so a schema check rejects it', (_, body) => {
    expect(parseJson(body)).toBeUndefined();
  });
});
