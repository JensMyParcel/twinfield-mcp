  * [](/documentation/)
  * Master Data
  * Articles



On this page

# Articles

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

ART

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
vat| enumeration: `inclusive`, `exclusive`| If supplied it filters articles based on vat configuration on the article.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example reads the article settings of the article with: EXAMPLE
    
    
    <read>  
        <type>article</type>  
        <office>001</office>  
        <code>EXAMPLE</code>  
    </read>  
    

If the article does not exist an empty `article` element is returned containing an error.

## Create/Update/Delete​

If an article is not found it will be automatically created, otherwise it is updated. Set `article/header/@status` to `deleted` for deleting an article.

### Root​

XML structure
    
    
    <article>  
        <header></header>  
        <lines></lines>  
    </article>  
    

Element name: `article`

Name| Description  
---|---  
header| Contains information general to the article.  
lines| Contains either sub-articles or detailed information of the article.  
  
### Header​

XML structure

  * Request
  * Response


    
    
    <header>  
        <office></office>  
        <code></code>  
        <type></type>  
        <name></name>  
        <shortname></shortname>  
        <unitnamesingular></unitnamesingular>  
        <unitnameplural></unitnameplural>  
        <vatcode></vatcode>  
        <allowchangevatcode></allowchangevatcode>  
        <performancetype></performancetype>  
        <allowchangeperformancetype></allowchangeperformancetype>  
        <percentage></percentage>  
        <allowdiscountorpremium></allowdiscountorpremium>  
        <allowchangeunitsprice></allowchangeunitsprice>  
        <allowdecimalquantity></allowdecimalquantity>  
    </header>  
    
    
    
    <header status="">  
        <office></office>  
        <code></code>  
        <type></type>  
        <name></name>  
        <shortname></shortname>  
        <unitnamesingular></unitnamesingular>  
        <unitnameplural></unitnameplural>  
        <vatcode></vatcode>  
        <allowchangevatcode></allowchangevatcode>  
        <performancetype></performancetype>  
        <allowchangeperformancetype></allowchangeperformancetype>  
        <percentage></percentage>  
        <allowdiscountorpremium></allowdiscountorpremium>  
        <allowchangeunitsprice></allowchangeunitsprice>  
        <allowdecimalquantity></allowdecimalquantity>  
    </header>  
    

Element name: `header`

Name| Type| Description  
---|---|---  
@status| `active`   
`deleted`   
`hide`| For creating and updating status may be left empty. For deleting `deleted` should be used. In case an article that is used in an invoice is deleted, its status has been changed into `hide`. Hidden articles can be activated by using `active`.  
office| code| Office code  
code| code| Article code  
name| string(40)| Article description  
shortname| string(20)| Short article description  
type| `normal`   
`discount`   
`premium`| Set to `normal` in case special item is `none`. Set to either `discount` or `premium` in case special item is `deduction` or `premium` respectively.  
percentage| boolean| Only available when article type is `discount` or `premium`  
allowdiscountorpremium| boolean| Is discount or premium allowed  
allowchangeunitsprice| boolean| Is it allowed to change the units price  
allowchangevatcode| boolean| Is it allowed to change the VAT  
vatcode| code| Default VAT code  
unitnamesingular| string(20)| Unit name for a single item  
unitnameplural| string(20)| Unit name for multiple items  
allowdecimalquantity| boolean| Are decimals allowed  
  
### Sub articles​

XML structure

  * Request
  * Response


    
    
    <line>  
        <unitspriceexcl></unitspriceexcl>  
        <unitspriceinc></unitspriceinc>  
        <units></units>  
        <name></name>  
        <shortname></shortname>  
        <subcode></subcode>  
        <freetext1></freetext1>  
        <freetext2></freetext2>  
        <freetext3></freetext3>  
    </line>  
    
    
    
    <line>  
        <unitspriceexcl></unitspriceexcl>  
        <unitspriceinc></unitspriceinc>  
        <units></units>  
        <name></name>  
        <shortname></shortname>  
        <subcode></subcode>  
        <freetext1></freetext1>  
        <freetext2></freetext2>  
        <freetext3></freetext3>  
        <freetext4></freetext4>  
        <freetext5></freetext5>  
        <freetext6></freetext6>  
    </line>  
    

info

At least one sub-article is required.

Element name: `lines`

Name| Type| Description  
---|---|---  
@id| integer| Line ID  
@inuse| boolean| Read-only attribute. Indicates that the sub item has been used in an invoice.  
@status| `active`   
`deleted`| Allows you to delete sub items and to recover them (if sub item is @inuse).  
subcode| code| Can only be empty if there is just one sub article  
name| string(80)| Sub article name  
shortname| string(20)| Sub article short name  
units| integer| The number of units of the article per quantity  
unitspriceexcl| money| Price excluding VAT  
unitspriceinc| money| Price including VAT  
freetext1| string(16)| Mandatory. The general ledger code linked to the article.  
freetext2| string(16)| Optional. The cost center linked to the article.  
freetext3| string(40)| Free text element 3  
freetext4| | Not in use.  
freetext5| | Not in use.  
freetext6| | Not in use.  
  
### Example​

  * Request
  * Response


    
    
    <article>  
        <header>  
            <office>001</office>  
            <code>BIKE</code>  
            <type>normal</type>  
            <name>Bike summer edition</name>  
            <shortname>Bike summer edition</shortname>  
            <unitnamesingular>Piece</unitnamesingular>  
            <unitnameplural>Pieces</unitnameplural>  
            <vatcode>VH</vatcode>  
            <allowchangevatcode>false</allowchangevatcode>  
            <allowdiscountorpremium>true</allowdiscountorpremium>  
            <allowchangeunitsprice>false</allowchangeunitsprice>  
            <allowdecimalquantity>false</allowdecimalquantity>  
        </header>  
        <lines>  
            <line>  
                <unitspriceexcl>750.00</unitspriceexcl>  
                <unitspriceinc></unitspriceinc>  
                <units>1</units>  
                <name>Lady's bike summer edition</name>  
                <shortname>Lady summer</shortname>  
                <subcode>BIKE.L</subcode>  
                <freetext1>8050</freetext1>  
            </line>  
            <line>  
                <unitspriceexcl>750.00</unitspriceexcl>  
                <unitspriceinc></unitspriceinc>  
                <units>1</units>  
                <name>Man's bike summer edition</name>  
                <shortname>Man summer</shortname>  
                <subcode>BIKE.M</subcode>  
                <freetext1>8051</freetext1>  
            </line>  
        </lines>  
    </article>  
    
    
    
    <article result="1">  
        <header status="active">  
            <office>001</office>  
            <code>BIKE</code>  
            <type>normal</type>  
            <name>Bike summer edition</name>  
            <shortname>Bike summer edition</shortname>  
            <unitnamesingular>Piece</unitnamesingular>  
            <unitnameplural>Pieces</unitnameplural>  
            <vatcode>VH</vatcode>  
            <allowchangevatcode>false</allowchangevatcode>  
            <performancetype></performancetype>  
            <allowchangeperformancetype>false</allowchangeperformancetype>  
            <percentage>false</percentage>  
            <allowdiscountorpremium>true</allowdiscountorpremium>  
            <allowchangeunitsprice>false</allowchangeunitsprice>  
            <allowdecimalquantity>false</allowdecimalquantity>  
        </header>  
        <lines>  
            <line id="1" status="active" inuse="false">  
                <unitspriceexcl>750.00</unitspriceexcl>  
                <unitspriceinc></unitspriceinc>  
                <units>1</units>  
                <name>Lady's bike summer edition</name>  
                <shortname>Lady summer</shortname>  
                <subcode>BIKE.L</subcode>  
                <freetext1 name="Bike lady" shortname="" dimensiontype="PNL">8050</freetext1>  
                <freetext2 name="" shortname="" dimensiontype=""></freetext2>  
                <freetext3></freetext3>  
                <freetext4></freetext4>  
                <freetext5></freetext5>  
                <freetext6></freetext6>  
            </line>  
            <line id="2" status="active" inuse="false">  
                <unitspriceexcl>750.00</unitspriceexcl>  
                <unitspriceinc></unitspriceinc>  
                <units>1</units>  
                <name>Man's bike summer edition</name>  
                <shortname>Man summer</shortname>  
                <subcode>BIKE.M</subcode>  
                <freetext1 name="Bike man" shortname="" dimensiontype="PNL">8051</freetext1>  
                <freetext2 name="" shortname="" dimensiontype=""></freetext2>  
                <freetext3></freetext3>  
                <freetext4></freetext4>  
                <freetext5></freetext5>  
                <freetext6></freetext6>  
            </line>  
        </lines>  
    </article>  
    
