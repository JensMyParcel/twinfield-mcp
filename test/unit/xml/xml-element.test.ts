import { describe, expect, it } from 'vitest';

import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import { XmlElement, XmlText } from '../../../src/xml/xml-element.js';

const twinfield = (local: string) => QualifiedName.of(XmlNamespace.twinfield, local);
const plain = (local: string) => QualifiedName.unqualified(local);

describe('XmlElement', () => {
  it('starts without attributes, children or namespaces', () => {
    const element = new XmlElement(plain('a'));

    expect(element.attributes).toEqual([]);
    expect(element.children).toEqual([]);
    expect(element.namespaces.size).toBe(0);
  });

  it('builds an element with one text child', () => {
    const element = XmlElement.withText(plain('code'), '001');

    expect(element.children).toEqual([new XmlText('001')]);
    expect(element.textContent()).toBe('001');
  });

  it('lists only element children, in document order', () => {
    const first = new XmlElement(plain('first'));
    const second = new XmlElement(plain('second'));
    const element = new XmlElement(
      plain('a'),
      [],
      [new XmlText('x'), first, new XmlText('y'), second],
    );

    expect(element.elements()).toEqual([first, second]);
  });

  it('finds a child by qualified name and ignores the same local name in another namespace', () => {
    const other = new XmlElement(plain('Office'));
    const match = new XmlElement(twinfield('Office'));
    const element = new XmlElement(plain('a'), [], [other, match]);

    expect(element.child(twinfield('Office'))).toBe(match);
    expect(element.child(twinfield('Missing'))).toBeUndefined();
  });

  it('finds the first child by local name in any namespace', () => {
    const first = new XmlElement(twinfield('Office'));
    const element = new XmlElement(plain('a'), [], [first, new XmlElement(plain('Office'))]);

    expect(element.childByLocalName('Office')).toBe(first);
    expect(element.childByLocalName('Missing')).toBeUndefined();
  });

  it('reads an attribute by qualified name and returns undefined when it is absent', () => {
    const type = QualifiedName.of(XmlNamespace.xsi, 'type');
    const element = new XmlElement(plain('a'), [
      { name: plain('type'), value: 'plain' },
      { name: type, value: twinfield('Command') },
    ]);

    expect(element.attribute(type)).toEqual(twinfield('Command'));
    expect(element.attribute(plain('type'))).toBe('plain');
    expect(element.attribute(plain('missing'))).toBeUndefined();
  });

  it('resolves a prefixed attribute value against the declared namespaces', () => {
    const element = new XmlElement(plain('a'), [], [], new Map([['q1', XmlNamespace.twinfield]]));

    expect(element.resolveQualifiedValue('q1:Command')).toEqual(twinfield('Command'));
  });

  it('resolves an unprefixed value against the default namespace', () => {
    const element = new XmlElement(plain('a'), [], [], new Map([['', XmlNamespace.twinfield]]));

    expect(element.resolveQualifiedValue('Command')).toEqual(twinfield('Command'));
  });

  it('resolves an unprefixed value to no namespace when there is no default namespace', () => {
    const element = new XmlElement(plain('a'), [], [], new Map([['q1', XmlNamespace.twinfield]]));

    expect(element.resolveQualifiedValue('Command')).toEqual(plain('Command'));
  });

  it('rejects a value with an undeclared prefix', () => {
    const element = new XmlElement(plain('a'), [], [], new Map([['q1', XmlNamespace.twinfield]]));

    expect(() => element.resolveQualifiedValue('q2:Command')).toThrow(
      'Undeclared namespace prefix in "q2:Command"',
    );
  });

  it('rejects a resolved value whose local part is not an XML name', () => {
    const element = new XmlElement(plain('a'), [], [], new Map([['q1', XmlNamespace.twinfield]]));

    expect(() => element.resolveQualifiedValue('q1:')).toThrow('Invalid XML name');
  });

  it('concatenates the text of all descendants in document order', () => {
    const inner = new XmlElement(
      plain('b'),
      [],
      [new XmlText('2'), XmlElement.withText(plain('c'), '3')],
    );
    const element = new XmlElement(plain('a'), [], [new XmlText('1'), inner, new XmlText('4')]);

    expect(element.textContent()).toBe('1234');
    expect(new XmlElement(plain('empty')).textContent()).toBe('');
  });
});
