import type { McpServer } from '@modelcontextprotocol/server';

import type { Clock } from './auth/clock.js';
import {
  FileRefreshTokenStore,
  StaticRefreshTokenStore,
  type RefreshTokenStore,
} from './auth/refresh-token-store.js';
import { SessionProvider } from './auth/session-provider.js';
import { TokenEndpoint } from './auth/token-endpoint.js';
import { TokenValidator } from './auth/token-validator.js';
import { UserInfoEndpoint } from './auth/user-info-endpoint.js';
import type { SoapCatalog } from './catalog/catalog-types.js';
import type { Configuration } from './config/configuration.js';
import { DocumentationLibrary } from './docs/documentation-library.js';
import { FetchHttpTransport, type HttpTransport } from './http/http-transport.js';
import { RateLimitRetryTransport, type Sleep } from './http/rate-limit-retry.js';
import { CodecFactory } from './serialization/codec-factory.js';
import { ErrorPresenter, type Logger } from './server/error-presenter.js';
import { McpServerFactory } from './server/mcp-server-factory.js';
import { ProcessXmlClient } from './soap/process-xml-client.js';
import { SoapClient } from './soap/soap-client.js';
import { TwinfieldGateway } from './soap/twinfield-gateway.js';
import { CompanyArgument } from './tools/company-argument.js';
import { DocumentationTool } from './tools/documentation-tool.js';
import { ToolCatalog } from './tools/tool-catalog.js';
import type { TwinfieldTool } from './tools/twinfield-tool.js';
import { UserInfoTool } from './tools/user-info-tool.js';
import { XmlReader } from './xml/xml-reader.js';
import { XmlWriter } from './xml/xml-writer.js';

const RETRY_POLICY = { maxAttempts: 4, initialDelayMs: 2_000, maxDelayMs: 30_000 } as const;

/** What the outside world provides. Tests replace `fetch`, the clock and `sleep`. */
export interface Runtime {
  readonly fetch: (input: URL, init: RequestInit) => Promise<Response>;
  readonly clock: Clock;
  readonly sleep: Sleep;
  readonly logger: Logger;
  readonly catalog: SoapCatalog;
  readonly documentationDirectory: string;
  readonly version: string;
}

/** The one place that wires the object graph. */
export class CompositionRoot {
  constructor(
    private readonly configuration: Configuration,
    private readonly runtime: Runtime,
  ) {}

  server(): McpServer {
    const documentation = new DocumentationLibrary(this.runtime.documentationDirectory);
    const errors = new ErrorPresenter(this.runtime.logger);

    return new McpServerFactory(
      this.tools(documentation),
      documentation,
      errors,
      this.runtime.version,
    ).create();
  }

  tokenEndpoint(): TokenEndpoint {
    return new TokenEndpoint(this.http(), this.configuration.client, this.runtime.clock);
  }

  refreshTokenStore(): RefreshTokenStore {
    const { refreshToken, credentialsFile } = this.configuration;

    return refreshToken
      ? new StaticRefreshTokenStore(refreshToken)
      : new FileRefreshTokenStore(credentialsFile);
  }

  private tools(documentation: DocumentationLibrary): TwinfieldTool[] {
    const http = this.http();
    const sessions = new SessionProvider(
      this.tokenEndpoint(),
      new TokenValidator(http),
      this.refreshTokenStore(),
      this.runtime.clock,
    );
    const reader = new XmlReader();
    const writer = new XmlWriter();
    const gateway = new TwinfieldGateway(sessions, new SoapClient(http, writer, reader));
    const catalog = new ToolCatalog(
      this.runtime.catalog,
      new CodecFactory(this.runtime.catalog.types),
      gateway,
      new ProcessXmlClient(gateway, writer, reader),
      new CompanyArgument(this.configuration.defaultCompany),
    );

    return [
      ...catalog.tools(),
      new DocumentationTool(documentation),
      new UserInfoTool(sessions, new UserInfoEndpoint(http)),
    ];
  }

  private http(): HttpTransport {
    return new RateLimitRetryTransport(
      new FetchHttpTransport(this.runtime.fetch, this.configuration.httpTimeoutMs),
      this.runtime.sleep,
      RETRY_POLICY,
    );
  }
}
