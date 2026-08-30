import type { Page, Response } from "@playwright/test";

import {
  DEFAULT_RESPONSE_TIMEOUT,
  waitForResponseLike,
  type UrlMatch,
} from "./waitForResponseLike";

/**
 * Sucre syntaxique pour le cas courant « une réponse REST identifiée par URL + méthode ».
 * `timeout` est optionnel (défaut : {@link DEFAULT_RESPONSE_TIMEOUT}) — l'ancienne
 * signature le rendait obligatoire pour rien.
 */
export function waitForRestResponse(
  page: Page,
  urlPattern: UrlMatch,
  method: string,
  timeout: number = DEFAULT_RESPONSE_TIMEOUT,
): Promise<Response> {
  return waitForResponseLike(page, urlPattern, { method, timeout });
}
