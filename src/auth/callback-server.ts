import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';

export class LoginCallbackError extends Error {
  override readonly name = 'LoginCallbackError';
}

const PAGE = (message: string): string =>
  `<!doctype html><meta charset="utf-8"><title>Twinfield MCP</title><p>${message}</p>`;

/**
 * Waits on the loopback redirect URI for the one authorization response that carries the
 * expected `state`. The server closes after that response or after the timeout.
 */
export class CallbackServer {
  async waitForCode(redirectUri: URL, expectedState: string, timeoutMs: number): Promise<string> {
    let server: Server | undefined;
    let timer: NodeJS.Timeout | undefined;
    try {
      return await new Promise<string>((resolve, reject) => {
        timer = setTimeout(() => {
          reject(new LoginCallbackError('No login completed before the timeout.'));
        }, timeoutMs);
        server = createServer((request, response) => {
          const outcome = handle(request, response, redirectUri, expectedState);
          if (outcome === undefined) {
            return;
          }
          if (outcome instanceof Error) {
            reject(outcome);
          } else {
            resolve(outcome);
          }
        });
        server.on('error', reject);
        server.listen(Number(redirectUri.port), redirectUri.hostname.replace(/^\[|\]$/g, ''));
      });
    } finally {
      // Also on a listen error such as EADDRINUSE, so the timer does not keep the process alive.
      clearTimeout(timer);
      server?.close();
    }
  }
}

/** Returns the code, an error to stop on, or `undefined` for an unrelated request. */
function handle(
  request: IncomingMessage,
  response: ServerResponse,
  redirectUri: URL,
  expectedState: string,
): string | Error | undefined {
  // Node always sets `url` on a server request; String() keeps the type honest without a branch.
  const url = new URL(String(request.url), redirectUri);
  if (request.method !== 'GET' || url.pathname !== redirectUri.pathname) {
    response.writeHead(404).end();

    return undefined;
  }
  const state = url.searchParams.get('state') ?? '';
  const code = url.searchParams.get('code');
  const sameState =
    state.length === expectedState.length &&
    timingSafeEqual(Buffer.from(state), Buffer.from(expectedState));
  if (!sameState || code === null || code === '') {
    response
      .writeHead(400, { 'content-type': 'text/html' })
      .end(PAGE('Login failed. Return to the terminal.'));

    return new LoginCallbackError(
      sameState
        ? `Login was not completed: ${url.searchParams.get('error') ?? 'no code'}.`
        : 'The login response has the wrong state.',
    );
  }
  response
    .writeHead(200, { 'content-type': 'text/html' })
    .end(PAGE('Logged in. You can close this window.'));

  return code;
}
