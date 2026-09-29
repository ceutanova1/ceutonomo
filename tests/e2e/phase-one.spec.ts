import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const openReadyApp = async (page: Page) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-interface-ready", "true");
};

test("dashboard reconciles the seeded Ceuta autónomo scenario", async ({ page }) => {
  await openReadyApp(page);
  await expect(page.getByRole("heading", { name: "Tu actividad en Ceuta, explicada euro a euro." })).toBeVisible();
  const summary = page.getByRole("region", { name: "Resumen económico del escenario" });
  await expect(summary).toContainText("75.600");
  await expect(summary).toContainText("61.002");
  await expect(summary).toContainText("11.999");
  await expect(summary).toContainText("3309");
  await expect(summary).toContainText("No incluye ayudas de pago único");
  await expect(page.getByText("Gasto fiscal 2026 de difícil justificación")).toBeVisible();
});

test("incompatible dependent-worker reduction removes the special expense", async ({ page }) => {
  await openReadyApp(page);
  await page.getByRole("checkbox", { name: /Aplico la reducción incompatible/ }).check();
  const ledger = page.getByRole("region", { name: "Cuenta económica" });
  await expect(ledger).toContainText(/Gasto fiscal 2026 de difícil justificación[\s\S]*0/);
  await expect(ledger).toContainText("IRPF final estimado: 8359");
});

test("eligibility never upgrades missing facts to eligibility", async ({ page }) => {
  await openReadyApp(page);
  await page.getByRole("button", { name: "Elegibilidad" }).click();
  await page.locator(".stepper button").nth(3).click();
  await expect(page.getByText("5 reglas evaluadas")).toBeVisible();
  const aid = page.getByRole("heading", { name: "Apoyo directo a empresas y profesionales de Ceuta" }).locator("xpath=ancestor::article");
  await expect(aid).toContainText("Faltan datos");
  await expect(aid).toContainText("Afectación negativa por la crisis migratoria declarada");
  await expect(aid).toContainText("Alta censal anterior al 3 de septiembre de 2026");
});

test("CEUTONOMO stores the anonymous scenario locally with explicit cookie choice", async ({ page }) => {
  await openReadyApp(page);
  await expect(page).toHaveTitle(/CEUTONOMO/);
  await page.getByRole("button", { name: "Guardar en este dispositivo" }).click();
  await expect(page.getByRole("button", { name: "Escenario guardado" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.localStorage.getItem("ceutaunomo-scenario-v1")))).toBe(true);
  await page.getByRole("button", { name: "Solo esenciales" }).click();
  await expect(page.getByRole("complementary", { name: "Preferencias de cookies" })).toBeHidden();
});

test("company comparison separates retained profit from personal net income", async ({ page }) => {
  await openReadyApp(page);
  await page.getByRole("button", { name: "Autónomo vs SL" }).click();
  await expect(page.getByRole("heading", { name: "Autónomo y SL no guardan el dinero en el mismo bolsillo." })).toBeVisible();
  await expect(page.getByText("37.450 €")).toBeVisible();
  await expect(page.getByText(/IRPF personal, RETA societario y posibles dividendos aún no se suman/)).toBeVisible();
});

test("language, theme and ebook roadmap preferences are available", async ({ page }) => {
  await openReadyApp(page);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your Ceuta business, explained euro by euro." })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Ebook", exact: true }).click();
  await expect(page.getByRole("heading", { name: "From simulation to a guide you can keep." })).toBeVisible();
  await expect(page.getByText("Payment and download will only be enabled in the final phase.")).toBeVisible();
});

test("phase one views are functional and share eligibility state", async ({ page }) => {
  await openReadyApp(page);
  const cookieButton = page.getByRole("button", { name: "Solo esenciales" });
  if (await cookieButton.isVisible()) await cookieButton.click();

  await page.getByRole("button", { name: "Elegibilidad" }).click();
  await expect(page.getByRole("heading", { name: "Primero los hechos. Después, los beneficios." })).toBeVisible();
  await page.getByRole("group", { name: "¿Resides efectivamente en Ceuta?" }).getByRole("button", { name: "No" }).click();

  await page.getByRole("button", { name: "Beneficios" }).click();
  await expect(page.getByRole("heading", { name: "Solo ventajas que pueden explicarse y acreditarse." })).toBeVisible();
  await expect(page.getByText("El perfil no declara residencia efectiva en Ceuta.").first()).toBeVisible();

  await page.getByRole("button", { name: "Simulador" }).click();
  await expect(page.getByRole("heading", { name: "Un escenario. Un único resultado en toda la aplicación." })).toBeVisible();
  await expect(page.getByText(/Residencia en Ceuta: no/)).toBeVisible();

  await page.getByRole("button", { name: "Ayudas" }).click();
  await expect(page.getByRole("heading", { name: "Convocatorias, plazos y condiciones antes de actuar." })).toBeVisible();
  await page.getByRole("button", { name: "Hoja de ruta" }).click();
  await expect(page.getByRole("heading", { name: "Del escenario a una decisión documentada." })).toBeVisible();
  await page.getByRole("button", { name: "Fuentes" }).click();
  await expect(page.getByRole("heading", { name: "La trazabilidad forma parte del resultado." })).toBeVisible();
});
