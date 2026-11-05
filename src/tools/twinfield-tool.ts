import { OperationEffect } from '../catalog/catalog-types.js';
import type { JsonSchema } from '../serialization/json-schema.js';
import type { JsonValue } from '../xml/xml-json.js';

export interface ToolAnnotations {
  readonly readOnlyHint: boolean;
  readonly destructiveHint: boolean;
  readonly idempotentHint: boolean;
  readonly openWorldHint: boolean;
}

export interface ToolResult {
  readonly isError: boolean;
  readonly payload: JsonValue;
}

/** One MCP tool. The server adapter turns it into a registered tool; it knows nothing of MCP. */
export interface TwinfieldTool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: JsonSchema;
  readonly annotations: ToolAnnotations;
  execute(args: Readonly<Record<string, unknown>>): Promise<ToolResult>;
}

const ANNOTATIONS: Readonly<Record<OperationEffect, ToolAnnotations>> = {
  [OperationEffect.read]: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  [OperationEffect.write]: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  [OperationEffect.destructive]: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export function annotationsFor(effect: OperationEffect): ToolAnnotations {
  return ANNOTATIONS[effect];
}

export function documentationHint(pages: readonly string[]): string {
  return `Field reference: call twinfield_documentation with page ${pages.map((page) => `"${page}"`).join(' or ')}.`;
}
