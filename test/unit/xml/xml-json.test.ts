import { describe, expect, it } from 'vitest';

import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import { XmlElement, XmlText } from '../../../src/xml/xml-element.js';
import { InvalidXmlPayloadError, JsonToXml, XmlToJson } from '../../../src/xml/xml-json.js';
import { XmlReader } from '../../../src/xml/xml-reader.js';
import { XmlWriter } from '../../../src/xml/xml-writer.js';

const plain = (local: string) => QualifiedName.unqualified(local);

function toJson(xml: string) {
  return new XmlToJson().convert(new XmlReader().read(xml));
}

function toXml(value: unknown, name = 'root'): string {
  return new XmlWriter().write(new JsonToXml().convert(name, value));
}

const XSI = 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';

describe('XmlToJson', () => {
  it('turns an element with text only into a string', () => {
    expect(toJson('<a>001</a>')).toBe('001');
    expect(toJson('<a/>')).toBe('');
  });

  it('turns xsi:nil="true" into null, whatever else the element holds', () => {
    expect(toJson(`<a ${XSI} xsi:nil="true" v="1"><b/></a>`)).toBeNull();
  });

  it('turns xsi:nil="1" into null, as XSD allows 1 for true', () => {
    expect(toJson(`<a ${XSI} xsi:nil="1">x</a>`)).toBeNull();
  });

  it.each(['false', '0', 'TRUE', 'yes', ''])('does not treat xsi:nil=%j as null', (value) => {
    expect(toJson(`<a ${XSI} xsi:nil="${value}"/>`)).toBe('');
  });

  it('drops xsi attributes such as xsi:type from the result', () => {
    expect(toJson(`<a ${XSI} xsi:type="Foo">x</a>`)).toBe('x');
  });

  it('turns attributes into @-prefixed keys and keeps non-blank text as #text', () => {
    expect(toJson('<a code="001" xml:lang="nl">Main</a>')).toEqual({
      '@code': '001',
      '@lang': 'nl',
      '#text': 'Main',
    });
  });

  it('drops white space between child elements', () => {
    expect(toJson('<a>\n  <b>1</b>\n</a>')).toEqual({ b: '1' });
  });

  it('keeps a single child as a value and repeated children as an array', () => {
    expect(toJson('<a><one>1</one><many>x</many><many><c>y</c></many></a>')).toEqual({
      one: '1',
      many: ['x', { c: 'y' }],
    });
  });

  it('groups children by local name, also across namespaces', () => {
    expect(toJson('<a xmlns:q="urn:q"><b>1</b><q:b>2</q:b></a>')).toEqual({ b: ['1', '2'] });
  });

  it('prints a QName attribute value in Clark notation', () => {
    const element = new XmlElement(plain('a'), [
      { name: plain('kind'), value: QualifiedName.of(XmlNamespace.twinfield, 'Office') },
    ]);

    expect(new XmlToJson().convert(element)).toEqual({
      '@kind': '{http://www.twinfield.com/}Office',
    });
  });
});

describe('JsonToXml', () => {
  it('writes scalars as text', () => {
    expect(toXml('a&b')).toBe('<root>a&amp;b</root>');
    expect(toXml(12.5)).toBe('<root>12.5</root>');
    expect(toXml(false)).toBe('<root>false</root>');
  });

  it('writes null as an empty element', () => {
    expect(toXml(null)).toBe('<root/>');
  });

  it('writes attributes, text and children in property order', () => {
    expect(toXml({ '@code': '001', '#text': 'Main', name: 'X', '@active': true })).toBe(
      '<root code="001" active="true">Main<name>X</name></root>',
    );
  });

  it('writes an array as repeated elements, with null items as empty elements', () => {
    expect(toXml({ line: [{ id: 1 }, null, 'x'] })).toBe(
      '<root><line><id>1</id></line><line/><line>x</line></root>',
    );
  });

  it('writes an empty array as no elements', () => {
    expect(toXml({ line: [] })).toBe('<root/>');
  });

  it('round-trips through XmlWriter, XmlReader and XmlToJson', () => {
    const payload = {
      '@result': '1',
      office: '001',
      lines: { line: [{ value: '10' }, { value: '-5' }] },
    };

    expect(toJson(toXml(payload))).toEqual(payload);
  });

  describe('rejects', () => {
    const convert =
      (value: unknown, name = 'root') =>
      () =>
        new JsonToXml().convert(name, value);

    it.each([
      ['a nested array', { line: [[1]] }, 'root.line[0]: arrays cannot be nested.'],
      [
        'an array at the root',
        [1],
        'root: must be an object, a string, a number, a boolean or null.',
      ],
      ['undefined', undefined, 'root: must be an object'],
      ['a function', () => 1, 'root: must be an object'],
      ['NaN', Number.NaN, 'root: must be an object'],
      ['Infinity', Number.POSITIVE_INFINITY, 'root: must be an object'],
      ['a nested non-finite number', { a: { b: -Infinity } }, 'root.a.b: must be an object'],
      [
        'an object as an attribute value',
        { '@code': { x: 1 } },
        'root.@code: must be a string, a number or a boolean.',
      ],
      [
        'null as an attribute value',
        { '@code': null },
        'root.@code: must be a string, a number or a boolean.',
      ],
      ['NaN as an attribute value', { '@code': Number.NaN }, 'root.@code: must be a string'],
      [
        'an object as #text',
        { '#text': { x: 1 } },
        'root.#text: must be a string, a number or a boolean.',
      ],
      ['an invalid child name', { '1bad': 'x' }, 'root.1bad: "1bad" is not a valid XML name.'],
      ['a child name with a prefix', { 'q:a': 'x' }, 'root.q:a: "q:a" is not a valid XML name.'],
      ['an empty attribute name', { '@': 'x' }, 'root.@: "" is not a valid XML name.'],
      ['an invalid attribute name', { '@a b': 'x' }, 'root.@a b: "a b" is not a valid XML name.'],
      [
        'an invalid item name inside an array',
        { 'a b': ['x'] },
        'root.a b[0]: "a b" is not a valid XML name.',
      ],
    ])('%s', (_case, value, message) => {
      expect(convert(value)).toThrow(InvalidXmlPayloadError);
      expect(convert(value)).toThrow(message);
    });

    it('an invalid root name', () => {
      expect(convert('x', 'not valid')).toThrow('not valid: "not valid" is not a valid XML name.');
    });
  });

  it('names its error', () => {
    expect(new InvalidXmlPayloadError('x').name).toBe('InvalidXmlPayloadError');
  });

  it('builds element trees, not strings', () => {
    const element = new JsonToXml().convert('a', { '#text': 'x' });

    expect(element.children).toEqual([new XmlText('x')]);
  });
});
