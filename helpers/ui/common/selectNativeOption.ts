import type { Page } from "@playwright/test";

import { locateField, type FieldTarget } from "./locateField";

/** Forme objet acceptée par `<select>.selectOption` (sélection simple). */
export type NativeOptionBy =
  | { value: string }
  | { label: string }
  | { index: number };

/**
 * Sélectionne une option d'un `<select>` natif.
 * (Tri produits SauceDemo :
 *  `selectNativeOption(page, { testId: "product-sort-container" }, { value: "lohi" })`.)
 *
 * Pour de la sélection multiple, utiliser directement `locator.selectOption([...])`.
 */
export async function selectNativeOption(
  page: Page,
  target: FieldTarget,
  by: NativeOptionBy,
): Promise<void> {
  await locateField(page, target).selectOption(by);
}
