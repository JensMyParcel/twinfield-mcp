  * [](/documentation/)
  * Miscellaneous
  * Finder



On this page

# Finder

## Introduction​

Use the finder web service in order to get all kind of master data from Twinfield.

Web service type: Method driven

Resource location: `/webservices/finder.asmx?wsdl`.

info

Since it is not possible to add the company code to the finder, make sure the correct company is set by using either the `SelectCompany` function or adding the `office` option.

## Method​
    
    
    public Message[] Search(  
        string type, // Finder type, see Finder type.  
        string pattern, // The search pattern. May contain wildcards * and ?  
        int field, // Fields to search through, see Search fields.  
        int firstRow, // First row to return, usefull for paging  
        int maxRows, // Maximum number of rows to return, usefull for paging  
        string[][] options, // See options below  
        out FinderData data) // Search results  
    

Raw envelope

  * Request
  * Response


    
    
    POST https://api.<cluster>.twinfield.com/webservices/finder.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.34209)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/Search"  
    Host: <cluster>.twinfield.com  
    Content-Length: 541  
    Expect: 100-continue  
    Connection: Keep-Alive  
    
    
    
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  
        <soap:Header>  
            <Header xmlns="http://www.twinfield.com/">  
                <AccessToken>9c19e935ae213d9aa36ca2dd44529f14</AccessToken>  
                <CompanyCode>001</CompanyCode>  
            </Header>  
        </soap:Header>  
        <soap:Body>  
            <Search xmlns="http://www.twinfield.com/">  
                <type>DIM</type>  
                <pattern>*</pattern>  
                <field>0</field>  
                <firstRow>1</firstRow>  
                <maxRows>100</maxRows>  
                <options>  
                    <ArrayOfString>  
                        <string>dimtype</string>  
                        <string>DEB</string>  
                    </ArrayOfString>  
                </options>  
            </Search>  
        </soap:Body>  
    </soap:Envelope>  
    
    
    
    <?xml version="1.0" encoding="utf-8"?>  
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  
        <soap:Body>  
            <SearchResponse xmlns="http://www.twinfield.com/">  
                <SearchResult />  
                <data>  
                    <TotalRows>12495</TotalRows>  
                    <Columns>  
                        <string>Code</string>  
                        <string>Naam</string>  
                    </Columns>  
                    <Items>  
                        <ArrayOfString>  
                            <string>001075</string>  
                            <string>Customer 1</string>  
                        </ArrayOfString>  
                        <ArrayOfString>  
                            <string>001076</string>  
                            <string>Customer 2</string>  
                        </ArrayOfString>  
                        <...>  
                    </Items>  
                </data>  
            </SearchResponse>  
        </soap:Body>  
    </soap:Envelope>  
    

## Finder type​

Type| Twinfield master/function| Return fields  
---|---|---  
ART| Items| code, name  
ASM| Asset methods| code, name  
BDS| Budgets| code, name  
BNK| Cashbooks and banks| code, name  
BSN| Billing schedule| number, description  
CDA| Credit management action codes| code, name  
CER| Certificates| code, name  
CQT| List of available (not paid) cheques| cheque number, relation code, relation name, amount, debit/credit  
CTR| Countries| code, name  
CUR| Currencies| code, name  
DIM| Dimensions (financials)| code, name, bank account, address fields  
DIM| Dimensions (modifiedsince option)| code, name, modified, revision  
DIM| Dimensions (projects)| code, name, customer  
DMT| Dimension types| code, name  
DVT| Vat types| code, name  
FLT| Filter mappings| code, name  
FMT| Payment files| code, name  
GRP| Dimension groups| code, name  
GWY| Gateways| code, name  
HIE| Hierarchies| code, name  
HND| Hierarchy nodes| code, name  
ICTCOUNTRY| ICT Country codes| code, name  
INV| Invoice types| code, name  
IVT| List of available (not paid) invoices| invoice number, relation code, relation name, amount, debit/credit  
MAT| Matching types| code, name  
OFF| Offices| code, name  
OFG| Office groups| code, name  
OIC| Available offices for InterCompany transactions| code, name  
PAY| Payment types| code, name  
PIS| Paying-in slips| paying-in slip number, amount, debit/credit, description  
PRD| Periods| title, name  
REP| Reports| code, name  
REW| Word templates (invoices, reminder letters)| code, name  
RMD| Reminder scenarios| code, name  
ROL| User roles| code, name  
SAR| Sub items| code, name  
SPM| Distribution by periods (Budgets/Extended Trial Balance allocation)| code, name  
TXG| Tax groups| code, name  
TEQ| Time & quantities transaction types| code, name  
TRS| Transaction types (daybooks)| code, name  
TRT| Time project rates| code, name  
USR| Users| code, name  
VAT| VAT codes| code, name  
VATN| VAT numbers of relations| code, name, country, vat number, relation company, city  
VTB| VAT Groups| code, name  
VGM| VAT Groups countries| code, name  
XLT| Translations| code, name  
  
## Search fields​

The search field determines which field or fields will be searched. The available fields depends on the finder type. Passing a value outside the specified values will cause an error.

Type| Description| Field code  
---|---|---  
all| Searches on the code or name field| 0  
all| Searches only on the code field| 1  
all| Searches only on the name field| 2  
DIM| Searches in the dimensions bank account number field| 3  
DIM| Searches for the customer code (only available for projects/activities)| 3  
IVT| Searches for the dimension code or dimension name, outstanding invoice amount, invoice number| 0  
  
## Finder options​

The Finder options. Passing an unsupported name or value causes an error. It's possible to add multiple options. An option name may be used once, specifying an option multiple times will cause an error.

Type| Option| Value| Description  
---|---|---|---  
all| `company` (also accepts `office`)| «company code»| Sets the company code. Note: `company` is the new preferred option. `office` is _deprecated_ but still supported for backward compatibility and both options should not be provided together.  
ART| vat| `inclusive` `exclusive`| Return only items configured with a value including or excluding the VAT.  
BNK| banktype| `-1` = return both bank as well cash transaction types  
`0` = return bank transaction types  
`1` = return cash transaction types| Restricts the transaction types which will be returned.  
`company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to banks/cash books modified after or at the specified date (and time) which is in UTC.  
CER| accesstype| `use` `edit`| Specifies the minimal required access type for the certificate.  
CUR| `company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to currency modified after or at the specified date (and time) which is in UTC.  
DIM| includehidden| `0` = false  
`1` = true| If set to `1`, the response will include a status column (active/hidden) and both active and hidden dimensions will be included.  
DIM (financials)| level| `1` `2` `3` `4` `5` `6`| Specifies the dimension level.  
section| `financials` `teq`| Restricts to financial or time & expenses dimensions.  
`company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
dimtype| `BAS` `PNL` `DEB` `CRD` `KPL` `PRJ` `AST` `ACT`| Specifies the dimension type.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to dimensions modified after or at the specified date (and time) which is in UTC.  
matchtype| `relation`| This option will show only the relations (dimension type: DEB and/or CRD).  
DIM (time & expenses)| accessrules| `0` `1`| Disabling the access rules is only possible if the user has access to project dimension maintenance.  
accessuser| «user code»| Specifies the time user.  
role| «role code»| Specifies the time user role.  
trscode| «transaction code»| Specifies the transaction code and will only return the projects or activities which are related to the specified transaction code.  
`company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
DMT| dim| «dimension code»| Restricts to the type of the specified dimension.  
finlevel| `1` `2` `3` `4` `5` `6`| Specifies the financial level.  
GRP| prefix| | Specifies that the search field should start with the given value.  
dimtype| `BAS` `PNL` `DEB` `CRD` `KPL` `PRJ` `AST` `ACT`| Specifies the dimension type.  
GWY| gatewaytype| «gateway type»| Specifies the gateway type.  
accesstype| `use` `edit`| Specifies the minimal required access type for the gateway.  
HIE| accesstype| `use` `bind` `edit`| Specifies the minimal required access type for the reporting structure.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to reporting structure modified after or at the specified date (and time) which is in UTC.  
officegroup| «office group code»| Sets the office group. Can only be used in combination with `accesstype`.  
HND| hierarchy| «reporting structure code»| Specifies the reporting structure.  
accesstype| `use` `bind` `edit`| Specifies the minimal required access type for the reporting structure.  
showrootnode| `0` = false  
`1` = true| Specifies whether the root node of the reporting structure is shown or not.  
INV| vat| `inclusive` `exclusive`| Return only invoice types configured for including or excluding VAT.  
IVT| dim1 - dim6| «dimension code»| Specifies a dimension code (and in such a financial level).  
value| «x.yy»| Specifies the (original invoice) value.  
openvalue| «x.yy»| Specifies the open value.  
CQT| dim1 - dim6| «dimension code»| Specifies a dimension code (and in such a financial level).  
value| «x.yy»| Specifies the (original cheque) value.  
openvalue| «x.yy»| Specifies the open value.  
OFF| includeid| `0` = false  
`1` = true| If set to `1`, the result will include a (company) id column.  
withouttaxgroup| `0` = false  
`1` = true| If set to `1`, the list of offices is limited to offices that are not part of a tax group and those offices don't contain VAT returns which are not approved yet.  
OFG| accessrules| `0` = false  
`1` = true| If set to `1`, the list of office groups is limited to office groups containing offices the user has access to.  
PAY| paytype| `pay` `collect`| Specifies which type of pay and collect types should be returned.  
`company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to PaymentType modified after or at the specified date (and time) which is in UTC.  
PIS| bnkcode| «bank code»| Limits the paying-in slips to the given bank code.  
openvalue| «x.yy»| Limits the paying-in slips to the given open amount.  
generalledger| «general ledger code»| Limits the paying-in slips to the given general ledger code.  
trscurrency| «currency code»| Limits the paying-in slips to the given currency code.  
PRD| includeclosed| `0` = false  
`1` = true| If set to `1`, also closed periods are returned.  
includesystem| `0` = false  
`1` = true| If set to `1`, also system periods are returned.  
specificperiod| «period»| Returns the year/period containing the given period.  
minyearperiod| «period»| If set, only periods after the set period are returned.  
REW| purpose| `0` = invoicing  
`1` = credit management| Limits the list of Word templates to the given function.  
SAR| article| «item code»| Mandatory. The item code for which sub items are returned.  
vat| `inclusive` `exclusive`| Return only sub items configured with a value including or excluding the VAT.  
TRS| hidden| `1`| If set also hidden transaction types are returned.  
ic| `1`| Shows only “InterCompany” transaction types in the result set. This option cannot be used in combination with the 'hidden' option.  
category| `sales` `purchase` `journal`| Specifies which category of transaction types should be returned.  
`company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to transaction types modified after or at the specified date (and time) which is in UTC.  
TRT| ratetype| `time` `quantity`| Specifies the rate type.  
USR| accessrules| `0` `1`| Disabling the access rules is only possible if the user has access to user management.  
mutualoffices| `0` `1`| Shows all users who have access to a selection of offices that overlaps with the Web Service user permissions.  
VAT| vattype| `purchase` `sales`| Specifies the VAT type.  
`company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to vat codes modified after or at the specified date (and time) which is in UTC.  
VATN| country| «country code»| Specifies the country.  
dimtype| «dimension type code»| Specifies the dimension type.  
dimcode| «dimension code»| Specifies the dimension code.  
mode| `ict`| Limits the returned list of relations to ICT relations.  
`company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to vat numbers modified after or at the specified date (and time) which is in UTC.  
VGM| country| «country code»| Specifies the country.  
`company` (also accepts `office`)| `«company code»` = returns for specified company code  
`*` = returns for all accessible companies in an organisation| Also asterisk (*) is supported as company code value, in that case the data for all companies the user has access to is returned.  
modifiedsince| `yyyyMMddHHmmss` or `yyyyMMdd`| Restricts to vat groups modified after or at the specified date (and time) which is in UTC.
