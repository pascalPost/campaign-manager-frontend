import fetch, { Request } from "node-fetch";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
globalThis.fetch = fetch as never;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
globalThis.Request = Request as never;
