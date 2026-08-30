import type { Page } from "@playwright/test";

export type EnsureAppShellOptions = {
  /** URL de repli si le marqueur n'apparaît pas au premier essai. */
  url: string;
  /** Sélecteur du marqueur prouvant que le shell est monté. Défaut : `[data-testid="app-header"]`. */
  marker?: string;
  /** Attente par essai. Défaut : 15 s. */
  timeout?: number;
};

/**
 * Garantit que le shell applicatif est monté : attend `marker`, et si absent,
 * fait un `goto(url)` puis ré-attend une seule fois.
 *
 * Le sélecteur du marqueur et le timeout sont désormais paramétrables
 * (avant : `[data-testid="app-header"]` et `15000` codés en dur).
 */
export async function ensureAppShell(
  page: Page,
  { url, marker = '[data-testid="app-header"]', timeout = 15_000 }: EnsureAppShellOptions,
): Promise<void> {
  const header = page.locator(marker).first();
  try {
    await header.waitFor({ state: "visible", timeout });
  } catch {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await header.waitFor({ state: "visible", timeout });
  }
}
