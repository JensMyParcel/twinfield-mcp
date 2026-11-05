import {
  Occurrence,
  TypeKind,
  type ComplexTypeDescriptor,
  type ElementDescriptor,
  type TypeDescriptor,
  type TypeReference,
} from '../src/catalog/catalog-types.js';
import { QualifiedName, XmlNamespace } from '../src/xml/qualified-name.js';
import type { XmlElement } from '../src/xml/xml-element.js';

const xsd = (local: string): QualifiedName => QualifiedName.of(XmlNamespace.xsd, local);

export const ANY_TYPE: TypeReference = { namespace: XmlNamespace.xsd, name: 'anyType' };

/**
 * Collects named types and global elements from XSD `schema` elements. Anonymous complex types
 * get a synthetic name: the path of the element that holds them.
 */
export class SchemaReader {
  private readonly types = new Map<string, TypeDescriptor>();
  private readonly globalElements = new Map<string, ElementDescriptor>();
  private readonly unsupportedTypes = new Map<string, string>();

  addSchema(schema: XmlElement): void {
    const targetNamespace = attr(schema, 'targetNamespace');
    for (const child of schema.elements()) {
      this.addTopLevel(child, targetNamespace);
    }
  }

  type(reference: TypeReference): TypeDescriptor | undefined {
    return this.types.get(keyOf(reference));
  }

  element(reference: TypeReference): ElementDescriptor | undefined {
    return this.globalElements.get(keyOf(reference));
  }

  allTypes(): TypeDescriptor[] {
    return [...this.types.values()];
  }

  /**
   * Why a type cannot be modelled, or `undefined`. The schemas hold such types that no request
   * uses, so this is only an error once the catalog builder reaches the type.
   */
  unsupported(reference: TypeReference): string | undefined {
    return this.unsupportedTypes.get(keyOf(reference));
  }

  private addTopLevel(node: XmlElement, namespace: string): void {
    if (node.name.equals(xsd('complexType'))) {
      this.addComplexType(node, { namespace, name: attr(node, 'name') });
    } else if (node.name.equals(xsd('simpleType'))) {
      this.addSimpleType(node, { namespace, name: attr(node, 'name') });
    } else if (node.name.equals(xsd('element'))) {
      const name = attr(node, 'name');
      this.globalElements.set(keyOf({ namespace, name }), this.readElement(node, namespace, ''));
    }
  }

  private addSimpleType(node: XmlElement, reference: TypeReference): void {
    const restriction = node.childByLocalName('restriction');
    if (restriction === undefined) {
      this.unsupportedTypes.set(keyOf(reference), 'only xs:restriction simple types are supported');

      return;
    }
    this.types.set(keyOf(reference), readRestriction(restriction, reference));
  }

  private addComplexType(node: XmlElement, reference: TypeReference): void {
    const extension = node.childByLocalName('complexContent')?.childByLocalName('extension');
    const sequenceOwner = extension ?? node;
    const members = sequenceOwner.childByLocalName('sequence')?.elements() ?? [];
    const unsupported = unsupportedMember(node, sequenceOwner, members);
    if (unsupported !== undefined) {
      this.unsupportedTypes.set(keyOf(reference), `xs:${unsupported} is not supported`);
    }
    const elements = members
      .filter((child) => child.name.equals(xsd('element')))
      .map((child) => this.readElement(child, reference.namespace, reference.name));
    const base = extension
      ? toReference(extension.resolveQualifiedValue(attr(extension, 'base')))
      : undefined;
    const descriptor: ComplexTypeDescriptor = {
      kind: TypeKind.complex,
      reference,
      ...(base ? { base } : {}),
      elements,
    };
    this.types.set(keyOf(reference), descriptor);
  }

  private readElement(node: XmlElement, namespace: string, owner: string): ElementDescriptor {
    const name = attr(node, 'name');
    const typeName = node.attribute(QualifiedName.unqualified('type'));
    let type: TypeReference = ANY_TYPE;
    if (typeof typeName === 'string') {
      type = toReference(node.resolveQualifiedValue(typeName));
    } else if (node.childByLocalName('complexType')) {
      type = { namespace, name: owner === '' ? name : `${owner}.${name}` };
      this.addComplexType(node.childByLocalName('complexType') as XmlElement, type);
    }
    const maxOccurs = node.attribute(QualifiedName.unqualified('maxOccurs')) ?? '1';

    return {
      name,
      namespace,
      type,
      minOccurs: Number(node.attribute(QualifiedName.unqualified('minOccurs')) ?? '1'),
      maxOccurs: maxOccurs === 'unbounded' ? Occurrence.unbounded : Number(maxOccurs),
      nillable: node.attribute(QualifiedName.unqualified('nillable')) === 'true',
    };
  }
}

const CONTENT_MODEL = new Set(['sequence', 'complexContent', 'extension', 'annotation']);

/** The first member the codecs cannot write: an attribute, a choice, an `xs:any` and so on. */
function unsupportedMember(
  node: XmlElement,
  owner: XmlElement,
  members: readonly XmlElement[],
): string | undefined {
  // Only `complexContent/extension` is read, so a `restriction` there would lose every field.
  const derivation = node
    .childByLocalName('complexContent')
    ?.elements()
    .find((child) => !CONTENT_MODEL.has(child.name.local));
  const outside = owner.elements().find((child) => !CONTENT_MODEL.has(child.name.local));
  const inside = members.find((child) => !child.name.equals(xsd('element')));

  return (derivation ?? outside ?? inside)?.name.local;
}

function readRestriction(restriction: XmlElement, reference: TypeReference): TypeDescriptor {
  const values = restriction
    .elements()
    .filter((child) => child.name.equals(xsd('enumeration')))
    .map((child) => attr(child, 'value'));
  if (values.length > 0) {
    return { kind: TypeKind.enumeration, reference, values };
  }
  const pattern = restriction.childByLocalName('pattern');

  return {
    kind: TypeKind.primitive,
    reference,
    primitive: restriction.resolveQualifiedValue(attr(restriction, 'base')).local,
    ...(pattern ? { pattern: attr(pattern, 'value') } : {}),
  };
}

function attr(node: XmlElement, name: string): string {
  const value = node.attribute(QualifiedName.unqualified(name));
  if (typeof value !== 'string') {
    throw new Error(`<${node.name.local}> is missing the "${name}" attribute.`);
  }

  return value;
}

function toReference(name: QualifiedName): TypeReference {
  return { namespace: name.namespace, name: name.local };
}

export function keyOf(reference: TypeReference): string {
  return `{${reference.namespace}}${reference.name}`;
}
