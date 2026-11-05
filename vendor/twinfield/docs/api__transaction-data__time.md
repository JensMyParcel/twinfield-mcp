  * [](/documentation/)
  * Transaction Data
  * Time entry



On this page

# Time entry

A time entry is made up of two elements in Twinfield:

  * General information (header), such as company, user, date, project, activity, etc.
  * Time entry lines, of which there are two types:
    * Time lines.
    * Quantity lines.



A minimum of one time entry line must be provided.

## Create/Update​

If the journal transaction is not found it will be automatically created, otherwise it is updated.

Multiple transactions can be created at once by enclosing them by the `transactions` element.

### Root​

XML structure

  * Request
  * Response


    
    
    <teqs>  
        <teq>  
            <header></header>  
            <lines></lines>  
        </teq>  
    </teqs>  
    
    
    
    <teqs result="">  
        <teq result="">  
            <header></header>  
            <lines></lines>  
        </teq>  
    </teqs>  
    

Element name: `teqs`

Name| Description  
---|---  
teq| node  
  
Element name: `teq`

Name| Description  
---|---  
header| Contains general information about the time entry.  
lines| Contains the time entry lines.  
  
### Header​

XML structure

  * Request
  * Response


    
    
    <header>  
        <office></office>  
        <code></code>  
        <user></user>  
        <date></date>  
        <prj1></prj1>  
        <prj2></prj2>  
    </header>  
    
    
    
    <header>  
        <office></office>  
        <code></code>  
        <user name="" shortname=""></user>  
        <date></date>  
        <prj1 name="" shortname=""></prj1>  
        <prj2 name="" shortname=""></prj2>  
        <accountsreceivable></accountsreceivable>  
        <authoriser name="" result="" shortname=""></authoriser>  
    </header>  
    

Element name: `header`

Name| Type| Description  
---|---|---  
office| code| Office code. Mandatory.  
code| `DIRECT`   
`INDIRECT`   
`PERSONAL`| Transaction type.  
user| code| The user for which time is entered.  
date| date| The date for which time is entered.  
prj1| code| The project.  
prj2| code| The activity.  
accountsreceivable| code| The customer code.   
Read-only attribute.  
authoriser| code| The authoriser of the time entry.   
Read-only attribute.  
  
### Lines​

XML structure

  * Request
  * Response


    
    
    <lines>  
        <line></line>  
    </lines>  
    
    
    
    <lines>  
        <line type="" id=""></line>  
    </lines>  
    

Element name: `lines`

Name| Type| Description  
---|---|---  
lines| node|   
  
### Line​

XML structure

  * Request
  * Response


    
    
    <line type="TIME">  
        <duration></duration>  
        <description></description>  
        <billable></billable>  
        <ratecode></ratecode>  
    </line>  
    <line type="QUANTITY" id="">  
        <value1></value1>  
        <ratecode1></ratecode1>  
        <currency1></currency1>  
        <billable1></billable1>  
    </line>  
    
    
    
    <line type="TIME" id="">  
        <duration internal="" external=""></duration>  
        <description></description>  
        <billable></billable>  
        <ratecode internal="" external="" units="" name="" shortname=""></ratecode>  
        <currency></currency>  
    </line>  
    <line type="QUANTITY" id="">  
        <value1 internal="" external=""></value1>  
        <ratecode1 internal="" external="" units="" name="" shortname=""></ratecode1>  
        <currency1></currency1>  
        <billable1></billable1>  
    </line>  
    

Element name: `line`

Name| Type| Description  
---|---|---  
@type| `TIME`   
`QUANTITY`| Time entry line type.  
@id| integer| Read-only attribute.  
@internal| integer| Read-only attribute.  
@external| integer| Read-only attribute.  
@units| integer| Read-only attribute.  
@name| integer| Read-only attribute.  
@shortname| integer| Read-only attribute.  
duration| integer| The duration entered in hours. No fractions are allowed.   
Only if `@type` is `TIME`.  
description| string| The description of the time entry line.   
Only if `@type` is `TIME`.  
billable| `0`   
`1`| Is the time entry line billable (`1`) or not (`0`).   
Only if `@type` is `TIME`.  
ratecode| code| The rate code.   
Only if `@type` is `TIME`.  
currency| code| The currency code.   
Only if `@type` is `TIME`.   
Read-only attribute.  
value1| double| The number of quantities.   
Only if `@type` is `QUANTITY`.  
ratecode1| code| The rate code.   
Only if `@type` is `QUANTITY`.  
currency1| code| The currency code.   
Only if `@type` is `QUANTITY`.   
Read-only attribute.  
billable1| `0`   
`1`| Is the time entry line billable (`1`) or not (`0`).   
Only if `@type` is `QUANTITY`.  
  
### XML Example​

  * Request
  * Response


    
    
    <teqs>  
        <teq>  
            <header>  
                <office>001</office>  
                <code>DIRECT</code>  
                <user>TEST</user>  
                <date>20211228</date>  
                <prj1>P0099</prj1>  
                <prj2>A010</prj2>  
            </header>  
            <lines>  
                <line type="TIME">  
                    <duration>240</duration>  
                    <description>Deploy</description>  
                </line>  
                <line type="QUANTITY">  
                    <value1>1.5</value1>  
                </line>  
            </lines>  
        </teq>  
    </teqs>  
    
    
    
    <teqs result="1">  
        <teq result="1">  
            <header>  
                <office>001</office>  
                <code>DIRECT</code>  
                <user name="Test" shortname="Test">TEST</user>  
                <date>20211228</date>  
                <prj1 name="API documentation" shortname="API documentation">P0099</prj1>  
                <prj2 name="Deploy API documentation" shortname="API documentation">A010</prj2>  
                <accountsreceivable>1010</accountsreceivable>  
                <authoriser name="Site supervisor" result="1" shortname="Site supervisor">SUPER</authoriser>  
            </header>  
            <lines>  
                <line type="TIME" id="1">  
                    <duration internal="240.00" external="400.00">240</duration>  
                    <description>Deploy</description>  
                    <billable>1</billable>  
                    <ratecode internal="15.00" external="25.00" units="15.00" name="Normal rate" shortname="Normal rate">T001</ratecode>  
                    <currency>EUR</currency>  
                </line>  
                <line type="QUANTITY" id="2">  
                    <value1 internal="15.00" external="30.00">1.5</value1>  
                    <ratecode1 internal="10.00" external="20.00" units="1" name="KM" shortname="KM">KM</ratecode1>  
                    <currency1>EUR</currency1>  
                    <billable1>0</billable1>  
                </line>  
            </lines>  
        </teq>  
    </teqs>  
    
