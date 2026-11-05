import type { HttpRequest, HttpResponse, HttpTransport } from '../../src/http/http-transport.js';
import type { RefreshTokenStore } from '../../src/auth/refresh-token-store.js';
import { RefreshToken } from '../../src/domain/credentials.js';
import { CLUSTER } from './fake-twinfield.js';
import { httpResponse, jsonResponse } from './io-http.js';

/**
 * The Twinfield identity endpoints as an HTTP transport. Each token request issues a new
 * access token `access-<n>`; the test sets what the next answers look like.
 */
export class FakeLogin implements HttpTransport {
  readonly tokenRequests: HttpRequest[] = [];
  readonly validationRequests: HttpRequest[] = [];
  expiresInSeconds = 3600;
  rotatedRefreshToken: string | undefined = 'refresh-1';
  tokenStatus = 200;
  clusterUrl = CLUSTER;
  /** When set, token answers wait until the test opens it. */
  hold: Promise<void> | undefined;

  async send(request: HttpRequest): Promise<HttpResponse> {
    if (request.url.pathname.endsWith('/connect/token')) {
      this.tokenRequests.push(request);
      await this.hold;

      return this.tokenResponse();
    }
    if (request.url.pathname.endsWith('/connect/accesstokenvalidation')) {
      this.validationRequests.push(request);

      return jsonResponse({ 'twf.clusterUrl': this.clusterUrl });
    }

    return httpResponse(404, '');
  }

  private tokenResponse(): HttpResponse {
    if (this.tokenStatus !== 200) {
      return jsonResponse({ error: 'invalid_grant' }, this.tokenStatus);
    }

    return jsonResponse({
      access_token: `access-${this.tokenRequests.length}`,
      expires_in: this.expiresInSeconds,
      ...(this.rotatedRefreshToken === undefined
        ? {}
        : { refresh_token: this.rotatedRefreshToken }),
    });
  }
}

/** A refresh token store in memory that records what was saved and can be made to fail. */
export class MemoryRefreshTokenStore implements RefreshTokenStore {
  readonly saved: string[] = [];
  loadFailure: Error | undefined;
  saveFailure: Error | undefined;

  constructor(private token: RefreshToken = RefreshToken.of('refresh-1')) {}

  load(): Promise<RefreshToken> {
    if (this.loadFailure) {
      return Promise.reject(this.loadFailure);
    }

    return Promise.resolve(this.token);
  }

  save(token: RefreshToken): Promise<void> {
    if (this.saveFailure) {
      return Promise.reject(this.saveFailure);
    }
    this.saved.push(token.reveal());
    this.token = token;

    return Promise.resolve();
  }
}
