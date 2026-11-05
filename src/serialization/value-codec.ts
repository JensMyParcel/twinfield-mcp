import type { XmlAttribute, XmlNode } from '../xml/xml-element.js';
import type { JsonSchema, SchemaContext } from './json-schema.js';

export interface XmlContent {
  readonly attributes: readonly XmlAttribute[];
  readonly children: readonly XmlNode[];
}

/**
 * One XSD type as seen from both sides: the JSON Schema a tool argument must match, and the XML
 * content written for a valid argument.
 */
export interface ValueCodec {
  schema(context: SchemaContext): JsonSchema;
  content(value: unknown, path: string): XmlContent;
}
