  * [](/documentation/)
  * Master Data
  * Rates



On this page

# Rates

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

TRT

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
ratetype| enumeration: `time`, `quantity`| Specifies the rate type.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example reads the rate settings of the rate with: EXAMPLE
    
    
    <read>  
        <type>projectrate</type>  
        <office>001</office>  
        <code>EXAMPLE</code>  
    </read>  
    

If the rate does not exist an empty `projectrate` element is returned containing an error.

## Create/Update/Delete​

If a rate is not found it will be automatically created, otherwise it is updated. Set `projectrate/@status` to `deleted` for deleting a rate.

### Root​

XML structure
    
    
    <projectrate>  
        <ratechanges></ratechanges>  
    </projectrate>  
    

Element name: `projectrate`

Name| Description  
---|---  
projectrate| Contains information general to the rate.  
ratechanges| Contains detailed information of the rate.  
  
### Projectrate​

XML structure

  * Request
  * Response


    
    
    <projectrate>  
        <office></office>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <type></type>  
        <unit></unit>  
        <currency></currency>  
        <ratechanges></ratechanges>  
    </projectrate>  
    
    
    
    <projectrate status="" inuse="">  
        <office name="" shortname=""></office>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <created></created>  
        <modified></modified>  
        <touched></touched>  
        <user name="" shortname=""></user>  
        <type></type>  
        <unit></unit>  
        <currency name="" shortname=""></currency>  
        <ratechanges></ratechanges>  
    </projectrate>  
    

Element name: `header`

Name| Type| Description  
---|---|---  
@status| `active`   
`deleted`   
`hide`| For creating and updating status may be left empty. For deleting `deleted` should be used. In case a rate that is in use, its status has been changed into `hide`. Hidden rates can be activated by using `active`.  
office| code| Office code.  
code| code| Rate code.  
name| string(40)| Rate description.  
shortname| string(20)| Short rate description.  
type| `quantity`   
`time`| The rate type.  
unit| integer| How will be charged e.g. if charged per hour Time, set it to `1`. If charged per 8 hours, set it to `8`. Quantities refers to items such as kilometers. If charged per kilometer set it to `1`.  
currency| code| Currency code.  
ratechanges| node| Contains rate per begin date and end date.  
  
### Rate changes​

XML structure

  * Request
  * Response


    
    
    <ratechange id="">  
        <begindate></begindate>  
        <enddate></enddate>  
        <internalrate></internalrate>  
        <externalrate></externalrate>  
    </ratechange>  
    
    
    
    <ratechange id="" lastused="" status="">  
        <begindate></begindate>  
        <enddate></enddate>  
        <internalrate></internalrate>  
        <externalrate></externalrate>  
    </ratechange>  
    

info

At least one rate line is required.

Element name: `ratechanges`

Name| Type| Description  
---|---|---  
@id| integer| Line ID.  
@lastused| | Obsolete.  
@status| | Status of the rate line.  
begindate| Date| Begin date of the rate.  
enddate| Date| Begin date of the rate.  
internalrate| double| The internal rate e.g. the cost price per unit.  
externalrate| double| The external rate e.g. the selling price per unit.  
  
### Example​

  * Request
  * Response


    
    
    <projectrate>  
        <office>001</office>  
        <code>KM</code>  
        <name>kilometer</name>  
        <shortname>kilometer</shortname>  
        <type>quantity</type>  
        <unit>1</unit>  
        <currency>EUR</currency>  
        <ratechanges>  
            <ratechange>  
                <begindate>20000101</begindate>  
                <enddate>20200101</enddate>  
                <internalrate>0.1500</internalrate>  
                <externalrate>0.3200</externalrate>  
            </ratechange>  
        </ratechanges>  
    </projectrate>  
    
    
    
    <projectrate status="active" result="1">  
        <office>001</office>  
        <code>KM</code>  
        <name>kilometer</name>  
        <shortname>kilometer</shortname>  
        <type>quantity</type>  
        <unit>1</unit>  
        <currency name="Euro" shortname="Euro">EUR</currency>  
        <ratechanges>  
            <ratechange id="2" lastused="" status="active">  
                <begindate>20000101</begindate>  
                <enddate>20200101</enddate>  
                <internalrate>0.1500</internalrate>  
                <externalrate>0.3200</externalrate>  
            </ratechange>  
        </ratechanges>  
        <user>TEST</user>  
        <touched>0</touched>  
        <created>20151221122813</created>  
        <modified>20151221122813</modified>  
    </projectrate>  
    
