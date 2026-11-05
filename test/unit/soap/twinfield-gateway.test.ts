import { beforeEach, describe, expect, it } from 'vitest';

import type { AccessToken } from '../../../src/domain/access-token.js';
import type { HttpRequest } from '../../../src/http/http-transport.js';
import { TwinfieldFault, TwinfieldHttpError } from '../../../src/soap/twinfield-error.js';
import type { RequestBuilder } from '../../../src/soap/twinfield-gateway.js';
import { QualifiedName, XmlNamespace } from '../../../src/xml/qualified-name.js';
import { XmlElement } from '../../../src/xml/xml-element.js';
import { XmlReader } from '../../../src/xml/xml-reader.js';
import { soapEnvelope, soapFault } from '../../support/fake-twinfield.js';
import { Gate, httpResponse } from '../../support/io-http.js';
import { GatewayStack } from '../../support/io-soap.js';

const tw = (local: string): QualifiedName => QualifiedName.of(XmlNamespace.twinfield, local);

const OK = httpResponse(200, soapEnvelope('<Ok xmlns="http://www.twinfield.com/">done</Ok>'));
const HTML_401 = httpResponse(401, '<html><body>Unauthorized</body></html>');
const fault = (code: string, status = 500) => {
  const { body } = soapFault(`<message>failed</message><code>${code}</code>`, status);

  return httpResponse(status, body);
};

const sentToken = (request: HttpRequest): string | undefined =>
  new XmlReader()
    .read(request.body ?? '')
    .childByLocalName('Header')
    ?.childByLocalName('AccessToken')
    ?.textContent();

describe('TwinfieldGateway', () => {
  let stack: GatewayStack;
  let builtWith: string[];
  let build: RequestBuilder;

  beforeEach(() => {
    stack = new GatewayStack();
    builtWith = [];
    build = (accessToken: AccessToken) => {
      builtWith.push(accessToken.reveal());

      return {
        path: '/webservices/session.asmx',
        soapAction: 'http://www.twinfield.com/KeepAlive',
        header: XmlElement.withText(tw('AccessToken'), accessToken.reveal()),
        body: new XmlElement(tw('KeepAlive')),
      };
    };
  });

  /** Rejects the first token that Twinfield sees with the given answer. */
  const rejectFirstToken = (rejection: ReturnType<typeof httpResponse>) => {
    stack.soap = (request) => (sentToken(request) === 'access-1' ? rejection : OK);
  };

  it('sends the request to the cluster of the session with its token', async () => {
    stack.soap = () => OK;

    const result = await stack.gateway.call(build);

    expect(result?.textContent()).toBe('done');
    expect(stack.soapRequests.map(sentToken)).toEqual(['access-1']);
    expect(stack.login.tokenRequests).toHaveLength(1);
  });

  it.each([
    ['HTTP 401 without an envelope', HTML_401],
    ['a fault on HTTP 401', fault('Unknown', 401)],
    ['fault code 354', fault('354')],
    ['fault code 103', fault('103')],
    ['fault code AccessTokenInvalid', fault('AccessTokenInvalid')],
    ['fault code LogonInvalid', fault('LogonInvalid')],
  ])('retries once with a renewed token after %s', async (_, rejection) => {
    rejectFirstToken(rejection);

    const result = await stack.gateway.call(build);

    expect(result?.textContent()).toBe('done');
    expect(builtWith).toEqual(['access-1', 'access-2']);
    expect(stack.soapRequests.map(sentToken)).toEqual(['access-1', 'access-2']);
    expect(stack.login.tokenRequests).toHaveLength(2);
  });

  it.each([
    ['a validation fault', fault('ValidationFailed')],
    ['a fault on HTTP 403', fault('Forbidden', 403)],
    ['HTTP 500 without an envelope', httpResponse(500, 'oops')],
    ['HTTP 403 without an envelope', httpResponse(403, '<html/>')],
  ])('does not retry after %s', async (_, rejection) => {
    stack.soap = () => rejection;

    await expect(stack.gateway.call(build)).rejects.toSatisfy(
      (error) => error instanceof TwinfieldFault || error instanceof TwinfieldHttpError,
    );
    expect(stack.soapRequests).toHaveLength(1);
    expect(stack.login.tokenRequests).toHaveLength(1);
  });

  it('does not retry a transport failure', async () => {
    const failure = new Error('connection reset');
    stack.soap = () => Promise.reject(failure);

    await expect(stack.gateway.call(build)).rejects.toBe(failure);
    expect(stack.soapRequests).toHaveLength(1);
  });

  it('does not retry an error of the request builder', async () => {
    const failure = new Error('invalid argument');

    await expect(
      stack.gateway.call(() => {
        throw failure;
      }),
    ).rejects.toBe(failure);
    expect(stack.soapRequests).toEqual([]);
  });

  it('propagates a second authentication failure without a third attempt', async () => {
    stack.soap = () => HTML_401;

    await expect(stack.gateway.call(build)).rejects.toThrow(new TwinfieldHttpError(401));
    expect(stack.soapRequests).toHaveLength(2);
    expect(stack.login.tokenRequests).toHaveLength(2);
  });

  it('propagates a failed renewal after an authentication failure', async () => {
    rejectFirstToken(HTML_401);
    await stack.sessions.current();
    stack.login.tokenStatus = 400;

    await expect(stack.gateway.call(build)).rejects.toThrow('invalid_grant');
    expect(stack.soapRequests).toHaveLength(1);
  });

  it('keeps the renewed session for the next call', async () => {
    rejectFirstToken(fault('354'));
    await stack.gateway.call(build);

    await stack.gateway.call(build);

    expect(stack.soapRequests.map(sentToken)).toEqual(['access-1', 'access-2', 'access-2']);
    expect(stack.login.tokenRequests).toHaveLength(2);
  });

  it('renews once when concurrent calls fail on the same token', async () => {
    const gate = new Gate();
    let waiting = 0;
    stack.soap = async (request) => {
      if (sentToken(request) !== 'access-1') {
        return OK;
      }
      waiting += 1;
      if (waiting === 2) {
        gate.open();
      }
      await gate.opened;

      return HTML_401;
    };
    await stack.sessions.current();

    await Promise.all([stack.gateway.call(build), stack.gateway.call(build)]);

    expect(stack.login.tokenRequests).toHaveLength(2);
    expect(stack.soapRequests.map(sentToken)).toEqual([
      'access-1',
      'access-1',
      'access-2',
      'access-2',
    ]);
  });
});
