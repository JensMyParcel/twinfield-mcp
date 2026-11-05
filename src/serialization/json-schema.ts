import type { TypeReference } from '../catalog/catalog-types.js';

export type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Collects named definitions while a schema is built. Complex types become `$defs` entries,
 * so recursive types (a hierarchy node holds child nodes) terminate.
 */
export class SchemaContext {
  private readonly names = new Map<string, string>();
  private readonly definitions = new Map<string, JsonSchema>();

  reference(type: TypeReference, build: () => JsonSchema): JsonSchema {
    const key = `{${type.namespace}}${type.name}`;
    const known = this.names.get(key);
    if (known !== undefined) {
      return { $ref: `#/$defs/${known}` };
    }
    const name = this.uniqueName(type.name.replaceAll('.', '_'));
    this.names.set(key, name);
    this.definitions.set(name, {});
    this.definitions.set(name, build());

    return { $ref: `#/$defs/${name}` };
  }

  /** Wraps the root object schema with the definitions it refers to. */
  document(root: JsonSchema): JsonSchema {
    if (this.definitions.size === 0) {
      return root;
    }

    return { ...root, $defs: Object.fromEntries(this.definitions) };
  }

  private uniqueName(base: string): string {
    let candidate = base;
    for (let suffix = 2; this.definitions.has(candidate); suffix += 1) {
      candidate = `${base}${suffix}`;
    }

    return candidate;
  }
}
