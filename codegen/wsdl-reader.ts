import { QualifiedName } from '../src/xml/qualified-name.js';
import type { XmlElement } from '../src/xml/xml-element.js';

export const WsdlNamespace = {
  wsdl: 'http://schemas.xmlsoap.org/wsdl/',
  soap11: 'http://schemas.xmlsoap.org/wsdl/soap/',
} as const;

const wsdl = (local: string): QualifiedName => QualifiedName.of(WsdlNamespace.wsdl, local);
const soap = (local: string): QualifiedName => QualifiedName.of(WsdlNamespace.soap11, local);
const unqualified = (local: string): QualifiedName => QualifiedName.unqualified(local);

export interface WsdlOperation {
  readonly name: string;
  readonly soapAction: string;
  readonly documentation: string;
  readonly hasHeader: boolean;
  /** The element of the input message part. */
  readonly inputElement: QualifiedName;
}

/** Reads the SOAP 1.1 binding of one WSDL document. */
export class WsdlReader {
  constructor(private readonly definitions: XmlElement) {}

  inlineSchemas(): XmlElement[] {
    return this.definitions.child(wsdl('types'))?.elements() ?? [];
  }

  servicePath(): string {
    const address = this.definitions
      .child(wsdl('service'))
      ?.elements()
      .map((port) => port.child(soap('address')))
      .find((candidate) => candidate !== undefined);

    return new URL(this.required(address, 'location')).pathname;
  }

  operations(): WsdlOperation[] {
    return this.soapBinding()
      .elements()
      .filter((node) => node.name.equals(wsdl('operation')))
      .map((node) => this.readOperation(node));
  }

  private soapBinding(): XmlElement {
    const binding = this.definitions
      .elements()
      .find((node) => node.name.equals(wsdl('binding')) && node.child(soap('binding')));
    if (binding === undefined) {
      throw new Error('The WSDL has no SOAP 1.1 binding.');
    }

    return binding;
  }

  private readOperation(node: XmlElement): WsdlOperation {
    const name = this.required(node, 'name');
    const portOperation = this.portTypeOperation(name);
    const input = node.child(wsdl('input'));

    return {
      name,
      soapAction: this.required(node.child(soap('operation')), 'soapAction'),
      documentation: portOperation.child(wsdl('documentation'))?.textContent().trim() ?? '',
      hasHeader: input?.child(soap('header')) !== undefined,
      inputElement: this.inputElement(portOperation),
    };
  }

  private portTypeOperation(name: string): XmlElement {
    const operation = this.definitions
      .child(wsdl('portType'))
      ?.elements()
      .find((node) => node.attribute(unqualified('name')) === name);
    if (operation === undefined) {
      throw new Error(`The port type has no operation "${name}".`);
    }

    return operation;
  }

  private inputElement(portOperation: XmlElement): QualifiedName {
    const input = portOperation.child(wsdl('input'));
    const messageName = portOperation.resolveQualifiedValue(this.required(input, 'message'));
    const message = this.definitions
      .elements()
      .find(
        (node) =>
          node.name.equals(wsdl('message')) &&
          node.attribute(unqualified('name')) === messageName.local,
      );
    const part = message?.elements().find((node) => node.name.equals(wsdl('part')));

    return portOperation.resolveQualifiedValue(this.required(part, 'element'));
  }

  private required(node: XmlElement | undefined, attribute: string): string {
    const value = node?.attribute(unqualified(attribute));
    if (typeof value !== 'string') {
      throw new Error(`Missing WSDL attribute "${attribute}".`);
    }

    return value;
  }
}
