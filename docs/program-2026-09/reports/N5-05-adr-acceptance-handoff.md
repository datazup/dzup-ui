# TASK-N5-05 — ADR-19 / ADR-20 acceptance, combined handoff

- **Ran:** 2026-09-03, `main` @ `6f1f653`, dirty worktree (~85 entries), with
  **TASK-N5-03 executing concurrently** in the same worktree.
- **Deliverables:** `N5-05-adr-19-acceptance-packet.md`,
  `N5-05-adr-20-acceptance-packet.md`, this handoff.
- **Status:** **done.** Both packets are read-and-sign. No ADR status flipped;
  no ADR file edited; no source file changed.

---

## 1. Headline

**Both ADRs are worth accepting and neither should be accepted as written.**
They fail in opposite directions, and the difference is the useful part:

- **ADR-19 has two decisions that were never performed.** The `DataState`
  widening (§4) and three of the six cascade layers (§2) do not exist in the
  code. One Consequences bullet asserts a consumer-visible capability
  (`dz-overrides`) that the CSS never names. Accepting it unamended would
  approve a document that contradicts its implementation on the day it is signed.
- **ADR-20 has no clause the code contradicts.** Its structure is implemented
  essentially to specification and **88 tests across six named spec files pass**.
  Its problem is the reverse: **three of nine concerns — motion, direction,
  test ids — have zero consumers in the 144-component catalogue**, and a fourth
  (defaults) has one. The contract is built, correct, and largely unused.

**And the ratchet claim in this packet's own brief is false.** Accepting either
ADR moves the ADR-debt ceiling by **zero**, under any condition — not "only when
recorded in the ADR file". See **N5-05-F1**.

---

## 2. Measured-vs-claimed

Nothing below is inherited. N2-S1 §1 found five of six figures in its own brief
wrong; this packet re-measured everything it was handed.

| Claimed | Measured | Verdict |
|---|---|---|
| "5 `ui`-prop pilots" | **27** `ui?:` declarations — **26 public components + 1 compound part** (`DzDialogContentProps`, inside `DzDialog.types.ts`; `DzDialog` has none) | **Stale by 22.** "5" is the P3-03 figure; N2-S1 had already corrected it to 4+1, then added 22. |
| "9 anatomy files" | **32 `.anatomy.ts`** — 31 public components + `DzDialogContent` | **Stale by 23.** Pre-N2-S1 count. |
| "ten context composables" | **10** — nine `useDz*` in `composables/provider/` + `useDzTheme` re-exported at `provider/index.ts:34` | **Correct.** The only brief figure in this program to survive re-measurement. |
| "14 undocumented ADRs cited in code" | **14** — `maxUndocumented: 14`, gate prints `17 cited · 3 documented · 14 registry-only (ceiling 14)` | **Correct as a number, wrong as a lever.** See F1. |

**Derived, measured:** 118 static `data-part` emissions / 37 components /
36 distinct names / 32 declarations · `maxWithoutAnatomy` **113** of 144 ·
**3** cascade layers shipped of 6 · **3** `!important` rules (6 declarations),
not the 2 ADR-19 records · **13** part names outside the §3 vocabulary ·
**18** components consuming `useDzPortalTarget()` against 15 `BasePortalProps` ·
**0** `new Intl.` outside `intl-cache.ts` · **40** components in Core's message
catalog.

---

## 3. Findings

### N5-05-F1 🔴 — Accepting an ADR cannot lower the ADR-debt ceiling, and the requirement that says otherwise is mis-specified

The brief asks the packets to note that *"acceptance lowers the ADR-debt ceiling
(currently 14 undocumented ADRs cited in code) **only when the decision is
recorded in the ADR file itself**"*. Measured, the conditional is not the binding
one.

`packages/tooling/scripts/validate-adr-references.ts`, run this packet, **exit 0**:

```
✓ adr-references: 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)
```

**The three documented ADRs are 18, 19 and 20.** Both subjects of this task have
had documents since 2026-08-20 and 2026-08-21 respectively and are already out of
`packages/tooling/scripts/adr-registry.json`.

Three consequences:

1. **Acceptance moves the ceiling by 0**, not conditionally — *at all*. The
   registry counts documents on disk.
2. **The validator is status-blind.** It contains no reading of `Proposed`,
   `Accepted` or `Rejected`. **Nothing in the repository gates, measures or
   ratchets ADR status.** An ADR can sit Proposed indefinitely at zero cost to
   any gate — which is precisely how ADR-19 shipped five pilots, 32 anatomies and
   a public `ui` prop on 26 components while its Rollout §1 says *"P3-03 must not
   ship pilots on an unapproved contract."*
3. **The debt ledger needs no edit and was not edited.** It is internally
   consistent (14 entries, `maxUndocumented: 14`) and its gate is green. Editing
   it to reflect an acceptance would be wrong.

### N5-05-F2 🔴 — Both ADRs extend ADRs that have no documents, so acceptance makes the debt more load-bearing, not less

- ADR-19 declares *"Extends: ADR-04 (token-only styling), ADR-17 (token source of
  truth)"*. **Both are in the debt ledger.** ADR-17's registry entry records that
  a document exists *outside* this repository at
  `workspace-docs/repos/dzup-ui/docs/adr/` and *"has never been copied in"*.
- ADR-20 declares *"Extends: ADR-09 (theme context), ADR-08 (compound context)"*.
  **Both are in the debt ledger.** ADR-09 exists only as
  `packages/core/src/providers/*` plus a row in `CLAUDE.md`.

This does not block either acceptance — both documents are self-contained and
decidable on their own text. But it sharpens one decision specifically:
**ADR-20's largest open question (Rollout §6 / D20-9, whether `useDzTheme` should
stop throwing) is a proposal to amend ADR-09, an ADR with no document to amend.**

**The only ceiling movement available anywhere in this task's scope** is writing
those documents: copying ADR-17 in (a file move) takes it 14 → 13, and writing
ADR-09 takes it 14 → 12 together. → **D-E**, **D-P**.

### N5-05-F3 🔴 — ADR-19 §4's central act was never performed

`packages/contracts/src/data-attributes.types.ts:17-25` still declares the closed
eight-value `DataState` union and `:39` still reads `'data-state'?: DataState`.
`packages/core/src/components/buttons/DzButton.vue:176` still emits
`loading | disabled | idle` — none of the three in the union. The only
working-tree change to that file is an unrelated `.js` import-extension fix.

ADR-19 §4 argues *"a union that a shipped component already violates is not a
contract"*. **That sentence is still literally true of the code**, 14 days after
the decision that was supposed to end it. Two lines fix it, and under
`VERSIONING.md` §2.1 it is a **patch**, not the `minor` ADR-19 §6 predicts.
→ **D-B**.

### N5-05-F4 🔴 — Three of ADR-19's six cascade layers do not exist, and one Consequences bullet is therefore false

Shipped: `packages/core/src/styles/base.css:29` — `@layer dz-tokens, dz-base,
dz-components;` and `packages/tokens/src/generate.ts:107`. **`dz-reset`,
`dz-utilities` and `dz-overrides` appear nowhere in `packages/`** — the only
repo-wide hit is prose in `VERSIONING.md`. §2's own table says `dz-reset`
*"moves in P3-03"*; it did not.

So ADR-19's Consequences bullet — *"Consumers gain `dz-overrides` immediately as
a documented place to write, with no library change required — the layer
statement is additive"* — is **false as written**.

**The failure is quiet, which is what makes it worth a 🔴.** A consumer writing
`@layer dz-overrides { … }` today still wins, because an unregistered layer sorts
after all registered ones. The intended behaviour holds **by CSS append-order
accident, not by contract**, and silently stops holding the moment the library
registers any new layer after `dz-components`. The ADR-19 override e2e
(`e2e/components/styling-overrides.spec.ts`, 7 tests) mentions `dz-overrides`
**zero times** — it cannot test a layer nothing declares. → **D-C**.

### N5-05-F5 🔴 — ADR-20 §7's motion policy has no consumers, and it is an accessibility clause

`useDzMotion` is referenced by **zero `.vue` files**; its only non-definition
references are three spec files. ADR-20's own Context table says *"No policy.
Components animate or do not, per component."* — **still an accurate description
of the catalogue.** A host setting `motion="reduced"` today changes nothing
anywhere.

§7 admits `'full'` as *"an explicit override of a stated accessibility
preference"* — a real cost, accepted to buy a benefit the library does not yet
collect. Accepting §7 unamended would record in an approved decision document
that the library honours reduced-motion through the provider. **It does not.**
→ **D-H**.

### N5-05-F6 🟠 — ADR-20's contract is built and largely unconsumed; the pattern is uneven in a way worth a question

Consumers among `packages/core/src/**/*.vue`, excluding definitions, barrel and
specs:

| Concern | `.vue` consumers |
|---|---|
| portal target | **18** (against 15 `BasePortalProps` components) |
| messages | **40** catalog entries |
| formats | all `Intl` use — 4 constructions, all in `intl-cache.ts` |
| defaults | **2** (`DzButton`, `DzProvider`) |
| direction | **1** — `DzProvider.vue`, the writer |
| test ids | **1** — `DzProvider.vue`, the writer |
| motion | **0** |

Direction and test ids are read **only by the component that writes them**, so
functionally both are zero.

**The question this raises for the owner is not "why is adoption low" but "why is
it bimodal".** The same rollout shape reached **18** components for `portalTo`
and **1** for defaults — and defaults is the concern with the widest surface
(`size`, `tone`, `density`, plus per-component overrides). Portals had a concrete
prop to replace at 15 known sites; defaults had no equivalent forcing function.
That is a rollout-design finding, not an ADR defect. → **D-I**.

### N5-05-F7 🟠 — ADR-19's validation-hook table names a gate that was never extended

Row 2 assigns to `validate:contract-parity` (extended, by P3-02):
*"declared parts/states exist in rendered DOM; no undeclared `data-part`"*.
Measured: `packages/tooling/src/validators/contract-parity.ts` contains
**0 occurrences of the string `anatomy`**.

The job is done instead by `validate:anatomy-parts` (TASK-N2-S1), at **source
level** — a strictly stronger reading, since it sees every template branch and
components the manifest does not know about. Inherited from N2-S1 **S1-F6**;
restated here because the fix belongs in the ADR text, which is this packet's
scope and was not N2-S1's.

Run this packet, **exit 0**:
```
✓ anatomy-parts: 118 data-part emissions across 37 components (36 distinct names,
  32 anatomy declarations); 3/3 undeclared, 0/0 declared-but-unemitted
```

### N5-05-F8 🟠 — ADR-19 §4 declares the recipe attributes public and nothing measures them

§4 says *"A component that accepts one of these props emits the matching
attribute on its root; **P3-02's validator reports the ones that do not** (today:
most of them)."* Measured: `anatomy-parts.ts` contains **0** references to
`data-size`, `data-variant`, `data-tone`, `data-density` or `data-orientation`.
No gate anywhere reports the gap.

This is not peripheral: **§2's opening argument for the entire ADR** is that
`core.css` already ships `.dz-panel[data-size=lg]` and
`.dz-toolbar[data-variant=elevated]`, i.e. the recipe attributes are *already a
public surface that nothing declares, tests, or stops a component from dropping*.
Accepting §4 while that remains unmeasured accepts the one clause whose own
baseline the ADR calls "most of them" — a number nothing has checked since.

**It should be built with `data-scope`, not separately.** Both want the same
mechanism: one generated attribute bag per component, plausibly
`useAnatomy(anatomy)`. → folded into **D-A**.

### N5-05-F9 🟠 — ADR-19 §6's release wording is wrong for a 0.x library (inherited, N5-01 D4)

§6: *"Removal is a **major** change."* `VERSIONING.md` §1: before 1.0, `major`
means `1.0.0`. Read literally, **ADR-19 forbids removing a part until the library
is stable.** N5-01 recorded this as **D4** and deliberately did not edit the ADR;
`VERSIONING.md` §7.2 proposes the exact replacement wording (*"breaking, and
therefore a minor while the library is 0.x"*) plus its second half — the
`DataState` widening §6 calls a `minor` is a **patch** under §2.1.

Carried here with a recommendation because the ADR text is this packet's scope
and was not N5-01's. → **D-D**.

### N5-05-F10 🟠 — ADR-20 §1's dependency-direction argument has an unflagged exception

§1 puts the keys in contracts because *"that lets `@dzup-ui-pro/*` read an
application's locale **without importing Core's runtime** — the dependency
direction the whole package graph is built on."* Nine keys are at
`packages/contracts/src/provider.types.ts:215-223`. **`DZ_THEME_KEY` is at
`packages/core/src/providers/DzThemeProvider.types.ts:72`** — in Core.

So Pro can read nine concerns without importing Core's runtime and **cannot read
theme that way at all** — the exact inversion §1 exists to prevent. §1 names
theme in the same breath as the nine and never flags it.

**This and Rollout §6 are one question**, not two: whether theme stops being
special. Answering only "should `useDzTheme` stop throwing" leaves the graph
half-uniform. → **D-L**, prerequisite **D-P**.

### N5-05-F11 🟢 — Three ADR-19/20 claims are stale in the ADRs' favour and under-claim what shipped

Recorded so acceptance does not carry known-false pessimism:

1. **ADR-19's DTCG prerequisite (P3-00) is discharged.** The ADR says *"There is
   no `$value`/`$type` document anywhere in the package"* and forbids any
   document describing DTCG as this library's token authority. Measured:
   `packages/tokens/src/dtcg.ts`, `src/generate-dtcg.ts`, `src/dtcg.spec.ts`,
   `dist/tokens.dtcg.json`, and `validate:tokens:dtcg` **wired into
   `validate:all`** — delivered by TASK-N2-T1. The prohibition as written now
   blocks documents from describing a pipeline that exists and is gated.
2. **ADR-20's formatter migration is complete.** Consequences say the five `Intl`
   sites *"can be migrated one at a time"*. Measured: **zero `new Intl.` outside
   `packages/core/src/i18n/intl-cache.ts`** (4 constructions, all inside it), and
   the per-frame construction in `DzAnimatedNumber.tween.ts` is gone.
3. **ADR-20 Rollout §4 (P4-04, portals) is done and still listed open**, without
   the strikethrough §2 and §3 use. 18 consumers against a 15-component target.

### N5-05-F12 🟢 — ADR-19's `!important` inventory is short by one rule, and the missing one is not debt

§2 records *"the two present today (`.dz-tab-close-btn`, `.dz-field-input-reset`)"*.
Measured in `packages/core/src/styles/base.css`: `.dz-field-input-reset`
(`:205-206`, 2 declarations), **`.dz-native-input:-webkit-autofill` (`:263-265`,
3 declarations)**, `.dz-tab-close-btn:hover` (`:973`, 1). **3 rules, 6
declarations.** Both ADR-named rules survive; P3-03 paid down neither.

The third is qualitatively different: `-webkit-autofill` **cannot** be overridden
without `!important` — a UA-stylesheet special case, not debt. It belongs beside
the print block and `.dz-prose` as a **permanent recorded exception**. → **§10.1**
of the ADR-19 packet.

### N5-05-F13 🟢 — Three contracts-shape questions are open at once and are cheapest taken together

- **N5-02 D1** — `ariaInvalid` sits in `BaseAccessibilityProps` (labelling)
  rather than `BaseValidationProps` (validity), so every component wanting an
  accessible name inherits a validity claim it usually cannot keep. Nine
  `Omit<Base, 'k'>` narrowings stand in at the points of use.
- **D20-5 / F10** — `DZ_THEME_KEY` is in Core while its nine siblings are in
  contracts.
- **D20-9** — whether `useDzTheme` should stop throwing.

Each is a `minor` on `@dzup-ui/contracts`, the package every other package
depends on. Batching them costs **one blast radius instead of three**.
→ **D-N**.

---

## 4. Divergence counts

| ADR | Total | amend-ADR | fix-code | Open question |
|---|---|---|---|---|
| **ADR-19** | 13 | **8** | **4** | 1 (`data-scope`) |
| **ADR-20** | 9 | **8** | **1** | 0 |

*Amend-then-fix divergences are counted at their first action. ADR-19: D19-3 is
discharged by fixing D19-2; D19-6 and D19-10 are amend-then-fix. ADR-20: D20-1
through D20-4 are amend-then-fix; D20-5's fix-code half is an ADR-09 change and
routes to D20-9.*

**The most consequential in each:**

- **ADR-19 — D19-1:** the `DataState` widening, §4's central act, was never
  performed; the closed union `DzButton` violates is still shipping, so §4's own
  argument against it remains literally true of the code.
- **ADR-20 — D20-1:** §7's motion policy has zero consumers in 144 components, so
  accepting it would record an accessibility capability — honouring reduced-motion
  through the provider — that the library does not have.

---

## 5. `[!owner]` decisions

Every decision, numbered, one line each. **None is taken by this packet.**

| # | Decision | Blocking | Recommendation |
|---|---|---|---|
| **D-A** | `data-scope`: adopt · defer · refuse (N2-S1 S1-D2/S1-D6, §11) | No | **Defer**; revisit when the anatomy rollout closes, and build it with the recipe-attribute emitter (F8) as one generated `useAnatomy()` packet — never hand-typed. |
| **D-B** | `DataState`: widen-then-accept · accept-as-forward-commitment · reject §4 | **ADR-19** | **Widen, then accept.** Two lines, a `patch`. |
| **D-C** | Declare the three missing cascade layers, or strike the Consequences bullet | **ADR-19** | **Declare them.** One additive line in two files. |
| **D-D** | Amend ADR-19 §6's release wording to `VERSIONING.md` §7.2's text (N5-01 D4) | No | **Amend.** Wording only; intent unchanged. |
| **D-E** | Copy ADR-17 into `docs/adr/`, ceiling 14 → 13 | No | **Do it.** ADR-19 extends it; the document already exists outside the repo. |
| **D-F** | Fold the reviewed out-of-vocabulary part names into ADR-19 §3 (N2-S1 S1-D1) | No | **Fold in at acceptance** — renaming a shipped part name is breaking, so cost only rises. Hold the three `options-*` for D-G. |
| **D-G** | `DzOptionsState`'s status — inline · compound part · new ownership kind (N2-S1 S1-D4) | Blocks `forms` | Add the ADR-19 §3 rule for unexported internals now; take the disposition as its own packet. 28 components blocked. |
| **D-H** | Motion: adopt · amend-and-defer · drop §7 | **ADR-20** | **Amend and defer**, then adopt as its own packet. Accessibility consequence. |
| **D-I** | Record the adoption counts for direction, test ids and defaults in ADR-20's Consequences | **ADR-20** | **Amend.** Cheap factual sentences; without them the Consequences describe a system in use. |
| **D-J** | Strike ADR-20 Rollout §4 (P4-04) as Done, recording 18/15 | No | **Strike it**, in the same form §2 and §3 use. |
| **D-K** | Restate ADR-20 §5's formatter migration as complete | No | **Restate.** A clean win the ADR under-claims. |
| **D-L** | Should `DZ_THEME_KEY` move to contracts, **and** should `useDzTheme` stop throwing? | No | **Take both or neither** — one question about whether theme stops being special. |
| **D-M** | Deprecate the 15 `portalTo` props, or keep them permanently? | No | **Keep and say so.** P4-04 was chartered to decide and did not. |
| **D-N** | Batch the three contracts-shape questions — N5-02 D1, D-L's two halves (F13) | No | **Batch.** One blast radius instead of three. |
| **D-P** | Write ADR-09 before answering D-L; with D-E the ceiling goes 14 → 12 | No | **Recommended.** D-L amends an ADR that has no document. |

---

## 6. What was run

Narrow, read-only, exit codes observed directly.

| Command | Exit | Result |
|---|---|---|
| `npx tsx packages/tooling/scripts/validate-adr-references.ts` | **0** | `✓ adr-references: 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)` |
| `npx tsx packages/tooling/src/validators/anatomy-parts.ts` | **0** | `✓ anatomy-parts: 118 data-part emissions across 37 components (36 distinct names, 32 anatomy declarations); 3/3 undeclared, 0/0 declared-but-unemitted` |
| `npx vitest run` × 6 ADR-20 spec paths | **0** | **6 files, 88 tests passed**, 14.35s |

**A process note, recorded because the lane rule exists for it.** The vitest run
was first issued piped through `tail -40`, which swallows the exit code. It was
**re-run unpiped** and only the unpiped run is reported. The piped invocation's
result is not cited anywhere in either packet.

**`vitest` was invoked directly rather than through `yarn test`** — deliberately.
`yarn test` runs `test:prepare` → `tokens:generate`, which rewrites `DESIGN.md`
and regenerates token artifacts, and would have corrupted N5-03's concurrent
aggregate reading. Direct invocation skips it and writes nothing.

### Not run, and why

- **`yarn validate:all` — deliberately not run.** TASK-N5-03 owns the aggregate
  ladder this round and was executing concurrently in this worktree; a concurrent
  regeneration would corrupt its reading. **This packet therefore makes no
  aggregate-qualified claim.** The three runs above are **locally qualified
  only** — not CI, not release, not production evidence, and taken on a dirty
  worktree carrying three other packets' uncommitted work.
- **`yarn validate:hardcoded-strings` — skipped despite being read-only**,
  because `packages/tooling/src/validators/hardcoded-strings.ts` is **modified in
  this worktree by another packet**. Any number it printed would measure N5-03's
  in-flight edit, not `main`. No claim is made about ADR-20's 79-literal count
  beyond file evidence.
- **`e2e/components/styling-overrides.spec.ts` — not run.** Playwright, not in
  `validate:all`. Every claim about it in the ADR-19 packet is from reading the
  file.
- Of ADR-20's nine validation-hook rows, **six were executed**; three were not,
  nor were the Storybook pseudo-locale toolbar or `i18n.spec.ts`.

---

## 7. Files

**New — all three are documents; no source, config or generated artifact changed.**

| Path | What |
|---|---|
| `docs/program-2026-09/reports/N5-05-adr-19-acceptance-packet.md` | ADR-19 packet — 13 divergences, `data-scope` evaluation folded in, paste-ready consequence text, unsigned `[!owner]` line |
| `docs/program-2026-09/reports/N5-05-adr-20-acceptance-packet.md` | ADR-20 packet — 9 divergences, portal-chain and SSR/hydration evidence, paste-ready consequence text, unsigned `[!owner]` line |
| `docs/program-2026-09/reports/N5-05-adr-acceptance-handoff.md` | This document |

**Modified: none.**

- **`docs/adr/ADR-19-public-styling-contract.md` — not edited.** Still Proposed.
- **`docs/adr/ADR-20-provider-contract.md` — not edited.** Still Proposed.
- **`packages/tooling/scripts/adr-registry.json` — not edited**, and needs no
  edit: neither ADR appears in it, it is internally consistent (14 entries,
  `maxUndocumented: 14`), and its gate is green (F1).
- **No N5-03-owned file was touched.** Explicitly confirmed for `README.md`,
  `packages/core/README.md`, `packages/contracts/README.md`,
  `packages/tooling/scripts/generate-readme-facts.*`,
  `packages/tooling/src/validators/at-matrix.ts`,
  `packages/tooling/src/validators/capability-matrix.ts`,
  `packages/tooling/src/quality/git.ts`, `packages/nuxt/**`,
  `.github/workflows/**`, `packages/core/tests/vapor-interop.spec.ts`,
  `.changeset/**`, and both `N5-03-*` reports.

---

## 8. Why no ADR file was edited

The task authorises edits to *"the ADR files' consequence sections and the debt
ledger"* and instructs to *"prefer proposing the text in the packet over writing
it into the ADR where there is any doubt."*

**Every consequence edit identified is contingent on the acceptance decision
itself**, which is exactly what has not been taken. D19-3's bullet should be
*deleted* if D-C is fixed and *struck* if it is not. D19-1's Consequences
paragraph is written in the past tense about something that has not happened —
correcting the tense either concedes the widening will not happen or
pre-announces that it will. ADR-20's adoption counts read differently depending
on whether D-H defers motion or adopts it.

Writing post-acceptance consequence text into a **Proposed** ADR would also make
each document self-contradictory: a Consequences section describing a settled
state under a status line saying nothing is settled. The exact replacement text
is supplied instead — ADR-19 packet §10 (three blocks), ADR-20 packet §9 (three
blocks) — paste-ready **after** a decision.

---

## 9. What this work refuses to imply

- **That either ADR is accepted, or that acceptance is recommended
  unconditionally.** ADR-19 is recommended *after* D-B and D-C; ADR-20 *after*
  D-H and D-I. Neither is a clean signature today.
- **That any run here is more than locally qualified.** Three narrow gates on a
  dirty worktree. Not CI, not release, not production. The maturity ladder is
  specified → implemented → focused-validated → aggregate-qualified →
  browser/AT-qualified → packaged → released, and **this packet reaches
  focused-validated.**
- **That `validate:all` is green.** It was not run and no claim is made. N5-01
  **F12** records it **red on `main`**; N2-S1 **S1-F10** records an aggregate
  gate reporting exit 0 over a stale artifact across three consecutive packets
  (**S1-D7**, still unresolved). Neither is touched here.
- **That N5-03's concurrent ladder passed, failed, or produced any result.** This
  packet did not observe it and does not predict it.
- **That the divergence lists are exhaustive.** They are exhaustive of what
  source-level measurement in this packet's scope could reach. ADR-19 §4's
  recipe-attribute clause in particular has **no gate at all**, so the size of
  that gap is genuinely unmeasured — the ADR's own estimate is "most of them".
- **That structure equals adoption.** ADR-20's central measurement is that three
  of nine concerns have zero component consumers. A shipped, tested, correct
  contract that nothing calls is `implemented`, not `released`, and the levels do
  not collapse.
- **That the measured counts will hold.** All were taken at `6f1f653` on a tree
  three packets are actively editing.

---

## 10. Ranked note for TASK-N5-04 (peer & runtime hygiene)

One note, as asked, ranked highest-first — with the reason it belongs to N5-04
rather than here.

1. **The Node floor is a *decision input*, not just a dependency setting, and
   ADR-20 §4 is the case that proves it.** §4 rejects
   `Intl.Locale.prototype.getTextInfo()` — the correct mechanism for resolving a
   locale to a writing direction — solely because it is Baseline-2023 and above
   *"this repository's Node floor (`^20.19.0 || >=22.13.0`, ADR-18)"*. In its
   place the library carries a **hand-maintained checked-in list of RTL language
   subtags**, and the ADR records the delegation as *"a one-line"* change once the
   floor moves. So when N5-04 costs the Node 20 floor, the ledger has a concrete
   entry on the benefit side that is easy to miss: **raising it deletes a
   hand-maintained i18n data table** — the same hand-typed-facts class N2-S1 §11.3
   records five prior sightings of. Two riders: (a) ADR-18 is one of only three
   documented ADRs, so unlike most floor decisions this one has a real document to
   amend; (b) direction currently has **zero component consumers** (F6), so the
   list is unexercised today and the cost of it being wrong is latent rather than
   observed — which makes now the cheap moment to change the mechanism, before
   P4-05 builds the RTL matrices on top of it. **Related but distinct, and worth
   N5-04 checking in the same pass:** `useDzDirection` reaching only `DzProvider`
   means the `reka-ui` peer question and the locale-pack question are being costed
   against a surface nothing consumes yet — the peer's real cost lands when the
   RTL matrices (P4-05, blocked on N2-S1 **S1-D3**) actually ship.

---

*Packets: `N5-05-adr-19-acceptance-packet.md` · `N5-05-adr-20-acceptance-packet.md`.*
