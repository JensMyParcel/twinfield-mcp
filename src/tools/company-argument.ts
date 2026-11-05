import { CompanyCode } from '../domain/company-code.js';
import { InvalidArgumentError } from '../serialization/invalid-argument-error.js';
import type { JsonSchema } from '../serialization/json-schema.js';

export const COMPANY_PROPERTY = 'company';

/** The `company` argument every company-scoped tool takes, with an optional configured default. */
export class CompanyArgument {
  constructor(private readonly fallback: CompanyCode | undefined) {}

  schema(): JsonSchema {
    const suffix = this.fallback ? ` Default: ${this.fallback.value}.` : '';

    return {
      type: 'string',
      pattern: '^[A-Za-z0-9_-]{1,32}$',
      description: `Twinfield company (office) code. List them with process_xml_list {"type":"offices"}.${suffix}`,
    };
  }

  /** The company to use. A required company that is neither given nor configured is an error. */
  resolve(value: unknown, required: boolean): CompanyCode | undefined {
    if (value === undefined) {
      if (required && this.fallback === undefined) {
        throw new InvalidArgumentError(
          COMPANY_PROPERTY,
          'is required; no default company is configured',
        );
      }

      return this.fallback;
    }
    if (typeof value !== 'string') {
      throw new InvalidArgumentError(COMPANY_PROPERTY, 'must be a string');
    }
    try {
      return CompanyCode.parse(value);
    } catch {
      throw new InvalidArgumentError(COMPANY_PROPERTY, 'is not a valid company code');
    }
  }

  /** Adds the `company` property to an operation's own object schema. */
  extend(schema: JsonSchema): JsonSchema {
    const properties = (schema['properties'] ?? {}) as Record<string, JsonSchema>;
    if (COMPANY_PROPERTY in properties) {
      throw new Error(`The operation already has a "${COMPANY_PROPERTY}" argument.`);
    }

    return { ...schema, properties: { [COMPANY_PROPERTY]: this.schema(), ...properties } };
  }
}

/** Splits the `company` argument off the arguments that go to Twinfield. */
export function withoutCompany(args: Readonly<Record<string, unknown>>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(args).filter(([key]) => key !== COMPANY_PROPERTY));
}
