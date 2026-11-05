  * [](/documentation/)
  * Miscellaneous
  * Pay & Collect



On this page

# Pay & Collect

Resource location: `https://api.<cluster>.twinfield.com/webservices/payandcollect.asmx?wsdl`

## Read​

Use the `GetRuns` method in order to get information of all payment and direct debit runs within a company. The `GetRunInfo` method can be used to get more information of a specific payment or direct debit run.

### GetRuns​

  * Query
  * Result


    
    
    public GetRuns : PayOverview  
    {  
        public String Office;             // The company from which payment and direct debit runs should be read.  
    }  
    
    
    
    public PayOverview  
    {  
        String Office;                    // The office where the payment or direct debit run belongs to.  
        String PayType;                   // The code of the payment type.  
        Int32 Id;                         // The unique id of the payment or direct debit run.  
        DateTime Created;                 // The creation date of the run.  
        DateTime Modified;                // The modification date of the run.  
        Int32 Touched;                    // The number of times the run was changed.  
        String User;                      // The user who made the last modifications.  
        RunType RunType;                  // The type of the run.  
        Phase Phase;                      // The phase of the run.  
        PhaseStatus Status;               // The status of the run.  
        String Bank;                      // The code of the bank that's associated with this pay run.  
        DateTime PayDate;                 // The pay date of the payment file.  
        Int32 Year;                       // The year where the transactions will be booked on.  
        Int32 Period;                     // The period where the transactions will be booked on.  
        Boolean DirectRemove;             // The direct Remove setting for this run.  
        String CustomSettings[];          // A string array of string arrays with custom pay type settings.  
    }  
      
    public enum Phase  
    {  
        Select,                           // Transactions are selected and the run is created.  
        Manipulate,                       // The run is edited.  
        Authorise,                        // The run is authorised.  
        Post,                             // The run is posted.  
        Pay,                              // A file is created.  
        Finalise                          // The run is finalised.  
    }  
      
    public enum PhaseStatus  
    {  
        Started,                          // The run is currently in process.  
        Done,                             // Processing of the run is done.  
        DoneWithErrors                    // Processing of the run is done but there were errors.  
    }  
    

### GetRunInfo​

  * Query
  * Result


    
    
    public GetRunInfo : PayRun  
    {  
        String Office;                    // The company from which the payment and direct debit run should be read.  
        String PayType;                   // The code of the payment type.  
        Int32 RunId;                      // The unique id of the payment or direct debit run.  
    }  
    
    
    
    public PayRun  
    {  
        String Office;                    // The office where the payment or direct debit run belongs to.  
        String payType;                   // The code of the payment type.  
        Int32 Id;                         // The unique id of the payment or direct debit run.  
        DateTime Created;                 // The creation date of the run.  
        DateTime Modified;                // The modification date of the run.  
        Int32 Touched;                    // The number of times the run was changed.  
        String User;                      // The user who made the last modifications.  
        RunType RunType;                  // The type of the run.  
        Phase Phase;                      // The phase of the run.  
        PhaseStatus Status;               // The status of the run.  
        String Bank;                      // The code of the bank that's associated with this pay run.  
        DateTime PayDate;                 // The pay date of the payment file.  
        Int32 Year;                       // The year where the transactions will be booked on.  
        Int32 Period;                     // The period where the transactions will be booked on.  
        Boolean DirectRemove;             // The direct Remove setting for this run.  
        String CustomSettings[];          // A string array of string arrays with custom pay type settings.  
        SummaryInfo Summaries[];          // An array of summaries.  
    }  
      
    public SummaryInfo  
    {  
        String Relation;                  // The code of the relation.  
        String RelationName;              // The name of the relation.  
        String Bank RelationBank;         // Bank information.  
        String Currency;                  // The code of the currency.  
        String CurrencyName;              // The name of the currency.  
        Int32 Id;                         // Identifier.  
        String Reference;                 // Pay reference, formed as set in the pay file settings.  
        Boolean Included;                 // Is the summary included or excluded from this pay run.  
        DetailInfo Details;               // An array of detail lines.  
    }  
      
    public Bank  
    {  
        String Ascription;                // The bank ascription.  
        String AccountNumber;             // The account number.  
        String Iban;                      // The IBAN number.  
        String NationalCode;              // National bank code.  
        String InternationalCode;         // BIC-code.  
        String Address;                   // The bank address.  
        String PostalCode;                // The postal code of the bank.  
        String Branch;                    // Not in use.  
        String Country;                   // The country of the bank.  
    }  
      
    public DetailInfo  
    {  
        Int32 Id;                         // Identifier.  
        String Transaction;               // The code of the transaction type.  
        String TransactionName;           // The name of the transaction type.  
        Int32 TransactionNumber;          // The transaction number.  
        Int32 TransactionLine;            // The transaction line number.  
        String InvoiceNumber;             // The invoice number.  
        DateTime InvoiceDate;             // The invoice date.  
        DateTime InvoiceDueDate;          // The invoice due date.  
        Decimal Value;                    // The value of the transaction in transaction currency.  
        Decimal OriginalValue;            // The original value of the transaction in transaction currency.  
        Decimal BaseValue;                // The value of the transaction in base currency.  
        Decimal OriginalBaseValue;        // The original value of the transaction in base currency.  
        Boolean Included;                 // Is the detail included or excluded from this pay run.  
    }  
      
    public enum Phase  
    {  
        Select,                           // Transactions are selected and the run is created.  
        Manipulate,                       // The run is edited.  
        Authorise,                        // The run is authorised.  
        Post,                             // The run is posted.  
        Pay,                              // A file is created.  
        Finalise                          // The run is finalised.  
    }  
      
    public enum PhaseStatus  
    {  
        Started,                          // The run is currently in process.  
        Done,                             // Processing of the run is done.  
        DoneWithErrors                    // Processing of the run is done but there were errors.  
    }  
    

## Create​

The create run methods are used to create a pay run. There are three methods available.

Methods:

  * CreateRun : Separate parameters can be supplied in order to create a pay run.
  * CreateRun2 : A CreateRunRequest object is supplied containing the parameters in order to create a pay run.
  * CreateRunAsync : Similar to CreateRun2. This method can be used to create large pay runs and requires calling GetRunInfo method to check the result of the pay run creation.



### CreateRun​

  * Query
  * Result


    
    
    public MessageOfCreateRunResult : CreateRun  
    {  
        String Office;                    // The office where the payment or direct debit run belongs to.  
        String payType;                   // The code of the payment type.  
        DateTime PayDate;                 // The pay date of the payment file.  
        String Period;                    // The period where the transactions will be booked on.  
        Method Method;                    // The summarisation method that should be used for this run.  
        Boolean DirectRemove;             // Determines whether the excluded payments should be available after authorising this run.  
        String BankCode;                  // The code of the bank that's associated with this pay run.  
        String DimensionFrom;             // Filter on level 2 dimension.  
        String DimensionTo;               // Filter on level 2 dimension.  
        DateTime MaxDueDate;              // Filter on invoices maximum due date.  
        String InvoiceNumber;             // Filter on invoice number.  
        String Currency;                  // Filter on invoice currency.  
        String CustomSettings[];          // A string array of string arrays with custom pay type settings.  
    }  
      
    public enum Method  
    {  
        Detailed,                         // The invoices will not be summarised.  
        Summarise,                        // All invoices will be summarised per dimension/currency, no credit invoices will be selected.  
        SummariseAndDeduct                // All invoices will be selected, including credit invoices, and summarised/deducted per dimension/currency.  
    }  
    
    
    
    public MessageOfCreateRunResult  
    {  
        MessageType Type;                 // Type of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum CreateRunResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

### CreateRun2​

  * Query
  * Result


    
    
    public MessageOfCreateRunResult : CreateRun2  
    {  
        CreateRunRequest createRunRequest; // An object that contains all data needed to perform a Create Run request.  
    }  
      
    public CreateRunRequest  
    {  
        String Office;                     // The office where the payment or direct debit run belongs to.  
        String PayType;                    // The code of the payment type.  
        DateTime PayDate;                  // The pay date of the payment file.  
        String Period;                     // The period where the transactions will be booked on.  
        Method Method;                     // The summarisation method that should be used for this run.  
        Boolean DirectRemove;              // Determines whether the excluded payments should be available after authorising this run.  
        String BankCode;                   // The code of the bank that's associated with this pay run.  
        String DimensionFrom;              // Filter on level 2 dimension.  
        String DimensionTo;                // Filter on level 2 dimension.  
        DateTime MaxDueDate;               // Filter on invoices maximum due date.  
        String InvoiceNumber;              // Filter on invoice number.  
        String Currency;                   // Filter on invoice currency.  
        Integer DiscountDaysTolerance;     // Number of discount days tolerated by supplier after discount is already expired.  
        String CustomSettings[];           // A string array of string arrays with custom pay type settings.  
    }  
      
    public enum Method  
    {  
        Detailed,                          // The invoices will not be summarised.  
        Summarise,                         // All invoices will be summarised per dimension/currency, no credit invoices will be selected.  
        SummariseAndDeduct                 // All invoices will be selected, including credit invoices, and summarised/deducted per dimension/currency.  
    }  
    
    
    
    public MessageOfCreateRunResult  
    {  
        MessageType Type;                 // Type of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum CreateRunResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

### CreateRunAsync​

  * Query
  * Result


    
    
    public MessageOfCreateRunResult : CreateRunAsync  
    {  
        CreateRunAsyncRequest createRunRequest; // An object that contains all data needed to initiate a Create Run Async request.  
    }  
      
    public CreateRunAsyncRequest  
    {  
        String Office;                          // The office where the payment or direct debit run belongs to.  
        String PayType;                         // The code of the payment type.  
        DateTime PayDate;                       // The pay date of the payment file.  
        String Period;                          // The period where the transactions will be booked on.  
        Method Method;                          // The summarisation method that should be used for this run.  
        Boolean DirectRemove;                   // Determines whether the excluded payments should be available after authorising this run.  
        String BankCode;                        // The code of the bank that's associated with this pay run.  
        String DimensionFrom;                   // Filter on level 2 dimension.  
        String DimensionTo;                     // Filter on level 2 dimension.  
        DateTime MaxDueDate;                    // Filter on invoices maximum due date.  
        String InvoiceNumber;                   // Filter on invoice number.  
        String Currency;                        // Filter on invoice currency.  
        Integer DiscountDaysTolerance;          // Number of discount days tolerated by supplier after discount is already expired.  
        String CustomSettings[];                // A string array of string arrays with custom pay type settings.  
    }  
      
    public enum Method  
    {  
        Detailed,                               // The invoices will not be summarised.  
        Summarise,                              // All invoices will be summarised per dimension/currency, no credit invoices will be selected.  
        SummariseAndDeduct                      // All invoices will be selected, including credit invoices, and summarised/deducted per dimension/currency.  
    }  
    
    
    
    public MessageOfCreateRunResult  
    {  
        MessageType Type;                 // Type of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum CreateRunResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

#### Custom settings​

Format| Setting| Value  
---|---|---  
SEPANLDD| collectionschema| Only in case of a direct debit run. Option to collect `Core` or `B2B`.   
`0` = Core   
`1` = B2B  
  
## Modify​

Modify is used to exclude dimensions or invoices from the run data, or alter amounts of invoices. We have chosen to use a 'light' summary object, stripped to identifiers and writeable values only, to reduce the data that will be sent over the net.

Conditions:

  * Phase = Select and Status = Done and selected Transactions > 0
  * Phase = Manipulate and Status <> Busy



### Modify​

  * Query
  * Result


    
    
    public MessageOfModifyResult : Modify  
    {  
        String Office;                    // The office from which the run should be modified.  
        String payType;                   // The code of the run that should be modified.  
        Int32 RunId;                      // The run Id of the run that should be modified.  
        Int32 Touched;                    // The number of times the run was changed, retrieved from the last request to this particular run.  
        DateTime Modified;                // The modification date of the run, retrieved from the last request to this particular run.  
        SummarySettings NewSummaries[];   // An array of summaries.  
    }  
      
    public SummarySettings  
    {  
        String Relation;                  // Code of the relation for this summary.  
        String Currency;                  // Code of the currency of this summary.  
        Int32 Id;                         // Identifier.  
        Boolean Included;                 // Can be altered. Include or exclude a summary from this pay run.  
        DetailSettings Details[];         // An array of details.  
    }  
      
    public DetailSettings  
    {  
        Int32 Id;                         // Identifier.  
        Decimal Value;                    // Can be altered. (Unequal to zero, Can not be greater than OriginalValue)  
        Boolean Included;                 // Can be altered. Include or exclude a detail from this summary.  
        Decimal DiscountAmount;           // Can be altered. Must be a positive value.  
    }  
    
    
    
    public MessageOfModifyResult  
    {  
        MessageType Type;                 // Kind of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
        Int32 Touched;                    // The number of times the run is changed.  
        DateTime Modified;                // The last modification date of the run.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum ModifyResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

## Authorise​

Authorise is used to freeze the run, after authorisation, no adjustments can be made to the data.

Conditions:

  * Phase <= Manipulate and Status = Done



### Authorize​

  * Query
  * Result


    
    
    public MessageOfAuthoriseResult : Authorize  
    {  
        String Office;                    // The office from which the run should be authorised.  
        String payType;                   // The code of the run that should be authorised.  
        Int32 RunId;                      // The run Id of the run that should be authorised.  
        Int32 Touched;                    // The number of times the run was changed, retrieved from the last request to this particular run.  
        DateTime Modified;                // The modification date of the run, retrieved from the last request to this particular run.  
    }  
    
    
    
    public MessageOfAuthoriseResult  
    {  
        MessageType Type;                 // Kind of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
        Int32 Touched;                    // The number of times the run is changed.  
        DateTime Modified;                // The last modification date of the run.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum AuthoriseResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

## Post​

Methods:

  * Post : Post will post the summarisations to the 'in-transfer' ledger, and match them against the original transactions. If post fails, alterations can be made in Twinfield, and the post process can be started again.
  * PostAsync : Similar to Post. This method can be used to post large pay runs and requires calling GetRunInfo method to check the result of the pay run posting.



Conditions:

  * Phase = Authorise and Status = Done
  * Phase = Post and Status = DoneWithErrors



### Post​

  * Query
  * Result


    
    
    public MessageOfPostResult : Post  
    {  
        String Office;                    // The office from which the run should be posted.  
        String payType;                   // The code of the run that should be posted.  
        Int32 RunId;                      // The run Id of the run that should be posted.  
        Int32 Touched;                    // The number of times the run was changed, retrieved from the last request to this particular run.  
        DateTime Modified;                // The modification date of the run, retrieved from the last request to this particular run.  
    }  
    
    
    
    public MessageOfPostResult  
    {  
        MessageType Type;                 // Kind of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
        Int32 Touched;                    // The number of times the run is changed.  
        DateTime Modified;                // The last modification date of the run.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum PostResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

### PostAsync​

  * Query
  * Result


    
    
    public MessageOfPostResult : PostAsync  
    {  
        String Office;                    // The office from which the run should be posted.  
        String payType;                   // The code of the run that should be posted.  
        Int32 RunId;                      // The run Id of the run that should be posted.  
        Int32 Touched;                    // The number of times the run was changed, retrieved from the last request to this particular run.  
                                          // Please note that an additional call to GetRunInfo is required to get the actual status.  
        DateTime Modified;                // The modification date of the run, retrieved from the last request to this particular run.  
                                          // Please note that an additional call to GetRunInfo is required to get the actual status.  
    }  
    
    
    
    public MessageOfPostResult  
    {  
        MessageType Type;                 // Kind of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
        Int32 Touched;                    // The number of times the run is changed.  
        DateTime Modified;                // The last modification date of the run.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum PostResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

## Create file(s)​

This step will export the file from the office in the xml, to the office you are logged on to, which is not by default the office in the xml document. After generating, the code will expand the returned XML with the FileId of the payment file. The webservices will load the file, return the file as an array of byte, and delete the payment file from the file manager.

Conditions:

  * Phase >= Post and < Finalise and Status = Done



With the introduction of SEPA, a limitation is made on the number of transaction per payment file. Based on the bank, at the moment the maximum number of transactions in a payment file is reached a second payment file is created. And so on. Use `CreateFile` in order to retrieve one payment file. When it's not sure if multiple payment files have been created, use `CreateFiles` in order to retrieve them.

### CreateFile​

  * Query
  * Result


    
    
    public MessageOfCreateFileResult : CreateFile  
    {  
        String Office;                    // The office from which the run should be created.  
        String payType;                   // The code of the run that should be created.  
        Int32 RunId;                      // The run Id of the run that should be created.  
        Int32 Touched;                    // The number of times the run was changed, retrieved from the last request to this particular run.  
        DateTime Modified;                // The modification date of the run, retrieved from the last request to this particular run.  
        String ExportSettings[]           // An array of string arrays with optional exportsettings.  
    }  
    
    
    
    public MessageOfCreateFileResult  
    {  
        MessageType Type;                 // Kind of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
        Int32 Touched;                    // The number of times the run is changed.  
        DateTime Modified;                // The last modification date of the run.  
        Base64Binary PayFile;             // The payment file in the form of binary data.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum CreateFileResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

### CreateFiles​

  * Query
  * Result


    
    
    public MessageOfCreateFileResult : CreateFiles  
    {  
        String Office;                    // The office from which the run should be created.  
        String payType;                   // The code of the run that should be created.  
        Int32 RunId;                      // The run Id of the run that should be created.  
        Int32 Touched;                    // The number of times the run was changed, retrieved from the last request to this particular run.  
        DateTime Modified;                // The modification date of the run, retrieved from the last request to this particular run.  
        String ExportSettings[]           // An array of string arrays with optional exportsettings.  
    }  
    
    
    
    public MessageOfCreateFilesResult  
    {  
        MessageType Type;                 // Kind of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
        Int32 Touched;                    // The number of times the run is changed.  
        DateTime Modified;                // The last modification date of the run.  
        ArrayOfBase64Binary PayFiles;     // An array of payment files.  
    }  
      
    public ArrayOfBase64Binary  
    {  
        Base64Binary PayFile;             // The payment file in the form of binary data.  
    }  
      
    public enum MessageType  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum CreateFilesResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    

## Finish​

Finishing a run can be used for two different things:

  * Deleting a run, this can only be done if no postings to the 'in-transfer' ledger have taken place yet.
  * Ending a run after generating the payfile. It deletes all payrundata from Twinfield.



Conditions:

  * Phase = Pay and Status = Done
  * Phase < Posting
  * Phase = Posting and Status = Error and no lines have been posted yet



### Finish​

  * Query
  * Result


    
    
    public MessageOfFinishResult : Finish  
    {  
        String Office;                    // The office from which the run should be finished.  
        String payRunCode;                // The code of the run that should be finished.  
        Int32 RunId;                      // The run Id of the run that should be finished.  
        Int32 Touched;                    // The number of times the run was changed, retrieved from the last request to this particular run.  
        DateTime Modified;                // The modification date of the run, retrieved from the last request to this particular run.  
    }  
    
    
    
    public MessageOfFinishResult  
    {  
        MessageType Type;                 // Kind of message.  
        String Text;                      // Content of the message.  
        CreateRunResult Code;             // Not in use.  
        String Parameters[];              // Not in use.  
        Int32 Touched;                    // The number of times the run is changed.  
        DateTime Modified;                // The last modification date of the run.  
    }  
      
    public enum FinishResult  
    {  
        Error,                            // Error message.  
        Warning,                          // Warning.  
        Informational                     // Informational message.  
    }  
      
    public enum PostResult  
    {  
        UnknownTextualMessage             // Not in use.  
    }  
    
