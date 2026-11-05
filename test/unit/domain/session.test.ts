import { describe, expect, it } from 'vitest';

import { AccessToken } from '../../../src/domain/access-token.js';
import { ClusterUrl } from '../../../src/domain/cluster-url.js';
import { Session } from '../../../src/domain/session.js';

const EXPIRES_AT = new Date('2026-11-04T11:00:00.000Z');
const MINUTE = 60_000;

function session(): Session {
  return new Session(
    AccessToken.of('token'),
    ClusterUrl.parse('https://api.accounting.twinfield.com'),
    EXPIRES_AT,
  );
}

const at = (offsetMs: number) => new Date(EXPIRES_AT.getTime() + offsetMs);

describe('Session', () => {
  it('keeps its token, cluster and expiry', () => {
    const subject = session();

    expect(subject.accessToken.reveal()).toBe('token');
    expect(subject.cluster.toString()).toBe('https://api.accounting.twinfield.com');
    expect(subject.expiresAt).toBe(EXPIRES_AT);
  });

  it('is not expiring one millisecond before the margin starts', () => {
    expect(session().isExpiring(at(-MINUTE - 1), MINUTE)).toBe(false);
  });

  it('is expiring exactly when the margin starts', () => {
    expect(session().isExpiring(at(-MINUTE), MINUTE)).toBe(true);
  });

  it('is expiring inside the margin and after expiry', () => {
    expect(session().isExpiring(at(-1), MINUTE)).toBe(true);
    expect(session().isExpiring(at(MINUTE), MINUTE)).toBe(true);
  });

  it('with a zero margin, is expiring exactly at expiry and not one millisecond before', () => {
    expect(session().isExpiring(at(0), 0)).toBe(true);
    expect(session().isExpiring(at(-1), 0)).toBe(false);
  });

  it('measures the margin in milliseconds, not seconds', () => {
    expect(session().isExpiring(at(-30_000), 60)).toBe(false);
  });
});
