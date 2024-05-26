import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";

import { FileTree } from "@/components/file-tree.tsx";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { enableMapSet } from "immer";

enableMapSet();

const server = setupServer(
  http.get("http://localhost:3000/fileTree", () => {
    return HttpResponse.json(
      [
        { path: "/folder", isDir: true },
        { path: "/file", isDir: false },
      ],
      { status: 200 },
    );
  }),
  http.get("http://localhost:3000/fileTree/folder", () => {
    return HttpResponse.json(
      [
        { path: "/folder/nestedFolder", isDir: true },
        { path: "/folder/nestedFile", isDir: false },
      ],
      { status: 200 },
    );
  }),
  http.delete("http://localhost:3000/fileTree/folder", () => {
    return HttpResponse.json({ path: "/folder" }, { status: 200 });
  }),
);

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

    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    expect(screen.getAllByText("/")).toHaveLength(1);
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

    await user.click(screen.getByTestId("icon-foldedPathState-/"));

    expect(screen.getAllByRole("listitem")).toHaveLength(3);

    expect(screen.getAllByText("/")).toHaveLength(1);
    expect(screen.getAllByText("folder")).toHaveLength(1);
    expect(screen.getAllByText("file")).toHaveLength(1);
  });

  it("renders nested folder content", async () => {
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

    await user.click(screen.getByTestId("icon-foldedPathState-/"));
    await user.click(screen.getByTestId("icon-foldedPathState-/folder"));

    expect(screen.getAllByRole("listitem")).toHaveLength(5);

    expect(screen.getAllByText("/")).toHaveLength(1);
    expect(screen.getAllByText("folder")).toHaveLength(1);
    expect(screen.getAllByText("file")).toHaveLength(1);
    expect(screen.getAllByText("nestedFolder")).toHaveLength(1);
    expect(screen.getAllByText("nestedFile")).toHaveLength(1);
  });

  it("allows to delete paths in the root", async () => {
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

    await user.click(screen.getByTestId("icon-foldedPathState-/"));
    await user.click(screen.getByTestId("button-modifyPath-/folder"));
    await user.click(screen.getByText("Delete"));

    expect(screen.queryByText("folder")).not.toBeInTheDocument();
  });

  // it("allows to delete nested paths", async () => {
  //   const user = userEvent.setup();
  //
  //   const queryClient = new QueryClient({
  //     defaultOptions: { queries: { retry: false } },
  //   });
  //   render(
  //     <QueryClientProvider client={queryClient}>
  //       <FileTree
  //         selectedFileProps={{
  //           selectedFile: "",
  //           handleChangeSelectedFile: (_: string) => {},
  //         }}
  //       />
  //       ,
  //     </QueryClientProvider>,
  //   );
  //
  //   await user.click(screen.getByTestId("icon-foldedPathState-/"));
  //   await user.click(screen.getByTestId("button-modifyPath-/folder"));
  //   await user.click(screen.getByText("Delete"));
  //
  //   expect(screen.queryByText("folder")).not.toBeInTheDocument();
  // });
});
