import type { Locator, Page } from "@playwright/test";

/**
 * Stratégie de ciblage d'un champ. Union discriminée : exactement une clé,
 * vérifiée à la compilation — plus de `selector!` ni de `throw` sur cas oublié.
 */
export type FieldTarget =
  | { testId: string }
  | { selector: string }
  | { name: string }
  | { label: string | RegExp }
  | { placeholder: string | RegExp };

export type LocateInputOptions = {
  /** Sélecteur de l'`<input>` réel à l'intérieur du composant conteneur. */
  inputSelector?: string;
  /** Index si plusieurs inputs correspondent. */
  inputIndex?: number;
  /** `false` pour piloter directement l'élément ciblé (pas d'input imbriqué). */
  useNestedInput?: boolean;
};

/** Résout un {@link FieldTarget} en `Locator` (premier élément correspondant). */
export function locateField(page: Page, target: FieldTarget): Locator {
  if ("testId" in target) {
    return page.getByTestId(target.testId);
  }
  if ("selector" in target) {
    return page.locator(target.selector).first();
  }
  if ("name" in target) {
    return page.locator(`[name="${target.name}"]`).first();
  }
  if ("label" in target) {
    return page.getByLabel(target.label).first();
  }
  return page.getByPlaceholder(target.placeholder).first();
}

/**
 * Descend jusqu'à l'`<input>` réel. Si le conteneur n'en contient aucun,
 * renvoie le conteneur lui-même (composant qui fait office d'input).
 */
export async function locateInput(
  field: Locator,
  {
    inputSelector = "input",
    inputIndex = 0,
    useNestedInput = true,
  }: LocateInputOptions = {},
): Promise<Locator> {
  if (!useNestedInput) {
    return field;
  }
  const inputs = field.locator(inputSelector);
  return (await inputs.count()) === 0 ? field : inputs.nth(inputIndex);
}
