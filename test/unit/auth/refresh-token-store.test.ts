import { chmod, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  FileRefreshTokenStore,
  StaticRefreshTokenStore,
} from '../../../src/auth/refresh-token-store.js';
import { RefreshToken } from '../../../src/domain/credentials.js';

const modeOf = async (path: string): Promise<number> => (await stat(path)).mode & 0o777;

describe('StaticRefreshTokenStore', () => {
  it('returns the token from the environment', async () => {
    const store = new StaticRefreshTokenStore(RefreshToken.of('refresh-1'));

    expect((await store.load()).reveal()).toBe('refresh-1');
  });

  it('returns a rotated token after it was saved', async () => {
    const store = new StaticRefreshTokenStore(RefreshToken.of('refresh-1'));

    await store.save(RefreshToken.of('refresh-2'));

    expect((await store.load()).reveal()).toBe('refresh-2');
  });
});

describe('FileRefreshTokenStore', () => {
  let directory: string;
  let path: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'twinfield-mcp-store-'));
    path = join(directory, 'nested', 'config', 'credentials.json');
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('creates the directory only the user can enter and a file only the user can read', async () => {
    await new FileRefreshTokenStore(path).save(RefreshToken.of('refresh-1'));

    expect(await modeOf(join(directory, 'nested', 'config'))).toBe(0o700);
    expect(await modeOf(path)).toBe(0o600);
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({ refreshToken: 'refresh-1' });
  });

  it('makes an existing world-readable file private when it replaces the token', async () => {
    const store = new FileRefreshTokenStore(path);
    await store.save(RefreshToken.of('refresh-1'));
    await chmod(path, 0o644);

    await store.save(RefreshToken.of('refresh-2'));

    expect(await modeOf(path)).toBe(0o600);
    expect((await store.load()).reveal()).toBe('refresh-2');
  });

  it('makes a world-readable temporary file left by a crash private', async () => {
    const store = new FileRefreshTokenStore(path);
    await store.save(RefreshToken.of('refresh-1'));
    await writeFile(`${path}.tmp`, 'left over', { mode: 0o644 });
    await chmod(`${path}.tmp`, 0o644);

    await store.save(RefreshToken.of('refresh-2'));

    expect(await modeOf(path)).toBe(0o600);
    expect(await readdir(join(directory, 'nested', 'config'))).toEqual(['credentials.json']);
  });

  it('reads back the token it saved', async () => {
    const store = new FileRefreshTokenStore(path);
    await store.save(RefreshToken.of('refresh-1'));

    const loaded = await new FileRefreshTokenStore(path).load();

    expect(loaded.reveal()).toBe('refresh-1');
  });

  it('tells the user to log in when the file does not exist', async () => {
    await expect(new FileRefreshTokenStore(path).load()).rejects.toThrow(
      `No credentials at ${path}. Run twinfield-mcp-login first.`,
    );
  });

  it('tells the user to log in when the path is a directory', async () => {
    await expect(new FileRefreshTokenStore(directory).load()).rejects.toThrow(
      'Run twinfield-mcp-login first.',
    );
  });

  it.each([
    ['not JSON', 'refresh-1'],
    ['an empty file', ''],
    ['JSON without a token', '{}'],
    ['an empty token', '{"refreshToken":""}'],
    ['a token that is not a string', '{"refreshToken":42}'],
    ['a JSON array', '["refresh-1"]'],
  ])('rejects a credentials file with %s without showing its content', async (_, content) => {
    await new FileRefreshTokenStore(path).save(RefreshToken.of('placeholder'));
    await writeFile(path, content);

    const error = await new FileRefreshTokenStore(path).load().catch((caught: unknown) => caught);

    expect(error).toEqual(new Error(`The credentials file ${path} is not valid.`));
  });

  it('rejects a stored token with white space', async () => {
    await new FileRefreshTokenStore(path).save(RefreshToken.of('placeholder'));
    await writeFile(path, '{"refreshToken":"refresh 1"}');

    await expect(new FileRefreshTokenStore(path).load()).rejects.toThrow(
      'A refresh token must be a non-empty string without white space.',
    );
  });
});
