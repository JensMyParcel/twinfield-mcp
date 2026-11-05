import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { describe, expect, it } from 'vitest';

// The entry points only wire the real process (stdio, environment, home directory). They are
// left out of unit coverage, so these tests start them as real processes instead.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TSX = ['--import', 'tsx'];
const CREDENTIALS = { TWINFIELD_CLIENT_ID: 'client', TWINFIELD_CLIENT_SECRET: 'secret' };

function environment(extra: Record<string, string>): Record<string, string> {
  return {
    PATH: process.env['PATH'] ?? '',
    HOME: mkdtempSync(join(tmpdir(), 'twf-home-')),
    ...extra,
  };
}

function run(script: string, env: Record<string, string>) {
  const child = spawn(process.execPath, [...TSX, script], { cwd: ROOT, env });
  let stderr = '';
  child.stderr.on('data', (chunk: Buffer) => {
    stderr += chunk.toString();
  });
  const exited = new Promise<number | null>((resolve) => child.on('exit', resolve));

  return { child, exited, stderr: () => stderr };
}

async function waitFor(condition: () => boolean, what: string): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Timed out waiting for ${what}.`);
}

describe('the stdio entry point', () => {
  it('serves every tool over stdio with only client credentials configured', async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [...TSX, 'src/bin/stdio.ts'],
      cwd: ROOT,
      env: environment({ ...CREDENTIALS, TWINFIELD_REFRESH_TOKEN: 'refresh' }),
    });
    const client = new Client({ name: 'entrypoint-test', version: '1.0.0' });
    await client.connect(transport);

    const { tools } = await client.listTools();
    const version = client.getServerVersion();
    await client.close();

    expect(tools.length).toBe(99);
    expect(version).toMatchObject({ name: 'twinfield-mcp', version: '0.1.0' });
  }, 30_000);

  it('exits with status 1 and names the missing setting when the client id is absent', async () => {
    const server = run('src/bin/stdio.ts', environment({ TWINFIELD_CLIENT_SECRET: 'secret' }));

    expect(await server.exited).toBe(1);
    expect(server.stderr()).toContain('TWINFIELD_CLIENT_ID is required');
  }, 30_000);
});

describe('the login entry point', () => {
  it('prints the authorize URL and fails closed on a callback with the wrong state', async () => {
    const port = 18_000 + Math.floor(Math.random() * 1_000);
    const login = run(
      'src/bin/login.ts',
      environment({ ...CREDENTIALS, TWINFIELD_REDIRECT_URI: `http://127.0.0.1:${port}/callback` }),
    );
    await waitFor(() => login.stderr().includes('https://login.twinfield.com/'), 'the login URL');

    const response = await fetch(`http://127.0.0.1:${port}/callback?code=abc&state=forged`);

    expect(response.status).toBe(400);
    expect(await login.exited).toBe(1);
    expect(login.stderr()).toContain('The login response has the wrong state.');
    expect(login.stderr()).toContain(
      'scope=openid+twf.user+twf.organisation+twf.organisationUser+offline_access',
    );
  }, 30_000);
});
