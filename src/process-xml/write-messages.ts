import { OperationEffect } from '../catalog/catalog-types.js';
import { DIMENSION_PAGES, TRANSACTION_PAGES } from './documentation-pages.js';
import type { ProcessXmlMessageDefinition } from './message-definition.js';

const { destructive } = OperationEffect;

// ProcessXml writes are create-or-update and can delete (status="deleted"), so all of them are
// marked destructive.
export const WRITE_MESSAGES: readonly ProcessXmlMessageDefinition[] = [
  {
    root: 'dimension',
    effect: destructive,
    summary:
      'Create, update or delete a dimension: customer (DEB), supplier (CRD), general ledger account (BAS/PNL), cost center (KPL), fixed asset (AST), project (PRJ) or activity (ACT).',
    documentation: DIMENSION_PAGES,
  },
  {
    root: 'dimensiontype',
    effect: destructive,
    summary: 'Update a dimension type, such as its code mask and levels.',
    documentation: ['api__master-data__dimension-types'],
  },
  {
    root: 'dimensiongroup',
    effect: destructive,
    summary: 'Create, update or delete a dimension group.',
    documentation: ['api__master-data__dimension-groups'],
  },
  {
    root: 'transaction',
    effect: destructive,
    summary:
      'Create, change, finalise or delete a bank, cash, journal, purchase or sales transaction.',
    documentation: TRANSACTION_PAGES,
  },
  {
    root: 'salesinvoice',
    effect: destructive,
    summary: 'Create or update a sales invoice.',
    documentation: ['api__transaction-data__sales-invoices'],
  },
  {
    root: 'statement',
    effect: destructive,
    summary: 'Import an electronic bank statement.',
    documentation: ['api__transaction-data__electronic-bank-statements'],
  },
  {
    root: 'match',
    effect: destructive,
    summary: 'Match transaction lines.',
    documentation: ['api__miscellaneous__matching'],
  },
  {
    root: 'reverse',
    effect: destructive,
    summary: 'Reverse a transaction.',
    documentation: ['api__transaction-data__reversal-transactions'],
  },
  {
    root: 'spread',
    effect: destructive,
    summary: 'Spread a transaction over periods.',
    documentation: ['api__transaction-data__spread-transactions'],
  },
  {
    root: 'teqs',
    effect: destructive,
    summary: 'Create or update hours and expenses (teq elements).',
    documentation: ['api__transaction-data__time'],
  },
  {
    root: 'article',
    effect: destructive,
    summary: 'Create, update or delete an item (article).',
    documentation: ['api__master-data__articles'],
  },
  {
    root: 'currency',
    effect: destructive,
    summary: 'Create or update a currency and its rates.',
    documentation: ['api__master-data__currencies'],
  },
  {
    root: 'projectrate',
    effect: destructive,
    summary: 'Create or update a rate for projects and activities.',
    documentation: ['api__master-data__rates'],
  },
  {
    root: 'assetmethod',
    effect: destructive,
    summary: 'Create or update an asset method.',
    documentation: ['api__master-data__asset-methods'],
  },
  {
    root: 'user',
    effect: destructive,
    summary: 'Create, update or delete a user.',
    documentation: ['api__master-data__users'],
  },
  {
    root: 'office',
    effect: destructive,
    summary: 'Update a company (office).',
    documentation: ['api__master-data__offices'],
  },
  {
    root: 'vat',
    effect: destructive,
    summary: 'Create or update a VAT code.',
    documentation: ['api__master-data__vat'],
  },
  {
    root: 'vatgroup',
    effect: destructive,
    summary: 'Maintain VAT groups.',
    documentation: ['api__master-data__vat', 'getting-started__web-services-overview'],
  },
  {
    root: 'vattype',
    effect: destructive,
    summary: 'Maintain VAT types.',
    documentation: ['api__master-data__vat', 'getting-started__web-services-overview'],
  },
  {
    root: 'hierarchy',
    effect: destructive,
    summary:
      'Maintain reporting structures. The hierarchy_* tools offer the same as typed methods.',
    documentation: ['api__miscellaneous__hierarchy'],
  },
  {
    root: 'cmaction',
    effect: destructive,
    summary: 'Maintain invoice (credit management) actions.',
    documentation: ['getting-started__web-services-overview'],
  },
  {
    root: 'cdmaction',
    effect: destructive,
    summary: 'Maintain invoice (collection) actions.',
    documentation: ['getting-started__web-services-overview'],
  },
  {
    root: 'remindruntype',
    effect: destructive,
    summary: 'Maintain reminder scenarios.',
    documentation: ['getting-started__web-services-overview'],
  },
  {
    root: 'paymanagement',
    effect: destructive,
    summary: 'Maintain pay types.',
    documentation: ['api__miscellaneous__pay-and-collect'],
  },
  {
    root: 'payrun',
    effect: destructive,
    summary:
      'Maintain pay and collect runs. Twinfield advises the pay_and_collect_* tools instead.',
    documentation: ['api__miscellaneous__pay-and-collect'],
  },
];
