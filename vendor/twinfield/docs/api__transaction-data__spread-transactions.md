  * [](/documentation/)
  * Transaction Data
  * Spread transactions



On this page

# Spread transactions

A spread transaction is made up of two elements in Twinfield:

  * General information (header), such as company, transaction type, transaction date, currency, etc.
  * Transaction lines (lines) of the following type:
    * Detail lines.



A spread transaction always has one transaction to transfer the amounts from the detail lines of the original transaction to the intermediate account in the same period.

It also has one or more transactions to spread the amounts from the intermediate account over a number of periods.

A spread can only be made based on a purchase or sales transaction where the periods and intermediate account for the spread are supplied.

## Get​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

Get spreads for original transaction.

### Root​

XML structure

  * Request
  * Response


    
    
    <spread action="">  
        <original></original>  
    </spread>  
    
    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
        <spreadtransactions></spreadtransactions>  
    </spread>  
    

Element name: `spread`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`getspreadtransactioninfo` = get spread transactions for original transaction.  
original| Contains general information about the original transaction.  
settings| Contains spread settings.  
spreadtransactions| Contains a list of spread transactions.  
  
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
        <dim1></dim1>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </settings>  
    

or
    
    
    <settings>  
        <dim1></dim1>  
        <linessettings></linessettings>  
    </settings>  
    

Element name: `settings`

Name| Type| Description  
---|---|---  
dim1| code| Dimension with level 1.  
startperiod| string| Period in YYYY/PP format. First period for spreading transaction.  
endperiod| string| Period in YYYY/PP format. Last period for spreading transaction.  
linessettings| | Contains a list of settings for transaction detail lines.  
  
### Linessettings​

XML structure

  * Response


    
    
    <linessettings>  
        <linesettings></linesettings>  
        <linesettings></linesettings>  
    </linessettings>  
    

Element name: `linessettings`

Name| Description  
---|---  
linesettings| Contains spread settings for a transaction detail line.  
  
### Linessettings​

XML structure

  * Response


    
    
    <linesettings>  
        <lineid></lineid>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </linesettings>  
    

Element name: `linesettings`

Name| Type| Description  
---|---|---  
lineid| integer| Id of the transaction detail line.  
startperiod| string| Period in YYYY/PP format. First period for spreading transaction.  
endperiod| string| Period in YYYY/PP format. Last period for spreading transaction.  
  
### Spreadtransactions​

XML structure

  * Response


    
    
    <spreadtransactions>  
        <spreadtransaction></spreadtransaction>  
        <spreadtransaction></spreadtransaction>  
    </spreadtransactions>  
    

Element name: `spreadtransactions`

Name| Description  
---|---  
spreadtransaction| Contains general information about the spread transaction.  
  
### Spreadtransaction​

XML structure

  * Response


    
    
    <spreadtransaction>  
        <office></office>  
        <code></code>  
        <number></number>  
    </spreadtransaction>  
    

Element name: `spreadtransaction`

Name| Type| Description  
---|---|---  
office| code| Spread transaction office code.  
code| code| Spread transaction type code.  
number| integer| Spread transaction number.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <spread action="getspreadtransactioninfo">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
    </spread>  
    
    
    
    <spread result="1" action="getspreadtransactioninfo">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <startperiod>2021/01</startperiod>  
            <endperiod>2021/02</endperiod>  
        </settings>  
        <spreadtransactions>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100002</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>20210003</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100004</number>  
            </spreadtransaction>  
        </spreadtransactions>  
    </spread>  
    

## Post final​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

Spread final transaction.

**State before:**

  * Original final transaction is created



**State after:**

  * Original final transaction is created
  * Spread transaction is created
  * Spread settings are set
  * Spread link is created



### Root​

XML structure

  * Request
  * Response


    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
    </spread>  
    
    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
        <spreadtransactions></spreadtransactions>  
    </spread>  
    

Element name: `spread`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`postfinal` = spread transactions will be created for final transaction.  
original| Contains general information about the original transaction.  
settings| Contains spread settings.  
spreadtransactions| Contains a list of spread transactions.  
  
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

  * Request
  * Response


    
    
    <settings>  
        <dim1></dim1>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </settings>  
    
    
    
    <settings>  
        <dim1></dim1>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </settings>  
    

Element name: `settings`

Name| Type| Description  
---|---|---  
dim1| code| Dimension with level 1.  
startperiod| string| Period in YYYY/PP format. First period for spreading transaction.  
endperiod| string| Period in YYYY/PP format. Last period for spreading transaction.  
  
### Spreadtransactions​

XML structure

  * Response


    
    
    <spreadtransactions>  
        <spreadtransaction></spreadtransaction>  
        <spreadtransaction></spreadtransaction>  
    </spreadtransactions>  
    

Element name: `spreadtransactions`

Name| Description  
---|---  
spreadtransaction| Contains general information about the spread transaction.  
  
### Spreadtransaction​

XML structure

  * Response


    
    
    <spreadtransaction>  
        <office></office>  
        <code></code>  
        <number></number>  
    </spreadtransaction>  
    

Element name: `spreadtransaction`

Name| Type| Description  
---|---|---  
office| code| Spread transaction office code.  
code| code| Spread transaction type code.  
number| integer| Spread transaction number.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <spread action="postfinal">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <startperiod>2021/01</startperiod>  
            <endperiod>2021/02</endperiod>  
        </settings>  
    </spread>  
    
    
    
    <spread result="1" action="postfinal">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <startperiod>2021/01</startperiod>  
            <endperiod>2021/02</endperiod>  
        </settings>  
        <spreadtransactions>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100002</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>20210003</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100004</number>  
            </spreadtransaction>  
        </spreadtransactions>  
    </spread>  
    

## Post provisional​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

Spread provisional transaction.

**State before:**

  * Original provisional transaction is created



**State after:**

  * Original provisional transaction is created
  * Spread transaction is created
  * Spread settings are set
  * Spread link is created



### Root​

XML structure

  * Request
  * Response


    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
    </spread>  
    
    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
        <spreadtransactions></spreadtransactions>  
    </spread>  
    

Element name: `spread`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`postprovisional` = spread transactions will be created for provisional transaction.  
original| Contains general information about the original transaction.  
settings| Contains spread settings.  
spreadtransactions| Contains a list of spread transactions.  
  
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

  * Request
  * Response


    
    
    <settings>  
        <dim1></dim1>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </settings>  
    
    
    
    <settings>  
        <dim1></dim1>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </settings>  
    

Element name: `settings`

Name| Type| Description  
---|---|---  
dim1| code| Dimension with level 1.  
startperiod| string| Period in YYYY/PP format. First period for spreading transaction.  
endperiod| string| Period in YYYY/PP format. Last period for spreading transaction.  
  
### Spreadtransactions​

XML structure

  * Response


    
    
    <spreadtransactions>  
        <spreadtransaction></spreadtransaction>  
        <spreadtransaction></spreadtransaction>  
    </spreadtransactions>  
    

Element name: `spreadtransactions`

Name| Description  
---|---  
spreadtransaction| Contains general information about the spread transaction.  
  
### Spreadtransaction​

XML structure

  * Response


    
    
    <spreadtransaction>  
        <office></office>  
        <code></code>  
        <number></number>  
    </spreadtransaction>  
    

Element name: `spreadtransaction`

Name| Type| Description  
---|---|---  
office| code| Spread transaction office code.  
code| code| Spread transaction type code.  
number| integer| Spread transaction number.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <spread action="postprovisional">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <startperiod>2021/01</startperiod>  
            <endperiod>2021/02</endperiod>  
        </settings>  
    </spread>  
    
    
    
    <spread action="postprovisional" result="1">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <startperiod>2021/01</startperiod>  
            <endperiod>2021/02</endperiod>  
        </settings>  
        <spreadtransactions>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100002</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>20210003</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100004</number>  
            </spreadtransaction>  
        </spreadtransactions>  
    </spread>  
    

## Post final by lines​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

Spread final transaction by lines.

**State before:**

  * Original final transaction is created



**State after:**

  * Original final transaction is created
  * Spread transaction is created
  * Spread settings are set
  * Spread link is created



note

If all periods of line spread settings are equal to transaction period then undo action will be triggered. See Delete.

### Root​

XML structure

  * Request
  * Response


    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
    </spread>  
    
    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
        <spreadtransactions></spreadtransactions>  
    </spread>  
    

Element name: `spread`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`postfinalbylines` = spread transactions will be created for final transaction by lines.  
original| Contains general information about the original transaction.  
settings| Contains spread settings.  
spreadtransactions| Contains a list of spread transactions.  
  
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

  * Request
  * Response


    
    
    <settings>  
        <dim1></dim1>  
        <linessettings></linessettings>  
    </settings>  
    
    
    
    <settings>  
        <dim1></dim1>  
        <linessettings></linessettings>  
    </settings>  
    

Element name: `settings`

Name| Type| Description  
---|---|---  
dim1| code| Dimension with level 1.  
linessettings| | Contains a list of settings for transaction detail lines.  
  
### Linessettings​

XML structure

  * Request
  * Response


    
    
    <linessettings>  
        <linesettings></linesettings>  
        <linesettings></linesettings>  
    </linessettings>  
    
    
    
    <linessettings>  
        <linesettings></linesettings>  
        <linesettings></linesettings>  
    </linessettings>  
    

Element name: `linessettings`

Name| Description  
---|---  
linesettings| Contains spread settings for a transaction detail line.  
  
### Linesettings​

XML structure

  * Request
  * Response


    
    
    <linesettings>  
        <lineid></lineid>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </linesettings>  
    
    
    
    <linesettings>  
        <lineid></lineid>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </linesettings>  
    

Element name: `linesettings`

Name| Type| Description  
---|---|---  
lineid| integer| Id of the transaction detail line.  
startperiod| string| Period in YYYY/PP format. First period for spreading transaction.  
endperiod| string| Period in YYYY/PP format. Last period for spreading transaction.  
  
### Spreadtransactions​

XML structure

  * Response


    
    
    <spreadtransactions>  
        <spreadtransaction></spreadtransaction>  
        <spreadtransaction></spreadtransaction>  
    </spreadtransactions>  
    

Element name: `spreadtransactions`

Name| Description  
---|---  
spreadtransaction| Contains general information about the spread transaction.  
  
### Spreadtransaction​

XML structure

  * Response


    
    
    <spreadtransaction>  
        <office></office>  
        <code></code>  
        <number></number>  
    </spreadtransaction>  
    

Element name: `spreadtransaction`

Name| Type| Description  
---|---|---  
office| code| Spread transaction office code.  
code| code| Spread transaction type code.  
number| integer| Spread transaction number.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <spread action="postfinalbylines">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <linessettings>  
                <linesettings>  
                    <lineid>2</lineid>  
                    <startperiod>2021/01</startperiod>  
                    <endperiod>2021/02</endperiod>  
                </linesettings>  
                <linesettings>  
                    <lineid>4</lineid>  
                    <startperiod>2021/03</startperiod>  
                    <endperiod>2021/05</endperiod>  
                </linesettings>  
            </linessettings>  
        </settings>  
    </spread>  
    
    
    
    <spread result="1" action="postfinalbylines">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <linessettings>  
                <linesettings>  
                    <lineid>2</lineid>  
                    <startperiod>2021/01</startperiod>  
                    <endperiod>2021/02</endperiod>  
                </linesettings>  
                <linesettings>  
                    <lineid>4</lineid>  
                    <startperiod>2021/03</startperiod>  
                    <endperiod>2021/05</endperiod>  
                </linesettings>  
            </linessettings>  
        </settings>  
        <spreadtransactions>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100002</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>20210003</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100004</number>  
            </spreadtransaction>  
        </spreadtransactions>  
    </spread>  
    

## Post provisional by lines​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

Spread provisional transaction by lines.

**State before:**

  * Original provisional transaction is created



**State after:**

  * Original provisional transaction is created
  * Spread transaction is created
  * Spread settings are set
  * Spread link is created



note

If all periods of line spread settings are equal to transaction period then undo action will be triggered. See Delete.

### Root​

XML structure

  * Request
  * Response


    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
    </spread>  
    
    
    
    <spread action="">  
        <original></original>  
        <settings></settings>  
        <spreadtransactions></spreadtransactions>  
    </spread>  
    

Element name: `spread`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`postprovisionalbylines` = spread transactions will be created for provisional transaction by lines.  
original| Contains general information about the original transaction.  
settings| Contains spread settings.  
spreadtransactions| Contains a list of spread transactions.  
  
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

  * Request
  * Response


    
    
    <settings>  
        <dim1></dim1>  
        <linessettings></linessettings>  
    </settings>  
    
    
    
    <settings>  
        <dim1></dim1>  
        <linessettings></linessettings>  
    </settings>  
    

Element name: `settings`

Name| Type| Description  
---|---|---  
dim1| code| Dimension with level 1.  
linessettings| | Contains a list of settings for transaction detail lines.  
  
### Linessettings​

XML structure

  * Request
  * Response


    
    
    <linessettings>  
        <linesettings></linesettings>  
        <linesettings></linesettings>  
    </linessettings>  
    
    
    
    <linessettings>  
        <linesettings></linesettings>  
        <linesettings></linesettings>  
    </linessettings>  
    

Element name: `linessettings`

Name| Description  
---|---  
linesettings| Contains spread settings for a transaction detail line.  
  
### Linesettings​

XML structure

  * Request
  * Response


    
    
    <linesettings>  
        <lineid></lineid>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </linesettings>  
    
    
    
    <linesettings>  
        <lineid></lineid>  
        <startperiod></startperiod>  
        <endperiod></endperiod>  
    </linesettings>  
    

Element name: `linesettings`

Name| Type| Description  
---|---|---  
lineid| integer| Id of the transaction detail line.  
startperiod| string| Period in YYYY/PP format. First period for spreading transaction.  
endperiod| string| Period in YYYY/PP format. Last period for spreading transaction.  
  
### Spreadtransactions​

XML structure

  * Response


    
    
    <spreadtransactions>  
        <spreadtransaction></spreadtransaction>  
        <spreadtransaction></spreadtransaction>  
    </spreadtransactions>  
    

Element name: `spreadtransactions`

Name| Description  
---|---  
spreadtransaction| Contains general information about the spread transaction.  
  
### Spreadtransaction​

XML structure

  * Response


    
    
    <spreadtransaction>  
        <office></office>  
        <code></code>  
        <number></number>  
    </spreadtransaction>  
    

Element name: `spreadtransaction`

Name| Type| Description  
---|---|---  
office| code| Spread transaction office code.  
code| code| Spread transaction type code.  
number| integer| Spread transaction number.  
  
### XML Example​

XML structure

  * Request
  * Response


    
    
    <spread action="postprovisionalbylines">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <linessettings>  
                <linesettings>  
                    <lineid>2</lineid>  
                    <startperiod>2021/01</startperiod>  
                    <endperiod>2021/02</endperiod>  
                </linesettings>  
                <linesettings>  
                    <lineid>4</lineid>  
                    <startperiod>2021/03</startperiod>  
                    <endperiod>2021/05</endperiod>  
                </linesettings>  
            </linessettings>  
        </settings>  
    </spread>  
    
    
    
    <spread result="1" action="postprovisionalbylines">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
        <settings>  
            <dim1>2500</dim1>  
            <linessettings>  
                <linesettings>  
                    <lineid>2</lineid>  
                    <startperiod>2021/01</startperiod>  
                    <endperiod>2021/02</endperiod>  
                </linesettings>  
                <linesettings>  
                    <lineid>4</lineid>  
                    <startperiod>2021/03</startperiod>  
                    <endperiod>2021/05</endperiod>  
                </linesettings>  
            </linessettings>  
        </settings>  
        <spreadtransactions>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100002</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>20210003</number>  
            </spreadtransaction>  
            <spreadtransaction>  
                <office>001</office>  
                <code>KOSTENVERDELING</code>  
                <number>202100004</number>  
            </spreadtransaction>  
        </spreadtransactions>  
    </spread>  
    

## Delete​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

**State before:**

  * Original provisional transaction is created
  * Spread transaction is created
  * Spread settings are set
  * Spread link is created



**State after:**

  * Original provisional transaction is created
  * Spread transaction has been removed
  * Spread settings has been removed
  * Spread link has been removed



### Root​

XML structure

  * Request
  * Response


    
    
    <spread action="">  
        <original></original>  
    </spread>  
    
    
    
    <spread action="">  
        <original></original>  
    </spread>  
    

Element name: `spread`

Name| Description  
---|---  
@action| Attribute to indicate the required action for the original transaction.   
`undo` = spreading will be removed for provisional transaction.  
original| Contains general information about the original transaction.  
  
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


    
    
    <spread action="undo">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
    </spread>  
    
    
    
    <spread action="undo" result="1">  
        <original>  
            <office>001</office>  
            <code>INK</code>  
            <number>202100001</number>  
        </original>  
    </spread>  
    
