import { QualifiedName, XmlNamespace } from './qualified-name.js';

export type XmlAttributeValue = string | QualifiedName;

export interface XmlAttribute {
  readonly name: QualifiedName;
  readonly value: XmlAttributeValue;
}

export type XmlNode = XmlElement | XmlText;

export class XmlText {
  constructor(readonly text: string) {}
}

export class XmlElement {
  constructor(
    readonly name: QualifiedName,
    readonly attributes: readonly XmlAttribute[] = [],
    readonly children: readonly XmlNode[] = [],
    readonly namespaces: ReadonlyMap<string, string> = new Map(),
  ) {}

  static withText(name: QualifiedName, text: string): XmlElement {
    return new XmlElement(name, [], [new XmlText(text)]);
  }

  elements(): XmlElement[] {
    return this.children.filter((child) => child instanceof XmlElement);
  }

  child(name: QualifiedName): XmlElement | undefined {
    return this.elements().find((element) => element.name.equals(name));
  }

  childByLocalName(local: string): XmlElement | undefined {
    return this.elements().find((element) => element.name.local === local);
  }

  attribute(name: QualifiedName): XmlAttributeValue | undefined {
    return this.attributes.find((attribute) => attribute.name.equals(name))?.value;
  }

  /** Resolves a prefixed name inside an attribute value, such as `type="q1:Command"`. */
  resolveQualifiedValue(value: string): QualifiedName {
    const separator = value.indexOf(':');
    const prefix = separator === -1 ? '' : value.slice(0, separator);
    const namespace =
      this.namespaces.get(prefix) ?? (prefix === '' ? XmlNamespace.none : undefined);
    if (namespace === undefined) {
      throw new Error(`Undeclared namespace prefix in ${JSON.stringify(value)}`);
    }

    return QualifiedName.of(namespace, value.slice(separator + 1));
  }

  textContent(): string {
    return this.children
      .map((child) => (child instanceof XmlText ? child.text : child.textContent()))
      .join('');
  }
}
