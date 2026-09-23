# 2026-09-23 — Aviso de estadísticas guardadas desactualizadas

## What changed
Se añadió detección de estadísticas guardadas en `localStorage` provenientes de una versión anterior del backend y un aviso visible con botón para volver a subir el archivo. Nuevos: `src/lib/stats-freshness.ts`, `src/components/OutdatedStatsBanner.tsx` y sus tests. `src/pages/Index.tsx` ahora marca `isOutdated` solo al leer de `localStorage` y reutiliza una función `resetStats`.

## Why
`Index.tsx` restaura las estadísticas desde `localStorage` sin volver a pedirlas al backend. Cuando el objeto guardado es de una versión anterior le faltan campos nuevos y secciones como `RewatchByYear` desaparecen sin explicación; el usuario no sabía que debía volver a subir su ZIP.

## How
`isStatsOutdated` compara las claves de `REQUIRED_STATS_KEYS` con el operador `in` (no contra `undefined`, porque el backend puede enviar `null` legítimo como `watchSpan: null`) y solo actúa sobre objetos. El chequeo se hace únicamente sobre datos leídos de `localStorage`; un resultado recién devuelto por el backend nunca muestra el aviso. La lógica de reinicio (`removeItem` + `setStats(null)` + limpiar el aviso) se extrajo a `resetStats`, reutilizada por el botón existente y por `onReupload` del banner. Las funciones inline de los efectos se extrajeron a funciones nombradas para respetar la regla de hooks.

## Promoted knowledge
None

## Follow-ups
- [ ] Al agregar un campo nuevo a la respuesta del backend, agregar su clave a `REQUIRED_STATS_KEYS` en `src/lib/stats-freshness.ts`.
