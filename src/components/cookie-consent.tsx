"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ceutaunomo-cookie-preference-v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(window.localStorage.getItem(STORAGE_KEY) === null), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const choose = (preference: "ESSENTIAL" | "ANALYTICS") => {
    window.localStorage.setItem(STORAGE_KEY, preference);
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <aside className="cookie-banner" aria-label="Preferencias de cookies" aria-live="polite">
      <div><strong>Tu privacidad, sin letra pequeña</strong><p>CEUTONOMO usa almacenamiento local para guardar tus escenarios. Las analíticas no se activarán sin tu consentimiento.</p></div>
      <div className="cookie-actions"><button type="button" onClick={() => choose("ESSENTIAL")}>Solo esenciales</button><button type="button" className="primary-button" onClick={() => choose("ANALYTICS")}>Aceptar analíticas</button></div>
    </aside>
  );
}
