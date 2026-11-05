  * [](/documentation/)
  * Request Data
  * Browse data



On this page

# Browse data

## Introduction​

In order to get financial data out of Twinfield like general ledger transactions, sales invoices, and so on, use the browse data functionality. This functionality is based on so called browse codes. These browse codes are predefined definitions of financial data.

## Regimes​

When retrieving financial transactions from Twinfield, it is important to consider regimes.

With the introduction of the new fixed assets module, financial transactions can be created within different regimes. Financial transactions can be posted within one of the following regimes:

  1. Generic
  2. Fiscal
  3. Economic
  4. Commercial



Notice that it is not obvious that regimes are used within a company. In case regimes are not used, a financial transaction will be created in the “Generic” regime by default. A company can contain financial transactions posted in one, two or all three regimes (apart from the generic regime which is always available).

So a Twinfield company will contain generic financial transactions and optional regime specific financial transactions. Overview of values of a company by regime are build up by the specific financial transactions by regime extended with the generic financial transactions.

Several browse codes contains a column by which financial transactions in a specific regime can be selected. The behavior is:

Browse code| Behavior  
---|---  
000| If no regime is selected, all transactions lines will be shown.   
Searching for Generic will return only Generic transaction lines.   
Searching for Fiscal, Commercial or Economic will return those specific transaction lines, including all Generic lines.   
Transaction lines will not be grouped and summed.  
010| If no regime is selected, all transactions lines will be shown.   
Searching for Generic will return only Generic transaction lines.   
Searching for Fiscal, Commercial or Economic will return those specific transaction lines, including all Generic lines.   
Transaction lines will not be grouped and summed.  
020| If no regime is selected, all transactions lines will be shown.   
Searching for Generic will return only Generic transaction lines.   
Searching for Fiscal, Commercial or Economic will return those specific transaction lines, including all Generic lines.   
Transaction lines will not be grouped and summed.  
030_3| If no regime is selected, all transactions lines will be shown.   
Searching for Generic will return only Generic transaction lines.   
Searching for Fiscal, Commercial or Economic will return those specific transaction lines, including all Generic lines.   
Transaction lines will not be grouped and summed.  
031_2| If no regime is selected, all transactions lines will be shown.   
Searching for Generic will return only Generic transaction lines.   
Searching for Fiscal, Commercial or Economic will return those specific transaction lines, including all Generic lines.   
Transaction lines will not be grouped and summed.  
040_1| Regime is mandatory.   
Searching for Generic will return only Generic transaction lines.   
Searching for Fiscal, Commercial or Economic will return those specific transaction lines, including all Generic lines.   
Transaction lines will be grouped and summed.  
050_1| Regime is mandatory.   
Searching for Generic will return only Generic transaction lines.   
Searching for Fiscal, Commercial or Economic will return those specific transaction lines, including all Generic lines.   
Transaction lines will be grouped and summed.  
060| Regime is mandatory.   
Searching for Generic will return only Generic transaction lines.   
Searching for Fiscal, Commercial or Economic will return those specific transaction lines, including all Generic lines.   
Transaction lines will be grouped and summed.  
  
## Best practices​

In order to avoid technical error messages because of retrieving large data sets, apply the following best practices:

  1. Retrieve the transactions by period.
  2. Only add columns to your request for which you really need the values.



## Steps to be taken​

When developing a query to extract data from Twinfield the follow steps need to be taken:

  1. Determine in Twinfield which browse definition to use.
  2. Read the browse definition.
  3. Fill in the selection criteria.
  4. Compose and send the (browse) query to Twinfield.



It is important to notice that the first two steps should only be taken once. At the moment the browse definition is clear and the browse query is created, it can be used in the calling software.

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

## Determine which browse definition to use​

The available browse definitions correspond to the Transaction lines functionality in Twinfield and the available TwinCubes in Twinfield analysis. A browse definition is represented by a browse code. The following browse codes are available:

Browse code| Description  
---|---  
000| General ledger transactions  
010| Transactions still to be matched  
020| Transaction list  
100| Customer transactions  
200| Supplier transactions  
300| Project transactions  
301| Asset transactions  
400| Cash transactions  
410| Bank transactions  
900| Cost centers  
030_1| General Ledger (details)  
030_2| General Ledger (details) (v2)  
030_3| General Ledger (details) (v3)  
031| General Ledger (intercompany)  
031_2| General Ledger (intercompany)(v2)  
040_1| Annual Report (totals)  
050_1| Annual Report (YTD)  
060| Annual Report (totals multicurrency)  
130_1| Customers  
130_2| Customers (v2)  
130_3| Customers (v3)  
164| Credit Management  
230_1| Suppliers  
230_2| Suppliers (v2)  
302_1| Fixed Assets  
610_1| Time & Expenses (Totals)  
620| Time & Expenses (Multicurrency)  
650_1| Time & Expenses (Details)  
651_1| Time & Expenses (Totals per week)  
652_1| Time & Expenses (Totals per period)  
660_1| Time & Expenses (Billing details)  
661_1| Time & Expenses (Billing per week)  
662_1| Time & Expenses (Billing per period)  
670| Transaction summary  
680| Bank link details  
680_2| Bank link details (v2)  
690| Vat Return status  
700| Hierarchy access  
  
Follow the link to this [document](/documentation/assets/files/BrowseCodeDetails-c5a8066a60f8c2e2c0cb3cf6716641ce.pdf) to get a clear view of the most used browse codes and their fields.

## Read the browse definition​

Once the browse definition to be used is clear, its content can be determined. Each browse definition exists of browse fields. These browse fields contains the data and some of those also acts as selection criteria. Which browse fields are available depends on the used browse definition. In order to get an overview of the available browse fields of a browse definition, use the `read` XML request.

Next example returns all available fields of browse code `000` \- General ledger transactions - of company `001`.

  * Request
  * Response


    
    
    <read>  
        <type>browse</type>  
        <office>001</office>  
        <code>000</code>  
    </read>  
    
    
    
    <browse result="1">  
        <office name="Test company" shortname="Test company">001</office>  
        <code>000</code>  
        <name>General ledger transactions</name>  
        <shortname>General ledger transactions</shortname>  
        <visible>true</visible>  
        <columns code="000">  
            <column id="1">  
                <field>fin.trs.head.yearperiod</field>  
                <label>Period</label>  
                <visible>true</visible>  
                <ask>true</ask>  
                <operator>between</operator>  
                <from>$DEFAULT$</from>  
                <to>$DEFAULT$</to>  
                <finderparam></finderparam>  
            </column>  
            <column id="2">  
                <field>fin.trs.head.code</field>  
                <label>Transaction type</label>  
                <visible>true</visible>  
                <ask>true</ask>  
                <operator>equal</operator>  
                <from></from>  
                <to></to>  
                <finderparam>hidden=1</finderparam>  
            </column>  
            <column id="3">  
                <field>fin.trs.head.shortname</field>  
                <label>Name</label>  
                <visible>true</visible>  
                <ask>false</ask>  
                <operator>none</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="4">  
                <field>fin.trs.head.number</field>  
                <label>Trans. no.</label>  
                <visible>true</visible>  
                <ask>true</ask>  
                <operator>between</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="5">  
                <field>fin.trs.head.status</field>  
                <label>Status</label>  
                <visible>true</visible>  
                <ask>true</ask>  
                <operator>equal</operator>  
                <from>normal</from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="6">  
                <field>fin.trs.line.dim1</field>  
                <label>General ledger</label>  
                <visible>true</visible>  
                <ask>true</ask>  
                <operator>between</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="7">  
                <field>fin.trs.line.dim1name</field>  
                <label>Name</label>  
                <visible>true</visible>  
                <ask>false</ask>  
                <operator>none</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="8">  
                <field>fin.trs.head.curcode</field>  
                <label>Currency</label>  
                <visible>false</visible>  
                <ask>false</ask>  
                <operator>equal</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="9">  
                <field>fin.trs.line.valuesigned</field>  
                <label>Value</label>  
                <visible>false</visible>  
                <ask>false</ask>  
                <operator>between</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="10">  
                <field>fin.trs.line.basevaluesigned</field>  
                <label>Euro</label>  
                <visible>true</visible>  
                <ask>true</ask>  
                <operator>between</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="11">  
                <field>fin.trs.line.repvaluesigned</field>  
                <label>dollar</label>  
                <visible>true</visible>  
                <ask>true</ask>  
                <operator>between</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
            <column id="12">  
                <field>fin.trs.line.description</field>  
                <label>Description</label>  
                <visible>true</visible>  
                <ask>false</ask>  
                <operator>none</operator>  
                <from></from>  
                <to></to>  
                <finderparam></finderparam>  
            </column>  
        </columns>  
    </browse>  
    

Besides some general information about the browse definition, all available columns of the specific browse definition are returned in the `columns` section.

Element name: `column`

Name| Type| Description  
---|---|---  
@id| integer| Column id.  
field| string(40)| Predefined field names of the particular browse code.  
label| string(255)| Column header description.  
visible| `true`   
`false`| If visible = `true` then the column will be shown in the result.   
If visible = `false` the column will not be shown.   
If the value of this property is set to `false` do not change it into `true` when using it in a browse request in order to prevent technical errors.   
Read-only attribute.  
ask| `true`   
`false`| Can a selection criterion been entered.   
Read-only attribute.  
operator| `none`   
`equal`   
`between`| List of operators. Only applicable in case `ask` is `true`.  
from| string(40)| Value from. When the `operator` is `none` the value will be ignored.  
to| string(40)| Value to. Only be filled in when the `operator` is `between`.  
finderparam| | Not in use.  
  
## Fill in the selection criteria​

Once the available fields of a browse definition are determined, the available selection criteria are clear. All fields for which the tag `ask` is `true` can be used as a selection criterion.

Underneath example adds a selection criterion on the period field:
    
    
    <column>  
        <field>fin.trs.head.yearperiod</field>  
        <operator>between</operator>  
        <from>2021/01</from>  
        <to>2021/12</to>  
    </column>  
    

## Compose the browse request and send it​

info

When retrieving data from Twinfield, the data of the company the user is currently logged in to will be retrieved. When the user is not logged in to the correct company, use the SelectCompany function in order to switch to another company.

Create based on the available fields of the browse definition and the available selection criteria the final browse request. Only add those fields for which data should be retrieved or which are used as a selection criterion.

In the browse request it is possible to add up to three sort fields. The data of the XML response will then be sorted based on these fields. Underneath an example:
    
    
    <sort>  
        <field order="descending">fin.trs.line.dim2</field>  
        <...>  
    </sort>  
    

Element name: `sort`

Name| Type| Description  
---|---|---  
field| string(40)| Predefined field names of the particular browse code.  
@order| `ascending`   
`descending`| The sorting order. `ascending` is the default value.  
  
Besides the sorting order, the following attributes can be added to the request:

Attribute| Description  
---|---  
optimize| Enables or disables optimization of the output. Possible values are `true` and `false`. `false` is the default value. When set to `true`, the `field`, `hideforuser` and `type` attributes are removed from all <td> elements except those in the <th> element.  
outputformat| Determines the output format of the data. Possible values are "XML" and "CSVEXCEL", "XML" is the default value. Output format XML creates a series of <tr> and <td> elements to store the data. Output format CSVEXCEL creates a single <csv> element containing CSV data optimized for use in MS Excel. The field separator is the tab character.  
  
## Browse fields​

As mentioned before, browse definitions exists of browse fields. Each browse fields has its own definition and can be determined by using the `list` XML. This is useful in particular for browse fields with predefined values like `fin.trs.head.status` or `fin.trs.line.debitcredit`.

Below example returns all available browse fields and their definition. Note that which browse fields can be used depends on the browse code, which is used.

  * Request
  * Response


    
    
    <list>  
        <type>browsefields</type>  
    </list>  
    

Underneath a limited overview of the response XML.
    
    
    <browsefields>  
        <browsefield>  
            <code>fin.trs.head.bankcode</code>  
            <datatype>special</datatype>  
            <finder></finder>  
            <dropdown>  
                <option name="">BNKABN</option>  
                <option name="">BNKRABO</option>  
            </dropdown>  
            <canorder/>  
        </browsefield>  
        <browsefield>  
            <code>fin.trs.head.banktype</code>  
            <datatype>special</datatype>  
            <finder></finder>  
            <dropdown>  
                <option name="Bank">bank</option>  
                <option name="Kas">cashbook</option>  
            </dropdown>  
            <canorder/>  
        </browsefield>  
        <browsefield>  
            <code>fin.trs.head.number</code>  
            <datatype>decimal</datatype>  
            <finder></finder>  
            <dropdown/>  
            <canorder/>  
        </browsefield>  
        <browsefield>  
            <code>fin.trs.head.status</code>  
            <datatype>special</datatype>  
            <finder></finder>  
            <dropdown>  
                <option name="Draft">draft</option>  
                <option name="Provisional">temporary</option>  
                <option name="Final">final</option>  
                <option name="In use">inuse</option>  
                <option name="Provisional & Final">normal</option>  
            </dropdown>  
            <canorder/>  
        </browsefield>  
        <browsefield>  
            <code>fin.trs.line.debitcredit</code>  
            <datatype>special</datatype>  
            <finder></finder>  
            <dropdown>  
                <option name="Credit">credit</option>  
                <option name="Debet">debit</option>  
            </dropdown>  
            <canorder/>  
        </browsefield>  
        <browsefield>  
            <...>  
        </browsefield>  
    <browsefields>  
    

## Example​

Underneath an example of the General ledger transactions browse definition.

  * Request
  * Response


    
    
    <columns code="000">  
        <sort>  
            <field>fin.trs.head.code</field>  
        </sort>  
        <column>  
            <field>fin.trs.head.yearperiod</field>  
            <label>Period</label>  
            <visible>true</visible>  
            <ask>true</ask>  
            <operator>between</operator>  
            <from>2021/01</from>  
            <to>2021/12</to>  
        </column>  
        <column>  
            <field>fin.trs.head.code</field>  
            <label>Transaction type</label>  
            <visible>true</visible>  
        </column>  
        <column>  
            <field>fin.trs.head.shortname</field>  
            <label>Name</label>  
            <visible>true</visible>  
        </column>  
        <column>  
            <field>fin.trs.head.number</field>  
            <label>Trans. no.</label>  
            <visible>true</visible>  
        </column>  
        <column>  
            <field>fin.trs.line.dim1</field>  
            <label>General ledger</label>  
            <visible>true</visible>  
            <ask>true</ask>  
            <operator>between</operator>  
            <from>1300</from>  
            <to>1300</to>  
        </column>  
        <column>  
            <field>fin.trs.head.curcode</field>  
            <label>Currency</label>  
            <visible>true</visible>  
        </column>  
        <column>  
            <field>fin.trs.line.valuesigned</field>  
            <label>Value</label>  
            <visible>true</visible>  
        </column>  
        <column>  
            <field>fin.trs.line.description</field>  
            <label>Description</label>  
            <visible>true</visible>  
        </column>  
    </columns>  
    
    
    
    <browse result="1" first="1" last="6" total="6">  
        <th>  
            <td label="Period" hideforuser="false" type="String">fin.trs.head.yearperiod</td>  
            <td label="Transaction type" hideforuser="false" type="String">fin.trs.head.code</td>  
            <td label="Name" hideforuser="false" type="String">fin.trs.head.shortname</td>  
            <td label="Trans. no." hideforuser="false" type="Decimal">fin.trs.head.number</td>  
            <td label="General ledger" hideforuser="false" type="String">fin.trs.line.dim1</td>  
            <td label="Currency" hideforuser="false" type="String">fin.trs.head.curcode</td>  
            <td label="Value" hideforuser="false" type="Value">fin.trs.line.valuesigned</td>  
            <td label="Description" hideforuser="false" type="String">fin.trs.line.description</td>  
        </th>  
        <tr>  
            <td field="fin.trs.head.yearperiod" hideforuser="false" type="String">2021/04</td>  
            <td field="fin.trs.head.code" hideforuser="false" type="String">BNK</td>  
            <td field="fin.trs.head.shortname" hideforuser="false" type="String">Bank 33</td>  
            <td field="fin.trs.head.number" hideforuser="false" type="Decimal">202100001</td>  
            <td field="fin.trs.line.dim1" hideforuser="false" type="String">1300</td>  
            <td field="fin.trs.head.curcode" hideforuser="false" type="String">EUR</td>  
            <td field="fin.trs.line.valuesigned" hideforuser="false" type="Value">-121.00</td>  
            <td field="fin.trs.line.description" hideforuser="false" type="String">test</td>  
            <key>  
                <office>001</office>  
                <code>BNK</code>  
                <number>202100001</number>  
                <line>2</line>  
            </key>  
        </tr>  
        <tr>  
            <td field="fin.trs.head.yearperiod" hideforuser="false" type="String">2021/02</td>  
            <td field="fin.trs.head.code" hideforuser="false" type="String">BNK1</td>  
            <td field="fin.trs.head.shortname" hideforuser="false" type="String">Bank 01</td>  
            <td field="fin.trs.head.number" hideforuser="false" type="Decimal">202100001</td>  
            <td field="fin.trs.line.dim1" hideforuser="false" type="String">1300</td>  
            <td field="fin.trs.head.curcode" hideforuser="false" type="String">EUR</td>  
            <td field="fin.trs.line.valuesigned" hideforuser="false" type="Value">-700.00</td>  
            <td field="fin.trs.line.description" hideforuser="false" type="String"></td>  
            <key>  
                <office>001</office>  
                <code>BNK1</code>  
                <number>202100001</number>  
                <line>2</line>  
            </key>  
        </tr>  
        <tr>  
            <td field="fin.trs.head.yearperiod" hideforuser="false" type="String">2021/02</td>  
            <td field="fin.trs.head.code" hideforuser="false" type="String">BNK1</td>  
            <td field="fin.trs.head.shortname" hideforuser="false" type="String">Bank 01</td>  
            <td field="fin.trs.head.number" hideforuser="false" type="Decimal">202100002</td>  
            <td field="fin.trs.line.dim1" hideforuser="false" type="String">1300</td>  
            <td field="fin.trs.head.curcode" hideforuser="false" type="String">EUR</td>  
            <td field="fin.trs.line.valuesigned" hideforuser="false" type="Value">-700.00</td>  
            <td field="fin.trs.line.description" hideforuser="false" type="String">1006-26022021</td>  
            <key>  
                <office>001</office>  
                <code>BNK1</code>  
                <number>202100002</number>  
                <line>2</line>  
            </key>  
        </tr>  
        <tr>  
            <td field="fin.trs.head.yearperiod" hideforuser="false" type="String">2021/03</td>  
            <td field="fin.trs.head.code" hideforuser="false" type="String">BNK1</td>  
            <td field="fin.trs.head.shortname" hideforuser="false" type="String">Bank 01</td>  
            <td field="fin.trs.head.number" hideforuser="false" type="Decimal">202100003</td>  
            <td field="fin.trs.line.dim1" hideforuser="false" type="String">1300</td>  
            <td field="fin.trs.head.curcode" hideforuser="false" type="String">EUR</td>  
            <td field="fin.trs.line.valuesigned" hideforuser="false" type="Value">-221.00</td>  
            <td field="fin.trs.line.description" hideforuser="false" type="String"></td>  
            <key>  
                <office>001</office>  
                <code>BNK1</code>  
                <number>202100003</number>  
                <line>2</line>  
            </key>  
        </tr>  
        <tr>  
            <td field="fin.trs.head.yearperiod" hideforuser="false" type="String">2021/05</td>  
            <td field="fin.trs.head.code" hideforuser="false" type="String">VRK</td>  
            <td field="fin.trs.head.shortname" hideforuser="false" type="String">Sales</td>  
            <td field="fin.trs.head.number" hideforuser="false" type="Decimal">202100080</td>  
            <td field="fin.trs.line.dim1" hideforuser="false" type="String">1300</td>  
            <td field="fin.trs.head.curcode" hideforuser="false" type="String">EUR</td>  
            <td field="fin.trs.line.valuesigned" hideforuser="false" type="Value">13077.63</td>  
            <td field="fin.trs.line.description" hideforuser="false" type="String"></td>  
            <key>  
                <office>001</office>  
                <code>VRK</code>  
                <number>202100080</number>  
                <line>1</line>  
            </key>  
        </tr>  
        <tr>  
            <td field="fin.trs.head.yearperiod" hideforuser="false" type="String">2021/06</td>  
            <td field="fin.trs.head.code" hideforuser="false" type="String">VRK</td>  
            <td field="fin.trs.head.shortname" hideforuser="false" type="String">Sales</td>  
            <td field="fin.trs.head.number" hideforuser="false" type="Decimal">202100081</td>  
            <td field="fin.trs.line.dim1" hideforuser="false" type="String">1300</td>  
            <td field="fin.trs.head.curcode" hideforuser="false" type="String">EUR</td>  
            <td field="fin.trs.line.valuesigned" hideforuser="false" type="Value">300.00</td>  
            <td field="fin.trs.line.description" hideforuser="false" type="String"></td>  
            <key>  
                <office>001</office>  
                <code>VRK</code>  
                <number>202100081</number>  
                <line>1</line>  
            </key>  
        </tr>  
    </browse>  
    
