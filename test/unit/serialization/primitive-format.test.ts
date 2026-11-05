import { describe, expect, it } from 'vitest';

import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import { PRIMITIVE_FORMATS, primitiveFormat } from '../../../src/serialization/primitive-format.js';

const INT32_MAX = 2_147_483_647;
const INT32_MIN = -2_147_483_648;

function text(format: string, value: unknown): string {
  return primitiveFormat(format).toText(value, 'body.value');
}

describe('primitiveFormat', () => {
  it('has a format for every XSD type the catalog uses', () => {
    expect([...PRIMITIVE_FORMATS.keys()].sort()).toEqual(
      ['boolean', 'dateTime', 'decimal', 'int', 'long', 'short', 'string'].sort(),
    );
  });

  it('rejects an XSD type without a JSON format', () => {
    expect(() => primitiveFormat('base64Binary')).toThrow(
      'No JSON format for the XSD type "base64Binary".',
    );
  });

  it.each(['toString', '__proto__', 'constructor', 'hasOwnProperty', 'valueOf', ''])(
    'rejects the name %j, which is no XSD type, even when it is an object property',
    (name) => {
      expect(() => primitiveFormat(name)).toThrow(`No JSON format for the XSD type "${name}".`);
    },
  );

  it('reports the argument path in every rejection', () => {
    expect(() => text('string', 1)).toThrow(
      new InvalidArgumentError('body.value', 'must be a string'),
    );
  });
});

describe('string format', () => {
  it('passes strings through unchanged, the empty string too', () => {
    expect(text('string', 'a & b')).toBe('a & b');
    expect(text('string', '')).toBe('');
  });

  it.each([1, true, null, undefined, {}, ['a']])('rejects %j', (value) => {
    expect(() => text('string', value)).toThrow('body.value: must be a string');
  });

  it('describes itself as a JSON string', () => {
    expect(primitiveFormat('string').schema()).toEqual({ type: 'string' });
  });
});

describe('integer formats', () => {
  it.each([
    ['int', INT32_MIN, INT32_MAX],
    ['short', -32_768, 32_767],
    ['long', Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  ])('%s accepts its exact limits and publishes them in the schema', (format, minimum, maximum) => {
    expect(text(format, minimum)).toBe(String(minimum));
    expect(text(format, maximum)).toBe(String(maximum));
    expect(primitiveFormat(format).schema()).toEqual({ type: 'integer', minimum, maximum });
  });

  it.each([
    ['int', INT32_MIN - 1, `must be between ${INT32_MIN} and ${INT32_MAX}`],
    ['int', INT32_MAX + 1, `must be between ${INT32_MIN} and ${INT32_MAX}`],
    ['short', -32_769, 'must be between -32768 and 32767'],
    ['short', 32_768, 'must be between -32768 and 32767'],
    ['long', Number.MIN_SAFE_INTEGER - 1, 'must be an integer'],
    ['long', Number.MAX_SAFE_INTEGER + 1, 'must be an integer'],
  ])('%s rejects %d, one past its limit', (format, value, reason) => {
    expect(() => text(format, value)).toThrow(`body.value: ${reason}`);
  });

  it.each([1.5, '1', Number.NaN, Number.POSITIVE_INFINITY, null, true, 10n])(
    'rejects the non-integer %s',
    (value) => {
      expect(() => text('int', value)).toThrow('body.value: must be an integer');
    },
  );

  it('accepts zero and writes negative zero as 0', () => {
    expect(text('int', 0)).toBe('0');
    expect(text('int', -0)).toBe('0');
  });
});

describe('decimal format', () => {
  it.each([
    [12.5, '12.5'],
    [-3, '-3'],
    [0, '0'],
  ])('writes the number %d as %j', (value, expected) => {
    expect(text('decimal', value)).toBe(expected);
  });

  it.each([
    [1e21, '1000000000000000000000'],
    [1e-7, '0.0000001'],
    [-1e-7, '-0.0000001'],
    [123456789.123, '123456789.123'],
    [0.1, '0.1'],
    [Number.MAX_SAFE_INTEGER, '9007199254740991'],
  ])('writes the number %d without an exponent, as %j', (value, expected) => {
    expect(text('decimal', value)).toBe(expected);
    expect(Number(text('decimal', value))).toBe(value);
  });

  it('writes the largest double in full', () => {
    const written = text('decimal', Number.MAX_VALUE);

    expect(written).toMatch(/^\d{309}$/);
    expect(Number(written)).toBe(Number.MAX_VALUE);
  });

  it.each([5e-324, -5e-324, 1e-101])(
    'rejects the number %d, whose plain text would round to another value',
    (value) => {
      expect(() => text('decimal', value)).toThrow(
        'body.value: cannot be written exactly; pass it as a decimal string',
      );
    },
  );

  it.each(['1234.56', '-0.5', '10', '0', '12345678901234567890.123456789'])(
    'keeps the decimal string %j digit for digit',
    (value) => {
      expect(text('decimal', value)).toBe(value);
    },
  );

  it.each(['', '1.', '.5', '+1', '1e3', ' 1', '1 ', '1,5', '--1', 'NaN', '0x10'])(
    'rejects the string %j',
    (value) => {
      expect(() => text('decimal', value)).toThrow(
        'body.value: must be a finite number or a decimal string',
      );
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, null, true, {}])(
    'rejects %s',
    (value) => {
      expect(() => text('decimal', value)).toThrow('must be a finite number or a decimal string');
    },
  );

  it('publishes a schema that accepts a number or a decimal string', () => {
    expect(primitiveFormat('decimal').schema()).toMatchObject({
      anyOf: [{ type: 'number' }, { type: 'string', pattern: '^-?\\d+(\\.\\d+)?$' }],
    });
  });
});

describe('boolean format', () => {
  it('writes true and false', () => {
    expect(text('boolean', true)).toBe('true');
    expect(text('boolean', false)).toBe('false');
  });

  it.each(['true', 1, 0, null])('rejects %j', (value) => {
    expect(() => text('boolean', value)).toThrow('body.value: must be a boolean');
  });

  it('describes itself as a JSON boolean', () => {
    expect(primitiveFormat('boolean').schema()).toEqual({ type: 'boolean' });
  });
});

describe('dateTime format', () => {
  it('turns a date into midnight without a time zone', () => {
    expect(text('dateTime', '2026-01-31')).toBe('2026-01-31T00:00:00');
  });

  it.each([
    '2026-01-31T13:45',
    '2026-01-31T13:45:00',
    '2026-01-31T13:45:00Z',
    '2026-01-31T13:45:00.1234567',
    '2026-01-31T13:45:00.5+01:00',
    '2026-12-31T23:59:59-23:59',
    '2028-02-29T00:00:00Z',
  ])('passes the date-time %j through unchanged', (value) => {
    expect(text('dateTime', value)).toBe(value);
  });

  it.each(['2024-02-29', '2000-02-29', '2026-04-30', '2026-12-31', '2024-02-29T23:59:59Z'])(
    'accepts the calendar day in %j',
    (value) => {
      expect(text('dateTime', value)).toContain(value);
    },
  );

  it.each([
    '2026-02-30',
    '2026-02-31',
    '2026-04-31',
    '2026-06-31',
    '2026-09-31',
    '2026-11-31',
    '2025-02-29',
    '1900-02-29',
    '2026-02-30T10:00:00Z',
  ])('rejects %j, a day the month does not have', (value) => {
    expect(() => text('dateTime', value)).toThrow(
      'body.value: must be an ISO 8601 date or date-time',
    );
  });

  it.each([
    '2026-13-01',
    '2026-00-10',
    '2026-01-00',
    '2026-01-32',
    '2026-1-31',
    '26-01-31',
    '31-01-2026',
    '2026-01-31T24:00',
    '2026-01-31T13:60',
    '2026-01-31T13:45:60',
    '2026-01-31T13',
    '2026-01-31T',
    '2026-01-31 13:45',
    '2026-01-31T13:45:00.12345678',
    '2026-01-31T13:45:00+24:00',
    '2026-01-31T13:45:00+0100',
    '2026-01-31Z',
    '',
  ])('rejects %j', (value) => {
    expect(() => text('dateTime', value)).toThrow(
      'body.value: must be an ISO 8601 date or date-time',
    );
  });

  it.each([0, new Date('2026-01-31T00:00:00Z'), null])('rejects the non-string %s', (value) => {
    expect(() => text('dateTime', value)).toThrow('must be an ISO 8601 date or date-time');
  });

  it('publishes the same pattern it enforces', () => {
    const schema = primitiveFormat('dateTime').schema();
    const pattern = new RegExp(schema['pattern'] as string);

    expect(schema['type']).toBe('string');
    expect(pattern.test('2026-01-31T13:45:00Z')).toBe(true);
    expect(pattern.test('2026-01-31T24:00')).toBe(false);
  });
});
