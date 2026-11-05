// Codes after which a renewed token can succeed: 103 log-on no longer valid, 354 token invalid.
const AUTHENTICATION_CODES = new Set(['103', '354', 'LogonInvalid', 'AccessTokenInvalid']);
const UNAUTHORIZED = 401;

/** A SOAP fault returned by Twinfield. */
export class TwinfieldFault extends Error {
  override readonly name = 'TwinfieldFault';

  constructor(
    readonly httpStatus: number,
    readonly faultCode: string,
    message: string,
    readonly code: string | undefined,
    readonly source: string | undefined,
  ) {
    super(message);
  }

  isAuthenticationFailure(): boolean {
    return (
      this.httpStatus === UNAUTHORIZED ||
      (this.code !== undefined && AUTHENTICATION_CODES.has(this.code))
    );
  }

  toJSON(): Record<string, string | number> {
    return {
      error: 'TwinfieldFault',
      httpStatus: this.httpStatus,
      faultCode: this.faultCode,
      message: this.message,
      ...(this.code === undefined ? {} : { code: this.code }),
      ...(this.source === undefined ? {} : { source: this.source }),
    };
  }
}

/** An HTTP answer that is not a SOAP envelope. The body is not shown: it can be any HTML. */
export class TwinfieldHttpError extends Error {
  override readonly name = 'TwinfieldHttpError';

  constructor(readonly httpStatus: number) {
    super(`Twinfield answered HTTP ${httpStatus} without a SOAP response.`);
  }

  isAuthenticationFailure(): boolean {
    return this.httpStatus === UNAUTHORIZED;
  }
}
