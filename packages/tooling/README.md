# `@dzup-ui/tooling`

Internal build tooling, validators, and quality-gate scripts for the dzup-ui monorepo. **Private — not published to npm.**

## What's in here

| Script | Purpose |
|---|---|
| `validate:boundaries` | Enforces package import boundaries (core must not import from pro) |
| `validate:interaction-contract` | Validates interactive components expose correct a11y API |
| `validate:tokens` | Color-lint: ensures no raw color literals in component source |
| `validate:exports` | Verifies `exports` maps match actual dist output |
| `validate:bundle` | Bundle-size assertions (configured in `bundlesize.config.json`) |
| `validate:changelog` | Checks that CHANGELOG entries exist for staged changes |
| `validate:dts` | Validates that `.d.ts` files are generated and exported correctly |
| `validate:peers` | Verifies peer dependency declarations across all packages |
| `generate:exports` | Regenerates `src/index.ts` barrel from `public-api.manifest.json` |
| `validate:tree-shake` | Checks that tree-shaking works for the main entry point |

## Usage

Run from the monorepo root via:

```bash
yarn workspace @dzup-ui/tooling validate:boundaries
yarn workspace @dzup-ui/tooling validate:tokens
# etc.
```

Or via the workspace root convenience scripts in `ui/dzup-ui/package.json`.
