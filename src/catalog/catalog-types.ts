/**
 * The shape of the generated SOAP catalog. The generator in `codegen/` writes plain data in
 * this shape from the vendored WSDL and XSD files; the runtime only reads it.
 */

export interface TypeReference {
  readonly namespace: string;
  readonly name: string;
}

export const Occurrence = { unbounded: -1 } as const;

export interface ElementDescriptor {
  readonly name: string;
  readonly namespace: string;
  readonly type: TypeReference;
  readonly minOccurs: number;
  /** `Occurrence.unbounded` for `maxOccurs="unbounded"`. */
  readonly maxOccurs: number;
  readonly nillable: boolean;
}

export const TypeKind = {
  primitive: 'primitive',
  enumeration: 'enumeration',
  complex: 'complex',
} as const;

export type TypeKind = (typeof TypeKind)[keyof typeof TypeKind];

export interface PrimitiveTypeDescriptor {
  readonly kind: typeof TypeKind.primitive;
  readonly reference: TypeReference;
  /** The built-in XSD type this type restricts, such as `int` or `dateTime`. */
  readonly primitive: string;
  readonly pattern?: string;
}

export interface EnumerationTypeDescriptor {
  readonly kind: typeof TypeKind.enumeration;
  readonly reference: TypeReference;
  readonly values: readonly string[];
}

export interface ComplexTypeDescriptor {
  readonly kind: typeof TypeKind.complex;
  readonly reference: TypeReference;
  readonly base?: TypeReference;
  readonly elements: readonly ElementDescriptor[];
}

export type TypeDescriptor =
  PrimitiveTypeDescriptor | EnumerationTypeDescriptor | ComplexTypeDescriptor;

export const SoapProtocol = {
  /** ASMX: a `Header` SOAP header and one wrapper element per operation. */
  asmx: 'asmx',
  /** WCF command/query: an `Authentication` header and a polymorphic `Command` or `Query`. */
  commandQuery: 'commandQuery',
} as const;

export type SoapProtocol = (typeof SoapProtocol)[keyof typeof SoapProtocol];

export const OperationEffect = {
  read: 'read',
  write: 'write',
  destructive: 'destructive',
} as const;

export type OperationEffect = (typeof OperationEffect)[keyof typeof OperationEffect];

interface OperationBase {
  readonly tool: string;
  readonly service: string;
  readonly path: string;
  readonly soapAction: string;
  readonly description: string;
  readonly documentation: string;
  readonly effect: OperationEffect;
  readonly requiresCompany: boolean;
}

export interface AsmxOperationDescriptor extends OperationBase {
  readonly protocol: typeof SoapProtocol.asmx;
  readonly request: ElementDescriptor;
}

export interface CommandQueryOperationDescriptor extends OperationBase {
  readonly protocol: typeof SoapProtocol.commandQuery;
  /** `Command` for the `Process` action, `Query` for the `Query` action. */
  readonly bodyElement: 'Command' | 'Query';
  readonly type: TypeReference;
}

export type OperationDescriptor = AsmxOperationDescriptor | CommandQueryOperationDescriptor;

export interface SoapCatalog {
  readonly types: readonly TypeDescriptor[];
  readonly operations: readonly OperationDescriptor[];
}
