  * [](/documentation/)
  * Master Data
  * Budget



On this page

# Budget

## General​

Web service type: [Command & Query Web Services](/documentation/api/types/command-and-query-webservices)

Resource location: `/webservices/BudgetService.svc?wsdl`

## Queries​

### GetBudgetByProfitAndLoss​

  * Query
  * Result
  * Example
  * Raw envelope


    
    
    public class GetBudgetByProfitAndLoss : Query  
    {  
        public String Code;                     // Code of the budget to be retrieved.  
        public Int Year;                        // Year to be retrieved.  
        public Int PeriodFrom;                  // Start period to be retrieved.  
        public Int PeriodTo;                    // End period to be retrieved.  
        public Bool IncludeProvisional;         // Include provisional transactions.  
        public Bool IncludeFinal;               // Include final transactions.  
        public String Dim1From;                 // General ledger start code.  
        public String Dim1To;                   // General ledger end code.  
        public String Dim2From;                 // Cost center start code.  
        public String Dim2To;                   // Cost center end code.  
        public String Dim3From;                 // Project start code.  
        public String Dim3To;                   // Project end code.  
    }  
    
    
    
    public class GetBudgetTotalsResult : QueryResult  
    {  
        public GetBudgetTotalResult[] BudgetTotals;       // The budget totals retrieved per year per period per general ledger.  
    }  
      
    public class GetBudgetTotalResult  
    {  
        public int Year;                                  // The year  
        public int Period;                                // The period  
        public string Dim1;                               // The general ledger code  
        public string Group1;                             // The first group of the general ledger code  
        public string Group2;                             // The second group of the general ledger code  
        public string Group3;                             // The third group of the general ledger code  
        public string Dim2;                               // The cost center code  
        public string Dim3;                               // The project code  
        public decimal ActualDebit;                       // The actual debit amount  
        public decimal ActualCredit;                      // The actual credit amount  
        public decimal ActualTotal;                       // The actual total amount  
        public decimal BudgetDebit;                       // The budget debit amount  
        public decimal BudgetCredit;                      // The budget credit amount  
        public decimal BudgetTotal;                       // The budget total amount  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BudgetServiceClient("BasicHttpsBinding_BudgetService", "https://api.<cluster>.twinfield.com/webservices/BudgetService.svc");  
      
        var query = new GetBudgetByProfitAndLoss {Code = "001", Year = 2021, PeriodFrom = 0, PeriodTo = 12, IncludeFinal = true, IncludeProvisional = true };  
        var queryResponse = client.Query(new QueryRequest()  
        {  
            Authentication = new AuthenticationHeader()  
            {  
                AccessToken = "2b128baa05dd3cabc61e534435884961",  
                CompanyCode = "001"  
            },  
            Query = query  
        });  
        var result = (GetBudgetTotalsResult) queryResponse.Result;  
      
        Console.WriteLine("Budget totals count: {0}", result.BudgetTotals.Length);  
        Console.WriteLine("                                                     Actual                        Budget            ");  
        Console.WriteLine("Year Period Dim1 Group1 Group2 Group3 Dim2  Dim3      Debit    Credit     Total     Debit    Credit     Total");  
        foreach (var budgetTotal in result.BudgetTotals)  
            Console.WriteLine("{0:0000} {1:00}     {2,-4} {3,4}   {4,5}  {5,5}  {6,-5} {7,-5} {8,9:#0.00} {9,9:#0.00} {10,9:#0.00} {11,9:#0.00} {12,9:#0.00} {13,9:#0.00}",  
                budgetTotal.Year,  
                budgetTotal.Period,  
                budgetTotal.Dim1,  
                budgetTotal.Group1,  
                budgetTotal.Group2,  
                budgetTotal.Group3,  
                budgetTotal.Dim2,  
                budgetTotal.Dim3,  
                budgetTotal.BudgetDebit,  
                budgetTotal.BudgetCredit,  
                budgetTotal.BudgetTotal,  
                budgetTotal.ActualDebit,  
                budgetTotal.ActualCredit,  
                budgetTotal.ActualTotal);  
    }  
    

The example below reads the budgets and actuals for a certain period.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/BudgetService.svc HTTP/1.1  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/BudgetService/Query"  
    Host: <cluster>.twinfield.com  
    Content-Length: 765  
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
            <twin:Query i:type="b:GetBudgetByProfitAndLoss" xmlns="http://www.twinfield.com/" xmlns:a="http://schemas.datacontract.org/2004/07/Twinfield.WebServices" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:b="http://schemas.datacontract.org/2004/07/Twinfield.WebServices.BudgetService">  
                <b:Code>001</b:Code>  
                <b:Dim1From/>  
                <b:Dim1To/>  
                <b:Dim2From/>  
                <b:Dim2To/>  
                <b:Dim3From/>  
                <b:Dim3To/>  
                <b:IncludeFinal>true</b:IncludeFinal>  
                <b:IncludeProvisional>true</b:IncludeProvisional>  
                <b:PeriodFrom>0</b:PeriodFrom>  
                <b:PeriodTo>12</b:PeriodTo>  
                <b:Year>2014</b:Year>  
            </twin:Query>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    

### GetBudgetByCostCenter​

  * Query
  * Result
  * Example


    
    
    public class GetBudgetByCostCenter : Query  
    {  
        public String Code;                // Code of the budget to be retrieved.  
        public Int Year;                   // Year to be retrieved.  
        public Int PeriodFrom;             // Start period to be retrieved.  
        public Int PeriodTo;               // End period to be retrieved.  
        public Bool IncludeProvisional;    // Include provisional transactions.  
        public Bool IncludeFinal;          // Include final transactions.  
        public String Dim1From;            // General ledger start code.  
        public String Dim1To;              // General ledger end code.  
        public String Dim2From;            // Cost center start code.  
        public String Dim2To;              // Cost center end code.  
        public String Dim3From;            // Project start code.  
        public String Dim3To;              // Project end code.  
    }  
    
    
    
    public class GetBudgetTotalsResult : QueryResult  
    {  
        public GetBudgetTotalResult[] BudgetTotals;       // The budget totals retrieved per year per period per general ledger.  
    }  
      
    public class GetBudgetTotalResult  
    {  
        public int Year;                                  // The year  
        public int Period;                                // The period  
        public string Dim1;                               // The general ledger code  
        public string Group1;                             // The first group of the general ledger code  
        public string Group2;                             // The second group of the general ledger code  
        public string Group3;                             // The third group of the general ledger code  
        public string Dim2;                               // The cost center code  
        public string Dim3;                               // The project code  
        public decimal ActualDebit;                       // The actual debit amount  
        public decimal ActualCredit;                      // The actual credit amount  
        public decimal ActualTotal;                       // The actual total amount  
        public decimal BudgetDebit;                       // The budget debit amount  
        public decimal BudgetCredit;                      // The budget credit amount  
        public decimal BudgetTotal;                       // The budget total amount  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BudgetServiceClient("BasicHttpsBinding_BudgetService", "https://api.<cluster>.twinfield.com/webservices/BudgetService.svc");  
      
        var query = new GetBudgetByCostCenter {Code = "001", Year = 2021, PeriodFrom = 0, PeriodTo = 12, IncludeFinal = true, IncludeProvisional = true };  
        var queryResponse = client.Query(new QueryRequest()  
        {  
            Authentication = new AuthenticationHeader()  
            {  
                AccessToken = "2b128baa05dd3cabc61e534435884961",  
                CompanyCode = "001"  
            },  
            Query = query  
        });  
        var result = (GetBudgetTotalsResult) queryResponse.Result;  
      
        Console.WriteLine("Budget totals count: {0}", result.BudgetTotals.Length);  
        Console.WriteLine("                                                     Actual                        Budget            ");  
        Console.WriteLine("Year Period Dim1 Group1 Group2 Group3 Dim2  Dim3      Debit    Credit     Total     Debit    Credit     Total");  
        foreach (var budgetTotal in result.BudgetTotals)  
            Console.WriteLine("{0:0000} {1:00}     {2,-4} {3,4}   {4,5}  {5,5}  {6,-5} {7,-5} {8,9:#0.00} {9,9:#0.00} {10,9:#0.00} {11,9:#0.00} {12,9:#0.00} {13,9:#0.00}",  
                budgetTotal.Year,  
                budgetTotal.Period,  
                budgetTotal.Dim1,  
                budgetTotal.Group1,  
                budgetTotal.Group2,  
                budgetTotal.Group3,  
                budgetTotal.Dim2,  
                budgetTotal.Dim3,  
                budgetTotal.BudgetDebit,  
                budgetTotal.BudgetCredit,  
                budgetTotal.BudgetTotal,  
                budgetTotal.ActualDebit,  
                budgetTotal.ActualCredit,  
                budgetTotal.ActualTotal);  
    }  
    

### GetBudgetByProject​

  * Query
  * Result
  * Example


    
    
    public class GetBudgetByProject : Query  
    {  
        public String Code;                // Code of the budget to be retrieved.  
        public Int Year;                   // Year to be retrieved.  
        public Int PeriodFrom;             // Start period to be retrieved.  
        public Int PeriodTo;               // End period to be retrieved.  
        public Bool IncludeProvisional;    // Include provisional transactions.  
        public Bool IncludeFinal;          // Include final transactions.  
        public String Dim1From;            // General ledger start code.  
        public String Dim1To;              // General ledger end code.  
        public String Dim2From;            // Cost center start code.  
        public String Dim2To;              // Cost center end code.  
        public String Dim3From;            // Project start code.  
        public String Dim3To;              // Project end code.  
    }  
    
    
    
    public class GetBudgetTotalsResult : QueryResult  
    {  
        public GetBudgetTotalResult[] BudgetTotals;       // The budget totals retrieved per year per period per general ledger.  
    }  
      
    public class GetBudgetTotalResult  
    {  
        public int Year;                                  // The year  
        public int Period;                                // The period  
        public string Dim1;                               // The general ledger code  
        public string Group1;                             // The first group of the general ledger code  
        public string Group2;                             // The second group of the general ledger code  
        public string Group3;                             // The third group of the general ledger code  
        public string Dim2;                               // The cost center code  
        public string Dim3;                               // The project code  
        public decimal ActualDebit;                       // The actual debit amount  
        public decimal ActualCredit;                      // The actual credit amount  
        public decimal ActualTotal;                       // The actual total amount  
        public decimal BudgetDebit;                       // The budget debit amount  
        public decimal BudgetCredit;                      // The budget credit amount  
        public decimal BudgetTotal;                       // The budget total amount  
    }  
    
    
    
    public static void Main()  
    {  
        var client = new BudgetServiceClient("BasicHttpsBinding_BudgetService", "https://api.<cluster>.twinfield.com/webservices/BudgetService.svc");  
      
        var query = new GetBudgetByProject {Code = "001", Year = 2021, PeriodFrom = 0, PeriodTo = 12, IncludeFinal = true, IncludeProvisional = true };  
        var queryResponse = client.Query(new QueryRequest()  
        {  
            Authentication = new AuthenticationHeader()  
            {  
                AccessToken = "2b128baa05dd3cabc61e534435884961",  
                CompanyCode = "001"  
            },  
            Query = query  
        });  
        var result = (GetBudgetTotalsResult) queryResponse.Result;  
      
        Console.WriteLine("Budget totals count: {0}", result.BudgetTotals.Length);  
        Console.WriteLine("                                                     Actual                        Budget            ");  
        Console.WriteLine("Year Period Dim1 Group1 Group2 Group3 Dim2  Dim3      Debit    Credit     Total     Debit    Credit     Total");  
        foreach (var budgetTotal in result.BudgetTotals)  
            Console.WriteLine("{0:0000} {1:00}     {2,-4} {3,4}   {4,5}  {5,5}  {6,-5} {7,-5} {8,9:#0.00} {9,9:#0.00} {10,9:#0.00} {11,9:#0.00} {12,9:#0.00} {13,9:#0.00}",  
                budgetTotal.Year,  
                budgetTotal.Period,  
                budgetTotal.Dim1,  
                budgetTotal.Group1,  
                budgetTotal.Group2,  
                budgetTotal.Group3,  
                budgetTotal.Dim2,  
                budgetTotal.Dim3,  
                budgetTotal.BudgetDebit,  
                budgetTotal.BudgetCredit,  
                budgetTotal.BudgetTotal,  
                budgetTotal.ActualDebit,  
                budgetTotal.ActualCredit,  
                budgetTotal.ActualTotal);  
    }  
    
