  * [](/documentation/)
  * Miscellaneous
  * Hierarchy



On this page

# Hierarchy

The Hierarchy webservice is referring to the reporting structures in Twinfield.

warning

First use `FINDER` type `HIE` web service to request for all reporting structure codes within the organisation. Please click [here](/documentation/api/miscellaneous/finder) to go to the finder web service.

Resource location: `https://api.<cluster>.twinfield.com/webservices/hierarchies.asmx?wsdl`

## Load​

Use the `Load` method in order to get information of a particular hierarchy.

  * Query
  * Result
  * Raw envelope


    
    
    public Load : LoadResponse  
    {  
        public String hierarchyCode;      // The code of the hierarchy for which the information should be read.  
    }  
    
    
    
    public LoadResponse  
    {  
        String LoadResult[];  
        MessageOfHierarchyLoadMessage Messages[];  
        Hierarchy hierarchy[];                    // Detailed information of the hierarchy.  
    }  
      
    public Hierarchy  
    {  
        String Code;                              // The code of the hierarchy.  
        String Name;                              // The name of the hierarchy.  
        String Description;                       // The description of the hierarchy.  
        HierarchyNode Rootnode;                   // The root node of the hierarchy.  
        HierarchyAccess AccessRights;             // The access rights to the hierarchy.  
        Int Touched;                              // The number of times the hierarchy was changed.  
    }  
      
    public HierarchyNode  
    {  
        Int Id;                                   // Internal id.  
        String Code;                              // The code of the hierarchy node.  
        String Name;                              // The name of the hierarchy node.  
        String Description;                       // The description of the hierarchy node.  
        HierarchyAccount Accounts[];              // The dimensions linked to the hierarchy node.  
        HierarchyNode ChildNodes[];               // The child nodes of the hierarchy node.  
        MessageOfHierarchyNodeMessage  Messages[];  
        Int Touched;                              // the number of times the hierarchy node was changed.  
    }  
      
    public HierarchyAccount  
    {  
        String Type;                              // The dimension type.  
        String Code;                              // The dimension code.  
        HierarchyAccountBalanceType BalanceType;  // The balance type of the dimension.  
    }  
      
    public enum HierarchyAccountBalanceType  
    {  
        Credit,  
        Balance,  
        Debit  
    }  
      
    public HierarchyAccess  
    {  
        HierarchyAccessType Type;  
        String OfficeCode;                        // The code of the office.  
        String RoleCode;                          // The code of the role.  
        String UserCode;                          // The code of the user.  
        String Messages[];  
        Boolean AccessRightTabAccesible           // The access rights tab accessible or not.  
    }  
      
    public enum HierarchyAccessType  
    {  
        None,  
        Use,  
        Bind,  
        Edit  
    }  
      
    public MessageOfHierarchyLoadMessage  
    {  
        MessageOfHierarchyLoadMessageType Type;  
        String Text;  
        String Code;  
        String Parameters[];  
    }  
      
    public enum MessageOfHierarchyLoadMessageType  
    {  
        Error,  
        Warning,  
        Informational  
    }  
    

The example below reads the settings of a hierarchy.
    
    
    POST https://api.<cluster>.twinfield.com/webservices/hierarchies.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.18444)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/Load"  
    Host: <cluster>.twinfield.com  
    Content-Length: 471  
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
            <Load xmlns="http://www.twinfield.com/">  
                <hierarchyCode>GENERAL018</hierarchyCode>  
            </Load>  
        </soap:Body>  
    </soap:Envelope>  
    

## Bind​

Use the `Bind` method in order to bind accounts to a hierarchy node.

  * Query
  * Result
  * Raw envelope


    
    
    public Bind : BindResponse  
    {  
        public Int node;                                 // The node id  
        public String office;                            // The office code  
        public HierarchyAccount Accounts[];              // The dimensions linked to the hierarchy node.  
    }  
      
    public HierarchyAccount  
    {  
        public String Type;                              // The dimension type.  
        public String Code;                              // The dimension code.  
        public HierarchyAccountBalanceType BalanceType;  // The balance type of the dimension.  
    }  
      
    public enum HierarchyAccountBalanceType  
    {  
        Credit,  
        Balance,  
        Debit  
    }  
    
    
    
    public BindResponse  
    {  
        String BindResult[];  
    }  
      
    public BindResult  
    {  
        MessageOfHierarchyBindMessage Messages[];  
    }  
      
    public MessageOfHierarchyBindMessage  
    {  
        MessageOfHierarchyBindMessageType Type;  
        String Text;  
        String Code;  
        String Parameters[];  
    }  
      
    public enum MessageOfHierarchyBindMessageType  
    {  
        Error,  
        Warning,  
        Informational  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/hierarchies.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.18444)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/Bind"  
    Host: <cluster>.twinfield.com  
    Content-Length: 471  
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
            <Bind xmlns="http://www.twinfield.com/">  
                <node>123</node>  
                <office>001</office>  
                <accounts>  
                    <HierarchyAccount>  
                        <Type>BAS or PNL</Type>  
                        <Code>010</Code>  
                        <BalanceType>Credit or Balance or Debit</BalanceType>  
                    </HierarchyAccount>  
                    <HierarchyAccount>  
                        <Type>BAS or PNL</Type>  
                        <Code>011</Code>  
                        <BalanceType>Credit or Balance or Debit</BalanceType>  
                    </HierarchyAccount>  
                </accounts>  
            </Bind>  
        </soap:Body>  
    </soap:Envelope>  
    

## Unbind​

Use the `Unbind` method in order to unbind accounts from a hierarchy node.

  * Query
  * Result
  * Raw envelope


    
    
    public Unbind : UnbindResponse  
    {  
        public Int node;                                  // The node id.  
        public String office;                             // The office code.  
        public HierarchyAccount Accounts[];               // The dimensions linked to the hierarchy node.  
    }  
      
    public HierarchyAccount  
    {  
        public String Type;                              // The dimension type.  
        public String Code;                              // The dimension code.  
        public HierarchyAccountBalanceType BalanceType;  // The balance type of the dimension.  
    }  
      
    public enum HierarchyAccountBalanceType  
    {  
        Credit,  
        Balance,  
        Debit  
    }  
    
    
    
    public UnbindResponse  
    {  
        String UnbindResult[];  
    }  
      
    public UnbindResult  
    {  
        MessageOfHierarchyUnbindMessage Messages[];  
    }  
      
    public MessageOfHierarchyUnbindMessage  
    {  
        MessageOfHierarchyUnbindMessageType Type;  
        String Text;  
        String Code;  
        String Parameters[];  
    }  
      
    public enum MessageOfHierarchyUnbindMessageType  
    {  
        Error,  
        Warning,  
        Informational  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/hierarchies.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.18444)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/Unbind"  
    Host: <cluster>.twinfield.com  
    Content-Length: 471  
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
            <Unbind xmlns="http://www.twinfield.com/">  
                <node>123</node>  
                <office>001</office>  
                <accounts>  
                    <HierarchyAccount>  
                        <Type>BAS or PNL</Type>  
                        <Code>010</Code>  
                        <BalanceType>Credit or Balance or Debit</BalanceType>  
                    </HierarchyAccount>  
                    <HierarchyAccount>  
                        <Type>BAS or PNL</Type>  
                        <Code>011</Code>  
                        <BalanceType>Credit or Balance or Debit</BalanceType>  
                    </HierarchyAccount>  
                </accounts>  
            </Unbind>  
        </soap:Body>  
    </soap:Envelope>  
    

## Save​

Use the `Save` method in order to save information of a particular hierarchy.

  * Query
  * Result
  * Raw envelope


    
    
    public Save : SaveResponse  
    {  
        public Hierarchy hierarchy[];                    // Detailed information of the hierarchy.  
    }  
      
    public Hierarchy  
    {  
        public String Code;                              // The code of the hierarchy.  
        public String Name;                              // The name of the hierarchy.  
        public String Description;                       // The description of the hierarchy.  
        public HierarchyNode Rootnode;                   // The root node of the hierarchy.  
        public HierarchyAccess AccessRights[];           // The access rights to the hierarchy.  
        public Int Touched;                              // The number of times the hierarchy was changed.  
    }  
      
    public HierarchyNode  
    {  
        public Int Id;                                   // Internal id.  
        public String Code;                              // The code of the hierarchy node.  
        public String Name;                              // The name of the hierarchy node.  
        public String Description;                       // The description of the hierarchy node.  
        public HierarchyAccount Accounts[];              // The dimensions linked to the hierarchy node.  
        publicHierarchyNode ChildNodes[];                // The child nodes of the hierarchy node.  
        public MessageOfHierarchySaveMessage Messages[];  
        public Int Touched;                              // the number of times the hierarchy node was changed.  
    }  
      
    public HierarchyAccount  
    {  
        public String Type;                              // The dimension type.  
        public String Code;                              // The dimension code.  
        public HierarchyAccountBalanceType BalanceType;  // The balance type of the dimension.  
    }  
      
    public enum HierarchyAccountBalanceType  
    {  
        Credit,  
        Balance,  
        Debit  
    }  
      
    public HierarchyAccess  
    {  
        public HierarchyAccessType Type;                 // The access type.  
        public String OfficeCode;                        // The code of the office.  
        public String RoleCode;                          // The code of the role.  
        public String UserCode;                          // The code of the user.  
        public String Messages[];  
        public Boolean AccessRightTabAccesible           //The access rights tab accessible or not.  
    }  
      
    public enum HierarchyAccessType  
    {  
        None,  
        Use,  
        Bind,  
        Edit  
    }  
      
    public MessageOfHierarchySaveMessage  
    {  
        public MessageOfHierarchySaveMessageType Type;  
        public String Text;  
        public MessageOfHierarchySaveMessageCode Code;  
        public String Parameters[];  
    }  
      
    public enum MessageOfHierarchySaveMessageType  
    {  
        Error,  
        Warning,  
        Informational  
    }  
      
    public enum MessageOfHierarchySaveMessageCode  
    {  
        Touched,  
        InvalidCode,  
        InvalidName,  
        InvalidDescription,  
        InvalidNodes,  
        InvalidAccessRights,  
        AccessDenied,  
        DefaultInOffice  
    }  
    
    
    
    public SaveResponse  
    {  
        String SaveResult[];  
        Hierarchy hierarchy[];  
    }  
      
    public SaveResult  
    {  
        HierarchyNodeMessage Messages[];  
    }  
      
    public HierarchyMessage  
    {  
        String Type;  
        String Text;  
        String Code;  
        String Parameters[];  
    }  
      
    public Hierarchy  
    {  
        String Code;                              // The code of the hierarchy.  
        String Name;                              // The name of the hierarchy.  
        String Description;                       // The description of the hierarchy.  
        HierarchyNode Rootnode;                   // The root node of the hierarchy.  
        HierarchyAccess AccessRights;             // The access rights to the hierarchy.  
        Int Touched;                              // The number of times the hierarchy was changed.  
    }  
      
    public HierarchyNode  
    {  
        Int Id;                                   // Internal id.  
        String Code;                              // The code of the hierarchy node.  
        String Name;                              // The name of the hierarchy node.  
        String Description;                       // The description of the hierarchy node.  
        HierarchyAccount Accounts[];              // The dimensions linked to the hierarchy node.  
        HierarchyNode ChildNodes[];               // The child nodes of the hierarchy node.  
        HierarchyNodeMessage Messages[];  
        Int Touched;                              // the number of times the hierarchy node was changed.  
    }  
      
    public HierarchyAccount  
    {  
        String Type;                              // The dimension type.  
        String Code;                              // The dimension code.  
        HierarchyAccountBalanceType BalanceType;  // The balance type of the dimension.  
    }  
      
    public enum HierarchyAccountBalanceType  
    {  
        Credit,  
        Balance,  
        Debit  
    }  
      
    public HierarchyAccess  
    {  
        HierarchyAccessType Type;                 // The access type  
        String OfficeCode;                        // The code of the office.  
        String RoleCode;                          // The code of the role.  
        String UserCode;                          // The code of the user.  
        String Messages[];  
        Boolean AccessRightTabAccesible           // The access rights tab accessible or not.  
    }  
      
    public enum HierarchyAccessType  
    {  
        None,  
        Use,  
        Bind,  
        Edit  
    }  
      
    public enum HierarchyNodeMessage  
    {  
        String Type;  
        String Text;  
        String Code;  
        String Parameters[];  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/hierarchies.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.18444)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/Save"  
    Host: <cluster>.twinfield.com  
    Content-Length: 471  
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
            <Save xmlns="http://www.twinfield.com/">  
                <hierarchy>  
                    <Code>GENERAL018</Code>  
                    <Name>GENERAL018</Name>  
                    <Description>GENERAL018 DESCRIPTION</Description>  
                    <RootNode>  
                        <Id>4808</Id>  
                        <Code>GENERAL018</Code>  
                        <Name>GENERAL018</Name>  
                        <Description>GENERAL018 DESCRIPTION</Description>  
                        <Accounts />  
                        <ChildNodes>  
                            <HierarchyNode>  
                                <Id>4809</Id>  
                                <Code>1</Code>  
                                <Name>New summary level</Name>  
                                <Description />  
                                <Accounts>  
                                    <HierarchyAccount>  
                                        <Type>BAS or PNL</Type>  
                                        <Code>0100</Code>  
                                        <BalanceType>Credit or Balance or Debit</BalanceType>  
                                    </HierarchyAccount>  
                                </Accounts>  
                                <ChildNodes />  
                                <Messages />  
                                <Touched>5</Touched>  
                            </HierarchyNode>  
                        </ChildNodes>  
                        <Messages />  
                        <Touched>5</Touched>  
                    </RootNode>  
                    <AccessRights>  
                        <HierarchyAccess>  
                            <Type>Edit</Type>  
                            <OfficeCode />  
                            <RoleCode />  
                            <UserCode>SUPER</UserCode>  
                            <Messages />  
                            <AccessRightTabAccesible>true</AccessRightTabAccesible>  
                        </HierarchyAccess>  
                        <HierarchyAccess>  
                            <Type>None</Type>  
                            <OfficeCode />  
                            <RoleCode />  
                            <UserCode />  
                            <Messages />  
                            <AccessRightTabAccesible>false</AccessRightTabAccesible>  
                        </HierarchyAccess>  
                    </AccessRights>  
                    <Touched>5</Touched>  
                </hierarchy>  
            </Save>  
        </soap:Body>  
    </soap:Envelope>  
    

## Hide​

Use the `Hide` method in order to hide a particular hierarchy.

  * Query
  * Result
  * Raw envelope


    
    
    public Hide : HideResponse  
    {  
        public String hierarchyCode;      // The code of the hierarchy which needs to hide.  
    }  
    
    
    
    public HideResponse  
    {  
        String HideResult[];  
    }  
      
    public HideResult  
    {  
        MessageOfHierarchyLoadMessage Messages[];  
    }  
      
    public MessageOfHierarchyLoadMessage  
    {  
        MessageOfHierarchyLoadMessageType Type;  
        String Text;  
        String Code;  
        String Parameters[];  
    }  
      
    public enum MessageOfHierarchyLoadMessageType  
    {  
        Error,  
        Warning,  
        Informational  
    }  
    
    
    
    POST https://api.<cluster>.twinfield.com/webservices/hierarchies.asmx HTTP/1.1  
    User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol 4.0.30319.18444)  
    Content-Type: text/xml; charset=utf-8  
    SOAPAction: "http://www.twinfield.com/Hide"  
    Host: <cluster>.twinfield.com  
    Content-Length: 471  
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
            <Hide xmlns="http://www.twinfield.com/">  
                <hierarchyCode>GENERAL018</hierarchyCode>  
            </Hide>  
        </soap:Body>  
    </soap:Envelope>  
    
