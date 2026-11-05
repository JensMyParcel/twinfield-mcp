  * [](/documentation/)
  * Web Services Overview



On this page

# Web Services Overview

## Web services endpoints​

Below an overview is provided of the available web services and XML requests.

Login (resource location = `https://login.twinfield.com`)Web service| Description| Resource location  
---|---|---  
Authorize| Request authorization code (short-live code)| /auth/authentication/connect/authorize  
Token(s)| Get Token(s)| /auth/authentication/connect/token  
Renewal| Renewal of Token(s)| /auth/authentication/connect/token  
Validate| Validate token/ Cluster determination| /auth/authentication/connect/accesstokenvalidation?token=  
User Info| Get User Info| /auth/authentication/connect/userinfo  
  
Cluster (resource location = `https://api.<cluster>.twinfield.com`)Web service| Description| Resource location  
---|---|---  
Bank books| Twinfield Bank books web service methods.| /webservices/bankbookservice.svc?wsdl  
Bank statements| Twinfield Bank statements web service methods.| /webservices/bankstatementservice.svc?wsdl  
Budgets| Twinfield Budgets web service methods.| /webservices/budgetservice.svc?wsdl  
Cash books| Twinfield Cash books web service methods.| /webservices/cashbookservice.svc?wsdl  
Declarations| Twinfield Declarations web service methods.| /webservices/declarations.asmx?wsdl  
Documents| Twinfield Documents web service methods.| /webservices/documentservice.svc?wsdl  
Finder| Twinfield Finder web service methods.| /webservices/finder.asmx?wsdl  
Hierarchies| Twinfield Hierarchy web service methods.| /webservices/hierarchies.asmx?wsdl  
Matching| Twinfield Matching web service methods.| /webservices/matching.asmx?wsdl  
Pay and collect| Twinfield Pay and Collect web service methods.| /webservices/payandcollect.asmx?wsdl  
Pay type| Twinfield Pay Type web service methods.| /webservices/paytype.asmx?wsdl  
Periods| Twinfield Period web service methods.| /webservices/periodservice.svc?wsdl  
ProcessXml| Twinfield Process XML web service methods. See below for an overview of the supported XML messages.| /webservices/processxml.asmx?wsdl  
XBRL| Twinfield XBRL(SBR) web service methods.| /webservices/sbr.asmx?wsdl  
Versions| Twinfield Versions web service methods.| /webservices/versions.asmx?wsdl  
Deleted transactions| Twinfield Deleted transactions web service methods.| /webservices/deletedtransactionsservice.svc?wsdl  
Blocked value| Twinfield Transaction blocked value web service methods.| /webservices/transactionblockedvalueservice.svc?wsdl  
  
## XML messages​

Below an overview is provided of the XML messages which are support by the ProcessXml web service.

Root| Description  
---|---  
user| Maintain users.  
transaction| Maintain transactions.  
match| Match transactions.  
period| Validation of periods.  
accountcode| Validation of account codes.  
currency| Maintain currencies.  
cmaction| Maintain invoice actions.  
office| Maintain companies.  
projectrate| Maintain rates.  
statement| Maintain statements.  
dimensiontype| Maintain dimension types.  
dimension| Maintain dimensions.  
payrun| Maintain pay and collect runs. Use the Pay and Collect web service instead.  
paymanagement| Maintain pay types.  
assetmethod| Maintain asset methods.  
cdmaction| Maintain invoice actions.  
dimensiongroup| Maintain dimension groups.  
remindruntype| Maintain reminder scenarios.  
vatgroup| Maintain vat groups.  
vat| Maintain VAT codes.  
vattype| Maintain VAT groups.  
article| Maintain items.  
salesinvoice| Maintain sales invoices.  
teq| Maintain hours and expenses.  
hierarchy| Maintain reporting structures.  
list| List master entities. See below for the supported entities.  
read| Read the details entities. See below for the supported entities.  
  
## List entities​

The following entities are supported.

Root| Description  
---|---  
offices| List of companies. Use the Finder web service instead.  
dimensions| List of dimensions. Use the Finder web service instead.  
browsefields| List of available browse fields.  
budgets| List of budgets. Use the Budgets web service instead.  
  
## Read entities​

The following entities are supported.

Root| Description  
---|---  
dimensions| Reads all details of a single dimension or all dimensions by dimension type.  
paylist| Gives an overview of all available pay and collect runs.  
paymanagement| Reads the details of a single payment type.  
browse| Reads the definition of a browse code.  
user| Reads the details of a user.  
transaction| Reads the details of a transaction.  
activeanalysis| Gives an overview of all available TwinCubes.  
salesinvoice| Reads the details of a sales invoice.  
article| Reads the details of an item.  
vat| Reads the details of a VAT code.  
office| Reads the details of a company.  
projectrate| Reads the details of a rate.
