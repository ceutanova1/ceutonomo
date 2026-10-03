import { expect, test } from "@playwright/test";

test("published private demo is ready for a guided session", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("ceutonomo-cookie-preference-v2", "ESSENTIAL");
    window.localStorage.removeItem("ceutaunomo-locale-v1");
    window.localStorage.removeItem("ceutaunomo-theme-v1");
  });

  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");

  await expect(page.locator(".app-shell")).toHaveAttribute("data-interface-ready", "true");
  await expect(page).toHaveTitle(/CEUTONOMO/);
  await expect(page.getByRole("heading", { name: "Tu actividad en Ceuta, explicada euro a euro." })).toBeVisible();

  const summary = page.getByRole("region", { name: "Resumen económico del escenario" });
  await expect(summary).toContainText("75.600");
  await expect(summary).toContainText("61.002");
  await expect(summary).toContainText("15.307");
  await expect(summary).toContainText("No incluye ayudas de pago único");

  await page.getByRole("button", { name: "Elegibilidad" }).click();
  await expect(page.getByRole("heading", { name: "Primero los hechos. Después, los beneficios." })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Facts first. Benefits second." })).toBeVisible();
  await page.getByRole("button", { name: "Dashboard" }).click();
  await expect(page.getByText("General income tax calculated with verified rules")).toBeVisible();

  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Disallow: /");
});
