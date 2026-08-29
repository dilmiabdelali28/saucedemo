import { expect, type Page, type Locator } from "@playwright/test";

export type SortOption = "az" | "za" | "lohi" | "hilo";

/** Page liste des produits (`/inventory.html`). */
export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator(".title");
    this.inventoryList = page.locator(".inventory_list");
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator(".shopping_cart_link");
    this.cartBadge = page.locator(".shopping_cart_badge");
  }

  private itemContainer(productName: string): Locator {
    return this.page.locator(".inventory_item").filter({ hasText: productName });
  }

  private addButton(productName: string): Locator {
    return this.itemContainer(productName).getByRole("button", { name: "Add to cart" });
  }

  private removeButton(productName: string): Locator {
    return this.itemContainer(productName).getByRole("button", { name: "Remove" });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText("Products");
  }

  /**
   * Ajoute au panier un ou plusieurs produits. Accepte les deux styles :
   *   addProductToCart("Sauce Labs Backpack")
   *   addProductToCart("Sauce Labs Backpack", "Sauce Labs Bike Light")
   *   addProductToCart(Object.values(products))
   */
  async addProductToCart(...products: Array<string | string[]>) {
    for (const productName of products.flat()) {
      await this.addButton(productName).click();
    }
  }

  async removeProductFromCart(productName: string) {
    await this.removeButton(productName).click();
  }

  /** Ajoute le produit s'il ne l'est pas, le retire s'il l'est déjà. */
  async toggleProduct(productName: string) {
    if (await this.removeButton(productName).isVisible()) {
      await this.removeProductFromCart(productName);
    } else {
      await this.addProductToCart(productName);
    }
  }

  async sortBy(option: SortOption) {
    await this.sortDropdown.selectOption(option);
  }

  async productNames(): Promise<string[]> {
    return this.inventoryList.locator(".inventory_item_name").allTextContents();
  }

  async productPrices(): Promise<number[]> {
    const raw = await this.inventoryList
      .locator(".inventory_item_price")
      .allTextContents();
    return raw.map((text) => Number(text.replace(/[^0-9.]/g, "")));
  }

  async expectProductAdded(productName: string) {
    await expect(this.removeButton(productName)).toBeVisible();
    await expect(this.addButton(productName)).toBeHidden();
  }

  async expectProductNotAdded(productName: string) {
    await expect(this.addButton(productName)).toBeVisible();
    await expect(this.removeButton(productName)).toBeHidden();
  }

  async expectCartCount(count: number) {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async openCart() {
    await this.cartLink.click();
  }
}

