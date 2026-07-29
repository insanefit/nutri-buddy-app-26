import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("identifies the Saúde Nutricional pilot", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Saúde Nutricional" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Acesso clínico seguro")).toBeInTheDocument();
  });
});
