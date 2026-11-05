  * [](/documentation/)
  * Master Data
  * Offices



On this page

# Offices

## List​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​
    
    
    <list>  
        <type>offices</type>  
    </list>  
    

### C#​
    
    
    var processXml = new TwinfieldProcessXml.ProcessXml();  
    processXml.HeaderValue = new TwinfieldSession.Header()  
    {  
        AccessToken = "2b128baa05dd3cabc61e534435884961",  
    };  
      
    var xmlRequest = "<list><type>offices</type></list>";  
    string xmlResult = processXml.ProcessXmlString(xmlRequest);  
    

### Raw envelope​

#### Request​
    
    
    <?xml version="1.0" encoding="utf-16"?>  
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  
        <soap:Header>  
            <Header xmlns="http://www.twinfield.com/">  
                <AccessToken>2b128baa05dd3cabc61e534435884961</AccessToken>  
            </Header>  
        </soap:Header>  
        <soap:Body>  
            <ProcessXmlString xmlns="http://www.twinfield.com/">  
                <xmlRequest><![CDATA[<list><type>offices</type></list>]]></xmlRequest>  
            </ProcessXmlString>  
        </soap:Body>  
    </soap:Envelope>  
    

## Find​

Web service type: Method driven

Resource location: `/webservices/finder.asmx?wsdl`

### Method​
    
    
    public Message[] Search(  
    	string type, // Finder type, See Finder type.  
    	string pattern, // The search pattern. May contain wildcards * and ?  
    	int field, // Fields to search through, see Search fields.  
    	int firstRow, // First row to return, usefull for paging  
    	int maxRows, // Maximum number of rows to return, usefull for paging  
    	string[][] options, // See options below  
    	out FinderData data) // Search results  
    

### Finder type​

OFF

### Search fields​

Field ID| Fields searched  
---|---  
0| code and name  
1| code  
2| name  
  
The method will return an array containing validation messages. If there are no errors, then the data parameter will contain the actual search result.

### Options

Option| Type| Description  
---|---|---  
withouttaxgroup| enumeration: `0` (default), `1`| If enabled only gets offices that are not part of a tax group, are no template office and don't have any vat declarations in progress.  
includeid| enumeration: `0` (default), `1`| If enabled (`1`), the results will include a (company) id column.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the office settings for office 001.
    
    
    <read>  
        <type>office</type>  
        <code>001</code>  
    </read>  
    
