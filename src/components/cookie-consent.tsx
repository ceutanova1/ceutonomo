"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import Link from "next/link";

import { ANALYTICS_PREFERENCE_KEY } from "@/lib/analytics";

type Preference = "ESSENTIAL" | "ANALYTICS";

const clearGoogleAnalyticsCookies = () => {
  document.cookie.split(";").map((cookie) => cookie.split("=")[0].trim()).filter((name) => name === "_ga" || name.startsWith("_ga_")).forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  });
};

export function CookieConsent({ measurementId }: Readonly<{ measurementId?: string }>) {
  const [visible, setVisible] = useState(false);
  const [preference, setPreference] = useState<Preference | null>(null);
  const analyticsAvailable = Boolean(measurementId?.match(/^G-[A-Z0-9-]+$/));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(ANALYTICS_PREFERENCE_KEY);
      if (stored === "ESSENTIAL" || stored === "ANALYTICS") setPreference(stored);
      else setVisible(true);
    }, 0);
    return () => window.clearTimeout(timer);
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
      {visible ? <aside className="cookie-banner" aria-label="Preferencias de cookies" aria-live="polite">
        <div><strong>Tu privacidad, sin letra pequeña</strong><p>{analyticsAvailable ? "CEUTONOMO guarda tu escenario localmente. Google Analytics solo se cargará si lo aceptas; no enviamos los importes de tu simulación." : "CEUTONOMO guarda tu escenario localmente. La analítica todavía no está configurada y no se carga ningún servicio de seguimiento."} <Link href="/privacidad">Más información</Link>.</p></div>
        <div className="cookie-actions"><button type="button" onClick={() => choose("ESSENTIAL")}>Solo esenciales</button><button type="button" className="primary-button" disabled={!analyticsAvailable} onClick={() => choose("ANALYTICS")}>{analyticsAvailable ? "Aceptar analíticas" : "Analíticas próximamente"}</button></div>
      </aside> : <button type="button" className="cookie-settings-trigger" onClick={() => setVisible(true)} aria-label="Cambiar preferencias de cookies">Cookies</button>}
    </>
  );
}
