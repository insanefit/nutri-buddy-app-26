import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: vi.fn(() => ({ variable: "--font-geist-sans" })),
  Geist_Mono: vi.fn(() => ({ variable: "--font-geist-mono" })),
}));

import RootLayout, { metadata } from "./layout";

describe("RootLayout", () => {
  it("exposes the institutional metadata and renders its children", () => {
    render(
      <RootLayout>
        <p>Conteúdo clínico</p>
      </RootLayout>,
    );

    expect(metadata.title).toBe("Saúde Nutricional");
    expect(metadata.description).toBe(
      "Piloto clínico nutricional para duas unidades",
    );
    expect(document.documentElement).toHaveAttribute("lang", "pt-BR");
    expect(screen.getByText("Conteúdo clínico")).toBeInTheDocument();
  });
});
