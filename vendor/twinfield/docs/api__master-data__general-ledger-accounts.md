  * [](/documentation/)
  * Master Data
  * General ledger accounts



On this page

# General ledger accounts

> Dimension types BAS and PNL

info

In this documentation only the balance sheet (BAS) dimension type will be described, the profit and loss (PNL) dimension type has the same XML structure. Only the fixed value of the type element is different, PNL instead of BAS.

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
level| enumeration: `1`, `2`, `3`, `4`, `5`, `6`| Specifies the dimension level. Normally the level of balance sheets is level `1`.  
section| financials| Restricts to financial or time & expenses dimensions.  
dimtype| `BAS` or `PNL`| Shows the general ledger account dimensions.  
modifiedsince| string `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to dimensions modified after, on or at the specified date (and time).  
group| «group code»| Specifies the dimension group (wildcards allowed).  
includehidden| `0` (false) or `1` (true)| If set to `1`, the response will include a status column (active/hidden) and both active and hidden dimensions will be included.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the settings of the balance account (BAS) dimension EXAMPLE.
    
    
    <read>  
        <type>dimensions</type>  
        <office>001</office>  
        <dimtype>BAS</dimtype>  
        <code>EXAMPLE</code>  
    </read>  
    

## Create/Update/Delete​

If the dimension is not found it will be automatically created, otherwise it is updated. Set `dimension/header/@status` to `deleted` for deleting a dimension.

### Root​

XML structure
    
    
    <dimension>  
        <financials></financials>  
        <groups></groups>  
        <banks></banks>  
    </dimension>  
    

Element name: `dimension`

Name| Description  
---|---  
dimension| Contains information general to the dimension.  
financials| Contains the financial settings of the dimension.  
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
Dimension type of balances accounts is `BAS`.  
code| code| Dimension code, must be compliant with the mask of the `BAS` [Dimension type](/documentation/api/master-data/dimension-types).  
uid| string| Unique identification of the dimension.   
Read-only attribute.  
name| string(80)| Name of the dimension.  
shortname| string(20)| Short name of the dimension.  
inuse| `true`   
`false`| Indicates if the balance account is used in a financial transaction or linked to a VAT code or linked to an article or not in use at all.   
Read-only attribute.  
behaviour| `normal`   
`system`   
`template`| Determines the behaviour of dimensions.   
Read-only attribute.  
touched| integer| Count of the number of times the dimension settings are changed.   
Read-only attribute.  
beginperiod| integer| Determines together with `beginyear` the period from which the dimension may be used.  
beginyear| integer| Determines together with `beginperiod` the period from which the dimension may be used.  
endperiod| integer| Determines together with `endyear` the period till which the dimension may be used.  
endyear| integer| Determines together with `endperiod` the period till which the dimension may be used.  
website| | Not in use.  
cocnumber| | Not in use.  
vatnumber| | Not in use.  
editdimensionname| | Not in use.  
  
### Financials​

XML structure

  * Request
  * Response


    
    
    <financials>  
        <matchtype></matchtype>  
        <accounttype></accounttype>  
        <subanalyse></subanalyse>  
        <vatcode></vatcode>  
        <childvalidations>  
            <...>  
        </childvalidations>  
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
        <vatcode name="" shortname="" type="" fixed="false"></vatcode>  
        <vatobligatory></vatobligatory>  
        <performancetype></performancetype>  
        <collectmandate>  
            <...>  
        </collectmandate>  
        <collectionschema></collectionschema>  
        <childvalidations>  
            <...>  
        </childvalidations>  
    </financials>  
    

Element name: `financials`

Property name| Value| Description  
---|---|---  
matchtype| `notmatchable`   
`matchable`| Sets the matchable value of the balance account.  
accounttype| code| Read-only attribute. Will be automatically generated because of supplied dimension type  
subanalyse| `true`   
`false`   
`maybe`| Is subanalyses needed.  
duedays| | Not in use.  
level| integer| Specifies the dimension level. Normally the level of balance accounts is level `1`.   
Read-only attribute.  
payavailable| | Not in use.  
meansofpayment| | Not in use.  
paycode| | Not in use.  
ebilling| | Not in use.  
ebillmail| | Not in use.  
substitutionlevel| | Not in use.  
substitutewith| | Not in use.  
relationsreference| | Not in use.  
vattype| | Not in use.  
vatcode| string(16)| Default VAT code.  
vatobligatory| | Not in use.  
performancetype| | Not in use.  
collectmandate| | Not in use.  
collectionschema| | Not in use.  
childvalidations| node| Validation rule when subanalyses is needed.  
  
#### VAT code​

XML structure

  * Request
  * Response


    
    
    <vatcode name="" shortname="" type="" fixed="false"></vatcode>  
    
    
    
    <vatcode name="" shortname="" type="" fixed="false"></vatcode>  
    

Element name: `vatcode`

Property name| Value| Description  
---|---|---  
@name| string(40)| Name of the VAT.  
@shortname| string(20)| Short name of the VAT.  
@type| `purchase`   
`sales`| Type of the VAT.  
@fixed| `true`   
`false`| When `true`, users are no longer able to use other VAT-codes on this account.  
  
#### Child validations​

XML structure

  * Request
  * Response


    
    
    <childvalidations>  
        <childvalidation type="" level=""></childvalidation>  
    </childvalidations>  
    
    
    
    <childvalidations>  
        <childvalidation type="" level=""></childvalidation>  
    </childvalidations>  
    

Element name: `childvalidation`

Property name| Value| Description  
---|---|---  
type| `code` (= dimension code)   
`type` (= dimension type)   
`group` (= dimension group)| Validation on dimension code, dimension type or dimension group.  
level| `0` (= only in case `type` is `group`)   
`1` (= balance accounts)   
`2` (= customer, supplier, cost center)   
`3` (= project, asset)   
`4` (= activity)| Financial level.  
  
#### Groups​

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
  
#### Banks​

Element name: `banks`

Not in use.

### Example​

  * Request
  * Response


    
    
    <dimension>  
        <office>001</office>  
        <type>BAS</type>  
        <code>1310</code>  
        <name>Customers</name>  
        <shortname>Customers</shortname>  
        <financials>  
            <matchtype>notmatchable</matchtype>  
            <accounttype>balance</accounttype>  
            <subanalyse>true</subanalyse>  
            <childvalidations>  
                <childvalidation type="type" level="2">DEB</childvalidation>  
            </childvalidations>  
        </financials>  
        <groups>  
            <group>2REL</group>  
        </groups>  
    </dimension>  
    
    
    
    <dimension status="active" result="1">  
        <office name="001" shortname="001">001</office>  
        <type name="Balans" shortname="Balans">BAS</type>  
        <code>1310</code>  
        <name>Customers</name>  
        <shortname>Customers</shortname>  
        <financials>  
            <matchtype>notmatchable</matchtype>  
            <accounttype>balance</accounttype>  
            <subanalyse>true</subanalyse>  
            <childvalidations>  
                <childvalidation type="type" level="2">DEB</childvalidation>  
            </childvalidations>  
            <level>1</level>  
            <payavailable>false</payavailable>  
            <meansofpayment>none</meansofpayment>  
            <paycode></paycode>  
            <ebilling>false</ebilling>  
            <duedays>0</duedays>  
            <relationsreference></relationsreference>  
            <substitutionlevel>0</substitutionlevel>  
            <substitutewith></substitutewith>  
            <vatobligatory>false</vatobligatory>  
            <performancetype />  
            <collectmandate>  
                <id></id>  
                <signaturedate></signaturedate>  
                <firstrundate></firstrundate>  
            </collectmandate>  
            <collectionschema></collectionschema>  
            <vatcode name="" shortname="" type="" fixed="false"></vatcode>  
            <vattype name="" shortname=""></vattype>  
        </financials>  
        <groups>  
            <group name="Relaties" shortname="Relaties">2REL</group>  
        </groups>  
        <uid>c8716148-3acd-407d-bf71-68c209b65f70</uid>  
        <inuse>true</inuse>  
        <behaviour>normal</behaviour>  
        <touched>1</touched>  
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
    
