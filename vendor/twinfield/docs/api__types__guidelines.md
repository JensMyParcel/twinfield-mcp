  * [](/documentation/)
  * API Types
  * Guidelines



On this page

# Guidelines

## Error handling​

If an authorization error occurs in a web service method call, service will return unauthorized or forbidden response code.
    
    
    354 : Access denied. Token invalid.  
    

If an error occurs in a web service method call, a SOAP exception is raised. The SOAP exception contains a detail Xml document.
    
    
    <detail>  
        <message>Error message</message>  
        <code>100</code>  
        <source>KeepAlive</source>  
    </detail>  
    

The detail information contains the error message. This message is language dependent, therefor the detail information also contains a code value. This makes it possible to take predefined actions on specific error codes. Finally, the source name is included, which contains the name of the called method.

### Error codes​

The following error code are defined:

Code| Description| Response code  
---|---|---  
100| Unexpected exception.| 500  
101| The access token and company id or the session id (obsolete) is missing.| 500  
102| Access is denied.| 403  
103| The log-on credentials are not valid anymore.| 401  
104| The log-on has been deleted.| 403  
105| The log-on has been disabled.| 403  
106| The organisation is no longer active.| 403  
107| SMS failed to send.| 500  
108| Access to this server is not allowed because the cluster is invalid.| 500  
109| You need access to at least one company to log on.| 500  
110| Login is not allowed on this server.| 500  
122| The client software is not allowed.| 500  
168| Another user logged on with your user name. You are logged off now.| 500  
186| TInvalid Zlib data.| 500  
187| Invalid XML data.| 500  
351| Access denied. twf.organisationUserCode claim not found. Please consult the web service documentation to find the required scope.| 401  
352| Access denied. twf.organisationCode claim not found. Please consult the web service documentation to find the required scope.| 403  
353| Access denied. twf.organisationId claim not found. Please consult the web service documentation to find the required scope.| 403  
354| Access denied. Token invalid.| 401  
358| Access denied. Cannot validate token.| 500  
359| Access Denied. Company id is missing in request header.| 500  
360| Bad request. Access token and session id cannot exist at the same time in header.| 500  
361| Bad request. Company Id and Code cannot be present at the same time in header.| 500  
362| Access denied: Company is not supported.| 500  
383| Access denied: Payment format is not supported.| 500  
384| Access denied: Payment format is not supported.| 500  
  
## SOAP web method call sample​

info

You can use either Company id or code during the request. Note that at this moment there is no possibility to get the id of a company. So for the time being, use Company Code.
    
    
    try  
    {  
        var sessionWebService = new TwinfieldSession.Session();  
        sessionWebService.HeaderValue = new TwinfieldSession.Header()  
        {  
            AccessToken = accessToken,  
            CompanyCode = companyCode  
        };  
    }  
    catch (SoapException soapException)  
    {  
        // Get the exception details  
        string message = soapException.Detail.SelectSingleNode("message").InnerText;  
        string code = soapException.Detail.SelectSingleNode("code").InnerText;  
        string source = soapException.Detail.SelectSingleNode("source").InnerText;  
      
        // Print the error.  
        Debug.Print("SOAP Exception: {0}, error code: {1}, error source: {2}", message, code, source);  
    }  
    

## E-mail address validation​

In several XML web service requests, e-mail addresses can be supplied. E-mail addresses are validated based on the following rules.

The local-part accepts:

  * Uppercase and lowercase characters
  * The digits 0 through 9
  * The characters ! # $ % & ' * + - / = ? ^ _ ` { | } ~
  * The character . provided that it is not the first or last character in the local-part



The domain-part accepts:

  * Uppercase and lowercase characters
  * The digits 0 through 9
  * The characters - _
  * The character . provided that it does not follow another . character and it is not the first or last character in the domain-part



Does not accept RFC 2821, RFC 2822 valid addresses like "John Doe"@example.com.<br/>

Does accept invalid addresses like [[email protected]](/cdn-cgi/l/email-protection).

Leading or trailing white space is allowed.
