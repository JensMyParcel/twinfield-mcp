import { SessionProvider } from '../../src/auth/session-provider.js';
import { TokenEndpoint } from '../../src/auth/token-endpoint.js';
import { TokenValidator } from '../../src/auth/token-validator.js';
import { ClientCredentials } from '../../src/domain/credentials.js';
import type { HttpRequest, HttpResponse, HttpTransport } from '../../src/http/http-transport.js';
import { SoapClient } from '../../src/soap/soap-client.js';
import { TwinfieldGateway } from '../../src/soap/twinfield-gateway.js';
import { XmlReader } from '../../src/xml/xml-reader.js';
import { XmlWriter } from '../../src/xml/xml-writer.js';
import { CLUSTER, FakeClock, soapEnvelope } from './fake-twinfield.js';
import { httpResponse } from './io-http.js';
import { FakeLogin, MemoryRefreshTokenStore } from './io-login.js';

export type SoapAnswer = (request: HttpRequest) => HttpResponse | Promise<HttpResponse>;

/** A real gateway, session provider and SOAP client over a scripted Twinfield. */
export class GatewayStack {
  readonly login = new FakeLogin();
  readonly clock = new FakeClock();
  readonly soapRequests: HttpRequest[] = [];
  readonly reader = new XmlReader();
  readonly writer = new XmlWriter();
  readonly sessions: SessionProvider;
  readonly gateway: TwinfieldGateway;
  soap: SoapAnswer = () => httpResponse(200, soapEnvelope('<Ok/>'));

  constructor() {
    const http: HttpTransport = {
      send: async (request) => {
        if (request.url.origin !== CLUSTER) {
          return this.login.send(request);
        }
        this.soapRequests.push(request);

        return this.soap(request);
      },
    };
    this.sessions = new SessionProvider(
      new TokenEndpoint(http, ClientCredentials.of('client', 'secret'), this.clock),
      new TokenValidator(http),
      new MemoryRefreshTokenStore(),
      this.clock,
    );
    this.gateway = new TwinfieldGateway(
      this.sessions,
      new SoapClient(http, this.writer, this.reader),
    );
  }

  /** The SOAP request body as XML, to inspect the header and body that were sent. */
  sentEnvelope(index: number) {
    return this.reader.read(this.soapRequests[index]?.body ?? '');
  }
}
