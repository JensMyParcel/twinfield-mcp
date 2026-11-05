import { describe, expect, it } from 'vitest';

import { ClusterUrl } from '../../../src/domain/cluster-url.js';
import type { HttpResponse } from '../../../src/http/http-transport.js';
import { SoapClient, type SoapRequest } from '../../../src/soap/soap-client.js';
import { TwinfieldFault, TwinfieldHttpError } from '../../../src/soap/twinfield-error.js';
import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import { XmlElement } from '../../../src/xml/xml-element.js';
import { XmlReader } from '../../../src/xml/xml-reader.js';
import { XmlWriter } from '../../../src/xml/xml-writer.js';
import { CLUSTER, soapEnvelope } from '../../support/fake-twinfield.js';
import { RecordingTransport, httpResponse } from '../../support/io-http.js';

const tw = (local: string): QualifiedName => QualifiedName.of(XmlNamespace.twinfield, local);
const soap = (local: string): QualifiedName => QualifiedName.of(XmlNamespace.soapEnvelope, local);

const REQUEST: SoapRequest = {
  path: '/webservices/session.asmx',
  soapAction: 'http://www.twinfield.com/KeepAlive',
  header: XmlElement.withText(tw('Header'), 'header-text'),
  body: XmlElement.withText(tw('KeepAlive'), 'body-text'),
};

const cluster = ClusterUrl.parse(CLUSTER);

function clientAnswering(...responses: HttpResponse[]) {
  const http = RecordingTransport.answering(...responses);

  return { http, client: new SoapClient(http, new XmlWriter(), new XmlReader()) };
}

const fault = (inner: string): string => soapEnvelope(`<soap:Fault>${inner}</soap:Fault>`);

async function faultOf(response: HttpResponse): Promise<TwinfieldFault> {
  const { client } = clientAnswering(response);
  const error = await client.call(cluster, REQUEST).catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(TwinfieldFault);

  return error as TwinfieldFault;
}

describe('SoapClient', () => {
  it('posts a SOAP 1.1 envelope to the cluster with the quoted SOAPAction', async () => {
    const { http, client } = clientAnswering(httpResponse(200, soapEnvelope('<a/>')));

    await client.call(cluster, REQUEST);

    const request = http.only();
    expect(request.method).toBe('POST');
    expect(request.url.toString()).toBe(`${CLUSTER}/webservices/session.asmx`);
    expect(request.headers).toEqual({
      'content-type': 'text/xml; charset=utf-8',
      accept: 'text/xml',
      soapaction: '"http://www.twinfield.com/KeepAlive"',
    });
    expect(request.body?.startsWith('<?xml version="1.0" encoding="utf-8"?><')).toBe(true);
  });

  it('puts the header in a SOAP Header and the body in a SOAP Body', async () => {
    const { http, client } = clientAnswering(httpResponse(200, soapEnvelope('<a/>')));

    await client.call(cluster, REQUEST);

    const envelope = new XmlReader().read(http.only().body!);
    expect(envelope.name.equals(soap('Envelope'))).toBe(true);
    expect(envelope.elements().map((element) => element.name.local)).toEqual(['Header', 'Body']);
    expect(envelope.child(soap('Header'))?.child(tw('Header'))?.textContent()).toBe('header-text');
    expect(envelope.child(soap('Body'))?.child(tw('KeepAlive'))?.textContent()).toBe('body-text');
  });

  it('leaves the SOAP Header out of a request without a header', async () => {
    const { http, client } = clientAnswering(httpResponse(200, soapEnvelope('<a/>')));

    await client.call(cluster, { ...REQUEST, header: undefined });

    const envelope = new XmlReader().read(http.only().body!);
    expect(envelope.elements().map((element) => element.name.local)).toEqual(['Body']);
  });

  it('refuses a path outside the web services before it sends anything', async () => {
    const { http, client } = clientAnswering();

    await expect(client.call(cluster, { ...REQUEST, path: '/auth/token' })).rejects.toThrow(
      'is not a Twinfield web service',
    );
    expect(http.requests).toEqual([]);
  });

  it('returns the first element of the response body', async () => {
    const { client } = clientAnswering(
      httpResponse(
        200,
        soapEnvelope(
          '<KeepAliveResponse xmlns="http://www.twinfield.com/"><X>1</X></KeepAliveResponse><Other/>',
        ),
      ),
    );

    const result = await client.call(cluster, REQUEST);

    expect(result?.name.equals(tw('KeepAliveResponse'))).toBe(true);
    expect(result?.textContent()).toBe('1');
  });

  it('returns undefined for an empty response body', async () => {
    const { client } = clientAnswering(httpResponse(200, soapEnvelope('')));

    await expect(client.call(cluster, REQUEST)).resolves.toBeUndefined();
  });

  it('reads message, code and source from an ASMX fault detail', async () => {
    const error = await faultOf(
      httpResponse(
        500,
        fault(
          '<faultcode>soap:Server</faultcode><faultstring>Server was unable to process</faultstring>' +
            '<detail><message>Access token is invalid</message><code>354</code><source>Session</source></detail>',
        ),
      ),
    );

    expect(error.toJSON()).toEqual({
      error: 'TwinfieldFault',
      httpStatus: 500,
      faultCode: 'soap:Server',
      message: 'Access token is invalid',
      code: '354',
      source: 'Session',
    });
  });

  it('reads a WCF fault type and falls back to faultstring for a nil message', async () => {
    const error = await faultOf(
      httpResponse(
        500,
        fault(
          '<faultcode>s:Client</faultcode><faultstring>The access token is not valid.</faultstring>' +
            '<detail><SecurityFault xmlns="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">' +
            '<Code>AccessTokenInvalid</Code><Message i:nil="true"/></SecurityFault></detail>',
        ),
      ),
    );

    expect(error.message).toBe('The access token is not valid.');
    expect(error.code).toBe('AccessTokenInvalid');
    expect(error.source).toBeUndefined();
    expect(error.isAuthenticationFailure()).toBe(true);
  });

  it('reads the message of a WCF fault type when it has one', async () => {
    const error = await faultOf(
      httpResponse(
        500,
        fault(
          '<faultcode>s:Client</faultcode><faultstring>generic</faultstring>' +
            '<detail><ValidationFault><Code>Invalid</Code><Message>Period is closed</Message></ValidationFault></detail>',
        ),
      ),
    );

    expect(error.message).toBe('Period is closed');
    expect(error.code).toBe('Invalid');
  });

  it('uses faultcode and faultstring of a fault without a detail', async () => {
    const error = await faultOf(
      httpResponse(
        500,
        fault('<faultcode>soap:Client</faultcode><faultstring> Bad request </faultstring>'),
      ),
    );

    expect(error.faultCode).toBe('soap:Client');
    expect(error.message).toBe('Bad request');
    expect(error.code).toBeUndefined();
    expect(error.source).toBeUndefined();
  });

  it('falls back to fixed texts for a fault with only empty fields', async () => {
    const error = await faultOf(
      httpResponse(500, fault('<faultcode/><faultstring>  </faultstring><detail/>')),
    );

    expect(error.faultCode).toBe('unknown');
    expect(error.message).toBe('SOAP fault');
  });

  it('throws a fault that arrives with HTTP 200', async () => {
    const error = await faultOf(
      httpResponse(200, fault('<faultcode>soap:Server</faultcode><faultstring>x</faultstring>')),
    );

    expect(error.httpStatus).toBe(200);
  });

  it.each([
    ['a text body', 503, 'Service Unavailable: token access-1'],
    ['an HTML login page', 401, '<html><body><p>Unauthorized access-1</p></body></html>'],
    ['an empty body', 200, ''],
    [
      'a SOAP body outside an envelope',
      200,
      '<Body xmlns="http://schemas.xmlsoap.org/soap/envelope/"/>',
    ],
    [
      'an envelope without a body',
      200,
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"/>',
    ],
    ['an envelope in another namespace', 200, '<Envelope><Body><a/></Body></Envelope>'],
    ['a document type declaration', 200, `<!DOCTYPE x [<!ENTITY a "b">]>${soapEnvelope('')}`],
  ])('turns %s into a TwinfieldHttpError without the body', async (_, status, body) => {
    const { client } = clientAnswering(httpResponse(status, body));

    const error = await client.call(cluster, REQUEST).catch((caught: unknown) => caught);

    expect(error).toEqual(new TwinfieldHttpError(status));
    expect((error as Error).message).not.toContain('access-1');
  });

  it('marks an HTML 401 as an authentication failure', async () => {
    const { client } = clientAnswering(httpResponse(401, '<html>Unauthorized</html>'));

    const error = await client.call(cluster, REQUEST).catch((caught: unknown) => caught);

    expect((error as TwinfieldHttpError).isAuthenticationFailure()).toBe(true);
  });

  it('rejects a non-200 envelope without a fault', async () => {
    const { client } = clientAnswering(httpResponse(500, soapEnvelope('<a/>')));

    await expect(client.call(cluster, REQUEST)).rejects.toThrow(new TwinfieldHttpError(500));
  });
});
