import { beforeEach, describe, expect, it } from 'vitest';

import { SessionProvider } from '../../../src/auth/session-provider.js';
import { OAuthError, TokenEndpoint } from '../../../src/auth/token-endpoint.js';
import { TokenValidator } from '../../../src/auth/token-validator.js';
import { ClientCredentials } from '../../../src/domain/credentials.js';
import { CLUSTER, FakeClock } from '../../support/fake-twinfield.js';
import { Gate } from '../../support/io-http.js';
import { FakeLogin, MemoryRefreshTokenStore } from '../../support/io-login.js';

const HOUR_MS = 3_600_000;
const MARGIN_MS = 60_000;

describe('SessionProvider', () => {
  let login: FakeLogin;
  let store: MemoryRefreshTokenStore;
  let clock: FakeClock;
  let provider: SessionProvider;

  beforeEach(() => {
    login = new FakeLogin();
    store = new MemoryRefreshTokenStore();
    clock = new FakeClock();
    provider = new SessionProvider(
      new TokenEndpoint(login, ClientCredentials.of('client', 'secret'), clock),
      new TokenValidator(login),
      store,
      clock,
    );
  });

  const refreshTokensSent = (): (string | null)[] =>
    login.tokenRequests.map((request) => new URLSearchParams(request.body).get('refresh_token'));

  it('renews from the stored refresh token and validates the new access token', async () => {
    const start = clock.now().getTime();

    const session = await provider.current();

    expect(session.accessToken.reveal()).toBe('access-1');
    expect(session.cluster.toString()).toBe(CLUSTER);
    expect(session.expiresAt.getTime()).toBe(start + HOUR_MS);
    expect(refreshTokensSent()).toEqual(['refresh-1']);
    expect(login.validationRequests[0]!.url.searchParams.get('token')).toBe('access-1');
  });

  it('keeps the session until one millisecond before the renewal margin', async () => {
    const first = await provider.current();
    clock.advance(HOUR_MS - MARGIN_MS - 1);

    const second = await provider.current();

    expect(second).toBe(first);
    expect(login.tokenRequests).toHaveLength(1);
  });

  it('renews the session exactly at 60 seconds before it expires', async () => {
    const first = await provider.current();
    clock.advance(HOUR_MS - MARGIN_MS);

    const second = await provider.current();

    expect(second).not.toBe(first);
    expect(second.accessToken.reveal()).toBe('access-2');
    expect(login.tokenRequests).toHaveLength(2);
  });

  it('renews a token whose lifetime is shorter than the margin on every call', async () => {
    login.expiresInSeconds = 30;

    await provider.current();
    await provider.current();

    expect(login.tokenRequests).toHaveLength(2);
  });

  it('lets concurrent callers share one token request', async () => {
    const gate = new Gate();
    login.hold = gate.opened;

    const calls = [provider.current(), provider.current(), provider.current()];
    gate.open();
    const sessions = await Promise.all(calls);

    expect(login.tokenRequests).toHaveLength(1);
    expect(new Set(sessions).size).toBe(1);
  });

  it('starts a new shared renewal after the previous one settled', async () => {
    await Promise.all([provider.current(), provider.current()]);
    clock.advance(HOUR_MS);

    await Promise.all([provider.current(), provider.current()]);

    expect(login.tokenRequests).toHaveLength(2);
  });

  it('saves a rotated refresh token and sends it on the next renewal', async () => {
    login.rotatedRefreshToken = 'refresh-2';

    await provider.current();
    clock.advance(HOUR_MS);
    await provider.current();

    expect(store.saved).toEqual(['refresh-2']);
    expect(refreshTokensSent()).toEqual(['refresh-1', 'refresh-2']);
  });

  it('does not save the refresh token when Twinfield returns the same one', async () => {
    login.rotatedRefreshToken = 'refresh-1';

    await provider.current();

    expect(store.saved).toEqual([]);
  });

  it('does not save anything when Twinfield returns no refresh token', async () => {
    login.rotatedRefreshToken = undefined;

    await provider.current();

    expect(store.saved).toEqual([]);
  });

  it('renews after the current session is invalidated', async () => {
    const first = await provider.current();

    provider.invalidate(first);
    const second = await provider.current();

    expect(second.accessToken.reveal()).toBe('access-2');
  });

  it('ignores the invalidation of a session that is no longer current', async () => {
    const first = await provider.current();
    provider.invalidate(first);
    const second = await provider.current();

    provider.invalidate(first);
    const third = await provider.current();

    expect(third).toBe(second);
    expect(login.tokenRequests).toHaveLength(2);
  });

  it('rejects a failed renewal and tries again on the next call', async () => {
    login.tokenStatus = 400;

    await expect(provider.current()).rejects.toThrow(OAuthError);

    login.tokenStatus = 200;
    const session = await provider.current();

    expect(session.accessToken.reveal()).toBe('access-2');
    expect(login.tokenRequests).toHaveLength(2);
  });

  it('rejects every concurrent caller of a failed renewal', async () => {
    login.tokenStatus = 400;

    const results = await Promise.allSettled([provider.current(), provider.current()]);

    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
    expect(login.tokenRequests).toHaveLength(1);
  });

  it('drops an expiring session before it renews, so a failed renewal leaves no token', async () => {
    await provider.current();
    clock.advance(HOUR_MS);
    login.tokenStatus = 400;

    await expect(provider.current()).rejects.toThrow(OAuthError);

    clock.advance(-HOUR_MS);
    await expect(provider.current()).rejects.toThrow(OAuthError);
    expect(login.tokenRequests).toHaveLength(3);
  });

  it('fails closed when the refresh token store cannot be read', async () => {
    store.loadFailure = new Error('No credentials at /x. Run twinfield-mcp-login first.');

    await expect(provider.current()).rejects.toThrow('No credentials at /x');
    expect(login.tokenRequests).toEqual([]);
  });

  it('rejects the renewal when a rotated refresh token cannot be saved', async () => {
    login.rotatedRefreshToken = 'refresh-2';
    store.saveFailure = new Error('disk full');

    await expect(provider.current()).rejects.toThrow('disk full');
    expect(login.validationRequests).toEqual([]);
  });

  it('fails closed when the token belongs to a host that is not a Twinfield cluster', async () => {
    login.clusterUrl = 'https://api.accounting.twinfield.com.example.org';

    await expect(provider.current()).rejects.toThrow('is not a Twinfield cluster');

    login.clusterUrl = CLUSTER;
    await provider.current();
    expect(login.tokenRequests).toHaveLength(2);
  });
});
