# CEUTONOMO

CEUTONOMO es una aplicación informativa para estudiar escenarios de actividad autónoma y empresa en Ceuta. Combina simulación económica, diagnóstico de elegibilidad, beneficios, ayudas, una hoja de ruta y fuentes oficiales trazables.

La aplicación ofrece estimaciones orientativas y no sustituye el asesoramiento de la Agencia Tributaria, la Seguridad Social, PROCESA ni de un profesional fiscal cualificado.

## Desarrollo local

Requisitos:

- Node.js 20 o posterior
- npm

Instalación y ejecución:

```bash
npm install
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Verificación

Antes de publicar cambios:

```bash
npm run lint
npm test -- --run
npm run build
npm run test:e2e
```

## Despliegue

El repositorio está conectado a Vercel. Los cambios enviados a `main` crean un despliegue de producción; las ramas y pull requests pueden utilizarse para despliegues de vista previa.

La experiencia actual se genera como contenido estático y guarda los escenarios en el almacenamiento local del navegador. `DATABASE_URL` está reservado para una fase posterior con persistencia en servidor y no es necesario para la demo actual.

No se deben guardar secretos ni credenciales en el repositorio. Las futuras variables de producción deberán configurarse desde los ajustes del proyecto en Vercel.

## Idiomas y apariencia

- Español como idioma principal.
- Inglés como opción.
- Tema claro y oscuro.

## Estado del producto

La fase 1 incluye el dashboard, el diagnóstico, el simulador, la comparación inicial entre autónomo y SL, beneficios, ayudas, fuentes y una hoja de ruta conectada. El ebook y su venta pertenecen a la fase final.
