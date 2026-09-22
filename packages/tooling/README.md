# `@dzup-ui/tooling`

Internal build tooling, validators, and quality-gate scripts for the dzup-ui monorepo. **Private — not published to npm.**

## What's in here

| Script | Purpose |
|---|---|
| `validate:boundaries` | Enforces package import boundaries (core must not import from pro) |
| `validate:interaction-contract` | Validates interactive components expose correct a11y API |
| `validate:tokens` | Color-lint: ensures no raw color literals in component source |
| `validate:exports` | Verifies `exports` maps match actual dist output, **and** that the six published packages still offer every subpath in `scripts/required-export-subpaths.json` — removing one is a breaking change under VERSIONING.md, and nothing else notices |
| `validate:published-imports` | Packs each published package with `yarn pack`, extracts the tarballs into a scratch consumer and `import()`s every `exports` subpath under plain Node, plus a consumer-flavoured `tsc --noEmit` over every `types` condition. The only gate that **loads** what it ships |
| `validate:bundle` | Bundle-size assertions (configured in `bundlesize.config.json`) |
| `validate:changelog` | Checks that CHANGELOG entries exist for staged changes |
| `validate:dts` | Validates that `.d.ts` files are generated and exported correctly |
| `validate:peers` | Verifies peer dependency declarations across all packages |
| `generate:exports` | Regenerates `src/index.ts` barrel from `public-api.manifest.json` |
| `design:application-plan` | Generates a read-only `DESIGN_TO_DZUP_UI_PLAN.md` for an app that should apply `DESIGN.md` through dzup-ui overrides/components |
| `validate:tree-shake` | Checks that tree-shaking works for the main entry point |
| `release:api-surface:record` | Records the public API surface of every published package, read through the TypeScript compiler from the **packed** declarations, into `api-surface/<sha>.json`. **Refuses on a dirty tree** — a baseline taken from a tree nobody can check out has no referent. `--force` writes an `admissible: false` snapshot for exercising the machinery |
| `release:api-diff` | Diffs the packed surface against that baseline, classifies each change against `VERSIONING.md` and maps it to the level the **0.x** policy requires (breaking = `minor`, additive = `patch`, `major` refused). Also measures what `yarn generate:exports` would change, without writing anything |
| `release:evidence` | CycloneDX 1.6 SBOM per tarball plus an aggregate, a vulnerability report keyed by exact resolved version, a licence report using the **same** allow/block sets `validate:licenses` gates on, sha256+sha512 per tarball and per file, and an unsigned in-toto/SLSA provenance statement |
| `release:report` | Renders the eight sections 08-11 doc 08 requires of a release report, as a pure projection of the bundle's own artifacts. With no gate ledger it reports sections 2 and 3 as **unrun**, never as green |
| `release:bundle` | `release:api-diff && release:evidence && release:report` |
| `test:vue-next` | ADVISORY forward-compatibility lane: the unit + contract suite against the Vue 3.6 release candidate. Pins every `@vue/*` package in lockstep with `resolutions`, installs, runs, restores **both** `package.json` and `yarn.lock` and verifies the restore. Exit 2 (not 1) when it could not run — including when `vue` did not resolve to the pinned version, which is a run that measured the wrong thing |
| `test:min-peer` | The **minimum declared peer** lane: derives the floor of `vue` and `reka-ui` from `peerDependencies` at run time (never a literal — a second declaration drifts), pins it, installs, **asserts the version on disk equals the floor**, then runs typecheck plus the core/contracts/nuxt suites. Unlike `test:vue-next` it is **not advisory**: a failure says a peer range this repository publishes is false |

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
  by `yarn tokens:generate` into `dist/`, which is **gitignored and published,
  not committed** (ADR-12; corrected 2026-09-04, TASK-N0-04 — this line
  previously said "and committed"). They reach consumers through the tokens
  package's `files: ["LICENSE", "dist"]` at pack time. There is no source file,
  so both modes resolve to `dist/`, and a token change needs the generator
  before a consumer sees it — and, because nothing tracks the output, before a
  fresh clone has one at all.
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
