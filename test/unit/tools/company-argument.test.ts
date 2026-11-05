import { describe, expect, it } from 'vitest';

import { CompanyCode } from '../../../src/domain/company-code.js';
import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import { CompanyArgument, withoutCompany } from '../../../src/tools/company-argument.js';

const DEFAULT = CompanyCode.parse('NL001');

describe('CompanyArgument', () => {
  it('describes the configured default company in its schema', () => {
    expect(new CompanyArgument(DEFAULT).schema()).toEqual({
      type: 'string',
      pattern: '^[A-Za-z0-9_-]{1,32}$',
      description:
        'Twinfield company (office) code. List them with process_xml_list {"type":"offices"}. Default: NL001.',
    });
  });

  it('names no default in its schema when none is configured', () => {
    expect(new CompanyArgument(undefined).schema()['description']).not.toContain('Default');
  });

  it('rejects a missing required company when no default is configured', () => {
    const resolve = () => new CompanyArgument(undefined).resolve(undefined, true);

    expect(resolve).toThrow(InvalidArgumentError);
    expect(resolve).toThrow('company: is required; no default company is configured');
  });

  it('falls back to the default for a missing required company', () => {
    expect(new CompanyArgument(DEFAULT).resolve(undefined, true)).toBe(DEFAULT);
  });

  it('returns no company for a missing optional company without a default', () => {
    expect(new CompanyArgument(undefined).resolve(undefined, false)).toBeUndefined();
  });

  it('prefers the given company over the default', () => {
    expect(new CompanyArgument(DEFAULT).resolve('BE002', true)?.value).toBe('BE002');
  });

  it.each([42, null, ['NL001'], { code: 'NL001' }])(
    'rejects the non-string company %j',
    (value) => {
      expect(() => new CompanyArgument(DEFAULT).resolve(value, true)).toThrow(
        'company: must be a string',
      );
    },
  );

  it.each(['', 'a'.repeat(33), 'NL 001', '../001', 'NL001\n'])(
    'rejects the malformed company code %j instead of using the default',
    (value) => {
      expect(() => new CompanyArgument(DEFAULT).resolve(value, false)).toThrow(
        'company: is not a valid company code',
      );
    },
  );

  it('puts the company first in the properties of an operation schema', () => {
    const extended = new CompanyArgument(undefined).extend({
      type: 'object',
      properties: { Code: { type: 'string' } },
      required: ['Code'],
    });

    expect(Object.keys(extended['properties'] as object)).toEqual(['company', 'Code']);
    expect(extended['required']).toEqual(['Code']);
  });

  it('adds the company to an operation schema without properties', () => {
    const extended = new CompanyArgument(undefined).extend({ type: 'object' });

    expect(Object.keys(extended['properties'] as object)).toEqual(['company']);
  });

  it('refuses an operation that has its own company argument', () => {
    expect(() =>
      new CompanyArgument(undefined).extend({
        type: 'object',
        properties: { company: { type: 'integer' } },
      }),
    ).toThrow('The operation already has a "company" argument.');
  });
});

describe('withoutCompany', () => {
  it('drops the company and keeps every other argument', () => {
    const args = { company: 'NL001', Code: 'BNK', Name: 'Main' };

    expect(withoutCompany(args)).toEqual({ Code: 'BNK', Name: 'Main' });
    expect(args).toHaveProperty('company', 'NL001');
  });
});
