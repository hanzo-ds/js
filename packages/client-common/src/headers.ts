/**
 * The Datastore HTTP wire protocol header names — spelled once, here.
 *
 * Request headers are sent in canonical casing; response headers are looked up
 * in lower case, since Node.js lower-cases incoming header names and the Fetch
 * `Headers` API is case-insensitive.
 *
 * The server side of this contract is `hanzoai/datastore` (see
 * `src/Server/HTTP/authenticateUserByHTTP.cpp` and `src/Server/HTTPHandler.cpp`).
 */

/** Request: user name, when authenticating over a TLS connection. */
export const USER_HEADER_NAME = "X-Datastore-User";
/** Request: password, when authenticating over a TLS connection. */
export const KEY_HEADER_NAME = "X-Datastore-Key";
/** Request: opt into client-certificate authentication (mutual TLS). */
export const SSL_CERTIFICATE_AUTH_HEADER_NAME =
  "X-Datastore-SSL-Certificate-Auth";

/** Response: JSON with the row/byte counters of the executed query. */
export const SUMMARY_HEADER_NAME = "x-datastore-summary";
/** Response: server error code; also set on a 200 when the query fails mid-stream. */
export const EXCEPTION_CODE_HEADER_NAME = "x-datastore-exception-code";
/** Response: random tag that marks an exception appended to the response body. */
export const EXCEPTION_TAG_HEADER_NAME = "x-datastore-exception-tag";
