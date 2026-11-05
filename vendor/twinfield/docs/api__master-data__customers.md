  * [](/documentation/)
  * Master Data
  * Customers



On this page

# Customers

> Dimension type DEB

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
3| bank account number  
4| address fields  
  
The method will return an array containing validation messages. If there are no errors, then the data parameter will contain the actual search result.

### Options

Option| Type| Description  
---|---|---  
office| «office code»| Restricts to the office.  
level| enumeration: `1`, `2`, `3`, `4`, `5`, `6`| Specifies the dimension level. Normally the level of customer dimensions is level `2`.  
section| financials| Restricts to financial or time & expenses dimensions.  
dimtype| DEB| Shows the customer dimensions.  
modifiedsince| string `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to dimensions modified after, on or at the specified date (and time).  
group| «group code»| Specifies the dimension group (wildcards allowed).  
matchtype| enumeration: `DEB`, `CRD`| This option will show only the relations (dimension type: `DEB` and/or `CRD`).  
includehidden| `0` (false) or `1` (true)| If set to `1`, the response will include a status column (active/hidden) and both active and hidden dimensions will be included.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the settings of the customer (DEB) dimension EXAMPLE.
    
    
    <read>  
        <type>dimensions</type>  
        <office>001</office>  
        <dimtype>DEB</dimtype>  
        <code>EXAMPLE</code>  
    </read>  
    

## Create/Update/Delete​

If the dimension is not found it will be automatically created, otherwise it is updated. Set `dimension/header/@status` to `deleted` for deleting a dimension.

### Root​

XML structure
    
    
    <dimension>  
        <financials></financials>  
        <creditmanagement></creditmanagement>  
        <invoicing></invoicing>  
        <addresses></addresses>  
        <banks></banks>  
        <groups></groups>  
        <postingrules></postingrules>  
        <paymentconditions></paymentconditions>  
    </dimension>  
    

Element name: `dimension`

Name| Description  
---|---  
dimension| Contains information general to the dimension.  
financials| Contains the financial settings of the dimension.  
creditmanagement| Contains the credit management settings of the dimension.  
invoicing| Contains the discount or premium settings of the dimension.  
addresses| Contains the addresses of the dimension.  
banks| Contains the bank accounts of the dimension.  
groups| Contains the dimension groups the dimension is part of.  
postingrules| Contains the posting rules of the dimension.  
paymentconditions| Contains the payment conditions of the dimension.  
  
### Dimension​

XML structure

  * Request
  * Response


    
    
    <dimension>  
        <office></office>  
        <type></type>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <beginperiod></beginperiod>  
        <beginyear></beginyear>  
        <endperiod></endperiod>  
        <endyear></endyear>  
        <website></website>  
        <sendtype></sendtype>  
        <sendmail></sendmail>  
    </dimension>  
    
    
    
    <dimension status="" result="">  
        <office name="" shortname=""></office>  
        <type name="" shortname=""></type>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <beginperiod></beginperiod>  
        <beginyear></beginyear>  
        <endperiod></endperiod>  
        <endyear></endyear>  
        <website></website>  
        <cocnumber></cocnumber>  
        <vatnumber></vatnumber>  
        <uid></uid>  
        <inuse></inuse>  
        <behaviour></behaviour>  
        <touched></touched>  
        <editdimensionname></editdimensionname>  
        <sendtype></sendtype>  
        <sendmail></sendmail>  
    </dimension>  
    

Element name: `dimension`

Property name| Value| Description  
---|---|---  
@status| `active`   
`deleted`   
`hide`| For creating and updating status may be left empty. For deleting `deleted` should be used. In case a dimension that is used in a transaction is deleted, its status has been changed into `hide`. Hidden dimensions can be activated by using `active`.  
office| code| Office code.  
type| code| Dimension type. See [Dimension type](/documentation/api/master-data/dimension-types).   
Dimension type of customers is `DEB`.  
code| code| Dimension code, must be compliant with the mask of the `DEB` [Dimension type](/documentation/api/master-data/dimension-types).  
uid| string| Unique identification of the dimension.   
Read-only attribute.  
name| string(80)| Name of the dimension.  
shortname| string(20)| Short name of the dimension.  
inuse| `true`   
`false`| Indicates whether the balancesheet is used in a financial transaction or not.   
Read-only attribute.  
behaviour| `normal`   
`system`   
`template`| Determines the behaviour of dimensions.   
Read-only attribute.  
touched| integer| Count of the number of times the dimension settings are changed.   
Read-only attribute.  
beginperiod| integer| Determines together with `beginyear` the period from which the dimension may be used.  
beginyear| integer| Determines together with `beginperiod` the period from which the dimension may be used.  
endperiod| integer| Determines together with `endyear` the period till which the dimension may be used.  
endyear| integer| Determines together with `endperiod` the period till which the dimension may be used.  
website| string(40)| Website of the dimension.  
cocnumber| | Obsolete. Use instead `field5` of the address line.  
vatnumber| | Obsolete. Use instead `field4` of the address line.  
editdimensionname| | Not in use.  
  
### Financials​

XML structure

  * Request
  * Response


    
    
    <financials>  
        <matchtype></matchtype>  
        <accounttype></accounttype>  
        <subanalyse></subanalyse>  
        <duedays></duedays>  
        <payavailable></payavailable>  
        <meansofpayment></meansofpayment>  
        <paycode></paycode>  
        <ebilling></ebilling>  
        <ebillmail></ebillmail>  
        <substitutionlevel></substitutionlevel>  
        <substitutewith></substitutewith>  
        <vatcode></vatcode>  
        <collectmandate>  
            <...>  
        </collectmandate>  
        <collectionschema></collectionschema>  
        <childvalidations>  
            <...>  
        </childvalidations>  
    </financials>  
    
    
    
    <financials>  
        <matchtype></matchtype>  
        <accounttype></accounttype>  
        <subanalyse></subanalyse>  
        <duedays></duedays>  
        <level></level>  
        <payavailable></payavailable>  
        <meansofpayment></meansofpayment>  
        <paycode name="" shortname=""></paycode>  
        <ebilling></ebilling>  
        <ebillmail></ebillmail>  
        <substitutionlevel></substitutionlevel>  
        <substitutewith></substitutewith>  
        <relationsreference></relationsreference>  
        <vattype name="" shortname=""></vattype>  
        <vatcode name="" shortname="" type=""></vatcode>  
        <vatobligatory></vatobligatory>  
        <performancetype></performancetype>  
        <collectmandate>  
            <...>  
        </collectmandate>  
        <collectionschema></collectionschema>  
        <childvalidations>  
            <...>  
        </childvalidations>  
    </financials>  
    

Element name: `financials`

Property name| Value| Description  
---|---|---  
matchtype| code| Fixed value `customersupplier`.  
accounttype| code| Fixed value `inherit`.  
subanalyse| `true`   
`false`   
`maybe`| Fixed value `false`.  
duedays| integer| The number of due days.  
level| integer| Specifies the dimension level. Normally the level of customers is level `2`.   
Read-only attribute.  
payavailable| `true`   
`false`| Determines if direct debit is possible.  
meansofpayment| `none`   
`paymentfile`| The option `none` is only allowed in case `payavailable` is set to `false`.   
The option `paymentfile` is only allowed in case `payavailable` is set to `true`.  
paycode| string(16)| The code of the payment type in case direct debit is possible.  
ebilling| `true`   
`false`| Determines if the sales invoices will be sent electronically to the customer.  
ebillmail| string(200)| The mail address the electronic sales invoice is sent to.  
substitutionlevel| integer| Level of the balancesheet account. Fixed value `1`.  
substitutewith| string(16)| Default customer balancesheet account.  
relationsreference| | Not in use.  
vattype| | Not in use.  
vatcode| string(16)| Default VAT code.  
vatobligatory| | Not in use.  
performancetype| | Not in use.  
collectmandate| node| Collect mandate information.   
Apply this information only when the customer invoices are collected by SEPA direct debit.  
collectionschema| `core`   
`b2b`| Collection schema information.   
Apply this information only when the customer invoices are collected by SEPA direct debit.  
  
#### Collect mandate information​

XML structure

  * Request
  * Response


    
    
    <collectmandate>  
        <id></id>  
        <signaturedate></signaturedate>  
    </collectmandate>  
    
    
    
    <collectmandate>  
        <id></id>  
        <signaturedate></signaturedate>  
    </collectmandate>  
    

Element name: `collectmandate`

Property name| Value| Description  
---|---|---  
id| string(35)| Mandate id which the debtor can collect with.  
signaturedate| date| Date on which the mandate is signed.  
  
### Credit management​

XML structure

  * Request
  * Response


    
    
    <creditmanagement>  
        <responsibleuser></responsibleuser>  
        <basecreditlimit></basecreditlimit>  
        <sendreminder></sendreminder>  
        <reminderemail></reminderemail>  
        <blocked></blocked>  
        <freetext1></freetext1>  
        <freetext2></freetext2>  
        <comment></comment>  
    </creditmanagement>  
    
    
    
    <creditmanagement>  
        <responsibleuser></responsibleuser>  
        <basecreditlimit></basecreditlimit>  
        <sendreminder></sendreminder>  
        <reminderemail></reminderemail>  
        <blocked locked="" modified=""></blocked>  
        <freetext1 />  
        <freetext2 />  
        <freetext3></freetext3>  
        <comment />  
    </creditmanagement>  
    

Element name: `creditmanagement`

Property name| Value| Description  
---|---|---  
responsibleuser| string(16)| The credit manager.  
basecreditlimit| amount| The credit limit amount.  
sendreminder| `true`   
`email`   
`false`| Determines if and how a customer will be reminded.  
reminderemail| string(200)| Mandatory if `sendreminder` is `email`.  
blocked| `true`   
`false`| Indicates if related projects for this customer are blocked in time & expenses.  
freetext1| `true`   
`false`| Right of use.  
freetext2| string(40)| Segment code.  
freetext3| | Not in use.  
comment| string()| Comment.  
  
### Discount / Premium​

XML structure

  * Request
  * Response


    
    
    <invoicing>  
        <discountarticle></discountarticle>  
    </invoicing>  
    
    
    
    <invoicing>  
        <discountarticle></discountarticle>  
    </invoicing>  
    

Element name: `invoicing`

Property name| Value| Description  
---|---|---  
discountarticle| string(16)| The discount or premium article.  
  
### Addresses​

Element name: `addresses`

Property name| Value| Description  
---|---|---  
address| node| Sets the dimension addresses.  
  
#### Address​

XML structure

  * Request
  * Response


    
    
    <addresses>  
        <address default="" type="">  
            <name></name>  
            <country></country>  
            <city></city>  
            <postcode></postcode>  
            <telephone></telephone>  
            <telefax></telefax>  
            <email></email>  
            <field1></field1>  
            <field2></field2>  
            <field3></field3>  
            <field4></field4>  
            <field5></field5>  
            <field6></field6>  
        </address>  
    </addresses>  
    
    
    
    <addresses>  
        <address default="" type="" id="">  
            <name></name>  
            <country name="" shortname=""></country>  
            <city></city>  
            <postcode></postcode>  
            <telephone></telephone>  
            <telefax></telefax>  
            <email></email>  
            <contact></contact>  
            <field1></field1>  
            <field2></field2>  
            <field3></field3>  
            <field4></field4>  
            <field5></field5>  
            <field6></field6>  
        </address>  
    </addresses>  
    

Element name: `address`

Property name| Value| Description  
---|---|---  
@id| integer| Sequence number of the address line.  
@type| `invoice`   
`postal`   
`contact`| The type of the address.  
@default| `true`   
`false`| Is this the default address, only one default address is possible.  
name| string(80)| Company name.  
country| string(2)| Country code. The ISO country codes are used.  
city| string(40)| City.  
postcode| string(16)| Postcode.  
telephone| string(25)| Telephone number.  
telefax| string(25)| Fax number.  
email| string(200)|   
contact| | Obsolete  
field1| string(128)| User defined fields, the labels are configured in the [Dimension type](/documentation/api/master-data/dimension-types).  
field2| string(128)| User defined fields, the labels are configured in the [Dimension type](/documentation/api/master-data/dimension-types).  
field3| string(128)| User defined fields, the labels are configured in the [Dimension type](/documentation/api/master-data/dimension-types).  
field4| string(128)| User defined fields, the labels are configured in the [Dimension type](/documentation/api/master-data/dimension-types). Currently, field4 is reserved for VAT numbers. So only valid VAT numbers may be filled in.  
field5| string(128)| User defined fields, the labels are configured in the [Dimension type](/documentation/api/master-data/dimension-types).  
field6| string(128)| User defined fields, the labels are configured in the [Dimension type](/documentation/api/master-data/dimension-types).  
  
#### Banks​

XML structure

  * Request
  * Response


    
    
    <banks>  
        <bank>  
            <ascription></ascription>  
            <accountnumber></accountnumber>  
            <address>  
                <...>  
            </address>  
            <bankname></bankname>  
            <biccode></biccode>  
            <city></city>  
            <country></country>  
            <iban></iban>  
            <natbiccode></natbiccode>  
            <postcode></postcode>  
            <state></state>  
        </bank>  
    </banks>  
    
    
    
    <banks>  
        <bank default="" id="" destination="">  
            <ascription></ascription>  
            <accountnumber></accountnumber>  
            <address>  
                <...>  
            </address>  
            <bankname></bankname>  
            <biccode></biccode>  
            <city></city>  
            <country></country>  
            <iban></iban>  
            <natbiccode></natbiccode>  
            <postcode></postcode>  
            <state></state>  
        </bank>  
    </banks>  
    

Element name: `banks`

Property name| Value| Description  
---|---|---  
@id| integer| Sequence number of the bank account line. When adding a new bank, do not supply the `@id`. When changing a bank account, supply the corresponding `@id`.  
@default| `true`   
`false`| Is this the default bank account, only one default bank account is possible.  
ascription| string(40)| Account holder.  
accountnumber| string(40)| Account number.  
address| node| Sets a part of the bank address.  
bankname| string(40)| Bank name.  
biccode| string(16)| BIC code.  
city| string(40)| City.  
country| string(2)| Bank country code. The ISO country codes are used.  
iban| string(40)| IBAN account number.  
natbiccode| string(20)| National bank code.  
postcode| string(16)| Postcode.  
state| string(40)| State.  
  
#### Bank addresses​

XML structure

  * Request
  * Response


    
    
    <address>  
        <field2></field2>  
        <field3></field3>  
    </address>  
    
    
    
    <address>  
        <field2></field2>  
        <field3></field3>  
    </address>  
    

Element name: `address`

Property name| Value| Description  
---|---|---  
field2| string(128)| Bank address.  
field3| string(128)| Bank address number.  
  
### Remittance advice​

Element name: `remittanceadvice`

Property name| Value| Description  
---|---|---  
sendtype| `ToFileManager`   
`ByEmail`| To file manager   
By e-mail  
sendmail| string(200)| Mandatory if `sendtype` = `ByEmail`, remittance advice will be sent using this e-mail address.  
  
### Groups​

XML structure

  * Request
  * Response


    
    
    <groups>  
        <group></group>  
    </groups>  
    
    
    
    <groups>  
        <group shortname="" name=""></group>  
    </groups>  
    

Element name: `groups`

Property name| Value| Description  
---|---|---  
group| string(16)| Sets the dimension group. See [Dimension group](/documentation/api/master-data/dimension-groups).  
  
### Posting rules​

Element name: `postingrules`

Property name| Value| Description  
---|---|---  
postingrule| node| Sets the posting rules of a dimension.  
  
#### Posting rule​

XML structure

  * Request
  * Response


    
    
    <postingrules>  
        <postingrule id="1" status="">  
            <currency></currency>  
            <amount></amount>  
            <description></description>  
            <lines>  
                <...>  
            </lines>  
        </postingrule>  
    </postingrules>  
    
    
    
    <postingrules>  
        <postingrule id="1" status="">  
            <currency></currency>  
            <amount></amount>  
            <description></description>  
            <lines>  
                <...>  
            </lines>  
        </postingrule>  
    </postingrules>  
    

Element name: `postingrule`

Property name| Value| Description  
---|---|---  
@id| integer| Sequence number of the posting rule.   
Fixed value `1`.  
@status| `active`   
`deleted`| For creating and updating `active` should be used. For deleting `deleted` should be used.  
currency| code| Currency.  
amount| amount| Amount.  
description| string(40)| Description.  
lines| node| Sets the posting rule lines.  
  
#### Lines​

XML structure

  * Request
  * Response


    
    
    <lines>  
        <line>  
            <office></office>  
            <dimension1></dimension1>  
            <dimension2></dimension2>  
            <dimension3></dimension3>  
            <ratio></ratio>  
            <vatcode></vatcode>  
            <description></description>  
        </line>  
    </lines>  
    
    
    
    <lines>  
        <line>  
            <office></office>  
            <dimension1></dimension1>  
            <dimension2></dimension2>  
            <dimension3></dimension3>  
            <ratio></ratio>  
            <vatcode></vatcode>  
            <description></description>  
        </line>  
    </lines>  
    

Element name: `line`

Property name| Value| Description  
---|---|---  
office| string(16)| Destination company.  
dimension1| string(16)| General ledger.  
dimension2| string(16)| Cost center.  
dimension3| string(16)| Project or asset.  
ratio| decimal| The ratio of the posting rule line.  
vatcode| string(16)| VAT code.  
description| string(40)| Description.  
  
### Payment conditions​

XML structure

  * Request
  * Response


    
    
    <paymentconditions>  
        <paymentcondition>  
            <...>  
        </paymentcondition>  
    </paymentconditions>  
    
    
    
    <paymentconditions>  
        <paymentcondition>  
            <...>  
        </paymentcondition>  
    </paymentconditions>  
    

Element name: `paymentconditions`

Property name| Value| Description  
---|---|---  
paymentcondition| node| Sets the payment condition of a dimension.  
  
#### Payment condition​

XML structure

  * Request
  * Response


    
    
    <paymentcondition>  
        <discountdays></discountdays>  
        <discountpercentage></discountpercentage>  
    </paymentcondition>  
    
    
    
    <paymentcondition>  
        <discountdays></discountdays>  
        <discountpercentage></discountpercentage>  
    </paymentcondition>  
    

Element name: `paymentcondition`

Property name| Value| Description  
---|---|---  
discountdays| integer| Number of discount days.  
discountpercentage| decimal| Discount percentage.  
  
### Example​

  * Request
  * Response


    
    
    <dimension>  
        <office>001</office>  
        <type>DEB</type>  
        <name>Customer 0</name>  
        <shortname></shortname>  
        <website></website>  
        <financials>  
            <matchtype>customersupplier</matchtype>  
            <duedays>30</duedays>  
            <payavailable>true</payavailable>  
            <meansofpayment>paymentfile</meansofpayment>  
            <paycode>SEPANLDD</paycode>  
            <collectionschema>core</collectionschema>  
        </financials>  
        <addresses>  
            <address id="1" type="invoice" default="true">  
                <name>Customer 0</name>  
                <country>NL</country>  
                <city>Place</city>  
                <postcode>1000</postcode>  
                <telephone>010-123452000</telephone>  
                <telefax>010-12342000</telefax>  
                <email>[[email protected]](/cdn-cgi/l/email-protection)</email>  
                <field1>Customer 1</field1>  
                <field2>Streetname part 1 - 1</field2>  
                <field3>Streetname part 1 - 2</field3>  
                <field4></field4>  
                <field5></field5>  
                <field6></field6>  
            </address>  
        </addresses>  
        <banks>  
            <bank default="true">  
                <ascription>Customer 1</ascription>  
                <accountnumber>123456789</accountnumber>  
                <address>  
                    <field2></field2>  
                    <field3></field3>  
                </address>  
                <bankname></bankname>  
                <biccode>ABNANL2A</biccode>  
                <city>Place</city>  
                <country>NL</country>  
                <iban>NL02ABNA0123456789</iban>  
                <natbiccode></natbiccode>  
                <postcode></postcode>  
                <state></state>  
            </bank>  
        </banks>  
    </dimension>  
    
    
    
    <dimension status="active" result="1">  
        <office name="001" shortname="001">001</office>  
        <type name="Debiteuren" shortname="Debiteuren">DEB</type>  
        <name>Customer 0</name>  
        <shortname></shortname>  
        <website></website>  
        <cocnumber></cocnumber>  
        <vatnumber></vatnumber>  
        <financials>  
            <matchtype>customersupplier</matchtype>  
            <duedays>30</duedays>  
            <payavailable>true</payavailable>  
            <meansofpayment>paymentfile</meansofpayment>  
            <paycode name="SEPA NL Incasso" shortname="SEPA NL Incasso">SEPANLDD</paycode>  
            <level>2</level>  
            <accounttype>inherit</accounttype>  
            <subanalyse>false</subanalyse>  
            <ebilling>false</ebilling>  
            <relationsreference></relationsreference>  
            <substitutionlevel>1</substitutionlevel>  
            <substitutewith>1300</substitutewith>  
            <vatobligatory>false</vatobligatory>  
            <performancetype />  
            <collectmandate>  
                <id></id>  
                <signaturedate></signaturedate>  
            </collectmandate>  
            <collectionschema></collectionschema>  
            <vatcode name="" shortname="" type=""></vatcode>  
            <vattype name="" shortname=""></vattype>  
            <childvalidations>  
                <childvalidation type="code" level="1">1300</childvalidation>  
            </childvalidations>  
        </financials>  
        <addresses>  
            <address id="1" type="invoice" default="true">  
                <name>Customer 0</name>  
                <country name="Nederland" shortname="">NL</country>  
                <city>Place</city>  
                <postcode>1000</postcode>  
                <telephone>010-123452000</telephone>  
                <telefax>010-12342000</telefax>  
                <email>[[email protected]](/cdn-cgi/l/email-protection)</email>  
                <contact></contact>  
                <field1>Customer 1</field1>  
                <field2>Streetname part 1 - 1</field2>  
                <field3>Streetname part 1 - 2</field3>  
                <field4></field4>  
                <field5></field5>  
                <field6></field6>  
            </address>  
        </addresses>  
        <banks>  
            <bank default="true" id="-1" destination="1">  
                <ascription>Customer 1</ascription>  
                <accountnumber>123456789</accountnumber>  
                <bankname></bankname>  
                <biccode>ABNANL2A</biccode>  
                <city>Place</city>  
                <country>NL</country>  
                <iban>NL02ABNA0123456789</iban>  
                <natbiccode></natbiccode>  
                <postcode></postcode>  
                <state></state>  
                <address />  
            </bank>  
        </banks>  
        <code>1097</code>  
        <uid>c5027760-476e-4081-85fb-351c983aea54</uid>  
        <inuse>false</inuse>  
        <behaviour>normal</behaviour>  
        <touched>0</touched>  
        <beginperiod>0</beginperiod>  
        <beginyear>0</beginyear>  
        <endperiod>0</endperiod>  
        <endyear>0</endyear>  
        <editdimensionname>true</editdimensionname>  
        <creditmanagement>  
            <responsibleuser></responsibleuser>  
            <basecreditlimit>0.00</basecreditlimit>  
            <sendreminder>true</sendreminder>  
            <reminderemail></reminderemail>  
            <blocked locked="false" modified="">false</blocked>  
            <freetext1></freetext1>  
            <freetext2></freetext2>  
            <freetext3></freetext3>  
            <comment></comment>  
            <responsibleuser name="" shortname=""></responsibleuser>  
            <basecreditlimit>0.00</basecreditlimit>  
            <sendreminder>true</sendreminder>  
            <reminderemail></reminderemail>  
            <blocked locked="false" modified="">false</blocked>  
            <freetext1></freetext1>  
            <freetext2></freetext2>  
            <freetext3></freetext3>  
            <comment></comment>  
        </creditmanagement>  
    </dimension>  
    
