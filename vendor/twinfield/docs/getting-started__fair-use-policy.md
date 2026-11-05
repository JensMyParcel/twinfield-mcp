  * [](/documentation/)
  * Fair Use Policy and Limitations



On this page

# Fair Use Policy and Limitations

## Rate limiting and concurrency limits​

Our API will start to enforce API limits to ensure fair usage of resources by **December 1st, 2024** and will affect all users of our Webservices and REST APIs. Adhering to the new API limits will ensure applications will continue to function optimally and that they will not be affected by potential downtime, errors, or slow responses.

If the rate limit or concurrency limit is exceeded, you will receive a `429 Too Many Requests` and the request will not be further processed.

### API Client guidelines​

  * Implement proper error handling in your application to handle rate limit and concurrency control responses.
  * Limit the amount of concurrent requests from your API client to stay within the limits.
  * Use exponential backoff for retrying requests when rate limits are exceeded. Use as a start backoff time the "Retry-After" header value.
  * Monitor your API usage and the response codes regularly to stay within the rate limits and concurrency limits.



Thank you for using our API! If you have any question or need assistance, please contact our support team via our support portal or, if you have access, via our developer portal.

### Rate limits​

Our API counts different costs for 'Query' requests and 'other' requests. 'Query' requests cost 1 API credit, and 'other' requests cost 3 API credits.

#### Query requests​

'Query' requests are defined as:

  * HTTP GET Method calls
  * HTTP OPTIONS Method calls
  * Calls to the following endpoints:
    * /webservices/DeletedTransactionsService.svc
    * /webservices/*.svc where the SOAP action starts with `Get`, `Query`, `Search`, or `Load` (header SOAPAction)
    * /webservices/*.asmx where the SOAP action starts with `Get`, `Query`, `Search`, or `Load` (header SOAPAction)
  * ProcessXML requests with the following root elements:
    * `list`
    * `read`
    * `columns`
    * `accountcode`
    * `accountcodes`



#### API Credits​

The following API Credit buckets exist for the purpose of rate limiting:

API Credits for Rate limits**Per IP Address**|  1000 API credits per minute  
---|---  
**Per ClientId**|  1000* API credits per minute  
**Per OrganisationId**|  1000 API credits per minute  
**Per ClientId and OrganisationId combination**|  500* API credits per minute  
  
* These credits are for certified integrations. For new and not yet certified ClientId credits are set to 5% of mentioned number. Please refer to [Connection certification](https://wktaaeu.my.site.com/nlcommunity/s/article/Wat-komt-er-aan-bod-tijdens-de-certificering?language=en_US) for more details about certification.

Please ensure that your application handles concurrency and rate limiting response codes properly, not doing so may lead to service disruption or degradation of your application. If you need help to adhere to the new rate limits please contact our support via the support portal.

warning

Please be aware we do not support higher API limits.

These limits are maximums and are not guaranteed: see our Fair Use Policy for more information.

#### Response headers​

The API response will include the following rate limit headers in each request:

Rate limit response headers for all requests**X-RateLimit-Limit**|  API Credits per minute. This takes the lowest of all API credit buckets limits (per IP Address, per ClientId, per OrganisationId, and per ClientId and OrganisationId).  
---|---  
**X-RateLimit-Remaining**|  The number of remaining API credits available within the current time window. This takes the lowest of all API credit buckets (per IP Address, per ClientId, per OrganisationId, and per ClientId and OrganisationId). Due to the distributed nature of our infrastructure the rate limiting information may not be completely accurate.  
**X-RateLimit-ClientId-Limit**|  API Credits per minute for the ClientId  
**X-RateLimit-ClientId-Remaining**|  The number of remaining API credits available within the current time window for the current ClientId. This may be higher than the `X-RateLimit-Remaining`. If `X-RateLimit-Remaining` is 0, but `X-RateLimit-ClientId-Remaining` is more than 0, requests can still be fulfilled for other Organisations. Due to the distributed nature of our infrastructure the rate limiting information may not be completely accurate.  
**X-RateLimit-Credited**|  Number of credits used by this request. This can be used to determine the cost of a request and to see if a request was counted as a Query request or not.  
  
In case the request is rejected due to rate limiting, the following header will also be present:

Rate limit exceeded response headers**Retry-After**|  The recommended retry interval in seconds after the specified call rate is exceeded.  
---|---  
  
### Concurrency Control​

To prevent abuse and maintain optimal service performance, we enforce concurrency control. Each ClientId can have a maximum of 20 concurrent requests. Each ClientId can have a maximum of 10 concurrent requests per organisation.

For example: a single ClientId can have 5 concurrent requests for 4 different organisations at the time.

All requests are subject to the following concurrency limits:

**Per ClientId**|  20 concurrent requests  
---|---  
**Per ClientId and OrganisationId combination**|  10 concurrent requests  
  
If the concurrency limit is exceeded, you will receive a `429 Too Many Requests` response, with `Concurrency limit exceeded.` message.

#### Response headers​

There is no specific concurrency limit related headers returned.

## Fair Use Policy​

The API currently does not limit the number of entities that can be created by your app. However, there are some entities that consume a lot of resources on Twinfield's servers: transaction lines, invoice lines and dimensions.

Above does not mean that it is allowed to make unlimited use of Twinfield. In case a subscriber exceeds a higher than average use of a company or organisation compared to the number of subscriptions the subscriber is paying for, Twinfield will ask the subscriber to reduce the use. If the subscriber does not reduce the use, Twinfield is entitled to increase the fee.

Keep this in mind when developing a connection with Twinfield. Try to reduce the number of entities to be created (especially transaction lines, invoice lines and dimensions) in Twinfield as much as possible.

## Limitations​

Most of the various entities within Twinfield (like customers, transactions, etc.) can be created or modified by the use of XML messages. Not all entities enforce hard limits related to the maximum size of such XML messages or entities. There are some limitations however to guarantee successful processing of an XML message.

Advise is to limit the number of children within a parent to 25. So, for example, 25 elements within a `<transaction**s** >` element.

The recommended maximum number of lines within a `<transaction>/<lines>` or `<salesinvoice>/<lines>` element is 500. As noted, no guarantee is given that XML messages or entities exceeding these limits are processed.

Per `<transaction>` there is a hard limit of 1000 lines.
