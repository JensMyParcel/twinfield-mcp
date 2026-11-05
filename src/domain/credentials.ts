import { inspect } from 'node:util';

function assertToken(value: string, what: string): void {
  if (value.trim() === '' || /\s/.test(value)) {
    throw new Error(`${what} must be a non-empty string without white space.`);
  }
}

/** An OAuth refresh token. It never shows its value in logs, errors, JSON or `util.inspect`. */
export class RefreshToken {
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  static of(value: string): RefreshToken {
    assertToken(value, 'A refresh token');

    return new RefreshToken(value);
  }

  reveal(): string {
    return this.#value;
  }

  equals(other: RefreshToken): boolean {
    return this.#value === other.reveal();
  }

  toString(): string {
    return 'RefreshToken(redacted)';
  }

  toJSON(): string {
    return this.toString();
  }

  [inspect.custom](): string {
    return this.toString();
  }
}

/** The OAuth client registered in the Twinfield developer portal. */
export class ClientCredentials {
  readonly #clientSecret: string;

  private constructor(
    readonly clientId: string,
    clientSecret: string,
  ) {
    this.#clientSecret = clientSecret;
  }

  static of(clientId: string, clientSecret: string): ClientCredentials {
    assertToken(clientId, 'The client id');
    assertToken(clientSecret, 'The client secret');

    return new ClientCredentials(clientId, clientSecret);
  }

  /** The value of the `Authorization` header for the token endpoint. */
  basicAuthorization(): string {
    return `Basic ${Buffer.from(`${this.clientId}:${this.#clientSecret}`).toString('base64')}`;
  }

  toString(): string {
    return `ClientCredentials(${this.clientId}, secret redacted)`;
  }

  toJSON(): string {
    return this.toString();
  }

  [inspect.custom](): string {
    return this.toString();
  }
}
