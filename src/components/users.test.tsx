import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Users } from "@/components/users.tsx";
import "@jest/globals";
import { db, mockUsers } from "@/mocks/db.ts";
import { setupServer } from "msw/node";

const server = setupServer(
  ...db.user.toHandlers("rest", "http://localhost:8000/api/"),
);

// establish API mocking before all tests
beforeAll(() => server.listen());
// reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());
// clean up once the tests are done
afterAll(() => server.close());

describe("Users", () => {
  test("renders loading", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <Users />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Loading Users...")).toBeInTheDocument();
    });
  });

  test("list users", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <Users />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      mockUsers.forEach((mockUser) => {
        expect(
          screen.getByText(mockUser.name, { exact: false }),
        ).toBeInTheDocument();
      });
    });
  });
});
