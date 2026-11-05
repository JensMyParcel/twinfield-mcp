# twinfield-mcp

A local MCP server (stdio) for the complete Twinfield accounting web service API.

## What it covers

| Part of the API                                                                                                                           | Tools                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 8 WCF command/query services (bank books, bank statements, budgets, cash books, deleted transactions, documents, periods, blocked values) | one tool per command or query, 29                                      |
| 6 ASMX services (declarations, finder, hierarchies, matching, pay and collect, versions)                                                  | one tool per method, 38                                                |
| ProcessXml (dimensions, transactions, sales invoices, users, VAT, browse data, `read`, `list`, …)                                         | one tool per message root, 30                                          |
| OpenID Connect user info                                                                                                                  | `twinfield_user_info`                                                  |
| The documentation (53 pages)                                                                                                              | `twinfield_documentation`, and MCP resources `twinfield-docs://<page>` |

The SOAP tools are generated from the WSDL and XSD files in `vendor/twinfield`. Each tool's
input schema is the operation's real request type, so the server validates the arguments
before it sends anything. Every operation is classified as read, write or destructive in
`codegen/service-registry.ts`. The generator fails when the WSDL has an operation that the
registry does not list.

Three ProcessXml WSDL methods are not tools: `ProcessXmlString` is used by the ProcessXml tools,
`ProcessXmlDocument` is for .NET clients only, and `ProcessXmlCompressed` is deprecated.

## Set up

1. Register an OAuth client in the [Twinfield developer portal](https://developers.twinfield.com).
   Use the redirect URI `http://localhost:8642/callback`.
2. Build and log in once. The refresh token goes to
   `~/.config/twinfield-mcp/credentials.json` (mode 0600):

   ```sh
   npm ci && npm run build
   TWINFIELD_CLIENT_ID=... TWINFIELD_CLIENT_SECRET=... node dist/bin/login.js
   ```

3. Add the server to your MCP client, for example Claude Code:

   ```sh
   claude mcp add twinfield \
     -e TWINFIELD_CLIENT_ID=... -e TWINFIELD_CLIENT_SECRET=... -e TWINFIELD_COMPANY=001 \
     -- node /path/to/twinfield-mcp/dist/bin/stdio.js
   ```

| Variable                                         | Required | Meaning                                                       |
| ------------------------------------------------ | -------- | ------------------------------------------------------------- |
| `TWINFIELD_CLIENT_ID`, `TWINFIELD_CLIENT_SECRET` | yes      | The OAuth client.                                             |
| `TWINFIELD_REFRESH_TOKEN`                        | no       | Use this refresh token instead of the credentials file.       |
| `TWINFIELD_CREDENTIALS_FILE`                     | no       | Another location for the credentials file.                    |
| `TWINFIELD_COMPANY`                              | no       | Default company (office) code when a call gives no `company`. |
| `TWINFIELD_REDIRECT_URI`                         | no       | Login callback, must be `http://localhost:<port>/<path>`.     |
| `TWINFIELD_HTTP_TIMEOUT_MS`                      | no       | Timeout per HTTP request, default 60000.                      |

## How it works

- **Session.** The server exchanges the refresh token for an access token, finds the
  organisation's cluster through the token validation endpoint and renews the token 60 seconds
  before it expires. Only `https://api.<cluster>.twinfield.com` hosts are accepted.
- **Retries.** A request that Twinfield rejects with 429 is retried with `Retry-After` and
  exponential backoff (Twinfield does not process such a request). A request rejected because the
  token is invalid is sent once more with a renewed token. Nothing else is retried.
- **ProcessXml.** The `payload` is the content of the root element as JSON: a property is a
  child element, `@name` is an attribute, `#text` is text, an array repeats the element. A
  response with `result="0"` is an error result and lists Twinfield's messages per element.
- **Errors.** Twinfield faults come back with their code and message. Unexpected errors are
  logged to stderr and shown to the caller without details.

## Development

```sh
npm run check     # generator up to date, types, lint, format, tests with 100% coverage, build
npm run generate  # regenerate src/catalog/soap-catalog.generated.ts from vendor/twinfield
```

The vendored WSDL, XSD and documentation files are snapshots taken on 2026-11-04 from
`https://api.accounting.twinfield.com/webservices/` and
`https://developers.twinfield.com/documentation/`.
