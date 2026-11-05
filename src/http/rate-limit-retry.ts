import type { HttpRequest, HttpResponse, HttpTransport } from './http-transport.js';

const TOO_MANY_REQUESTS = 429;

export type Sleep = (milliseconds: number) => Promise<void>;

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
}

/**
 * Retries a request that Twinfield rejected with 429. The fair use policy states that such a
 * request "will not be further processed", so a retry cannot apply a command twice. The wait
 * starts at `Retry-After` and doubles per attempt.
 */
export class RateLimitRetryTransport implements HttpTransport {
  constructor(
    private readonly inner: HttpTransport,
    private readonly sleep: Sleep,
    private readonly policy: RetryPolicy,
  ) {}

  async send(request: HttpRequest): Promise<HttpResponse> {
    let response = await this.inner.send(request);
    for (
      let attempt = 1;
      response.status === TOO_MANY_REQUESTS && attempt < this.policy.maxAttempts;
      attempt += 1
    ) {
      await this.sleep(this.delay(response, attempt));
      response = await this.inner.send(request);
    }

    return response;
  }

  private delay(response: HttpResponse, attempt: number): number {
    const retryAfterSeconds = Number(response.headers.get('retry-after'));
    const base =
      Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? retryAfterSeconds * 1000
        : this.policy.initialDelayMs;

    return Math.min(base * 2 ** (attempt - 1), this.policy.maxDelayMs);
  }
}
