import { describe, expect, it } from 'vitest';

import {
  FetchHttpTransport,
  HttpMethod,
  HttpTimeoutError,
} from '../../../src/http/http-transport.js';

interface FetchCall {
  readonly input: URL;
  readonly init: RequestInit;
}

function recordingFetch(answer: (call: FetchCall) => Promise<Response>) {
  const calls: FetchCall[] = [];
  const fetch = (input: URL, init: RequestInit): Promise<Response> => {
    const call = { input, init };
    calls.push(call);

    return answer(call);
  };

  return { calls, fetch };
}

const url = new URL('https://api.accounting.twinfield.com/webservices/session.asmx');

describe('FetchHttpTransport', () => {
  it('sends the method, headers and body, and refuses redirects', async () => {
    const { calls, fetch } = recordingFetch(() => Promise.resolve(new Response('ok')));

    await new FetchHttpTransport(fetch, 1_000).send({
      method: HttpMethod.post,
      url,
      headers: { 'content-type': 'text/xml' },
      body: '<a/>',
    });

    const [call] = calls;
    expect(call?.input).toBe(url);
    expect(call?.init).toMatchObject({
      method: 'POST',
      headers: { 'content-type': 'text/xml' },
      body: '<a/>',
      redirect: 'error',
    });
    expect(call?.init.signal).toBeInstanceOf(AbortSignal);
    expect(call?.init.signal?.aborted).toBe(false);
  });

  it('sends no body key for a request without a body', async () => {
    const { calls, fetch } = recordingFetch(() => Promise.resolve(new Response('ok')));

    await new FetchHttpTransport(fetch, 1_000).send({ method: HttpMethod.get, url, headers: {} });

    expect(calls[0] && 'body' in calls[0].init).toBe(false);
  });

  it('returns the status, headers and full body text', async () => {
    const { fetch } = recordingFetch(() =>
      Promise.resolve(new Response('busy', { status: 429, headers: { 'retry-after': '3' } })),
    );

    const response = await new FetchHttpTransport(fetch, 1_000).send({
      method: HttpMethod.get,
      url,
      headers: {},
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('3');
    expect(response.body).toBe('busy');
  });

  it('turns a fetch timeout into an HttpTimeoutError that names the host and the limit', async () => {
    const { fetch } = recordingFetch(() =>
      Promise.reject(new DOMException('The operation timed out.', 'TimeoutError')),
    );

    const error = await new FetchHttpTransport(fetch, 2_500)
      .send({ method: HttpMethod.get, url, headers: {} })
      .catch((caught: unknown) => caught);

    expect(error).toEqual(
      new HttpTimeoutError('api.accounting.twinfield.com did not answer within 2500 ms.'),
    );
    expect((error as Error).name).toBe('HttpTimeoutError');
  });

  it('aborts a request that takes longer than the timeout', async () => {
    const { fetch } = recordingFetch(
      ({ init }) =>
        new Promise((_, reject) => {
          init.signal?.addEventListener('abort', () => {
            reject(init.signal?.reason as Error);
          });
        }),
    );

    await expect(
      new FetchHttpTransport(fetch, 20).send({ method: HttpMethod.get, url, headers: {} }),
    ).rejects.toBeInstanceOf(HttpTimeoutError);
  });

  it.each([
    ['a network error', new TypeError('fetch failed')],
    ['a redirect refusal', new TypeError('unexpected redirect')],
    ['an abort that is not a timeout', new DOMException('aborted', 'AbortError')],
    ['an error named TimeoutError that is not a DOMException', timeoutLookalike()],
  ])('passes %s through unchanged', async (_, failure) => {
    const { fetch } = recordingFetch(() => Promise.reject(failure));

    await expect(
      new FetchHttpTransport(fetch, 1_000).send({ method: HttpMethod.get, url, headers: {} }),
    ).rejects.toBe(failure);
  });

  it('passes a failure while the body is read through', async () => {
    const failure = new TypeError('terminated');
    const broken = new Response(
      new ReadableStream({
        start(controller) {
          controller.error(failure);
        },
      }),
    );
    const { fetch } = recordingFetch(() => Promise.resolve(broken));

    await expect(
      new FetchHttpTransport(fetch, 1_000).send({ method: HttpMethod.get, url, headers: {} }),
    ).rejects.toBe(failure);
  });
});

function timeoutLookalike(): Error {
  const error = new Error('timed out');
  error.name = 'TimeoutError';

  return error;
}
