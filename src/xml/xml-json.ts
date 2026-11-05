import { QualifiedName, XmlNamespace } from './qualified-name.js';
import { XmlElement, XmlText, type XmlAttribute, type XmlNode } from './xml-element.js';

export const ATTRIBUTE_PREFIX = '@';
export const TEXT_KEY = '#text';

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const XSI_NIL = QualifiedName.of(XmlNamespace.xsi, 'nil');

/**
 * Converts XML to JSON: attributes become `@name`, repeated elements become arrays, an element
 * with text only becomes a string, and `xsi:nil` becomes null.
 */
export class XmlToJson {
  convert(element: XmlElement): JsonValue {
    const nil = element.attribute(XSI_NIL);
    if (nil === 'true' || nil === '1') {
      return null;
    }
    const attributes = element.attributes.filter(
      (attribute) => attribute.name.namespace !== XmlNamespace.xsi,
    );
    const children = element.elements();
    const text = element.children
      .filter((child) => child instanceof XmlText)
      .map((child) => child.text)
      .join('');
    if (attributes.length === 0 && children.length === 0) {
      return text;
    }

    return {
      ...Object.fromEntries(
        attributes.map((attribute) => [
          `${ATTRIBUTE_PREFIX}${attribute.name.local}`,
          String(attribute.value),
        ]),
      ),
      ...(text.trim() === '' ? {} : { [TEXT_KEY]: text }),
      ...this.convertChildren(children),
    };
  }

  private convertChildren(children: readonly XmlElement[]): Record<string, JsonValue> {
    const grouped = new Map<string, JsonValue[]>();
    for (const child of children) {
      const values = grouped.get(child.name.local) ?? [];
      values.push(this.convert(child));
      grouped.set(child.name.local, values);
    }

    return Object.fromEntries(
      [...grouped].map(([name, values]) => [
        name,
        values.length === 1 ? (values[0] as JsonValue) : values,
      ]),
    );
  }
}

export class InvalidXmlPayloadError extends Error {
  override readonly name = 'InvalidXmlPayloadError';
}

/** The reverse of `XmlToJson`, for payloads without namespaces such as ProcessXml messages. */
export class JsonToXml {
  convert(name: string, value: unknown, path = name): XmlElement {
    const qualifiedName = this.name(name, path);
    if (value === null) {
      return new XmlElement(qualifiedName);
    }
    if (isScalar(value)) {
      return XmlElement.withText(qualifiedName, String(value));
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new InvalidXmlPayloadError(
        `${path}: must be an object, a string, a number, a boolean or null.`,
      );
    }
    const attributes: XmlAttribute[] = [];
    const children: XmlNode[] = [];
    for (const [key, child] of Object.entries(value)) {
      this.addEntry(key, child, `${path}.${key}`, attributes, children);
    }

    return new XmlElement(qualifiedName, attributes, children);
  }

  private addEntry(
    key: string,
    value: unknown,
    path: string,
    attributes: XmlAttribute[],
    children: XmlNode[],
  ): void {
    if (key === TEXT_KEY) {
      children.push(new XmlText(this.scalar(value, path)));
    } else if (key.startsWith(ATTRIBUTE_PREFIX)) {
      attributes.push({
        name: this.name(key.slice(ATTRIBUTE_PREFIX.length), path),
        value: this.scalar(value, path),
      });
    } else if (Array.isArray(value)) {
      value.forEach((item: unknown, index) => {
        if (Array.isArray(item)) {
          throw new InvalidXmlPayloadError(`${path}[${index}]: arrays cannot be nested.`);
        }
        children.push(this.convert(key, item, `${path}[${index}]`));
      });
    } else {
      children.push(this.convert(key, value, path));
    }
  }

  private scalar(value: unknown, path: string): string {
    if (!isScalar(value)) {
      throw new InvalidXmlPayloadError(`${path}: must be a string, a number or a boolean.`);
    }

    return String(value);
  }

  private name(local: string, path: string): QualifiedName {
    try {
      return QualifiedName.unqualified(local);
    } catch {
      throw new InvalidXmlPayloadError(
        `${path}: ${JSON.stringify(local)} is not a valid XML name.`,
      );
    }
  }
}

function isScalar(value: unknown): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}
