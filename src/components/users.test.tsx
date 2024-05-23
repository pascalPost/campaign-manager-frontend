import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Users } from "@/components/users.tsx";
import "@jest/globals";
import { mockUsers } from "@/mocks/db.ts";

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
