import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { locateField, type FieldTarget } from "@helpers/ui/common/locateField";

export type FilterTableParams = {
  page: Page;
  /** Champ de filtre (test-id / sélecteur / label / …). */
  filter: FieldTarget;
  value: string;
  /**
   * Signal indiquant que la liste s'est rafraîchie : `Locator` à voir
   * apparaître, ou `Promise` (ex. `waitForResponseLike`). Préférer ceci à
   * `debounceMs` dès qu'un signal fiable existe.
   */
  settle?: Locator | Promise<unknown>;
  /**
   * Dernier recours : pause fixe pour absorber un debounce sans signal
   * observable. Défaut : `0` (l'ancien helper imposait 600 ms à chaque appel).
   */
  debounceMs?: number;
  timeout?: number;
};

/** Saisit une valeur dans un champ de filtre de tableau, puis attend le rafraîchissement. */
export async function filterTable({
  page,
  filter,
  value,
  settle,
  debounceMs = 0,
  timeout,
}: FilterTableParams): Promise<void> {
  const input = locateField(page, filter);
  await expect(input).toBeVisible({ timeout });
  await input.fill(value);

  if (settle) {
    await ("then" in settle ? settle : expect(settle).toBeVisible({ timeout }));
  } else if (debounceMs > 0) {
    await page.waitForTimeout(debounceMs);
  }
}
