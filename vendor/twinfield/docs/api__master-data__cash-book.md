  * [](/documentation/)
  * Master Data
  * Cash book



On this page

# Cash book

## General​

Web service type: [Command & Query Web Services](/documentation/api/types/command-and-query-webservices)

Resource location: `/webservices/CashBookService.svc?wsdl`

## Commands​

### CreateCashBook​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class CashBookCommand : Command  
    {  
        public String Code;                     // Code of the cash book to be created.  
    }  
      
    public class CreateCashBook : CashBookCommand  
    {  
        public String Name;                     // The name of the cash book.  
        public String GeneralLedgerAccount;     // The cash book general ledger account.  
    }  
    
    
    
    public class CashBookServiceFault : Fault  
    {  
        public CashBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum CashBookServiceFaultCode  
    {  
        CashBookInvalidStructure,               // The structure is not correct.  
        CashBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new CashBookServiceClient("BasicHttpsBinding_CashBookService", "https://api.<cluster>.twinfield.com/webservices/CashBookService.svc");  
      
        try  
        {  
            var cmd = new CreateCashBook  
            {  
                Code = "CASHBOOK",  
                Name = "Cash book name",  
                GeneralLedgerAccount = "1000"  
            };  
            client.Process(new CommandRequest()  
            {  
                Authentication = new AuthenticationHeader()  
                {  
                    AccessToken = "2b128baa05dd3cabc61e534435884961",  
                    CompanyCode = "001"  
                },  
                Command = cmd  
            });  
      
            Console.WriteLine("Cash book successfully created.");  
        }  
        catch (FaultException<CashBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to create the cash book:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    

The example below creates a new cash book.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/CashBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/CashBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 542  
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
            <twin:Command i:type="a:CreateCashBook" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.CashBookService">  
                <a:Code>CASHBOOK</a:Code>  
                <a:GeneralLedgerAccount>1000</a:GeneralLedgerAccount>  
                <a:Name>Cash book name</a:Name>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeCashBookName​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class CashBookCommand : Command  
    {  
        public String Code;                     // Code of the cash book to be changed.  
    }  
      
    public class ChangeCashBookName : CashBookCommand  
    {  
        public String Name;                     // The new name of the cash book.  
    }  
    
    
    
    public class CashBookServiceFault : Fault  
    {  
        public CashBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum CashBookServiceFaultCode  
    {  
        CashBookInvalidStructure,               // The structure is not correct.  
        CashBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new CashBookServiceClient("BasicHttpsBinding_CashBookService", "https://api.<cluster>.twinfield.com/webservices/CashBookService.svc");  
      
        try  
        {  
            var cmd = new ChangeCashBookName  
            {  
                Code = "CASHBOOK",  
                Name = "Cash book name"  
            };  
            client.Process(new CommandRequest()  
            {  
                Authentication = new AuthenticationHeader()  
                {  
                    AccessToken = "2b128baa05dd3cabc61e534435884961",  
                    CompanyCode = "001"  
                },  
                Command = cmd  
            });  
      
            Console.WriteLine("Cash book name successfully updated.");  
        }  
        catch (FaultException<CashBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to update cash book name:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/CashBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/CashBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 493  
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
            <twin:Command i:type="a:ChangeCashBookName" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.CashBookService">  
                <a:Code>CASHBOOK</a:Code>  
                <a:Name>Cash book name</a:Name>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeCashBookShortName​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class CashBookCommand : Command  
    {  
        public String Code;                     // Code of the cash book to be changed.  
    }  
      
    public class ChangeCashBookShortName : CashBookCommand  
    {  
        public String ShortName;                // The new short name of the cash book.  
    }  
    
    
    
    public class CashBookServiceFault : Fault  
    {  
        public CashBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum CashBookServiceFaultCode  
    {  
        CashBookInvalidStructure,               // The structure is not correct.  
        CashBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new CashBookServiceClient("BasicHttpsBinding_CashBookService", "https://api.<cluster>.twinfield.com/webservices/CashBookService.svc");  
      
        try  
        {  
            var cmd = new ChangeCashBookShortName  
            {  
                Code = "CASHBOOK",  
                ShortName = "Cash book short name"  
            };  
            client.Process(new CommandRequest()  
            {  
                Authentication = new AuthenticationHeader()  
                {  
                    AccessToken = "2b128baa05dd3cabc61e534435884961",  
                    CompanyCode = "001"  
                },  
                Command = cmd  
            });  
      
            Console.WriteLine("Cash book short name successfully updated.");  
        }  
        catch (FaultException<CashBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to update cash book short name:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/CashBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/CashBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 514  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/" xmlns:twin1="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared">  
        <soapenv:Header>  
            <twin:Authentication>  
                <twin1:AccessToken>9c19e935ae213d9aa36ca2dd44529f14</twin1:AccessToken>  
                <twin1:CompanyCode>001</twin1:CompanyCode>  
            </twin:Authentication>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:Command i:type="a:ChangeCashBookShortName" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.CashBookService">  
                <a:Code>CASHBOOK</a:Code>  
                <a:ShortName>Cash book short name</a:ShortName>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeCashBookGeneralLedgerAccount​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class CashBookCommand : Command  
    {  
        public String Code;                     // Code of the cash book to be changed.  
    }  
      
    public class ChangeCashBookGeneralLedgerAccount : CashBookCommand  
    {  
        public String GeneralLedgerAccount;     // The new general ledger account of the cash book.  
    }  
    
    
    
    public class CashBookServiceFault : Fault  
    {  
        public CashBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum CashBookServiceFaultCode  
    {  
        CashBookInvalidStructure,               // The structure is not correct.  
        CashBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new CashBookServiceClient("BasicHttpsBinding_CashBookService", "https://api.<cluster>.twinfield.com/webservices/CashBookService.svc");  
      
        try  
        {  
            var cmd = new ChangeCashBookGeneralLedgerAccount  
            {  
                Code = "CASHBOOK",  
                GeneralLedgerAccount = "1001"  
            };  
            client.Process(new CommandRequest()  
            {  
                Authentication = new AuthenticationHeader()  
                {  
                    AccessToken = "2b128baa05dd3cabc61e534435884961",  
                    CompanyCode = "001"  
                },  
                Command = cmd  
            });  
      
            Console.WriteLine("Cash book general ledger account successfully updated.");  
        }  
        catch (FaultException<CashBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to update cash book general ledger account:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/CashBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/CashBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 531  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/" xmlns:twin1="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared">  
        <soapenv:Header>  
            <twin:Authentication>  
                <twin1:AccessToken>9c19e935ae213d9aa36ca2dd44529f14</twin1:AccessToken>  
                <twin1:CompanyCode>001</twin1:CompanyCode>  
            </twin:Authentication>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:Command i:type="a:ChangeCashBookGeneralLedgerAccount" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.CashBookService">  
                <a:Code>CASHBOOK</a:Code>  
                <a:GeneralLedgerAccount>1001</a:GeneralLedgerAccount>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

## Queries​

### GetCashBook​

  * Query
  * Result
  * Example
  * Raw envelope


    
    
    public class GetCashBook : Query  
    {  
        public String Code;                     // Code of the cash book to be retrieved.  
    }  
    
    
    
    public class GetCashBookResult : QueryResult  
    {  
        public String Name;                     // The name of the cash book.  
        public String ShortName;                // The short name of the cash book.  
        public String GeneralLedgerAccount;     // The cash book general ledger account.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new CashBookServiceClient("BasicHttpsBinding_CashBookService", "https://api.<cluster>.twinfield.com/webservices/CashBookService.svc");  
      
        var query = new GetCashBook {Code = "CASHBOOK"};  
      
        var queryResponse = client.Query(new QueryRequest()  
        {  
            Authentication = new AuthenticationHeader()  
            {  
                AccessToken = "2b128baa05dd3cabc61e534435884961",  
                CompanyCompany = "001"  
            },  
            Query = query  
        });  
        var result = (GetCashBookResult) queryResponse.Result;  
      
        Console.WriteLine("Name: {0}", result.Name);  
        Console.WriteLine("Short name: {0}", result.ShortName);  
        Console.WriteLine("General ledger account: {0}", result.GeneralLedgerAccount);  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/CashBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/CashBookService/Query"  
    Host: <cluster>.twinfield.com  
    Content-Length: 451  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/" xmlns:twin1="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared">  
        <soapenv:Header>  
            <twin:Authentication>  
                <twin1:AccessToken>9c19e935ae213d9aa36ca2dd44529f14</twin1:AccessToken>  
                <twin1:CompanyCode>001</twin1:Companycode>  
            </twin:Authentication>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:Query i:type="a:GetCashBook" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.CashBookService">  
                <a:Code>CASHBOOK</a:Code>  
            </twin:Query>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    
