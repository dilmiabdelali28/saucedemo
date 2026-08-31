import { test, expect } from "@playwright/test";
import { LoginPage } from "@/pages/auth";
import { waitForRestResponse } from "@helpers/api/network/waitForRestResponse";
import { waitForResponseLike } from "@helpers/api/network/waitForResponseLike";
import users from "$fixtures/users.json";

const Pascale = users.Pascale;

test.describe("Réseau — chargement de l'app SauceDemo", () => {
  let loginPage: LoginPage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
  });

  test(
    "la connexion charge le bundle JS et une image produit en 2xx",
    { tag: ["@network", "@smoke"] },
    async ({ page }) => {
      // IMPORTANT : on arme les attentes AVANT toute navigation. `login()`
      // appelle `page.goto('/')`, donc ces réponses partent *pendant* le login.
      // Créer la promesse après coup raterait l'événement `response`.

      // waitForRestResponse — le cas courant « URL + méthode HTTP », 2xx implicite.
      const bundlePromise = waitForRestResponse(
        page,
        /\/assets\/index-.*\.js$/,
        "GET",
      );

      // waitForResponseLike — filtrage fin : statut exact + prédicat sur la requête.
      const productImagePromise = waitForResponseLike(
        page,
        /\/assets\/.*\.(jpe?g|png|webp)$/i,
        {
          method: "GET",
          status: 200, // statut exact, au lieu de la plage 2xx par défaut
          predicate: (response) =>
            response.request().resourceType() === "image",
          timeout: 20_000,
        },
      );

      await test.step("Pascale se connecte", async () => {
        await loginPage.login(Pascale.login, Pascale.password);
        await loginPage.expectLoggedIn();
      });

      await test.step("le bundle applicatif est servi", async () => {
        const bundle = await bundlePromise;
        expect(bundle.ok()).toBe(true);
        expect(bundle.headers()["content-type"]).toContain("javascript");
      });

      await test.step("une image produit est servie", async () => {
        const image = await productImagePromise;
        expect(image.status()).toBe(200);
        expect(image.headers()["content-type"]).toContain("image");
      });
    },
  );

  test(
    "waitForResponseLike capte la feuille de style via un prédicat async",
    { tag: ["@network"] },
    async ({ page }) => {
      // `saucedemo.com/assets/` matche aussi le JS et les images ; le prédicat
      // restreint au seul CSS non vide (corps déjà téléchargé côté navigateur).
      const stylesheetPromise = waitForResponseLike(page, "saucedemo.com/assets/", {
        method: "GET",
        predicate: async (response) => {
          if (response.request().resourceType() !== "stylesheet") return false;
          return (await response.text()).length > 0;
        },
      });

      await test.step("Pascale se connecte", async () => {
        await loginPage.login(Pascale.login, Pascale.password);
        await loginPage.expectLoggedIn();
      });

      const stylesheet = await stylesheetPromise;
      expect(stylesheet.ok()).toBe(true);
      expect(stylesheet.url()).toMatch(/\.css$/);
    },
  );
});
