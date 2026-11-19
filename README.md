# darkwindow

A live sky map for amateur astrophotographers: for your location, it shows **where in the sky
you will catch the fewest visible satellite trails right now**.

**Status: in development.** Nothing works yet beyond a placeholder page.

- Site: https://dorofeeva-maria.github.io/darkwindow/
- Everything is computed in your browser; your coordinates never leave it.

## Develop

Requires Node.js (version in `.nvmrc`) and npm.

```sh
npm ci
npm run dev        # local dev server
npm run check      # lint + format check, type check, unit tests
npm run build      # production build into dist/
npm run e2e        # Playwright smoke test (+ screenshot checks on Linux)
```

See [`AGENTS.md`](AGENTS.md) for the rules and [`docs/architecture.md`](docs/architecture.md) for
the design.

## Data

Orbital data: [CelesTrak](https://celestrak.org/) (general perturbations, `GROUP=active`), used
under CelesTrak's terms of use. Each number of the brightness model will be listed with its
source in `data/SOURCES.md`.

## License

[MIT](LICENSE).
