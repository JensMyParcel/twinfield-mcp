import type { TypeReference } from '../catalog/catalog-types.js';
import { InvalidArgumentError, childPath, isPlainObject } from './invalid-argument-error.js';
import type { ElementCodec } from './element-codec.js';
import type { JsonSchema, SchemaContext } from './json-schema.js';
import type { ValueCodec, XmlContent } from './value-codec.js';

/** A sequence of named elements, written in schema order. Unknown properties are rejected. */
export class ComplexCodec implements ValueCodec {
  constructor(
    private readonly reference: TypeReference,
    private readonly elements: () => readonly ElementCodec[],
  ) {}

  schema(context: SchemaContext): JsonSchema {
    return context.reference(this.reference, () => this.objectSchema(context));
  }

  objectSchema(context: SchemaContext): JsonSchema {
    const elements = this.elements();
    const required = elements
      .filter((element) => element.isRequired)
      .map((element) => element.name);

    return {
      type: 'object',
      properties: Object.fromEntries(
        elements.map((element) => [element.name, element.schema(context)]),
      ),
      ...(required.length > 0 ? { required } : {}),
      additionalProperties: false,
    };
  }

  content(value: unknown, path: string): XmlContent {
    if (!isPlainObject(value)) {
      throw new InvalidArgumentError(path, 'must be an object');
    }
    const elements = this.elements();
    const known = new Set(elements.map((element) => element.name));
    const unknown = Object.keys(value).find((key) => !known.has(key));
    if (unknown !== undefined) {
      throw new InvalidArgumentError(childPath(path, unknown), 'is not a known property');
    }

    return {
      attributes: [],
      children: elements.flatMap((element) =>
        element.write(value[element.name], childPath(path, element.name)),
      ),
    };
  }
}

/**
 * An `ArrayOfX` wrapper type: one repeated element and nothing else. In JSON it is a plain
 * array, so callers write `["a", "b"]` instead of `{ "string": ["a", "b"] }`.
 */
export class ArrayCodec implements ValueCodec {
  constructor(private readonly item: () => ElementCodec) {}

  schema(context: SchemaContext): JsonSchema {
    return this.item().schema(context);
  }

  content(value: unknown, path: string): XmlContent {
    return { attributes: [], children: this.item().write(value, path) };
  }
}
