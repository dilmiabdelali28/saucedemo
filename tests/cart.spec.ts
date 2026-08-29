import { test, expect } from '@playwright/test';
import { LoginPage } from '@/pages/auth';
import { InventoryPage } from '@/pages/inventory';
import { CartPage } from '@/pages/cart';
import users from '$fixtures/users.json';

const Pascale = users.Pascale;

test.describe('Panier', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    await test.step('Pascale se connecte et accède à la boutique', async () => {
      await loginPage.login(Pascale.login, Pascale.password);
      await loginPage.expectLoggedIn();
    });
  });

  test(
    'ajouter un produit au panier met à jour le compteur',
    { tag: ['@smoke', '@cart'] },
    async () => {
      await test.step('Pascale ajoute le Sauce Labs Backpack au panier', async () => {
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
      });

      await test.step('le compteur du panier affiche 1 article', async () => {
        await inventoryPage.expectCartCount(1);
      });
    },
  );

  test(
    'ajouter plusieurs produits au panier',
    { tag: ['@cart', '@smoke'] },
    async () => {
      await test.step('Pascale ajoute deux produits au panier', async () => {
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
      });

      await test.step('le compteur du panier affiche 2 articles', async () => {
        await inventoryPage.expectCartCount(2);
      });
    },
  );

  test(
    'consulter le panier affiche les produits ajoutés',
    { tag: ['@smoke', '@cart'] },
    async () => {
      await test.step('Pascale ajoute deux produits au panier', async () => {
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
      });

      await test.step('elle ouvre le panier', async () => {
        await inventoryPage.openCart();
      });

      await test.step('le panier liste les deux produits ajoutés', async () => {
        await cartPage.expectLoaded();
        await cartPage.expectItemCount(2);
        await cartPage.expectItemPresent('Sauce Labs Backpack');
        await cartPage.expectItemPresent('Sauce Labs Bike Light');
        expect(await cartPage.getItemNames()).toEqual([
          'Sauce Labs Backpack',
          'Sauce Labs Bike Light',
        ]);
      });
    },
  );

  test(
    'le panier est vide par défaut',
    { tag: ['@cart', '@smoke'] },
    async () => {
      await test.step('Pascale ouvre le panier sans rien avoir ajouté', async () => {
        await inventoryPage.openCart();
      });

      await test.step('le panier est vide', async () => {
        await cartPage.expectLoaded();
        await cartPage.expectItemCount(0);
      });
    },
  );

  test(
    'ajouter puis retirer un produit depuis la page produits',
    { tag: ['@cart', '@smoke'] },
    async () => {
      await test.step('Pascale ajoute le Sauce Labs Backpack', async () => {
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.expectProductAdded('Sauce Labs Backpack');
        await inventoryPage.expectCartCount(1);
      });

      await test.step('elle retire le produit depuis la page produits', async () => {
        await inventoryPage.removeProductFromCart('Sauce Labs Backpack');
        await inventoryPage.expectProductNotAdded('Sauce Labs Backpack');
        await inventoryPage.expectCartCount(0);
      });
    },
  );

  test(
    'retirer un seul produit parmi plusieurs met à jour le compteur',
    { tag: ['@cart', '@smoke'] },
    async () => {
      await test.step('Pascale ajoute deux produits au panier', async () => {
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
        await inventoryPage.expectCartCount(2);
      });

      await test.step('elle retire le Sauce Labs Backpack', async () => {
        await inventoryPage.removeProductFromCart('Sauce Labs Backpack');
      });

      await test.step('seul le Sauce Labs Bike Light reste au panier', async () => {
        await inventoryPage.expectProductNotAdded('Sauce Labs Backpack');
        await inventoryPage.expectProductAdded('Sauce Labs Bike Light');
        await inventoryPage.expectCartCount(1);
      });
    },
  );

  test(
    'le bouton bascule entre "Add to cart" et "Remove"',
    { tag: ['@cart', '@smoke'] },
    async () => {
      await test.step('Pascale ajoute le produit via le bouton', async () => {
        await inventoryPage.toggleProduct('Sauce Labs Backpack');
        await inventoryPage.expectProductAdded('Sauce Labs Backpack');
        await inventoryPage.expectCartCount(1);
      });

      await test.step('un second clic retire le produit', async () => {
        await inventoryPage.toggleProduct('Sauce Labs Backpack');
        await inventoryPage.expectProductNotAdded('Sauce Labs Backpack');
        await inventoryPage.expectCartCount(0);
      });
    },
  );

  test(
    'retirer un produit depuis la page panier',
    { tag: ['@smoke', '@cart'] },
    async () => {
      await test.step('Pascale ajoute deux produits et ouvre le panier', async () => {
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
        await inventoryPage.openCart();
        await cartPage.expectLoaded();
        await cartPage.expectItemCount(2);
      });

      await test.step('elle retire le Sauce Labs Backpack depuis le panier', async () => {
        await cartPage.removeItem('Sauce Labs Backpack');
      });

      await test.step('seul le Sauce Labs Bike Light reste au panier', async () => {
        await cartPage.expectItemAbsent('Sauce Labs Backpack');
        await cartPage.expectItemPresent('Sauce Labs Bike Light');
        await cartPage.expectItemCount(1);
      });
    },
  );

  test(
    'retirer depuis le panier se reflète sur la page produits',
    { tag: ['@cart', '@smoke'] },
    async () => {
      await test.step('Pascale ajoute un produit puis le retire depuis le panier', async () => {
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.openCart();
        await cartPage.removeItem('Sauce Labs Backpack');
      });

      await test.step('de retour sur la page produits, le produit ne figure plus au panier', async () => {
        await cartPage.continueShopping();
        await inventoryPage.expectLoaded();
        await inventoryPage.expectProductNotAdded('Sauce Labs Backpack');
        await inventoryPage.expectCartCount(0);
      });
    },
  );
});
