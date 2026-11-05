  * [](/documentation/)
  * Master Data
  * Fixed assets



On this page

# Fixed assets

> Dimension type AST

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

DIM

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
level| enumeration: `1`, `2`, `3`, `4`, `5`, `6`| Specifies the dimension level. Normally the level of fixed assets is level `3`.  
section| financials| Restricts to financial or time & expenses dimensions.  
dimtype| `AST`| Shows the fixed assets dimensions.  
modifiedsince| string `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to dimensions modified after, on or at the specified date (and time).  
group| «group code»| Specifies the dimension group (wildcards allowed).  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the settings of the fixed asset (AST) dimension EXAMPLE.
    
    
    <read>  
        <type>dimensions</type>  
        <office>001</office>  
        <dimtype>AST</dimtype>  
        <code>EXAMPLE</code>  
    </read>  
    

## Create/Update/Delete​

If the dimension is not found it will be automatically created, otherwise it is updated. Set `dimension/header/@status` to `deleted` for deleting a dimension.

### Root​

XML structure
    
    
    <dimension>  
        <financials></financials>  
        <fixedassets></fixedassets>  
        <groups></groups>  
        <banks></banks>  
    </dimension>  
    

Element name: `dimension`

Name| Description  
---|---  
dimension| Contains information general to the dimension.  
financials| Contains the financial settings of the dimension.  
fixedassets| Contains the fixed asset settings of the dimension.  
groups| Contains the dimension groups the dimension is part of.  
banks| Not in use.  
  
### Dimension​

XML structure

  * Request
  * Response


    
    
    <dimension>  
        <office></office>  
        <type></type>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <beginperiod></beginperiod>  
        <beginyear></beginyear>  
        <endperiod></endperiod>  
        <endyear></endyear>  
    </dimension>  
    
    
    
    <dimension status="" result="">  
        <office name="" shortname=""></office>  
        <type name="" shortname=""></type>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <beginperiod></beginperiod>  
        <beginyear></beginyear>  
        <endperiod></endperiod>  
        <endyear></endyear>  
        <website></website>  
        <cocnumber></cocnumber>  
        <vatnumber></vatnumber>  
        <uid></uid>  
        <inuse></inuse>  
        <behaviour></behaviour>  
        <touched></touched>  
        <editdimensionname></editdimensionname>  
    </dimension>  
    

Element name: `dimension`

Property name| Value| Description  
---|---|---  
@status| `active`   
`deleted`   
`hide`| For creating and updating status may be left empty. For deleting `deleted` should be used. In case a dimension that is used in a transaction is deleted, its status has been changed into `hide`. Hidden dimensions can be activated by using `active`.  
office| code| Office code.  
type| code| Dimension type. See [Dimension type](/documentation/api/master-data/dimension-types).   
Dimension type of fixed assets is `AST`.  
code| code| Dimension code, must be compliant with the mask of the `AST` [Dimension type](/documentation/api/master-data/dimension-types).  
uid| string| Unique identification of the dimension.   
Read-only attribute.  
name| string(80)| Name of the dimension.  
shortname| | Not in use.  
inuse| `true`   
`false`| Indicates whether the fixed asset is used in a financial transaction or not.   
Read-only attribute.  
behaviour| `normal`   
`system`   
`template`| Determines the behaviour of dimensions.   
Read-only attribute.  
touched| integer| Count of the number of times the dimension settings are changed.   
Read-only attribute.  
beginperiod| | Not in use.  
beginyear| | Not in use.  
endperiod| | Not in use.  
endyear| | Not in use.  
website| | Not in use.  
cocnumber| | Not in use.  
vatnumber| | Not in use.  
editdimensionname| | Not in use.  
  
### Financials​

XML structure

  * Request
  * Response


    
    
    <financials>  
        <substitutionlevel></substitutionlevel>  
        <substitutewith></substitutewith>  
    </financials>  
    
    
    
    <financials>  
        <matchtype></matchtype>  
        <accounttype></accounttype>  
        <subanalyse></subanalyse>  
        <duedays></duedays>  
        <level></level>  
        <payavailable></payavailable>  
        <meansofpayment></meansofpayment>  
        <paycode name="" shortname=""></paycode>  
        <ebilling></ebilling>  
        <ebillmail></ebillmail>  
        <substitutionlevel></substitutionlevel>  
        <substitutewith></substitutewith>  
        <relationsreference></relationsreference>  
        <vattype name="" shortname=""></vattype>  
        <vatcode name="" shortname="" type=""></vatcode>  
        <vatobligatory></vatobligatory>  
        <performancetype></performancetype>  
        <collectmandate>  
            <...>  
        </collectmandate>  
        <collectionschema></collectionschema>  
    </financials>  
    

Element name: `financials`

Property name| Value| Description  
---|---|---  
matchtype| `notmatchable`   
`matchable`| The matchable value of the balance account.   
Read-only attribute.  
accounttype| code| Fixed value `inherit`.   
Read-only attribute.  
subanalyse| `true`   
`false`   
`maybe`| Is subanalyses needed.   
Read-only attribute.  
duedays| | Not in use.  
level| integer| Specifies the dimension level. Normally the level of fixed assets is level 3.   
Read-only attribute.  
payavailable| | Not in use.  
meansofpayment| | Not in use.  
paycode| | Not in use.  
ebilling| | Not in use.  
ebillmail| | Not in use.  
substitutionlevel| | Dimension level of the cost center.  
substitutewith| | Dimension code of the cost center.  
relationsreference| | Not in use.  
vattype| | Not in use.  
vatcode| string(16)| Default VAT code.  
vatobligatory| | Not in use.  
performancetype| | Not in use.  
collectmandate| | Not in use.  
collectionschema| | Not in use.  
  
### Fixed Assets​

XML structure

  * Request
  * Response


    
    
    <fixedassets>  
        <residualvalue></residualvalue>  
        <stopvalue></stopvalue>  
        <method></method>  
        <beginperiod></beginperiod>  
        <purchasedate></purchasedate>  
        <selldate></selldate>  
        <freetext1></freetext1>  
        <freetext2></freetext2>  
        <freetext3></freetext3>  
        <freetext4></freetext4>  
        <freetext5></freetext5>  
        <nrofperiods></nrofperiods>  
        <percentage></percentage>  
        <lastdepreciation></lastdepreciation>  
        <status></status>  
        <translines>  
            <...>  
        </translines>  
    </fixedassets>  
    
    
    
    <fixedassets>  
        <residualvalue locked=""></residualvalue>  
        <stopvalue locked=""></stopvalue>  
        <method name="" shortname=""></method>  
        <beginperiod locked=""></beginperiod>  
        <purchasedate locked=""></purchasedate>  
        <selldate locked=""></selldate>  
        <freetext1 locked=""></freetext1>  
        <freetext2 locked=""></freetext2>  
        <freetext3 locked=""></freetext3>  
        <freetext4 locked=""></freetext4>  
        <freetext5 locked=""></freetext5>  
        <nrofperiods inherited="" locked=""></nrofperiods>  
        <percentage locked=""></percentage>  
        <lastdepreciation locked=""></lastdepreciation>	  
        <status locked=""></status>  
        <translines>  
            <...>  
        </translines>  
    </fixedassets>  
    

Element name: `fixedassets`

Property name| Value| Description  
---|---|---  
@locked| `true`   
`false`| If the `locked` property of an element is set to `true`, it is not possible to change its value. The value of elements with the `locked` property set to `false` can be changed.  
residualvalue| money| The residual value of the asset at the end of the depreciation duration.  
stopvalue| money| The value future depreciation should stop at.  
method| code| The asset method. See [Asset methods](/documentation/api/master-data/asset-methods).  
beginperiod| string| Period in YYYY/PP format. The period from which the depreciation to begin.  
purchasedate| date| The purchase date of the asset.  
selldate| date| The date the asset is sold.  
freetext1| string| Free text field 1 as set on the asset method.  
freetext2| string| Free text field 2 as set on the asset method.  
freetext3| string| Free text field 3 as set on the asset method.  
freetext4| string| Free text field 4 as set on the asset method.  
freetext5| string| Free text field 5 as set on the asset method.  
nrofperiods| integer| The number of periods over which the asset should be depreciated.  
percentage| integer| The depreciation percentage.  
lastdepreciation| string| Period in YYYY/PP format. The period of the last depreciation of the asset.  
status| `ToBeActivated`   
`Active`   
`Inactive`   
`Sold`| The status of the asset.  
translines| node| The transactions of the purchase of the asset.  
  
#### Transaction lines​

XML structure

  * Request
  * Response


    
    
    <translines>  
        <transline></transline>  
    </translines>  
    
    
    
    <translines locked="">  
        <transline locked="" inuse="" checked=""></transline>  
    </translines>  
    

Element name: `translines`

Property name| Description  
---|---  
transline| The transaction of the purchase of the asset.  
  
#### Transaction line​

XML structure

  * Request
  * Response


    
    
    <transline>  
        <code></code>  
        <number></number>  
        <line></line>  
        <amount></amount>  
        <period></period>  
        <dim1></dim1>  
        <dim2></dim2>  
        <dim3></dim3>  
        <dim4></dim4>  
        <dim5></dim5>  
        <dim6></dim6>  
    </transline>  
    
    
    
    <transline locked="" inuse="" checked="">  
        <code name="" shortname="" locked=""></code>  
        <number locked=""></number>  
        <line locked=""></line>  
        <amount locked=""></amount>  
        <period locked=""></period>  
        <dim1 name="" shortname="" dimensiontype="" locked=""></dim1>  
        <dim2 name="" shortname="" dimensiontype="" locked=""></dim2>  
        <dim3 name="" shortname="" dimensiontype="" locked=""></dim3>  
        <dim4 name="" shortname="" dimensiontype="" locked=""></dim4>  
        <dim5 name="" shortname="" dimensiontype="" locked=""></dim5>  
        <dim6 name="" shortname="" dimensiontype="" locked=""></dim6>  
    </transline>  
    

Element name: `transline`

Property name| Value| Description  
---|---|---  
code| code| Transaction type code.  
number| integer| Transaction number.  
line| interger| Transaction line number.  
amount| money| Transaction line amount.  
period| string| Period in YYYY/PP format. Period of the transaction.  
dim1| string| Dimension 1 of the tranaction line.  
dim2| string| Dimension 2 of the tranaction line.  
dim3| string| Dimension 3 of the tranaction line.  
dim4| string| Dimension 4 of the tranaction line.  
dim5| string| Dimension 5 of the tranaction line.  
dim6| string| Dimension 6 of the tranaction line.  
  
### Groups​

XML structure

  * Request
  * Response


    
    
    <groups>  
        <group></group>  
    </groups>  
    
    
    
    <groups>  
        <group shortname="" name=""></group>  
    </groups>  
    

Element name: `groups`

Property name| Value| Description  
---|---|---  
group| string(16)| Sets the dimension group. See [Dimension group](/documentation/api/master-data/dimension-groups).  
  
### Banks​

Element name: `banks`

Not in use.

### Example​

  * Request
  * Response


    
    
    <dimension>  
        <office>001</office>  
        <type>AST</type>  
        <name>John Deere 7000</name>  
        <financials>  
            <substitutionlevel>2</substitutionlevel>  
            <substitutewith>00000</substitutewith>  
        </financials>  
        <fixedassets>  
            <residualvalue>2500.00</residualvalue>  
            <stopvalue>0.00</stopvalue>  
            <method>MACHINE-5</method>  
            <beginperiod>2014/01</beginperiod>  
            <purchasedate>20140101</purchasedate>  
            <freetext1>SN-89377433</freetext1>  
            <nrofperiods>60</nrofperiods>  
        </fixedassets>  
        <groups>  
            <group>E.0.0000</group>  
        </groups>  
    </dimension>  
    
    
    
    <dimension status="active" result="1">  
        <office name="001" shortname="001">001</office>  
        <type name="Vaste activa" shortname="">AST</type>  
        <name>John Deere 7000</name>  
        <financials>  
            <substitutionlevel>2</substitutionlevel>  
            <substitutewith name="standaard kostenplaats" shortname="">00000</substitutewith>  
            <level>3</level>  
            <matchtype>notmatchable</matchtype>  
            <accounttype>inherit</accounttype>  
            <subanalyse>false</subanalyse>  
            <payavailable>false</payavailable>  
            <meansofpayment>none</meansofpayment>  
            <paycode></paycode>  
            <ebilling>false</ebilling>  
            <duedays>30</duedays>  
            <relationsreference></relationsreference>  
            <vatobligatory>false</vatobligatory>  
            <performancetype />  
            <collectmandate>  
                <id>60002</id>  
                <signaturedate></signaturedate>  
                <firstrundate></firstrundate>  
            </collectmandate>  
            <vatcode name="" shortname="" type=""></vatcode>  
            <vattype name="" shortname=""></vattype>  
        </financials>  
        <fixedassets>  
            <residualvalue>2500.00</residualvalue>  
            <stopvalue>0.00</stopvalue>  
            <method name="Machine" shortname="Machine">MACHINE-5</method>  
            <beginperiod>2014/01</beginperiod>  
            <purchasedate>20140101</purchasedate>  
            <freetext1>SN-89377433</freetext1>  
            <nrofperiods locked="false">60</nrofperiods>  
            <percentage locked="false"></percentage>  
            <status locked="true">tobeactivated</status>  
            <lastdepreciation locked="false" />  
            <selldate locked="true"></selldate>  
            <freetext2 locked="false"></freetext2>  
            <freetext3 locked="false"></freetext3>  
            <freetext4 locked="false"></freetext4>  
            <freetext5 locked="false"></freetext5>  
            <translines locked="false" />  
        </fixedassets>  
        <groups>  
            <group name="E.0.0000" shortname="E.0.0000">E.0.0000</group>  
        </groups>  
        <code>60002</code>  
        <uid>42dfbe5f-8891-414d-9774-64669d44c440</uid>  
        <inuse>false</inuse>  
        <shortname></shortname>  
        <behaviour>normal</behaviour>  
        <touched>0</touched>  
        <beginperiod>0</beginperiod>  
        <beginyear>0</beginyear>  
        <endperiod>0</endperiod>  
        <endyear>0</endyear>  
        <website></website>  
        <vatnumber></vatnumber>  
        <cocnumber></cocnumber>  
        <editdimensionname>true</editdimensionname>  
        <banks />  
    </dimension>  
    
