import { describe, expect, it } from 'vitest';

import { Occurrence } from '../../../src/catalog/catalog-types.js';
import { ElementCodec } from '../../../src/serialization/element-codec.js';
import { SchemaContext } from '../../../src/serialization/json-schema.js';
import { PrimitiveCodec } from '../../../src/serialization/scalar-codecs.js';
import { ArrayCodec, ComplexCodec } from '../../../src/serialization/structured-codecs.js';
import { QualifiedName } from '../../../src/xml/qualified-name.js';
import { XmlElement, XmlText } from '../../../src/xml/xml-element.js';
import { TEST_NAMESPACE, element, typeRef, xsd } from '../../support/core-catalog.js';

const stringElement = (name: string, minOccurs = 1, nillable = false) =>
  new ElementCodec(
    element(name, xsd('string'), { minOccurs, nillable }),
    () => new PrimitiveCodec('string'),
  );

const textElement = (name: string, value: string) =>
  new XmlElement(QualifiedName.of(TEST_NAMESPACE, name), [], [new XmlText(value)]);

describe('ComplexCodec', () => {
  const office = new ComplexCodec(typeRef('Office'), () => [
    stringElement('code'),
    stringElement('name', 0),
    stringElement('shortName', 1, true),
  ]);

  it('writes elements in schema order, whatever the property order', () => {
    const content = office.content({ name: 'Main', code: '001', shortName: 'M' }, 'office');

    expect(content).toEqual({
      attributes: [],
      children: [
        textElement('code', '001'),
        textElement('name', 'Main'),
        textElement('shortName', 'M'),
      ],
    });
  });

  it('rejects an unknown property and names it in the path', () => {
    expect(() => office.content({ code: '001', shortName: 'M', colour: 'red' }, 'office')).toThrow(
      'office.colour: is not a known property',
    );
  });

  it('rejects an unknown property at the top level without a leading dot', () => {
    expect(() => office.content({ code: '001', __proto__x: 1 }, '')).toThrow(
      '__proto__x: is not a known property',
    );
  });

  it('rejects an own __proto__ property from parsed JSON', () => {
    const value: unknown = JSON.parse('{"code":"001","shortName":"M","__proto__":{"name":"x"}}');

    expect(() => office.content(value, 'office')).toThrow(
      'office.__proto__: is not a known property',
    );
  });

  it('reports a missing required element with its full path', () => {
    expect(() => office.content({ shortName: 'M' }, 'office')).toThrow('office.code: is required');
  });

  it.each([null, 'x', 1, ['a']])('rejects the non-object %j', (value) => {
    expect(() => office.content(value, 'office')).toThrow('office: must be an object');
  });

  it('publishes an object schema with required names and no additional properties', () => {
    const context = new SchemaContext();

    expect(office.objectSchema(context)).toEqual({
      type: 'object',
      properties: {
        code: { type: 'string' },
        name: { type: 'string' },
        shortName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      },
      required: ['code'],
      additionalProperties: false,
    });
  });

  it('leaves out an empty required list', () => {
    const optional = new ComplexCodec(typeRef('Filter'), () => [stringElement('name', 0)]);

    expect(optional.objectSchema(new SchemaContext())).not.toHaveProperty('required');
  });

  it('publishes itself as a $ref into $defs', () => {
    const context = new SchemaContext();

    expect(office.schema(context)).toEqual({ $ref: '#/$defs/Office' });
    expect(context.document({})['$defs']).toHaveProperty('Office.type', 'object');
  });

  it('writes an empty object for a type without elements', () => {
    const empty = new ComplexCodec(typeRef('Empty'), () => []);

    expect(empty.content({}, 'empty')).toEqual({ attributes: [], children: [] });
    expect(() => empty.content({ a: 1 }, 'empty')).toThrow('empty.a: is not a known property');
  });
});

describe('ArrayCodec', () => {
  const item = new ElementCodec(
    element('string', xsd('string'), { minOccurs: 0, maxOccurs: Occurrence.unbounded }),
    () => new PrimitiveCodec('string'),
  );
  const array = new ArrayCodec(() => item);

  it('takes a plain JSON array and writes one item element per entry', () => {
    expect(array.content(['a', 'b'], 'codes')).toEqual({
      attributes: [],
      children: [textElement('string', 'a'), textElement('string', 'b')],
    });
  });

  it('rejects the wrapped object form', () => {
    expect(() => array.content({ string: ['a'] }, 'codes')).toThrow('codes: must be an array');
  });

  it('reports invalid items with their index', () => {
    expect(() => array.content(['a', 2], 'codes')).toThrow('codes[1]: must be a string');
  });

  it('publishes the item array schema', () => {
    expect(array.schema(new SchemaContext())).toEqual({
      type: 'array',
      items: { type: 'string' },
      minItems: 0,
    });
  });
});
