import type { Page, Response } from "@playwright/test";

/** Défaut volontairement large : attendre du réseau est plus lent qu'attendre du DOM. */
export const DEFAULT_RESPONSE_TIMEOUT = 15_000;

export type UrlMatch = string | RegExp;

export type WaitForResponseOptions = {
  /** Filtre sur la méthode HTTP (`"GET"`, `"POST"`, …). Insensible à la casse. */
  method?: string;
  /**
   * Filtre sur le statut. Un nombre = statut exact ; une fonction = prédicat libre.
   * Par défaut : `2xx` uniquement.
   */
  status?: number | ((status: number) => boolean);
  /** Prédicat additionnel sur la réponse (corps déjà téléchargé côté navigateur). */
  predicate?: (response: Response) => boolean | Promise<boolean>;
  timeout?: number;
};

function urlMatches(url: string, match: UrlMatch): boolean {
  return typeof match === "string" ? url.includes(match) : match.test(url);
}

function statusMatches(
  status: number,
  expected: WaitForResponseOptions["status"],
): boolean {
  if (expected === undefined) {
    return status >= 200 && status < 300;
  }
  return typeof expected === "function" ? expected(status) : status === expected;
}

/**
 * Attend une réponse réseau dont l'URL correspond à `urlMatch`, avec filtres
 * optionnels sur la méthode, le statut et un prédicat libre.
 *
 * Remplace l'ancien couple `waitForResponseLike` / `waitForRestResponse` :
 *   await waitForResponseLike(page, "/api/cart");
 *   await waitForResponseLike(page, /\/orders\/\d+$/, { method: "POST", status: 201 });
 */
export async function waitForResponseLike(
  page: Page,
  urlMatch: UrlMatch,
  options: WaitForResponseOptions = {},
): Promise<Response> {
  const { method, status, predicate, timeout = DEFAULT_RESPONSE_TIMEOUT } =
    options;
  const wantedMethod = method?.toUpperCase();

  return page.waitForResponse(async (response) => {
    if (!urlMatches(response.url(), urlMatch)) {
      return false;
    }
    if (wantedMethod && response.request().method().toUpperCase() !== wantedMethod) {
      return false;
    }
    if (!statusMatches(response.status(), status)) {
      return false;
    }
    return predicate ? await predicate(response) : true;
  }, { timeout });
}
