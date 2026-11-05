import { createServer, type Server } from 'node:net';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CallbackServer, LoginCallbackError } from '../../../src/auth/callback-server.js';
import { freePort, isClosed, sendTo } from '../../support/io-loopback.js';

const STATE = 'expected-state';
const LONG_WAIT_MS = 10_000;

describe('CallbackServer', () => {
  let port: number;
  let redirectUri: URL;

  beforeEach(async () => {
    port = await freePort();
    redirectUri = new URL(`http://127.0.0.1:${port}/callback`);
  });

  const callback = (query: string): URL => new URL(`/callback?${query}`, redirectUri);

  it('resolves with the code of the response that carries the expected state', async () => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);

    const answer = await sendTo(callback(`state=${STATE}&code=the-code`));

    await expect(waiting).resolves.toBe('the-code');
    expect(answer.status).toBe(200);
    expect(answer.body).toContain('Logged in. You can close this window.');
  });

  it('closes the server after the login response', async () => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);
    await sendTo(callback(`state=${STATE}&code=the-code`));
    await waiting;

    expect(await isClosed(port)).toBe(true);
  });

  it.each([
    ['a different state of the same length', `state=${STATE.replace('e', 'x')}&code=c`],
    ['a longer state', `state=${STATE}x&code=c`],
    ['no state', 'code=c'],
    ['an empty state', 'state=&code=c'],
  ])('rejects a response with %s and closes', async (_, query) => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);
    const outcome = waiting.catch((caught: unknown) => caught);

    const answer = await sendTo(callback(query));

    expect(await outcome).toEqual(
      new LoginCallbackError('The login response has the wrong state.'),
    );
    expect(answer.status).toBe(400);
    expect(answer.body).toContain('Login failed.');
    expect(await isClosed(port)).toBe(true);
  });

  it('rejects a response with the right state but without a code', async () => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);
    const outcome = waiting.catch((caught: unknown) => caught);

    await sendTo(callback(`state=${STATE}`));

    expect(await outcome).toEqual(new LoginCallbackError('Login was not completed: no code.'));
  });

  it('rejects a response with an empty code', async () => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);
    const outcome = waiting.catch((caught: unknown) => caught);

    await sendTo(callback(`state=${STATE}&code=`));

    expect(await outcome).toBeInstanceOf(LoginCallbackError);
  });

  it('rejects an error response and names the OAuth error', async () => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);
    const outcome = waiting.catch((caught: unknown) => caught);

    await sendTo(callback(`state=${STATE}&error=access_denied`));

    expect(await outcome).toEqual(
      new LoginCallbackError('Login was not completed: access_denied.'),
    );
  });

  it('answers 404 to an unrelated path and keeps waiting for the login', async () => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);

    const favicon = await sendTo(new URL('/favicon.ico', redirectUri));
    const prefixed = await sendTo(new URL(`/callback/x?state=${STATE}&code=c`, redirectUri));
    const login = await sendTo(callback(`state=${STATE}&code=the-code`));

    expect(favicon.status).toBe(404);
    expect(prefixed.status).toBe(404);
    expect(login.status).toBe(200);
    await expect(waiting).resolves.toBe('the-code');
  });

  it('answers 404 to a POST on the callback path and keeps waiting', async () => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);

    const post = await sendTo(callback(`state=${STATE}&code=posted`), 'POST');
    await sendTo(callback(`state=${STATE}&code=the-code`));

    expect(post.status).toBe(404);
    await expect(waiting).resolves.toBe('the-code');
  });

  it('rejects when no login arrives before the timeout and closes', async () => {
    const waiting = new CallbackServer().waitForCode(redirectUri, STATE, 50);

    await expect(waiting).rejects.toThrow(
      new LoginCallbackError('No login completed before the timeout.'),
    );
    expect(await isClosed(port)).toBe(true);
  });

  describe('when the port is taken', () => {
    let occupant: Server;

    beforeEach(async () => {
      occupant = createServer();
      await new Promise<void>((resolve) => occupant.listen(port, '127.0.0.1', resolve));
    });

    afterEach(async () => {
      vi.useRealTimers();
      await new Promise((resolve) => occupant.close(resolve));
    });

    it('rejects with the listen error', async () => {
      const waiting = new CallbackServer().waitForCode(redirectUri, STATE, 50);

      await expect(waiting).rejects.toMatchObject({ code: 'EADDRINUSE' });
    });

    it('leaves no armed timeout after the listen error', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const waiting = new CallbackServer().waitForCode(redirectUri, STATE, LONG_WAIT_MS);
      expect(vi.getTimerCount()).toBe(1);

      await expect(waiting).rejects.toMatchObject({ code: 'EADDRINUSE' });

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
