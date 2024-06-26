/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/ping": {
    /** Ping server */
    get: {
      responses: {
        /** @description Success response */
        200: {
          content: never;
        };
      };
    };
  };
  "/jobs": {
    /** List jobs */
    get: {
      responses: {
      };
    };
    /** Add new job */
    post: {
      responses: {
      };
    };
  };
  "/projects": {
    /** List projects */
    get: {
      responses: {
        /** @description Success response */
        200: {
          content: {
            "application/json": components["schemas"]["Project"][];
          };
        };
      };
    };
    /** Add new project */
    post: {
      requestBody: {
        content: {
          "application/json": {
            name: string;
          };
        };
      };
      responses: {
        /** @description Created */
        201: {
          content: {
            "application/json": {
              id: string;
            };
          };
        };
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    Project: {
      id: string;
      name: string;
      path: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
