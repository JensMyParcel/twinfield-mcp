/** Parses a response body as JSON, or returns `undefined` so a schema check rejects it. */
export function parseJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return undefined;
  }
}
