import { describe, expect, it } from 'vitest';

import type { TypeDescriptor } from '../../../src/catalog/catalog-types.js';
import { SOAP_CATALOG } from '../../../src/catalog/soap-catalog.generated.js';
import { CodecFactory } from '../../../src/serialization/codec-factory.js';
import { SchemaContext } from '../../../src/serialization/json-schema.js';
import { EnumerationCodec, PrimitiveCodec } from '../../../src/serialization/scalar-codecs.js';
import { ArrayCodec, ComplexCodec } from '../../../src/serialization/structured-codecs.js';
import { QualifiedName } from '../../../src/xml/qualified-name.js';
import { XmlElement } from '../../../src/xml/xml-element.js';
import { XmlWriter } from '../../../src/xml/xml-writer.js';
import {
  complexType,
  element,
  enumerationType,
  primitiveType,
  repeated,
  typeRef,
  xsd,
} from '../../support/core-catalog.js';

const OFFICE = typeRef('Office');
const DERIVED = typeRef('DerivedOffice');
const STATUS = typeRef('Status');
const CODE = typeRef('Code');
const LINE = typeRef('Line');
const ARRAY_OF_LINE = typeRef('ArrayOfLine');
const NODE = typeRef('Node');
const ARRAY_OF_NODE = typeRef('ArrayOfNode');

const TYPES: readonly TypeDescriptor[] = [
  primitiveType(CODE, 'string', '[0-9]{3}'),
  enumerationType(STATUS, ['active', 'deleted']),
  complexType(LINE, [element('amount', xsd('decimal'))]),
  complexType(ARRAY_OF_LINE, [repeated('Line', LINE)]),
  complexType(OFFICE, [
    element('code', CODE),
    element('status', STATUS, { minOccurs: 0 }),
    element('lines', ARRAY_OF_LINE, { minOccurs: 0 }),
  ]),
  complexType(DERIVED, [element('extra', xsd('int'), { minOccurs: 0 })], OFFICE),
  complexType(NODE, [
    element('name', xsd('string')),
    element('children', ARRAY_OF_NODE, { minOccurs: 0 }),
  ]),
  complexType(ARRAY_OF_NODE, [repeated('Node', NODE)]),
];

function factory(types: readonly TypeDescriptor[] = TYPES): CodecFactory {
  return new CodecFactory(types);
}

function writeOffice(value: unknown, reference = OFFICE): string {
  const codecs = factory();
  const content = codecs.complexCodec(reference).content(value, 'office');
  const root = new XmlElement(
    QualifiedName.unqualified('root'),
    content.attributes,
    content.children,
  );

  return new XmlWriter().write(root);
}

describe('CodecFactory', () => {
  describe('picks the codec for each kind of type', () => {
    it('a built-in XSD type, without a catalog entry', () => {
      const codec = factory([]).codec(xsd('int'));

      expect(codec).toBeInstanceOf(PrimitiveCodec);
      expect(codec.schema(new SchemaContext())).toMatchObject({ type: 'integer' });
    });

    it('a named primitive restriction, with its pattern', () => {
      const codec = factory().codec(CODE);

      expect(codec).toBeInstanceOf(PrimitiveCodec);
      expect(() => codec.content('12', 'code')).toThrow('code: must match ^(?:[0-9]{3})$');
    });

    it('an enumeration', () => {
      expect(factory().codec(STATUS)).toBeInstanceOf(EnumerationCodec);
    });

    it('a complex type', () => {
      expect(factory().codec(OFFICE)).toBeInstanceOf(ComplexCodec);
    });

    it('an ArrayOf wrapper with one unbounded element and no base', () => {
      expect(factory().codec(ARRAY_OF_LINE)).toBeInstanceOf(ArrayCodec);
    });

    it.each([
      [
        'a bounded item',
        complexType(typeRef('ArrayOfX'), [element('X', xsd('string'), { maxOccurs: 5 })]),
      ],
      [
        'two elements',
        complexType(typeRef('ArrayOfX'), [
          repeated('X', xsd('string')),
          repeated('Y', xsd('string')),
        ]),
      ],
      ['no elements', complexType(typeRef('ArrayOfX'), [])],
      ['a base type', complexType(typeRef('ArrayOfX'), [repeated('X', xsd('string'))], LINE)],
      [
        'a name without the ArrayOf prefix',
        complexType(typeRef('XList'), [repeated('X', xsd('string'))]),
      ],
    ])('a complex type, not an array, for a wrapper-like type with %s', (_case, type) => {
      expect(factory([...TYPES, type]).codec(type.reference)).toBeInstanceOf(ComplexCodec);
    });
  });

  it('returns the same codec instance for the same type', () => {
    const codecs = factory();

    expect(codecs.codec(OFFICE)).toBe(codecs.codec(OFFICE));
    expect(codecs.codec(xsd('string'))).toBe(codecs.codec(xsd('string')));
  });

  it('keeps types with the same name in different namespaces apart', () => {
    const other = typeRef('Status', 'urn:other');
    const codecs = factory([...TYPES, enumerationType(other, ['open'])]);

    expect(codecs.codec(STATUS).schema(new SchemaContext())).toMatchObject({
      enum: ['active', 'deleted'],
    });
    expect(codecs.codec(other).schema(new SchemaContext())).toMatchObject({ enum: ['open'] });
  });

  it('rejects a type that is not in the catalog', () => {
    expect(() => factory().codec(typeRef('Missing'))).toThrow(
      'The catalog has no type {http://example.test/schema}Missing.',
    );
  });

  it('rejects a built-in XSD type without a JSON format', () => {
    expect(() => factory().codec(xsd('base64Binary'))).toThrow('No JSON format for the XSD type');
  });

  it('rejects a complex codec request for a simple type', () => {
    expect(() => factory().complexCodec(STATUS)).toThrow(
      '{http://example.test/schema}Status is not a complex type.',
    );
  });

  it('rejects a complex codec request for an ArrayOf wrapper', () => {
    expect(() => factory().complexCodec(ARRAY_OF_LINE)).toThrow('is not a complex type.');
  });

  it('rejects element lookup on a simple type or a missing type', () => {
    expect(() => factory().elements(CODE)).toThrow(
      '{http://example.test/schema}Code is not a complex type.',
    );
    expect(() => factory().elements(typeRef('Missing'))).toThrow('The catalog has no type');
  });

  it('lists base type elements first, as the data contract serializer orders them', () => {
    expect(
      factory()
        .elements(DERIVED)
        .map((codec) => codec.name),
    ).toEqual(['code', 'status', 'lines', 'extra']);
  });

  it('builds an element codec whose value codec comes from the cache', () => {
    const codecs = factory();
    const codec = codecs.element(element('status', STATUS));

    expect(codec.qualifiedName.local).toBe('status');
    expect(() => codec.write('closed', 'status')).toThrow('status: must be one of active, deleted');
  });

  it('writes a complex value with an ArrayOf property given as a plain array', () => {
    expect(writeOffice({ lines: [{ amount: '1.50' }, { amount: 2 }], code: '001' })).toBe(
      '<root><code xmlns="http://example.test/schema">001</code>' +
        '<lines xmlns="http://example.test/schema"><Line><amount>1.50</amount></Line><Line><amount>2</amount></Line></lines>' +
        '</root>',
    );
  });

  it('writes inherited elements before own elements', () => {
    expect(writeOffice({ extra: 1, code: '001' }, DERIVED)).toBe(
      '<root><code xmlns="http://example.test/schema">001</code><extra xmlns="http://example.test/schema">1</extra></root>',
    );
  });

  it('reports nested errors with their full path', () => {
    expect(() => writeOffice({ code: '001', lines: [{ amount: 'x' }] })).toThrow(
      'office.lines[0].amount: must be a finite number or a decimal string',
    );
    expect(() => writeOffice({ code: '001', status: 'closed' })).toThrow(
      'office.status: must be one of',
    );
    expect(() => writeOffice({ code: '001', lines: { Line: [] } })).toThrow(
      'office.lines: must be an array',
    );
  });

  describe('a recursive type', () => {
    it('builds a schema with $defs and $refs and terminates', () => {
      const context = new SchemaContext();
      const root = factory().complexCodec(NODE).objectSchema(context);

      expect(root).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          children: { type: 'array', items: { $ref: '#/$defs/Node' }, minItems: 0 },
        },
        required: ['name'],
        additionalProperties: false,
      });
      expect(context.document(root)['$defs']).toEqual({
        Node: {
          type: 'object',
          properties: root['properties'],
          required: ['name'],
          additionalProperties: false,
        },
      });
    });

    it('writes nested values of the same type', () => {
      const codec = factory().complexCodec(NODE);
      const content = codec.content(
        { name: 'a', children: [{ name: 'b', children: [{ name: 'c' }] }] },
        'node',
      );

      expect(content.children).toHaveLength(2);
      expect(() => codec.content({ name: 'a', children: [{ children: [] }] }, 'node')).toThrow(
        'node.children[0].name: is required',
      );
    });
  });

  it('builds a codec and a schema for every type in the generated catalog', () => {
    const codecs = new CodecFactory(SOAP_CATALOG.types);
    const context = new SchemaContext();

    for (const type of SOAP_CATALOG.types) {
      expect(() => codecs.codec(type.reference).schema(context)).not.toThrow();
    }
    expect(Object.keys(context.document({})['$defs'] as object).length).toBeGreaterThan(0);
  });
});
