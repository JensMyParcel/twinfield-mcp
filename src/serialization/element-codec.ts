import { Occurrence, type ElementDescriptor } from '../catalog/catalog-types.js';
import { QualifiedName, XmlNamespace } from '../xml/qualified-name.js';
import { XmlElement } from '../xml/xml-element.js';
import { InvalidArgumentError, childPath } from './invalid-argument-error.js';
import type { JsonSchema, SchemaContext } from './json-schema.js';
import type { ValueCodec } from './value-codec.js';

const NIL = { name: QualifiedName.of(XmlNamespace.xsi, 'nil'), value: 'true' } as const;

/** One element inside a sequence: its occurrence and nil rules around the codec of its type. */
export class ElementCodec {
  readonly qualifiedName: QualifiedName;

  constructor(
    readonly descriptor: ElementDescriptor,
    private readonly codec: () => ValueCodec,
  ) {
    this.qualifiedName = QualifiedName.of(descriptor.namespace, descriptor.name);
  }

  get name(): string {
    return this.descriptor.name;
  }

  get isRepeated(): boolean {
    return this.descriptor.maxOccurs === Occurrence.unbounded || this.descriptor.maxOccurs > 1;
  }

  /** A nillable element can always be written, as nil, so only a non-nillable one is required. */
  get isRequired(): boolean {
    return this.descriptor.minOccurs > 0 && !this.descriptor.nillable;
  }

  schema(context: SchemaContext): JsonSchema {
    const single = this.nullable(this.codec().schema(context));
    if (!this.isRepeated) {
      return single;
    }
    const maxItems =
      this.descriptor.maxOccurs === Occurrence.unbounded
        ? {}
        : { maxItems: this.descriptor.maxOccurs };

    return { type: 'array', items: single, minItems: this.descriptor.minOccurs, ...maxItems };
  }

  write(value: unknown, path: string): XmlElement[] {
    if (value === undefined) {
      return this.writeMissing(path);
    }
    if (!this.isRepeated) {
      return [this.writeOne(value, path)];
    }
    if (!Array.isArray(value)) {
      throw new InvalidArgumentError(path, 'must be an array');
    }
    this.assertCount(value.length, path);

    return value.map((item, index) => this.writeOne(item, childPath(path, index)));
  }

  writeOne(value: unknown, path: string): XmlElement {
    if (value === null) {
      if (!this.descriptor.nillable) {
        throw new InvalidArgumentError(path, 'must not be null');
      }

      return new XmlElement(this.qualifiedName, [NIL]);
    }
    const content = this.codec().content(value, path);

    return new XmlElement(this.qualifiedName, content.attributes, content.children);
  }

  private writeMissing(path: string): XmlElement[] {
    if (this.descriptor.minOccurs === 0) {
      return [];
    }
    if (this.descriptor.nillable) {
      return [new XmlElement(this.qualifiedName, [NIL])];
    }

    throw new InvalidArgumentError(path, 'is required');
  }

  private assertCount(count: number, path: string): void {
    const { minOccurs, maxOccurs } = this.descriptor;
    if (count < minOccurs || (maxOccurs !== Occurrence.unbounded && count > maxOccurs)) {
      throw new InvalidArgumentError(path, 'has the wrong number of items');
    }
  }

  private nullable(schema: JsonSchema): JsonSchema {
    return this.descriptor.nillable ? { anyOf: [schema, { type: 'null' }] } : schema;
  }
}
