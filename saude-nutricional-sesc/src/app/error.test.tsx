import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

afterEach(cleanup);

describe("ErrorPage", () => {
  it("offers an accessible recovery action without exposing sensitive details", async () => {
    const reset = vi.fn();
    const error = Object.assign(
      new Error("permission denied for table profiles"),
      { digest: "internal-digest" },
    );
    render(<ErrorPage error={error} reset={reset} />);

    expect(
      screen.getByRole("heading", {
        name: "Não foi possível carregar esta área",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tente novamente",
    );
    expect(screen.queryByText(/permission denied/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/internal-digest/i)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Tentar novamente" }),
    );
    expect(reset).toHaveBeenCalledOnce();
  });
});
