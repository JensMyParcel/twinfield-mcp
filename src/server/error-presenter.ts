import { OAuthError } from '../auth/token-endpoint.js';
import { HttpTimeoutError } from '../http/http-transport.js';
import { InvalidArgumentError } from '../serialization/invalid-argument-error.js';
import { ProcessXmlError } from '../soap/process-xml-client.js';
import { TwinfieldFault, TwinfieldHttpError } from '../soap/twinfield-error.js';
import { InvalidXmlPayloadError } from '../xml/xml-json.js';
import { XmlParseError } from '../xml/xml-reader.js';
import type { JsonValue } from '../xml/xml-json.js';

export interface Logger {
  error(message: string): void;
}

// Errors of these classes carry messages written for the caller and never a credential.
const EXPECTED_ERRORS = [
  InvalidArgumentError,
  InvalidXmlPayloadError,
  TwinfieldHttpError,
  OAuthError,
  HttpTimeoutError,
  ProcessXmlError,
  XmlParseError,
] as const;

/** Turns an error from a tool into the payload the caller sees. Unknown errors stay opaque. */
export class ErrorPresenter {
  constructor(private readonly logger: Logger) {}

  present(error: unknown): JsonValue {
    if (error instanceof TwinfieldFault) {
      return error.toJSON();
    }
    if (EXPECTED_ERRORS.some((type) => error instanceof type)) {
      const { name, message } = error as Error;

      return { error: name, message };
    }
    this.logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));

    return {
      error: 'UnexpectedError',
      message: 'The tool failed unexpectedly. The server log has the details.',
    };
  }
}
