import { test, expect } from "@playwright/test";
import { LoginPage } from "@/pages/auth";
import { InventoryPage } from "@/pages/inventory";
import { CartPage } from "@/pages/cart";
import { CheckoutPage } from "@/pages/checkout";
import users from "$fixtures/users.json";

const Pascale = users.Pascale;

test.describe("Sauce Demo — parcours avancés", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await test.step("Pascale se connecte et accède à la boutique", async () => {
      await loginPage.login(Pascale.login, Pascale.password);
      await loginPage.expectLoggedIn();
    });
  });

  // Jeu de données (JDD) consommé par les tests ci-dessous.
  const products = {
    backpack: "Sauce Labs Backpack",
    bikeLight: "Sauce Labs Bike Light",
    boltTshirt: "Sauce Labs Bolt T-Shirt",
  };
  const customer = {
    firstName: "Pascale",
    lastName: "Test",
    postalCode: "75001",
  };

  test(
    "parcours de commande complet jusqu'à la confirmation",
    { tag: ["@smoke", "@e2e"] },
    async () => {
      await test.step("il ajoute trois produits au panier", async () => {
        await inventoryPage.addProductToCart(
          products.backpack,
          products.bikeLight,
          products.boltTshirt,
        );
        await expect(inventoryPage.cartBadge).toHaveText("3");
      });

      await test.step("il ouvre le panier qui contient les trois articles", async () => {
        await inventoryPage.openCart();
        await cartPage.expectLoaded();
        await expect(cartPage.cartItems).toHaveCount(3);
      });

      await test.step("il finalise la commande", async () => {
        await cartPage.checkout();
        await checkoutPage.complete(customer);
      });

      await test.step("la commande est confirmée", async () => {
        await checkoutPage.expectConfirmed();
      });
    },
  );

  test(
    "le tri par prix croissant ordonne bien les produits",
    { tag: ["@smoke"] },
    async () => {
      await test.step("il trie par prix croissant (low to high)", async () => {
        await inventoryPage.sortBy("lohi");
      });

      await test.step("les prix sont bien triés du plus bas au plus haut", async () => {
        const prices = await inventoryPage.productPrices();
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
      });
    },
  );

  test(
    "le tri par nom décroissant (Z à A) ordonne bien les produits",
    { tag: ["@smoke"] },
    async () => {
      await inventoryPage.sortBy("za");
      const names = await inventoryPage.productNames();
      const sorted = [...names].sort().reverse();
      expect(names).toEqual(sorted);
    },
  );

  test(
    "retirer un article depuis le panier met à jour le badge",
    { tag: ["@smoke"] },
    async () => {
      await test.step("il ajoute deux articles", async () => {
        await inventoryPage.addProductToCart(products.backpack, products.boltTshirt);
        await expect(inventoryPage.cartBadge).toHaveText("2");
      });

      await test.step("il retire un article dans le panier", async () => {
        await inventoryPage.openCart();
        await cartPage.removeItem(products.backpack);
      });

      await test.step("le panier ne contient plus qu'un article", async () => {
        await expect(cartPage.cartItems).toHaveCount(1);
        await expect(cartPage.cartBadge).toHaveText("1");
      });
    },
  );

  test(
    "le checkout refuse un formulaire incomplet",
    { tag: ["@smoke"] },
    async () => {
      await inventoryPage.addProductToCart(products.backpack);
      await inventoryPage.openCart();
      await cartPage.checkout();

      await test.step("il continue sans renseigner le nom", async () => {
        await checkoutPage.continue();
      });

      await test.step("un message d'erreur signale le champ manquant", async () => {
        await checkoutPage.expectInfoError("First Name is required");
      });
    },
  );

  test(
    "la déconnexion ramène à la page de login",
    { tag: ["@smoke"] },
    async ({ page }) => {
      await loginPage.logout();
      await expect(page).toHaveURL("/");
      await expect(loginPage.loginButton).toBeVisible();
    },
  );
});
