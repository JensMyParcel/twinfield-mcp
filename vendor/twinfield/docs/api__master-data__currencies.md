  * [](/documentation/)
  * Master Data
  * Currencies



On this page

# Currencies

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

CUR

### Search fields​

Field ID| Fields searched  
---|---  
0| code and name  
1| code  
2| name  
  
The method will return an array containing validation messages. If there are no errors, then the data parameter will contain the actual search result.

## Create/Update/Delete​

If a currency is not found it will be automatically created, otherwise it is updated. Set `currency/@status` to `deleted` for deleting a currency.

### Root​

XML structure
    
    
    <currency>  
        <code></code>  
        <office></office>  
        <name></name>  
        <shortname></shortname>  
        <rates></rates>  
    </currency>  
    

Element name: `currency`

Name| Description  
---|---  
code| The code of the currency.  
office| Office code of the currency.  
name| Name of the currency.  
shortname| Short name of the currency.  
rates| Contains the rate information of this currency.  
  
### Rates​

XML structure
    
    
    <rate>  
        <startdate></startdate>  
        <rate></rate>  
    </rate>  
    

Element name: `rate`

Name| Description  
---|---  
@status| `deleted`   
For creating and updating status may be left empty. For deleting `deleted` should be used.  
startdate| Starting date of the rate  
rate| Conversion rate to be used as of the start date  
  
### Example​

  * Request
  * Response


    
    
    <currencies>  
        <currency>  
            <office>001</office>  
            <code>EUR</code>  
            <name>Euro</name>  
            <shortname>€</shortname>  
            <rates>  
                <rate>  
                    <startdate>20120101</startdate>  
                    <rate>0.8282</rate>  
                </rate>  
            </rates>  
        </currency>  
    </currencies>  
    
    
    
    <currencies>  
        <currency status="active" result="1">  
            <office>001</office>  
            <code>EUR</code>  
            <name>Euro</name>  
            <shortname>€</shortname>  
            <rates>  
                <rate>  
                    <startdate>20120101</startdate>  
                    <rate>0.8282</rate>  
                </rate>  
            </rates>  
        </currency>  
    </currencies>  
    
