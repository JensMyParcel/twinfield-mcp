import { beforeEach, describe, expect, it } from 'vitest';

import { CompanyCode } from '../../../src/domain/company-code.js';
import { ProcessXmlClient, ProcessXmlError } from '../../../src/soap/process-xml-client.js';
import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import { XmlElement } from '../../../src/xml/xml-element.js';
import { XmlParseError } from '../../../src/xml/xml-reader.js';
import { processXmlResponse, soapEnvelope } from '../../support/fake-twinfield.js';
import { httpResponse } from '../../support/io-http.js';
import { GatewayStack } from '../../support/io-soap.js';

const tw = (local: string): QualifiedName => QualifiedName.of(XmlNamespace.twinfield, local);
const plain = (local: string): QualifiedName => QualifiedName.unqualified(local);

const MESSAGE = new XmlElement(
  plain('dimension'),
  [],
  [XmlElement.withText(plain('code'), 'R&D <1>')],
);

describe('ProcessXmlClient', () => {
  let stack: GatewayStack;
  let client: ProcessXmlClient;

  beforeEach(() => {
    stack = new GatewayStack();
    client = new ProcessXmlClient(stack.gateway, stack.writer, stack.reader);
  });

  const answer = (xml: string): void => {
    const { body } = processXmlResponse(xml);
    stack.soap = () => httpResponse(200, body);
  };

  const sentHeader = (): XmlElement | undefined =>
    stack.sentEnvelope(0).childByLocalName('Header')?.child(tw('Header'));

  it('sends the message as a string to ProcessXmlString with the token and company', async () => {
    answer('<dimension result="1"/>');

    await client.process(MESSAGE, CompanyCode.parse('001'));

    const [request] = stack.soapRequests;
    expect(request?.url.pathname).toBe('/webservices/processxml.asmx');
    expect(request?.headers.soapaction).toBe('"http://www.twinfield.com/ProcessXmlString"');
    expect(sentHeader()?.child(tw('AccessToken'))?.textContent()).toBe('access-1');
    expect(sentHeader()?.child(tw('CompanyCode'))?.textContent()).toBe('001');
    const xmlRequest = stack
      .sentEnvelope(0)
      .childByLocalName('Body')
      ?.child(tw('ProcessXmlString'))
      ?.child(tw('xmlRequest'))
      ?.textContent();
    expect(xmlRequest).toBe(stack.writer.write(MESSAGE));
    expect(stack.reader.read(xmlRequest!).textContent()).toBe('R&D <1>');
  });

  it('sends no company code when no company is given', async () => {
    answer('<dimension result="1"/>');

    await client.process(MESSAGE, undefined);

    expect(
      sentHeader()
        ?.elements()
        .map((element) => element.name.local),
    ).toEqual(['AccessToken']);
  });

  it('reports a response with result="1" as accepted', async () => {
    answer('<dimension result="1"><code>1000</code></dimension>');

    const result = await client.process(MESSAGE, undefined);

    expect(result.accepted).toBe(true);
    expect(result.response.childByLocalName('code')?.textContent()).toBe('1000');
    expect(result.messages).toEqual([]);
  });

  it('reports a response with result="0" as not accepted', async () => {
    answer('<dimension result="0"/>');

    expect((await client.process(MESSAGE, undefined)).accepted).toBe(false);
  });

  it('reports a read response without a result attribute as accepted', async () => {
    answer('<dimensions><dimension>1000</dimension></dimensions>');

    expect((await client.process(MESSAGE, undefined)).accepted).toBe(true);
  });

  it.each([
    ['an error message', '<code msgtype="error" msg="Code exists.">1000</code>'],
    ['a message without a type', '<code msg="Code exists.">1000</code>'],
  ])('reports a response with %s but without result="0" as not accepted', async (_, child) => {
    answer(`<dimension result="1">${child}</dimension>`);

    const result = await client.process(MESSAGE, undefined);

    expect(result.accepted).toBe(false);
    expect(result.messages).toEqual([
      { element: 'dimension/code[1]', type: 'error', text: 'Code exists.' },
    ]);
  });

  it('reports a response with an error message deep inside and no result as not accepted', async () => {
    answer(
      '<dimensions><dimension><addresses><address msg="Bad."/></addresses></dimension></dimensions>',
    );

    expect((await client.process(MESSAGE, undefined)).accepted).toBe(false);
  });

  it('reports a response with only warnings as accepted', async () => {
    answer(
      '<dimension result="1"><code msgtype="warning" msg="Name is long.">1000</code>' +
        '<name msgtype="warning" msg="Check the name."/></dimension>',
    );

    const result = await client.process(MESSAGE, undefined);

    expect(result.accepted).toBe(true);
    expect(result.messages.map((message) => message.type)).toEqual(['warning', 'warning']);
  });

  it('reports a response with result="0" and only warnings as not accepted', async () => {
    answer('<dimension result="0"><code msgtype="warning" msg="Name is long."/></dimension>');

    expect((await client.process(MESSAGE, undefined)).accepted).toBe(false);
  });

  it('ignores an empty msg when it decides acceptance', async () => {
    answer('<dimension result="1"><code msgtype="error" msg=""/></dimension>');

    const result = await client.process(MESSAGE, undefined);

    expect(result.accepted).toBe(true);
    expect(result.messages).toEqual([]);
  });

  it('collects every msg with its type and the path of its element', async () => {
    answer(
      '<dimension result="0" msgtype="error" msg="The dimension is not valid.">' +
        '<code msgtype="error" msg="Code exists.">1000</code>' +
        '<addresses>' +
        '<address id="1"><field1 msg="No type: counts as error."/></address>' +
        '<address id="2"><field1 msgtype="warning" msg="Too long."/><field1 msg=""/></address>' +
        '</addresses>' +
        '</dimension>',
    );

    const result = await client.process(MESSAGE, undefined);

    expect(result.messages).toEqual([
      { element: 'dimension', type: 'error', text: 'The dimension is not valid.' },
      { element: 'dimension/code[1]', type: 'error', text: 'Code exists.' },
      {
        element: 'dimension/addresses[1]/address[1]/field1[1]',
        type: 'error',
        text: 'No type: counts as error.',
      },
      {
        element: 'dimension/addresses[1]/address[2]/field1[1]',
        type: 'warning',
        text: 'Too long.',
      },
    ]);
  });

  it('collects messages of a batch whose roots repeat', async () => {
    answer(
      '<dimensions result="0"><dimension result="1"/><dimension result="0" msg="Bad." msgtype="error"/></dimensions>',
    );

    const result = await client.process(MESSAGE, undefined);

    expect(result.messages).toEqual([
      { element: 'dimensions/dimension[2]', type: 'error', text: 'Bad.' },
    ]);
  });

  it.each([
    ['an empty result', processXmlResponse('').body],
    ['a result of white space only', processXmlResponse('  \n ').body],
    [
      'no result element',
      soapEnvelope('<ProcessXmlStringResponse xmlns="http://www.twinfield.com/"/>'),
    ],
    ['an empty SOAP body', soapEnvelope('')],
  ])('rejects %s', async (_, body) => {
    stack.soap = () => httpResponse(200, body);

    await expect(client.process(MESSAGE, undefined)).rejects.toThrow(
      new ProcessXmlError('ProcessXmlString returned no result.'),
    );
  });

  it('rejects a result that is not XML', async () => {
    answer('<dimension result="1">');

    await expect(client.process(MESSAGE, undefined)).rejects.toBeInstanceOf(XmlParseError);
  });
});
