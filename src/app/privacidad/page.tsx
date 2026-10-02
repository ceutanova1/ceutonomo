import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad — CEUTONOMO",
  description: "Información sobre privacidad y almacenamiento local en la demo de CEUTONOMO.",
};

export default function PrivacyPage() {
  const analyticsConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID);
  return (
    <main className="legal-page">
      <div className="legal-page-shell">
        <Link className="legal-back" href="/">← Volver a CEUTONOMO</Link>
        <p className="eyebrow">INFORMACIÓN DE LA DEMO</p>
        <h1>Privacidad</h1>
        <p className="legal-lede">CEUTONOMO está diseñado para permitir simulaciones anónimas y minimizar la información personal tratada.</p>

        <section><h2>Responsable</h2><p>El responsable de esta demo es Mohamed Ali Ben Ali. Para consultas relacionadas con privacidad puedes escribir a <a href="mailto:medalibenali2@gmail.com">medalibenali2@gmail.com</a>.</p></section>
        <section><h2>Datos y escenarios</h2><p>Los importes, respuestas y escenarios se guardan únicamente en el almacenamiento local de tu navegador. La demo actual no los envía ni los conserva en un servidor de CEUTONOMO. Puedes eliminarlos borrando los datos del sitio desde tu navegador.</p></section>
        <section><h2>Preferencias y analítica</h2><p>La elección de cookies y las preferencias de idioma y apariencia se guardan localmente. {analyticsConfigured ? "Google Analytics solo se carga después de aceptar expresamente las analíticas. CEUTONOMO registra visitas y acciones generales como exportar un informe o iniciar el contacto, pero no envía importes ni respuestas de la simulación." : "Google Analytics está previsto, pero todavía no está configurado. La opción permanece desactivada y no se carga ningún servicio de analítica."} Puedes cambiar o retirar tu elección en cualquier momento mediante el botón «Cookies».</p></section>
        <section><h2>Contacto voluntario</h2><p>Si utilizas el enlace de contacto, tu aplicación de correo abrirá un mensaje dirigido al responsable. Los datos que decidas enviar se utilizarán únicamente para atender tu solicitud y no forman parte del escenario almacenado en el navegador.</p></section>
        <section><h2>Enlaces externos</h2><p>La aplicación enlaza fuentes oficiales de terceros. Sus propias políticas de privacidad se aplican cuando abandonas CEUTONOMO.</p></section>
        <section><h2>Actualizaciones</h2><p>Esta información corresponde a la demo de fase 1 y fue actualizada el 3 de octubre de 2026. Se revisará antes de incorporar cuentas o persistencia en servidor.</p></section>
      </div>
    </main>
  );
}
