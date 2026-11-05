import { request } from 'node:http';
import { createServer, connect, type AddressInfo } from 'node:net';

export interface LoopbackAnswer {
  readonly status: number;
  readonly body: string;
}

/** A port on 127.0.0.1 that was free a moment ago. */
export function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address() as AddressInfo;
      probe.close(() => {
        resolve(port);
      });
    });
  });
}

/** Sends one request without connection reuse, so a closed server is seen as closed. */
export function sendTo(url: URL, method = 'GET'): Promise<LoopbackAnswer> {
  return new Promise((resolve, reject) => {
    const outgoing = request(url, { method, agent: false }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk: string) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ status: response.statusCode ?? 0, body });
      });
    });
    outgoing.on('error', reject);
    outgoing.end();
  });
}

/**
 * Sends the request once the server listens. A login flow prints its URL before it starts the
 * callback server, as a person at a terminal is slower than that.
 */
export async function sendWhenListening(url: URL, attempts = 100): Promise<LoopbackAnswer> {
  try {
    return await sendTo(url);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ECONNREFUSED' || attempts <= 1) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 5));

    return sendWhenListening(url, attempts - 1);
  }
}

/** Resolves true when nothing accepts connections on the port. */
export function isClosed(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect(port, '127.0.0.1');
    socket.once('connect', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(true);
    });
  });
}
