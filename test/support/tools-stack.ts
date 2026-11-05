import { SessionProvider } from '../../src/auth/session-provider.js';
import { StaticRefreshTokenStore } from '../../src/auth/refresh-token-store.js';
import { TokenEndpoint } from '../../src/auth/token-endpoint.js';
import { TokenValidator } from '../../src/auth/token-validator.js';
import { UserInfoEndpoint } from '../../src/auth/user-info-endpoint.js';
import { ClientCredentials, RefreshToken } from '../../src/domain/credentials.js';
import { FetchHttpTransport } from '../../src/http/http-transport.js';
import { ProcessXmlClient } from '../../src/soap/process-xml-client.js';
import { SoapClient } from '../../src/soap/soap-client.js';
import { TwinfieldGateway } from '../../src/soap/twinfield-gateway.js';
import { XmlReader } from '../../src/xml/xml-reader.js';
import { XmlWriter } from '../../src/xml/xml-writer.js';
import { FakeClock, FakeTwinfield } from './fake-twinfield.js';

/** The real collaborators of the tools, wired to a scripted Twinfield instead of the network. */
export class ToolsStack {
  readonly sessions: SessionProvider;
  readonly gateway: TwinfieldGateway;
  readonly processXml: ProcessXmlClient;
  readonly userInfo: UserInfoEndpoint;

  constructor(readonly twinfield = new FakeTwinfield()) {
    const http = new FetchHttpTransport(twinfield.fetch, 60_000);
    const clock = new FakeClock();
    const reader = new XmlReader();
    const writer = new XmlWriter();
    this.sessions = new SessionProvider(
      new TokenEndpoint(http, ClientCredentials.of('client', 'secret'), clock),
      new TokenValidator(http),
      new StaticRefreshTokenStore(RefreshToken.of('refresh-1')),
      clock,
    );
    this.gateway = new TwinfieldGateway(this.sessions, new SoapClient(http, writer, reader));
    this.processXml = new ProcessXmlClient(this.gateway, writer, reader);
    this.userInfo = new UserInfoEndpoint(http);
  }
}
