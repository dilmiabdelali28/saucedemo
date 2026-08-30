import type { Page } from "@playwright/test";

export type GotoParams = {
  page: Page;
  path: string;
  /**
   * Base explicite. Optionnel : sans elle, `path` est passé tel quel à
   * `page.goto`, qui le résout contre le `baseURL` de la config Playwright.
   */
  baseUrl?: string;
  waitUntil?: "commit" | "domcontentloaded" | "load" | "networkidle";
};

/** Navigue vers `path`, résolu contre `baseUrl` si fourni, sinon contre la config. */
export async function goto({
  page,
  path,
  baseUrl,
  waitUntil = "domcontentloaded",
}: GotoParams): Promise<void> {
  const url = baseUrl ? new URL(path, baseUrl).toString() : path;
  await page.goto(url, { waitUntil });
}
