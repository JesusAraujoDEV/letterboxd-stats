# 2026-09-23 — Rewatch by year UI

## What changed
Added a `RewatchByYear` dashboard card that shows, per year, the share of
first watches vs rewatches as a stacked bar plus a count/percentage line.
Introduced the `RewatchYearEntry` type and the optional `rewatchByYear`
field on `MovieStats`, and wired the component into the `evolucion` section
of the dashboard next to `WatchYearBreakdown`. Added co-located Vitest tests.

## Why
The user wanted to see, for each year, how many films were first watches
versus rewatches (e.g. 2025: 88.6% first watches / 11.4% rewatches). The
backend exposes this via a new optional `rewatchByYear` field.

## How
`RewatchByYear.tsx` mirrors the `WatchYearBreakdown` card style. It renders
`null` when the field is missing or empty, so it is safe while the backend
field is not yet available. Widths of the stacked bar come straight from the
contract percentages; no aggregation happens in the view. Tests use Testing
Library with example data (null case, per-year counts, descending order).

## Promoted knowledge
None — behavior lives next to the component and its co-located test.

## Follow-ups
- [ ] None
