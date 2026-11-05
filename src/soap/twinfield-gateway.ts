import type { SessionProvider } from '../auth/session-provider.js';
import type { AccessToken } from '../domain/access-token.js';
import type { XmlElement } from '../xml/xml-element.js';
import type { SoapClient, SoapRequest } from './soap-client.js';
import { TwinfieldFault, TwinfieldHttpError } from './twinfield-error.js';

export type RequestBuilder = (accessToken: AccessToken) => SoapRequest;

/**
 * Sends SOAP requests with the current session. When Twinfield rejects the token itself, the
 * request did not run, so it is sent once more with a renewed token.
 */
export class TwinfieldGateway {
  constructor(
    private readonly sessions: SessionProvider,
    private readonly soap: SoapClient,
  ) {}

  async call(build: RequestBuilder): Promise<XmlElement | undefined> {
    const session = await this.sessions.current();
    try {
      return await this.soap.call(session.cluster, build(session.accessToken));
    } catch (error) {
      if (!isAuthenticationFailure(error)) {
        throw error;
      }
      this.sessions.invalidate(session);
      const renewed = await this.sessions.current();

      return this.soap.call(renewed.cluster, build(renewed.accessToken));
    }
  }
}

function isAuthenticationFailure(error: unknown): boolean {
  return (
    (error instanceof TwinfieldFault || error instanceof TwinfieldHttpError) &&
    error.isAuthenticationFailure()
  );
}
