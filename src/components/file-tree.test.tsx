import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";

import { FileTree } from "@/components/file-tree.tsx";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { enableMapSet } from "immer";
import { components } from "@/lib/api/v1";

enableMapSet();

const url = "http://localhost:3000/fs/fileTree";

const server = setupServer(
  http.get(`${url}/${encodeURIComponent("/")}`, () => {
    return HttpResponse.json(
      [
        { path: "/folder", isDir: true },
        { path: "/file", isDir: false },
      ],
      { status: 200 },
    );
  }),
  http.get(`${url}/${encodeURIComponent("/folder")}`, () => {
    return HttpResponse.json(
      [
        { path: "/folder/nestedFolder", isDir: true },
        { path: "/folder/nestedFile", isDir: false },
      ],
      { status: 200 },
    );
  }),
  http.get(`${url}/${encodeURIComponent("/folder/nestedFolder")}`, () => {
    return HttpResponse.json(
      [{ path: "/folder/deeplyNestedFile", isDir: false }],
      { status: 200 },
    );
  }),
  http.post<
    never,
    components["schemas"]["FileTreeEntry"],
    components["schemas"]["FileTreePath"]
  >(url, async ({ request }) => {
    const newPath = await request.json();
    return HttpResponse.json({ path: newPath.path }, { status: 201 });
  }),
  http.delete(`${url}/folder`, () => {
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

  it("renders deeply nested folder content", async () => {
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
    await user.click(
      screen.getByTestId("icon-foldedPathState-/folder/nestedFolder"),
    );

    expect(screen.getAllByText("deeplyNestedFile")).toHaveLength(1);
  });

  it("allows to create paths", async () => {
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

    await user.click(screen.getByTestId("button-addPath-/"));
    fireEvent.change(screen.getByRole("textbox", { name: /folder/i }), {
      target: { value: "dir" },
    });
    await user.click(screen.getByText("Add Folder"));
    expect(screen.getAllByText("dir")).toHaveLength(1);

    await user.click(screen.getByTestId("button-addPath-/"));
    fireEvent.change(screen.getByRole("textbox", { name: /file/i }), {
      target: { value: "test.txt" },
    });
    await user.click(screen.getByText("Add File"));
    expect(screen.getAllByText("test.txt")).toHaveLength(1);
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
