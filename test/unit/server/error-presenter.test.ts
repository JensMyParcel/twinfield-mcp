import { describe, expect, it } from 'vitest';

import { OAuthError } from '../../../src/auth/token-endpoint.js';
import { ConfigurationError } from '../../../src/config/configuration.js';
import { HttpTimeoutError } from '../../../src/http/http-transport.js';
import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import { ErrorPresenter } from '../../../src/server/error-presenter.js';
import { ProcessXmlError } from '../../../src/soap/process-xml-client.js';
import { TwinfieldFault, TwinfieldHttpError } from '../../../src/soap/twinfield-error.js';
import { InvalidXmlPayloadError } from '../../../src/xml/xml-json.js';
import { XmlParseError } from '../../../src/xml/xml-reader.js';

const OPAQUE = {
  error: 'UnexpectedError',
  message: 'The tool failed unexpectedly. The server log has the details.',
};

function presenter() {
  const logged: string[] = [];
  const errors = new ErrorPresenter({ error: (message) => logged.push(message) });

  return { errors, logged };
}

describe('ErrorPresenter', () => {
  it.each([
    [new InvalidArgumentError('company', 'must be a string'), 'InvalidArgumentError'],
    [new InvalidXmlPayloadError('payload.x: bad'), 'InvalidXmlPayloadError'],
    [new TwinfieldHttpError(502), 'TwinfieldHttpError'],
    [new OAuthError('The token endpoint refused the request: invalid_grant.'), 'OAuthError'],
    [
      new HttpTimeoutError('login.twinfield.com did not answer within 1000 ms.'),
      'HttpTimeoutError',
    ],
    [new ProcessXmlError('ProcessXmlString returned no result.'), 'ProcessXmlError'],
    [new XmlParseError('Malformed XML: x'), 'XmlParseError'],
  ])('shows the name and message of the expected error %s', (error, name) => {
    const { errors, logged } = presenter();

    expect(errors.present(error)).toEqual({ error: name, message: error.message });
    expect(logged).toEqual([]);
  });

  it('shows a Twinfield fault with its HTTP status, code and source', () => {
    const { errors, logged } = presenter();
    const fault = new TwinfieldFault(500, 'soap:Server', 'Office not found', '102', 'Search');

    expect(errors.present(fault)).toEqual({
      error: 'TwinfieldFault',
      httpStatus: 500,
      faultCode: 'soap:Server',
      message: 'Office not found',
      code: '102',
      source: 'Search',
    });
    expect(logged).toEqual([]);
  });

  it('shows a Twinfield fault without code and source', () => {
    const { errors } = presenter();

    expect(
      errors.present(new TwinfieldFault(500, 'soap:Client', 'Bad', undefined, undefined)),
    ).toEqual({
      error: 'TwinfieldFault',
      httpStatus: 500,
      faultCode: 'soap:Client',
      message: 'Bad',
    });
  });

  it('hides an unknown error from the caller and logs its stack', () => {
    const { errors, logged } = presenter();
    const error = new TypeError('secret=abc123 leaked in a message');

    const shown = errors.present(error);

    expect(shown).toEqual(OPAQUE);
    expect(JSON.stringify(shown)).not.toContain('abc123');
    expect(logged).toEqual([error.stack]);
  });

  it('hides an error class that is not on the expected list, such as a configuration error', () => {
    const { errors, logged } = presenter();

    expect(errors.present(new ConfigurationError('TWINFIELD_CLIENT_ID is required'))).toEqual(
      OPAQUE,
    );
    expect(logged[0]).toContain('TWINFIELD_CLIENT_ID is required');
  });

  it('hides an error that only pretends to be expected by its name', () => {
    const { errors } = presenter();
    const impostor = Object.assign(new Error('token=abc'), { name: 'InvalidArgumentError' });

    expect(errors.present(impostor)).toEqual(OPAQUE);
  });

  it('logs the message of an unknown error without a stack', () => {
    const { errors, logged } = presenter();
    const error = new Error('no stack here');
    delete error.stack;

    expect(errors.present(error)).toEqual(OPAQUE);
    expect(logged).toEqual(['no stack here']);
  });

  it.each([
    ['a string', 'boom', 'boom'],
    ['a number', 42, '42'],
    ['undefined', undefined, 'undefined'],
    ['null', null, 'null'],
    ['an object', { token: 'abc' }, '[object Object]'],
  ])('hides a thrown %s and logs it', (_label, thrown, line) => {
    const { errors, logged } = presenter();

    expect(errors.present(thrown)).toEqual(OPAQUE);
    expect(logged).toEqual([line]);
  });
});
