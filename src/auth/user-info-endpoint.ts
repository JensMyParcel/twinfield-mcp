import { z } from 'zod';

import type { AccessToken } from '../domain/access-token.js';
import { HttpMethod, type HttpTransport } from '../http/http-transport.js';
import { parseJson } from '../http/json-body.js';
import { LoginEndpoints } from './login-endpoints.js';
import { OAuthError } from './token-endpoint.js';

const UserInfo = z.record(z.string(), z.unknown());

export type UserInfo = z.infer<typeof UserInfo>;

/** The OpenID Connect user info endpoint: the claims of the user behind the access token. */
export class UserInfoEndpoint {
  constructor(private readonly http: HttpTransport) {}

  async claims(accessToken: AccessToken): Promise<UserInfo> {
    const response = await this.http.send({
      method: HttpMethod.get,
      url: LoginEndpoints.userInfo,
      headers: { authorization: `Bearer ${accessToken.reveal()}`, accept: 'application/json' },
    });
    if (response.status !== 200) {
      throw new OAuthError(`The user info endpoint answered HTTP ${response.status}.`);
    }
    const parsed = UserInfo.safeParse(parseJson(response.body));
    if (!parsed.success) {
      throw new OAuthError('The user info endpoint returned an unexpected response.');
    }

    return parsed.data;
  }
}
