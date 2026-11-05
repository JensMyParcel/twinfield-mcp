import type { ProcessXmlMessageDefinition } from '../process-xml/process-xml-messages.js';
import type { ProcessXmlClient } from '../soap/process-xml-client.js';
import { InvalidArgumentError, isPlainObject } from '../serialization/invalid-argument-error.js';
import type { JsonSchema } from '../serialization/json-schema.js';
import { JsonToXml, XmlToJson } from '../xml/xml-json.js';
import { COMPANY_PROPERTY, type CompanyArgument } from './company-argument.js';
import {
  annotationsFor,
  documentationHint,
  type ToolAnnotations,
  type ToolResult,
  type TwinfieldTool,
} from './twinfield-tool.js';

const PAYLOAD = 'payload';

const PAYLOAD_DESCRIPTION =
  'The content of the root element as JSON. A property is a child element, "@name" is an ' +
  'attribute, "#text" is text, and an array repeats the element. Example for ' +
  '<dimension status="active"><code>1000</code></dimension>: {"@status":"active","code":"1000"}.';

/** A tool for one ProcessXml message root, such as `dimension` or `transaction`. */
export class ProcessXmlTool implements TwinfieldTool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: JsonSchema;
  readonly annotations: ToolAnnotations;
  private readonly toXml = new JsonToXml();
  private readonly toJson = new XmlToJson();

  constructor(
    private readonly message: ProcessXmlMessageDefinition,
    private readonly client: ProcessXmlClient,
    private readonly company: CompanyArgument,
  ) {
    this.name = `process_xml_${message.root}`;
    this.annotations = annotationsFor(message.effect);
    this.description = `${message.summary}\n\nSends <${message.root}> through ProcessXml.\n${documentationHint(message.documentation)}`;
    this.inputSchema = {
      type: 'object',
      properties: { [COMPANY_PROPERTY]: company.schema(), [PAYLOAD]: this.payloadSchema() },
      required: [PAYLOAD],
      additionalProperties: false,
    };
  }

  async execute(args: Readonly<Record<string, unknown>>): Promise<ToolResult> {
    const company = this.company.resolve(
      args[COMPANY_PROPERTY],
      this.message.companyOptional !== true,
    );
    const payload = args[PAYLOAD];
    if (!isPlainObject(payload)) {
      throw new InvalidArgumentError(PAYLOAD, 'must be an object');
    }
    this.assertType(payload);
    const result = await this.client.process(
      this.toXml.convert(this.message.root, payload),
      company,
    );
    const response = this.toJson.convert(result.response);

    return {
      isError: !result.accepted,
      payload: {
        accepted: result.accepted,
        messages: result.messages.map((message) => ({ ...message })),
        response,
      },
    };
  }

  private payloadSchema(): JsonSchema {
    const { types } = this.message;
    const base = { type: 'object', description: PAYLOAD_DESCRIPTION };
    if (types === undefined) {
      return base;
    }

    return {
      ...base,
      properties: { type: { type: 'string', enum: [...types] } },
      required: ['type'],
    };
  }

  private assertType(payload: Record<string, unknown>): void {
    const { types } = this.message;
    if (types !== undefined && !types.includes(payload['type'] as string)) {
      throw new InvalidArgumentError(`${PAYLOAD}.type`, `must be one of ${types.join(', ')}`);
    }
  }
}
