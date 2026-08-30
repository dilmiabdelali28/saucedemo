import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Texte (trimé) de la première cellule dont le `data-testid` commence par
 * `dataTestIdPrefix`. `scope` restreint la recherche à un conteneur / une ligne.
 */
export async function textFromFirstCellByPrefix(
  page: Page,
  dataTestIdPrefix: string,
  scope?: Locator,
): Promise<string> {
  const root = scope ?? page;
  const cell = root.locator(`[data-testid^="${dataTestIdPrefix}"]`).first();
  await expect(cell).toBeVisible();
  return (await cell.innerText()).trim();
}
