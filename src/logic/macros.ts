import type { Macros } from '@/types';

export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

/**
 * Sports-nutrition defaults. Athletes' protein and carbs are set per kilogram of
 * body weight (sports-nutrition guidance is roughly 1.2–2.0 g/kg protein and
 * 3–10 g/kg carbs by training load), not as a fixed percentage split.
 */
export const PROTEIN_G_PER_KG = 1.6;
export const FAT_SHARE = 0.3;
export const MIN_FAT_SHARE = 0.2;
export const MIN_CARBS_G_PER_KG = 3;

export interface MacroTargets {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/**
 * Protein at 1.6 g/kg, fat at 30 % of energy, carbs fill the rest. When that
 * leaves carbs under 3 g/kg, carbs are held at the floor and fat gives way,
 * down to 20 % of energy.
 */
export function macroTargets(kcal: number, weightKg: number): MacroTargets {
  const proteinG = Math.round(PROTEIN_G_PER_KG * weightKg);
  let fatG = Math.round((FAT_SHARE * kcal) / KCAL_PER_GRAM.fat);
  let carbsG = Math.round(
    (kcal - proteinG * KCAL_PER_GRAM.protein - fatG * KCAL_PER_GRAM.fat) /
      KCAL_PER_GRAM.carbs,
  );

  const carbFloor = Math.round(MIN_CARBS_G_PER_KG * weightKg);
  if (carbsG < carbFloor) {
    carbsG = carbFloor;
    const fatThatFits = Math.round(
      (kcal - proteinG * KCAL_PER_GRAM.protein - carbsG * KCAL_PER_GRAM.carbs) /
        KCAL_PER_GRAM.fat,
    );
    fatG = Math.max(Math.round((MIN_FAT_SHARE * kcal) / KCAL_PER_GRAM.fat), fatThatFits);
  }

  return { proteinG, carbsG, fatG };
}

export const EMPTY_MACROS: Macros = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
};

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    calories: a.calories + b.calories,
    proteinG: a.proteinG + b.proteinG,
    carbsG: a.carbsG + b.carbsG,
    fatG: a.fatG + b.fatG,
  };
}
