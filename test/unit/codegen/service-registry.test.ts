import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { toSnakeCase } from '../../../codegen/catalog-builder.js';
import { CatalogGenerator } from '../../../codegen/catalog-generator.js';
import { SERVICES, type ServiceDefinition } from '../../../codegen/service-registry.js';
import { WsdlReader } from '../../../codegen/wsdl-reader.js';
import { SoapProtocol } from '../../../src/catalog/catalog-types.js';
import { DocumentationLibrary } from '../../../src/docs/documentation-library.js';
import { XmlReader } from '../../../src/xml/xml-reader.js';
import { DOCS_DIRECTORY } from '../../support/fake-twinfield.js';

const VENDOR = fileURLToPath(new URL('../../../vendor/twinfield', import.meta.url));
const catalog = new CatalogGenerator(VENDOR).catalog();
const library = new DocumentationLibrary(DOCS_DIRECTORY);

function wsdlOperations(service: ServiceDefinition): string[] {
  const xml = readFileSync(join(VENDOR, 'wsdl', service.wsdlFile), 'utf8');

  return new WsdlReader(new XmlReader().read(xml)).operations().map((operation) => operation.name);
}

function catalogNames(service: ServiceDefinition): string[] {
  return catalog.operations
    .filter((operation) => operation.service === service.prefix)
    .map((operation) =>
      operation.protocol === SoapProtocol.asmx ? operation.request.name : operation.type.name,
    );
}

const byPrefix = SERVICES.map((service) => [service.prefix, service] as const);

describe('SERVICES', () => {
  it('has one entry per vendored WSDL and a unique prefix per entry', () => {
    const prefixes = SERVICES.map((service) => service.prefix);
    const files = SERVICES.map((service) => service.wsdlFile);

    expect(new Set(prefixes).size).toBe(prefixes.length);
    expect(files.sort()).toEqual(readdirSync(join(VENDOR, 'wsdl')).sort());
  });

  it.each(byPrefix)('classifies exactly the operations that %s offers', (_prefix, service) => {
    expect(catalogNames(service).sort()).toEqual(Object.keys(service.effects).sort());
  });

  it.each(byPrefix.filter(([, service]) => service.protocol === SoapProtocol.asmx))(
    'names an effect for every exposed WSDL operation of %s',
    (_prefix, service) => {
      const exposed = wsdlOperations(service).filter((name) => !(name in (service.excluded ?? {})));

      expect(exposed.sort()).toEqual(Object.keys(service.effects).sort());
    },
  );

  it.each(byPrefix)('points %s to a documentation page that exists', (_prefix, service) => {
    expect(library.has(service.documentation)).toBe(true);
  });

  it('excludes ProcessXml operations that the WSDL really offers, and makes no tool of them', () => {
    const processXml = SERVICES.find((service) => service.prefix === 'process_xml')!;
    const excluded = Object.keys(processXml.excluded ?? {});

    expect(excluded.sort()).toEqual(
      ['ProcessXmlCompressed', 'ProcessXmlDocument', 'ProcessXmlString'].sort(),
    );
    expect(wsdlOperations(processXml).sort()).toEqual(excluded.sort());
    expect(catalog.operations.filter((op) => op.service === 'process_xml')).toEqual([]);
    expect(
      catalog.operations.map((op) => op.tool).filter((tool) => tool.startsWith('process_xml')),
    ).toEqual([]);
  });

  it('uses every tool name override only where the derived name passes 64 characters', () => {
    for (const service of SERVICES) {
      for (const [operation, tool] of Object.entries(service.toolNames ?? {})) {
        expect(catalog.operations.map((op) => op.tool)).toContain(tool);
        expect(Object.keys(service.effects)).toContain(operation);
        expect(`${service.prefix}_${toSnakeCase(operation)}`.length).toBeGreaterThan(64);
      }
    }
  });
});
