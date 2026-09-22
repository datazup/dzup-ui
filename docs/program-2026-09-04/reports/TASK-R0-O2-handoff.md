# TASK-R0-O2 — ADR-18 / ADR-19 / ADR-20 acceptance execution — handoff

**Task:** TASK-R0-O2 (`docs/program-2026-09-04/release-exit-tasks.md` §"Owner packets")
**Ran:** 2026-09-22 · **Commit observed:** `527dbd1` (`git rev-parse HEAD`, 2026-09-22),
285 uncommitted paths at start / 302 at end — every inherited path preserved.
**Status:** `[!]` — engineering complete, **blocked on the owner's signature** for all three ADRs.
**Programme position:** the last task of `release-exit-tasks.md` and of the 09-04 programme.

> **No ADR status was flipped by this task, and none should have been.**
> An exhaustive search of `docs/program-2026-08/`, `docs/program-2026-09/` and
> `docs/program-2026-09-04/` — every ledger, every handoff, the consolidated
> decision register — found **no recorded owner acceptance** of ADR-18, ADR-19
> or ADR-20, and no owner name or date this task could honestly write. Both
> signature lines in the N5-05 packets are still blank
> (`N5-05-adr-19-acceptance-packet.md:336`, `N5-05-adr-20-acceptance-packet.md:300`),
> and `1-0-exit-criteria-2026-09.md:116` records criterion **C1** as **0/3**.
> All three remain `Proposed`. §2 is the precondition table that says what is
> unmet.

---

## 1. `<done_check>` versus reality

| # | Check | Result | Reality |
|---|---|---|---|
| 1 | `grep -n 'Status:' docs/adr/ADR-1{8,9}-*.md ADR-20-*.md` → all three `Accepted` | **FAIL** | All three `Proposed`, and they still are. The premise *"ADR-18/19/20 still Proposed"* is the one `_Gap:_` claim that survived. |
| 2 | registry contains 18/19/20 **and** `validate:adr-references` reports statuses | **FAIL, both halves** | `JSON.stringify(registry).includes('ADR-18')` → `false`. The validator contained **no reading of `Proposed`/`Accepted`/`Rejected` anywhere** — both N5-05 packets said so and both were right. Now true: see §3.3. |
| 3 | `grep -n 'ariaInvalid' packages/contracts/src/*.ts` shows it under the validation props type, **not** `BaseAccessibilityProps` | **HALF-PASS, and the check cannot tell** | It was in **both**: TASK-R5-O1 added it to `BaseValidationProps` on 2026-09-04 and deliberately left the deprecated declaration on `BaseAccessibilityProps` so that step was additive. A `grep` for the identifier passes on the additive half and cannot see the half that matters. Done for real: §3.1. |
| 4 | `ls docs/adr/ \| grep -c 'ADR-13'` → **1** | **UNSATISFIABLE AS WRITTEN** | The answer is **0** and cannot be 1 without writing an OSS ADR-13 document — which would also require deleting its registry entry and lowering `maxUndocumented` 14 → 13, i.e. a retro-ADR the `<stop_conditions>` warn against writing in this task. OSS ADR-13 is a **registry-only** decision. Resolved by the mechanism the `<requirements>` actually specify — a dated note and a stable cross-reference: §3.4. |

**0 of 4 pass. One is unsatisfiable and one is undecidable by the check it uses.**

---

## 2. The precondition tables — what is met, what is not

This is the deliverable the task asks for when no signature exists. Every
`D<n>` id is qualified by its source report path, because the id space collides
across three namespaces (register §7.1 / **D179**).

### 2.1 ADR-18 — Runtime floor and validator runner

| Precondition | Source | State | Evidence |
|---|---|---|---|
| The Node-floor memo exists | task `<task>` clause 1 | **MET** | `./TASK-R1-O6-handoff.md` §7.3, §9 and `./peer-hygiene-decisions-2026-09.md` |
| Amendment text applied to the document | task `<task>` clause 2 | **MET** | ADR-18 **A1–A5**, written 2026-09-22 |
| **The floor itself is decided** | `docs/program-2026-09/reports/N5-04-peer-hygiene-handoff.md` §3 (**N5-04 D3**) · `./TASK-R1-O4-handoff.md` §9 (**D160**) · `./TASK-R1-O6-handoff.md` §9 (**D176**) | **UNMET — three answers, none binding** | `>=22.13.0` · keep `^20.19.0 \|\| >=22.13.0` · `>=22.13.0` with D160 as interim. D160 and D176 were written **on the same day** and D176 **explicitly differs**. Register §7. Recorded, **not resolved** — see §6. |
| **The declared floor actually runs the gates** (criterion **C10**) | ADR-18 Decision 3 | **UNMET, and measurably false** | `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts:49` imports `globSync` from `node:fs`; `fs.globSync` is `@since v22.0.0`. On the floor's `^20.19.0` branch `yarn test` fails `TypeError: globSync is not a function`. **There has never been a green run on the 20.x floor** (`./TASK-R1-O6-handoff.md` §7.3). |
| RTL coupling removed from the floor argument | **N5-04 D3** | **MET** | ADR-18 **A3** + ADR-20 **A8.1** |
| Nuxt 4.4.6+ consequence recorded | `docs/program-2026-09/reports/N5-03-toolchain-currency-handoff.md` §10 (**N5-03 D4**) | **MET** | ADR-18 **A4** — the fixture matrix is pinned at 4.4.5 *because* 4.4.6 drops Node 20 |
| **Owner's recorded acceptance** | — | **UNMET** | None exists anywhere |

**ADR-18 is the one of the three that should not be signed today**, and not for
a paperwork reason: its Decision 1 is under active dispute and its Decision 3 is
false on the tree.

### 2.2 ADR-19 — Public styling contract

| Precondition | Source | State | Evidence |
|---|---|---|---|
| TASK-R5-O1's cascade layers | packet **D19-2** / `[!owner]` **D-C** | **MET** | All six declared: `packages/core/src/styles/base.css:51`, `packages/tokens/src/generate.ts:116` and `:262` |
| `DataState` widening | packet **D19-1** / **D-B** | **MET** | `packages/contracts/src/data-attributes.types.ts` — the union is a named vocabulary, no longer the attribute's type |
| The layer-order fixture | packet **D19-7** | **MET** | `e2e/styling/layer-order.spec.ts`, against the **packed tarballs** in chromium/firefox/webkit |
| The part-name vocabulary reviewed | packet **D19-11** / **D-F** | **MET** | `maxUnreviewedPartNames: 0`, `maxHeldPartNames: 0` |
| `DzOptionsState` disposition | packet **D19-10** / **D-G** / N2-S1 **S1-D4** | **MET** | Owner took **D15** as option (d); `maxUndeclaredEmissions: 0` |
| The 8 amend-ADR items | packet §4 | **MET** | Applied into the document by TASK-R5-O1 on 2026-09-04 — verified item by item, §5.2 |
| Consequences bound to today's tree | this task | **MET** | ADR-19 **A1–A3**, 2026-09-22 |
| `data-scope` (**D-A**) | packet §5.1 | **NOT A PRECONDITION** | The packet is explicit: ADR-19 never claimed to solve it |
| Copy ADR-17 into `docs/adr/` (**D-E**) | packet §7 | **UNMET, optional** | ADR-19 declares *"Extends: ADR-04, ADR-17"* and both are undocumented debt. Would take `maxUndocumented` 14 → 13 — the only ceiling movement available in this scope |
| **Owner's recorded acceptance** | — | **UNMET** | None exists anywhere |

**ADR-19's code and text preconditions are met. The signature is the only thing missing.**

### 2.3 ADR-20 — Provider contract

| Precondition | Source | State | Evidence |
|---|---|---|---|
| TASK-R1-O2's import gate for the i18n promises | task `<task>` clause 1 | **MET** | `validate:published-imports` is chain link 29; the `./i18n` + `./i18n/locales/en.json` subpaths were verified **from a packed tarball** (`./TASK-R1-O2-handoff.md`) |
| The sanitizer seam from TASK-R3-O2 | task `<task>` clause 2 | **MET** | ADR-20 **A6**; `DZ_SANITIZER_KEY` and `DZ_PROVIDER_DEFAULTS.sanitizer` in `packages/contracts/src/provider.types.ts` |
| Motion: consumers **or** an amendment | packet **D20-1** / `[!owner]` **D-H** | **MET by consumers** | 18 components — 3 `useDzMotion()`, 15 `useDzMotionAttribute()`. The packet's recommendation to amend §7 as *"specified and unadopted"* is **overtaken by events** (TASK-R5-O3) |
| Adoption counts in the record | packet **D20-2/3/4** / **D-I** | **MET** | ADR-20 **A8.3**, with 2026-09-22 figures, not the packet's |
| Rollout §4 struck as Done | packet **D20-6** / **D-J** | **MET** | ADR-20 **A8.4** |
| §5 formatter migration restated | packet **D20-7** / **D-K** | **MET** | ADR-20 **A8.5** — 0 `new Intl.` outside `i18n/intl-cache.ts` |
| A5's component count | packet **D20-8** | **MET** | ADR-20 **A8.6** — cite the file, stop transcribing the number |
| **§4's `getTextInfo()` claim** | **D181** (`./TASK-R0-O1-handoff.md`), from **N5-04 D3** and **D176** | **MET — this task's assigned correction** | ADR-20 **A8.1**. §4 said the RTL list would become "a one-line delegation" when the floor moves; `getTextInfo()` needs Node **24.0.0**, which no floor under discussion reaches |
| `DZ_THEME_KEY` / `useDzTheme` (**D-L**), `portalTo` deprecation (**D-M**), write ADR-09 (**D-P**), sanitizer-key growth (**D6**) | packet §8 | **UNMET, and all four non-blocking** by the packet's own reading | Tabulated in ADR-20 **A8.7** |
| **Owner's recorded acceptance** | — | **UNMET** | None exists anywhere |

**ADR-20 has no clause whose code contradicts it** — the packet's conclusion,
and A8 makes it stronger by closing three of the four over-claim divergences
with measurement.

---

## 3. Implemented files and API effect

### 3.1 `ariaInvalid` leaves `BaseAccessibilityProps` — the contracts `minor`

| File | Change | API effect |
|---|---|---|
| `packages/contracts/src/props.types.ts` | `BaseAccessibilityProps` **no longer declares `ariaInvalid`**; `BaseValidationProps` keeps it and its note is rewritten | **Breaking.** 66 components lose a prop |
| `packages/core/src/components/cards/DzCard.types.ts` · `forms/DzCheckbox.types.ts` · `forms/DzCheckboxGroup.types.ts` · `forms/DzRadio.types.ts` · `forms/DzRadioGroup.types.ts` · `forms/DzSwitch.types.ts` · `inputs/DzInputGroup.types.ts` | each declares `ariaInvalid` locally, with a **byte-identical** doc comment | **No change** — these 7 keep the prop |
| `.changeset/aria-invalid-is-a-validation-prop-and-only-validation-props-carry-it.md` | `@dzup-ui/contracts: minor` · `@dzup-ui/core: minor`, naming all 66 | pending changesets **36 → 37** |
| `packages/core/docs/component-meta.json`, `llms.txt`, `llms-full.txt`, 144 pages under `apps/docs/components/` | regenerated in the mandated order | the generated record follows the source |

**Measured effect**, `component-meta.json` at `HEAD` vs the working tree:
**`ariaInvalid` declarations 98 → 32. 66 components lose it, 0 gain it.**

**Three judgements, each recorded because each could have gone the other way:**

1. **The 7 declare the prop locally rather than gaining `BaseValidationProps`.**
   That base also carries `invalid`, `error` and `required`, and those seven read
   **none** of the three — they resolve invalidity from the enclosing
   `DzFormField`. Adding three props nothing reads would recreate exactly the
   defect `.changeset/nine-aria-props-that-did-nothing-are-gone.md` removed.
2. **The count is 7, not the 6 TASK-R5-O1 measured.** `DzCard` is the seventh —
   `DzCard.vue:78` puts `'aria-invalid': props.ariaInvalid` in an attrs bag, and
   it is not a form control, which is the clearest case for (1).
3. **The five `Omit<BaseAccessibilityProps, 'ariaInvalid'>` narrowings are
   KEPT**, now redundant. `packages/tooling/src/validators/form-readiness.spec.ts`
   pins `DzGrid`'s clause as the fixture that proves `Omit` in an `extends`
   clause is read **at all** ("honours an Omit in the extends clause"). Deleting
   them deletes that coverage to buy tidiness. Recorded at the declaration.

### 3.2 The ADR amendments

| Document | Added | Content |
|---|---|---|
| `docs/adr/ADR-18-runtime-floor-and-validator-runner.md` | **A1–A5** | A1 the floor is an **open decision**, three conflicting sources tabled by report path · A2 the floor is measurably false on 20.x (`globSync`) · A3 decouple the floor from the RTL list · A4 Nuxt ≥ 4.4.6 already drops Node 20 · A5 status |
| `docs/adr/ADR-19-public-styling-contract.md` | **A1–A4** | A1 Consequences re-measured at `527dbd1` (every figure moved) · A2 the three `options-*` names are no longer `held` · A3 all 13 packet divergences closed · A4 status |
| `docs/adr/ADR-20-provider-contract.md` | **A8.1–A8.7** + Status line + Amendments preamble | **A8.1 the D181 `getTextInfo()`/Node-24 correction** · A8.2 motion has 18 consumers (D20-1 falsified) · A8.3 adoption counts, today's · A8.4 Rollout §4 Done · A8.5 formatter migration complete · A8.6 stop transcribing A5's count · A8.7 status + the open `[!owner]` table |

### 3.3 The ADR gate is status-aware — and acceptance now moves a number

| File | Change |
|---|---|
| `packages/tooling/scripts/adr-registry.json` | gains a **`documented`** half (ADR-18/19/20 with title and path) and **`maxProposedCitedFromCode: 3`**; `$comment` rewritten |
| `packages/tooling/scripts/validate-adr-references.ts` | `readStatus()` parses each document's own `Status:` line · `isCodeCitation()` separates code from prose · `AdrDocument` gains `status` · 5 new rules: `registry-documented-missing`, `registry-documented-stale`, `registry-documented-path`, `document-status`, and the ratchet pair `proposed-ceiling` / `proposed-ratchet` · the CLI prints a second line |
| `packages/tooling/scripts/validate-adr-references.spec.ts` | 25 → **44** tests |

The gate now reports:

```
✓ adr-references: 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)
  status: 0/3 Accepted · 3 Proposed cited from code (ceiling 3) — ADR-18, ADR-19, ADR-20
```

**Status is read from the document, never mirrored into the registry.** A
mirrored status is a second place for one fact to be wrong — the hand-typed-facts
class this programme has now recorded six times. So **flipping the `Status:`
line is the single act that moves the ratchet**, which is exactly what both
N5-05 packets said was missing ("acceptance moves the ceiling by exactly 0 — not
at all, under any condition"). See **D189** if the owner wants the mirror anyway.

**Seeded failures — run on the real repository, both directions, both reverted:**

| Seed | Exit | Output |
|---|---|---|
| ADR-19's `Status:` flipped to `Accepted`, ceiling left at 3 | **1** | `✗ [proposed-ratchet] Only 2 Proposed ADR(s) are cited from code (ADR-18, ADR-20) but … still declares maxProposedCitedFromCode: 3. Lower it to 2 in the same change…` |
| Ceiling lowered to 2, statuses untouched | **1** | `✗ [proposed-ceiling] 3 Proposed ADR(s) are cited from code (ADR-18, ADR-19, ADR-20) but … declares maxProposedCitedFromCode: 2. Code may not build on a decision nobody has signed beyond the recorded ceiling.` |
| Both reverted | **0** | the green line above; `git status --porcelain docs/adr/` clean |

Both directions are also pinned as unit tests, so the proof survives this session.

### 3.4 The ADR-13 collision — resolved by naming, on the OSS side only

| File | Change |
|---|---|
| `packages/tooling/scripts/adr-registry.json` | ADR-13's entry carries a **dated** cross-reference: the Pro subject, its `Accepted 2026-08-10` status, its path and its commit `7f1c678`, the resolution taken, and why renumbering was rejected |
| `CLAUDE.md` | an **ADR-13 row** in § Key ADRs and a new subsection *"ADR-13 is two different decisions — a number collision, not a mistake"* with a two-row tier table |

**The Pro document was not renamed, not edited and not read for edit.** The Pro
repository was neither checked out nor cleaned; the only commands run against it
were `git log -1`, `git rev-parse` and `git status`, all read-only.

The resolution is **naming, not renumbering**: inside this repository a bare
`ADR-13` means the date-math decision; a cross-tier citation must be written
`dzup-ui ADR-13` or `dzup-ui-pro ADR-13`. Renumbering was rejected on the same
ground **D179** rejects renumbering the `D<n>` space — Pro's is Accepted and
cited from Pro source, this one is cited from 10 sites here, and a renumber
breaks every existing citation to buy tidiness. Whether the tiers should share
or split the number space going forward is **D187**.

---

## 4. Focused validation — run for real, exit codes read directly, never through a pipe

| Command | Exit | Result |
|---|---|---|
| `yarn validate:adr-references` | **0** | `17 cited · 3 documented · 14 registry-only (ceiling 14)` + `0/3 Accepted · 3 Proposed cited from code (ceiling 3)` |
| `yarn validate:form-readiness` | **0** | `44 controls, 280 pass, 0 gap, 0 future, 20 unrun, 96 n-a` |
| `yarn validate:exports` | **0** | `0 errors` + 3 flat-export packages |
| `yarn typecheck` | **0** | — |
| `yarn typecheck:tooling` | **0** | — |
| `yarn lint` | **0** | clean on the second run; the first was **exit 1**, 6 `regexp/*` errors on my own status regex (`\s*` beside `.*` — polynomial backtracking). Rewritten line-based with bounded quantifiers |
| `vitest run packages/contracts packages/core/src/components/forms` | **0** | **61 files, 941 tests** |
| `vitest run packages/contracts packages/core/src/components/{forms,cards,inputs} packages/tooling/src/validators/form-readiness.spec.ts` | **0** | **86 files, 1397 tests** |
| `vitest run packages/tooling/scripts/validate-adr-references.spec.ts` | **0** | **44 tests** (25 at `HEAD`, counted with `git show HEAD:… \| grep -c '^\s*it('`) |
| `yarn validate:changelog` | **0** | 7 passed, 0 failed |
| `yarn validate:release-policy` | **0** | 37 pending changesets, 0 major, 0 mixed |
| `yarn validate:component-meta` · `:llms` · `:docs-pages` · `:ownership` · `:quality-tiers` · `:capability-matrix` · `:anatomy-parts` · `:doc-snippets` · `:readme-facts` | **0** each | re-run after regeneration |
| `yarn generate:component-meta` · `generate:llms` · `generate:docs-pages` | **0** each | in the mandated order |

`validate:component-meta` and `validate:docs-pages` were **exit 1** in between —
`✗ [freshness] component-meta.json is STALE` — which is the correct behaviour and
the reason for the regeneration step. Both green after.

---

## 5. Aggregate qualification



### 5.1 Falsified premises — the `_Gap:_` is wrong in five places

Every predecessor falsified at least one premise; this task falsified five, and
four of them are *"already done by a sibling"*.

| `_Gap:_` claim | Reality at `527dbd1` |
|---|---|
| *"ADR-18/19/20 still `Proposed`"* | **TRUE.** The only claim that survived intact. |
| *"acceptance packets exist … ADR-19 with 13 divergences, ADR-20 with 9"* | **The packets exist; the divergences do not.** All 13 ADR-19 items are closed — **TASK-R5-O1 applied all 8 amend-ADR items into the document on 2026-09-04** and landed all 4 fix-code items. Of ADR-20's 9, three over-claim items (D20-1 motion, D20-2 direction, D20-3 test ids) were **falsified by TASK-R5-O3's adoption rollout**, not amended. |
| *"ADR-18/19/20 are absent from `adr-registry.json`"* | **TRUE**, and now fixed. |
| *"the two-ADR-13 collision (Core/Pro number clash)"* | **Real, but not as implied.** OSS has **no** ADR-13 document, so there is no filename clash to resolve — it is a *number-space* clash between a Pro document and an OSS registry-only entry, and the registry already carried an **undated, unstructured** note about it. |
| *"`ariaInvalid` misplaced in `BaseAccessibilityProps` … a contracts-wide `minor`"* | **Half-done before this task started.** TASK-R5-O1 shipped the additive half on 2026-09-04 and costed the removal as **D10**. |
| *`<done_check>` 4: `ls docs/adr/ \| grep -c 'ADR-13'` → 1* | **Unsatisfiable.** See §1. |

**ADR-20's adoption figures, packet (2026-09-03) → today:** portal 18 → 18 ·
messages 40 → **44** · defaults 1 → **23** · direction 0 → **19** · test ids
0 → **89** · motion 0 → **18**.

### 5.2 Verification that R5-O1 really did apply the 8 ADR-19 amend-items

Not taken on trust — each located in the document:

| Item | Where it landed |
|---|---|
| D19-3 false Consequences bullet | Consequences, *"All six cascade layers are declared … That sentence used to be in this list and was **untrue for fourteen days**"* |
| D19-4 §6's "major" | §6, *"Amended 2026-09-04 (TASK-R5-O1) to reconcile with `VERSIONING.md` §7.2"* |
| D19-5 hook retarget | Validation hooks, `validate:anatomy-parts`, *"This replaces the `validate:contract-parity` extension … which was never built"* |
| D19-6 recipe attributes | §4, *"declared public and unenforced"* |
| D19-8 `!important` | §2, three rules with the `-webkit-autofill` carve-out. **Re-measured today: still 3 rules / 6 declarations** |
| D19-9 DTCG prerequisite | heading reads *"Prerequisite packet — DISCHARGED"* |
| D19-11 vocabulary | §3, *"Grown once, deliberately, 2026-09-04"* — 7 folded in, 7 recorded as extensions |
| D19-12 compound-part `ui` | §5, *"A compound part carries `ui` for its own parts, and its parent is not [required to]"* |

### 5.3 What is still red — pre-existing versus new

| Lane | State | Pre-existing or new |
|---|---|---|
| `yarn validate:peers` | **red** | **PRE-EXISTING.** TASK-R1-O6's icon-duplicates gate, red on a real, unwaived defect — red *by design* until the owner takes D174–D178 |
| `yarn validate:all` | see §5.4 | measured end to end |
| Node 20.x branch of the declared floor | **red** | **PRE-EXISTING**, `globSync` (**D160**). Not fixed here: it is the floor decision's, not the ADR steward's |
| `yarn test` (full) | not run by this task | The parent reports 10,478 passing at `527dbd1`. This task ran **1,397 + 941 + 44** focused tests, exit 0 each. Focused runs are **locally qualified only** — not CI, release or production evidence |
| e2e / Playwright lanes | not run | `e2e/styling/layer-order.spec.ts` was **read**, not run. No browser claim is made |

### 5.4 `yarn validate:all`

Run **end to end**, unpiped, into a log; the exit code read directly from `$?`,
never through a pipe (S1-F10).

```
yarn validate:all > <log> 2>&1; echo "exit $?"   →   exit 1
```

**The chain is 50 links** at this HEAD — counted, not quoted
(`node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"`;
README §5 still says 44, itself a correction of 37).

**One failure, at link 48 of 50, and it is pre-existing:**

```
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0" by @dzup-ui/landing, @dzup-ui/sandbox
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core
1 icon-library violation(s).
```

That is `validate:peers` — **TASK-R1-O6's icon-duplicates gate, red on a real,
unwaived defect**, and red *by design* until the owner takes **D174–D178**. It
is the only `✗` in the whole 424-line log; `grep -c '✗'` → 1.

- **Links 1–47 pass**, including everything this task touched:
  `typecheck`, `typecheck:tooling`, `lint`, `anatomy-parts`, `form-readiness`,
  `component-meta`, `llms`, `docs-pages`, `exports`, `ownership`,
  `adr-references` (link 41), `doc-snippets`, `changelog`, `release-policy`.
- **Links 49–50 did not run** — `validate:licenses` and `validate:tree-shake`
  are behind the failing link and are therefore **unmeasured by this task**, not
  green. `&&` stops at the first non-zero.
- **No new red.** The one failure is inherited, named, and owned by another
  packet's open decision.

**A note on the regenerated docs pages, because it is the one place this task
could have folded a sibling's in-flight work.** `validate:docs-pages` is a
*freshness* gate: it compares the pages on disk with a fresh generation.
It was **exit 0 before** this task changed anything and is **exit 0 after**.
Green-before means the 144 dirty pages already equalled what the (modified)
generator produces; the only generator *input* this task changed is the prop
surface; so the regeneration reproduced the predecessors' content minus the 66
`ariaInvalid` rows. Spot-checked: `DzButton.md` loses exactly one props row and
its heading goes `Props (16, of which 5 inherited)` → `(15, of which 4)`.



---

## 6. What this task refused to do, and why

- **Flip any `Status:` line.** No recorded acceptance exists. Inventing an owner
  name or a date would make the acceptance itself uncitable — which is D181's
  own argument for why a known-wrong §4 must not be accepted, applied to the
  signature.
- **Resolve the Node floor.** N5-04 D3 vs **D160** vs **D176** is an owner's
  support-policy decision. ADR-18 **A1** tables all three by source path and
  states plainly that the floor is undecided. Recorded, not picked.
- **Touch the Pro repository.** Not checked out, not cleaned, not edited. Three
  read-only git commands.
- **Write a retro-ADR** for ADR-04 (cited 395× from code) or for ADR-13, ADR-09
  (**D-P**) or ADR-17 (**D-E**). The `<stop_conditions>` forbid the first; the
  others are ceiling movements with owners.
- **Delete the five redundant `Omit<>` narrowings.** §3.1(3).
- **Add a dev-mode fall-through warning to the 66 components.** §7, **D190**.
- **Commit, push, dispatch CI, publish or deploy.** 302 uncommitted paths
  remain; the owner commits.

---

## 7. Owner decisions raised — numbered from **D187**

Continuing the 09-04 global sequence from **D186**, the highest `TASK-R0-O1-handoff.md` used.

| Id | Decision | Options | Recommendation | Gates |
|---|---|---|---|---|
| **D187** 🟠 | **Do the two tiers share one ADR number space, or split it?** Resolved *for ADR-13* by naming (§3.4), but the underlying clash is unresolved and the next collision is a matter of time — Pro is at ADR-17, OSS at ADR-20, and neither coordinates | (a) keep one space and require a tier prefix in any cross-tier citation — what §3.4 does for ADR-13 · (b) prefix the numbers themselves going forward (`OSS-21`, `PRO-18`) · (c) give Pro a reserved band (e.g. 100+) and renumber nothing · (d) leave it | **(c)**, with (a) standing for the existing overlap. A reserved band costs one sentence in each repo's registry and makes the next collision impossible; (b) renames a live citation surface, which is what (a) already refused | every cross-tier ADR citation; Pro's next ADR |
| **D188** 🔴 | **Are the three acceptances one decision or three, and in what order?** ADR-19 and ADR-20 have no unmet precondition but the signature. **ADR-18 does** — its Decision 1 is disputed (D160/D176/N5-04 D3) and its Decision 3 is measurably false on the 20.x branch | (a) sign 19 and 20 now, hold 18 behind the floor decision · (b) hold all three until the floor is decided, so C1 moves once · (c) sign all three and amend 18 after · (d) none yet | **(a).** C1 is *"ADR-18, ADR-19, ADR-20 carry `Accepted` in the ADR file itself"* and it can honestly go 0/3 → 2/3 today. (c) is what D181 rejects in a different costume — signing a document whose Decision 3 the tree falsifies | criterion **C1**; `maxProposedCitedFromCode`; the 1.0 memo |
| **D189** 🟢 | **Should `adr-registry.json` mirror each ADR's status?** The `<requirements><status_gate>` says *"the registry records status per ADR"*; this task deliberately did **not** mirror it and reads the document's own `Status:` line instead (§3.3) | (a) keep it as built — one source, the document · (b) mirror the status into the registry and gate that the two agree · (c) mirror it and make the registry authoritative | **(a) as built.** A mirrored status is a second place for one fact to be wrong, and the programme has recorded that failure six times. (b) is defensible — it makes a status change visible in a JSON diff — at the cost of a third rule; (c) would let a document lie about itself | the shape of `validate:adr-references`; reversible in one commit |
| **D190** 🟠 | **66 components now let `aria-invalid` fall through to `$attrs` silently.** The N5-02 removal gave its six components a one-time dev-mode warning naming the prop and the fall-through. This change did not, for 66 | (a) accept the silent fall-through and rely on the changeset's migration table · (b) add the same warning to all 66 · (c) add it to the ~12 where a rendered `aria-invalid` is actively harmful (`DzToast`, `DzAlert`, `DzNotification`, `DzProgress` and the other status roles) | **(c).** (b) is 66 files of boilerplate for a prop that never did anything; (a) leaves a consumer's binding rendering an ARIA attribute on an element with no role to carry it, with nothing to tell them. (c) buys the warning where it changes behaviour a screen reader can see | `@dzup-ui/core`'s next minor; the migration cost of the `ariaInvalid` changeset |
| **D191** 🟢 | **Is `maxProposedCitedFromCode` the right meter?** It counts **distinct Proposed ADRs cited from code** (3), not citation *sites* (871 across the three), and it treats prose as free | (a) keep distinct-ADR counting — moves only on acceptance, so the number means one thing · (b) count citation sites — bigger, more alarming, and it moves on every routine edit · (c) count both, gate on (a) | **(a), as built**, with (c) as a cheap follow-up if the owner wants the pressure visible. (b) turns an acceptance ratchet into edit noise | the ratchet's usefulness; nothing else |
| **D192** 🟠 | **Confirm or reverse `D10`, taken under delegation.** `TASK-R5-O1-handoff.md` §D10 offered (A) do the removal now · (B) additive now, removal as a named follow-up · (C) abandon. R5-O1 shipped B and recommended "B now, then A". **This task did A** — the task prompt's `<requirements><contracts_change>` directs it explicitly | (a) confirm A as shipped · (b) reverse to B — restore one line on `BaseAccessibilityProps` and drop the changeset · (c) reverse to C and keep the `Omit<>` sites permanently | **(a) confirm.** The two conditions R5-O1 named are met — no concurrent session holds the artifacts, and all four regenerated cleanly. Reversal is one line plus deleting a changeset, so this is cheap to undo and expensive to defer again | `@dzup-ui/contracts`'s next minor; **N5-02 D1** (closed by A) |

---

## 8. Closing note — what remains open across `release-exit-tasks.md`

This is the last task of the file and of the 09-04 programme. **Five of its
eight tasks end `[!]`, every one of them on an owner action and none on
engineering.**

| Task | Status | Waiting on |
|---|---|---|
| **TASK-R1-O1** Truthfully green committed tree | `[x]` | — (nothing; the tree is green apart from `validate:peers`, red by design) |
| **TASK-R1-O2** Consumer-truth gates | `[x]` | — |
| **TASK-R1-O3** Release evidence parity | `[x]` | — (the bundle exists at `docs/qa/release/2026-09-21-527dbd1/`; a *release* is an owner act) |
| **TASK-R1-O4** CI dispatch + min-peer lane | `[!]` | **The owner dispatches the workflows.** `./ci-dispatch-request-2026-09.md`. Also **D160**, the Node floor |
| **TASK-R1-O5** Docs-site publication | `[!]` | **Five deployment decisions, D165–D169** — target, DNS, Baseline tier, `browserslist`, size budget. `./docs-deployment-packet-2026-09.md` |
| **TASK-R1-O6** Peer/dependency hygiene | `[!]` | **D174–D178** — the `lucide` swap, the Node floor (**D176**), `apps/sandbox`. `validate:peers` stays red until taken |
| **TASK-R0-O1** Publication packet + register | `[!]` | **A4-D1 publish-or-freeze** and eleven decisions sequenced behind it. `./publication-decision-packet-2026-09.md` |
| **TASK-R0-O2** ADR acceptance *(this task)* | `[!]` | **Three signatures.** ADR-19 and ADR-20 have no other unmet precondition; ADR-18 also needs the floor decision (**D188**) |

**The single decision that unblocks the most:** the **Node floor**
(N5-04 D3 / `D160` / `D176`). It gates ADR-18's acceptance (this task),
R1-O4's `validate-min-runtime` lane, R1-O6's hygiene items, the Nuxt 4.4.5 pin
(**N5-03 D4**) and criterion **C10**. **The second:** **A4-D1**, which gates 27
publication decisions.

**The programme's own count:** **217 open owner decisions** at `527dbd1`
(`./owner-decision-register-2026-09.md`), **223 after this task's six.** Seven
contradictions are flagged and unresolved; one of them — the Node floor — is now
recorded inside ADR-18 itself, so the next reader of the ADR cannot mistake it
for settled.

---

## 9. Ranked next packet

1. **🔴 The owner takes the Node floor** (N5-04 D3 / `D160` / `D176`). Nothing
   else in the release-exit file unblocks as much, and ADR-18 cannot be signed
   without it.
2. **🔴 The owner signs ADR-19 and ADR-20** (**D188**a). Two line edits plus
   lowering `maxProposedCitedFromCode` 3 → 1 in the same change. **C1: 0/3 → 2/3**,
   for the first time measurable.
3. **🟠 A4-D1 publish-or-freeze** (`./publication-decision-packet-2026-09.md`).
4. **🟠 Copy ADR-17 in (D-E) and write ADR-09 (D-P).** Together `maxUndocumented`
   14 → 12 — the only ceiling movements available, and **D-P** is a prerequisite
   for answering ADR-20's **D-L** honestly, since D-L proposes amending an ADR
   that has no document.
5. **🟠 D190(c)** — the dev-mode warning for the ~12 status-role components.
6. **🟢 D187(c)** — reserve Pro an ADR band before the next collision.
7. **🟢 D184 from `./TASK-R0-O1-handoff.md`** — correct the stale numbers in
   README §7 and the task files. This task adds a sixth: TASK-R0-O2's
   `<done_check>` clause 4 is unsatisfiable as written (§1).
