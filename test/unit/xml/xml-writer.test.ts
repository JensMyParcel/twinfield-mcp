import { describe, expect, it } from 'vitest';

import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import { XmlElement, XmlText, type XmlAttribute } from '../../../src/xml/xml-element.js';
import { XmlReader } from '../../../src/xml/xml-reader.js';
import { XmlWriter } from '../../../src/xml/xml-writer.js';

const plain = (local: string) => QualifiedName.unqualified(local);
const twinfield = (local: string) => QualifiedName.of(XmlNamespace.twinfield, local);
const XSI_TYPE = QualifiedName.of(XmlNamespace.xsi, 'type');

function write(element: XmlElement): string {
  return new XmlWriter().write(element);
}

function withAttribute(value: string): XmlElement {
  return new XmlElement(plain('a'), [{ name: plain('v'), value }]);
}

const FORBIDDEN = ['\u0000', '\u0001', '\u0008', '\u000B', '\u000C', '\u000E', '\u001F', '￾', '￿'];

describe('XmlWriter', () => {
  it('writes an element without content as a self-closing tag', () => {
    expect(write(new XmlElement(plain('a')))).toBe('<a/>');
    expect(write(XmlElement.withText(plain('a'), ''))).toBe('<a/>');
  });

  it('writes children in order, nested', () => {
    const root = new XmlElement(
      plain('a'),
      [],
      [
        XmlElement.withText(plain('b'), '1'),
        new XmlText('mid'),
        new XmlElement(plain('c'), [], [XmlElement.withText(plain('d'), '2')]),
      ],
    );

    expect(write(root)).toBe('<a><b>1</b>mid<c><d>2</d></c></a>');
  });

  it('declares a default namespace once and does not repeat it for children in that namespace', () => {
    const root = new XmlElement(twinfield('a'), [], [XmlElement.withText(twinfield('b'), 'x')]);

    expect(write(root)).toBe('<a xmlns="http://www.twinfield.com/"><b>x</b></a>');
  });

  it('resets the default namespace for a child in no namespace', () => {
    const root = new XmlElement(twinfield('a'), [], [new XmlElement(plain('b'))]);

    expect(write(root)).toBe('<a xmlns="http://www.twinfield.com/"><b xmlns=""/></a>');
  });

  it('writes an unqualified attribute without a prefix', () => {
    expect(write(withAttribute('1'))).toBe('<a v="1"/>');
  });

  it('declares a prefix for a namespaced attribute and reuses it in descendants', () => {
    const nil: XmlAttribute = { name: QualifiedName.of(XmlNamespace.xsi, 'nil'), value: 'true' };
    const root = new XmlElement(plain('a'), [nil], [new XmlElement(plain('b'), [nil])]);

    expect(write(root)).toBe(
      '<a xmlns:p1="http://www.w3.org/2001/XMLSchema-instance" p1:nil="true"><b p1:nil="true"/></a>',
    );
  });

  it('does not leak a prefix declared on one sibling into the next sibling', () => {
    const nil: XmlAttribute = { name: QualifiedName.of(XmlNamespace.xsi, 'nil'), value: 'true' };
    const root = new XmlElement(
      plain('a'),
      [],
      [new XmlElement(plain('b'), [nil]), new XmlElement(plain('c'), [nil])],
    );

    expect(write(root)).toBe(
      '<a><b xmlns:p1="http://www.w3.org/2001/XMLSchema-instance" p1:nil="true"/>' +
        '<c xmlns:p2="http://www.w3.org/2001/XMLSchema-instance" p2:nil="true"/></a>',
    );
  });

  it('declares prefixes for both the name and the QName value of xsi:type', () => {
    const root = new XmlElement(twinfield('Command'), [
      { name: XSI_TYPE, value: twinfield('GetOffices') },
    ]);

    expect(write(root)).toBe(
      '<Command xmlns="http://www.twinfield.com/" xmlns:p1="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xmlns:p2="http://www.twinfield.com/" p1:type="p2:GetOffices"/>',
    );
  });

  it('writes a QName value in no namespace as its local name', () => {
    const root = new XmlElement(plain('a'), [{ name: plain('kind'), value: plain('Local') }]);

    expect(write(root)).toBe('<a kind="Local"/>');
  });

  it('starts prefix numbering again for every document', () => {
    const writer = new XmlWriter();
    const root = new XmlElement(plain('a'), [{ name: XSI_TYPE, value: 'x' }]);

    expect(writer.write(root)).toContain('p1:type');
    expect(writer.write(root)).toContain('p1:type');
  });

  it('escapes &, < and > in text', () => {
    const root = XmlElement.withText(plain('a'), 'a & b < c > d "q"');

    expect(write(root)).toBe('<a>a &amp; b &lt; c &gt; d "q"</a>');
  });

  it('escapes quotes and white space characters that attribute normalisation would change', () => {
    expect(write(withAttribute('&<>"\t\n\r'))).toBe('<a v="&amp;&lt;&gt;&quot;&#9;&#10;&#13;"/>');
  });

  it('escapes a namespace URI inside its declaration', () => {
    const root = new XmlElement(QualifiedName.of('urn:a&"b', 'a'));

    expect(write(root)).toBe('<a xmlns="urn:a&amp;&quot;b"/>');
  });

  it.each(FORBIDDEN)('rejects the XML-forbidden character U+%s in text', (character) => {
    expect(() => write(XmlElement.withText(plain('a'), `x${character}y`))).toThrow(
      'Value contains a character that XML 1.0 cannot represent.',
    );
  });

  it.each(FORBIDDEN)(
    'rejects the XML-forbidden character U+%s in an attribute value',
    (character) => {
      expect(() => write(withAttribute(character))).toThrow('cannot represent');
    },
  );

  it('rejects a forbidden character in a namespace URI', () => {
    expect(() => write(new XmlElement(QualifiedName.of('urn:\u0000', 'a')))).toThrow(
      'cannot represent',
    );
  });

  it('writes a carriage return in text as a reference, so line-end normalisation keeps it', () => {
    expect(write(XmlElement.withText(plain('a'), 'x\ry\r\nz'))).toBe('<a>x&#13;y&#13;\nz</a>');
  });

  it('round-trips tab, newline and carriage return in text and attributes through XmlReader', () => {
    const value = 'a\tb\nc\rd\r\ne';
    const root = new XmlElement(plain('a'), [{ name: plain('v'), value }], [new XmlText(value)]);

    const read = new XmlReader().read(write(root));

    expect(read.attribute(plain('v'))).toBe(value);
    expect(read.textContent()).toBe(value);
  });

  it('keeps tab, newline and characters outside the forbidden ranges', () => {
    const text = '\t\n \u007F�\u{1F600}é';

    expect(write(XmlElement.withText(plain('a'), text))).toBe(`<a>${text}</a>`);
  });

  it('writes a document that XmlReader reads back with the same names, values and QNames', () => {
    const root = new XmlElement(
      twinfield('Command'),
      [{ name: XSI_TYPE, value: twinfield('GetOffices') }],
      [
        XmlElement.withText(twinfield('Code'), 'A&B <1>'),
        new XmlElement(plain('Plain'), [{ name: plain('v'), value: 'x "y"' }]),
      ],
    );

    const read = new XmlReader().read(write(root));

    expect(read.name).toEqual(twinfield('Command'));
    const type = read.attribute(XSI_TYPE);
    expect(typeof type).toBe('string');
    expect(read.resolveQualifiedValue(type as string)).toEqual(twinfield('GetOffices'));
    expect(read.child(twinfield('Code'))?.textContent()).toBe('A&B <1>');
    expect(read.child(plain('Plain'))?.attribute(plain('v'))).toBe('x "y"');
  });
});
