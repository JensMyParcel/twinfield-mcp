import { describe, expect, it } from 'vitest';

import {
  CatalogBuilder,
  toSnakeCase,
  type ServiceDocuments,
} from '../../../codegen/catalog-builder.js';
import { keyOf } from '../../../codegen/schema-reader.js';
import type { ServiceDefinition } from '../../../codegen/service-registry.js';
import { OperationEffect, SoapProtocol, TypeKind } from '../../../src/catalog/catalog-types.js';
import {
  CONTRACT_SCHEMA,
  Namespace,
  THING_SCHEMA,
  asmxParts,
  commandQueryParts,
  pingService,
  schema,
  wsdlDocument,
  type SyntheticOperation,
} from '../../support/tools-wsdl-fixtures.js';

const { read, write, destructive } = OperationEffect;

function asmxService(
  operations: readonly SyntheticOperation[],
  definition: Partial<ServiceDefinition> = {},
): ServiceDocuments {
  return {
    definition: {
      wsdlFile: 'thing.asmx.wsdl',
      protocol: SoapProtocol.asmx,
      prefix: 'thing',
      documentation: 'api__thing',
      effects: Object.fromEntries(operations.map(({ name }) => [name, read])),
      ...definition,
    },
    wsdl: wsdlDocument(asmxParts(operations)),
    schemas: [],
  };
}

const THING_EFFECTS = { CreateThing: write, RenameThing: write, GetThing: read };

function commandQueryService(definition: Partial<ServiceDefinition> = {}): ServiceDocuments {
  return {
    definition: {
      wsdlFile: 'thingservice.svc.wsdl',
      protocol: SoapProtocol.commandQuery,
      prefix: 'thing',
      documentation: 'api__thing',
      effects: THING_EFFECTS,
      ...definition,
    },
    wsdl: wsdlDocument(commandQueryParts()),
    schemas: [CONTRACT_SCHEMA(), THING_SCHEMA()],
  };
}

const build = (...services: ServiceDocuments[]) => new CatalogBuilder().build(services);

describe('CatalogBuilder for ASMX services', () => {
  it('makes one operation per WSDL operation with its request element', () => {
    const catalog = build(
      asmxService(
        [
          { name: 'GetThing', documentation: 'Gets a thing.' },
          { name: 'Ping', hasHeader: false },
        ],
        {
          effects: { GetThing: read, Ping: destructive },
        },
      ),
    );

    expect(catalog.operations).toEqual([
      {
        tool: 'thing_get_thing',
        service: 'thing',
        path: '/webservices/thing.asmx',
        documentation: 'api__thing',
        effect: read,
        protocol: SoapProtocol.asmx,
        soapAction: 'http://www.twinfield.com/GetThing',
        description: 'Gets a thing.',
        requiresCompany: true,
        request: {
          name: 'GetThing',
          namespace: Namespace.twinfield,
          type: { namespace: Namespace.twinfield, name: 'GetThing' },
          minOccurs: 1,
          maxOccurs: 1,
          nillable: false,
        },
      },
      expect.objectContaining({ tool: 'thing_ping', effect: destructive, requiresCompany: false }),
    ]);
  });

  it('collects the request types and leaves the XSD built-ins out', () => {
    const catalog = build(asmxService([{ name: 'Ping' }]));

    expect(catalog.types).toEqual([
      {
        kind: TypeKind.complex,
        reference: { namespace: Namespace.twinfield, name: 'Ping' },
        elements: [
          expect.objectContaining({
            name: 'text',
            type: { namespace: Namespace.xsd, name: 'string' },
          }),
        ],
      },
    ]);
  });

  it('uses the registry tool name instead of the derived one', () => {
    const catalog = build(
      asmxService([{ name: 'GetRangeOfSummaries' }], {
        toolNames: { GetRangeOfSummaries: 'thing_summaries' },
      }),
    );

    expect(catalog.operations.map((op) => op.tool)).toEqual(['thing_summaries']);
  });

  it('derives the tool name for operations without an entry in the tool names', () => {
    const catalog = build(
      asmxService([{ name: 'Ping' }, { name: 'Pong' }], {
        toolNames: { Ping: 'thing_ping_short' },
      }),
    );

    expect(catalog.operations.map((op) => op.tool)).toEqual(['thing_ping_short', 'thing_pong']);
  });

  it('leaves excluded operations out and does not need an effect for them', () => {
    const catalog = build(
      asmxService([{ name: 'Ping' }, { name: 'ProcessXmlString' }], {
        effects: { Ping: read },
        excluded: { ProcessXmlString: 'Has its own tools.' },
      }),
    );

    expect(catalog.operations.map((op) => op.tool)).toEqual(['thing_ping']);
  });

  it('rejects an operation that the registry does not classify', () => {
    expect(() =>
      build(asmxService([{ name: 'Ping' }, { name: 'DeleteAll' }], { effects: { Ping: read } })),
    ).toThrow('thing.asmx.wsdl: operation DeleteAll has no effect in the registry.');
  });

  it('rejects a registry entry for an operation that the WSDL lacks', () => {
    expect(() =>
      build(asmxService([{ name: 'Ping' }], { effects: { Ping: read, Pong: write, Gone: read } })),
    ).toThrow('thing.asmx.wsdl: registry lists unknown operations Pong,Gone.');
  });

  it('rejects an operation whose request element is not in any schema', () => {
    const service = asmxService([{ name: 'Ping' }]);

    expect(() =>
      build({ ...service, wsdl: wsdlDocument({ ...asmxParts([{ name: 'Ping' }]), types: '' }) }),
    ).toThrow(`thing.asmx.wsdl: no element {${Namespace.twinfield}}Ping.`);
  });

  it('rejects a reference to a type that no schema defines', () => {
    const parts = asmxParts([{ name: 'Ping' }]);
    const types = `<wsdl:types><s:schema targetNamespace="${Namespace.twinfield}"><s:element name="Ping" type="tns:Nope"/></s:schema></wsdl:types>`;

    expect(() =>
      build({ ...asmxService([{ name: 'Ping' }]), wsdl: wsdlDocument({ ...parts, types }) }),
    ).toThrow(`Unknown type {${Namespace.twinfield}}Nope.`);
  });

  it('reads types from the schema files next to the inline schemas', () => {
    const parts = asmxParts([{ name: 'Ping' }]);
    const types = `<wsdl:types><s:schema targetNamespace="${Namespace.twinfield}" xmlns:q1="${Namespace.service}"><s:element name="Ping" type="q1:ThingKind"/></s:schema></wsdl:types>`;

    const catalog = build({
      ...asmxService([{ name: 'Ping' }]),
      wsdl: wsdlDocument({ ...parts, types }),
      schemas: [THING_SCHEMA()],
    });

    expect(catalog.types.map((type) => type.kind)).toEqual([TypeKind.enumeration]);
  });
});

describe('CatalogBuilder for WCF command/query services', () => {
  it('makes one operation per leaf subtype of Command and Query', () => {
    const catalog = build(commandQueryService());

    expect(catalog.operations.map((op) => op.tool)).toEqual([
      'thing_create_thing',
      'thing_rename_thing',
      'thing_get_thing',
    ]);
    expect(catalog.operations[1]).toEqual({
      tool: 'thing_rename_thing',
      service: 'thing',
      path: '/webservices/ThingService.svc',
      documentation: 'api__thing',
      effect: write,
      protocol: SoapProtocol.commandQuery,
      soapAction: 'http://www.twinfield.com/Process',
      description: '',
      requiresCompany: true,
      bodyElement: 'Command',
      type: { namespace: Namespace.service, name: 'RenameThing' },
    });
    expect(catalog.operations[2]).toMatchObject({
      bodyElement: 'Query',
      soapAction: 'http://www.twinfield.com/Query',
      effect: read,
    });
  });

  it('does not offer an intermediate base type or types outside Command and Query', () => {
    const tools = build(commandQueryService()).operations.map((op) => op.tool);

    for (const name of [
      'thing_thing_command',
      'thing_orphan',
      'thing_odd_kind',
      'thing_unrelated',
    ]) {
      expect(tools).not.toContain(name);
    }
  });

  it('collects the reachable types through their bases, sorted by key', () => {
    const { types } = build(commandQueryService());
    const keys = types.map((type) => keyOf(type.reference));

    expect(keys).toEqual(
      [
        `{${Namespace.contract}}Command`,
        `{${Namespace.contract}}Query`,
        `{${Namespace.service}}CreateThing`,
        `{${Namespace.service}}GetThing`,
        `{${Namespace.service}}RenameThing`,
        `{${Namespace.service}}ThingCommand`,
        `{${Namespace.service}}ThingKind`,
      ].sort((a, b) => a.localeCompare(b)),
    );
    expect(keys).toEqual([...keys].sort((a, b) => a.localeCompare(b)));
  });

  it('rejects a subtype that the registry does not classify', () => {
    expect(() =>
      build(commandQueryService({ effects: { CreateThing: write, GetThing: read } })),
    ).toThrow('thingservice.svc.wsdl: operation RenameThing has no effect in the registry.');
  });

  it('rejects a registry entry for a subtype that the schemas lack', () => {
    expect(() =>
      build(commandQueryService({ effects: { ...THING_EFFECTS, ThingCommand: write } })),
    ).toThrow('thingservice.svc.wsdl: registry lists unknown operations ThingCommand.');
  });

  it('rejects a subtype field of a type that no schema defines', () => {
    const broken = schema(
      `<xs:complexType name="CreateThing"><xs:complexContent><xs:extension base="q9:Command" xmlns:q9="${Namespace.contract}"><xs:sequence><xs:element name="Owner" type="tns:Person"/></xs:sequence></xs:extension></xs:complexContent></xs:complexType>`,
    );

    expect(() =>
      build({
        ...commandQueryService({ effects: { CreateThing: write } }),
        schemas: [CONTRACT_SCHEMA(), broken],
      }),
    ).toThrow(`Unknown type {${Namespace.service}}Person.`);
  });
});

describe('CatalogBuilder for an unknown WCF action', () => {
  it('rejects a command/query WSDL action other than Process and Query', () => {
    const parts = { ...asmxParts([{ name: 'Purge' }]), types: '' };

    expect(() =>
      build({ ...commandQueryService({ effects: {} }), wsdl: wsdlDocument(parts) }),
    ).toThrow('thingservice.svc.wsdl: unknown command/query action Purge.');
  });
});

describe('CatalogBuilder with types it cannot model', () => {
  const LIST = '<s:simpleType name="Codes"><s:list itemType="s:string"/></s:simpleType>';
  const ATTRIBUTE =
    '<s:complexType name="Tagged"><s:sequence/><s:attribute name="Id" type="s:ID"/></s:complexType>';
  const NESTED = `<s:complexType name="Holder"><s:sequence><s:element name="tag" type="tns:Tagged"/></s:sequence></s:complexType>${ATTRIBUTE}`;

  it('rejects a request that uses a list simple type', () => {
    expect(() => build(pingService('tns:Codes', LIST))).toThrow(
      `Type {${Namespace.twinfield}}Codes is used by a request, but only xs:restriction simple types are supported.`,
    );
  });

  it('rejects a request that reaches an unsupported type through a field', () => {
    expect(() => build(pingService('tns:Holder', NESTED))).toThrow(
      `Type {${Namespace.twinfield}}Tagged is used by a request, but xs:attribute is not supported.`,
    );
  });

  it('rejects a command that derives from an unsupported base', () => {
    const base = schema(
      `<xs:complexType name="CreateThing"><xs:complexContent><xs:extension base="tns:Tagged"><xs:sequence/></xs:extension></xs:complexContent></xs:complexType>` +
        `<xs:complexType name="Tagged"><xs:complexContent><xs:extension base="q9:Command" xmlns:q9="${Namespace.contract}"><xs:sequence/><xs:attribute name="Id" type="xs:ID"/></xs:extension></xs:complexContent></xs:complexType>`,
    );

    expect(() =>
      build({
        ...commandQueryService({ effects: { CreateThing: write } }),
        schemas: [CONTRACT_SCHEMA(), base],
      }),
    ).toThrow(
      `Type {${Namespace.service}}Tagged is used by a request, but xs:attribute is not supported.`,
    );
  });

  const RESTRICTED =
    '<s:complexType name="Base"><s:sequence><s:element name="Code" type="s:string"/></s:sequence></s:complexType>' +
    '<s:complexType name="Narrow"><s:complexContent><s:restriction base="tns:Base"><s:sequence><s:element name="Code" type="s:string"/></s:sequence></s:restriction></s:complexContent></s:complexType>';

  it('rejects a request that uses a complex content restriction, which would lose its fields', () => {
    expect(() => build(pingService('tns:Narrow', RESTRICTED))).toThrow(
      `Type {${Namespace.twinfield}}Narrow is used by a request, but xs:restriction is not supported.`,
    );
  });

  it('ignores a complex content restriction that no request reaches', () => {
    const catalog = build(pingService('tns:Base', RESTRICTED));

    expect(catalog.types.map((type) => type.reference.name)).toEqual(['Base']);
  });

  it('ignores unsupported types that no request reaches', () => {
    const catalog = build(pingService('s:string', `${LIST}${NESTED}`));

    expect(catalog.operations.map((op) => op.tool)).toEqual(['ping_ping']);
    expect(catalog.types).toEqual([]);
  });
});

describe('CatalogBuilder for built-in XSD types', () => {
  it.each(['string', 'int', 'long', 'short', 'decimal', 'boolean', 'dateTime'])(
    'accepts a request of the built-in type xs:%s',
    (name) => {
      expect(build(pingService(`s:${name}`, '')).operations).toHaveLength(1);
    },
  );

  it.each(['base64Binary', 'QName', 'guid', 'anyURI'])(
    'rejects a request of the built-in type xs:%s, which has no JSON format',
    (name) => {
      expect(() => build(pingService(`s:${name}`, ''))).toThrow(
        `The request type xs:${name} has no JSON format.`,
      );
    },
  );

  it('rejects a request field without a type, which is xs:anyType', () => {
    const untyped =
      '<s:complexType name="Loose"><s:sequence><s:element name="value"/></s:sequence></s:complexType>';

    expect(() => build(pingService('tns:Loose', untyped))).toThrow(
      'The request type xs:anyType has no JSON format.',
    );
  });

  it('rejects a built-in type without a JSON format deep inside a request', () => {
    const deep = `<s:complexType name="Outer"><s:sequence><s:element name="inner" type="tns:Inner"/></s:sequence></s:complexType><s:complexType name="Inner"><s:sequence><s:element name="blob" type="s:base64Binary"/></s:sequence></s:complexType>`;

    expect(() => build(pingService('tns:Outer', deep))).toThrow(
      'The request type xs:base64Binary has no JSON format.',
    );
  });
});

describe('CatalogBuilder tool names', () => {
  it('rejects two operations with the same tool name across services', () => {
    expect(() =>
      build(
        asmxService([{ name: 'Ping' }]),
        asmxService([{ name: 'Ping' }], { wsdlFile: 'other.asmx.wsdl' }),
      ),
    ).toThrow('Tool name thing_ping is invalid or not unique.');
  });

  it('rejects a tool name override that collides with a derived name', () => {
    expect(() =>
      build(
        asmxService([{ name: 'Ping' }, { name: 'Pong' }], { toolNames: { Pong: 'thing_ping' } }),
      ),
    ).toThrow('Tool name thing_ping is invalid or not unique.');
  });

  it.each([
    ['an upper case prefix', { prefix: 'Thing' }, 'Thing_ping'],
    ['a digit first', { prefix: '1thing' }, '1thing_ping'],
    ['a dash', { toolNames: { Ping: 'thing-ping' } }, 'thing-ping'],
    ['65 characters', { prefix: 't'.repeat(60) }, `${'t'.repeat(60)}_ping`],
  ])('rejects a tool name with %s', (_label, definition, tool) => {
    expect(() => build(asmxService([{ name: 'Ping' }], definition))).toThrow(
      `Tool name ${tool} is invalid or not unique.`,
    );
  });

  it('accepts a tool name of exactly 64 characters', () => {
    const catalog = build(asmxService([{ name: 'Ping' }], { prefix: 't'.repeat(59) }));

    expect(catalog.operations[0]?.tool).toHaveLength(64);
  });
});

describe('toSnakeCase', () => {
  it.each([
    ['GetTwinfieldVersion', 'get_twinfield_version'],
    ['GetIctReturnAsXbrl', 'get_ict_return_as_xbrl'],
    ['CreateRun2', 'create_run2'],
    ['ABCDef', 'abc_def'],
    ['Load', 'load'],
    ['already_snake', 'already_snake'],
  ])('turns %s into %s', (name, snake) => {
    expect(toSnakeCase(name)).toBe(snake);
  });
});
