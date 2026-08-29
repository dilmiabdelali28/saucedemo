import { expect, type Page, type Locator } from "@playwright/test";

export type Customer = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

/**
 * Tunnel de checkout SauceDemo, des trois étapes :
 *   1. informations client   (`/checkout-step-one.html`)
 *   2. récapitulatif          (`/checkout-step-two.html`)
 *   3. confirmation           (`/checkout-complete.html`)
 */
export class CheckoutPage {
  readonly page: Page;

  // Étape 1 — informations client
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // Étape 2 — récapitulatif
  readonly cartItems: Locator;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;

  // Étape 3 — confirmation
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');

    this.cartItems = page.locator(".cart_item");
    this.itemTotal = page.locator(".summary_subtotal_label");
    this.tax = page.locator(".summary_tax_label");
    this.total = page.locator(".summary_total_label");
    this.finishButton = page.locator('[data-test="finish"]');

    this.completeHeader = page.locator(".complete-header");
    this.completeText = page.locator(".complete-text");
    this.backHomeButton = page.locator('[data-test="back-to-products"]');

    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  // --- Étape 1 : informations client -----------------------------------------

  async expectInfoLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }

  /** Renseigne le formulaire puis passe à l'étape suivante. */
  async fillInfo(customer: Customer) {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.postalCode.fill(customer.postalCode);
    await this.continue();
  }

  async continue() {
    await this.continueButton.click();
  }

  async expectInfoError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  // --- Étape 2 : récapitulatif ---------------------------------------------------

  async expectOverviewLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  async finish() {
    await this.finishButton.click();
  }

  // --- Étape 3 : confirmation -------------------------------------------------

  async expectCompleteLoaded() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }

  async expectConfirmed() {
    await this.expectCompleteLoaded();
    await expect(this.completeHeader).toHaveText("Thank you for your order!");
  }

  // --- Tunnel complet ------------------------------------------------------------

  /**
   * Depuis l'étape 1 (bouton « Checkout » déjà cliqué), renseigne les
   * informations client et valide la commande jusqu'à la confirmation.
   */
  async complete(customer: Customer) {
    await this.fillInfo(customer);
    await this.finish();
  }
}
