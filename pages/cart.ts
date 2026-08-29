import { expect, type Page, type Locator } from "@playwright/test";

/** Page panier (`/cart.html`). */
export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly cartBadge: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator(".title");
    this.cartItems = page.locator(".cart_item");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.getByRole("button", { name: "Continue Shopping" });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.title).toHaveText("Your Cart");
  }

  async expectItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectItemPresent(productName: string) {
    await expect(this.cartItems.filter({ hasText: productName })).toBeVisible();
  }

  async expectItemAbsent(productName: string) {
    await expect(this.cartItems.filter({ hasText: productName })).toHaveCount(0);
  }

  async removeItem(productName: string) {
    await this.cartItems
      .filter({ hasText: productName })
      .getByRole("button", { name: "Remove" })
      .click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator(".inventory_item_name").allTextContents();
  }

  /** Passe à la première étape du checkout (`/checkout-step-one.html`). */
  async checkout() {
    await this.checkoutButton.click();
  }
}

