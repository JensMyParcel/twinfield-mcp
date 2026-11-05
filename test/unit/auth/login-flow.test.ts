import { beforeEach, describe, expect, it } from 'vitest';

import { CallbackServer, LoginCallbackError } from '../../../src/auth/callback-server.js';
import { LOGIN_SCOPES, LoginEndpoints } from '../../../src/auth/login-endpoints.js';
import { LoginFlow, secureRandom } from '../../../src/auth/login-flow.js';
import { OAuthError, TokenEndpoint } from '../../../src/auth/token-endpoint.js';
import { ClientCredentials } from '../../../src/domain/credentials.js';
import { FakeClock } from '../../support/fake-twinfield.js';
import { RecordingTransport, jsonResponse } from '../../support/io-http.js';
import { MemoryRefreshTokenStore } from '../../support/io-login.js';
import {
  freePort,
  isClosed,
  sendWhenListening,
  type LoopbackAnswer,
} from '../../support/io-loopback.js';

const client = ClientCredentials.of('client-id', 'secret');

function counter(): () => string {
  let count = 0;

  return () => {
    count += 1;

    return `random-${count}`;
  };
}

describe('LoginFlow', () => {
  let port: number;
  let redirectUri: URL;
  let store: MemoryRefreshTokenStore;
  let messages: string[];
  let answers: Promise<LoopbackAnswer>[];

  beforeEach(async () => {
    port = await freePort();
    redirectUri = new URL(`http://127.0.0.1:${port}/callback`);
    store = new MemoryRefreshTokenStore();
    messages = [];
    answers = [];
  });

  const flowWith = (http: RecordingTransport): LoginFlow =>
    new LoginFlow(
      client,
      redirectUri,
      new TokenEndpoint(http, client, new FakeClock()),
      store,
      new CallbackServer(),
      counter(),
    );

  /** Plays the browser: opens the printed URL's redirect with the state Twinfield echoes. */
  const browser =
    (query: (state: string) => string) =>
    (message: string): void => {
      messages.push(message);
      const printed = /https:\S+/.exec(message);
      if (printed === null) {
        return;
      }
      const state = new URL(printed[0]).searchParams.get('state') ?? '';
      answers.push(
        sendWhenListening(new URL(`${redirectUri.pathname}?${query(state)}`, redirectUri)),
      );
    };

  it('builds the authorize URL with the client, all scopes, the state and a nonce', () => {
    const flow = flowWith(RecordingTransport.answering());

    const url = flow.authorizeUrl('the-state');

    expect(`${url.origin}${url.pathname}`).toBe(LoginEndpoints.authorize.toString());
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'client-id',
      response_type: 'code',
      scope: LOGIN_SCOPES.join(' '),
      redirect_uri: redirectUri.toString(),
      state: 'the-state',
      nonce: 'random-1',
    });
    expect(LoginEndpoints.authorize.search).toBe('');
  });

  it('exchanges the code from the callback and stores the refresh token', async () => {
    const http = RecordingTransport.answering(
      jsonResponse({ access_token: 'access-1', expires_in: 3600, refresh_token: 'refresh-new' }),
    );

    await flowWith(http).run(browser((state) => `state=${state}&code=the-code`));

    expect(messages[0]).toContain('state=random-1');
    expect(messages[0]).toContain('nonce=random-2');
    expect(Object.fromEntries(new URLSearchParams(http.only().body))).toEqual({
      grant_type: 'authorization_code',
      code: 'the-code',
      redirect_uri: redirectUri.toString(),
    });
    expect(store.saved).toEqual(['refresh-new']);
    expect(messages[1]).toBe('Logged in. The refresh token is stored.');
    expect((await answers[0])?.status).toBe(200);
    expect(await isClosed(port)).toBe(true);
  });

  it('fails and stores nothing when Twinfield returns no refresh token', async () => {
    const http = RecordingTransport.answering(
      jsonResponse({ access_token: 'access-1', expires_in: 3600 }),
    );

    await expect(
      flowWith(http).run(browser((state) => `state=${state}&code=the-code`)),
    ).rejects.toThrow(
      new OAuthError('Twinfield returned no refresh token. Does the client have offline_access?'),
    );
    expect(store.saved).toEqual([]);
    expect(messages).toHaveLength(1);
  });

  it('does not exchange a code that arrives with a forged state', async () => {
    const http = RecordingTransport.answering();

    await expect(
      flowWith(http).run(browser(() => 'state=forged-state&code=attacker-code')),
    ).rejects.toThrow(LoginCallbackError);
    expect((await answers[0])?.status).toBe(400);
    expect(http.requests).toEqual([]);
    expect(store.saved).toEqual([]);
  });

  it('stores nothing when the token endpoint refuses the code', async () => {
    const http = RecordingTransport.answering(jsonResponse({ error: 'invalid_grant' }, 400));

    await expect(
      flowWith(http).run(browser((state) => `state=${state}&code=the-code`)),
    ).rejects.toThrow('invalid_grant');
    expect(store.saved).toEqual([]);
  });
});

describe('secureRandom', () => {
  it('returns 32 random bytes as base64url', () => {
    const values = new Set(Array.from({ length: 50 }, () => secureRandom()));

    expect(values.size).toBe(50);
    for (const value of values) {
      expect(value).toMatch(/^[A-Za-z0-9_-]{43}$/);
    }
  });
});
