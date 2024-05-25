import fetch, { Request } from "node-fetch";

globalThis.fetch = fetch as any;
globalThis.Request = Request as any;
