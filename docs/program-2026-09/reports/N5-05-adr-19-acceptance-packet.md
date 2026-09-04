# TASK-N5-05 — ADR-19 acceptance packet (public styling contract)

- **Prepared by:** TASK-N5-05, 2026-09-03, on `main` @ `6f1f653` (dirty worktree,
  ~85 entries, none of them this packet's — see *Custody*).
- **Subject:** `docs/adr/ADR-19-public-styling-contract.md`
- **Status of the subject at the time of writing:** **Proposed**
  (TASK-OSS-P3-01, 2026-08-20). **This packet does not change it.**
- **Decision requested:** Accept, Accept-with-amendments, or Reject. The
  unsigned line is §8.

> **Read this first.** The task brief for this packet carried three figures.
> **All three were stale**, and one of the two claims it asked me to verify is
> false in a way that changes what acceptance is worth. See §1 and §7.

---

## 0. Custody

`main` @ `6f1f653`, 0 ahead / 0 behind `origin/main`. The worktree carries ~85
uncommitted entries from TASK-N5-01, N5-02 and N5-03; **TASK-N5-03 was running
concurrently in this same worktree while this packet was written.** Nothing was
reverted, stashed, cleaned or committed. No file owned by N5-03 was read for
edit or written. `yarn validate:all` was **not** run — N5-03 owns the aggregate
ladder this round and a concurrent regeneration would corrupt its reading. Every
command in this packet is narrow and read-only except the two gate runs in §6,
neither of which writes.

**No ADR status was flipped, and no ADR file was edited.** See §9 for why the
consequence text is proposed here rather than written in.

---

## 1. Measured-vs-claimed — every figure re-measured

N2-S1 §1 established that this program's briefs have been wrong about counts
more often than right (five of six figures in its own brief were wrong). Nothing
below is inherited.

| # | Claimed | Measured on `6f1f653` | Verdict |
|---|---|---|---|
| 1 | "5 `ui`-prop pilots" | **27 declarations** of `ui?:` in `packages/core/src/**/*.types.ts` — **26 public components + 1 compound part** (`DzDialogContentProps.ui?: DzDialogContentUi`, declared inside `DzDialog.types.ts`; `DzDialog` itself has no `ui`). | **Stale by 22.** "5 pilots" is the P3-03 figure from 2026-08-21, and N2-S1 §1 row 6 had already corrected it to 4 public + 1 compound part. TASK-N2-S1 then added 22. |
| 2 | "9 anatomy files" | **32 `.anatomy.ts` files** — 31 public components + `DzDialogContent.anatomy.ts` (compound part). | **Stale by 23.** "9" is the pre-N2-S1 count. N2-S1 landed 23 declarations in one change. |
| 3 | "ten context composables" | **10.** Nine `useDz*` in `packages/core/src/composables/provider/` plus `useDzTheme`, re-exported from `provider/index.ts:34` as `useTheme`. | **Correct.** The only inherited figure in this program's briefs that survived re-measurement unchanged. (Detail in the ADR-20 packet §1.) |
| 4 | "14 undocumented ADRs cited in code" | **14**, and the ceiling is real — but it is **not what acceptance moves**. See §7. | **Correct as a number, misleading as a lever.** |

**Derived figures, measured, not inherited:**

| Quantity | Value | Source |
|---|---|---|
| `data-part` emissions (static) | **118**, across **37** components, **36** distinct names | `yarn validate:anatomy-parts`, exit 0 |
| Anatomy declarations seen by that gate | **32** | same run |
| Undeclared emissions | **3 / ceiling 3** (all `DzOptionsState`) | same run |
| Declared-but-unemitted | **0 / ceiling 0** | same run |
| `maxWithoutAnatomy` ratchet | **113** (from 142 → 138 → 137 → 136 → 113) | `packages/tooling/src/ownership/unclassified-ceiling.json` |
| Public components | 144 | ratchet denominator |
| Cascade layers actually shipped | **3** of the 6 the ADR decides | `packages/core/src/styles/base.css:29` |
| `!important` in library CSS | **3 rules / 6 declarations** | `packages/core/src/styles/base.css` |
| Part names outside the §3 vocabulary | **13**, across 7 components | `validate:anatomy-parts` report block |
| `parts: 'none'` declarations | 9 | `packages/core/src` |
| Dual-emit `TODO(remove-after:` markers | 4 | `packages/**` |

---

## 2. What ADR-19 decided

Six decisions, each independently acceptable or rejectable.

| § | Decision | One-line summary |
|---|---|---|
| **1** | Token interchange | `--dz-*` is the contract; the TypeScript token maps are the source of truth; **DTCG is a named prerequisite (P3-00), not a claim**, and until it exists no document may call DTCG this library's token authority. |
| **2** | Cascade layers | Six slots — `@layer dz-reset, dz-tokens, dz-base, dz-components, dz-utilities, dz-overrides;` — **keeping the shipped hyphenated names**, explicitly rejecting the dotted `dz.*` form as a consumer-breaking rename. Nothing the library ships is unlayered (two recorded exceptions: the print block and `.dz-prose`). A consumer override never needs `!important`. |
| **3** | Parts | Every public component's stable anatomy nodes carry `data-part="<name>"`, kebab-case, from a shared 30-name vocabulary; root is always `root`; `'none'` is reserved for renderless components; parts promise **identity, not structure**; **Reka internals never become parts**. |
| **4** | States | `data-state` is a **per-component enum** declared in the anatomy; the global `DataState` union **stops being a closed list** and `DataAttributes['data-state']` **widens to `string`**; boolean states are presence-only; recipe attributes (`data-size/variant/tone/density/orientation`) are public and mirror the *resolved* value. |
| **5** | Typed overrides | The prop is **`ui`**, typed `Partial<Record<Part, DzClassValue>>`; `class` keeps root-only meaning; `DzClassValue` is declared structurally in contracts, not imported from `clsx`. |
| **6** | Migration | Dual-emit for one minor series with `TODO(remove-after: <version>)`; **removal is a major**; adding parts/states/`ui` is additive and minor; the `DataState` widening is a type-level widening and ships as a minor. |

Plus: a **Prerequisite packet** (P3-00, DTCG emit), a **Rollout** of five steps,
and a **Validation hooks** table of five rows.

---

## 3. What shipped against it — file evidence

### 3.1 Delivered, and matching the ADR

| ADR clause | Evidence | Measured |
|---|---|---|
| §3 `data-part` rollout | 32 `.anatomy.ts` files (list in §1); `packages/contracts/src/anatomy.types.ts` declares `ComponentAnatomy`, `AnatomyPart`, `ANATOMY_PART_VOCABULARY` | 118 emissions / 37 components / 32 declarations |
| §3 root universality | `parts: 'none'` used 9× for renderless components incl. both providers | 9 |
| §5 the prop is `ui` | `packages/contracts/src/anatomy.types.ts:263` `DzClassValue`, `:279` `UiOverrides = Partial<Record<AnatomyPart<TAnatomy>, DzClassValue>>` | 27 declarations |
| §5 `DzClassValue` structural, not from `clsx` | `anatomy.types.ts:263-270` — a structural recursive union; `@dzup-ui/contracts` keeps zero runtime deps | ✓ |
| §5 typed against the component's own parts | `packages/contracts/src/anatomy.types.spec.ts:82` asserts `Partial<Record<'root' \| 'spinner', DzClassValue>>` for DzButton | ✓ |
| §2 keeping hyphenated names | `base.css:29`, `packages/tokens/src/generate.ts:107` both emit `dz-*`, not `dz.*` | ✓ — the rename was correctly refused |
| §6 dual-emit marker convention | 4 `TODO(remove-after:` markers in `packages/**` | ✓ |
| Ratchet discipline | `unclassified-ceiling.json:maxWithoutAnatomy` 142 → 113, one direction only, each step reasoned in the file | ✓ |
| Validation hook row 4 (`validate:tokens`) | `package.json:96`, in `validate:all` | ✓ pre-existing |
| **Prerequisite P3-00 (DTCG)** | `packages/tokens/src/dtcg.ts`, `src/generate-dtcg.ts`, `src/dtcg.spec.ts`, `dist/tokens.dtcg.json`, `packages/tooling/src/token-checks/dtcg-round-trip.spec.ts`, `validate:tokens:dtcg` wired into `validate:all` | **Discharged by TASK-N2-T1** — the ADR still says it does not exist |

### 3.2 The gate the ADR did not name, which is the one that works

`yarn validate:anatomy-parts` (`packages/tooling/src/validators/anatomy-parts.ts`,
built by TASK-N2-S1) is the source-level parts gate, wired into `validate:all`.
It is **not** the gate ADR-19's hook table assigns the job to — see D19-5.

Its two ratchets live in
`packages/tooling/src/validators/anatomy-parts-ceilings.json`:
`maxUndeclaredEmissions: 3`, `maxUnemittedDeclarations: 0`.

### 3.3 The `ui` override e2e

`e2e/components/styling-overrides.spec.ts`, 141 lines, 7 tests:
a brand theme through tokens · a component token scoping to one instance ·
`ui` beating the component recipe · `ui` reaching a **portaled listbox** ·
`ui` reaching a **dialog backdrop** · no override fixture needs `!important` ·
the library ships no `.dz-*` `!important` an override must fight.

**Zero of the seven mention `dz-overrides`** (`grep -c 'dz-overrides'` → `0`).
That is not an omission in the test — it is D19-2.

---

## 4. Divergence table

Thirteen. Each carries an **amend-ADR** or **fix-code** recommendation.
🔴 = acceptance should not proceed without resolving it; 🟠 = resolve at
acceptance; 🟢 = record and move.

| # | Divergence | ADR text vs code behaviour | Amend / fix | Recommendation |
|---|---|---|---|---|
| **D19-1** 🔴 | **The `DataState` widening never happened.** | ADR §4: *"The global `DataState` union in `@dzup-ui/contracts` **stops being a closed list**… `DataAttributes['data-state']` **widens to `string`**"*. Code: `packages/contracts/src/data-attributes.types.ts:17-25` is still the closed 8-value union (`open\|closed\|active\|inactive\|checked\|unchecked\|indeterminate\|selected`) and `:39` still reads `'data-state'?: DataState`. `packages/core/src/components/buttons/DzButton.vue:176` still emits `loading \| disabled \| idle` — **none of the three is in the union.** The only working-tree change to that file is an unrelated `.js` import-extension fix. | **fix-code** | **Do the widening before acceptance.** This is not a peripheral clause: ADR-19 §4 argues *"a union that a shipped component already violates is not a contract"*, and that sentence is still literally true of the code 14 days later. Accepting §4 as written blesses a decision whose own load-bearing act was never performed. Two lines in one file. **Under `VERSIONING.md` §2.1 this is now a `patch`, not the `minor` ADR-19 §6 predicts** — see D19-4. |
| **D19-2** 🔴 | **Three of the six cascade layers do not exist.** | ADR §2 decides `@layer dz-reset, dz-tokens, dz-base, dz-components, dz-utilities, dz-overrides;`. Code: `packages/core/src/styles/base.css:29` declares `@layer dz-tokens, dz-base, dz-components;` and `packages/tokens/src/generate.ts:107` opens `@layer dz-tokens`. **`dz-reset`, `dz-utilities` and `dz-overrides` appear nowhere in `packages/`** — the only hit repo-wide is prose in `packages/contracts/VERSIONING.md`. §2's own table says `dz-reset` *"moves in P3-03"*; it did not move. | **fix-code** | **Extend the layer statement before acceptance.** It is a one-line, purely additive change to two files and the ADR already argues it is safe. Note the failure is *quiet*: a consumer writing `@layer dz-overrides { … }` today still wins, because an unregistered layer is appended after all registered ones — so the intended behaviour holds **by accident of append order, not by contract**, and it silently stops holding the moment the library registers any new layer after `dz-components`. |
| **D19-3** 🔴 | **A Consequences bullet asserts something untrue.** | ADR Consequences: *"Consumers gain `dz-overrides` immediately as a documented place to write, with no library change required — the layer statement is additive."* The layer statement was never made additive; `dz-overrides` is documented nowhere in the library's CSS. | **amend-ADR** (if D19-2 is fixed, delete instead) | **Resolve by fixing D19-2**, which makes the bullet true. If the owner declines the layer change, the bullet must be struck — it is the one sentence in the ADR that promises a consumer-visible capability that does not exist. |
| **D19-4** 🟠 | **§6 says removal is a "major", which is wrong for a 0.x library.** | ADR §6: *"Removal is a **major** change and needs its own changeset."* `packages/contracts/VERSIONING.md` §1: before 1.0, `major` means `1.0.0`. Read literally, **ADR-19 forbids removing a part until the library is stable.** Recorded by TASK-N5-01 as **D4**, which deliberately did not edit the ADR. | **amend-ADR** | **Amend, exactly as `VERSIONING.md` §7.2 proposes:** *"breaking, and therefore a **minor** while the library is 0.x."* The same amendment carries a second half: §6's claim that the `DataState` widening *"ships as a minor"* is also wrong — under `VERSIONING.md` §2.1 a type-level widening is a **patch**. Wording change, not a change of intent. |
| **D19-5** 🟠 | **The ADR's own validation hook was never built where the ADR puts it.** | ADR *Validation hooks* row 2 assigns to `validate:contract-parity` (extended, by P3-02): *"declared parts/states exist in rendered DOM; no undeclared `data-part`"*. Measured: `packages/tooling/src/validators/contract-parity.ts` contains **0 occurrences of the string `anatomy`**. The job is done instead by `validate:anatomy-parts` (TASK-N2-S1), at **source level** rather than rendered-DOM level. N2-S1 **S1-F6**. | **amend-ADR** | **Retarget the row** to `validate:anatomy-parts`, and record that it checks **source** not rendered DOM — a strictly stronger reading (it sees every template branch, and components the manifest does not know about), which is how `DzSelect`'s three undeclared parts were found after sitting in a *pilot* for the life of the pilot. The rendered-DOM half remains with `expectAnatomy`. |
| **D19-6** 🟠 | **§4's recipe-attribute reporting does not exist.** | ADR §4: *"A component that accepts one of these props emits the matching attribute on its root; **P3-02's validator reports the ones that do not** (today: most of them)."* Measured: `anatomy-parts.ts` contains **0** references to `data-size`, `data-variant`, `data-tone`, `data-density` or `data-orientation`. No gate anywhere reports the gap. | **amend-ADR**, then fix-code | **Amend §4 to state the clause is unenforced**, and file the validator as a follow-up. This matters more than it looks: §2's *opening argument* for the whole ADR is that `core.css` already ships `.dz-panel[data-size=lg]` and `.dz-toolbar[data-variant=elevated]`, i.e. **the recipe attributes are already a public surface**. Accepting §4 while nothing measures that surface accepts the one clause whose baseline the ADR itself calls *"most of them"*. N2-S1 §10 rank 4 names `layout` as the family where this gap is largest. |
| **D19-7** 🟠 | **The override e2e covers half the hook.** | ADR *Validation hooks* row 5: *"computed styles change through `ui` **and `dz-overrides`** with no `!important` in the fixture."* `e2e/components/styling-overrides.spec.ts` has 7 tests covering `ui` (incl. portaled and dialog cases) and the `!important` audit; **`dz-overrides` appears 0 times.** | **fix-code** (with D19-2) | **Resolve with D19-2** — the layer cannot be tested until it is declared. Add one e2e asserting a `@layer dz-overrides` rule beats `dz-components` without `!important`. Note the fixture is Playwright and therefore **not** in `validate:all`; per repo convention its result is browser-qualified evidence only when actually run, and **this packet did not run it.** |
| **D19-8** 🟢 | **The `!important` inventory is short by one rule.** | ADR §2: *"the two present today (`.dz-tab-close-btn`, `.dz-field-input-reset`) are recorded as debt for P3-03"*. Measured in `packages/core/src/styles/base.css`: `.dz-field-input-reset` (`:205-206`, 2 decls), `.dz-native-input:-webkit-autofill` (`:263-265`, **3 decls**), `.dz-tab-close-btn:hover` (`:973`, 1 decl) — **3 rules, 6 declarations.** Both ADR-named rules are still present; neither was paid down by P3-03. | **amend-ADR** | **Correct the count to 3 rules / 6 declarations, and carve out the autofill rule explicitly.** `-webkit-autofill` genuinely cannot be overridden without `!important` — it is a UA-stylesheet special case, not debt — so it belongs beside the print block and `.dz-prose` as a *recorded, permanent* exception rather than in the debt list. The other two stay debt with an owner. |
| **D19-9** 🟢 | **The prerequisite packet has been discharged; the ADR still says it has not.** | ADR §1 and *Prerequisite packet*: *"`@dzup-ui/tokens` has **no DTCG pipeline**… There is no `$value`/`$type` document anywhere in the package… Until it exists, no document, README, or task may describe DTCG as this library's token authority."* Measured: `packages/tokens/src/dtcg.ts`, `src/generate-dtcg.ts`, `src/dtcg.spec.ts`, `dist/tokens.dtcg.json`, a round-trip gate `validate:tokens:dtcg` **in `validate:all`**, and `package.json:32` documenting the emitter as TASK-N2-T1. | **amend-ADR** | **Mark P3-00 discharged and lift the prohibition**, restating it as the narrower true rule the ADR actually wants: *the TypeScript token maps remain the single source of truth; the DTCG document is a generated projection, never a second source.* The prohibition as written now blocks documents from describing a pipeline that exists and is gated. |
| **D19-10** 🟠 | **§3 has no rule for an unexported internal that emits parts.** | ADR §3 covers Reka internals (*"never become parts"*) and compound parts, but not a **library-internal Vue component with no manifest entry**. `DzOptionsState.vue` emits `options-state`, `options-message`, `options-retry` into **7 public components** (`DzCascader`, `DzCombobox`, `DzListbox`, `DzMultiSelect`, `DzSelect`, `DzTransfer`, `DzTreeSelect`) — `DzSelect` is an **ADR-19 pilot** and declares none of them. These are the entire population of `maxUndeclaredEmissions: 3`. N2-S1 **S1-F2 / S1-D4**. | **amend-ADR**, then fix-code | **Amend §3 with the missing rule** — an internal's parts are governed only when *every* host declares them, which is why the ratchet cannot close component-by-component — then take S1-D4 (inline it, make it a compound part with a `parentComponent`, or add an ownership kind for a shared internal) as its own decision. N2-S1 §10 blocks the entire 28-component `forms` family on this. |
| **D19-11** 🟢 | **13 declared part names sit outside §3's vocabulary.** | ADR §3 publishes a 30-name shared vocabulary and says a component *"may declare a name outside it when the vocabulary genuinely has no word for the node; the validator lists such names in its report so the vocabulary can grow deliberately."* **The mechanism works as specified** — verified in the §6 run, which printed all 13: `DzCodeBlock` (`filename`, `language`, `copy-button`, `line-number`), `DzInput`/`DzSearchInput` (`clear`), `DzNumberInput` (`decrement`, `increment`), `DzPasswordInput` (`toggle`), `DzSelect` (`options-state`, `options-message`, `options-retry`), `DzTable` (`body`, `row`, `cell`). | **amend-ADR** | **Not a defect — a decision the mechanism correctly surfaced** (N2-S1 **S1-D1**). Fold the reviewed names into §3's vocabulary at acceptance: `clear`, `toggle`, `filename` and `language` generalise; `decrement`/`increment` are legitimately component-specific; `body`/`row`/`cell` are table-family compound parts already owned by `DzTable`; **the three `options-*` were never reviewed** and read like a namespace — resolve them with D19-10. Renaming a shipped name is breaking, so this is cheapest done now. |
| **D19-12** 🟢 | **§5 does not say whether a compound part may carry `ui` while its parent does not.** | Code: `DzDialog.types.ts:88` declares `ui?: DzDialogContentUi` on `DzDialogContentProps`; **`DzDialog` itself has no `ui` prop.** §5 defines `ui` for "the component's own declared part union" and is silent on the compound-part case. This is why the raw count is 27 and the public-component count is 26. | **amend-ADR** | **Clarify in §5** that a compound part carries `ui` for its own parts and that its parent is not required to. The behaviour is right — `DzDialogContent` owns `overlay`/`content`/`header`/`viewport`/`footer` and `DzDialog` renders no element — but it is undocumented, and it is the exact ambiguity that made "5 pilots" propagate as a wrong number through three briefs. |
| **D19-13** 🟢 | **§3's "identity, not structure" promise is unenforceable by attribute alone.** | ADR §3: *"Parts are a promise about identity."* But `data-part` alone carries no component identity, so identity is true **only by convention**. Two measured failures, both from this program: an earlier `styling-overrides.spec.ts` draft wrote `[data-part="content"]` for a select's listbox and matched a `<table>` two components down (fixed with the structural anchor `[data-part="content"]:has([data-part="item"])`); and `expectAnatomy` reported `part "root" appears 5 times` on `DzSpeedDial` (fixed with a boundary rule). N2-S1 **S1-F3**. | see **§5.1** | This is the `data-scope` question. Folded in below as an open question rather than scored as a divergence, because ADR-19 never claimed to solve it. |

**Split: 8 amend-ADR · 4 fix-code · 1 open question.**
(D19-3 is counted as amend-ADR but is discharged by fixing D19-2; D19-6 and
D19-10 are amend-then-fix and are counted at their first action.)

---

## 5. Open questions folded in from this program

### 5.1 `data-scope` — S1-D2 / S1-D6, filed by N2-S1 §11 explicitly as this packet's input

**The question.** Ark UI / Zag emit `data-scope="<machine>"` beside every
`data-part`, so a selector reads `[data-scope=select][data-part=trigger]`.
dzup-ui emits `data-part` alone. Should it mark identity too?

**For.** The one case structure demonstrably cannot fix: `DzTooltipTrigger`
merges its attributes **onto its child**, so `DzRelativeTime`'s
`<time data-part="root">` also carries the tooltip's `data-state="closed"`.
One element, two components' state. No boundary rule can separate them because
there is no nested element to stop at. Declaring `open`/`closed` in
`DzRelativeTime` would document another component's lifecycle as its own;
silencing the check would remove the rule that found it. A scope marker
separates them; nothing else does. It would also give the docs site a
copy-pasteable per-component selector, which it currently cannot publish.

**Against.** It is a **second public attribute whose only job is to disambiguate
the first**, proposed on a library where **113 of 144 components have not
declared a first one**. Adding it now doubles the per-node contract before the
per-node contract is finished. Measured DOM cost: 118 `data-part` sites today
across 37 components, ~500+ at full rollout; `DzTable`'s `row` and `cell` repeat
per record, so a large SSR table pays per cell.

**Competitor position (2026 catalogue).** Ark/Zag mark scope; Base UI, Radix/Reka
and Nuxt UI do not — but those three expose parts as *separate components*, so
identity rides on the component boundary. **dzup-ui exposes parts as attributes
on one component's DOM and is the only library in that group that does not mark
scope.**

**The middle option, recorded so it can be rejected explicitly:** emit
`data-scope` only where a component composes another declaring component (~5 % of
nodes). N2-S1 judges it *probably worse than either extreme* — it buys a small
DOM at the cost of a rule a consumer must learn ("scope is present when you need
it").

**Binding constraint whichever way it goes:** the value **must be generated, not
typed**. A hand-written scope per node is the hand-typed-facts class this program
has now recorded five times (P2-02 READMEs, T1-K4, A1-F3, A2-F-3, A2's version
literals). The right shape is one value per component applied once — plausibly a
`useAnatomy(anatomy)` composable returning the attribute bag, **which is also the
natural home for the recipe attributes of D19-6.** Those two are one packet, not
two.

→ **`[!owner]` D-A. Decision required: adopt · defer · refuse.** This packet's
own reading is in §8.

### 5.2 The `DataState` widening — D19-1, restated as the question it really is

The widening is not a loose end; it is §4's central act, and it is the clause
most exposed to the "acceptance of an ADR that silently mismatches its
implementation is worse than Proposed status" rule. The owner has three options
and only the first preserves §4's argument:

1. **Widen, then accept.** Two lines in `data-attributes.types.ts`. A `patch`
   under `VERSIONING.md` §2.1.
2. **Accept §4 as a forward commitment**, with the widening booked as a named,
   dated follow-up in the Consequences. Honest, but the ADR then documents a
   contract the code contradicts on the day it is accepted.
3. **Reject §4** and keep the closed union — which ADR-19 itself pre-rejects
   under *Alternatives considered* (*"the fix would be to invent a wrong value
   rather than to admit the union does not generalise"*), and which leaves
   `DzButton` in violation.

### 5.3 The hyphenated layer names kept for compat — §2, and why it is the clause to keep

§2 refuses the reassessment's dotted `dz.*` spelling because `@layer dz.components`
is a *sublayer `components` inside a layer `dz`* — a different layer from the
shipped top-level `dz-components`, not a re-spelling. Adopting it would move every
existing rule into new layers and silently reorder any consumer sheet already
writing `@layer dz-components { … }`.

**Measured: the refusal held.** Every `@layer` statement in the repository uses
the hyphenated form (`base.css:29`, `base.css:35`, `base.css:474`,
`generate.ts:107`, `dtcg-round-trip.spec.ts:26`). No dotted form exists.

**This is the clause with the clearest evidence for acceptance** — a
consumer-breaking rename was correctly identified and refused, and the ordering
the reassessment asked for is still delivered by the six-slot statement. The only
qualification is D19-2: **the six slots the clause delivers were never actually
declared.** Accepting §2 is accepting a good decision that is three-sixths
implemented.

### 5.4 Contracts base-prop shape — N5-02 **D1**, noted where it bears

N5-02 **F2** found `ariaInvalid` living in `BaseAccessibilityProps` (the
*labelling* base) rather than `BaseValidationProps` beside `invalid`, `error`
and `required` — so every component wanting a name inherits a validity claim it
usually cannot keep. Six controls tripped over it; the fix was
`Omit<BaseAccessibilityProps, 'ariaInvalid'>` at nine points of use.

**Bearing on ADR-19: indirect but real.** ADR-19 §5 puts `DzClassValue` and
`UiOverrides` in `@dzup-ui/contracts` and argues from *what a types package
should know about*. N5-02 D1 is the same question one level down — **which base
interface a prop belongs to** — and it is currently answered wrongly for at
least one prop, on the same package, with `Omit<>` standing in at nine call
sites. Accepting §5 does not depend on it, but an owner reviewing contracts'
shape should see both in the same sitting. **Not a divergence; carried as
context.**

---

## 6. What was run

Narrow, read-only, exit codes observed directly — no pipe, no `echo $?` wrapper.

| Command | Exit | Output |
|---|---|---|
| `npx tsx packages/tooling/src/validators/anatomy-parts.ts` | **0** | `✓ anatomy-parts: 118 data-part emissions across 37 components (36 distinct names, 32 anatomy declarations); 3/3 undeclared, 0/0 declared-but-unemitted` + the 3 `DzOptionsState` names + the 13 out-of-vocabulary names |
| `npx tsx packages/tooling/scripts/validate-adr-references.ts` | **0** | `✓ adr-references: 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)` |

**Not run, and why:**

- **`yarn validate:all` — deliberately not run.** TASK-N5-03 owns the aggregate
  ladder this round and was executing concurrently in this worktree; a
  concurrent regeneration would corrupt its reading. This packet therefore
  offers **no aggregate-qualified claim**, and per repo convention the two runs
  above are **locally qualified only** — not CI, release or production evidence.
- **`yarn test` — deliberately not run.** Its `test:prepare` step runs
  `tokens:generate`, which rewrites `DESIGN.md` and regenerates token artifacts.
  Same reason.
- **`e2e/components/styling-overrides.spec.ts` — not run.** Playwright, not in
  `validate:all`, and browser evidence is not this packet's to produce. D19-7's
  claim is from reading the file, not from a run.
- **N5-03's aggregate ladder result is not reproduced or predicted here.**

---

## 7. The ratchet — what acceptance does and does not move

The packet requirement reads: *"acceptance lowers the ADR-debt ceiling (currently
14 undocumented ADRs cited in code) only when the decision is recorded in the ADR
file itself."*

**Measured, and the framing needs correcting.**

The ceiling is `maxUndocumented: 14` in
`packages/tooling/scripts/adr-registry.json`, enforced by
`packages/tooling/scripts/validate-adr-references.ts` (wired into `validate:all`
at `package.json:129`). The gate prints:

```
✓ adr-references: 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)
```

**The three documented ADRs are 18, 19 and 20.** ADR-19 and ADR-20 are already
*out* of the debt ledger, and have been since the day their files were written.

Therefore:

- **Accepting ADR-19 moves the ceiling by exactly 0.** Not "only when recorded in
  the ADR file" — **not at all, under any condition.** The registry counts
  *documents on disk*, and ADR-19 has had one since 2026-08-20.
- **`validate-adr-references.ts` is status-blind.** It contains no reading of
  `Proposed`, `Accepted` or `Rejected` anywhere. Nothing in the repository
  measures, gates or ratchets ADR *status*. An ADR can sit Proposed forever at
  no cost to any gate.
- **What would lower the ceiling** is writing a document for one of the 14
  registry-only ADRs and deleting its entry and lowering `maxUndocumented` in
  the same change. Rule 3 of the validator enforces exactly that, and rule 4
  fails if an entry survives after nothing cites it.

**The finding that follows, and it runs the other way from the requirement:**
ADR-19 declares itself as *"Extends: ADR-04 (token-only styling), ADR-17 (token
source of truth)"*. **Both ADR-04 and ADR-17 are in the debt ledger** — cited,
undocumented, recorded only as a row in `CLAUDE.md`. ADR-17's entry additionally
records that a document *exists outside this repository* at
`workspace-docs/repos/dzup-ui/docs/adr/` and *"has never been copied in"*.

So accepting ADR-19 **promotes a decision built on two undocumented decisions**.
That does not block acceptance — ADR-19 is self-contained and its clauses are
decidable on their own text — but it means acceptance makes the debt *more*
load-bearing, not less. Copying ADR-17 in is a file move that would take the
ceiling 14 → 13 and is the cheapest debt payment available in the repository.

→ **`[!owner]` D-E**, §8.

---

## 8. The decision line

> **`[!owner]`  ADR-19 — Public styling contract: layers, parts, states, and typed overrides**
>
> ☐ **Accepted**  ☐ **Accepted with amendments** (list) ☐ **Rejected**
>
> Signed: ______________________  Date: ____________
>
> *Unsigned. TASK-N5-05 does not set an ADR status, and did not edit
> `docs/adr/ADR-19-public-styling-contract.md`.*

### The decisions that line depends on

| # | `[!owner]` decision | Blocking? | This packet's reading |
|---|---|---|---|
| **D-A** | **`data-scope`: adopt · defer · refuse** (S1-D2/S1-D6, §5.1) | No — ADR-19 never claimed it | **Defer**, with the residual `DzRelativeTime` case recorded in §3 as a known limit. The argument against is arithmetic: 113 of 144 components have no first attribute. Revisit when the rollout closes, and **build it with the recipe-attribute emitter (D19-6) as one `useAnatomy()` packet**, generated not typed. |
| **D-B** | **`DataState`: widen-then-accept · accept-as-commitment · reject §4** (D19-1, §5.2) | **Yes** | **Widen, then accept.** Two lines, a `patch`, and it is the clause the ADR's own reasoning rests on. |
| **D-C** | **Declare the three missing layers, or strike the Consequences bullet** (D19-2/D19-3) | **Yes** | **Declare them.** One additive line in two files; the alternative is shipping an ADR whose Consequences promise a layer the CSS never names. |
| **D-D** | **Amend §6's release wording** to `VERSIONING.md` §7.2's text — removal is *breaking, therefore a minor at 0.x*; the `DataState` widening is a *patch* (D19-4, N5-01 D4) | No, but do it at acceptance | **Amend.** Wording only; intent unchanged. Leaving it makes ADR-19 forbid part removal until 1.0. |
| **D-E** | **Copy ADR-17 into `docs/adr/` and take the ceiling 14 → 13** (§7) | No | **Do it.** ADR-19 extends ADR-17; the document already exists outside the repo. Cheapest debt payment available, and it is the only action in this packet's scope that moves the ceiling at all. |
| **D-F** | **Fold the reviewed out-of-vocabulary part names into §3** (D19-11, S1-D1) | No | **Fold them in at acceptance.** Renaming a shipped part name is breaking, so the cost only rises. Hold the three `options-*` for D19-10. |
| **D-G** | **`DzOptionsState`'s status** (D19-10, S1-D4) | No, but blocks the `forms` family | Add the §3 rule now; take the disposition (inline · compound part · new ownership kind) as its own packet. N2-S1 §10 blocks 28 components on it. |

---

## 9. Why no ADR file was edited

The task authorises edits to *"the ADR files' consequence sections and the debt
ledger"*, and instructs: *"prefer proposing the text in the packet over writing
it into the ADR where there is any doubt."*

**Every consequence edit this packet identifies is contingent on the acceptance
decision itself**, which is precisely what has not been taken:

- D19-3's bullet should be **deleted** if D-C is fixed and **struck** if it is not.
- D19-9's prerequisite section should be marked discharged — but the sentence
  that follows (the DTCG prohibition) is a *decision* clause, not a consequence,
  and rewriting it would be taking D-? on the owner's behalf.
- D19-1's Consequences paragraph (*"The `DataState` widening removes a type-level
  guarantee that was already false"*) is written in the past tense about
  something that has not happened. Correcting the tense either concedes the
  widening will not happen or pre-announces that it will.

Writing post-acceptance consequence text into a **Proposed** ADR would also make
the document self-contradictory: a Consequences section describing a settled
state, under a status line saying nothing is settled. The exact replacement text
is therefore supplied in §10, ready to paste **after** a decision.

**The debt ledger (`adr-registry.json`) was also not edited, and needs no edit:**
neither ADR-19 nor ADR-20 appears in it, the file is internally consistent
(14 entries, `maxUndocumented: 14`), and its gate is green. Editing it to reflect
acceptance would be wrong — the ledger tracks documents, not statuses (§7).

---

## 10. The consequence-section text acceptance would require

Paste-ready. **Conditional on the decisions in §8** — the bracketed variants are
where the text forks.

### 10.1 Replacing the current *Consequences* section

```markdown
## Consequences

- P3-02 defined `ComponentAnatomy` against these names rather than proposing
  them. As of 2026-09-03 the contract is declared by **32 `.anatomy.ts` files**
  (31 public components + `DzDialogContent`, a compound part), emitting
  **118 static `data-part` sites across 37 components** in 36 distinct names.
  The `maxWithoutAnatomy` ratchet has fallen 142 → 138 → 137 → 136 → **113**,
  one direction only.
- The measured baseline was honest and unflattering — 2 of 143 components
  emitted any `data-part` when this ADR was written. It remains unflattering:
  **113 of 144 public components have still not declared an anatomy.** Three
  families are complete (`inputs` 8/8, `buttons` 8/8, `typography` 8/8); nine
  are not. The validator counts down and never claims a state the code lacks.
- The typed override prop `ui` ships on **26 public components and 1 compound
  part**. A compound part may carry `ui` for its own parts without its parent
  declaring one — `DzDialogContent` does, `DzDialog` does not.
- [IF D-B = widen] The `DataState` widening removed a type-level guarantee that
  was already false; `DzButton`'s `idle | loading | disabled` now type-checks
  against the per-component enum that `expectAnatomy` verifies against rendered
  DOM. Under `VERSIONING.md` §2.1 the widening shipped as a **patch**.
  [IF D-B = commitment] **The `DataState` widening has NOT been performed.**
  `packages/contracts/src/data-attributes.types.ts` still declares the closed
  eight-value union, and `DzButton.vue:176` still violates it. §4 is accepted as
  a forward commitment; until the widening lands, the global union remains a
  type that a shipped component contradicts.
- [IF D-C = declare] All six cascade layers are declared, and `dz-overrides` is
  a documented place for a consumer to write with no library change required.
  [IF D-C = strike] **Only `dz-tokens`, `dz-base` and `dz-components` are
  declared.** `dz-reset`, `dz-utilities` and `dz-overrides` are named by this
  ADR and emitted by nothing. A consumer writing `@layer dz-overrides { … }`
  still wins today, but by CSS append-order for an unregistered layer — not by
  anything this library promises.
- **Three `!important` rules ship in `core.css`, not two.**
  `.dz-field-input-reset` (base.css:205-206) and `.dz-tab-close-btn:hover`
  (base.css:973) are debt with an owner. `.dz-native-input:-webkit-autofill`
  (base.css:263-265) is a **permanent recorded exception**: the WebKit autofill
  UA rule cannot be overridden without it. It joins the print block and
  `.dz-prose` as unlayered-or-important by necessity.
- The recipe attributes (`data-size`, `data-variant`, `data-tone`,
  `data-density`, `data-orientation`) are declared public by §4 and **no gate
  measures them**. `core.css` already selects on them, so the surface is public
  whether or not it is enforced. Filed as a follow-up alongside `data-scope`.
- Part identity is carried by convention, not by attribute. Two measured
  collisions (a `[data-part="content"]` selector matching a `<table>` two
  components down; `part "root" appears 5 times` on `DzSpeedDial`) were fixed
  with structural anchors. The residual case — `DzTooltipTrigger` merging
  `data-state` onto `DzRelativeTime`'s own root — cannot be fixed structurally
  and is recorded as a known limit. See the `data-scope` evaluation,
  `docs/program-2026-09/reports/N2-S1-anatomy-rollout-handoff.md` §11.
```

### 10.2 Replacing the *Prerequisite packet* section (D19-9)

```markdown
## Prerequisite packet — DISCHARGED

**P3-00 — DTCG emit for `@dzup-ui/tokens`.** Delivered by TASK-N2-T1.
`packages/tokens/src/dtcg.ts` and `src/generate-dtcg.ts` emit
`dist/tokens.dtcg.json`; `yarn validate:tokens:dtcg`
(`packages/tooling/src/token-checks/dtcg-round-trip.ts`) resolves every alias
through an independent DTCG reader and asserts each resolved value equals what
`dist/tokens.css` computes for the same `--dz-*` name, in both theme cascades.
It runs inside `yarn validate:all`.

The prohibition this section carried is narrowed to the rule it was always
protecting: **the TypeScript token maps remain the single source of truth, and
the DTCG document is a generated projection of them — never a second source.**
```

### 10.3 Replacing *Validation hooks* rows 1, 2 and 5 (D19-5, D19-6, D19-7)

```markdown
| Hook | Added by | What it enforces |
|---|---|---|
| `validate:adr-references` | TASK-OSS-P3-01 | every `ADR-NN` cited in source, docs or stories resolves to a document in `docs/adr/`, or to the ratcheted list in `packages/tooling/scripts/adr-registry.json` (ceiling 14) |
| `validate:anatomy-parts` | **TASK-N2-S1** | **source-level**: every static `data-part` is declared by its component's anatomy or a composing parent's; every non-optional declared part is emitted somewhere; names outside the §3 vocabulary are reported, not failed. Ratchets: `maxUndeclaredEmissions` 3, `maxUnemittedDeclarations` 0. **This replaces the `validate:contract-parity` extension this table originally assigned the job to, which was never built** — `contract-parity.ts` contains no reference to anatomy. |
| `expectAnatomy` (`@dzup-ui/testing`) | P3-02, corrected by N2-S1 | **rendered-DOM**: declared parts and states exist in the mounted tree. Treats a descendant `data-part="root"` as an anatomy boundary and does not descend into it. |
| recipe-attribute parity | **not built** | §4 declares `data-size/variant/tone/density/orientation` public and says a validator reports the components that accept the prop and omit the attribute. **No such gate exists.** Follow-up, to be built with the `useAnatomy()` attribute bag. |
| `validate:tokens` · `validate:tokens:dtcg` | exists · TASK-N2-T1 | no raw color literals; every value references `var(--dz-*)`; the DTCG projection round-trips against `tokens.css` |
| override e2e (`e2e/components/styling-overrides.spec.ts`) | P3-03 | computed styles change through `ui` — including into a portaled listbox and a dialog backdrop — with no `!important` in the fixture, and no `.dz-*` `!important` in the shipped CSS an override must fight. **The `dz-overrides` half is unwritten until the layer is declared** (see Consequences). Playwright; not part of `validate:all`. |
```

---

## 11. What this packet refuses to imply

- **That ADR-19 is accepted, or that this packet recommends acceptance
  unconditionally.** It recommends acceptance *after* D-B and D-C. Two of the
  six decisions have not been performed in code, and one Consequences bullet is
  false as written.
- **That the two gate runs in §6 are anything but locally qualified.** They are
  not CI evidence, not release evidence, and not production evidence. They were
  run on a dirty worktree containing three other packets' uncommitted work.
- **That `validate:all` is green.** This packet did not run it and makes no
  claim about it. N5-01 **F12** records it **red on `main`**; N2-S1 **S1-F10**
  records an aggregate gate reporting exit 0 over a stale artifact for three
  consecutive packets. Neither is resolved here.
- **That the 118/37/32 figures will hold.** They were measured at `6f1f653` on a
  tree three packets are actively editing.
- **That the `ui` prop is browser-qualified.** `styling-overrides.spec.ts` exists
  and was read, **not run**. No claim is made about its result.
- **That acceptance improves any ratchet.** §7 measures the opposite: acceptance
  moves `maxUndocumented` by zero, and makes two undocumented ADRs (04, 17) more
  load-bearing than they were.
- **That the divergence list is exhaustive.** It is exhaustive of what could be
  measured from source in this packet's scope. §4's recipe-attribute clause in
  particular has **no gate**, so the size of *that* gap is unmeasured — the ADR's
  own estimate is "most of them" and nothing has checked since.

---

*Companion: `N5-05-adr-20-acceptance-packet.md`. Combined findings and the full
`[!owner]` list: `N5-05-adr-acceptance-handoff.md`.*
