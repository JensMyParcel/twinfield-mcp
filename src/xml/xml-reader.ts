import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';

import { QualifiedName, XmlNamespace } from './qualified-name.js';
import { XmlElement, XmlText, type XmlAttribute, type XmlNode } from './xml-element.js';
import { XmlEntityDecoder } from './xml-entity-decoder.js';
import { XmlParseError } from './xml-parse-error.js';

type ParsedNode = Record<string, unknown>;
type Namespaces = ReadonlyMap<string, string>;

const ATTRIBUTES_KEY = ':@';
const TEXT_KEY = '#text';

export { XmlParseError } from './xml-parse-error.js';

export class XmlReader {
  private readonly validator = new SyntaxValidator();

  private readonly parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
    processEntities: true,
    entityDecoder: new XmlEntityDecoder(),
    ignoreDeclaration: true,
    ignorePiTags: true,
  });

  read(xml: string): XmlElement {
    // A document type declaration is the entry point for entity expansion attacks, and no
    // Twinfield response carries one, so it is rejected before parsing.
    if (/<!DOCTYPE/i.test(xml)) {
      throw new XmlParseError('XML with a document type declaration is not accepted.');
    }
    this.assertWellFormed(xml);
    const nodes = this.parser.parse(xml) as ParsedNode[];
    const roots = nodes.filter((node) => !(TEXT_KEY in node));
    const [root] = roots;
    if (root === undefined || roots.length !== 1) {
      throw new XmlParseError('XML must have exactly one root element.');
    }

    return toElement(root, new Map([['xml', XmlNamespace.xml]]));
  }

  private assertWellFormed(xml: string): void {
    try {
      this.validator.validate(xml);
    } catch (error) {
      throw new XmlParseError(`Malformed XML: ${(error as Error).message}`);
    }
  }
}

function toElement(node: ParsedNode, inherited: Namespaces): XmlElement {
  const tag = Object.keys(node).find((key) => key !== ATTRIBUTES_KEY) as string;
  const rawAttributes = (node[ATTRIBUTES_KEY] ?? {}) as Record<string, string>;
  const namespaces = declareNamespaces(rawAttributes, inherited);
  const attributes = Object.entries(rawAttributes)
    .filter(([name]) => name !== 'xmlns' && !name.startsWith('xmlns:'))
    .map(([name, value]): XmlAttribute => ({ name: resolve(name, namespaces, false), value }));
  const children = (node[tag] as ParsedNode[]).map((child) => toNode(child, namespaces));

  return new XmlElement(resolve(tag, namespaces, true), attributes, children, namespaces);
}

function toNode(node: ParsedNode, namespaces: Namespaces): XmlNode {
  if (TEXT_KEY in node) {
    return new XmlText(String(node[TEXT_KEY]));
  }

  return toElement(node, namespaces);
}

function declareNamespaces(attributes: Record<string, string>, inherited: Namespaces): Namespaces {
  const namespaces = new Map(inherited);
  for (const [name, value] of Object.entries(attributes)) {
    if (name === 'xmlns') {
      namespaces.set('', value);
    } else if (name.startsWith('xmlns:')) {
      namespaces.set(name.slice('xmlns:'.length), value);
    }
  }

  return namespaces;
}

function resolve(raw: string, namespaces: Namespaces, isElement: boolean): QualifiedName {
  try {
    return resolveName(raw, namespaces, isElement);
  } catch (error) {
    if (error instanceof XmlParseError) {
      throw error;
    }

    throw new XmlParseError(`Invalid XML name: ${JSON.stringify(raw)}`);
  }
}

function resolveName(raw: string, namespaces: Namespaces, isElement: boolean): QualifiedName {
  const separator = raw.indexOf(':');
  if (separator === -1) {
    const namespace = isElement ? (namespaces.get('') ?? XmlNamespace.none) : XmlNamespace.none;

    return QualifiedName.of(namespace, raw);
  }
  const prefix = raw.slice(0, separator);
  const namespace = namespaces.get(prefix);
  if (namespace === undefined) {
    throw new XmlParseError(`Undeclared namespace prefix: ${prefix}`);
  }

  return QualifiedName.of(namespace, raw.slice(separator + 1));
}
