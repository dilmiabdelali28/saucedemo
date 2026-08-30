import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { locateField, type FieldTarget } from "@helpers/ui/common/locateField";

import { waitTableLoaded } from "./waitTableLoaded";

export type FindRowParams = {
  page: Page;
  filter: FieldTarget;
  searchValue: string;
  /** Sélecteur (ou `Locator`) de la table. Défaut : `table`. */
  table?: string | Locator;
  /** Budget total pour la cohérence éventuelle du back-end. Défaut : 90 s. */
  timeoutMs?: number;
  /** Cliquer la ligne trouvée. Défaut : `true`. */
  click?: boolean;
};

/**
 * Filtre puis attend qu'une ligne correspondante apparaisse, en ré-appliquant
 * le filtre à chaque tentative (back-end à cohérence éventuelle).
 *
 * La boucle manuelle `while (Date.now() < deadline) { … waitForTimeout(1000) }`
 * est remplacée par `expect.poll`/`toPass`, qui gère l'intervalle et le budget.
 */
export async function findRow({
  page,
  filter,
  searchValue,
  table = "table",
  timeoutMs = 90_000,
  click = true,
}: FindRowParams): Promise<Locator> {
  await waitTableLoaded(page, { table });

  const tableLocator =
    typeof table === "string" ? page.locator(table).first() : table;
  const row = tableLocator
    .locator("tbody tr")
    .filter({ hasText: searchValue })
    .first();

  await expect(async () => {
    await locateField(page, filter).fill(searchValue);
    await expect(row).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: timeoutMs });

  if (click) {
    await row.click();
  }
  return row;
}
