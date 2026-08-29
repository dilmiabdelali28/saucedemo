import type { FullConfig } from "@playwright/test";

/**
 * Exécuté une seule fois avant toute la suite (voir `globalSetup` dans
 * playwright.config.ts). Point d'entrée pour préparer un état partagé :
 * seed de données, warm-up d'API, génération d'un storageState, etc.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const { baseURL } = config.projects[0]?.use ?? {};
  // eslint-disable-next-line no-console
  console.log(`[global-setup] démarrage de la suite — baseURL: ${baseURL ?? "(non définie)"}`);
}

export default globalSetup;
