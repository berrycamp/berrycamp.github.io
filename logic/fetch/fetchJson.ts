/**
 * Fetch JSON containing T type response.
 */
export const fetchJson = <T>(req: RequestInfo): Promise<T> => fetch(req).then(res => res.json());