import type { DataFormat, IsSame, QueryParamsWithFormat } from "./common/index";
import { DatastoreClient } from "./common/index";
import type Stream from "stream";
import type { NodeDatastoreClientConfigOptions } from "./config";
import { NodeConfigImpl } from "./config";
import type { ResultSet } from "./result_set";

/** If the Format is not a literal type, fall back to the default behavior of the ResultSet,
 *  allowing to call all methods with all data shapes variants,
 *  and avoiding generated types that include all possible DataFormat literal values. */
export type QueryResult<Format extends DataFormat> =
  IsSame<Format, DataFormat> extends true
    ? ResultSet<unknown>
    : ResultSet<Format>;

export class NodeDatastoreClient extends DatastoreClient<Stream.Readable> {
  /** See {@link DatastoreClient.query}. */
  override query<Format extends DataFormat = "JSON">(
    params: QueryParamsWithFormat<Format>,
  ): Promise<QueryResult<Format>> {
    return super.query(params) as Promise<ResultSet<Format>>;
  }
}

export function createClient(
  config?: NodeDatastoreClientConfigOptions,
): NodeDatastoreClient {
  // If the caller injected a pre-built Connection, override the
  // default HTTP make_connection factory to return THAT connection
  // instead. Used for the experimental integration with chDB only.
  const injected = config?.connection;
  const impl =
    injected !== undefined
      ? { ...NodeConfigImpl, make_connection: () => injected }
      : NodeConfigImpl;
  return new DatastoreClient<Stream.Readable>({
    impl,
    ...(config || {}),
  }) as NodeDatastoreClient;
}
