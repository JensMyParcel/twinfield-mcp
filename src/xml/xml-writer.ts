import { QualifiedName, XmlNamespace } from './qualified-name.js';
import { XmlElement, XmlText, type XmlAttribute, type XmlNode } from './xml-element.js';

// XML 1.0 forbids these code points even when escaped, so they are rejected instead of dropped.
// eslint-disable-next-line no-control-regex
const FORBIDDEN_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/;

interface Scope {
  readonly defaultNamespace: string;
  readonly prefixes: Map<string, string>;
}

export class XmlWriter {
  private prefixCount = 0;

  write(root: XmlElement): string {
    this.prefixCount = 0;

    return this.writeElement(root, { defaultNamespace: XmlNamespace.none, prefixes: new Map() });
  }

  private writeElement(element: XmlElement, parent: Scope): string {
    const declarations: string[] = [];
    const scope = this.enterElement(element, parent, declarations);
    const attributes = element.attributes.map((attribute) =>
      this.writeAttribute(attribute, scope, declarations),
    );
    const head = [element.name.local, ...declarations, ...attributes].join(' ');
    const body = element.children.map((child) => this.writeNode(child, scope)).join('');

    return body === '' ? `<${head}/>` : `<${head}>${body}</${element.name.local}>`;
  }

  private enterElement(element: XmlElement, parent: Scope, declarations: string[]): Scope {
    if (element.name.namespace === parent.defaultNamespace) {
      return { defaultNamespace: parent.defaultNamespace, prefixes: new Map(parent.prefixes) };
    }
    declarations.push(`xmlns="${escapeAttribute(element.name.namespace)}"`);

    return { defaultNamespace: element.name.namespace, prefixes: new Map(parent.prefixes) };
  }

  private writeAttribute(attribute: XmlAttribute, scope: Scope, declarations: string[]): string {
    const name = this.qualify(attribute.name, scope, declarations);
    const value =
      attribute.value instanceof QualifiedName
        ? this.qualify(attribute.value, scope, declarations)
        : attribute.value;

    return `${name}="${escapeAttribute(value)}"`;
  }

  private qualify(name: QualifiedName, scope: Scope, declarations: string[]): string {
    if (name.namespace === XmlNamespace.none) {
      return name.local;
    }
    const known = scope.prefixes.get(name.namespace);
    if (known !== undefined) {
      return `${known}:${name.local}`;
    }
    this.prefixCount += 1;
    const prefix = `p${this.prefixCount}`;
    scope.prefixes.set(name.namespace, prefix);
    declarations.push(`xmlns:${prefix}="${escapeAttribute(name.namespace)}"`);

    return `${prefix}:${name.local}`;
  }

  private writeNode(node: XmlNode, scope: Scope): string {
    if (node instanceof XmlText) {
      return escapeText(node.text);
    }

    return this.writeElement(node, scope);
  }
}

function assertWritable(value: string): void {
  if (FORBIDDEN_CHARACTERS.test(value)) {
    throw new Error('Value contains a character that XML 1.0 cannot represent.');
  }
}

function escapeText(value: string): string {
  assertWritable(value);

  // A literal CR would reach the reader as LF (end-of-line normalisation), so it is a reference.
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\r', '&#13;');
}

function escapeAttribute(value: string): string {
  return escapeText(value)
    .replaceAll('"', '&quot;')
    .replaceAll('\t', '&#9;')
    .replaceAll('\n', '&#10;');
}
