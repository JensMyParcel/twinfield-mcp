  * [](/documentation/)
  * Breaking changes



On this page

# Breaking changes

Upcoming breaking changes, deprecations, and end-of-life announcements, of our APIs (including Web Services):

## Summary​

Change| Deprecated date| Sunset date| End-of-life date  
---|---|---|---  
General root XML element| 01-03-2024| 31-12-2024| 01-07-2025  
API Request Rate above limits| 31-01-2024| 01-12-2024| 01-04-2025  
API Concurrency above limits| 31-01-2024| 01-12-2024| 01-04-2025  
More than 1000 lines per transaction| 01-04-2021| 31-12-2021| 01-10-2024  
ProcessXmlCompressed| 31-12-2018| 31-12-2024| 31-07-2025  
template field in Users master| 01-02-2019| 31-12-2024| 31-07-2025  
  
## Details​

Details of the breaking changes:

### General root XML element​

The root element of the XML request can no longer be `general`. General could previously be used to combine multiple different requests within one request but causes complexity and implementation errors. Instead, a `transaction` can be part of a `transactions` root element.

If an integration used multiple different elements as part of one `general` request, they should now be split up to multiple requests.

For example, a request that contains a `transaction` and a `customer` should be split up into two separate requests.

### API Request Rate above limits​

When the rate of requests exceeds the limits, the API will return a 429 status code. The limits are defined in the [Fair Use Policy](/documentation/getting-started/fair-use-policy).

### API Concurrency above limits​

When the number of concurrent requests exceeds the limits, the API will return a 429 status code. The limits are defined in the [Fair Use Policy](/documentation/getting-started/fair-use-policy).

### More than 1000 lines per transaction​

When a transaction contains more than 1000 lines, the API will return a 400 status code.

### ProcessXmlCompressed​

The `ProcessXmlCompressed` method is deprecated and will be removed. It is recommended to use the `ProcessXmlString` or `ProcessXmlDocument` method instead. HTTP calls can [use compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding) instead.

### template field in user master​

The `template` field is deprecated and will be removed. It is recommended to use the `templatecompanyaccess` field instead. [More information](/documentation/api/master-data/users#office).

## Breaking changes terminology​

Terminology used to describe breaking changes at Twinfield:

### Breaking change​

A change that breaks existing functionality. This could be for example a change in the request or response structure, change in functionality, compatibility, protocols, new limits, or a change in the behavior of the API.

We strive to communicate breaking changes with enough time for all integrators to adapt to these changes. This may not always be possible, as the change may for example be a consequence of a change of a service we use or urgent security or compliance requirements.

### Phase-out period​

The time between the announcement of the deprecation of functionality and the End-of-life period.

We strive to monitor usage of functionality before and during the phase-out period.

### Deprecation​

A previously supported functionality is no longer recommended for use, but still operational. It is expected that this functionality will stop working in the future. This could be because a new version of the API is available, parts of the API change in a way that is not backwards compatible, or the API or functionality will be discontinued. Consumers of this API that use the deprecated functionality are encouraged to change their implementations to avoid service disruption.

### Sunset​

The state between "deprecated" and "end-of-life". During this phase, the API or functionality is no longer actively maintained. New integrations can not use this functionality, nor can organisations start using this functionality if they did not use it recently before the sunset date.

### End-of-life​

A feature that is no longer operational, and no users can use the functionality anymore. This could be because an improved (but different) feature is available, or a change in the API.

The functionality is removed from the product.
