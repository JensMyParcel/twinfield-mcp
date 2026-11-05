import { describe, expect, it } from 'vitest';

import {
  InvalidArgumentError,
  childPath,
  isPlainObject,
} from '../../../src/serialization/invalid-argument-error.js';

describe('InvalidArgumentError', () => {
  it('prefixes the reason with the argument path', () => {
    const error = new InvalidArgumentError('office.code', 'is required');

    expect(error.message).toBe('office.code: is required');
    expect(error.path).toBe('office.code');
    expect(error.name).toBe('InvalidArgumentError');
    expect(error).toBeInstanceOf(Error);
  });

  it('names the arguments as a whole when the path is empty', () => {
    expect(new InvalidArgumentError('', 'must be an object').message).toBe(
      'arguments: must be an object',
    );
  });
});

describe('childPath', () => {
  it('joins a property name with a dot', () => {
    expect(childPath('office', 'code')).toBe('office.code');
  });

  it('starts a top-level property without a dot', () => {
    expect(childPath('', 'office')).toBe('office');
  });

  it('writes an array index in brackets, also index zero and at the top level', () => {
    expect(childPath('lines', 0)).toBe('lines[0]');
    expect(childPath('', 2)).toBe('[2]');
  });
});

describe('isPlainObject', () => {
  it('accepts objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
  });

  it.each([null, undefined, [], 'x', 1, true])('rejects %j', (value) => {
    expect(isPlainObject(value)).toBe(false);
  });
});
