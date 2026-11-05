  * [](/documentation/)
  * Schematic flow



On this page

# Schematic flow

  1. Start a new session.

  2. Complete the session using the returned session ID.

When the user credentials are correct the Session Web Service returns the Session ID in the SOAP header and one of the return parameters of the Session Web Services is the cluster URL.

  3. Perform numerous business action calls on the provided cluster server using the session ID.

  4. Abandon your session




![Web services session lifecycle](/documentation/assets/images/web-services-session-lifecycle-95b65df924bf780e682bf684130c75af.png)

## Include the web references​

To be able to start programming in dotNet against the Twinfield API you'll have to add the references that you are going to use to your project. As a start the references to the two parts of the Session web service should be added. The first part of the Session web service is located on the login cluster. The second part is located on the application clusters. Add references to `https://login.twinfield.com/webservices/session.asmx?wsdl` as `SessionLogin` and `https://<cluster>.twinfield.com/webservices/session.asmx?wsdl` as `Session`.

## Setting up a session​

Use the `SessionLogin` to perform the Logon method to take the first authentication step. After that the `Session` web services should be used as long as a value is returned in the nextAction out-parameter.

## Performing business actions​

Use `/webservices/processxml.asmx?wsdl` for [processing XML messages](/documentation/api/types/xml-web-services) or one of the other web services that work method or command driven.

## Closing the session​

Close the session by calling `Abandon` on the `Session` reference.
