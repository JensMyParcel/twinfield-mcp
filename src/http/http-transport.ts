export const HttpMethod = { get: 'GET', post: 'POST' } as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export interface HttpRequest {
  readonly method: HttpMethod;
  readonly url: URL;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string;
}

export interface HttpResponse {
  readonly status: number;
  readonly headers: Headers;
  readonly body: string;
}

export interface HttpTransport {
  send(request: HttpRequest): Promise<HttpResponse>;
}

export class HttpTimeoutError extends Error {
  override readonly name = 'HttpTimeoutError';
}

type Fetch = (input: URL, init: RequestInit) => Promise<Response>;

/** Sends requests with `fetch`, and aborts any request that takes longer than the timeout. */
export class FetchHttpTransport implements HttpTransport {
  constructor(
    private readonly fetch: Fetch,
    private readonly timeoutMs: number,
  ) {}

  async send(request: HttpRequest): Promise<HttpResponse> {
    try {
      const response = await this.fetch(request.url, {
        method: request.method,
        headers: request.headers,
        ...(request.body === undefined ? {} : { body: request.body }),
        redirect: 'error',
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      return { status: response.status, headers: response.headers, body: await response.text() };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new HttpTimeoutError(
          `${request.url.host} did not answer within ${this.timeoutMs} ms.`,
        );
      }

      throw error;
    }
  }
}
