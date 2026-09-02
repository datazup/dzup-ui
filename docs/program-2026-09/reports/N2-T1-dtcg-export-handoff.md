# TASK-N2-T1 — DTCG 2025.10 token export + round-trip gate

> Handoff for [`consumer-agent-surface-tasks.md` → TASK-N2-T1](../consumer-agent-surface-tasks.md).
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-09-01 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD:** `51dec93c73214af2d1e424e3454a7122691fea48` (`51dec93 new version for themes`)
> **Worktree at run start:** **dirty — 128 entries** (the uncommitted N1 evidence
> program). **At run end: 136.** Nothing was reverted, stashed, cleaned or
> committed. Exactly **11 paths** were touched by this task (§1); of those, two —
> `package.json` and `packages/tooling/src/resolution/dzup-resolution.spec.ts` —
> were **already dirty** from the N1 program and were edited additively (the
> `git diff` on the spec shows one added line from me). Everything else under
> `packages/tooling/src/quality/`, `packages/core/src/`, `apps/` and
> `packages/tokens/src/component/control.ts` is N1's and was not read for edit.
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`. `yarn <script>` resolves normally
> here (the `dzup-ui-pro` exit-127 defect does not reproduce). No gate result was
> read through a pipe; every exit code was captured bare.
>
> **Evidence class: `locally qualified, worktree-dirty`.** Not CI, not release, not
> production. Every number below is bound to `51dec93` **plus** the uncommitted N1
> working tree, because the token maps themselves carry one uncommitted change
> (`packages/tokens/src/component/control.ts`, N1-O3's `--dz-control-target-min`)
> that the export reads. A clean-checkout regeneration would differ by that token.
>
> **Nothing is committed, pushed, dispatched to CI, or published.**

---

## 1. What was built

| # | File | Status | API effect |
|---|---|---|---|
| F1 | `packages/tokens/src/dtcg.ts` | **new**, 1,240 lines | Pure projection module. Exports `buildDtcgDocument`, `serializeDtcgDocument`, eight value parsers, and the declared tier/type tables. No I/O, no new dependency. |
| F2 | `packages/tokens/src/generate-dtcg.ts` | **new** | CLI emitter → `packages/tokens/dist/tokens.dtcg.json`. |
| F3 | `packages/tokens/src/dtcg.spec.ts` | **new**, 28 tests | Parser + document invariants. |
| F4 | `packages/tooling/src/token-checks/dtcg-round-trip.ts` | **new**, 1,123 lines | The gate. Independent DTCG reader, independent CSS parser + cascade model, independent value parsers. |
| F5 | `packages/tooling/src/token-checks/dtcg-round-trip.spec.ts` | **new**, 14 tests | Gate machinery + an end-to-end assertion over the real package. |
| F6 | `packages/tokens/TOKENS.md` | **new** | The ABI ⇄ interchange contract, `$type` mapping, untyped list, consumption recipes. |
| F7 | `packages/tokens/README.md` | modified | ABI pointer to TOKENS.md; **two broken code samples fixed** (see F-4). |
| F8 | `package.json` | modified | `generate:tokens:dtcg`, `validate:tokens:dtcg` (+ `//` doc keys); `validate:tokens:dtcg` appended to `validate:all`. |
| F9 | `packages/tokens/package.json` | modified | New export `"./dtcg": "./dist/tokens.dtcg.json"`; `generate:dtcg` script; `build` now also emits the DTCG file. |
| F10 | `packages/tooling/src/resolution/dzup-resolution.spec.ts` | modified — **one line** | The public-API specifier snapshot, updated to include `@dzup-ui/tokens/dtcg`. Required by the new export; see §6b. |

**Public API effect on `@dzup-ui/tokens`:** one **additive** export subpath,
`@dzup-ui/tokens/dtcg`. No existing export changed. No token was renamed. No
runtime dependency was added to the package (it still has none).

**Not touched:** `packages/tokens/src/generate.ts`, every token map except the
pre-existing N1 edit, `dist/tokens.css`, `DESIGN.md`.

### Discovery decision: own emitter, not Style Dictionary / Terrazzo

Recorded as `<discovery>` step 3 required, **before** the emitter was written:

- `@dzup-ui/tokens` sits at the root of the dependency order with **zero deps**.
  Style Dictionary v5 and Terrazzo are *consumers* of DTCG, not producers of it
  from arbitrary TypeScript maps — adopting either would mean hand-authoring the
  DTCG first, which is the artifact being generated. That inverts the problem.
- The projection is ~600 lines of pure functions over records the repo already
  owns. There is no external semantics to import.
- Terrazzo's `@terrazzo/parser` would have been a credible "independent DTCG
  parser" for the gate, but installing it mutates `yarn.lock` — not authorised —
  and would put a build dependency behind a mandatory gate. A minimal
  spec-conformant reader was written instead (the task's stated alternative).

**Stop condition "adopting a build tool would add a runtime dependency" did not
fire, because no build tool was adopted.**

---

## 2. Spec grounding — what was verified against the live spec

The DTCG spec **was** reachable from this session; nothing below is from memory.

| Source | Fetched | Used for |
|---|---|---|
| `https://www.designtokens.org/TR/drafts/format/` | ✅ | `$type`/`$value`/`$description`, alias syntax, group nesting + `$type` inheritance, `$extensions` reverse-DNS rule, name character rules, media type |
| `https://www.designtokens.org/TR/drafts/color/` | ✅ | colour-space list, oklch component order + ranges, `alpha`/`hex` rules |
| `https://www.designtokens.org/technical-reports/` | ✅ | **2025.10 is Stable, published 2025-10-28.** Only Format editions are listed — **no Resolver / modes / themes module exists there.** |
| `https://www.designtokens.org/schemas/2025.10/format.json` | ✅ (56,523 bytes) | The official JSON Schema, used for the out-of-band validation in §5 |

One ecosystem observation, not a repo defect: the schema's 18 sub-schema URLs
(`.../format/token.json`, `.../values/color.json`, …) **all return HTTP 404**.
The published `format.json` is self-contained — it bundles every sub-schema under
`definitions` with its own `$id` — so validation works, but a tool that follows
`$ref` over the network fails. Recorded because it affects any consumer who
tries to validate our export the naive way.

### Frozen `$type` mapping (written before the emitter, per `<steps>` 1)

| dzup-ui family | Count | `$type` | Notes |
|---|---|---|---|
| `--dz-colors-{palette}-{shade}` | 297 | `color` | `colorSpace: "oklch"`, `components: [L,C,H]` |
| semantic colours (light + dark) | 230 | `color` | declared for the whole tier, then asserted |
| `--dz-spacing-*` | 34 | `dimension` | px / rem |
| `--dz-text-*` | 13 | `dimension` | rem |
| `--dz-radius-*` | 8 | `dimension` | `none` ships bare `0` → `0px` |
| `--dz-breakpoint-*` | 5 | `dimension` | px |
| `--dz-font-{sans,mono}` | 2 | `fontFamily` | array of names |
| `--dz-font-{thin…black}` | 9 | `fontWeight` | numeric 100–900 |
| `--dz-leading-*` | 6 | `number` | spec names unitless line height as a `number` use |
| `--dz-z-*` | 9 | `number` | |
| `--dz-shadow-*` (light + dark) | 14 | `shadow` | multi-layer → array; `inner` → `inset: true` |
| `--dz-duration-*` | 4 | `duration` | ms |
| `--dz-ease-*` | 5 | `cubicBezier` | y may overshoot; x bounded to [0,1] |
| component literals | 47 | by declared name rule | `COMPONENT_TYPE_RULES` |
| pure `var()` aliases | 319 | inherited from target | emitted as `{group.token}` |

**`$type` is never inferred from a value.** The Format module says tools "MUST
NOT attempt to guess the type of a token by inspecting the contents of its
value". Primitive groups declare their type; the semantic tier is declared
`color` and asserted; component **literals** are typed by a declared *name* rule
table; aliases inherit their target's type exactly. When a declared type and the
actual value disagree, the token is **reported as untyped** — never retyped to
fit, and never silently dropped.

### The 26 tokens DTCG cannot express

Emitted under `$extensions["com.dzup"].untyped`, keyed by the path they would
have had, each with its exact CSS value and a reason. They are **not** emitted as
tokens: a token whose `$type` cannot be resolved is invalid per the spec, and a
typeless token would be a worse lie than an honest omission.

| Group | Count | Reason |
|---|---|---|
| `--dz-tracking-*` (6) + `--dz-sidebar-section-title-letter-spacing` | 7 | `em`; `dimension` allows only px/rem and `em` is font-size-relative — no lossless conversion |
| `--dz-transition-*` (3) + 7 component `*-transition` | 10 | CSS shorthand fragments / property lists; DTCG `transition` models one property's duration+delay+timingFunction |
| `--dz-shadow-none` (primitive + `semantic.dark`) | 2 | the `none` keyword |
| `--dz-page-hero-{bg,overlay,title-gradient}` | 3 | multi-layer gradients with `var()` fallbacks into brand-preset properties this package does not define |
| `--dz-page-hero-{title-size,padding}` | 2 | `clamp()` |
| `--dz-dialog-full-max-width` | 1 | `100vw` |
| `--dz-sidebar-section-title-text-transform` | 1 | a CSS keyword; the spec has no keyword/string type |

All 26 are still **covered by the round-trip gate** — their recorded CSS value is
checked against the stylesheet like every typed token.

### Theme axis — decided, not deferred

The Format module has no modes. The two themes are emitted as sibling groups
`semantic.light` (115) and `semantic.dark` (123 = 115 semantic + the 8
`--dz-shadow-*` the dark block overrides), mirroring the two CSS declaration
blocks one-for-one. This is **in scope for v1 and shipped**, not deferred —
so the stop condition "theme-recipe axes cannot be represented and the v1 scope
decision needs an owner" did not fire for the light/dark axis.

`ThemeRecipeV1`'s other axes (palette hue/chroma, radius, shadow, density, font,
direction, motion) are **explicitly out of scope for v1** and are an owner
decision — see **D3**. They are a *runtime recipe* that regenerates token values,
not a token set; DTCG has no vocabulary for a parameterised generator.

**No colour carries a `hex` fallback.** Deriving one from OKLCH needs a
gamut-mapping choice (naive clipping vs CSS Color 4 gamut mapping) that would
ship a colour different from what the browser renders for out-of-sRGB values.
Recorded as **D4** rather than guessed.

---

## 3. The artifact

```
packages/tokens/dist/tokens.dtcg.json     292,239 bytes
```

| Measure | Value |
|---|---|
| Total tokens planned | **800** |
| Emitted as typed DTCG tokens | **774** |
| Recorded as untyped (with reason) | **26** |
| Aliases preserved as `{group.token}` | **319** |
| `$type` census | `color` 562 · `dimension` 145 · `shadow` 17 · `fontWeight` 13 · `number` 23 · `fontFamily` 5 · `cubicBezier` 5 · `duration` 4 |
| Distinct `--dz-*` names in `tokens.css` | **674** (409 primitive + 115 semantic + 153 component − 3 cross-tier collisions) |
| Component tokens flagged `themeVarying` | **29** |

`dist/` is git-ignored repo-wide (`.gitignore:9 dist/`) and **no `dist/` file is
tracked anywhere** (`git ls-files | grep -c '/dist/'` → 0). So the "committed
copy if other generated artifacts are committed" clause of `<emit>` resolves to
**no committed copy** — that is the repo's existing convention, and ADR-12's
"committed dist artifacts" is not what this repository actually does. Freshness
is instead proven by regeneration + diff inside the gate, the same discipline
`design-md-check.ts` uses for DESIGN.md.

---

## 4. Focused validation output

Narrowest owning command first, as `<validation>` requires. Every exit code
captured bare — never through a pipe.

### 4a. Determinism — measured, not asserted

Two **cold** runs (output deleted between them), SHA-256 of the emitted file:

```
$ rm -f packages/tokens/dist/tokens.dtcg.json && yarn generate:tokens:dtcg   # EXIT 0
e559034943233d2b764d24564ccfe36d9279e21d4823c08dbf45590c23d73347

$ rm -f packages/tokens/dist/tokens.dtcg.json && yarn generate:tokens:dtcg   # EXIT 0
e559034943233d2b764d24564ccfe36d9279e21d4823c08dbf45590c23d73347

$ cmp → BYTE-IDENTICAL   (292,239 bytes)
```

The digest is also unchanged across an unrelated lint-fix pass over the emitter
source, which is a second, incidental confirmation that the output depends only
on the token maps. No timestamp, no commit stamp, no host path appears in the
file (asserted by a spec test: the serialisation is matched against
`/\d{4}-\d{2}-\d{2}T/`).

**On binding constraint B1 (`sourceCommit` off-by-one):** *not applicable by
construction.* This artifact deliberately carries **no commit stamp at all**.
Stamping one would inherit the same defect and would make the file churn on every
commit for no informational gain, since `dist/` is regenerated everywhere and
never committed. Freshness is instead content-addressed: `validate:tokens:dtcg`
rebuilds the document in memory and fails if the file on disk differs. The
commit binding lives in *this handoff*, where `<evidence_rules>` requires it.

### 4b. Zero CSS output change — hard requirement

`dist/tokens.css` SHA-256, captured **before any file was created** and again
after all work, and once more after **re-running the CSS generator itself**:

| Point | `dist/tokens.css` SHA-256 | `DESIGN.md` SHA-256 |
|---|---|---|
| Before any work (task start) | `cdb570b9b797a76bd0e7b099aea69c8031582caf5bb1e22d41766d5477e4ddfd` | — |
| After all work | `cdb570b9…5477e4ddfd` *(identical)* | `096c03d3…2a930a1f8` |
| After `yarn tokens:generate` re-run (EXIT 0) | `cdb570b9…5477e4ddfd` *(identical)* | `096c03d3…2a930a1f8` *(identical)* |

The third row is the strong form: the CSS generator was **executed** and produced
a byte-identical stylesheet and a byte-identical `DESIGN.md`. `generate.ts` and
every token map are untouched by this task (`git status` confirms the only token
source change is the pre-existing N1 edit to `component/control.ts`).

Sibling artifacts, also unchanged: `dist/tokens.d.ts`
`ded03b8a…cca3a6828`, `dist/tailwind-theme.js` `ad4665d1…7294151b07`.

### 4c. Third-party spec validation

The emitted file was validated against the **official published DTCG 2025.10
JSON Schema** (`https://www.designtokens.org/schemas/2025.10/format.json`,
56,523 bytes, fetched this session) using **ajv 8.18.0** resolved from the
repo's own `node_modules`:

```
ajv version: 8.18.0
SCHEMA VALID: true
```

**Scope, stated honestly:** this is a **one-off, out-of-band** check run from a
scratch script — it is **not** wired into any gate. ajv is a *transitive*
dependency here, not a declared one, and adding a declared dependency plus a
vendored schema copy to a mandatory gate was out of scope and unauthorised
(`yarn.lock` mutation). What *is* gated in perpetuity is the round-trip in §4d,
which is the stronger property: schema-validity says the JSON is well-formed
DTCG, the round-trip says it describes *this* design system. Wiring the schema
check in is **D5**.

### 4d. The round-trip gate — green

```
$ yarn validate:tokens:dtcg                                        # EXIT 0
DTCG round-trip passed — 774 typed tokens + 26 untyped, 319 aliases preserved;
649 light and 649 dark values matched against 674/674 declared custom properties
  CSS read from:  dist/tokens.css
  DTCG read from: dist/tokens.dtcg.json
  cross-tier shadowing: 3 at ceiling (--dz-appshell-header-bg,
  --dz-appshell-header-border, --dz-appshell-main-bg) — reported, not failed
```

674 = every distinct `--dz-*` custom property the stylesheet declares. 649
compared as typed values per cascade; the remaining 25 names in each cascade are
the untyped set, whose declared CSS values are checked separately. **Coverage is
total: no custom property is unaccounted for on either side.**

Eleven checks run, each failing by named symbol:
`freshness` · `css-reconstruction` · `dark-parity` · `tier-shadowing` ·
`path-mapping` · `alias-preservation` · `coverage` · `untyped-value` · `value` ·
`theme-varying` · `declared-value` · `deprecation`.

### 4e. **Proof the gate fails** — three seeded mismatches + two harness paths

A gate never observed failing is not a gate. Each seed was applied to
`packages/tokens/src/dtcg.ts`, the export regenerated, the gate run with its exit
code captured bare, then the emitter restored from a pristine copy.

Pristine emitter SHA-256 before seeding: `b5e99682…a1a25ebd0c`
Pristine export SHA-256 before seeding: `e5590349…c23d73347`

**Seed A — value drift.** Prepended to `parseOklchColor`:

```ts
if (value === 'oklch(0.550 0.2200 260.0)') {
  return { ok: true, value: { colorSpace: 'oklch', components: [0.55, 0.22, 261] } }
}
```

```
EXIT 1 — DTCG round-trip FAILED — 11 issue(s)

  [value] 11
    --dz-colors-primary-500: light: export resolves to {"colorSpace":"oklch",
      "components":[0.55,0.22,261]} but tokens.css resolves to {"colorSpace":"oklch",
      "components":[0.55,0.22,260]} (from "oklch(0.550 0.2200 260.0)")
    --dz-ring: light: … --dz-primary: … --dz-primary-solid: …
    --dz-input-border-focus: … --dz-chart-1: … --dz-button-focus-ring-color: …
    --dz-control-focus-ring-color: … --dz-input-focus-ring-color: …
    --dz-sidebar-item-active-bg: …          (+ the dark cascade)
```

One corrupted primitive surfaced as **11 named failures across both cascades** —
which also demonstrates that alias resolution genuinely traverses the graph
rather than comparing pre-baked strings.

**Seed B — dropped token.** Inserted in `planPrimitiveTokens`:
`if (cssVariable === '--dz-radius-lg') continue`

```
EXIT 1 — DTCG round-trip FAILED — 2 issue(s)

  [coverage] 2
    --dz-radius-lg: declared in tokens.css (light) but absent from the DTCG export
      and from $extensions["com.dzup"].untyped
    --dz-radius-lg: declared in tokens.css (dark) but absent from the DTCG export
      and from $extensions["com.dzup"].untyped
```

**Seed C — alias inlined instead of preserved.** In the alias branch, emit the
resolved value for `--dz-primary` instead of `{primitive.color.primary.500}`:

```
EXIT 1 — DTCG round-trip FAILED — 2 issue(s)

  [alias-preservation] 2
    --dz-primary: CSS declares "var(--dz-colors-primary-500)" but the export inlined
      a resolved value instead of a {group.token} reference
    --dz-primary: CSS declares "var(--dz-colors-primary-400)" but the export inlined
      a resolved value instead of a {group.token} reference
```

**Path D — stale on-disk artifact.** `"version": "0.2.0"` → `"0.9.9"` in
`dist/tokens.dtcg.json` only:

```
EXIT 1 — [freshness] 1
    dist/tokens.dtcg.json: the committed export differs from a fresh build of the
      same token maps — run `yarn generate:tokens:dtcg`
```

**Path E — clean checkout (no `dist/`).** Both artifacts moved aside:

```
EXIT 0
note: dist/tokens.dtcg.json is absent (dist/ is git-ignored); the round-trip ran
      against a fresh in-memory build.
note: dist/tokens.css is absent (…CI runs validate:all before build); the
      declaration blocks were reconstructed from the token maps…
DTCG round-trip passed — … 649 light and 649 dark values matched against 674/674
  CSS read from:  token maps (dist not built)
  DTCG read from: rebuilt in memory (dist not built)
```

This path matters: CI's runtime-floor job runs `yarn validate:all` on a **clean
checkout before `yarn build`**, so a gate that only read `dist/` would be a no-op
in that job. It reports its input source rather than passing silently.

**Restoration verified byte-for-byte:**

```
packages/tokens/src/dtcg.ts        b5e99682…a1a25ebd0c   (matches pristine)
packages/tokens/dist/tokens.dtcg.json  e5590349…c23d73347   (matches pristine)
yarn validate:tokens:dtcg → EXIT 0
```

No seed residue remains (`grep -rn "SEED-A\|SEED-B\|SEED-C\|TEMPORARY"` over all
three new source files → no matches).

### 4f. Focused tests

```
$ npx vitest run packages/tokens/src/dtcg.spec.ts \
                 packages/tooling/src/token-checks/dtcg-round-trip.spec.ts   # EXIT 0
Test Files  2 passed (2)
     Tests  42 passed (42)
```

`$ npx eslint <the 5 new files> --max-warnings 0` → **EXIT 0**.

---

## 5. Findings — defects no gate in this repo could previously see

Reported separately from the work, as required. Four are new; all four are
**pre-existing** in the repository, none were introduced by this task.

### F-1 · `--dz-appshell-header-border` ships a colour the semantic tier does not declare 🔴

Three names are declared in **two unconditional tier blocks** of the same
stylesheet, and the later one silently wins:

| Name | Semantic tier says | Component tier says | What actually ships (light) |
|---|---|---|---|
| `--dz-appshell-header-bg` | `oklch(1 0 0)` | `var(--dz-surface)` | same value, by luck |
| **`--dz-appshell-header-border`** | `var(--dz-colors-neutral-200)` | `var(--dz-border)` | **`neutral-300`** — the semantic declaration is dead |
| `--dz-appshell-main-bg` | `var(--dz-colors-neutral-100)` | `var(--dz-background)` | same value, by luck |

Mechanism: `generate.ts` writes the light semantics into
`:root, [data-theme="light"]` and then writes the component tier into a **second
`:root` block later in the same `@layer`**. Both are specificity (0,1,0), so
source order decides and the component block wins. `semantic/light.ts` lines
210–212 are dead code, and one of the three changes a shipped colour.

No existing gate can see this: `validate:tokens` lints for raw colour literals
and checks DESIGN.md contrast pairs; nothing reads the emitted stylesheet as a
cascade. **The new gate holds an exact-set ceiling of these three by name** — a
fourth fails the build; removing one prints "ceiling can be lowered".

### F-2 · The component tier out-cascades the dark theme, and OS-dark disagrees with explicit-dark 🟠

The same shadowing has a second, subtler consequence. The dark block is
`[data-theme="dark"]` (0,1,0) — the component `:root` block comes **after** it,
so for a shadowed name the component tier beats the **dark theme override**. But
the `@media (prefers-color-scheme: dark)` block uses
`:root:not([data-theme="light"])` — specificity **(0,2,0)** — which beats the
component block.

So for any shadowed name, *"user picked dark"* and *"OS is dark, nothing picked"*
resolve through **different cascades**. Today the three collide on values that
happen to agree in dark, so nothing is visible. The day a component-tier appshell
value diverges from its semantic-tier twin, the two dark paths will render
differently and no test will say so. The new gate asserts the two dark blocks
declare identical values (`dark-parity`), which is what currently keeps this
invisible — but it is a latent fault, not a fixed one.

### F-3 · An entire component token tier is dead on both ends — `codeblock` 🔴

Two layers that are supposed to reference each other, and neither is connected
to anything.

**End 1 — the token map is never emitted.**
`packages/tokens/src/component/codeblock.ts` defines **15 component tokens**,
is exported from `component/index.ts` **and** from the package barrel
(`src/index.ts` re-exports `CODEBLOCK_TOKENS`) — but `generate.ts` imports the
other nine component maps and **not this one**. So none of its 15 tokens reach
`dist/tokens.css` or `dist/tokens.d.ts`. The 6 `--dz-codeblock-*` names that do
appear in the stylesheet come from the *semantic* tier, not from here.

**End 2 — the component's anatomy file is imported by nothing.**
`packages/core/src/components/data/DzCodeBlock.tokens.ts` maps **14** custom
properties. `grep -r codeBlockTokens packages/core/src` returns **one** hit — its
own declaration. `grep -r "dz-codeblock" packages/core/src` returns **one** file
— the same one. No `.vue`, no `.variants.ts`, nothing imports it.

**Of the 14 names it declares, 9 exist nowhere in the shipped CSS:**

```
--dz-codeblock-radius             --dz-codeblock-font-family
--dz-codeblock-font-size          --dz-codeblock-line-height
--dz-codeblock-header-padding-x   --dz-codeblock-header-padding-y
--dz-codeblock-header-font-size   --dz-codeblock-line-number-color
--dz-codeblock-line-number-width
```

**And where both tiers name the same token they disagree:** `codeblock.ts` says
`--dz-codeblock-bg: var(--dz-surface-raised)`; the semantic tier says
`var(--dz-colors-neutral-900)` — a light/dark inversion. `codeblock.ts` also
declares `--dz-codeblock-header-color`, which nothing reads (the component reads
`--dz-codeblock-header-text`, which only the semantic tier provides).

**Runtime impact today: none**, precisely because end 2 is also dead — nothing
renders these variables. The cost is a false claim: ADR-19's "reachable component
tokens" layer is advertised for `DzCodeBlock` and does not exist, and the token
package exports a public `CODEBLOCK_TOKENS` whose values are not the ones the
system ships. Whoever wires `DzCodeBlock` up next will inherit 9 unresolvable
`var()`s and a contradictory background.

**The round-trip gate deliberately does not fail on this**, and that is a scope
limit worth stating plainly: this gate proves *the export matches the CSS*, not
*that every token map reaches the CSS*. A map excluded from both sides is
invisible to it. Closing that hole is **D2**.

### F-4 · `packages/tokens/README.md` documented two exports that do not exist 🟠

Both would fail immediately on copy-paste:

| README said | Reality |
|---|---|
| `import { dzupTheme } from '@dzup-ui/tokens/tailwind'` | the export is **`dzTokens`** |
| `import { tokens } from '@dzup-ui/tokens'` — `tokens.colors.primary[500]` | **no `tokens` export exists**; ADR-09 explicitly refuses a `getToken()` accessor |

`validate:doc-snippets` only checks snippets marked with a fixture comment, and
neither was. **Fixed** in this task (F7) to `dzTokens` and to the real
`palettes` / `SPACING_SCALE` exports, with a note that `var()` is the intended
runtime path. The class of defect — unfixtured install/usage snippets in package
READMEs — is unguarded repo-wide; that is **D6**.

### F-5 · Ecosystem note: the published DTCG sub-schemas 404

Not a repo defect, but it will bite any consumer who tries to validate our
export: all 18 sub-schema URLs referenced by `format.json` return **HTTP 404**.
`format.json` is self-contained (every sub-schema is inlined under `definitions`
with its own `$id`), so a validator that resolves `$id` locally succeeds and one
that fetches `$ref` over the network fails. Documented so nobody re-derives it.

---

## 6. Aggregate qualification

### 6a. `yarn validate:all` — **EXIT 0**, all 29 links

Run bare, exit code captured without a pipe. Tooling failures and component
failures reported separately, as `<validation>` requires: **0 tooling failures,
0 component failures**. No generator crashed; no validator errored.

| # | Link | Result |
|---|---|---|
| 1 | `typecheck` | PASS (vue-tsc, 0 errors) |
| 2 | `lint` | PASS (`--max-warnings 0`) |
| 3 | `validate:boundaries` | PASS — 0 violations |
| 4 | `validate:interaction-contract` | PASS — 0 violations |
| 5 | `validate:contract-parity` | PASS |
| 6 | `validate:hardcoded-strings` | PASS |
| 7 | `validate:rtl` | PASS |
| 8 | `validate:form-readiness` | PASS — 44 controls · 238 pass · 6 gap · 5 future · 54 unrun · 93 n/a |
| 9 | `validate:quality-tiers` | PASS — 144/144 tiered (A55 B67 C21 D1) |
| 10 | `validate:story-status` | PASS |
| 11 | `validate:story-dod` | PASS — 314 advisory items reported |
| 12 | `validate:story-dod-tiers` | PASS — no tier-required category above ceiling |
| 13 | `validate:at-matrix` | PASS |
| 14 | `validate:capability-matrix` | PASS — fresh, no Tier D cell unexplained |
| 15 | `validate:visual-baselines` | PASS |
| 16 | `validate:tokens` | PASS — 0 raw literals · DESIGN.md fresh, 97 refs, 96 contrast pairs ≥ AA · no intent-text-on-intent-muted |
| **17** | **`validate:tokens:dtcg`** ← **new** | **PASS — 774 typed + 26 untyped, 319 aliases preserved; 649 light and 649 dark values matched against 674/674 declared custom properties** |
| 18 | `validate:exports` | PASS — 0 errors |
| 19 | `validate:ownership` | PASS — 1,327 entries fresh; 29/29 unclassified; 136/136 without anatomy |
| 20 | `validate:package-names` | PASS |
| 21 | `validate:doc-snippets` | PASS — 19 fixture-backed snippets |
| 22 | `validate:engines` | PASS |
| 23 | `validate:adr-references` | PASS — 17 cited · 3 documented · 14 registry-only (ceiling 14) |
| 24 | `validate:readme-facts` | PASS — 3 generated regions |
| 25 | `validate:externals` | PASS — 8 passed, 0 failed, 1 skipped |
| 26 | `validate:dts` | PASS — 0 errors |
| 27 | `validate:changelog` | PASS |
| 28 | `validate:peers` | PASS — 7 compatible |
| 29 | `validate:licenses` | PASS — 9 allowed, 0 blocked, 0 unknown |

`validate:exports` now also resolves the new `./dtcg` export target
(link 18 above), and `validate:dts` is unaffected — a `.json` target is not a
`.js` file needing a `.d.ts`.

**One self-inflicted failure, found and fixed inside this run:** the first
`validate:all` attempt failed at link 2 with
`packages/tokens/TOKENS.md 86:10 error Parsing error: Unexpected token ':'`.
ESLint's markdown processor lints fenced code blocks, and the `json` fence in
TOKENS.md held a **fragment** (a bare `"primary": { … }` pair) rather than a
document. Fixed by making the sample a complete JSON object. Worth recording as
a repo gotcha: a `json` fence in any markdown file must parse standalone.

### 6b. `yarn test` — red, with the two known pre-existing failures

```
Test Files  2 failed | 479 passed (481)
     Tests  2 failed | 8584 passed | 2 skipped | 1 todo (8589)
TEST_EXIT=1
```

Both failures are the **exact two** named as pre-existing in this task's binding
constraints. Neither is mine; neither was touched.

| Failure | Message | Why it is not mine |
|---|---|---|
| `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts > every fallback matches the value its token resolves to` | `expected [ …(6) ] to deeply equal []` — six hard-coded hex fallbacks in `apps/landing` disagree with their tokens, e.g. `ThemesPage.vue:834 var(--dz-secondary, #0766ee) should be #7260bd` | Lives entirely in `apps/landing` source. I changed no landing file, no token value, and no fallback. `dist/tokens.css` is byte-identical to task start (§4b), so the token side of every one of those six comparisons is unchanged. |
| `packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver` | `TypeError: Cannot read properties of undefined (reading 'component')` at `summary.items.find(i => i.required)!` | The fixture assumes at least one tier-*required* item exists; `validate:story-dod-tiers` now reports **0 tier-required, 314 advisory**, so `find` returns `undefined` and the non-null assertion detonates. A consequence of the N1 lane closing the required items, in a file I did not touch. |

#### One failure **was** mine, and I fixed it rather than reclassifying it

The first full run produced **three** failures. The third was
`packages/tooling/src/resolution/dzup-resolution.spec.ts > the real repository >
covers exactly the specifiers the packages declare`:

```
Error: Snapshot mismatched
   "@dzup-ui/tokens/css",
+  "@dzup-ui/tokens/dtcg",
   "@dzup-ui/tokens/tailwind",
```

That is the repo's public-API tripwire doing exactly its job: the vitest alias
map is *derived* from every package's `exports`, and snapshotted so a new export
subpath cannot land unnoticed. My additive `"./dtcg"` export is precisely the
case the spec's own comment anticipates — *"When this fails because a legitimate
new export landed, update it in the same change that declared the export."*

**Fix: one line added to the inline snapshot** (`git diff` on that file shows
exactly one line from me; the other added line, `@dzup-ui/testing/security-corpus`,
is pre-existing N1 work). Re-run → 24/24 pass in that file, and the suite returns
to the expected two failures with **+1 passing test** (8,583 → 8,584).

Recording it because the alternative — quietly calling three failures "the known
two" — is the exact failure mode `<evidence_rules>` exists to prevent.

**Not run in this session:** `yarn build`, `yarn storybook:build`, `yarn test:e2e`
and every browser/AT/perf lane. Nothing in this packet renders, and none of those
lanes would exercise it.

### 6c. Maturity level reached

Per `<maturity_levels>`, this packet reaches **`aggregate-qualified (locally)`**
and no further. Specifically:

- `specified` ✅ — the `$type` mapping was frozen before the emitter was written.
- `implemented` ✅ — emitter, gate, scripts, docs.
- `focused-validated` ✅ — 42 focused tests, gate observed failing under three
  seeded mismatches and two harness paths, then restored and re-verified green.
- `aggregate-qualified` ✅ **locally, on a dirty worktree** — `validate:all`
  exit 0 across 29 links.
- `browser/AT-qualified` ❌ — **not applicable and not claimed.** Nothing here
  renders. The export is not exercised by any browser lane.
- `packaged` ❌ — `yarn build` was **not** run in this session. The `./dtcg`
  export target and the extended `build` script are wired but the packaged
  artifact has not been produced or inspected here.
- `released` ❌ — no publication, no changeset. See D7.

---

## 7. Ratchet movements

| Ratchet | Old | New | Direction |
|---|---|---|---|
| `validate:all` chained links | **28** | **29** | ↑ (one new gate added — the count going up is the point) |
| Cross-tier shadowing, exact-set ceiling | *(unmeasured — no gate existed)* | **3**, by name: `--dz-appshell-header-bg`, `--dz-appshell-header-border`, `--dz-appshell-main-bg` | new ratchet, falls only |

**Link-count provenance, stated precisely.** `validate:all` at committed HEAD
`51dec93` has **27** links. The uncommitted N1-O6 work in the working tree had
already added `validate:visual-baselines`, making **28** — which is the baseline
this task was given. Mine makes **29**. Both increments are uncommitted.

**No existing ratchet was moved.** Anatomy non-declaring **136/136**
(unchanged), story-DoD tier-required open **at ceiling** (unchanged), browser
measured failures **46** (untouched — no browser lane ran), unclassified
**29/29** (unchanged), perf thresholds (untouched).

**Not a ratchet, deliberately:** the untyped-token count (**26**). A new token
that DTCG genuinely cannot express is not a regression, so a downward-only
ceiling there would be a lie that pressures the next author into a fake `$type`
— exactly what this export refuses to do. The gate **reports** the set by name
on every run and requires each entry to carry a reason; the reason is the gate,
not the count.

---

## 8. Unresolved owner decisions

| # | Decision | Evidence | Owner call needed |
|---|---|---|---|
| **D1** | **Fix the three cross-tier shadowed `--dz-appshell-*` declarations.** | §5 F-1. `--dz-appshell-header-border` ships `neutral-300` while `semantic/light.ts:211` declares `neutral-200`; the semantic declaration is dead code. The other two agree by coincidence. | Delete the appshell block from `semantic/{light,dark}.ts` (component tier already covers it, but this **changes a shipped border colour** in light mode), or delete the colliding entries from `component/appshell.ts` (keeps the current pixels, loses `var(--dz-border)` indirection). Either way, lower the `SHADOWED_ACROSS_TIERS` ceiling. This is a visible pixel change, so it is not an agent's call. |
| **D2** | **What happens to the `codeblock` tier — wire it, delete it, or gate it?** | §5 F-3. 15 tokens exported and never emitted; a 14-reference anatomy file imported by nothing; 9 unresolvable names; the two tiers disagree on `--dz-codeblock-bg`. | Three real options: (a) import `CODEBLOCK_TOKENS` into `generate.ts` and reconcile the semantic-tier duplicates — **this changes `tokens.css`**, so it is out of this task's authority; (b) delete both dead files; (c) add a gate asserting every map exported from `component/index.ts` is emitted. (c) is cheap and prevents recurrence regardless of (a)/(b), and is ranked below. |
| **D3** | **`ThemeRecipeV1`'s non-mode axes are out of DTCG v1 scope — confirm.** | `theme-recipe.ts` parameterises palette hue/chroma, radius, shadow, density, font, direction, motion, and *regenerates* token values at runtime. DTCG 2025.10 has no vocabulary for a parameterised generator, and no Resolver module exists in the technical-reports index. | Confirm v1 exports the two *concrete* themes only (light/dark, shipped), and that recipe axes stay a runtime contract. If interchange for recipes is wanted, it needs its own format decision — not a DTCG extension bolted on. The light/dark axis itself **is** shipped, so no stop condition fired. |
| **D4** | **No `hex` sRGB fallback on colour tokens — confirm.** | §2. Deriving one from OKLCH requires choosing naive clipping vs CSS Color 4 gamut mapping; for out-of-sRGB values these differ visibly, and a wrong fallback ships silently to any tool that prefers `hex`. | Accept "no fallback" (current), or fund a gamut-mapping implementation in `@dzup-ui/tokens` — note that would be the package's **first** non-trivial colour-science code and `oklch-contrast.ts` lives in `tooling`, on the wrong side of the dependency order. |
| **D5** | **Wire the official DTCG JSON Schema check into the gate.** | §4c: validation passes today, but from a **scratch script** using ajv as an *undeclared transitive* dependency. It is not a gate. | Declare `ajv` + `ajv-formats` in `@dzup-ui/tooling` and vendor `format.json` (the published sub-schema URLs 404 — §5 F-5 — so a network fetch is not an option, and a gate must not depend on the network anyway). Small, and it turns "spec-valid on 2026-09-01" into "spec-valid on every run". |
| **D6** | **Unfixtured code snippets in package READMEs are unguarded repo-wide.** | §5 F-4: two snippets in `packages/tokens/README.md` named exports that do not exist. `validate:doc-snippets` covers only the 19 fixture-marked install snippets. | Either extend `validate:doc-snippets` to type-check every `ts`/`js` fence in `packages/*/README.md` against the real barrels, or accept the gap explicitly. The two found here are fixed; nothing stops the next one. |
| **D7** | **`TOKENS.md` does not ship to npm, and there is no changeset.** | `packages/tokens/package.json` `files: ["LICENSE","dist"]`. npm always includes `README.md`, never `TOKENS.md`. The new `./dtcg` export is an additive public-API change with **no changeset** written. | Add `"TOKENS.md"` to `files` (one string) so the published contract is reachable, and decide whether the additive export warrants a changeset under the still-unwritten 0.x policy (**TASK-N5-01**). Both are packaging/release calls, deliberately not made here. |
| **D8** | **`DEPRECATED_TOKENS` is a hand-maintained table.** | `dtcg.ts` carries two entries lifted from `@deprecated` JSDoc in `component/sidebar.ts`, because a JSDoc comment is not machine-readable. The gate fails if a listed name disappears, so it cannot rot into a lie — but it **can** fall behind a newly deprecated token. | Lift deprecation into the token maps as data (e.g. a sibling `SIDEBAR_TOKEN_DEPRECATIONS` record) so the export and any future codemod read one source. Small; blocks nothing. |
| **D9** | **Should `yarn tokens:generate` also emit the DTCG file?** | They are deliberately separate: `generate.ts` also rewrites the repo-root `DESIGN.md` and runs inside `yarn test:prepare`, so folding the emit in would make `yarn test` write an interchange artifact as a side effect. Consequence: editing a token map and running `yarn test` leaves the DTCG file stale until `validate:tokens:dtcg` says so. | Accept the separation (current, with an actionable failure message), or fold it in and accept the side effect. `yarn build` already runs both. |

**No stop condition fired.** Specifically: (a) no token kind was inexpressible in
a way `$extensions` could not carry — all 26 are carried with reasons and remain
gate-covered; (b) the light/dark theme axis **is** representable and is shipped,
so it did not need an owner (the *other* recipe axes are D3, a scope
confirmation rather than a blocker); (c) no build tool was adopted, so no runtime
dependency was added to `@dzup-ui/tokens` — it still has none.

---

## 9. Ranked next packet

| Rank | Packet | Why now |
|---|---|---|
| **1** | **D2(c) — gate that every exported component token map is emitted** (new, small) | The `codeblock` tier is 15 public tokens the system claims and does not ship, and *nothing* can currently see it — my own round-trip gate is blind to it by construction. Roughly 30 lines in `dtcg-round-trip.ts`: assert `Object.keys(component/index.ts exports)` equals the set `generate.ts` merges. Cheap, prevents recurrence, and is a prerequisite for deciding D2(a)/(b) with confidence. |
| **2** | **D1 — resolve the three `--dz-appshell-*` collisions** | One of them ships a colour the semantic tier does not declare, and F-2 shows the shadowing also makes OS-dark and explicit-dark two different cascades for those names. It is latent today only because the values coincide. Ratchet is already wired at 3, so the fix has a visible finish line. Needs an owner because it moves a pixel. |
| **3** | **D5 — wire the schema check in** (new, small) | Turns a one-off "valid on 2026-09-01" into a standing gate. Two declared deps and a vendored schema. Do it before the export is advertised anywhere public, because the first-mover claim in `04-competitive-benchmark.md` is exactly the claim that must not rot. |
| **4** | **TASK-N2-D1/D2 — docs site + evidence pages** | The DTCG export is now a publishable differentiator with a green gate behind it, and TOKENS.md is the copy. It has nowhere to be read from: `packages/tokens/TOKENS.md` is not even in the npm `files` list (D7). The export's value is proportional to its discoverability. |
| **5** | **D7 — `files` + changeset for the additive `./dtcg` export** | Blocked on TASK-N5-01's 0.x policy for the changeset half; the `files` half is one string and can land immediately. |
| **6** | **D6 — extend `validate:doc-snippets` to README code fences** | Two live examples found in one package by reading. Nothing says how many others exist across seven publishable packages. |
| **7** | **D8 — lift `@deprecated` into token data** | Smallest item here; keeps the export's deprecation story honest as the sidebar aliases approach removal. |
| **8** | **D3 / D4 — confirm the two scope decisions** | Neither blocks anything. Both should be recorded before the export is described publicly, so the omissions read as decisions rather than gaps. |

---

## Appendix — reproduction

```bash
cd ui/dzup-ui
git rev-parse HEAD                       # 51dec93c73214af2d1e424e3454a7122691fea48
                                         # NOTE: worktree is dirty (N1 program) — do not clean

# emit twice, prove byte-identical
rm -f packages/tokens/dist/tokens.dtcg.json && yarn generate:tokens:dtcg
sha256sum packages/tokens/dist/tokens.dtcg.json    # e559034943233d2b764d24564ccfe36d9279e21d4823c08dbf45590c23d73347
rm -f packages/tokens/dist/tokens.dtcg.json && yarn generate:tokens:dtcg
sha256sum packages/tokens/dist/tokens.dtcg.json    # same

# the gate
yarn validate:tokens:dtcg                # EXIT 0

# prove the CSS did not move
yarn tokens:generate
sha256sum packages/tokens/dist/tokens.css          # cdb570b9b797a76bd0e7b099aea69c8031582caf5bb1e22d41766d5477e4ddfd

# focused + aggregate
npx vitest run packages/tokens/src/dtcg.spec.ts \
               packages/tooling/src/token-checks/dtcg-round-trip.spec.ts   # 42 passed
yarn validate:all                        # EXIT 0, 29 links
```

Do **not** run `yarn generate:exports` (N0-05 D2 — it would drop 5 public
composables). Do **not** delete `test-results/` (N0-05 D5).

**Never edit `packages/tokens/dist/tokens.dtcg.json` by hand** — it is
regenerated, and `validate:tokens:dtcg` will reject a hand edit as stale.
