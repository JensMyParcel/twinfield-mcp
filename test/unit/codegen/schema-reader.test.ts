import { describe, expect, it } from 'vitest';

import { CatalogBuilder } from '../../../codegen/catalog-builder.js';
import { ANY_TYPE, SchemaReader, keyOf } from '../../../codegen/schema-reader.js';
import { Occurrence, TypeKind } from '../../../src/catalog/catalog-types.js';
import { Namespace, parse, pingService, schema } from '../../support/tools-wsdl-fixtures.js';

const ns = Namespace.service;
const ref = (name: string) => ({ namespace: ns, name });
const xs = (name: string) => ({ namespace: Namespace.xsd, name });

function read(content: string): SchemaReader {
  const reader = new SchemaReader();
  reader.addSchema(schema(content));

  return reader;
}

describe('SchemaReader complex types', () => {
  it('reads the elements of a sequence with their occurrence and nillability', () => {
    const reader = read(
      '<xs:complexType name="Thing"><xs:sequence>' +
        '<xs:element name="Code" type="xs:string"/>' +
        '<xs:element minOccurs="0" maxOccurs="unbounded" name="Tags" nillable="true" type="xs:string"/>' +
        '<xs:element minOccurs="2" maxOccurs="5" name="Lines" nillable="false" type="tns:Line"/>' +
        '</xs:sequence></xs:complexType>',
    );

    expect(reader.type(ref('Thing'))).toEqual({
      kind: TypeKind.complex,
      reference: ref('Thing'),
      elements: [
        {
          name: 'Code',
          namespace: ns,
          type: xs('string'),
          minOccurs: 1,
          maxOccurs: 1,
          nillable: false,
        },
        {
          name: 'Tags',
          namespace: ns,
          type: xs('string'),
          minOccurs: 0,
          maxOccurs: Occurrence.unbounded,
          nillable: true,
        },
        {
          name: 'Lines',
          namespace: ns,
          type: ref('Line'),
          minOccurs: 2,
          maxOccurs: 5,
          nillable: false,
        },
      ],
    });
  });

  it('reads a complex type without a sequence as one without elements', () => {
    expect(read('<xs:complexType name="Empty"/>').type(ref('Empty'))).toEqual({
      kind: TypeKind.complex,
      reference: ref('Empty'),
      elements: [],
    });
  });

  it('records a sequence member that is not an element, which fails only once a request uses it', () => {
    const open =
      '<s:complexType name="Open"><s:sequence><s:any/><s:element name="Code" type="s:string"/></s:sequence></s:complexType>';
    const reader = read(
      '<xs:complexType name="Open"><xs:sequence><xs:any/><xs:element name="Code" type="xs:string"/></xs:sequence></xs:complexType>',
    );

    expect(reader.type(ref('Open'))).toMatchObject({ elements: [{ name: 'Code' }] });
    expect(reader.unsupported(ref('Open'))).toBe('xs:any is not supported');
    expect(() => new CatalogBuilder().build([pingService('tns:Open', open)])).toThrow(
      `Type {${Namespace.twinfield}}Open is used by a request, but xs:any is not supported.`,
    );
    expect(
      new CatalogBuilder().build([pingService('s:string', open)]).operations.map((op) => op.tool),
    ).toEqual(['ping_ping']);
  });

  it('resolves an extension base through a prefix declared on the extension itself', () => {
    const reader = read(
      `<xs:complexType name="CreateThing"><xs:complexContent><xs:extension base="q9:Command" xmlns:q9="${Namespace.contract}"><xs:sequence><xs:element name="Code" type="xs:string"/></xs:sequence></xs:extension></xs:complexContent></xs:complexType>`,
    );

    expect(reader.type(ref('CreateThing'))).toEqual({
      kind: TypeKind.complex,
      reference: ref('CreateThing'),
      base: { namespace: Namespace.contract, name: 'Command' },
      elements: [
        {
          name: 'Code',
          namespace: ns,
          type: xs('string'),
          minOccurs: 1,
          maxOccurs: 1,
          nillable: false,
        },
      ],
    });
  });

  it('rejects an extension without a base', () => {
    expect(() =>
      read(
        '<xs:complexType name="X"><xs:complexContent><xs:extension/></xs:complexContent></xs:complexType>',
      ),
    ).toThrow('<extension> is missing the "base" attribute.');
  });

  it('rejects an extension base with an undeclared prefix', () => {
    expect(() =>
      read(
        '<xs:complexType name="X"><xs:complexContent><xs:extension base="q1:Command"/></xs:complexContent></xs:complexType>',
      ),
    ).toThrow('Undeclared namespace prefix in "q1:Command"');
  });
});

describe('SchemaReader elements', () => {
  it('reads a global element with a named type', () => {
    const reader = read('<xs:element name="Command" nillable="true" type="tns:Command"/>');

    expect(reader.element(ref('Command'))).toEqual({
      name: 'Command',
      namespace: ns,
      type: ref('Command'),
      minOccurs: 1,
      maxOccurs: 1,
      nillable: true,
    });
  });

  it('names the anonymous type of a global element after the element', () => {
    const reader = read(
      '<xs:element name="Search"><xs:complexType><xs:sequence><xs:element name="type" type="xs:string"/></xs:sequence></xs:complexType></xs:element>',
    );

    expect(reader.element(ref('Search'))?.type).toEqual(ref('Search'));
    expect(reader.type(ref('Search'))).toMatchObject({
      kind: TypeKind.complex,
      elements: [{ name: 'type' }],
    });
  });

  it('gives nested anonymous types a dotted name along the element path', () => {
    const reader = read(
      '<xs:element name="Search"><xs:complexType><xs:sequence>' +
        '<xs:element name="options"><xs:complexType><xs:sequence>' +
        '<xs:element name="option"><xs:complexType><xs:sequence><xs:element name="key" type="xs:string"/></xs:sequence></xs:complexType></xs:element>' +
        '</xs:sequence></xs:complexType></xs:element>' +
        '</xs:sequence></xs:complexType></xs:element>',
    );

    expect(reader.type(ref('Search'))).toMatchObject({
      elements: [{ type: ref('Search.options') }],
    });
    expect(reader.type(ref('Search.options'))).toMatchObject({
      elements: [{ name: 'option', type: ref('Search.options.option') }],
    });
    expect(reader.type(ref('Search.options.option'))).toMatchObject({
      elements: [{ name: 'key' }],
    });
  });

  it('types an element without a type or an inline type as anyType', () => {
    const reader = read('<xs:element name="Anything"/>');

    expect(reader.element(ref('Anything'))?.type).toBe(ANY_TYPE);
    expect(ANY_TYPE).toEqual(xs('anyType'));
  });

  it('rejects an element without a name', () => {
    expect(() =>
      read(
        '<xs:complexType name="X"><xs:sequence><xs:element type="xs:string"/></xs:sequence></xs:complexType>',
      ),
    ).toThrow('<element> is missing the "name" attribute.');
  });

  it('rejects an element type with an undeclared prefix', () => {
    expect(() => read('<xs:element name="X" type="nope:Thing"/>')).toThrow(
      'Undeclared namespace prefix',
    );
  });
});

describe('SchemaReader simple types', () => {
  it('reads a restriction with enumerations as an enumeration', () => {
    const reader = read(
      '<xs:simpleType name="Kind"><xs:restriction base="xs:string"><xs:enumeration value="Small"/><xs:enumeration value="Large"/></xs:restriction></xs:simpleType>',
    );

    expect(reader.type(ref('Kind'))).toEqual({
      kind: TypeKind.enumeration,
      reference: ref('Kind'),
      values: ['Small', 'Large'],
    });
  });

  it('reads a restriction with a pattern as a primitive with that pattern', () => {
    const reader = read(
      '<xs:simpleType name="Guid"><xs:restriction base="xs:string"><xs:pattern value="[\\da-fA-F]{8}"/></xs:restriction></xs:simpleType>',
    );

    expect(reader.type(ref('Guid'))).toEqual({
      kind: TypeKind.primitive,
      reference: ref('Guid'),
      primitive: 'string',
      pattern: '[\\da-fA-F]{8}',
    });
  });

  it('reads a bare restriction as a primitive of its base without a pattern', () => {
    const reader = read(
      '<xs:simpleType name="Amount"><xs:restriction base="xs:decimal"/></xs:simpleType>',
    );

    expect(reader.type(ref('Amount'))).toEqual({
      kind: TypeKind.primitive,
      reference: ref('Amount'),
      primitive: 'decimal',
    });
  });

  it('rejects an enumeration without a value', () => {
    expect(() =>
      read(
        '<xs:simpleType name="Kind"><xs:restriction base="xs:string"><xs:enumeration/></xs:restriction></xs:simpleType>',
      ),
    ).toThrow('<enumeration> is missing the "value" attribute.');
  });

  it('rejects a pattern without a value', () => {
    expect(() =>
      read(
        '<xs:simpleType name="P"><xs:restriction base="xs:string"><xs:pattern/></xs:restriction></xs:simpleType>',
      ),
    ).toThrow('<pattern> is missing the "value" attribute.');
  });

  it('rejects a restriction without a base', () => {
    expect(() => read('<xs:simpleType name="P"><xs:restriction/></xs:simpleType>')).toThrow(
      '<restriction> is missing the "base" attribute.',
    );
  });
});

describe('SchemaReader lookups', () => {
  it('ignores top-level nodes that are neither types nor elements', () => {
    const reader = read(
      `<xs:import namespace="${Namespace.contract}"/><xs:annotation/><xs:complexType name="Thing"/>`,
    );

    expect(reader.allTypes().map((type) => type.reference)).toEqual([ref('Thing')]);
  });

  it('keeps types and elements of the same name apart', () => {
    const reader = read(
      '<xs:complexType name="Command"/><xs:element name="Command" type="tns:Command"/>',
    );

    expect(reader.type(ref('Command'))?.kind).toBe(TypeKind.complex);
    expect(reader.element(ref('Command'))?.type).toEqual(ref('Command'));
  });

  it('finds nothing for a name in another namespace', () => {
    const reader = read(
      '<xs:complexType name="Thing"/><xs:element name="Thing" type="tns:Thing"/>',
    );

    expect(reader.type({ namespace: Namespace.contract, name: 'Thing' })).toBeUndefined();
    expect(reader.element({ namespace: Namespace.contract, name: 'Thing' })).toBeUndefined();
  });

  it('collects the types of every added schema', () => {
    const reader = new SchemaReader();
    reader.addSchema(schema('<xs:complexType name="Command"/>', Namespace.contract));
    reader.addSchema(schema('<xs:complexType name="Thing"/>'));

    expect(reader.allTypes().map((type) => keyOf(type.reference))).toEqual([
      `{${Namespace.contract}}Command`,
      `{${ns}}Thing`,
    ]);
  });
});

describe('SchemaReader names', () => {
  it('rejects a schema without a target namespace', () => {
    const noNamespace = parse(
      `<xs:schema xmlns:xs="${Namespace.xsd}"><xs:complexType name="X"/></xs:schema>`,
    );

    expect(() => {
      new SchemaReader().addSchema(noNamespace);
    }).toThrow('<schema> is missing the "targetNamespace" attribute.');
  });

  it.each([
    ['complexType', '<xs:complexType/>'],
    ['simpleType', '<xs:simpleType><xs:restriction base="xs:string"/></xs:simpleType>'],
    ['element', '<xs:element type="xs:string"/>'],
  ])('rejects a top-level %s without a name', (local, content) => {
    expect(() => read(content)).toThrow(`<${local}> is missing the "name" attribute.`);
  });
});

describe('SchemaReader.unsupported', () => {
  it.each([
    ['list', '<xs:list itemType="xs:string"/>'],
    ['union', '<xs:union memberTypes="xs:string xs:int"/>'],
  ])('records a simple type with xs:%s and does not model it', (_local, content) => {
    const reader = read(`<xs:simpleType name="Odd">${content}</xs:simpleType>`);

    expect(reader.unsupported(ref('Odd'))).toBe('only xs:restriction simple types are supported');
    expect(reader.type(ref('Odd'))).toBeUndefined();
  });

  it.each([
    ['attribute', '<xs:sequence/><xs:attribute name="Id" type="xs:ID"/>'],
    ['anyAttribute', '<xs:sequence/><xs:anyAttribute/>'],
    ['choice', '<xs:choice><xs:element name="A" type="xs:string"/></xs:choice>'],
    ['all', '<xs:all><xs:element name="A" type="xs:string"/></xs:all>'],
    ['group', '<xs:group ref="tns:Fields"/>'],
    ['simpleContent', '<xs:simpleContent><xs:extension base="xs:string"/></xs:simpleContent>'],
  ])('records a complex type with xs:%s next to its sequence', (local, content) => {
    const reader = read(`<xs:complexType name="Odd">${content}</xs:complexType>`);

    expect(reader.unsupported(ref('Odd'))).toBe(`xs:${local} is not supported`);
  });

  it.each([
    ['choice', '<xs:choice><xs:element name="A" type="xs:string"/></xs:choice>'],
    ['sequence', '<xs:sequence><xs:element name="A" type="xs:string"/></xs:sequence>'],
    ['any', '<xs:any/>'],
  ])('records a complex type with xs:%s inside its sequence', (local, member) => {
    const reader = read(
      `<xs:complexType name="Odd"><xs:sequence><xs:element name="B" type="xs:string"/>${member}</xs:sequence></xs:complexType>`,
    );

    expect(reader.unsupported(ref('Odd'))).toBe(`xs:${local} is not supported`);
  });

  it('records a complex content restriction and an unknown member of complex content', () => {
    const reader = read(
      `<xs:complexType name="Narrow"><xs:complexContent><xs:annotation/><xs:restriction base="q1:Command" xmlns:q1="${Namespace.contract}"><xs:sequence/></xs:restriction></xs:complexContent></xs:complexType>` +
        `<xs:complexType name="Both"><xs:complexContent><xs:extension base="q1:Command" xmlns:q1="${Namespace.contract}"><xs:sequence/></xs:extension><xs:restriction base="q1:Command" xmlns:q1="${Namespace.contract}"/></xs:complexContent></xs:complexType>`,
    );

    expect(reader.unsupported(ref('Narrow'))).toBe('xs:restriction is not supported');
    expect(reader.type(ref('Narrow'))).toEqual({
      kind: TypeKind.complex,
      reference: ref('Narrow'),
      elements: [],
    });
    expect(reader.unsupported(ref('Both'))).toBe('xs:restriction is not supported');
  });

  it('records an attribute on an extension', () => {
    const reader = read(
      `<xs:complexType name="Odd"><xs:complexContent><xs:extension base="q1:Command" xmlns:q1="${Namespace.contract}"><xs:sequence/><xs:attribute name="Ref" type="xs:IDREF"/></xs:extension></xs:complexContent></xs:complexType>`,
    );

    expect(reader.unsupported(ref('Odd'))).toBe('xs:attribute is not supported');
  });

  it('records an unsupported anonymous type under its dotted name', () => {
    const reader = read(
      '<xs:element name="Search"><xs:complexType><xs:sequence><xs:element name="data"><xs:complexType mixed="true"><xs:sequence><xs:any/></xs:sequence></xs:complexType></xs:element></xs:sequence></xs:complexType></xs:element>',
    );

    expect(reader.unsupported(ref('Search'))).toBeUndefined();
    expect(reader.unsupported(ref('Search.data'))).toBe('xs:any is not supported');
  });

  it('accepts annotations, a sequence, complex content and an extension', () => {
    const reader = read(
      `<xs:complexType name="Fine"><xs:annotation/><xs:complexContent><xs:extension base="q1:Command" xmlns:q1="${Namespace.contract}"><xs:annotation/><xs:sequence><xs:element name="A" type="xs:string"/></xs:sequence></xs:extension></xs:complexContent></xs:complexType>` +
        '<xs:simpleType name="Kind"><xs:restriction base="xs:string"/></xs:simpleType>',
    );

    expect(reader.unsupported(ref('Fine'))).toBeUndefined();
    expect(reader.unsupported(ref('Kind'))).toBeUndefined();
  });
});
