import type { OperationEffect } from '../catalog/catalog-types.js';

export interface ProcessXmlMessageDefinition {
  /** The root element of the message. */
  readonly root: string;
  readonly effect: OperationEffect;
  readonly summary: string;
  /** Documentation pages under `vendor/twinfield/docs`, without extension. */
  readonly documentation: readonly string[];
  /** For `read` and `list`: the allowed values of the `type` child element. */
  readonly types?: readonly string[];
  /** Messages that work without a company, such as listing the companies themselves. */
  readonly companyOptional?: boolean;
}
