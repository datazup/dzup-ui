# Execution status — foundation-tasks.md

> Live ledger for the synchronous run of `foundation-tasks.md` (P0 → P5).
> Started **2026-08-20** against `ui/dzup-ui` `main` @ `be76ddb`, clean worktree.
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
>
> **Nothing here is committed, pushed, dispatched to CI, or published** — every
> packet stops at "locally qualified" per README §3 `<authority>`.

## Custody re-verification (README §2)

| Claim in README §2 | State on 2026-08-20 at run start |
|---|---|
| `ui/dzup-ui` worktree **dirty**, deleted `.changeset/*` staged | **No longer true** — worktree is clean; `main` is 5 commits ahead of `origin/main` (`be76ddb` … `9949294`). No dirty work to preserve, so the "report instead of editing" stop conditions on README/landing files do not fire. |
| `packages/tokens/src/theme-recipe.ts` exists → ThemeRecipe present | Unchanged. |
| Pro checkout on `esmir`, 290 commits behind `origin/main` | Unchanged — the Pro ownership manifest that P0-02/P1-02 consume is still not obtainable from the local checkout. |

## Progress

| Task | Status | Result |
|---|---|---|
| TASK-OSS-P0-01 | `[x]` | Ownership schema + generator + validator; 1,297 entries, determinism proven, 75 specs green |
| TASK-OSS-P0-02 | `[x]` | Fixtures + cross-tier map schema/merge tool; 22 specs green; **zero real Core/Pro collisions**, Pro manifest unavailable |
| TASK-OSS-P1-01 | `[x]` | 57 references classified, 50 corrected; `validate:package-names` gate added to `validate:all`; build clean |
| TASK-OSS-P1-02 | `[x]` | Prefix logic deleted; resolver is an exact-name lookup over generated data. **One acceptance row unverifiable**: no Pro manifest exists to resolve a Pro name against |
| TASK-OSS-P1-03 | `[x]` | 6/7 fixtures build from real tarballs; **found and fixed a shipping defect** (`@dzup-ui/tokens/dist/tokens.css` not an exported specifier); `core-pro` unrun |
| TASK-OSS-P1-04 | `[x]` | 12 fixture-backed snippets across 4 doc surfaces; `validate:doc-snippets` gate added; Storybook + landing build clean |
| TASK-OSS-P2-01 | `[x]` | Floor was **unsatisfiable**: `>=20.0.0` vs vite/jsdom `^20.19.0`. Now `^20.19.0 \|\| >=22.13.0` everywhere + `validate:engines` + a `validate-min-runtime` CI job. `yarn validate:all` green |
| TASK-OSS-P2-02 | `[x]` | README package table was hand-typed with **5 of 6 rows wrong** and 2 publishable packages missing; now generated + `validate:readme-facts` |
| TASK-OSS-P2-03 | `[x]` | 46 unit specs, `module.ts` at 100% lines/statements/functions; **found and fixed a second shipping defect** — `canResolvePro` resolved from the project root's *parent*, so `includePro` reported Pro missing for consumers who had installed it |
| TASK-OSS-P3-01 | `[x]` | ADR-19 written (Proposed) + `validate:adr-references` gate. DTCG **stop condition fired** — no pipeline exists, so it is a named prerequisite (P3-00), not a decision. Gate found **1 of 16 cited ADRs has a document**; `ADR-04` is cited 547 times and has never been written |
| TASK-OSS-P3-02 | `[x]` | `ComponentAnatomy` + `expectAnatomy` + generator/validator/docs, applied to DzButton. Anatomy is a **ratchet at 142/143**, not a wall. Contracts specs are **really type-checked** — they caught two errors on the first draft |
| TASK-OSS-P3-03 | `[x]` | Five pilots + `ui` prop, dual-emit, override stories, **21/21 Playwright on three engines**. The browser run found DzButton declaring **5 of its 31** component tokens and DzInput missing **17**; both fixed, and a generator now checks declared tokens against referenced ones |
| TASK-OSS-P3-04 | `[x]` | Eight recipes, 19 fixture-backed snippets (up from 12), `storybook:test` 1371/1371. **Two recipes document a missing mechanism**: there is no app-wide provider (P4-01), and portaled content escapes a shadow root (P4-03) |
| TASK-OSS-P4-01 | `[x]` | ADR-20 (Proposed) + ten composables with typed defaults; 31 unit + 4 SSR specs; manifest 1,297 → 1,314 with the ratchet held at 29/29. **Two of the ADR's own discovery numbers were wrong and are corrected**: `Intl` construction is 5 sites in 4 files (not 9 files), and the string inventory is 79 literals in two distinct groups (not a flat 72) |
| TASK-OSS-P4-02 | `[x]` | `DzProvider` + `DzThemeProvider` as a thin wrapper over it (its 34 specs pass untouched); 28 unit + 6 + 9 contract + 8 SSR/hydration specs; `dir` added to the ADR-15 bootstrap; `DzButton` is the first component to honour a provider default. **Found that `validate:contract-parity` never looked inside `packages/core/src/providers`** — `DzThemeProvider`, a public component two story files import, had no contract spec and could not have had one. Validator widened; both providers now have one. Anatomy ratchet 138 → 137 |
| TASK-OSS-P4-03 | `[x]` | One catalog: 54 `aria-label`s across 27 components (which **no** application could change) + 39 prop defaults across 24, all byte-identical to the literals they replaced — 3,442 component tests pass **unedited**. `validate:hardcoded-strings` added to `validate:all`; global Storybook pseudo-locale toolbar; all `Intl` construction cached in one framework-free module. **Three findings**: this packet's own first inventory swept up 11 JSDoc `@example` strings; `DzOrderList.dragHandleLabel` is a documented public prop nothing renders; `DzCommandPalette` held a second copy of a literal as an inline fallback. **One behaviour change** — three components formatted with `Intl`'s ambient locale, which differs between server and browser, so they could hydrate into a different language |
| TASK-OSS-P4-04 | `[x]` | **19 portal consumers, not the 15 the reassessment counted**: four (`DzBlockUI`, `DzSidebar`, `DzPopconfirm`, `DzTour`) teleported to a hard-coded `body` with **no prop to override** — the case the cookbook twice documented as unsolvable. All 19 now follow instance → provider → `document.body`; the four gained a `portalTo`. 6 precedence specs + 2 SSR specs; new *Portals & Embedding* guide. Found that `apps/landing/src/claims.spec.ts` treats every entry under `src/components/` as a family directory and throws `ENOTDIR` on a loose file — hardened |
| TASK-OSS-P4-05 | `[x]` | **55 lines across 26 variants files were physical `left`/`right`** — an Arabic document mirrored while borders, padding and text alignment stayed pinned to the physical left. Now logical. `DzTable`'s cells were `text-left`, so every cell aligned against the wrong edge. **`useTabs` hard-coded ArrowRight as "next"**, so an Arabic user pressing the key pointing at the next tab got the previous one. New `rtl` anatomy field (3 axes), `validate:rtl` gate, generated `rtl-matrix.md`, `expectRtl`/`expectRtlComputed` in `@dzup-ui/testing`, Storybook Direction toolbar. **7/144 declare an RTL contract because 7/144 declare an anatomy** — same rollout |
| TASK-OSS-P5-01 | `[ ]` | |
| TASK-OSS-P5-02 | `[ ]` | |
| TASK-OSS-P5-03 | `[ ]` | |
| TASK-OSS-P5-04 | `[ ]` | |
| TASK-OSS-P5-05 | `[ ]` | |
| TASK-OSS-P5-06 | `[ ]` | |

---

## TASK-OSS-P0-01 — Versioned component-ownership manifest schema + Core generator/validator

**Maturity: implemented → focused-validated.** Not aggregate-qualified (the full
`yarn validate:all` / `yarn test` lanes have not been run end to end yet).

### Discovery result — the authority for each classification

The task assumed `public-api.manifest.json` is generated output. **It is the
opposite**: `yarn generate:exports` *reads* it and writes
`packages/core/src/index.ts` from the family `path` of each section, never
touching the `exports` arrays. Those arrays are therefore descriptive prose in
JSON form, and they have drifted (below). So the authority for *what a package
exports* is the transitive closure of its entry barrels, reached from the
`exports` map in `package.json`; `public-api.manifest.json` is consulted only as
classification metadata.

Authority per `kind`, and the two-authority rule for compound parts, are recorded
in `packages/tooling/src/ownership/README.md`.

Consumers of export inventories found in discovery, for P1's benefit:
`packages/core/src/resolver.ts` (`PRO_COMPONENT_PREFIXES` + `startsWith('Dz')`),
`packages/nuxt/src/module.ts`, `packages/tooling/scripts/validate-exports.ts`,
and the validators under `packages/tooling/src/validators/`.

### Implemented files

| File | API effect |
|---|---|
| `packages/tooling/src/ownership/ownership-manifest.types.ts` | `OwnershipManifest`/`OwnershipEntry`/`OwnershipKind`, `OWNERSHIP_SCHEMA_VERSION = 1.0.0`, `compareSymbols` (code-unit, not locale) |
| `packages/tooling/src/ownership/ownership-manifest.schema.json` | JSON Schema 2020-12 for the artifact |
| `packages/tooling/src/ownership/module-exports.ts` | barrel scanner (`export *`, named, `default as`, external re-exports); reports unreadable modules rather than silently exporting nothing |
| `packages/tooling/src/ownership/context-graph.ts` | provide/inject + `useX`/`useXContext` compound wiring |
| `packages/tooling/src/ownership/classify.ts` | pure classification + parent-chain resolution |
| `packages/tooling/src/ownership/generate-ownership-manifest.ts` | the generator |
| `packages/tooling/src/validators/ownership-manifest.ts` | freshness · schema · references · unclassified ratchet |
| `packages/tooling/src/ownership/unclassified-ceiling.json` | `maxUnclassified: 29` |
| `packages/tooling/src/ownership/README.md` | the authority table |
| `packages/core/manifests/component-ownership.manifest.json` | **new generated artifact**, 1,297 entries |
| `package.json` | `generate:ownership`, `generate:ownership:core`, `validate:ownership` (appended to `validate:all`) |
| `eslint.config.js`, `packages/tooling/tsconfig.json` | exclude `ownership/__fixtures__` — they are deliberately broken inputs |

No export, barrel, or manifest ownership was changed.

### Focused validation output

```
yarn generate:ownership:core ×2 → byte-identical (diff empty)
✓ ownership: 1297 entries
  compat-alias 11 · composable 25 · compound-part 64 · public-component 143
  recipe 143 · token-module 18 · type 864 · unclassified 29
✓ ownership-manifest: 1297 entries fresh and internally consistent; 29/29 unclassified
vitest packages/tooling/src/ownership + validators/ownership-manifest.spec.ts → 75 passed
eslint (new files) → 0 problems
tsc -p packages/tooling → 0 errors
validate:exports → 0 errors · validate:boundaries → 0 violations
```

### Unresolved owner decisions

**1. 29 `unclassified` entries — schema 1.0.0 has no kind for them.**

- 23 compound-component injection keys (`DZ_TABS_KEY`, `DZ_THEME_KEY`, …).
- `DzResolver` (build-tool integration), `cn`, `themeScript`, `getThemeScript`,
  and compat's `warnDeprecated` / `resetDeprecationWarnings`.

Adding an `injection-key` and a `utility` kind in schema 1.1.0 is the obvious
fix, but that changes the shape Pro must also emit, so it is a cross-tier
decision, not a generator decision. The ceiling ratchets down when it is made.

**2. `public-api.manifest.json` is stale — 47 symbols of drift.**

The generator reports, and does not resolve:

- **47 components** exported from family barrels that the manifest lists in no
  section, including `DzAppShell`, `DzSidebar` (+5 parts), `DzCalendar`,
  `DzChart`-adjacent data components, `DzRating`, `DzTagsInput`, `DzTreeSelect`,
  `DzErrorBoundary`, `GovernanceBadge`, `TeamMemberBadge`.
- **3 composables** in the committed barrel and not in the manifest:
  `useInfiniteScroll`, `useScrollSpy`, `useScrollToTop`.
- **4 injection keys** beyond `#exports.injectionKeys`: `DZ_DESCRIPTIONS_KEY`,
  `DZ_SIDEBAR_KEY`, `DZ_FORM_FIELD_KEY`, `DZ_THEME_KEY`.

`DzAppShell` matters immediately: it is a **Core** component, and
`packages/nuxt/src/module.ts` lists it as **Pro** (finding H1). P1-02 must take
ownership from this manifest, not from either list.

Two of the drifted names are not `Dz`-prefixed (`GovernanceBadge`,
`TeamMemberBadge`), which is independent confirmation that the resolver's
`name.startsWith('Dz')` gate is wrong in both directions.

**3. Freshness deliberately ignores `sourceCommit`.** Gating on it would fail the
validator on every unrelated commit while proving nothing about the entries;
determinism is proved by two runs at one commit instead. Documented in the
schema, the validator header, and the ownership README.

### Ranked next packet

1. **TASK-OSS-P0-02** — fixtures + cross-tier map (direct successor; unblocks P1-02).
2. **TASK-OSS-P1-01** — the `@dzup-ui/pro` package-name repair (independent of the Pro manifest).
3. **TASK-OSS-P2-01** — engine floor, which every other validator run depends on.


---

## TASK-OSS-P0-02 — Ownership fixtures and the cross-tier ownership-map contract

**Maturity: implemented → focused-validated.**

### Discovery result

1. **The Pro ownership manifest does not exist.** `git -C ui/dzup-ui-pro show
   origin/main:packages/pro/manifests/component-ownership.manifest.json` →
   *"path does not exist in 'origin/main'"*. Only `public-api.manifest.json` and
   a `.gitkeep` are there, so Pro `TASK-GOV-01` has not run on any branch
   reachable from this machine. The task's stop condition ("stop if the live Pro
   manifest cannot be obtained read-only from origin/main") applies to *consuming*
   it; the deliverable itself is explicitly fixture-driven, so it was completed
   and the live merge is deferred to whenever Pro produces one. Pro's worktree
   (dirty: `docs/program-2026-08/governance-tasks.md`, untracked `reports/`) was
   not touched — every Pro read was `git show`.

2. **There are no real Core/Pro name collisions.** Comparing all 1,297 Core
   ownership entries against all 967 symbols in Pro's `public-api.manifest.json`
   @ `origin/main`: **overlap = 0**. The collision machinery is therefore
   fixture-only by necessity, which is the argument for having fixtures at all.

3. **Two real resolver misroutes fell out of the same comparison** — carried to
   P1-02:

   | Symbol | Truth | Today's resolver |
   |---|---|---|
   | `DzAppShell` | Core `public-component` | Pro (prefix in `PRO_COMPONENT_PREFIXES`); Pro has **no** such name |
   | `DzCalendar` | Core `public-component` | Pro (prefix); Pro's real name is `DzEventCalendar` |

   Conversely, the resolver's list still names `DzScheduler`, `DzComment`,
   `DzVirtualTable`, `DzWorkflow`, `DzReactionPicker` — none of which is a
   current Pro export root.

### Implemented files

| File | Purpose |
|---|---|
| `__fixtures__/core.manifest.json` | miniature Core tier: component, part, type, composable, compat alias |
| `__fixtures__/pro.manifest.json` | Pro tier: component, part, type, `unclassified`, plus `DzProCardBody` whose parent is a **Core** component |
| `__fixtures__/collision.pro.manifest.json` | Pro re-exporting `DzButton` |
| `__fixtures__/unknown-query.json` | names the map must answer `null` for |
| `ownership-map.schema.json` | `schemaVersion` · `inputs[]` · `symbols{}` · `collisions[]` · `crossTierRelationships[]` |
| `collision-decisions.json` | checked in, empty, with a `$example`; a decision must name an ADR |
| `build-ownership-map.ts` | merge tool + `lookupOwner`, root script `generate:ownership:map` |
| `build-ownership-map.spec.ts` | 22 specs |

### Focused validation output

```
vitest packages/tooling/src/ownership + validators/ownership-manifest.spec.ts → 97 passed
generate:ownership:map (real Core + fixture Pro)  → 1303 symbols, 1 cross-tier relationship, exit 0
generate:ownership:map (collision fixture)        → exit 1, symbol withheld from `symbols`
generate:ownership:map (Core only, no --pro)      → 1297 symbols, exit 0
eslint → 0 · tsc -p packages/tooling → 0 · validate:boundaries → 0 · validate:ownership → exit 0
```

Nothing in `packages/tooling/src/ownership` imports from `ui/dzup-ui-pro`, at
build time or runtime. Verified by `validate:boundaries` and by the merge tool
taking the Pro manifest as a **file path**.

### Unresolved owner decisions

- **Pro must run its `TASK-GOV-01`** before P1-02 can claim Pro coverage. Until
  then the resolver can only be proven correct for Core names and for the
  "unknown → undefined" behaviour.
- The two misroutes above are a **behaviour change** for consumers who rely on
  `DzAppShell`/`DzCalendar` resolving to Pro (they cannot be — Pro has no
  `DzAppShell`), so P1-02's changeset is a `minor` at minimum.

### Packet P0 exit gate

| Exit text | State |
|---|---|
| zero **unexplained** public-manifest drift | **Met as reporting**: all 47 drift items are enumerated with evidence by `yarn generate:ownership:core`. The drift itself is real and unfixed — fixing it means editing `public-api.manifest.json`, which every P0 stop condition forbids the generator's author from doing unilaterally. |
| generated output deterministic | **Met** — two runs byte-identical. |
| validation runs from a clean checkout | **Met locally**; the clean-checkout CI proof is TASK-OSS-P2-01's preflight job. |
| no source or workspace-doc catalog dirty work overwritten | **Met** — no dirty work existed in `ui/dzup-ui`; Pro was read-only; `workspace-docs/indexes/document-catalog.jsonl` untouched. |

### Ranked next packet

1. **TASK-OSS-P1-01** — package-name repair; needs no Pro manifest.
2. **TASK-OSS-P1-02** — resolver rewrite on the generated lookup.
3. **TASK-OSS-P2-01** — engine floor + min-runtime preflight.


---

## TASK-OSS-P1-01 — Replace the retired Pro package name, add a stale-name validator

**Maturity: implemented → focused-validated → aggregate-qualified for the packages it touches**
(`yarn build` clean; two unrelated pre-existing tooling failures listed below).

### Discovery result — 57 references, classified

| Class | Count | Files |
|---|---|---|
| **Runtime** | 15 | `packages/core/src/resolver.ts` (4) · `packages/nuxt/src/module.ts` (5) · `packages/codemods/src/transforms/rename-imports.ts` (6, incl. one the task's own grep hides — see below) |
| **Runtime, help text / doc comment** | 3 | `packages/codemods/bin/dzup-codemod.js` (2) · `packages/tokens/src/index.ts` (1) |
| **Test** | 11 | `packages/core/src/resolver.spec.ts` (3) · `packages/codemods/**/rename-imports.spec.ts` (6) · `packages/compat/src/utils/deprecation.spec.ts` (2) |
| **Docs** | 15 | `apps/storybook/stories/Ssr.mdx` (2) · `Migration.mdx` (1) · `packages/core/stories/data/DzAccordion.stories.ts` (1) · `apps/sandbox/src/pages/EditorsPage.vue` (5) · `docs/features.md` (1) · `docs/features-2.md` (2) · `docs/landing.md` (1) · plus reflow |
| **Historical — kept** | 13 | `packages/nuxt/CHANGELOG.md` · `FEATURESLOG.md` · `docs/free-apps-audit.md` · `docs/program-2026-08/**` |

**A reference the specified discovery grep cannot see.** The task's command filters
out `@dzup-ui/pro-…`, which also hides
`['@dzup-ui/pro-components', '@dzup-ui/pro']` in the codemod's import map — the
*target* of that rewrite was the retired name. Left alone, `yarn dzup-codemod
rename-imports` would have kept migrating consumers *onto* the dead package. The
new validator found it because it matches the retired name by boundary rather
than by excluding a prefix.

### Implemented files + API effect

- `packages/core/src/resolver.ts` — emits `@dzup-ui-pro/pro`; the two package
  names are **module-local** constants. They were briefly exported, and the
  P0-01 ownership validator immediately failed freshness with
  `+CORE_PACKAGE, PRO_PACKAGE, RESOLVABLE_PACKAGES` — three new public symbols
  schema 1.0.0 cannot classify, which would have pushed `unclassified` past its
  ceiling. Making them local is also the better test: the spec states the two
  real names independently, because asserting an implementation against its own
  constant is precisely what hid this defect.
- `packages/nuxt/src/module.ts` — `PRO_PACKAGE` constant used for `transpile`
  and `filePath`. `includePro` option name unchanged.
- `packages/codemods/src/transforms/rename-imports.ts` — both legacy sources now
  rewrite to `@dzup-ui-pro/pro`.
- `packages/tooling/scripts/validate-package-names.ts` + `retired-package-names.json`
  + `validate-package-names.spec.ts` (17 specs) — new gate, in `validate:all`.
- `vitest.config.ts` — `packages/*/scripts/**/*.spec.ts` added to `include`; the
  script-form validators gate merges and had no way to be tested in the default
  lane.
- `.changeset/pro-package-is-named-dzup-ui-pro-pro.md` — patch for
  `@dzup-ui/core` and `@dzup-ui/nuxt`.

### The validator's design, and why it is not a plain grep

Three legitimate ways to name a retired package, each with a mechanism:

1. **allowlisted paths** — changelogs, changesets, ADRs, audit records, `dist/**`,
   and `docs/program-2026-08/**`. A historical record states what was true when
   it was written; rewriting it would falsify it.
2. **`retired-name-ok: <reason>`** on the line or the line above. The two-line
   form is what makes it usable in Markdown and MDX prose, where an inline
   comment cannot sit beside the text.
3. **longer package names are not matches** — `@dzup-ui/pro-components` is a
   different legacy package the codemod must keep naming in order to rewrite it.

Config is data (`retired-package-names.json`), so retiring the next name is a
JSON edit, and each retirement records *why*.

### Focused validation output

```
yarn validate:package-names                              → ✓ (0 outside history)
vitest packages/tooling/scripts                          → 17 passed
vitest packages/core/src/resolver.spec.ts                → 12 passed
vitest packages/codemods packages/compat                 → 320 passed (with the above)
vue-tsc -p packages/core · tsc -p packages/{tooling,codemods,contracts}  → 0 errors
eslint (every touched file)                              → 0 problems
yarn build                                               → ✓ built; 0 retired names in any dist
yarn validate:ownership · validate:exports · validate:boundaries → all green
```

### Tooling failures, reported separately (pre-existing, not caused by this work)

Two specs in `packages/tooling` fail on this checkout. Both files are
**unmodified** by this program and import nothing it touched:

| Spec | Failure | Cause |
|---|---|---|
| `src/validators/interaction-contract.spec.ts` | `expected 'packages\core\src\…' to be 'packages/core/src/…'` | the validator returns win32 separators; the spec asserts POSIX ones |
| `src/bundle-budget-check.spec.ts` | `ENOENT … .bundle-budget-test-tmp/run-mixed/bundlesize.config.json` | temp-fixture setup |

Both are win32-environment defects in the tooling suite, not component failures.
They are outside this task's scope; TASK-OSS-P2-01 (runtime/tooling preflight)
is the right packet to own them, and they are carried there.

### Unresolved owner decisions

- **Is `patch` the right bump?** The resolver's `from` value changes for
  `includePro: true` consumers. Nobody could have depended on the old value —
  `@dzup-ui/pro` has never been publishable — so the changeset says patch. If a
  consumer aliased the dead name locally, this is breaking for them.
- **`includePro: true` still cannot work**, because `@dzup-ui-pro/pro` is not
  published either. P1-03's `pro-missing` fixture and diagnostic is what makes
  that failure legible instead of cryptic.


---

## TASK-OSS-P1-02 — Resolver: generated exact-name ownership instead of prefixes

**Maturity: implemented → focused-validated → aggregate-qualified for Core.**
The Pro half is **blocked on Pro `TASK-GOV-01`** — see "What is not done" below.

### What the prefix list actually got wrong

Reading the generated ownership manifest against the deleted
`PRO_COMPONENT_PREFIXES` list produced three classes of defect, all of which a
prefix rule is structurally incapable of avoiding:

| Defect | Names | Effect before |
|---|---|---|
| **Core routed to Pro** | `DzAppShell`, `DzCalendar` | with `includePro: true`, two Core components were imported from a package that has never been publishable. Pro exports no `DzAppShell` at all. |
| **Pro names Pro does not export** | `DzScheduler`, `DzComment`, `DzVirtualTable`, `DzWorkflow`, `DzReactionPicker` | reserved from Core resolution for nothing |
| **Unknown → Core** | `DzButtonn`, `DzGanttRow`, any typo | a typo became an import of a component that does not exist; the error surfaced as a bundler resolution failure |

Two Core components are not `Dz`-prefixed at all (`GovernanceBadge`,
`TeamMemberBadge`), so `name.startsWith('Dz')` was wrong in the other direction
too. The exact-name table resolves them; a heuristic could not.

### Implemented files + API effect

| File | Effect |
|---|---|
| `packages/tooling/src/ownership/emit-runtime-lookup.ts` | renders the runtime table; only `public-component` and `compound-part` are emitted — a resolver that answered `DzButtonProps` would generate an import for a type |
| `generate-ownership-manifest.ts` | now also writes `packages/core/src/generated/component-ownership.ts`; reads an optional Pro manifest from `$DZUP_PRO_OWNERSHIP_MANIFEST` |
| `packages/core/src/generated/component-ownership.ts` | **new generated, committed artifact** — 207 names (205 `Dz*` + 2 un-prefixed), `OWNERSHIP_TIERS = ['core']` |
| `packages/core/src/resolver.ts` | rewritten as a lookup; `PRO_COMPONENT_PREFIXES` and the `startsWith` loop are gone; **new `prefix` option**; new exported type `DzResolvedComponent`; warns once at construction when `includePro` has no Pro tier to draw on |
| `validators/ownership-manifest.ts` | fifth gate: runtime-lookup freshness |
| `eslint.config.js` | ignores `packages/core/src/generated/**` |
| `.changeset/resolver-resolves-by-exact-name.md` | **minor** for `@dzup-ui/core` |

### Acceptance table from the task

| Case | Input | Expected | Result |
|---|---|---|---|
| Core component | `DzButton` | `@dzup-ui/core` | ✅ |
| Pro component | `DzDataGridPro` (`includePro`) | `@dzup-ui-pro/pro` | ⛔ **unverifiable** — no Pro manifest, so no Pro tier in the table |
| Pro excluded | any Pro name, `includePro: false` | `undefined` | ✅ (vacuous today; asserted over every Pro-owned row) |
| prefix collision | a name in both tiers | never Core by default | ✅ covered by P0-02's merge specs; **no real collision exists** |
| compound part | `DzCardBody` | `@dzup-ui/core` | ✅ and asserted equal to its parent's `from` |
| unknown | `DzGanttRow`, `DzNotAComponent`, `DzButtonn`, `DzButt` | `undefined` | ✅ |
| custom prefix | `XButton` with `prefix: 'X'` | `@dzup-ui/core` | ✅ resolves to the real export name `DzButton` |

### Freshness without trapping CI

The runtime table records which tiers produced it. `validate:ownership`
regenerates using **the tier set the committed file itself records** — so a
Core-only machine does not fail a table a Pro-equipped machine generated, and a
file claiming a Pro tier with no manifest available is reported as a *missing
input*, not as drift. Gating any other way would have made the check fail for
reasons unrelated to correctness, which is how gates get disabled.

### What is not done, and why

**The Pro tier.** `packages/pro/manifests/component-ownership.manifest.json`
does not exist on Pro `origin/main` (P0-02 §Discovery). The task's stop
condition — *"do not hand-maintain another list as a bridge"* — was honoured:
nothing here fabricates Pro data. The consequence is explicit and visible in
three places: `OWNERSHIP_TIERS = ['core']` in the generated file, a one-line
warning when `includePro: true` is set, and a skipped spec
(`it.runIf(HAS_PRO_TIER)`).

Net effect on a consumer setting `includePro: true`: before, Pro names resolved
to an uninstallable package (hard build failure) **and two Core components were
misrouted**; now Pro names resolve to nothing and the resolver says why. Neither
gives working Pro auto-import — only Pro `TASK-GOV-01` can — but the second
stops lying and stops breaking Core.

### Focused validation output

```
vitest packages/core/src/resolver.spec.ts      → 23 passed, 1 skipped (the Pro row)
vitest packages/tooling (ownership + scripts)  → 137 passed, 1 skipped
yarn validate:ownership                        → ✓ 1298 entries, runtime lookup in sync
yarn validate:package-names                    → ✓
vue-tsc -p packages/core · tsc -p packages/tooling → 0 errors
eslint (touched files)                         → 0 problems
yarn build                                     → ✓; dist/resolver.js 0.91 kB
validate:dts · validate:exports · validate:externals · validate:boundaries → all green
validate:bundle-budget                         → index.js 6.72 kB ≤ 150 kB
```

The 14 kB generated table is reachable **only** from `dist/resolver.js`, a
build-time entry a bundler config imports. It is not in `dist/index.js`, so no
byte of it reaches a browser.


---

## TASK-OSS-P1-03 — Nuxt fixtures validated against built/packed tarballs

**Maturity: implemented → focused-validated → packaged (tarball fixture).**
Six of seven fixtures build from real packed artifacts and assert. The seventh
is unrun for a stated reason.

### The defect the fixtures were built to find, found on their first run

`packages/nuxt/src/module.ts` pushed `@dzup-ui/tokens/dist/tokens.css` into
`nuxt.options.css`. That deep path is **not in the tokens package's `exports`
map** — the declared specifier is `@dzup-ui/tokens/css` — so every consumer
install died at build time with:

```
Missing "./dist/tokens.css" specifier in "@dzup-ui/tokens" package
```

It resolved inside this repository only because the workspace's `node_modules`
are symlinks into the source tree. No workspace-alias test could have seen it.
Fixed, and shipped in a changeset.

### Two harness facts that had to be discovered the hard way

**1. A fixture inside the monorepo is not a consumer.** The first staged run
failed inside `dzup-ui/node_modules/nitropack/…` — Node's resolution walks *up*
the directory tree, so a fixture under `packages/nuxt/test/` finds the
repository's own nuxt, nitropack and vite. Fixtures are now copied to a stage
root outside the repo (`<tmpdir>/dzup-nuxt-fixtures`, overridable via
`DZUP_FIXTURE_STAGE`), and a spec asserts the stage root is not under the repo.

**2. `nuxt@3.14.0` — the version `packages/nuxt` pins for development — cannot
build a consumer app.** With a current dependency tree, nitropack 2.13.x nests
copies of `std-env`, `cookie-es`, `db0` and others, and Nuxt 3.14's `impound`
plugin refuses every module under `node_modules/nitropack/node_modules/`.
Reproduced under **both npm and yarn**, in a clean project, with no dzup-ui code
in the graph; pinning nitropack to 2.10.4 only moved the failure to the next
nested package. On `nuxt@3.21.11` the same fixture builds and prerenders
cleanly. The fixtures therefore install `nuxt: ^3.19.0` — which is also the
honest consumer simulation, since consumers install a current Nuxt.
**Owner decision:** `packages/nuxt`'s own devDependency (`nuxt@3.14.0`) and its
`peerDependencies` floor (`nuxt >=3.0.0`) both claim support this evidence
contradicts.

### Implemented files

| File | Purpose |
|---|---|
| `packages/nuxt/src/module.ts` | rewritten: registration from `@dzup-ui/core/ownership`, declared CSS specifiers, Pro-missing diagnostic, `applyPrefix` that stops mangling un-prefixed names |
| `packages/core/package.json` | new `./ownership` subpath so integrations read ownership without importing the component library |
| `packages/nuxt/scripts/pack-fixtures.mjs` | `yarn pack` (not `npm pack` — it resolves `workspace:*`) + stage outside the repo |
| `packages/nuxt/scripts/install-fixtures.mjs` | per-fixture `npm install`; evicts `@dzup-ui*` first, because npm treats an unchanged `file:` path as up to date and would test the previous build |
| `packages/nuxt/test/fixtures/*` (7) | fixture sources + a README each explaining what it proves |
| `packages/nuxt/test/fixtures.spec.ts` | 18 tests |
| `packages/nuxt/test/vitest.config.ts` | own config: ~800 packages and a full build per fixture is not a default-lane cost |
| `package.json` | `test:nuxt-fixtures{,:pack,:install}` |
| `generate-ownership-manifest.ts` | `src/generated/**` classified `internal` — public *path*, not consumer surface |

### Fixture results

| Fixture | Result |
|---|---|
| core-only | ✅ `<DzButton>` auto-imported from the tarball, server-rendered with its contract's `data-tone` and variant classes |
| custom-prefix | ✅ `<XButton>` registered; the emitted import still names `DzButton` |
| css-order | ✅ token stylesheet precedes the component stylesheet in the inlined `<style>` blocks (Nuxt inlines critical CSS, so the assertion reads blocks, not `<link>`s) |
| ssr-hydration | ✅ markup **and** interpolated text present in server HTML; `data-theme` bootstrapped |
| pro-missing | ✅ build succeeds with Core; the exact diagnostic is emitted (see below) |
| optional-peer | ⚠️ **premise refuted** — see below |
| core-pro | ⛔ **unrun** — no Pro tarball exists |

The `pro-missing` diagnostic, captured from a real build:

```
includePro is true, but "@dzup-ui-pro/pro" cannot be resolved from this project.
Install it (yarn add @dzup-ui-pro/pro) or set dzupUi.includePro to false.
Continuing with Core components only.
```

### `optional-peer`: the fixture refuted its own premise

It was written to prove a consumer using only plain components need not install
`reka-ui`. Measurement says otherwise:

- `@dzup-ui/core` declares `reka-ui` in `peerDependencies` with **no**
  `peerDependenciesMeta.optional`, so npm 7+ installs it automatically even
  though the fixture never asks for it;
- deleting it fails the build with `Rollup failed to resolve import "reka-ui"`
  — for an app whose only component is `<DzButton>`.

So **Core has no optional peers**, and the reassessment's "one representative
optional peer, present and absent" case has nothing to bind to. The fixture now
asserts the contract that exists. **Owner decision:** making `reka-ui` optional
needs `peerDependenciesMeta` *and* a registration strategy that does not pull a
Reka-backed component into a Button-only app — the module registers all 207
components, which is the likely cause.

### Focused validation output

```
yarn test:nuxt-fixtures:pack     → 4 tarballs; 6 staged ready, core-pro unrun
yarn test:nuxt-fixtures:install  → 6 fixtures, ~820 packages each
yarn test:nuxt-fixtures          → 11 passed, 7 skipped (each unrun cell logged with its fix)
tsc -p packages/nuxt             → 0 errors
eslint packages/nuxt             → 0 problems
validate:ownership · :exports · :dts · :peers · :package-names → all green
```

### P1 exit gate

| Exit text | State |
|---|---|
| tarball fixtures import `DzButton` by direct import, resolver, and Nuxt auto-import | **Auto-import ✅** (core-only, custom-prefix). Direct-import and resolver paths are covered by unit specs, not by a tarball fixture — a gap worth a follow-up fixture. |
| … and representative **Pro** components | ⛔ **unmet** — Pro publishes no tarball and no ownership manifest |
| missing Pro → actionable build-time diagnostic | ✅ asserted against a real build |
| no `@dzup-ui/pro` outside migration history | ✅ `validate:package-names`, in `validate:all` |


---

## TASK-OSS-P1-04 — Install and integration documentation

**Maturity: implemented → focused-validated → aggregate-qualified**
(`yarn storybook:build` and `yarn landing:build` both clean).

### The mechanism

`yarn validate:doc-snippets` (new, in `validate:all`) compares every marked
snippet with the fixture file it claims to come from:

```md
<!-- fixture: packages/nuxt/test/fixtures/core-only/nuxt.config.ts -->
```

MDX cannot carry HTML comments, so it uses `{/* fixture: … */}`. Append
`#region` to compare against a named region for files whose whole contents are
not meant to be pasted. Unmarked code blocks are left alone — demanding a
fixture for every snippet in the repository would make the gate unusable rather
than trustworthy.

The fixtures are the ones `yarn test:nuxt-fixtures` installs from packed
tarballs and builds, so a documented path that does not build now fails twice:
once in the fixture suite, once in the snippet check.

To make this work, the fixture `nuxt.config.ts` files were reduced to exactly
what a consumer writes — the `telemetry`/`devtools` conveniences are gone, so
the file that gets built and the snippet that gets read are the same text.

### What each surface now documents

| Surface | Covers |
|---|---|
| `packages/nuxt/README.md` | rewritten: Core-only, Core + Pro, the Pro-missing diagnostic verbatim, `prefix`, CSS order with the reason, SSR, options table, supported Nuxt versions |
| `README.md` | new fixture-backed Nuxt section + the `DzResolver` Vite path |
| `apps/storybook/stories/GettingStarted.mdx` | new Nuxt and Vite auto-import sections |
| `apps/storybook/stories/Ssr.mdx` | four corrections (below) |

### Three stale claims corrected while writing

1. **`@dzup-ui/tokens/dist/tokens.css` appeared twice in `Ssr.mdx`** — the same
   unexported deep path that broke every consumer install (P1-03). Both now name
   `@dzup-ui/tokens/css`, with the reason stated.
2. **"A known gap in the module"** described the hand-maintained 138-name list
   and warned that a component could ship in Core and not be auto-importable.
   That gap is closed by P1-03; the section now records what it was and what
   replaced it, rather than warning about a limitation that no longer exists.
3. **`packages/nuxt/README.md` documented no CSS ordering, no SSR behaviour, no
   diagnostic, and no supported-Nuxt statement.** All four are now stated, and
   the Nuxt-version section records the P1-03 finding that the declared
   `nuxt >=3.0.0` floor is not evidence-backed.

### Focused validation output

```
yarn validate:doc-snippets                → ✓ 12 fixture-backed snippets match
vitest packages/tooling/scripts           → 32 passed (15 new, incl. drift detection)
yarn validate:package-names               → ✓
yarn storybook:build                      → ✓ 23.04 MB within 25 MB budget
yarn landing:build                        → ✓ built in 38.70s
eslint packages/tooling/scripts · tsc -p packages/tooling → clean
```

The drift check is tested in both directions: a matching snippet passes, and an
edited one fails with `no longer matches its fixture`.

### Not done

`apps/landing` has no install-copy surface to mark up — its only `yarn add`
string is inside `src/blocks/config.ts`, a block-registry data file rather than
a documentation page. Marking generated registry data with fixture comments
would be noise; if the landing gains a real install page, it should be added to
`DOC_ROOTS` in the validator (already listed, so it will be scanned as soon as
content exists).


---

## TASK-OSS-P2-01 — One engine floor, and a preflight that exercises it

**Maturity: implemented → focused-validated → aggregate-qualified.**
`yarn validate:all` passes end to end, including the four gates this program
added. The CI preflight job is written but **has not been dispatched** — CI runs
are owner authority.

### The declared floor could not run the gates

`engines.node` said `>=20.0.0`. Measured against the dependencies the gates load:

| Dependency | Requires | Loaded by |
|---|---|---|
| `vite@7.3.5` | `^20.19.0 \|\| >=22.12.0` | `yarn build`, `storybook:build`, `landing:build` |
| `jsdom@29.1.1` | `^20.19.0 \|\| ^22.13.0 \|\| >=24.0.0` | `yarn test` |
| `eslint@9.39.4` | `^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0` | `yarn lint` |

On Node 20.0.0 — a version the repository advertised — **`yarn build` and
`yarn test` cannot start**. Nobody hit it because all 17 CI `node-version:`
entries requested a floating `20`, which `actions/setup-node` resolves to the
newest 20.x. The floor was a claim nothing ever ran on. `CONTRIBUTING.md`
repeated it, and there was no `.nvmrc` at all.

The one thing the task expected to find was already fine: **every** `validate:*`
and `generate:*` script already goes through `tsx`. Nothing uses `node file.ts`
or `--experimental-strip-types`, so there was nothing to convert — only
something to keep true, which a spec now does.

### The floor chosen: `^20.19.0 || >=22.13.0`

The exact intersection of what the gates' dependencies require, not a round
number. A bare `>=20.19.0` would additionally claim Node 21.x and 23.x, which
`jsdom` refuses; both are non-LTS and already EOL, so claiming them would be
false rather than generous. Recorded in
`docs/adr/ADR-18-runtime-floor-and-validator-runner.md` (**Proposed** — a floor
is an owner decision).

Declared in four places that now agree, and a gate that keeps them agreeing:
root `package.json`, `packages/mcp/package.json`, `.nvmrc` (the floor itself),
and every CI workflow (17 pins, `[20, 22]` → `['20.19.0', '22.13.0']`).

### Implemented files

| File | Purpose |
|---|---|
| `docs/adr/ADR-18-…md` | the decision. **`docs/adr/` did not exist** — ADR-01…ADR-17 are referenced across the repo by number with no records anywhere. This is the first written one. |
| `packages/tooling/scripts/validate-engines.ts` | three checks: declarations agree · floor is satisfiable by each gate dependency's *installed* `engines` · CI pins an exact version rather than a floating major |
| `…/validate-engines.spec.ts` | 13 specs, including "every TS script runs through a declared runner" |
| `.nvmrc` | `20.19.0` |
| `.github/workflows/ci.yml` | new `validate-min-runtime` job: clean checkout, `node-version-file: .nvmrc`, no cache restore, then generators → `validate:all` → `build` → `test` |
| `package.json`, `packages/mcp/package.json`, `CONTRIBUTING.md` | the floor |

The preflight reads `.nvmrc` rather than hard-coding a version, so the floor is
one number in one place; a fourth copy would be the first to drift.

### Two inherited tooling failures (carried from P1-01)

| Spec | Verdict |
|---|---|
| `validators/interaction-contract.spec.ts` | **Real defect, fixed.** `validateFile` reported win32 separators, so the same finding printed two different ways depending on who ran the gate, and the spec asserting the POSIX form failed on Windows. Now normalised like every other validator. |
| `bundle-budget-check.spec.ts` | **Not reproducible.** Passes alone (28 tests) and in the full `packages/tooling` run (368 passed, 1 todo). The earlier `ENOENT … .bundle-budget-test-tmp/run-mixed/` looks like a temp-directory race against a concurrent build. Recorded as suspected-transient, **not** fixed — a flake nobody has characterised is still a defect, and it should be watched. |

### Focused validation output

```
yarn validate:engines   → ✓ floor declared consistently, every gate dependency satisfies it
yarn validate:all       → ✓ EXIT 0, all 17 gates green (incl. ownership, package-names,
                            doc-snippets, engines — the four this program added)
vitest packages/tooling → 368 passed, 1 todo, 29 files
```

### Unresolved owner decisions

- **Node 20 left maintenance in April 2026** and receives no security updates as
  of 2026-08-20. The floor keeps it because the evidence supports it and
  dropping a major is a support decision, not a tooling one. `>=22.13.0` would
  be defensible today.
- **`validate-min-runtime` has never run.** It is written and wired; dispatching
  CI is owner authority. Its first run is the moment the floor stops being a
  claim — and it may find gates that still cannot start at 20.19.0, which is the
  point of having it.


---

## TASK-OSS-P2-02 — Generated README facts with a freshness check

**Maturity: implemented → focused-validated → aggregate-qualified**
(`yarn validate:all` green with the new gate).

### What the hand-typed table said

| Package | README claimed | Actual |
|---|---|---|
| `@dzup-ui/core` | 0.1.0-alpha.0 | **0.2.0** |
| `@dzup-ui/tokens` | 0.1.0-alpha.0 | **0.2.0** |
| `@dzup-ui/contracts` | 0.1.0-alpha.0 | **0.1.0** |
| `@dzup-ui/compat` | 0.0.1 | **0.1.0-alpha.0** |
| `@dzup-ui/codemods` | 0.0.1 | **0.1.0-alpha.0** |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | 0.1.0-alpha.0 ✓ |

Five of six rows named a version the package had already moved past, and the
table omitted `@dzup-ui/mcp` and `@dzup-ui/testing` — both publishable. The
"Component Families" line was likewise hand-typed.

### Discovery: two of the three targets were already generated

The task assumed counts were hand-maintained in several places. Two were not:

- **`apps/storybook/stories/Introduction.mdx`** already renders every count from
  `_data/counts.generated.ts` — no hand-typed number to replace.
- **`README.md` already had a `claims:generated` region**, owned by
  `apps/landing/scripts/build-counts.ts` and asserted by
  `apps/landing/src/claims.spec.ts`.

So the new generator deliberately uses a **different marker name** (`facts:`)
and a different source of truth: `package.json` and the ownership manifest,
rather than the landing's product evidence. Two generators own two regions of
one file, and neither touches the other's — a spec asserts that.

### Implemented files

| File | Purpose |
|---|---|
| `packages/tooling/scripts/generate-readme-facts.ts` | named regions `facts:packages`, `facts:families`, `facts:catalog`; `--check` is the validator |
| `…/generate-readme-facts.spec.ts` | 15 specs, including idempotence and "does not touch `claims:generated`" |
| `README.md` | table, families and catalog line now generated |
| `packages/nuxt/package.json` | description corrected — it claimed the module "auto-imports all `Dz*` components", but since P1-03 it registers from the ownership table, including the two Core components that are not `Dz`-prefixed |
| `package.json` | `generate:readme-facts`, `validate:readme-facts` (in `validate:all`) |

Counts come from the **ownership manifest**, not a glob: a glob over `.vue`
would report `DzCardBody` as a component in its own right, while the manifest
already knows it is a compound part. The README now states both numbers
separately — 143 public components, 64 compound parts — instead of one number
that had to mean whichever the reader assumed.

### Focused validation output

```
yarn generate:readme-facts        → 3 regions rewritten
yarn validate:readme-facts        → ✓ (fails on a hand edit)
vitest packages/tooling/scripts   → 58 passed
yarn validate:all                 → ✓ EXIT 0
eslint · tsc -p packages/tooling  → clean
```

### Not done

`packages/*/README.md` carry no version prose to mark up, so no fact regions
were added there. They are already listed in the generator's `FACT_DOCUMENTS`,
so markers will be picked up the moment one is added.


---

## TASK-OSS-P2-03 — A real unit suite for `packages/nuxt`

**Maturity: implemented -> focused-validated -> aggregate-qualified.**

### Discovery result

The package's own `test` script read
`echo 'No unit tests in nuxt - run yarn typecheck'`, but the root vitest
`include` already covers `packages/*/src/**/*.spec.ts` -- so a spec placed in
`packages/nuxt/src/` runs in the default `yarn test` lane with no config change,
and the coverage `include` (`packages/*/src/**/*.{ts,vue}`) already claims the
package at the repo's 80% bar. The gap was the tests, not the wiring.

`setup()` is directly callable once `@nuxt/kit` is mocked, because
`defineNuxtModule` is a wrapper the mock can return unchanged.

### The defect the tests found

`canResolvePro(nuxt.options.rootDir)`. `createRequire` resolves relative to the
**directory of the filename it is given**, and `rootDir` is a directory, so
lookups started one level *above* the consumer's project and never saw the
project's own `node_modules`. Probed against a real fixture tree before
changing anything:

```
createRequire(root)                  -> MODULE_NOT_FOUND
createRequire(root + '/')            -> .../node_modules/@dzup-ui-pro/pro/index.js
createRequire(root + '/package.json')-> .../node_modules/@dzup-ui-pro/pro/index.js
```

Effect on a consumer: `includePro: true` printed "cannot be resolved from this
project" **even when Pro was installed at the project root** -- the exact case
the option exists for. Only a monorepo-shaped layout, where the package sits in
a parent's `node_modules`, would have appeared to work.

Fixed by anchoring the resolution base on `<projectRoot>/package.json`
(a base, not a file that must exist), and by renaming the parameter from
`resolveFrom` to `projectRoot` so the next caller cannot pass a directory to
something that wants a filename without noticing.

This is the second shipping defect this program has surfaced in the module's
consumer-facing path, after `@dzup-ui/tokens/dist/tokens.css` in P1-03. Both
had the same shape: a path that resolves inside this monorepo and nowhere else.

### Implemented files

| File | Purpose |
|---|---|
| `packages/nuxt/src/module.spec.ts` | 32 specs against the **real** ownership table: metadata, registration set, per-name owner, prefix rules, CSS order and subpath legality, transpile list, the two `includePro` failure diagnostics, and the pure helpers |
| `packages/nuxt/src/module.pro.spec.ts` | 14 specs for the `includePro` **success** path, against a mocked two-tier ownership table and a **real** temp project with `@dzup-ui-pro/pro` installed under it |
| `packages/nuxt/src/module.ts` | `canResolvePro` resolution-base fix (above) |
| `packages/nuxt/package.json` | `test` now runs `yarn --cwd ../.. vitest run packages/nuxt/src`, matching the idiom `packages/tokens` already uses |

Two spec files rather than one, deliberately: the Pro-available path needs an
ownership table with a `pro` tier, `vi.mock` of a module imported at load time
is file-scoped, and mocking it per-test would make the real-table assertions in
`module.spec.ts` depend on test order.

The Pro fixture mocks the ownership **table** but not **resolution** -- an
earlier draft mocked `node:module` instead, and a mocked `createRequire` would
have agreed with the bug rather than exposing it.

### Focused validation output

```
vitest run packages/nuxt/src            -> 46 passed (2 files)
coverage (packages/nuxt/src scope)      -> module.ts  100 % stmts · 100 % lines · 100 % funcs · 86.2 % branches
eslint packages/nuxt/src --max-warnings 0 -> 0 problems
tsc --noEmit -p packages/nuxt/tsconfig.json -> 0 errors
```

Branch coverage stops at 86.2% on three defensive fallbacks
(`options.prefix ?? ''`, `head.script || []`, the module's `compatibility`
block). Each is reachable only by handing `setup()` an object Nuxt never
constructs; they are left uncovered rather than tested through a fake that
would assert nothing about Nuxt.

### Not done

`yarn test packages/nuxt` -- the literal command in the task -- is not a valid
invocation in this repo: the root `test` script is `yarn test:prepare && vitest
run`, so a trailing path is consumed by `test:prepare`, not by vitest. The
equivalent commands used instead are `yarn workspace @dzup-ui/nuxt test` and
`npx vitest run packages/nuxt/src`.

---

## TASK-OSS-P3-01 — ADR: five-layer customization contract

**Maturity: implemented (the ADR is *Proposed*, awaiting maintainer approval) →
focused-validated → aggregate-qualified.** The decision is not "done" until a
maintainer approves it; P3-02 may build against it, P3-03 must not ship pilots
on an unapproved contract.

### Discovery result — three facts that changed the ADR's shape

**1. The stop condition fired. There is no DTCG pipeline.** Tokens are
TypeScript maps under `packages/tokens/src/{primitives,semantic,component}/`;
`generate.ts` projects them into `dist/tokens.css`, `dist/tokens.d.ts` and
`dist/tailwind-theme.js`. No `$value`/`$type` document exists anywhere in the
package. The task says to report the gap as a prerequisite packet rather than
invent a format, so decision 1 is **not** "DTCG is the authority" — it is
"`--dz-*` is the interchange surface, the TS maps are the source, and **P3-00
(DTCG emit)** is a named prerequisite that nothing downstream may assume".

The remaining four decisions are independent of that gap, and they are the ones
P3-02/03/04 actually consume, so the ADR was written rather than abandoned.

**2. Cascade layers already ship, under different names than the plan assumes.**
`@layer dz-tokens, dz-base, dz-components;` is declared twice — in
`packages/tokens/src/generate.ts` (emitted into `tokens.css`) and in
`packages/core/src/styles/base.css` (emitted into `core.css`).

The reassessment spells the order `dz.reset, dz.tokens, dz.base, dz.components,
dz.utilities, dz.overrides`. `@layer dz.components` is a *sublayer named
`components` inside a layer named `dz`* — a **different layer** from the shipped
top-level `dz-components`, not a re-spelling of it. Adopting it renames every
layer the library has published, moves every existing rule, and silently
reorders any consumer sheet that already writes `@layer dz-components { … }`.

Decision: keep the hyphenated names, extend to the same six slots. The ordering
the reassessment wants is delivered; only the spelling differs, and the spelling
is the part that would break consumers.

**3. `data-state` is already used two incompatible ways.**
`packages/contracts/src/data-attributes.types.ts` types it as a closed union of
eight values (`open`/`closed`/`active`/…). `DzButton.vue` emits
`idle`/`loading`/`disabled` — **none of which is in that union**. Neither side is
wrong; the premise is. One global enum cannot cover a disclosure widget and a
button, and the "fix" that keeps the union would be to give buttons a value that
means nothing for them.

Decision: `data-state` is a per-component enum declared in the component's
anatomy; the global union survives as a *named vocabulary*, not a constraint.

### The measured baseline, which is the point of the packet

| Mechanism | State on `main` @ `be76ddb` |
|---|---|
| `data-part` | **7 occurrences in 2 files** of 143 public components (`DzCodeBlock`, `TeamMemberBadge`) |
| `data-slot` | 0 |
| `data-state` | 79 files |
| `data-tone` / `data-disabled` / `data-invalid` / `data-loading` | 37 / 64 / 18 / 16 |
| `data-size` / `data-variant` / `data-orientation` | 11 / 10 / 6 |
| typed override prop (`ui` / `parts` / `classes`) | **none exists** |

A fourth finding worth its own line: `core.css` already ships
`.dz-panel[data-size=lg]`, `.dz-toolbar[data-variant=elevated]`,
`.dz-kbd[data-size=xs]`. **The styling surface is already public**, the library's
own stylesheet depends on it, and nothing declares, tests, or protects it. That
is why the ADR names recipe attributes as a third declared category beside parts
and states.

### Implemented files

| File | Purpose |
|---|---|
| `docs/adr/ADR-19-public-styling-contract.md` | the decision: token interchange (deferred, with a named prerequisite), six-slot layer order, `data-part` vocabulary, per-component state enums + presence-only booleans + recipe attributes, the `ui` prop, dual-emit migration |
| `packages/tooling/scripts/validate-adr-references.ts` | the gate (below) |
| `packages/tooling/scripts/validate-adr-references.spec.ts` | 25 specs, including one that runs the real repository through the rules |
| `packages/tooling/scripts/adr-registry.json` | the ratcheted debt ledger, 14 entries |
| `package.json` | `validate:adr-references`, appended to `validate:all` |
| `CLAUDE.md` | ADR-18/ADR-19 rows, plus a note that the other 14 have no document |

No component, token, or stylesheet was changed. The ADR is a decision, not an
implementation.

### What the new gate found: 1 of 16 cited ADRs has a document

The task asks for a `validate:adr-references`-style check "if Core lacks one".
Core lacks one, and the reason is worse than expected:

- **16 distinct ADR numbers are cited** across source and prose. `ADR-04` alone
  appears **547 times**; `ADR-08` 208; `ADR-16` 148; `ADR-07` 116.
- **`docs/adr/` contained exactly one document** — ADR-18, written by P2-01 in
  this same run. `workspace-docs/repos/dzup-ui/docs/adr/` holds ADR-17 and
  nothing else, and it has never been copied into the repo.
- So a reader following `(ADR-04)` — the most-cited rule in the codebase, the one
  `validate:tokens` enforces — arrives nowhere.

Writing 14 ADRs is a documentation packet with an owner, not something this task
may do. What it does instead is stop the bleeding:

1. a citation with neither a document nor a registry entry **fails the build**;
2. the registry **ratchets** — an ADR that gains a document must lose its entry
   and lower `maxUndocumented` in the same change;
3. an entry nothing cites any more must be removed (the debt is paid);
4. documents are checked for one-number-one-document, `ADR-NN-kebab-title.md`
   naming, and a heading that agrees with the filename.

Each ledger entry records **what** was decided and **where the only surviving
record lives**, so whoever writes ADR-08 has somewhere to start.

`adr-example-ok:` on a line exempts an id that is an example rather than a
citation — the same line-scoped, review-visible idiom as
`validate:package-names`'s `retired-name-ok:`. The validator flagged its own doc
comment first, which is how the marker came to exist.

### Unresolved owner decisions

**1. The ADR is Proposed.** Five things need approval: the layer-name divergence
from the reassessment's spelling, the `DataState` widening, `ui` as the prop
name, the part vocabulary, and the one-minor dual-emit window.

**2. Core and Pro share an ADR number space and do not coordinate it.** Core's
ADR-13 is "date math via `@internationalized/date`"; the Pro program's ADR-13 is
"neutral models". Two decisions, one number, two repositories. Recorded in the
ledger entry; resolving it is cross-tier.

**3. Two `!important` declarations in `core.css`** (`.dz-tab-close-btn`,
`.dz-field-input-reset`) contradict the layer contract. Recorded as P3-03 debt,
not blessed.

**4. `.dz-prose` and the print block are unlayered on purpose** and must stay
that way. The ADR names them so that a future "nothing unlayered" sweep does not
quietly break rich-content typography.

### Focused validation output

```
tsx packages/tooling/scripts/validate-adr-references.ts
  → ✓ adr-references: 16 ADR(s) cited · 2 documented · 14 registry-only (ceiling 14)
vitest packages/tooling/scripts/validate-adr-references.spec.ts → 25 passed
eslint (new files) --max-warnings 0 → 0 problems
tsc -p packages/tooling → 0 errors
```

### Ranked next packet

1. **TASK-OSS-P3-02** — `ComponentAnatomy` schema, `expectAnatomy` helper,
   manifest field and validator. Direct successor; the ADR exists to be consumed
   by it.
2. **P3-00 (new)** — DTCG emit for `@dzup-ui/tokens`, the prerequisite this task
   surfaced. Blocks nothing in P3; blocks every DTCG claim.
3. **The 14 missing ADRs** — a documentation packet, now measured and ratcheted
   rather than invisible.

---

## TASK-OSS-P3-02 — Contract Spec v1 anatomy: schema, conformance helper, generator, docs

**Maturity: implemented → focused-validated → aggregate-qualified.**

### Discovery result

**1. The `<Anatomy of={DzButton} />` spelling the packet asks for cannot be
implemented as written** without inventing a public symbol. The anatomy is not
attached to the component object, and exporting `DzButtonAnatomy` from the core
barrel would add a symbol to the ownership manifest that schema 1.1.0 has **no
`kind` for** — the same unresolved decision P0-01 recorded for injection keys
and utilities. So the block takes the component *name*
(`<Anatomy of="DzButton" />`) and reads the generated table. That keeps the docs
on the same authority `validate:ownership` uses, which is the stronger property
anyway.

**2. DzButton's honest anatomy is two parts, not four.** The packet's own example
shows `root · icon · label · spinner`. `icon` and `label` are *slot content* —
DzButton renders the consumer's nodes with no wrapper of its own — so declaring
them would mean adding wrapper elements, which the packet's stop condition
assigns to P3-03. Declared: `['root', 'spinner']`, with `spinner` optional.

That is the machine-checked anatomy working as intended on its first component:
it can only be as good as the DOM, and the gap is now visible rather than
asserted away.

**3. `@dzup-ui/testing` cannot import `@dzup-ui/contracts`.** It emits
declarations under `rootDir: src`, so a cross-package *source* import fails
`TS6059`, and its `dist/` is gitignored, so pointing the path mapping at built
types would make `yarn typecheck:all` depend on a build that a fresh clone has
not run. The helper therefore accepts a **structural** `CheckableAnatomy` — the
three fields it actually reads — and the published package needs no dependency
on contracts at all. `ComponentAnatomy` satisfies it by shape, and the specs
pin that assignability by typing their fixtures as the real thing.

### Implemented files

| File | Purpose |
|---|---|
| `packages/contracts/src/anatomy.types.ts` | `ComponentAnatomy`, `RiskTier` (A–D, each defined), `RecipeAxis`, the shared `ANATOMY_PART_VOCABULARY`, and the derived `AnatomyPart` / `UiOverrides` / `DzClassValue` that make a mistyped part a compile error |
| `packages/contracts/src/anatomy.types.spec.ts` | 13 specs, including `@ts-expect-error` cases that are **really compiled** (below) |
| `packages/contracts/tsconfig.build.json` | build-only view; see "A spec that is actually type-checked" |
| `packages/testing/src/anatomy.ts` | `checkAnatomy` (rules → problems) and `expectAnatomy` (throws with every problem at once), runner-independent and dependency-free |
| `packages/testing/src/anatomy.spec.ts` | 22 specs over hand-built DOM, every rule in both directions |
| `packages/core/src/components/buttons/DzButton.anatomy.ts` | the reference declaration |
| `…/DzButton.vue` | `data-part="root"` and `data-part="spinner"` — attributes only, no structural change |
| `…/DzButton.contract.spec.ts` | 6 anatomy conformance cases: default, loading, disabled, polymorphic root, state coverage, recipe attributes |
| `packages/tooling/src/ownership/anatomy-source.ts` | strict reader for `Dz{Name}.anatomy.ts` |
| `…/anatomy-source.spec.ts` | 22 specs |
| `…/emit-anatomy-data.ts` | projection for the docs |
| `…/generate-ownership-manifest.ts` | attaches `anatomy` to component entries; writes the docs projection |
| `…/ownership-manifest.types.ts`, `…/ownership-manifest.schema.json` | schema **1.1.0**: optional `anatomy` |
| `packages/tooling/src/validators/ownership-manifest.ts` | `checkAnatomyData` freshness + the `anatomy-ceiling` ratchet |
| `…/unclassified-ceiling.json` | `maxWithoutAnatomy: 142` |
| `apps/storybook/stories/_blocks/Anatomy.ts` | the doc block |
| `apps/storybook/stories/_data/anatomy.generated.ts` | **new generated artifact** |
| `apps/storybook/stories/Buttons.mdx` | a "Styling surface" section rendering it |
| `vitest.config.ts`, `packages/tooling/src/workspace-aliases.ts` | `@dzup-ui/testing` resolves to source, not to its stale `dist/` |

### Three decisions worth stating

**Parsed, not imported.** `buildOwnershipManifest` is synchronous; `await
import()` per declaration would have made the generator, the validator, the
runtime emitter and every spec async for a file whose whole job is to be a
literal — and would execute component-adjacent source inside a generator. The
reader is strict, brace-matching rather than regex-greedy, and **reports what it
cannot read instead of guessing**, which is the rule the rest of the ownership
pipeline already follows.

**A ratchet, not a wall.** The packet says "the validator fails on a public
component with neither anatomy nor an explicit none". Applied literally on the
day it was written that fails 142 of 143 components, and the only way to ship is
to turn the gate off — which is not a gate. It is therefore a ceiling, like
`maxUnclassified` beside it: **142/142 today**, and the next component to ship
without a declaration fails the build.

**A projection, not the manifest.** The docs could import
`component-ownership.manifest.json`, but that is 440 KB of ownership bookkeeping
of which the docs need one field. Vite inlines a JSON import whole, so every docs
page would carry the entire ownership pipeline's output to render one table.
`anatomy.generated.ts` is generated in the same run and checked by
`validate:ownership`, so it is a narrowing rather than a second source of truth.

### A spec that is actually type-checked

`expectTypeOf` and `@ts-expect-error` do nothing under a plain `vitest run` —
vitest does not typecheck by default, so a type-level spec can be pure
decoration. `packages/contracts/tsconfig.json` includes `**/*.spec.ts`, so
`yarn typecheck:all` compiles them for real. It immediately proved the point by
failing on two genuine errors in the first draft: a `.ts` import extension the
package forbids, and a `UiOverrides` assertion that was simply wrong.

Because that same tsconfig also *emits*, a new `tsconfig.build.json` (specs
excluded) is what `yarn build` compiles — otherwise the published package would
have shipped a spec. Verified: `dist/` contains `anatomy.types.*` and no spec.

### Focused validation output

```
vitest packages/contracts/src                    → 13 passed
vitest packages/testing/src                      → 25 passed
vitest packages/tooling/src/ownership            → 22 passed (anatomy-source)
vitest packages/tooling/src/validators/ownership-manifest.spec.ts → 30 passed
vitest packages/core/src/components/buttons      → 41 passed (DzButton contract)
yarn generate:ownership:core → ✓ anatomy data (1/143 public components declared)
yarn validate:ownership      → ✓ 1303 entries fresh; 29/29 unclassified; 142/142 without anatomy
yarn validate:contract-parity → ✓
yarn storybook:build          → ✓ 23.04 MB within budget 25 MB
tsc -p contracts | testing | tooling → 0 errors
eslint (all touched) --max-warnings 0 → 0 problems
```

### Unresolved owner decisions

**1. `DzButton` mirrors `data-tone` but not `data-variant` or `data-size`,**
though it declares all three recipe axes. `core.css` already selects on
`[data-size]` and `[data-variant]` for other components, so the styling API is
inconsistent across the catalog. The contract spec **asserts the gap** rather
than hiding it: when P3-03 emits the other two, that test fails and is updated
to an empty list.

**2. The `DataState` widening ADR-19 §4 calls for has not been applied.**
`packages/contracts/src/data-attributes.types.ts` still types `data-state` as
the closed eight-value union that `DzButton` already violates. Changing it
touches every component that imports `DataAttributes`, which is a code change
across the catalog, not a schema change — P3-03's job, and the ADR is still
Proposed.

**3. Anatomy is not exported from the core barrel,** so a consumer cannot import
`DzButtonAnatomy` to introspect parts at runtime. The blocker is the missing
ownership `kind`, not a design objection; the derived `ui` types reach consumers
through `DzButtonProps` regardless.

### Ranked next packet

1. **TASK-OSS-P3-03** — the five pilots, plus the two follow-ups above.
2. **TASK-OSS-P3-04** — the cookbook, which needs at least one pilot to cite.
3. **Ownership schema 1.2.0** — `injection-key`, `utility`, and whatever kind an
   exported anatomy const would be. Three packets now want it.

---

## TASK-OSS-P3-03 — Pilot parts/states on five components (dual-emit)

**Maturity: implemented → focused-validated → aggregate-qualified →
browser-qualified** (chromium · firefox · webkit, 21/21).

### Discovery result

**1. There is no `DzDataTable`.** The packet names it as the data-heavy pilot.
The catalog has `DzTable` plus five compound parts (`DzTableHeader`, `Body`,
`Row`, `Cell`, `Footer`). Substituted — it carries the property the pilot was
chosen for, a virtualised scroll window (`virtualScroll`), where the rendered
rows are a moving subset of the data.

**2. `DzDialog` renders nothing.** It wraps Reka's `DialogRoot`, a provider with
no element of its own, so its honest declaration is `parts: 'none'` and the
dialog's real surface belongs to `DzDialogContent`. This is the `'none'` case
earning its place: a component that renders nothing has *answered* the question;
one that renders something undeclared has not. Collapsing the two would let
every compound root claim `'none'` and the ceiling could never honestly reach
zero.

**3. Two of the five own no component tokens.** `DzSelect.tokens.ts` and
`DzTable.tokens.ts` map straight to global semantic tokens — `--dz-background`,
`--dz-border`, `--dz-muted-foreground` — so there is no `--dz-select-*` or
`--dz-table-*` a consumer can set to restyle one instance. Both declare
`componentTokens: []`. Inventing names would have documented override points
that do not exist, which is worse than documenting none, and it is exactly the
drift `validate:tokens` cannot catch.

### The defect the Reka pilot found — in this program's own P3-02 work

`expectAnatomy` read **any** `data-*=""` attribute as a boolean state. Mounting
one `DzSelect` reported five undeclared "states":

```
data-reka-popper-content-wrapper · data-dismissable-layer
data-reka-collection-item · data-placeholder · data-aria-hidden
```

None is a state. They are a primitive's internal markers, and no library can
enumerate what a primitive or a host application might add to a node. The rule
is now inverted: boolean states are checked against **the vocabulary ADR-19 §4
defines, plus whatever the anatomy itself declares**, and anything outside both
is not the check's business.

This was a design error in P3-02 that only a real Reka-backed component would
have surfaced — the hand-built DOM in the helper's own specs could never have
produced it. Four specs now pin the narrowing, including one that keeps it from
becoming a hole (`data-selected` undeclared is still a finding).

A second, smaller fix from the same pilot: a **portaled** subtree — a select's
listbox, which renders outside its own wrapper — can now be checked as a
fragment by listing `'root'` in `absentParts`. Without it, an undeclared part in
a portal was invisible to every check.

### Implemented files

| File | Effect |
|---|---|
| `DzButton.anatomy.ts` + `.vue` + `.types.ts` | `ui` prop; spinner size utilities moved into a `cn()` computed so an override can win |
| `DzInput.anatomy.ts` + `.vue` + `.types.ts` | 8 parts, the richest of the five; `class` stays on `control` |
| `DzSelect.anatomy.ts` + `.vue` + `.types.ts` | 11 parts including the portaled listbox; legacy `data-dz-search-input` / `data-dz-no-results` dual-emitted |
| `DzDialog.anatomy.ts` | `parts: 'none'` |
| `DzDialogContent.anatomy.ts` + `.vue` + `DzDialog.types.ts` | 5 parts; `overlayClass` deprecated in favour of `ui.overlay`, both still applied |
| `DzTable.anatomy.ts` + `.vue` + 5 compound parts + `.types.ts` | family anatomy on the parent |
| five `.contract.spec.ts` | **150 tests**, of which 44 are new anatomy/`ui` cases |
| `packages/testing/src/anatomy.ts` + `.spec.ts` | the state-vocabulary fix and the portal-fragment mode, +5 specs |
| `packages/tooling/src/validators/ownership-manifest.ts` + `.spec.ts` | `partsOutsideVocabulary` report, +5 specs |
| `packages/tooling/src/validators/interaction-contract.ts` + `.spec.ts` | `.anatomy.ts` excluded from the focus-ring scan, +2 specs |
| `packages/core/stories/compositions/styling/Overrides.stories.ts` | six override stories |
| `e2e/components/styling-overrides.spec.ts` | seven computed-style assertions |
| `.changeset/components-declare-their-styling-surface.md` | minor, additive |
| `unclassified-ceiling.json` | `maxWithoutAnatomy` **142 → 138** |

### Three design decisions

**`class` did not move.** On every pilot it lands exactly where it always did —
the button root, the input's *visual field* (not its outer wrapper), the select
trigger, the dialog panel, the table's scroll container. Moving it to a
consistent "root" would have been tidier and would have silently restyled every
existing consumer. `ui.root` is the new way to reach an outer node.

**The table declares a family anatomy on the parent.** A table's nodes come from
six components; declaring each separately would answer "what can I style on a
table?" in six places and would make a conformance check on a composed table
report its own children as undeclared parts. But `ui` keys are only the nodes
**DzTable itself renders** — a consumer writes `<DzTableRow>` themselves, so
`class` at the call site already reaches it, and a second mechanism for the same
job is not a feature.

**Three part names are outside the shared vocabulary,** and the validator now
says so: `DzTable — body, row, cell` and `DzInput — clear`. Table semantics have
no synonym, and `close` (which is in the vocabulary) means dismissing a thing,
not clearing a value. Reported, never enforced — a gate would push authors
toward a word that fits worse, which is the outcome the report exists to
prevent. This closes a promise ADR-19 §3 made that P3-02 had not kept.

### Focused validation output

```
vitest (five pilot contract specs)      → 150 passed
playwright e2e/components/styling-overrides → 21 passed (chromium · firefox · webkit)
vitest packages/testing/src             →  30 passed
vitest .../validators/ownership-manifest→  35 passed
vitest .../validators/interaction-contract→  6 passed
yarn generate:ownership:core            → ✓ anatomy data (6/143 declared)
yarn validate:ownership                 → ✓ 138/138 without anatomy; vocabulary report lists 2 components
yarn validate:interaction-contract      → ✓ 0 violations
yarn validate:story-status / story-dod  → ✓
yarn validate:changelog                 → ✓ 7 passed
yarn build                              → ✓ built in 19.72s
yarn validate:tree-shake                → ✓ DzButton 187.4 KB · DzInput 191.1 KB · DzSelect 194.0 KB
yarn validate:bundle-budget             → ✓ core 6.72 kB ≤ 150 kB · tokens.css 6.55 kB ≤ 15 kB
vue-tsc -p packages/core                → 0 errors
eslint packages/core/src/components     → 0 problems
```

Bundle budget and tree-shake are unchanged within variance: parts are
attributes, and the `ui` prop adds one optional object per component.

### What the browser run found that jsdom could not

The Playwright suite was run against a built Storybook on all three engines.
It failed twice before it passed, and both failures were worth having.

**1. `--dz-radius-md` did not move the button's corner.** The brand-theme
fixture set the token any reader would guess. DzButton reads
`--dz-button-radius`. Chasing that exposed the real defect: **DzButton's anatomy
declared 5 of the 31 `--dz-button-*` tokens it reads** — omitting radius,
transition, font-family and the entire size scale. A partial list is worse than
none, because it tells a reader they have seen the override points.

So the check that would have caught it now exists:
`undeclaredComponentTokens` in `validate:ownership` compares each declared
`componentTokens` list against the `--dz-{family}-*` tokens the component's own
`.vue`, `.variants.ts` and `.tokens.ts` actually reference. On its first run it
reported **DzInput missing seventeen** — its whole size scale, which is exactly
what a consumer needs in order to change one field's height without moving every
control in the theme. Both declarations are now complete, and six specs pin the
extractor (including one that asserts DzButton's declaration and its references
agree).

This is the token half of the same loop `expectAnatomy` closes for parts: a
declared part is checked against rendered DOM, a declared token against the
source that reads it. Reported, not enforced — the 138 components with no
anatomy would otherwise bury the finding.

**2. `data-part="content"` is not unique on a page.** The test took `.first()`
and measured `DzTable`'s `<table>` instead of the select's portaled listbox.
Parts are scoped to their component by design; a selector — in a test or in a
consumer's CSS — has to say which component it means. The test now scopes by
what the node contains, and says why where the next person will hit it.

### Not done

**Component CSS was not moved into the `dz-components` layer.** The packet asks
for it. The library emits no CSS for `tv()` recipes — the consumer's Tailwind
build generates those utility classes, and they land wherever *that* build puts
them. The library's own `.dz-*` rules in `core.css` are already inside
`@layer dz-components`. So the requirement is either already satisfied or not
achievable from inside this package, and ADR-19 §2 records which.

**The `dz-reset`, `dz-utilities` and `dz-overrides` layers are declared in
ADR-19 but not yet emitted** in `base.css`. Adding the layer statement is a
one-line change with a cascade-wide blast radius, and it belongs with the
cookbook (P3-04) that tells consumers what to write into `dz-overrides`.

### Unresolved owner decisions

1. **`DzButton` still mirrors only `data-tone`,** not `data-variant` or
   `data-size`, though it declares all three recipe axes. Its contract spec
   asserts the gap so closing it is visible; closing it is a decision about
   whether every component emits every axis it accepts.
2. **`DataState` is still the closed eight-value union** in
   `packages/contracts/src/data-attributes.types.ts` that `DzButton` violates.
   ADR-19 §4 calls for widening it; doing so touches every component importing
   `DataAttributes`, and the ADR is still Proposed.
3. **Two `!important` declarations remain in `core.css`**
   (`.dz-tab-close-btn`, `.dz-field-input-reset`), plus one in `.dz-native-input`
   for autofill. The e2e suite ratchets against exactly those three.

### Ranked next packet

1. **TASK-OSS-P3-04** — the cookbook, which now has five pilots to cite, a
   working anti-pattern story, and three-engine evidence to point at.
2. **The `DataState` widening** — small, mechanical, and blocked only on ADR-19
   approval.
3. **Declare `componentTokens` for the remaining 138** as they gain anatomies;
   the extractor makes it mechanical rather than archaeological.

---

## TASK-OSS-P3-04 — Styling cookbook

**Maturity: implemented → focused-validated → aggregate-qualified.**

### Discovery result — two of the eight recipes have no mechanism to document

The packet lists eight recipes. Six describe things the library can do today.
Two describe things it **cannot**, and writing them as capabilities would have
been the easy, wrong answer:

**Recipe 6, "global default".** There is no application-wide provider. What
exists is compound context on the group components — `DzButtonGroup`,
`DzInputGroup`, `DzFormField` hand down size, variant, tone and validation state
(ADR-08). The recipe documents that, and then says plainly that a single
provider for density, direction, locale, portal target and motion is
**TASK-OSS-P4-01 and is not shipped**, with the explicit advice *not* to write
your own in the meantime — it would have to be replaced when the real one lands.

**Recipe 7, "shadow DOM".** It works, with a caveat that is the whole recipe:
custom properties inherit through the shadow boundary, **stylesheets do not**.
Missing the second half looks like "the tokens work but nothing is styled". And
the limitation that cannot be fixed from inside the shell: **portaled content
escapes the shadow root** — a dialog or select teleports to `document.body`,
outside the boundary, and loses the adopted sheet. `portalTo` is today's
workaround; a provider-level portal target is TASK-OSS-P4-03.

### Implemented files

| File | Purpose |
|---|---|
| `apps/storybook/stories/Styling-Cookbook.mdx` | the eight recipes, an ordering table, and the anti-pattern matrix |
| `packages/core/stories/compositions/styling/Overrides.stories.ts` | +2 stories (`GlobalDefault`, `ShadowDom`) and `#region` markers on all seven code recipes |

### Every snippet is executable, and that is enforced

Seven of the eight recipes carry a `{/* fixture: … */}` marker pointing at a
named region of the story that renders them, so `yarn validate:doc-snippets`
fails the build if the prose and the running code diverge. The repository now
checks **19 fixture-backed snippets**, up from 12.

The snippets arrive wrapped in the story's `template:` because the comparison is
byte-for-byte. Trimming the wrapper for readability would mean maintaining a
second copy that nothing executes — which is the failure this mechanism exists
to prevent — so the wrapper is documented instead of hidden.

Five of the recipes are additionally asserted in a **real browser on three
engines** by `e2e/components/styling-overrides.spec.ts` (21/21).

### The anti-pattern matrix

Every mechanism ADR-19 forbids, each paired with the recipe that replaces it:
generated-class descendant selectors · `!important` · overriding Reka classes or
`data-reka-*` · copying a token value instead of referencing it · fixed heights
that fight the size recipe · **reaching for an undeclared `data-part`**.

The last row is the one that could not have been written before this packet:
138 of 143 components have no declared anatomy, so they make no promise about
their nodes, and the cookbook says which recipes are safe for them (1–4) rather
than implying the whole surface is addressable.

### Focused validation output

```
yarn validate:doc-snippets  → ✓ 19 fixture-backed snippet(s) match their fixtures
yarn storybook:build        → ✓ 23.11 MB within budget 25 MB
yarn validate:story-status  → ✓
yarn validate:story-dod     → ✓ enforced checks pass
yarn storybook:test         → ✓ 1371 tests across 166 files, 0 failures
eslint apps/storybook/stories · packages/core/stories → 0 problems
```

### Not done

**No landing mirror.** The packet says "and a landing mirror if the landing has
a docs section". `apps/landing` has blocks, templates and a gallery, but no docs
section to mirror into; inventing one is a landing information-architecture
decision, not a cookbook task.

### Unresolved owner decisions

1. **Recipes 6 and 7 both point at unshipped P4 work.** They are accurate today
   and will need a revision the moment `DzProvider` lands — the cookbook names
   the task IDs so the revision is findable.
2. **The cookbook tells readers to check the anatomy table before overriding**,
   which is only useful for the five components that have one. It is the right
   advice, and it will read as a gap until the rollout closes.

---

## TASK-OSS-P4-01 — Provider ADR and the small context composables

**Maturity: implemented → focused-validated → aggregate-qualified.**

### Discovery result — what a component cannot ask its host today

`DzThemeProvider` has covered theme since ADR-09. Every other thing a component
needs from its application is a prop on that component or a literal in its
template. Measured on this checkout, each with the command that reproduces it:

| Concern | Measured state | Command |
|---|---|---|
| User-visible strings | **79 distinct literals**, in two groups that need different fixes — **50** static `aria-label` values (`'Clear input'`, `'Back to top'`, `'Close lightbox'`) that *no* application can change, and **29** literal defaults on `*Text`/`*Label`/`*Title`/`*Message`/`*Placeholder` props (`noResultsText`, `cancelText`) that only a per-instance prop can change. A further **152** `aria-label` occurrences are already bound or interpolated and are out of scope. | static-`aria-label` scan over `packages/core/src/**/*.vue` templates + literal `*Text`-family prop defaults |
| Portal target | **15 components** extend `BasePortalProps` and take their own `portalTo`. | `grep -rln "BasePortalProps" packages/core/src` |
| `Intl` formatters | **5 construction sites across 4 files** — `DzAnimatedNumber.vue`, `DzAnimatedNumber.tween.ts`, `DzTimePicker.vue`, `useRelativeTime.ts` (×2). | `grep -rn "new Intl\." packages/core/src` |
| Direction | **14 component files** reference `dir`/`direction` ad hoc; nothing resolves a locale to a writing direction. | `grep -rlnE '(dir="|:dir="|\bdirection\b)' packages/core/src --include=*.vue` |
| Motion, defaults, nonce, test ids | No mechanism at all. | — |

### Two of the ADR's own numbers were wrong, and are corrected

The ADR's first draft carried two figures that do not survive re-measurement.
Both are corrected in `ADR-20`, in the `@dzup-ui/contracts` module doc, in the
composable that cites them, and in the changeset:

**"9 files construct `Intl` formatters" → 5 sites in 4 files.** Nine files
*reference* `Intl.`; five of those nine are a type declaration
(`Intl.NumberFormatOptions`), a spec, or a sentence of prose. Counting a
`.types.ts` as a construction site inflates the migration P4-03 has to do. The
re-measurement also surfaced the sharpest case, which the round number had
hidden: `DzAnimatedNumber.tween.ts:150` constructs its formatter **inside
`format()`**, which a running tween calls once per frame — not per row, per
frame.

**"72 distinct hard-coded strings" → 79, and the flat number was the wrong
shape.** No stated command reproduced 72. Re-measured, it is 79 — and, more
usefully, **two groups that need different work**: 50 `aria-label` literals are
untranslatable by anybody, while 29 prop defaults are already overridable per
instance and only lack an application-wide setting. A single number told P4-03
how much to do; the split tells it what kind of change each one is.

### Implemented files

| File | Purpose |
|---|---|
| `docs/adr/ADR-20-provider-contract.md` | the contract — 9 decisions, 6 rejected alternatives, a 5-step rollout, and a validation-hook table (**Proposed**) |
| `packages/contracts/src/provider.types.ts` | 9 injection keys, 9 concern types, and the exported `DZ_PROVIDER_DEFAULTS` |
| `packages/core/src/composables/provider/useDzLocale.ts` | `useDzLocale`, `useDzDirection`, `directionForLocale`, the RTL subtag list |
| `packages/core/src/composables/provider/useDzMessages.ts` | `useDzMessages`, `mergeMessages`, the `DzMessageReader` type |
| `packages/core/src/composables/provider/useDzFormats.ts` | `useDzFormats` + the module-level cache and its test hooks |
| `packages/core/src/composables/provider/useDzEnvironment.ts` | `useDzPortalTarget`, `useDzMotion`, `useDzDefaults`, `useDzNonce`, `useDzTestIds` |
| `packages/core/src/composables/provider/index.ts` | the ten public readers — and deliberately none of the writers |
| `packages/core/src/composables/provider/provider.spec.ts` | 31 specs |
| `packages/core/tests/ssr/provider-ssr.spec.ts` | 4 specs |
| `.changeset/an-application-can-configure-more-than-the-theme.md` | minor for `@dzup-ui/contracts` and `@dzup-ui/core` |

### API effect

Ten composables on `@dzup-ui/core`, ten new entries in the ownership manifest as
`composable` (`useDzTheme`, `useDzLocale`, `useDzDirection`, `useDzMessages`,
`useDzFormats`, `useDzPortalTarget`, `useDzMotion`, `useDzDefaults`,
`useDzNonce`, `useDzTestIds`) plus the `DzMessageReader` type. Nineteen new
symbols on `@dzup-ui/contracts`. **Nothing existing changed**: no component
consumes them yet, nothing is deprecated, and no default differs from what
components hard-code today — which is precisely what lets P4-03 and P4-04
proceed one component at a time instead of as one breaking change.

### Three decisions worth stating

**The write half is not exported.** `provideDzLocale` and its siblings exist and
are used by the specs by relative path, but the barrel publishes only the ten
readers. Publishing the writers invites an application to build a second
provider, which is the failure ADR-20 §9 forbids for Pro — two providers mean
two locales and two merge rules. A secondary reason is the ownership ratchet:
schema 1.1.0 has no `utility` kind, so twelve exported helpers would each land
`unclassified` and push the ceiling up by twelve. A ceiling that rises to
accommodate new code is not a ceiling. **It held at 29/29.**

**Keys live in `@dzup-ui/contracts`, not Core.** An injection key is an
identity: two packages injecting the same concern must inject the *same symbol*,
or the child silently receives the default and the bug is invisible. Declaring
them in the types package is what lets `@dzup-ui-pro/*` read an application's
locale without importing Core's runtime — the dependency direction the whole
package graph is built on. These are the second and subsequent runtime values in
a types-only package; `Symbol()` is side-effect-free and tree-shakeable, and
`yarn validate:dts` and the boundary check both stayed green.

**`useDzDirection()` never returns `'auto'`.** A component asking "am I in RTL?"
wants a yes or no. Resolution uses a checked-in RTL subtag list rather than
`Intl.Locale.prototype.getTextInfo()`, which is Baseline-2023 and unavailable
across the repository's Node floor (`^20.19.0 || >=22.13.0`, ADR-18). The ADR
records the delegation as the intended replacement, so the list is a dated
decision rather than a hand-maintained artifact for someone to find later.

### The tenth composable does not meet the packet's own success criterion

The packet asks for "ten composables with typed defaults ... so components work
with no provider mounted". **Nine do. `useDzTheme` does not** — it is `useTheme`
re-exported, and `useTheme` `throw`s when no `DzThemeProvider` is found unless
the caller passes `{ optional: true }`.

That is deliberate and it is not fixed here. Theme genuinely has no sensible
default for an application that has not chosen one, the behaviour shipped with
ADR-09, and changing it would change the semantics of a public contract that
components already depend on — which is exactly the packet's stop condition.
The `never throws when uninjected` spec asserts the nine and names the exception
in a comment rather than quietly testing around it.

The claim to make downstream is therefore precise: **nine of the ten concerns
resolve with no provider; theme still requires one.**

### The SSR spec deletes the globals rather than trusting their absence

`provider-ssr.spec.ts` resolves every concern with `window`, `document` and
`matchMedia` **deleted**, not merely absent from a server render. The difference
matters: a composable that reads `window` lazily inside a computed passes a
render-only test and fails in a real SSR process.

The one place this forced a decision is motion. Under SSR the honest answer is
`reduced: false` — what the CSS `prefers-reduced-motion` query resolves to
before the client knows better. Answering `true` would render markup that never
animates and hydrate into markup that does, which is a visible jump rather than
a safe default.

### Focused validation output

```
yarn vitest run packages/core/src/composables/provider  → ✓ 31 tests, 0 failures
yarn test:ssr                                           → ✓ 58 passed, 1 skipped (2 files)
yarn validate:exports                                   → ✓ 0 errors (30 entries, 196 declared exports)
yarn validate:ownership                                 → ✓ 1,314 entries fresh; 29/29 unclassified; ratchet held
yarn typecheck                                          → ✓ 0 errors
yarn validate:adr-references                            → ✓ 17 cited · 3 documented · 14 registry-only (ceiling 14)
```

### Aggregate qualification

```
yarn validate:all  → EXIT 0 — boundaries · interaction contracts · contract-parity ·
                     story-status · story-dod (366 reported, enforced green) · tokens ·
                     DESIGN.md (97 refs, 96 contrast pairs ≥ AA) · exports · ownership ·
                     package-names · doc-snippets · engines · adr-references · readme-facts ·
                     external imports · dts · changelog · peers
yarn test          → EXIT 0 — 422 files, 7,520 passed, 2 skipped, 1 todo
```

Nothing is red. Not run in this packet: `yarn build`, `yarn storybook:build`,
`yarn storybook:test`, `yarn test:e2e` — this packet adds no component, no story
and no rendered output, so none of them has anything new to exercise. P4-02
does, and carries them.

**`yarn lint` was red and is now green.** Four problems the interrupted session
left behind: import-order in `provider.types.ts`, two export-order errors in the
provider barrel, and a `jsdoc/no-multi-asterisks` warning where `*host*` began a
wrapped line. A fifth surfaced only in the repo-wide run —
`packages/contracts/src/index.ts` had the new `provider.types` export block
sorted before `compound.types`, which the focused per-file lint never saw
because that file was not in the path list. That is the case for widening after
the narrow command passes, and it is why the first `validate:all` here failed.

### Not done

**No `DzProvider`.** This packet is the read side only, by design — the ADR
fixes the keys, shapes, defaults and merge rules so that P4-02 has something to
implement against. Ten composables that resolve to documented defaults are
useful and inert until then.

**No component consumes a composable yet.** The 79 literals, the 15 `portalTo`
props and the 5 `Intl` sites are still exactly where discovery found them; their
migrations are P4-03 and P4-04.

**No story.** There is nothing to show until a provider can write the values.
P4-02 carries the stories (nested providers, RTL, reduced motion).

### Unresolved owner decisions

1. **ADR-20 is Proposed, not Accepted.** The composables are additive and safe
   to land either way, and nothing consumes them — but P4-02 through P4-05 all
   build on its merge rules, so an approval before P4-03 starts is cheaper than
   an approval after.
2. **`motion: 'full'` is an explicit override of a stated accessibility
   preference.** ADR-20 §7 admits it on the reasoning that a host that has
   already asked the user is better placed to decide than this library. That is
   a policy call, and it is the one decision in the contract that can produce a
   worse outcome for a user than having no provider at all.
3. **The RTL subtag list is a dated snapshot.** It becomes a one-line delegation
   to `Intl.Locale.prototype.getTextInfo()` when the Node floor moves past
   Baseline-2023 — which is a floor decision (ADR-18), not an i18n one.
4. **Whether the `provideDz*` writers ever become public.** Today the answer is
   no and `DzProvider` is the only sanctioned writer. An application embedding
   the library inside another framework's tree may have a real case; it needs a
   `utility` kind in the ownership schema before it can be answered.
5. **Whether `useDzTheme` should gain a default and stop throwing.** It is the
   one composable of the ten that requires a provider. Making it consistent with
   the other nine is a change to an ADR-09 contract that has already shipped, so
   it is an owner decision, not a refactor. P4-02 is the natural moment: once
   `DzProvider` mounts theme along with everything else, "no provider" becomes a
   rarer state than it is today.

### Ranked next packet

1. **TASK-OSS-P4-02 (`DzProvider`)** — the write half. Everything in P4 after it
   depends on a component that can set these values, and two Styling Cookbook
   recipes (P3-04) are currently documenting its absence.
2. **TASK-OSS-P4-03 (message catalogs)** — the 79 literals, now split into the
   50 that no application can change and the 29 that only a prop can. Needs
   P4-02 to be testable end to end.
3. **TASK-OSS-P4-04 (portals)** — 15 components, and the fix for the shadow-root
   limitation the cookbook had to document as unsolvable.
---

## TASK-OSS-P4-02 — `DzProvider`, the write half of ADR-20

**Maturity: implemented → focused-validated → aggregate-qualified.**

### Discovery result — where a provider can actually live

The packet says `packages/core/src/components/providers/`. That directory would
have been the third place providers live, and it would have had nowhere to be
exported from:

| Fact on this checkout | Consequence |
|---|---|
| `packages/core/src/providers/` already exists and holds `DzThemeProvider` | a `components/providers/` family splits the provider family across two directories, with the alias in one and the thing it aliases in the other |
| `public-api.manifest.json` already has an `exports.providers` section pointing at `./src/providers/index.ts` | a new family needs a second manifest section for the same concern |
| `packages/core/package.json` already publishes `"./providers"` → `dist/providers/index.js` | the obvious subpath for a `components/providers/` family is **already taken** by the directory that exists |

So `DzProvider` ships in `packages/core/src/providers/`, beside the component it
subsumes. That is a deviation from the packet's literal path and it is the only
one — and the cost it carried turned out to be the packet's most useful finding.

### Finding 1 — a gate that never covered the providers directory

`validate:contract-parity` resolves components and their specs by walking
`COMPONENT_ROOTS`, which was `packages/core/src/components` and
`packages/compat/src/components`, and matches story imports with a regex
requiring `src/components` or a `@dzup-ui/(core|compat)` specifier.
`packages/core/src/providers` is in neither. The effect was **invisible in both
directions**:

- `DzThemeProvider` is imported by two story files
  (`compositions/styling/Overrides.stories.ts`,
  `navigation/DzColorModeToggle.stories.ts`) and was never counted as a
  showcased component;
- a `DzThemeProvider.contract.spec.ts` placed beside it would never have been
  *found*, so the gate could not have been satisfied even deliberately.

A component whose defect surface is an entire application's theme had no
contract coverage and no way to acquire any. The validator now walks
`packages/core/src/providers` and matches `src/providers` imports. That surfaced
exactly two components, and both gained a spec in this packet.

The widening gates something real — removing the new spec reproduces the
failure:

```
$ mv packages/core/src/providers/DzThemeProvider.contract.spec.ts /tmp/ && \
  yarn validate:contract-parity
Found 1 showcased component(s) with no contract spec:
  DzThemeProvider  (imported by packages/core/stories/compositions/styling/Overrides.stories.ts:7)
EXIT=1
```

### Finding 2 — the ownership generator wrote evidence for a file that does not exist

`classifyComponent` built its barrel evidence as
`` `packages/core/src/components/${family}/index.ts` ``. True for every component
in the catalog until this one; false for `DzProvider`, whose first generated
entry cited `packages/core/src/components/providers/index.ts` — a path that has
never existed.

Nothing caught it, and nothing would have: evidence is prose to every consumer
of the manifest, so no validator reads it. A generated fact that no consumer
checks is the exact failure mode P0 exists to prevent, so the fix is in the
generator rather than in the output. `barrelFor(family, vuePath)` now derives the
path from the component's own `.vue` and falls back to the old convention only
when there is no `.vue` to read. Every existing component's evidence is
byte-identical — `DzButton` still cites
`packages/core/src/components/buttons/index.ts` — and `classify.spec.ts` gained
three specs, one of which is the regression itself.

### Finding 3 — twelve committed build artifacts inside `src/`, and they broke the build

`yarn storybook:build` failed with `"DzProvider" is not exported by
packages/core/src/providers/index.js`.

`packages/core/src/providers/` carries `index.js`, `index.d.ts`, `index.js.map`
and the same trio for `DzThemeProvider.types`, `theme-script` and `useTheme` —
**twelve compiled artifacts, tracked in git since `1c452e8`**. It is the only
directory under `packages/*/src` with build output checked in. An extensionless
directory import resolves to `index.js`, a June barrel that predates everything
in this packet.

The blast radius is narrow and worth stating precisely, because it is smaller
than it first looks: `packages/core/src/index.ts` imports
`'./providers/index.ts'` **with the extension**, so the root barrel and every
published entry point are unaffected, and `package.json` resolves `./providers`
to `dist/`. Only a source-relative extensionless import of that one directory
hits the stale file — which is two story files.

**Not fixed here.** Deleting twelve tracked files is an owner decision, not a
side effect of a provider packet, and hand-editing compiled output would be
fabricating build artifacts. Both story imports now name `index.ts` explicitly —
which is what CLAUDE.md rule 5 asks for anyway — with a comment at the import
site naming the hazard, so the next person meets the explanation rather than the
error.

### Implemented files

| File | Purpose |
|---|---|
| `packages/core/src/providers/DzProvider.vue` | the writer — scope detection, per-key provide, theme ownership, `<html>` reflection |
| `packages/core/src/providers/DzProvider.types.ts` | props, the theme options object, `DzProviderDefaults`, and the **unexported** scope key |
| `packages/core/src/providers/DzProvider.anatomy.ts` | `parts: 'none'`, tier A |
| `packages/core/src/providers/DzProvider.spec.ts` | 28 specs |
| `packages/core/src/providers/DzProvider.contract.spec.ts` | 6 specs |
| `packages/core/src/providers/DzThemeProvider.vue` | **rewritten** as a wrapper: four flat props → one `theme` object |
| `packages/core/src/providers/DzThemeProvider.anatomy.ts` | `parts: 'none'`, tier A — new |
| `packages/core/src/providers/DzThemeProvider.contract.spec.ts` | 9 specs — new, and the reason the parity gate was widened |
| `packages/core/src/providers/theme-script.ts` | `direction`/`locale` options; `resolveScriptDirection` |
| `packages/core/src/providers/index.ts` | `DzProvider` + four types |
| `packages/core/tests/ssr/dz-provider-ssr.spec.ts` | 8 specs — SSR with the browser globals deleted, **and** hydration with zero mismatch warnings |
| `packages/core/src/composables/provider/useDzFormats.ts` | `createDzFormats(locale, defaults)` extracted; option-default merge |
| `packages/core/src/composables/provider/useDzEnvironment.ts` | `createDzMotion(preference)` extracted; `testId()` honours a prefix |
| `packages/core/src/composables/provider/useDzLocale.ts` | `provideDzLocale` arguments both optional |
| `packages/contracts/src/provider.types.ts` | `DzFormatDefaults`; optional `DzTestIds.prefix` |
| `packages/core/src/components/buttons/DzButton.vue` | first consumer of `useDzDefaults` |
| `packages/core/src/components/buttons/DzButton.anatomy.ts` | `globalDefaults: ['size', 'variant', 'tone']` |
| `packages/core/stories/providers/DzProvider.stories.ts` | 8 stories |
| `packages/tooling/src/validators/contract-parity.ts` | walks `src/providers` (finding 1) |
| `packages/tooling/src/ownership/classify.ts` + `classify.spec.ts` | `barrelFor()`; +3 specs (finding 2) |
| `packages/tooling/src/ownership/unclassified-ceiling.json` | `maxWithoutAnatomy` 138 → 137 |
| `docs/adr/ADR-20-provider-contract.md` | Amendments A1–A4, Rollout §2 closed, validation-hook table extended |
| `apps/storybook/stories/Styling-Cookbook.mdx` + `stories/compositions/styling/Overrides.stories.ts` | recipe 6 rewritten around the provider that now exists |
| `README.md`, `packages/core/manifests/*`, `apps/storybook/stories/_data/anatomy.generated.ts`, `packages/core/src/generated/component-ownership.ts` | regenerated, not edited |
| `.changeset/one-provider-configures-the-whole-library.md` | minor for `@dzup-ui/contracts` and `@dzup-ui/core` |

### API effect

One new public component (`DzProvider`) and four types on `@dzup-ui/core`; one
type (`DzFormatDefaults`) and one optional field (`DzTestIds.prefix`) on
`@dzup-ui/contracts`. Ownership manifest 1,314 → 1,319 entries, public components
143 → 144, **unclassified held at 29/29** — no new symbol needed a kind the
schema does not have, which is why the `provideDz*` writers, `createDzFormats`,
`createDzMotion`, `DZ_PROVIDER_SCOPE_KEY` and `resolveScriptDirection` are all
deliberately absent from the barrel. A ceiling that rises to accommodate new code
is not a ceiling.

`DzThemeProvider`, `useTheme`, `themeScript` and `getThemeScript` keep their
signatures. `getThemeScript()` with no arguments emits the byte-identical string
it emitted before.

### Four decisions, and the one that is a limitation

**A prop that is not set provides nothing.** ADR-20 §3 said a child overrides
"the keys it sets"; this makes that literal — `DzProvider` calls a `provideDz*`
only for a defined prop. Without it, `<DzProvider locale="ar-EG">` nested inside
a configured provider would silently reset the portal target, the nonce and the
defaults to their documented values: a truncation wearing an override's clothes.
It is also what makes the `DzThemeProvider` delegation honest — it passes `theme`
and nothing else, so it owns theme and nothing else. The spec that matters here
is the negative one, `leaves every other concern alone`.

**Only the root provider writes to `<html>`, and only when asked.** `dir` is a
document-level attribute; a nested provider writing it would apply a subtree's
direction to the whole page, and two would fight in an order decided by mount
timing. Direction is additionally reflected only when the host declared a
`locale` or a `direction` — a provider mounted to set a portal target has no
opinion about writing direction, and stamping `dir="ltr"` on a document that
never asked is an opinion.

**The limitation that creates is documented, not engineered around.**
`DzProvider` renders no element (`parts: 'none'`), so a *nested* provider that
changes direction changes what `useDzDirection()` answers for its subtree and
writes no attribute anywhere. Scoping `dir` in the DOM for a subtree is the
host's `<div :dir="…">` — one attribute. The alternative, rendering a wrapper,
would make the provider unusable inside a shadow root, inside a `<tbody>`, and
between a flex container and its children. The Styling Cookbook's shadow-DOM
recipe states the renderless property as a fact a reader may rely on; the two new
contract specs are the first thing that checks it.

**Theme is owned by whoever is asked, or by the root if nobody was.**
`<DzProvider>` alone behaves exactly like `<DzThemeProvider>`, so a consumer is
not required to know that theme has a separate history; a provider nested inside
a themed tree that says nothing about theme leaves it alone. This narrows ADR-20
open question 5 — "no provider" becomes a rarer state — but does not answer it:
`useDzTheme` still throws, because changing a shipped ADR-09 contract is an owner
decision.

### The hydration test asserts an absence, which is the only way to see this bug

Vue reports a hydration mismatch by writing to the console and then **silently
patching the DOM**. The page ends up correct, so a render-and-compare test passes
and the user still sees the flash. `hydrateAndCollectWarnings` replaces
`console.warn` and `console.error` for the duration of the mount, filters for
hydration messages, and asserts the list is empty — for a configured tree, a
nested tree, and a themed tree.

The direction half is what makes it worth testing. `getThemeScript({ locale })`
resolves direction **at generation time**, not at runtime: unlike theme it does
not live in `localStorage`, it comes from the application's own configuration,
which is already known wherever the string is generated. That keeps the inline
script small and keeps the RTL subtag list in one place instead of duplicating it
into a string literal no test can reach. The spec asserts the script and the
server render produce the same `rtl`.

### Two slips in the packet's own API example, and what shipped instead

- `:motion="'reduce'"` — `DzMotionPreference` is
  `'system' | 'reduced' | 'full'`. `'reduce'` is the CSS media-query value, not
  this contract's. The implementation follows ADR-20, and the ADR now records the
  correction.
- `:defaults="{ DzButton: { size: 'sm' } }"` — `DzDefaults` puts per-component
  entries under `components`. Rather than pick one, `DzProvider` accepts both and
  normalises before providing: `size`, `tone`, `density` and `components` are the
  only reserved keys and no component is named any of them, so there is nothing
  ambiguous to resolve. An explicit `components` entry wins over the shorthand.

`:formats="{ currency: 'EGP' }"` needed a type that did not exist. `DzFormats` is
the *factories a component asks for*; what a host declares is *option defaults*,
now `DzFormatDefaults`. A caller's own options always win. `currency` is named
separately because `Intl.NumberFormat` throws `TypeError` for
`style: 'currency'` with no currency — without a host default, a component cannot
offer currency formatting at all.

### `DzButton` is the first component to honour a provider default

Three lines changed from `props.size ?? groupContext?.size.value ?? 'md'` to
`resolve('DzButton', 'size', [props.size, groupContext?.size.value]) ?? 'md'`.
With no provider mounted `resolve` reads an empty map and every line behaves
exactly as before — the property that lets the rest of the catalog migrate one
component at a time rather than as one breaking change.

Which components honour which axes is now declared rather than promised:
`DzButton.anatomy.ts` carries `globalDefaults: ['size', 'variant', 'tone']`, and
the field is copied into the generated manifest and the docs projection. The
Styling Cookbook's recipe 6 says so plainly — a provider default set for a
component that has not been wired yet is **silently inert**, not partly applied.

### Focused validation output

```
yarn vitest run packages/core/src/providers            → ✓ 5 files, 85 tests, 0 failures
  · DzProvider.spec.ts                    28
  · DzThemeProvider.spec.ts               34   ← UNCHANGED FILE, passes untouched
  · DzThemeProvider.contract.spec.ts       9
  · DzProvider.contract.spec.ts            6
  · dz-provider-ssr.spec.ts                8
yarn test:ssr                                          → ✓ 3 files, 66 passed, 1 skipped
yarn vitest run …/ownership/classify.spec.ts           → ✓ 19 tests (was 16)
yarn validate:contract-parity                          → ✓ 0 violations, now covering src/providers
yarn validate:doc-snippets                             → ✓ 19 fixture-backed snippets match
yarn validate:ownership                                → ✓ 1,319 entries fresh; 29/29 unclassified; 137/137 without anatomy
yarn validate:story-status                             → ✓
yarn validate:story-dod                                → ✓ enforced green; 366 reported — UNCHANGED
yarn typecheck                                         → ✓ 0 errors
yarn lint                                              → ✓ 0 errors, 0 warnings
```

`validate:story-dod`'s reported count staying at exactly 366 is deliberate: the
new story page satisfies every reported check that applies to it (`controls-live`
via a `Default` that binds args, `gallery` via `DirectionMatrix`, plus
`Accessibility`, `RealWorldAppRoot` and a `play`). P5-02 has to triage those 366
items; this packet did not add to them.

### Aggregate qualification

```
yarn validate:all    → EXIT 0 — boundaries · interaction contracts · contract-parity ·
                       story-status · story-dod · tokens · DESIGN.md (97 refs, 96 pairs ≥ AA) ·
                       exports · ownership · package-names · doc-snippets · engines ·
                       adr-references · readme-facts · external imports · dts · changelog · peers
yarn test            → EXIT 0 — 426 files, 7,574 passed, 2 skipped, 1 todo
yarn storybook:build → EXIT 0 — 23.19 MB within budget 25 MB
```

`README.md` was regenerated by `yarn generate:readme-facts` (its only substantive
change is the public-component count, 143 → 144); `validate:readme-facts` had
flagged it stale.

**One flake seen and chased down, not papered over.** An intermediate full run
failed `DzMasonry.spec.ts > reflows the column count on container resize`
(expected 3 columns, got 1) — a `ResizeObserver`/`nextTick` race under full-suite
load. It passes in isolation and passed in the clean run above; nothing in this
packet touches `DzMasonry` or anything it imports. Recorded because a
timing-sensitive spec that fails once under load will fail in CI eventually, and
the next person should not have to rediscover it.

**Not run:** `yarn test:e2e`, `yarn storybook:test`, `yarn build`,
`yarn test:nuxt-fixtures`. See *Not done*.

### Not done

**No portal consumer was migrated.** `DzProvider` sets the target and
`useDzPortalTarget` reads it; the 15 components carrying their own `portalTo` are
TASK-OSS-P4-04. Until then the cookbook's shadow-root limitation stands as
written.

**No string was moved into a catalog.** `messages` is provided and read end to
end; the 79 literals are TASK-OSS-P4-03.

**No component but `DzButton` honours a provider default.** One consumer proves
the precedence chain and gives the rollout a shape to copy; doing 143 of them
inside this packet would have turned a provider packet into a catalog migration.

**The twelve committed artifacts in `src/providers/` are still there.** See
finding 3 — worked around at the two import sites, not deleted.

**`yarn test:e2e` and `yarn storybook:test` were not run.** The new story renders
components that already have browser coverage, and this packet adds no new
computed-style claim for a browser to check. The RTL claims that *do* need a
browser — logical properties resolving under `dir="rtl"` — are TASK-OSS-P4-05.

### Unresolved owner decisions

1. **ADR-20 is still Proposed**, now with four amendments, and P4-03, P4-04 and
   P4-05 all build on it. Approving it before P4-03 starts is cheaper than after.
2. **Delete `packages/core/src/providers/*.js`, `*.d.ts`, `*.js.map`?** Twelve
   tracked files that shadow their own sources and already broke one build. The
   recommendation is to delete them; it is not this packet's call to make.
3. **Whether a nested provider should be able to scope `dir` in the DOM.** Today
   the answer is "the host writes one attribute", and the alternative costs the
   renderless property the shadow-root recipe depends on. A real trade, and a
   product call rather than a refactor.
4. **Whether `useDzTheme` should stop throwing** (ADR-20 Rollout §6). Narrowed,
   not answered.
5. **Whether the `defaults` shorthand should survive.** Two accepted shapes is
   two things to document. It is here because the packet's own example used the
   shorthand; if the contract form is the one to teach, the shorthand can be
   dropped before anything depends on it.
6. **Whether `validate:contract-parity` should widen further.** It now covers
   `src/components` and `src/providers`. Anything that grows a `Dz*.vue` outside
   those two is invisible again, and a positive list is how that recurs — an
   owner may prefer "every `Dz*.vue` under `packages/*/src`".

### Ranked next packet

1. **TASK-OSS-P4-04 (portals)** — the provider target exists and nothing reads
   it. 15 components, and it closes the shadow-root limitation the cookbook has
   now had to document twice as unsolvable.
2. **TASK-OSS-P4-03 (message catalogs)** — the 79 literals, now testable end to
   end because a provider can supply a catalog and a nested one can override a
   single string.
3. **TASK-OSS-P4-05 (RTL matrices)** — `useDzDirection` and the `dir` bootstrap
   are in place, so the matrices have something to key off, and the browser lane
   this packet did not need becomes the one that matters.
---

## TASK-OSS-P4-03 — Message catalog, pseudo-locale, cached `Intl`

**Maturity: implemented → focused-validated → aggregate-qualified.**

### Discovery result — the inventory was right about the count and wrong about the contents

P4-01 measured "50 static `aria-label` values, 29 prop defaults". Re-measured
with a script that reports each hit rather than a total:

| Group | Occurrences | Distinct | Files |
|---|---|---|---|
| Static `aria-label` in a rendered `<template>` | 54 | **50** | 27 |
| Literal defaults on `*Text`/`*Label`/`*Placeholder`/… props | 39 | 28 | 24 |
| `aria-label` inside a JSDoc `@example` | 11 | 11 | 9 |

The distinct count for group 1 reproduces P4-01's figure exactly. The third row
is the finding: **the first pass of this packet's own inventory swept up 11
documentation strings** in `DzFab`, `DzIconButton`, `DzSpeedDial`,
`DzSplitButtonMenu`, `DzInplace`, `DzIcon`, `DzQRCode`, `DzMenu` and
`DzPopconfirm` — `@example` blocks showing a consumer what to pass, which never
reach the DOM. Translating them would have been translating the manual.

That is why the second pass, and the validator, read the `<template>` block only.
A gate that fires on documentation teaches people to stop writing examples.

### Implemented files

| File | Purpose |
|---|---|
| `packages/contracts/src/provider.types.ts` | `DzMessageCatalog` — an **empty** interface every tier augments |
| `packages/core/src/i18n/messages.ts` | Core's augmentation (~38 components) + `enMessages`, the shipped English values |
| `packages/core/src/i18n/useComponentMessages.ts` | per-key resolution of a host catalog over the defaults |
| `packages/core/src/i18n/intl-cache.ts` | the formatter cache, **importing nothing** |
| `packages/core/src/i18n/pseudo.ts` | `pseudoLocalise`, `pseudoMessages` — generated from `enMessages` |
| `packages/core/src/i18n/i18n.spec.ts` | 12 specs |
| 51 component `.vue` files | 54 `aria-label`s + 39 prop defaults now resolve through the catalog |
| `packages/core/src/composables/provider/useDzFormats.ts` | delegates to the shared cache |
| `packages/core/src/composables/useRelativeTime/useRelativeTime.ts` | cached, and honours the provider locale |
| `packages/core/src/components/data/DzAnimatedNumber.{vue,tween.ts}` | the per-frame construction, removed |
| `packages/core/src/components/forms/DzTimePicker.vue` | cached, provider locale |
| `packages/tooling/src/validators/hardcoded-strings.{ts,spec.ts}` | the new gate + 13 specs |
| `apps/storybook/.storybook/preview.ts` | the Pseudo-locale toolbar, global |
| `packages/core/stories/_shared/decorators.ts` | `longLabelDecorator` |
| `packages/core/stories/compositions/i18n/Localisation.stories.ts` | 5 stories |
| `docs/adr/ADR-20-provider-contract.md` | Amendment A5, Rollout §3 closed |
| `.changeset/every-string-the-library-shows-you-can-be-translated.md` | minor for both packages |

### API effect

One type on `@dzup-ui/contracts` (`DzMessageCatalog`). **Nothing new on
`@dzup-ui/core`'s barrel** — the catalog, the reader, the cache and the
pseudo-locale generator are all internal. Ownership stayed at 29/29
unclassified, because the alternative was exporting four helpers the schema has
no `utility` kind for and pushing a ratchet that only falls.

Thirty-nine props changed their *declared* default from a literal to
`undefined`, and resolve to the same string at the point of use. A consumer
reading `props.noResultsText` on a component instance now sees `undefined` where
they used to see `'No results found'`; what the component renders is unchanged.

### The mechanism, and why it is not `read(path, fallback)`

`useDzMessages()` (P4-01) offers `read('DzInput.clear', 'Clear input')`. That
works and it is public, and it was the wrong shape here: it keeps the English
string **in the component**, which is the thing this packet exists to remove.
Every call site would still have to be edited to change a default, and nothing
could enumerate what the library ships.

So components ask once and read properties:

```ts
const dzMessages = useComponentMessages('DzInput')
// template: :aria-label="dzMessages.clear"
```

Resolution is **per key**: a host overriding `DzTimePicker.confirm` keeps the
other ten. A non-string override — a nested object where a string belongs, the
usual shape of a mistyped catalog — falls back to English rather than rendering
`[object Object]` in the one locale nobody on the team reads.

### `satisfies` is the sync mechanism, not a convention

`enMessages` is declared `as const satisfies DzMessageCatalog`. A key declared
in the interface and not supplied — or supplied and not declared — is a compile
error rather than a string that resolves to `undefined` at runtime, in whichever
locale nobody tested.

### Two things the codemod got wrong, and the review that caught them

Both would have shipped had the script been trusted.

**Declarations landed after their use sites.** The first pass appended
`const dzMessages = …` at the end of each `<script setup>`. It *worked* — every
reference sits inside a lazily-evaluated `computed` callback, so nothing reads
the binding during setup — but "works because nothing reads it yet" is a
property the next edit breaks silently. Redone: declarations are inserted
immediately after the props block, above all derived code.

**`DzCommandPalette` had a second copy of the same literal.** `fallbackTitle`
was `props.ariaLabel ?? 'Command palette'` — an inline fallback, not a prop
default, so neither inventory pass saw it. After the migration the `??` branch
was unreachable. Both copies are now the one catalog entry and the dead branch
is gone rather than left as unreachable code.

### The finding: a documented public prop that renders nothing

`DzOrderList.dragHandleLabel` is documented as "accessible label for each row's
drag handle" and defaulted to `'Drag to reorder'`. **No element carries it.**
The handle is `aria-hidden="true"` — a pointer-only affordance, with the
keyboard path exposed through the Move Up/Down controls — so no assistive
technology can reach the value.

It surfaced only because the migration made the resolved value unused and
`vue-tsc` said so. Nothing else in the repository could have noticed: the prop
type-checks, the component renders, and the spec suite never asserted a label
that never existed.

Not fixed here, and deliberately: giving that handle an accessible name is an
accessibility decision (which element, which role, whether the handle should be
reachable at all) and belongs to TASK-OSS-P5-01. The literal stays with the
reason in the source, and the validator's escape hatch is what carries it —
which is also why that hatch reads the whole comment block rather than one line.
The honest explanation took six.

### The `Intl` migration, and the pathological case

Five construction sites across four files, as P4-01 measured. Four were
ordinary. One was not:

`DzAnimatedNumber.tween.ts` constructed its `Intl.NumberFormat` **inside
`format()`**, and its own doc comment told callers "callers that animate should
cache a formatter instead of calling this per frame". ECMA-402 requires locale
data to be resolved on construction, so an animating number resolved locale data
sixty times a second, and the fix was documented as the caller's problem.

The cache could not simply be imported, because `useDzFormats.ts` imports
`inject`/`provide` from Vue and `DzAnimatedNumber.tween.ts`'s header promises it
is "framework-free … so the animation logic can be unit-tested without a DOM".
So the cache moved to `packages/core/src/i18n/intl-cache.ts`, **which imports
nothing**. A cache the hot paths cannot reach is not a cache.

`grep -rn "new Intl\." packages/core/src` now returns four lines, all inside
that one module.

### One behaviour change, and it is a hydration fix

`DzAnimatedNumber`, `DzTimePicker` and `useRelativeTime` passed `undefined` to
`Intl` when given no explicit locale, which means "the runtime's own locale".
That is not the same value on a Node server as in a visitor's browser: a
server-rendered figure could hydrate into a different group separator, and a
server-rendered "2 minutes ago" into a different language. They now resolve
through the provider, falling back to `en-US`.

The **pure exported helpers** — `formatNumber`, `formatRelativeTime`,
`formatAbsoluteTime` — deliberately keep the old semantics: an omitted `locale`
still means the runtime's own, because they are public functions whose
documented signature says so. Only the composable and the components changed.

### Pseudo-locale is a toolbar, not eleven stories

The packet asks for "one story per family" under pseudo-locale and long labels.
It is implemented as a **global Storybook toolbar** that wraps every story in a
`DzProvider` carrying a pseudo-localised catalog. That covers all 169 story
pages rather than eleven, and — the part that matters — it keeps covering
families added after this was written, which eleven hand-placed decorators would
not.

The pseudo catalog is generated from `enMessages`, so a message added tomorrow
is in the fixture today. Three failures become visible without a translator:
un-accented text is a string the catalog does not reach; a missing `!!!]` is a
clipped label; a broken layout is what a real translation will do. The `+30%`
padding is the shortest realistic German.

`longLabelDecorator` covers the other half — the strings a *consumer* passes —
by constraining the container rather than rewriting slot content, so it works on
any story without knowing what that story renders.

### Focused validation output

```
yarn validate:hardcoded-strings              → ✓ 0 violations (1 explained exemption)
yarn vitest run packages/core/src/i18n       → ✓ 12 tests
yarn vitest run …/hardcoded-strings.spec.ts  → ✓ 13 tests
yarn vitest run packages/core/src/components → ✓ 281 files, 3,442 tests, 0 failures
yarn validate:story-dod                      → ✓ enforced green; 366 reported — UNCHANGED
yarn validate:contract-parity                → ✓ 0 violations
yarn validate:adr-references                 → ✓ 17 cited · 3 documented · 14 registry-only
yarn typecheck                               → ✓ 0 errors
yarn lint                                    → ✓ 0 errors, 0 warnings
yarn storybook:build                         → ✓ 23.23 MB within budget 25 MB
```

The 3,442 component tests passing **unchanged** is the load-bearing evidence: 51
components had strings moved out of them and not one spec needed editing, which
is what "byte-identical to the literal it replaced" means in practice.

### Aggregate qualification

```
yarn validate:all → EXIT 0 — including the new `validate:hardcoded-strings` gate
yarn vitest run   → EXIT 0 — 428 files, 7,599 passed, 2 skipped, 1 todo
```

`yarn vitest run` rather than `yarn test`: the wrapper's `test:prepare` step
(`tokens:generate` + the landing count build) had already run in this session and
its outputs are current, and the combined command exceeds the ten-minute ceiling
this environment kills a process at. The generated inputs were verified fresh by
`yarn validate:all` in the same state.

**The suite caught a stale fact before a human did.** An earlier run failed
`generate-readme-facts.spec.ts` twice: adding two story files moved the README's
generated count from 179 to 180. Regenerated with `yarn generate:readme-facts`;
the point is that a hand-typed count would simply have been wrong instead.

### Not done

**No landing-app strings.** The catalog covers `packages/core`. `apps/landing`
has its own copy, and it is an application rather than a library.

**No RTL assertions.** Pseudo-locale proves a string is reachable and that the
layout survives length. It says nothing about mirroring, which is
TASK-OSS-P4-05.

**No visual regression run.** The packet's success criterion says "pseudo-locale
renders for every family without clipping in visual tests". The toolbar makes
that testable and `yarn test:e2e:visual` was not run — it needs a Chromatic
baseline decision, and a new global that changes every story's text is exactly
the kind of change that should not silently rewrite a baseline.

**`DzOrderList.dragHandleLabel` is still a dead prop.** See the finding above.

### Unresolved owner decisions

1. **Whether `enMessages` should be public.** A translator wants to read the
   English values; today the type is public and the values are not, because
   exporting them costs an `unclassified` ownership entry and the ratchet only
   falls. The real fix is a `utility` kind in the ownership schema — the same
   decision P4-01 parked, now with a second claimant.
2. **`DzOrderList.dragHandleLabel`**: wire it up, or deprecate it. It cannot
   stay documented and dead.
3. **The two ellipsis styles.** `Search…` in `DzCascader`, `Search...` in
   `DzSelect` and `DzListbox`. Preserved byte-for-byte on purpose; normalising
   is a one-line change and a visible one.
4. **Whether the pseudo-locale toolbar should be excluded from visual
   baselines.** It is off by default, so today it cannot affect them — but the
   moment someone snapshots with it on, every baseline moves.

### Ranked next packet

1. **TASK-OSS-P4-04 (portals)** — 15 components with their own `portalTo`, a
   provider target that nothing reads, and the shadow-root limitation the
   cookbook has documented twice as unsolvable.
2. **TASK-OSS-P4-05 (RTL matrices)** — the catalog and `useDzDirection` are both
   in place, so a mirrored layout can now be asserted against a declared
   contract rather than eyeballed.
3. **TASK-OSS-P5-01 (risk tiers)** — and it inherits `dragHandleLabel`.

---

## TASK-OSS-P4-04 — Portal migration and shadow-root/test documentation

**Maturity: implemented → focused-validated → aggregate-qualified.**

### Discovery result — 19 portal consumers, not 15

The reassessment and TASK-OSS-P4-01 both measured "15 components extend
`BasePortalProps`", which is exactly right and is not the whole set:

| How it portals | Count | Escape hatch before this packet |
|---|---|---|
| Reka `*Portal` with `:to="portalTo"` | 14 | a `portalTo` prop, per instance |
| Forwards `portalTo` to `DzDialog` | 1 (`DzConfirmDialog`) | inherited |
| **Raw `<Teleport to="body">`** | **4** | **none at all** |

`DzBlockUI`, `DzSidebar`, `DzPopconfirm` and `DzTour` hard-coded `to="body"` and
took no portal prop. They are the four an application embedding the library in a
shadow root could not fix by any means — not with a prop, not with a provider,
not one instance at a time. The count that made it into the ledger measured the
prop, and the components without the prop were the ones that mattered most.

### Implemented files

| File | Purpose |
|---|---|
| 12 components, codemod | `:to="portalTo"` → `:to="resolvedPortalTo"` + the shared two-line resolution |
| `DzContextMenuContent.vue`, `DzDropdownMenuContent.vue` | same, by hand — they called `withDefaults` **without binding it**, so there was no `props` to read |
| `DzBlockUI.vue`, `DzSidebar.vue`, `DzPopconfirm.vue`, `DzTour.vue` (+ `.types.ts`) | provider target **and** a new `portalTo` prop |
| `packages/core/tests/portal-target.spec.ts` | 6 specs — the four that had no hatch, precedence, reactivity, no-provider fallback |
| `packages/core/tests/ssr/dz-provider-ssr.spec.ts` | +2 specs — target resolves with `document` deleted |
| `apps/storybook/stories/Portals.mdx` | the *Portals & Embedding* guide |
| `apps/storybook/stories/Styling-Cookbook.mdx`, `stories/compositions/styling/Overrides.stories.ts` | the shadow-DOM limitation, retired |
| `apps/landing/src/claims.spec.ts` | hardened — see below |
| `.changeset/overlays-go-where-your-application-says.md` | patch for `@dzup-ui/core` |

### One rule, nineteen implementations of it

```
instance `portalTo`  →  DzProvider `portal`  →  document.body
```

Two lines per component, identical everywhere:

```ts
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)
```

The four raw-`Teleport` components spell the last step out as `?? 'body'`,
because `<Teleport>` requires a target and has no default of its own where a
Reka portal does.

**`portalDisabled` and `portalDefer` stay per-instance and are untouched.** They
answer "does *this* overlay teleport", not "where do overlays go", and folding
them into a provider would let one application-wide setting disable every
overlay's portal at once.

### This closes a limitation the cookbook documented twice

Styling Cookbook recipe 7 and the `ShadowDom` story both stated, correctly, that
portaled content escapes a shadow root and loses the adopted stylesheet — and
that `portalTo` was the workaround "today". For four components there was no
workaround at all. Both documents now say what to do instead, and the new guide
carries the full recipe: adopt the sheet **and** point `portal` at a container
inside the root.

### The finding: a spec that assumed a directory was only directories

`apps/landing/src/claims.spec.ts` counts the catalog by reading
`packages/core/src/components/` and calling `readdirSync` on **every entry**.
Putting a cross-cutting `portal-target.spec.ts` beside the family folders made it
throw `ENOTDIR: not a directory` — which surfaces as a failed *count* claim, not
as "that file is in the wrong place".

Fixed on both sides, because both were wrong: the spec now filters to
directories (`withFileTypes`), and the new spec moved to `packages/core/tests/`,
where the SSR and a11y suites already live and where a test belonging to no
single family belongs.

### Focused validation output

```
yarn vitest run packages/core/tests/portal-target.spec.ts   → ✓ 6 tests
yarn vitest run packages/core/tests/ssr                     → ✓ 3 files, 68 passed, 1 skipped
yarn vitest run …/{overlays,forms,feedback,navigation,media} → ✓ 156 files, 1,808 tests, 0 failures
yarn validate:doc-snippets                                  → ✓ 19 fixture-backed snippets match
yarn typecheck                                              → ✓ 0 errors
yarn lint                                                   → ✓ 0 errors, 0 warnings
yarn storybook:build                                        → ✓ 23.25 MB within budget 25 MB
```

The 1,808 family tests passing **unedited** is the evidence that the migration is
behaviour-preserving: with no provider and no prop, all nineteen teleport exactly
where they did before.

### Aggregate qualification

```
yarn validate:all → EXIT 0
yarn vitest run   → EXIT 0 — 429 files, 7,607 passed, 2 skipped, 1 todo
```

### Not done

**No browser lane.** The packet lists `yarn test:e2e e2e/components`. The
precedence is asserted in jsdom, which is where portal *targets* are decided;
what a browser would add is whether the overlay is visible and unclipped inside
a real shadow root, and that needs a shadow-root e2e fixture that does not exist
yet. It belongs with the P5 browser lanes.

**No shadow-root story.** The guide carries the recipe; the packet also asks for
a story that "works in light/dark". `Overrides.stories.ts` already has a
`ShadowDom` story and it now documents the fix rather than the limitation, but it
does not yet mount an overlay inside the root to prove it.

**`DzConfirmDialog` was not changed.** It forwards `portalTo` to `DzDialog`, so
an unset value reaches `DzDialogContent` and resolves there. Adding a second
resolution would have meant two places deciding one target.

### Unresolved owner decisions

1. **Whether `portalTo` should be deprecated on the fifteen.** ADR-20 said P4-04
   would decide. It is kept: an instance override is the more specific
   declaration and there is no cost to leaving it. Deprecating it would be a
   breaking change that buys nothing.
2. **Whether the four new `portalTo` props should have been `BasePortalProps`
   in full.** They took the target only, not `portalDisabled`/`portalDefer`,
   because three of the four already have their own conditional teleport logic
   (`:disabled="!fullScreen"`, `v-if="open"`) that a second switch would
   contradict.
3. **A shadow-root e2e fixture.** Without one, the recipe in the guide is
   correct and unproven in a browser.
---

## TASK-OSS-P4-05 — RTL semantics matrices for primitives

**Maturity: implemented → focused-validated → aggregate-qualified.**

### Discovery result — the direction was resolved and the CSS ignored it

`DzProvider` has answered `useDzDirection()` and written `dir` on `<html>` since
P4-02. What no packet had checked is whether anything downstream honoured it:

| Measured | Count |
|---|---|
| Lines in `*.variants.ts` using physical `left`/`right` utilities | **55 across 26 files** |
| Of those, genuinely physical on purpose | 4 files |
| Composables handling `ArrowLeft`/`ArrowRight` | 14 files |
| Components declaring an RTL contract | **0** |

So an Arabic application got a mirrored document with the component internals
still pinned to the physical left. The sharpest instance is `DzTable`: its
`headerCell` and `cell` were `text-left`, so every cell aligned against the
wrong edge inside a table that had itself mirrored.

### Implemented files

| File | Purpose |
|---|---|
| `packages/contracts/src/anatomy.types.ts` | the `rtl` field and `ComponentRtl` — three independent axes |
| 26 `*.variants.ts`, codemod | 55 lines → `ms`/`me`, `ps`/`pe`, `border-s`/`border-e`, `rounded-s`, `text-start` |
| 4 `*.variants.ts` | `rtl-physical-ok` declarations, each with its reason |
| 7 `*.anatomy.ts` | declared RTL contracts |
| `packages/core/src/composables/useTabs/useTabs.ts` | horizontal arrows follow the writing direction |
| `packages/testing/src/rtl.ts` | `expectRtl`, `checkRtl`, `expectRtlComputed`, `forwardArrow` |
| `packages/tooling/src/validators/rtl.ts` | the gate **and** the matrix generator, from one source |
| `packages/core/docs/rtl-matrix.md` | generated |
| `packages/core/tests/rtl.spec.ts` | 10 specs |
| `packages/tooling/src/ownership/{anatomy-source,emit-anatomy-data}.ts` | parse and project the new field |
| `apps/storybook/.storybook/preview.ts` | the Direction toolbar |
| `.changeset/the-catalog-knows-which-way-it-reads.md` | minor / patch / minor |

### Three axes, because they fail independently

A component can mirror its layout correctly and still move the selection the
wrong way on ArrowRight, and it can get both right and still show a chevron
pointing away from the panel it opens. So the declaration is not one boolean:

```ts
rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] }
```

`DzSelect` is the case that proves the split is not theoretical: it declares
`mirrors: 'layout'`, an `indicator` icon that flips — and `keyboard: 'none'`,
because a listbox navigates the **block** axis. ArrowUp and ArrowDown do not
swap in RTL, and copying the tabs rule to it would have been applying a rule
past where it holds.

### The defect the keyboard axis found

`useTabs` computed `nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'`.

APG's tabs pattern is written in terms of **previous** and **next**, not left and
right. In a right-to-left document the next tab is to the *left* — so an Arabic
user pressing the key that visually points at the next tab got the previous one.
It now reads the provider direction and swaps. The **vertical** keys deliberately
do not: `dir` is about the inline axis, and ArrowUp is ArrowUp in every language.

### What is physical on purpose, and why each one is

Four files keep their physical utilities, each with the reason in the file rather
than in a list somewhere else:

- **`DzCodeBlock`** — source code reads left-to-right in every locale, so the
  line-number gutter stays left and the numbers stay right-aligned against it.
- **`DzHeading`, `DzText`** — `align="left"` is an author naming a side, not
  asking for the start edge; `text-start` is what an unset `align` already does.
  Mirroring these would make `align="left"` mean right.
- **`DzSheet`** — `side="right"` names a side. Whether a sheet should open from
  the inline end in RTL is a **product decision**, which is this packet's stop
  condition. Recorded, not taken.

### The gate gates, and the proof is cheap

```
$ sed -i "s/cell: 'text-start'/cell: 'text-left'/" packages/core/src/components/data/DzTable.variants.ts
$ yarn validate:rtl
✗ DzTable declares mirrors: 'layout' but …/DzTable.variants.ts:20 uses `text-left`.
EXIT=1
```

### `expectRtlComputed` throws rather than passing

jsdom implements the CSS object model but **not layout**, so `getComputedStyle`
cannot resolve a class-driven `margin-inline-start`. A helper that returned an
empty string and let the assertion pass would make the suite green on a claim
nothing checked — which is worse than having no helper. It detects the missing
layout and says to run in the Playwright lane instead.

That is why this packet's checks split in two: **source-level** rules run in
`yarn test` and catch a regression the day it is written; the **computed-edge**
rule needs an engine and is not claimed here.

### Two specs asserted the old physical classes, and both were right to fail

`DzSidebar` ("active item with activeStyle=rail uses border-left accent") and
`DzBlockquote` ("applies left border styling") asserted `border-l-`. They were
correct tests of the old behaviour and are now correct tests of the new one —
the rail marks the *start* edge, so it moves to the right in Arabic. Renaming
them mattered as much as changing the assertion: a test called "left border"
that checks `border-s` is a test nobody will trust in six months.

### Focused validation output

```
yarn validate:rtl                             → ✓ gate green, matrix matches the declarations
yarn vitest run packages/core/tests/rtl.spec  → ✓ 10 tests
yarn validate:ownership                       → ✓ 1,319 entries; 29/29 unclassified; 137/137 without anatomy
yarn typecheck                                → ✓ 0 errors
yarn lint                                     → ✓ 0 errors, 0 warnings
yarn storybook:build                          → ✓ 23.25 MB within budget 25 MB
```

### Aggregate qualification

```
yarn validate:all → EXIT 0 — now including validate:rtl
yarn vitest run   → EXIT 0 — 430 files, 7,617 passed, 2 skipped, 1 todo
```

**A second load-dependent flake, recorded like the first.**
`packages/tooling/src/perf-bench.spec.ts > DzDataGrid with 100 rows x 5 columns`
failed once in a full run and passes in isolation (`avg=2984ms` against its
threshold). It is a wall-clock benchmark competing with 429 other files for CPU.
Together with the `DzMasonry` flake from P4-02, that is two timing-sensitive
specs that will fail in CI eventually; TASK-OSS-P5-05 owns performance baselines
"measured with variance", and these two are its first inputs.

### A tooling defect I introduced and caught

The `rtl` parser silently matched nothing, and the anatomy count dropped from
8/144 to 1/144 with seven components reporting `rtl.mirrors (absent)` for
declarations that were plainly correct in source. The cause was in the edit, not
the logic: a scripted edit wrote a literal **backspace byte** (`0x08`) where
`\b` was intended, so the regex became one that can never match — and one that
renders identically in a terminal. Found with `cat -v`; three bytes across the
file. Worth recording because the symptom pointed at the declarations while the
cause was in the tool that wrote the parser.

### Not done

**No browser lane.** `expectRtlComputed` exists and nothing calls it yet: the
computed-edge assertions need a Playwright fixture that renders under
`dir="rtl"`. That is P5-03's three-engine lane, and this packet deliberately did
not fake it in jsdom.

**No icon mirroring is implemented.** The `icons` axis is *declared*
(`DzSelect.indicator`) and nothing yet reads it to apply a transform. The
declaration is the contract P5 can build the rendering rule against; asserting
the rule exists would have been exactly the kind of claim this packet is trying
to make checkable.

**137 of 144 components declare nothing.** The `rtl` field lives in the anatomy,
and only 7 components declare an anatomy at all. The logical-property migration
covered the whole catalog regardless, so the *behaviour* is broadly fixed while
the *contract* is declared for 7. Stated in the generated matrix itself rather
than left for a reader to infer from a short table.

### Unresolved owner decisions

1. **Should `DzSheet` mirror?** `side="right"` in an Arabic document: physical
   or inline-end? Left physical, declared, and named here.
2. **Should `align="left"` mean "start"?** Same question for `DzHeading` and
   `DzText`. Kept physical — `text-start` is already the unset default — but a
   design system may prefer the props renamed to `start`/`end` outright, which
   is a breaking change and not a refactor.
3. **The `icons` axis needs a rendering rule.** Declaring which icons bear
   direction is only half; something has to mirror them.
4. **Whether `validate:rtl` should widen past `mirrors: 'layout'` declarers.**
   Today a component with no anatomy is not checked, so the gate's reach grows
   only as the anatomy rollout does.

### Ranked next packet

1. **TASK-OSS-P5-01 (risk tiers and WCAG/APG mapping)** — every P5 packet after
   it consumes the tiers, and the anatomy already carries `riskTier` for 8
   components, so the shape exists.
2. **TASK-OSS-P5-03 (three-engine lanes)** — it owns the browser half this
   packet could not claim: computed inline-start edges, forced colours, zoom,
   reduced motion, RTL.
3. **TASK-OSS-P5-05 (performance baselines with variance)** — it already has two
   real inputs in the two flakes recorded above.

---

## Packet P5 — Evidence completeness by risk

**Maturity: implemented → focused-validated → aggregate-qualified.** The browser
lane reached one engine of three; the AT lane is generated and unexecuted. Both
are stated per cell below rather than folded into the packet's level.

### The finding that had to be settled before anything else: the tier scale was inverted

TASK-OSS-P3-02 introduced `riskTier` on the component anatomy with this
definition:

> `A` — focus-managing or form-bearing … `D` — structural: layout primitives

The 2026-08-11 reassessment it was implementing says the opposite, in
`06-quality-accessibility-i18n-security-spec.md` §"Quality model":

| Tier | Examples |
|---|---|
| A — presentational | badge, separator, skeleton, typography |
| D — security or data boundary | rich HTML, files, URLs, schema references |

So did every P5 packet that consumes the field — "Tier B–D" for the evidence
that matters, "Tier A only in chromium default", "Tier C/D performance
baselines". Six documents read one way and one shipped JSDoc read the other, and
eight components had been declared against the shipped one.

The scale is now ascending and the eight declarations were migrated:

| Component | Was | Now |
|---|---|---|
| DzButton, DzInput, DzSelect, DzDialog, DzDialogContent | A | **B** |
| DzProvider, DzThemeProvider | A | **B**, with two recorded exceptions |
| DzTable | B | **C** |

`validate:quality-tiers` gate 5 is the check that would have caught it: a
component's own anatomy and the tier assignment must agree, and a compound part
must agree with its parent.

---

## TASK-OSS-P5-01 — Risk tiers, WCAG 2.2 and APG per public component

### Implemented files

| File | Purpose |
|---|---|
| `packages/contracts/src/quality-tiers.ts` | the rules: tier→evidence, traits, boundaries, APG patterns, the WCAG 2.2 catalog |
| `packages/contracts/src/anatomy.types.ts` | `RiskTier` corrected, with the inversion recorded at the type |
| `packages/tooling/src/quality/component-tiers.ts` | the reviewed assignment, 144 rows |
| `packages/tooling/src/quality/generate-quality-matrix.ts` | the join → `packages/core/docs/quality-matrix.json` |
| `packages/tooling/src/validators/quality-tiers.ts` | six gates |
| 8 `*.anatomy.ts` | migrated tiers |
| specs | 24 in contracts, 27 in tooling |

**144 of 144 public components tiered — A:55 B:67 C:21 D:1.**

### The security boundary is a second axis, and that was forced by the stop condition

The reassessment's tiers are cumulative: D requires everything C requires.
`DzButton` accepts an `href`, so it owes a URL policy and a hostile-input
corpus — and tiering it D would also make it owe dataset scenarios, a manual AT
task and a performance baseline, none of which a button can satisfy or needs.

That is exactly the case P5-01's stop condition names: *"a Tier D requirement the
component cannot meet … report, do not downgrade the tier to pass."* So the
boundary became `SecurityBoundary`, an orthogonal declaration that **adds** the
Tier D security rows without dragging six unrelated ones behind them. The
requirement is kept; it stopped being a tier.

Thirteen components declare a boundary. Exactly one component is Tier D:
`DzFileUpload`, whose primary job is the boundary.

### Three rows follow what a component does, not how complex it is

`portal-hydration`, `non-drag-alternative` and `data-scenarios` are qualified
"where applicable" in the reassessment, and folding them into a tier erases the
qualification: `DzButton` and `DzSelect` are both Tier B and only one teleports.
They hang off traits instead, and `teleports` is checked against source.

That check found the trait list was wrong in six places. `DzRelativeTime`
renders no portal of its own — it discloses the absolute timestamp through a
`DzTooltip`, whose content leaves the DOM position it was written in. The same
for `DzDataGrid` (its pagination renders a `DzSelect`), `DzPersonaSelector`,
`DzSpeedDial`, `DzTreeSelect` and `DzConfirmDialog`. What hydrates is the
rendered tree, not the file, so the detector follows local `.vue` imports
transitively.

It also found one the other way: `DzProvider` was declared `teleports` and does
not teleport. It *provides* the portal target every overlay resolves against and
renders nothing outside its own position. Declaring the trait there would have
claimed portal/hydration evidence for the one component with no teleported
output to check.

### A gate that could not fail, found by its own test

The catalog check read `row.wcag` — the **generated** list. The generator emits
in catalog order, which it can only do by filtering to ids the catalog knows, so
an unrecognised id had already vanished before the validator saw it. Checking
the output made the gate unfailable. It now reads the raw assignment.

### Focused validation output

```
yarn generate:quality-matrix                       → 144 components — A:55 B:67 C:21 D:1
yarn validate:quality-tiers                        → ✓ 144/144 tiered, matrix fresh
vitest packages/contracts/src/quality-tiers.spec    → ✓ 24 tests
vitest packages/tooling/src/validators/quality-tiers.spec → ✓ 27 tests
```

---

## TASK-OSS-P5-02 — Triaging the 366 by risk tier

**Status `[~]`: the triage and the ratchet are done; 51 items are open and
assigned.**

### The join, which is the whole point

| check | required from | tier-required / reported |
|---|---|---|
| `states` | tier B | **30** / 35 |
| `accessibility` | tier C | **11** / 66 |
| `real-world` | tier C | **10** / 70 |
| `gallery` | — | **0** / 155 |
| `controls-live` | — | 0 / 27 |
| `play` | — | 0 / 13 |

**366 reported → 51 tier-required, across 32 components.** The largest category
in the report is `gallery` at 155, and no tier requires any of it. That is the
number the task warned about — *"Gallery percentage is the least valuable metric
and the cheapest to inflate"* — and the join is what turns that from an opinion
into a count.

Twenty-six story files are `*Parts` pages and composition pages that name no
public component. They are reported as untiered rather than folded into a
parent's tier: a parts page and a component page owe different things, and
averaging them is how a real gap on the component hides behind a satisfied parts
page.

### The ratchet, and why it is a ceiling rather than zero

`validate:story-dod-tiers` holds a per-check ceiling that may only fall, seeded
at today's counts (`states: 30`, `accessibility: 11`, `real-world: 10`). Nothing
may get worse and every fix is permanent.

Promoting the three checks to hard failures today would land 51 red items on a
green build, which this task's own stop condition forbids: *"Stop if promoting a
check to enforced turns a currently-green CI red."* A ceiling buys the same
guarantee without the red build, and it is the mechanism
`unclassified-ceiling.json` already uses for the ownership generator.

### Not done — and this is the packet's largest open item

**The 51 items are not closed.** Writing 30 state stories, 11 APG narratives and
10 real-world compositions at the quality bar this corpus holds is a substantial
piece of authoring, and filler stories would be worse than none: they would let
the checks be promoted to enforced over content nobody benefits from, which is
the failure mode the task explicitly warns against. The tooling, the join and
the ratchet are in place; the authoring is assigned, per-component, and visible
in `yarn validate:story-dod-tiers --all`.

### Focused validation output

```
yarn validate:story-dod-tiers        → ✓ no tier-required category above its ceiling
vitest .../story-dod-tiers.spec      → ✓ 14 tests
yarn validate:story-dod              → ✓ enforced checks pass, 366 reported (unchanged)
```

---

## TASK-OSS-P5-03 — Three engines by five conditions

### Implemented files

| File | Purpose |
|---|---|
| `playwright.config.ts` | 18 `matrix-{engine}-{condition}` projects; the base three now exclude `e2e/matrix` |
| `e2e/matrix/conditions.spec.ts` | one assertion per condition over every Tier B–D component |
| `e2e/matrix/fixtures.ts` | project metadata, targets, the unrun declaration, the ledger |
| `e2e/matrix/targets.generated.ts` | 144 components, 89 in the lane, generated |
| `e2e/matrix/engine-exceptions.json` | measured capability per engine — **empty**, and that is the finding |
| `e2e/matrix/known-failures.json` | 46 measured failures, as a ratchet |
| `packages/tooling/src/quality/generate-matrix-targets.ts` | the target generator |

### The engine exceptions file is empty, and it was measured rather than assumed

Received guidance says WebKit does not support `forcedColors` emulation and
Firefox does not support `isMobile`. At Playwright 1.61.1, measured by opening
each `{engine, condition}` pair and reading the media query back:

| | chromium | firefox | webkit |
|---|---|---|---|
| `forced-colors: active` | ✓ | ✓ | ✓ |
| `prefers-reduced-motion` | ✓ | ✓ | ✓ |
| `pointer: coarse` + `isMobile` | ✓ | ✓ | ✓ |
| 320px viewport | ✓ | ✓ | ✓ |

So the exceptions file records the measurement and no exceptions. Pre-loading it
with limitations nobody re-checked would have narrowed the lane on hearsay.

### What the lane found on its first run

**Chromium, all six conditions, 89 components: 1,055 passed, 6 skipped, 1
environment failure.** `default`, `forced-colors`, `reduced-motion` and `rtl` are
clean. Two conditions are not:

- **`zoom-400` — 18 components do not reflow into 320 CSS px** (WCAG 1.4.10),
  measured overflow from 2px (`DzOrderList`) to 272px (`DzImageComparison`). The
  large ones are stories with a fixed width, which measures the published
  example as much as the component — and the example is documentation, so it is
  in scope either way. Each entry carries its measured number and which of the
  two it looks like.
- **`touch` — 28 components have pointer targets under 24×24 CSS px** (WCAG
  2.5.8): `DzCheckbox` and `DzRadio` at 18×18, `DzCombobox` and six others at
  16×16, `DzTagsInput` at 14×14, and a family of 21px-tall text inputs. This is
  systemic across form controls rather than a set of individual defects; the fix
  is an enlarged hit area per family.

Both are recorded in `known-failures.json` as `test.fail()`, **not** skips. The
cell still loads the story, still costs the wall-clock, still reports — and
Playwright fails the run if it *unexpectedly passes*. Fixing a component
therefore breaks the build until somebody deletes its line, which is the only
way a list like this ever gets shorter.

### Four defects in the lane itself, all found by running it

1. **`not.toBeEmpty()` measures text, not children.** An icon-only
   `DzCopyButton` renders a button and an SVG and no text, so the assertion
   called eleven correct components empty.
2. **Story ids were derived by lowercasing the export name.** Storybook runs it
   through lodash `startCase(camelCase(key))` first, so `PanelBlock` is
   `panel-block`, not `panelblock`. Single-word exports like `Default` worked
   and hid it; the rest resolved to ids Storybook answers with
   `sb-show-errordisplay` — a 60-second timeout that reads as "the component is
   broken". `openTarget` now says which it is.
3. **`_gallery` and `_app-specific` are not built by default**, so four Tier A
   badges were being given story ids that do not exist. They are `story: null`
   now, which is `unrun`, not covered.
4. **The touch assertion counted visually hidden native inputs.** `DzCheckbox`
   and `DzFileUpload` both put a 1×1 `<input>` under a styled label; the input
   is not the pointer target, and reporting 2.5.8 against an element no pointer
   can reach is the kind of false positive that gets a lane switched off.

A unit spec now cross-checks every derived story id against the ids a built
Storybook actually contains, and says so out loud when the build is absent
rather than skipping quietly.

### The `\b` that became a backspace byte, again

A scripted edit wrote a literal `0x08` where `\b` was intended in the word-split
regex — the identical failure the P4-05 handoff records, in the identical way,
and again invisible in a terminal. Found with `cat -v`. Recorded a second time
because the lesson is not "be careful": it is that a shell heredoc is the wrong
tool for writing a regex, and the fix was to stop using one.

### Focused validation output

```
yarn generate:matrix-targets                → 144 components, 89 in the lane, 1 unrun
matrix-chromium-{6 conditions}, 89 targets  → 1,055 passed · 6 skipped · 1 env failure
```

The one failure is `net::ERR_NO_BUFFER_SPACE` navigating to a story — Windows
local socket exhaustion after 1,062 navigations at three workers. Not a
component and not the spec. `retries` was deliberately left at `0` outside CI:
turning it on would hide this class of failure and every real flake with it.

### Not done

**Firefox and WebKit have not run this lane.** Twelve of the eighteen projects
are configured, measured capable, and unrun. `known-failures.json` records that
its entries were measured on chromium only, and the first run on another engine
will say so by failing on an unexpected pass. The capability matrix shows the
browser column as available; it does not claim three engines.

---

## TASK-OSS-P5-04 — The manual AT task matrix

### Implemented files

`packages/tooling/src/quality/at-matrix.ts` (the six pairings, the tasks each APG
pattern implies), `generate-at-matrix.ts`, `packages/tooling/src/validators/at-matrix.ts`,
89 files under `e2e/at-matrix/` plus `index.json`, and 13 specs.

**89 Tier B–D components · 534 cells · 0 executed.**

### Zero executed is the honest number, and the task asked for it

The stop condition is explicit: *"Do not mark a row passed without an actual
run; if the AT/device is unavailable, record 'unrun'."* No screen reader was
available, so every one of the 534 cells says `unrun`, and `unrun` is a
first-class result in the vocabulary rather than a placeholder — it is a
different fact from `fail` and must not be laundered into one.

### The generator owns the header; the human owns the rows

Each file splits at a marker. Everything above it is regenerated from the tier,
the APG pattern and the traits; everything below is preserved verbatim. So
re-running after a pattern changes updates the tasks without touching a recorded
run — which is the failure mode that turns an evidence file into a file nobody
trusts.

### Three gates, demonstrated rather than asserted

Written into `DzTabs.md` and reverted:

```
· [stale]      DzTabs / nvda-firefox was pass at 00000000, and the component has
               changed since (80ce3012).
✗ [substance]  DzTabs / nvda-chrome claims `pass` with no sourceCommit. A result
               with nothing behind it is worse than `unrun`, because `unrun` is true.
✗ [index]      e2e/at-matrix/index.json disagrees with the markdown files.
EXIT=1
```

Stale and unrun **report**; malformed and unevidenced rows **fail**. A gate that
failed on 534 unrun cells the day it landed would be a gate switched off the day
after.

### The staleness rule was wrong, and the fix is an ancestry check

The first implementation compared `row.sourceCommit !== componentCommit`. A
tester records the repository HEAD they observed and a baseline records the HEAD
it was captured at — neither is the commit that last touched the component, so
the two hashes are almost never equal and almost every cell read `stale`. Seven
Tier C cells were reading stale for this reason alone.

`evidenceIsCurrent` now asks the real question with
`git merge-base --is-ancestor`: is the component's last change at or before the
commit the evidence was taken at? Correct across merges, where a date comparison
would not be. Stale dropped from 7 to 0.

### Retirement, not deletion

A file for a component that leaves the Tier B–D lane must move to
`e2e/at-matrix/retired/` with a reason. Recorded runs are history, and a
validator that told you to delete them would be telling you to lose the only
record that a component was ever driven with a screen reader.

---

## TASK-OSS-P5-05 — Baselines with variance, then thresholds

### What the old assertion was

```ts
expect(result.average).toBeLessThan(3_000)
```

One wall-clock average against a fixed constant, for a benchmark competing with
429 other test files for CPU. It produced the two flakes the P4-02 and P4-05
handoffs recorded. Raising the constant would have bought silence.

### What the measurement says

35 samples per metric — five separate vitest processes × seven iterations, so
the distribution includes process start-up and whatever else the machine was
doing, which is where the flakes come from.

**33 metrics: 24 with a derived threshold, 9 not yet measurable.** The split is
not even:

| kind | metrics | with a threshold |
|---|---|---|
| `size` — per-export gzip, from a tree-shaken fixture build | 22 | **22** |
| `runtime` — mount and interaction timings | 11 | **2** |

| runtime metric | median | cv | threshold |
|---|---|---|---|
| `DzDataGrid:mount-1000` | 394.56 ms | 0.19 | **613.59** |
| `DzTabs:mount-10` | 33.35 ms | 0.23 | **56.68** |
| `DzTable:mount-1000` | 1779.34 ms | 0.26 | *not yet measurable* |
| `DzListbox:arrow-down-10` | 304.20 ms | 0.36 | *not yet measurable* |
| `DzDataGrid:mount-1` | 9.39 ms | **2.63** | *not yet measurable* |
| `DzDialog:open-close` | 3.36 ms | **2.99** | *not yet measurable* |

**Nine of eleven runtime metrics are not measurable on this host.** That is the
stop condition the task names — *"stop if variance exceeds the signal (report as
'not yet measurable')"* — reached by measurement rather than by assumption, and
it is the direct explanation of the two flakes this task inherited:
`DzDataGrid:mount-100` sits at cv 0.45, and no fixed constant can be right for a
number that moves by half its own value between runs.

The 22 Tier C/D **per-export gzip sizes** are all measurable, because a build is
deterministic: `DzDataGrid` 32.3 kB, `DzTreeSelect` 24.8 kB, `DzTable` 15.4 kB.
Their thresholds come from the 5% floor rather than 3σ of zero.

### The policy

`threshold = median + max(3σ, 5%)`. Ratchets **downward only**, on ≥ 5 runs
whose cv is inside the measurable limit. A slower run does not raise a
threshold — that is an owner decision, which is the reassessment's own rule
(*"a budget increase needs a recorded user benefit and owner; it is not the
default response to regression"*).

Capture is a separate command. A suite that recorded its own baseline every run
would ratchet upward forever and call it a budget.

### The runtime gate is off by default, and that too was measured

The first version of this spec failed the build on a regression. It then failed
three of them, and the failure was correct arithmetic about a component that had
not changed by a byte:

| capture | `DzTable:mount-1000` median | that capture's cv |
|---|---|---|
| first, quiet | **2,392 ms** | 0.17 |
| second, sharing the machine with a Storybook build | **1,344 ms** | 0.17 |
| a bench run minutes later | **3,623 ms** | 0.10 |
| the committed capture | **1,779 ms** | 0.26 |

Three of the four are internally consistent — their cv is inside the measurable
limit — and they disagree by a factor of 2.7. A 3σ threshold derived
from any one of them is wrong about the other two. That is not a threshold to be
tuned: a wall-clock benchmark on a shared developer machine measures the
machine, and no amount of statistics inside one capture can see across captures.

So runtime metrics **report always and fail only under `DZUP_PERF_GATE=1`** —
the flag a dedicated perf job sets, which is the reassessment's "declared
hardware/browser profile" made concrete. The 22 **size** baselines gate
unconditionally, because a gzipped byte count is deterministic and does not care
what else the machine is doing.

The two flakes this task inherited are therefore fixed twice over: they are no
longer single-sample assertions, and the class of number they belong to no
longer gates a developer's machine at all.

### Focused validation output

```
yarn perf:capture --runs 5   → 33 metrics, 24 with a threshold, 9 not yet measurable
yarn test:perf               → ✓ 11 tests
vitest .../perf/statistics.spec → ✓ 19 tests
```

---

## TASK-OSS-P5-06 — The capability matrix

### Implemented files

`packages/tooling/src/quality/capability-matrix.ts` (the shape),
`generate-capability-matrix.ts` (the join), `emit-capability-data.ts` (the
Storybook projection), `packages/tooling/src/validators/capability-matrix.ts`,
`apps/storybook/stories/_blocks/CapabilityMatrix.ts`,
`apps/storybook/stories/Capability-Matrix.mdx`, and 10 specs.

**144 components · 1,661 evidence cells.**

| tier | pass | present | stale | unrun | excepted |
|---|---|---|---|---|---|
| A | 106 | 158 | 0 | 81 | 4 |
| B | 279 | 253 | 0 | 376 | 9 |
| C | 121 | 81 | 0 | 172 | 0 |
| D | 8 | 10 | 0 | 1 | 2 |

**There is no percentage on the page and none in this table.** One number over
cells of different weight is satisfied equally by closing four badge cells and
by closing one combobox cell, and it hides which. The honest headline is the
`unrun` column.

### `present` is not `pass`, and the distinction is the point

A spec file on disk is `present`. The same spec with a recorded passing result
is `pass`. Collapsing them would let a skipped test read as evidence, which is
how a matrix comes to say a component is qualified when nothing ran.

`scope` carries the same weight in the other direction: `validate:tokens` proves
every colour pair in the repository and is real evidence, and it is not
per-component. It is marked `corpus`, so a repository gate cannot stand in for
144 component checks.

### An absent input is not a failing component

A whole column of `unrun` means one of two very different things. Before the
browser lane was run into a JSON report, 443 Tier B cells read `unrun`; after,
376. Nothing about any component changed. The `inputs` panel records which
artifacts existed, and the page prints it above the table.

### The Tier D gate, and what it made happen

`validate:capability-matrix` fails on an unexplained `unrun` cell for a Tier D
component. On its first run it produced eleven, all on `DzFileUpload`, and
closing them found two defects:

> **`accept` was not enforced on the drop path.** `:accept` on
> `<input type="file">` filters the operating system's picker and does **nothing
> at all** to a drop — `DataTransfer.files` arrives unfiltered. A component
> rendering the words *"Accepted: image/\*"* directly under its drop zone would
> take a dropped `.exe` into `v-model` and emit `upload`, with no `error` event
> and nothing on screen to suggest anything had been skipped. `multiple: false`
> had the same hole: a drop of nine files into a single-file control put nine
> files in the model.

Both are fixed in `processFiles`, where the picker and the drop zone meet, and
asserted by a 17-case hostile-input corpus. The threat model beside it records
what remains true and cannot be fixed client-side: `File.type` is a browser
guess and is often empty, so `accept` is a **filename check** much of the time,
and a server must revalidate and scan regardless.

`url-policy` and `csp-fixture` are recorded as **exceptions** — the component
accepts no URL and has no HTML sink — and the corpus asserts the premise of
each, so an exception cannot outlive the fact it rests on.

### "Unexplained" had to be made checkable

The gate's first version failed on any `unrun` cell, including `at-manual`,
where the AT task file exists with six pairs waiting for a human. That is a
*scheduled* gap, not an absent one. Accepting a `note` as the explanation would
have made the gate unfailable — the generator writes a note on nearly every
unrun cell so the page reads well. The rule is therefore **artifacts**: an
`unrun` cell with a file behind it is explained; one with nothing is not.

### Focused validation output

```
yarn generate:capability-matrix  → 144 components, 1,661 cells
yarn validate:capability-matrix  → ✓ fresh, and no Tier D cell is unexplained
vitest .../capability-matrix.spec → ✓ 10 tests
vitest .../security/DzFileUpload.malicious-corpus.spec → ✓ 17 tests
```

---

## Packet P5 — aggregate qualification

```
yarn lint                     → ✓ 0 errors, 0 warnings (packages/ apps/)
yarn typecheck                → ✓ 0 errors
tsc -p packages/contracts     → ✓ 0 errors
yarn storybook:build          → ✓ 23.50 MB within budget 25 MB; guides-capability-matrix--docs built
yarn validate:all             → EXIT 0 — 24 gates, now including validate:quality-tiers,
                                validate:story-dod-tiers, validate:at-matrix and
                                validate:capability-matrix
vitest run                    → EXIT 0 — 438 files, 7,763 passed, 2 skipped, 1 todo
```

**Three specs failed on the first full run, and all three were correct.**

- `anatomy-source.spec.ts` asserted `DzButton` is Tier `A`. It is Tier `B` now,
  because the scale was inverted. The assertion was updated with the reason
  beside it rather than the number swapped.
- `ownership-manifest.spec.ts` asserted the anatomy ceiling is 137. Adding
  `DzFileUpload.anatomy.ts` made it 136, and the ceiling ratchets **down** — so
  the ceiling was lowered in the same change, which is the rule that file states
  about itself.
- `perf-bench.spec.ts` reported three regressions. See the runtime-gate section
  above: the arithmetic was right and the conclusion was wrong, which is what
  moved the runtime gate behind `DZUP_PERF_GATE`.

`packages/core/docs/rtl-matrix.md` also went stale, because `DzFileUpload` now
declares an RTL contract and the matrix is generated from the declarations.
Regenerated.

### Not done

**Firefox and WebKit.** Twelve of the eighteen matrix projects are configured
and unrun. Measured capable; not measured against.

**Every AT cell.** 534 of 534 unrun. The matrix, the tasks, the format and the
freshness rule exist; no screen reader was driven.

**The 51 story items.** Triaged, ceilinged and assigned; not authored.

**`e2e/` is outside `yarn lint`.** The repo lints `packages/ apps/`. The new
`e2e/matrix` files are clean, checked separately — but `e2e/smoke/storybook.spec.ts`
and `e2e/utils/storybook.ts` carry ten pre-existing violations that nothing runs
against them. Left alone; not this packet's to change.

### Unresolved owner decisions

1. **28 components fail WCAG 2.5.8 Target Size.** `DzCheckbox` and `DzRadio` at
   18×18, seven controls at 16×16, `DzTagsInput` at 14×14. The fix is an
   enlarged hit area that does not grow the visual, which is a per-family design
   decision rather than a patch.
2. **18 components fail WCAG 1.4.10 Reflow at 320px.** Some are the component
   and some are a story with a fixed width. Both need triage; the ledger records
   the measured overflow so triage has a number to start from.
3. **`DzFileUpload`'s `accept` enforcement is a behaviour change.** An
   application relying on the old drop path will start receiving `error` events
   it previously did not. Recorded in the changeset as a minor.
4. **Should `validate:capability-matrix` widen past Tier D?** Today one
   component is gated. Tier C is where most of the `unrun` lives.
5. **The Tier D ladder pulls in rows a boundary does not need.** `DzFileUpload`
   excepts `url-policy` and `csp-fixture` with good reasons, and any second Tier
   D component will except the same two or a different two. Worth deciding
   whether D should be the boundary rows alone, with tier and boundary fully
   orthogonal.

### Ranked next packet

1. **Run the browser matrix on Firefox and WebKit.** Everything is in place, it
   is one command per engine, and it is the difference between "three-engine
   lane" as a configuration and as a claim. Expect the ledger to shrink or to
   split by engine; both are information.
2. **The 2.5.8 target-size sweep.** 28 components, one systemic cause, and a
   ratchet already holding the line.
3. **TASK-OSS-P5-02's 51 story items.** Bounded, assigned per component, and the
   ceiling makes progress permanent.
4. **FORM-OSS** (`form-controls-readiness-tasks.md`) — the packet P5 gates, now
   that the controls it depends on have tiers and a capability row each.
