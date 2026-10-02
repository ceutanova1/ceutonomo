import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const openReadyApp = async (page: Page) => {
  await page.addInitScript(() => window.localStorage.setItem("ceutonomo-cookie-preference-v2", "ESSENTIAL"));
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-interface-ready", "true");
};

const expectNoSeriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  expect(
    serious.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
};

test("dashboard and keyboard entry point meet the automated accessibility gate", async ({ page }) => {
  await openReadyApp(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await expectNoSeriousViolations(page);
});

test("eligibility, dark theme and legal pages meet the automated accessibility gate", async ({ page }) => {
  await openReadyApp(page);
  await page.getByRole("button", { name: "Elegibilidad" }).click();
  await expect(page.getByRole("heading", { name: "Primero los hechos. Después, los beneficios." })).toBeVisible();
  await expectNoSeriousViolations(page);

  const darkTheme = page.getByRole("button", { name: "Tema oscuro" });
  if (await darkTheme.count()) await darkTheme.first().click();
  await expectNoSeriousViolations(page);

  await page.goto("/privacidad");
  await expectNoSeriousViolations(page);
  await page.goto("/legal");
  await expectNoSeriousViolations(page);
});
