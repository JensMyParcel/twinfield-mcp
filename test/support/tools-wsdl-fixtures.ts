import type { ServiceDocuments } from '../../codegen/catalog-builder.js';
import { OperationEffect, SoapProtocol } from '../../src/catalog/catalog-types.js';
import type { XmlElement } from '../../src/xml/xml-element.js';
import { XmlReader } from '../../src/xml/xml-reader.js';

export const Namespace = {
  wsdl: 'http://schemas.xmlsoap.org/wsdl/',
  soap11: 'http://schemas.xmlsoap.org/wsdl/soap/',
  soap12: 'http://schemas.xmlsoap.org/wsdl/soap12/',
  xsd: 'http://www.w3.org/2001/XMLSchema',
  twinfield: 'http://www.twinfield.com/',
  contract: 'http://schemas.datacontract.org/2004/07/Twinfield.WebServices',
  service: 'http://schemas.datacontract.org/2004/07/Twinfield.WebServices.ThingService',
} as const;

const reader = new XmlReader();

export function parse(xml: string): XmlElement {
  return reader.read(xml);
}

/** An XSD `schema` element with the `xs` and `tns` prefixes declared. */
export function schema(content: string, targetNamespace: string = Namespace.service): XmlElement {
  return parse(
    `<xs:schema xmlns:xs="${Namespace.xsd}" xmlns:tns="${targetNamespace}" targetNamespace="${targetNamespace}">${content}</xs:schema>`,
  );
}

export interface WsdlParts {
  readonly types: string;
  readonly messages: string;
  readonly portType: string;
  readonly bindings: string;
  readonly service: string;
}

export interface SyntheticOperation {
  readonly name: string;
  readonly hasHeader?: boolean;
  readonly documentation?: string;
}

const SOAP12_PORT = `<wsdl:port name="Soap12" binding="tns:Soap12"><soap12:address location="https://api.accounting.twinfield.com/webservices/soap12.asmx"/></wsdl:port>`;

export function serviceAt(location: string): string {
  return `<wsdl:service name="Thing">${SOAP12_PORT}<wsdl:port name="Soap" binding="tns:Soap"><soap:address location="${location}"/></wsdl:port></wsdl:service>`;
}

export function soapBinding(operations: string): string {
  return (
    `<wsdl:binding name="Soap12" type="tns:Port"><soap12:binding transport="http://schemas.xmlsoap.org/soap/http"/></wsdl:binding>` +
    `<wsdl:binding name="Soap" type="tns:Port"><soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>${operations}</wsdl:binding>`
  );
}

function bindingOperation({ name, hasHeader }: SyntheticOperation): string {
  const header =
    hasHeader === false ? '' : '<soap:header message="tns:HeaderIn" part="Header" use="literal"/>';

  return `<wsdl:operation name="${name}"><soap:operation soapAction="http://www.twinfield.com/${name}" style="document"/><wsdl:input>${header}<soap:body use="literal"/></wsdl:input></wsdl:operation>`;
}

function portOperation({ name, documentation }: SyntheticOperation, message: string): string {
  const docs =
    documentation === undefined ? '' : `<wsdl:documentation>${documentation}</wsdl:documentation>`;

  return `<wsdl:operation name="${name}">${docs}<wsdl:input message="tns:${message}"/></wsdl:operation>`;
}

/** An ASMX service: one wrapper element per operation, each with one optional `text` string. */
export function asmxParts(operations: readonly SyntheticOperation[]): WsdlParts {
  const elements = operations
    .map(
      ({ name }) =>
        `<s:element name="${name}"><s:complexType><s:sequence><s:element minOccurs="0" name="text" type="s:string"/></s:sequence></s:complexType></s:element>`,
    )
    .join('');

  return {
    types: `<wsdl:types><s:schema targetNamespace="${Namespace.twinfield}">${elements}</s:schema></wsdl:types>`,
    messages:
      operations
        .map(
          ({ name }) =>
            `<wsdl:message name="${name}SoapIn"><wsdl:part name="parameters" element="tns:${name}"/></wsdl:message>`,
        )
        .join('') +
      '<wsdl:message name="HeaderIn"><wsdl:part name="Header" element="tns:Header"/></wsdl:message>',
    portType: `<wsdl:portType name="Port">${operations.map((op) => portOperation(op, `${op.name}SoapIn`)).join('')}</wsdl:portType>`,
    bindings: soapBinding(operations.map(bindingOperation).join('')),
    service: serviceAt('https://api.accounting.twinfield.com/webservices/thing.asmx'),
  };
}

/** A WCF service with the `Process` (command) and `Query` actions and schemas outside the WSDL. */
export function commandQueryParts(): WsdlParts {
  const actions = [
    { name: 'Process', message: 'CommandRequest', element: 'Command' },
    { name: 'Query', message: 'QueryRequest', element: 'Query' },
  ];

  return {
    types: '',
    messages: actions
      .map(
        ({ message, element }) =>
          `<wsdl:message name="${message}"><wsdl:part name="${element}" element="tns:${element}"/></wsdl:message>`,
      )
      .join(''),
    portType: `<wsdl:portType name="Port">${actions.map((action) => portOperation(action, action.message)).join('')}</wsdl:portType>`,
    bindings: soapBinding(actions.map(bindingOperation).join('')),
    service: serviceAt('https://api.accounting.twinfield.com/webservices/ThingService.svc'),
  };
}

export function wsdlDocument(parts: WsdlParts): XmlElement {
  return parse(
    `<wsdl:definitions xmlns:wsdl="${Namespace.wsdl}" xmlns:soap="${Namespace.soap11}" xmlns:soap12="${Namespace.soap12}" xmlns:s="${Namespace.xsd}" xmlns:tns="${Namespace.twinfield}" targetNamespace="${Namespace.twinfield}">` +
      `${parts.types}${parts.messages}${parts.portType}${parts.bindings}${parts.service}</wsdl:definitions>`,
  );
}

/** The `Command` and `Query` roots every WCF data contract derives from. */
export const CONTRACT_SCHEMA = (): XmlElement =>
  schema(
    '<xs:complexType name="Command"><xs:sequence/></xs:complexType><xs:element name="Command" nillable="true" type="tns:Command"/>' +
      '<xs:complexType name="Query"><xs:sequence/></xs:complexType><xs:element name="Query" nillable="true" type="tns:Query"/>',
    Namespace.contract,
  );

/**
 * A service schema with leaf commands, an intermediate base command, a query, an enumeration and
 * types that do not derive from `Command` or `Query`.
 */
export const THING_SCHEMA = (): XmlElement =>
  schema(
    `<xs:import namespace="${Namespace.contract}"/>` +
      `<xs:complexType name="CreateThing"><xs:complexContent><xs:extension base="q9:Command" xmlns:q9="${Namespace.contract}"><xs:sequence><xs:element name="Code" type="xs:string"/><xs:element minOccurs="0" name="Kind" type="tns:ThingKind"/></xs:sequence></xs:extension></xs:complexContent></xs:complexType>` +
      `<xs:complexType name="ThingCommand"><xs:complexContent><xs:extension base="q1:Command" xmlns:q1="${Namespace.contract}"><xs:sequence><xs:element name="Code" type="xs:string"/></xs:sequence></xs:extension></xs:complexContent></xs:complexType>` +
      '<xs:complexType name="RenameThing"><xs:complexContent><xs:extension base="tns:ThingCommand"><xs:sequence><xs:element name="Name" type="xs:string"/></xs:sequence></xs:extension></xs:complexContent></xs:complexType>' +
      `<xs:complexType name="GetThing"><xs:complexContent><xs:extension base="q2:Query" xmlns:q2="${Namespace.contract}"><xs:sequence><xs:element name="Code" type="xs:string"/></xs:sequence></xs:extension></xs:complexContent></xs:complexType>` +
      '<xs:complexType name="Orphan"><xs:complexContent><xs:extension base="tns:Missing"><xs:sequence/></xs:extension></xs:complexContent></xs:complexType>' +
      '<xs:complexType name="OddKind"><xs:complexContent><xs:extension base="tns:ThingKind"><xs:sequence/></xs:extension></xs:complexContent></xs:complexType>' +
      '<xs:complexType name="Unrelated"><xs:sequence><xs:element name="Code" type="xs:string"/></xs:sequence></xs:complexType>' +
      '<xs:simpleType name="ThingKind"><xs:restriction base="xs:string"><xs:enumeration value="Small"/><xs:enumeration value="Large"/></xs:restriction></xs:simpleType>',
  );

/**
 * An ASMX service with one operation `Ping`. Its request element has the type `requestType`
 * (for example `tns:Open`), and the inline schema also holds `types`.
 */
export function pingService(requestType: string, types: string): ServiceDocuments {
  const parts = asmxParts([{ name: 'Ping' }]);
  const inline = `<wsdl:types><s:schema targetNamespace="${Namespace.twinfield}"><s:element name="Ping" type="${requestType}"/>${types}</s:schema></wsdl:types>`;

  return {
    definition: {
      wsdlFile: 'ping.asmx.wsdl',
      protocol: SoapProtocol.asmx,
      prefix: 'ping',
      documentation: 'api__ping',
      effects: { Ping: OperationEffect.read },
    },
    wsdl: wsdlDocument({ ...parts, types: inline }),
    schemas: [],
  };
}
