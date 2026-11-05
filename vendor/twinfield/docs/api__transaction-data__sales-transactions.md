  * [](/documentation/)
  * Transaction Data
  * Sales transactions



On this page

# Sales transactions

info

In Twinfield there is a clear distinction between sales invoices and sales transactions. Sales invoices are the invoices, which will be sent to customers. Sales transactions are the related financial transactions that will be posted in the accounting part of Twinfield.

A sales transaction is made up of two elements in Twinfield:

  * General information (header), such as company, day book, transaction date, currency, etc.
  * Transaction lines (lines), of which there are three types:
    * Total line, with any relevant customer details.
    * Detail lines, which are an analysis of the total line.
    * VAT lines, with totals per VAT rate and the amounts on which the VAT was calculated.



A minimum of two transaction lines must be provided per day book.

## Find​

Web service type: Method driven

Resource location: `/webservices/finder.asmx?wsdl`

Lists unpaid invoices.

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

IVT

### Search fields​

Field ID| Fields searched  
---|---  
0| Customer code, name, outstanding invoice amount and invoicenumber  
  
The method will return an array containing validation messages. If there are no errors, then the data parameter will contain the actual search result.

### Options

Option| Type| Description  
---|---|---  
dim1| code| Filters on the dimension on level 1.  
dim2| code| Filters on the dimension on level 2.  
dim3| code| Filters on the dimension on level 3.  
value| money| Filters on the original invoice value.  
openvalue| money| Filters on the outstanding value.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example reads the sales transaction of transaction type `VRK` and transaction number `202100001`.

info

The used transaction type, in the example below `VRK` depends on the `administration`.
    
    
    <read>  
        <type>transaction</type>  
        <office>001</office>  
        <code>VRK</code>  
        <number>202100001</number>  
    </read>  
    

If the sales transaction does not exist an empty `transaction` element is returned containing an error.

## Create/Update​

If the sales transaction is not found it will be automatically created, otherwise it is updated.

Multiple transactions can be created at once by enclosing them by the `transactions` element.

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
@destiny| Attribute to indicate the destiny of the sales transaction. Only used in the request XML.   
`temporary` = sales transaction will be saved as `provisional`   
`final` = sales transaction will be saved as `final`  
@location| Attribute to indicate the destiny of the sales transaction. Only used in the response XML.   
`temporary` = sales transaction is saved as `provisional`   
`final` = sales transaction is saved as `final`  
@autobalancevat| Should VAT be rounded `true` or not `false`? Rounding will only be done with a maximum of two cents.  
@raisewarning| Should warnings be given `true` or not `false`? Default `true`.  
header| Contains information general to the sales transaction.  
lines| Contains the sales transaction lines.  
  
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
        <date raisewarning=""></date>  
        <duedate></duedate>  
        <invoicenumber raisewarning=""></invoicenumber>  
        <paymentreference></paymentreference>  
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
        <date></date>  
        <origin></origin>  
        <originreference></originreference>  
        <modificationdate></modificationdate>  
        <user name="" shortname=""></user>  
        <inputdate></inputdate>  
        <duedate></duedate>  
        <invoicenumber></invoicenumber>  
        <paymentreference></paymentreference>  
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
When creating a new sales transaction, don't include this tag as the transaction number is determined by the system. When updating a sales transaction, the related transaction number should be provided.  
period| string| Period in YYYY/PP format. If this tag is not included or if it is left empty, the period is determined by the system based on the provided transaction date.  
currency| code| Currency code.  
date| date| Transaction date.   
Optionally, it is possible to suppress warnings about 'date out of range for the given period' by adding the `raisewarning` attribute and set its value to `false`. This overwrites the value of the `raisewarning` attribute as set on the root element.  
origin| code| The sales transaction origin.   
Read-only attribute.  
originreference| string(36)| The sales transaction origin reference (id). Provided in form of Guid.   
Sample: `f386393c-e4ba-439a-add4-3b366535d7bf`.   
Read-only attribute.  
modificationdate| string| The date/time on which the sales transaction was modified the last time.   
Read-only attribute.  
user| string| The user who created the sales transaction.   
Read-only attribute.  
inputdate| string| The date/time on which the transaction was created.   
Read-only attribute.  
duedate| date| Due date.  
invoicenumber| string(40)| Invoice number.   
Optionally, it is possible to suppress warnings about 'double invoice numbers' by adding the `raisewarning` attribute and set its value to `false`. This overwrites the value of the `raisewarning` attribute as set on the root element.  
paymentreference| string(50)| Payment reference of the transaction.   
If payment reference is not specified, the `paymentreference` section must be omitted  
freetext1| text| Free text field 1 as entered on the transaction type.  
freetext2| text| Free text field 2 as entered on the transaction type.  
freetext3| text| Free text field 3 as entered on the transaction type.  
  
### Sales transaction lines​

XML structure

  * Request
  * Response



Total line
    
    
    <line type="total" id="">  
        <dim1></dim1>  
        <dim2></dim2>  
        <debitcredit></debitcredit>  
        <value></value>  
        <basevalue></basevalue>  
        <rate></rate>  
        <repvalue></repvalue>  
        <reprate></reprate>  
        <description></description>  
        <vattotal></vattotal>  
        <vatbasetotal></vatbasetotal>  
        <vatreptotal></vatreptotal>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

Detail line
    
    
    <line type="detail" id="">  
        <dim1></dim1>  
        <dim2></dim2>  
        <dim3></dim3>  
        <debitcredit></debitcredit>  
        <value></value>  
        <basevalue></basevalue>  
        <rate></rate>  
        <repvalue></repvalue>  
        <reprate></reprate>  
        <description></description>  
        <vatcode></vatcode>  
        <vatbasevalue></vatbasevalue>  
        <vatrepvalue></vatrepvalue>  
        <destoffice></destoffice>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

VAT line
    
    
    <line type="vat" id="">  
        <dim1></dim1>  
        <dim2></dim2>  
        <dim3></dim3>  
        <debitcredit></debitcredit>  
        <value></value>  
        <basevalue></basevalue>  
        <rate></rate>  
        <repvalue></repvalue>  
        <reprate></reprate>  
        <description></description>  
        <vatbaseturnover></vatbaseturnover>  
        <vatturnover></vatturnover>  
        <vatcode></vatcode>  
        <vatbasevalue></vatbasevalue>  
        <vatvalue></vatvalue>  
        <baseline></baseline>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

Total line
    
    
    <line type="total" id="">  
        <dim1 name="" shortname="" dimensiontype=""></dim1>  
        <dim2 name="" shortname="" dimensiontype=""></dim2>  
        <debitcredit></debitcredit>  
        <value></value>  
        <basevalue></basevalue>  
        <rate></rate>  
        <repvalue></repvalue>  
        <reprate></reprate>  
        <description></description>  
        <vattotal></vattotal>  
        <vatbasetotal></vatbasetotal>  
        <vatreptotal></vatreptotal>  
        <matchstatus></matchstatus>  
        <matchlevel></matchlevel>  
        <relation></relation>  
        <basevalueopen></basevalueopen>  
        <repvalueopen></repvalueopen>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

Detail line
    
    
    <line type="detail" id="">  
        <dim1 name="" shortname="" dimensiontype=""></dim1>  
        <dim2 name="" shortname="" dimensiontype=""></dim2>  
        <dim3 name="" shortname="" dimensiontype=""></dim3>  
        <debitcredit></debitcredit>  
        <value></value>  
        <basevalue></basevalue>  
        <rate></rate>  
        <repvalue></repvalue>  
        <reprate></reprate>  
        <description></description>  
        <vatcode name="" shortname="" type=""></vatcode>  
        <vatvalue></vatvalue>  
        <vatbasevalue></vatbasevalue>  
        <vatrepvalue></vatrepvalue>  
        <destoffice></destoffice>  
        <matchstatus></matchstatus>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

VAT line
    
    
    <line type="vat" id="">  
        <dim1 name="" shortname="" dimensiontype=""></dim1>  
        <dim2 name="" shortname="" dimensiontype=""></dim2>  
        <dim3 name="" shortname="" dimensiontype=""></dim3>  
        <debitcredit></debitcredit>  
        <value></value>  
        <basevalue></basevalue>  
        <rate></rate>  
        <repvalue></repvalue>  
        <reprate></reprate>  
        <description></description>  
        <vatbaseturnover></vatbaseturnover>  
        <vatturnover></vatturnover>  
        <vatcode name="" shortname="" type=""></vatcode>  
        <vatbasevalue></vatbasevalue>  
        <vatvalue></vatvalue>  
        <baseline></baseline>  
        <matchstatus></matchstatus>  
        <matchlevel></matchlevel>  
        <relation></relation>  
        <freechar></freechar>  
        <comment></comment>  
    </line>  
    

Element name: `lines`

info

The VAT line is not mandatory. If the VAT fields are used, the calculations are validated. If the VAT amounts in the XML file do not match the amounts calculated by Twinfield the transaction will be rejected. Refer also to [VAT Calculation](/documentation/getting-started/vat-calculation) for more information.

Name| Type| Description  
---|---|---  
@type| `total`   
`detail`   
`vat`| Line type.  
@id| integer| Line ID.  
dim1| string(16)| If line type = `total` the accounts receivable balance account. When `dim1` is omitted, by default the general ledger account will be taken as entered at the customer in Twinfield.   
If line type = `detail` the profit and loss account.   
If line type = `vat` the VAT balance account. When an empty `dim1` is entered, by default the general ledger account will be taken as entered at the VAT code in Twinfield.  
dim2| string(16)| If line type = `total` the account receivable.   
If line type = `detail` the cost center or empty.   
If line type = `vat` empty.  
dim3| string(16)| If line type = `total` empty.   
If line type = `detail` the project or asset or empty.   
If line type = `vat` empty.  
dim4| string(16)| Not in use.  
dim5| string(16)| Not in use.  
dim6| string(16)| Not in use.  
debitcredit| `debit`   
`credit`| If line type = `total`   
In case of a 'normal' sales transaction `debit`.   
In case of a credit sales transaction `credit`.   
If line type = `detail` or `vat`   
In case of a 'normal' sales transaction `credit`.   
In case of a credit sales transaction `debit`.  
value| money| If line type = `total` amount including VAT.   
If line type = `detail` amount without VAT.   
If line type = `vat` VAT amount.  
basevalue| money| Amount in the base currency.  
rate| decimal| The exchange rate used for the calculation of the base amount.  
repvalue| money| Amount in the reporting currency.  
reprate| decimal| The exchange rate used for the calculation of the reporting amount.  
description| string(40)| Description of the transaction line.  
vattotal| money| Only if line type is `total`. The total VAT amount in the currency of the sales transaction.  
vatbasetotal| money| Only if line type is `total`. The total VAT amount in base currency.  
vatreptotal| money| Only if line type is `total`. The total VAT amount in reporting currency.  
matchstatus| `available`   
`matched`   
`proposed`   
`notmatchable`| Payment status of the sales transaction.   
If line type `detail` or `vat` always `notmatchable`.   
Read-only attribute.  
matchlevel| integer| Only if line type is `total`. The level of the matchable dimension.   
Read-only attribute.  
relation| integer| Only if line type is `total`.   
Read-only attribute.  
valueopen| money| Only if line type is `total`. The amount still owed in the currency of the sales transaction.   
Read-only attribute.  
basevalueopen| money| Only if line type is `total`. The amount still owed in base currency.   
Read-only attribute.  
repvalueopen| money| Only if line type is `total`. The amount still owed in reporting currency.   
Read-only attribute.  
vatcode| code| Only if line type is `detail` or `vat`. VAT code.  
vatvalue| money| Only if line type is `detail`. VAT amount in the currency of the sales transaction.  
vatbasevalue| money| Only if line type is `detail`. VAT amount in base currency.  
vatrepvalue| money| Only if line type is `detail`. VAT amount in reporting currency.  
vatturnover| money| Only if line type is `vat`. Amount on which VAT was calculated in the currency of the sales transaction.  
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
currencydate| date| Not used in a sales transaction. Use it only in case of bank or cash transactions.  
freechar| string(1)| Free character field.   
If line type is `total` and filled with `N` the sales invoice is excluded from direct debit runs done in Twinfield.  
comment| string(255)| Comment set on the transaction line.  
matches| node| Contains matching information. Is only available in case the sales transaction is (partly) matched.   
Read-only attribute.  
  
#### Matches​

XML structure

  * Request
  * Response



Not allowed in the XML request.
    
    
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


    
    
    <transaction destiny="temporary" raisewarning="false">  
        <header>  
            <code>VRK</code>  
            <currency>EUR</currency>  
            <date>20210502</date>  
            <period>2021/05</period>  
            <invoicenumber>20210-6000</invoicenumber>  
            <paymentreference>+++100/0160/01495+++</paymentreference>  
            <office>001</office>  
            <duedate>20210506</duedate>  
        </header>  
        <lines>  
            <line type="total" id="1">  
                <dim1>1300</dim1>  
                <dim2>1000</dim2>  
                <value>121.00</value>  
                <debitcredit>debit</debitcredit>  
                <description />  
            </line>  
            <line type="detail" id="2">  
                <dim1>8020</dim1>  
                <value>100.00</value>  
                <debitcredit>credit</debitcredit>  
                <description>Outfit</description>  
                <vatcode>VH</vatcode>  
            </line>  
        </lines>  
    </transaction>  
    
    
    
    <transaction raisewarning="false" result="1" location="temporary">  
        <header>  
            <code name="Verkoopfactuur" shortname="Verkoop">VRK</code>  
            <currency name="Euro" shortname="Euro">EUR</currency>  
            <date>20210502</date>  
            <period>2021/05</period>  
            <invoicenumber>20210-6000</invoicenumber>  
            <paymentreference>+++100/0160/01495+++</paymentreference>  
            <office name="001" shortname="001">001</office>  
            <duedate>20210506</duedate>  
            <origin>import</origin>  
            <originreference></originreference>  
            <user name="Marcel EN" shortname="Marcel EN">MDCEN</user>  
            <number>202100095</number>  
        </header>  
        <lines>  
            <line type="total" id="1">  
                <dim1 name="Debiteuren" shortname="Debiteuren" type="BAS" inuse="true" vatcode="" vatobligatory="false">1300</dim1>  
                <dim2 name="Customer 0" shortname="" type="DEB" inuse="true" vatcode="VH" vatobligatory="false">1000</dim2>  
                <value>121.00</value>  
                <debitcredit>debit</debitcredit>  
                <description />  
                <rate>1</rate>  
                <basevalue>121.00</basevalue>  
                <reprate>1.293600000</reprate>  
                <repvalue>156.53</repvalue>  
                <vattotal>21.00</vattotal>  
                <vatbasetotal>21.00</vatbasetotal>  
                <matchlevel>2</matchlevel>  
                <customersupplier>2</customersupplier>  
                <openvalue>121.00</openvalue>  
                <openbasevalue>121.00</openbasevalue>  
                <openrepvalue>156.53</openrepvalue>  
                <matchstatus>available</matchstatus>  
            </line>  
            <line type="detail" id="2">  
                <dim1 name="Omzet (21%)" shortname="Omzet (21%)" type="PNL" inuse="true" vatcode="" vatobligatory="false">8020</dim1>  
                <value>100.00</value>  
                <debitcredit>credit</debitcredit>  
                <description>Outfit</description>  
                <vatcode name="BTW Hoog" shortname="V Hoog">VH</vatcode>  
                <rate>1</rate>  
                <basevalue>100.00</basevalue>  
                <reprate>1.293600000</reprate>  
                <repvalue>129.36</repvalue>  
                <currencydate></currencydate>  
                <vatvalue>21.00</vatvalue>  
                <vatbasevalue>21.00</vatbasevalue>  
                <matchstatus>notmatchable</matchstatus>  
            </line>  
            <line id="3" type="vat">  
                <dim1 name="Te betalen OB 21%" shortname="Te betalen OB 21%" type="BAS" inuse="true" vatcode="" vatobligatory="false">1530</dim1>  
                <value>21.00</value>  
                <vatcode>VH</vatcode>  
                <debitcredit>credit</debitcredit>  
                <vatturnover>100.00</vatturnover>  
                <vatbaseturnover>100.00</vatbaseturnover>  
                <baseline>1</baseline>  
                <rate>1</rate>  
                <basevalue>21.00</basevalue>  
                <reprate>1.293600000</reprate>  
                <repvalue>27.17</repvalue>  
            </line>  
        </lines>  
    </transaction>  
    

## Post​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example posts the sales transaction of transaction type `VRK` and transaction number `202100001`.

info

Only sales transactions with status `provisional` can be posted.

info

The used transaction type, in the example below `VRK` depends on the administration.
    
    
    <transaction action="post">  
        <office>001</office>  
        <code>VRK</code>  
        <number>202100001</number>  
    </transaction>  
    

If the sales transaction does not exist a `transaction` element is returned containing an error.

## Delete​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example deletes the sales transaction of transaction type `VRK` and transaction number `202100001`.

info

Only sales transactions with status `provisional` can be deleted.

info

The used transaction type, in the example below `VRK` depends on the administration.
    
    
    <transaction action="delete" reason="Test sales transaction, can be deleted.">  
        <office>001</office>  
        <code>VRK</code>  
        <number>202100001</number>  
    </transaction>  
    

If the sales transaction does not exist a `transaction` element is returned containing an error.

## Change pay status​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

In Twinfield it is possible to exclude or include sales transactions from the collect process. In case a sales transaction is excluded it can be included by using the following example. This example includes sales transaction of transaction type `VRK` and transaction number `202100001`.

info

The used transaction type, in the example below VRK depends on the administration.
    
    
    <transaction action="changepaystatus">  
        <office>001</office>  
        <code>VRK</code>  
        <number>202100001</number>  
    </transaction>  
    

If the sales transaction does not exist a `transaction` element is returned containing an error.

In case a sales transaction is included, it can be excluded by using the following example.
    
    
    <transaction action="changepaystatus">  
        <office>001</office>  
        <code>VRK</code>  
        <number>202100001</number>  
        <paystatus>N</paystatus>  
    </transaction>  
    
