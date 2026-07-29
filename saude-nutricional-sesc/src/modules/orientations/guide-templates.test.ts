import { describe, expect, it } from "vitest";
import { OFFICIAL_CLINICAL_ORIENTATIONS } from "./guide-templates";

describe("Clinical Orientation Templates", () => {
  it("contains official Ministry of Health guidelines category", () => {
    const mainCategory = OFFICIAL_CLINICAL_ORIENTATIONS.find(
      (c) => c.id === "guia-alimentar-habitos"
    );

    expect(mainCategory).toBeDefined();
    expect(mainCategory?.items.length).toBe(9);
    expect(mainCategory?.items).toContain(
      "Coma devagar, mastigando bem e sem distrações (desconecte-se de celulares, TV e computadores durante as refeições)."
    );
  });

  it("exports valid categories with title, source and non-empty items", () => {
    OFFICIAL_CLINICAL_ORIENTATIONS.forEach((category) => {
      expect(category.id).toBeTruthy();
      expect(category.title).toBeTruthy();
      expect(category.source).toBeTruthy();
      expect(category.items.length).toBeGreaterThan(0);
    });
  });
});
