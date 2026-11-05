import { afterEach, describe, expect, it, vi } from 'vitest';

import { SystemClock } from '../../../src/auth/clock.js';

describe('SystemClock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the current system time', () => {
    vi.useFakeTimers({ now: new Date('2026-11-04T10:00:00Z') });

    expect(new SystemClock().now().toISOString()).toBe('2026-11-04T10:00:00.000Z');
  });

  it('returns a new date on each call, so a caller cannot move the clock', () => {
    vi.useFakeTimers({ now: new Date('2026-11-04T10:00:00Z') });
    const clock = new SystemClock();

    clock.now().setFullYear(2000);

    expect(clock.now().getUTCFullYear()).toBe(2026);
  });
});
