# AGENTS

Guidance for AI coding agents working in this repository.

## Scope

- Keep changes focused. Do not fix unrelated issues.
- Follow existing hybrid conventions: TypeScript types live in `src/types/`, while most component implementations live in `src/elements/**/*.js`.
- Prefer updating existing docs over duplicating guidance here.
- This workspace can be paired with the sibling engine repo at `../leagueJS`. When a bug originates in shared league calculation or model behavior from `@lovebowls/leaguejs`, treat `../leagueJS` as the source of truth and make the primary fix there instead of only patching `node_modules`.

## Commands

- Install dependencies: `npm install`
- Run tests: `npm test`
- Watch tests: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Browser bundle build: `npm run build:browser`
- Full package build: `npm run build`
- Generate docs: `npm run docs`

## Agent Operating Rules

- Do not run builds or tests unless the user asks for them. This matches the existing repo-local editor rule in `.cursor/rules/building.mdc`.
- Use narrow validation when requested: prefer the smallest relevant Jest test file over the full suite.
- Preserve the current module format and import style. The package is ESM-first (`"type": "module"`) and Jest relies on the current module mapping in `jest.config.mjs`.

## Project Map

- `src/index.ts`: package entry point and exports
- `src/types/`: public TypeScript interfaces and types
- `src/elements/`: custom elements and their colocated styles/tests
- `src/utils/`: shared helpers such as data shaping, forms, element registration, and Temporal wrappers
- `src/libs/`: polyfills and local support libraries
- `src/test-data/`: reusable league fixtures for tests
- `docs/`: generated TypeDoc output; regenerate rather than editing generated files

## Component Conventions

- Components are custom elements built on `HTMLElement`, usually with Shadow DOM and attribute-driven updates.
- Keep styles colocated in `*-styles.js` files and preserve the existing naming/casing in each element folder.
- When emitting UI events, preserve the current custom-event pattern so parent consumers and Jest tests still observe bubbled/composed events.
- Prefer modifying the owning element or utility directly instead of adding cross-cutting wrappers.

## Testing Conventions

- Jest runs in JSDOM with setup from `jest.setup.js`.
- Tests live under `src/elements/__tests__/` and commonly use shared fixtures from `src/test-data/league-test-data.js`.
- When touching date behavior, check for existing Temporal mocks and fixtures before introducing new test helpers.

## Date Handling

- Prefer `TemporalUtils` from `src/utils/temporalUtils.js` instead of adding new `Date`-based logic.
- Keep Temporal values and ISO date strings aligned when data moves through events or component state.
- See [src/utils/README-Temporal.md](src/utils/README-Temporal.md) for the detailed date-handling rules.

## Reference Docs

- Project overview and package usage: [README.md](README.md)
- Host-side config wrapper API: [README-API.md](README-API.md)
- Temporal usage guide: [src/utils/README-Temporal.md](src/utils/README-Temporal.md)
- Generated API docs: [docs/index.html](docs/index.html)

## Multi-Repo Workflow

- `leagueElements` consumes `@lovebowls/leaguejs`; `../leagueJS` is the engine source repo.
- For cross-repo bugs, first identify whether the behavior is controlled in the consumer or the engine.
- If the root cause is in `leagueJS`, patch that repo first, then only make local consumer-side updates that are required for temporary validation or integration.
- Call out when a local `node_modules` patch is only a transient mirror of a real fix that belongs in `../leagueJS`.
