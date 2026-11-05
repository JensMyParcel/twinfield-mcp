  * [](/documentation/)
  * Master Data
  * Projects



On this page

# Projects

> Dimension type PRJ

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
level| enumeration: `1`, `2`, `3`, `4`, `5`, `6`| Specifies the dimension level. When section is set to `teq`, level is mandatory. Set it to `1` to retrieve the projects.  
section| teq| Restricts to time & expenses dimensions.  
dimtype| `PRJ`| Shows the project dimensions.  
modifiedsince| string `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to dimensions modified after, on or at the specified date (and time).  
group| «group code»| Specifies the dimension group (wildcards allowed).  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example reads the project settings of the project EXAMPLE:
    
    
    <read>  
        <type>dimensions</type>  
        <office>001</office>  
        <dimtype>PRJ</dimtype>  
        <code>EXAMPLE</code>  
    </read>  
    

If the project does not exist an empty `project` element is returned containing an error.

## Create/Update/Delete​

If the dimension is not found it will be automatically created, otherwise it is updated. Set `dimension/header/@status` to `deleted` for deleting a dimension. Set `dimension/header/@status` to `active` for activating a deleted or hidden dimension.

### Root​

XML structure
    
    
    <dimension>  
        <financials></financials>  
        <projects></projects>  
    </dimension>  
    

Element name: `dimension`

Name| Description  
---|---  
dimension| Contains information general to the project dimension.  
financials| Contains the financial settings of the project dimension.  
projects| Contains detailed information of the project dimension.  
  
### Dimension​

XML structure

  * Request
  * Response


    
    
    <dimension status="">  
        <office></office>  
        <type></type>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <financials></financials>  
        <projects></projects>  
    </dimension>  
    
    
    
    <dimension status="" result="">  
        <office></office>  
        <type></type>  
        <code></code>  
        <uid></uid>  
        <name></name>  
        <shortname></shortname>  
        <inuse></inuse>  
        <behaviour></behaviour>  
        <touched></touched>  
        <financials></financials>  
        <projects></projects>  
    </dimension>  
    

Element name: `header`

Name| Type| Description  
---|---|---  
@status| `active`   
`deleted`   
`hide`| For creating and updating status may be left empty. For deleting `deleted` should be used. In case a project is in use, its status has been changed into `hide`. Hidden projects can be activated by using `active`.  
office| code| Office code.  
type| code| Dimension type. See [Dimension type](/documentation/api/master-data/dimension-types).   
Dimension type of projects is `PRJ`.  
code| code| Dimension code, must be compliant with the mask of the `PRJ` [Dimension type](/documentation/api/master-data/dimension-types).  
uid| string| Unique identification of the dimension.   
Read-only attribute.  
name| string(80)| Project description.  
shortname| string(20)| Short project description.  
inuse| `true`   
`false`| Indicates whether the project is used in a transaction or not.   
Read-only attribute.  
behaviour| `normal`   
`system`   
`template`| Determines the behaviour of dimensions.   
Read-only attribute.  
touched| integer| Count of the number of times the dimension settings are changed.   
Read-only attribute.  
financials| node|   
projects| node|   
  
### Financials​

XML structure

  * Request
  * Response


    
    
    <financials>  
        <vatcode></vatcode>  
    </financials>  
    
    
    
    <financials>  
        <vatcode name="" shortname="" type=""></vatcode>  
    </financials>  
    

Element name: `financials`

Property name| Value| Description  
---|---|---  
vatcode| string(16)| The VAT code if one code will apply for all activities within the project. Note that if any VAT codes are defined on activity level, these will apply regardless of what is defined on project level.  
  
### Projects​

XML structure

  * Request
  * Response


    
    
    <projects>  
        <validfrom></validfrom>  
        <validtill></validtill>  
        <invoicedescription></invoicedescription>  
        <authoriser locked="" inherit=""></authoriser>  
        <customer locked="" inherit=""></customer>  
        <billable locked="" inherit="" forratio=""></billable>  
        <rate locked="" inherit=""></rate>  
        <quantities></quantities>  
    </projects>  
    
    
    
    <projects>  
        <validfrom></validfrom>  
        <validtill></validtill>  
        <invoicedescription></invoicedescription>  
        <authoriser locked="" inherit=""></authoriser>  
        <customer locked="" inherit=""></customer>  
        <billable locked="" inherit="" forratio=""></billable>  
        <rate locked="" inherit=""></rate>  
        <quantities></quantities>  
    </projects>  
    

Element name: `projects`

Property name| Value| Description  
---|---|---  
validfrom| date| A project can be set to only be valid for certain dates. Users will then only be able to book hours to the project during these dates. When both `validfrom` as well `validto` are filled in, time can be entered during this period. When only `validfrom` is filled in, time can be entered starting from this date. When only `validto` is filled in, time can be entered until this date. When both `validfrom` as well `validto` are empty, time can be entered without limitations.  
validto| date| A project can be set to only be valid for certain dates. Users will then only be able to book hours to the project during these dates. When both `validfrom` as well `validto` are filled in, time can be entered during this period. When only `validfrom` is filled in, time can be entered starting from this date. When only `validto` is filled in, time can be entered until this date. When both `validfrom` as well `validto` are empty, time can be entered without limitations.  
invoicedescription| string(128)| This field can be used to enter a longer project description which will be available on the invoice template.  
authoriser| code| A specific authoriser for a project.   
If "change" = `allow` then `locked = false` and `inherit = false`   
If "change" = `disallow` then `locked = true` and `inherit = false`   
If "change" = `inherit` then `locked = true` and `inherit = true`  
customer| code| A project always needs to be linked to a customer. Choose to have the customer ‘inherited’ (from an activity) or you can specify the customer here.   
If "change" = `allow` then `locked = false` and `inherit = false`   
If "change" = `disallow` then `locked = true` and `inherit = false`   
If "change" = `inherit` then `locked = true` and `inherit = true`  
billable| `true`   
`false`| Choose to make a project billable (`true`) or not (`false`) and whether or not it should be included when calculating the "productivity" ratio (`@forratio`). You could also decide that these settings should be inherited from activity or user level (`@inherit`). You can also set whether a change of these settings is allowed or disallowed when a user is entering their timesheet (`@locked`).   
If "change" = `allow` then `locked = false` and `inherit = false`   
If "change" = `disallow` then `locked = true` and `inherit = false`   
If "change" = `inherit` then `locked = true` and `inherit = true`  
rate| code| Choose to define a specific rate code here or you could also decide that these settings should be inherited from activity or user level (`@inherit`). You can also set whether a change of the rate code is allowed or disallowed when a user is entering their timesheet (`@locked`).   
If "change" = `allow` then `locked = false` and `inherit = false`   
If "change" = `disallow` then `locked = true` and `inherit = false`   
If "change" = `inherit` then `locked = true` and `inherit = true`  
quantities| node|   
  
#### Quantities​

XML structure

  * Request
  * Response


    
    
    <quantity>  
        <label></label>  
        <rate></rate>  
        <billable locked=""></billable>  
        <mandatory></mandatory>  
    </quantity>  
    
    
    
    <quantity>  
        <label></label>  
        <rate></rate>  
        <billable locked=""></billable>  
        <mandatory></mandatory>  
    </quantity>  
    

Element name: `quantity`

Property name| Value| Description  
---|---|---  
label| string(36)| The label of the quantity.  
rate| code| The rate.  
billable| `true`   
`false`| Is the quantity line billable or not.   
If "billable" = `true` and "change is not allowed" then `locked = true`   
If "billable" = `true` and "change is allowed" then `locked = false`  
mandatory| `true`   
`false`| Is the quantity line mandatory or not.  
  
### Example​

  * Request
  * Response


    
    
    <dimension status="active">  
        <office>001</office>  
        <type>PRJ</type>  
        <code>P0099</code>  
        <name>API documentation</name>  
        <shortname>API documentation</shortname>  
        <projects>  
            <invoicedescription>API documentation</invoicedescription>  
            <authoriser locked="true" inherit="false">SUPER</authoriser>  
            <customer locked="false" inherit="false">1010</customer>  
            <billable locked="false" inherit="false" forratio="false">true</billable>  
            <rate locked="true" inherit="false">T001</rate>  
            <quantities>  
                <quantity>  
                    <label>KM</label>  
                    <rate>KM</rate>  
                    <billable locked="true">false</billable>  
                    <mandatory>false</mandatory>  
                </quantity>  
            </quantities>  
        </projects>  
    </dimension>  
    
    
    
    <dimension status="active" result="1">  
        <office name="001" shortname="001">001</office>  
        <type name="Kostendrager" shortname="Kostendrager">PRJ</type>  
        <code>P0098</code>  
        <name>API documentation</name>  
        <shortname>API documentation</shortname>  
        <projects>  
            <invoicedescription>API documentation</invoicedescription>  
            <authoriser locked="true" inherit="false">SUPER</authoriser>  
            <customer locked="false" inherit="false">1010</customer>  
            <billable locked="false" inherit="false" forratio="false">true</billable>  
            <rate locked="true" inherit="false">T001</rate>  
            <quantities>  
                <quantity>  
                    <label>KM</label>  
                    <rate>KM</rate>  
                    <billable locked="true">false</billable>  
                    <mandatory>false</mandatory>  
                </quantity>  
            </quantities>  
            <validfrom/>  
            <validtill/>  
        </projects>  
        <uid>6d7bfbf1-58ce-4699-9a78-4fb50bc545be</uid>  
        <inuse>false</inuse>  
        <behaviour>normal</behaviour>  
        <touched>0</touched>  
        <financials>  
            <vatcode name="" shortname="" type=""/>  
        </financials>  
    </dimension>  
    
