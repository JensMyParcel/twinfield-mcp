  * [](/documentation/)
  * Transaction Data
  * Journal transactions



On this page

# Journal transactions

A journal transaction is made up of two elements in Twinfield:

  * General information (header), such as company, day book, transaction date, currency, etc.
  * Transaction lines (lines), of which there are two types:
    * Detail lines.
    * VAT lines, with totals per VAT rate and the amounts on which the VAT was calculated.



A minimum of two transaction lines must be provided per day book.

It is possible to post several types of journal transactions:

  * Journal
  * Wage journal
  * Opening balance journal (can only be posted to period 0)
  * Year end journal (can only be posted to period 55)



## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example reads the journal transaction of transaction type `MEMO` and transaction number `202100001`.
    
    
    <read>  
        <type>transaction</type>  
        <office>001</office>  
        <code>MEMO</code>  
        <number>202100001</number>  
    </read>  
    

If the journal transaction does not exist an empty `transaction` element is returned containing an error.

## Create/Update​

If the journal transaction is not found it will be automatically created, otherwise it is updated.

Multiple transactions can be created at once by enclosing them by the `transactions` element.

### Root​

XML structure

  * Request
  * Response


    
    
    <transaction destiny="" autobalancevat="" raisewarning="">  
        <header></header>  
        <lines></lines>  
    </transaction>  
    
    
    
    <transaction location="">  
        <header></header>  
        <lines></lines>  
    </transaction>  
    

Element name: `transaction`

Name| Description  
---|---  
@destiny| Attribute to indicate the destiny of the journal transaction. Only used in the request XML.   
`temporary` = journal transaction will be saved as `provisional`   
`final` = journal transaction will be saved as `final`  
@location| Attribute to indicate the destiny of the journal transaction. Only used in the response XML.   
`temporary` = journal transaction is saved as `provisional`   
`final` = journal transaction is saved as `final`  
@autobalancevat| Should VAT be rounded `true` or not `false`? Rounding will only be done with a maximum of two cents.  
@raisewarning| Should warnings be given `true` or not `false`? Default `true`.  
header| Contains information general to the journal transaction.  
lines| Contains the journal transaction lines.  
  
### Header​

XML structure

  * Request
  * Response


    
    
    <header>  
        <office></office>  
        <code></code>  
        <number></number>  
        <period></period>  
        <currency></currency>  
        <regime></regime>  
        <date raisewarning=""></date>  
        <freetext1></freetext1>  
        <freetext2></freetext2>  
        <freetext3></freetext3>  
    </header>  
    
    
    
    <header>  
        <office name="" shortname=""></office>  
        <code name="" shortname=""></code>  
        <number></number>  
        <period></period>  
        <currency name="" shortname=""></currency>  
        <regime></regime>  
        <date></date>  
        <origin></origin>  
        <modificationdate></modificationdate>  
        <user name="" shortname=""></user>  
        <inputdate></inputdate>  
        <freetext1></freetext1>  
        <freetext2></freetext2>  
        <freetext3></freetext3>  
    </header>  
    

Element name: `header`

Name| Type| Description  
---|---|---  
office| code| Office code.  
code| code| Transaction type code.  
number| integer| Transaction number.   
When creating a new journal transaction, don't include this tag as the transaction number is determined by the system. When updating a journal transaction, the related transaction number should be provided.  
period| string| Period in YYYY/PP format. If this tag is not included or if it is left empty, the period is determined by the system based on the provided transaction date.  
currency| code| Currency code.  
regime| string| Type of regime. You can post transactions as 'Fiscal', 'Commercial', 'Economic' or 'Generic'. The default regime is 'Generic'. 'Generic' means that the transaction is visible for all regimes.  
date| date| Transaction date.   
Optionally, it is possible to suppress warnings about 'date out of range for the given period' by adding the `raisewarning` attribute and set its value to `false`. This overwrites the value of the `raisewarning` attribute as set on the root element.  
origin| code| The journal transaction origin.   
Read-only attribute.  
modificationdate| string| The date/time on which the journal transaction was modified the last time.   
Read-only attribute.  
user| string| The user who created the journal transaction.   
Read-only attribute.  
inputdate| string| The date/time on which the transaction was created.   
Read-only attribute.  
freetext1| text| Free text field 1 as entered on the transaction type.  
freetext2| text| Free text field 2 as entered on the transaction type.  
freetext3| text| Free text field 3 as entered on the transaction type.  
  
### Journal transaction lines​

XML structure

  * Request
  * Response



Detail line
    
    
    <line type="" id="">  
        <dim1></dim1>  
        <dim2></dim2>  
        <dim3></dim3>  
        <dim4></dim4>  
        <debitcredit></debitcredit>  
        <basevalue></basevalue>  
        <rate></rate>  
        <value></value>  
        <reprate></reprate>  
        <repvalue></repvalue>  
        <duedate></duedate>  
        <currencydate></currencydate>  
        <invoicenumber></invoicenumber>  
        <description></description>  
        <vatcode></vatcode>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

VAT line
    
    
    <line type="" id="">  
        <dim1></dim1>  
        <debitcredit></debitcredit>  
        <basevalue></basevalue>  
        <rate></rate>  
        <value></value>  
        <reprate></reprate>  
        <repvalue></repvalue>  
        <vatbaseturnover></vatbaseturnover>  
        <vatturnover></vatturnover>  
        <vatcode></vatcode>  
        <vatbasevalue></vatbasevalue>  
        <baseline></baseline>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

Detail line
    
    
    <line type="" id="">  
        <dim1 name="" shortname="" dimensiontype=""></dim1>  
        <dim2 name="" shortname="" dimensiontype=""></dim2>  
        <dim3 name="" shortname="" dimensiontype=""></dim3>  
        <dim4 name="" shortname="" dimensiontype=""></dim4>  
        <debitcredit></debitcredit>  
        <basevalue></basevalue>  
        <rate></rate>  
        <value></value>  
        <reprate></reprate>  
        <repvalue></repvalue>  
        <duedate></duedate>  
        <currencydate></currencydate>  
        <invoicenumber></invoicenumber>  
        <description></description>  
        <vatcode name="" shortname="" type=""></vatcode>  
        <matchstatus></matchstatus>  
        <matchlevel></matchlevel>  
        <relation></relation>  
        <basevalueopen></basevalueopen>  
        <repvalueopen></repvalueopen>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

VAT line
    
    
    <line type="" id="">  
        <dim1 name="" shortname="" dimensiontype=""></dim1>  
        <debitcredit></debitcredit>  
        <basevalue></basevalue>  
        <rate></rate>  
        <value></value>  
        <reprate></reprate>  
        <repvalue></repvalue>  
        <invoicenumber></invoicenumber>  
        <description></description>  
        <vatbaseturnover></vatbaseturnover>  
        <vatturnover></vatturnover>  
        <vatcode name="" shortname="" type=""></vatcode>  
        <vatbasevalue></vatbasevalue>  
        <vatvalue></vatvalue>  
        <baseline></baseline>  
        <matchstatus></matchstatus>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

Element name: `lines`

info

The VAT line is not mandatory. If the VAT fields are used, the calculations are validated. If the VAT amounts in the XML file do not match the amounts calculated by Twinfield the transaction will be rejected. Refer also to [VAT Calculation](/documentation/getting-started/vat-calculation) for more information.

Name| Type| Description  
---|---|---  
@type| `detail`   
`vat`| Line type.  
@id| integer| Line ID.  
dim1| string(16)| If line type = `detail` the journal balance account or profit and loss account.   
If line type = `vat` the VAT balance account. When an empty `dim1` is entered, by default the general ledger account will be taken as entered at the VAT code in Twinfield.  
dim2| string(16)| If line type = `detail` the customer or supplier or the cost center or empty.   
If line type = `vat` empty.  
dim3| string(16)| If line type = `detail` the project or asset or empty.   
If line type = `vat` empty.  
dim4| string(16)| Not in use.  
dim5| string(16)| Not in use.  
dim6| string(16)| Not in use.  
debitcredit| `debit`   
`credit`| The debit/credit indicator of the journal transaction line.  
value| money| If line type = `detail` amount without VAT.   
If line type = `vat` VAT amount.  
basevalue| money| Amount in the base currency.  
rate| decimal| The exchange rate used for the calculation of the base amount.  
repvalue| money| Amount in the reporting currency.  
reprate| decimal| The exchange rate used for the calculation of the reporting amount.  
description| string(40)| Description of the transaction line.  
invoicenumber| string(40)| Invoice number. Only if line type is `detail`.  
matchstatus| `available`   
`matched`   
`proposed`   
`notmatchable`| Payment status of the journal transaction.   
If line type `vat` always `notmatchable`.   
Read-only attribute.  
matchlevel| integer| Only if line type is `detail`. The level of the matchable dimension.   
Read-only attribute.  
relation| integer| Only if line type is `detail`.   
Read-only attribute.  
basevalueopen| money| Only if line type is `detail`. The amount still owed in base currency.   
Read-only attribute.  
repvalueopen| money| Only if line type is `detail`. The amount still owed in reporting currency.   
Read-only attribute.  
vatcode| code| Only if line type is `detail` or `vat`. VAT code.  
vatvalue| money| Only if line type is `detail`. VAT amount in the currency of the journal transaction.  
vatbasevalue| money| Only if line type is `detail`. VAT amount in base currency.  
vatrepvalue| money| Only if line type is `detail`. VAT amount in reporting currency.  
vatturnover| money| Only if line type is `vat`. Amount on which VAT was calculated in the currency of the journal transaction.  
vatbaseturnover| money| Only if line type is `vat`. Amount on which VAT was calculated in base currency.  
vatrepturnover| money| Only if line type is `vat`. Amount on which VAT was calculated in reporting currency.  
baseline| integer| Only if line type is `vat`. The value of the baseline tag is a reference to the line ID of the VAT rate.  
performancetype| `services`   
`goods`| Only if line type is `detail` or `vat`. Mandatory in case of an ICT VAT code. The performance type.  
performancecountry| string(2)| Only if line type is `detail` or `vat`. Mandatory in case of an ICT VAT code. The ISO country codes are used. If not added to the request, by default the country code of the customer will be taken.   
Note: For Greece use country code 'EL' and for Northern Ireland use 'XI'.  
performancevatnumber| string(16)| Only if line type is `detail` or `vat`. Mandatory in case of an ICT VAT code. If not added to the request, by default the VAT number of the customer will be taken.  
performancedate| date| Only if line type is `detail` or `vat`. Mandatory in case of an ICT VAT code but only if performancetype is `services`.  
destoffice| code| Office code. Used for inter company transactions – here you define in which company the transaction line should be posted.  
currencydate| date| Only if line type is `detail`. The line date. Only allowed if the line date in the journal book is set to `Allowed` or `Mandatory`.  
freechar| string(1)| Free character field.  
comment| string(255)| Comment set on the transaction line.  
matches| node| Contains matching information.  
  
#### Matches​

XML structure

  * Request
  * Response


    
    
    <matches>  
        <set>  
            <matchdate></matchdate>  
            <lines>  
                <line>  
                    <code></code>  
                    <number></number>  
                    <line></line>  
                    <method></method>  
                    <matchvalue></matchvalue>  
                </line>  
            </lines>  
            <matchvalue></matchvalue>  
        </set>  
    </matches>  
    
    
    
    <matches>  
        <set status="">  
            <matchdate></matchdate>  
            <lines>  
                <line>  
                    <code></code>  
                    <number></number>  
                    <line></line>  
                    <method></method>  
                    <matchvalue></matchvalue>  
                </line>  
            </lines>  
            <matchvalue></matchvalue>  
        </set>  
    </matches>  
    

Element name: `matches`

Name| Description  
---|---  
set| Contains information of the match set.  
  
#### Set​

Element name: `set`

Name| Type| Description  
---|---|---  
@status| `temporary`   
`final`| Status of the transaction. `temporary` if the transaction is posted provisional. `final` if the transaction is posted final.  
matchdate| date| Match date.  
matchvalue| money| Match value.  
lines| node| Contains the financial transactions that will be matched.  
  
#### Transaction lines​

Element name: `lines`

Name| Type| Description  
---|---|---  
line| node| Contains one single line of a financial transaction.  
  
#### Transaction line​

Element name: `line`

Name| Type| Description  
---|---|---  
code| code| Daybook code.  
number| integer| Transaction number.  
line| integer| Transaction line number.  
method| `payment`| Fixed value.  
matchvalue| money| Match value.  
  
### XML Example​

  * Request
  * Response


    
    
    <transaction destiny="temporary">  
        <header>  
            <office>001</office>  
            <code>MEMO</code>  
            <currency>EUR</currency>  
            <date>20211104</date>  
        </header>  
        <lines>  
            <line type="detail" id="1">  
                <dim1>4008</dim1>  
                <debitcredit>debit</debitcredit>  
                <value>435.55</value>  
            </line>  
            <line type="detail" id="2">  
                <dim1>1300</dim1>  
                <dim2>1000</dim2>  
                <debitcredit>credit</debitcredit>  
                <value>435.55</value>  
                <invoicenumber>11001770</invoicenumber>  
                <description>Invoice paid</description>  
            </line>  
        </lines>  
    </transaction>  
    
    
    
    <transaction result="1" location="temporary">  
        <header>  
            <office name="001" shortname="001">0-0-1-NL-001</office>  
            <code name="Memoriaal" shortname="Memo">MEMO</code>  
            <currency name="Euro" shortname="Euro">EUR</currency>  
            <date>20211104</date>  
            <origin>import</origin>  
            <user name="Marcel" shortname="Marcel">MARCEL</user>  
            <period>2021/11</period>  
            <number>202100003</number>  
        </header>  
        <lines>  
            <line type="detail" id="1">  
                <dim1 name="Payment difference" shortname="Payment difference" type="BAS" inuse="true" vatcode="" vatobligatory="false">4008</dim1>  
                <debitcredit>debit</debitcredit>  
                <value>435.55</value>  
                <rate>1</rate>  
                <basevalue>435.55</basevalue>  
                <reprate>1.500000000</reprate>  
                <repvalue>653.33</repvalue>  
                <invoicenumber>  
                </invoicenumber>  
                <matchstatus>notmatchable</matchstatus>  
            </line>  
            <line type="detail" id="2">  
                <dim1 name="Debiteuren" shortname="Debiteuren" type="BAS" inuse="true" vatcode="" vatobligatory="false">1300</dim1>  
                <dim2 name="Customer 0" shortname="" type="DEB" inuse="true" vatcode="" vatobligatory="false">1000</dim2>  
                <debitcredit>credit</debitcredit>  
                <value>435.55</value>  
                <invoicenumber>11001770</invoicenumber>  
                <description>Invoice paid</description>  
                <duedate>20211108</duedate>  
                <rate>1</rate>  
                <basevalue>435.55</basevalue>  
                <reprate>1.500000000</reprate>  
                <repvalue>653.33</repvalue>  
                <matchlevel>2</matchlevel>  
                <customersupplier>2</customersupplier>  
                <openvalue>435.55</openvalue>  
                <openbasevalue>435.55</openbasevalue>  
                <openrepvalue>653.33</openrepvalue>  
                <matchstatus>available</matchstatus>  
            </line>  
        </lines>  
    </transaction>  
    

## Post​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example posts the journal transaction of transaction type `MEMO` and transaction number `202100001`.

info

Only journal transactions with status `provisional` can be posted.
    
    
    <transaction action="post">  
        <office>001</office>  
        <code>MEMO</code>  
        <number>202100001</number>  
    </transaction>  
    

If the journal transaction does not exist a `transaction` element is returned containing an error.

## Delete​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example deletes the journal transaction of transaction type `MEMO` and transaction number `202100001`.

info

Only journal transactions with status `provisional` can be deleted.
    
    
    <transaction action="delete" reason="Test journal transaction, can be deleted.">  
        <office>001</office>  
        <code>MEMO</code>  
        <number>202100001</number>  
    </transaction>  
    

If the journal transaction does not exist a `transaction` element is returned containing an error.
