import { z } from 'zod';

import type { AccessToken } from '../domain/access-token.js';
import { ClusterUrl } from '../domain/cluster-url.js';
import { HttpMethod, type HttpTransport } from '../http/http-transport.js';
import { parseJson } from '../http/json-body.js';
import { LoginEndpoints } from './login-endpoints.js';
import { OAuthError } from './token-endpoint.js';

const ValidationResponse = z.object({ 'twf.clusterUrl': z.string().min(1) });

/** Finds the cluster of an organisation through the access token validation endpoint. */
export class TokenValidator {
  constructor(private readonly http: HttpTransport) {}

  async cluster(accessToken: AccessToken): Promise<ClusterUrl> {
    const url = new URL(LoginEndpoints.accessTokenValidation);
    url.searchParams.set('token', accessToken.reveal());
    const response = await this.http.send({
      method: HttpMethod.get,
      url,
      headers: { accept: 'application/json' },
    });
    if (response.status !== 200) {
      throw new OAuthError(`Access token validation failed with HTTP ${response.status}.`);
    }
    const parsed = ValidationResponse.safeParse(parseJson(response.body));
    if (!parsed.success) {
      throw new OAuthError('Access token validation returned no twf.clusterUrl claim.');
    }

    return ClusterUrl.parse(parsed.data['twf.clusterUrl']);
  }
}
