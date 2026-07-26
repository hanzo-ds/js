import { Runtime } from "./runtime";

/**
 * Generate a user agent string like
 * ```
 * datastore-js/0.0.11 (lv:nodejs/19.0.4; os:linux)
 * ```
 * or
 * ```
 * MyApplicationName datastore-js/0.0.11 (lv:nodejs/19.0.4; os:linux)
 * ```
 */
export function getUserAgent(application_id?: string): string {
  const defaultUserAgent = `datastore-js/${Runtime.package} (lv:nodejs/${
    Runtime.node
  }; os:${Runtime.os})`;
  return application_id
    ? `${application_id} ${defaultUserAgent}`
    : defaultUserAgent;
}
