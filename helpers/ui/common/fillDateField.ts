import type { Page } from "@playwright/test";

import {
  locateField,
  locateInput,
  type FieldTarget,
  type LocateInputOptions,
} from "./locateField";

export type FillDateFieldParams = LocateInputOptions & {
  page: Page;
  target: FieldTarget;
  /** `Date` ou chaîne. Les `-` et `.` sont normalisés vers `separator`. */
  value: Date | string;
  /** Séparateur attendu par le champ. Défaut : `/`. */
  separator?: string;
  /**
   * Saisie caractère par caractère — indispensable pour les champs à masque.
   * Défaut : `true` (comportement historique). Passer `false` pour un `fill()` direct.
   */
  sequential?: boolean;
  delay?: number;
};

/** `dd${sep}MM${sep}yyyy` à partir d'une `Date` (heure locale du runner). */
function formatDMY(date: Date, separator: string): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return [day, month, date.getFullYear()].join(separator);
}

/**
 * Remplit un champ date. Accepte un `Date` (formaté en `dd/MM/yyyy`) ou une
 * chaîne déjà formatée dont on normalise juste le séparateur — fini le
 * `formatDate()` qui produit des `-` pour que l'appelant les remplace ensuite.
 */
export async function fillDateField({
  page,
  target,
  value,
  separator = "/",
  sequential = true,
  delay = 30,
  inputSelector,
  inputIndex,
  useNestedInput,
}: FillDateFieldParams): Promise<void> {
  const text =
    value instanceof Date
      ? formatDMY(value, separator)
      : value.replace(/[-.]/g, separator);

  const input = await locateInput(locateField(page, target), {
    inputSelector,
    inputIndex,
    useNestedInput,
  });

  await input.click();
  await input.clear();
  if (sequential) {
    await input.pressSequentially(text, { delay });
  } else {
    await input.fill(text);
  }
  await input.blur();
  await input.press("Escape");
}
