# TASK-R3-O2 — Sanitizer provider seam in Core (ADR-20 amendment)

> Handoff for [`../contract-conformance-tasks.md`](../contract-conformance-tasks.md)
> §R3-O2. Program [`../README.md`](../README.md); protocol §4; conventions §5.
>
> **Repo / commit observed:** `ui/dzup-ui` `main` @ `99b963a` (worktree dirty
> with another session's `CLAUDE.md` / `packages/tooling` / `serve-storybook.ts`
> work, preserved untouched).
> **Cross-repo read-only:** `ui/dzup-ui-pro` `esmir` @ `90b8917`.
> **Started:** 2026-09-04.

---

## 0. `<done_check>` result — none passed, task run in full

| Check | Result at `99b963a` |
|---|---|
| `grep -rn "DZ_SANITIZER_KEY\|useDzSanitizer" packages/core/src/providers packages/core/src/composables/provider` | **empty** |
| `grep -n "sanitizer" packages/core/src/providers/DzProvider.types.ts` | **empty** |
| `grep -rn "DzSanitizerAdapter" packages/contracts/src` | **empty** |
| `grep -n -i "sanitizer" docs/adr/ADR-20-provider-contract.md` | **empty** |
| `ls docs/program-2026-09-04/reports/TASK-R3-O2-handoff.md` | **absent** |

Protocol §4.2 "none pass" → run the task.

---

## 1. Discovery (recorded before any edit, per `<steps>` 1)

### 1.1 The finding that changes the task: **Core has no HTML sink at all**

The prompt's `<default>` says *"the default adapter is the Core sanitizer
already used by the OSS declarers"* and `<adoption>` says *"every OSS
SecurityBoundary declarer that renders HTML resolves its sanitizer through
`useDzSanitizer()`"*. Measured at `99b963a`:

| Probe | Command | Result |
|---|---|---|
| Any sanitizer in Core | `grep -rln "sanitiz" packages/core/src --include=*.ts --include=*.vue` | **0 files** |
| Any `v-html` | `grep -rn "v-html" packages/core/src --include=*.vue` | **0 sites** |
| Any `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`/`new Function`/`createObjectURL` in `src` | same grep over `packages/core/src` | **0 in source**; every hit is `document.body.innerHTML = ''` teardown inside `*.spec.ts` |
| `SecurityBoundary` declarers | `packages/core/security/coverage.json` + `security-deviations.json` | 15 components, boundaries **`url`** (14) and **`payload`** (`DzQRCode`) — **no `html` boundary** |

**So there is no "Core sanitizer" to make the default, and the set of "OSS
HTML-bearing declarers to wire" is empty.** Core's security surface is URLs, and
URL policy is explicitly TASK-R2-O4's, fenced out by this prompt's `<scope>`.

Consequences taken, and why (each is a deviation from the prompt's literal text
and is re-stated as a decision in §5):

1. **The default adapter is an *escaping* adapter, not a DOMPurify one.** It
   returns the input HTML-escaped — markup in, text out. It is not a
   pass-through (the rejected option), needs no new dependency (forbidden by
   `<scope>`), is byte-identical on server and client, and fails **closed**: a
   host that has not installed an adapter renders untrusted HTML as visible
   text rather than as markup.
2. **Adoption inside Core is the seam's own test suite, not component wiring.**
   Wiring a `url`-boundary component through a *sanitizer* would be inventing a
   sink to justify the seam. Recorded as measured-zero rather than manufactured.

### 1.2 Pro's recorded vocabulary — the interface must express it, not invent one

Read from `ui/dzup-ui-pro` @ `90b8917`:
`packages/pro/manifests/html-sinks.manifest.json` (13 reviewed sinks, 22
occurrences), `docs/security.md` §4/§5/§6/§8/§10, and
`packages/pro/src/components/editors/composables/markdown/sanitize.ts`.

**Contexts (security.md §4 — eight, and they are two different populations):**

| Context | Sink kinds carrying it | Sanitiser-relevant? |
|---|---|---|
| `markdown` | `html-sink` ×1, `escape-hatch` ×2 | **yes** |
| `mermaid-svg` | `html-sink` ×1, `escape-hatch` ×1 | **yes** |
| `notebook-output` | `html-sink` ×1, `escape-hatch` ×1 | **yes** |
| `diff-highlight` | `html-sink` ×1 | **yes** |
| `rich-text-paste` | none yet (§10: Tiptap owns the pipeline, no raw sink in Pro source) | **yes**, declared |
| `file-preview` | `object-url` ×1 | no — object-URL allowlist |
| `image-source` | `object-url` ×1 | no — object-URL, guarded by construction |
| `download-blob` | `object-url` ×3 | no — object-URL, guarded by construction |

The Core `DzSanitizeContext['sink']` union therefore carries the **five HTML
contexts**; the three object-URL contexts are typed separately as
`DzObjectUrlSink` so the registry's whole vocabulary is expressible without
implying that `sanitize()` is what guards a `createObjectURL`. **No name is
invented; none of Pro's is dropped.**

**Limits — the prompt's sketch and Pro's reality differ, and Pro wins.**
The prompt's `<example>` (explicitly "shape, not final code") shows
`limits: { maxBytes: number; maxDepth: number }`. Pro's shipped field is
`SanitizeLimits { maxLength: number; maxDepth: number }` with
`DEFAULT_SANITIZE_LIMITS = { maxLength: 128 * 1024, maxDepth: 64 }` —
**characters, not bytes**, and the docstring records why the pair was chosen
(the cost is in `DOMParser.parseFromString`, 447 ms of the 644 ms spent on
`'<div>'.repeat(2000)`; depth and length multiply). `<interface>` says *"the
Core interface must be able to express every field Pro already uses — do not
invent a vocabulary"*, so Core ships `maxLength`/`maxDepth` and the sketch's
`maxBytes` is not used. Renaming it would have made every one of Pro's measured
numbers mean something else.

**Trusted Types.** `docs/security.md` §8 publishes the consumer CSP recipe
`trusted-types vue dompurify dzup-ui` — so `dzup-ui` is already the policy name
this ecosystem tells hosts to allowlist. It is the `policyName` default.

**Failure mode.** Pro fails closed by **throwing**: `SanitizeLimitError` for a
ceiling and a plain `Error` for "sanitizer unavailable"; neither returns markup.
Core matches that with `DzSanitizeLimitError`.

### 1.3 The provider pattern Core already has (P4-01 / P4-02)

- Nine `InjectionKey`s at `packages/contracts/src/provider.types.ts:215-223`,
  `DZ_PROVIDER_DEFAULTS` at `:236-243`.
- `DZ_MOTION_KEY` and `DZ_FORMATS_KEY` inject **plain objects, not refs** — the
  precedent for a method-bearing context; `useDzFormats` reads the locale at
  call time so a change is picked up without the caller re-subscribing.
- `DzProvider.vue` calls `provideDz*` **only for a prop that is defined**
  (ADR-20 amendment A1) — an unset prop leaves the ancestor alone.
- The `provideDz*` half is deliberately **not** in
  `composables/provider/index.ts`; the barrel publishes readers only (three
  reasons given in that file, one of them the `unclassified` ratchet).

### 1.4 Ownership-ratchet constraint that shaped where the error class lives

`component-ownership.manifest.json` classifies `use*` exports as `composable`
(38 today) and `DZ_*_KEY` / non-component `Dz*` exports as `unclassified`
(**29**, a downward-only ratchet). A `DzSanitizeLimitError` exported from
Core's barrel would have made it **30**.

It is therefore declared in **`@dzup-ui/contracts`**, which the manifest does not
cover — and which is the correct home on its own merits: catching an error by
class requires *identity*, which is the same argument §1 of ADR-20 gives for
putting the injection keys there. Pro can `catch (e) { if (e instanceof
DzSanitizeLimitError) … }` without importing Core's runtime.

Core's only new barrel export is `useDzSanitizer` → `composable` **38 → 39**;
`unclassified` stays **29**.

### 1.5 Interface proposal (as taken into implementation)

```ts
// packages/contracts/src/provider.types.ts
export type DzSanitizeSink =
  | 'markdown' | 'mermaid-svg' | 'notebook-output' | 'diff-highlight'
  | 'rich-text-paste' | (string & {})
export type DzObjectUrlSink = 'file-preview' | 'image-source' | 'download-blob'

export interface DzSanitizeLimits { readonly maxLength: number, readonly maxDepth: number }

export interface DzSanitizeContext {
  readonly sink: DzSanitizeSink
  readonly component: string
  readonly limits?: Partial<DzSanitizeLimits>   // Pro's per-call `limits?` argument
  readonly trustedTypes?: boolean
}

export interface DzSanitizerAdapter {
  readonly policyName: string
  readonly limits: DzSanitizeLimits
  sanitize: (html: string, context: DzSanitizeContext) => string
}

export interface DzSanitizerOptions {            // what a host passes to DzProvider
  readonly policyName?: string
  readonly limits?: Partial<DzSanitizeLimits>
  readonly sanitize?: (html: string, context: DzSanitizeContext) => string
}

export class DzSanitizeLimitError extends Error { … }
export const DZ_SANITIZER_KEY: InjectionKey<DzSanitizerAdapter>
```

### 1.6 List of Core consumers of the seam, before the work

**Zero**, for the reason in §1.1. The list after the work is in §2.4.

---

## 2. Implemented files and API effect

### 2.1 `@dzup-ui/contracts` (minor)

| File | Change |
|---|---|
| `src/provider.types.ts` | **+ Sanitizer section**: `DzSanitizeSink` (Pro's five HTML contexts + open arm), `DzObjectUrlSink` (the three object-URL contexts, typed apart so `sanitize(html, { sink: 'download-blob' })` cannot be written), `DzSanitizeLimits` (`maxLength` chars / `maxDepth`), `DzSanitizeContext`, `DzSanitizerAdapter`, `DzSanitizerOptions`, `DzSanitizeLimitError` (runtime class). **+ `DZ_SANITIZER_KEY`**, typed `InjectionKey<DzSanitizerAdapter \| null>` — `null` is a provided value with its own meaning. **+ `DZ_PROVIDER_DEFAULTS.sanitizer`** = `{ policyName: 'dzup-ui', limits: { maxLength: 131072, maxDepth: 64 } }`. |
| `src/index.ts` | Exports the six types, the key and the error class. Package docstring corrected: it claimed "types-only with one exception" while already carrying four kinds of runtime export. |

**API effect:** ten new public names. `DZ_PROVIDER_DEFAULTS` **grows a key** — the
first time since ADR-20 §2 published it — so code comparing against the whole
object sees a difference. Called out in the changeset rather than buried.

### 2.2 `@dzup-ui/core` (minor)

| File | Change |
|---|---|
| `src/security/sanitize.ts` **(new)** | Framework-free. `escapeHtml`, `measureHtmlDepth` (ported from Pro with provenance), `enforceSanitizeLimits`, `DZ_DEFAULT_SANITIZE_LIMITS`, `DZ_ESCAPING_SANITIZER` (frozen), `resolveSanitizer`. No `vue` import; no `window`/`document` on any path. |
| `src/composables/provider/useDzSanitizer.ts` **(new)** | `useDzSanitizer(instance?)` — instance → provider → Core default. `createDzSanitizer` / `provideDzSanitizer` withheld from the barrel like every other writer. |
| `src/composables/provider/index.ts` | Exports `useDzSanitizer` only. Docstring: ten concerns → eleven. |
| `src/providers/DzProvider.types.ts` | `sanitizer?: DzSanitizerOptions \| null`. |
| `src/providers/DzProvider.vue` | Injects the ancestor adapter, folds this provider's prop over it, provides only when the prop is defined (A1 preserved). |
| `manifests/public-api.manifest.json` | `useDzSanitizer` declared in `exports.composables.provider`. This file is the **source** the barrels are generated *from* (its own description says so), so this is authoring, not a hand-edit of a generated artifact. |

**API effect:** one new public composable. No existing signature changed; no
component's behaviour changed.

### 2.3 Specs added (all green)

| File | Added |
|---|---|
| `src/security/sanitize.spec.ts` **(new)** | **30** — escaping, the depth scanner's over-count and under-count bypasses, ceiling order, the frozen default, the per-field fold, call-time reads |
| `src/composables/provider/provider.spec.ts` | **+5** (31 → 36) — default, instance override, per-field fold, the `null` state |
| `src/providers/DzProvider.spec.ts` | **+7** (28 → 35) — install, ceilings for a function-only host, nested tighten/replace, live prop swap, `null`; and the existing "leaves every other concern alone" negative now asserts the sanitizer survives a nested provider |
| `src/providers/DzProvider.contract.spec.ts` | prop-routing and documented-default tables extended (6 tests, still) |
| `tests/ssr/provider-ssr.spec.ts` | policy name + ceilings resolve with `window`/`document`/`matchMedia` deleted |
| `tests/ssr/dz-provider-ssr.spec.ts` | **+3** (10 → 13) — `Page` now renders the sanitizer's output so **every** SSR and hydration case covers it; escaping on a server with no adapter; over-ceiling rejection identical on a server |

### 2.4 Core consumers of the seam, after the work

Still **zero components**, and that is the correct number — see §1.1. The seam's
consumers are its own six spec files and, next, Pro TASK-R5-P2.

### 2.5 Documents

| File | Change |
|---|---|
| `docs/adr/ADR-20-provider-contract.md` | **Amendment A6** — the tenth concern, the three-way default analysis, the ceilings-belong-to-the-seam rule, the three states, the `DZ_PROVIDER_DEFAULTS` consequence, and an explicit refusal to claim adoption. Consequences bullet added; "What did not change" narrowed to defaults that existed before A6; validation-hooks table row added. **Status untouched — still `Proposed`.** |
| `docs/program-2026-09/reports/N5-05-adr-20-acceptance-packet.md` | New **§11 "Item 10"** — divergence **D20-10** in the packet's own table format, the shipped-evidence table, and the adoption-table row. Everything above the new section is unchanged and still bound to `6f1f653`; item 10 is bound to `99b963a`. |
| `.changeset/one-place-to-configure-how-html-is-sanitized.md` | `@dzup-ui/contracts` minor + `@dzup-ui/core` minor. |

---

## 3. Focused validation output

| Command | Result |
|---|---|
| `vitest run packages/core/src/security` | **30/30 pass** |
| `vitest run` over `core/src/security`, `core/src/composables/provider`, `core/src/providers`, `core/tests/ssr`, `contracts`, `core/security` | **19 files · 688 pass · 0 fail · 1 skipped** — includes the N1-O5 URL corpus (144 url-policy + 151 malicious-corpus) re-run **green** after the contracts change |
| `vue-tsc --noEmit -p packages/core/tsconfig.json` | **exit 0** |
| `tsc --noEmit -p packages/contracts/tsconfig.json` | **exit 0** |
| `eslint` over the six touched directories `--max-warnings 0` | **exit 0** |
| `validate:exports` | **exit 0** — 33 entries, 199 declared exports |
| `validate:ownership` | **exit 0** after `generate:ownership`; diff is **exactly one entry** (`useDzSanitizer`, `kind: composable`) plus the `sourceCommit` restamp |
| `validate:component-meta` | **exit 0** after `generate:component-meta`; diff is **exactly** the `sanitizer` prop, `DzObjectUrlSink` in taxonomies, two counters and the restamp |
| `validate:llms` · `validate:docs-pages` · `validate:playground-parity` | **exit 0** after `generate:llms` + `generate:docs-pages` |
| `validate:quality-tiers` · `validate:anatomy-parts` · `validate:contract-parity` | **exit 0** |

**Regeneration order followed** (README §5 `<generated_authority>`): ownership →
component-meta → llms → docs-pages → playground seeds. Quality and capability
were checked, not regenerated: this change adds no component, and the capability
matrix's staleness is the pre-existing one (below).

Every command above was invoked **by path** (`node node_modules/…`), never
through `npx`: `npx tsc` in this workspace fetches a dependency-confusion
placeholder that prints a banner and exits 1, and the Pro N0 program recorded the
worse variant — `npx depcruise` fetching a placeholder that validates nothing and
**exits 0**. `yarn <script>` does work in this repo (yarn 4.16.0), unlike in
`ui/dzup-ui-pro`.

---

## 4. Aggregate qualification — and a live-worktree caveat that governs it

### 4.1 `yarn validate:all`

**Exit 1, first failing link 16 of 37 — `validate:capability-matrix`, 12 stale
cells.** That is **exactly** the pre-existing red recorded in README §2 at
`99b963a`, unchanged in kind and in number (A 0 · B 0 · C 11 · D 1). Links 1–15,
including `typecheck` and `lint`, passed over the whole tree. Not fixed here:
R1-O1 owns it, and fixing it inside an unrelated task is what README §5
`<validation>` forbids.

### 4.2 `yarn test` — **read this before quoting the number**

`3 failed test files | 504 passed (507)` · `2 failed tests | 9226 passed (9232)`.

- **2 failed tests** = the two inherited failures the baseline names
  (`landing-token-fallbacks` "every fallback matches the value its token
  resolves to"; `story-dod-tiers` "countOpen › subtracts a waiver"). Unchanged.
- **The third failed *file*** is
  `packages/tooling/src/token-checks/dtcg-round-trip.spec.ts`, which failed to
  **transform** — `Unterminated string literal` at `:99:43`. It is **not mine**
  and it is **not a baseline failure**: it is a *concurrent session's file caught
  mid-write*. See §4.3.

**Correction to the baseline for whoever runs R1-O1:** README §2 records `yarn
test` as "2 failures". At the *test* level that is right; the file-level count is
what a `Test Files` line reports, and a collection or transform error shows up
there and in no test count. Worth stating so the next agent does not read
`3 failed` as a regression.

### 4.3 🔴 Two other sessions are editing this worktree right now

Discovered while diffing, and it changes how every aggregate number above should
be read. At session start the worktree carried five modified files, all from the
concurrent Pro-TASK-N0-04 session README §2 already warns about. By the end it
carried **eleven** files that are not mine:

| Not-mine path | mtime | Whose, on the evidence |
|---|---|---|
| `CLAUDE.md`, `apps/landing/vite/serve-storybook.ts`, `packages/tooling/README.md`, `packages/tooling/scripts/adr-registry.json`, `docs/program-2026-09/README.md` | 12:34 | The session README §2 names. Untouched. |
| `packages/nuxt/src/module.ts`, `packages/nuxt/src/module.pro.spec.ts` | 14:53 | **TASK-R3-O1.** The diff is `canResolvePro()` resolving `@dzup-ui-pro/pro/package.json` with a bare-name fallback — Pro REL-01 finding **R4a**, R3-O1 step 3, verbatim. |
| `packages/core/src/styles/base.css`, `packages/tokens/src/generate.ts`, `packages/tooling/src/token-checks/dtcg-round-trip.ts`, `packages/tooling/src/token-checks/dtcg-round-trip.spec.ts` | **15:26** | **TASK-R5-O1.** Cascade layers plus the CSS layer/import-order fixture (`parseCssDeclarations`, `@layer dz-reset, dz-tokens, dz-base`). |

**Consequences, stated rather than smoothed over:**

1. **Nothing above is untouched-tree evidence.** `validate:all` ran at ~15:16 and
   `yarn test` from 15:22 to 15:27 — i.e. `yarn test` ran *across* the 15:26
   edit and captured a half-written file. The **§3 focused numbers are the
   trustworthy ones**: they cover only paths no other session is editing.
2. **Nothing of theirs was touched.** No file outside §2 was edited, staged,
   reverted or regenerated by this task. The four generated artifacts that were
   regenerated produced diffs containing only this change plus a `sourceCommit`
   restamp — verified line by line, in §3.
3. **R3-O1's `<done_check>` still fails at step 1** (no Pro manifest at
   `../dzup-ui-pro/packages/pro/manifests/component-ownership.manifest.json`;
   that directory holds nine other manifests and not that one), so whoever is on
   it is correctly running steps 1–2 only.
4. **The aggregate is not re-runnable to the same answer** while three sessions
   write to one worktree. If the program wants citable aggregate evidence, the
   tasks need separate worktrees or a queue — the already-open decision **D5**, which TASK-R3-O1 raised from the other side and this task corroborates with a third session.

---

## 5. Deviations from the prompt, each with its reason

| # | Prompt text | What was done | Why |
|---|---|---|---|
| 1 | `<default>` "the default adapter is **the Core sanitizer already used by the OSS declarers**" | An **escaping** default, written for this task | There is no Core sanitizer. 0 files in `packages/core/src` mention sanitising; 0 `v-html`; all 15 `SecurityBoundary` declarers are `url`/`payload`. The prompt's premise does not hold at `99b963a`. Escaping satisfies the binding half of the requirement — "a pass-through default is rejected" — without the new dependency `<scope>` forbids. |
| 2 | `<adoption>` "**every OSS SecurityBoundary declarer that renders HTML** resolves its sanitizer through `useDzSanitizer()`" | Nothing wired | The set is empty (same measurement). Wiring a `url`-boundary component through a *sanitizer* would be manufacturing a consumer to make a metric move; `<scope>` also fences URL policy to TASK-R2-O4. Recorded as measured-zero in ADR A6 and in packet item 10 so acceptance cannot read it as adoption. |
| 3 | `<interface>` `<example>` shows `limits: { maxBytes: number; maxDepth: number }` | `maxLength` (**characters**) + `maxDepth` | The example is marked "shape, not final code", and the same block's binding rule is *"must be able to express every field Pro already uses — do not invent a vocabulary"*. Pro's shipped field is `SanitizeLimits.maxLength` in characters, and its 128 KiB / 64 numbers were measured against character counts. Renaming to bytes would silently change what every recorded measurement means. |
| 4 | `<example>` sink union `'html' \| 'markdown' \| 'svg' \| 'notebook' \| 'chat'` | Pro's registry vocabulary: `markdown`, `mermaid-svg`, `notebook-output`, `diff-highlight`, `rich-text-paste` | Same rule. The example's names are near-misses for Pro's (`svg` vs `mermaid-svg`, `notebook` vs `notebook-output`) and `chat` exists nowhere in Pro's registry. The object-URL contexts are typed as `DzObjectUrlSink` so the registry's full vocabulary is expressible without implying a sanitizer guards a `createObjectURL`. |
| 5 | `<steps>` 5 "regenerate component-meta" | Also regenerated ownership, llms, docs-pages and playground seeds | The `<generated_authority>` order makes them downstream of component-meta, and stopping after component-meta would have left three artifacts red. Each diff was reviewed line by line and contains only this change. |
| 6 | Not in the prompt | `measureHtmlDepth` **ported into Core** rather than reimplemented or omitted | Declaring `maxDepth` in the contract and not enforcing it would reproduce D20-1's failure mode — a specified, unadopted clause — inside the very amendment that criticises it. Porting rather than rewriting keeps one definition of "depth 64" across the two tiers. Pro's copy is **not** removed (that is Pro TASK-R5-P2, and `<scope>` says no change to Pro); until it is, two copies exist and agree. |

---

## 6. Ratchet movements

| Ratchet | At `99b963a` | Now | Direction |
|---|---|---|---|
| `validate:all` first failing link (of 37) | 16 | **16** | unchanged (same pre-existing cause) |
| capability-matrix stale cells | 12 | **12** | unchanged |
| `yarn test` inherited test failures | 2 | **2** | unchanged |
| ownership `unclassified` | 29 | **29** | held — the error class went to contracts (outside the manifest) precisely to hold it |
| ownership `composable` | 38 | **39** | +1, the intended growth |
| ownership manifest `sourceCommit == HEAD` | no (`51dec93`) | **yes (`99b963a`)** | ✅ |
| component-meta `sourceCommit == HEAD` | no (`6f1f653`) | **yes (`99b963a`)** | ✅ |
| llms / docs-pages / seeds `sourceCommit` | `6f1f653` | **`99b963a`** | ✅ |
| component-meta `propsWithoutDescription` | 63 | **63** | held (the new prop is described) |
| provider concerns with a contract | 10 | **11** | +1 |
| provider consumers: sanitizer | — | **0 components** (by construction) | recorded, not claimed |
| ADRs Accepted (18/19/20) | 0/3 | **0/3** | untouched — acceptance is TASK-R0-O2 |
| pending changesets | 20 | **21** | +1 |

---

## 7. Owner decisions raised

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **D6** 🟠 | **`DZ_PROVIDER_DEFAULTS` grew a key.** ADR-20 §2 published the object, and `DzTestIds.prefix`'s docstring records a deliberate refusal to grow it. A6 grows it anyway, because a concern with no entry there cannot be resolved to the same value by Pro — the stated reason the object exists. | (a) Accept the growth under a `minor`, as shipped. (b) Keep the sanitizer's defaults in a second constant so §2's object stays frozen. | **(a).** A defaults object that cannot describe a new concern stops being the answer to "what do I get with no provider", and the alternative is two places to look. The 0.x policy already makes `minor` the vehicle for exactly this. |
| **D5** 🔴 *(already open — this task corroborates and extends it)* | **Three sessions are writing to one `ui/dzup-ui` worktree** (§4.3). TASK-R3-O1 raised this as **D5** from the other side, having watched two `yarn test` runs seven minutes apart disagree by four failures. This task reached it independently and adds the **third** session, TASK-R5-O1. Aggregate evidence is not reproducible, and `yarn test` captured a peer's file mid-write. | (a) One worktree per concurrent task. (b) Serialise the R-tasks. (c) Accept it and stop quoting aggregate numbers until a quiet tree exists. | **(a)**, falling back to **(c)**. The program's own evidence rules bind every metric to a commit; a tree three agents are editing cannot honour that, and the failure mode is the one S1-F10 already cost three packets — a number that looked green. |
| **D7** 🟠 | **Pro's `measureHtmlDepth` is now duplicated.** Core owns the ceiling; Pro still carries its own copy. | (a) Pro TASK-R5-P2 deletes Pro's copy and imports Core's (Pro already imports `@dzup-ui/core` in 75 files). (b) Keep both and add a cross-repo test that they agree. | **(a).** Two copies of a scanner that models HTML tree construction is exactly how the tiers come to disagree about what depth 64 means. `<scope>` forbade doing it here. |
| **D8** 🟢 | **`validate:exports` does not catch an *undeclared* export.** `useDzSanitizer` was live in the barrel and the gate stayed green until `validate:ownership` caught it. The gate checks declared → actual, not actual → declared. | (a) Add the reverse check. (b) Leave it to `validate:ownership`, which does catch it. | **(a)**, in R1-O1 or R5-O7. Two gates disagreeing about which is authoritative is how the drift in open owner decision #9 accumulated. Not fixed here: it is a tooling change outside this task's scope. |

---

## 8. Ranked next packet

1. **Pro TASK-R5-P2** — the seam has a consumer waiting. Import path, stated as
   `<success_criteria>` requires: `import { useDzSanitizer } from '@dzup-ui/core'`
   plus `import type { DzSanitizerAdapter, DzSanitizeContext } from '@dzup-ui/contracts'`
   (or `DZ_SANITIZER_KEY` directly, to avoid Core's runtime entirely). **No
   further Core change is needed.** Pro's six `sanitizer-adapter`-guarded sinks
   resolve through it, and Pro's `SanitizeLimitError` becomes
   `DzSanitizeLimitError`.
2. **TASK-R1-O1** — until the tree is truthfully green, §4's aggregate stays
   uncitable, and D5 makes that worse rather than better.
3. **TASK-R0-O2** — A6 is written and the code behind it is validated; ADR-20's
   acceptance now has one more item and one fewer excuse.
4. **TASK-R3-O4** — the natural companion: this task settled the *vocabulary*
   half of the Core/Pro security seam; R3-O4 settles the *fixture* half.

---

## 9. What this handoff refuses to imply

- **That Core is safer than it was.** Core had no HTML sink to make unsafe. What
  the seam makes possible is a host setting one policy for the fourteen Pro
  components that do, and that benefit is not banked until Pro consumes it.
- **That the aggregate numbers in §4 are evidence.** They were measured on a tree
  two other sessions were writing to, one of them mid-edit. Focused-validated is
  the highest rung this run reaches; §3 is the part that is re-runnable.
- **That ADR-20 is accepted.** No status was flipped. A6 is text an owner can
  accept or reject, and packet item 10 is where the decision is recorded.
- **That `useDzSanitizer` has consumers.** It has none in Core, deliberately, and
  saying so in three places — the ADR, the packet and here — is the point.
