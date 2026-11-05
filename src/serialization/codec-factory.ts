import {
  Occurrence,
  TypeKind,
  type ComplexTypeDescriptor,
  type ElementDescriptor,
  type TypeDescriptor,
  type TypeReference,
} from '../catalog/catalog-types.js';
import { XmlNamespace } from '../xml/qualified-name.js';
import { ElementCodec } from './element-codec.js';
import { EnumerationCodec, PrimitiveCodec } from './scalar-codecs.js';
import { ArrayCodec, ComplexCodec } from './structured-codecs.js';
import type { ValueCodec } from './value-codec.js';

const keyOf = (reference: TypeReference): string => `{${reference.namespace}}${reference.name}`;

/** Builds and caches one codec per catalog type. Lookups are lazy, so recursive types work. */
export class CodecFactory {
  private readonly types: ReadonlyMap<string, TypeDescriptor>;
  private readonly codecs = new Map<string, ValueCodec>();

  constructor(types: readonly TypeDescriptor[]) {
    this.types = new Map(types.map((type) => [keyOf(type.reference), type]));
  }

  codec(reference: TypeReference): ValueCodec {
    const key = keyOf(reference);
    const cached = this.codecs.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const codec = this.create(reference);
    this.codecs.set(key, codec);

    return codec;
  }

  complexCodec(reference: TypeReference): ComplexCodec {
    const codec = this.codec(reference);
    if (!(codec instanceof ComplexCodec)) {
      throw new Error(`${keyOf(reference)} is not a complex type.`);
    }

    return codec;
  }

  element(descriptor: ElementDescriptor): ElementCodec {
    return new ElementCodec(descriptor, () => this.codec(descriptor.type));
  }

  /** Elements of a complex type, base type first, as the data contract serializer orders them. */
  elements(reference: TypeReference): ElementCodec[] {
    const type = this.complex(reference);
    const inherited = type.base ? this.elements(type.base) : [];

    return [...inherited, ...type.elements.map((element) => this.element(element))];
  }

  private create(reference: TypeReference): ValueCodec {
    if (reference.namespace === XmlNamespace.xsd) {
      return new PrimitiveCodec(reference.name);
    }
    const type = this.descriptor(reference);
    if (type.kind === TypeKind.primitive) {
      return PrimitiveCodec.of(type);
    }
    if (type.kind === TypeKind.enumeration) {
      return new EnumerationCodec(type);
    }
    const item = arrayItem(type);
    if (item !== undefined) {
      return new ArrayCodec(() => this.element(item));
    }

    return new ComplexCodec(reference, () => this.elements(reference));
  }

  private complex(reference: TypeReference): ComplexTypeDescriptor {
    const type = this.descriptor(reference);
    if (type.kind !== TypeKind.complex) {
      throw new Error(`${keyOf(reference)} is not a complex type.`);
    }

    return type;
  }

  private descriptor(reference: TypeReference): TypeDescriptor {
    const type = this.types.get(keyOf(reference));
    if (type === undefined) {
      throw new Error(`The catalog has no type ${keyOf(reference)}.`);
    }

    return type;
  }
}

/** The repeated item of an `ArrayOfX` wrapper type, or `undefined` for any other type. */
function arrayItem(type: ComplexTypeDescriptor): ElementDescriptor | undefined {
  const [only, ...rest] = type.elements;
  const isWrapper =
    type.base === undefined &&
    rest.length === 0 &&
    only?.maxOccurs === Occurrence.unbounded &&
    type.reference.name.startsWith('ArrayOf');

  return isWrapper ? only : undefined;
}
