import {
  Occurrence,
  TypeKind,
  type ComplexTypeDescriptor,
  type ElementDescriptor,
  type EnumerationTypeDescriptor,
  type PrimitiveTypeDescriptor,
  type TypeReference,
} from '../../src/catalog/catalog-types.js';
import { XmlNamespace } from '../../src/xml/qualified-name.js';

export const TEST_NAMESPACE = 'http://example.test/schema';

export function xsd(name: string): TypeReference {
  return { namespace: XmlNamespace.xsd, name };
}

export function typeRef(name: string, namespace: string = TEST_NAMESPACE): TypeReference {
  return { namespace, name };
}

export function element(
  name: string,
  type: TypeReference,
  occurrence: Partial<Pick<ElementDescriptor, 'minOccurs' | 'maxOccurs' | 'nillable'>> = {},
): ElementDescriptor {
  return {
    name,
    namespace: TEST_NAMESPACE,
    type,
    minOccurs: 1,
    maxOccurs: 1,
    nillable: false,
    ...occurrence,
  };
}

export function repeated(name: string, type: TypeReference, minOccurs = 0): ElementDescriptor {
  return element(name, type, { minOccurs, maxOccurs: Occurrence.unbounded });
}

export function complexType(
  reference: TypeReference,
  elements: readonly ElementDescriptor[],
  base?: TypeReference,
): ComplexTypeDescriptor {
  const descriptor: ComplexTypeDescriptor = { kind: TypeKind.complex, reference, elements };

  return base === undefined ? descriptor : { ...descriptor, base };
}

export function primitiveType(
  reference: TypeReference,
  primitive: string,
  pattern?: string,
): PrimitiveTypeDescriptor {
  const descriptor: PrimitiveTypeDescriptor = { kind: TypeKind.primitive, reference, primitive };

  return pattern === undefined ? descriptor : { ...descriptor, pattern };
}

export function enumerationType(
  reference: TypeReference,
  values: readonly string[],
): EnumerationTypeDescriptor {
  return { kind: TypeKind.enumeration, reference, values };
}
