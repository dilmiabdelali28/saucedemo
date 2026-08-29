import { test } from '@playwright/test';
import { LoginPage } from '@/pages/auth';
import users from '$fixtures/users.json';

const Pascale = users.Pascale;
const Bloque = users.Bloque;

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page);
  });

  test(
    'connexion réussie avec Pascale',
    { tag: ['@smoke', '@auth'] },
    async () => {
      await test.step('Pascale saisit ses identifiants valides', async () => {
        await loginPage.login(Pascale.login, Pascale.password);
      });

      await test.step('elle arrive connectée sur la page produits', async () => {
        await loginPage.expectLoggedIn();
      });
    },
  );

  test(
    'échec de connexion avec un mot de passe invalide',
    { tag: ['@auth', '@regression'] },
    async () => {
      await test.step('Pascale saisit un mot de passe erroné', async () => {
        await loginPage.login(Pascale.login, 'wrong_password');
      });

      await test.step('un message signale que les identifiants ne correspondent à aucun compte', async () => {
        await loginPage.expectLoginError(
          'Username and password do not match any user in this service',
        );
      });
    },
  );

  test(
    'échec de connexion avec un utilisateur bloqué',
    { tag: ['@auth', '@regression'] },
    async () => {
      await test.step('un utilisateur verrouillé tente de se connecter', async () => {
        await loginPage.login(Bloque.login, Bloque.password);
      });

      await test.step('un message indique que le compte a été bloqué', async () => {
        await loginPage.expectLoginError('Sorry, this user has been locked out');
      });
    },
  );
});
