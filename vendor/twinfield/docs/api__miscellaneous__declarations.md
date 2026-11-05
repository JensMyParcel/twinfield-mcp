  * [](/documentation/)
  * Miscellaneous
  * Declarations



On this page

# Declarations

## General​

Web service type: [Command & Query Web Services](/documentation/api/types/command-and-query-webservices)

Resource location: `/webservices/declarations.asmx?wsdl`

## General data contracts​

  * Query


    
    
    public class DeclarationSummary  
    {  
        public int Id;                               // Unique Id of the return.  
        public string DocumentCode;                  // Code of the return. One of the fixed values: VATTURNOVER, VATICT, YEARLYSUPPLETION, TAXGROUP or TXGRPYRSP.  
        public string Name;                          // Name of the return.  
        public DocumentTimeFrame DocumentTimeFrame;  // Period of the return.  
        public DocumentStatus Status;                // Status of the return.  
        public CodeName Assignee;                    // Name of the assignee of the return.  
        public CodeName Company;                     // Name of the office.  
    }  
      
    public class DocumentTimeFrame  
    {  
        public string Period;  // Period part of the year/period.  
    }  
      
    public class DocumentStatus  
    {  
        public string Description;       // Description of the status.  
        public int StepIndex;            // Status number:  
                                         // 1 = Created  
                                         // 2 = Modified  
                                         // 3 = Sending  
                                         // 4 = Error while sending  
                                         // 5 = Sent  
                                         // 6 = Rejected  
                                         // 7 = Approved  
                                         // 8 = Authorized  
        public string ExtraInformation;  // Optional extra information about the status.  
    }  
      
    public class CodeName  
    {  
        public string Code;  // Code.  
        public string Name;  // Name.  
    }  
    
    
    
    public class MessageOfLoadMessage  
    {  
        public MessageType TypeField;  
        public string TextField;  
        public LoadMessage CodeField;  
        public string ParametersField;  
    }  
      
    public class MessageOfSetStatusMessages  
    {  
        public MessageType TypeField;  
        public string TextField;  
        public SetStatusMessages CodeField;  
        public string ParametersField;  
    }  
      
    public enum MessageType  
    {  
        Error,  
        Warning,  
        Informational  
    }  
      
    public enum LoadMessage  
    {  
        NoAccess,  
        InvalidCode,  
        InvalidParameter,  
        NotSupported,  
        InvalidDocumentType  
    }  
      
    public enum SetStatusMessages  
    {  
        NoAccess,  
        DocumentDoesNotExist,  
        StartStatusInCorrectForTransition,  
        UnableToPerformTransition  
    }  
    

## Commands​

### SetToSent​

  * Command


    
    
    public class SetToSent : MessageOfSetStatusMessages  
    {  
        public int documentId;  // Id of the document to be changed. Mandatory.  
    }  
    

### SetToApproved​

  * Command


    
    
    public class SetToApproved : MessageOfSetStatusMessages  
    {  
        public int documentId;  // Id of the document to be changed. Mandatory.  
    }  
    

### SetToRejected​

  * Command


    
    
    public class SetToRejected : MessageOfSetStatusMessages  
    {  
        public int DocumentId;  // Id of the document to be changed. Mandatory.  
        public string Reason;   // The reason why the document is set to rejected. Mandatory.  
    }  
    

## Queries​

### GetAllSummaries​

  * Query
  * Raw envelope


    
    
    public class GetAllSummaries : MessageOfLoadMessage  
    {  
        public string CompanyCode;            // The code of the office for which the returns should be retrieved. Mandatory.  
        public DeclarationSummary VatReturn;  // List of returns.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/declarations.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.34209)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/GetAllSummaries"  
    Host: <cluster>.twinfield.com  
    Content-Length: 491  
    Expect: 100-continue  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/">  
        <soapenv:Header>  
            <twin:Header>  
                <twin:AccessToken>9c19e935ae213d9aa36ca2dd44529f14</twin:AccessToken>  
                <twin:CompanyCode>001</twin:CompanyCode>  
            </twin:Header>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:GetAllSummaries>  
                <twin:companyCode>001</twin:companyCode>  
            </twin:GetAllSummaries>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### GetRangeOfSummaries​

  * Query


    
    
    public class GetRangeOfSummaries : MessageOfLoadMessage  
    {  
        public string CompanyCode;            // The code of the office for which the returns should be retrieved. Mandatory.  
        public int StartIndex;                // The index of the first record to be retrieved. Mandatory.  
        public int Count;                     // The number of records to be retrieved. Mandatory.  
        public DeclarationSummary VatReturn;  // List of returns.  
    }  
    

### GetRangeOfSummariesSinceModified​

  * Query
  * Raw envelope


    
    
    public class GetRangeOfSummariesSinceModified : MessageOfLoadMessage  
    {  
        public string CompanyCode;            // The code of the office for which the returns should be retrieved. Asterisk (*) can be used as the code to get the returns of all the companies in an organisation which is accessible by user. Mandatory.  
        public int StartIndex;                // The index of the first record to be retrieved. Mandatory.  
        public int Count;                     // The number of records to be retrieved. Mandatory.  
        public DateTime modifiedSince         // If provided, it returns the declarations which are modified/generated on and after the specified timestamp.   
        public DeclarationSummary VatReturn;  // List of returns.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/declarations.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.34209)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/GetRangeOfSummariesSinceModified"  
    Host: <cluster>.twinfield.com  
    Content-Length: 491  
    Expect: 100-continue  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/">  
        <soapenv:Header>  
            <twin:Header>  
                <twin:AccessToken>9c19e935ae213d9aa36ca2dd44529f14</twin:AccessToken>  
                <twin:CompanyCode>001</twin:CompanyCode>  
            </twin:Header>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:GetRangeOfSummariesSinceModified>  
                <twin:companyCode>001</twin:companyCode>  
                <twin:startIndex>1</twin:startIndex>  
                <twin:count>2</twin:count>  
                <twin:modifiedSince>2025-05-30T10:48:15.213Z</twin:modifiedSince>  
            </twin:GetRangeOfSummariesSinceModified>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### GetRangeOfSummariesByDeclarationYear​

  * Query
  * Raw envelope


    
    
    public class GetRangeOfSummariesByDeclarationYear : MessageOfLoadMessage  
    {  
        public string CompanyCode;            // The code of the office for which the returns should be retrieved. Asterisk (*) can be used as the code to get the returns of all the companies in an organisation which is accessible by user. Mandatory.  
        public int DeclarationYear;           // The declarations are retrieved for a given year. Mandatory.  
        public int StartIndex;                // The index of the first record to be retrieved. Mandatory.  
        public int Count;                     // The number of records to be retrieved. Mandatory.  
        public DeclarationSummary VatReturn;  // List of returns.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/declarations.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.34209)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/GetRangeOfSummariesByDeclarationYear"  
    Host: <cluster>.twinfield.com  
    Content-Length: 491  
    Expect: 100-continue  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/">  
        <soapenv:Header>  
            <twin:Header>  
                <twin:AccessToken>ACCESS_TOKEN_HERE</twin:AccessToken>  
                <twin:CompanyCode>001</twin:CompanyCode>  
            </twin:Header>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:GetRangeOfSummariesByDeclarationYear>  
                <twin:companyCode>001</twin:companyCode>  
                <twin:declarationYear>2025</twin:declarationYear>  
                <twin:startIndex>1</twin:startIndex>  
                <twin:count>2</twin:count>  
            </twin:GetRangeOfSummariesByDeclarationYear>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### GetRangeOfSummariesByDeclarationYearAndSinceModified​

  * Query
  * Raw envelope


    
    
    public class GetRangeOfSummariesByDeclarationYearAndSinceModified : MessageOfLoadMessage  
    {  
        public string CompanyCode;            // The code of the office for which the returns should be retrieved. Asterisk (*) can be used as the code to get the returns of all the companies in an organisation which is accessible by user. Mandatory.  
        public int DeclarationYear;           // The declarations are retrieved for a given year. Mandatory.  
        public int StartIndex;                // The index of the first record to be retrieved. Mandatory.  
        public int Count;                     // The number of records to be retrieved. Mandatory.  
        public DateTime modifiedSince         // If provided, it returns the declarations which are modified/generated on and after the specified timestamp. Mandatory.  
        public DeclarationSummary VatReturn;  // List of returns.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/declarations.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.34209)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/GetRangeOfSummariesByDeclarationYearAndSinceModified"  
    Host: <cluster>.twinfield.com  
    Content-Length: 491  
    Expect: 100-continue  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/">  
        <soapenv:Header>  
            <twin:Header>  
                <twin:AccessToken>ACCESS_TOKEN_HERE</twin:AccessToken>  
                <twin:CompanyCode>001</twin:CompanyCode>  
            </twin:Header>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:GetRangeOfSummariesByDeclarationYearAndSinceModified>  
                <twin:companyCode>001</twin:companyCode>  
                <twin:declarationYear>2025</twin:declarationYear>  
                <twin:startIndex>1</twin:startIndex>  
                <twin:count>2</twin:count>  
                <twin:modifiedSince>2025-05-30T10:48:15.213Z</twin:modifiedSince>  
            </twin:GetRangeOfSummariesByDeclarationYearAndSinceModified>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### GetNumberOfDeclarations​

  * Query


    
    
    public class GetNumberOfDeclarations : MessageOfLoadMessage  
    {  
        public string CompanyCode;           // The code of the office for which the returns should be retrieved. Mandatory.  
        public int NumberOfVatReturns;       // The number of returns.  
    }  
    

### GetVatReturnAsXbrl​

  * Query
  * Raw envelope


    
    
    public class GetVatReturnAsXbrl : MessageOfLoadMessage  
    {  
        public int DocumentId;               // Id of the document to be retrieved. Mandatory.  
        public bool IsMessageIdRequired;     // If set to True the MessageReferenceSupplierVAT element will be filled in. If set to False it will be left empty. Mandatory.  
        public XmlNode VatReturn;            // The VAT return in XBRL format.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/declarations.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.34209)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/GetVatReturnAsXbrl"  
    Host: <cluster>.twinfield.com  
    Content-Length: 535  
    Expect: 100-continue  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/">  
        <soapenv:Header>  
            <twin:Header>  
                <twin:AccessToken>9c19e935ae213d9aa36ca2dd44529f14</twin:AccessToken>  
                <twin:CompanyCode>001</twin:CompanyCode>  
            </twin:Header>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:GetVatReturnAsXbrl>  
                <twin:documentId>2909</twin:documentId>  
                <twin:isMessageIdRequired>false</twin:isMessageIdRequired>  
            </twin:GetVatReturnAsXbrl>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### GetVatReturnAsXml​

  * Query


    
    
    public class GetVatReturnAsXml : MessageOfLoadMessage  
    {  
        public int DocumentId;               // Id of the document to be retrieved. Mandatory.  
        public XmlNode VatReturn;            // The VAT return in XML format.  
    }  
    

### GetVatReturnPaymentReference​

  * Query


    
    
    public class GetVatReturnPaymentReference : MessageOfLoadMessage  
    {  
        public int DocumentId;               // Id of the document to be retrieved. Mandatory.  
        public string PaymentReference;      // The payment reference.  
    }  
    

### GetIctReturnAsXbrl​

  * Query


    
    
    public class GetIctReturnAsXbrl : MessageOfLoadMessage  
    {  
        public int DocumentId;               // Id of the document to be retrieved. Mandatory.  
        public bool IsMessageIdRequired;     // If set to True the MessageReferenceSupplierICT element will be filled in. If set to False it will be left empty. Mandatory.  
        public XmlNode VatReturn;            // The ICT return in XBRL format.  
    }  
    

### GetIctReturnAsXml​

  * Query


    
    
    public class GetIctReturnAsXml : MessageOfLoadMessage  
    {  
        public int DocumentId;               // Id of the document to be retrieved. Mandatory.  
        public XmlNode VatReturn;            // The ICT return in XML format.  
    }  
    

### GetTaxGroupVatReturnAsXbrl​

  * Query


    
    
    public class GetTaxGroupVatReturnAsXbrl : MessageOfLoadMessage  
    {  
        public int DocumentId;               // Id of the document to be retrieved. Mandatory.  
        public bool IsMessageIdRequired;     // If set to True the MessageReferenceSupplierVAT element will be filled in. If set to False it will be left empty. Mandatory.  
        public XmlNode VatReturn;            // The VAT return in XBRL format.  
    }  
    

### GetTaxGroupVatReturnAsXml​

  * Query


    
    
    public class GetTaxGroupVatReturnAsXml : MessageOfLoadMessage  
    {  
        public int DocumentId;               // Id of the document to be retrieved. Mandatory.  
        public XmlNode VatReturn;            // The VAT return in XML format.  
    }  
    

### GetTaxGroupVatReturnPaymentReference​

  * Query


    
    
    public class GetTaxGroupVatReturnPaymentReference : MessageOfLoadMessage  
    {  
        public int DocumentId;               // Id of the document to be retrieved. Mandatory.  
        public string PaymentReference;      // The payment reference.  
    }  
    
