import type {
  CommandParams,
  CommandResult,
  DataFormat,
  ExecParams,
  ExecResult,
  InputJSON,
  InputJSONObjectEachRow,
  InsertParams,
  InsertResult,
  IsSame,
  QueryParamsWithFormat,
} from "./common/index";
import { DatastoreClient } from "./common/index";
import type { WebDatastoreClientConfigOptions } from "./config";
import { WebImpl } from "./config";
import type { ResultSet } from "./result_set";

/** If the Format is not a literal type, fall back to the default behavior of the ResultSet,
 *  allowing to call all methods with all data shapes variants,
 *  and avoiding generated types that include all possible DataFormat literal values. */
export type QueryResult<Format extends DataFormat> =
  IsSame<Format, DataFormat> extends true
    ? ResultSet<unknown>
    : ResultSet<Format>;

export type WebDatastoreClient = Omit<
  WebDatastoreClientImpl,
  "insert" | "exec" | "command"
> & {
  /** See {@link DatastoreClient.insert}.
   *
   *  ReadableStream is removed from possible insert values
   *  until it is supported by all major web platforms. */
  insert<T>(
    params: Omit<InsertParams<ReadableStream, T>, "values"> & {
      values: ReadonlyArray<T> | InputJSON<T> | InputJSONObjectEachRow<T>;
    },
  ): Promise<InsertResult>;
  /** See {@link DatastoreClient.exec}.
   *
   *  Custom values are currently not supported in the web versions.
   *  The `ignore_error_response` parameter is not supported in the Web version. */
  exec(
    params: Omit<ExecParams, "ignore_error_response">,
  ): Promise<ExecResult<ReadableStream>>;
  /** See {@link DatastoreClient.command}.
   *
   *  The `ignore_error_response` parameter is not supported in the Web version. */
  command(
    params: Omit<CommandParams, "ignore_error_response">,
  ): Promise<CommandResult>;
};

class WebDatastoreClientImpl extends DatastoreClient<ReadableStream> {
  /** See {@link DatastoreClient.query}. */
  override query<Format extends DataFormat>(
    params: QueryParamsWithFormat<Format>,
  ): Promise<QueryResult<Format>> {
    return super.query(params) as Promise<ResultSet<Format>>;
  }
}

export function createClient(
  config?: WebDatastoreClientConfigOptions,
): WebDatastoreClient {
  return new WebDatastoreClientImpl({
    impl: WebImpl,
    ...(config || {}),
  });
}
