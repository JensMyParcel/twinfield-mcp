  * [](/documentation/)
  * Transaction Data
  * Reversal transactions



On this page

# Reversal transactions

A reversal transaction is made up of two elements in Twinfield:

  * General information (header), such as company, daybook, transaction date, currency, etc.
  * Transaction lines (lines) of two following types:
    * Detail lines.
    * VAT lines, with totals per VAT rate and the amounts on which the VAT was calculated.



A Reversal transaction is always a complete reverse of the Journal transaction it is based on.

## Get​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

Get information about reversed transaction.

### Root​

XML structure

  * Request
  * Response


    
    
    <reverse>  
        <original></original>  
    </reverse>  
    

When there is reversed transaction related to original
    
    
    <reverse>  
        <original></original>  
        <reversed></reversed>  
        <settings></settings>  
    </reverse>  
    

When there is no reversed transaction related to original
    
    
    <reverse>  
        <original></original>  
        <settings></settings>  
    </reverse>  
    

Element name: `reverse`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`getreversetransactioninfo` = get reverse transaction for original transaction.  
original| Contains general information about original transaction.  
reversed| Contains general information about reversed transaction.  
settings| Contains reverse settings.  
  
### Original​

XML structure

  * Request
  * Response


    
    
    <original>  
        <office></office>  
        <code></code>  
        <number></number>  
    </original>  
    
    
    
    <original>  
        <office></office>  
        <code></code>  
        <number></number>  
    </original>  
    

Element name: `original`

Name| Type| Description  
---|---|---  
office| code| Original transaction office code.  
code| code| Original transaction type code.  
number| integer| Original transaction number.  
  
### Reversed​

XML structure

  * Response


    
    
    <reversed>  
        <office></office>  
        <code></code>  
        <number></number>  
    </reversed>  
    

Element name: `reversed`

Name| Type| Description  
---|---|---  
office| code| Reversed transaction office code.  
code| code| Reversed transaction type code.  
number| integer| Reversed transaction number.  
  
### Settings​

XML structure

  * Response


    
    
    <settings>  
        <reverseinnextperiod></reverseinnextperiod>  
    </settings>  
    

Element name: `settings`

Name| Type| Description  
---|---|---  
reverseinnextperiod| boolean| Indicates that reversed transaction should be posted in the next period.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <reverse>  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
    </reverse>  
    

When there is reversed transaction related to original
    
    
    <reverse result="1">  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
        <reversed>  
            <office>COMPANY</office>  
            <code>MEMOTEGENBOEKING</code>  
            <number>202100001</number>  
        </reversed>  
        <settings>  
            <reverseinnextperiod>true</reverseinnextperiod>  
        </settings>  
    </reverse>  
    

When there is no reversed transaction related to original
    
    
    <reverse result="1">  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <reverseinnextperiod>false</reverseinnextperiod>  
        </settings>  
    </reverse>  
    

## Post final​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

**State before:**

  * Original final transaction is created



**State after:**

  * Original final transaction is created
  * Reversed final transaction is created
  * Reversal settings are set
  * Reversal link is created



### Root​

XML structure

  * Request
  * Response


    
    
    <reverse action="">  
        <original></original>  
    </reverse>  
    
    
    
    <reverse action="">  
        <original></original>  
        <reversed></reversed>  
        <settings></settings>  
    </reverse>  
    

Element name: `reverse`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`postfinal` = reversed transaction will be created and posted as `final`  
original| Contains general information about original transaction.  
reversed| Contains general information about reversed transaction.  
settings| Contains reverse settings.  
  
### Original​

XML structure

  * Request
  * Response


    
    
    <original>  
        <office></office>  
        <code></code>  
        <number></number>  
    </original>  
    
    
    
    <original>  
        <office></office>  
        <code></code>  
        <number></number>  
    </original>  
    

Element name: `original`

Name| Type| Description  
---|---|---  
office| code| Original transaction office code.  
code| code| Original transaction type code.  
number| integer| Original transaction number.  
  
### Reversed​

XML structure

  * Response


    
    
    <reversed>  
        <office></office>  
        <code></code>  
        <number></number>  
    </reversed>  
    

Element name: `reversed`

Name| Type| Description  
---|---|---  
office| code| Reversed transaction office code.  
code| code| Reversed transaction type code.  
number| integer| Reversed transaction number.  
  
### Settings​

XML structure

  * Response


    
    
    <settings>  
        <reverseinnextperiod></reverseinnextperiod>  
    </settings>  
    

Element name: `settings`

Name| Type| Description  
---|---|---  
reverseinnextperiod| boolean| Indicates that reversed transaction should be posted in the next period.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <reverse action="postfinal">  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
    </reverse>  
    
    
    
    <reverse action="postfinal" result="1">  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
        <reversed>  
            <office>COMPANY</office>  
            <code>MEMOTEGENBOEKING</code>  
            <number>202100001</number>  
        </reversed>  
        <settings>  
            <reverseinnextperiod>true</reverseinnextperiod>  
        </settings>  
    </reverse>  
    

## Post provisional​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

Save reverse settings for provisional transaction only.

**State before:**

  * Original provisional transaction is created



**State after:**

  * Original provisional transaction is created
  * Reversal settings are set



### Root​

XML structure

  * Request
  * Response


    
    
    <reverse action="">  
        <original></original>  
    </reverse>  
    
    
    
    <reverse action="">  
        <original></original>  
        <settings></settings>  
    </reverse>  
    

Element name: `reverse`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`postprovisional` = reverse settings will be saved for provisional transaction.  
original| Contains general information about original transaction.  
settings| Contains reverse settings.  
  
### Original​

XML structure

  * Request
  * Response


    
    
    <original>  
        <office></office>  
        <code></code>  
        <number></number>  
    </original>  
    
    
    
    <original>  
        <office></office>  
        <code></code>  
        <number></number>  
    </original>  
    

Element name: `original`

Name| Type| Description  
---|---|---  
office| code| Original transaction office code.  
code| code| Original transaction type code.  
number| integer| Original transaction number.  
  
### Settings​

XML structure

  * Response


    
    
    <settings>  
        <reverseinnextperiod></reverseinnextperiod>  
    </settings>  
    

Element name: `settings`

Name| Type| Description  
---|---|---  
reverseinnextperiod| boolean| Indicates that reversed transaction should be posted in the next period.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <reverse action="postprovisional">  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
    </reverse>  
    
    
    
    <reverse action="postprovisional" result="1">  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <reverseinnextperiod>true</reverseinnextperiod>  
        </settings>  
    </reverse>  
    

## Delete​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

**State before:**

  * Original provisional transaction is created
  * Reversal settings are set



**State after:**

  * Original provisional transaction is created
  * Reversal settings has been removed



### Root​

XML structure

  * Request
  * Response


    
    
    <reverse action="">  
        <original></original>  
    </reverse>  
    
    
    
    <reverse action="">  
        <original></original>  
    </reverse>  
    

Element name: `reverse`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`undo` = reverse settings will be removed for provisional transaction  
original| Contains general information about original transaction.  
  
### Original​

XML structure

  * Request
  * Response


    
    
    <original>  
        <office></office>  
        <code></code>  
        <number></number>  
    </original>  
    
    
    
    <original>  
        <office></office>  
        <code></code>  
        <number></number>  
    </original>  
    

Element name: `original`

Name| Type| Description  
---|---|---  
office| code| Original transaction office code.  
code| code| Original transaction type code.  
number| integer| Original transaction number.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <reverse action="undo">  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
    </reverse>  
    
    
    
    <reverse action="undo" result="1">  
        <original>  
            <office>COMPANY</office>  
            <code>MEMO</code>  
            <number>202100001</number>  
        </original>  
    </reverse>  
    
