import type { ClusterUrl } from '../domain/cluster-url.js';
import { HttpMethod, type HttpResponse, type HttpTransport } from '../http/http-transport.js';
import { QualifiedName, XmlNamespace } from '../xml/qualified-name.js';
import { XmlElement } from '../xml/xml-element.js';
import type { XmlReader } from '../xml/xml-reader.js';
import type { XmlWriter } from '../xml/xml-writer.js';
import { TwinfieldFault, TwinfieldHttpError } from './twinfield-error.js';

const envelope = (local: string): QualifiedName =>
  QualifiedName.of(XmlNamespace.soapEnvelope, local);

export interface SoapRequest {
  readonly path: string;
  readonly soapAction: string;
  readonly header: XmlElement | undefined;
  readonly body: XmlElement;
}

/** Sends one SOAP 1.1 request and returns the first element in the response body. */
export class SoapClient {
  constructor(
    private readonly http: HttpTransport,
    private readonly writer: XmlWriter,
    private readonly reader: XmlReader,
  ) {}

  async call(cluster: ClusterUrl, request: SoapRequest): Promise<XmlElement | undefined> {
    const response = await this.http.send({
      method: HttpMethod.post,
      url: cluster.endpoint(request.path),
      headers: {
        'content-type': 'text/xml; charset=utf-8',
        accept: 'text/xml',
        soapaction: `"${request.soapAction}"`,
      },
      body: `<?xml version="1.0" encoding="utf-8"?>${this.writer.write(this.envelope(request))}`,
    });
    const body = this.responseBody(response);
    const fault = body.child(envelope('Fault'));
    if (fault) {
      throw toFault(response.status, fault);
    }
    if (response.status !== 200) {
      throw new TwinfieldHttpError(response.status);
    }

    return body.elements()[0];
  }

  private envelope(request: SoapRequest): XmlElement {
    const header = request.header ? [new XmlElement(envelope('Header'), [], [request.header])] : [];

    return new XmlElement(
      envelope('Envelope'),
      [],
      [...header, new XmlElement(envelope('Body'), [], [request.body])],
    );
  }

  private responseBody(response: HttpResponse): XmlElement {
    let document: XmlElement;
    try {
      document = this.reader.read(response.body);
    } catch {
      throw new TwinfieldHttpError(response.status);
    }
    const body = document.child(envelope('Body'));
    if (!document.name.equals(envelope('Envelope')) || body === undefined) {
      throw new TwinfieldHttpError(response.status);
    }

    return body;
  }
}

/** ASMX puts `code` and `message` in the detail; WCF wraps `Code` and `Message` in a fault type. */
function toFault(status: number, fault: XmlElement): TwinfieldFault {
  const detail = fault.childByLocalName('detail')?.elements()[0];
  const detailFields = detail?.childByLocalName('Code') ? detail : fault.childByLocalName('detail');
  const field = (name: string): string | undefined =>
    nonEmpty(detailFields?.elements().find((element) => element.name.local.toLowerCase() === name));

  return new TwinfieldFault(
    status,
    nonEmpty(fault.childByLocalName('faultcode')) ?? 'unknown',
    field('message') ?? nonEmpty(fault.childByLocalName('faultstring')) ?? 'SOAP fault',
    field('code'),
    field('source'),
  );
}

/** WCF sends an absent message as `<Message i:nil="true"/>`, so empty text counts as missing. */
function nonEmpty(element: XmlElement | undefined): string | undefined {
  const text = element?.textContent().trim();

  return text === '' ? undefined : text;
}
