import { OperationEffect } from '../catalog/catalog-types.js';
import { DIMENSION_PAGES, TRANSACTION_PAGES } from './documentation-pages.js';
import type { ProcessXmlMessageDefinition } from './message-definition.js';
import { WRITE_MESSAGES } from './write-messages.js';

export type { ProcessXmlMessageDefinition } from './message-definition.js';

const { read } = OperationEffect;

const READ_MESSAGES: readonly ProcessXmlMessageDefinition[] = [
  {
    root: 'read',
    effect: read,
    summary: 'Read the details of one entity, such as a dimension, transaction or sales invoice.',
    documentation: [
      ...DIMENSION_PAGES,
      ...TRANSACTION_PAGES,
      'api__types__xml-web-services',
      'api__master-data__offices',
      'api__master-data__users',
      'api__master-data__articles',
      'api__master-data__vat',
      'api__master-data__rates',
      'api__transaction-data__sales-invoices',
      'api__request-data__browse-data',
    ],
    types: [
      'dimensions',
      'paylist',
      'paymanagement',
      'browse',
      'user',
      'transaction',
      'activeanalysis',
      'salesinvoice',
      'article',
      'vat',
      'office',
      'projectrate',
    ],
  },
  {
    root: 'list',
    effect: read,
    summary:
      'List master entities. Without a company, {"type":"offices"} lists the companies you can use.',
    documentation: [
      'api__types__xml-web-services',
      'api__master-data__offices',
      'api__request-data__browse-data',
    ],
    types: ['offices', 'dimensions', 'browsefields', 'budgets'],
    companyOptional: true,
  },
  {
    root: 'columns',
    effect: read,
    summary: 'Request browse data (reports such as open items) by browse code and column filters.',
    documentation: ['api__request-data__browse-data'],
  },
  {
    root: 'accountcode',
    effect: read,
    summary: 'Validate an account code.',
    documentation: ['api__types__xml-web-services'],
  },
  {
    root: 'period',
    effect: read,
    summary: 'Validate a period.',
    documentation: ['api__types__xml-web-services', 'api__miscellaneous__periods'],
  },
];

export const PROCESS_XML_MESSAGES: readonly ProcessXmlMessageDefinition[] = [
  ...READ_MESSAGES,
  ...WRITE_MESSAGES,
];
