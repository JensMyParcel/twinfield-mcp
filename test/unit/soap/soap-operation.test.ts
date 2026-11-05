import { describe, expect, it } from 'vitest';

import {
  OperationEffect,
  SoapProtocol,
  TypeKind,
  type AsmxOperationDescriptor,
  type CommandQueryOperationDescriptor,
  type ElementDescriptor,
  type TypeDescriptor,
} from '../../../src/catalog/catalog-types.js';
import { AccessToken } from '../../../src/domain/access-token.js';
import { CompanyCode } from '../../../src/domain/company-code.js';
import { CodecFactory } from '../../../src/serialization/codec-factory.js';
import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import { AsmxOperation, CommandQueryOperation } from '../../../src/soap/soap-operation.js';
import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import type { XmlElement } from '../../../src/xml/xml-element.js';

const TW = XmlNamespace.twinfield;
const SHARED = 'http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared';
const QUERIES = 'http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService';

const stringElement = (namespace: string, name: string, minOccurs = 1): ElementDescriptor => ({
  name,
  namespace,
  type: { namespace: XmlNamespace.xsd, name: 'string' },
  minOccurs,
  maxOccurs: 1,
  nillable: false,
});

const TYPES: TypeDescriptor[] = [
  {
    kind: TypeKind.complex,
    reference: { namespace: TW, name: 'Search' },
    elements: [stringElement(TW, 'pattern')],
  },
  {
    kind: TypeKind.complex,
    reference: { namespace: QUERIES, name: 'GetYears' },
    elements: [stringElement(QUERIES, 'Office', 0)],
  },
];

const BASE = {
  service: 'test',
  description: 'test',
  documentation: 'test',
  effect: OperationEffect.read,
} as const;

const ASMX: AsmxOperationDescriptor = {
  ...BASE,
  protocol: SoapProtocol.asmx,
  tool: 'finder_search',
  path: '/webservices/finder.asmx',
  soapAction: 'http://www.twinfield.com/Search',
  requiresCompany: true,
  request: { ...stringElement(TW, 'Search'), type: { namespace: TW, name: 'Search' } },
};

const QUERY: CommandQueryOperationDescriptor = {
  ...BASE,
  protocol: SoapProtocol.commandQuery,
  tool: 'period_get_years',
  path: '/webservices/periodservice.svc',
  soapAction: 'http://www.twinfield.com/PeriodService/Query',
  requiresCompany: true,
  bodyElement: 'Query',
  type: { namespace: QUERIES, name: 'GetYears' },
};

const codecs = new CodecFactory(TYPES);
const token = AccessToken.of('access-1');
const company = CompanyCode.parse('001');

const children = (element: XmlElement | undefined) =>
  element?.elements().map((child) => [child.name.toKey(), child.textContent()]);

describe('AsmxOperation', () => {
  const operation = new AsmxOperation(ASMX, codecs);

  it('describes its arguments with the schema of the request type', () => {
    expect(operation.argumentSchema()).toMatchObject({
      type: 'object',
      properties: { pattern: { type: 'string' } },
      required: ['pattern'],
      additionalProperties: false,
    });
  });

  it('builds the method element and a Header with the token and the company', () => {
    const request = operation.prepare({ pattern: '10*' }, company)(token);

    expect(request.path).toBe('/webservices/finder.asmx');
    expect(request.soapAction).toBe('http://www.twinfield.com/Search');
    expect(request.header?.name.equals(QualifiedName.of(TW, 'Header'))).toBe(true);
    expect(children(request.header)).toEqual([
      [`{${TW}}AccessToken`, 'access-1'],
      [`{${TW}}CompanyCode`, '001'],
    ]);
    expect(request.body.name.equals(QualifiedName.of(TW, 'Search'))).toBe(true);
    expect(children(request.body)).toEqual([[`{${TW}}pattern`, '10*']]);
  });

  it('leaves the company code out when no company is given', () => {
    const request = operation.prepare({ pattern: '10*' }, undefined)(token);

    expect(children(request.header)).toEqual([[`{${TW}}AccessToken`, 'access-1']]);
  });

  it('sends no SOAP header for a method that does not need a company', () => {
    const request = new AsmxOperation({ ...ASMX, requiresCompany: false }, codecs).prepare(
      { pattern: '10*' },
      company,
    )(token);

    expect(request.header).toBeUndefined();
  });

  it('puts the token of each send into the header', () => {
    const builder = operation.prepare({ pattern: '10*' }, company);

    const renewed = builder(AccessToken.of('access-2'));

    expect(children(renewed.header)?.[0]).toEqual([`{${TW}}AccessToken`, 'access-2']);
  });

  it('rejects invalid arguments when it is prepared, before a token is needed', () => {
    expect(() => operation.prepare({ pattern: '10*', other: 1 }, company)).toThrow(
      InvalidArgumentError,
    );
  });
});

describe('CommandQueryOperation', () => {
  const operation = new CommandQueryOperation(QUERY, codecs);

  it('describes its arguments with the schema of the query type', () => {
    expect(operation.argumentSchema()).toMatchObject({
      type: 'object',
      properties: { Office: { type: 'string' } },
      additionalProperties: false,
    });
  });

  it('builds a Query of the subtype and an Authentication header in the shared namespace', () => {
    const request = operation.prepare({ Office: '001' }, company)(token);

    expect(request.path).toBe('/webservices/periodservice.svc');
    expect(request.soapAction).toBe('http://www.twinfield.com/PeriodService/Query');
    expect(request.header?.name.equals(QualifiedName.of(TW, 'Authentication'))).toBe(true);
    expect(children(request.header)).toEqual([
      [`{${SHARED}}AccessToken`, 'access-1'],
      [`{${SHARED}}CompanyCode`, '001'],
    ]);
    expect(request.body.name.equals(QualifiedName.of(TW, 'Query'))).toBe(true);
    const subtype = request.body.attribute(QualifiedName.of(XmlNamespace.xsi, 'type'));
    expect(subtype).toEqual(QualifiedName.of(QUERIES, 'GetYears'));
    expect(children(request.body)).toEqual([[`{${QUERIES}}Office`, '001']]);
  });

  it('leaves the company code out when no company is given', () => {
    const request = operation.prepare({}, undefined)(token);

    expect(children(request.header)).toEqual([[`{${SHARED}}AccessToken`, 'access-1']]);
    expect(children(request.body)).toEqual([]);
  });

  it('uses Command as the body element of a command', () => {
    const command = new CommandQueryOperation({ ...QUERY, bodyElement: 'Command' }, codecs);

    const request = command.prepare({}, company)(token);

    expect(request.body.name.equals(QualifiedName.of(TW, 'Command'))).toBe(true);
  });

  it('rejects arguments that are not an object', () => {
    expect(() => operation.prepare(['001'] as unknown as Record<string, unknown>, company)).toThrow(
      InvalidArgumentError,
    );
  });
});
