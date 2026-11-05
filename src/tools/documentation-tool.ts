import type { DocumentationLibrary } from '../docs/documentation-library.js';
import { InvalidArgumentError } from '../serialization/invalid-argument-error.js';
import type { JsonSchema } from '../serialization/json-schema.js';
import {
  annotationsFor,
  type ToolAnnotations,
  type ToolResult,
  type TwinfieldTool,
} from './twinfield-tool.js';
import { OperationEffect } from '../catalog/catalog-types.js';

/** Returns one page of the Twinfield documentation, so element names need no guessing. */
export class DocumentationTool implements TwinfieldTool {
  readonly name = 'twinfield_documentation';
  readonly description =
    'Read a page of the Twinfield web service documentation (Markdown): the XML elements, ' +
    'allowed values, finder types and examples of each entity. Read it before writing data.';
  readonly inputSchema: JsonSchema;
  readonly annotations: ToolAnnotations = {
    ...annotationsFor(OperationEffect.read),
    openWorldHint: false,
  };

  constructor(private readonly library: DocumentationLibrary) {
    this.inputSchema = {
      type: 'object',
      properties: { page: { type: 'string', enum: [...library.list()] } },
      required: ['page'],
      additionalProperties: false,
    };
  }

  execute(args: Readonly<Record<string, unknown>>): Promise<ToolResult> {
    const page = args['page'];
    if (typeof page !== 'string' || !this.library.has(page)) {
      throw new InvalidArgumentError('page', 'must be one of the listed documentation pages');
    }

    return Promise.resolve({
      isError: false,
      payload: { source: this.library.sourceUrl(page), markdown: this.library.read(page) },
    });
  }
}
