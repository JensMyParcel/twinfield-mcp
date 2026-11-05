import { OperationEffect, SoapProtocol } from '../src/catalog/catalog-types.js';

const { read, write, destructive } = OperationEffect;

export interface ServiceDefinition {
  readonly wsdlFile: string;
  readonly protocol: SoapProtocol;
  /** Tool name prefix. */
  readonly prefix: string;
  /** Documentation page under `vendor/twinfield/docs`, without extension. */
  readonly documentation: string;
  /** Every operation the WSDL offers, classified. The generator fails on an unlisted one. */
  readonly effects: Readonly<Record<string, OperationEffect>>;
  /** Shorter tool names where `prefix_snake_case(operation)` would pass the 64-character limit. */
  readonly toolNames?: Readonly<Record<string, string>>;
  /** Operations that are not exposed as tools, with the reason. */
  readonly excluded?: Readonly<Record<string, string>>;
}

export const SERVICES: readonly ServiceDefinition[] = [
  {
    wsdlFile: 'bankbookservice.svc.wsdl',
    protocol: SoapProtocol.commandQuery,
    prefix: 'bank_book',
    documentation: 'api__master-data__bank-book',
    effects: {
      CreateBankBook: write,
      ChangeBankBookName: write,
      ChangeBankBookShortName: write,
      ChangeBankBookBankAccount: write,
      ChangeBankBookGeneralLedgerAccount: write,
      GetBankBook: read,
    },
  },
  {
    wsdlFile: 'bankstatementservice.svc.wsdl',
    protocol: SoapProtocol.commandQuery,
    prefix: 'bank_statement',
    documentation: 'api__request-data__electronic-bank-statements',
    effects: { GetBankStatements: read, GetBankStatementsByCreationDate: read },
  },
  {
    wsdlFile: 'budgetservice.svc.wsdl',
    protocol: SoapProtocol.commandQuery,
    prefix: 'budget',
    documentation: 'api__master-data__budget',
    effects: {
      GetBudgetByProfitAndLoss: read,
      GetBudgetByCostCenter: read,
      GetBudgetByProject: read,
    },
  },
  {
    wsdlFile: 'cashbookservice.svc.wsdl',
    protocol: SoapProtocol.commandQuery,
    prefix: 'cash_book',
    documentation: 'api__master-data__cash-book',
    effects: {
      CreateCashBook: write,
      ChangeCashBookName: write,
      ChangeCashBookShortName: write,
      ChangeCashBookGeneralLedgerAccount: write,
      GetCashBook: read,
    },
  },
  {
    wsdlFile: 'deletedtransactionsservice.svc.wsdl',
    protocol: SoapProtocol.commandQuery,
    prefix: 'deleted_transactions',
    documentation: 'api__transaction-data__deleted-transactions',
    effects: { GetDeletedTransactions: read },
  },
  {
    wsdlFile: 'documentservice.svc.wsdl',
    protocol: SoapProtocol.commandQuery,
    prefix: 'document',
    documentation: 'api__transaction-data__sales-invoices',
    effects: { SendDocument: write },
  },
  {
    wsdlFile: 'periodservice.svc.wsdl',
    protocol: SoapProtocol.commandQuery,
    prefix: 'period',
    documentation: 'api__miscellaneous__periods',
    effects: {
      DeleteYear: destructive,
      ResetYears: destructive,
      CreateYear: write,
      ChangeEndDate: write,
      ChangeName: write,
      OpenPeriod: write,
      ClosePeriod: write,
      GetYears: read,
      GetPeriods: read,
    },
  },
  {
    wsdlFile: 'transactionblockedvalueservice.svc.wsdl',
    protocol: SoapProtocol.commandQuery,
    prefix: 'blocked_value',
    documentation: 'api__transaction-data__transaction-blocked-value',
    effects: {
      RegisterBlockedAmountForTransaction: write,
      UnregisterBlockedAmountForTransaction: destructive,
    },
  },
  {
    wsdlFile: 'declarations.asmx.wsdl',
    protocol: SoapProtocol.asmx,
    prefix: 'declarations',
    documentation: 'api__miscellaneous__declarations',
    effects: {
      GetAllSummaries: read,
      GetIctReturnAsXbrl: read,
      GetIctReturnAsXml: read,
      GetNumberOfDeclarations: read,
      GetRangeOfSummaries: read,
      GetRangeOfSummariesByDeclarationYear: read,
      GetRangeOfSummariesByDeclarationYearAndSinceModified: read,
      GetRangeOfSummariesSinceModified: read,
      GetTaxGroupVatReturnAsXbrl: read,
      GetTaxGroupVatReturnAsXml: read,
      GetTaxGroupVatReturnPaymentReference: read,
      GetVatReturnAsXbrl: read,
      GetVatReturnAsXml: read,
      GetVatReturnPaymentReference: read,
      SetToApproved: write,
      SetToRejected: write,
      SetToSent: write,
    },
    toolNames: {
      GetRangeOfSummariesByDeclarationYearAndSinceModified:
        'declarations_get_summaries_by_year_since_modified',
    },
  },
  {
    wsdlFile: 'finder.asmx.wsdl',
    protocol: SoapProtocol.asmx,
    prefix: 'finder',
    documentation: 'api__miscellaneous__finder',
    effects: { Search: read },
  },
  {
    wsdlFile: 'hierarchies.asmx.wsdl',
    protocol: SoapProtocol.asmx,
    prefix: 'hierarchy',
    documentation: 'api__miscellaneous__hierarchy',
    effects: {
      Load: read,
      Save: write,
      Bind: write,
      Unbind: write,
      Hide: write,
      Delete: destructive,
    },
  },
  {
    wsdlFile: 'matching.asmx.wsdl',
    protocol: SoapProtocol.asmx,
    prefix: 'matching',
    documentation: 'api__miscellaneous__undo-match',
    effects: { UndoMatch: destructive },
  },
  {
    wsdlFile: 'payandcollect.asmx.wsdl',
    protocol: SoapProtocol.asmx,
    prefix: 'pay_and_collect',
    documentation: 'api__miscellaneous__pay-and-collect',
    effects: {
      GetRuns: read,
      GetRunInfo: read,
      CreateRun: write,
      CreateRun2: write,
      CreateRunAsync: write,
      Modify: write,
      Authorize: write,
      CreateFile: write,
      CreateFiles: write,
      Finish: write,
      Post: write,
      PostAsync: write,
    },
  },
  {
    wsdlFile: 'versions.asmx.wsdl',
    protocol: SoapProtocol.asmx,
    prefix: 'versions',
    documentation: 'getting-started__web-services-overview',
    effects: { GetTwinfieldVersion: read },
  },
  {
    wsdlFile: 'processxml.asmx.wsdl',
    protocol: SoapProtocol.asmx,
    prefix: 'process_xml',
    documentation: 'api__types__xml-web-services',
    effects: {},
    excluded: {
      ProcessXmlString: 'Exposed through the dedicated ProcessXml tools in src/tools/process-xml.',
      ProcessXmlDocument: 'The documentation limits it to .NET clients; ProcessXmlString is equal.',
      ProcessXmlCompressed: 'Deprecated by Twinfield, see the breaking changes page.',
    },
  },
];
