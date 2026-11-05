import type { SoapOperation } from '../soap/soap-operation.js';
import type { TwinfieldGateway } from '../soap/twinfield-gateway.js';
import type { JsonSchema } from '../serialization/json-schema.js';
import { XmlToJson } from '../xml/xml-json.js';
import { CompanyArgument, withoutCompany, COMPANY_PROPERTY } from './company-argument.js';
import {
  annotationsFor,
  documentationHint,
  type ToolAnnotations,
  type ToolResult,
  type TwinfieldTool,
} from './twinfield-tool.js';

/** A tool for one web service operation from the generated SOAP catalog. */
export class SoapOperationTool implements TwinfieldTool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: JsonSchema;
  readonly annotations: ToolAnnotations;
  private readonly converter = new XmlToJson();

  constructor(
    private readonly operation: SoapOperation,
    private readonly gateway: TwinfieldGateway,
    private readonly company: CompanyArgument,
  ) {
    const { descriptor } = operation;
    this.name = descriptor.tool;
    this.annotations = annotationsFor(descriptor.effect);
    this.inputSchema = descriptor.requiresCompany
      ? company.extend(operation.argumentSchema())
      : operation.argumentSchema();
    const summary =
      descriptor.description === ''
        ? `${descriptor.service}: ${descriptor.tool}.`
        : descriptor.description;
    this.description = `${summary}\n\nTwinfield ${descriptor.path}, ${descriptor.soapAction}.\n${documentationHint([descriptor.documentation])}`;
  }

  async execute(args: Readonly<Record<string, unknown>>): Promise<ToolResult> {
    const { requiresCompany } = this.operation.descriptor;
    const company = requiresCompany
      ? this.company.resolve(args[COMPANY_PROPERTY], true)
      : undefined;
    const operationArgs = requiresCompany ? withoutCompany(args) : args;
    const response = await this.gateway.call(this.operation.prepare(operationArgs, company));

    return { isError: false, payload: response ? this.converter.convert(response) : null };
  }
}
