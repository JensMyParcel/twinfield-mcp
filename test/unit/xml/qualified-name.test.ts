import { describe, expect, it } from 'vitest';

import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';

describe('QualifiedName', () => {
  it.each([
    'a',
    'A',
    '_private',
    'Name.With-Dots_1',
    'x123',
    'é',
    'naïve',
    'Ωmega',
    '日本',
    'e\u0301',
  ])('accepts the XML name %j', (local) => {
    const name = QualifiedName.of(XmlNamespace.twinfield, local);

    expect(name.local).toBe(local);
    expect(name.namespace).toBe(XmlNamespace.twinfield);
  });

  it.each([
    '',
    '1abc',
    '-abc',
    '.abc',
    '\u0301a',
    '١abc',
    'a b',
    'a:b',
    'a<b',
    'a\n',
    'a/b',
    'a&b',
  ])('rejects the invalid XML name %j', (local) => {
    expect(() => QualifiedName.of(XmlNamespace.none, local)).toThrow(
      `Invalid XML name: ${JSON.stringify(local)}`,
    );
  });

  it('builds an unqualified name in no namespace', () => {
    expect(QualifiedName.unqualified('Office').namespace).toBe('');
  });

  it('rejects an invalid unqualified name', () => {
    expect(() => QualifiedName.unqualified('1')).toThrow('Invalid XML name');
  });

  it('is equal only when both namespace and local name match', () => {
    const name = QualifiedName.of(XmlNamespace.twinfield, 'Office');

    expect(name.equals(QualifiedName.of(XmlNamespace.twinfield, 'Office'))).toBe(true);
    expect(name.equals(QualifiedName.of(XmlNamespace.xsd, 'Office'))).toBe(false);
    expect(name.equals(QualifiedName.of(XmlNamespace.twinfield, 'office'))).toBe(false);
  });

  it('prints the Clark notation key, also through toString and string conversion', () => {
    const name = QualifiedName.of(XmlNamespace.xsi, 'type');

    expect(name.toKey()).toBe('{http://www.w3.org/2001/XMLSchema-instance}type');
    expect(name.toString()).toBe(name.toKey());
    expect(String(name)).toBe(name.toKey());
    expect(QualifiedName.unqualified('a').toKey()).toBe('{}a');
  });
});
