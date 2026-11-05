import { randomBytes } from 'node:crypto';

import type { ClientCredentials } from '../domain/credentials.js';
import type { CallbackServer } from './callback-server.js';
import { LOGIN_SCOPES, LoginEndpoints } from './login-endpoints.js';
import type { RefreshTokenStore } from './refresh-token-store.js';
import { OAuthError, type TokenEndpoint } from './token-endpoint.js';

const LOGIN_TIMEOUT_MS = 5 * 60_000;

export type RandomSource = () => string;

export const secureRandom: RandomSource = () => randomBytes(32).toString('base64url');

/**
 * The authorization code flow for a person at a terminal: print the login URL, wait for the
 * redirect on the loopback address, exchange the code and store the refresh token.
 */
export class LoginFlow {
  constructor(
    private readonly client: ClientCredentials,
    private readonly redirectUri: URL,
    private readonly tokens: TokenEndpoint,
    private readonly store: RefreshTokenStore,
    private readonly callbacks: CallbackServer,
    private readonly random: RandomSource,
  ) {}

  async run(show: (message: string) => void): Promise<void> {
    const state = this.random();
    show(
      `Open this URL in your browser and log in to Twinfield:\n\n${this.authorizeUrl(state).toString()}\n`,
    );
    const code = await this.callbacks.waitForCode(this.redirectUri, state, LOGIN_TIMEOUT_MS);
    const grant = await this.tokens.exchangeCode(code, this.redirectUri);
    if (grant.refreshToken === undefined) {
      throw new OAuthError(
        'Twinfield returned no refresh token. Does the client have offline_access?',
      );
    }
    await this.store.save(grant.refreshToken);
    show('Logged in. The refresh token is stored.');
  }

  authorizeUrl(state: string): URL {
    const url = new URL(LoginEndpoints.authorize);
    url.search = new URLSearchParams({
      client_id: this.client.clientId,
      response_type: 'code',
      scope: LOGIN_SCOPES.join(' '),
      redirect_uri: this.redirectUri.toString(),
      state,
      nonce: this.random(),
    }).toString();

    return url;
  }
}
