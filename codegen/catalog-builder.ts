import {
  SoapProtocol,
  TypeKind,
  type AsmxOperationDescriptor,
  type CommandQueryOperationDescriptor,
  type OperationDescriptor,
  type SoapCatalog,
  type TypeDescriptor,
  type TypeReference,
} from '../src/catalog/catalog-types.js';
import { PRIMITIVE_FORMATS } from '../src/serialization/primitive-format.js';
import { XmlNamespace } from '../src/xml/qualified-name.js';
import type { XmlElement } from '../src/xml/xml-element.js';
import { SchemaReader, keyOf } from './schema-reader.js';
import type { ServiceDefinition } from './service-registry.js';
import { WsdlReader, type WsdlOperation } from './wsdl-reader.js';

const CONTRACT_NAMESPACE = 'http://schemas.datacontract.org/2004/07/Twinfield.WebServices';
const BODY_BY_ACTION: ReadonlyMap<string, 'Command' | 'Query'> = new Map([
  ['Process', 'Command'],
  ['Query', 'Query'],
]);
const TOOL_NAME = /^[a-z][a-z0-9_]{0,63}$/;

export interface ServiceDocuments {
  readonly definition: ServiceDefinition;
  readonly wsdl: XmlElement;
  readonly schemas: readonly XmlElement[];
}

/** Joins the WSDL documents with the service registry into one validated catalog. */
export class CatalogBuilder {
  private readonly operations: OperationDescriptor[] = [];
  private readonly reachable = new Map<string, TypeDescriptor>();

  build(services: readonly ServiceDocuments[]): SoapCatalog {
    for (const service of services) {
      this.addService(service);
    }
    this.assertUniqueToolNames();

    return {
      types: [...this.reachable.values()].sort((a, b) =>
        keyOf(a.reference).localeCompare(keyOf(b.reference)),
      ),
      operations: this.operations,
    };
  }

  private addService({ definition, wsdl, schemas }: ServiceDocuments): void {
    const reader = new WsdlReader(wsdl);
    const schema = new SchemaReader();
    [...reader.inlineSchemas(), ...schemas].forEach((node) => {
      schema.addSchema(node);
    });
    const exposed = reader.operations().filter((op) => !(op.name in (definition.excluded ?? {})));
    const added =
      definition.protocol === SoapProtocol.asmx
        ? exposed.map((op) => this.asmxOperation(definition, reader, schema, op))
        : this.commandQueryOperations(definition, reader, schema, exposed);
    assertEffectsMatch(definition, added);
    this.operations.push(...added);
  }

  private asmxOperation(
    definition: ServiceDefinition,
    reader: WsdlReader,
    schema: SchemaReader,
    op: WsdlOperation,
  ): AsmxOperationDescriptor {
    const reference = { namespace: op.inputElement.namespace, name: op.inputElement.local };
    const request = schema.element(reference);
    if (request === undefined) {
      throw new Error(`${definition.wsdlFile}: no element ${keyOf(reference)}.`);
    }
    this.collect(request.type, schema);

    return {
      ...this.common(definition, reader, op.name),
      protocol: SoapProtocol.asmx,
      soapAction: op.soapAction,
      description: op.documentation,
      requiresCompany: op.hasHeader,
      request,
    };
  }

  private commandQueryOperations(
    definition: ServiceDefinition,
    reader: WsdlReader,
    schema: SchemaReader,
    actions: readonly WsdlOperation[],
  ): CommandQueryOperationDescriptor[] {
    return actions.flatMap((action) => {
      const bodyElement = BODY_BY_ACTION.get(action.name);
      if (bodyElement === undefined) {
        throw new Error(`${definition.wsdlFile}: unknown command/query action ${action.name}.`);
      }

      return concreteSubtypes(schema, bodyElement).map((type) => {
        this.collect(type, schema);

        return {
          ...this.common(definition, reader, type.name),
          protocol: SoapProtocol.commandQuery,
          soapAction: action.soapAction,
          description: '',
          requiresCompany: true,
          bodyElement,
          type,
        };
      });
    });
  }

  private common(definition: ServiceDefinition, reader: WsdlReader, name: string) {
    const effect = definition.effects[name];
    if (effect === undefined) {
      throw new Error(`${definition.wsdlFile}: operation ${name} has no effect in the registry.`);
    }

    return {
      tool: definition.toolNames?.[name] ?? `${definition.prefix}_${toSnakeCase(name)}`,
      service: definition.prefix,
      path: reader.servicePath(),
      documentation: definition.documentation,
      effect,
    };
  }

  private collect(reference: TypeReference, schema: SchemaReader): void {
    if (reference.namespace === XmlNamespace.xsd) {
      assertPrimitive(reference);

      return;
    }
    if (this.reachable.has(keyOf(reference))) {
      return;
    }
    const unsupported = schema.unsupported(reference);
    if (unsupported !== undefined) {
      throw new Error(`Type ${keyOf(reference)} is used by a request, but ${unsupported}.`);
    }
    const type = schema.type(reference);
    if (type === undefined) {
      throw new Error(`Unknown type ${keyOf(reference)}.`);
    }
    this.reachable.set(keyOf(reference), type);
    if (type.kind !== TypeKind.complex) {
      return;
    }
    if (type.base) {
      this.collect(type.base, schema);
    }
    type.elements.forEach((element) => {
      this.collect(element.type, schema);
    });
  }

  private assertUniqueToolNames(): void {
    const seen = new Set<string>();
    for (const { tool } of this.operations) {
      if (!TOOL_NAME.test(tool) || seen.has(tool)) {
        throw new Error(`Tool name ${tool} is invalid or not unique.`);
      }
      seen.add(tool);
    }
  }
}

/** A built-in XSD type in a request must have a JSON format, or no tool could send it. */
function assertPrimitive(reference: TypeReference): void {
  if (!PRIMITIVE_FORMATS.has(reference.name)) {
    throw new Error(`The request type xs:${reference.name} has no JSON format.`);
  }
}

/** Leaf types that derive from the `Command` or `Query` data contract. */
function concreteSubtypes(schema: SchemaReader, root: string): TypeReference[] {
  const complex = schema.allTypes().filter((type) => type.kind === TypeKind.complex);
  const bases = new Set(complex.flatMap((type) => (type.base ? [keyOf(type.base)] : [])));
  const derivesFromRoot = (type: TypeDescriptor | undefined): boolean => {
    if (type?.kind !== TypeKind.complex || type.base === undefined) {
      return false;
    }
    if (type.base.namespace === CONTRACT_NAMESPACE && type.base.name === root) {
      return true;
    }

    return derivesFromRoot(schema.type(type.base));
  };

  return complex
    .filter((type) => !bases.has(keyOf(type.reference)) && derivesFromRoot(type))
    .map((type) => type.reference);
}

function assertEffectsMatch(definition: ServiceDefinition, added: OperationDescriptor[]): void {
  const names = new Set(
    added.map((op) => (op.protocol === SoapProtocol.asmx ? op.request.name : op.type.name)),
  );
  const stale = Object.keys(definition.effects).filter((name) => !names.has(name));
  if (stale.length > 0) {
    throw new Error(`${definition.wsdlFile}: registry lists unknown operations ${stale.join()}.`);
  }
}

export function toSnakeCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}
