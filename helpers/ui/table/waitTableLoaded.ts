import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type WaitTableLoadedOptions = {
  /** Sélecteur (ou `Locator`) de la table. Défaut : `table`. */
  table?: string | Locator;
  /**
   * Sélecteur des indicateurs de chargement à voir disparaître.
   * Défaut : attributs ARIA / data standards — plus de dépendance à la classe
   * Tailwind `animate-pulse` ni à un `xpath=ancestor::div[1]` fragile.
   */
  busySelector?: string;
  timeout?: number;
};

const DEFAULT_BUSY_SELECTOR =
  '[aria-busy="true"], [data-loading="true"], [data-state="loading"]';

/** Attend que la table soit visible et qu'aucun indicateur de chargement ne subsiste. */
export async function waitTableLoaded(
  page: Page,
  { table = "table", busySelector = DEFAULT_BUSY_SELECTOR, timeout = 30_000 }:
    WaitTableLoadedOptions = {},
): Promise<void> {
  const tableLocator =
    typeof table === "string" ? page.locator(table).first() : table;

  await expect(tableLocator).toBeVisible({ timeout });
  await expect(page.locator(busySelector)).toHaveCount(0, { timeout });
}
