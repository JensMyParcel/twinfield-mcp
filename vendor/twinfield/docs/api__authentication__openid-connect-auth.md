  * [](/documentation/)
  * Authentication
  * OpenID Connect Authentication



On this page

# OpenID Connect Authentication

## General information​

OpenID Connect is a simple identity layer on top of the OAuth 2.0 protocol. It allows clients to verify the identity of the end-user based on the authentication performed by an Authorization Server, as well as to obtain basic profile information about the end-user in an interoperable and REST-like manner.

Twinfield implements OpenID Connect for providing identity information and the OAuth 2.0 protocol for authentication. Please refer to [OpenID Connect documentation](http://openid.net/connect/) for more details.

High level workflow for accessing Twinfield resources:

  1. Go to the [Twinfield developer portal](https://developers.twinfield.com) in order to register your OpenID Connect / OAuth 2.0 client and get your Client ID (and optional client secret).
  2. Get an access token (and optional refresh token) using one of the supported OAuth flows. You can also request an id token to get user identity information.
  3. After obtaining token(s) you have to:
     * Use the access token to process the SOAP web service call. Include it in the SOAP header.
     * Use the refresh token for renewal of the (expired) access token.



warning

It is mandatory to include the `CompanyCode` in the SOAP header in addition to the `AccessToken`. It is possible to replace Company code by Company id.

## Endpoints​

The following endpoints are available:

  * `https://login.twinfield.com/auth/authentication/connect/authorize`
  * `https://login.twinfield.com/auth/authentication/connect/token`
  * `https://login.twinfield.com/auth/authentication/connect/accesstokenvalidation?token=`
  * `https://login.twinfield.com/auth/authentication/connect/userinfo`



## Scopes​

Twinfield supports the following scopes:

**twf.user** (Identity token) - contains Twinfield specific information about the user.

info

When adding the `twf.user` scope add the `openid` scope as well.

This scope contains the following claims:

  * `twf.id` \- contains GUID of Twinfield ID. Only if you have the availability of a Twinfield ID.
  * `twf.organisationUserCode` \- user code inside organisation
  * `twf.organisationId` \- GUID of organisation



* * *

**twf.organisation** \- contains organisation information.

This scope contains the following claims:

  * `twf.organisationCode` \- code of organisation
  * `twf.organisationId` \- GUID of organisation
  * `twf.clusterUrl` \- URL of cluster on which organisation is located



* * *

**twf.organisationUser** \- contains information about organisation user.

This scope contains the following claims:

  * `twf.organisationUserCode` \- code of the organisation user (used for login)
  * `twf.organisationCode` \- code of the organisation
  * `twf.organisationId` \- GUID of organisation



info

Note that the `twf.organisationUser` scope is mandatory in order to login.

## Supported OAuth 2.0 flows​

### General​

Twinfield Security Token Service supports two OAuth 2.0 flows: _implicit_ and _authorization code_.

You should use implicit flow for native and JavaScript-based clients.

Use authorization code flow if your client has some server-side back-end part. You absolutely need to have such back-end because authorization code flow requires usage of client secret to obtain tokens, and you cannot store such secrets securely on front-end part of your application.

### Implicit flow​

![Implicit flow](/documentation/assets/images/implicit-flow-bd14dcf5a32778777453fab9f86a5379.png)

Here is the example of Twinfield URI for implicit flow:
    
    
    https://login.twinfield.com/auth/authentication/connect/authorize?  
    client_id=ID_OF_OAUTH_CLIENT&  
    redirect_uri=https://www.oauth.client.redirect.uri.com&  
    response_type=id_token+token&  
    scope=openid+twf.user+twf.organisation+twf.organisationUser&  
    state=SOME_RANDOM_STATE&  
    nonce=SOME_RANDOM_NONCE  
    

`ID_OF_OAUTH_CLIENT` and `https://www.oauth.client.redirect.uri.com` are parameters of your client, and they should be registered. Go to the [Twinfield developer portal](https://developers.twinfield.com) in order to register your OpenID Connect / OAuth 2.0 client and get your Client ID (and optional client secret).

Please note that `response_type` includes both access (`token`) and id (`id_token`) tokens and `scope` includes standard OpenID Connect scope (`openid`) and Twinfield specific identity scopes: `twf.organisation` and `twf.user`.

After you type this URI in the browser you will be redirected to login screen. After finishing login process (which may include several steps) you will be redirected to "consent screen".

After the last step, the browser will be redirected to the client redirect URI and hash-fragment of the URI (#) will contain id and access tokens as query parameters (`id_token` and `access_token`):
    
    
    https://www.oauth.client.redirect.uri.com/#  
    id_token=eyJ0e...knbxQ&  
    access_token=eyJ0eXAL...aZoo5jg&  
    token_type=Bearer&  
    expires_in=10000&  
    scope=openid+twf.user+twf.organisation+twf.organisationUser&  
    state=SOME_RANDOM_STATE&  
    session_state=5wswq9Nnp...288cb  
    

### Authorization code flow​

![Authorization code flow](/documentation/assets/images/authorization-code-flow-d985a75cdefb5dbc41e981268cb9ba13.png)

Here is the example of Twinfield URI for code flow:
    
    
    https://login.twinfield.com/auth/authentication/connect/authorize?  
    client_id=ID_OF_OAUTH_CLIENT&  
    response_type=code&  
    scope=openid+twf.user+twf.organisation+twf.organisationUser+offline_access&  
    redirect_uri=https://www.oauth.client.redirect.uri.com&  
    state=SOME_RANDOM_STATE&  
    nonce=SOME_RANDOM_NONCE  
    

In this case `response_type` is `code`. After you type this URI in the browser you will be redirected to login screen. After finishing login process the browser will be redirected to "redirect_uri" with additional information in query string:
    
    
    https://www.oauth.client.redirect.uri.com?  
    code=95e75...21bf2&  
    state=SOME_RANDOM_STATE&  
    session_state=myVUE...e3494  
    

The `code` parameter contains (the short-lived) authorisation code (`95e75...21bf2`) which is used to obtain id, access and refresh tokens.

warning

In order to use refresh tokens you need to request additional `offline_access` scope.

To obtain access and id tokens you need to make a POST HTTP request to Twinfield token endpoint:
    
    
    POST https://login.twinfield.com/auth/authentication/connect/token  
    Authorization: Basic SURfT0ZfT0FVVEhfQ0xJRU5UOkNMSUVOVF9TRUNSRVQ=  
    Content-Type: application/x-www-form-urlencoded  
    grant_type=authorization_code&  
    code=95e75...21bf2&  
    redirect_uri=https://www.oauth.client.redirect.uri.com  
    

You need to pass `code` and `redirect_uri` in the POST request body. Token endpoint uses Basic access authentication, so you need to pass Client ID and client secret as Base64 encoded value in the "Authorization" header. Read more about how Authorization header is constructed in "Protocol" section of this article: <https://en.wikipedia.org/wiki/Basic_access_authentication>. "Authorization" header value `SURfT0ZfT0FVVEhfQ0xJRU5UOkNMSUVOVF9TRUNSRVQ=` is Base64 encoded value of the Client ID and client secret separated by colon:
    
    
    <ID_OF_OAUTH_CLIENT>:<CLIENT_SECRET>  
    

`ID_OF_OAUTH_CLIENT` and `https://www.oauth.client.redirect.uri.com` are parameters of your client, and they should be registered. Go to the [Twinfield developer portal](https://developers.twinfield.com) in order to register your OpenID Connect / OAuth 2.0 client and get your Client ID (and optional client secret). You will receive a token response in the following JSON format:

You will receive a token response in the following JSON format:
    
    
    {  
        "id_token": "A73...J0eXA",  
        "access_token": "eyJ0eX...CWZOw",  
        "expires_in": 3000,  
        "token_type": "Bearer",  
        "refresh_token": "72f21cb7464098575a339abf415bf51e"  
    }  
    

Note that `refresh_token` part would be missing in case you have not requested `offline_access` scope. If you have refresh token you may request new access token when old is expired. Here is the sample POST request to token endpoint which does that:
    
    
    POST https://login.twinfield.com/auth/authentication/connect/token  
    Authorization: Basic SURfT0ZfT0FVVEhfQ0xJRU5UOkNMSUVOVF9TRUNSRVQ=  
    Content-Type: application/x-www-form-urlencoded  
    grant_type=refresh_token&  
    refresh_token=72f21cb7464098575a339abf415bf51e  
    

"Authorization" header value `SURfT0ZfT0FVVEhfQ0xJRU5UOkNMSUVOVF9TRUNSRVQ=` is Base64 encoded value of the Client ID and client secret separated by colon:
    
    
    <ID_OF_OAUTH_CLIENT>:<CLIENT_SECRET>  
    

You will receive new access token as a part of following JSON response:
    
    
    {  
        "access_token": "eyJ0eX...RDvPw",  
        "expires_in": 3000,  
        "token_type": "Bearer",  
        "refresh_token": "72f21cb7464098575a339abf415bf51e"  
    }  
    

Refreshing an access token may return some error codes given below:

  * `invalid_grant` \- This error code is returned when:
    * The client credentials provided are invalid
  * `unsupported_grant_type` \- This error code is returned when:
    * Grant type is missing
    * Grant type is too long
  * `invalid_request` \- This error code is returned when:
    * Refresh token is missing
    * Twinfield organisation is not active
    * Twinfield organisation is deleted
    * Twinfield organisation user is deleted
    * Twinfield organisation user is disabled
    * Twinfield organisation user is locked
    * Twinfield organisation user is password has expired
  * `invalid_grant` \- This error code is returned when:
    * Refresh token is too long
    * Refresh token is invalid
    * Refresh token has expired
    * A client tries to refresh token belonging to another client
    * Client does not have access to `offline_access` scope
    * Client does not have access to a requested scope



### Token lifetimes​

Flow| Token or code type| Lifetime  
---|---|---  
Implicit| Access Token| 43200 seconds (12 hours)  
Authorization Code| Short-lived _Code_|  300 seconds (5 minutes)  
Access Token| 3600 seconds (1 hour)  
Refresh Token| 788.940.000 seconds (25 years)  
  
## Twinfield Cluster​

In order to determine the correct cluster the retrieved access token should be sent to the `accesstokenvalidation` endpoint. Part of the response is the `twf.clusterUrl`. Now use the full cluster url and add the web service endpoint as described in the [Web Services Overview](/documentation/getting-started/web-services-overview).

**Request**

`https://login.twinfield.com/auth/authentication/connect/accesstokenvalidation?token=`

**Response**

`"twf.clusterUrl": "https://api.<cluster>.twinfield.com"`

warning

After obtaining the access token make use of the `Finder OFF` function as described in [Finder Web services](/documentation/api/miscellaneous/finder) to request for offices.
