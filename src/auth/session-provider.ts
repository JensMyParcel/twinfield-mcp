import { Session } from '../domain/session.js';
import type { Clock } from './clock.js';
import type { RefreshTokenStore } from './refresh-token-store.js';
import type { TokenEndpoint } from './token-endpoint.js';
import type { TokenValidator } from './token-validator.js';

/** A token is renewed this long before it expires, so a call never starts with a dying token. */
const RENEWAL_MARGIN_MS = 60_000;

/**
 * Gives the current session and renews it from the refresh token when needed. Concurrent
 * callers share one renewal, so the token endpoint sees one request.
 */
export class SessionProvider {
  private session: Session | undefined;
  private renewal: Promise<Session> | undefined;

  constructor(
    private readonly tokens: TokenEndpoint,
    private readonly validator: TokenValidator,
    private readonly store: RefreshTokenStore,
    private readonly clock: Clock,
  ) {}

  async current(): Promise<Session> {
    if (this.session && !this.session.isExpiring(this.clock.now(), RENEWAL_MARGIN_MS)) {
      return this.session;
    }
    this.renewal ??= this.renew().finally(() => {
      this.renewal = undefined;
    });

    return this.renewal;
  }

  /** Drops the session after Twinfield rejected its token, so the next call renews it. */
  invalidate(rejected: Session): void {
    if (this.session === rejected) {
      this.session = undefined;
    }
  }

  private async renew(): Promise<Session> {
    this.session = undefined;
    const refreshToken = await this.store.load();
    const grant = await this.tokens.refresh(refreshToken);
    if (grant.refreshToken && !grant.refreshToken.equals(refreshToken)) {
      await this.store.save(grant.refreshToken);
    }
    const cluster = await this.validator.cluster(grant.accessToken);
    this.session = new Session(grant.accessToken, cluster, grant.expiresAt);

    return this.session;
  }
}
