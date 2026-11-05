import { inspect } from 'node:util';

/** An OAuth access token. It never shows its value in logs, errors, JSON or `util.inspect`. */
export class AccessToken {
  // A `#` field, so `util.inspect` and `console.log` cannot list the value.
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  static of(value: string): AccessToken {
    if (value.trim() === '' || /\s/.test(value)) {
      throw new Error('An access token must be a non-empty string without white space.');
    }

    return new AccessToken(value);
  }

  reveal(): string {
    return this.#value;
  }

  toString(): string {
    return 'AccessToken(redacted)';
  }

  toJSON(): string {
    return this.toString();
  }

  [inspect.custom](): string {
    return this.toString();
  }
}
