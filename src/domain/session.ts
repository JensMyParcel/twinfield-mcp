import type { AccessToken } from './access-token.js';
import type { ClusterUrl } from './cluster-url.js';

/** A valid access token and the cluster it belongs to. */
export class Session {
  constructor(
    readonly accessToken: AccessToken,
    readonly cluster: ClusterUrl,
    readonly expiresAt: Date,
  ) {}

  /** True when the token expires within `marginMs` of `now`. */
  isExpiring(now: Date, marginMs: number): boolean {
    return this.expiresAt.getTime() - marginMs <= now.getTime();
  }
}
