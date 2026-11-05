  * [](/documentation/)
  * Master Data
  * Asset methods



On this page

# Asset methods

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

ASM

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
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the asset methods settings of method EXAMPLE in office 001.
    
    
    <assetmethod>  
       <office>001</office>  
       <code>EXAMPLE</code>  
    </assetmethod>  
    

If the asset method does not exist an empty `assetmethod` element is returned containing an error.

## Create/Update/Delete​

### Root​

XML structure
    
    
    <assetmethod>  
        <balanceaccounts></balanceaccounts>  
        <profitlossaccounts></profitlossaccounts>  
        <freetexts></freetexts>  
    </assetmethod>  
    

Element name: `assetmethod`

Name| Description  
---|---  
assetmethod| Contains information of the asset method.  
balanceaccounts| Contains information of the balance accounts.  
profitlossaccounts| Contains information of the profit and loss accounts.  
freetexts| Contains information of the free text fields.  
  
### Asset method​

XML structure

  * Request
  * Response


    
    
    <assetmethod>  
        <office></office>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <nrofperiods></nrofperiods>  
        <depreciatereconciliation></depreciatereconciliation>  
        <calcmethod></calcmethod>  
    </assetmethod>  
    
    
    
    <assetmethod status="" result="">  
        <office name="" shortname=""></office>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <touched></touched>  
        <user name="" shortname=""></user>  
        <depreciatereconciliation></depreciatereconciliation>  
        <nrofperiods></nrofperiods>  
        <calcmethod></calcmethod>  
        <percentage></percentage>  
        <modified></modified>  
        <created></created>  
    </assetmethod>  
    

Element name: `assetmethod`

Property name| Value| Description  
---|---|---  
office| code| Office code.  
code| code| Asset method code.  
name| string| The name of the asset method.  
shortname| string| The short name of the asset method.  
nrofperiods| integer| The number of periods over which the asset linked to the asset method should be depreciated.  
depreciatereconciliation| `from_reconciliation`   
`from_purchase_date`| Depreciate as of the revaluation date.   
Depreciate in retrospect, back to the purchase date.  
calcmethod| `none`   
`linear`   
`linearpercentage`   
`reducebalance`| The calculation method.  
touched| integer| Count of the number of times the dimension settings are changed.   
Read-only attribute.  
user| code| The user who modified the asset method the last time.  
modified| date| Date/time the asset method is modified the last time.  
created| date| Date/time the asset method is created.  
  
### Balance accounts​

XML structure

  * Request
  * Response


    
    
    <balanceaccounts>  
        <purchasevaluegroup></purchasevaluegroup>  
        <purchasevalue></purchasevalue>  
        <depreciationgroup></depreciationgroup>  
        <depreciation></depreciation>  
        <assetstoactivate></assetstoactivate>  
        <reconciliation></reconciliation>  
        <tobeinvoiced></tobeinvoiced>  
    </balanceaccounts>  
    
    
    
    <balanceaccounts>  
        <purchasevaluegroup name="" shortname=""></purchasevaluegroup>  
        <purchasevalue name="" shortname="" dimensiontype=""></purchasevalue>  
        <depreciationgroup name="" shortname=""></depreciationgroup>  
        <depreciation name="" shortname="" dimensiontype=""></depreciation>  
        <assetstoactivate name="" shortname="" dimensiontype=""></assetstoactivate>  
        <reconciliation name="" shortname="" dimensiontype=""></reconciliation>  
        <tobeinvoiced name="" shortname="" dimensiontype=""></tobeinvoiced>  
    </balanceaccounts>  
    

Element name: `balanceaccounts`

Property name| Value| Description  
---|---|---  
purchasevaluegroup| code| Purchase value group.  
purchasevalue| code| Purchase value balance sheet.  
depreciationgroup| code| Depreciation group.  
depreciation| code| Cumulative depreciation balance sheet.  
assetstoactivate| code| Assets to activate balance sheet.  
reconciliation| code| Revaluation of purchase value balance sheet.  
tobeinvoiced| code| Disposal value to be invoiced balance sheet.  
  
### Profit and loss accounts​

XML structure

  * Request
  * Response


    
    
    <profitlossaccounts>  
        <depreciation></depreciation>  
        <sales></sales>  
        <reconciliation></reconciliation>  
    </profitlossaccounts>  
    
    
    
    <profitlossaccounts>  
        <depreciation name="" shortname="" dimensiontype=""></depreciation>  
        <sales name="" shortname="" dimensiontype=""></sales>  
        <reconciliation name="" shortname="" dimensiontype=""></reconciliation>  
    </profitlossaccounts>  
    

Element name: `profitlossaccounts`

Property name| Value| Description  
---|---|---  
depreciation| code| Depreciation costs profit and loss account.  
sales| code| Disposal result profit and loss account.  
reconciliation| code| Revaluation reserve profit and loss account.  
  
### Free texts​

XML structure

  * Request
  * Response


    
    
    <freetexts>  
        <freetext id="" type=""></freetext>  
    </freetexts>  
    
    
    
    <freetexts>  
        <freetext id="" type="text"></freetext>  
    </freetexts>  
    

Element name: `freetexts`

Property name| Value| Description  
---|---|---  
@id| integer| Free text id. In total, five free text fields are available.  
@type| `text`   
`amount`| Free text type.  
freetext| string| Free text.  
  
### Example​

  * Request
  * Response


    
    
    <assetmethod>  
        <office>001</office>  
        <code>MACHINE</code>  
        <name>Machine</name>  
        <shortname>Machine</shortname>  
        <depreciatereconciliation>from_reconciliation</depreciatereconciliation>  
        <freetexts>  
            <freetext id="1" type="text">Serial number</freetext>  
        </freetexts>  
        <nrofperiods>60</nrofperiods>  
        <calcmethod>linear</calcmethod>  
        <percentage>0</percentage>  
        <profitlossaccounts>  
            <depreciation>4730</depreciation>  
            <sales></sales>  
            <reconciliation></reconciliation>  
        </profitlossaccounts>  
        <balanceaccounts>  
            <purchasevaluegroup></purchasevaluegroup>  
            <purchasevalue>0501</purchasevalue>  
            <depreciationgroup></depreciationgroup>  
            <depreciation>0135</depreciation>  
            <assetstoactivate></assetstoactivate>  
            <reconciliation></reconciliation>  
            <tobeinvoiced></tobeinvoiced>  
        </balanceaccounts>  
    </assetmethod>  
    
    
    
    <assetmethod status="active" result="1">  
        <office name="001" shortname="001">001</office>  
        <code>MACHINE</code>  
        <name>Machine</name>  
        <shortname>Machine</shortname>  
        <depreciatereconciliation>from_reconciliation</depreciatereconciliation>  
        <freetexts>  
            <freetext id="1" type="text">Serial number</freetext>  
            <freetext id="2" type="text"></freetext>  
            <freetext id="3" type="text"></freetext>  
            <freetext id="4" type="text"></freetext>  
            <freetext id="5" type="text"></freetext>  
        </freetexts>  
        <nrofperiods>60</nrofperiods>  
        <calcmethod>linear</calcmethod>  
        <percentage>0</percentage>  
        <profitlossaccounts>  
            <depreciation name="Depr costs machines" shortname="Depr costs machines" dimensiontype="PNL">4730</depreciation>  
            <sales name="" shortname="" dimensiontype=""></sales>  
            <reconciliation name="" shortname="" dimensiontype=""></reconciliation>  
        </profitlossaccounts>  
        <balanceaccounts>  
            <purchasevaluegroup name="" shortname=""></purchasevaluegroup>  
            <purchasevalue name="Purchase value" shortname="" dimensiontype="BAS">0501</purchasevalue>  
            <depreciationgroup name="" shortname=""></depreciationgroup>  
            <depreciation name="Cumulative depreciation" shortname="Cumulative depreciation" dimensiontype="BAS">0135</depreciation>  
            <assetstoactivate name="" shortname="" dimensiontype=""></assetstoactivate>  
            <reconciliation name="" shortname="" dimensiontype=""></reconciliation>  
            <tobeinvoiced name="" shortname="" dimensiontype=""></tobeinvoiced>  
        </balanceaccounts>  
        <touched>0</touched>  
        <user name="Marcel" shortname="Marcel">MARCEL</user>  
        <modified>20140124073325</modified>  
        <created>20140124073325</created>  
    </assetmethod>  
    
