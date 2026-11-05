import {
  type AsmxOperationDescriptor,
  type CommandQueryOperationDescriptor,
  type OperationDescriptor,
} from '../catalog/catalog-types.js';
import type { AccessToken } from '../domain/access-token.js';
import type { CompanyCode } from '../domain/company-code.js';
import type { CodecFactory } from '../serialization/codec-factory.js';
import { SchemaContext, type JsonSchema } from '../serialization/json-schema.js';
import type { ComplexCodec } from '../serialization/structured-codecs.js';
import { QualifiedName, XmlNamespace } from '../xml/qualified-name.js';
import { XmlElement } from '../xml/xml-element.js';
import type { RequestBuilder } from './twinfield-gateway.js';

const twinfield = (local: string): QualifiedName => QualifiedName.of(XmlNamespace.twinfield, local);
const SHARED_NAMESPACE = 'http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared';

/** One callable web service operation: the schema of its arguments and the request it sends. */
export interface SoapOperation {
  readonly descriptor: OperationDescriptor;
  argumentSchema(): JsonSchema;
  /** Validates and serializes the arguments now; the builder adds the token when it is sent. */
  prepare(
    args: Readonly<Record<string, unknown>>,
    company: CompanyCode | undefined,
  ): RequestBuilder;
}

function credentials(
  namespace: string,
  accessToken: AccessToken,
  company: CompanyCode | undefined,
): XmlElement[] {
  const token = XmlElement.withText(
    QualifiedName.of(namespace, 'AccessToken'),
    accessToken.reveal(),
  );
  if (company === undefined) {
    return [token];
  }

  return [token, XmlElement.withText(QualifiedName.of(namespace, 'CompanyCode'), company.value)];
}

function rootSchema(codec: ComplexCodec): JsonSchema {
  const context = new SchemaContext();

  return context.document(codec.objectSchema(context));
}

/** An ASMX method: a `Header` SOAP header and the method's own wrapper element. */
export class AsmxOperation implements SoapOperation {
  constructor(
    readonly descriptor: AsmxOperationDescriptor,
    private readonly codecs: CodecFactory,
  ) {}

  argumentSchema(): JsonSchema {
    return rootSchema(this.codecs.complexCodec(this.descriptor.request.type));
  }

  prepare(
    args: Readonly<Record<string, unknown>>,
    company: CompanyCode | undefined,
  ): RequestBuilder {
    const { path, soapAction, requiresCompany, request } = this.descriptor;
    const body = this.codecs.element(request).writeOne(args, '');

    return (accessToken) => ({
      path,
      soapAction,
      header: requiresCompany
        ? new XmlElement(
            twinfield('Header'),
            [],
            credentials(XmlNamespace.twinfield, accessToken, company),
          )
        : undefined,
      body,
    });
  }
}

/** A WCF command or query: an `Authentication` header and a `Command` or `Query` of a subtype. */
export class CommandQueryOperation implements SoapOperation {
  constructor(
    readonly descriptor: CommandQueryOperationDescriptor,
    private readonly codecs: CodecFactory,
  ) {}

  argumentSchema(): JsonSchema {
    return rootSchema(this.codecs.complexCodec(this.descriptor.type));
  }

  prepare(
    args: Readonly<Record<string, unknown>>,
    company: CompanyCode | undefined,
  ): RequestBuilder {
    const { path, soapAction, type, bodyElement } = this.descriptor;
    const content = this.codecs.complexCodec(type).content(args, '');
    const subtype = {
      name: QualifiedName.of(XmlNamespace.xsi, 'type'),
      value: QualifiedName.of(type.namespace, type.name),
    };
    const body = new XmlElement(twinfield(bodyElement), [subtype], content.children);

    return (accessToken) => ({
      path,
      soapAction,
      header: new XmlElement(
        twinfield('Authentication'),
        [],
        credentials(SHARED_NAMESPACE, accessToken, company),
      ),
      body,
    });
  }
}
