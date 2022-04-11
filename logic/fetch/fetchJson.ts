/**
 * Fetch JSON containing T type response.
 */
const fetchJson = <T>(req: RequestInfo): Promise<T> => fetch(req).then(res => res.json());

export default fetchJson;