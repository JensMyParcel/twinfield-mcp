import { describe, expect, it } from 'vitest';

import { SoapProtocol } from '../../../src/catalog/catalog-types.js';
import { SOAP_CATALOG } from '../../../src/catalog/soap-catalog.generated.js';
import { PROCESS_XML_MESSAGES } from '../../../src/process-xml/process-xml-messages.js';
import { CodecFactory } from '../../../src/serialization/codec-factory.js';
import { CompanyArgument } from '../../../src/tools/company-argument.js';
import { ProcessXmlTool } from '../../../src/tools/process-xml-tool.js';
import { SoapOperationTool } from '../../../src/tools/soap-operation-tool.js';
import { ToolCatalog } from '../../../src/tools/tool-catalog.js';
import { soapEnvelope } from '../../support/fake-twinfield.js';
import { ToolsStack } from '../../support/tools-stack.js';

function catalog(stack = new ToolsStack()): ToolCatalog {
  return new ToolCatalog(
    SOAP_CATALOG,
    new CodecFactory(SOAP_CATALOG.types),
    stack.gateway,
    stack.processXml,
    new CompanyArgument(undefined),
  );
}

describe('ToolCatalog', () => {
  it('makes one SOAP tool per catalog operation, then one ProcessXml tool per message root', () => {
    const tools = catalog().tools();
    const soap = tools.slice(0, SOAP_CATALOG.operations.length);
    const processXml = tools.slice(SOAP_CATALOG.operations.length);

    expect(soap.every((tool) => tool instanceof SoapOperationTool)).toBe(true);
    expect(soap.map((tool) => tool.name)).toEqual(SOAP_CATALOG.operations.map((op) => op.tool));
    expect(processXml.every((tool) => tool instanceof ProcessXmlTool)).toBe(true);
    expect(processXml.map((tool) => tool.name)).toEqual(
      PROCESS_XML_MESSAGES.map((message) => `process_xml_${message.root}`),
    );
  });

  it('gives every tool a unique name', () => {
    const names = catalog()
      .tools()
      .map((tool) => tool.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it.each([
    {
      name: 'finder_search',
      protocol: SoapProtocol.asmx,
      args: { type: 'DIM', field: 0, firstRow: 1, maxRows: 1 },
      body: /<Search xmlns="http:\/\/www.twinfield.com\/">/,
    },
    {
      name: 'period_get_years',
      protocol: SoapProtocol.commandQuery,
      args: {},
      body: /<Query [^>]*p1:type="p2:GetYears"/,
    },
  ])('serializes $name as a $protocol request', async ({ name, protocol, args, body }) => {
    const stack = new ToolsStack();
    stack.twinfield.soap = () => ({ body: soapEnvelope('') });
    const tool = catalog(stack)
      .tools()
      .find((candidate) => candidate.name === name)!;

    await tool.execute({ company: 'NL001', ...args });

    expect(SOAP_CATALOG.operations.find((op) => op.tool === name)?.protocol).toBe(protocol);
    expect(stack.twinfield.soapRequests()[0]!.body).toMatch(body);
  });
});
