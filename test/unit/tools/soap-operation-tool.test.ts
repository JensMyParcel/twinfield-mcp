import { describe, expect, it } from 'vitest';

import { SoapProtocol, type OperationDescriptor } from '../../../src/catalog/catalog-types.js';
import { SOAP_CATALOG } from '../../../src/catalog/soap-catalog.generated.js';
import { CompanyCode } from '../../../src/domain/company-code.js';
import { CodecFactory } from '../../../src/serialization/codec-factory.js';
import { InvalidArgumentError } from '../../../src/serialization/invalid-argument-error.js';
import {
  AsmxOperation,
  CommandQueryOperation,
  type SoapOperation,
} from '../../../src/soap/soap-operation.js';
import { CompanyArgument } from '../../../src/tools/company-argument.js';
import { SoapOperationTool } from '../../../src/tools/soap-operation-tool.js';
import { soapEnvelope } from '../../support/fake-twinfield.js';
import { ToolsStack } from '../../support/tools-stack.js';

const codecs = new CodecFactory(SOAP_CATALOG.types);

function descriptor(tool: string): OperationDescriptor {
  const found = SOAP_CATALOG.operations.find((operation) => operation.tool === tool);
  if (found === undefined) {
    throw new Error(`No operation ${tool}.`);
  }

  return found;
}

function operation(tool: string): SoapOperation {
  const found = descriptor(tool);

  return found.protocol === SoapProtocol.asmx
    ? new AsmxOperation(found, codecs)
    : new CommandQueryOperation(found, codecs);
}

function toolFor(name: string, fallback?: string) {
  const stack = new ToolsStack();
  const company = new CompanyArgument(
    fallback === undefined ? undefined : CompanyCode.parse(fallback),
  );

  return { stack, tool: new SoapOperationTool(operation(name), stack.gateway, company) };
}

function sentBody(stack: ToolsStack): string {
  const [request] = stack.twinfield.soapRequests();

  return request!.body;
}

const VERSION_RESPONSE = soapEnvelope(
  '<GetTwinfieldVersionResponse xmlns="http://www.twinfield.com/"><GetTwinfieldVersionResult>1.2</GetTwinfieldVersionResult></GetTwinfieldVersionResponse>',
);

describe('SoapOperationTool', () => {
  it('takes its name and annotations from the catalog entry', () => {
    const { tool } = toolFor('period_delete_year');

    expect(tool.name).toBe('period_delete_year');
    expect(tool.annotations).toMatchObject({ destructiveHint: true, readOnlyHint: false });
    expect(toolFor('finder_search').tool.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
    });
  });

  it('describes an ASMX operation with its WSDL documentation, path, action and page', () => {
    const { tool } = toolFor('versions_get_twinfield_version');

    expect(tool.description).toBe(
      'Gets the Twinfield version.\n\nTwinfield /webservices/versions.asmx, http://www.twinfield.com/GetTwinfieldVersion.\n' +
        'Field reference: call twinfield_documentation with page "getting-started__web-services-overview".',
    );
  });

  it('describes an undocumented command by its service and tool name', () => {
    const { tool } = toolFor('bank_book_change_bank_book_name');

    expect(tool.description.split('\n')[0]).toBe('bank_book: bank_book_change_bank_book_name.');
  });

  it('adds the company argument only to company-scoped operations', () => {
    const scoped = toolFor('finder_search').tool.inputSchema['properties'] as object;
    const global = toolFor('versions_get_twinfield_version').tool.inputSchema['properties'] as
      object | undefined;

    expect(Object.keys(scoped)[0]).toBe('company');
    expect(global ?? {}).not.toHaveProperty('company');
  });

  it('refuses an operation whose own arguments already have a company', () => {
    const stack = new ToolsStack();
    const colliding: SoapOperation = {
      descriptor: descriptor('finder_search'),
      argumentSchema: () => ({ type: 'object', properties: { company: { type: 'string' } } }),
      prepare: () => {
        throw new Error('not called');
      },
    };

    expect(
      () => new SoapOperationTool(colliding, stack.gateway, new CompanyArgument(undefined)),
    ).toThrow('The operation already has a "company" argument.');
  });

  it('strips the company from the body and sends it in the SOAP header', async () => {
    const { stack, tool } = toolFor('finder_search');

    await tool.execute({ company: 'BE002', type: 'DIM', field: 0, firstRow: 1, maxRows: 1 });

    const body = sentBody(stack);
    expect(body).toContain('<CompanyCode>BE002</CompanyCode>');
    expect(body).toContain('<Search xmlns="http://www.twinfield.com/"><type>DIM</type>');
    expect(body).not.toMatch(/<company>/i);
  });

  it('uses the default company for a company-scoped operation called without one', async () => {
    const { stack, tool } = toolFor('finder_search', 'NL001');

    await tool.execute({ type: 'DIM', field: 0, firstRow: 1, maxRows: 1 });

    expect(sentBody(stack)).toContain('<CompanyCode>NL001</CompanyCode>');
  });

  it('rejects a company-scoped call without a company before any request', async () => {
    const { stack, tool } = toolFor('finder_search');

    await expect(tool.execute({ type: 'DIM', field: 0, firstRow: 1, maxRows: 1 })).rejects.toThrow(
      new InvalidArgumentError('company', 'is required; no default company is configured'),
    );
    expect(stack.twinfield.requests).toHaveLength(0);
  });

  it('sends no company header for an operation that is not company-scoped', async () => {
    const { stack, tool } = toolFor('versions_get_twinfield_version', 'NL001');
    stack.twinfield.soap = () => ({ body: VERSION_RESPONSE });

    const result = await tool.execute({});

    expect(result).toEqual({ isError: false, payload: { GetTwinfieldVersionResult: '1.2' } });
    expect(sentBody(stack)).not.toContain('CompanyCode');
  });

  it('passes a company argument of a global operation to the argument check', async () => {
    const { stack, tool } = toolFor('versions_get_twinfield_version');

    await expect(tool.execute({ company: 'NL001' })).rejects.toThrow(InvalidArgumentError);
    expect(stack.twinfield.requests).toHaveLength(0);
  });

  it('returns null for a response without a body element', async () => {
    const { stack, tool } = toolFor('bank_book_change_bank_book_name', 'NL001');
    stack.twinfield.soap = () => ({ body: soapEnvelope('') });

    const result = await tool.execute({ Code: 'BNK', Name: 'Main bank' });

    expect(result).toEqual({ isError: false, payload: null });
    expect(sentBody(stack)).toMatch(/<CompanyCode xmlns="[^"]+Shared">NL001<\/CompanyCode>/);
  });
});
