"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import Link from "next/link";

import { ANALYTICS_PREFERENCE_KEY } from "@/lib/analytics";

type Preference = "ESSENTIAL" | "ANALYTICS";
type Locale = "es" | "en";

const clearGoogleAnalyticsCookies = () => {
  document.cookie.split(";").map((cookie) => cookie.split("=")[0].trim()).filter((name) => name === "_ga" || name.startsWith("_ga_")).forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  });
};

export function CookieConsent({ measurementId }: Readonly<{ measurementId?: string }>) {
  const [visible, setVisible] = useState(false);
  const [preference, setPreference] = useState<Preference | null>(null);
  const [locale, setLocale] = useState<Locale>("es");
  const analyticsAvailable = Boolean(measurementId?.match(/^G-[A-Z0-9-]+$/));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(ANALYTICS_PREFERENCE_KEY);
      const storedLocale = window.localStorage.getItem("ceutaunomo-locale-v1");
      if (storedLocale === "es" || storedLocale === "en") setLocale(storedLocale);
      if (stored === "ESSENTIAL" || stored === "ANALYTICS") setPreference(stored);
      else setVisible(true);
    }, 0);
    const handleLocale = (event: Event) => setLocale((event as CustomEvent<Locale>).detail);
    window.addEventListener("ceutonomo:locale-changed", handleLocale);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("ceutonomo:locale-changed", handleLocale);
    };
  }, []);

  const choose = (nextPreference: Preference) => {
    window.localStorage.setItem(ANALYTICS_PREFERENCE_KEY, nextPreference);
    if (measurementId) {
      (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = nextPreference !== "ANALYTICS";
    }
    if (nextPreference === "ESSENTIAL") {
      clearGoogleAnalyticsCookies();
      delete window.gtag;
    }
    setPreference(nextPreference);
    setVisible(false);
  };

  const analyticsEnabled = analyticsAvailable && preference === "ANALYTICS";

  return (
    <>
      {analyticsEnabled ? <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId!)}`} strategy="afterInteractive" />
        <Script id="ceutonomo-google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(measurementId)}, { anonymize_ip: true });
        `}</Script>
      </> : null}
      {visible ? <aside className="cookie-banner" aria-label={locale === "es" ? "Preferencias de cookies" : "Cookie preferences"} aria-live="polite">
        <div><strong>{locale === "es" ? "Tu privacidad, sin letra pequeña" : "Your privacy, in plain language"}</strong><p>{analyticsAvailable ? (locale === "es" ? "CEUTONOMO guarda tu escenario localmente. Google Analytics solo se cargará si lo aceptas; no enviamos los importes de tu simulación." : "CEUTONOMO stores your scenario locally. Google Analytics only loads if you accept; we do not send your simulation amounts.") : (locale === "es" ? "CEUTONOMO guarda tu escenario localmente. La analítica todavía no está configurada y no se carga ningún servicio de seguimiento." : "CEUTONOMO stores your scenario locally. Analytics is not configured yet and no tracking service is loaded.")} <Link href="/privacidad">{locale === "es" ? "Más información" : "Learn more"}</Link>.</p></div>
        <div className="cookie-actions"><button type="button" onClick={() => choose("ESSENTIAL")}>{locale === "es" ? "Solo esenciales" : "Essential only"}</button><button type="button" className="primary-button" disabled={!analyticsAvailable} onClick={() => choose("ANALYTICS")}>{analyticsAvailable ? (locale === "es" ? "Aceptar analíticas" : "Accept analytics") : (locale === "es" ? "Analíticas próximamente" : "Analytics coming soon")}</button></div>
      </aside> : <button type="button" className="cookie-settings-trigger" onClick={() => setVisible(true)} aria-label={locale === "es" ? "Cambiar preferencias de cookies" : "Change cookie preferences"}>Cookies</button>}
    </>
  );
}
