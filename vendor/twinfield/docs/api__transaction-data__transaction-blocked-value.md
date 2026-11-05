  * [](/documentation/)
  * Transaction Data
  * Transaction blocked value



On this page

# Transaction blocked value

## General​

Web service type: [Command & Query Web Services](/documentation/api/types/command-and-query-webservices)

Resource location: `/webservices/TransactionBlockedValueService.svc?wsdl`

## General data contracts​
    
    
    public class TransactionBlockedValueServiceFault : Fault  
    {  
        public TransactionBlockedValueServiceFaultCode Code  
        public String Message  
    }  
    
    
    
    public enum TransactionBlockedValueServiceFaultCode  
    {  
        BlockedValueCannotBeRegistered,  
        BlockedValueCannotBeUnregistered  
    }  
    

## Commands​

### RegisterBlockedAmountForTransaction​

  * Command
  * Example
  * Raw envelope


    
    
    public class RegisterBlockedAmountForTransaction : Command  
    {  
        public string CompanyCode;        // The Company code. Mandatory.  
        public string TransactionCode;    // Transaction type. Mandatory.  
        public decimal TransactionNumber; // Transaction number. Mandatory.  
        public int TransactionLineId;     // Transaction line id. Mandatory.  
        public decimal BlockedValue       // Blocked value to associate with transaction. Mandatory.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new TransactionBlockedValueServiceClient("BasicHttpsBinding_TransactionBlockedValueService",  
            "https://api.<cluster>.twinfield.com/webservices/TransactionBlockedValueService.svc");  
        try  
        {  
            var command = new RegisterBlockedAmountForTransaction  
            {  
                CompanyCode = "001",  
                TransactionCode = "MEMO",  
                TransactionNumber = 202100001,  
                TransactionLineId = 1,  
                BlockedValue = 2000.00  
            };  
            client.Process(new CommandRequest()  
            {  
                Authentication = new AuthenticationHeader()  
                {  
                    AccessToken = "2b128baa05dd3cabc61e534435884961",  
                    CompanyCode = "001"  
                },  
                Command = command  
            });  
      
            Console.WriteLine("Blocked value successfully registered.");  
        }  
        catch (FaultException<TransactionBlockedValueServiceFault> ex)  
        {  
            Console.WriteLine("Failed to register blocked value:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    

The example below associates blocked value of 2000.00 with specific detail line of memorial transaction.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/TransactionBlockedValueService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/TransactionBlockedValueService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 1173  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    Connection: Keep-Alive  
    
    
    
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">  
        <s:Header>  
            <h:AccessToken xmlns:h="http://www.twinfield.com/">"3549046660b3cc6a357ab94230148942"</h:AccessToken>  
            <h:CompanyCode xmlns:h="http://www.twinfield.com/">"001"</h:CompanyCode>  
        </s:Header>  
        <s:Body>  
            <Command xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.TransactionBlockedValueService" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" i:type="b:RegisterBlockedAmountForTransaction">  
                <b:CompanyCode>001</b:CompanyCode>  
                <b:TransactionCode>MEMO</b:TransactionCode>  
                <b:TransactionNumber>202100001</b:TransactionNumber>  
                <b:TransactionLineId>1</b:TransactionLineId>  
                <b:BlockedValue>2000.00</b:BlockedValue>  
            </Command>  
        </s:Body>  
    </s:Envelope>  
    

### UnregisterBlockedAmountForTransaction​

  * Command
  * Example
  * Raw envelope


    
    
    public class UnregisterBlockedAmountForTransaction : Command  
    {  
        public string CompanyCode;        // The Company code. Mandatory.  
        public string TransactionCode;    // Transaction type. Mandatory.  
        public decimal TransactionNumber; // Transaction number. Mandatory.  
        public int TransactionLineId;     // Transaction line id. Mandatory.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new TransactionBlockedValueServiceClient("BasicHttpsBinding_TransactionBlockedValueService",  
            "https://api.<cluster>.twinfield.com/webservices/TransactionBlockedValueService.svc");  
        try  
        {  
            var command = new UnregisterBlockedAmountForTransaction  
            {  
                CompanyCode = "001",  
                TransactionCode = "MEMO",  
                TransactionNumber = 202100001,  
                TransactionLineId = 1,  
            };  
            client.Process(new CommandRequest()  
            {  
                Authentication = new AuthenticationHeader()  
                {  
                    AccessToken = "2b128baa05dd3cabc61e534435884961",  
                    CompanyCode = "001"  
                },  
                Command = command  
            });  
      
            Console.WriteLine("Blocked value successfully unregistered.");  
        }  
        catch (FaultException<TransactionBlockedValueServiceFault> ex)  
        {  
            Console.WriteLine("Failed to unregister blocked value:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    

The example below removes association of blocked value with specific detail line of memorial transaction.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/TransactionBlockedValueService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/TransactionBlockedValueService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 1173  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    Connection: Keep-Alive  
    
    
    
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">  
        <s:Header>  
            <h:AccessToken xmlns:h="http://www.twinfield.com/">"3549046660b3cc6a357ab94230148942"</h:AccessToken>  
            <h:CompanyCode xmlns:h="http://www.twinfield.com/">"001"</h:CompanyCode>  
        </s:Header>  
        <s:Body>  
            <Command xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.TransactionBlockedValueService" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" i:type="b:UnregisterBlockedAmountForTransaction">  
                <b:CompanyCode>001</b:CompanyCode>  
                <b:TransactionCode>MEMO</b:TransactionCode>  
                <b:TransactionLineId>1</b:TransactionLineId>  
                <b:TransactionNumber>202100001</b:TransactionNumber>  
            </Command>  
        </s:Body>  
    </s:Envelope>  
    
