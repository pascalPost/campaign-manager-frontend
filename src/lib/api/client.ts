import createClient from "openapi-fetch";
import { paths } from "./v1";

const client = createClient<paths>({ baseUrl: "http://localhost:3000/" });

export { client };
