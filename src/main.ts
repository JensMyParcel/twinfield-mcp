import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

import { CallbackServer } from './auth/callback-server.js';
import { SystemClock } from './auth/clock.js';
import { FileRefreshTokenStore } from './auth/refresh-token-store.js';
import { LoginFlow, secureRandom } from './auth/login-flow.js';
import { SOAP_CATALOG } from './catalog/soap-catalog.generated.js';
import { CompositionRoot, type Runtime } from './composition-root.js';
import { Configuration } from './config/configuration.js';

const PACKAGE_ROOT = new URL('../', import.meta.url);

function runtime(): Runtime {
  const packageJson = JSON.parse(readFileSync(new URL('package.json', PACKAGE_ROOT), 'utf8')) as {
    version: string;
  };

  return {
    fetch: (input, init) => fetch(input, init),
    clock: new SystemClock(),
    sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
    logger: { error: (message) => process.stderr.write(`${message}\n`) },
    catalog: SOAP_CATALOG,
    documentationDirectory: fileURLToPath(new URL('vendor/twinfield/docs', PACKAGE_ROOT)),
    version: packageJson.version,
  };
}

function root(): CompositionRoot {
  return new CompositionRoot(Configuration.fromEnvironment(process.env, homedir()), runtime());
}

export async function serveStdio(): Promise<void> {
  await root().server().connect(new StdioServerTransport());
}

export async function login(): Promise<void> {
  const configuration = Configuration.fromEnvironment(process.env, homedir());
  const flow = new LoginFlow(
    configuration.client,
    configuration.redirectUri,
    new CompositionRoot(configuration, runtime()).tokenEndpoint(),
    new FileRefreshTokenStore(configuration.credentialsFile),
    new CallbackServer(),
    secureRandom,
  );
  await flow.run((message) => process.stderr.write(`${message}\n`));
}

export function exitOnError(error: unknown): never {
  process.stderr.write(
    `twinfield-mcp: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
}
