export interface ResponseJSON<T = unknown> {
  data: Array<T>;
  query_id?: string;
  totals?: T;
  extremes?: Record<string, any>;
  // # Supported only by responses in JSON, XML.
  // # Otherwise, it can be read from x-datastore-summary header
  meta?: Array<{ name: string; type: string }>;
  statistics?: { elapsed: number; rows_read: number; bytes_read: number };
  rows?: number;
  rows_before_limit_at_least?: number;
}

export interface InputJSON<T = unknown> {
  meta: { name: string; type: string }[];
  data: T[];
}

export type InputJSONObjectEachRow<T = unknown> = Record<string, T>;

export interface DatastoreSummary {
  read_rows: string;
  read_bytes: string;
  written_rows: string;
  written_bytes: string;
  total_rows_to_read: string;
  result_rows: string;
  result_bytes: string;
  elapsed_ns: string;
  /** Available only after Datastore 24.9 */
  real_time_microseconds?: string;
}

export type ResponseHeaders = Record<string, string | string[] | undefined>;

export interface WithDatastoreSummary {
  summary?: DatastoreSummary;
}

export interface WithResponseHeaders {
  response_headers: ResponseHeaders;
}

export interface WithHttpStatusCode {
  http_status_code?: number;
}

export interface DatastoreProgress {
  read_rows: string;
  read_bytes: string;
  elapsed_ns: string;
  total_rows_to_read?: string;
}

export interface ProgressRow {
  progress: DatastoreProgress;
}

export type SpecialEventRow<T> =
  | { meta: Array<{ name: string; type: string }> }
  | { totals: T }
  | { min: T }
  | { max: T }
  | { rows_before_limit_at_least: number | string }
  | { rows_before_aggregation: number | string }
  | { exception: string };

export type InsertValues<Stream, T = unknown> =
  | ReadonlyArray<T>
  | Stream
  | InputJSON<T>
  | InputJSONObjectEachRow<T>;

export type NonEmptyArray<T> = [T, ...T[]];

export interface DatastoreCredentialsAuth {
  username?: string;
  password?: string;
}

/** Supported in Datastore Cloud only */
export interface DatastoreJWTAuth {
  access_token: string;
}

export type DatastoreAuth = DatastoreCredentialsAuth | DatastoreJWTAuth;

/** Type guard to use with `JSONEachRowWithProgress`, checking if the emitted row is a progress row.
 *  @see https://docs.hanzo.ai/datastore/interfaces/formats/JSONEachRowWithProgress */
export function isProgressRow(row: unknown): row is ProgressRow {
  return (
    row !== null &&
    typeof row === "object" &&
    "progress" in row &&
    Object.keys(row).length === 1
  );
}

/** Type guard to use with `JSONEachRowWithProgress`, checking if the emitted row is a row with data.
 *  @see https://docs.hanzo.ai/datastore/interfaces/formats/JSONEachRowWithProgress */
export function isRow<T>(row: unknown): row is { row: T } {
  return (
    row !== null &&
    typeof row === "object" &&
    "row" in row &&
    Object.keys(row).length === 1
  );
}

/** Type guard to use with `JSONEachRowWithProgress`, checking if the row contains an exception.
 *  @see https://docs.hanzo.ai/datastore/interfaces/formats/JSONEachRowWithProgress */
export function isException(row: unknown): row is { exception: string } {
  return (
    row !== null &&
    typeof row === "object" &&
    "exception" in row &&
    Object.keys(row).length === 1
  );
}
