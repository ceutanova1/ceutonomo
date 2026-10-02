import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aviso legal — CEUTONOMO",
  description: "Condiciones y limitaciones de la demo informativa de CEUTONOMO.",
};

export default function LegalPage() {
  return (
    <main className="legal-page">
      <div className="legal-page-shell">
        <Link className="legal-back" href="/">← Volver a CEUTONOMO</Link>
        <p className="eyebrow">DEMO PRIVADA · FASE 1</p>
        <h1>Aviso legal y condiciones de uso</h1>
        <p className="legal-lede">CEUTONOMO es una herramienta de apoyo a la decisión que presenta estimaciones explicables a partir de datos introducidos por el usuario y reglas fechadas.</p>

        <section><h2>Titular y contacto</h2><p>La demo es responsabilidad de Mohamed Ali Ben Ali. Contacto: <a href="mailto:medalibenali2@gmail.com">medalibenali2@gmail.com</a>. Los datos identificativos adicionales necesarios se incorporarán antes de una explotación comercial.</p></section>
        <section><h2>Carácter informativo</h2><p>Los resultados son orientativos y no constituyen asesoramiento fiscal, laboral, mercantil ni jurídico. Antes de presentar una solicitud, darse de alta, contratar, invertir o elegir una estructura jurídica, debe confirmarse el caso con la Agencia Tributaria, la Seguridad Social, PROCESA o un profesional cualificado.</p></section>
        <section><h2>Alcance de los cálculos</h2><p>La interfaz identifica las reglas verificadas, las hipótesis y los elementos pendientes. No se deben interpretar como aplicables las ventajas marcadas como potenciales o pendientes de verificación. Los ejercicios futuros no se calculan cuando todavía no existe normativa oficial suficiente.</p></section>
        <section><h2>Fuentes y vigencia</h2><p>Los enlaces a fuentes oficiales permiten revisar la procedencia de cada regla. La normativa, convocatorias y criterios administrativos pueden cambiar, por lo que debe comprobarse su vigencia antes de actuar.</p></section>
        <section><h2>Disponibilidad de la demo</h2><p>Esta fase puede cambiar, interrumpirse o retirar funciones mientras continúa la revisión. CEUTONOMO no garantiza que un resultado cubra todas las circunstancias personales o empresariales del usuario.</p></section>
        <section><h2>Uso permitido</h2><p>La demo puede utilizarse para explorar escenarios propios de buena fe. No debe utilizarse para automatizar decisiones profesionales, presentar solicitudes ni emitir asesoramiento a terceros sin revisión independiente.</p></section>
        <section><h2>Versión</h2><p>Aviso correspondiente a la fase 1, actualizado el 3 de octubre de 2026.</p></section>
      </div>
    </main>
  );
}
