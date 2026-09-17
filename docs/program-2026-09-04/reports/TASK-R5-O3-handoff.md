# TASK-R5-O3 — Provider adoption rollout: motion, direction, formats, testIds, defaults

> Handoff for [`../contract-conformance-tasks.md`](../contract-conformance-tasks.md)
> §R5-O3. Program [`../README.md`](../README.md); protocol §4; conventions §5.
>
> **Repo / commit observed:** `ui/dzup-ui` `main` @ `99b963a` (HEAD did not move;
> worktree dirty with ~516 paths across seven packets, all preserved).
> **Started:** 2026-09-04 (crashed session) · **Resumed:** 2026-09-15.

---

## 0. Crash recovery — what the dead session left, and what had to be repaired

The 2026-09-04 session building this task died mid-edit with the words *"Now
update the barrel and importers."* It wrote **no handoff** and updated **no
ledger row**, so the working tree was the only record of its work. Recovering
the truth was the first act of this session, and it produced a result worth
recording: **the crash did far less damage than its last words implied, and the
session had completed far more than they implied.**

### 0.1 What the dead session had actually finished

`git status --short` at resume, cross-read against `mtime` (202 component files
touched in the 18:00–20:30 window) and against `git grep` at `99b963a`:

| Artefact | State found |
|---|---|
| `packages/core/src/composables/provider/useDzMotion.ts` | **New**, complete — `DZ_MOTION_ATTRIBUTE`, `DZ_MOTION_REDUCED_VALUE`, `setDzMotionTestMode`/`dzMotionTestMode`, `createDzMotion`, `useDzMotion`, `useDzMotionAttribute`, `provideDzMotion`. SSR-safe, `globalThis.__DZ_MOTION__` channel for Playwright `addInitScript`. |
| `useDzEnvironment.ts` | Motion cleanly removed; no orphaned symbol, no dangling import. Header rewritten to point at the new file. |
| `packages/tokens/src/generate.ts` | `[data-dz-motion="reduce"]` rule **already emitted** (lines 218–221), unlayered + `!important`, beside the `prefers-reduced-motion` block. |
| `provider-adoption.spec.ts` | **New**, 11 tests covering all four zero-consumer contexts. |
| Component adoption | motion **17**, direction **16**, testIds **88**, formats **2** — all **0** at `99b963a`. |
| `component-meta.json` | **Already regenerated** with a populated `providerHooks` field (114 components). |
| `useRelativeTime.ts`, `useScrollToTop.ts` | Migrated to `useDzFormats` / `useDzLocale`. |

### 0.2 The two breakages the crash actually caused — both repaired

Truth was established by running the gates and reading exit codes directly
(never through a pipe — incident S1-F10):

| # | Breakage | Evidence | Repair |
|---|---|---|---|
| **C1** | `provider-adoption.spec.ts` had unsorted imports — the file was written but never linted. | `npx eslint packages/core/src --ext .ts,.vue` → **exit 1**, 1 error, `perfectionist/sort-imports`: *"Expected `DzButton.vue` to come before `DzAnimatedNumber.vue`"* | `npx eslint <file> --fix` → **exit 0**. |
| **C2** | Barrel doc comment named a symbol that does not exist: `useDzMotionAttrs` vs the real `useDzMotionAttribute`. | `grep -n "useDzMotionAttr" packages/core/src/composables/provider/index.ts` | Corrected in place (`index.ts` line 56). Doc-only; no export changed. |

**Nothing else was broken.** Specifically, and contrary to what the crash
message suggested:

- `npx vue-tsc -p packages/core/tsconfig.json` → **exit 0**. No half-migrated
  importer, no stale re-export, no orphaned symbol.
- `npx vitest run packages/core/src/composables/provider` → **exit 0**,
  **56/56** passing (`provider.spec.ts` 45 + `provider-adoption.spec.ts` 11).

The barrel and the importers the dead session was about to write were, in fact,
already written — it died between finishing the work and saying so. **The
lesson for the program is that a crashed session's last message describes its
intent, not its state; only the gates describe its state.**

### 0.3 A correction to the task brief carried into this session

The resume brief stated that `DzProvider` now carries **twelve** contexts. It
carries **eleven**, and the barrel's own header is correct:

```
grep -oE "DZ_[A-Z_]+_KEY" packages/contracts/src/provider.types.ts | sort -u | wc -l  →  10
```

Ten injection keys (`defaults`, `direction`, `formats`, `locale`, `messages`,
`motion`, `nonce`, `portalTarget`, `sanitizer`, `testIds`) **plus theme**, which
resolves through ADR-09's own provider key rather than a `DZ_*_KEY`, is eleven
concerns — the nine ADR-20 names in `CLAUDE.md`, plus theme, plus the sanitizer
of amendment A6 (TASK-R3-O2). No edit made; recorded so the next reader does not
"fix" a correct comment.

---

## 1. Implemented files and API effect

### 1.1 Inherited from the crashed session, repaired and kept

Its design decision — splitting motion out of `useDzEnvironment.ts` into a module
of its own — was **not re-litigated**. It is argued in the file header, it is
sound (motion is the only one of the five environment concerns with a rendering
consequence), and re-deciding it would have thrown away working code to buy
nothing.

| File | Status | API effect |
|---|---|---|
| `packages/core/src/composables/provider/useDzMotion.ts` | new (inherited) | Adds `useDzMotion`, `useDzMotionAttribute`, `createDzMotion`, `provideDzMotion`, `setDzMotionTestMode`, `dzMotionTestMode`, `DZ_MOTION_ATTRIBUTE`, `DZ_MOTION_REDUCED_VALUE`. **Only `useDzMotion` is on the barrel** — the rest are module-path imports, on the one-sanctioned-writer rule. |
| `packages/core/src/composables/provider/useDzEnvironment.ts` | modified (inherited) | Motion removed. Public surface unchanged for the remaining four. |
| `packages/core/src/composables/provider/index.ts` | modified (inherited) + **repaired here** | Re-exports `useDzMotion`. Doc comment corrected: `useDzMotionAttrs` → `useDzMotionAttribute` (**C2**). |
| `packages/tokens/src/generate.ts` | modified (inherited) | Emits the `[data-dz-motion="reduce"]` rule once, unlayered + `!important`. |
| `packages/core/src/composables/useRelativeTime/useRelativeTime.ts` | modified (inherited) | Formats through `useDzFormats` / `useDzLocale` instead of ambient `Intl`. |
| `packages/core/src/composables/useScrollToTop/useScrollToTop.ts` | modified (inherited) | Honours the motion policy for smooth scrolling. |
| ~202 component files | modified (inherited) | motion **17**, direction **17**, testIds **89** (component-meta count). |
| `packages/core/src/composables/provider/provider-adoption.spec.ts` | new (inherited) + **repaired and extended here** | Import order fixed (**C1**); **4 defaults cases added** (§1.2). |

### 1.2 New in this session — the defaults slice (D20-4)

`useDzDefaults` was the one context the crashed session did not touch. It stood
at **1 of 144 public components** (`DzButton`), which is what D20-4 records.

| File | API effect |
|---|---|
| `packages/core/src/components/buttons/DzIconButton.vue` | `size` / `variant` / `tone` resolve through `resolve('DzIconButton', …)`. The inline chain it already had (`props.x ?? groupContext?.x.value ?? 'default'`) became the same chain with the provider in ADR-20's single slot. |
| `packages/core/src/components/buttons/DzToggleButton.vue` | `variant` / `size` / `tone` resolve through the provider. `withDefaults` literals moved to `resolve`'s last link. **`tone` deliberately keeps no literal fallback** — it had none, and `data-tone` is bound to it. |
| `packages/core/src/components/buttons/DzCopyButton.vue` | `variant` / `size` / `tone` resolve through the provider; the transient `copied → 'success'` tone still outranks every configured source. `:data-variant` rebound from the raw prop to `resolvedVariant`. |

**The invariant that makes this safe, and how it is enforced:** honouring a
default required moving each axis's literal from `withDefaults` into `resolve`'s
last link, so that `props.x` can be `undefined` and the provider can be reached
at all. With no `DzProvider` mounted the resolved value is byte-identical to the
pre-adoption one. That is **not** left as an assertion in prose — it is the
fourth new spec case, which mounts each adopting component bare and asserts the
exact pre-adoption literals.

**This is not a `minor` under `VERSIONING.md`** (`<stop_conditions>` clause 1):
no default behaviour changed for an existing consumer. The regression this class
of edit invites did occur once during implementation and was caught by the
existing suite — see §2.2.

---

## 2. Focused validation — exact commands and exit codes

All read directly (`cmd; echo "exit $?"`), never through a pipe (S1-F10).

### 2.1 Gates

| Command | Exit |
|---|---|
| `npx vue-tsc -p packages/core/tsconfig.json` | **0** |
| `npx eslint packages/core/src --ext .ts,.vue` | **0** (was **1** on arrival — C1) |
| `npx vitest run packages/core/src/composables/provider` | **0** — **60/60** (45 + 15; was 56 before the 4 defaults cases) |
| `npx vitest run packages/core/src/components/buttons` | **0** — **282/282** |
| `npx tsx packages/tooling/src/validators/ownership-manifest.ts` | **0** |
| `npx tsx packages/tooling/src/validators/component-meta.ts` | **0** |
| `npx tsx packages/tooling/src/validators/rtl.ts` | **0** |
| `npx tsx packages/tooling/src/docs/generate-docs-pages.ts --check` | **0** |
| `npx tsx packages/tooling/src/llms/generate-llms.ts --check --no-blocks` | **0** |
| `npx tsx packages/tooling/src/validators/capability-matrix.ts` | **1** — **pre-existing**, see §3 |

### 2.2 The seeded failure — proving the new gate bites

Per the program's standing rule, the defaults assertions were **not believed
green until they were seen red.** `DzIconButton`'s two `resolve(…)` calls were
reverted in place to the exact inline chain they replaced — the state the file
was in before this session:

```
npx vitest run packages/core/src/composables/provider/provider-adoption.spec.ts
  → exit 1 · Tests 2 failed | 13 passed (15)
    ✗ applies the shared size axis to a component that never states one
        expected 'inline-flex …--dz-button-md-height…' to contain '--dz-button-xs-height'
    ✗ lets a per-component default outrank the shared axis
        expected 'primary' to be 'danger'
```

Exactly the two cases that depend on provider resolution failed; the two that
assert precedence-from-props and pre-adoption parity stayed green, which is the
correct discrimination. Restored → **exit 0, 15/15**.

**A real regression was caught the same way.** The first `DzCopyButton` edit left
`:data-variant="variant"` bound to the now-`undefined` raw prop.
`DzCopyButton.spec.ts > defaults to outline variant with neutral tone` failed
with `expected undefined to be 'outline'`. Fixed by rebinding to
`resolvedVariant`. **This is the whole hazard of the defaults slice in one
example**, and the reason the remaining 19 candidates in §6 are ranked as work
rather than quoted as a count: every one needs its raw `data-*` bindings audited,
and the existing per-component suites are what catch it.

### 2.3 Artifact regeneration and determinism

Regenerated in `<repo_conventions>` order — ownership → quality → capability →
component-meta → llms → docs-pages. **Run twice, hashed, byte-identical:**

```
sha256 (both runs)
  fc57286c0c72…  packages/core/docs/component-meta.json
  c4428fbffa89…  packages/core/docs/llms.txt
  965627074e9d…  packages/core/docs/llms-full.txt
  f4c674109b6e…  packages/core/docs/quality-matrix.json
  bbb80db0232a…  packages/core/docs/capability-matrix.json
  a563c4662670…  packages/core/manifests/component-ownership.manifest.json
  dd24ed378752…  apps/docs/.vitepress/generated/nav.json
diff run1 run2 → exit 0
```

This mattered: **`validate:component-meta`, `validate:docs-pages` and
`validate:llms` all read the generated artifact, not the source.** Before
regeneration they would have reported green over the defaults adoption — the
S1-F10 mode the brief warns about. `providerHooks` for `useDzDefaults` moved
**2 → 5 records** across the regeneration, which is the artifact actually
learning what changed.

---

## 3. Aggregate qualification

Three buckets, kept separate per `<repo_conventions>`.

### 3.1 Pre-existing red, re-confirmed — NOT this packet's

| Lane | State | Evidence it is inherited |
|---|---|---|
| `validate:capability-matrix` | **exit 1** — 12 stale cells + `DzFileUpload` Tier D `browser-matrix` unrun | Byte-for-byte the corrected known-red at `99b963a`. The failing input, `test-results/matrix-report.json`, is **absent** — it is a Playwright output no unit lane produces. Nothing in this packet reads or writes it. |
| `packages/tooling` tsc | 7 errors | Inherited; untouched. |
| `eslint e2e/` | 53 errors | Inherited (README's "9" is stale, D13); untouched. |
| Full suite | 2 inherited failures (`landing-token-fallbacks`, `story-dod-tiers countOpen`) | Untouched. |

### 3.1.1 `validate:all` — run END-TO-END, exit code read directly

The brief said `yarn <script>` exits 127 here. **It does not** (decision
**D29**) — that belongs to `ui/dzup-ui-pro`. Measured, then used:

```
yarn typecheck    ; echo $?  → 0
yarn validate:rtl ; echo $?  → 0
yarn validate:all             → VALIDATE_ALL_EXIT=1
```

So the real aggregate was available and was run. It fails at **link 17 of 38,
`validate:capability-matrix`** — the exact link, for the exact reason, that the
corrected known-red records. **Sixteen links pass ahead of it:**

| # | Link | Result |
|---|---|---|
| 1–2 | `typecheck` · `lint` | ✓ |
| 3–4 | `boundaries` (0 violations) · `interaction-contract` (0 violations) | ✓ |
| 5–6 | `contract-parity` · **`hardcoded-strings`** | ✓ |
| 7–8 | `tv-slots` · `anatomy-parts` (615 emissions / 142 components, 0 undeclared) | ✓ |
| 9–10 | `vendor-sublayers` · **`rtl`** | ✓ |
| 11–13 | `form-readiness` · `quality-tiers` (144/144, A55 B67 C21 D1) · `story-status` | ✓ |
| 14–16 | `story-dod` · `story-dod-tiers` (0 tier-required open) · `at-matrix` | ✓ |
| **17** | **`capability-matrix`** | **✗ — 12 stale cells + `DzFileUpload` Tier D** |
| 18–38 | not reached (`&&` short-circuits) | — |

`validate:hardcoded-strings` and `validate:rtl`, both named in this task's
`<validation>` block, are links 6 and 10 — **green inside the aggregate**, not
merely green in isolation. Of the 21 links the short-circuit skipped, four that
this packet's changes are visible to were run individually and are green (§2.1):
`ownership`, `component-meta`, `llms`, `docs-pages`.

**This packet does not call `validate:all` green.** It exits 1 at `99b963a`
untouched and it exits 1 now, at the same link, with byte-identical output.

### 3.2 New red introduced by this packet

**None.** Every gate this packet's changes are visible to is green (§2.1).

### 3.3 Other packets' uncommitted work — preserved

`git status --short` counted **516** paths at start. Nothing outside this
packet's files was edited, and no `git checkout` / `revert` / `stash` was run at
any point. Specifically untouched, as fenced by the brief:
`packages/core/src/security/`, `useDzSanitizer.ts`, `packages/nuxt/src/module*.ts`,
`CLAUDE.md`, `apps/landing/vite/serve-storybook.ts`,
`packages/tooling/{README.md,scripts/adr-registry.json}`, ADR-19/ADR-20,
`docs/program-2026-09/**`, and the 89 `*.anatomy.ts` files.

**TASK-R5-O2's work was not undone.** Its `data-part` / `data-state` emissions
and typed `ui` props are what the new specs *address* (`[data-part="root"]`) and
what the edited templates preserve — the `:data-variant` repair in §2.2 restored
an R5-O2 emission that the defaults edit had broken, rather than removing one.

---

## 4. ADR-20 divergence table, re-issued for TASK-R0-O2

Original: `../program-2026-09/reports/N5-05-adr-20-acceptance-packet.md` §4,
**nine** divergences. Each row's state re-measured at `99b963a` + this tree.

| # | Original finding | Measured now | State |
|---|---|---|---|
| **D20-1** 🔴 | Motion policy has **zero** consumers; `useDzMotion` referenced by no `.vue` | **17 components** consume it; `[data-dz-motion="reduce"]` rule emitted once in `packages/tokens/src/generate.ts`; deterministic test mode via `setDzMotionTestMode` / `globalThis.__DZ_MOTION__` | **fix-code half CLOSED.** The 🔴 accessibility objection — *"a host setting `motion="reduced"` today changes nothing anywhere"* — **no longer holds**, and is asserted by `provider-adoption.spec.ts`. The amend-ADR half (restate §7 in the past tense) remains an **owner** action. |
| **D20-2** 🟠 | Direction resolved centrally, consumed by one `.vue` (the writer) | **16 components** | **fix-code half CLOSED**; amend-ADR half owner-pending. |
| **D20-3** 🟠 | `testId()` called by no component | **88 components** | **fix-code half CLOSED**; amend-ADR half owner-pending. |
| **D20-4** 🟠 | Precedence chain used by **1 of 144** components | **4 components** (`DzButton`, `DzIconButton`, `DzCopyButton`, `DzToggleButton`) | **NARROWED, still open.** 19 enumerated candidates remain — §6 / decision **D27**. |
| **D20-5** 🟠 | `DZ_THEME_KEY` lives in Core, not contracts, contra §1's dependency argument | unchanged | **OPEN — out of scope.** An ADR-09 change; this packet's `<scope>` forbids provider-prop and resolution-order changes. |
| **D20-6** 🟢 | Portal rollout §4 done but listed open | unchanged: **18** consumers, still listed open | **OPEN — amend-ADR only**, an owner action. |
| **D20-7** 🟢 | §5's `Intl` migration complete, ADR describes it as pending | **re-measured and still true**: zero `new Intl.` outside `packages/core/src/i18n/intl-cache.ts` (4 constructions, all inside it) | **OPEN — amend-ADR only**, owner. Re-measurement below. |
| **D20-8** 🟢 | A5's Core-component count stale (38 vs 40) | unchanged | **OPEN — amend-ADR only**, owner. |
| **D20-9** 🟢 | Rollout §6's open question (should `useDzTheme` stop throwing) | unchanged | **OPEN — open question**, owner. |

**9 → 4 fix-code halves closed (D20-1, D20-2, D20-3) and one narrowed (D20-4).
Five rows (D20-5…D20-9) are amend-ADR or open-question rows that an agent may
not close: ADR acceptance is `[!owner]`.** The `<success_criteria>`'s "9 → ≤ 1"
is therefore **not reachable by this packet by construction**, which is recorded
as decision **D28** rather than quietly missed.

### 4.1 The formats finding — why 2 is the complete number, not a thin one

`<success_criteria>` asks for "ambient Intl reads 0" and the ratchet reads
`formats`. The consumer count is **2** and that looks thin next to testIds' 88.
It is not: **the enumeration that defines "applicable" is four files**, named by
`useDzFormats.ts`'s own header —

```
grep -rn "new Intl\." packages/core/src --include=*.ts --include=*.vue | grep -v spec
  → packages/core/src/i18n/intl-cache.ts:74,81,92,100   (4 hits, all inside the cache)
  → nothing else in the package
```

All four original construction sites are wired: `DzAnimatedNumber.vue` and
`DzTimePicker.vue` directly, `DzAnimatedNumber.tween.ts` through the shared
cache, and `useRelativeTime` through `useDzFormats` (the crashed session's edit)
— which is how `DzRelativeTime` is covered without importing the composable
itself. **Ambient Intl reads: 0. The slice is complete at 2 direct consumers**,
and `DzCalendar` / `DzDatePicker` are not counter-examples: they format through
`@internationalized/date` and Reka UI, taking a resolved locale, not an `Intl`
formatter. Recorded as decision **D30** so the low number is not mistaken for
unfinished work by the next reader.

---

## 5. Ratchet movements

| Ratchet | Old (`99b963a`) | New | Bound to |
|---|---|---|---|
| **provider consumers: motion / direction / formats / testIds** | **0 / 0 / 0 / 0** | **17 / 16 / 2 / 88** | `99b963a` + dirty tree |
| `useDzDefaults` consumers (D20-4) | 1 component | **4** components | `99b963a` + dirty tree |
| ambient `Intl` construction sites outside `intl-cache.ts` | 0 | **0** (re-measured, held) | `99b963a` + dirty tree |
| `component-meta.json` records carrying `providerHooks` | 0 (field absent from the committed artifact's population) | **114 of 208** | regenerated, hash `fc57286c0c72…` |

Counts are **component consumers, excluding `DzProvider`**, which is the writer
and would otherwise inflate every row by one. The `providerHooks` tally straight
from the regenerated artifact:

```
useDzTestIds 89 · useDzPortalTarget 18 · useDzDirection 17 · useDzMotion 17
useDzMessages 39 · useDzDefaults 5 · useDzFormats 2 · useDzLocale 2
useDzTheme 1 · useDzNonce 1        (these totals include DzProvider)
```

**Ratchets moved one way only.** No ceiling was raised; `unclassified-ceiling.json`
was not edited by this packet.

---

## 6. Owner decisions raised

D1–D26 are taken. These are new.

| # | Decision | Raised by | Options → recommendation | State |
|---|---|---|---|---|
| **D27** 🟠 | **The defaults slice is 4 of an enumerated 23, and the remaining 19 are work, not a sweep.** 23 public components carry both canonical axes (`size` + `tone`). Adopting one is not a one-line edit: the literal must move out of `withDefaults` so `props.x` can be `undefined`, and **every raw `data-*` binding on that prop must be rebound** — missing one silently drops an attribute R5-O2 just landed, which happened once here and was caught only by `DzCopyButton`'s own spec (§2.2). | this task | (a) finish all 19 in a follow-up packet, family by family, running each family's suite as the gate · (b) adopt opportunistically, whenever a component is edited for another reason · (c) stop at 4 and re-scope D20-4 to "the shared resolver exists and is demonstrated" — **rec. (a)**: (c) leaves ADR §6's *"so no component invents its own order"* false for 140 of 144 components, which is the clause D20-4 exists to flag; (b) has no forcing function. The 19: `DzBadge`, `DzChip`, `DzTag`, `DzSpinner`, `DzProgress`, `DzScrollProgress`, `DzMeterGroup`, `DzList`, `DzTimeline`, `DzCountdown`, `DzAnimatedNumber`, `DzSlider`, `DzRangeSlider`, `DzTabs`, `DzBackTop`, `DzFab`, `DzSpeedDial`, `DzSplitButton`, `DzButtonGroup`. | open |
| **D28** 🟠 | **`<success_criteria>`'s "ADR-20 divergences 9 → ≤ 1" is unreachable by any agent.** Five of the nine (D20-5…D20-9) are **amend-ADR or open-question** rows whose only action is editing ADR-20 and accepting it — an `[!owner]` act this program forbids agents. The four an agent *can* act on (D20-1…D20-4) are acted on: three closed, one narrowed. | this task | (a) re-state the criterion as "the four fix-code divergences", leaving the amend-ADR halves to TASK-R0-O2 where ADR acceptance already lives · (b) authorise this packet to edit ADR-20 · (c) leave the criterion unmet and visible — **rec. (a)**: (b) contradicts the standing authority rule and would let an agent rewrite the document it is being measured against; (c) publishes a permanently-failing criterion. §4's table is written to be pasted straight into TASK-R0-O2 under (a). | open |
| **D29** 🟢 | **The brief's "`yarn <script>` exits 127 here" is false for `ui/dzup-ui`.** Measured: `yarn typecheck` → **exit 0**, `yarn validate:rtl` → **exit 0**. The 127 is real but belongs to **`ui/dzup-ui-pro`**, and carrying it across repos would have cost this session the only end-to-end aggregate it can run — `validate:all` chains `yarn` subcommands and cannot be reproduced with `npx` without re-implementing all 38 links. | this task | (a) correct the environment note to name the repo it applies to · (b) leave it, and have every session re-measure — **rec. (a)**, and it is worth a line in the program README: the note as written would make every future OSS session skip its own aggregate. | open |
| **D30** 🟢 | **`formats` consumers = 2 is the complete number and should not be read as a thin rollout.** The applicable set is the four `Intl` construction sites `useDzFormats.ts`'s header enumerates; all four are wired, ambient reads are **0**, and `DzRelativeTime` is covered through `useRelativeTime` rather than by importing the composable. | this task | (a) record the enumeration beside the ratchet so the number is read correctly · (b) widen the ratchet to count indirect consumers, which would read 3 and still need the same footnote — **rec. (a)**, implemented in §4.1. A generator caveat rides with it: `providerHooks` is derived from **direct imports**, so a component formatting through a composable is not credited. That is correct for "what does this component read" and wrong for "is this component locale-correct"; only the first is claimed. | open |

---

## 7. Ranked next packet

1. **🟠 Finish the defaults slice — the 19 in D27.** The largest remaining piece
   of this task's own scope, fully enumerated, with a worked pattern in three
   components and a spec shape that already covers precedence and pre-adoption
   parity. Per family, running that family's suite as the gate. **Do not batch it
   blind:** §2.2 is the evidence that a raw `data-*` binding is missed roughly
   one component in three.
2. **🟠 TASK-R0-O2 — ADR-20 acceptance**, using §4's re-issued table. The 🔴
   blocker it was waiting on (D20-1, motion with zero consumers) is **closed**,
   so the amend-ADR halves of D20-1…D20-3 can now be written in the past tense
   with measurements rather than deferred.
3. **🟠 The browser-lane half of the motion contract.** `setDzMotionTestMode` and
   the `globalThis.__DZ_MOTION__` channel exist and are unit-proven, but the
   18-project matrix's reduced-motion condition does **not** yet assert through
   them — `<requirements><motion_test_mode>` is half-delivered. Needs a
   Playwright `addInitScript` and a matrix condition rewire; unrunnable here
   (`test-results/matrix-report.json` is absent, §3.1).
4. **🟢 D20-5 / D20-9 — the theme seam.** `DZ_THEME_KEY` in Core rather than
   contracts, and whether `useDzTheme` should stop throwing. One ADR-09 packet,
   not a provider-adoption one.

---

## 8. `git status --short` at START and END (decision D5's mitigation)

| | Paths |
|---|---|
| **START** (resume, before any edit) | **516** |
| **END** | **516** |

```
diff <(sort status-start) <(sort status-now)
  lines added to the dirty set   : none
  lines removed from the dirty set: none      ← the one that matters
```

**Nothing left the dirty set**, which is the property the brief asks to be
proven: no `git checkout`, `revert`, `stash` or `clean` was run at any point, and
six other packets' uncommitted work is intact.

The count is unchanged rather than higher because **`docs/program-2026-09-04/` is
itself untracked** and `git status --short` collapses it to a single `??` entry —
so this handoff, new inside it, adds no line. Confirmed rather than assumed:

```
git status --short docs/program-2026-09-04/   → ?? docs/program-2026-09-04/
git check-ignore -v  …/TASK-R5-O3-handoff.md  → exit 1 (not ignored)
ls -la               …/TASK-R5-O3-handoff.md  → present
```

Every other file this packet touched was **already** in the dirty set at
`99b963a` (TASK-R5-O2 had edited the same component files), so edits to them move
no line either. `HEAD` is `99b963a` throughout; no commit was made.

---

# Continuation — D27 defaults adoption

> **Third session, 2026-09-15.** Scope: owner decision **D27** and nothing else
> — the 19 enumerated `useDzDefaults` candidates §6 left as work. HEAD still
> `99b963a`; no commit. Sections below follow the `<handoff>` order.
>
> **Progress log (written as the session runs, not at the end).**

| Batch | Components | Result |
|---|---|---|
| 1 · buttons | `DzFab` · `DzSplitButton` · `DzSpeedDial` (rejected: `DzButtonGroup`) | vue-tsc 0 · `buttons` + `provider` **348/348**, exit 0 · seeded failure confirmed red |
| 2 · feedback | `DzBadge` · `DzSpinner` · `DzProgress` · `DzScrollProgress` · `DzMeterGroup` | vue-tsc 0 · eslint 0 · `feedback` + `provider` **497/497**, exit 0 · 3 seeded failures confirmed red (one exposed a spec-table blind spot, closed with two geometry rows) |
| 3 · data | `DzChip` · `DzTag` · `DzList` · `DzTimeline` · `DzCountdown` · `DzAnimatedNumber` | vue-tsc 0 · eslint 0 · `data` + `provider` **678/678**, exit 0 · 3 seeded failures confirmed red (incl. the compound-context shape: a root that styles itself right while every child falls back) |
| 4 · forms + navigation | `DzSlider` · `DzRangeSlider` · `DzTabs` · `DzBackTop` | vue-tsc 0 · eslint 0 · `forms` + `navigation` + `buttons` + `provider` **1575/1575**, exit 0 · 3 seeded failures confirmed red — `DzBackTop`'s returned `'primary'` where `'neutral'` was required, the predicted forwarding defect |

## C1. Implemented files and API effect

**18 of D27's 19 candidates adopted; 1 deliberately rejected.** `useDzDefaults`
component consumers **4 → 22**. The pattern is the one §1.2 established and is
not re-invented: each axis's literal moves out of `withDefaults` into
`resolve`'s **last link**, so `props.x` can be `undefined` and the provider is
reachable, while an unprovided tree renders exactly what it rendered before.

| File | Axes routed through `resolve` | The non-obvious reader that also had to move |
|---|---|---|
| `packages/core/src/components/buttons/DzFab.vue` | variant · size · tone | `:data-size` **and** `:data-tone`, plus the `buttonVariants(…)` call — **no spec asserted either attribute** |
| `packages/core/src/components/buttons/DzSplitButton.vue` | variant · size · tone | the three `toRef()`s it **provides to its children**, plus `:data-tone` |
| `packages/core/src/components/buttons/DzSpeedDial.vue` | variant · size · tone | `actionButtonSize`'s lookup map, the `SPEED_DIAL_ACTION_PX[…]` geometry, `item.tone ?? tone`, and the three props forwarded to the inner `DzFab` |
| `packages/core/src/components/feedback/DzBadge.vue` | variant · size · tone | `:data-tone` |
| `packages/core/src/components/feedback/DzSpinner.vue` | size · tone | `:data-tone` |
| `packages/core/src/components/feedback/DzProgress.vue` | variant · size · tone | **`v-if="variant === 'bar'"`** — the branch switch — plus `circularSizeMap[…]`, the tone-to-CSS-var map and **two** `:data-tone` bindings |
| `packages/core/src/components/feedback/DzScrollProgress.vue` | variant · size · tone | `v-if` branch, `:data-variant`, the inline-thickness branch, `scrollProgressCircularSize[…]` and `scrollProgressToneVar[…]` |
| `packages/core/src/components/feedback/DzMeterGroup.vue` | size | the track recipe (segment `tone` is per-value **data** and is deliberately not routed) |
| `packages/core/src/components/data/DzChip.vue` | variant · size · tone | the close button's **inline `size === 'sm' ? … : ''` class ladder** in the template |
| `packages/core/src/components/data/DzTag.vue` | variant · size · tone | the same inline ladder |
| `packages/core/src/components/data/DzList.vue` | variant · size · tone | the `toRef()`s provided to `DzListItem`; `tone` had **no** literal default and does not acquire one |
| `packages/core/src/components/data/DzTimeline.vue` | size · tone | the `toRef()` provided to `DzTimelineItem`; `tone` keeps no literal |
| `packages/core/src/components/data/DzCountdown.vue` | size · tone | `:data-size` + `:data-tone` |
| `packages/core/src/components/data/DzAnimatedNumber.vue` | size · tone | `:data-size` + `:data-tone` |
| `packages/core/src/components/forms/DzSlider.vue` | size · tone | `:data-tone`, which sits on `data-part="control"` and not on the root |
| `packages/core/src/components/forms/DzRangeSlider.vue` | size · tone | the same |
| `packages/core/src/components/navigation/DzTabs.vue` | variant · size · tone | the three `toRef()`s the list, triggers and panels inject, plus `:data-variant` + `:data-tone` |
| `packages/core/src/components/navigation/DzBackTop.vue` | variant · size · tone | the three props **forwarded to an inner `DzFab`** whose own `tone` literal differs (§C2.3) |
| `packages/core/src/composables/provider/provider-adoption.spec.ts` | — | **+47 cases**, taking the provider suite from 60 to **107**: a table-driven raw-binding audit (**22 rows × 2** — 18 components plus four extra rows for readers no root attribute can see) and a 3-case compound-context block |

**No public API changed.** Every prop keeps its type and its effective default;
the `withDefaults` literals moved into `resolve`'s last link. Per
`<stop_conditions>` clause 1 this is **not a `minor` under `VERSIONING.md`** —
no existing consumer's default behaviour changes — and that is proven rather
than asserted: the `bare` column of every audit row mounts the component with
**no provider** and pins the exact pre-adoption value.

### C1.1 Rejected: `DzButtonGroup` (owner decision **D31**)

`DzButtonGroup` is the one candidate in D27's 19 that is **not** adopted, and
the reason is a precedence inversion rather than effort. Its `size` / `variant`
/ `tone` already default to `undefined` **on purpose**: they exist to be
forwarded into the group context, which `DzButton` consults at position **2** of
its chain — `resolve('DzButton', 'size', [props.size, groupContext?.size.value])`
— that is, *ahead of the provider*. If the group resolved first, a host writing

```ts
defaults: { size: 'xs', DzButton: { size: 'lg' } }
```

would get `xs` buttons: the group picks up the **shared axis**, hands it down as
group context, and group context outranks the child's **per-component** default.
That inverts the one precedence rule ADR-20 §6 exists to state. Adopting there
also buys nothing a host cannot already write — `defaults.DzButton.size` and the
shared axis both already reach every button through `DzButton`'s own adoption,
which landed at `99b963a`. Options and recommendation: §C5, **D31**.

## C2. Focused validation — exact commands and exit codes

All read directly (`cmd; echo "exit $?"`), never through a pipe (S1-F10).

### C2.1 Per-batch gates, run as the work went rather than at the end

| Batch | Command | Exit / result |
|---|---|---|
| 1 buttons | `npx vue-tsc -p packages/core/tsconfig.json` | **0** |
| 1 buttons | `npx vitest run …/composables/provider …/components/buttons` | **0** — **348/348** |
| 2 feedback | `npx vue-tsc …` · `npx eslint packages/core/src --ext .ts,.vue` | **0** · **0** (after one `--fix` for `perfectionist/sort-imports`) |
| 2 feedback | `npx vitest run …/composables/provider …/components/feedback` | **0** — **497/497** |
| 3 data | `npx vue-tsc …` · `npx eslint packages/core/src` | **0** · **0** (one `--fix` for `sort-named-imports`) |
| 3 data | `npx vitest run …/composables/provider …/components/data` | **0** — **678/678** |
| 4 forms + nav | `npx vue-tsc …` · `npx eslint packages/core/src` | **0** · **0** |
| 4 forms + nav | `npx vitest run …/provider …/forms …/navigation …/buttons` | **0** — **1575/1575** |

Repo-wide after all four batches: `yarn typecheck` → **0**, `yarn lint` → **0**.

### C2.2 The seeded failures — twelve of them, every one confirmed red first

The standing rule was applied to **every batch**: revert a resolution in place,
run, read the failure, restore. Nothing below was believed green before it had
been seen red.

| Seeded reversion | Observed failure | Verdict |
|---|---|---|
| `DzFab` `:data-tone` → raw prop | `expected [ 'data-tone', undefined ] to deeply equal [ 'data-tone', 'primary' ]`, and again for `'danger'` | caught, both columns |
| `DzSplitButton` `:data-tone` → raw | the same shape, `'primary'` / `'success'` | caught |
| (control) `DzSpeedDial` under that same seed | **stayed green** — the dial passes its FAB an explicit resolved prop, so the FAB's raw read still sees a value | correct discrimination, not a miss |
| `DzBadge` `:data-tone` → raw | `undefined` vs `'neutral'` / `'info'` | caught |
| `DzProgress` `v-if="variant === 'bar'"` → raw | `expected true to be false` — with no provider the **circular branch renders while the bar branch is styled** | caught; the nastiest shape in the set |
| `DzScrollProgress` `scrollProgressCircularSize[…]` → raw | **not caught at first** — see §C2.4 | **a hole in the audit, found and closed** |
| `DzChip` close-ladder → raw `size` | `expected [ … ] to include 'h-4'` / `'h-5'` | caught |
| `DzList` provided `toRef` → raw `props.size` | the **child** `DzListItem` lost `px-[var(--dz-spacing-6)]` while the root stayed correct | caught by the compound-context block |
| `DzAnimatedNumber` `:data-size` → raw | `undefined` vs `'md'` / `'xl'` | caught |
| `DzSlider` `:data-tone` → raw | `undefined` vs `'primary'` / `'warning'` | caught |
| `DzTabs` `:data-tone` → raw | `undefined` vs `'primary'` / `'success'` | caught |
| `DzBackTop` `:tone` forward → raw | **`expected [ 'data-tone', 'primary' ] to deeply equal [ 'data-tone', 'neutral' ]`** | caught — §C2.3 |

Every seed was restored and its family suite re-run to **exit 0** before the
next batch started.

**The rate D27 predicted held.** Of the 18 components adopted, **13** had at
least one reader that no root `data-*` attribute covers — a `v-if` branch, a
lookup map, an inline class ladder, a provided `toRef`, or a forwarded prop.
"Roughly one in three" was, if anything, optimistic; the reason the count did
not become a defect count is that every one of them was grepped out of the
`.vue` and its `.variants.ts` **before** the edit, per the brief's step (a).

### C2.3 `DzBackTop` — the forwarding defect, which is worse than a dropped attribute

`DzBackTop` renders a `DzFab` and forwards `variant` / `size` / `tone` to it.
`DzBackTop`'s own `tone` literal is **`neutral`**; `DzFab`'s is **`primary`**.
For a forwarding component the literal is therefore not cosmetic: drop it
instead of keeping it as `resolve`'s last link and `undefined` travels down to a
child that substitutes **a different default**, silently repainting every
back-to-top button in every application — no missing attribute, no type error,
just a different colour. The seeded run above *is* that defect, observed. The
`bare` column (`data-tone: 'neutral'`) is what pins it down.

The same shape was checked and handled in `DzSpeedDial` (forwards to `DzFab`)
and in `DzSplitButton` / `DzList` / `DzTimeline` / `DzTabs` (forward through
provide/inject).

### C2.4 The hole the probe found in the probe

Seeding `DzScrollProgress`'s `scrollProgressCircularSize[resolvedSize.value]`
back to `props.size` **passed**. The reason generalises and is worth recording:
that component's `md` diameter is **44**, and the code's own fallback is
`?? 44`. With no provider the raw read yields `undefined → 44`, indistinguishable
from the correct answer — and the row's `defaults` map at that moment set only
`tone` and `variant`.

An axis whose literal default coincides with the code's fallback is therefore
**invisible to any bare-render assertion**, and invisible to any attribute
assertion as well, because that axis never becomes an attribute. Two
`(circular geometry)` rows were added — `DzScrollProgress` (44 → 56) and
`DzProgress` (32 → 48) — which pass `variant` as an *instance* prop so the SVG
branch renders and only `size` comes from the provider. Re-seeded: **caught**,
`expected [ 'width', '44' ] to deeply equal [ 'width', '56' ]`.

### C2.5 Artifact regeneration and determinism

Regenerated in `<repo_conventions>` order — ownership → quality → capability →
component-meta → llms → docs-pages. (There is no `generate:playground-seeds`
script in this repo; `validate:playground-parity` is a validator with no
generator half, so the chain ends at docs-pages.) **Run twice, hashed,
byte-identical:**

```
sha256 (run 1 == run 2, diff exit 0)
  a563c46626…  packages/core/manifests/component-ownership.manifest.json   (unchanged)
  f4c674109b…  packages/core/docs/quality-matrix.json                      (unchanged)
  bbb80db023…  packages/core/docs/capability-matrix.json                   (unchanged)
  7e89260dfc…  packages/core/docs/component-meta.json        fc57286c0c… → 7e89260dfc…
  c4428fbffa…  packages/core/docs/llms.txt                                 (unchanged)
  a8537550ea…  packages/core/docs/llms-full.txt              965627074e… → a8537550ea…
  2d94fadc60…  apps/docs/.vitepress/generated/nav.json       dd24ed3787… → 2d94fadc60…
```

Every artifact's `sourceCommit` is `99b963a03e1c…` — **equal to HEAD**, which is
the precondition `<evidence_rules>` sets before any of these numbers may be
quoted. 144 generated docs pages changed; the pages for components this packet
did **not** touch changed only because their evidence stamp still read
`51dec93c` and now reads `99b963a0` — the artifacts catching up with HEAD, not
content this packet authored.

This mattered for the same reason it mattered last session: **`validate:component-meta`,
`validate:llms` and `validate:docs-pages` all read the generated artifact, not
the source**, so before regeneration they report green over fresh work (the
S1-F10 mode). `providerHooks` for `useDzDefaults` moved **5 → 23 records**
(22 components plus `DzProvider`), and records carrying any `providerHooks`
moved **114 → 120 of 208**.

### C2.6 Validators that read the regenerated artifacts

| Command | Exit |
|---|---|
| `yarn validate:ownership` | **0** |
| `yarn validate:component-meta` | **0** |
| `yarn validate:llms` | **0** |
| `yarn validate:docs-pages` | **0** |
| `yarn validate:rtl` | **0** |
| `yarn validate:hardcoded-strings` | **0** |
| `yarn validate:anatomy-parts` | **0** |
| `yarn validate:tv-slots` | **0** |
| `yarn validate:quality-tiers` | **0** |

## C3. Aggregate qualification

Three buckets, kept separate per `<repo_conventions>`.

### C3.1 `validate:all` — run END-TO-END, exit code read directly

```
yarn validate:all          → VALIDATE_ALL_EXIT=1
```

It fails at **link 17 of 38, `validate:capability-matrix`** — 12 stale cells
plus `DzFileUpload` Tier D `browser-matrix` unrun — which is **the exact link,
with the exact message, of the corrected known-red at `99b963a`**:

```
✗ [tier-d] DzFileUpload is Tier D and its `browser-matrix` cell is unrun with no
  artifact (required by tier B). …
  ! input `browser-matrix` is absent (test-results/matrix-report.json).
  12 stale cell(s)
1 capability-matrix violation(s).
```

The 38 links were enumerated from `package.json` rather than assumed; the chain
is `&&`-joined, so **links 1–16 ran and passed** and **18–38 were not reached**:

| # | Link | Result |
|---|---|---|
| 1–2 | `typecheck` · `lint` | ✓ |
| 3–4 | `boundaries` · `interaction-contract` | ✓ |
| 5–6 | `contract-parity` · **`hardcoded-strings`** | ✓ |
| 7–8 | `tv-slots` (130 of 209 SFCs carry a slot recipe) · `anatomy-parts` (615 emissions / 142 components, 0 undeclared) | ✓ |
| 9–10 | `vendor-sublayers` (0 registered, 0 found) · **`rtl`** | ✓ |
| 11–13 | `form-readiness` · `quality-tiers` (144/144, A55 B67 C21 D1) · `story-status` | ✓ |
| 14–16 | `story-dod` (314 advisory) · `story-dod-tiers` · `at-matrix` | ✓ |
| **17** | **`capability-matrix`** | **✗ — pre-existing** |
| 18–38 | not reached (`&&` short-circuits) | — |

`validate:hardcoded-strings` and `validate:rtl`, both named in this task's
`<validation>` block, are links 6 and 10 — **green inside the aggregate**, not
merely green in isolation. Of the 21 links the short-circuit skipped, the four
this packet's changes are visible to (`ownership` 22, `component-meta` 24,
`llms` 25, `docs-pages` 26) were run individually and are green (§C2.6).

**This packet does not call `validate:all` green.** It exits 1 at `99b963a`
untouched and it exits 1 now, at the same link, for the same absent input.

### C3.2 Pre-existing red, re-confirmed — NOT this packet's

| Lane | State | Why it is inherited |
|---|---|---|
| `validate:capability-matrix` | **exit 1** — 12 stale cells + `DzFileUpload` Tier D | Its input `test-results/matrix-report.json` is a Playwright output no unit lane produces and this packet neither reads nor writes. |
| `packages/tooling` tsc | 7 errors | Inherited; untouched. |
| `eslint e2e/` | 53 errors | Inherited (README's "9" is stale, D13); untouched. |
| Full unit suite | `yarn test` **exit 1** — **2 failed / 9584 passed / 3 skipped / 1 todo (9590)**, and the two are byte-for-byte the inherited pair: `story-dod-tiers > countOpen > subtracts a waiver` and `landing-token-fallbacks`. **518 test files, 516 green.** | Untouched by this packet. |

### C3.3 New red introduced by this packet

**None.** Every gate this packet's changes are visible to is green: `typecheck`
0, `lint` 0, the four family suites 0, the nine artifact validators 0, and
`validate:all` links 1–16.

### C3.4 Other packets' uncommitted work — preserved

No `git checkout`, `revert`, `stash` or `clean` was run at any point. Fencing
respected exactly as the brief set it: `packages/core/src/security/`,
`useDzSanitizer.ts`, `packages/nuxt/src/module*.ts`, `CLAUDE.md`,
`apps/landing/vite/serve-storybook.ts`,
`packages/tooling/{README.md,scripts/adr-registry.json}`, ADR-19/ADR-20 and
`docs/program-2026-09/**` were not opened for writing.

**TASK-R5-O2's work was not undone.** Its `data-part` / `data-state` emissions
and typed `ui` props are in the same files this packet edited, and they are what
the new audit *addresses* (`[data-part="root"]`, `[data-part="control"]`,
`[data-part="close"]`) rather than what it replaces. Where an adopted component
lacked a `data-part` root the audit uses the component's own stable handle
(`[role="progressbar"]`, `[role="timer"]`, `span[data-state="ready"]`) — no part
was added, removed or renamed by this packet, and `validate:anatomy-parts` is
green with the same 615 emissions across 142 components.

## C4. Ratchet movements

| Ratchet | Old | New | Bound to |
|---|---|---|---|
| **provider consumers: motion / direction / formats / testIds** | 17 / 16 / 2 / 88 | **17 / 16 / 2 / 88** (unchanged — this slice is `defaults` only) | `99b963a` + dirty tree |
| **`useDzDefaults` consumers (D20-4)** | **4** components | **22** components | `99b963a` + dirty tree |
| `component-meta.json` records carrying `providerHooks` | 114 of 208 | **120 of 208** | regenerated, hash `7e89260dfc…` |
| `providerHooks` records naming `useDzDefaults` | 5 | **23** (22 components + `DzProvider`) | same artifact |
| axis-bearing components **not** resolving through the provider | 97 of 101 | **79 of 101** | measured from the regenerated artifact, §C5 D33 |

Counts are **component consumers, excluding `DzProvider`** (the writer, which
would otherwise inflate every row by one), measured two ways that agree:

```
grep -rl useDzDefaults packages/core/src/components --include=*.vue | wc -l   →  22
component-meta.json providerHooks: useDzDefaults                             →  23  (22 + DzProvider)
```

Full tally straight from the regenerated artifact (all include `DzProvider`):

```
useDzTestIds 89 · useDzMessages 39 · useDzDefaults 23 · useDzPortalTarget 18
useDzMotion 17 · useDzDirection 17 · useDzFormats 2 · useDzLocale 2
useDzTheme 1 · useDzNonce 1
```

**Ratchets moved one way only.** No ceiling was raised; `unclassified-ceiling.json`
and `story-dod` ceilings were not edited by this packet.

## C5. Owner decisions raised

D1–D26 are taken. **D27 is discharged** by this session (§C8); D28–D30 stay open
as recorded. These are new.

| # | Decision | Raised by | Options → recommendation | State |
|---|---|---|---|---|
| **D31** 🟠 | **`DzButtonGroup` is excluded from the defaults slice on purpose, and the exclusion is a precedence argument, not a backlog item.** Its three axes default to `undefined` *so that they can be forwarded*, and `DzButton` reads the group context at position 2 of its chain — ahead of the provider. Resolving in the group makes the **shared** axis outrank the child's **per-component** default: `defaults: { size: 'xs', DzButton: { size: 'lg' } }` would render `xs`, inverting the rule ADR-20 §6 exists to state. It also adds no capability: both `defaults.DzButton.size` and the shared axis already reach every button through `DzButton`'s own adoption. | this task | (a) leave `DzButtonGroup` unadopted and record the reason at the code, so the next sweep does not "finish" it — **rec.** · (b) adopt it and accept the inversion for hosts that write both keys · (c) give `resolve` a per-component-only mode so a wrapper can resolve without absorbing the shared axis — a provider **API** change, which this task's `<scope>` forbids and which should be argued in an ADR-20 amendment if (b)'s inversion is ever felt in practice. (c) is the principled long answer; (a) is correct today and costs nothing to reverse. | open |
| **D32** 🟠 | **D27's premise that "the existing per-component suites are what catch it" is FALSE for most of the 19, and the mitigation shipped here is a central table.** Measured before editing: `DzFab.spec.ts` and `DzSplitButton.spec.ts` contain **zero** assertions on `data-tone` / `data-size` / `data-variant`; `DzCopyButton` (the component that produced the original evidence) happened to be an exception. Had this session trusted that premise, `DzFab`'s two dropped attributes would have shipped green. The replacement is `provider-adoption.spec.ts`'s table-driven audit: one row per adopting component, each attribute asserted **twice** — the pre-adoption literal with no provider, and the configured value under one — plus `classToken` for an axis that reaches only a `tv()` recipe, `appearsWhenConfigured` for an axis that drives a `v-if`, and a separate block for axes handed to children through provide/inject. 22 rows over 18 components, **47 cases**, provider suite 60 → **107**. | this task | (a) keep the central table and make a row **mandatory** for any future adoption, wired as a `validate:*` cross-check that every `useDzDefaults` consumer in `component-meta.json` has a row — **rec.**: it is the only option with a forcing function, and the artifact that lists the consumers already exists · (b) push the assertions down into each component's own spec — better locality, 22 places to forget · (c) rely on review. Note the table is itself fallible: §C2.4 is a hole it had, found only by seeding. | open |
| **D33** 🟢 | **The real residual for ADR-20 §6 is 79 components, not 19, and it should be measured from the artifact rather than hand-listed.** Derived from the regenerated `component-meta.json`: **101** components declare at least one canonical axis (`size` / `tone` / `variant`); **22** now resolve through `useDzDefaults`; **79** do not. By shape: **16** carry all three (`DzInput`, `DzTextarea`, `DzSelect`-family, `DzPanel`, `DzToolbar`, `DzRating`, `DzKnob`, `DzListbox`, `DzCascader`, `DzMention`, `DzNumberInput`, `DzPasswordInput`, `DzSearchInput`, `DzTagsInput`, `DzTreeSelect`, `DzInputMask`), 11 carry `size`+`variant`, 37 carry `size` only, 7 `tone` only, 6 `variant` only, 1 each of `size`+`tone` and `tone`+`variant`. Some are correctly excluded on inspection — `DzListItem` / `DzTimelineItem` take their axes from a compound root that now resolves, and `DzMeterGroup`-style per-item `tone` is data — so the number is a **worklist, not a defect count**. | this task | (a) re-scope D20-4's closing condition to "every component with a canonical axis resolves through `useDzDefaults`, or its exclusion is argued at the code", and track the 79 as a generated count the way `anatomy non-declaring 113↓` is tracked — **rec.**: a generated ratchet cannot go stale the way D27's hand-typed 19 did (it was measuring only the components carrying *both* `size` and `tone`) · (b) declare D20-4 closed at 22, which republishes ADR §6's *"no component invents its own order"* as true when it is true for 22 of 144 · (c) enumerate the 79 by hand into a new decision. | open |

## C6. Ranked next packet

1. **🟠 The next defaults tranche — the 16 three-axis components in D33.** The
   form-input family (`DzInput`, `DzTextarea`, `DzSelect`, `DzNumberInput`,
   `DzPasswordInput`, `DzSearchInput`, `DzTagsInput`, `DzMention`, `DzListbox`,
   `DzCascader`, `DzTreeSelect`, `DzInputMask`) is one coherent slice and is
   where a host-wide `size: 'sm'` is most often wanted. The pattern, the audit
   table and the seeding protocol are all in place; add a row per component
   **before** editing it, and grep the `.vue` + `.variants.ts` for every reader
   first — §C2.2 is the evidence that 13 of 18 hide one.
2. **🟠 Wire D32(a): a validator that fails when a `useDzDefaults` consumer has
   no audit row.** Small, reads `component-meta.json`'s `providerHooks`, and it
   is what stops tranche 2 from regressing silently the way tranche 1 nearly did.
3. **🟠 TASK-R0-O2 — ADR-20 acceptance**, using §4's re-issued divergence table.
   Unchanged by this session except that D20-4 now reads *22 of 144* rather than
   *4 of 144*; its 🔴 blocker (D20-1) remains closed.
4. **🟠 The browser-lane half of the motion contract.** `setDzMotionTestMode`
   and the `globalThis.__DZ_MOTION__` channel exist and are unit-proven, but the
   18-project matrix's reduced-motion condition still does not assert through
   them. Unrunnable here — `test-results/matrix-report.json` is absent, which is
   also what keeps link 17 red.
5. **🟢 D20-5 / D20-9 — the theme seam.** An ADR-09 packet, not a provider one.

## C7. `git status --short` at START and END (decision D5's mitigation)

| | Paths |
|---|---|
| **START** | **516** — inherited from the previous session's recorded END at the same `HEAD` (`99b963a`), with no commit in between |
| **END** | **523** |

The delta is **+7, all additions**: component files this packet edited that
earlier packets had not touched. **Nothing left the dirty set**, which is the
property D5 asks to be proven, and it is proven two ways rather than asserted:

- no `git checkout`, `git revert`, `git stash` or `git clean` was run at any
  point in the session;
- every path this session wrote — the 18 `.vue` files, `provider-adoption.spec.ts`
  and all six regenerated artifacts — was checked against `git status --short`
  individually and **every one is still dirty**, so no write happened to restore
  a file to its committed content. A removal is therefore impossible: a path can
  only leave the dirty set through a write or a destructive git command, and
  there were no other writes.

`docs/program-2026-09-04/` is itself untracked and collapses to a single `??`
entry, so this handoff adds no line. `HEAD` is `99b963a` throughout; no commit
was made.

## C8. Final state of TASK-R5-O3 across all three sessions

| Context | At `99b963a` | Now | State |
|---|---|---|---|
| `useDzMotion` | 0 consumers | **17** | closed (session 1) |
| `useDzDirection` | 0 | **16** | closed (session 1) |
| `useDzTestIds` | 0 | **88** | closed (session 1) |
| `useDzFormats` | 0 | **2** — the complete applicable set, D30 | closed (session 1) |
| `useDzDefaults` | 1 | **22** — 18 adopted here, 1 rejected with an argument (D31) | **D27 discharged**; D20-4 narrowed from *1 of 144* to *22 of 144*, residual measured at 79 axis-bearing components (D33) |

**Task status: `[~]`, and the remainder is precise.** Three things are left, none
of them the `defaults` slice this session was scoped to:

1. **79 axis-bearing components still resolve nothing** (D33) — a worklist, now
   derived from a generated artifact instead of a hand-typed list, with the next
   16-component tranche named in §C6.
2. **The browser-lane half of `<requirements><motion_test_mode>`** — the
   reduced-motion condition of the 18-project matrix does not yet assert through
   `setDzMotionTestMode`. Unrunnable in this environment.
3. **The five amend-ADR / open-question divergences** (D20-5…D20-9) — `[!owner]`
   by construction, which is D28.

Everything an agent is authorised to do inside `defaults` is done. The one
candidate not adopted is not deferred work: it is a decision with an argument
(D31), and a future sweep that "finishes" it without reading that argument will
invert ADR-20 §6.

**Nothing in this session is CI, release or production evidence.** Every number
above is a local run against a worktree carrying seven packets of uncommitted
work, bound to `99b963a` — *locally qualified*, per the maturity ladder, and no
further.
