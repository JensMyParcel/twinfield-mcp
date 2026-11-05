import {
  SoapProtocol,
  type OperationDescriptor,
  type SoapCatalog,
} from '../catalog/catalog-types.js';
import { PROCESS_XML_MESSAGES } from '../process-xml/process-xml-messages.js';
import type { CodecFactory } from '../serialization/codec-factory.js';
import {
  AsmxOperation,
  CommandQueryOperation,
  type SoapOperation,
} from '../soap/soap-operation.js';
import type { ProcessXmlClient } from '../soap/process-xml-client.js';
import type { TwinfieldGateway } from '../soap/twinfield-gateway.js';
import type { CompanyArgument } from './company-argument.js';
import { ProcessXmlTool } from './process-xml-tool.js';
import { SoapOperationTool } from './soap-operation-tool.js';
import type { TwinfieldTool } from './twinfield-tool.js';

function operationFor(descriptor: OperationDescriptor, codecs: CodecFactory): SoapOperation {
  return descriptor.protocol === SoapProtocol.asmx
    ? new AsmxOperation(descriptor, codecs)
    : new CommandQueryOperation(descriptor, codecs);
}

/** Every Twinfield API tool: one per SOAP operation and one per ProcessXml message root. */
export class ToolCatalog {
  constructor(
    private readonly catalog: SoapCatalog,
    private readonly codecs: CodecFactory,
    private readonly gateway: TwinfieldGateway,
    private readonly processXml: ProcessXmlClient,
    private readonly company: CompanyArgument,
  ) {}

  tools(): TwinfieldTool[] {
    const soapTools = this.catalog.operations.map(
      (descriptor) =>
        new SoapOperationTool(operationFor(descriptor, this.codecs), this.gateway, this.company),
    );
    const processXmlTools = PROCESS_XML_MESSAGES.map(
      (message) => new ProcessXmlTool(message, this.processXml, this.company),
    );

    return [...soapTools, ...processXmlTools];
  }
}
