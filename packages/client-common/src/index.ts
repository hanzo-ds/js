/**
 * @deprecated The `@hanzo/datastore-client-common` package is deprecated. It is no longer used by
 * `@hanzo/datastore-client` or `@hanzo/datastore-client-web`; the shared code is bundled into each client
 * package instead. Import everything from `@hanzo/datastore-client` (Node.js) or
 * `@hanzo/datastore-client-web` (Web) instead.
 *
 * @packageDocumentation
 */

/** Should be re-exported by the implementation */
export {
  type BaseQueryParams,
  type QueryParams,
  type QueryResult,
  type ExecParams,
  type InsertParams,
  /** @deprecated Import `DatastoreClient` from `@hanzo/datastore-client` instead. In Web projects, use `import type { DatastoreClient } from '@hanzo/datastore-client-web'`. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  DatastoreClient,
  type CommandParams,
  type CommandResult,
  type ExecResult,
  type InsertResult,
  type PingResult,
  type PingParams,
  type PingParamsWithSelectQuery,
  type PingParamsWithEndpoint,
} from "./client";
export { type BaseDatastoreClientConfigOptions } from "./config";
export type {
  Row,
  RowOrProgress,
  BaseResultSet,
  ResultJSONType,
  RowJSONType,
  ResultStream,
} from "./result";
export type {
  DataFormat,
  RawDataFormat,
  JSONDataFormat,
  StreamableDataFormat,
  StreamableJSONDataFormat,
  SingleDocumentJSONFormat,
} from "./data_formatter";
export {
  /** @deprecated Import `SupportedJSONFormats` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  SupportedJSONFormats,
  /** @deprecated Import `SupportedRawFormats` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  SupportedRawFormats,
  /** @deprecated Import `StreamableFormats` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  StreamableFormats,
  /** @deprecated Import `StreamableJSONFormats` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  StreamableJSONFormats,
  /** @deprecated Import `SingleDocumentJSONFormats` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  SingleDocumentJSONFormats,
  /** @deprecated Import `RecordsJSONFormats` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  RecordsJSONFormats,
  /** @deprecated Import `TupleParam` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  TupleParam,
} from "./data_formatter";
export {
  /** @deprecated Import `DatastoreError` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  DatastoreError,
  /** @deprecated Import `parseError` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  parseError,
} from "./error";
export {
  /** @deprecated Import `DatastoreLogLevel` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  DatastoreLogLevel,
  type ErrorLogParams,
  type WarnLogParams,
  type Logger,
  type LogParams,
} from "./logger";
export type {
  DatastoreSummary,
  InputJSON,
  InputJSONObjectEachRow,
  ResponseJSON,
  ResponseHeaders,
  WithDatastoreSummary,
  WithResponseHeaders,
  ProgressRow,
  InsertValues,
  DatastoreAuth,
  DatastoreJWTAuth,
  DatastoreCredentialsAuth,
} from "./datastore_types";
export {
  /** @deprecated Import `isProgressRow` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  isProgressRow,
  /** @deprecated Import `isRow` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  isRow,
  /** @deprecated Import `isException` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  isException,
} from "./datastore_types";
export {
  type DatastoreSettings,
  type DatastoreSettingsInterface,
  type MergeTreeSettings,
  /** @deprecated Import `SettingsMap` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  SettingsMap,
} from "./settings";
export type {
  SimpleColumnType,
  ParsedColumnSimple,
  ParsedColumnEnum,
  ParsedColumnFixedString,
  ParsedColumnNullable,
  ParsedColumnDecimal,
  ParsedColumnDateTime,
  ParsedColumnDateTime64,
  ParsedColumnArray,
  ParsedColumnTuple,
  ParsedColumnMap,
  ParsedColumnType,
  JSONHandling,
} from "./parse";
export {
  /** @deprecated Superseded by the `@hanzo/datastore-datatype-parser` package (`parseDataType` + its `Node` AST); slated for removal in a future major version. (Also: import client APIs from `@hanzo/datastore-client`/`@hanzo/datastore-client-web`, not `@hanzo/datastore-client-common`.) */
  SimpleColumnTypes,
  /** @deprecated Superseded by the `@hanzo/datastore-datatype-parser` package (`parseDataType` + its `Node` AST); slated for removal in a future major version. (Also: import client APIs from `@hanzo/datastore-client`/`@hanzo/datastore-client-web`, not `@hanzo/datastore-client-common`.) */
  parseColumnType,
  /** @deprecated Import `defaultJSONHandling` from `@hanzo/datastore-client` (Node.js) or `@hanzo/datastore-client-web` (Web) instead. Importing it from `@hanzo/datastore-client-common` is deprecated. */
  defaultJSONHandling,
} from "./parse";
export {
  type DatastoreTracer,
  type DatastoreSpan,
  type DatastoreSpanOptions,
  type DatastoreSpanAttributes,
  type DatastoreSpanStatus,
  type DatastoreSpanName,
  DatastoreSpanStatusCode,
  DatastoreSpanKind,
  DatastoreSpanNames,
  recordSpanError,
} from "./tracing";

/** For implementation usage only - should not be re-exported */
export {
  formatQuerySettings,
  formatQueryParams,
  encodeJSON,
  isSupportedRawFormat,
  isStreamableJSONFamily,
  isNotStreamableJSONFamily,
  validateStreamFormat,
} from "./data_formatter";
export {
  type ValuesEncoder,
  type MakeResultSet,
  type MakeConnection,
  type HandleImplSpecificURLParams,
  type ImplementationDetails,
  booleanConfigURLValue,
  enumConfigURLValue,
  getConnectionParams,
  numberConfigURLValue,
} from "./config";
export {
  USER_HEADER_NAME,
  KEY_HEADER_NAME,
  SSL_CERTIFICATE_AUTH_HEADER_NAME,
  SUMMARY_HEADER_NAME,
  EXCEPTION_CODE_HEADER_NAME,
  EXCEPTION_TAG_HEADER_NAME,
} from "./headers";
export {
  isSuccessfulResponse,
  sleep,
  buildMultipartBody,
  MAX_URL_BIND_PARAM_LENGTH,
  serializeQueryParamsForUrl,
  toSearchParams,
  transformUrl,
  withCompressionHeaders,
  withHttpSettings,
  isCredentialsAuth,
  isJWTAuth,
  extractErrorAtTheEndOfChunk,
  CARET_RETURN,
} from "./utils";
export { LogWriter, DefaultLogger, type LogWriterParams } from "./logger";
export { getCurrentStackTrace, enhanceStackTrace } from "./error";
export type {
  CompressionSettings,
  CompressionMethod,
  RequestCompression,
  ResponseCompression,
  Connection,
  ConnectionParams,
  ConnInsertResult,
  ConnExecParams,
  ConnExecResult,
  ConnQueryResult,
  ConnBaseQueryParams,
  ConnBaseResult,
  ConnInsertParams,
  ConnPingResult,
  ConnCommandResult,
  ConnOperation,
  ConnPingParams,
} from "./connection";
export type { QueryParamsWithFormat } from "./client";
export type { IsSame } from "./ts_utils";
