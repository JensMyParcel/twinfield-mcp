import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CompositionRoot } from '../src/composition-root.js';
import { Configuration } from '../src/config/configuration.js';
import { SOAP_CATALOG } from '../src/catalog/soap-catalog.generated.js';
import { PROCESS_XML_MESSAGES } from '../src/process-xml/process-xml-messages.js';
import {
  FakeTwinfield,
  fakeRuntime,
  processXmlResponse,
  soapEnvelope,
  soapFault,
} from './support/fake-twinfield.js';

const ENV = {
  TWINFIELD_CLIENT_ID: 'client',
  TWINFIELD_CLIENT_SECRET: 'secret',
  TWINFIELD_REFRESH_TOKEN: 'refresh-1',
};

async function connect(twinfield: FakeTwinfield, env: Record<string, string> = ENV) {
  const runtime = fakeRuntime(twinfield);
  const server = new CompositionRoot(
    Configuration.fromEnvironment(env, '/home/test'),
    runtime,
  ).server();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '1.0.0' });
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return { client, runtime, close: () => client.close() };
}

function text(result: { content: unknown }): unknown {
  const [first] = result.content as { type: string; text: string }[];

  return JSON.parse(first!.text);
}

describe('the MCP server over a fake Twinfield', () => {
  let twinfield: FakeTwinfield;
  let session: Awaited<ReturnType<typeof connect>>;

  beforeEach(async () => {
    twinfield = new FakeTwinfield();
    session = await connect(twinfield, { ...ENV, TWINFIELD_COMPANY: '001' });
  });

  afterEach(async () => {
    await session.close();
  });

  it('lists one tool per SOAP operation, per ProcessXml root, plus documentation and user info', async () => {
    const { tools } = await session.client.listTools();
    const names = tools.map((tool) => tool.name);

    expect(names).toHaveLength(SOAP_CATALOG.operations.length + PROCESS_XML_MESSAGES.length + 2);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('finder_search');
    expect(names).toContain('process_xml_dimension');
    expect(names).toContain('twinfield_documentation');
    expect(tools.find((tool) => tool.name === 'period_delete_year')?.annotations).toMatchObject({
      destructiveHint: true,
      readOnlyHint: false,
    });
    expect(tools.find((tool) => tool.name === 'finder_search')?.annotations).toMatchObject({
      readOnlyHint: true,
    });
  });

  it('sends a finder search as an ASMX request with the token and company header', async () => {
    twinfield.soap = () => ({
      body: soapEnvelope(
        '<SearchResponse xmlns="http://www.twinfield.com/"><SearchResult/><data><TotalRows>1</TotalRows><Columns><string>Code</string><string>Name</string></Columns><Items><ArrayOfString><string>1000</string><string>Bank</string></ArrayOfString></Items></data></SearchResponse>',
      ),
    });

    const result = await session.client.callTool({
      name: 'finder_search',
      arguments: {
        type: 'DIM',
        pattern: '*',
        field: 0,
        firstRow: 1,
        maxRows: 10,
        options: [['dimtype', 'BAS']],
      },
    });

    expect(result.isError).toBe(false);
    expect(text(result)).toMatchObject({
      data: { TotalRows: '1', Items: { ArrayOfString: { string: ['1000', 'Bank'] } } },
    });
    const [request] = twinfield.soapRequests();
    expect(request!.url.pathname).toBe('/webservices/finder.asmx');
    expect(request!.headers['soapaction']).toBe('"http://www.twinfield.com/Search"');
    expect(request!.body).toContain(
      '<Header xmlns="http://www.twinfield.com/"><AccessToken>access-1</AccessToken><CompanyCode>001</CompanyCode></Header>',
    );
    expect(request!.body).toContain(
      '<options><ArrayOfString><string>dimtype</string><string>BAS</string></ArrayOfString></options>',
    );
  });

  it('sends a WCF command with xsi:type and the base type fields first', async () => {
    const result = await session.client.callTool({
      name: 'bank_book_change_bank_book_name',
      arguments: { company: 'NL001', Code: 'BNK', Name: 'Main bank' },
    });

    expect(result.isError).toBe(false);
    const [request] = twinfield.soapRequests();
    expect(request!.url.pathname).toBe('/webservices/BankBookService.svc');
    expect(request!.body).toMatch(
      /<Command xmlns="http:\/\/www.twinfield.com\/" xmlns:p1="http:\/\/www.w3.org\/2001\/XMLSchema-instance" xmlns:p2="[^"]+BankBookService" p1:type="p2:ChangeBankBookName">/,
    );
    expect(request!.body).toMatch(
      /<Code xmlns="[^"]+BankBookService">BNK<\/Code><Name xmlns="[^"]+BankBookService">Main bank<\/Name><\/Command>/,
    );
    expect(request!.body).toMatch(/<CompanyCode xmlns="[^"]+Shared">NL001<\/CompanyCode>/);
  });

  it('rejects invalid arguments before anything is sent', async () => {
    const result = await session.client.callTool({
      name: 'period_get_periods',
      arguments: { Year: 'twenty' },
    });

    expect(result.isError).toBe(true);
    expect(twinfield.requests).toHaveLength(0);
  });

  it('reports a Twinfield fault with its code and message', async () => {
    twinfield.soap = () =>
      soapFault('<message>Office not found</message><code>102</code><source>Search</source>');

    const result = await session.client.callTool({
      name: 'finder_search',
      arguments: { type: 'DIM', field: 0, firstRow: 1, maxRows: 1 },
    });

    expect(result.isError).toBe(true);
    expect(text(result)).toEqual({
      error: 'TwinfieldFault',
      httpStatus: 500,
      faultCode: 'soap:Server',
      message: 'Office not found',
      code: '102',
      source: 'Search',
    });
  });

  it('renews the token once when Twinfield rejects it, and sends the request again', async () => {
    let calls = 0;
    twinfield.soap = () => {
      calls += 1;

      return calls === 1
        ? soapFault('<message>Access denied. Token invalid.</message><code>354</code>', 401)
        : {
            body: soapEnvelope(
              '<GetTwinfieldVersionResponse xmlns="http://www.twinfield.com/"><GetTwinfieldVersionResult>1.2</GetTwinfieldVersionResult></GetTwinfieldVersionResponse>',
            ),
          };
    };

    const result = await session.client.callTool({
      name: 'versions_get_twinfield_version',
      arguments: {},
    });

    expect(text(result)).toEqual({ GetTwinfieldVersionResult: '1.2' });
    expect(twinfield.tokenCount).toBe(2);
    expect(calls).toBe(2);
  });

  it('lists offices through ProcessXml without a company header', async () => {
    twinfield.soap = () =>
      processXmlResponse(
        '<offices result="1"><office name="Main" shortname="M">001</office></offices>',
      );

    const result = await session.client.callTool({
      name: 'process_xml_list',
      arguments: { payload: { type: 'offices' } },
    });

    expect(result.isError).toBe(false);
    expect(text(result)).toMatchObject({
      accepted: true,
      response: { '@result': '1', office: { '@name': 'Main', '#text': '001' } },
    });
    expect(twinfield.soapRequests()[0]!.body).toContain(
      '<xmlRequest>&lt;list&gt;&lt;type&gt;offices&lt;/type&gt;&lt;/list&gt;</xmlRequest>',
    );
  });

  it('marks a rejected ProcessXml message as an error and lists the messages', async () => {
    twinfield.soap = () =>
      processXmlResponse(
        '<dimension result="0"><code msgtype="error" msg="Code is in use.">1000</code></dimension>',
      );

    const result = await session.client.callTool({
      name: 'process_xml_dimension',
      arguments: { payload: { type: 'BAS', code: '1000' } },
    });

    expect(result.isError).toBe(true);
    expect(text(result)).toMatchObject({
      accepted: false,
      messages: [{ element: 'dimension/code[1]', type: 'error', text: 'Code is in use.' }],
    });
  });

  it('serves the documentation as a tool and as resources', async () => {
    const result = await session.client.callTool({
      name: 'twinfield_documentation',
      arguments: { page: 'api__master-data__customers' },
    });
    const { resources } = await session.client.listResources();
    const page = await session.client.readResource({
      uri: 'twinfield-docs://api__miscellaneous__finder',
    });

    expect(text(result)).toMatchObject({
      source: 'https://developers.twinfield.com/documentation/api/master-data/customers',
    });
    expect(resources.length).toBeGreaterThan(40);
    expect((page.contents[0] as { text: string }).text).toContain('# Finder');
  });

  it('shows the user info and cluster', async () => {
    const result = await session.client.callTool({ name: 'twinfield_user_info', arguments: {} });

    expect(text(result)).toEqual({
      cluster: 'https://api.accounting.twinfield.com',
      claims: { sub: 'user-1', 'twf.organisationCode': 'ORG' },
    });
  });

  it('hides unexpected errors from the caller and logs them', async () => {
    twinfield.soap = () => {
      throw new TypeError('socket hang up');
    };

    const result = await session.client.callTool({
      name: 'versions_get_twinfield_version',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    expect(text(result)).toEqual({
      error: 'UnexpectedError',
      message: 'The tool failed unexpectedly. The server log has the details.',
    });
    expect(session.runtime.errors[0]).toContain('socket hang up');
  });
});

describe('the MCP server without a default company', () => {
  it('requires the company argument for company-scoped tools', async () => {
    const twinfield = new FakeTwinfield();
    const session = await connect(twinfield);

    const result = await session.client.callTool({ name: 'period_get_years', arguments: {} });

    expect(result.isError).toBe(true);
    expect(text(result)).toEqual({
      error: 'InvalidArgumentError',
      message: 'company: is required; no default company is configured',
    });
    await session.close();
  });
});
