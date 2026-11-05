import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { McpServer, type CallToolResult } from '@modelcontextprotocol/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OperationEffect } from '../../../src/catalog/catalog-types.js';
import { DocumentationLibrary } from '../../../src/docs/documentation-library.js';
import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import { ErrorPresenter } from '../../../src/server/error-presenter.js';
import { McpServerFactory, SERVER_NAME } from '../../../src/server/mcp-server-factory.js';
import {
  annotationsFor,
  type ToolResult,
  type TwinfieldTool,
} from '../../../src/tools/twinfield-tool.js';

class ScriptedTool implements TwinfieldTool {
  readonly description = 'A scripted tool.';
  readonly inputSchema = {
    type: 'object',
    properties: { code: { type: 'string' } },
    additionalProperties: false,
  };
  readonly annotations = annotationsFor(OperationEffect.destructive);
  readonly calls: Readonly<Record<string, unknown>>[] = [];

  constructor(
    readonly name: string,
    private readonly answer: (args: Readonly<Record<string, unknown>>) => Promise<ToolResult>,
  ) {}

  execute(args: Readonly<Record<string, unknown>>): Promise<ToolResult> {
    this.calls.push(args);

    return this.answer(args);
  }
}

function text(result: { content: unknown }): unknown {
  const [first] = result.content as { type: string; text: string }[];

  return JSON.parse(first!.text);
}

describe('McpServerFactory', () => {
  let directory: string;
  let logged: string[];
  let client: Client;
  const echo = new ScriptedTool('echo', (args) =>
    Promise.resolve({
      isError: false,
      payload: { received: { ...args } as Record<string, string> },
    }),
  );
  const rejected = new ScriptedTool('rejected', () =>
    Promise.resolve({ isError: true, payload: { accepted: false } }),
  );
  const invalid = new ScriptedTool('invalid', () =>
    Promise.reject(new InvalidArgumentError('code', 'must be a string')),
  );
  const crashing = new ScriptedTool('crashing', () => {
    throw new TypeError('socket hang up');
  });

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), 'twinfield-docs-'));
    writeFileSync(join(directory, 'api__miscellaneous__finder.md'), '# Finder\n');
    writeFileSync(join(directory, 'index.md'), '# Index\n');
    writeFileSync(join(directory, 'notes.txt'), 'not a page');
    logged = [];
    const server = new McpServerFactory(
      [echo, rejected, invalid, crashing],
      new DocumentationLibrary(directory),
      new ErrorPresenter({ error: (message) => logged.push(message) }),
      '9.9.9',
    ).create();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'test', version: '1.0.0' });
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    rmSync(directory, { recursive: true });
  });

  it('identifies itself with its name and version', () => {
    expect(client.getServerVersion()).toMatchObject({ name: SERVER_NAME, version: '9.9.9' });
  });

  it('lists every tool with its description, schema and annotations', async () => {
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name)).toEqual(['echo', 'rejected', 'invalid', 'crashing']);
    expect(tools[0]).toMatchObject({
      description: 'A scripted tool.',
      inputSchema: { type: 'object', properties: { code: { type: 'string' } } },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
    });
  });

  it('returns the payload of a tool as JSON text', async () => {
    const result = await client.callTool({ name: 'echo', arguments: { code: '1000' } });

    expect(result.isError).toBe(false);
    expect(text(result)).toEqual({ received: { code: '1000' } });
  });

  it('passes empty arguments to a tool called without arguments', async () => {
    const result = await client.callTool({ name: 'echo' });

    expect(result.isError).toBe(false);
    expect(echo.calls.at(-1)).toEqual({});
  });

  it('keeps the error flag of a tool result', async () => {
    const result = await client.callTool({ name: 'rejected', arguments: {} });

    expect(result.isError).toBe(true);
    expect(text(result)).toEqual({ accepted: false });
  });

  it('shows an expected error of a tool to the caller', async () => {
    const result = await client.callTool({ name: 'invalid', arguments: {} });

    expect(result.isError).toBe(true);
    expect(text(result)).toEqual({
      error: 'InvalidArgumentError',
      message: 'code: must be a string',
    });
    expect(logged).toEqual([]);
  });

  it('hides an unexpected error of a tool and logs it', async () => {
    const result = await client.callTool({ name: 'crashing', arguments: {} });

    expect(result.isError).toBe(true);
    expect(text(result)).toEqual({
      error: 'UnexpectedError',
      message: 'The tool failed unexpectedly. The server log has the details.',
    });
    expect(logged[0]).toContain('socket hang up');
  });

  it('lists only the markdown pages as resources', async () => {
    const { resources } = await client.listResources();

    expect(resources).toEqual([
      expect.objectContaining({
        name: 'api__miscellaneous__finder',
        uri: 'twinfield-docs://api__miscellaneous__finder',
        mimeType: 'text/markdown',
        title: 'Twinfield documentation: api__miscellaneous__finder',
      }),
      expect.objectContaining({ name: 'index', uri: 'twinfield-docs://index' }),
    ]);
  });

  it('reads a page resource as markdown', async () => {
    const page = await client.readResource({ uri: 'twinfield-docs://api__miscellaneous__finder' });

    expect(page.contents).toEqual([
      {
        uri: 'twinfield-docs://api__miscellaneous__finder',
        mimeType: 'text/markdown',
        text: '# Finder\n',
      },
    ]);
  });

  it('refuses a resource that is not a listed page', async () => {
    await expect(client.readResource({ uri: 'twinfield-docs://notes' })).rejects.toThrow();
    await expect(client.readResource({ uri: 'twinfield-docs://../package' })).rejects.toThrow();
  });
});

describe('McpServerFactory tool arguments that are not an object', () => {
  const NOT_OBJECTS = ['code', 42, null, ['code']];
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'twinfield-docs-'));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true });
  });

  function factory(tool: ScriptedTool): McpServerFactory {
    return new McpServerFactory(
      [tool],
      new DocumentationLibrary(directory),
      new ErrorPresenter({ error: () => undefined }),
      '1.0.0',
    );
  }

  it.each(NOT_OBJECTS)(
    'lets the protocol refuse the arguments %j before the tool runs',
    async (value) => {
      const tool = new ScriptedTool('echo', () =>
        Promise.resolve({ isError: false, payload: null }),
      );
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      const replies: { id?: unknown; error?: { code: number; message: string } }[] = [];
      clientTransport.onmessage = (message) => replies.push(message as (typeof replies)[number]);
      await factory(tool).create().connect(serverTransport);
      await clientTransport.start();

      await clientTransport.send({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'echo', arguments: value },
      } as never);
      await vi.waitFor(() => {
        expect(replies).toHaveLength(1);
      });

      expect(replies[0]).toMatchObject({
        id: 1,
        error: { code: -32602, message: expect.stringContaining('arguments') as string },
      });
      expect(tool.calls).toEqual([]);
      await clientTransport.close();
    },
  );

  it.each([...NOT_OBJECTS, undefined])(
    'runs the tool with no arguments when its handler gets %j',
    async (value) => {
      const register = vi.spyOn(McpServer.prototype, 'registerTool');
      const tool = new ScriptedTool('echo', () =>
        Promise.resolve({ isError: false, payload: 'ok' }),
      );
      factory(tool).create();
      const handler = register.mock.calls[0]![2] as (args: unknown) => Promise<CallToolResult>;

      const result = await handler(value);

      expect(tool.calls).toEqual([{}]);
      expect(result).toEqual({ content: [{ type: 'text', text: '"ok"' }], isError: false });
    },
  );
});
