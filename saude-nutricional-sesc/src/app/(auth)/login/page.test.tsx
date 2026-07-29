import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../modules/access/actions", () => ({
  signIn: vi.fn(),
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  it("offers invited professionals a login without public registration", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: "Acesso profissional" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(
      screen.getByText("Acesso exclusivo para profissionais convidados."),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
