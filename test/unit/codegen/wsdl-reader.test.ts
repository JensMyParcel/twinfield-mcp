import { describe, expect, it } from 'vitest';

import { WsdlReader } from '../../../codegen/wsdl-reader.js';
import { QualifiedName } from '../../../src/xml/qualified-name.js';
import {
  Namespace,
  asmxParts,
  serviceAt,
  soapBinding,
  wsdlDocument,
  type WsdlParts,
} from '../../support/tools-wsdl-fixtures.js';

const PING = asmxParts([{ name: 'Ping', documentation: '  Pings the server.\n  ' }]);

function reader(overrides: Partial<WsdlParts> = {}): WsdlReader {
  return new WsdlReader(wsdlDocument({ ...PING, ...overrides }));
}

describe('WsdlReader.operations', () => {
  it('reads the name, action, trimmed documentation, header and input element', () => {
    expect(reader().operations()).toEqual([
      {
        name: 'Ping',
        soapAction: 'http://www.twinfield.com/Ping',
        documentation: 'Pings the server.',
        hasHeader: true,
        inputElement: QualifiedName.of(Namespace.twinfield, 'Ping'),
      },
    ]);
  });

  it('reads every operation of the SOAP 1.1 binding in order', () => {
    const parts = asmxParts([{ name: 'Ping' }, { name: 'Pong', hasHeader: false }]);

    expect(
      new WsdlReader(wsdlDocument(parts))
        .operations()
        .map(({ name, hasHeader }) => ({ name, hasHeader })),
    ).toEqual([
      { name: 'Ping', hasHeader: true },
      { name: 'Pong', hasHeader: false },
    ]);
  });

  it('gives an undocumented operation an empty documentation', () => {
    const parts = asmxParts([{ name: 'Ping' }]);

    expect(new WsdlReader(wsdlDocument(parts)).operations()[0]?.documentation).toBe('');
  });

  it('reads an operation without a binding input as one without a header', () => {
    const bindings = soapBinding(
      '<wsdl:operation name="Ping"><soap:operation soapAction="urn:ping"/></wsdl:operation>',
    );

    expect(reader({ bindings }).operations()[0]?.hasHeader).toBe(false);
  });

  it('rejects a WSDL with only a SOAP 1.2 binding', () => {
    const bindings =
      '<wsdl:binding name="Soap12" type="tns:Port"><soap12:binding transport="x"/><wsdl:operation name="Ping"/></wsdl:binding>';

    expect(() => reader({ bindings }).operations()).toThrow('The WSDL has no SOAP 1.1 binding.');
  });

  it('rejects a WSDL without any binding', () => {
    expect(() => reader({ bindings: '' }).operations()).toThrow(
      'The WSDL has no SOAP 1.1 binding.',
    );
  });

  it('rejects a binding operation without a name', () => {
    const bindings = soapBinding(
      '<wsdl:operation><soap:operation soapAction="urn:ping"/></wsdl:operation>',
    );

    expect(() => reader({ bindings }).operations()).toThrow('Missing WSDL attribute "name".');
  });

  it('rejects a binding operation without a SOAP action', () => {
    const bindings = soapBinding('<wsdl:operation name="Ping"><wsdl:input/></wsdl:operation>');

    expect(() => reader({ bindings }).operations()).toThrow('Missing WSDL attribute "soapAction".');
  });

  it('rejects a binding operation that the port type does not have', () => {
    const portType = '<wsdl:portType name="Port"><wsdl:operation name="Pong"/></wsdl:portType>';

    expect(() => reader({ portType }).operations()).toThrow(
      'The port type has no operation "Ping".',
    );
  });

  it('rejects a WSDL without a port type', () => {
    expect(() => reader({ portType: '' }).operations()).toThrow(
      'The port type has no operation "Ping".',
    );
  });

  it('rejects a port type operation without an input message', () => {
    const portType = '<wsdl:portType name="Port"><wsdl:operation name="Ping"/></wsdl:portType>';

    expect(() => reader({ portType }).operations()).toThrow('Missing WSDL attribute "message".');
  });

  it('rejects an input message that the WSDL does not define', () => {
    expect(() => reader({ messages: '' }).operations()).toThrow(
      'Missing WSDL attribute "element".',
    );
  });

  it('rejects an input message without a part', () => {
    const messages = '<wsdl:message name="PingSoapIn"/>';

    expect(() => reader({ messages }).operations()).toThrow('Missing WSDL attribute "element".');
  });

  it('rejects an input part without an element', () => {
    const messages =
      '<wsdl:message name="PingSoapIn"><wsdl:part name="parameters" type="s:string"/></wsdl:message>';

    expect(() => reader({ messages }).operations()).toThrow('Missing WSDL attribute "element".');
  });

  it('rejects an input part element with an undeclared prefix', () => {
    const messages =
      '<wsdl:message name="PingSoapIn"><wsdl:part name="parameters" element="nope:Ping"/></wsdl:message>';

    expect(() => reader({ messages }).operations()).toThrow('Undeclared namespace prefix');
  });
});

describe('WsdlReader.servicePath', () => {
  it('returns the path of the SOAP 1.1 address and skips the SOAP 1.2 port', () => {
    expect(reader().servicePath()).toBe('/webservices/thing.asmx');
  });

  it('drops the query of the address', () => {
    const service = serviceAt('https://api.accounting.twinfield.com/webservices/a.asmx?wsdl');

    expect(reader({ service }).servicePath()).toBe('/webservices/a.asmx');
  });

  it('rejects a WSDL without a service', () => {
    expect(() => reader({ service: '' }).servicePath()).toThrow(
      'Missing WSDL attribute "location".',
    );
  });

  it('rejects a service without a SOAP 1.1 address', () => {
    const service =
      '<wsdl:service name="Thing"><wsdl:port name="Soap12"><soap12:address location="https://x.twinfield.com/a"/></wsdl:port></wsdl:service>';

    expect(() => reader({ service }).servicePath()).toThrow('Missing WSDL attribute "location".');
  });

  it('rejects a SOAP address without a location', () => {
    const service =
      '<wsdl:service name="Thing"><wsdl:port name="Soap"><soap:address/></wsdl:port></wsdl:service>';

    expect(() => reader({ service }).servicePath()).toThrow('Missing WSDL attribute "location".');
  });

  it('rejects a location that is not a URL', () => {
    expect(() => reader({ service: serviceAt('not a url') }).servicePath()).toThrow(TypeError);
  });
});

describe('WsdlReader.inlineSchemas', () => {
  it('returns the schemas inside the types element', () => {
    const schemas = reader().inlineSchemas();

    expect(schemas.map((node) => node.name)).toEqual([QualifiedName.of(Namespace.xsd, 'schema')]);
  });

  it('returns no schemas for a WSDL without types', () => {
    expect(reader({ types: '' }).inlineSchemas()).toEqual([]);
  });
});
