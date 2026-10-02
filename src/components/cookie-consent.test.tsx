import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CookieConsent } from "./cookie-consent";
import { trackAnalyticsEvent } from "@/lib/analytics";

describe("CookieConsent", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("does not offer analytics when no measurement ID is configured", async () => {
    render(<CookieConsent />);

    expect((await screen.findByRole("button", { name: "Analíticas próximamente" }) as HTMLButtonElement).disabled).toBe(true);
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
  });

  it("loads Google Analytics only after explicit consent", async () => {
    render(<CookieConsent measurementId="G-CEUTONOMO1" />);

    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Aceptar analíticas" }));

    await waitFor(() => expect(document.querySelector('script[src*="googletagmanager.com"]')).not.toBeNull());
    expect(window.localStorage.getItem("ceutonomo-cookie-preference-v2")).toBe("ANALYTICS");
  });

  it("stops product events immediately after consent is withdrawn", async () => {
    render(<CookieConsent measurementId="G-CEUTONOMO1" />);
    fireEvent.click(await screen.findByRole("button", { name: "Aceptar analíticas" }));

    const events: string[] = [];
    window.gtag = (_command, eventName) => events.push(eventName);
    trackAnalyticsEvent("scenario_exported", { format: "pdf" });
    fireEvent.click(screen.getByRole("button", { name: "Cambiar preferencias de cookies" }));
    fireEvent.click(screen.getByRole("button", { name: "Solo esenciales" }));
    trackAnalyticsEvent("advisor_contact_started", { channel: "email" });

    expect(events).toEqual(["scenario_exported"]);
    expect(window.localStorage.getItem("ceutonomo-cookie-preference-v2")).toBe("ESSENTIAL");
    expect((window as unknown as Record<string, boolean>)["ga-disable-G-CEUTONOMO1"]).toBe(true);
  });
});
