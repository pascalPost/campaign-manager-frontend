import { prettyDOM, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";

import { FileTree } from "@/components/file-tree.tsx";
import { http, HttpResponse } from "msw";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";

// export const handlers = [
//   http.get("/some/request", ({ request }) => {
//     console.log("Handler", request.method, request.url);
//
//     // The rest of the response resolver here.
//   }),
// ];

const server = setupServer();
// http.get("http://localhost:3000/*", () => {
//   console.log("GET /*");
// }),
// http.get("http://localhost:3000/fileTree", () => {
//   console.log("GET /fileTree");
// return HttpResponse.json(
//   {
//     path: "folder",
//     isDir: true,
//   },
//   { status: 200 },
// );
// }),

// server.events.on("request:start", ({ request }) => {
//   console.log("Outgoing:", request.method, request.url);
// });

beforeAll(() =>
  server.listen({
    onUnhandledRequest: (request) => {
      console.log("Unhandled request", request.method, request.url);
      throw new Error(
        `No request handler found for ${request.method} ${request.url}`,
      );
    },
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("FileTree", () => {
  it("renders the root on start", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <FileTree
          selectedFileProps={{
            selectedFile: "",
            handleChangeSelectedFile: (_: string) => {},
          }}
        />
        ,
      </QueryClientProvider>,
    );

    // Query for all li elements
    const listItemElements = screen.getAllByRole("listitem");

    // Ensure there is exactly one li element
    expect(listItemElements).toHaveLength(1);

    // Optionally, check the contents of the li element
    expect(listItemElements[0]).toContainElement(screen.getByText("/"));
  });

  it("renders the root sub-paths when the root node is expanded", async () => {
    const user = userEvent.setup();

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <FileTree
          selectedFileProps={{
            selectedFile: "",
            handleChangeSelectedFile: (_: string) => {},
          }}
        />
        ,
      </QueryClientProvider>,
    );

    server.use(
      //   http.get("http://localhost:3000/*", () => {
      //     console.log("GET /*");
      //   }),
      http.get("http://localhost:3000/fileTree", () => {
        console.log("GET /fileTree");
        return HttpResponse.json(
          [
            {
              path: "folder",
              isDir: true,
            },
          ],
          { status: 200 },
        );
      }),
    );

    const expandButton = screen.getByTestId("fold-icon_/");
    await user.click(expandButton);

    expect(screen.getByText("folder")).toBeInTheDocument();
  });
});
