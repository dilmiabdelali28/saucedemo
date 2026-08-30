import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { locateField, type FieldTarget } from "./locateField";

/** Comment désigner l'option à choisir dans la liste ouverte. */
export type OptionBy =
  | { text: string } // option contenant ce texte
  | { exactText: string } // option dont le texte est exactement celui-ci
  | { index: number } // n-ième option visible
  | { dataValue: string | number }; // option portant [data-value="…"]

export type SelectFromListboxParams = {
  page: Page;
  /** Élément déclencheur (bouton / combobox). */
  trigger: FieldTarget;
  by: OptionBy;
  /**
   * Texte à taper pour filtrer avant sélection. L'input est cherché dans le
   * `trigger`, ou via `searchInput` si fourni.
   */
  search?: string;
  searchInput?: FieldTarget;
  clearSearch?: boolean;
  /** Sélecteur des options. Défaut : le pattern ARIA standard. */
  optionSelector?: string;
  /**
   * Signal d'attente quand les options se chargent en asynchrone : soit un
   * `Locator` à voir apparaître, soit une `Promise` (ex. `waitForResponseLike`).
   * Remplace les `page.waitForTimeout(1000)` de l'ancienne implémentation.
   */
  settle?: Locator | Promise<unknown>;
  /** Ferme la liste après sélection (`Escape`). */
  closeOnSelect?: boolean;
  timeout?: number;
};

const DEFAULT_OPTION_SELECTOR = '[role="listbox"] [role="option"], [role="option"]';

function pickOption(
  page: Page,
  optionSelector: string,
  by: OptionBy,
): Locator {
  if ("dataValue" in by) {
    return page.locator(`[data-value="${by.dataValue}"]`).first();
  }
  if ("index" in by) {
    return page.locator(optionSelector).nth(by.index);
  }
  if ("exactText" in by) {
    return page
      .locator(optionSelector)
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(by.exactText)}\\s*$`) })
      .first();
  }
  return page.locator(optionSelector).filter({ hasText: by.text }).first();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Sélectionne une option dans un widget de type combobox/listbox ARIA
 * (MUI, react-select, shadcn, Headless UI… tant qu'il respecte les rôles).
 *
 * Remplace `selectDropdownList` : plus de branches spécifiques par librairie,
 * plus de constante `TICKET_BUILDING_OPTION_INDEX`, plus d'attentes fixes.
 * Pour un `<select>` natif, utiliser {@link selectNativeOption}.
 */
export async function selectFromListbox({
  page,
  trigger,
  by,
  search,
  searchInput,
  clearSearch = false,
  optionSelector = DEFAULT_OPTION_SELECTOR,
  settle,
  closeOnSelect = false,
  timeout,
}: SelectFromListboxParams): Promise<void> {
  const triggerLocator = locateField(page, trigger);
  await triggerLocator.click();

  if (search !== undefined) {
    const input = searchInput
      ? locateField(page, searchInput)
      : triggerLocator.locator("input").first();
    if (clearSearch) {
      await input.fill("");
    }
    await input.fill(search);
  }

  if (settle) {
    await ("then" in settle
      ? settle
      : expect(settle).toBeVisible({ timeout }));
  }

  const option = pickOption(page, optionSelector, by);
  await expect(option).toBeVisible({ timeout });
  await option.click();

  if (closeOnSelect) {
    await page.keyboard.press("Escape").catch(() => undefined);
  }
}
