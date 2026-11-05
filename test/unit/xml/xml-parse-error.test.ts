import { describe, expect, it } from 'vitest';

import { XmlParseError } from '../../../src/xml/xml-parse-error.js';
import { XmlParseError as ReaderXmlParseError } from '../../../src/xml/xml-reader.js';

describe('XmlParseError', () => {
  it('is an Error with its own name and the given message', () => {
    const error = new XmlParseError('Malformed XML: x');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('XmlParseError');
    expect(error.message).toBe('Malformed XML: x');
  });

  it('is the same class that XmlReader exports', () => {
    expect(ReaderXmlParseError).toBe(XmlParseError);
  });
});
