import type { Page } from "@playwright/test";

import {
  selectFromListbox,
  type OptionBy,
} from "@helpers/ui/common/selectFromListbox";

import { waitTableLoaded } from "./waitTableLoaded";

export type FillAutocompleteFilterParams = {
  page: Page;
  /** test-id du filtre autocomplete. */
  testId: string;
  /** Valeur à saisir et à sélectionner. */
  value: string;
  /** Par défaut on tape `value` puis on choisit l'option qui contient `value`. */
  by?: OptionBy;
  /** Sélecteur de table pour l'attente post-filtre. */
  table?: string;
};

/**
 * Filtre un tableau via un champ autocomplete, puis attend le rechargement.
 * Délègue au générique {@link selectFromListbox} (fini l'import croisé
 * barrel + relatif de l'ancienne version).
 */
export async function fillAutocompleteFilter({
  page,
  testId,
  value,
  by,
  table,
}: FillAutocompleteFilterParams): Promise<void> {
  await selectFromListbox({
    page,
    trigger: { testId },
    search: value,
    by: by ?? { text: value },
  });
  await waitTableLoaded(page, { table });
}
