  * [](/documentation/)
  * Miscellaneous
  * Undo match



# Undo match

## UndoMatch​

Resource location: `https://api.<cluster>.twinfield.com/webservices/matching.asmx?wsdl`

  * Query
  * Result
  * Raw envelope


    
    
    public UndoMatch : MessageOfUndoSetByTypeResult  
    {  
        public String Office;             // The company.  
        public String DimensionType;      // The dimension type of the dimension.  
        public String Dimension;          // The code of the dimension for which the match needs to be made undone.  
        public Int32 MatchNumber;         // The number of the match set that needs to be made undone.  
    }  
    
    
    
    public MessageOfUndoSetByTypeResult  
    {  
        MessageType Type;                      // Type of message.  
        String Text;                           // Content of the message.  
        UndoSetByTypeResult Code;              // Result.  
        String Parameters[];                   // Not in use.  
    }  
      
    public enum MessageType  
    {  
        Error,                                 // Error message.  
        Warning,                               // Warning.  
        Informational                          // Informational message.  
    }  
      
    public enum UndoSetByTypeResult  
    {  
        DimensionNotFoundByType,               // The given dimension can not be found.  
        DimensionDeleted,                      // The given dimension is deleted.  
        DimensionNotFoundByLevel,              // The given dimension can not be found.  
        MatchNotFound,                         // The given matchnumber can not be found.  
        MatchingTransactionsCouldNotBeDeleted  // The matching transaction can not be deleted.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/matching.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.34209)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/UndoMatch"  
    Host: <cluster>.twinfield.com  
    Content-Length: 558  
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
            <twin:UndoMatch>  
                <twin:office>001</twin:office>  
                <twin:dimensionType>DEB</twin:dimensionType>  
                <twin:dimension>1001</twin:dimension>  
                <twin:matchNumber>1</twin:matchNumber>  
            </twin:UndoMatch>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    
