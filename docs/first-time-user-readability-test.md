# CEUTONOMO — Prueba de comprensión para nuevos usuarios

Esta prueba valida si una persona que nunca ha usado CEUTONOMO entiende el ejemplo, los resultados y sus límites sin recibir explicaciones fiscales del moderador. No sustituye la revisión fiscal, legal ni de accesibilidad.

## Participantes y cobertura mínima

- 5 participantes que trabajen, quieran trabajar o asesoren a profesionales autónomos en Ceuta.
- Al menos 3 personas sin experiencia fiscal profesional.
- Al menos 2 sesiones en móvil y 2 en escritorio.
- 4 sesiones en español y 1 en inglés.
- Si es posible, una sesión con teclado y una con VoiceOver o NVDA.

No recopiles nombres, identificadores ni importes fiscales reales. Usa siempre el escenario de demostración.

## Preparación

1. Abre <https://ceutonomo.vercel.app> en una ventana privada.
2. Selecciona el idioma asignado y restaura la demo.
3. No describas la interfaz antes de empezar.
4. Registra la versión o commit mostrado.
5. Pide al participante que piense en voz alta, pero no le enseñes dónde pulsar.

## Guion del moderador

> Estamos probando el producto, no tus conocimientos. Usa únicamente los datos de ejemplo. Cuéntame qué entiendes, qué esperas que ocurra y cualquier palabra que te genere dudas.

## Tareas

### Tarea 1 — Comprender el ejemplo

Pregunta: “Sin cambiar nada, explícame con tus palabras qué actividad representa este ejemplo y qué tres hipótesis forman sus ingresos.”

Éxito sin ayuda: identifica al consultor digital de Ceuta y tarifa diaria, días al mes y meses de actividad.

### Tarea 2 — Cambiar una hipótesis

Pregunta: “Haz que la tarifa diaria sea 350 € y dime qué resultado ha cambiado.”

Éxito sin ayuda: cambia la tarifa, detecta la actualización y no interpreta el resultado como una garantía.

### Tarea 3 — Interpretar resultados

Pregunta: “¿Qué diferencia hay entre neto estimado, ahorro recurrente y ayuda potencial?”

Éxito sin ayuda: separa renta estimada, ahorro periódico y ayuda puntual; no suma la ayuda al ahorro recurrente.

### Tarea 4 — Detectar incertidumbre

Pregunta: “Busca un elemento que todavía necesite verificación y explica qué harías antes de tomar una decisión.”

Éxito sin ayuda: localiza un estado o aviso pendiente y propone revisar fuentes o consultar a un gestor.

### Tarea 5 — Encontrar evidencia y siguiente paso

Pregunta: “Encuentra una fuente oficial y después prepara el escenario para revisarlo con un profesional.”

Éxito sin ayuda: llega a Fuentes, reconoce el emisor oficial y encuentra la exportación o `Solicitar revisión`.

## Preguntas finales

- ¿Cuál es el resultado más importante para ti y por qué?
- ¿Qué texto o concepto fue más difícil de entender?
- ¿En qué momento dudaste de si el resultado era fiable?
- ¿Qué esperarías que ocurriera al pulsar `Solicitar revisión`?
- Del 1 al 5, ¿qué facilidad tuvo la lectura? ¿Y qué confianza te produjo la explicación?

## Métricas y umbral de cierre

| Métrica | Objetivo |
| --- | --- |
| Tareas 1–3 completadas sin ayuda | 4 de 5 participantes |
| Participantes que separan ahorro recurrente y ayuda puntual | 5 de 5 |
| Participantes que reconocen que no es asesoramiento personal | 5 de 5 |
| Participantes que encuentran una fuente y el siguiente paso | 4 de 5 |
| Valor mediano de facilidad de lectura | 4/5 o superior |
| Bloqueos de prioridad alta | 0 abiertos |

Una sesión se marca `parcial` si requiere una indicación neutral. Se marca `no completada` si el moderador debe explicar el significado o indicar el control exacto.

## Registro y decisión

Después de cada sesión, completa una copia de [`demo-feedback-template.md`](./demo-feedback-template.md). Agrupa los problemas repetidos por pantalla y concepto, no por participante.

La validación queda aprobada únicamente cuando se alcanza cada umbral y toda incidencia alta tiene una corrección verificada. Si no se alcanza, registra los cambios requeridos y repite solo las tareas afectadas con nuevos participantes.
