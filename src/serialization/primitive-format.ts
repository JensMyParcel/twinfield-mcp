import { InvalidArgumentError } from './invalid-argument-error.js';
import type { JsonSchema } from './json-schema.js';

/** How one built-in XSD type looks in JSON and how it is written as XML text. */
export interface PrimitiveFormat {
  schema(): JsonSchema;
  toText(value: unknown, path: string): string;
}

class StringFormat implements PrimitiveFormat {
  schema(): JsonSchema {
    return { type: 'string' };
  }

  toText(value: unknown, path: string): string {
    if (typeof value !== 'string') {
      throw new InvalidArgumentError(path, 'must be a string');
    }

    return value;
  }
}

class IntegerFormat implements PrimitiveFormat {
  constructor(
    private readonly minimum: number,
    private readonly maximum: number,
  ) {}

  schema(): JsonSchema {
    return { type: 'integer', minimum: this.minimum, maximum: this.maximum };
  }

  toText(value: unknown, path: string): string {
    if (!Number.isSafeInteger(value)) {
      throw new InvalidArgumentError(path, 'must be an integer');
    }
    const integer = value as number;
    if (integer < this.minimum || integer > this.maximum) {
      throw new InvalidArgumentError(path, `must be between ${this.minimum} and ${this.maximum}`);
    }

    return String(integer);
  }
}

const DECIMAL = /^-?\d+(\.\d+)?$/;

/** Accepts a decimal string as well, so amounts keep every digit. */
class DecimalFormat implements PrimitiveFormat {
  schema(): JsonSchema {
    return {
      anyOf: [{ type: 'number' }, { type: 'string', pattern: DECIMAL.source }],
      description: 'A number, or a decimal string such as "1234.56" to keep every digit.',
    };
  }

  toText(value: unknown, path: string): string {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return plainDecimal(value, path);
    }
    if (typeof value === 'string' && DECIMAL.test(value)) {
      return value;
    }

    throw new InvalidArgumentError(path, 'must be a finite number or a decimal string');
  }
}

/** xs:decimal has no exponent, so 1e21 is written in full; a value that would round fails. */
function plainDecimal(value: number, path: string): string {
  const text = value.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 100 });
  if (Number(text) !== value) {
    throw new InvalidArgumentError(path, 'cannot be written exactly; pass it as a decimal string');
  }

  return text;
}

class BooleanFormat implements PrimitiveFormat {
  schema(): JsonSchema {
    return { type: 'boolean' };
  }

  toText(value: unknown, path: string): string {
    if (typeof value !== 'boolean') {
      throw new InvalidArgumentError(path, 'must be a boolean');
    }

    return String(value);
  }
}

const DATE_TIME =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d{1,7})?)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)?)?$/;

class DateTimeFormat implements PrimitiveFormat {
  schema(): JsonSchema {
    return {
      type: 'string',
      pattern: DATE_TIME.source,
      description: 'ISO 8601 date or date-time, such as 2026-01-31 or 2026-01-31T13:45:00Z.',
    };
  }

  toText(value: unknown, path: string): string {
    if (typeof value !== 'string' || !DATE_TIME.test(value) || !isCalendarDate(value)) {
      throw new InvalidArgumentError(path, 'must be an ISO 8601 date or date-time');
    }

    return value.length === 10 ? `${value}T00:00:00` : value;
  }
}

/** The regex allows day 31 in every month; this rejects days a month does not have. */
function isCalendarDate(value: string): boolean {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const INT32 = 2_147_483_647;

export const PRIMITIVE_FORMATS: ReadonlyMap<string, PrimitiveFormat> = new Map<
  string,
  PrimitiveFormat
>([
  ['string', new StringFormat()],
  ['int', new IntegerFormat(-INT32 - 1, INT32)],
  ['long', new IntegerFormat(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)],
  ['short', new IntegerFormat(-32_768, 32_767)],
  ['decimal', new DecimalFormat()],
  ['boolean', new BooleanFormat()],
  ['dateTime', new DateTimeFormat()],
]);

export function primitiveFormat(name: string): PrimitiveFormat {
  const format = PRIMITIVE_FORMATS.get(name);
  if (format === undefined) {
    throw new Error(`No JSON format for the XSD type "${name}".`);
  }

  return format;
}
