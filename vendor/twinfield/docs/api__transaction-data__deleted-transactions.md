  * [](/documentation/)
  * Transaction Data
  * Deleted transactions



On this page

# Deleted transactions

## General​

Web service type: [Command & Query Web Services](/documentation/api/types/command-and-query-webservices)

Resource location: `/webservices/DeletedTransactionsService.svc?wsdl`

## General data contracts​
    
    
    public class DeletedTransactionsServiceFault : Fault  
    {  
        public DeletedTransactionsServiceFaultCode Code  
        public String Message  
    }  
    
    
    
    public enum DeletedTransactionsServiceFaultCode  
    {  
        InvalidCompanyCode,  
        InvalidDaybook,  
        InvalidDates  
    }  
    

## Queries​

### GetDeletedTransactions​

  * Query
  * Result
  * Example
  * Raw envelope


    
    
    public class GetDeletedTransactions : Query  
    {  
        public string CompanyCode;       // The Company code for which the deleted transactions should be read. Mandatory.  
        public string Daybook;           // Deleted daybook (transaction type). Optional.  
        public DateTime? DateFrom;       // The Date from which deleted transactions should be read. Optional.  
        public DateTime? DateTo;         // The Date to which deleted transactions should be read. Optional.  
    }  
    
    
    
    public class GetDeletedTransactionsResult : QueryResult  
    {  
        public DeletedTransaction[] DeletedTransactions; // Array of deleted transactions as a result of the query.  
    }  
    
    
    
    public class DeletedTransaction  
    {  
        public string Daybook;                           // Daybook of transaction  
        public decimal TransactionNumber;                // Number of transaction  
        public DateTime TransactionDate;                 // Date of transaction creation  
        public DateTime DeletionDate;                    // Date when transaction was deleted  
        public string User;                              // User name  
        public string ReasonForDeletion;                 // Description of deletion reason  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new DeletedTransactionsServiceClient("BasicHttpsBinding_DeletedTransactionsService",  
            "https://login.twinfield.com/webservices/DeletedTransactionsService.svc");  
      
        var query = new GetDeletedTransactions  
        {  
            CompanyCode = "001",  
            Daybook = "SomeDaybook",  
            DateFrom = new DateTime(2021, 04, 01),  
            DateTo = new DateTime(2021, 04, 02)  
        };  
        var queryResponse = client.Query(new QueryRequest("264a0c55-622f-4c8d-a603-0a260e1f41da", query));  
        var result = (GetDeletedTransactionsResult) queryResponse.Result;  
      
        foreach (var deletedTransactions in result.DeletedTransactions)  
        {  
            Console.WriteLine("Transaction type: {0}", deletedTransactions.Daybook);  
            Console.WriteLine("Transaction number: {0}", deletedTransactions.TransactionNumber);  
            Console.WriteLine("Transaction date: {0}", deletedTransactions.TransactionDate);  
            Console.WriteLine("Deletion date: {0}", deletedTransactions.DeletionDate);  
            Console.WriteLine("Reason for deletion: {0}", deletedTransactions.ReasonForDeletion);  
            Console.WriteLine("User: {0}", deletedTransactions.User);  
        }  
    }  
    

The example below gets all deleted transactions of a given company code, transaction type and range of removal dates.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/DeletedTransactionsService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/DeletedTransactionsService/Query"  
    Host: <cluster>.twinfield.com  
    Content-Length: 444  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    Connection: Keep-Alive  
    
    
    
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">  
        <s:Header>  
            <h:AccessToken xmlns:h="http://www.twinfield.com/">"3549046660b3cc6a357ab94230148942"</h:AccessToken>  
            <h:CompanyCode xmlns:h="http://www.twinfield.com/">"001"</h:CompanyCode>  
        </s:Header>  
        <s:Body>  
            <Query i:type="a:GetDeletedTransactions" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.DeletedTransactionsService">  
                <b:CompanyCode>001</b:CompanyCode>  
                <b:Daybook>SomeDaybook</b:Daybook>  
                <b:DateFrom>2021-04-01</b:DateFrom>  
                <b:DateTo>2021-04-02</b:DateTo>  
            </Query>  
        </s:Body>  
    </s:Envelope>  
    
