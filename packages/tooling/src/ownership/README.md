# Component ownership (TASK-OSS-P0-01)

One deterministic answer to **"who owns `DzFoo`, and what is it?"**, generated
into `packages/core/manifests/component-ownership.manifest.json`.

It exists because that answer was previously spread across four places that had
already drifted apart: the `PRO_COMPONENT_PREFIXES` list in
`packages/core/src/resolver.ts`, a second handwritten Pro list in
`packages/nuxt/src/module.ts`, hand-typed counts in READMEs, and
`public-api.manifest.json`. Packet P1 replaces the prefix guessing with a lookup
into this manifest; P0-02 merges it with the Pro tier's manifest of the same
shape into a cross-tier map.

```bash
yarn generate:ownership:core   # write the manifest
yarn validate:ownership        # freshness + schema + references + unclassified ratchet
```

## The rule that is not here

Nothing classifies by `Dz` prefix. A prefix cannot distinguish a Core component
from a Pro one — both tiers use it — and it cannot distinguish a component from
a compound part. Every `kind` below is backed by a named authority, and a symbol
no authority settles is emitted as `unclassified` **with its evidence**, which is
a report, not a failure.

## Authority per `kind`

| `kind` | Authority | Notes |
|---|---|---|
| `public-component` | the symbol is re-exported from a `.vue` file **and** a `packages/core/stories/**/<Symbol>.stories.ts` exists | the story is what declares a component public; `status` is copied from its `status:*` tag |
| `public-component` | the symbol is re-exported from a `.vue` file **and** `public-api.manifest.json#exports.providers` lists it | the `providers` section names public components outright (`DzThemeProvider` ships no story) |
| `compound-part` | `.vue`-declared, no story of its own, and a parent identified by the two rules below | `parentComponent` always resolves upward to a `public-component` |
| `composable` | declared under `src/composables/`, or named `use` + PascalCase | the second clause is what classifies `useTheme`, which ships from `src/providers/` |
| `type` | the barrel exports it as `export type` / `export interface` | corroborated against `public-api.manifest.json#exports.types`; a mismatch is recorded in the evidence |
| `recipe` | declared in a `*.variants.ts`, or listed in `#exports.variants` | `tv()` recipes (ADR-04) |
| `token-module` | declared in a `*.tokens.ts` | component token modules (ADR-17) |
| `compat-alias` | a `@dzup-ui/compat` adapter `.vue` that imports its target from `@dzup-ui/core` | `aliasOf` is read from that import, not from the name |
| `unclassified` | everything else | evidence states which authorities spoke and why they did not settle it |

### How a compound part finds its parent

Two independent authorities, and they must not contradict each other:

1. **the export list** — the longest *other* symbol in the same family barrel
   that is a strict prefix of this one (`DzCardBody` → `DzCard`);
2. **the wiring** — `provide(DZ_X_KEY)`/`inject(DZ_X_KEY)` in the `.vue` sources,
   and `useX()`/`useXContext()` composable pairs (ADR-08), which is the only
   authority for parts whose names are not prefixes (`DzTabList` → `DzTabs`).

They **agree** when the named parent provides the context, or when every
provider is itself part of the named compound (`DzToastViewport` is named for
`DzToast` and wired to `DzToastProvider`, which is a part of `DzToast`).
When exactly one authority speaks, it decides. When they contradict each other,
or when several unrelated providers are wired and no name disambiguates them,
the entry is `unclassified` with both readings recorded.

A part whose immediate parent is itself a part resolves upward to the nearest
`public-component`, because `parentComponent` is the name a consumer looks up.
A chain that never reaches one is downgraded to `unclassified` rather than left
pointing at nothing.

## Why the barrels, not `public-api.manifest.json`

`public-api.manifest.json` is an **input** to `yarn generate:exports`, which
writes `packages/core/src/index.ts` from the family `path` of each section — it
never reads the `exports` arrays. Those arrays are therefore descriptive, and
they have gone stale: on 2026-08-20 the generator found **47 symbols** exported
from family barrels that the public-api manifest lists in no section, and four
injection keys beyond its `injectionKeys` list.

So the authority for *what a package exports* is the transitive closure of its
entry barrels (`module-exports.ts`), reached from the `exports` map in
`package.json`. `public-api.manifest.json` is consulted as *classification
metadata* and its disagreements are printed as drift notes. Neither this
generator nor its validator ever edits an export, a barrel, or the public-api
manifest to make classification easier.

## `sourceCommit` and freshness

`sourceCommit` records the checkout that produced the file. The freshness gate
compares everything **except** that field: gating on it would fail the validator
on every unrelated commit while proving nothing about the entries. Determinism
is still provable the obvious way — two runs at the same commit are byte-identical:

```bash
yarn generate:ownership:core && yarn generate:ownership:core \
  && git diff --stat packages/core/manifests/component-ownership.manifest.json   # empty
```

## `unclassified-ceiling.json`

The count of `unclassified` entries may fall, never rise. It starts at the count
of the first run (29): 23 compound-component injection keys, plus `DzResolver`,
`cn`, `themeScript`, `getThemeScript`, `warnDeprecated`, and
`resetDeprecationWarnings`. Schema 1.0.0 has no `injection-key` or `utility`
kind, and inventing one silently would be exactly the kind of unilateral API
decision a generator must not make — so they are reported and the number is
lowered when a maintainer decides.

## The cross-tier map (TASK-OSS-P0-02)

`build-ownership-map.ts` merges one Core and one Pro manifest — same
`schemaVersion` major, one manifest per tier — into a single exact-name lookup:

```bash
yarn generate:ownership:map -- \
  --core packages/core/manifests/component-ownership.manifest.json \
  --pro  ../dzup-ui-pro/packages/pro/manifests/component-ownership.manifest.json \
  --out  build/ownership-map.json
```

The Pro input is a **file**, produced by a Pro checkout. Nothing in this
directory imports from `ui/dzup-ui-pro`, at build time or at runtime; the map
carries names and package strings only.

Three behaviours are the reason the map exists rather than a second list:

- **Unknown means `null`.** `lookupOwner(map, 'DzGanttRow')` is `null`, not
  `@dzup-ui/core`. Prefix-based resolution cannot express that, which is why
  `DzAppShell` — a **Core** component — resolves to Pro today.
- **Collisions fail closed.** A name both tiers export is recorded in
  `collisions`, is *withheld* from `symbols`, and makes the CLI exit non-zero.
  It is resolved only by an entry in `collision-decisions.json` naming a winning
  tier **and an ADR**; a decision that matches no collision is reported too, so
  the file cannot accrete dead entries. There are **no real collisions today**:
  Core `be76ddb` and Pro `origin/main` share zero symbol names (checked
  2026-08-20), which is exactly why the case needs `__fixtures__`.
- **Cross-tier parentage is a fact, not an error.** A Pro compound part whose
  parent is a Core component is reported under `crossTierRelationships`.

### Custody of the Pro input

`packages/pro/manifests/component-ownership.manifest.json` **does not exist on
Pro `origin/main`** as of 2026-08-20 — Pro `TASK-GOV-01` has not run, and the
local Pro checkout is on `esmir`, 290 commits behind. So the merge is exercised
against `__fixtures__/pro.manifest.json`, and P1-02's resolver work cannot claim
Pro coverage until a real Pro manifest is available.

## How P1 consumes this

`TASK-OSS-P1-02` generates a compact runtime lookup
(`packages/core/src/generated/component-ownership.ts`) containing only
`public-component` and `compound-part` entries — names and package strings, no
imports — so the resolver answers by exact name and returns `undefined` for
anything unknown. `TASK-OSS-P0-02` merges this manifest with a **Pro** manifest
of the same `schemaVersion` into a cross-tier map; the Pro input must come from a
Pro checkout at or after the commit that introduces Pro's own ownership
generator (Pro `TASK-GOV-01`), which today exists only on Pro `origin/main`.
