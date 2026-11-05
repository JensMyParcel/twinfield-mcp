import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { z } from 'zod';

import { RefreshToken } from '../domain/credentials.js';
import { parseJson } from '../http/json-body.js';

export interface RefreshTokenStore {
  load(): Promise<RefreshToken>;
  save(token: RefreshToken): Promise<void>;
}

/** A refresh token given in the environment. A rotated token is kept for this process only. */
export class StaticRefreshTokenStore implements RefreshTokenStore {
  constructor(private token: RefreshToken) {}

  load(): Promise<RefreshToken> {
    return Promise.resolve(this.token);
  }

  save(token: RefreshToken): Promise<void> {
    this.token = token;

    return Promise.resolve();
  }
}

const CredentialsFile = z.object({ refreshToken: z.string().min(1) });

/**
 * The refresh token in a JSON file that only the current user can read. `twinfield-mcp-login`
 * writes it; the server reads it and writes a rotated token back.
 */
export class FileRefreshTokenStore implements RefreshTokenStore {
  constructor(private readonly path: string) {}

  async load(): Promise<RefreshToken> {
    let content: string;
    try {
      content = await readFile(this.path, 'utf8');
    } catch {
      throw new Error(`No credentials at ${this.path}. Run twinfield-mcp-login first.`);
    }
    const parsed = CredentialsFile.safeParse(parseJson(content));
    if (!parsed.success) {
      throw new Error(`The credentials file ${this.path} is not valid.`);
    }

    return RefreshToken.of(parsed.data.refreshToken);
  }

  async save(token: RefreshToken): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    const temporary = `${this.path}.tmp`;
    await writeFile(temporary, JSON.stringify({ refreshToken: token.reveal() }), { mode: 0o600 });
    // writeFile keeps the mode of a file that already exists, so it is set explicitly.
    await chmod(temporary, 0o600);
    await rename(temporary, this.path);
  }
}
