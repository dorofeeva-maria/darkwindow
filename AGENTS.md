# darkwindow — agent instructions

A static web app (TypeScript, React, Vite) that shows where in the sky there are the fewest
visible satellite trails right now, for the observer's location. Everything runs in the browser;
it is published on GitHub Pages. Design: [`docs/architecture.md`](docs/architecture.md).

## Run and check

```sh
npm ci                 # Node version: .nvmrc
npm run dev            # dev server
npm run check          # biome (lint + format), tsc (core, app, node configs), vitest
npm run build          # vite build -> dist/
npm run e2e            # Playwright: builds, serves dist/, smoke test; screenshots on Linux only
npm run e2e:update     # regenerate screenshot baselines in the Playwright container (Docker)
npm run fix            # apply biome fixes and formatting
```

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run check`, `npm run build`, `npm run e2e` on
every push and PR to `main`, inside the same Playwright image as `e2e:update`.
`pages.yml` deploys `dist/` to GitHub Pages on every push to `main`.

Screenshots change only when the UI is meant to change: then regenerate the baselines with
`npm run e2e:update` and commit the PNGs together with the change.

## Rules

- Everything in this repo is in English: code, docs, commits, PRs.
- Layers: `src/core` -> only `src/core/adapters`; `src/worker` -> core; `src/app` -> core (types,
  projection) and worker; `scripts` -> core. Core knows nothing about the network or files.
- `src/core` imports no DOM, React or Node APIs and never reads the clock: time and data are
  arguments (`tsconfig.core.json` has `lib: ES2023`, `types: []`).
- satellite.js and astronomy-engine are called only from `src/core/adapters/`.
- "Is this trail visible" logic lives only in core, with tests; worker, scripts and UI do not
  duplicate it.
- CelesTrak is called from one place in code (`src/app/orbits.ts`; in the fallback path also
  `scripts/fetch-orbits.ts`): at most once per 2 hours, no retries on a non-200 response. Tests
  and CI never call CelesTrak; they use the fixture.
- Observer coordinates never go into the URL, counter events or logs. For visit counting,
  `localStorage` holds only `dw.lastNight` and `dw.returned`.
- Every number of the brightness model has a source in `data/SOURCES.md` or is marked as an
  assumption.
- Nothing personal: no real people's names, places, or links to private material. Examples,
  tests, README and docs use a general list of large cities (London, Santiago, Tokyo, Nairobi...).
- No secrets; none are needed. Configuration is `VITE_*` variables; see `.env.example`.
- Dependencies are pinned to exact versions (`.npmrc` has `save-exact`); a new dependency comes
  with its reason and license in the PR. No GPL/AGPL code (the project is MIT).
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), one change each.

## Do not

- Weaken a check (disable a rule, skip a test, raise a screenshot threshold) to make it pass.
- Commit `.env`, build output, test reports or personal data.
- Call CelesTrak from tests, CI or a loop.
