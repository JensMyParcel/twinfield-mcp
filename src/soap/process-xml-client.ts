import type { CompanyCode } from '../domain/company-code.js';
import { QualifiedName, XmlNamespace } from '../xml/qualified-name.js';
import { XmlElement } from '../xml/xml-element.js';
import type { XmlReader } from '../xml/xml-reader.js';
import type { XmlWriter } from '../xml/xml-writer.js';
import type { TwinfieldGateway } from './twinfield-gateway.js';

const twinfield = (local: string): QualifiedName => QualifiedName.of(XmlNamespace.twinfield, local);
const unqualified = (local: string): QualifiedName => QualifiedName.unqualified(local);

export interface ProcessXmlMessage {
  readonly element: string;
  readonly type: string;
  readonly text: string;
}

export interface ProcessXmlResult {
  /** False when the root has `result="0"` or any element has `msgtype="error"`. */
  readonly accepted: boolean;
  readonly response: XmlElement;
  readonly messages: readonly ProcessXmlMessage[];
}

export class ProcessXmlError extends Error {
  override readonly name = 'ProcessXmlError';
}

/** Sends one XML message through `ProcessXmlString` and reads Twinfield's verdict on it. */
export class ProcessXmlClient {
  constructor(
    private readonly gateway: TwinfieldGateway,
    private readonly writer: XmlWriter,
    private readonly reader: XmlReader,
  ) {}

  async process(message: XmlElement, company: CompanyCode | undefined): Promise<ProcessXmlResult> {
    const xmlRequest = this.writer.write(message);
    const result = await this.gateway.call((accessToken) => ({
      path: '/webservices/processxml.asmx',
      soapAction: 'http://www.twinfield.com/ProcessXmlString',
      header: new XmlElement(
        twinfield('Header'),
        [],
        [
          XmlElement.withText(twinfield('AccessToken'), accessToken.reveal()),
          ...(company ? [XmlElement.withText(twinfield('CompanyCode'), company.value)] : []),
        ],
      ),
      body: new XmlElement(
        twinfield('ProcessXmlString'),
        [],
        [XmlElement.withText(twinfield('xmlRequest'), xmlRequest)],
      ),
    }));
    const text = result?.child(twinfield('ProcessXmlStringResult'))?.textContent();
    if (text === undefined || text.trim() === '') {
      throw new ProcessXmlError('ProcessXmlString returned no result.');
    }
    const response = this.reader.read(text);
    const messages = collectMessages(response);

    return { accepted: isAccepted(response, messages), response, messages };
  }
}

/** Rejected when the root says `result="0"` or any element carries an error message. */
function isAccepted(response: XmlElement, messages: readonly ProcessXmlMessage[]): boolean {
  const rejected = response.attribute(unqualified('result')) === '0';

  return !rejected && !messages.some((message) => message.type === 'error');
}

/** Twinfield reports problems as `msgtype` and `msg` attributes on the element they concern. */
function collectMessages(element: XmlElement, path = element.name.local): ProcessXmlMessage[] {
  const text = element.attribute(unqualified('msg'));
  const own =
    typeof text === 'string' && text !== ''
      ? [
          {
            element: path,
            type: String(element.attribute(unqualified('msgtype')) ?? 'error'),
            text,
          },
        ]
      : [];

  const seen = new Map<string, number>();
  const nested = element.elements().flatMap((child) => {
    const position = (seen.get(child.name.local) ?? 0) + 1;
    seen.set(child.name.local, position);

    return collectMessages(child, `${path}/${child.name.local}[${position}]`);
  });

  return [...own, ...nested];
}
