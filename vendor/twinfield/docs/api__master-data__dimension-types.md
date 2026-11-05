  * [](/documentation/)
  * Master Data
  * Dimension types



On this page

# Dimension types

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

DMT

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
office| «office code»| Restricts to the office.  
dim| «dimension code»| Restricts to the type of the specified dimension.  
finlevel| enumeration: `1`, `2`, `3`, `4`, `5`, `6`| Specifies the Financial level.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the balance (BAS) dimension type settings for office 001.
    
    
    <dimensiontype>  
        <office>001</office>  
        <code>BAS</code>  
    </dimensiontype>  
    

If the dimension type does not exist an empty `dimensiontype` element is returned containing an error.

Element name: `code`

code| values  
---|---  
BAS| Balancesheet  
PNL| Profit and Loss  
CRD| Accounts Payable  
DEB| Accounts Receivable  
KPL| Cost centers  
AST| Assets  
PRJ| Projects  
ACT| Activities  
  
## Update​

### Root​

Element name: `dimensiontype`

Name| Type| Description  
---|---|---  
office| code| Office code.  
code| code| Dimension type.  
name| string(40)| Dimension type name.  
shortname| string(20)| Read-only attribute. Dimension type short name.  
mask| string(80)| Dimension type mask.  
levels| node| Contains the several levels of the dimensions linked to the dimension type.  
address| node| Contains labels for the address lines.  
  
#### Levels​

Element name: `levels`

Name| Type| Description  
---|---|---  
financials| integer| Read-only attribute. Financial level.  
time| integer| Read-only attribute. Level in time & expenses.  
fixedassets| | Not in use.  
invoices| | Not in use.  
  
#### Address labels​

Element name: `address`

Name| Type| Description  
---|---|---  
label1| string(20)| Address labels, description of field1 in the dimension address element.  
label2| string(20)| Address labels, description of field2 in the dimension address element.  
label3| string(20)| Address labels, description of field3 in the dimension address element.  
label4| string(20)| Address labels, description of field4 in the dimension address element.  
label5| string(20)| Address labels, description of field5 in the dimension address element.  
label6| string(20)| Address labels, description of field6 in the dimension address element.  
  
### XML​
    
    
    <dimensiontype>  
        <office>001</office>  
        <code>DEB</code>  
        <mask>1####</mask>  
        <name>Accounts Receivable</name>  
        <shortname>AR</shortname>  
        <address>  
            <label1/>  
            <label2>Address</label2>  
            <label3>Postal address</label3>  
            <label4>VAT number</label4>  
            <label5>COC number</label5>  
            <label6/>  
        </address>  
        <levels>  
            <financials>2</financials>  
            <time>0</time>  
            <fixedassets>0</fixedassets>  
            <invoices>0</invoices>  
        </levels>  
    </dimensiontype>  
    
