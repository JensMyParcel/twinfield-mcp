  * [](/documentation/)
  * Request Data
  * Electronic bank statements



On this page

# Electronic bank statements

info

In Twinfield there is a difference between the electronic bank statement and the bank transaction. This web service can only be used in order to retrieve electronic bank statement information. In order to retrieve information of bank transactions, use the [browse data](/documentation/api/request-data/browse-data) functionality.

## General​

Web service type: [Command & Query Web Services](/documentation/api/types/command-and-query-webservices)

Resource location: `/webservices/BankStatementService.svc?wsdl`

## Commands​

The bank statement service does not support any commands.

## Queries​

### GetBankStatements​

  * Query
  * Result
  * Example
  * Raw envelope


    
    
    public class GetBankStatements : Query  
    {  
        public DateTime StatementDateFrom;      // All statements with a statement date equal to or higher than this value will be included.  
        public DateTime StatementDateTo;        // All statements with a statement date equal to or lower than this value will be included.  
        public Boolean IncludePostedStatements; // If value is true, statements that have been posted will be included.  
    }  
    
    
    
    public class GetBankStatementsResult : QueryResult  
    {  
        public BankStatement[] BankStatements;  // Array of all bank statements as a result of the query.  
    }  
      
    public class BankStatement  
    {  
        public String Code;                // Bank code.  
        public Int32 Number;               // Statement number.  
        public Int32 SubId;                // Sub identifier in case the same statement number is imported twice.  
        public String AccountNumber;       // Basic bank account number (BBAN).  
        public String Iban;                // International bank account number (IBAN).  
        public DateTime StatementDate;     // Statement date.  
        public String Currency;            // Currency of the amounts. For instance "EUR".  
        public Decimal OpeningBalance;     // Opening balance amount.  
        public Decimal ClosingBalance;     // Closing balance amount.  
        public BankStatementLine[] Lines;  // Statement lines.  
        public Decimal? TransactionNumber; // Transaction number in case the statement is posted, else value will be null.  
    }  
      
    public class BankStatementLine  
    {  
        public Int32 LineId;                                                        // Line identifier.  
        public String ContraAccountNumber;                                          // Basic bank account number (BBAN) of the contraparty.  
        public String ContraIban;                                                   // International bank account number (IBAN) of the contraparty.  
        public String ContraAccountName;                                            // Bank account name of the contraparty.  
        public String PaymentReference;                                             // Transaction payment reference.  
        public Decimal Amount;                                                      // Transaction amount.  
        public Decimal BaseAmount;                                                  // Transaction amount in the base currency.  
        public String Description;                                                  // Transaction description.  
        public String TransactionTypeId;                                            // Transaction type identification code.  
        public String Reference;                                                    // Transaction reference of the bank.  
        public String EndToEndId;                                                   // Unique identification assigned by the initiating party.  
        public String ReturnReason;                                                 // Return reason code for returned or rejected transaction.  
        public BankStatementAllocationRecognition? Recognition;                     // If and how the bank statement is recognized for allocation (nullable).  
        public BankStatementAllocationMethod[] AllocationMethods;                   // Methods selected for the allocation rules.  
        public BankStatementAllocation[] Allocations;                               // The allocation content.  
        public BankStatementAllocationRuleStorageLevel? AllocationRuleStorageLevel; // If and how to save the allocation rules (nullable).  
    }  
    
    
    
    public enum BankStatementAllocationRecognition  
    {  
        AllocationRule,      // Recognized by an allocation rule.  
        ContraAccountNumber, // Recognized by basic bank account number (BBAN).  
        ContraIban,          // Recognized by international bank account number (IBAN).  
        InvoiceNumber,       // Recognized by invoice number.  
        RelationCode,        // Recognized by customer or supplier code.  
        ChequeNumber,        // Recognized by cheque number.  
        PayingInSlipNumber,  // Recognized by paying-in slip number.  
        PaymentResult        // Recognized by reject/refusal/reverse message.  
    }  
      
    public class BankStatementAllocationMethod  
    {  
        public BankStatementAllocationMethodType Type;      // The type of allocation the method is based on.  
        public string Text;                                 // Filled if type is Description or Reference (nullable).  
        public BankStatementAmountOperator? AmountOperator; // Filled if type is Amount (nullable).  
        public decimal? Amount;                             // Filled if type is Amount (nullable).  
    }  
      
    public enum BankStatementAllocationMethodType  
    {  
        Description,         // Allocation based on transaction description..  
        ContraAccountNumber, // Allocation based on basic bank account number (BBAN).  
        ContraIban,          // Allocation based on international bank account number (IBAN).  
        ContraAccountName,   // Allocation based on bank account name of the contraparty.  
        TransactionTypeId,   // Allocation based on transaction type identification code.  
        Reference,           // Allocation based on transaction reference of the bank.  
        Amount               // Allocation based on transaction amount.  
    }  
      
    public enum BankStatementAmountOperator  
    {  
        Equal,             // The transaction amount is equal to the method amount.  
        NotEqual,          // The transaction amount is not equal to the method amount.  
        LessThan,          // The transaction amount is less than the method amount.  
        LessThanOrEqualTo, // The transaction amount is less than or equal to the method amount.  
        MoreThan,          // The transaction amount is more than the method amount.  
        MoreThanOrEqualTo, // The transaction amount is more than or equal to the method amount.  
    }  
    
    
    
    public class BankStatementAllocation  
    {  
        public BankStatementAllocationType Type;           // Allocation type.  
        public decimal Amount;                             // Allocation amount.  
        public decimal BaseAmount;                         // Allocation amount in the base currency.  
        public BankStatementSense Sense;                   // Sense of the amount.  
        public string Dimension1;                          // Dimension 1.  
        public string Dimension2;                          // Dimension 2.  
        public string Dimension3;                          // Dimension 3.  
        public string Dimension4;                          // Dimension 4.  
        public string Dimension5;                          // Dimension 5.  
        public string Dimension6;                          // Dimension 6.  
        public string DescriptionFormat;                   // Description format.  
        public bool SaveDescriptionFormatToAllocationRule; // Save the description format to the allocation rule.  
        public string ChequeNumber;                        // Cheque number (nullable).  
        public decimal? PayingInSlipNumber;                // Paying-in slip number (nullable).  
        public BankStatementVatLine[] VatLines;            // VAT lines.  
        public BankStatementMatching[] Matchings;          // Matchings.  
    }  
    
    
    
    public enum BankStatementSense  
    {  
        Debit, // Debit amount.  
        Credit // Credit amount.  
    }  
      
    public enum BankStatementAllocationType  
    {  
        Suspense,       // Allocated on suspense account.  
        GeneralLedger,  // Allocated on general ledger account.  
        Customer,       // Allocated on customer.  
        Supplier,       // Allocated on supplier.  
        SupplierCheque, // Allocated on supplier cheque.  
        PayingInSlip    // Allocated on paying-in slip.  
    }  
      
    public class BankStatementVatLine  
    {  
        public string Code;          // VAT code.  
        public decimal Turnover;     // Turnover value.  
        public decimal Value;        // VAT value.  
        public bool ValueOverridden; // Whether value has been overridden by user.  
    }  
      
    public class BankStatementMatching  
    {  
        public string Code;       // Matched transaction line code.  
        public decimal Number;    // Matched transaction line number.  
        public int LineId;        // Matched transaction line ID.  
        public decimal BaseValue; // Matched transaction line base value.  
    }  
      
    public enum BankStatementAllocationRuleType  
    {  
        LocalBank,     // Add Allocation rules to the bank in the current office.  
        LocalOffice,   // Add Allocation rules to the current office.  
        TemplateBank,  // Add Allocation rules to the bank in the template office.  
        TemplateOffice // Add Allocation rules to the template office.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BankStatementServiceClient("BasicHttpsBinding_BankStatementService",  
            "https://api.<cluster>.twinfield.com/webservices/BankStatementService.svc");  
      
        var query = new GetBankStatements  
        {  
            StatementDateFrom = DateTime.Now.Date,  
            StatementDateTo = DateTime.Now.Date.AddDays(1).AddMilliseconds(-1),  
            IncludePostedStatements = false  
        };  
        var queryResponse = Client.Query(new QueryRequest()  
        {  
            Authentication = new AuthenticationHeader()  
            {  
                AccessToken = "2b128baa05dd3cabc61e534435884961",  
                CompanyCode = "001"  
            },  
            Query = query  
        });  
      
        var result = (GetBankStatementsResult)queryResponse.Result;  
    }  
    

The example below reads bank statements for a certain period.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BankStatementService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BankStatementService/Query"  
    Host: <cluster>.twinfield.com  
    Content-Length: 703  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/" xmlns:twin1="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared">  
        <soapenv:Header>  
            <twin:Authentication>  
                <twin1:AccessToken>9c19e935ae213d9aa36ca2dd44529f14</twin1:AccessToken>  
                <twin1:CompanyCode>001</twin1:CompanyCode>  
            </twin:Authentication>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:Query i:type="b:GetBankStatements" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BankStatementService">  
                <b:IncludePostedStatements>false</b:IncludePostedStatements>  
                <b:StatementDateFrom>2021-06-02T00:00:00</b:StatementDateFrom>  
                <b:StatementDateTo>2021-06-03T00:00:00</b:StatementDateTo>  
            </twin:Query>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### GetBankStatementsByCreationDate​

  * Query
  * Result
  * Example
  * Raw envelope


    
    
    public class GetBankStatementsByCreationDate : Query  
    {  
        public DateTime? CreationDateFrom;      // All statements with a creation date equal to or higher than this value will be included.  
        public DateTime? CreationDateTo;        // All statements with a creation date equal to or lower than this value will be included.  
        public Boolean IncludePostedStatements; // If value is true, statements that have been posted will be included.  
    }  
    
    
    
    public class GetBankStatementsResult : QueryResult  
    {  
        public BankStatement[] BankStatements;  // Array of all bank statements as a result of the query.  
    }  
      
    public class BankStatement  
    {  
        public String Code;                // Bank code.  
        public Int32 Number;               // Statement number.  
        public Int32 SubId;                // Sub identifier in case the same statement number is imported twice.  
        public String AccountNumber;       // Basic bank account number (BBAN).  
        public String Iban;                // International bank account number (IBAN).  
        public DateTime StatementDate;     // Statement date.  
        public String Currency;            // Currency of the amounts. For instance "EUR".  
        public Decimal OpeningBalance;     // Opening balance amount.  
        public Decimal ClosingBalance;     // Closing balance amount.  
        public BankStatementLine[] Lines;  // Statement lines.  
        public Decimal? TransactionNumber; // Transaction number in case the statement is posted, else value will be null.  
    }  
      
    public class BankStatementLine  
    {  
        public Int32 LineId;                                                        // Line identifier.  
        public String ContraAccountNumber;                                          // Basic bank account number (BBAN) of the contraparty.  
        public String ContraIban;                                                   // International bank account number (IBAN) of the contraparty.  
        public String ContraAccountName;                                            // Bank account name of the contraparty.  
        public String PaymentReference;                                             // Transaction payment reference.  
        public Decimal Amount;                                                      // Transaction amount.  
        public Decimal BaseAmount;                                                  // Transaction amount in the base currency.  
        public String Description;                                                  // Transaction description.  
        public String TransactionTypeId;                                            // Transaction type identification code.  
        public String Reference;                                                    // Transaction reference of the bank.  
        public String EndToEndId;                                                   // Unique identification assigned by the initiating party.  
        public String ReturnReason;                                                 // Return reason code for returned or rejected transaction.  
        public BankStatementAllocationRecognition? Recognition;                     // If and how the bank statement is recognized for allocation (nullable).  
        public BankStatementAllocationMethod[] AllocationMethods;                   // Methods selected for the allocation rules.  
        public BankStatementAllocation[] Allocations;                               // The allocation content.  
        public BankStatementAllocationRuleStorageLevel? AllocationRuleStorageLevel; // If and how to save the allocation rules (nullable).  
    }  
    
    
    
    public enum BankStatementAllocationRecognition  
    {  
        AllocationRule,      // Recognized by an allocation rule.  
        ContraAccountNumber, // Recognized by basic bank account number (BBAN).  
        ContraIban,          // Recognized by international bank account number (IBAN).  
        InvoiceNumber,       // Recognized by invoice number.  
        RelationCode,        // Recognized by customer or supplier code.  
        ChequeNumber,        // Recognized by cheque number.  
        PayingInSlipNumber,  // Recognized by paying-in slip number.  
        PaymentResult        // Recognized by reject/refusal/reverse message.  
    }  
      
    public class BankStatementAllocationMethod  
    {  
        public BankStatementAllocationMethodType Type;      // The type of allocation the method is based on.  
        public string Text;                                 // Filled if type is Description or Reference (nullable).  
        public BankStatementAmountOperator? AmountOperator; // Filled if type is Amount (nullable).  
        public decimal? Amount;                             // Filled if type is Amount (nullable).  
    }  
      
    public enum BankStatementAllocationMethodType  
    {  
        Description,         // Allocation based on transaction description..  
        ContraAccountNumber, // Allocation based on basic bank account number (BBAN).  
        ContraIban,          // Allocation based on international bank account number (IBAN).  
        ContraAccountName,   // Allocation based on bank account name of the contraparty.  
        TransactionTypeId,   // Allocation based on transaction type identification code.  
        Reference,           // Allocation based on transaction reference of the bank.  
        Amount               // Allocation based on transaction amount.  
    }  
      
    public enum BankStatementAmountOperator  
    {  
        Equal,             // The transaction amount is equal to the method amount.  
        NotEqual,          // The transaction amount is not equal to the method amount.  
        LessThan,          // The transaction amount is less than the method amount.  
        LessThanOrEqualTo, // The transaction amount is less than or equal to the method amount.  
        MoreThan,          // The transaction amount is more than the method amount.  
        MoreThanOrEqualTo, // The transaction amount is more than or equal to the method amount.  
    }  
    
    
    
    public class BankStatementAllocation  
    {  
        public BankStatementAllocationType Type;           // Allocation type.  
        public decimal Amount;                             // Allocation amount.  
        public decimal BaseAmount;                         // Allocation amount in the base currency.  
        public BankStatementSense Sense;                   // Sense of the amount.  
        public string Dimension1;                          // Dimension 1.  
        public string Dimension2;                          // Dimension 2.  
        public string Dimension3;                          // Dimension 3.  
        public string Dimension4;                          // Dimension 4.  
        public string Dimension5;                          // Dimension 5.  
        public string Dimension6;                          // Dimension 6.  
        public string DescriptionFormat;                   // Description format.  
        public bool SaveDescriptionFormatToAllocationRule; // Save the description format to the allocation rule.  
        public string ChequeNumber;                        // Cheque number (nullable).  
        public decimal? PayingInSlipNumber;                // Paying-in slip number (nullable).  
        public BankStatementVatLine[] VatLines;            // VAT lines.  
        public BankStatementMatching[] Matchings;          // Matchings.  
    }  
    
    
    
    public enum BankStatementSense  
    {  
        Debit, // Debit amount.  
        Credit // Credit amount.  
    }  
      
    public enum BankStatementAllocationType  
    {  
        Suspense,       // Allocated on suspense account.  
        GeneralLedger,  // Allocated on general ledger account.  
        Customer,       // Allocated on customer.  
        Supplier,       // Allocated on supplier.  
        SupplierCheque, // Allocated on supplier cheque.  
        PayingInSlip    // Allocated on paying-in slip.  
    }  
      
    public class BankStatementVatLine  
    {  
        public string Code;          // VAT code.  
        public decimal Turnover;     // Turnover value.  
        public decimal Value;        // VAT value.  
        public bool ValueOverridden; // Whether value has been overridden by user.  
    }  
      
    public class BankStatementMatching  
    {  
        public string Code;       // Matched transaction line code.  
        public decimal Number;    // Matched transaction line number.  
        public int LineId;        // Matched transaction line ID.  
        public decimal BaseValue; // Matched transaction line base value.  
    }  
      
    public enum BankStatementAllocationRuleType  
    {  
        LocalBank,     // Add Allocation rules to the bank in the current office.  
        LocalOffice,   // Add Allocation rules to the current office.  
        TemplateBank,  // Add Allocation rules to the bank in the template office.  
        TemplateOffice // Add Allocation rules to the template office.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BankStatementServiceClient("BasicHttpsBinding_BankStatementService",  
            "https://api.<cluster>.twinfield.com/webservices/BankStatementService.svc");  
      
        var query = new GetBankStatementsByCreationDate  
        {  
            CreationDateFrom = DateTime.Now.Date,  
            CreationDateTo = DateTime.Now.Date.AddDays(1).AddMilliseconds(-1),  
            IncludePostedStatements = false  
        };  
        var queryResponse = Client.Query(new QueryRequest()  
        {  
            Authentication = new AuthenticationHeader()  
            {  
                AccessToken = "2b128baa05dd3cabc61e534435884961",  
                CompanyCode = "001"  
            },  
            Query = query  
        });  
      
        var result = (GetBankStatementsResult)queryResponse.Result;  
    }  
    

The example below reads bank statements for a certain period and certain time frame.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BankStatementService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BankStatementService/Query"  
    Host: <cluster>.twinfield.com  
    Content-Length: 703  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/" xmlns:twin1="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared">  
        <soapenv:Header>  
            <twin:Authentication>  
                <twin1:AccessToken>9c19e935ae213d9aa36ca2dd44529f14</twin1:AccessToken>  
                <twin1:CompanyCode>001</twin1:CompanyCode>  
            </twin:Authentication>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:Query i:type="b:GetBankStatementsByCreationDate" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BankStatementService">  
                <b:IncludePostedStatements>false</b:IncludePostedStatements>  
                <b:CreationDateFrom>2022-11-15T00:00:00</b:CreationDateFrom>  
                <b:CreationDateTo>2022-11-16T11:59:00</b:CreationDateTo>  
            </twin:Query>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    
