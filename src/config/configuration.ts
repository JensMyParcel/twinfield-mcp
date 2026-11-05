import { join } from 'node:path';

import { z } from 'zod';

import { CompanyCode } from '../domain/company-code.js';
import { ClientCredentials, RefreshToken } from '../domain/credentials.js';

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

const required = (name: string) =>
  z.string({ error: `${name} is required` }).min(1, `${name} is required`);

const Environment = z.object({
  TWINFIELD_CLIENT_ID: required('TWINFIELD_CLIENT_ID'),
  TWINFIELD_CLIENT_SECRET: required('TWINFIELD_CLIENT_SECRET'),
  TWINFIELD_REFRESH_TOKEN: z.string().min(1).optional(),
  TWINFIELD_CREDENTIALS_FILE: z.string().min(1).optional(),
  TWINFIELD_COMPANY: z.string().min(1).optional(),
  TWINFIELD_REDIRECT_URI: z.string().min(1).default('http://localhost:8642/callback'),
  TWINFIELD_HTTP_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(600_000).default(60_000),
});

export class ConfigurationError extends Error {
  override readonly name = 'ConfigurationError';
}

/** Settings from the environment, parsed once at start. Invalid settings stop the server. */
export class Configuration {
  private constructor(
    readonly client: ClientCredentials,
    readonly refreshToken: RefreshToken | undefined,
    readonly credentialsFile: string,
    readonly defaultCompany: CompanyCode | undefined,
    readonly redirectUri: URL,
    readonly httpTimeoutMs: number,
  ) {}

  static fromEnvironment(env: NodeJS.ProcessEnv, homeDirectory: string): Configuration {
    const parsed = Environment.safeParse(env);
    if (!parsed.success) {
      throw new ConfigurationError(parsed.error.issues.map((issue) => issue.message).join('; '));
    }
    const values = parsed.data;

    return guard(
      () =>
        new Configuration(
          ClientCredentials.of(values.TWINFIELD_CLIENT_ID, values.TWINFIELD_CLIENT_SECRET),
          values.TWINFIELD_REFRESH_TOKEN === undefined
            ? undefined
            : RefreshToken.of(values.TWINFIELD_REFRESH_TOKEN),
          values.TWINFIELD_CREDENTIALS_FILE ??
            join(homeDirectory, '.config', 'twinfield-mcp', 'credentials.json'),
          values.TWINFIELD_COMPANY === undefined
            ? undefined
            : CompanyCode.parse(values.TWINFIELD_COMPANY),
          loopbackRedirect(values.TWINFIELD_REDIRECT_URI),
          values.TWINFIELD_HTTP_TIMEOUT_MS,
        ),
    );
  }
}

/** The login helper listens on this address, so it must stay on this machine. */
function loopbackRedirect(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.has(url.hostname) || url.port === '') {
    throw new Error('TWINFIELD_REDIRECT_URI must be http://localhost:<port>/<path>.');
  }

  return url;
}

function guard(build: () => Configuration): Configuration {
  try {
    return build();
  } catch (error) {
    throw new ConfigurationError((error as Error).message);
  }
}
