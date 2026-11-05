  * [](/documentation/)
  * Transaction Data
  * Electronic bank statements



On this page

# Electronic bank statements

An electronic bank statement is made up of two elements in Twinfield:

  * General information, such as bank statement date, account number, bank statement number, etc.
  * Bank statement transaction lines.



## Read​

Refer to [Bank statements](/documentation/api/request-data/electronic-bank-statements).

## Create​

Once a bank statement is created, it is not possible to change it.

Multiple bank statements can be created at once by enclosing them by the `statements` element.

### Root​

XML structure

  * Request
  * Response


    
    
    <statements importduplicate="">  
        <statement target="">  
            <transactions></transactions>  
        </statement>  
    </statements>  
    
    
    
    <statements importduplicate="">  
        <statement target="">  
            <transactions></transactions>  
        </statement>  
    </statements>  
    

Element name: `statement`

Name| Description  
---|---  
@importduplicate| Optional attribute to indicate whether duplicates may be imported or not. If left empty, `0` is used as a default.   
`0` = duplicates are not imported   
`1` = duplicates are imported  
@target| Optional attribute. Fixed value `electronicstatements`.  
transactions| Contains the bank statement transactions.  
  
### Statement​

XML structure

  * Request
  * Response


    
    
    <statement target="">  
        <account></account>  
        <iban></iban>  
        <date></date>  
        <currency></currency>  
        <statementnumber></statementnumber>  
        <code></code>  
        <office></office>  
        <startvalue></startvalue>  
        <closevalue></closevalue>  
        <sortcode></sortcode>  
    </statement>  
    
    
    
    <statement target="">  
        <account></account>  
        <iban></iban>  
        <date></date>  
        <currency></currency>  
        <statementnumber></statementnumber>  
        <code name="" shortname=""></code>  
        <office name="" shortname=""></office>  
        <startvalue></startvalue>  
        <closevalue></closevalue>  
        <sortcode></sortcode>  
    </statement>  
    

Element name: `statement`

Name| Type| Description  
---|---|---  
account| string| Account number. Either `account` or `iban` or `code` should be set.  
iban| string| IBAN account number. Either `account` or `iban` or `code` should be set.  
code| code| Code of the corresponding bank book. Either `account` or `iban` or `code` should be set.  
date| date| Bank statement date. Set to the current date when left empty.  
currency| code| Currency code. Set to the currency of the corresponding bank day book when left empty.  
statementnumber| integer| Number of the bank statement. When left empty, last available bank statement number increased by one.  
office| code| Optional. Code of the office in which the bank statement should be imported.  
startvalue| money| Opening balance. If not provided, the opening balance will be based on the previous bank statement.  
closevalue| money| Closing balance. If not provided, the closing balance will be based on the opening balance and the total amount of the transactions.  
sortcode| string| Sorting code. Mandatory to include if clearing code is set on the bank.  
  
### Bank statement transactions​

XML structure

  * Request
  * Response


    
    
    <transactions>  
        <transaction></transaction>  
    </transactions>  
    
    
    
    <transactions count="">  
        <transaction></transaction>  
    </transactions>  
    

Element name: `transactions`

Name| Type| Description  
---|---|---  
@count| integer| The number of bank statement transactions.  
transaction| node| Contains information of the bank statement transaction.  
  
#### Transaction​

XML structure

  * Request
  * Response


    
    
    <transaction>  
        <contraaccount></contraaccount>  
        <contraiban></contraiban>  
        <type></type>  
        <reference></reference>  
        <debitcredit></debitcredit>  
        <value></value>  
        <description></description>  
    </transaction>  
    
    
    
    <transaction>  
        <contraaccount></contraaccount>  
        <contraiban></contraiban>  
        <type></type>  
        <reference></reference>  
        <debitcredit></debitcredit>  
        <value></value>  
        <description></description>  
        <dim1 name="" shortname="" dimensiontype=""></dim1>  
        <dim2 name="" shortname="" dimensiontype=""></dim2>  
        <dim3 name="" shortname="" dimensiontype=""></dim3>  
        <dim4 name="" shortname="" dimensiontype=""></dim4>  
    </transaction>  
    

Element name: `transaction`

Name| Type| Description  
---|---|---  
contraaccount| string| Contra account number in BBAN format. Either use `contraaccount` or `contraiban` or leave empty.   
Attribute `@name` describes account holder.  
contraiban| string| Contra account number in IBAN format. Either use `contraaccount` or `contraiban` or leave empty.  
type| string(4)| Transaction type code.  
reference| string(40)| Reference for own use.  
debitcredit| string| `debit` = money is paid by bank   
`credit` = money is received by bank  
value| money| Amount of the transaction.  
description| string(500)| Description of the transaction.  
endtoendid| string| Payment reference (purpose of reverse payment).  
returnreason| string| Drop-out code.  
dim1| string| Dimension 1.   
Read-only attribute.  
dim2| string| Dimension 2.   
Read-only attribute.  
dim3| string| Dimension 3.   
Read-only attribute.  
dim4| string| Dimension 4.   
Read-only attribute.  
  
### XML Example​

  * Request
  * Response


    
    
    <statement target="electronicstatements">  
        <iban>NL91ABNA0417164300</iban>  
        <date>20211108</date>  
        <currency>EUR</currency>  
        <statementnumber>2</statementnumber>  
        <startvalue>7.68</startvalue>  
        <closevalue>151.18</closevalue>  
        <transactions>  
            <transaction>  
                <contraaccount name="Twinfield">1234567890</contraaccount>  
                <type>N100</type>  
                <reference></reference>  
                <debitcredit>credit</debitcredit>  
                <value>151.00</value>  
                <description>Invoice 3722838</description>  
            </transaction>  
            <transaction>  
                <contraiban>NL91ABNA0417164301</contraiban>  
                <type>N999</type>  
                <reference></reference>  
                <debitcredit>debit</debitcredit>  
                <value>7.50</value>  
                <description>Costs *300</description>  
            </transaction>  
        </transactions>  
    </statement>  
    
    
    
    <statement target="electronicstatements" importduplicate="0" result="1">  
        <iban>NL91ABNA0417164300</iban>  
        <date>20211108</date>  
        <currency>EUR</currency>  
        <statementnumber>2</statementnumber>  
        <startvalue>7.68</startvalue>  
        <closevalue>151.18</closevalue>  
        <transactions count="2">  
            <transaction>  
                <type>N100</type>  
                <reference></reference>  
                <debitcredit>credit</debitcredit>  
                <value>151.00</value>  
                <description>Invoice 3722838</description>  
                <dim1 name="Debtors control" shortname="Debtors control" dimensiontype="BAS">1100</dim1>  
                <dim2 name="Chesterfield" shortname="Chesterfield" dimensiontype="DEB">1075</dim2>  
            </transaction>  
            <transaction>  
                <type>N999</type>  
                <reference></reference>  
                <debitcredit>debit</debitcredit>  
                <value>7.50</value>  
                <description>Costs *300</description>  
                <dim1 name="suspense account" shortname="suspense account" dimensiontype="BAS">2999</dim1>  
            </transaction>  
        </transactions>  
        <office name="001" shortname="001">001</office>  
        <code name="ABN-300" shortname="ABN-300">ABN-300</code>  
    </statement>  
    
