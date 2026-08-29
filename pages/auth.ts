import { expect, type Page, type Locator } from "@playwright/test";

/** Page de login (`/`). Porte aussi logout et la vérification post-login. */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.locator('[data-test="error"]');
    this.burgerMenuButton = page.locator("#react-burger-menu-btn");
    this.logoutLink = page.locator("#logout_sidebar_link");
    this.pageTitle = page.locator(".title");
  }

  async goto() {
    await this.page.goto("/");
  }

  /** Ouvre la page de login puis soumet les identifiants. */
  async login(username: string, password: string) {
    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  /**
   * Vérifie que la connexion a abouti : URL de la page produits chargée.
   * Volontairement sans dépendance vers le domaine `inventory`.
   */
  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.pageTitle).toHaveText("Products");
  }

  /**
   * Ouvre le menu latéral puis clique sur « Logout ».
   * Ramène l'utilisateur sur la page de login.
   */
  async logout() {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }
}

