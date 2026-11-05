  * [](/documentation/)
  * Master Data
  * VAT



On this page

# VAT

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

VAT

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
vattype| enumeration: `purchase`, `sales`| Specifies the VAT type.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the settings of VAT code EXAMPLE.
    
    
    <read>  
        <office>001</office>  
        <type>vat</type>  
        <code>EXAMPLE</code>  
    </read>  
    

## Create/Update/Delete​

If VAT is not found it will be automatically created, otherwise it is updated. Set `dimensiongroup/header/@status` to `deleted` for deleting dimension group.

### Root​

XML structure
    
    
    <vat>  
        <percentages></percentages>  
    </vat>  
    

Element name: `vat`

Name| Description  
---|---  
vat| Contains information general to the VAT.  
percentages| Contains the percentages information of the VAT.  
  
### VAT​

XML structure

  * Request
  * Response


    
    
    <vat status="">  
        <office></office>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <type></type>  
        <percentages></percentages>  
    </vat>  
    
    
    
    <vat status="" result="">  
        <office></office>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <uid></uid>  
        <created></created>  
        <modified></modified>  
        <touched></touched>  
        <user name="" shortname=""></user>  
        <type></type>  
        <percentages></percentages>  
    </vat>  
    

Element name: `vat`

Name| Type| Description  
---|---|---  
@status| `active`   
`deleted`| For creating and updating `active` should be used. For deleting `deleted` should be used.  
office| code| Office code.  
code| code| VAT code.  
name| string(40)| Name of the VAT.  
shortname| string(20)| Short name of the VAT.  
type| `sales`   
`purchase`| The VAT type.  
uid| string| Unique identification of the VAT code.   
Read-only attribute.  
created| datetime| The date/time the VAT code was created.   
Read-only attribute.  
modified| datetime| The most recent date/time the VAT code was modified.   
Read-only attribute.  
touched| integer| The number of times the VAT code is modified.   
Read-only attribute.  
user| code| The code of the user who created or modified the VAT code.   
Read-only attribute.  
percentages| node| The percentages part of the VAT.  
  
#### Percentages​

XML structure

  * Request
  * Response


    
    
    <percentages>  
        <percentage></percentage>  
    </percentages>  
    
    
    
    <percentages>  
        <percentage></percentage>  
    </percentages>  
    

Element name: `percentages`

Name| Type| Description  
---|---|---  
percentage| percentage| Percentage line of the VAT code.  
  
#### Percentage​

XML structure

  * Request
  * Response


    
    
    <percentage>  
        <date></date>  
        <percentage></percentage>  
        <name></name>  
        <shortname></shortname>  
        <accounts></accounts>  
    </percentage>  
    
    
    
    <percentage>  
        <date></date>  
        <percentage></percentage>  
        <name></name>  
        <shortname></shortname>  
        <accounts></accounts>  
    </percentage>  
    

Element name: `percentage`

Name| Type| Description  
---|---|---  
date| date| Effective date.  
percentage| double| Percentage of the VAT line.  
name| string(40)| Name of the VAT line.  
shortname| string(20)| Short name of the VAT line.  
accounts| node| Account settings of the VAT lines.  
  
#### Accounts​

XML structure

  * Request
  * Response


    
    
    <accounts>  
        <account></account>  
    </accounts>  
    
    
    
    <accounts>  
        <account></account>  
    </accounts>  
    

Element name: `accounts`

Name| Type| Description  
---|---|---  
account| node| Account settings of the single line.  
  
#### Account​

XML structure

  * Request
  * Response


    
    
    <account>  
        <dim1></dim1>  
        <groupcountry></groupcountry>  
        <group></group>  
        <percentage></percentage>  
        <linetype></linetype>  
    </account>  
    
    
    
    <account id="">  
        <dim1 name="" shortname="" dimensiontype=""></dim1>  
        <groupcountry name="" shortname=""></groupcountry>  
        <group name="" shortname=""></group>  
        <percentage></percentage>  
        <linetype></linetype>  
    </account>  
    

Element name: `account`

Name| Type| Description  
---|---|---  
@id| integer| Line ID.  
dim1| code| General ledger account on which the VAT amount will be posted.  
groupcountry| code| Country code of the VAT group.  
group| code| The VAT group.  
percentage| double| The VAT percentage.  
linetype| `vat`   
`detail`| Is it a `vat` line or not `detail`. Use `detail` in case a part of the calculated vat value should be posted on a different general ledger account.  
  
### Example​

  * Request
  * Response


    
    
    <vat>  
        <code>VH</code>  
        <name>BTW 21%</name>  
        <shortname>VH 21%</shortname>  
        <type>sales</type>  
        <percentages>  
            <percentage>  
                <date>20121001</date>  
                <percentage>21</percentage>  
                <name>BTW 21%</name>  
                <shortname>VH 21%</shortname>  
                <accounts>  
                    <account>  
                        <dim1>1530</dim1>  
                        <groupcountry>NL</groupcountry>  
                        <group>NL1A</group>  
                        <percentage>100</percentage>  
                        <linetype>vat</linetype>  
                    </account>  
                </accounts>  
            </percentage>  
        </percentages>  
    </vat>  
    
    
    
    <vat status="default" result="1">  
        <code>VH</code>  
        <name>BTW 21%</name>  
        <shortname>VH 21%</shortname>  
        <type>sales</type>  
        <percentages>  
            <percentage inuse="true" status="active">  
                <date>20121001</date>  
                <percentage>21</percentage>  
                <name>BTW 21%</name>  
                <shortname>VH 21%</shortname>  
                <accounts>  
                    <account>  
                        <dim1 name="Te betalen OB Hoog" shortname="Te betalen OB 19%">1530</dim1>  
                        <groupcountry name="Nederland" shortname="">NL</groupcountry>  
                        <group name="Leveringen/Diensten belast met hoog %" shortname="L/D Hoog">NL1A</group>  
                        <percentage>100</percentage>  
                        <linetype>vat</linetype>  
                    </account>  
                </accounts>  
                <user>TEST</user>  
            </percentage>  
        </percentages>  
        <uid>9097ac16-d961-4952-8a28-6976a97bc3d7</uid>  
        <user name="Test" shortname="Test">TEST</user>  
        <touched>0</touched>  
    </vat>  
    
