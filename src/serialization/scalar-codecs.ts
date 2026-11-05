import type {
  EnumerationTypeDescriptor,
  PrimitiveTypeDescriptor,
} from '../catalog/catalog-types.js';
import { XmlText } from '../xml/xml-element.js';
import { InvalidArgumentError } from './invalid-argument-error.js';
import type { JsonSchema } from './json-schema.js';
import { primitiveFormat, type PrimitiveFormat } from './primitive-format.js';
import type { ValueCodec, XmlContent } from './value-codec.js';

function textContent(text: string): XmlContent {
  return { attributes: [], children: [new XmlText(text)] };
}

/** A built-in XSD type, or a named restriction of one with an optional pattern. */
export class PrimitiveCodec implements ValueCodec {
  private readonly format: PrimitiveFormat;
  private readonly pattern: RegExp | undefined;

  constructor(primitive: string, pattern?: string) {
    this.format = primitiveFormat(primitive);
    this.pattern = pattern === undefined ? undefined : new RegExp(`^(?:${pattern})$`);
  }

  static of(descriptor: PrimitiveTypeDescriptor): PrimitiveCodec {
    return new PrimitiveCodec(descriptor.primitive, descriptor.pattern);
  }

  schema(): JsonSchema {
    const schema = this.format.schema();

    return this.pattern ? { ...schema, pattern: this.pattern.source } : schema;
  }

  content(value: unknown, path: string): XmlContent {
    const text = this.format.toText(value, path);
    if (this.pattern && !this.pattern.test(text)) {
      throw new InvalidArgumentError(path, `must match ${this.pattern.source}`);
    }

    return textContent(text);
  }
}

export class EnumerationCodec implements ValueCodec {
  constructor(private readonly descriptor: EnumerationTypeDescriptor) {}

  schema(): JsonSchema {
    return { type: 'string', enum: [...this.descriptor.values] };
  }

  content(value: unknown, path: string): XmlContent {
    if (typeof value !== 'string' || !this.descriptor.values.includes(value)) {
      throw new InvalidArgumentError(path, `must be one of ${this.descriptor.values.join(', ')}`);
    }

    return textContent(value);
  }
}
