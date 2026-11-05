  * [](/documentation/)
  * API Types
  * XML Web services



On this page

# XML Web services

## Constructing XML​

info

Construct XML using an XML DOM implementation so that all characters are properly escaped. Not properly escaped characters can lead to errors or other unwanted behavior. For .NET it is recommended to use `System.Xml.XmlDocument`.

warning

Do not use comment nodes and/or whitespace(s) between elements in your XML.

warning

Character encoding: use a proper character set like ISO-8859-1, UTF-8 or UTF-16. We recommend UTF-8.
    
    
    var xmlInstruction = new XmlDocument();  
    //...  
    

## Processing XML​

Resource location: `/webservices/processxml.asmx?wsdl`

### List of companies​

When using webservices in combination with access tokens, it is necessary to deliver a company id or company code in the request header. Problem is that the company id or company code is not always known. It is possible to retrieve a list of companies by webservices but again company id or company code is mandatory. To be able to retrieve a list of companies there is one exception. In order to retrieve a list of companies use to ProcessXml webservice without company id or company code in the header. Send the following request:
    
    
    <list><type>offices</type></list>  
    

### ProcessXmlString​

  * Declaration
  * Example
  * Raw envelope


    
    
    ///<returns>Xml result string.</returns>  
    public string ProcessXmlString(string xmlRequest)  
    

The example below returns a list of offices.

C#
    
    
    var processXml = new TwinfieldProcessXml.ProcessXml();  
    processXml.HeaderValue = new TwinfieldSession.Header()  
    {  
        AccessToken = "2b128baa05dd3cabc61e534435884961",  
    };  
      
    //fill the request string.  
    var xmlRequest = "<list><type>offices</type></list>";  
    string xmlResult = processXml.ProcessXmlString(xmlRequest);  
    

  * Request
  * Response


    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/">  
        <soapenv:Header>  
            <twin:Header>  
                <twin:AccessToken>2b128baa05dd3cabc61e534435884961</twin:AccessToken>  
            </twin:Header>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:ProcessXmlString>  
                <twin:xmlRequest><![CDATA[<list><type>offices</type></list>]]></twin:xmlRequest>  
            </twin:ProcessXmlString>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    
    
    
    <?xml version="1.0" encoding="utf-16"?>  
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XmlSchema-instance" xmlns:xsd="http://www.w3.org/2001/XmlSchema">  
        <soap:Body>  
            <ProcessXmlStringResponse xmlns="http://www.twinfield.com/">  
                <ProcessXmlStringResult>  
                    <offices result="1">  
                        <office name="MORE&amp;Zo Services BV" shortname="Services BV">001</office>  
                        <office name="More&amp;Zo Holding" shortname="Holding">010</office>  
                    </offices>  
                </ProcessXmlStringResult>  
            </ProcessXmlStringResponse>  
        </soap:Body>  
    </soap:Envelope>  
    

### ProcessXmlDocument​

warning

Only use ProcessXmlDocument when using .NET.

  * Declaration
  * Example
  * Raw envelope


    
    
    ///<returns>Xml result node.</returns>  
    public XmlNode ProcessXmlDocument(XmlNode xmlRequest);  
    

info

This method uses XmlNode instead of XmlDocument types. See <http://support.microsoft.com/kb/330600> for details.

C#
    
    
    var processXml = new TwinfieldProcessXml.ProcessXml();  
    processXml.HeaderValue = new TwinfieldProcessXml.Header()  
    {  
        AccessToken = "2b128baa05dd3cabc61e534435884961",  
    };  
      
    var requestDocument = new XmlDocument();  
    // ... fill the request document.  
      
    var responseDocument = processXml.ProcessXmlDocument(requestDocument).Document;  
    

The example below returns a list of offices.

  * Request
  * Response


    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/">  
        <soapenv:Header>  
            <twin:Header>  
                <twin:AccessToken>2b128baa05dd3cabc61e534435884961</twin:AccessToken>  
            </twin:Header>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:ProcessXmlDocument>  
                <twin:xmlRequest>  
                    <list xmlns="">  
                        <type>offices</type>  
                    </list>  
                </twin:xmlRequest>  
            </twin:ProcessXmlDocument>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    
    
    
    <?xml version="1.0" encoding="utf-16"?>  
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  
        <soap:Body>  
            <ProcessXmlDocumentResponse xmlns="http://www.twinfield.com/">  
                <ProcessXmlDocumentResult>  
                    <offices result="1" xmlns="">  
                        <office name="MORE&amp;Zo Services BV" shortname="Services BV">001</office>  
                        <office name="More&amp;Zo Holding" shortname="Holding">010</office>  
                    </offices>  
                </ProcessXmlDocumentResult>  
            </ProcessXmlDocumentResponse>  
        </soap:Body>  
    </soap:Envelope>  
    

### ProcessXmlCompressed​

danger

ProcessXmlCompressed is deprecated and will be removed. Read more about its deprecation on the [Breaking Changes](/documentation/getting-started/breaking-changes#processxmlcompressed) page. Use ProcessXmlString or ProcessXmlDocument instead.

Processes and returns zlib compressed UTF-8 XML strings.

  * Declaration
  * Example
  * Raw envelope


    
    
    ///<returns>Byte array containing a G-Zipped Xml String</returns>  
    public byte[] ProcessXmlCompressed(XmlNode xmlRequest);  
    

This example uses the ZLib class which is a wrapper around the zlib class from DotNetZip (<http://www.codeplex.com/DotNetZip>).

C#
    
    
    var processXml = new TwinfieldProcessXml.ProcessXml();  
    processXml.HeaderValue = new TwinfieldProcessXml.Header()  
    {  
        AccessToken = "2b128baa05dd3cabc61e534435884961",  
    };  
      
    var compressedRequest = Zlib.CompressString(xmlRequestString);  
    var compressedResponse = processXml.ProcessXmlCompressed(compressedRequest);  
    var xmlResponseString = Zlib.DecompressString(compressedResponse);  
    

  * Request
  * Response


    
    
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:twin="http://www.twinfield.com/">  
        <soapenv:Header>  
            <twin:Header>  
                <twin:AccessToken>2b128baa05dd3cabc61e534435884961</twin:AccessToken>  
            </twin:Header>  
        </soapenv:Header>  
        <soapenv:Body>  
            <twin:ProcessXmlCompressed>  
                <twin:xmlRequest>eJyzycksLrHjUlBQsCmpLEi1y09Ly0xOLbbRB/O4bPTB8gDwhgyW</twin:xmlRequest>  
            </twin:ProcessXmlCompressed>  
        </soapenv:Body>  
    </soapenv:Envelope>  
    
    
    
    <?xml version="1.0" encoding="utf-16"?>  
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  
        <soap:Body>  
            <ProcessXmlCompressedResponse xmlns="http://www.twinfield.com/">  
                <ProcessXmlCompressedResult></ProcessXmlCompressedResult>  
            </ProcessXmlCompressedResponse>  
        </soap:Body>  
    </soap:Envelope>  
    

## Namespaces​

In order to avoid bad request errors (error code 400) don't use namespace references. Instead, add the namespace reference as an attribute.

### Wrong namespace usage example​
    
    
    <?xml version="1.0" encoding="utf-16"?>  
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XmlSchema-instance" xmlns:tns="http://www.twinfield.com/" xmlns:xsd="http://www.w3.org/2001/XmlSchema">  
        <soap:Header>  
            <Header MyAttribute="" xmlns="http://www.twinfield.com/">  
                <AccessToken>2b128baa05dd3cabc61e534435884961</AccessToken>  
            </Header>  
        </soap:Header>  
        <soap:Body>  
            <tns:ProcessXmlString>  
                <xmlRequest><![CDATA[<list><type>offices</type></list>]]></xmlRequest>  
            </tns:ProcessXmlString>  
        </soap:Body>  
    </soap:Envelope>  
    

### Correct namespace usage example​
    
    
    <?xml version="1.0" encoding="utf-16"?>  
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XmlSchema-instance" xmlns:xsd="http://www.w3.org/2001/XmlSchema">  
        <soap:Header>  
            <Header MyAttribute="" xmlns="http://www.twinfield.com/">  
                <AccessToken>2b128baa05dd3cabc61e534435884961</AccessToken>  
            </Header>  
        </soap:Header>  
        <soap:Body>  
            <ProcessXmlString xmlns="http://www.twinfield.com/">  
                <xmlRequest><![CDATA[<list><type>offices</type></list>]]></xmlRequest>  
            </ProcessXmlString>  
        </soap:Body>  
    </soap:Envelope>  
    

## Bulk processing​

In case of a need to bulk process multiple different entities, like customers and financial transactions, it is possible to group these in one XML instruction using the `<general/>` element to capsulate them.

### Example​

danger

The `<general/>` element is deprecated and will be removed. Read more about its deprecation on the [Breaking Changes](/documentation/getting-started/breaking-changes#general-root-xml-element) page. Use type specific bulk calls instead, for example `<transactions/>` or `<dimensions/>` as a root element.
    
    
    <general>  
        <dimensions>  
            <!-- ... -->  
        </dimensions>  
        <transactions>  
            <!-- ... -->  
        </transactions>  
    </general>  
    

## Parsing results​

Twinfield errors are reported in the form of a `result` attribute on the tags. If a posting is successfully executed, the root-tag of the Xml-Document shows the attribute `result` with value `1`. If a problem occurs during the posting, the problem tag will show the attribute `result` with value `0`. In addition, two extra attributes are shown, namely `msg` with a description of the problem and `msgtype`. The tags which are hierarchically parents of this tag will also have the attribute `result` with value `0` (this also applies to the root-tag).
    
    
    <!-- correct processing of a financial transaction... -->  
    <transaction result="1" location="temporary">  
        <header>  
            <period>2021/6</period>  
            <date>20210615</date>  
            <currency name="Euro" shortname="€">EUR</currency>  
            <!-- More header fields -->  
        </header>  
        <!-- Lines -->  
    </transaction>  
      
    <!-- incorrect processing of a financial transaction... -->  
    <transaction result="0" destiny="temporary">  
        <header result="0">  
            <period result="0" msg="Period 2021/6 is closed.">2021/6</period>  
            <date>20210615</date>  
            <currency name="Euro" shortname="€">EUR</currency>  
            <!-- More header fields -->  
        </header>  
        <!-- Lines -->  
    </transaction>  
    

## Value types​

In the XML a set of standardized field types is used. These type of fields have their own specific formatting. The most common types are listed below.

Type| Format  
---|---  
boolean| true or false  
date| yyyymmdd  
money| 0.00 (dot used as decimal separator)  
period| yyyy/p or yyyy/pp (where p or pp is the period number)  
string(#)| Free text field with # being the maximum length.  
fixed value| Only one value is allowed.  
code| string(16) only allowing characters: 'A'-'Z', '0'-'9', '_', '-' and '+'  
integer| Numeric value without decimals.  
enumeration| Fixed list of possible values.  
  
## Attributes returned additionally​

When the XML is returned the XML is enriched with additional information about the entities mentioned in the XML. For example a `<currency>EUR</currency>` element will most likely be returned as `<currency name="Euro" shortname="€">EUR</currency>`. See the list below for the most common attributes added while enriching the return data.

Name| Type| Usage| Description  
---|---|---|---  
result| enumeration: `0`, `1`| any element| `0` = not successful, `1` = successful  
msgtype| enumeration: `warning`, `error`| any element| Message type  
msg| string| any element| Warning or error message  
name| string| entity code element| Name of the entity identified by the code.  
shortname| string| entity code element| Short name of the entity identified by the code.  
type| code| dimension entity element| Type of the dimension identified by the element value.
