import { describe, expect, it } from 'vitest';

import { CompanyCode } from '../../../src/domain/company-code.js';
import { PROCESS_XML_MESSAGES } from '../../../src/process-xml/process-xml-messages.js';
import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import { CompanyArgument } from '../../../src/tools/company-argument.js';
import { ProcessXmlTool } from '../../../src/tools/process-xml-tool.js';
import { InvalidXmlPayloadError } from '../../../src/xml/xml-json.js';
import { processXmlResponse } from '../../support/fake-twinfield.js';
import { ToolsStack } from '../../support/tools-stack.js';

function message(root: string) {
  const found = PROCESS_XML_MESSAGES.find((candidate) => candidate.root === root);
  if (found === undefined) {
    throw new Error(`No ProcessXml message ${root}.`);
  }

  return found;
}

function toolFor(root: string, fallback?: string) {
  const stack = new ToolsStack();
  stack.twinfield.soap = () => processXmlResponse(`<${root} result="1"/>`);
  const company = new CompanyArgument(
    fallback === undefined ? undefined : CompanyCode.parse(fallback),
  );

  return { stack, tool: new ProcessXmlTool(message(root), stack.processXml, company) };
}

function sentXml(stack: ToolsStack): string {
  const [request] = stack.twinfield.soapRequests();

  return request!.body;
}

describe('ProcessXmlTool', () => {
  it('is named after its root and points to its documentation', () => {
    const { tool } = toolFor('dimension');

    expect(tool.name).toBe('process_xml_dimension');
    expect(tool.description).toContain('Sends <dimension> through ProcessXml.');
    expect(tool.description).toContain('"api__master-data__customers" or');
  });

  it('marks a write message as destructive and a read message as read-only', () => {
    expect(toolFor('dimension').tool.annotations).toMatchObject({
      readOnlyHint: false,
      destructiveHint: true,
    });
    expect(toolFor('read').tool.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
    });
  });

  it('requires a type from the enum in the payload schema of read and list', () => {
    const payload = toolFor('list').tool.inputSchema['properties'] as Record<string, object>;

    expect(payload['payload']).toMatchObject({
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['offices', 'dimensions', 'browsefields', 'budgets'] },
      },
      required: ['type'],
    });
  });

  it('leaves the payload of a write message free-form', () => {
    const { tool } = toolFor('dimension');
    const properties = tool.inputSchema['properties'] as Record<string, Record<string, unknown>>;

    expect(Object.keys(properties)).toEqual(['company', 'payload']);
    expect(properties['payload']).not.toHaveProperty('properties');
    expect(tool.inputSchema['required']).toEqual(['payload']);
    expect(tool.inputSchema['additionalProperties']).toBe(false);
  });

  it.each([null, 'dimension', 42, [{ code: '1000' }], undefined])(
    'rejects the non-object payload %j before any request',
    async (payload) => {
      const { stack, tool } = toolFor('dimension', 'NL001');

      await expect(tool.execute({ payload })).rejects.toThrow(
        new InvalidArgumentError('payload', 'must be an object'),
      );
      expect(stack.twinfield.requests).toHaveLength(0);
    },
  );

  it.each([{ type: 'secrets' }, {}, { type: 42 }, { type: ['offices'] }])(
    'rejects the list payload %j with a type outside the enum before any request',
    async (payload) => {
      const { stack, tool } = toolFor('list');

      await expect(tool.execute({ payload })).rejects.toThrow(
        'payload.type: must be one of offices, dimensions, browsefields, budgets',
      );
      expect(stack.twinfield.requests).toHaveLength(0);
    },
  );

  it('rejects a read type outside the enum before any request', async () => {
    const { stack, tool } = toolFor('read', 'NL001');

    await expect(tool.execute({ payload: { type: 'offices' } })).rejects.toThrow(
      InvalidArgumentError,
    );
    expect(stack.twinfield.requests).toHaveLength(0);
  });

  it('lists offices without a company and without a company header', async () => {
    const { stack, tool } = toolFor('list');

    const result = await tool.execute({ payload: { type: 'offices' } });

    expect(result.isError).toBe(false);
    expect(sentXml(stack)).toContain('&lt;list&gt;&lt;type&gt;offices&lt;/type&gt;&lt;/list&gt;');
    expect(sentXml(stack)).not.toContain('CompanyCode');
  });

  it('requires a company for a company-scoped message before any request', async () => {
    const { stack, tool } = toolFor('dimension');

    await expect(tool.execute({ payload: { code: '1000' } })).rejects.toThrow(
      'company: is required; no default company is configured',
    );
    expect(stack.twinfield.requests).toHaveLength(0);
  });

  it('sends the payload as XML with the company header and keeps the company out of the XML', async () => {
    const { stack, tool } = toolFor('dimension');

    await tool.execute({ company: 'BE002', payload: { '@status': 'active', code: '1000' } });

    expect(sentXml(stack)).toContain('<CompanyCode>BE002</CompanyCode>');
    expect(sentXml(stack)).toContain(
      '<xmlRequest>&lt;dimension status="active"&gt;&lt;code&gt;1000&lt;/code&gt;&lt;/dimension&gt;</xmlRequest>',
    );
  });

  it('rejects a payload that is no valid XML before any request', async () => {
    const { stack, tool } = toolFor('dimension', 'NL001');

    await expect(tool.execute({ payload: { 'bad name': '1' } })).rejects.toThrow(
      InvalidXmlPayloadError,
    );
    expect(stack.twinfield.requests).toHaveLength(0);
  });

  it('returns an accepted response with its messages', async () => {
    const { stack, tool } = toolFor('dimension', 'NL001');
    stack.twinfield.soap = () =>
      processXmlResponse(
        '<dimension result="1"><code msgtype="warning" msg="Name is long.">1000</code></dimension>',
      );

    const result = await tool.execute({ payload: { code: '1000' } });

    expect(result).toEqual({
      isError: false,
      payload: {
        accepted: true,
        messages: [{ element: 'dimension/code[1]', type: 'warning', text: 'Name is long.' }],
        response: {
          '@result': '1',
          code: { '@msgtype': 'warning', '@msg': 'Name is long.', '#text': '1000' },
        },
      },
    });
  });

  it('marks a rejected message as an error result', async () => {
    const { stack, tool } = toolFor('dimension', 'NL001');
    stack.twinfield.soap = () =>
      processXmlResponse('<dimension result="0" msgtype="error" msg="Not allowed."/>');

    const result = await tool.execute({ payload: { code: '1000' } });

    expect(result.isError).toBe(true);
    expect(result.payload).toMatchObject({
      accepted: false,
      messages: [{ element: 'dimension', type: 'error', text: 'Not allowed.' }],
    });
  });
});
