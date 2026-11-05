import { describe, expect, it } from 'vitest';

import { HttpMethod, type HttpResponse } from '../../../src/http/http-transport.js';
import { RateLimitRetryTransport, type RetryPolicy } from '../../../src/http/rate-limit-retry.js';
import { RecordingTransport, httpResponse } from '../../support/io-http.js';

const POLICY: RetryPolicy = { maxAttempts: 5, initialDelayMs: 1_000, maxDelayMs: 10_000 };
const request = {
  method: HttpMethod.post,
  url: new URL('https://api.accounting.twinfield.com/webservices/processxml.asmx'),
  headers: {},
  body: '<a/>',
};

const tooMany = (body = 'busy', headers: Record<string, string> = {}): HttpResponse =>
  httpResponse(429, body, headers);

function retrying(responses: HttpResponse[], policy: RetryPolicy = POLICY) {
  const inner = RecordingTransport.answering(...responses);
  const sleeps: number[] = [];
  const transport = new RateLimitRetryTransport(
    inner,
    (milliseconds) => {
      sleeps.push(milliseconds);

      return Promise.resolve();
    },
    policy,
  );

  return { inner, sleeps, transport };
}

describe('RateLimitRetryTransport', () => {
  it('returns a first answer that is not 429 without waiting', async () => {
    const { inner, sleeps, transport } = retrying([httpResponse(200, 'ok')]);

    const response = await transport.send(request);

    expect(response.body).toBe('ok');
    expect(inner.requests).toHaveLength(1);
    expect(sleeps).toEqual([]);
  });

  it.each([400, 401, 500, 502, 503])('does not retry HTTP %i', async (status) => {
    const { inner, sleeps, transport } = retrying([httpResponse(status, 'failed')]);

    const response = await transport.send(request);

    expect(response.status).toBe(status);
    expect(inner.requests).toHaveLength(1);
    expect(sleeps).toEqual([]);
  });

  it('sends the same request again after a 429', async () => {
    const { inner, transport } = retrying([tooMany(), httpResponse(200, 'ok')]);

    const response = await transport.send(request);

    expect(response.body).toBe('ok');
    expect(inner.requests).toEqual([request, request]);
  });

  it('waits the initial delay and doubles it per attempt without Retry-After', async () => {
    const { sleeps, transport } = retrying([
      tooMany(),
      tooMany(),
      tooMany(),
      httpResponse(200, 'ok'),
    ]);

    await transport.send(request);

    expect(sleeps).toEqual([1_000, 2_000, 4_000]);
  });

  it('starts at Retry-After in seconds and doubles from there', async () => {
    const { sleeps, transport } = retrying([
      tooMany('busy', { 'retry-after': '2' }),
      tooMany('busy', { 'retry-after': '2' }),
      httpResponse(200, 'ok'),
    ]);

    await transport.send(request);

    expect(sleeps).toEqual([2_000, 4_000]);
  });

  it('takes Retry-After from each 429 that is answered', async () => {
    const { sleeps, transport } = retrying([
      tooMany('busy', { 'retry-after': '3' }),
      tooMany(),
      httpResponse(200, 'ok'),
    ]);

    await transport.send(request);

    expect(sleeps).toEqual([3_000, 2_000]);
  });

  it('caps every wait at maxDelayMs', async () => {
    const { sleeps, transport } = retrying([
      tooMany('busy', { 'retry-after': '4' }),
      tooMany('busy', { 'retry-after': '4' }),
      tooMany('busy', { 'retry-after': '86400' }),
      httpResponse(200, 'ok'),
    ]);

    await transport.send(request);

    expect(sleeps).toEqual([4_000, 8_000, 10_000]);
  });

  it.each([
    ['a date', 'Wed, 04 Nov 2026 10:00:00 GMT'],
    ['zero', '0'],
    ['a negative number', '-5'],
    ['text', 'soon'],
    ['infinity', 'Infinity'],
  ])('uses the initial delay when Retry-After is %s', async (_, retryAfter) => {
    const { sleeps, transport } = retrying([
      tooMany('busy', { 'retry-after': retryAfter }),
      httpResponse(200, 'ok'),
    ]);

    await transport.send(request);

    expect(sleeps).toEqual([1_000]);
  });

  it('stops after maxAttempts and returns the last 429', async () => {
    const { inner, sleeps, transport } = retrying(
      [tooMany('first'), tooMany('second'), tooMany('third')],
      { ...POLICY, maxAttempts: 3 },
    );

    const response = await transport.send(request);

    expect(response.status).toBe(429);
    expect(response.body).toBe('third');
    expect(inner.requests).toHaveLength(3);
    expect(sleeps).toEqual([1_000, 2_000]);
  });

  it.each([1, 0, -1])(
    'sends once and never retries when maxAttempts is %i',
    async (maxAttempts) => {
      const { inner, sleeps, transport } = retrying([tooMany()], { ...POLICY, maxAttempts });

      const response = await transport.send(request);

      expect(response.status).toBe(429);
      expect(inner.requests).toHaveLength(1);
      expect(sleeps).toEqual([]);
    },
  );

  it('sends nothing more when the wait fails', async () => {
    const inner = RecordingTransport.answering(tooMany());
    const failure = new Error('aborted');
    const transport = new RateLimitRetryTransport(inner, () => Promise.reject(failure), POLICY);

    await expect(transport.send(request)).rejects.toBe(failure);
    expect(inner.requests).toHaveLength(1);
  });

  it('passes a transport failure on a retry through', async () => {
    const failure = new Error('connection reset');
    let calls = 0;
    const inner = new RecordingTransport(() => {
      calls += 1;

      return calls === 1 ? tooMany() : Promise.reject(failure);
    });
    const transport = new RateLimitRetryTransport(inner, () => Promise.resolve(), POLICY);

    await expect(transport.send(request)).rejects.toBe(failure);
    expect(inner.requests).toHaveLength(2);
  });
});
