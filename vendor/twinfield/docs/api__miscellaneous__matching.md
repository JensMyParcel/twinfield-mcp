  * [](/documentation/)
  * Miscellaneous
  * Matching



On this page

# Matching

## Match​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### Root​

Element name: `match`

Name| Description  
---|---  
set| Contains information of the match set.  
  
### Set​

Element name: `set`

Name| Type| Description  
---|---|---  
office| code| Office code.  
matchcode| `070`   
`170`   
`270`   
`370`| The following matching types are available:   
`070` = Matching suspense accounts.   
`170` = Matching customers.   
`270` = Matching suppliers.   
`370` = Matching projects.  
matchdate| date| Match date.  
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
transcode| code| Daybook code.  
transnumber| integer| Transaction number.  
transline| integer| Transaction line number.  
matchvalue| money| Optional; only for partial payments. Include an "-" on credit lines.  
writeoff| money| Optional; only for exchange rate differences, write-off or deduction. Include an "-" on credit lines.   
Add the `type` attribute in order to determine what to do with the match difference. Possible values are:   
`currency`   
`writeoff`   
`discount`  
  
### XML Examples​

  * Full payment
  * Part payment
  * Discount



In the following example, a sales invoice transaction is fully matched with a cash payment.
    
    
    <match>  
       <set>  
          <office>001</office>  
          <matchcode>170</matchcode>  
          <matchdate>20210211</matchdate>  
          <lines>  
             <line>  
                <transcode>CASH</transcode>  
                <transnumber>202100013</transnumber>  
                <transline>2</transline>  
             </line>  
             <line>  
                <transcode>VRK</transcode>  
                <transnumber>202100069</transnumber>  
                <transline>1</transline>  
             </line>  
          </lines>  
       </set>  
    </match>  
    

In the following example, a sales invoice transaction with an amount of 121.00 is partly paid by a cash payment of 119.00.
    
    
    <match>  
       <set>  
          <office>001</office>  
          <matchcode>170</matchcode>  
          <matchdate>20210211</matchdate>  
          <lines>  
             <line>  
                <transcode>CASH</transcode>  
                <transnumber>202100014</transnumber>  
                <transline>2</transline>  
             </line>  
             <line>  
                <transcode>VRK</transcode>  
                <transnumber>202100070</transnumber>  
                <transline>1</transline>  
                <matchvalue>119.00</matchvalue>  
             </line>  
          </lines>  
       </set>  
    </match>  
    

In the following example, a sales invoice transaction is matched with a cash payment. A discount of 2.00 is applied.
    
    
    <match>  
       <set>  
          <office>001</office>  
          <matchcode>170</matchcode>  
          <matchdate>20210211</matchdate>  
          <lines>  
             <line>  
                <transcode>CASH</transcode>  
                <transnumber>202100015</transnumber>  
                <transline>2</transline>  
             </line>  
             <line>  
                <transcode>VRK</transcode>  
                <transnumber>202100071</transnumber>  
                <transline>1</transline>  
                <writeoff type="discount">2.00</writeoff>  
             </line>  
          </lines>  
       </set>  
    </match>  
    
