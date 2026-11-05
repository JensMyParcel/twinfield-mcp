  * [](/documentation/)
  * Miscellaneous
  * Periods



On this page

# Periods

## General​

Web service type: [Command & Query Web Services](/documentation/api/types/command-and-query-webservices)

Resource location: `/webservices/PeriodService.svc?wsdl`

## General data contracts​

  * Query


    
    
    public class PeriodServiceFault : Fault  
    {  
        public PeriodServiceFaultCode Code  
        public String Message  
    }  
      
    public enum PeriodServiceFaultCode  
    {  
        YearNotFound,  
        PeriodNotFound,  
        YearCanNotBeDeleted,  
        InvalidNumberOfPeriods,  
        YearCanNotBeCreated,  
        EndDateCanNotBeChanged,  
        NameCanNotBeChanged,  
        PeriodCanNotBeOpened,  
        PeriodCanNotBeClosed  
    }  
    

## Commands​

### CreateYear​

  * Command
  * Raw envelope


    
    
    public class CreateYear : Command  
    {  
        public int NumberOfPeriods;  // Number of periods to be created for the new year. Mandatory.  
    }  
    

The example below creates a new year containing 12 periods.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Process"  
    Host: api.<cluster>.twinfield.com  
    Content-Length: 468  
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
            <twin:Command i:type="a:CreateYear" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService">  
                <a:NumberOfPeriods>12</a:NumberOfPeriods>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeEndDate​

  * Command
  * Raw envelope


    
    
    public class ChangeEndDate : Command  
    {  
        public int Year;          // Year of the period that should be changed. Mandatory.  
        public int PeriodNumber;  // The period that should be changed. Mandatory.  
        public DateTime EndDate;  // The new end date of the given period. Mandatory.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 534  
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
            <twin:Command i:type="a:ChangeEndDate" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService">  
                <a:EndDate>2021-02-13T00:00:00</a:EndDate>  
                <a:PeriodNumber>02</a:PeriodNumber>  
                <a:Year>2021</a:Year>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ChangeName​

  * Command
  * Example
  * Raw envelope


    
    
    public class ChangeName : Command  
    {  
        public int Year;          // Year of the period that should be changed. Mandatory.  
        public int PeriodNumber;  // The period that should be changed. Mandatory.  
        public string Name;       // The new name of the given period. Mandatory.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new PeriodServiceClient("BasicHttpsBinding_PeriodService",  
            "https://api.<cluster>.twinfield.com/webservices/PeriodService.svc");  
      
        try  
        {  
            var cmd = new ChangeName  
            {  
                Year = 2021,  
                PeriodNumber = 2,  
                Name = "February 2021"  
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
      
            Console.WriteLine("Period name successfully updated.");  
        }  
        catch (FaultException<periodservicefault> ex)  
        {  
            Console.WriteLine("Failed to update period name:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 504  
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
            <twin:Command i:type="a:ChangeName" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService">  
                <a:Name>February 2021</a:Name>  
                <a:PeriodNumber>2</a:PeriodNumber>  
                <a:Year>2021</a:Year>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### OpenPeriod​

  * Command
  * Raw envelope


    
    
    public class OpenPeriod : Command  
    {  
        public int Year;          // Year of the period that should be opened. Mandatory.  
        public int PeriodNumber;  // The period that should be opened. Mandatory.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 483  
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
            <twin:Command i:type="a:OpenPeriod" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService">  
                <a:PeriodNumber>2</a:PeriodNumber>  
                <a:Year>2021</a:Year>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ClosePeriod​

  * Command
  * Raw envelope


    
    
    public class ClosePeriod : Command  
    {  
        public int Year;          // Year of the period that should be closed. Mandatory.  
        public int PeriodNumber;  // The period that should be closed. Mandatory.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 484  
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
            <twin:Command i:type="a:ClosePeriod" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService">  
                <a:PeriodNumber>2</a:PeriodNumber>  
                <a:Year>2021</a:Year>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### ResetYears​

  * Command
  * Raw envelope


    
    
    public class ResetYears : Command  
    {  
        public int NewYear;             // First year to be created. All previous years will be deleted. Mandatory.  
        public int NewNumberOfPeriods;  // Number of periods to be created. Mandatory.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 501  
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
            <twin:Command i:type="a:ResetYears" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService">  
                <a:NewNumberOfPeriods>12</a:NewNumberOfPeriods>  
                <a:NewYear>2021</a:NewYear>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### DeleteYear​

  * Command
  * Raw envelope


    
    
    public class DeleteYear : Command  
    {  
        public int Year;  // Year to be deleted. Mandatory.  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Process"  
    Host: <cluster>.twinfield.com  
    Content-Length: 448  
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
            <twin:Command i:type="a:DeleteYear" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService">  
                <a:Year>2021</a:Year>  
            </twin:Command>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

## Queries​

### GetYears​

  * Query
  * Result
  * Raw envelope


    
    
    public class GetYears : Query  
    {}  
    
    
    
    public class GetYearsResult : QueryResult  
    {  
        public int Years;  // Array of all years as a result of the query.  
    }  
    

The example below gets all years of the current company.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Query"  
    Host: <cluster>.twinfield.com  
    Content-Length: 414  
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
            <twin:Query i:type="a:GetYears" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService"/>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### GetPeriods​

  * Query
  * Result
  * Example
  * Raw envelope


    
    
    public class GetPeriods : Query  
    {  
        public int Year;  // The year for which the periods should be read. Mandatory.  
    }  
    
    
    
    public class GetPeriodsResult : QueryResult  
    {  
        public Period[] Periods;  // Array of all periods as a result of the query.  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new PeriodServiceClient("BasicHttpsBinding_PeriodService",  
            "https://api.<cluster>.twinfield.com/webservices/PeriodService.svc");  
      
        try  
        {  
            var query = new GetPeriods {Year = 2012};  
            var queryResponse = client.Query(new QueryRequest()  
            {  
                Authentication = new AuthenticationHeader()  
                {  
                    AccessToken = "2b128baa05dd3cabc61e534435884961",  
                    CompanyCode = "001"  
                },  
                Query = query  
            });  
      
            var result = (GetPeriodsResult) queryResponse.Result;  
      
            foreach (var period in result)  
            {  
                Console.WriteLine("Period number: {0}", period.Period);  
                Console.WriteLine("Period name: {0}", period.Name);  
                Console.WriteLine("Period is open: {0}", period.IsOpen ? "Yes" : "No");  
                Console.WriteLine("Period end date: {0}", period.EndDate.Date.ToLongDateString());  
            }  
        }  
        catch (FaultException ex)  
        {  
            Console.WriteLine("Failed to update period name:");  
            Console.WriteLine("Code: {0}", ex.Fault.Code);  
            Console.WriteLine("Message: {0}", ex.Fault.Message);  
        }  
    }  
    

The example below gets all periods of a given year.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/PeriodService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/PeriodService/Query"  
    Host: <cluster>.twinfield.com  
    Content-Length: 444  
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
            <twin:Query i:type="a:GetPeriods" xmlns="http://www.twinfield.com/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.PeriodService">  
                <a:Year>2021</a:Year>  
            </twin:Query>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    
