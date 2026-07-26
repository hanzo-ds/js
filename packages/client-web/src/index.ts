export {
  type WebDatastoreClient as DatastoreClient,
  type QueryResult,
} from "./client";
export { createClient } from "./client";
export { type WebDatastoreClientConfigOptions as DatastoreClientConfigOptions } from "./config";
export { ResultSet } from "./result_set";

/** Re-export common (formerly @hanzo-ds/client-common) types */
export {
  type BaseDatastoreClientConfigOptions,
  type BaseQueryParams,
  type QueryParams,
  type ExecParams,
  type InsertParams,
  type InsertValues,
  type CommandParams,
  type CommandResult,
  type ExecResult,
  type InsertResult,
  type DataFormat,
  type RawDataFormat,
  type JSONDataFormat,
  type StreamableDataFormat,
  type StreamableJSONDataFormat,
  type SingleDocumentJSONFormat,
  type Logger,
  type LogParams,
  type ErrorLogParams,
  type WarnLogParams,
  type DatastoreSettings,
  type DatastoreSettingsInterface,
  type MergeTreeSettings,
  type Row,
  type ResponseJSON,
  type InputJSON,
  type InputJSONObjectEachRow,
  type BaseResultSet,
  type PingResult,
  type ResponseHeaders,
  type SimpleColumnType,
  type ParsedColumnSimple,
  type ParsedColumnEnum,
  type ParsedColumnFixedString,
  type ParsedColumnNullable,
  type ParsedColumnDecimal,
  type ParsedColumnDateTime,
  type ParsedColumnDateTime64,
  type ParsedColumnArray,
  type ParsedColumnTuple,
  type ParsedColumnMap,
  type ParsedColumnType,
  type ProgressRow,
  type RowOrProgress,
  type DatastoreAuth,
  type DatastoreJWTAuth,
  type DatastoreCredentialsAuth,
  type DatastoreTracer,
  type DatastoreSpan,
  type DatastoreSpanOptions,
  type DatastoreSpanAttributes,
  type DatastoreSpanStatus,
  type DatastoreSpanName,
} from "./common/index";

/**
 * Re-export common (formerly @hanzo-ds/client-common) runtime values.
 *
 * These are intentionally re-exported through local bindings (rather than a direct
 * `export { ... } from './common/index'`) so that the `@deprecated` JSDoc tags
 * applied to them in `./common/index` are NOT propagated to consumers of this package.
 * Importing these values from `@hanzo-ds/client-web` is the recommended, non-deprecated path.
 */
import {
  DatastoreError as DatastoreError_,
  parseError as parseError_,
  DatastoreLogLevel as DatastoreLogLevel_,
  SettingsMap as SettingsMap_,
  SupportedJSONFormats as SupportedJSONFormats_,
  SupportedRawFormats as SupportedRawFormats_,
  StreamableFormats as StreamableFormats_,
  StreamableJSONFormats as StreamableJSONFormats_,
  SingleDocumentJSONFormats as SingleDocumentJSONFormats_,
  RecordsJSONFormats as RecordsJSONFormats_,
  parseColumnType as parseColumnType_,
  SimpleColumnTypes as SimpleColumnTypes_,
  isProgressRow as isProgressRow_,
  isRow as isRow_,
  isException as isException_,
  TupleParam as TupleParam_,
  DatastoreSpanNames as DatastoreSpanNames_,
  DatastoreSpanStatusCode as DatastoreSpanStatusCode_,
  DatastoreSpanKind as DatastoreSpanKind_,
  defaultJSONHandling as defaultJSONHandling_,
  EXCEPTION_TAG_HEADER_NAME as EXCEPTION_TAG_HEADER_NAME_,
  extractErrorAtTheEndOfChunk as extractErrorAtTheEndOfChunk_,
} from "./common/index";

export const DatastoreError = DatastoreError_;
export type DatastoreError = DatastoreError_;
export const parseError = parseError_;
export const DatastoreLogLevel = DatastoreLogLevel_;
export type DatastoreLogLevel = DatastoreLogLevel_;
export const SettingsMap = SettingsMap_;
export type SettingsMap = SettingsMap_;
export const SupportedJSONFormats = SupportedJSONFormats_;
export const SupportedRawFormats = SupportedRawFormats_;
export const StreamableFormats = StreamableFormats_;
export const StreamableJSONFormats = StreamableJSONFormats_;
export const SingleDocumentJSONFormats = SingleDocumentJSONFormats_;
export const RecordsJSONFormats = RecordsJSONFormats_;
/** @deprecated Superseded by the `@hanzo-ds/datatype-parser` package (`parseDataType` + its `Node` AST); slated for removal in a future major version. */
export const parseColumnType = parseColumnType_;
/** @deprecated Superseded by the `@hanzo-ds/datatype-parser` package (`parseDataType` + its `Node` AST); slated for removal in a future major version. */
export const SimpleColumnTypes = SimpleColumnTypes_;
export const isProgressRow = isProgressRow_;
export const isRow = isRow_;
export const isException = isException_;
export const TupleParam = TupleParam_;
export type TupleParam = TupleParam_;
export const DatastoreSpanNames = DatastoreSpanNames_;
export const DatastoreSpanStatusCode = DatastoreSpanStatusCode_;
export const DatastoreSpanKind = DatastoreSpanKind_;
export const defaultJSONHandling = defaultJSONHandling_;
export const EXCEPTION_TAG_HEADER_NAME = EXCEPTION_TAG_HEADER_NAME_;
export const extractErrorAtTheEndOfChunk = extractErrorAtTheEndOfChunk_;
