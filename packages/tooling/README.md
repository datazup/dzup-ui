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
| `design:application-plan` | Generates a read-only `DESIGN_TO_DZUP_UI_PLAN.md` for an app that should apply `DESIGN.md` through dzup-ui overrides/components |
| `validate:tree-shake` | Checks that tree-shaking works for the main entry point |

## Resolution — `@dzup-ui/tooling/resolution`

One definition of how `@dzup-ui/*` specifiers resolve, for every consumer.

```ts
import { createDzupResolution } from '@dzup-ui/tooling/resolution'

const dzup = createDzupResolution({ mode: 'merged-source' })

export default defineConfig({
  resolve: { alias: dzup.alias, dedupe: dzup.dedupe },
  optimizeDeps: dzup.optimizeDeps,
})
```

### The mode is required

| Mode | Resolves to | Use it when |
|---|---|---|
| `merged-source` | the workspace package's **source** | developing inside this repository: an edit under `packages/*/src` shows up without a rebuild. The consumer is compiling the library, so it needs the Vue and TypeScript plugins to handle `.vue` and `.ts`-suffixed relative imports. |
| `externalized` | the package's **built** output | anywhere else, and whenever you want to prove a change survives the build. Never points at `src/`. |

There is **no default**, on purpose. Five configs used to hand-roll a
source-resolving alias map each; none of them recorded that a choice had been
made, and an application in another repository ended up compiling the library
from source without that ever being decided. Requiring the field turns an
accident into a sentence.

### It is derived, not written down

The alias list comes from each package's `exports` map — the same authority
`validate:exports` and the ownership manifest use — so a new subpath export
reaches every consumer the moment it is declared, and a subpath that is *not*
declared does not resolve in development either. The predecessor
(`workspaceAliases`) was a hand-maintained list of ten entries; the packages
declare thirty-one specifiers between them.

`merged-source` rewrites an `exports` target of `dist/x.js` to `src/x.ts` and
checks the file exists. Two cases fall outside that rule and both are labelled
in the result's `origin` field:

- **`generated-artifact`** — `@dzup-ui/tokens/css` and `/tailwind` are written
  by `yarn tokens:generate` and committed (ADR-12). There is no source file, so
  both modes resolve to `dist/`, and a token change needs the generator before a
  consumer sees it.
- **`override`** — a declared exception with a reason, for a source file that is
  not where the rule would look. There is exactly one
  (`@dzup-ui/core/styles` → `src/styles/base.css`, because `dist/core.css` is
  Tailwind's output and no `src/core.css` exists), and a spec fails if any
  override becomes derivable, so the table cannot grow back into a handwritten
  list.

### Ordering is load-bearing

`alias` is an **ordered array**, not a `Record<string, string>`. Vite matches a
string `find` by prefix in declaration order, so `@dzup-ui/tokens` placed ahead
of `@dzup-ui/tokens/css` resolves the stylesheet to `packages/tokens/src/css`, a
directory that does not exist. Entries are sorted most-specific-first, and a
spec asserts every subpath precedes the package it extends. Spread the array;
do not re-key it.

### An application outside this repository

```ts
// apps/web/vite.config.ts, in some other repo
import { resolve } from 'node:path'
import { createDzupResolution } from '@dzup-ui/tooling/resolution'

const dzup = createDzupResolution({
  mode: 'externalized',
  // Required here: this package's own node_modules is not next to `packages/`.
  root: resolve(import.meta.dirname, '../../../../ui/dzup-ui'),
  // Only what the app installs, so no alias points at a package it lacks.
  packages: ['@dzup-ui/core', '@dzup-ui/tokens', '@dzup-ui/contracts'],
})

export default defineConfig({
  resolve: { alias: dzup.alias, dedupe: dzup.dedupe },
})
```

`dedupe` matters most for such an app: `vue` and `reka-ui` are Core's peers, and
two copies of either is the failure overlays hit first — teleports land in the
wrong root, focus traps fight, and `provide`/`inject` silently misses.

See [`docs/resolution-external-consumers.md`](../../docs/resolution-external-consumers.md)
for the full external-consumer guide, including a patch proposal for
`@datazup/dzup-theme`.

`@dzup-ui/tooling` is private and unpublished. An external application reaches
this helper the way it reaches the rest of the library — a `portal:`/`link:`
entry, or a vendored copy — and that copy must be a re-export, never a
re-implementation. `@datazup/dzup-theme`'s `dzupAliases` is the cautionary
example: a hand-copied third version, seven entries, already missing
`@dzup-ui/core/ownership` and both `@dzup-ui/testing` specifiers, and pinned to
`merged-source` semantics for an application that has no business compiling the
library from source.

## Usage

Run from the monorepo root via:

```bash
yarn workspace @dzup-ui/tooling validate:boundaries
yarn workspace @dzup-ui/tooling validate:tokens
yarn workspace @dzup-ui/tooling design:application-plan --app ../apps/my-app --design ../apps/my-app/DESIGN.md
# etc.
```

Or via the workspace root convenience scripts in `ui/dzup-ui/package.json`.
