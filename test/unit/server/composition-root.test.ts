import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  FileRefreshTokenStore,
  StaticRefreshTokenStore,
} from '../../../src/auth/refresh-token-store.js';
import { SOAP_CATALOG } from '../../../src/catalog/soap-catalog.generated.js';
import { CompositionRoot } from '../../../src/composition-root.js';
import { Configuration } from '../../../src/config/configuration.js';
import { RefreshToken } from '../../../src/domain/credentials.js';
import { PROCESS_XML_MESSAGES } from '../../../src/process-xml/process-xml-messages.js';
import { FakeTwinfield, fakeRuntime } from '../../support/fake-twinfield.js';

const CLIENT = { TWINFIELD_CLIENT_ID: 'client', TWINFIELD_CLIENT_SECRET: 'secret' };

function root(env: Record<string, string>, twinfield = new FakeTwinfield()): CompositionRoot {
  return new CompositionRoot(
    Configuration.fromEnvironment(env, '/home/test'),
    fakeRuntime(twinfield),
  );
}

describe('CompositionRoot.refreshTokenStore', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'twinfield-credentials-'));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true });
  });

  it('keeps the refresh token from the environment in memory', async () => {
    const store = root({ ...CLIENT, TWINFIELD_REFRESH_TOKEN: 'from-env' }).refreshTokenStore();

    expect(store).toBeInstanceOf(StaticRefreshTokenStore);
    expect((await store.load()).reveal()).toBe('from-env');
  });

  it('prefers the environment token over a credentials file', async () => {
    const file = join(directory, 'credentials.json');
    writeFileSync(file, JSON.stringify({ refreshToken: 'from-file' }));

    const store = root({
      ...CLIENT,
      TWINFIELD_REFRESH_TOKEN: 'from-env',
      TWINFIELD_CREDENTIALS_FILE: file,
    }).refreshTokenStore();

    expect((await store.load()).reveal()).toBe('from-env');
  });

  it('reads and writes the configured credentials file without an environment token', async () => {
    const file = join(directory, 'credentials.json');
    writeFileSync(file, JSON.stringify({ refreshToken: 'from-file' }));

    const store = root({ ...CLIENT, TWINFIELD_CREDENTIALS_FILE: file }).refreshTokenStore();

    expect(store).toBeInstanceOf(FileRefreshTokenStore);
    expect((await store.load()).reveal()).toBe('from-file');
    await store.save(RefreshToken.of('rotated'));
    expect((await store.load()).reveal()).toBe('rotated');
  });

  it('uses the default credentials file under the home directory', async () => {
    const store = root(CLIENT).refreshTokenStore();

    await expect(store.load()).rejects.toThrow(
      'No credentials at /home/test/.config/twinfield-mcp/credentials.json.',
    );
  });
});

describe('CompositionRoot.server', () => {
  it('serves every catalog tool, every ProcessXml tool, documentation and user info', async () => {
    const twinfield = new FakeTwinfield();
    const server = root({ ...CLIENT, TWINFIELD_REFRESH_TOKEN: 'refresh-1' }, twinfield).server();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'test', version: '1.0.0' });
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const { tools } = await client.listTools();
    const info = await client.callTool({ name: 'twinfield_user_info', arguments: {} });

    expect(tools).toHaveLength(SOAP_CATALOG.operations.length + PROCESS_XML_MESSAGES.length + 2);
    expect(client.getServerVersion()).toMatchObject({ version: '0.0.0-test' });
    expect(info.isError).toBe(false);
    expect(twinfield.requests.map((request) => request.url.pathname)).toEqual([
      '/auth/authentication/connect/token',
      '/auth/authentication/connect/accesstokenvalidation',
      '/auth/authentication/connect/userinfo',
    ]);
    await client.close();
  });
});

describe('CompositionRoot.tokenEndpoint', () => {
  it('sends the configured client credentials to the token endpoint', async () => {
    const twinfield = new FakeTwinfield();

    const grant = await root(CLIENT, twinfield).tokenEndpoint().refresh(RefreshToken.of('r-1'));

    expect(grant.accessToken.reveal()).toBe('access-1');
    expect(twinfield.requests[0]!.headers['authorization']).toBe(
      `Basic ${Buffer.from('client:secret').toString('base64')}`,
    );
  });
});
