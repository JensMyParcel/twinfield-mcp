import { describe, expect, it } from 'vitest';

import { EnumerationCodec, PrimitiveCodec } from '../../../src/serialization/scalar-codecs.js';
import { XmlText } from '../../../src/xml/xml-element.js';
import { enumerationType, primitiveType, typeRef } from '../../support/core-catalog.js';

describe('PrimitiveCodec', () => {
  it('writes the formatted value as one text child without attributes', () => {
    expect(new PrimitiveCodec('dateTime').content('2026-01-31', 'date')).toEqual({
      attributes: [],
      children: [new XmlText('2026-01-31T00:00:00')],
    });
  });

  it('uses the format schema when there is no pattern', () => {
    expect(new PrimitiveCodec('int').schema()).toEqual({
      type: 'integer',
      minimum: -2_147_483_648,
      maximum: 2_147_483_647,
    });
  });

  it('rejects a primitive without a JSON format', () => {
    expect(() => new PrimitiveCodec('hexBinary')).toThrow(
      'No JSON format for the XSD type "hexBinary".',
    );
  });

  it('lets the format reject a value before the pattern is checked', () => {
    const codec = new PrimitiveCodec('string', '[A-Z]+');

    expect(() => codec.content(1, 'code')).toThrow('code: must be a string');
  });

  describe('with a pattern from a named restriction', () => {
    const codec = PrimitiveCodec.of(primitiveType(typeRef('Code'), 'string', '[A-Z]{2}|[0-9]{3}'));

    it('anchors the whole alternation, so a partial match is rejected', () => {
      expect(codec.content('AB', 'code').children).toEqual([new XmlText('AB')]);
      expect(codec.content('123', 'code').children).toEqual([new XmlText('123')]);
      expect(() => codec.content('AB1', 'code')).toThrow(
        'code: must match ^(?:[A-Z]{2}|[0-9]{3})$',
      );
      expect(() => codec.content('x123', 'code')).toThrow('must match');
      expect(() => codec.content('', 'code')).toThrow('must match');
    });

    it('adds the anchored pattern to the schema', () => {
      expect(codec.schema()).toEqual({ type: 'string', pattern: '^(?:[A-Z]{2}|[0-9]{3})$' });
    });
  });

  it('builds from a descriptor without a pattern', () => {
    const codec = PrimitiveCodec.of(primitiveType(typeRef('Amount'), 'decimal'));

    expect(codec.content('10.50', 'amount').children).toEqual([new XmlText('10.50')]);
  });
});

describe('EnumerationCodec', () => {
  const codec = new EnumerationCodec(enumerationType(typeRef('Status'), ['active', 'deleted']));

  it('writes a listed value as text', () => {
    expect(codec.content('deleted', 'status')).toEqual({
      attributes: [],
      children: [new XmlText('deleted')],
    });
  });

  it.each(['Active', 'unknown', '', 1, null])(
    'rejects %j and lists the allowed values',
    (value) => {
      expect(() => codec.content(value, 'status')).toThrow(
        'status: must be one of active, deleted',
      );
    },
  );

  it('publishes the values as a string enum', () => {
    expect(codec.schema()).toEqual({ type: 'string', enum: ['active', 'deleted'] });
  });
});
