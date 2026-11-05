import { describe, expect, it } from 'vitest';

import { CompanyCode } from '../../../src/domain/company-code.js';

describe('CompanyCode', () => {
  it.each(['0', '001', 'NLA001234', 'a_b-c', 'X'.repeat(32)])('accepts %j', (value) => {
    const code = CompanyCode.parse(value);

    expect(code.value).toBe(value);
    expect(code.toString()).toBe(value);
    expect(String(code)).toBe(value);
  });

  it.each(['', 'X'.repeat(33), '00 1', ' 001', '001\n', '001.2', 'a/b', '<x>', 'é01', '../etc'])(
    'rejects %j',
    (value) => {
      expect(() => CompanyCode.parse(value)).toThrow(
        `Invalid company code: ${JSON.stringify(value)}`,
      );
    },
  );
});
