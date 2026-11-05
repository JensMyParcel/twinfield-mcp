  * [](/documentation/)
  * Master Data
  * Users



On this page

# Users

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

USR

### Search fields​

Field ID| Fields searched  
---|---  
0| code and name  
1| code  
2| name  
  
The method will return an array containing validation messages. If there are no errors, then the data parameter will contain the actual search result.

### Options

Option| Type| Description  
---|---|---  
accessrules| enumeration: `0`, `1`| Disabling the access rules is only possible if the user has access to user management.  
mutualoffices| enumeration: `0`, `1`| Shows all users who have access to a selection of offices that overlaps with the Web Service user permissions.  
  
## Read​

Web service type: [XML Web Services](/documentation/api/types/xml-web-services)

### XML​

Below example reads the user settings for user 001.
    
    
    <read>  
        <type>user</type>  
        <code>001</code>  
    </read>  
    

## Create/Update/Delete​

If the user is not found it will be automatically created, otherwise it is updated. Set `user/header/@status` to `deleted` for deleting a user.

### Root​

XML structure
    
    
    <user>  
        <smslogin></smslogin>  
        <office></office>  
        <account></account>  
        <time></time>  
        <expenses></expenses>  
        <performance></performance>  
    </user>  
    

XML structure with federation
    
    
    <user>  
        <smslogin></smslogin>  
        <office></office>  
        <account></account>  
        <time></time>  
        <expenses></expenses>  
        <federation></federation>  
        <performance></performance>  
    </user>  
    

Element name: `user`

Name| Description  
---|---  
smslogin| Contains information of the sms login settings.  
office| Contains information of the offices the user has access to.  
account| The account information of the user.  
time| Contains information of the time settings.  
expenses| Contains information of the expenses settings.  
federation| Contains information required to federate a user to use a particular identity server. This functionality can be enabled on request. Please contact the Twinfield Support Desk for more information.  
performance| Not in use.  
  
### User​

XML structure

  * Request
  * Response


    
    
    <user>  
        <code></code>  
        <name></name>  
        <shortname></shortname>  
        <nameview></nameview>  
        <type></type>  
        <acceptextracost></acceptextracost>  
        <demo></demo>  
        <password></password>  
        <culture></culture>  
        <email></email>  
        <role></role>  
        <support></support>  
        <exchangequota></exchangequota>  
        <filemanagerquota></filemanagerquota>  
        <freetext1></freetext1>  
        <freetext2></freetext2>  
        <freetext3></freetext3>  
        <invitationstatus></invitationstatus>  
    </user>  
    
    
    
    <user iscurrentuser="" level="" status="" result="">  
        <code></code>  
        <touched></touched>  
        <created></created>  
        <modified></modified>  
        <name></name>  
        <shortname></shortname>  
        <nameview></nameview>  
        <type locked=""></type>  
        <acceptextracost></acceptextracost>  
        <demo locked=""></demo>  
        <password></password>  
        <culture name="" nativename=""></culture>  
        <email></email>  
        <role locked="" name="" shortname="" level=""></role>  
        <support locked="" count="" max=""></support>  
        <exchangequota locked=""></exchangequota>  
        <filemanagerquota locked=""></filemanagerquota>  
        <freetext1></freetext1>  
        <freetext2></freetext2>  
        <freetext3></freetext3>  
        <invitationstatus></invitationstatus>  
        <user name="" shortname=""></user>  
    </user>  
    

Element name: `user`

Property name| Value| Description  
---|---|---  
@iscurrentuser| `true`   
`false`|   
@level| |   
@status| `active`   
`deleted`   
`hide`| For creating and updating status may be left empty. For deleting `deleted` should be used. In case a user that is used in a transaction is deleted, its status has been changed into `hide`. Hidden users can be activated by using `active`.  
code| code| Code of the user.  
touched| integer| Count of the number of times the user settings are changed.   
Read-only attribute.  
created| datetime| The date/time the user was created.   
Read-only attribute.  
modified| datetime| The last date/time the user was modified.   
Read-only attribute.  
name| string(40)| The name of the user.  
shortname| string(20)| The short name of the user.  
nameview| | Not in use.  
type| `accountant`   
`accountantcustomer`   
`regular`| User type, will be validated with the office type. Use `regular` in case of a non-accountancy organisation.  
acceptextracost| `true`   
`false`| Are extra costs accepted when changing the role (subscription) of the user.  
demo| `true`   
`false`| Indicates whether the user will be used only for training purposes.   
Only available when `type` is equal to `Client of accountant`.  
password| string| The password for the user.  
culture| `cs-CZ` = čeština (Česká republika)   
`de-DE` = Deutsch (Deutschland)   
`da-DK` = dansk (Danmark)   
`en-GB` = English (United Kingdom)   
`fr-FR` = français (France)   
`hu-HU` = magyar (Magyarország)   
`nl-NL` = Nederlands (Nederland)| The culture in which Twinfield is shown.  
email| string(128)| The user’s email address.  
role| code| The role the user is linked to.  
support| | Not in use.  
exchangequota| integer| Twinfield Analysis quota.  
filemanagerquota| integer| File Manager quota.  
freetext1| | Not in use.  
freetext2| | Not in use.  
freetext3| | Not in use.  
invitationstatus| `NotInvited` = Not invited to Wolters Kluwer account   
`Invited` = Invited to Wolters Kluwer account   
`Active` = Active Wolters Kluwer account| When creating a new user or updating an existing noninvited user, you can set this property to: Invited, to invite the user to Wolters Kluwer account. Important: this has effect only for organisations toggled for invitation. If a user is updated or created with the tag "invitationstatus" the tags <culture>, <name> and <role> are mandatory.  
  
### SMS Login​

XML structure

  * Request
  * Response


    
    
    <smslogin>  
        <phonenumber></phonenumber>  
        <service></service>  
    </smslogin>  
    
    
    
    <smslogin>  
        <phonenumber></phonenumber>  
        <service locked="" name="" price=""></service>  
        <services numberofservices="">  
            <service name="" price=""></service>  
        </services>  
    </smslogin>  
    

Element name: `smslogin`

Property name| Value| Description  
---|---|---  
phonenumber| string| The phone number the SMS is sent to in case the SMS logon package is enabled.  
service| `0` = Disable SMS logon package   
`1` = Enable SMS logon package| Enable or disable the SMS logon package.  
services| node| Read-only node.  
  
### Office​

XML structure

  * Request
  * Response


    
    
    <office>  
        <default></default>  
        <template></template>  
        <offices></offices>  
    </office>  
    
    
    
    <office>  
        <default name="" shortname=""></default>  
        <template></template>  
        <offices></offices>  
        <restricted locked="" />  
    </office>  
    

Element name: `office`

warning

The `template` field is [deprecated](/documentation/getting-started/breaking-changes#template-field-in-user-master) and will be removed. This feature will be sunset on 31-12-2024. Use `templatecompanyaccess` instead.

Property name| Value| Description  
---|---|---  
default| code| The default office code; if this field is empty the user will be asked to select a company after the login.  
template| `true`   
`false`| **DEPRECATED** Indicates if the user has access to template companies.  
templatecompanyaccess| `NoUse` = No access to the template company   
`UseAndManage` = Edit right on the template company   
`UseOnlyForCompanyCreation` = Create a new company based on a template company, although no edit rights on the template company| When creating a new user or updating an existing user, you can set this property to indicates user's right to template companies.  
offices| node| List of companies the user has access to.  
restricted| | Not in use.  
  
#### Offices​

XML structure

  * Request
  * Response


    
    
    <offices>  
        <office></office>  
    </offices>  
    
    
    
    <offices>  
        <office name="" shortname=""></office>  
    </offices>  
    

Element name: `offices`

Property name| Value| Description  
---|---|---  
office| code| The office code the user has access to.  
  
### Federation​

XML structure

  * Request
  * Response


    
    
    <federation>  
        <domain></domain>  
        <email></email>  
    </federation>  
    
    
    
    <federation>  
        <domain></domain>  
        <email></email>  
    </federation>  
    

Element name: `federation`

Property name| Value| Description  
---|---|---  
domain| string| The domain name of the identity provider registered in the Wolters Kluwer account.  
email| string(128)| The user’s email address to be used for federation.  
  
### Account status​

XML structure

  * Request
  * Response


    
    
    <account>  
        <sso></sso>  
        <expire></expire>  
        <disable></disable>  
    </account>  
    
    
    
    <account locked="" lastlogon="" failedlogons="">  
        <sso></sso>  
        <expire></expire>  
        <disable></disable>  
    </account>  
    

Element name: `office`

Property name| Value| Description  
---|---|---  
@locked| `true`   
`false`| Is the user account locked?  
@lastlogon| datetime| The last date/time the user was logged on.  
@failedlogons| integer| The number of successively failed logons.  
sso| `0` = disabled   
`1` = enabled   
`2` = required| Single Sign On. This option is only available when Single Sign On is enabled on the organisation.  
expire| date| Date when the password expires. This option is not available when SingleSignOn (sso) is enabled or required.  
disable| node| Start date/time and end date/time when the account is disabled.  
  
#### Disable​

XML structure

  * Request
  * Response


    
    
    <disable>  
        <from></from>  
        <to></to>  
    </disable>  
    
    
    
    <disable>  
        <from></from>  
        <to></to>  
    </disable>  
    

Element name: `disable`

Property name| Value| Description  
---|---|---  
from| datetime| The date/time from which the user is disabled.   
Format is `yyyyMMddHHmmss`.  
to| datetime| The date/time until the user is disabled.   
Format is `yyyyMMddHHmmss`.  
  
### Time​

XML structure

  * Request
  * Response


    
    
    <time>  
        <authoriser></authoriser>  
        <weekhours></weekhours>  
    </time>  
    
    
    
    <time locked="">  
        <authoriser name="" shortname=""></authoriser>  
        <weekhours></weekhours>  
    </time>  
    

Element name: `office`

Property name| Value| Description  
---|---|---  
authoriser| code| User code for authorizing time transactions.  
weekhours| integer| Work hours per week.  
  
### Expenses​

XML structure

  * Request
  * Response


    
    
    <expenses>  
        <dimension1></dimension1>  
        <dimension2></dimension2>  
        <dimension3></dimension3>  
        <dimension4></dimension4>  
    </expenses>  
    
    
    
    <expenses locked="" numberofdimension="">  
        <dimension1 name="" shortname="" dimensiontype=""></dimension1>  
        <dimension2 name="" shortname="" dimensiontype=""></dimension2>  
        <dimension3 name="" shortname="" dimensiontype=""></dimension3>  
        <dimension4 name="" shortname="" dimensiontype=""></dimension4>  
    </expenses>  
    

Element name: `office`

Property name| Value| Description  
---|---|---  
dimension1| code| Default general ledger account for posting hour journals.  
dimension2| code| Default cost center for posting hour journals.  
dimension3| code| Default project for posting hour journals.  
dimension4| code| Default activity for posting hour journals.  
  
## User actions​

XML structure

  * Request
  * Response


    
    
    <user status="">  
        <code></code>  
        <deletereason></deletereason>  
    </user>  
    
    
    
    <user status="">  
        <code></code>  
        <deletereason></deletereason>  
    </user>  
    

Element name: `user`

Property name| Value| Description  
---|---|---  
@status| `active`   
`deleted`   
`hide`| For creating and updating status may be left empty. For deleting `deleted` should be used. In case a user that is used in a transaction is deleted, its status has been changed into `hide`. Hidden users can be activated by using `active`.  
code| code| The user code.  
deletereason| node| The reason of deleting the user.  
  
### Delete reason​

XML structure

  * Request
  * Response


    
    
    <deletereason>  
        <code></code>  
        <comment></comment>  
    </deletereason>  
    
    
    
    <deletereason>  
        <code></code>  
        <comment></comment>  
    </deletereason>  
    

Element name: `user`

Property name| Value| Description  
---|---|---  
code| `product`   
`servicenew`   
`pricingnew`   
`changetwfsubscription`   
`defaulting`   
`nolongeroperative`| The reason why the user will be deleted.  
comment| string(1000)| Brief description why the user will be deleted.
