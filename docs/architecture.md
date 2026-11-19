# Architecture

## Picture

```
observer's browser
  React UI --> Web Worker (core: OMM->SGP4, Sun, Earth's shadow, brightness by class, camera, map)
     |            ^ coordinates stay here
     |            | orbits: Cache Storage, refreshed at most every 2 h
     |            +-- CelesTrak gp.php?GROUP=active&FORMAT=json   (main path, if CORS allows)
     |                or /data/orbits.json on Pages <-- GitHub Actions every 6 h (fallback)
     +--> visit counter: events without IDs or coordinates
GitHub Pages: the static site
```

One public repo, no server, no database.

## Decisions

- **Static site, one repo.** Site and data ship together; one maintainer.
- **Computation in the browser** with satellite.js in a Web Worker: any point, moment and camera
  without precomputation; coordinates never leave the browser; zero cost. `json2satrec` reads OMM
  JSON and keeps 6-digit catalog numbers.
- **Orbits.** The browser fetches `GROUP=active&FORMAT=json` from CelesTrak itself, keeps it in
  Cache Storage with `fetchedAt`, refetches no sooner than 2 h later, and on an error uses the
  cache without retries. If CORS blocks it, the fallback is a `data.yml` workflow (every 6 h plus
  manual runs) that makes one request, fails on a non-200 response without retries, and publishes
  `orbits.json` on Pages, with "Orbital data: CelesTrak" shown on the page.
- **Brightness by class, with sources.** A class is chosen by object-name prefix and orbit
  (`data/classes.json`). Apparent magnitude `m = mag1000 + 5·lg(range / 1000 km) + diffuse-sphere
  phase correction`; illumination from Earth's shadow; a trail is visible with probability
  `P(m < limit)` under a normal spread `sd`; a map cell is the sum of probabilities (expected
  visible trails per hour). Every `mag1000` and `sd` has a source or an "assumption" mark.
- **Speed budget.** A map in <= 3 s on a laptop and <= 8 s on a mid-range phone; redraw <= 50 ms.
  If missed, in order: coarse 5-minute culling below the horizon and in shadow, a 60 s step,
  several workers.
- **Map.** Canvas 2D, azimuthal equidistant projection (zenith at the center), ~3° grid, colors
  from CSS tokens, `devicePixelRatio`.
- **UI.** React + Vite, one page, no router or store; the moment is in the URL, the place is not.
  Night red mode: `data-mode="red"` on `<html>`, all colors are CSS variables.
- **Returning visitors.** The date of the last night in `localStorage` and an event without an
  ID (`return`, `return-first`); a "don't count me" switch clears both keys and sends nothing.

## Layout

```
src/core/          time, orbits (OMM->satrec), geometry, sun, shadow, classes, brightness,
                   camera, visibility, skymap, targets, protocol.ts;
                   adapters/ (satellite.js, astronomy-engine)
src/worker/        Web Worker: protocol requests, satrecs in memory
src/app/           React UI; canvas/ (projection, drawing); theme/ (tokens, red mode);
                   orbits.ts (loading and caching orbits); telemetry.ts (counter and returns)
scripts/           night-report.ts (Node, tsx); fetch-orbits.ts (fallback path only);
                   e2e-update.mjs (screenshot baselines)
data/              classes.json, targets.json, SOURCES.md
test/fixtures/     small OMM snapshot (with an object >= 100000, CelesTrak attribution)
e2e/               Playwright: smoke, screenshots at 360 and 1280 px, both modes
docs/              architecture.md; method.md (what counts as a visible trail, classes, sources)
.github/workflows/ ci.yml, pages.yml; data.yml (fallback path only)
```

Folders appear as the features that need them are built.

## Boundaries

core -> only adapters; worker -> core; app -> core (types, projection) and worker;
scripts -> core. Core knows nothing about the network or files.

## Data

- **Orbits:** the CelesTrak response as is (OMM JSON array), or the same copy on Pages.
  `NORAD_CAT_ID` has up to 6 digits and is unique.
- **`data/classes.json`:** `cls` (unique), `match` (name prefixes and/or an orbit condition,
  e.g. `geo`: 0.98–1.02 rev/day, e < 0.01), `mag1000`, `sd`, `source` (a key in
  `data/SOURCES.md`) or `assumption: true`, `note`.
- **`data/targets.json`:** `id` (M42), `name`, `raDeg`, `decDeg`, `type`; `id` unique. Built from
  general facts (Messier + ~50 NGC/IC); CC BY-SA catalogs are not copied.
- **Browser (`localStorage`):** camera profile, target list, coordinates only on "remember";
  `dw.lastNight`, `dw.returned`.
- **Worker protocol** (`src/core/protocol.ts`): request `{observer, t, camera, windowMin}` ->
  response `{grid, cells: Float32Array, computedAt}`.

## Interfaces and configuration

Serves static files from Pages (and `/data/orbits.json` in the fallback path). Consumes
`https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json` and the counter at
`VITE_COUNTER_URL`.

`VITE_ORBITS_URL` (default CelesTrak; fallback `./data/orbits.json`), `VITE_COUNTER_URL`
(empty = off), `VITE_COUNTER_KIND` (`goatcounter|umami`). See `.env.example`. No secrets.

## Tooling

Biome (format, lint); `tsc` over `tsconfig.core.json`, `tsconfig.app.json` and
`tsconfig.node.json`; Vitest for core on the fixture; Playwright for the page with fixed orbits,
time and coordinates. Screenshots at 360 and 1280 px are compared on Linux only: CI runs in the
same Playwright image that `npm run e2e:update` uses to write the baselines.

## Principles (checkable)

1. `src/core` imports no DOM, React or Node API and reads no clock.
2. satellite.js and astronomy-engine are called only from `src/core/adapters/`.
3. Visibility logic lives only in core.
4. CelesTrak is called from one place, at most every 2 h, no retries on a non-200; never from
   tests or CI.
5. Observer coordinates never reach the URL, counter events or logs.
6. Every number of the brightness model has a source or an "assumption" mark; no GPL/AGPL code.
7. Nothing personal: examples use a general list of large cities.
8. No secrets.
