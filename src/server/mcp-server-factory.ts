import {
  fromJsonSchema,
  McpServer,
  type CallToolResult,
  type JsonSchemaType,
} from '@modelcontextprotocol/server';

import type { DocumentationLibrary } from '../docs/documentation-library.js';
import { isPlainObject } from '../serialization/invalid-argument-error.js';
import type { ToolResult, TwinfieldTool } from '../tools/twinfield-tool.js';
import type { JsonValue } from '../xml/xml-json.js';
import type { ErrorPresenter } from './error-presenter.js';

export const SERVER_NAME = 'twinfield-mcp';
const DOCS_SCHEME = 'twinfield-docs://';

/** Puts the tools and the documentation pages on one MCP server. */
export class McpServerFactory {
  constructor(
    private readonly tools: readonly TwinfieldTool[],
    private readonly documentation: DocumentationLibrary,
    private readonly errors: ErrorPresenter,
    private readonly version: string,
  ) {}

  create(): McpServer {
    const server = new McpServer({ name: SERVER_NAME, version: this.version });
    this.tools.forEach((tool) => {
      this.registerTool(server, tool);
    });
    this.documentation.list().forEach((page) => {
      this.registerPage(server, page);
    });

    return server;
  }

  private registerTool(server: McpServer, tool: TwinfieldTool): void {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: fromJsonSchema<Record<string, unknown>>(tool.inputSchema as JsonSchemaType),
        annotations: { ...tool.annotations },
      },
      async (args: unknown) => this.run(tool, isPlainObject(args) ? args : {}),
    );
  }

  private async run(tool: TwinfieldTool, args: Record<string, unknown>): Promise<CallToolResult> {
    let result: ToolResult;
    try {
      result = await tool.execute(args);
    } catch (error) {
      result = { isError: true, payload: this.errors.present(error) };
    }

    return toCallToolResult(result.payload, result.isError);
  }

  private registerPage(server: McpServer, page: string): void {
    const uri = `${DOCS_SCHEME}${page}`;
    server.registerResource(
      page,
      uri,
      { title: `Twinfield documentation: ${page}`, mimeType: 'text/markdown' },
      () => ({
        contents: [{ uri, mimeType: 'text/markdown', text: this.documentation.read(page) }],
      }),
    );
  }
}

function toCallToolResult(payload: JsonValue, isError: boolean): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }], isError };
}
