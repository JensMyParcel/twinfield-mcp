  * [](/documentation/)
  * Master Data
  * Cost centers



On this page

# Cost centers

> Dimension type KPL

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
level| enumeration: `1`, `2`, `3`, `4`, `5`, `6`| Specifies the dimension level. Normally the level of cost centers is level `2`.  
section| financials| Restricts to financial or time & expenses dimensions.  
dimtype| `KPL`| Shows the cost center dimensions.  
modifiedsince| string `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to dimensions modified after, on or at the specified date (and time).  
group| «group code»| Specifies the dimension group (wildcards allowed).  
includehidden| `0` (false) or `1` (true)| If set to `1`, the response will include a status column (active/hidden) and both active and hidden dimensions will be included.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the settings of the cost center (KPL) dimension EXAMPLE.
    
    
    <read>  
        <type>dimensions</type>  
        <office>001</office>  
        <dimtype>KPL</dimtype>  
        <code>EXAMPLE</code>  
    </read>  
    

## Create/Update/Delete​

If the dimension is not found it will be automatically created, otherwise it is updated. Set `dimension/header/@status` to `deleted` for deleting a dimension.

### Root​

XML structure
    
    
    <dimension>  
        <financials>  
        <banks>  
    </dimension>  
    

Element name: `dimension`

Name| Description  
---|---  
dimension| Contains information general to the dimension.  
financials| Not in use.  
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
    </dimension>  
    
    
    
    <dimension status="" result="">  
        <office name="" shortname=""></office>  
        <type name="" shortname=""></type>  
        <code></code>  
        <name></name>  
    </dimension>  
    

Element name: `dimension`

Property name| Value| Description  
---|---|---  
@status| `active`   
`deleted`   
`hide`| For creating and updating status may be left empty. For deleting `deleted` should be used. In case a dimension that is used in a transaction is deleted, its status has been changed into `hide`. Hidden dimensions can be activated by using `active`.  
office| code| Office code.  
type| code| Dimension type. See [Dimension type](/documentation/api/master-data/dimension-types).   
Dimension type of cost centers is `KPL`.  
code| code| Dimension code, must be compliant with the mask of the `KPL` [Dimension type](/documentation/api/master-data/dimension-types).  
uid| string| Unique identification of the dimension.   
Read-only attribute.  
name| string(80)| Name of the dimension.  
shortname| | Not in use.  
inuse| `true`   
`false`| Indicates whether the cost center is used in a financial transaction or not.   
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
  
### Example​

  * Request
  * Response


    
    
    <dimension>  
        <office>001</office>  
        <type>KPL</type>  
        <code>00000</code>  
        <name>Marketing</name>  
    </dimension>  
    
    
    
    <dimension status="active" result="1">  
        <office name="001" shortname="001">001</office>  
        <type name="Kostenplaatsen" shortname="Kostenplaatsen">KPL</type>  
        <name>Marketing</name>  
        <code>00000</code>  
        <uid>475e51e2-5b90-42c6-8075-f85854af05c5</uid>  
        <inuse>false</inuse>  
        <shortname></shortname>  
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
        <financials>  
            <level>2</level>  
            <matchtype>notmatchable</matchtype>  
            <accounttype>inherit</accounttype>  
            <subanalyse>maybe</subanalyse>  
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
                <id>00006</id>  
                <signaturedate></signaturedate>  
                <firstrundate></firstrundate>  
            </collectmandate>  
            <vatcode name="" shortname="" type=""></vatcode>  
            <vattype name="" shortname=""></vattype>  
        </financials>  
        <banks />  
    </dimension>  
    
