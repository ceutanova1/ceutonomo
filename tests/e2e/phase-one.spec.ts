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
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("ceutonomo-cookie-preference-v2"))).toBe("ESSENTIAL");
  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Cambiar preferencias de cookies" }).click();
  await expect(page.getByRole("button", { name: "Analíticas próximamente" })).toBeDisabled();
});

test("presenters can restore the seeded demo without losing interface preferences", async ({ page }) => {
  await openReadyApp(page);
  await page.getByRole("button", { name: "Solo esenciales" }).click();
  await page.getByRole("textbox", { name: "Tarifa diaria" }).fill("450");
  await page.getByRole("button", { name: "Guardar en este dispositivo" }).click();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.getByRole("button", { name: "Dark theme" }).click();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Restore demo" }).click();

  await expect(page.getByRole("textbox", { name: "Daily rate" })).toHaveValue("300");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.evaluate(() => ({
    scenario: window.localStorage.getItem("ceutaunomo-scenario-v1"),
    cookies: window.localStorage.getItem("ceutonomo-cookie-preference-v2"),
  }))).toEqual({ scenario: null, cookies: "ESSENTIAL" });
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
  await expect(page.getByText("Estimated annual net").first()).toBeVisible();
  await page.getByRole("button", { name: "Eligibility" }).click();
  await expect(page.getByRole("heading", { name: "Facts first. Benefits second." })).toBeVisible();
  await page.getByRole("button", { name: "Benefits" }).click();
  await expect(page.getByRole("heading", { name: "Only benefits that can be explained and evidenced." })).toBeVisible();
  await page.getByRole("button", { name: "Grants" }).click();
  await expect(page.getByRole("heading", { name: "Calls, deadlines and conditions before you act." })).toBeVisible();
  await page.getByRole("button", { name: "Roadmap" }).click();
  await expect(page.getByRole("heading", { name: "From a scenario to a documented decision." })).toBeVisible();
  await page.getByRole("button", { name: "Sources" }).click();
  await expect(page.getByRole("heading", { name: "Traceability is part of the result." })).toBeVisible();
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

test("privacy and legal information are reachable from the demo", async ({ page }) => {
  await openReadyApp(page);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex, nofollow/);
  await page.getByRole("link", { name: "Privacidad", exact: true }).click();
  await expect(page).toHaveURL(/\/privacidad$/);
  await expect(page.getByRole("heading", { name: "Privacidad" })).toBeVisible();
  await expect(page.getByText("Los importes, respuestas y escenarios se guardan únicamente")).toBeVisible();

  await page.getByRole("link", { name: "Volver a CEUTONOMO" }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-interface-ready", "true");
  await page.getByRole("link", { name: "Aviso legal" }).click();
  await expect(page).toHaveURL(/\/legal$/);
  await expect(page.getByRole("heading", { name: "Aviso legal y condiciones de uso" })).toBeVisible();
  await expect(page.getByText("Los resultados son orientativos")).toBeVisible();

  const robotsResponse = await page.request.get("/robots.txt");
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toContain("Disallow: /");
});

test("private demo responses include crawler and browser protections", async ({ page }) => {
  const response = await page.request.get("/");
  expect(response.ok()).toBe(true);
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["permissions-policy"]).toContain("browsing-topics=()");
  expect(headers["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
});

test("scenario exports include portable data and a real PDF", async ({ page }) => {
  await openReadyApp(page);
  const cookieButton = page.getByRole("button", { name: "Solo esenciales" });
  if (await cookieButton.isVisible()) await cookieButton.click();

  for (const format of ["CSV", "JSON", "XML"] as const) {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: format, exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`ceutonomo-simulacion-2026.${format.toLowerCase()}`);
  }

  const pdfPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PDF", exact: true }).click();
  const pdf = await pdfPromise;
  expect(pdf.suggestedFilename()).toBe("ceutonomo-simulacion-2026.pdf");
  await expect(page.getByText("PDF preparado en este dispositivo.")).toBeVisible();
});
