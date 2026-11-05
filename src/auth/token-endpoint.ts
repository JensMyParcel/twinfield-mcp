import { z } from 'zod';

import { AccessToken } from '../domain/access-token.js';
import { RefreshToken, type ClientCredentials } from '../domain/credentials.js';
import { HttpMethod, type HttpTransport } from '../http/http-transport.js';
import { parseJson } from '../http/json-body.js';
import type { Clock } from './clock.js';
import { LoginEndpoints } from './login-endpoints.js';

const TokenResponse = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().min(1).optional(),
});

const ErrorResponse = z.object({ error: z.string().max(100) });

export interface TokenGrant {
  readonly accessToken: AccessToken;
  readonly expiresAt: Date;
  readonly refreshToken?: RefreshToken;
}

export class OAuthError extends Error {
  override readonly name = 'OAuthError';
}

/** The Twinfield token endpoint, for the authorization code and refresh token grants. */
export class TokenEndpoint {
  constructor(
    private readonly http: HttpTransport,
    private readonly client: ClientCredentials,
    private readonly clock: Clock,
  ) {}

  refresh(refreshToken: RefreshToken): Promise<TokenGrant> {
    return this.request({ grant_type: 'refresh_token', refresh_token: refreshToken.reveal() });
  }

  exchangeCode(code: string, redirectUri: URL): Promise<TokenGrant> {
    return this.request({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri.toString(),
    });
  }

  private async request(form: Record<string, string>): Promise<TokenGrant> {
    const response = await this.http.send({
      method: HttpMethod.post,
      url: LoginEndpoints.token,
      headers: {
        authorization: this.client.basicAuthorization(),
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: new URLSearchParams(form).toString(),
    });
    if (response.status !== 200) {
      throw new OAuthError(`The token endpoint refused the request: ${errorCode(response.body)}.`);
    }

    return this.toGrant(response.body);
  }

  private toGrant(body: string): TokenGrant {
    const parsed = TokenResponse.safeParse(parseJson(body));
    if (!parsed.success) {
      throw new OAuthError('The token endpoint returned an unexpected response.');
    }
    const { access_token, expires_in, refresh_token } = parsed.data;

    return {
      accessToken: AccessToken.of(access_token),
      expiresAt: new Date(this.clock.now().getTime() + expires_in * 1000),
      ...(refresh_token === undefined ? {} : { refreshToken: RefreshToken.of(refresh_token) }),
    };
  }
}

/** Only the OAuth error code is shown: the body of a failed token call is not trusted. */
function errorCode(body: string): string {
  const parsed = ErrorResponse.safeParse(parseJson(body));

  return parsed.success && /^[a-z_]+$/.test(parsed.data.error)
    ? parsed.data.error
    : 'unknown error';
}
