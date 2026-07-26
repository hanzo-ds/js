import {
  type ConnBaseQueryParams,
  isCredentialsAuth,
  KEY_HEADER_NAME,
  SSL_CERTIFICATE_AUTH_HEADER_NAME,
  USER_HEADER_NAME,
  withCompressionHeaders,
} from "../common/index";
import type Http from "http";
import Https from "https";
import type { NodeConnectionParams } from "./node_base_connection";
import type { RequestParams } from "./socket_pool";
import { NodeBaseConnection } from "./node_base_connection";

export class NodeHttpsConnection extends NodeBaseConnection {
  constructor(params: NodeConnectionParams) {
    const agent = new Https.Agent({
      keepAlive: params.keep_alive.enabled,
      maxSockets: params.max_open_connections,
      ca: params.tls?.ca_cert,
      key: params.tls?.type === "Mutual" ? params.tls.key : undefined,
      cert: params.tls?.type === "Mutual" ? params.tls.cert : undefined,
    });
    super(params, agent);
  }

  protected override buildRequestHeaders(
    params?: ConnBaseQueryParams,
  ): Http.OutgoingHttpHeaders {
    if (this.params.tls !== undefined) {
      if (this.params.auth.type === "JWT") {
        throw new Error(
          "JWT auth is not supported with HTTPS connection using custom certificates",
        );
      }
      let headers: Http.OutgoingHttpHeaders;
      if (isCredentialsAuth(params?.auth)) {
        headers = {
          ...this.defaultHeadersWithOverride(params),
          [USER_HEADER_NAME]: params.auth.username,
          [KEY_HEADER_NAME]: params.auth.password,
        };
      } else {
        headers = {
          ...this.defaultHeadersWithOverride(params),
          [USER_HEADER_NAME]: this.params.auth.username,
          [KEY_HEADER_NAME]: this.params.auth.password,
        };
      }
      const tlsType = this.params.tls.type;
      switch (tlsType) {
        case "Basic":
          return headers;
        case "Mutual":
          return {
            ...headers,
            [SSL_CERTIFICATE_AUTH_HEADER_NAME]: "on",
          };
        default:
          throw new Error(`Unknown TLS type: ${tlsType}`);
      }
    }
    return super.buildRequestHeaders(params);
  }

  protected createClientRequest(params: RequestParams): Http.ClientRequest {
    const headers = withCompressionHeaders({
      headers: params.headers,
      request_compression_codec: params.request_compression?.codec,
      response_compression_codec: params.response_compression_codec,
    });
    return Https.request(params.url, {
      method: params.method,
      agent: this.agent,
      timeout: this.params.request_timeout,
      signal: params.abort_signal,
      headers,
      ...(this.params.max_response_headers_size !== undefined && {
        maxHeaderSize: this.params.max_response_headers_size,
      }),
    });
  }
}
