import { describe, expect, it } from 'vitest';

import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import { XmlText } from '../../../src/xml/xml-element.js';
import { XmlParseError, XmlReader } from '../../../src/xml/xml-reader.js';

const plain = (local: string) => QualifiedName.unqualified(local);
const twinfield = (local: string) => QualifiedName.of(XmlNamespace.twinfield, local);

function read(xml: string) {
  return new XmlReader().read(xml);
}

describe('XmlReader', () => {
  describe('rejects', () => {
    it.each([
      '<!DOCTYPE a><a/>',
      '<!doctype a><a/>',
      '<?xml version="1.0"?><!DOCTYPE lol [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;">]><a>&lol2;</a>',
    ])('a document type declaration: %j', (xml) => {
      expect(() => read(xml)).toThrow(
        new XmlParseError('XML with a document type declaration is not accepted.'),
      );
    });

    it.each([
      '',
      '   ',
      'just text',
      '<a>',
      '<a></b>',
      '<a/>trailing',
      '<a x="1" x="2"/>',
      '<a x=1/>',
    ])('malformed XML: %j', (xml) => {
      expect(() => read(xml)).toThrow(XmlParseError);
      expect(() => read(xml)).toThrow(/^Malformed XML: /);
    });

    it('a document with two root elements', () => {
      expect(() => read('<a/><b/>')).toThrow(
        new XmlParseError('XML must have exactly one root element.'),
      );
    });

    it('an element with an undeclared prefix', () => {
      expect(() => read('<q:a/>')).toThrow(new XmlParseError('Undeclared namespace prefix: q'));
    });

    it('an attribute with an undeclared prefix', () => {
      expect(() => read('<a q:v="1"/>')).toThrow(
        new XmlParseError('Undeclared namespace prefix: q'),
      );
    });

    it('a prefix that is declared only on a sibling', () => {
      expect(() => read('<a><b xmlns:q="urn:q"/><q:c/></a>')).toThrow(
        'Undeclared namespace prefix: q',
      );
    });
  });

  it('marks parse errors with their own error name', () => {
    expect(new XmlParseError('x').name).toBe('XmlParseError');
  });

  it('ignores the XML declaration, comments, processing instructions and surrounding white space', () => {
    const root = read('<?xml version="1.0" encoding="utf-8"?>\n<!-- c -->\n<?pi x?>\n<a/>\n');

    expect(root.name).toEqual(plain('a'));
    expect(root.children).toEqual([]);
  });

  it('puts an unprefixed element in the default namespace and inherits it to children', () => {
    const root = read('<a xmlns="http://www.twinfield.com/"><b/></a>');

    expect(root.name).toEqual(twinfield('a'));
    expect(root.elements()[0]!.name).toEqual(twinfield('b'));
  });

  it('keeps an unprefixed attribute in no namespace even under a default namespace', () => {
    const root = read('<a xmlns="http://www.twinfield.com/" v="1"/>');

    expect(root.attributes).toEqual([{ name: plain('v'), value: '1' }]);
  });

  it('removes namespace declarations from the attributes and records them on the element', () => {
    const root = read('<a xmlns="urn:d" xmlns:q="urn:q" q:v="1"/>');

    expect(root.attributes).toEqual([{ name: QualifiedName.of('urn:q', 'v'), value: '1' }]);
    expect(root.namespaces.get('')).toBe('urn:d');
    expect(root.namespaces.get('q')).toBe('urn:q');
  });

  it('predeclares the xml prefix', () => {
    const root = read('<a xml:lang="nl"/>');

    expect(root.attribute(QualifiedName.of(XmlNamespace.xml, 'lang'))).toBe('nl');
  });

  it('lets a child redeclare a prefix without changing the parent scope', () => {
    const root = read('<q:a xmlns:q="urn:one"><q:b xmlns:q="urn:two"/><q:c/></q:a>');
    const [b, c] = root.elements();

    expect(root.name).toEqual(QualifiedName.of('urn:one', 'a'));
    expect(b!.name).toEqual(QualifiedName.of('urn:two', 'b'));
    expect(c!.name).toEqual(QualifiedName.of('urn:one', 'c'));
  });

  it('undeclares the default namespace with xmlns=""', () => {
    const root = read('<a xmlns="urn:d"><b xmlns=""/></a>');

    expect(root.elements()[0]!.name).toEqual(plain('b'));
  });

  it('resolves an xsi:type QName value through the namespaces in scope', () => {
    const root = read(
      '<Command xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:q1="http://www.twinfield.com/"' +
        ' xsi:type="q1:GetOffices"/>',
    );
    const type = root.attribute(QualifiedName.of(XmlNamespace.xsi, 'type'));

    expect(type).toBe('q1:GetOffices');
    expect(root.resolveQualifiedValue(type as string)).toEqual(twinfield('GetOffices'));
  });

  it('keeps text and attribute values as strings, untrimmed and unparsed', () => {
    const root = read('<a v="true"> 007 </a>');

    expect(root.attribute(plain('v'))).toBe('true');
    expect(root.children).toEqual([new XmlText(' 007 ')]);
  });

  it('decodes the predefined entities in text and attributes', () => {
    const root = read('<a v="&lt;&gt;&quot;&apos;&amp;">&lt;&gt;&quot;&apos;&amp;lt;</a>');

    expect(root.attribute(plain('v'))).toBe('<>"\'&');
    expect(root.textContent()).toBe('<>"\'&lt;');
  });

  it('decodes decimal and hexadecimal character references in text and attributes', () => {
    const root = read('<a v="&#9;&#10;&#13;&#x41;">&#233;&#xE9;&#xe9;&#x1F600;&#x10FFFF;</a>');

    expect(root.attribute(plain('v'))).toBe('\t\n\rA');
    expect(root.textContent()).toBe('ééé\u{1F600}\u{10FFFF}');
  });

  it('decodes in one pass, so an escaped ampersand before a reference stays literal', () => {
    expect(read('<a v="&amp;#65;">&amp;#233; &amp;amp;</a>').textContent()).toBe('&#233; &amp;');
    expect(read('<a v="&amp;#65;"/>').attribute(plain('v'))).toBe('&#65;');
  });

  it.each(['&nbsp;', '&constructor;', '&toString;', '&__proto__;'])(
    'keeps the unknown named reference %s literal',
    (reference) => {
      expect(read(`<a>${reference}</a>`).textContent()).toBe(reference);
    },
  );

  it.each([
    '&#0;',
    '&#x0;',
    '&#1;',
    '&#xD800;',
    '&#xFFFE;',
    '&#x110000;',
    '&#1114112;',
    '&#99999999999;',
  ])('rejects the character reference %s, which is no XML 1.0 Char', (reference) => {
    expect(() => read(`<a>${reference}</a>`)).toThrow(
      new XmlParseError(`Invalid character reference ${reference}.`),
    );
    expect(() => read(`<a v="${reference}"/>`)).toThrow(XmlParseError);
  });

  it('accepts Unicode element and attribute names', () => {
    const root = read('<façade naïve="1"><日本/></façade>');

    expect(root.name).toEqual(plain('façade'));
    expect(root.attribute(plain('naïve'))).toBe('1');
    expect(root.elements()[0]!.name).toEqual(plain('日本'));
  });

  it.each([
    ['an element', '<a·b/>', 'Invalid XML name: "a·b"'],
    ['an attribute', '<a b·c="1"/>', 'Invalid XML name: "b·c"'],
    ['a prefixed element', '<q:a·b xmlns:q="urn:q"/>', 'Invalid XML name: "q:a·b"'],
  ])('reports %s name that QualifiedName rejects as an XmlParseError', (_case, xml, message) => {
    expect(() => read(xml)).toThrow(new XmlParseError(message));
  });

  it('reads CDATA as text', () => {
    expect(read('<a><![CDATA[<x> & y]]></a>').textContent()).toBe('<x> & y');
  });

  it('keeps mixed content in document order', () => {
    const root = read('<a>one<b>two</b>three</a>');

    expect(
      root.children.map((child) => (child instanceof XmlText ? child.text : child.name.local)),
    ).toEqual(['one', 'b', 'three']);
  });
});
