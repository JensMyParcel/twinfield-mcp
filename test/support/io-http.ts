import type { HttpRequest, HttpResponse, HttpTransport } from '../../src/http/http-transport.js';

export type HttpHandler = (request: HttpRequest) => HttpResponse | Promise<HttpResponse>;

export function httpResponse(
  status: number,
  body: string,
  headers: Record<string, string> = {},
): HttpResponse {
  return { status, body, headers: new Headers(headers) };
}

export function jsonResponse(body: unknown, status = 200): HttpResponse {
  return httpResponse(status, JSON.stringify(body), { 'content-type': 'application/json' });
}

/** An HTTP transport that records every request and answers from a handler. */
export class RecordingTransport implements HttpTransport {
  readonly requests: HttpRequest[] = [];

  constructor(private readonly handler: HttpHandler) {}

  /** Answers the requests in order with the given responses; one more request is a failure. */
  static answering(...responses: HttpResponse[]): RecordingTransport {
    const queue = [...responses];

    return new RecordingTransport(() => {
      const next = queue.shift();
      if (next === undefined) {
        throw new Error('The test sent more requests than it scripted.');
      }

      return next;
    });
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    this.requests.push(request);

    return this.handler(request);
  }

  only(): HttpRequest {
    if (this.requests.length !== 1) {
      throw new Error(`Expected one request, got ${this.requests.length}.`);
    }

    return this.requests[0]!;
  }
}

/** A promise the test resolves itself, to hold a dependency mid-flight. */
export class Gate {
  readonly opened: Promise<void>;
  open!: () => void;

  constructor() {
    this.opened = new Promise((resolve) => {
      this.open = resolve;
    });
  }
}
