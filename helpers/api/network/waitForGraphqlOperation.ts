import type { Page, Response } from "@playwright/test";

import {
  DEFAULT_RESPONSE_TIMEOUT,
  waitForResponseLike,
} from "./waitForResponseLike";

export type WaitForGraphqlOptions = {
  /** Fragment d'URL identifiant l'endpoint GraphQL. */
  endpoint?: string;
  /** Nom d'opération recherché dans le corps de la requête (`operationName` ou `query`). */
  operationName?: string;
  timeout?: number;
};

/**
 * Attend une réponse GraphQL `200` sur `endpoint`, optionnellement filtrée par
 * nom d'opération. L'endpoint n'est plus figé à `/graphql` et le timeout est
 * configurable.
 */
export function waitForGraphqlOperation(
  page: Page,
  options: WaitForGraphqlOptions = {},
): Promise<Response> {
  const {
    endpoint = "/graphql",
    operationName,
    timeout = DEFAULT_RESPONSE_TIMEOUT,
  } = options;

  return waitForResponseLike(page, endpoint, {
    method: "POST",
    status: 200,
    timeout,
    predicate: (response) => {
      if (!operationName) {
        return true;
      }
      return (response.request().postData() ?? "").includes(operationName);
    },
  });
}
