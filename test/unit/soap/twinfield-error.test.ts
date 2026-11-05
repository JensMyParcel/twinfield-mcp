import { describe, expect, it } from 'vitest';

import { TwinfieldFault, TwinfieldHttpError } from '../../../src/soap/twinfield-error.js';

const faultWith = (httpStatus: number, code: string | undefined): TwinfieldFault =>
  new TwinfieldFault(httpStatus, 'soap:Server', 'failed', code, undefined);

describe('TwinfieldFault', () => {
  it.each(['103', '354', 'LogonInvalid', 'AccessTokenInvalid'])(
    'is an authentication failure for code %s',
    (code) => {
      expect(faultWith(500, code).isAuthenticationFailure()).toBe(true);
    },
  );

  it('is an authentication failure for HTTP 401 without a code', () => {
    expect(faultWith(401, undefined).isAuthenticationFailure()).toBe(true);
  });

  it.each([undefined, '', '0', '3540', 'accesstokeninvalid', ' 354', 'SecurityFault'])(
    'is not an authentication failure for code %j on HTTP 500',
    (code) => {
      expect(faultWith(500, code).isAuthenticationFailure()).toBe(false);
    },
  );

  it.each([403, 200])('is not an authentication failure for HTTP %i', (status) => {
    expect(faultWith(status, 'ValidationFailed').isAuthenticationFailure()).toBe(false);
  });

  it('serializes all fields that are present', () => {
    const fault = new TwinfieldFault(500, 'soap:Server', 'Period is closed', '42', 'Period');

    expect(JSON.parse(JSON.stringify(fault))).toEqual({
      error: 'TwinfieldFault',
      httpStatus: 500,
      faultCode: 'soap:Server',
      message: 'Period is closed',
      code: '42',
      source: 'Period',
    });
    expect(fault.name).toBe('TwinfieldFault');
    expect(fault.message).toBe('Period is closed');
  });

  it('leaves absent code and source out of the JSON', () => {
    expect(Object.keys(faultWith(500, undefined).toJSON())).toEqual([
      'error',
      'httpStatus',
      'faultCode',
      'message',
    ]);
  });
});

describe('TwinfieldHttpError', () => {
  it('names only the status, never the body', () => {
    const error = new TwinfieldHttpError(502);

    expect(error.message).toBe('Twinfield answered HTTP 502 without a SOAP response.');
    expect(error.name).toBe('TwinfieldHttpError');
    expect(error.httpStatus).toBe(502);
  });

  it.each([
    [401, true],
    [403, false],
    [500, false],
    [200, false],
  ])('for HTTP %i is an authentication failure: %s', (status, expected) => {
    expect(new TwinfieldHttpError(status).isAuthenticationFailure()).toBe(expected);
  });
});
