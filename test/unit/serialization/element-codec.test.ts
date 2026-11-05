import { describe, expect, it } from 'vitest';

import { Occurrence, type ElementDescriptor } from '../../../src/catalog/catalog-types.js';
import { ElementCodec } from '../../../src/serialization/element-codec.js';
import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import { SchemaContext } from '../../../src/serialization/json-schema.js';
import { PrimitiveCodec } from '../../../src/serialization/scalar-codecs.js';
import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import { XmlElement, XmlText } from '../../../src/xml/xml-element.js';
import { TEST_NAMESPACE, element, xsd } from '../../support/core-catalog.js';

const NAME = QualifiedName.of(TEST_NAMESPACE, 'code');
const NIL = { name: QualifiedName.of(XmlNamespace.xsi, 'nil'), value: 'true' };

function codec(
  occurrence: Partial<Pick<ElementDescriptor, 'minOccurs' | 'maxOccurs' | 'nillable'>> = {},
) {
  return new ElementCodec(
    element('code', xsd('string'), occurrence),
    () => new PrimitiveCodec('string'),
  );
}

const text = (value: string) => new XmlElement(NAME, [], [new XmlText(value)]);
const nil = () => new XmlElement(NAME, [NIL]);

describe('ElementCodec', () => {
  it('takes its name and qualified name from the descriptor', () => {
    const subject = codec();

    expect(subject.name).toBe('code');
    expect(subject.qualifiedName).toEqual(NAME);
  });

  it('rejects a descriptor whose name is not an XML name', () => {
    expect(
      () => new ElementCodec(element('1code', xsd('string')), () => new PrimitiveCodec('string')),
    ).toThrow('Invalid XML name');
  });

  it('resolves the value codec lazily, so a recursive type can refer to itself', () => {
    let resolved = 0;
    const subject = new ElementCodec(element('code', xsd('string')), () => {
      resolved += 1;

      return new PrimitiveCodec('string');
    });

    expect(resolved).toBe(0);
    subject.write('x', 'code');
    expect(resolved).toBe(1);
  });

  describe('occurrence rules', () => {
    it.each([
      [{ maxOccurs: 1 }, false],
      [{ maxOccurs: 0 }, false],
      [{ maxOccurs: 2 }, true],
      [{ maxOccurs: Occurrence.unbounded }, true],
    ])('%j is repeated: %s', (occurrence, repeated) => {
      expect(codec(occurrence).isRepeated).toBe(repeated);
    });

    it.each([
      [{ minOccurs: 1, nillable: false }, true],
      [{ minOccurs: 1, nillable: true }, false],
      [{ minOccurs: 0, nillable: false }, false],
      [{ minOccurs: 0, nillable: true }, false],
    ])('%j is required: %s', (occurrence, required) => {
      expect(codec(occurrence).isRequired).toBe(required);
    });
  });

  describe('a single element', () => {
    it('writes one element with the value codec content', () => {
      expect(codec().write('001', 'code')).toEqual([text('001')]);
    });

    it('writes nothing for a missing optional value', () => {
      expect(codec({ minOccurs: 0 }).write(undefined, 'code')).toEqual([]);
    });

    it('writes nil for a missing required nillable value', () => {
      expect(codec({ nillable: true }).write(undefined, 'code')).toEqual([nil()]);
    });

    it('rejects a missing required value', () => {
      expect(() => codec().write(undefined, 'office.code')).toThrow(
        new InvalidArgumentError('office.code', 'is required'),
      );
    });

    it('writes nil for null when the element is nillable', () => {
      expect(codec({ nillable: true, minOccurs: 0 }).write(null, 'code')).toEqual([nil()]);
    });

    it('rejects null when the element is not nillable, even when it is optional', () => {
      expect(() => codec({ minOccurs: 0 }).write(null, 'code')).toThrow('code: must not be null');
    });

    it('passes the path to the value codec', () => {
      expect(() => codec().write(5, 'office.code')).toThrow('office.code: must be a string');
    });

    it('publishes the value schema, nullable only when nillable', () => {
      const context = new SchemaContext();

      expect(codec().schema(context)).toEqual({ type: 'string' });
      expect(codec({ nillable: true }).schema(context)).toEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
      });
    });
  });

  describe('a repeated element', () => {
    const bounded = codec({ minOccurs: 1, maxOccurs: 3 });

    it('writes one element per item, in order', () => {
      expect(bounded.write(['a', 'b'], 'codes')).toEqual([text('a'), text('b')]);
    });

    it('accepts exactly minOccurs and exactly maxOccurs items', () => {
      expect(bounded.write(['a'], 'codes')).toHaveLength(1);
      expect(bounded.write(['a', 'b', 'c'], 'codes')).toHaveLength(3);
    });

    it.each([[[]], [['a', 'b', 'c', 'd']]])('rejects %j: wrong item count', (items) => {
      expect(() => bounded.write(items, 'codes')).toThrow('codes: has the wrong number of items');
    });

    it('accepts any number of items when unbounded, also none when minOccurs is 0', () => {
      const unbounded = codec({ minOccurs: 0, maxOccurs: Occurrence.unbounded });

      expect(unbounded.write([], 'codes')).toEqual([]);
      expect(
        unbounded.write(
          Array.from({ length: 500 }, () => 'x'),
          'codes',
        ),
      ).toHaveLength(500);
    });

    it.each(['a', { 0: 'a' }])('rejects the non-array %j', (value) => {
      expect(() => bounded.write(value, 'codes')).toThrow('codes: must be an array');
    });

    it('reports the index of an invalid item', () => {
      expect(() => bounded.write(['a', 1], 'codes')).toThrow('codes[1]: must be a string');
    });

    it('rejects a null item when the element is not nillable', () => {
      expect(() => bounded.write(['a', null], 'codes')).toThrow('codes[1]: must not be null');
    });

    it('writes a null item as nil when the element is nillable', () => {
      const nillable = codec({ minOccurs: 0, maxOccurs: Occurrence.unbounded, nillable: true });

      expect(nillable.write(['a', null], 'codes')).toEqual([text('a'), nil()]);
    });

    it('writes nothing for a missing value when minOccurs is 0', () => {
      expect(codec({ minOccurs: 0, maxOccurs: 5 }).write(undefined, 'codes')).toEqual([]);
    });

    it('rejects a missing value when minOccurs is above 0', () => {
      expect(() => bounded.write(undefined, 'codes')).toThrow('codes: is required');
    });

    it('publishes an array schema with minItems and maxItems', () => {
      expect(bounded.schema(new SchemaContext())).toEqual({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 3,
      });
    });

    it('publishes no maxItems when unbounded, and nullable items when nillable', () => {
      const unbounded = codec({ minOccurs: 0, maxOccurs: Occurrence.unbounded, nillable: true });

      expect(unbounded.schema(new SchemaContext())).toEqual({
        type: 'array',
        items: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        minItems: 0,
      });
    });
  });
});
