  * [](/documentation/)
  * Master Data
  * Dimension groups



On this page

# Dimension groups

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

GRP

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
prefix| string| Specifies that the search field should start with the given value.  
dimtype| enumeration: `BAS`, `PNL`, `CRD`, `DEB`, `KPL`, `PRJ`, `AST`, `ACT`| Specifies the dimension type. The result data will only show the dimension groups of the specified dimension type.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the settings of dimension group EXAMPLE.
    
    
    <dimensiongroup>  
        <office>001</office>  
        <code>EXAMPLE</code>  
    </dimensiongroup>  
    

## Create/Update/Delete​

### Root​

Element name: `dimensiongroup`

Name| Description  
---|---  
header| Contains information general to the dimension group.  
dimension| Contains the dimensions part of the dimension group.  
  
### Dimension group​

Element name: `dimensiongroup`

Name| Type| Description  
---|---|---  
@status| `active`   
`deleted`| For creating and updating `active` should be used. For deleting `deleted` should be used.  
office| code| Office code.  
code| code| Dimension group code.  
name| string(40)| Name of the dimension group.  
shortname| string(20)| Short name of the dimension group.  
dimensions| node| The dimensions part of the dimension group.  
  
#### Dimensions​

Element name: `dimension`

Name| Type| Description  
---|---|---  
type| code| [Dimension type](/documentation/api/master-data/dimension-types).  
code| code| Code of the dimension.  
  
### XML​
    
    
    <dimensiongroup>  
        <office>001</office>  
        <code>EXAMPLE</code>  
        <name>Example dimension group</name>  
        <shortname>Dimension group</shortname>  
        <dimensions>  
            <dimension>  
                <type>CRD</type>  
                <code>2000</code>  
            </dimension>  
            <dimension>  
                <type>CRD</type>  
                <code>2001</code>  
            </dimension>  
        </dimensions>  
    </dimensiongroup>  
    
