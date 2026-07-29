import { describe, expect, it } from "vitest";

export interface NutritionalItem {
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export function calculateNutritionalTotals(
  items: Array<{ food: NutritionalItem; quantity_grams: number }>
) {
  return items.reduce(
    (acc, item) => {
      const ratio = item.quantity_grams / 100;
      return {
        calories: acc.calories + item.food.calories_per_100g * ratio,
        protein: acc.protein + item.food.protein_per_100g * ratio,
        carbs: acc.carbs + item.food.carbs_per_100g * ratio,
        fat: acc.fat + item.food.fat_per_100g * ratio,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

describe("Nutritional Calculation Module", () => {
  it("calculates correct macronutrients for a single 150g serving", () => {
    const chicken: NutritionalItem = {
      name: "Peito de frango grelhado",
      calories_per_100g: 165,
      protein_per_100g: 31.0,
      carbs_per_100g: 0,
      fat_per_100g: 3.6,
    };

    const totals = calculateNutritionalTotals([
      { food: chicken, quantity_grams: 150 },
    ]);

    expect(totals.calories).toBeCloseTo(247.5, 1);
    expect(totals.protein).toBeCloseTo(46.5, 1);
    expect(totals.carbs).toBe(0);
    expect(totals.fat).toBeCloseTo(5.4, 1);
  });

  it("calculates combined totals for a complete meal (Arroz + Feijão + Frango)", () => {
    const meal = [
      {
        food: {
          name: "Arroz branco cozido",
          calories_per_100g: 130,
          protein_per_100g: 2.7,
          carbs_per_100g: 28.0,
          fat_per_100g: 0.2,
        },
        quantity_grams: 100,
      },
      {
        food: {
          name: "Feijão carioca cozido",
          calories_per_100g: 76,
          protein_per_100g: 4.5,
          carbs_per_100g: 13.6,
          fat_per_100g: 0.5,
        },
        quantity_grams: 100,
      },
      {
        food: {
          name: "Peito de frango grelhado",
          calories_per_100g: 165,
          protein_per_100g: 31.0,
          carbs_per_100g: 0,
          fat_per_100g: 3.6,
        },
        quantity_grams: 100,
      },
    ];

    const totals = calculateNutritionalTotals(meal);

    expect(totals.calories).toBe(371);
    expect(totals.protein).toBe(38.2);
    expect(totals.carbs).toBe(41.6);
    expect(totals.fat).toBe(4.3);
  });
});
