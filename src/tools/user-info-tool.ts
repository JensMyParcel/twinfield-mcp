import type { SessionProvider } from '../auth/session-provider.js';
import type { UserInfoEndpoint } from '../auth/user-info-endpoint.js';
import { OperationEffect } from '../catalog/catalog-types.js';
import type { JsonSchema } from '../serialization/json-schema.js';
import type { JsonValue } from '../xml/xml-json.js';
import {
  annotationsFor,
  type ToolAnnotations,
  type ToolResult,
  type TwinfieldTool,
} from './twinfield-tool.js';

/** The OpenID Connect claims of the logged-in user, plus the cluster the session uses. */
export class UserInfoTool implements TwinfieldTool {
  readonly name = 'twinfield_user_info';
  readonly description =
    'Show who the server is logged in as: the OpenID Connect user info claims (organisation, ' +
    'user code) and the Twinfield cluster URL.';
  readonly inputSchema: JsonSchema = {
    type: 'object',
    properties: {},
    additionalProperties: false,
  };
  readonly annotations: ToolAnnotations = annotationsFor(OperationEffect.read);

  constructor(
    private readonly sessions: SessionProvider,
    private readonly userInfo: UserInfoEndpoint,
  ) {}

  async execute(): Promise<ToolResult> {
    const session = await this.sessions.current();
    const claims = await this.userInfo.claims(session.accessToken);

    return {
      isError: false,
      payload: { cluster: session.cluster.toString(), claims: claims as JsonValue },
    };
  }
}
