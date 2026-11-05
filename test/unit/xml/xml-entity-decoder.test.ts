import type { EntityDecoderOptions } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';

import { XmlEntityDecoder } from '../../../src/xml/xml-entity-decoder.js';
import { XmlParseError } from '../../../src/xml/xml-parse-error.js';

describe('XmlEntityDecoder', () => {
  const decoder = new XmlEntityDecoder();

  it('decodes the five predefined entities', () => {
    expect(decoder.decode('&amp;&lt;&gt;&quot;&apos;')).toBe('&<>"\'');
  });

  it('decodes decimal and hexadecimal references in either case', () => {
    expect(decoder.decode('&#65;&#x41;&#X41;&#xa9;&#xA9;')).toBe('AA&#X41;©©');
  });

  it('decodes the highest code point', () => {
    expect(decoder.decode('&#x10FFFF;')).toBe('\u{10FFFF}');
  });

  it('decodes each reference once', () => {
    expect(decoder.decode('&amp;lt; &amp;#65; &amp;amp;')).toBe('&lt; &#65; &amp;');
  });

  it.each([
    '&nbsp;',
    '&constructor;',
    '&hasOwnProperty;',
    '&AMP;',
    '&;',
    '&#;',
    '&#x;',
    '&amp',
    '& amp;',
  ])('keeps %j literal', (text) => {
    expect(decoder.decode(text)).toBe(text);
  });

  it.each(['&#0;', '&#00;', '&#x0;', '&#x110000;', '&#1114112;'])('rejects %s', (reference) => {
    expect(() => decoder.decode(`x${reference}y`)).toThrow(
      new XmlParseError(`Invalid character reference ${reference}.`),
    );
  });

  it.each([
    ['&#9;', 0x9],
    ['&#xA;', 0xa],
    ['&#xD;', 0xd],
    ['&#x20;', 0x20],
    ['&#xD7FF;', 0xd7ff],
    ['&#xE000;', 0xe000],
    ['&#xFFFD;', 0xfffd],
    ['&#x10000;', 0x10000],
    ['&#x10FFFF;', 0x10ffff],
  ])('accepts %s, the edge of an XML 1.0 Char range', (reference, codePoint) => {
    expect(decoder.decode(reference)).toBe(String.fromCodePoint(codePoint));
  });

  it.each([
    '&#1;',
    '&#8;',
    '&#xB;',
    '&#xC;',
    '&#xE;',
    '&#x1F;',
    '&#xD800;',
    '&#xDBFF;',
    '&#xDC00;',
    '&#xDFFF;',
    '&#xFFFE;',
    '&#xFFFF;',
    '&#65534;',
  ])('rejects %s, just outside an XML 1.0 Char range', (reference) => {
    expect(() => decoder.decode(reference)).toThrow(
      new XmlParseError(`Invalid character reference ${reference}.`),
    );
  });

  it('leaves text without references unchanged', () => {
    expect(decoder.decode('plain & simple')).toBe('plain & simple');
  });

  it('ignores entities and versions the parser hands over, so only XML entities decode', () => {
    const options: EntityDecoderOptions = new XmlEntityDecoder();

    options.setExternalEntities({ lol: 'lol' });
    options.addInputEntities({ lol: 'lol', amp: 'x' });
    options.setXmlVersion(1.1);
    options.reset();

    expect(options.decode('&lol;&amp;')).toBe('&lol;&');
  });
});
