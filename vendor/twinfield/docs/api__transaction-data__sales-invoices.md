  * [](/documentation/)
  * Transaction Data
  * Sales invoices



On this page

# Sales invoices

info

Sales invoices that are created by using this web service are created in the Twinfield Classic sales invoicing module. There is no web service available yet to create sales invoices in the new invoicing module.

info

In Twinfield there is a clear distinction between sales invoices and sales transactions. Sales invoices are the invoices, which will be sent to customers. Sales transactions are the related financial transactions that will be posted in the accounting part of Twinfield.

## Find​

Web service type: Method driven

Resource location: `/webservices/finder.asmx?wsdl`

Lists unpaid invoices. Sales invoices are only returned in case their status is Final.

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
dim4| code| Filters on the dimension on level 4.  
dim5| code| Filters on the dimension on level 5.  
dim6| code| Filters on the dimension on level 6.  
value| money| Filters on the original invoice value.  
openvalue| money| Filters on the outstanding value.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

This example reads the sales invoice of invoice type `INVOICE` and invoice number `1`.
    
    
    <read>  
        <type>salesinvoice</type>  
        <office>001</office>  
        <code>INVOICE</code>  
        <invoicenumber>1</invoicenumber>  
    </read>  
    

If the sales invoice does not exist an empty `salesinvoice` element is returned containing an error.

## Create/Update​

If a sales invoice is not found it will be automatically created, otherwise it is updated.

### Using the regular one-off item​

During processing a sales invoice the values of the sales invoice lines are posted to accounts. The accounts that will be used depends on the items settings. It is possible to create items, link accounts to them and use those items in sales invoices. On the other hand, it is also possible to use the regular one-off item `<article>0</article>`. Advantage of this one-off item is that it is not needed anymore to maintain a list of items. The one-off item is always available in each company.

As it is not possible to maintain the one-off item, the accounts that will be used during processing depends on several settings. There are three possible scenarios:

**Scenario 1: using a fixed ledger account / cost center / project**

Within the invoice type settings, it is possible to enter a ledger account and optionally a cost center and project. When using the one-off item while creating and posting a sales invoice, the values of the sales invoice lines will be posted to this account, cost center and project.

**Scenario 2: fill ledger account from XML request option 1**

Within the invoice type settings, it is possible to enter a ledger account. When within the invoice type settings the option “One-off items > Can adjust general ledger account” is ticked, the account as set in the settings can be overwritten.

To overwrite the default account add the tag `<dim1>` to the request at the sales invoice lines. Note that only the general ledger account (dim1) can be altered. There is no possibility to change the cost center (dim2) or project (dim3).

**Scenario 3: fill ledger account from XML request option 2**

Use one or more free text fields in order to fill ledger account, cost center and project. Link the free text fields to e.g. general ledger accounts and cost centers. Also fill the “Item 0 (regular one-off)” settings of the sales invoice type with a reference to the free text fields.

In the XML message, use the free text fields on the sales invoice lines in order to set the ledger account and optionally a cost center.

### Root​

XML structure

  * Request
  * Response


    
    
    <transaction calculateonly="" raisewarning="">  
        <header></header>  
        <lines></lines>  
        <totals></totals>  
        <vatlines></vatlines>  
        <financials></financials>  
    </transaction>  
    
    
    
    <transaction>  
        <header></header>  
        <lines></lines>  
        <totals></totals>  
        <vatlines></vatlines>  
        <financials></financials>  
    </transaction>  
    

Element name: `salesinvoice`

Name| Description  
---|---  
@calculateonly| Attribute to indicate that invoice should not be saved but only checked and calculated. `@calculateonly` must be `true` for that.  
@raisewarning| Should warnings be given `true` or not `false`? Default `true`.  
header| Contains information general to the sales invoice.  
lines| Contains the sales invoice lines.  
totals| Contains the totals.  
vatlines| Contains the taxline (vatline) elements.  
financials| Only present if the invoice has status `final`. Contains the reference to the sales transaction.  
  
### Header​

XML structure

  * Request
  * Response


    
    
    <header>  
        <office></office>  
        <invoicetype></invoicetype>  
        <invoicedate></invoicedate>  
        <duedate></duedate>  
        <performancedate></performancedate>  
        <bank></bank>  
        <customer></customer>  
        <period raisewarning=""></period>  
        <currency></currency>  
        <invoicenumber></invoicenumber>  
        <status></status>  
        <paymentmethod></paymentmethod>  
        <invoiceaddressnumber></invoiceaddressnumber>  
        <deliveraddressnumber></deliveraddressnumber>  
        <headertext></headertext>  
        <footertext></footertext>  
    </header>  
    
    
    
    <header>  
        <office></office>  
        <invoicetype></invoicetype>  
        <invoicedate></invoicedate>  
        <duedate></duedate>  
        <performancedate></performancedate>  
        <bank></bank>  
        <customer></customer>  
        <period></period>  
        <currency></currency>  
        <invoicenumber></invoicenumber>  
        <status></status>  
        <paymentmethod></paymentmethod>  
        <invoiceaddressnumber></invoiceaddressnumber>  
        <deliveraddressnumber></deliveraddressnumber>  
        <headertext></headertext>  
        <footertext></footertext>  
    </header>  
    

Element name: `header`

Name| Type| Description  
---|---|---  
office| code| Office code.  
invoicetype| code| Invoice type code.  
invoicenumber| integer| During the creation of a new sales invoice, the invoice number will be generated based on the next invoice number as set on the invoicing type. So when a new sales invoice is created, do not fill the `invoicenumber`.   
If the `invoicenumber` is filled, the corresponding sales invoice will be changed. If no sales invoice with a corresponding `invoicenumber` can be found, an error will be returned. Note that only `provisional` sales invoices can be changed.  
invoicedate| date| Optional; when the invoicedate is not supplied Twinfield uses the system date as the invoice date.  
duedate| date| Due date.  
performancedate| date| Performance date, when set-up on the invoice header.  
bank| code| Bank code.  
invoiceaddressnumber| integer| If you want the default address, omit the tag or leave it empty.  
deliveraddressnumber| integer| If you want the default address, omit the tag or leave it empty.  
customer| code| Customer code.  
period| period| Period in YYYY/PP format.   
Optionally, it is possible to suppress warnings about 'date out of range for the given period' by adding the `raisewarning` attribute and set its value to `false`. This overwrites the value of the `raisewarning` attribute as set on the root element.  
currency| code| Currency code.  
status| `default`   
`concept`   
`final`| `default` can only be returned when retrieving a sales invoice. You cannot use this status when creating or updating an invoice.   
`concept` saves the invoice as provisional.   
After saving as `final`, no changes can be made anymore. When posting an invoice final, a financial transaction is generated and posted automatically.  
paymentmethod| `cash`   
`bank`   
`cheque`   
`cashondelivery`   
`da`| The payment method.   
DA: see [documents against acceptance](http://www.aibtradefinance.com/tf/ProductDiag2.asp)  
headertext| text| Header text on the invoice.  
footertext| text| Footer text on the invoice.  
  
### Sales invoice lines​

XML structure

  * Request
  * Response


    
    
    <lines>  
        <line id="">  
            <article></article>  
            <subarticle></subarticle>  
            <quantity></quantity>  
            <units></units>  
            <unitspriceexcl></unitspriceexcl>  
            <vatcode></vatcode>  
            <allowdiscountorpremium></allowdiscountorpremium>  
            <description></description>  
            <performancedate></performancedate>  
            <performancetype></performancetype>  
            <freetext1></freetext1>  
            <freetext2></freetext2>  
            <freetext3></freetext3>  
            <dim1></dim1>  
        </line>  
    </lines>  
    
    
    
    <lines>  
        <line id="">  
            <article></article>  
            <subarticle></subarticle>  
            <quantity></quantity>  
            <units></units>  
            <unitspriceexcl></unitspriceexcl>  
            <vatcode name="" shortname=""></vatcode>  
            <allowdiscountorpremium></allowdiscountorpremium>  
            <description></description>  
            <performancedate></performancedate>  
            <performancetype></performancetype>  
            <freetext1></freetext1>  
            <freetext2></freetext2>  
            <freetext3></freetext3>  
            <dim1 name="" shortname=""></dim1>  
            <valueexcl></valueexcl>  
            <vatvalue></vatvalue>  
            <valueinc></valueinc>  
        </line>  
    </lines>  
    

Element name: `lines`

Name| Type| Description  
---|---|---  
@id| integer| Line ID.  
article| code| Article code.  
subarticle| code| Sub-article code.  
quantity| integer| The quantity on the sales invoice line.  
units| integer| The number of units per quantity.  
allowdiscountorpremium| `true`   
`false`| Calculate discount on this line.  
description| string(110)| Invoice line description, only on the lines with article ‘0’ or ‘-‘.  
valueexcl| money| Calculated element.   
Read-only attribute.  
vatvalue| money| Calculated element.   
Read-only attribute.  
valueinc| money| Calculated element.   
Read-only attribute.  
unitspriceexcl| money| Only valid for invoice types with VAT exclusive units prices. Only add this tag to an XML request if the setting `Prices can be changed` on an item is set to `true`. Otherwise, the price will be determined by the system.  
unitspriceinc| money| Only valid for invoice types with VAT inclusive units prices. Only add this tag to an XML request if the setting `Prices can be changed` on an item is set to `true`. Otherwise, the price will be determined by the system.  
freetext1| string(36)| Free text field 1 as entered on the invoice type.  
freetext2| string(36)| Free text field 2 as entered on the invoice type.  
freetext3| string(36)| Free text field 3 as entered on the invoice type.  
dim1| code| Balance account.  
vatcode| code| VAT code.  
performancetype| `services`   
`goods`| The performance type in case of an ICT sales invoice.  
performancedate| date| Performance date, when set-up on invoice lines.  
  
### Totals line​

XML structure

  * Request
  * Response



Not allowed in the XML request.
    
    
    <totals>  
        <valueexcl></valueexcl>  
        <valueinc></valueinc>  
    </totals>  
    

Element name: `totals`

Name| Type| Description  
---|---|---  
valueexcl| money| Value without VAT.   
Read-only attribute.  
valueinc| money| Value with VAT.   
Read-only attribute.  
  
### VAT lines​

XML structure

  * Request
  * Response



Not allowed in the XML request.
    
    
    <vatlines>  
        <vatline>  
            <vatcode name="" shortname="" percentage=""></vatcode>  
            <vatvalue></vatvalue>  
            <performancetype></performancetype>  
            <performancedate></performancedate>  
        </vatline>  
    </vatlines>  
    

Element name: `vatlines`

Name| Type| Description  
---|---|---  
vatline| node| VAT line.  
  
#### VAT line​

Element name: `vatline`

Name| Type| Description  
---|---|---  
vatcode| code| VAT code.   
Read-only attribute.  
vatvalue| money| VAT amount.   
Read-only attribute.  
performancetype| `services`   
`goods`| The performance type.   
Read-only attribute.  
performancedate| date| The performance date. Only in case `performancetype = services`   
Read-only attribute.  
  
### Financials​

XML structure

  * Request
  * Response



Not allowed in the XML request.
    
    
    <financials>  
        <code></code>  
        <number></number>  
    </financials>  
    

Element name: `financials`

Name| Type| Description  
---|---|---  
code| code| The transaction type code.   
Read-only attribute.  
number| integer| The transaction number.   
Read-only attribute.  
  
### XML Example​

  * Request
  * Response


    
    
    <salesinvoice>  
        <header>  
            <office>001</office>  
            <invoicetype>FACTUUR</invoicetype>  
            <invoicedate>20210425</invoicedate>  
            <duedate>20210429</duedate>  
            <bank>BNK</bank>  
            <customer>1000</customer>  
            <period>2021/4</period>  
            <currency>EUR</currency>  
            <status>concept</status>  
            <paymentmethod>cash</paymentmethod>  
        </header>  
        <lines>  
            <line id="1">  
                <article>510</article>  
                <subarticle>501.01</subarticle>  
                <quantity>2.00</quantity>  
                <units>1</units>  
                <unitspriceexcl>83.94</unitspriceexcl>  
            </line>  
        </lines>  
    </salesinvoice>  
    
    
    
    <salesinvoice result="1">  
        <header>  
            <office>001</office>  
            <invoicetype>FACTUUR</invoicetype>  
            <invoicedate>20210425</invoicedate>  
            <duedate>20210429</duedate>  
            <bank>BNK</bank>  
            <customer>1000</customer>  
            <period>2021/4</period>  
            <currency>EUR</currency>  
            <status>concept</status>  
            <paymentmethod>cash</paymentmethod>  
            <invoiceaddressnumber>1</invoiceaddressnumber>  
            <deliveraddressnumber>1</deliveraddressnumber>  
            <headertext></headertext>  
            <footertext></footertext>  
            <invoicenumber>121200036</invoicenumber>  
        </header>  
        <lines>  
            <line id="1">  
                <article>510</article>  
                <subarticle>501.01</subarticle>  
                <quantity>2.00</quantity>  
                <units>1</units>  
                <unitspriceexcl>41.97</unitspriceexcl>  
                <vatcode name="VH" shortname="VH">VH</vatcode>  
                <allowdiscountorpremium>true</allowdiscountorpremium>  
                <description>Broek</description>  
                <performancedate />  
                <performancetype />  
                <freetext1></freetext1>  
                <freetext2 />  
                <freetext3 />  
                <dim1 name="Omzet" shortname="Omzet">8020</dim1>  
                <valueexcl>83.94</valueexcl>  
                <vatvalue>17.63</vatvalue>  
                <valueinc>101.57</valueinc>  
            </line>  
        </lines>  
        <totals>  
            <valueexcl>83.94</valueexcl>  
            <valueinc>101.57</valueinc>  
        </totals>  
        <vatlines>  
            <vatline>  
                <vatcode name="VH" shortname="VH" percentage="21.000000000">VH</vatcode>  
                <vatvalue>17.63</vatvalue>  
                <performancetype></performancetype>  
                <performancedate></performancedate>  
            </vatline>  
        </vatlines>  
    </salesinvoice>  
    
