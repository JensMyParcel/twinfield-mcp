  * [](/documentation/)
  * Master Data
  * Bank book



On this page

# Bank book

## General​

Web service type: [Command & Query Web Services](/documentation/api/types/command-and-query-webservices)

Resource location: `/webservices/BankBookService.svc?wsdl`

## Commands​

### CreateBankBook​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class BankBookCommand : Command  
    {  
        public String Code;                     // Code of the bank book to be created.  
    }  
      
    public class CreateBankBook : BankBookCommand  
    {  
        public String Name;                     // The name of the bank book.  
        public BankAccount[] BankAccount;       // Information about the bank account.  
        public String GeneralLedgerAccount;     // The bank book general ledger account.  
    }  
      
    public class BankAccount  
    {  
        public String Country;                  // The country code.  
        public String Number;                   // The bank account number.  
        public String Name;                     // The bank account name.  
        public String Iban;                     // The bank IBAN number.  
        public String Bic;                      // The bank BIC code.  
        public String Nbic;                     // The bank NBIC code.  
        public String ReferenceNumber;          // The bank reference number.  
    }  
    
    
    
    public class BankBookServiceFault : Fault  
    {  
        public BankBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum BankBookServiceFaultCode  
    {  
        BankBookInvalidStructure,               // The structure is not correct.  
        BankBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BankBookServiceClient("BasicHttpsBinding_BankBookService", "https://api.<cluster>.twinfield.com/webservices/BankBookService.svc");  
      
        try  
        {  
            var cmd = new CreateBankBook  
            {  
                Code = "BANKBOOK",  
                Name = "Bank book name",  
                GeneralLedgerAccount = "1010"  
                BankAccount = new BankAccount  
                {  
                    Bic = "",  
                    Country = "NL",  
                    Iban = "NL13TEST0123456789",  
                    Name = "Bank book name",  
                    Nbic = "",  
                    Number = "",  
                    ReferenceNumber = ""  
                }  
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
      
            Console.WriteLine("Bank book successfully created.");  
        }  
        catch (FaultException<BankBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to create the bank book:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    

The example below creates a new bank book.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BankBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BankBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 775  
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
            <twin:Command i:type="b:CreateBankBook" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BankBookService">  
                <b:Code>BANKBOOK</b:Code>  
                <b:BankAccount>  
                    <b:Bic/>  
                    <b:Country>NL</b:Country>  
                    <b:Iban>NL13TEST0123456789</b:Iban>  
                    <b:Name>Bank book name</b:Name>  
                    <b:Nbic/>  
                    <b:Number/>  
                    <b:ReferenceNumber/>  
                </b:BankAccount>  
                <b:GeneralLedgerAccount>1010</b:GeneralLedgerAccount>  
                <b:Name>Bank book name</b:Name>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeBankBookName​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class BankBookCommand : Command  
    {  
        public String Code;                     // Code of the bank book to be changed.  
    }  
      
    public class ChangeBankBookName : BankBookCommand  
    {  
        public String Name;                     // The new name of the bank book.  
    }  
    
    
    
    public class BankBookServiceFault : Fault  
    {  
        public BankBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum BankBookServiceFaultCode  
    {  
        BankBookInvalidStructure,               // The structure is not correct.  
        BankBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BankBookServiceClient("BasicHttpsBinding_BankBookService", "https://api.<cluster>.twinfield.com/webservices/BankBookService.svc");  
      
        try  
        {  
            var cmd = new ChangeBankBookName  
            {  
                Code = "BANKBOOK",  
                Name = "Bank book name"  
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
      
            Console.WriteLine("Bank book name successfully updated.");  
        }  
        catch (FaultException<BankBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to update bank book name:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BankBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BankBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 565  
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
            <twin:Command i:type="b:ChangeBankBookName" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BankBookService">  
                <b:Code>BANKBOOK</b:Code>  
                <b:Name>Bank book name</b:Name>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeBankBookShortName​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class BankBookCommand : Command  
    {  
        public String Code;                     // Code of the bank book to be changed.  
    }  
      
    public class ChangeBankBookShortName : BankBookCommand  
    {  
        public String ShortName;                // The new short name of the bank book.  
    }  
    
    
    
    public class BankBookServiceFault : Fault  
    {  
        public BankBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum BankBookServiceFaultCode  
    {  
        BankBookInvalidStructure,               // The structure is not correct.  
        BankBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BankBookServiceClient("BasicHttpsBinding_BankBookService", "https://api.<cluster>.twinfield.com/webservices/BankBookService.svc");  
      
        try  
        {  
            var cmd = new ChangeBankBookShortName  
            {  
                Code = "BANKBOOK",  
                ShortName = "Bank book short name"  
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
      
            Console.WriteLine("Bank book short name successfully updated.");  
        }  
        catch (FaultException<BankBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to update bank book short name:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BankBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BankBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 586  
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
            <twin:Command i:type="b:ChangeBankBookShortName" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BankBookService">  
                <b:Code>BANKBOOK</b:Code>  
                <b:ShortName>Bank book short name</b:ShortName>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeBankBookBankAccount​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class BankBookCommand : Command  
    {  
        public String Code;                     // Code of the bank book to be changed.  
    }  
      
    public class ChangeBankBookBankAccount : BankBookCommand  
    {  
        public BankAccount[] BankAccount;       // Information about the bank account.  
    }  
      
    public class BankAccount  
    {  
        public String Country;                  // The country code.  
        public String Number;                   // The bank account number.  
        public String Name;                     // The bank account name.  
        public String Iban;                     // The bank IBAN number.  
        public String Bic;                      // The bank BIC code.  
        public String Nbic;                     // The bank NBIC code.  
        public String ReferenceNumber;          // The bank reference number.  
    }  
    
    
    
    public class BankBookServiceFault : Fault  
    {  
        public BankBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum BankBookServiceFaultCode  
    {  
        BankBookInvalidStructure,               // The structure is not correct.  
        BankBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BankBookServiceClient("BasicHttpsBinding_BankBookService", "https://api.accounting.twinfield.com/webservices/BankBookService.svc");  
      
        try  
        {  
            var cmd = new ChangeBankBookBankAccount  
            {  
                Code = "BANKBOOK",  
                BankAccount = new BankAccount  
                {  
                    Bic = "",  
                    Country = "NL",  
                    Iban = "NL13TEST0123456789",  
                    Name = "Bank book name",  
                    Nbic = "",  
                    Number = "",  
                    ReferenceNumber = ""  
                }  
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
      
            Console.WriteLine("Bank book account successfully updated.");  
        }  
        catch (FaultException<BankBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to update bank book account:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BankBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BankBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 727  
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
            <twin:Command i:type="b:ChangeBankBookBankAccount" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BankBookService">  
                <b:Code>BANKBOOK</b:Code>  
                <b:BankAccount>  
                    <b:Bic></b:Bic>  
                    <b:Country>NL</b:Country>  
                    <b:Iban>NL13TEST0123456789</b:Iban>  
                    <b:Name>Bank book name</b:Name>  
                    <b:Nbic/>  
                    <b:Number>1</b:Number>  
                    <b:ReferenceNumber/>  
                </b:BankAccount>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeBankBookGeneralLedgerAccount​

  * Command
  * Result
  * Example
  * Raw envelope


    
    
    public abstract class BankBookCommand : Command  
    {  
        public String Code;                     // Code of the bank book to be changed.  
    }  
      
    public class ChangeBankBookGeneralLedgerAccount : BankBookCommand  
    {  
        public String GeneralLedgerAccount;     // The new general ledger account of the bank book.  
    }  
    
    
    
    public class BankBookServiceFault : Fault  
    {  
        public BankBookServiceFaultCode Code;   // The type of error.  
        public string Message;                  // The error message.  
    }  
      
    public enum BankBookServiceFaultCode  
    {  
        BankBookInvalidStructure,               // The structure is not correct.  
        BankBookInvalidBusinessLogic            // The business logic is not correct.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BankBookServiceClient("BasicHttpsBinding_BankBookService", "https://api.<cluster>.twinfield.com/webservices/BankBookService.svc");  
      
        try  
        {  
            var cmd = new ChangeBankBookGeneralLedgerAccount  
            {  
                Code = "BANKBOOK",  
                GeneralLedgerAccount = "1011"  
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
      
            Console.WriteLine("Bank book general ledger account successfully updated.");  
        }  
        catch (FaultException<BankBookServiceFault> ex)  
        {  
            Console.WriteLine("Failed to update bank book general ledger account:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BankBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BankBookService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 603  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/" xmlns:twin1="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared">  
        <soapenv:Header>  
            <twin:Authentication>  
                <twin1:AccessToken>2b128baa05dd3cabc61e534435884961</twin1:AccessToken>  
                <twin1:CompanyCode>001</twin1:CompanyCode>  
            </twin:Authentication>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:Command i:type="b:ChangeBankBookGeneralLedgerAccount" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BankBookService">  
                <b:Code>BANKBOOK</b:Code>  
                <b:GeneralLedgerAccount>1011</b:GeneralLedgerAccount>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

## Queries​

### GetBankBook​

  * Query
  * Result
  * Example
  * Raw envelope


    
    
    public class GetBankBook : Query  
    {  
        public String Code;                     // Code of the bank book to be retrieved.  
    }  
    
    
    
    public class GetBankBookResult : QueryResult  
    {  
        public String Name;                                              // The name of the bank book.  
        public String ShortName;                                         // The short name of the bank book.  
        public String GeneralLedgerAccount;                              // The bank book general ledger account.  
        public BankAccount[] BankAccount;                                // Information about the bank account.  
        public AutomaticBankProcessing[] AutomaticBankProcessing;        // Information about the automatic bank processing.  
    }  
      
    public class BankAccount  
    {  
        public String Country;                                           // The country code.  
        public String Number;                                            // The bank account number.  
        public String Name;                                              // The bank account name.  
        public String Iban;                                              // The bank IBAN number.  
        public String Bic;                                               // The bank BIC code.  
        public String Nbic;                                              // The bank NBIC code.  
        public String ReferenceNumber;                                   // The bank reference number.  
    }  
    
    
    
    public class AutomaticBankProcessing  
    {  
        public String AutomaticBankProcessingSignUpState[] SignUpState;  // The signup state of the bank book.  
        public Boolean ProcessStatements;                                // Are bank statements automatically processed?  
        public Boolean ProcessDirectDebits;                              // Are direct debit automatically processed?  
        public Boolean ProcessPayments;                                  // Are payments automatically processed?  
    }  
      
    public enum AutomaticBankProcessingSignUpState  
    {  
        Inactive,                                                        // The signup is inactive.  
        Pending,                                                         // The signup is pending.  
        Active                                                           // The signup is active.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BankBookServiceClient("BasicHttpsBinding_BankBookService", "https://api.<cluster>.twinfield.com/webservices/BankBookService.svc");  
      
        var query = new GetBankBook {Code = "BANKBOOK"};  
        var queryResponse = client.Query(new QueryRequest()  
        {  
            Authentication = new AuthenticationHeader()  
            {  
                AccessToken = "2b128baa05dd3cabc61e534435884961",  
                CompanyCode = "001"  
            },  
            Query = query  
        });  
        var result = (GetBankBookResult) queryResponse.Result;  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BankBookService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BankBookService/Query"  
    Host: <cluster>.twinfield.com  
    Content-Length: 518  
    Expect: 100-continue  
    Accept-Encoding: gzip, deflate  
    Connection: Keep-Alive  
    
    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/" xmlns:twin1="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.Shared">  
        <soapenv:Header>  
            <twin:Authentication>  
                <twin1:AccessToken>2b128baa05dd3cabc61e534435884961</twin1:AccessToken>  
                <twin1:CompanyCode>001</twin1:CompanyCode>  
            </twin:Authentication>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:Query i:type="b:GetBankBook" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BankBookService">  
                <b:Code>BANKBOOK</b:Code>  
            </twin:Query>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    
