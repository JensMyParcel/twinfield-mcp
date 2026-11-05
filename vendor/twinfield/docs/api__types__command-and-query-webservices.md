  * [](/documentation/)
  * API Types
  * Command & Query Web Services



On this page

# Command & Query Web Services

## Commands​

Commands are used to alter data.
    
    
    public void Process(CommandRequest request);  
      
    public class CommandRequest : Request  
    {  
        public string SessionId;  
        public AuthenticationHeader Authentication;  
        public Command Command;  
    }  
      
    public class AuthenticationHeader  
    {  
        public string AccessToken;  
        public string CompanyCode;  
    }  
    

info

You can use either Company id or code during the request
    
    
    var request = new CommandRequest()  
    {  
        Authentication = new AuthenticationHeader()  
        {  
            AccessToken = "2b128baa05dd3cabc61e534435884961",  
            CompanyCode = "001"  
        },  
        Command = command  
    };  
    

## Queries​

Queries are used to return data.
    
    
    public QueryResponse Query(QueryRequest request);  
      
    public class QueryRequest : Request  
    {  
        public string SessionId;  
        public AuthenticationHeader Authentication;  
        public Query Query;  
    }  
      
    public class AuthenticationHeader  
    {  
        public string AccessToken;  
        public string CompanyCode;  
    }  
      
    public class QueryResponse  
    {  
        public QueryResult Result;  
    }  
    
    
    
    var request = new QueryRequest()  
    {  
        Authentication = new AuthenticationHeader()  
        {  
            AccessToken = "2b128baa05dd3cabc61e534435884961",  
            CompanyCode = "001"  
        },  
        Query = query  
    };  
    
