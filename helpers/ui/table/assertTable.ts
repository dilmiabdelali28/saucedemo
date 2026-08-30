import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

function resolveTable(page: Page, table: string | Locator = "table"): Locator {
  return typeof table === "string" ? page.locator(table).first() : table;
}

/** Chaque libellé de colonne est visible dans un `<th>`. */
export async function assertColumnsVisible(
  page: Page,
  columns: string[],
  table?: string | Locator,
): Promise<void> {
  const head = resolveTable(page, table).locator("thead");
  for (const column of columns) {
    await expect(
      head.locator("th", { hasText: column }).first(),
    ).toBeVisible();
  }
}

/** Chaque filtre (ciblé par test-id) est visible. */
export async function assertFiltersVisible(
  page: Page,
  dataTestIds: string[],
): Promise<void> {
  for (const id of dataTestIds) {
    await expect(page.getByTestId(id).first()).toBeVisible();
  }
}

/**
 * La table contient au moins une ligne de données.
 * Web-first : `not.toHaveCount(0)` réessaie pendant que la table charge,
 * contrairement à l'ancien `expect(await …count()).toBeGreaterThan(0)`.
 */
export async function assertTableNotEmpty(
  page: Page,
  table?: string | Locator,
): Promise<void> {
  await expect(resolveTable(page, table).locator("tbody tr")).not.toHaveCount(0);
}

/** La table compte exactement `count` lignes de données. */
export async function assertRowCount(
  page: Page,
  count: number,
  table?: string | Locator,
): Promise<void> {
  await expect(resolveTable(page, table).locator("tbody tr")).toHaveCount(count);
}

/** Au moins une ligne contient `text`. */
export async function assertRowContains(
  page: Page,
  text: string,
  table?: string | Locator,
): Promise<void> {
  await expect(
    resolveTable(page, table).locator("tbody tr").filter({ hasText: text }).first(),
  ).toBeVisible();
}
