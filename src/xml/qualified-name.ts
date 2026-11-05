export const XmlNamespace = {
  none: '',
  xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/',
  xsi: 'http://www.w3.org/2001/XMLSchema-instance',
  xsd: 'http://www.w3.org/2001/XMLSchema',
  soapEnvelope: 'http://schemas.xmlsoap.org/soap/envelope/',
  twinfield: 'http://www.twinfield.com/',
} as const;

// An XML NCName: a letter or underscore first, then letters, digits, `.`, `-`, `_`, marks.
const XML_NAME = /^[\p{L}_][\p{L}\p{N}\p{M}._-]*$/u;

export class QualifiedName {
  private constructor(
    readonly namespace: string,
    readonly local: string,
  ) {}

  static of(namespace: string, local: string): QualifiedName {
    if (!XML_NAME.test(local)) {
      throw new Error(`Invalid XML name: ${JSON.stringify(local)}`);
    }

    return new QualifiedName(namespace, local);
  }

  static unqualified(local: string): QualifiedName {
    return QualifiedName.of(XmlNamespace.none, local);
  }

  equals(other: QualifiedName): boolean {
    return this.namespace === other.namespace && this.local === other.local;
  }

  toKey(): string {
    return `{${this.namespace}}${this.local}`;
  }

  toString(): string {
    return this.toKey();
  }
}
