/** XML that cannot be read: malformed, with a DOCTYPE, or with an invalid reference or name. */
export class XmlParseError extends Error {
  override readonly name = 'XmlParseError';
}
