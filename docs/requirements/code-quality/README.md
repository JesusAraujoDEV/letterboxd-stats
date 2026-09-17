# code-quality — Plan

Reducir los archivos que violan `standards/code-quality.md` (techos de tamaño) a algo mantenible. Este plan cubre el frontend; el backend tiene su propio plan equivalente en `letterboxd-stats-back/docs/requirements/code-quality/`.

## Alcance detectado

Barrido de `src/**/*.{ts,tsx}` (excluyendo `node_modules` y `src/components/ui` ya exento) contra la tabla de techos (Component 150, Page/route 200, Hook 80, Generic module 200). 16 archivos fuera de límite, de 36 revisados.

## Hallazgo transversal (leer antes de la lista por archivo)

Antes de partir cada archivo por separado: el mismo bloque `generateImageBlob()/handleDownload()/handleCopy()/handleShare()` (captura con `html-to-image` + compartir/copiar/descargar + `toastMessage` con timeout de 3s) está duplicado casi verbatim en **11 archivos**: `CastAndCrew`, `ViewingHabits`, `Dashboard`, `MostRewatched`, `GlobalTastes`, `TopInteractions`, `WorldMovieMap`, `LikesSection`, `TopDecades`, `WatchedYearActivityChart`, `ReleaseYearTimeline`. Es el disparador de refactor "misma lógica en 3+ lugares" de `standards/code-quality.md`, multiplicado por casi 4. Extraerlo a `src/hooks/use-image-export.ts` es el cambio de mayor apalancamiento de todo el plan: por sí solo quita 45-70 líneas de cada uno de esos 11 archivos antes de tocar nada más.

Duplicaciones adicionales confirmadas:
- `WeekTooltip`/`DayTooltip`/`MonthTooltip` — verbatim entre `ExplorerView.tsx` y `ViewingHabits.tsx`.
- `formatDateKey`/`parseDateKey`/color de heatmap/construcción de grilla de calendario — verbatim entre `ViewingHeatmap.tsx` y `ViewingHabits.tsx` (que reconstruye su propia grilla en paralelo en vez de reusar `ViewingHeatmap`).
- `PosterCard` (poster + overlay hover) definido por separado dentro de `TopDecades.tsx` y `MostRewatched.tsx`.
- `normalize`, `normalizeCountry`, `getTagsFromLogs`, `includesNormalized`, `getMovieRating`, `buildTopList`, `getPersonCounts`, `DAY_ORDER`/`MONTH_ORDER`, `buildPaginationItems`, `CustomPagination` — verbatim entre `ExplorerView.tsx` y `AdvancedExplorer.tsx`.

**`AdvancedExplorer.tsx` (1011 líneas) es código muerto** — cero imports en todo `src/` (export default y el named export `CustomPagination` verificados). `ExplorerView.tsx` es su sucesor. Eliminarlo es la reducción de líneas más grande de todo el plan, sin riesgo.

**`MOCK_DATA` en `types/stats.ts` (528 de sus 651 líneas) no se usa en ningún lado.** Eliminarlo (o moverlo a un fixture de test) deja el archivo de tipos en ~123 líneas por sí solo.

## Índice de requirements

| # | Slug | Qué cubre |
|---|------|-----------|
| 001 | audit-file-size-violations | Hallazgos completos y plan de división de los 16 archivos, incluyendo las extracciones fundacionales compartidas |

## Orden recomendado

1. Eliminar `AdvancedExplorer.tsx` y `MOCK_DATA` (riesgo cero, mayor reducción).
2. Documentar excepción de "dato/vendorizado" para `lib/countries.ts` y `hooks/use-toast.ts` (sin cambio de código).
3. Extracciones fundacionales compartidas (`use-image-export`, `period-tooltips`, `lib/heatmap.ts`, `PosterCard`, `lib/movie-taste.ts`, `CustomPagination`/`MovieGridModal`) — casi todo lo demás depende de que existan primero.
4. Archivos medianos que solo necesitan adoptar `useImageExport` (`Dashboard`, `CastAndCrew`, `WatchedYearActivityChart`, `ReleaseYearTimeline`, `GlobalTastes`, `WorldMovieMap`, `LikesSection`, `TopInteractions`, `TopDecades`, `MostRewatched`) — riesgo bajo/medio, independientes entre sí.
5. `ViewingHeatmap.tsx` antes que `ViewingHabits.tsx` (esta última reusa la grilla de la primera).
6. `ViewingHabits.tsx` — riesgo medio, la más interdependiente de las medianas.
7. `ExplorerView.tsx` al final — riesgo alto, la página más usada de la app, depende de que todas las primitivas compartidas ya existan y estén probadas en los archivos pequeños.
