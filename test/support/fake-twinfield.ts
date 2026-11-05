import { fileURLToPath } from 'node:url';

import type { Clock } from '../../src/auth/clock.js';
import { SOAP_CATALOG } from '../../src/catalog/soap-catalog.generated.js';
import type { Runtime } from '../../src/composition-root.js';

export const CLUSTER = 'https://api.accounting.twinfield.com';
export const DOCS_DIRECTORY = fileURLToPath(
  new URL('../../vendor/twinfield/docs', import.meta.url),
);

export interface RecordedRequest {
  readonly url: URL;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body: string;
}

export type FakeResponse = { status?: number; body: string; headers?: Record<string, string> };
export type SoapHandler = (request: RecordedRequest) => FakeResponse;

export class FakeClock implements Clock {
  constructor(private current = new Date('2026-11-04T10:00:00Z')) {}

  now(): Date {
    return new Date(this.current);
  }

  advance(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds);
  }
}

export function soapEnvelope(body: string): string {
  return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soap:Body>${body}</soap:Body></soap:Envelope>`;
}

export function soapFault(detail: string, status = 500): FakeResponse {
  return {
    status,
    body: soapEnvelope(
      `<soap:Fault><faultcode>soap:Server</faultcode><faultstring>Server error</faultstring><detail>${detail}</detail></soap:Fault>`,
    ),
  };
}

export function processXmlResponse(xml: string): FakeResponse {
  const escaped = xml.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  return {
    body: soapEnvelope(
      `<ProcessXmlStringResponse xmlns="http://www.twinfield.com/"><ProcessXmlStringResult>${escaped}</ProcessXmlStringResult></ProcessXmlStringResponse>`,
    ),
  };
}

/** A scripted Twinfield: login endpoints that always work, SOAP answers from `soap`. */
export class FakeTwinfield {
  readonly requests: RecordedRequest[] = [];
  soap: SoapHandler = () => ({ body: soapEnvelope('') });
  tokenCount = 0;
  tokenStatus = 200;
  validationBody = JSON.stringify({ 'twf.clusterUrl': CLUSTER });

  readonly fetch = (input: URL, init: RequestInit): Promise<Response> => {
    const request: RecordedRequest = {
      url: new URL(input),
      method: init.method ?? 'GET',
      headers: { ...(init.headers as Record<string, string>) },
      body: typeof init.body === 'string' ? init.body : '',
    };
    this.requests.push(request);
    const response = this.route(request);

    return Promise.resolve(
      new Response(response.body, {
        status: response.status ?? 200,
        headers: response.headers ?? {},
      }),
    );
  };

  soapRequests(): RecordedRequest[] {
    return this.requests.filter((request) => request.url.origin === CLUSTER);
  }

  private route(request: RecordedRequest): FakeResponse {
    const { pathname } = request.url;
    if (pathname.endsWith('/connect/token')) {
      this.tokenCount += 1;

      return {
        status: this.tokenStatus,
        body: JSON.stringify({
          access_token: `access-${this.tokenCount}`,
          expires_in: 3600,
          refresh_token: 'refresh-1',
          token_type: 'Bearer',
        }),
      };
    }
    if (pathname.endsWith('/connect/accesstokenvalidation')) {
      return { body: this.validationBody };
    }
    if (pathname.endsWith('/connect/userinfo')) {
      return { body: JSON.stringify({ sub: 'user-1', 'twf.organisationCode': 'ORG' }) };
    }

    return this.soap(request);
  }
}

export function fakeRuntime(
  twinfield: FakeTwinfield,
  clock = new FakeClock(),
): Runtime & { errors: string[] } {
  const errors: string[] = [];

  return {
    fetch: twinfield.fetch,
    clock,
    sleep: () => Promise.resolve(),
    logger: { error: (message) => errors.push(message) },
    catalog: SOAP_CATALOG,
    documentationDirectory: DOCS_DIRECTORY,
    version: '0.0.0-test',
    errors,
  };
}
