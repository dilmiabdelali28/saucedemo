import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import {
  locateField,
  locateInput,
  type FieldTarget,
  type LocateInputOptions,
} from "./locateField";

export type FillFieldParams = LocateInputOptions & {
  page: Page;
  target: FieldTarget;
  value: string;
  /** Vide le champ avant de saisir. */
  clear?: boolean;
  /** Assertion `toBeVisible` avant saisie (utile si le champ apparaît en asynchrone). */
  assertVisible?: boolean;
  /**
   * Saisie caractère par caractère (`pressSequentially`) — nécessaire pour
   * certains inputs masqués. Défaut : `fill()`, plus rapide et plus fiable.
   */
  sequential?: boolean;
  /** Délai entre frappes quand `sequential` est actif. */
  delay?: number;
};

/**
 * Remplit un champ ciblé par test-id / sélecteur / name / label / placeholder.
 * Le ciblage passe désormais par un objet `target` typé (union discriminée)
 * au lieu de cinq champs optionnels mutuellement exclusifs.
 */
export async function fillField({
  page,
  target,
  value,
  clear = false,
  assertVisible = false,
  sequential = false,
  delay,
  inputSelector,
  inputIndex,
  useNestedInput,
}: FillFieldParams): Promise<void> {
  const input = await locateInput(locateField(page, target), {
    inputSelector,
    inputIndex,
    useNestedInput,
  });

  if (assertVisible) {
    await expect(input).toBeVisible();
  }
  if (clear) {
    await input.clear();
  }
  if (sequential) {
    await input.pressSequentially(value, { delay });
  } else {
    await input.fill(value);
  }
}
