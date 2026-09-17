# 001 — Audit: 16 archivos exceden el techo de tamaño

- **Status:** In progress
- **Plan:** code-quality ([README](README.md))
- **Date:** 2026-09-17
- **Author role:** SYS
- **Branch:** (on In progress: `req/code-quality-001-audit-file-size-violations`)
- **Depends on:** None

## Context

Barrido completo de `src/**/*.{ts,tsx}` contra `standards/code-quality.md` (Component 150, Page/route 200, Hook 80, Generic module 200). 16 de 36 archivos no vendorizados exceden su techo, liderados por `ExplorerView.tsx` (1825 líneas, 9x el techo de página) y `AdvancedExplorer.tsx` (1011 líneas, código muerto). El problema no es solo tamaño individual: el mismo patrón de exportar-como-imagen (`html-to-image` → blob → compartir/copiar/descargar) está duplicado casi verbatim en 11 archivos, y `ExplorerView`/`AdvancedExplorer` comparten media docena de helpers puros palabra por palabra. Ver README del plan para el detalle de las duplicaciones transversales.

Conteos de línea recogidos en dos pasadas (PowerShell `Measure-Object` y lectura directa) difieren en ~30-40 líneas por archivo según el método de conteo — son indicativos del orden de magnitud, no un contrato exacto; releer el archivo antes de implementar cada ítem.

## Goal

- Ningún archivo bajo `src/` (fuera de `components/ui` y las excepciones documentadas en este requirement) supera su techo.
- El patrón de exportación a imagen vive en un único `src/hooks/use-image-export.ts`, usado por los 11 archivos que hoy lo duplican.
- `AdvancedExplorer.tsx` y `MOCK_DATA` (en `types/stats.ts`) eliminados.
- `ExplorerView.tsx` queda como orquestador de ~150-190 líneas que compone secciones más pequeñas.
- Ningún comportamiento visible cambia: mismos botones de compartir/descargar/copiar funcionando, mismos filtros y navegación en el explorador.

## Areas to investigate

### Extracciones fundacionales (bloquean casi todo lo demás)

| Archivo nuevo | Contenido | Desbloquea |
|---|---|---|
| `src/hooks/use-image-export.ts` | `{ isExporting, toastMessage, download, copy, share }` a partir de un ref + filename + title | 11 archivos |
| `src/components/charts/period-tooltips.tsx` | `WeekTooltip`, `DayTooltip`, `MonthTooltip` | ExplorerView, ViewingHabits |
| `src/lib/heatmap.ts` | `formatDateKey`, `parseDateKey`, `getHeatmapColorClass`, `buildCalendarGrid`, `buildMonthLabels` | ViewingHeatmap, ViewingHabits |
| `src/components/PosterCard.tsx` | poster + overlay hover compartido (contenido del overlay vía props/children) | TopDecades, MostRewatched |
| `src/lib/movie-taste.ts` | `normalize`, `normalizeCountry`, `getTagsFromLogs`, `includesNormalized`, `getMovieRating`, `buildTopList`, `getPersonCounts`, `DAY_ORDER`/`MONTH_ORDER` | ExplorerView (único consumidor una vez borrado AdvancedExplorer) |
| `src/components/CustomPagination.tsx`, `src/components/MovieGridModal.tsx` | un símbolo por archivo | ExplorerView |

### Por archivo

- **`AdvancedExplorer.tsx` (1011)** → eliminar entero. Riesgo: ninguno (muerto, verificado). Prioridad: primero.
- **`types/stats.ts` (651 → ~123)** → borrar/mover `MOCK_DATA` (también sin uso). Riesgo: ninguno.
- **`lib/countries.ts` (254)** → sin split; es una tabla estática código→nombre, misma categoría que la excepción ya existente de `components/ui`. Documentar la excepción en vez de partirla artificialmente.
- **`hooks/use-toast.ts` (156)** → boilerplate de shadcn sin modificar, solo alcanzable desde otros archivos vendorizados; el mecanismo de toast real de la app es el `Toast.tsx` ad-hoc usado en los 11 archivos de exportación. Documentar la misma excepción de vendorizado. Fuera de este plan pero anotado: la app mantiene dos sistemas de toast en paralelo y solo usa uno — ticket de limpieza aparte.
- **`ViewingHeatmap.tsx` (208 → ~140)** → adoptar `lib/heatmap.ts`; extraer el bloque de grilla de calendario (~55 líneas) a `HeatmapGrid.tsx`. Hacer **antes** que `ViewingHabits`. Riesgo bajo.
- **`Dashboard.tsx` (287 → ~140)** → extraer el componente anidado `StatsOverviewExport` a su propio archivo (ya es una segunda violación de "un símbolo por archivo" por sí sola); tras adoptar `useImageExport` queda en ~80 líneas. Riesgo bajo.
- **`ViewingHabits.tsx` (875 → ~150-180, probablemente necesita un split más)** → adoptar `useImageExport`, `period-tooltips.tsx`, `lib/heatmap.ts` (dejar de reconstruir su propia grilla, reusar `ViewingHeatmap`); extraer los 3 bloques JSX de "tarjeta de exportación" offscreen (~260 líneas) a archivo(s) propios. Puede necesitar colapsar los 3 bar charts visibles (días/semanas/meses) en un `PeriodBarChart` reusable para bajar de 150 con margen. Riesgo **medio** — la más interdependiente de las medianas; probar los 3 botones de exportación después.
- **`CastAndCrew.tsx` (398 → ~150)** → adoptar `useImageExport` (se llama dos veces, un ref cada una); extraer `PersonCard` y `Toggle` (ya exportados) a archivos propios. Riesgo bajo.
- **`WatchedYearActivityChart.tsx` (333 → ~150-180)** → adoptar `useImageExport`; extraer el renderer custom de `LabelList` (idéntico en el chart visible y el de exportación) a una función compartida; puede necesitar aislar el JSX de exportación aparte. Riesgo bajo.
- **`ReleaseYearTimeline.tsx` (329 → ~150-180)** → adoptar `useImageExport`; extraer el JSX de exportación a archivo propio. Riesgo bajo.
- **`GlobalTastes.tsx` (329 → ~150)** → adoptar `useImageExport`. Riesgo bajo. Nota: su grilla de 3 tarjetas género/país/idioma es el mismo patrón duplicado una tercera vez dentro de `ExplorerView.tsx` — reusar como `TasteCardGrid` compartido al partir ExplorerView.
- **`WorldMovieMap.tsx` (316 → ~150)** → adoptar `useImageExport`; mover `hexToRgb`/`interpolateColor`/`getFill`/`normalizeName` a `src/lib/color.ts`; extraer JSX de exportación. Riesgo medio (verificar que ambos renders de `Geographies` — visible y offscreen — sigan funcionando).
- **`LikesSection.tsx` (300 → ~150)** → adoptar `useImageExport`; extraer JSX de exportación si sigue sobre el techo. Riesgo bajo.
- **`TopInteractions.tsx` (269 → ~150)** → adoptar `useImageExport`; extraer JSX de exportación. Riesgo bajo.
- **`TopDecades.tsx` (273 → ~150)** → adoptar `useImageExport` (normalizar su variante `{blob, dataUrl}` a la forma del hook); reemplazar `PosterCard` local por el compartido; extraer JSX de exportación. Riesgo bajo.
- **`MostRewatched.tsx` (241 → ~150)** → adoptar `useImageExport`; reemplazar `PosterCard` local por el compartido. Riesgo bajo.
- **`ExplorerView.tsx` (1825 → decomposición profunda, hacer al final)** → mover helpers puros a `lib/movie-taste.ts`; mover tooltips a `period-tooltips.tsx`; extraer `CustomPagination`/`MovieGridModal`; extraer el predicado de filtro inline de ~90 líneas (hoy vive dentro de un `useMemo`, ya en sí violando la regla de "función pasada a un hook >3 líneas debe nombrarse") a `src/hooks/use-movie-filters.ts`; partir la página en ~8 componentes de sección (filtros, grilla de películas, personas, tarjetas de gustos, hábitos de visionado, timeline de estreno, décadas, rewatched), cada uno importando las primitivas compartidas de arriba. Objetivo: página como orquestador de ~150-190 líneas. Riesgo **alto** — más estado, más interacción cruzada vía `searchParams`, página más usada de la app. Hacer solo cuando cada primitiva compartida que necesita ya exista y esté probada en los archivos pequeños.

## Expected deliverable

- 6 archivos fundacionales nuevos (tabla de arriba).
- 16 archivos originales bajo su techo (o eliminados/exceptuados según corresponda).
- `AdvancedExplorer.tsx` eliminado; `MOCK_DATA` eliminado o movido a fixture.
- `AGENTS.md` actualizado con las excepciones de `lib/countries.ts` y `hooks/use-toast.ts` junto a la de `components/ui`.
- Verificación manual en navegador de cada botón de exportar/compartir/copiar tras migrar a `useImageExport`, y de los filtros/paginación de `ExplorerView` tras su split.

## Estimation

| Milestone | Est. hours | Started | Finished | Actual hours | Notes |
|-----------|-----------|---------|----------|--------------|-------|
| Eliminar `AdvancedExplorer.tsx` | 0.25 | | | | Verificado muerto; confirmar build después |
| `types/stats.ts` — quitar/mover `MOCK_DATA` | 0.5 | | | | |
| `lib/countries.ts` — documentar excepción | 0.25 | | | | Sin cambio de código |
| `hooks/use-toast.ts` — documentar excepción | 0.25 | | | | Limpieza de redundancia es ticket aparte |
| `hooks/use-image-export.ts` | 2 | | | | Fundacional, usado 11 veces |
| `charts/period-tooltips.tsx` | 0.5 | | | | Fundacional |
| `lib/heatmap.ts` | 1.5 | | | | Fundacional |
| `PosterCard.tsx` compartido | 1 | | | | Fundacional |
| `lib/movie-taste.ts` | 1 | | | | Fundacional, solo para ExplorerView |
| `CustomPagination.tsx` + `MovieGridModal.tsx` | 0.5 | | | | Fundacional |
| `ViewingHeatmap.tsx` | 1 | | | | Antes que ViewingHabits |
| `Dashboard.tsx` | 1 | | | | |
| `ViewingHabits.tsx` | 3 | | | | Mayor complejidad de las medianas |
| `CastAndCrew.tsx` | 1 | | | | |
| `WatchedYearActivityChart.tsx` | 1 | | | | |
| `ReleaseYearTimeline.tsx` | 1 | | | | |
| `GlobalTastes.tsx` | 0.75 | | | | |
| `WorldMovieMap.tsx` | 1.25 | | | | |
| `LikesSection.tsx` | 0.75 | | | | |
| `TopInteractions.tsx` | 0.75 | | | | |
| `TopDecades.tsx` | 1 | | | | |
| `MostRewatched.tsx` | 0.75 | | | | |
| `ExplorerView.tsx` | 8 | | | | Mayor riesgo, hacer al final |
| **Total** | **28.25** | | | | |

## Changes

- 2026-09-17: ejecutado parcialmente. Hecho: `AdvancedExplorer.tsx` eliminado (confirmado muerto); `MOCK_DATA` eliminado de `types/stats.ts` (se dividió en `types/stats.ts` + `types/stats-extras.ts` porque además creció con los 12 campos nuevos del backend); excepciones de `lib/countries.ts` y `hooks/use-toast.ts` documentadas en `AGENTS.md`; `hooks/use-image-export.ts` creado; `CastAndCrew.tsx` migrado por completo (adoptó el hook, extrajo `PersonCard.tsx`, `SegmentedToggle.tsx`, `PersonStoryCard.tsx`); `Dashboard.tsx` migrado (extrajo `StatsOverview.tsx`, `hooks/use-scrollspy.ts`, y sumó 3 componentes nuevos para los datos del backend: `InsightStats.tsx`, `MovieExtremes.tsx`, `FranchiseAndStudios.tsx`). Verificado con `tsc --noEmit`, `vite build`, y manualmente en navegador con datos reales (incluida una prueba de exportación de imagen end-to-end).
  Pendiente: `ViewingHeatmap.tsx`, `ViewingHabits.tsx`, `WatchedYearActivityChart.tsx`, `ReleaseYearTimeline.tsx`, `GlobalTastes.tsx`, `WorldMovieMap.tsx`, `LikesSection.tsx`, `TopInteractions.tsx`, `TopDecades.tsx`, `MostRewatched.tsx` (adoptar `useImageExport`, extraer JSX de exportación) y `ExplorerView.tsx` (split completo, riesgo alto). Nota operativa importante: `ExplorerView.tsx` no admite NINGUNA edición incremental — el hook `guard-code-quality.js` calcula el tamaño del archivo resultante completo, así que cualquier `Edit` sobre él es rechazado mientras siga sobre 200 líneas, incluso cambios triviales. Su split debe hacerse en un solo lote de escrituras (archivo final + todos sus extraídos) en la misma pasada.
