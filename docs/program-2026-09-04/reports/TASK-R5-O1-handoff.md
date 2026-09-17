# TASK-R5-O1 — ADR-19 pre-acceptance code work: cascade layers, `DataState`, layer-order fixture

- **Ran:** 2026-09-04, `main` @ **`99b963a`**, which did not move. Every number
  below is bound to that commit.
- **Authority used:** none beyond editing files. No commit, push, publish, CI
  dispatch, baseline replacement, or ADR status change. `docs/adr/ADR-19-…`
  still reads **Proposed** — acceptance is TASK-R0-O2.
- **`<done_check>` result:** **0 of 7 checks passed.** The task ran in full.
  (`grep -c` on base.css layers → `0`; no widened `DataState`; no vendor
  registry; no layer fixture; `ariaInvalid` still only on
  `BaseAccessibilityProps`; VERSIONING §7 still `[!owner]`; no decision sheet.)

> **Concurrency.** Two other sessions were writing this worktree throughout.
> Nothing of theirs was reverted, regenerated or checked out. Where a constraint
> of theirs changed what I could do, it is recorded as an owner decision rather
> than worked around silently — **D9** and **D10** below both exist for that
> reason. §9 carries the start/end `git status --short`.

---

## 1. Implemented files + API effect

### 1.1 Cascade layers — all six now declared *(D19-2, D19-3)*

| File | What changed |
|---|---|
| `packages/core/src/styles/base.css:51` | `@layer dz-tokens, dz-base, dz-components;` → `@layer dz-reset, dz-tokens, dz-base, dz-components, dz-utilities, dz-overrides;`, with the reason for registering the two empty slots written above it |
| `packages/core/src/styles/base.css:64` | box-model reset and document defaults moved out of `dz-base` into a new `@layer dz-reset { … }` block — where ADR-19 §2's own table always put them (*"currently inside `dz-base`; moves in P3-03"*) |
| `packages/tokens/src/generate.ts:114` | `tokens.css` now emits the **same six-slot statement** above its `@layer dz-tokens` block |

**API effect.** Additive. `dz-reset`, `dz-utilities` and `dz-overrides` become
real, registered layer names. `dz-utilities` and `dz-overrides` are empty by
design — registering the *name* is the whole point, because an **unregistered**
layer sorts after every registered one, so a consumer writing
`@layer dz-overrides { … }` was winning by append-order accident and would have
silently begun losing the day the library registered anything after
`dz-components`.

**Why the statement is in both stylesheets.** CSS registers a layer at its
*first* appearance. With the order declared only in `base.css`, a bundler that
emitted `tokens.css` first registered `dz-tokens` ahead of `dz-reset` and the
shipped order depended on emit order. `base.css` remains the single statement the
docs evidence layer reads (`packages/tooling/src/docs/read-evidence.ts`).

**No shipped selector changed weight.** Nothing else in the library sets
`box-sizing`, `margin` on `body`, or `scroll-behavior`, so moving those rules to
a lower layer moved them against rules that do not exist. The visual stop
condition was therefore not reached and no `[!owner]` visual escalation is
raised.

### 1.2 The layer-order fixture, on packed tarballs *(the 08-11 doc 08 matrix row, D19-7)*

| File | What it is |
|---|---|
| `e2e/styling/pack-styles.mjs` | `yarn pack`s `@dzup-ui/tokens` and `@dzup-ui/core`, reads `package/dist/{tokens,core}.css` **out of the `.tgz`**, and refuses to fall back to source |
| `e2e/styling/layer-order.spec.ts` | 10 tests × 3 engines |
| `e2e/styling/playwright.layer-order.config.ts` | its own config — no `webServer` |
| `playwright.config.ts:112-114` | the three functional lanes now `testIgnore` `e2e/styling` as well as `e2e/matrix` |
| `package.json` | `test:e2e:layer-order`, with a `//`-documented entry |

**Why a tarball.** The override guarantee is a promise about the CSS that arrives
in `node_modules`, and every step between source and artifact can break it —
`@import './prose.css'` is inlined at build time, Vite can hoist at-rules, a
minifier can drop a layer statement it judges empty, and `files`/`exports` decide
whether the sheet ships at all. A source-reading fixture proves the author's
intent; this one proves the artifact. The tarball is **extracted, not
`npm install`ed**: installing adds a resolution step that cannot change the bytes
of a CSS file and costs minutes.

**Why its own Playwright config.** The shared config's `webServer` builds and
serves Storybook before any project runs. Attaching a two-stylesheet assertion to
that would add a four-minute Storybook build and couple the override guarantee to
the gallery — the exact kind of accidental dependency ADR-19 exists to remove.

**What it proved, and one thing it disproved.** Written expecting that repeating
the statement in both sheets would make the layered override order-independent.
**All three engines said otherwise**, and the spec now asserts the truth: a
consumer sheet that opens `@layer dz-overrides { … }` *before* the dzup
stylesheets are evaluated registers that layer first, the library's statement
appends `dz-reset … dz-components` after it, and `dz-components` wins. Nothing
the library ships can fix that — it cannot make a declaration appear before a
sheet that loads earlier. Recorded as a known limit in ADR-19 §2, in
`TOKENS.md`, and in the changeset, with the two mitigations that do hold: import
the dzup sheets first, or use unlayered CSS, which wins in either order.

### 1.3 `DataState` widened, and the gate that replaces it *(D19-1)*

| File | What changed |
|---|---|
| `packages/contracts/src/data-attributes.types.ts:65` | `'data-state'?: DataState` → `'data-state'?: string` |
| same file, `DataState` | kept, re-documented as the **named vocabulary of common values**, not the attribute's type |
| `packages/tooling/src/validators/anatomy-parts.ts:207` | `statesIn()` — resolves both `data-state="literal"` and every string literal inside `:data-state="x ? 'a' : 'b'"` |
| same file | `unresolvedStatesIn()` — expressions with no literal are reported, never guessed |
| same file, `checkAnatomyParts` | two new rules, `undeclared-state` and `states-without-anatomy`, following the same ownership walk as a part (own anatomy → composing parent → for an unmanifested internal, every host) |
| `packages/tooling/src/validators/anatomy-parts-ceilings.json` | `maxUndeclaredStates: 1`, `maxStatesWithoutAnatomy: 88`, each with the population named and an exit condition |

**API effect.** A type-level widening — every value that type-checked before
still does. Under `VERSIONING.md` §2.1 (and ADR-19 §6 as amended) that is a
**patch**. It *is* a narrowing for a consumer who assigned
`DataAttributes['data-state']` into a `DataState`-typed variable; the changeset
says so and points at the component's own `states` array, which is where the
constraint moved.

**The widening on its own would only remove a check**, which is why it shipped
with the gate. Measured at the widening: **0** violations across all 32
anatomy-declaring components; **1** in a compound part; **88** values from
components that declare no anatomy.

**Gate proven, both directions.** `DzButton.vue:176` was temporarily edited to
emit `data-state="pending"`; the validator printed
`✗ … can emit data-state="pending", which DzButton's anatomy does not declare`
and exited **1**. The file was restored and `git status` on it is clean. The
held-name ceiling was proven the same way by lowering it from 3 to 2 (exit 1) and
restoring it (exit 0).

### 1.4 Vendor sublayer registry + validator

| File | What it is |
|---|---|
| `packages/core/src/styles/vendor-registry.json` | selector · owner · reason · exit · layer. **Zero entries.** |
| `packages/tooling/src/validators/vendor-sublayers.ts` | three rules: entry complete · entry still live · every vendor-shaped selector registered |
| `packages/tooling/src/validators/vendor-sublayers.spec.ts` | 11 tests |
| `package.json` | `validate:vendor-sublayers`, wired into `validate:all` after `validate:anatomy-parts` |

**The registry is empty and was measured empty, not assumed.** The only contact
between library CSS and Reka is `var(--reka-accordion-content-height)` in
`base.css` — a custom property Reka *publishes* and the library *reads*, from
inside its own `.dz-accordion-content` rule. That is not a sublayer, and a
validator that matched it would have put a false positive at the top of an empty
ledger; the spec asserts it is not matched. The packet names no vendor selector
either, so **no entry was invented**.

An empty registry is worth shipping because of rule 3: it is what stops the first
such selector arriving unnoticed. That rule is proven in the spec, not merely
asserted — an empty registry behind an unexercised validator is a document.

### 1.5 Part-name vocabulary resolved *(D19-11 / S1-D1)*

| File | What changed |
|---|---|
| `packages/contracts/src/anatomy.types.ts:89` | 7 names folded in: `clear`, `toggle`, `filename`, `language`, `body`, `row`, `cell`, each with a one-line definition |
| `packages/contracts/src/anatomy.types.ts:122` | new `ANATOMY_PART_EXTENSIONS` — the 7 kept out, with `owners`, `status` (`reviewed`/`held`) and a reason each |
| `packages/contracts/src/index.ts:19` | **one additive export line** (see §9 on custody) |
| `packages/tooling/src/validators/anatomy-parts.ts` | the report now splits *folded in* / *reviewed extension* / *held* / *unreviewed*, with `maxUnreviewedPartNames: 0` and `maxHeldPartNames: 3` |
| `packages/tooling/src/validators/anatomy-parts.ts` | the vocabulary is now imported from `../../../contracts/src/anatomy.types.ts`, not from `@dzup-ui/contracts` — **the package specifier resolves to the built `dist`**, so the validator was reporting against a stale vocabulary until contracts was rebuilt. `ownership-manifest.ts` already imported this way. |

**The packet's "13 names" does not reproduce.** Measured on `99b963a`:
**14 distinct names across 7 components** (15 component/name pairs; `clear` is
declared by both `DzInput` and `DzSearchInput`). The gate's own report is the
source. Per this program's convention the measured figure is used and the
inherited one is flagged.

**Nothing was renamed.** Renaming a shipped part name is breaking, which is
exactly why the review had to happen now rather than later.

### 1.6 `ariaInvalid` — home added, removal costed *(N5-02 D1; see D10)*

| File | What changed |
|---|---|
| `packages/contracts/src/props.types.ts:79` | `BaseValidationProps` gains `ariaInvalid`, beside `invalid`/`error`/`required` |
| `packages/contracts/src/props.types.ts:120` | `BaseAccessibilityProps` keeps it, with the deprecation, the 30-component removal cost, and the reason recorded in `//` comments |

**API effect: additive, therefore a `patch`.** No component's prop surface moves.
The nine `Omit<BaseAccessibilityProps, 'ariaInvalid'>` sites are deliberately
untouched — with the prop still declared on both bases they still express the
right intent, and removing them would *add* the prop back to five components'
public surface. **The removal is D10.**

**A finding worth carrying forward:** the doc comments are written as `//`
comments and the description line is byte-identical on both declarations, because
`component-meta.json` records prop **descriptions** — 1,663 of them. Rewording
one JSDoc line made `validate:component-meta` and `validate:docs-pages` go red
and would have forced a regeneration of an artifact two other sessions were
holding. A wording change is not a free change in this repository.

### 1.7 Documents amended

| File | Change |
|---|---|
| `docs/adr/ADR-19-…md` | amendment log in the header; §2 layer table, `!important` inventory (2 → **3 rules / 6 declarations** with the `-webkit-autofill` carve-out), vendor-sublayer rule; §3 vocabulary growth + **the missing rule for an unexported internal**; §4 widening performed + **recipe attributes declared unenforced**; §5 compound-part `ui` clarification; §6 release wording; Prerequisite packet **DISCHARGED**; Consequences re-measured; Validation-hooks table retargeted. **Status untouched.** |
| `packages/contracts/VERSIONING.md` | §7 → **RESOLVED 2026-09-04**, each item with the path it was applied in |
| `apps/storybook/stories/Versioning.mdx` | §7.1 — now carries the `0.x` table *and* the 1.0 table, breaking list re-headed, deprecation window corrected |
| `packages/tokens/TOKENS.md` | §7.3 — the two sidebar aliases are **held until 1.0**; the layer paragraph now names all six |
| `.changeset/the-six-cascade-layers-the-styling-contract-promised.md` | `patch` × contracts/core/tokens |
| `docs/program-2026-09-04/reports/TASK-R5-O1-data-scope-decision.md` | the `data-scope` sheet (options, consequences, recommendation **B — defer with a named trigger**) |

### 1.8 A parser bug found on the way

`packages/tooling/src/token-checks/dtcg-round-trip.ts` — the hand-rolled CSS
scanner did not reset its prelude on a **top-level `;`**, so a statement at-rule
(`@layer a, b, c;`, `@charset`, a bare `@import`) leaked into the next block's
at-rule context. Adding the ordering statement to `tokens.css` would have made
every token in the file parse under `@layer …; @layer dz-tokens` and the
round-trip compare the wrong cascade. Fixed, with a regression test
(`dtcg-round-trip.spec.ts`, "a top-level statement at-rule does not leak into the
next block").

---

## 2. The packet's 13-divergence table, re-issued

Classification: **code** = the code changed · **ADR** = the document changed ·
**owner** = a decision sheet was produced.

| # | Divergence | Action | New state |
|---|---|---|---|
| **D19-1** 🔴 | `DataState` widening never happened | code | **Closed.** `data-state` is `string`; the per-component enum is enforced by `validate:anatomy-parts`, proven by a seeded failure. |
| **D19-2** 🔴 | 3 of 6 cascade layers do not exist | code | **Closed.** Six declared, in both published stylesheets; asserted on the tarball in 3 engines. |
| **D19-3** 🔴 | a Consequences bullet asserts something untrue | code + ADR | **Closed** by fixing D19-2. The bullet is now true and says so, *and* records that it was false for fourteen days. |
| **D19-4** 🟠 | §6 says removal is a "major" | ADR | **Closed.** §6 reads "breaking, therefore a minor while the library is `0.x`"; the widening is a **patch**. `VERSIONING.md` §7.2 marked resolved. |
| **D19-5** 🟠 | the hook was built somewhere else | ADR | **Closed.** The hooks table names `validate:anatomy-parts` (source-level) and `expectAnatomy` (rendered DOM), and records that the `contract-parity` extension was never built. |
| **D19-6** 🟠 | §4's recipe-attribute reporting does not exist | ADR (+ follow-up) | **Closed as text.** §4 now says the clause is **unenforced** and the gap **unmeasured**, and names the follow-up (build it with `data-scope` as one `useAnatomy()` bag). The gate is still not built — see the ranked next packet. |
| **D19-7** 🟠 | the override e2e covers half the hook | code | **Closed.** `e2e/styling/layer-order.spec.ts` covers the `dz-overrides` half, on the tarball, in 3 engines, with no `!important`. |
| **D19-8** 🟢 | the `!important` inventory is short by one | ADR | **Closed.** 3 rules / 6 declarations; `-webkit-autofill` recorded as a **permanent exception**, the other two as debt. |
| **D19-9** 🟢 | the prerequisite is discharged, the ADR says it is not | ADR | **Closed.** Section retitled DISCHARGED; the prohibition narrowed to the rule it was protecting. |
| **D19-10** 🟠 | §3 has no rule for an unexported internal | ADR (+ open decision) | **Rule added.** The disposition of `DzOptionsState` remains N2-S1 **S1-D4** and is what `maxUndeclaredEmissions: 3` and `maxHeldPartNames: 3` both wait on. |
| **D19-11** 🟢 | names outside the vocabulary | code + ADR | **Closed.** 7 folded in, 7 recorded as extensions, 0 unreviewed, 3 held. Re-measured: **14**, not 13. |
| **D19-12** 🟢 | §5 silent on compound-part `ui` | ADR | **Closed.** §5 states the rule and the correct count (26 + 1). |
| **D19-13** 🟢 | identity is unenforceable by attribute alone | owner | **Sheet produced.** `TASK-R5-O1-data-scope-decision.md`; recommendation **B**. ADR-19 Consequences records the residual `DzRelativeTime` case as a **known limit**. |

**Divergences 13 → 0**, in the sense the task set: every row is either fixed in
code or amended in the ADR with a dated note, or has a decision sheet in front of
the owner. Two rows leave named work behind and say so: D19-6's gate is not
built, and D19-10's disposition is not decided.

---

## 3. Focused validation output

Exit codes read directly (`cmd; echo "exit $?"`), never through a pipe.

| Command | Exit | Note |
|---|---|---|
| `npx tsx packages/tooling/src/validators/anatomy-parts.ts` | **0** | `118 emissions / 37 components / 32 declarations; 3/3 undeclared, 0/0 unemitted` · `data-state: 24 distinct values across 72 components; 1/1 undeclared, 88/88 without anatomy` · `0 unreviewed, 3/3 held` |
| …same, with `data-state="pending"` seeded on DzButton | **1** | the gate proof; file restored, `git status` clean |
| …same, with `maxHeldPartNames` lowered 3 → 2 | **1** | ceiling wiring proof; restored |
| `npx tsx packages/tooling/src/validators/vendor-sublayers.ts` | **0** | `0 registered vendor selector(s); 0 vendor-shaped selector(s) across 2 stylesheet(s)` |
| `npx vitest run packages/tooling/src/validators/vendor-sublayers.spec.ts` | **0** | 11 passed |
| `npx tsx packages/tooling/src/token-checks/dtcg-round-trip.ts` | **0** | 774 typed tokens + 26 untyped, 319 aliases, 649 light / 649 dark matched |
| `npx vitest run packages/tooling/src/token-checks/dtcg-round-trip.spec.ts` | **0** | 15 passed, incl. the new statement-at-rule regression |
| `validate:tokens` (3 scripts) | **0 / 0 / 0** | colour-lint, DESIGN.md, intent contrast |
| `npx tsx packages/tooling/src/validators/tv-slot-calls.ts` | **0** | 130 of 209 SFCs |
| `npx vitest run packages/contracts …` (11 files) | **1** | 190 passed / **1 failed** — `landing-token-fallbacks`, **inherited** |
| `npx vitest run packages/core/src/components/buttons packages/core/src/components/data/DzTable.spec.ts` | **0** | 337 passed / 18 files |
| `npx vitest run packages/tooling/src/validators/ownership-manifest.spec.ts` | **0** | 36 passed (after the vocabulary-report update, §5) |
| `npx tsx …/validators/component-meta.ts` | **0** | fresh; every debt number at its ceiling |
| `npx tsx …/docs/generate-docs-pages.ts --check` | **0** | 144 pages + 6 evidence pages fresh |
| `npx tsx …/validators/llms.ts` | **0** | both documents fresh |
| `npx tsx …/scripts/validate-changelog.ts` | **0** | 7 passed |
| `npx tsx …/scripts/validate-release-policy.ts` | **0** | 22 pending changesets, **0 major**, 0 mixed |
| `npx tsx …/scripts/validate-adr-references.ts` | **0** | 17 cited · 3 documented · 14 registry-only (ceiling 14) |
| `npx playwright test --config=e2e/styling/playwright.layer-order.config.ts` | **0** | **30 passed** (10 tests × chromium/firefox/webkit) on the packed tarballs |
| `npx eslint e2e/styling/` | **0** | the new lane is clean |

---

## 4. Aggregate qualification

**`yarn validate:all` — run END-TO-END, exit read directly: exit `1`.**

It fails at **`validate:capability-matrix`**, which is the **known-red baseline**:
`12 stale cell(s)` plus the `DzFileUpload` Tier-D `browser-matrix` cell. Same
failure and the same count as the brief records for `99b963a`. **Not mine, and
this is not a green aggregate.** The chain is now **38 links**, not 37 — this
task added `validate:vendor-sublayers` at position 9 — so capability-matrix is
link **17 of 38**.

Because the chain stops there, the 21 links after it did not run inside the
aggregate. Every one was run individually and read directly:

| Link | Exit |
|---|---|
| `visual-baselines` · `ownership` · `mcp` · `component-meta` · `llms` · `docs-pages` · `playground-parity` | 0 · 0 · 0 · 0 · 0 · 0 · 0 |
| `package-names` · `doc-snippets` · `engines` · `adr-references` · `readme-facts` · `externals` · `dts` | 0 · 0 · 0 · 0 · 0 · 0 · 0 |
| `exports` · `tokens` · `tokens:dtcg` · `changelog` · `release-policy` · `peers` · `licenses` | 0 × 7 |

**`yarn typecheck` — exit `0`.  `yarn lint` — exit `0`.**

**`yarn test` — exit `1`, 9,250 passed / 4 failed / 508 files.**

| Failure | Attribution |
|---|---|
| `landing-token-fallbacks.spec.ts` | **inherited**, named in the brief |
| `story-dod-tiers.spec.ts > countOpen > subtracts a waiver` | **inherited**, named in the brief |
| `ownership-manifest.spec.ts` × 2, "the vocabulary report" | **mine, and fixed** — see §5. Re-run: 36/36 pass. |

**Deltas from the brief's known-red list, measured rather than assumed:**

- **`validate:ownership` is GREEN (exit 0).** The brief records it red with
  `+useDzSanitizer` from the concurrent session. It is not red now. Nothing of
  theirs was regenerated by this task, so either they cleared it themselves after
  15:14 or the brief's reading predates their fix. **The ownership manifest was
  not regenerated here.**
- **`ownership-manifest.spec.ts` now passes 36/36.** The brief expected ~4
  failures from the other session; the two that were actually failing at the end
  of this task were caused by *this* task and are fixed.
- **`eslint e2e/` shows 53 errors, not 9.** All 53 are pre-existing and none is
  in `e2e/styling` (44 × `style/no-multiple-empty-lines` and 22 markdown findings,
  almost all in `e2e/at-matrix/scripts/*.at-script.md`). The brief's figure of 9
  does not reproduce at `99b963a`. Not fixed here — it is not this task's lane —
  but the number should be corrected in the program's known-red list.
- **`packages/tooling` tsc 7 errors** — not reproduced as a separate lane;
  `yarn typecheck` is exit 0. Not investigated; out of scope.

**Maturity reached:** *implemented → focused-validated → aggregate-qualified
(with one known-red link) → **browser-qualified** for the layer-order lane* (real
chromium/firefox/webkit against the packed tarballs). Not packaged, not released,
not CI evidence.

---

## 5. Regenerated / repaired artifacts, and their custody

**`apps/docs` — regenerated once, deliberately, and here is why it was safe.**
Changing `base.css` changes the evidence layer, which reads the layer statement
from that file. `validate:docs-pages --check` named exactly two stale files;
after regeneration the diff against `99b963a` for the two files I own is:

- `apps/docs/evidence/styling-posture.md` — the layer list `dz-tokens, dz-base,
  dz-components` → all six, and the `base.css` sha256.
- `apps/docs/.vitepress/generated/nav.json` — the same sha256, the artifact
  digest, and `sourceCommit` `6f1f653` → `99b963a` (it was stamped at a commit
  two behind HEAD).

`DzProvider.md` and `seeds.json` also differ from HEAD, and **that content is the
other session's, not mine**: `validate:docs-pages --check` was **exit 0** on this
tree before I touched anything, which is only possible if `DzProvider.md` already
carried their `sanitizer` prop. Neither file was listed as stale in the check
that preceded my regeneration.

**`packages/core/manifests/*` and `packages/core/docs/component-meta.json` were
NOT regenerated.** See D10 for the one change that would have required it.

**`packages/tokens/dist` regenerated** by `node --import tsx src/generate.ts`;
`DESIGN.md` re-emitted byte-identical (it is not in `git status`).

**`packages/tooling/src/validators/ownership-manifest.spec.ts` — updated, and it
is worth saying why rather than just that.** Two of its tests asserted that
`row`, `cell` and `body` are *outside* the vocabulary. Folding them in is the
decision this task took, so the tests had to move with it. They were rewritten
onto `decrement`/`increment` (which stayed out on purpose), and a **new** test
asserts `DzTable` is no longer reported — so a name falling back out of the
vocabulary shows up as a failing test rather than as a quiet report.

---

## 6. Ratchet movements

| Ratchet | Old | New | Direction |
|---|---|---|---|
| **cascade layers shipped (of 6)** | **3** | **6** | ✅ complete |
| ADR-19 divergences (packet §4) | 13 | **0** | ✅ closed |
| `maxUndeclaredEmissions` | 3 | 3 | unchanged — blocked on S1-D4 |
| `maxUnemittedDeclarations` | 0 | 0 | at floor |
| `maxUndeclaredStates` | *(did not exist)* | **1** | new, initialised at the measured value |
| `maxStatesWithoutAnatomy` | *(did not exist)* | **88** | new, initialised at the measured value |
| `maxUnreviewedPartNames` | *(did not exist)* | **0** | new, **at floor from the start** |
| `maxHeldPartNames` | *(did not exist)* | **3** | new, initialised at the measured value |
| part names outside the vocabulary | 14 (all unreviewed) | 14 → **0 unreviewed**, 4 reviewed extensions, 3 held | ✅ |
| `ANATOMY_PART_VOCABULARY` size | 30 | **37** | grown once, deliberately |
| `validate:all` chain length | 37 | **38** | +`validate:vendor-sublayers` |
| VERSIONING.md `[!owner]` reconciliations | 3 | **0** | ✅ |
| `maxWithoutAnatomy` | 113 | 113 | untouched — TASK-R5-O2's lane |
| `maxUndocumented` (ADR debt) | 14 | 14 | untouched; §7 of the packet is right that acceptance moves it by zero |

**A new ceiling is not a ratchet movement.** Four of the rows above are ceilings
that did not exist before, initialised at what the tree actually measures. They
are only worth anything as they fall.

---

## 7. Owner decisions raised

*(D1–D8 are taken — D1–D5 by TASK-R3-O1, D6–D8 by TASK-R3-O2, which numbered its own while this task ran. These start at D9.)*

### **D9 — the second ordering statement in `tokens.css`: keep it, or make `base.css` the only one?**

**What I did:** emitted the full six-slot statement in **both** published
stylesheets, and fixed a CSS-scanner bug in `dtcg-round-trip.ts` that this
exposed.

- **Option A (implemented) — both sheets carry it.** The shipped order is
  identical regardless of which sheet a bundler emits first. Cost: the ordering
  is written in two places, and a future change must edit both; and it required
  the scanner fix.
- **Option B — `base.css` only.** One statement, matching
  `read-evidence.ts`'s comment ("the single `@layer` statement"). Cost: if
  `tokens.css` loads first, the shipped order becomes
  `dz-tokens, dz-reset, dz-base, …` — harmless today because `dz-tokens` and
  `dz-reset` are disjoint, but it is an order the ADR does not decide, arrived at
  by emit order.
- **Option C — a generated shared constant** both sheets emit from, so the two
  cannot drift.

**Recommendation: keep A now, file C as cheap follow-up.** A shipped order that
depends on bundler emit order is exactly the class of thing this ADR exists to
remove; C removes A's only real cost.

### **D10 — `ariaInvalid`: when does the *removal* from `BaseAccessibilityProps` happen?**

**What I did:** added it to `BaseValidationProps` (its correct home) and left the
deprecated declaration in place, so the change is additive and **no component's
prop surface moves**.

**Why I did not do the full move.** It removes `ariaInvalid` from **30
components** that reference it with no validation base — measured on `99b963a`:
`DzCard`, `DzAnimatedNumber`, `DzCalendar`, `DzCountdown`, `DzDataView`,
`DzInfiniteScroll`, `DzBlockUI`, `DzToast`, `DzCheckbox`, `DzCheckboxGroup`,
`DzFloatLabel`, `DzInplace`, `DzRadio`, `DzRadioGroup`, `DzSwitch`,
`DzInputGroup`, `DzDeferredContent`, `DzGrid`, `DzStack`, `DzAnchor`,
`DzBreadcrumb`, `DzPagination`, `DzSidebar`, `DzSidebarItem`, `DzStepper`,
`DzTabs`, `DzCommandPalette`, `DzDialogContent`, `DzPopconfirm`, `DzTour`.
Six of those genuinely forward `aria-invalid` and would need `BaseValidationProps`
(which also brings `invalid`/`error`/`required` — a larger API change than "move
one prop"); the rest declare it and never forward it. It also requires
regenerating `component-meta.json` (97 references), `llms{,-full}.txt` and the
docs pages — **artifacts a concurrent session was holding, which this task was
explicitly told not to fold their work into.**

- **Option A — do it now** as its own change, once the manifests are free.
  `minor` (breaking at `0.x`). Cost: ~35 files + 4 generated artifacts + a
  per-component judgement on whether the capability is kept.
- **Option B (implemented, and my recommendation as the first step)** — additive
  now, removal as a named follow-up packet.
- **Option C — abandon the move** and keep the nine `Omit<>` sites permanently.
  Cheapest, and it leaves N5-02 **D1** as a standing wart in the base-prop shape.

**Recommendation: B now, then A as its own packet** — scheduled when
`component-meta.json` is not held, and paired with the `Omit<>` removals so the
whole correction lands in one changeset instead of two half-states.

### **D11 — `maxUndeclaredStates` starts at 1, not 0. Close it, or ratchet it?**

`DzTableRow.vue:99` emits `data-state="expanded"` on the expansion row;
`DzTable`, the parent that owns the compound part, declares
`ready | loading | selected`.

- **Option A — add `'expanded'` to `DzTable.anatomy.ts`** and set the ceiling to
  0. Correct, and one line. **Blocked here:** the ownership manifest records the
  `states` array, so the source edit alone makes `validate:ownership` stale, and
  regenerating it was forbidden for this task.
- **Option B (implemented)** — ceiling 1, population named in the ceilings file
  with the exit condition written into it.
- **Option C — stop emitting `expanded`.** Rejected: it removes a public DOM
  signal, which is breaking, to avoid declaring it.

**Recommendation: A, in the next change that legitimately regenerates the
ownership manifest** — most naturally TASK-R5-O2, which regenerates it anyway.

### **D12 — the recipe-attribute gate (D19-6) is still not built.**

ADR-19 §4 declares `data-size/variant/tone/density/orientation` public and now
*says* nothing measures them. The gap is unmeasured — the ADR's own "most of
them" was never checked.

- **Option A — build it with the `data-scope` emitter as one `useAnatomy()`
  attribute bag** (both want the same mechanism; separately, each hand-writes a
  per-node attribute, which is the failure this program has recorded five times).
- **Option B — build the reporter alone now**, defer the emitter. Gets the number
  onto the table this week.
- **Option C — drop the clause from §4** and stop calling the recipe attributes
  public. Cheapest and the least honest: `core.css` already selects on them
  (`.dz-panel[data-size=lg]`), so the surface is public whether or not the ADR
  says so.

**Recommendation: B then A.** Measure first — nobody can size A without the
number, and B is a small validator.

### **D13 — the program's known-red list is stale in two places.**

Measured at `99b963a`: `eslint e2e/` is **53 errors, not 9**, none in the lane
this task added; and `validate:ownership` is **green**, not red.

- **Option A — correct the list in the program README from these measurements.**
- **Option B — re-measure the whole known-red list first**, since two of five
  entries were wrong and the `packages/tooling` tsc-7 entry was not reproduced by
  `yarn typecheck` either.

**Recommendation: B.** A known-red list that is wrong in two of five places is a
list that will be used to wave through a real regression.

---

## 8. Ranked next packet

1. **TASK-R0-O2 — ADR-19 acceptance.** Unblocked: the four code divergences are
   closed, the ADR text matches the code, and the `data-scope` sheet is in front
   of the owner. The remaining `[!owner]` items are D-A (`data-scope`, sheet
   ready), D-E (copy ADR-17 in, ceiling 14 → 13), and D-G (`DzOptionsState`).
2. **D11 — close `maxUndeclaredStates` to 0** inside the next change that
   regenerates the ownership manifest. One line plus a regeneration.
3. **TASK-R5-O2 — the anatomy rollout.** It now has two more ceilings to drive
   down (`maxStatesWithoutAnatomy` 88, `maxWithoutAnatomy` 113), and every
   component it reaches moves values from the second ceiling under the first.
4. **D12 option B — the recipe-attribute reporter.** Small, and it produces the
   number that sizes the `useAnatomy()` packet.
5. **S1-D4 — `DzOptionsState`'s disposition.** Blocks the 28-component `forms`
   family, `maxUndeclaredEmissions: 3` and `maxHeldPartNames: 3` — three ratchets
   on one decision.
6. **D10 option A — the `ariaInvalid` removal**, scheduled when
   `component-meta.json` is not held.
7. **D13 — re-measure the known-red list.**

---

## 9. Custody — `git status --short`, start and end

**Start (~15:20 local, before any edit — 22 modified, 4 untracked):**

```
 M CLAUDE.md
 M apps/landing/vite/serve-storybook.ts
 M docs/adr/ADR-20-provider-contract.md
 M docs/program-2026-09/README.md
 M docs/program-2026-09/reports/N5-05-adr-20-acceptance-packet.md
 M packages/contracts/src/index.ts
 M packages/contracts/src/provider.types.ts
 M packages/core/docs/component-meta.json
 M packages/core/manifests/component-ownership.manifest.json
 M packages/core/manifests/public-api.manifest.json
 M packages/core/src/composables/provider/index.ts
 M packages/core/src/composables/provider/provider.spec.ts
 M packages/core/src/providers/DzProvider.contract.spec.ts
 M packages/core/src/providers/DzProvider.spec.ts
 M packages/core/src/providers/DzProvider.types.ts
 M packages/core/src/providers/DzProvider.vue
 M packages/core/tests/ssr/dz-provider-ssr.spec.ts
 M packages/core/tests/ssr/provider-ssr.spec.ts
 M packages/nuxt/src/module.pro.spec.ts
 M packages/nuxt/src/module.ts
 M packages/tooling/README.md
 M packages/tooling/scripts/adr-registry.json
?? .changeset/one-place-to-configure-how-html-is-sanitized.md
?? docs/program-2026-09-04/
?? packages/core/src/composables/provider/useDzSanitizer.ts
?? packages/core/src/security/
```

**End (44 modified, 9 untracked).** Everything above is still present and
unmodified by this task, except `packages/contracts/src/index.ts` — see below.
**Added by TASK-R5-O1:**

```
 M apps/docs/.vitepress/generated/nav.json          (regenerated; see §5)
 M apps/docs/evidence/styling-posture.md            (regenerated; see §5)
 M apps/storybook/stories/Versioning.mdx
 M docs/adr/ADR-19-public-styling-contract.md
 M package.json
 M packages/contracts/VERSIONING.md
 M packages/contracts/src/anatomy.types.ts
 M packages/contracts/src/data-attributes.types.ts
 M packages/contracts/src/index.ts                  (ONE additive export line)
 M packages/contracts/src/props.types.ts
 M packages/core/src/styles/base.css
 M packages/tokens/TOKENS.md
 M packages/tokens/src/generate.ts
 M packages/tooling/src/token-checks/dtcg-round-trip.spec.ts
 M packages/tooling/src/token-checks/dtcg-round-trip.ts
 M packages/tooling/src/validators/anatomy-parts-ceilings.json
 M packages/tooling/src/validators/anatomy-parts.ts
 M packages/tooling/src/validators/ownership-manifest.spec.ts
 M playwright.config.ts
?? .changeset/the-six-cascade-layers-the-styling-contract-promised.md
?? e2e/styling/
?? packages/core/src/styles/vendor-registry.json
?? packages/tooling/src/validators/vendor-sublayers.spec.ts
?? packages/tooling/src/validators/vendor-sublayers.ts
```

`packages/core/docs/llms.txt` and `packages/core/docs/llms-full.txt` also appear
as modified and are **not** in the start snapshot: the concurrent session
regenerated them mid-task. They were not touched here.

`apps/docs/components/DzProvider.md` and
`apps/docs/public/playground/seeds.json` also appear as modified. Their content
is the other session's (§5); `seeds.json`'s only change from this task is a
`sourceCommit` stamp moving to HEAD.

**`packages/contracts/src/index.ts` — the shared file, as agreed under D5.**
Before: 18 insertions / 3 deletions (theirs). After: 19 / 4. The single edit is
`export { ANATOMY_PART_VOCABULARY }` → `export { ANATOMY_PART_EXTENSIONS,
ANATOMY_PART_VOCABULARY }` on line 19. `git diff` re-checked afterwards:
`DzSanitizerAdapter` and the rest of their export block are intact.

**Nothing was reverted, stashed, cleaned or committed.** `DzButton.vue` was
edited to prove a gate and restored to a clean `git status`. The ownership
manifest, `component-meta.json`, `public-api.manifest.json` and
`llms{,-full}.txt` were **not** regenerated.

---

*Companion sheet: `TASK-R5-O1-data-scope-decision.md`.
Subject of the work: `docs/program-2026-09/reports/N5-05-adr-19-acceptance-packet.md`.*
