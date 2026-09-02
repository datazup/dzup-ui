# TASK-N2-A3 — `llms.txt` freshness gate + `.md` endpoints

> Handoff for [`consumer-agent-surface-tasks.md` → TASK-N2-A3](../consumer-agent-surface-tasks.md).
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-09-01 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD:** `51dec93c73214af2d1e424e3454a7122691fea48` (`51dec93 new version for themes`)
> **Worktree at run start:** **dirty — 165 entries** (the uncommitted N1 evidence
> program **plus** N2-T1 DTCG **plus** N2-A1 MCP governance **plus** N2-A2
> component-meta). Nothing was reverted, stashed, cleaned or committed.
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`.
>
> **Evidence class: `locally qualified, worktree-dirty`.** Not CI, not release,
> not production.
>
> **Nothing is committed, pushed, dispatched to CI, or published.**
> **Context7 was evaluated only — no file was created, no registration was made,
> no external request was issued.**

---

## 1. Headline

See §11 for the table. The one-line version: **the file coding agents actually
read was generated, byte-fresh, ungated — and describing 70 % of the library.**
It is now rendered from the one metadata extraction, committed, gated by
`yarn validate:llms`, and every one of the 144 public components is discoverable
by an MCP client (`catalogVisibilityUnreachable` **43 → 0**).

## 2. The stop condition fired, and it was the right call

> `<stop_conditions>` — *"Stop when the two shipped copies disagree in a way that
> implies an intentional per-app difference — surface it instead of unifying
> silently."*

**They do, and the difference is deliberate, documented in code, and
cross-linked in both directions. They were never two copies of one document.**

| | `apps/landing/public/llms.txt` | `apps/storybook/public/llms.txt` |
|---|---|---|
| H1 | `# dzup-ui blocks` | `# dzup-ui components` |
| Subject | the **87-block** ready-made catalog | the **@dzup-ui/core component API** |
| Public URL | `/llms.txt` | `/storybook/llms.txt` |
| Produced by | `apps/landing/scripts/build-registry.ts` → `src/blocks/llmsText.ts` | `apps/storybook/scripts/build-llms.mjs` |
| Derived from | the `BLOCKS` array + each block's `?raw` SFC | `public-api.manifest.json` + `*.types.ts` + `.vue` headers |
| Tracked in git | **yes** | **no** — `apps/storybook/.gitignore:14` |
| Cross-links to the other | yes — `COMPONENT_API_NOTE` in `llmsText.ts:62` | yes — footer line in `build-llms.mjs:468` |

`llmsText.ts:56-65` states the intent in prose: *"the library's own `llms.txt`
… is generated separately and served from the Storybook build at
`/storybook/llms.txt`. Pointing assistants at it lets them understand the
primitives each block is built from."*

**So "delete any second handwritten copy" has no referent, and "both shipping
apps consume the same generated files" was already true in the only sense that
applies:** the storybook build is nested into the landing dist, so
`apps/landing/dist/storybook/llms.txt` is **byte-identical** to
`apps/storybook/storybook-static/llms.txt` (`sha256 ef5a58ad1e0ff8d5…`, 26,522 B,
three copies, one hash — measured in §3a). There is exactly **one** component-API
document and exactly **one** blocks document, each served from one URL.

**Neither was handwritten.** The task's gap statement (A5-1) says llms.txt is
"the same drift class as the hand-typed README versions P2-02 fixed". Measured:
it is not. Both were already generated. **The real gap is narrower and worse**
— see §3.

## 3. Step 1 — the drift, measured before anything was changed

### 3a. Every copy on disk, by hash

```
apps/landing/public/llms.txt                     30316 B  0c57f724c588b87f  tracked
apps/landing/public/llms-full.txt               517939 B  1a958b8c5850eb29  tracked
apps/storybook/public/llms.txt                   26522 B  ef5a58ad1e0ff8d5  git-ignored
apps/storybook/public/llms-full.txt             162861 B  e3013737642efe62  git-ignored
apps/landing/dist/llms.txt                       30316 B  0c57f724c588b87f  build output
apps/landing/dist/llms-full.txt                 517939 B  1a958b8c5850eb29  build output
apps/storybook/storybook-static/llms.txt         26522 B  ef5a58ad1e0ff8d5  build output
apps/storybook/storybook-static/llms-full.txt   162861 B  e3013737642efe62  build output
apps/landing/dist/storybook/llms.txt             26522 B  ef5a58ad1e0ff8d5  build output
apps/landing/dist/storybook/llms-full.txt       162861 B  e3013737642efe62  build output
```

**Two distinct documents, five hashes, ten files.** Every `dist`/`storybook-static`
copy is byte-identical to its `public/` source, so the deployment path itself
introduces no drift.

### 3b. Byte-drift against the current generators: **zero, in both pairs**

Both were re-derived and compared before a line was changed.

```
$ node apps/storybook/scripts/build-llms.mjs        # the OLD extractor, re-run
[llms] wrote 159 components across 11 families → ./apps/storybook/public/llms.txt (26139 B), …
$ diff <snapshot> apps/storybook/public/llms.txt    → 0 differing lines
$ diff <snapshot> apps/storybook/public/llms-full.txt → 0 differing lines

$ tsx apps/landing/scripts/build-registry.ts --check-llms   # READ-ONLY, added by this task
  ✓ blocks llms docs fresh — 87 blocks across 12 categories → llms.txt, llms-full.txt
```

*(26,139 is the JS character count the old script logged; the file is 26,522 bytes — 383
multi-byte UTF-8 characters, the em-dashes and middots. Not a discrepancy.)*

**So the gap statement A5-1 is wrong on its face and right underneath it.**
Neither file was hand-typed, and neither had drifted a byte. What neither had
was a gate: nothing in the repository would have noticed if they *did* drift,
and one of them had drifted from *reality* while agreeing perfectly with its own
generator.

### 3c. The real drift — the storybook copy is fresh, and wrong

`build-llms.mjs` drove its roster from `packages/core/manifests/public-api.manifest.json`.

| Measure | Value |
|---|---|
| symbols in `public-api.manifest.json` | **159** across 11 family groups |
| …that are `public-component` in the ownership manifest | **101** |
| …that are `compound-part` | **58** |
| real `public-component` symbols | **144** |
| **public components ABSENT from the shipped `llms.txt`** | **43 (29.9 %)** |
| compound parts also absent | 6 |
| total records absent | **49 of 208 (23.6 %)** |

The 43, verbatim:

```
DzAffix DzAnchor DzAppShell DzAsyncBoundary DzBackTop DzBlockUI DzCalendar DzCascader
DzCodeBlock DzConfirmDialog DzCopyButton DzDataView DzDescriptions DzErrorBoundary DzFab
DzFieldArray DzFloatLabel DzImageComparison DzInfiniteScroll DzInplace DzInputMask DzKnob
DzMasonry DzMegaMenu DzMention DzMeterGroup DzOrderList DzPageHero DzPanel DzPopconfirm
DzProvider DzQRCode DzRating DzSidebar DzSpeedDial DzTagsInput DzThemeProvider DzToolbar
DzTour DzTreeSelect DzWatermark GovernanceBadge TeamMemberBadge
```

That is A1's finding **F1** with its cause named: **`llms.txt` was the delivery
mechanism**, and `list_components` / `get_component` read it. An agent asking
dzup-ui what it ships was told about 101 of 144 components — and `DzAppShell`,
`DzCalendar`, `DzDataView` and `DzRating` are not obscure.

Two further defects in the same file, neither previously recorded:

- **It was a second component-API extractor.** 567 lines that parsed
  `packages/contracts/src/*.types.ts` and every `*.types.ts` with its own
  TypeScript AST walker, resolved `extends` chains and generic parameters by
  hand, and scraped each `.vue` header with regexes. Constraint **B9** exists to
  prevent exactly this; the file predates B9 and violated it.
- **Its output was git-ignored** (`apps/storybook/.gitignore:14`). Nothing in
  the repository recorded what dzup-ui was telling coding agents about itself.
  A reviewer could not see a change to it, and a "committed output vs
  regenerated output" gate — the shape `validate:readme-facts` uses — had
  nothing to compare against.

### 3d. And one defect in the *structural* validator that did exist

`apps/storybook/scripts/validate-llms.mjs` checked balanced fences, square GFM
tables and a single H1. All three are worth checking, and all three are now
checked — **on four documents instead of two**, because it only ever ran against
`apps/storybook/public/`. The landing site's two tracked, agent-facing markdown
documents were outside every gate in the repository.


## 4. What was built

| # | File | Status | API effect |
|---|---|---|---|
| B1 | `packages/tooling/src/llms/llms-content.ts` | **new**, 187 lines | **The only hand-written agent-facing prose in the repository.** Titles, the `>` summary, the conventions bullets, the install-line template, family labels and order, the cross-links, the fidelity and absent-example sentences. No counts, no component names, no defaults. |
| B2 | `packages/tooling/src/llms/render-llms.ts` | **new**, 508 lines | Pure `artifact → markdown`. No filesystem, no TypeScript program, no `.vue`. Exports `renderIndex`, `renderFull`, `renderComponentSection` (the per-page seam D1 needs, §14) and the derivations `taxonomyMembers` · `taxonomyLine` · `modelBindings` · `ownPropNames` · `inheritedPropCount` · `eventDescription` · `groupByFamily`. |
| B3 | `packages/tooling/src/llms/generate-llms.ts` | **new**, 147 lines | `yarn generate:llms`, plus `--check`. Writes the two canonical outputs. |
| B4 | `packages/tooling/src/llms/render-llms.spec.ts` | **new**, 321 lines, **28 tests** | Fabricated records for each §13 rule; then the real artifact, asserted for one-H1, full coverage, no host paths, balanced fences, determinism, and agreement with what is on disk. |
| B5 | `packages/tooling/src/validators/llms.ts` | **new**, 539 lines | `yarn validate:llms`. Eight clause groups (A–H). Imports no `@dzup-ui/*` package. |
| B6 | `packages/tooling/src/validators/llms.spec.ts` | **new**, 192 lines, **23 tests** | Every pure clause driven to failure, plus a real-repository run with `--no-blocks`. |
| B7 | `packages/tooling/src/validators/llms-ceilings.json` | **new** | Four downward-only ratchets, each with its measured reason. |
| B8 | `packages/core/docs/llms.txt` | **new, generated, committed**, 40,774 B / 660 lines | The component-API index. **208 components, 12 families.** |
| B9 | `packages/core/docs/llms-full.txt` | **new, generated, committed**, 419,922 B / 8,644 lines | Per-component install line, metadata, props / events / slots / exposed tables, and a usage snippet or a stated absence. |
| B10 | `packages/tooling/src/meta/component-meta.ts` | modified | Schema **1.0.0 → 1.1.0**, additive: record-level `description` + `descriptionSource` (`ComponentDescriptionSource`), and artifact-level `taxonomies`. |
| B11 | `packages/tooling/src/meta/extract-component-meta.ts` | modified | `componentDescription()` (both SFC header dialects) and `contractTaxonomies()` (the ADR-02 unions, through the checker's own `ts.Program`). |
| B12 | `packages/tooling/src/meta/generate-component-meta.ts` | modified | Two lines: spread the description pair into each record, resolve the taxonomies once. |
| B13 | `packages/tooling/src/meta/extract-component-meta.spec.ts` | modified | **+9 tests** (17 → 26) for the two new functions. |
| B14 | `packages/tooling/src/validators/component-meta.spec.ts` | modified | Fixtures updated for schema 1.1.0. Two `tsc` errors this change introduced were found and fixed — see finding **F-6**. |
| B15 | `packages/core/docs/component-meta.json` | regenerated | +`description`/`descriptionSource` on 208 records, +28 `taxonomies`. **205 / 208 descriptions.** |
| B16 | `apps/storybook/scripts/build-llms.mjs` | **rewritten**, 567 → 73 lines | Was a second component-API extractor. Now copies the two committed files into `public/`. **Fails loudly** if the generated source is absent. |
| B17 | `apps/storybook/scripts/validate-llms.mjs` | **deleted** | Structure-only, ran on two files. Absorbed into B5's clause group C, which runs on four. |
| B18 | `apps/storybook/package.json` | modified | `validate:llms` delegates to the root gate, so `.github/workflows/ci.yml` needs **no change** — verified by running the CI command verbatim. |
| B19 | `apps/storybook/.gitignore` | modified | Comment corrected: the two `public/llms*.txt` are now *copies* of committed files. |
| B20 | `apps/landing/scripts/build-registry.ts` | modified — **additive** | `--check-llms`: a **read-only** freshness probe for the blocks documents that returns before the `rm -rf`. |
| B21 | `packages/mcp/src/registry.ts` | modified | Two local-mode fallback candidates (`/storybook/llms{,-full}.txt` → `packages/core/docs/`), and the component-name pattern widened from `Dz[A-Za-z0-9]+` to `[A-Z][A-Za-z0-9]*` in **both** parsers. **Behaviour change to a published surface — owner decision D1.** |
| B22 | `packages/mcp/scripts/generate-tool-surface.ts` | modified | `catalogVisibility` now measures against `packages/core/docs/llms.txt` with the package's own parser, instead of against `public-api.manifest.json`. |
| B23 | `packages/mcp/src/registry.spec.ts` | modified | **+1 test**: the A1-F1 regression (`DzRating`, `DzAppShell`, `DzCalendar`, `GovernanceBadge`). The `HAS_COMPONENT_DOCS` guard now resolves to a **committed** file, so those cases run on a clean checkout instead of skipping. |
| B24 | `packages/mcp/scripts/e2e-smoke.mjs` | modified | **+2 real JSON-RPC calls** against the built `dist/`: `get_component(DzRating)` and an unfiltered `list_components()`. |
| B25 | `packages/mcp/README.md` · `docs/mcp-tool-surface.json` | regenerated + prose corrected | The hand-written "**Known gap:** … omits **43** symbols" block was **true when A1 wrote it and false after this change**; rewritten. |
| B26 | `packages/mcp/src/index.ts` · `src/tools.ts` | modified | Comments claiming `list_components`/`get_component` are blind to 43 components corrected. |
| B27 | `packages/tooling/src/validators/mcp-surface-ceilings.json` | modified | `catalogVisibilityUnreachable` **43 → 0**; `toolsWithoutE2eSmoke` **6 → 5**. |
| B28 | `package.json` (root) | modified — **additive** | `generate:llms`, `validate:llms` (+ `//` doc keys), one link appended to `validate:all`. |

**Public API effect on `@dzup-ui/mcp`:** no new export, no new tool, no schema
change. One **behaviour** change: `list_components` and `get_component` now
return every public component instead of 101 of 144. That is the defect being
fixed, and it is why D1 is an owner decision rather than a footnote.

**Dependency effect: none.** No package added; `yarn.lock` untouched.

## 5. The design, and the one B9 decision inside it

### 5a. Two files, one projection

```
packages/core/docs/component-meta.json     ← the ONE extraction (N2-A2)
              +
packages/tooling/src/llms/llms-content.ts  ← the ONLY curated prose
              ↓  yarn generate:llms   (pure; read the artifact, write two files)
packages/core/docs/llms.txt  ·  packages/core/docs/llms-full.txt   ← COMMITTED
              ↓  apps/storybook build:llms   (copy, nothing else)
apps/storybook/public/  →  storybook-static/  →  landing dist /storybook/
              ↓
@dzup-ui/mcp  list_components · get_component      (production: over HTTP)
```

The output is **committed** because the gate the task asks for — "fails when
committed output differs from regenerated" — needs a committed output. It was
previously a git-ignored build artifact, so no reviewer could see a change to
what dzup-ui tells coding agents about itself. `packages/core`'s npm `files` is
`["LICENSE","README.md","dist"]`, so `docs/` does **not** ship to npm: committing
it costs a diff, not a download.

### 5b. The B9 decision — the missing fields went into the extractor, not the renderer

`vue-component-meta` answers *"what is this component's API"*. It does not
answer *"what is this component"*, and it does not expand a named type alias.
Two things `llms.txt` needs were therefore missing from A2's artifact:

| Wanted | Where it could have come from | Where it came from |
|---|---|---|
| a one-line component description — the most-read string in `llms.txt`, and the payload `list_components` returns | the `.vue` header, parsed in the renderer — a second extractor | **`componentDescription()` in `packages/tooling/src/meta/`**, schema 1.1.0 |
| the ADR-02 frozen taxonomy members (`solid` `outline` …) | `@dzup-ui/contracts`'s `.types.ts`, parsed in the renderer — same objection | **`contractTaxonomies()`**, through the checker's own `ts.Program`, resolved once per run |

Constraint **B9** states the rule exactly: *"A missing field is added to
`packages/tooling/src/meta/` and regenerated, never re-derived in a docs app or
in `@dzup-ui/mcp`."* Both additions follow the precedent A2 set for emit
descriptions: the **same** `ts.Program` and the **same** `ts.TypeChecker` the
extractor already built, not a second parser. The alternative — hand-curating
144 descriptions in the intro source — is the hand-typed-facts class this
program has now found five times.

`vue-component-meta`'s `PropertyMeta.schema` was checked first and does **not**
expand these aliases: measured on `DzButton`, `schema` comes back as the string
`"ButtonVariant | undefined"`, identical to `type`. That is why the resolution
is explicit rather than free.

**Measured result of the two additions:**

| | value |
|---|---|
| component descriptions extracted | **205 / 208** |
| …public components | **141 / 144** |
| …compound parts | **64 / 64** |
| public components with none | **3** — `DzAsyncBoundary`, `DzErrorBoundary`, `DzFieldArray`, each with **no documentation header at all** |
| ADR-02 taxonomies resolved | **28** |

### 5c. Equivalence with what the old generator published — 159 / 159 identical

Replacing an extractor is only safe if nothing it published is lost. Every
description the shipped `llms.txt` carried was compared against the new
artifact's:

```
old llms.txt symbols:              161   (159 components + 2 mis-parsed Conventions bullets)
identical description:             159
differing:                           0
absent from the new artifact:        0
covered ONLY by the new artifact:   49   (43 public components + 6 compound parts)
```

**Zero regressions, 49 additions.** The two header dialects also recovered
`DzProvider` and `DzThemeProvider`, whose headers are `<!-- … -->` blocks the old
`/** … */`-only regex could not see at all.

### 5d. What llms-full.txt now carries per component

Everything the task's `<generate>` clause names, and the §13 rules govern each:

- **Install line** — `` `npm i @dzup-ui/core` — then `import { DzButton } from '@dzup-ui/core'` `` (curated template, name substituted) and the real entry points from `subpaths`.
- **Metadata** — risk tier, status, taxonomy, v-model bindings, ADR-19 anatomy parts where declared.
- **Props** — name, resolved type, required, **"Declared default"**, description, with `—` for `null` and the literal `undefined` printed as `undefined`. The count line says how many are inherited from `@dzup-ui/contracts`.
- **Events** — payload tuple and description; `descriptionSource` respected, `modelDerived` events labelled *"synthesised by `defineModel` (ADR-16)"*, authored-but-undescribed printed `—`.
- **Slots** — slot-prop type only where `hasPayload`, `—` otherwise (never the literal `any`).
- **Exposed on `ref`** — names and types, **no description column at all**, because all 26 in the catalog are undocumented (A2 F-2).
- **Usage** — the story's static `<template>` in a `vue` fence where one exists, else the verbatim story source in a `ts` fence, else a stated absence. Compound parts point at their parent. Nothing is synthesised.
- **An empty member set is stated, in one of two different sentences.** A section that just omits the tables reads to an agent as *"this component takes nothing"* — a claim, and for one component a false one. Which claim is true depends on `typesSource`: present means the component declares an API and the extractor could not read it (`DzAccordion`, finding **F-1**); absent means it is a bare sub-part that really declares nothing (the four separators / `DzDataGridHeader`). **Publishing the wrong one of those is precisely the failure this document exists to prevent**, so they are different sentences, and the first says so explicitly: *"That is an extraction gap, **not** a statement that it has none."*

## 6. Proof the gate can fail — eight seeded violations

Every clause group was driven to failure, the verbatim error captured, the seed
reverted, and **all eight touched files hashed byte-identical to their pre-seed
state**. This is mandatory in this lane because it has already earned its keep
twice: A1's **F8** (a lint autofix that would have silently changed a published
JSON Schema) and A2's **F-4** (a clause of its own that could not fail).

### S1 · the committed output hand-edited

Seed — in `packages/core/docs/llms.txt`, one bullet:

```diff
-- **DzButton** — Primary button component.
+- **DzButton** — SEEDED: a hand-edited description.
```

```
✗ [freshness/components] the committed llms docs disagree with a fresh render:
✗ packages/core/docs/llms.txt is STALE — it disagrees with a fresh render of
  packages/core/docs/component-meta.json plus the curated intro source
  (committed 40283 chars, fresh 40274 chars; first difference at line 24).
  Run `yarn generate:llms`.
```

### S2 · the curated prose changed without regenerating

Seed — `INDEX_TITLE` in `llms-content.ts` → `'dzup-ui components SEEDED'`.

```
✗ packages/core/docs/llms.txt is STALE — … first difference at line 1.
```

The clause the `<gate>` requirement names, fired from the **curation** side.
S1 fired it from the artifact side.

### S3 · the served copy stops being produced — and the substring clause would NOT have caught it

Seed — the copy statement in `apps/storybook/scripts/build-llms.mjs` replaced by
a comment naming the same file:

```diff
-    await copyFile(from, resolve(appRoot, dest))
+    // SEEDED: copy of packages/core/docs/llms.txt into public/llms.txt removed
```

The seeded file **still contains the string `llms.txt` five times**, so A2's
first-version clause (`source.includes('component-meta.json')`) would have stayed
green here. Matching the CALL:

```
✗ [reachability] apps/storybook/scripts/build-llms.mjs no longer copies the generated
  llms docs into apps/storybook/public/. Storybook serves that directory and the landing
  build nests the result at /storybook/, so without the copy the deployed
  /storybook/llms.txt is stale or missing and every MCP client's list_components /
  get_component answers from whatever was last built — while a local checkout keeps
  working through the packages/core/docs fallback, so the failure is invisible in
  development.
```

### S4 · a second extractor reappears (constraint B9)

Seed — `import ts from 'typescript'` added to `build-llms.mjs`.

```
✗ [b9] apps/storybook/scripts/build-llms.mjs parses component sources again. There is
  exactly one component-API extraction in this repository
  (packages/core/docs/component-meta.json). A field this script needs is added to
  packages/tooling/src/meta/ and regenerated, never re-derived here — that second
  extractor is what shipped 43 components' worth of blind spot.
```

### S5 · a catalog count hand-typed into the curated prose

Seed — `CONVENTIONS_INTRO` → `'These hold for all 144 components below, …'`.

```
✗ [curated] packages/tooling/src/llms/llms-content.ts states a catalog count in
  hand-written prose: "144 components". Every number in llms.txt must come from the
  artifact; a hand-typed one is the drift this gate exists to prevent.
```

(Freshness also fired, because the string is rendered. Both are correct.)

### S6 · a structural defect in a document nothing used to check

Seed — the first ```` ```vue ```` fence in **`apps/landing/public/llms-full.txt`**
replaced by `SEEDEDvue`.

```
✗ [structure] apps/landing/public/llms-full.txt: unbalanced code fences (173)
```

The point of this one: that file is tracked, agent-facing, and was outside
**every** gate in the repository before this packet — the deleted
`validate-llms.mjs` only ever looked at `apps/storybook/public/`.

### S7 · the blocks documents go stale

Seed — `# dzup-ui blocks` → `# dzup-ui blocks SEEDED` in the tracked
`apps/landing/public/llms.txt`.

```
✗ [freshness/blocks] apps/landing/public/llms*.txt disagree with the BLOCKS catalog:
✗ apps/landing/public/llms.txt is STALE — it disagrees with a fresh render of the BLOCKS
  catalog (committed 29968 chars, fresh 29961 chars; first difference at line 1).
  Run `yarn workspace @dzup-ui/landing build:registry`.
```

This is the delegated clause: it loaded the whole `BLOCKS` catalog through Vite
and compared **without writing or removing anything** — `public/r/` still held its
178 entries afterwards.

### S8 · a public component becomes undiscoverable

Seed — the gate's own component-name pattern narrowed back to `Dz[A-Za-z0-9]+`,
which is what `@dzup-ui/mcp` shipped before this packet:

```
  · 2 public component(s) not discoverable through the index and full document:
    GovernanceBadge, TeamMemberBadge
  ratchets: publicComponentsUnreachableFromLlms 2 · componentsWithoutDescription 3 ·
            publicComponentsWithoutExampleInLlms 0
✗ [ratchet] `publicComponentsUnreachableFromLlms` is 2, above the ceiling of 0.
  Ratchets move one way only.
```

*(This transcript predates the fourth ratchet: `publicComponentsWithNoMembers`
was added after finding **F-1** was discovered, later in the run. Every current
run prints four.)*

### Restoration

```
$ diff hashes-before.txt hashes-after.txt
ALL SEEDED FILES RESTORED BYTE-IDENTICAL
$ npx tsx packages/tooling/src/validators/llms.ts ; echo $?
✓ llms: both documents fresh against the metadata artifact, structurally sound, and
  every one of the 144 public components discoverable by an MCP client.
0
```

Beyond the eight seeded runs, `validators/llms.spec.ts` drives every pure clause
to failure with fabricated inputs (23 tests) and `render-llms.spec.ts` drives
every §13 rendering rule (28 tests), including five cases that run the **real
committed artifact** and assert the rendered output equals what is on disk.

## 7. Determinism — measured, two cold runs

Both artifacts deleted and regenerated from scratch, twice:

```
# both artifacts, deleted and regenerated from scratch (schema 1.1.0)
$ rm packages/core/docs/{component-meta.json,llms.txt,llms-full.txt}
$ yarn generate:component-meta && yarn generate:llms
run 1:
d7138b3f0479b4e2b522d7e23723bbdcb7e639f73d2698b266a87bec4163d4cd *component-meta.json
18bf089a2da98dedbbd50112ecaef922bfec0c4ef7b22a0fa89024c817b70984 *llms.txt
run 2:  (identical)
d7138b3f0479b4e2b522d7e23723bbdcb7e639f73d2698b266a87bec4163d4cd *component-meta.json
18bf089a2da98dedbbd50112ecaef922bfec0c4ef7b22a0fa89024c817b70984 *llms.txt

# re-measured for the llms pair after the final renderer change (§5d, the
# stated-absence sentences), which does not touch component-meta.json
$ rm packages/core/docs/llms{,-full}.txt && yarn generate:llms    # ×2
18bf089a2da98dedbbd50112ecaef922bfec0c4ef7b22a0fa89024c817b70984 *llms.txt
f53a476d577cb8453bd583312de88ba2f9764481a4db508d5d11dc41dd536613 *llms-full.txt
18bf089a2da98dedbbd50112ecaef922bfec0c4ef7b22a0fa89024c817b70984 *llms.txt
f53a476d577cb8453bd583312de88ba2f9764481a4db508d5d11dc41dd536613 *llms-full.txt
```

**Byte-identical.** Three things make that true rather than lucky, all inherited
or added deliberately:

1. The renderer is a **pure function of the artifact**, and the artifact is
   already sorted throughout with `localeCompare(…, 'en')` (A2). Nothing here
   iterates a `Set` or a directory.
2. `contractTaxonomies()` sorts its keys and preserves declaration order within
   each union — a union's order is part of its meaning, so it is not sorted.
3. `groupByFamily()` uses a **total** order: curated family order first, unknown
   families appended alphabetically, then public components before compound
   parts, then by name.

`sourceCommit` appears only in `component-meta.json` and is stripped before that
artifact's freshness comparison (A2); the two `llms` documents carry **no
provenance stamp at all**, so constraint **B1**'s off-by-one cannot reach them.

## 8. Focused validation output

Narrowest owning command first.

### 8a. `yarn validate:llms` — exit 0

```
llms docs — TASK-N2-A3

  components index   packages/core/docs/llms.txt          40774 B
  components full    packages/core/docs/llms-full.txt     419922 B
  blocks index       apps/landing/public/llms.txt         30316 B
  blocks full        apps/landing/public/llms-full.txt    517939 B

✓ llms docs fresh — packages/core/docs/llms.txt, packages/core/docs/llms-full.txt
✓ blocks llms docs fresh — 87 blocks across 12 categories → llms.txt, llms-full.txt
  · index entries with no description: DzFieldArray, DzAsyncBoundary, DzErrorBoundary
  · public components published with NO props, events or slots — the extractor
    returned nothing for them: DzAccordion

  ratchets: publicComponentsUnreachableFromLlms 0 · componentsWithoutDescription 3 ·
            publicComponentsWithNoMembers 1 · publicComponentsWithoutExampleInLlms 0

✓ llms: both documents fresh against the metadata artifact, structurally sound, and
  every one of the 144 public components discoverable by an MCP client.
```

Cost: **~26 s** — ~6 s for the component render + compare, ~20 s for the Vite
catalog load the blocks clause needs. `--no-blocks` skips the second and says so.

### 8b. `yarn validate:mcp` — exit 0, and the ratchet it reports is the headline

```
@dzup-ui/mcp surface OK — 12 tools, all with a contract clause, a unit spec, a
[malformed] case and an observed data source; version 0.2.0 agrees across
package.json, server.json (x2), CHANGELOG.md and the artifact.
  ratchets: 0 public components unreachable · 5 tools not smoke-called
```

**`43 → 0`.** The measurement itself was repointed (B22) — it now reads the file
the tools answer from, with the parser they ship, rather than the manifest that
used to feed it.

### 8c. `yarn validate:component-meta` — exit 0 after the schema bump

```
  208 components: 144 public-component, 64 compound-part; 0 unclassifiable
  props 1712/1649 described · events 359/253 · slots 326/305 · exposed 26/0
  ratchets: unclassifiable 0 · unresolvedTypes 0 · publicComponentsWithoutRecord 0 ·
            propsWithoutDescription 63 · slotsWithoutDescription 21 ·
            eventsWithoutDescription 106 · exposedWithoutDescription 26 ·
            publicComponentsWithoutExample 1 · componentsWithoutStaticTemplate 80

✓ component-meta: fresh, complete for all 144 public components, and every debt
  number at its ceiling.
```

**All nine of A2's ratchets are unchanged.** Schema 1.1.0 is additive.

### 8d. `node packages/mcp/scripts/e2e-smoke.mjs` — exit 0, against a rebuilt `dist/`

```
✓ tools/list → exactly the 12 tools in docs/mcp-tool-surface.json
✓ get_component_metadata(DzRating) → a real prop table
✓ get_component(DzRating) → the 43-symbol blind spot is closed at the source
✓ list_components() → reaches the previously-invisible components, Dz-prefixed or not
✓ get_component_example(DzButton) → verbatim story source, not synthesised

All end-to-end MCP checks passed.
```

The two new lines are the regression test for A1's F1, over **real JSON-RPC
against the emitted `dist/index.js`** — not against a fixture and not against
source.

### 8e. Focused test lanes — 202 tests, green

```
$ npx vitest run packages/mcp packages/tooling/src/llms \
    packages/tooling/src/validators/llms.spec.ts packages/tooling/src/meta
 ✓ packages/mcp/src/registry.spec.ts                        (18 tests)
 ✓ packages/mcp/src/tools.spec.ts                           (75 tests)
 ✓ packages/mcp/src/server.spec.ts                          (20 tests)
 ✓ packages/mcp/src/tools.contract.spec.ts                  (12 tests)
 ✓ packages/tooling/src/llms/render-llms.spec.ts            (28 tests)
 ✓ packages/tooling/src/validators/llms.spec.ts             (23 tests)
 ✓ packages/tooling/src/meta/extract-component-meta.spec.ts (26 tests)
 Test Files  7 passed (7)
      Tests  202 passed (202)
```

### 8f. `packages/tooling` typecheck — 0 errors in this task's files

`packages/tooling` is **not** in `typecheck:all` (constraint **B-A1-F7**, owner
decision A1-D4):

```
$ node node_modules/typescript/bin/tsc --noEmit -p packages/tooling/tsconfig.json ; echo $?
… 7 errors …
2
```

**All 7 are the pre-existing set A2 measured** — `perf-bench.spec.ts` (2),
`quality/accept-visual-baseline.ts` (2), `quality/story-dod-triage.ts` (1),
`validators/at-matrix.spec.ts` (1), `validators/story-dod-tiers.spec.ts` (1).
**Zero are in `src/llms/`, `src/meta/` or `validators/llms*`.** Two errors *were*
introduced by the schema bump and fixed before this measurement — finding **F-6**.

### 8g. The CI command, run verbatim

```
$ yarn workspace @dzup-ui/storybook validate:llms ; echo $?
✓ llms: … every one of the 144 public components discoverable by an MCP client.
0
```

`.github/workflows/ci.yml:400` invokes exactly that. The script now delegates to
the root gate, so **the workflow file needed no edit** and the storybook job
gains the freshness, coverage and B9 clauses for free.

## 9. Aggregate qualification

Run from a clean shell after every source change was final. Each exit code was
written to a file and echoed bare — never read through a pipe.

| Gate | Exit | Result |
|---|---|---|
| `yarn typecheck` | **0** | Unchanged coverage; `packages/tooling` still outside it (B-A1-F7), so §8f checked this task's files explicitly. |
| `yarn lint` | **0** | `--max-warnings 0` over `packages/ apps/`. Four problems in this task's own new code were found and fixed — see **F-7**. |
| `yarn validate:all` | **0** | **32 links** (31 → 32; `validate:llms` appended after `validate:component-meta`). It reports green **inside the chain at line 157** of the run log, with the four-document table and its four ratchets. |
| `yarn test` | **1** | **8,838 passed · 2 failed · 2 skipped · 1 todo (8,843)**, 488/490 files. The two failures are **exactly** B5's pre-existing pair. |

### The two failures are the known pre-existing ones

```
FAIL  packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts >
      landing token fallbacks > every fallback matches the value its token resolves to
FAIL  packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver
```

That is **B5 verbatim, and nothing else.** Neither file was read for edit by this
task, and no ceiling was moved to make either pass.

### The delta reconciles exactly

| | A2 left | now | delta |
|---|---|---|---|
| tests | 8,782 | **8,843** | **+61** |
| passing | 8,777 | **8,838** | **+61** |
| test files | 488 | **490** | **+2** |
| failing | 2 | **2** | **0** |

**+61 = 28** (`llms/render-llms.spec.ts`, new) **+ 23**
(`validators/llms.spec.ts`, new — the +2 files) **+ 9**
(`meta/extract-component-meta.spec.ts`, 17 → 26) **+ 1**
(`mcp/src/registry.spec.ts`, 17 → 18).

### Size — B8 applies, and the arithmetic is stated

| | before | after | delta |
|---|---|---|---|
| `llms.txt` | 26,522 B | **40,774 B** | +14,252 |
| `llms-full.txt` | 162,861 B | **419,922 B** | +257,061 |
| **total shipped into `storybook-static/`** | 189,383 B | **460,696 B** | **+271,313 B (+0.259 MiB)** |

Constraint **B8**: the Storybook static build was **24.15 MB of a 25 MB budget**
(`yarn check:size --max-mb 25`), i.e. **0.85 MB of headroom**. This packet
consumes **~0.26 MB of that, leaving ~0.59 MB.** The build was **not run** (it is
a multi-minute job that rewrites `storybook-static/`), so this is arithmetic on
B8's measured figure, not a fresh measurement — flagged as such, and as owner
decision **D5**.

The growth is real content, not padding: 49 more components (+31 %), and every
component now carries inherited props, an exposed-members table and an entry-point
line the old file did not have.

### Maturity level reached

Per `<maturity_levels>`, this packet reaches **aggregate-qualified** and stops:

- **specified** — a curated source, a pure renderer, a committed output, an
  eight-clause gate, three ratchets.
- **implemented** — `generate:llms`, `validate:llms`, the copy step, the MCP
  repointing.
- **focused-validated** — §8: 202 tests, four validators exit 0, e2e smoke exit 0
  against the rebuilt `dist/`, eight seeded gate failures with byte-identical
  restoration.
- **aggregate-qualified** — §9.
- **browser/AT-qualified** — **n/a**: a generator, a validator and a markdown file.
- **packaged** — `packages/mcp` rebuilt and smoke-driven. **The site copies have
  NOT been produced**: no `storybook build`, no `build:registry` — owner decision
  **D2**, inherited from A2's D6.
- **released** — **not reached, not attempted.**

Everything above is **locally qualified, worktree-dirty**.

## 10. Findings

Ranked by blast radius. Findings **F-1** and **F-2** are about the *content*
agents were being served; the rest are about the machinery that served it.

### F-1 · `DzAccordion` is published to every AI client with **no API at all** 🔴

The only component in the catalog whose props type is a **discriminated union**:

```ts
export type DzAccordionProps = DzAccordionSingleProps | DzAccordionMultipleProps
```

`vue-component-meta` cannot resolve `defineProps<Union>()`. Measured on the real
record:

| `DzAccordion` | value |
|---|---|
| own props | **0** (12 global) |
| events | **0** |
| slots | **0** |
| `extractionError` | *absent — the extractor did not fail* |

The component's `.vue` declares `defineProps`, `defineEmits<DzAccordionEmits>`,
`defineSlots<DzAccordionSlots>` **and** `defineModel`, and its `.types.ts`
carries documented `revealed` / `change` events. All of it is missing from the
artifact — and therefore from `llms-full.txt`, from `get_component_metadata`, and
from whatever prop table N2-D1 renders.

**No existing gate can see this.** A2's `unclassifiable` ratchet counts
components the extractor **threw** on; this one succeeded and returned nothing.
`propsWithoutDescription` counts described-of-extracted, so zero extracted props
score 0/0 = perfect. It is invisible in every published fidelity number.

It is also the **worst** failure mode for an agent surface: an agent told
`DzAccordion` has no props will confidently generate `<DzAccordion>` with none,
where an agent told nothing would have asked. Three things were done about it,
none of which is a fix:

1. **Ratcheted at 1** (`publicComponentsWithNoMembers`) and printed by
   `validate:llms` on every run, so a second one cannot arrive unnoticed.
2. **The document now says so**, rather than silently omitting the tables:
   *"No props, events or slots could be extracted for this component, although it
   declares them in source. That is an extraction gap, **not** a statement that
   it has none."*
3. **A different sentence** is used for the four components that genuinely
   declare nothing (`DzMenuSeparator`, `DzContextMenuSeparator`,
   `DzDropdownMenuSeparator`, `DzDataGridHeader` — bare `.vue` sub-parts with no
   `.types.ts` and no `define*` macros, verified). Telling an agent "declares
   nothing" when the truth is "could not be read" is the same class of error as
   the one this whole packet is about.

→ owner decision **D3** for the actual fix.

### F-2 · The 43-symbol MCP blind spot closed as a side effect, and the last two needed a two-character fix 🔴

Constraint **B-A1-F1** predicted this might close by doing the task correctly. It
did, in two steps, **without touching `public-api.manifest.json` and without
running `generate:exports`** (B3 intact — that manifest is still stale; it simply
no longer feeds anything an agent reads):

| step | change | unreachable |
|---|---|---|
| — | shipped state (A1's measurement) | **43** |
| 1 | `llms.txt` rendered from `component-meta.json` instead of `public-api.manifest.json` | **2** |
| 2 | `@dzup-ui/mcp`'s component-name pattern widened `Dz[A-Za-z0-9]+` → `[A-Z][A-Za-z0-9]*` | **0** |

Step 2 is the interesting half. `GovernanceBadge` and `TeamMemberBadge` are
public components with **no `Dz` prefix** (A2's finding F-5 measured them). Once
step 1 put them *in* the document, both of `@dzup-ui/mcp`'s parsers still could
not *see* them, because the name pattern was `Dz`-only in
`parseComponentIndex` **and** in `extractComponentSection`. `normalizeComponentName`
already handled both forms, so only the pattern had to change.

That is a **behaviour change to a published tool surface**, taken deliberately
and reported as such (→ **D1**), because the alternative is shipping two
knowingly-invisible components behind a gate that says "0 unreachable" only
because it was measuring the roster and not the parser.

The measurement itself was repointed: `catalogVisibility` in
`generate-tool-surface.ts` now parses `packages/core/docs/llms.txt` **with the
package's own parser**, so it covers the parser's limits and not just the
roster's. Left as it was, it would have reported a 43-symbol blind spot that no
longer existed — a ratchet describing an input no longer wired to the output it
claims to measure.

### F-3 · The structural validator that did exist ran on the wrong half of the repository 🟠

`apps/storybook/scripts/validate-llms.mjs` checked balanced fences, square GFM
tables and a single H1 — on `apps/storybook/public/` only. The landing site's
**two tracked, agent-facing, 548 KB** markdown documents were outside it, and
outside every other gate in the repository. Seed **S6** put an unbalanced fence
in `apps/landing/public/llms-full.txt` and the new gate caught it; the old one
never looked at that file.

Same family as A1's **F4** (`packages/mcp`'s only test file had never run) and
N1's `storybook:test` lane: **the check existed, was correct, and was pointed at
a subset nobody had re-examined since it was written.**

### F-4 · The document agents read was git-ignored, so no review could ever see a change to it 🟠

`apps/storybook/.gitignore:14-15`. Every other generated-truth artifact in this
repository is committed and freshness-gated — the ownership manifest, the
capability matrix, `component-meta.json`, the MCP tool surface. The one file that
is **literally the library's answer to "what do you ship"** was a build output.

Consequences, all real before this packet: a PR could change what 144 components
are described as with a zero-line diff; `validate:readme-facts`' pattern
(committed vs regenerated) had nothing to attach to; and
`packages/mcp/src/registry.spec.ts` **skipped** its component-index integration
cases on a clean checkout, because the artifact they read need not exist. That
last one is now fixed as a side effect — the guard resolves to a committed file,
so those cases run.

### F-5 · Component descriptions in a machine-read document are stylistically inconsistent, and it is now measurable 🟢

With descriptions extracted for the first time, the catalog-wide shape is
visible:

| | count |
|---|---|
| descriptions extracted | **205 / 208** |
| starting with a lower-case letter | **30** |
| with no terminal punctuation | **10** |
| longer than 140 characters | **0** |
| public components with none at all | **3** (`DzAsyncBoundary`, `DzErrorBoundary`, `DzFieldArray` — no header comment exists) |

`DzButton` reads *"Primary button component."*; `DzCalendar` reads *"full-surface
month/week calendar for date selection and range picking."* Both are fine
English; in a bullet list an assistant reads, the mix is noise. Cheap to fix (30
header lines), nothing currently measures it, and it is now a printed number.

### F-6 · A schema change broke two `tsc` errors into a spec file, and no gate would have caught it 🟠

Bumping `component-meta` to schema 1.1.0 made `description` a required record
field and `taxonomies` a required artifact field. A2's
`validators/component-meta.spec.ts` fixtures did not have them:

```
component-meta.spec.ts(29,3):  error TS2322: Types of property 'description' are incompatible.
component-meta.spec.ts(87,3):  error TS2741: Property 'taxonomies' is missing …
```

`yarn typecheck` was **green** throughout, because `packages/tooling` is not in
`typecheck:all` (A1's **F7**, owner decision A1-D4). Vitest does not typecheck,
so `yarn test` was green too. Found only by running
`tsc -p packages/tooling/tsconfig.json` by hand.

**Third sighting in three tasks** (A1 F-7 abstract → A2 F-10 one error → here,
two errors from a cross-task schema change). The pattern is now clear enough to
name: *the home of all 32 validators is the one package where a type error can
survive a fully green run.*

### F-7 · Four lint problems in this task's own new code, and the ratio is the point 🟢

`yarn lint` (`--max-warnings 0`) rejected: two `node/prefer-global/buffer`
errors, two `jsdoc/no-multi-asterisks` warnings, and ten `no-console` warnings.
The `no-console` ones are the informative case — `packages/tooling/src/**` is
**not** covered by the `dzup/cli-scripts` override in `eslint.config.js`, which
exempts `**/scripts/**` only. Every existing validator therefore prints its
report through `console.warn`, which the rule allows. A newcomer writing
`console.log` in a validator gets a lint failure and no explanation; the
convention is real but undocumented. All fixed; noted because the next validator
author will hit it too.

### F-8 · One `update:*` event in the catalog does not correspond to a prop 🟢

`DzInputMask` emits `update:unmasked` but declares no `unmasked` prop, so
`v-model:unmasked` binds to nothing. It is the **only** such case in 83
`update:*` events. The renderer's `modelBindings()` requires both an
`update:<x>` event **and** an `<x>` prop before it prints a `v-model:` binding,
so `llms.txt` does not advertise it — but the event is still published in the
events table, which is correct. Worth an author's attention: either the prop is
missing or the event is misnamed.

## 11. Headline

| Measure | Result |
|---|---|
| Documents governed | **4** (2 component-API + 2 blocks), previously **0** |
| **Public components an MCP client can discover** | **101 → 144 of 144** |
| `catalogVisibilityUnreachable` ratchet | **43 → 0** |
| Records in the component-API documents | 159 → **208** (144 public + 64 compound parts) |
| Component descriptions lost in the migration | **0 of 159** (159/159 byte-identical) |
| Second component-API extractor deleted | **567 lines → 73** (a copy step) |
| Hand-written agent-facing prose remaining | **one file**, `llms-content.ts`, 187 lines, gated against catalog counts |
| `validate:all` | **exit 0, 31 → 32 links** |
| `yarn test` | **8,782 → 8,843 (+61)**, still red only on B5's pre-existing pair |
| Gates proven failable | **8 seeded violations**, all restored byte-identical |
| Determinism | **byte-identical** across two cold runs |
| Context7 | **evaluated, not enacted** — no file, no registration |
| Per-page `.md` endpoints | **scoped out** (D1 has not landed); the seam is specified in §14 |

**The one thing to carry forward:** the file coding agents actually read was
generated, byte-fresh, ungated — and describing 70 % of the library. Freshness
and correctness are different properties, and only one of them had ever been
checked.

## 12. Ratchet movements

| Ratchet | Before | After | Direction |
|---|---|---|---|
| `validate:all` links | **31** (A2) | **32** | up, by design — `validate:llms` added |
| **`catalogVisibilityUnreachable`** (MCP) | **43** | **0** | **down — the headline.** Ceiling lowered in `mcp-surface-ceilings.json` |
| `toolsWithoutE2eSmoke` (MCP) | **6** | **5** | down — `get_component` is now smoke-called against the built `dist/` |
| `publicComponentsUnreachableFromLlms` | *(uninitialised)* | **0 / 144** | initialised, held as a gate |
| `componentsWithoutDescription` | *(uninitialised)* | **3 / 208** | initialised — source gap, falls as authors write header lines |
| `publicComponentsWithNoMembers` | *(uninitialised)* | **1** (`DzAccordion`) | initialised — F-1, a gap no other ratchet can see |
| `publicComponentsWithoutExampleInLlms` | *(uninitialised)* | **0** | initialised — every section states a snippet or an absence |
| `component-meta` schema version | 1.0.0 | **1.1.0** | additive |
| component-meta records with a description | *(uninitialised)* | **205 / 208** | initialised |
| ADR-02 taxonomies published | *(uninitialised)* | **28** | initialised |
| `packages/mcp` tests | 124 | **125** | up |
| `packages/tooling` tests (this lane) | 70 (A2) | **130** | up — +60 |
| MCP tools | 12 | **12 — unchanged** | held — no tool added or removed |
| A2's nine extraction ratchets | *(all)* | **unchanged** | held — schema 1.1.0 is additive |
| anatomy non-declaring | 136 | **136 — unchanged** | held |
| ownership-manifest entries | 1,327 | **1,327 — unchanged** | held |
| capability-matrix rows | 144 | **144 — unchanged** | held |
| `public-api.manifest.json` | stale by 43 | **stale by 43 — unchanged** | held deliberately: **B3** forbids regenerating it, and this packet fixed the consumer instead of the input |

## 13. Unresolved owner decisions

**D1 · `list_components` and `get_component` now return 43 more components, and
the parser accepts non-`Dz` names.** This is a behaviour change to a published
MCP surface, arrived at by fixing a defect rather than by adding a feature. Two
sub-decisions: (a) is the widened output acceptable without a version bump — it
is strictly more correct, and A2-D4 anticipated exactly this repointing; (b) the
name pattern `[A-Z][A-Za-z0-9]*` is looser than `Dz[A-Za-z0-9]+` and is safe
*because* `validate:llms` now owns the document's format, but a third party
pointing the server at their own `llms.txt` would get looser parsing. A minor
changeset is warranted; none was written (N5-01 owns changelog reconciliation,
and 17 changesets are already unreleased).

**D2 · The site copies have not been produced — this packet is
local-green / production-stale.** Inherited and widened from A2's **D6**. Three
build steps are outstanding and **none was run**:

| step | what it produces | why it was not run |
|---|---|---|
| `yarn workspace @dzup-ui/storybook build:llms` | `apps/storybook/public/llms*.txt` | **RUN** — it is a two-file copy, and the outputs are git-ignored |
| `yarn workspace @dzup-ui/storybook build` | `storybook-static/`, the deployed `/storybook/llms.txt` | multi-minute, rewrites a 24 MB tree |
| `yarn workspace @dzup-ui/landing build:registry` | `/r/component-meta.json` (A2's D6) | `rm -rf`s and rewrites 282 tracked files |

Until the storybook build and a deploy happen, **production still serves the old
llms.txt** and MCP clients over HTTP still see 101 of 144 components. Locally
everything works, through the `packages/core/docs/` fallback added to
`createReader`. This is the same "local-green / production-stale" exposure A2
recorded, and it now covers both packets.

**D3 · `DzAccordion`'s union props type (F-1).** Options: (a) split the component
so props are a single interface; (b) keep the union and hand-author a metadata
override — which reintroduces hand-typed facts; (c) accept that one component
publishes no API and keep the ratchet at 1. Not decidable by a task: (a) is a
public-API change to a Tier B component.

**D4 · Should `packages/core/docs/llms.txt` ship to npm?** It does not today
(`files: ["LICENSE","README.md","dist"]`). An `@dzup-ui/core` consumer with an
offline agent would benefit; the cost is ~460 KB per install. Deliberately not
changed — package `files` is a distribution decision.

**D5 · `validate:all` is ~26 s slower, and the Storybook budget lost ~0.26 MB.**
The blocks-freshness clause spins Vite to load the catalog (~20 s), which is the
only honest way to answer "does this file still match `BLOCKS`". `--no-blocks`
exists for a fast local loop. Separately, §9 shows the two documents grew
+0.258 MiB against B8's 0.85 MB of Storybook headroom, leaving ~0.59 MB —
**arithmetic on B8's figure, not a fresh measurement**, because the build was not
run.

**D6 · Context7 opt-in.** See §15 — it terminates in an `[!owner]` line.

**D7 · The 3 components with no header comment and the 30 with lower-case
descriptions (F-5).** Thirty-three one-line edits that improve every agent-facing
surface at once. Not taken here because they are content edits to 33 component
files, which is a different kind of change from this packet.

**D8 · `packages/tooling` in `typecheck:all` (A1's D4, third sighting — F-6).**
A cross-task schema change put two type errors into a spec file and every gate
stayed green. The 7 pre-existing errors are the blocker; they are all in four
files.

## 14. The seam D1 should use for per-page `.md` endpoints

**Scoped out, deliberately, and here is why.** The task's `<task>` clause is
conditional — *"and (if the docs-site skeleton D1 has landed) emit per-page `.md`
endpoints"*. **D1 has not landed**; it is row 5 of the N2 ledger and runs after
this packet. Emitting per-page endpoints now would mean inventing a URL scheme,
a build step and a sitemap entry for a site that does not exist, and D1 would
then have to either adopt them unseen or delete them. So no `.md` endpoint was
emitted, no route was added, and no public URL was claimed.

What was done instead is make the work a **function call**, so D1 adds the
endpoints without re-deriving anything:

```ts
import type { ComponentMetaArtifact } from '@dzup-ui/tooling/meta/component-meta'
import { readComponentMeta } from 'packages/tooling/src/llms/generate-llms.ts'
import { renderComponentSection } from 'packages/tooling/src/llms/render-llms.ts'

const artifact = readComponentMeta()
for (const record of artifact.components) {
  const md = renderComponentSection(record, artifact).join('\n')
  // → write to <docs-site>/public/r/components/<record.name>.md
}
```

`renderComponentSection(record, artifact)` is **exactly the function
`llms-full.txt` is built from** — it returns the `### Name` heading, the install
line, the entry points, tier/status, taxonomy, v-model, anatomy parts, the four
member tables and the usage snippet or its stated absence, all under the §13
rules. A per-page `.md` endpoint is that array joined, with the heading level
lifted from `###` to `#` if D1 wants a standalone page (one `.replace` on the
first element, or a `level` parameter added here — one line, and preferable,
because it keeps the shape in one place).

**Four things D1 should honour, all of which this packet has already paid for:**

1. **Use the existing precedent for the URL shape.** `apps/landing` already
   serves one markdown page per block at `/r/<id>.md`, built by
   `blockMarkdown()` in `src/blocks/llmsText.ts`. The symmetric component path is
   `/r/components/<Name>.md`, and it should be linked from each component's
   `llms-full.txt` section once it exists — which is a change to
   `render-llms.ts`, not to a docs app.
2. **Add the copy step where the directory is wiped.** `apps/landing/public/r/`
   is `rm -rf`'d on every `build:registry` run; A2's `component-meta.json` copy
   had to live inside that script for exactly this reason, and
   `validate:component-meta` gates it. A component-page emitter belongs in the
   same place, with the same kind of clause in `validate:llms` (clause group E
   is the template — match the **call**, not the filename).
3. **Do not re-extract.** Constraint **B9**. If D1 needs a field the artifact
   lacks, add it to `packages/tooling/src/meta/` and regenerate — this packet did
   that twice (`description`, `taxonomies`) and it cost about 60 lines each time.
4. **Read §13 of the A2 handoff before writing a prop table**, and read
   `render-llms.ts`'s header for the three rules already implemented: declared vs
   effective defaults, `descriptionSource`, and verbatim-or-absent examples. The
   renderer is the reference implementation; copying its behaviour is cheaper
   than re-deriving the rules.

## 15. The Context7 evaluation — what indexing implies, and what the opt-in file contains

**Nothing was enacted.** No `context7.json` was created, no repository was
submitted, no GitHub Action was added, and no request was made that registers
anything. Two read-only documentation pages were fetched
(`context7.com/docs/adding-libraries`, `context7.com/docs/library-owners`) to
make this evaluation accurate rather than remembered.

### 15a. What Context7 is, mechanically

Context7 (Upstash) is an MCP server that answers *"give me current docs for
library X"* for coding agents. A library is added at `context7.com/add-library`
by pasting a **public GitHub repository URL**; Context7's crawler — the parsing
and crawling engines are **closed source**, stated in the project's own README —
walks the repo, extracts code examples and their surrounding explanations from
`.md`, `.mdx`, `.markdown`, `.rst`, `.txt` and `.ipynb` files, and serves the
result through its own `resolve-library-id` / `get-library-docs` tools. Where
documentation is sparse, it **generates examples from source code** as a
fallback. Re-crawls happen automatically "based on popularity"; a maintainer can
force one per push with the Context7 GitHub Action.

### 15b. What the opt-in file contains

`context7.json` at the repository root, `$schema`
`https://context7.com/schema/context7.json`:

| Field | Type | Meaning (Context7's own wording) |
|---|---|---|
| `projectTitle` | string | *"Suggested display name … Only used when the LLM cannot generate a name with high confidence."* |
| `description` | string | *"Suggested description … Only used when the LLM cannot generate a description with high confidence."* |
| `branch` | string | *"The name of the git branch to parse. If not provided, the default branch will be used."* |
| `folders` | string[] | *"Specific folder paths to include when parsing. If empty, Context7 scans the entire repository."* |
| `excludeFolders` | string[] | *"Patterns to exclude from documentation parsing. Supports simple names, paths, and glob patterns."* |
| `excludeFiles` | string[] | *"Specific file names to exclude. Use only the filename, not the full path."* |
| `rules` | string[] | *"Best practices or important guidelines that coding agents should follow when using your library."* |
| `previousVersions` | `{ tag }[]` | git tags served as pinned older versions |
| `branchVersions` | `{ branch }[]` | branches served as alternate versions |

### 15c. What indexing this repository would actually imply

This is where the evaluation stops being a summary and starts being a decision.

**1. `folders` is not optional for dzup-ui.** Left empty, Context7 scans the
whole repository. This repo's `.md`/`.txt` surface is dominated by material that
is **not** consumer documentation and would be indexed as if it were: 77 KB of
`CHANGELOG.md`, 71 KB of `FEATURESLOG.md`, `DESIGN_MD_APPLICATION_PROMPT.md`,
`MAPPING_TOKENS.md`, the entire `docs/adr/` and `docs/program-2026-09/` trees —
including **this handoff**, which is full of the phrase "43 public components are
invisible to every MCP client" and would be served to agents as current fact.
A correct `folders` would be roughly
`["packages/core/docs", "packages/*/README.md", "README.md", "COMPONENTS.md", "DESIGN.md"]`,
with `excludeFolders` covering `docs/program-*`, `docs/adr`, `e2e`, `coverage`
and `test-results`.

**2. The `.txt` extension means `llms.txt` and `llms-full.txt` are first-class
inputs.** That is the strongest argument in favour: this packet just made both
of them generated, gated and complete, so what Context7 would index is exactly
what the library actually ships, and it refreshes when the repo does. Before this
packet, indexing would have propagated the 43-component blind spot into a third
distribution channel.

**3. The source-code fallback is a liability here, not a benefit.** Context7
generates examples from source when docs are sparse. dzup-ui's docs are not
sparse — but its `packages/core/src` is 205 `.vue` files of implementation, and
`stories/` contains 1,355 story entries whose `argTypes` publish a **contradicting
hand-typed default** for 487 props (A2 finding **F-3**, constraint **B10**).
Anything that reads those and infers "defaults" will restate the wrong answer.
`excludeFolders` must therefore be explicit, not left to the crawler's judgment.

**4. `rules` is the field with the highest value-per-byte, and it is a
hand-typed-facts hazard.** It is the one place to state the five-layer styling
contract, "no raw colours, tokens only", "`--dz-{intent}` is a fill colour, never
a text colour" (the `CLAUDE.md` rule `validate:tokens` enforces), `defineModel`
for v-model, and "declared defaults may be `undefined` because the ADR-20
provider supplies the effective value". Every one of those is a claim in prose
with **no gate behind it** — the exact class this program has now found five
times. If `context7.json` is created, its `rules` array should be **generated or
gated**, not hand-typed; the cheapest correct version is to add a clause to
`validate:llms` that checks each `rules` entry appears verbatim in the curated
`CONVENTIONS` array, which already renders into `llms.txt`.

**5. Duplication and precedence are unmanaged.** dzup-ui would then publish the
same component API through four channels: `llms.txt` (self-hosted),
`@dzup-ui/mcp` (own MCP server), `/r/component-meta.json` (machine-readable), and
Context7's index. The first three share one extractor and one gate. The fourth is
a **cached copy on a third party's infrastructure with an opaque refresh
schedule**, and nothing in this repository can detect when it goes stale. An
agent that consults Context7 rather than the official server gets an answer this
project cannot gate. That is the real cost, and it is not paid by adding a file —
it is paid every day after.

**6. It is free and reversible.** No account, no key, no cost, public repos only.
De-listing is a request, not a deployment.

### 15d. Recommendation

Worth doing, **after** the D2 deploy and **not before**, because the value of
being indexed is proportional to the correctness of what is indexed, and what is
indexed today would be the pre-A3 `llms.txt` if the crawler read the deployed
site, or a repository whose `docs/` tree is full of in-flight program prose if it
read the repo. The sequencing is: deploy (D2) → decide `folders`/`excludeFolders`
→ gate `rules` → then submit.

> **[!owner] Create `context7.json` and submit `dzup-ui` to Context7?**
> Not enacted by this task. If yes, the file is ~20 lines at the repository root
> and needs three decisions no task can make: (a) the `folders` allowlist —
> unbounded scanning would index `CHANGELOG.md`, `FEATURESLOG.md`, `docs/adr/`
> and this program's own handoffs as if they were user documentation; (b) whether
> the `rules` array is hand-typed prose or gated against the curated
> `CONVENTIONS` source, given that five separate findings in this program have
> been hand-typed facts drifting from generated ones; (c) whether a
> third-party-cached copy of the component API, refreshed on someone else's
> schedule and un-gateable from here, is an acceptable fourth distribution
> channel alongside `llms.txt`, `@dzup-ui/mcp` and `/r/component-meta.json`.
> **Recommendation: yes, sequenced after D2's deploy, with an explicit `folders`
> allowlist and a gated `rules` array.**

## 16. Ranked next packet

1. **Run the three builds and deploy (D2, ~10 minutes plus a 282-file diff to
   review).** Until the Storybook build ships, production still serves the
   pre-A3 `llms.txt` and every MCP client over HTTP still sees 101 of 144
   components. This is the only item here that is a **live defect** rather than
   debt, and it now carries both A2's and A3's payload.
2. **TASK-N2-D1 (docs site) — unblocked, and §14 hands it the exact seam.**
   `renderComponentSection()` already produces a per-component markdown page; D1
   adds a writer and a copy step, not a renderer.
3. **Decide D3 (`DzAccordion`, ~1 hour for option (a)).** One public component
   currently tells every agent it has no props, no events and no slots. It is the
   single most wrong thing the agent surface still says.
4. **Author the 33 header lines (D7, ~1 hour).** 3 missing descriptions + 30
   lower-case ones. Both ratchets fall, and the improvement shows up in
   `llms.txt`, in `list_components`, in `search`, and in whatever D1 renders.
5. **Fix the 7 `packages/tooling` type errors and add it to `typecheck:all`
   (A1-D4 / D8, ~1 hour).** Third sighting in three tasks; this one was a
   cross-task schema change, which is precisely the case a human reviewer will
   not catch by reading a diff.
6. **Write the `@dzup-ui/mcp` changeset (D1, ~10 minutes)** so the visibility fix
   is in the changelog before N5-01 reconciles it.
7. **Context7 (D6), after 1.** §15.

## Appendix — reproduction

```sh
# the artifacts (~21 s + ~2 s; run twice and diff — both are byte-identical)
yarn generate:component-meta
yarn generate:llms
tsx packages/tooling/src/llms/generate-llms.ts --check     # freshness only

# the gate (~26 s; --no-blocks drops the 20 s Vite catalog load)
yarn validate:llms
yarn validate:llms --no-blocks
yarn validate:llms --all

# the blocks half, read-only — writes nothing, removes nothing
tsx apps/landing/scripts/build-registry.ts --check-llms

# focused tests
npx vitest run packages/tooling/src/llms
npx vitest run packages/tooling/src/validators/llms.spec.ts
npx vitest run packages/tooling/src/meta
npx vitest run packages/mcp

# the MCP surface (regenerate whenever llms.txt or a tool changes)
yarn generate:mcp-surface
yarn validate:mcp

# end to end, over real JSON-RPC against the built dist/
node node_modules/typescript/bin/tsc -p packages/mcp/tsconfig.json
node packages/mcp/scripts/e2e-smoke.mjs

# the served copies (safe: two file copies into a git-ignored dir)
yarn workspace @dzup-ui/storybook build:llms

# what CI runs, verbatim (.github/workflows/ci.yml:400)
yarn workspace @dzup-ui/storybook validate:llms

# packages/tooling is NOT in typecheck:all — check it by hand (7 pre-existing errors)
node node_modules/typescript/bin/tsc --noEmit -p packages/tooling/tsconfig.json

# the aggregate
yarn typecheck && yarn lint && yarn validate:all && yarn test
```

### Custody

Nothing was committed, pushed, dispatched to CI or published. No registry
mutation, no Context7 submission, no `context7.json`. `generate:exports` was
**not** run and `public-api.manifest.json` is **byte-unchanged** (constraint B3
intact). `apps/landing/scripts/build-registry.ts` was edited and run **only** in
its new read-only `--check-llms` mode — `public/r/` still holds its 178 entries
and was never wiped. `yarn workspace @dzup-ui/landing build:registry` and
`yarn workspace @dzup-ui/storybook build` were **not** run (owner decision D2).
`apps/storybook/scripts/build-llms.mjs` was run — it copies two files into a
git-ignored directory. `packages/mcp/dist/` (git-ignored) was rebuilt.
`apps/storybook/scripts/validate-llms.mjs` was **deleted**, deliberately, with
its checks absorbed and widened (finding F-3).

Eight seeded edits were made to prove the gate fails; all eight touched files
were restored **byte-identical** (`sha256sum` diff clean) and every gate
re-verified green. The two tracked landing documents were restored from a
pre-run snapshot and hash-verified. Every other dirty path in the worktree
belongs to the N1 program, TASK-N2-T1, TASK-N2-A1 or TASK-N2-A2 and was not
touched.
