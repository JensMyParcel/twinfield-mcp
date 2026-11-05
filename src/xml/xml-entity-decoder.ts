import type { EntityDecoderOptions } from 'fast-xml-parser';

import { XmlParseError } from './xml-parse-error.js';

const PREDEFINED: ReadonlyMap<string, string> = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
]);

const REFERENCE = /&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z]+);/g;
const MAX_CODE_POINT = 0x10ffff;

/** The XML 1.0 `Char` production: no C0 controls but tab, LF, CR; no surrogates, FFFE, FFFF. */
function isXmlCharacter(codePoint: number): boolean {
  return (
    codePoint === 0x9 ||
    codePoint === 0xa ||
    codePoint === 0xd ||
    (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
    (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
    (codePoint >= 0x10000 && codePoint <= MAX_CODE_POINT)
  );
}

/**
 * Decodes the five predefined XML entities and numeric character references in one pass, so
 * `&amp;#233;` stays the text `&#233;`. Other names are no XML entities and stay as they are.
 */
export class XmlEntityDecoder implements EntityDecoderOptions {
  decode(text: string): string {
    return text.replace(REFERENCE, (reference, body: string) => {
      if (!body.startsWith('#')) {
        return PREDEFINED.get(body) ?? reference;
      }
      const codePoint = body.startsWith('#x')
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);
      if (!isXmlCharacter(codePoint)) {
        throw new XmlParseError(`Invalid character reference ${reference}.`);
      }

      return String.fromCodePoint(codePoint);
    });
  }

  // The parser calls these for DOCTYPE entities, which XmlReader rejects before parsing.
  setExternalEntities(): void {
    return undefined;
  }

  addInputEntities(): void {
    return undefined;
  }

  reset(): void {
    return undefined;
  }

  setXmlVersion(): void {
    return undefined;
  }
}
