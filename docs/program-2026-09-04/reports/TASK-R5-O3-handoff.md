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

---

# Continuation 2026-09-17 — the motion browser lane and the D32(a)/D33(a) gate

> **Fourth session, 2026-09-17.** Scope: the two agent-actionable items §C8
> left open — the browser half of `<requirements><motion_test_mode>` (§C8 item 2)
> and turning the `defaults` residual into a gate (§C8 item 1, as owner
> decisions **D32(a)** and **D33(a)**, taken under delegation). Item 3, the five
> amend-ADR divergences (D28), is owner-only and was not touched. No component
> adopted `useDzDefaults` (that is the separate adoption tranche); no provider
> prop, resolution order, Pro file or ADR changed; no component source changed.
>
> **Repo / commit:** `ui/dzup-ui` `main` @ `569d887` (HEAD did not move; the
> worktree carries several packets' uncommitted work, all preserved). The browser
> runs drove `apps/storybook/storybook-static`, built 2026-09-17 12:45. That is
> newer than every motion-consumer source and the tokens rule they rely on
> (`find packages/core/src packages/tokens/src … -newer iframe.html` lists only
> R3-O3's forms/layout files), and `[data-dz-motion=reduce]{animation-duration:.01ms!important;…}`
> is present in the built `assets/iframe-*.css`.

## E1. "Unrunnable here" was wrong — measured before any edit

§C6/§C8 recorded the browser half as unrunnable because
`test-results/matrix-report.json` is absent. That file is an **output** the
capability matrix reads; its absence says nothing about whether Playwright runs
on this machine. It does:

```
STORYBOOK_E2E_STATIC=1 STORYBOOK_E2E_PREBUILT=1 \
  node node_modules/@playwright/test/cli.js test e2e/matrix --project=matrix-chromium-reduced-motion
  → exit 0 · 176 passed · 1 skipped (DzThemeProvider fixme: no story) · 3.4 min
```

Playwright 1.61.1 with chromium-1228, firefox-1532 and webkit-2311 installed.
Every JSON report this session wrote went to the scratchpad; nothing was written
to `test-results/matrix-report.json`, so the capability matrix's inputs are
untouched and its link stays red for its own recorded reason (§E6).

## E2. The reduced-motion condition — before and after

**Before** (as committed in `a01965f`, i.e. by the crashed first session):

- `playwright.config.ts:58` — the condition is the engine option
  `reducedMotion: 'reduce'`.
- `e2e/matrix/conditions.spec.ts:58–65` (HEAD) — a `beforeEach` already set
  `globalThis.__DZ_MOTION__ = 'reduced'` through `addInitScript`, but **no
  assertion read the result**.
- `e2e/matrix/conditions.spec.ts:106–149` (HEAD) — the only assertion:
  `document.getAnimations()` has nothing `running` one second after the story
  settles.
- Its comment conceded that either switch could be the one that stopped an
  animation, and deferred the separation to "owner decision D27" — a wrong
  reference (D27 is the defaults slice).

**That cell cannot see the library's policy — measured, not argued.** With the
forced channel deliberately broken (seed A1, §E2.3), the old condition on
chromium went **exit 0, 176 passed / 1 skipped**, the same counts as unseeded.
The tokens stylesheet answers the engine's media query by itself, so a component
that ignored `DzProvider`'s `motion` would pass.

**After:**

| File:line | Change |
|---|---|
| `e2e/matrix/motion-policy.spec.ts` (new, 250 lines) | **The contract.** `beforeEach` (`:98`) forces the channel and sets the page back to `reducedMotion: 'no-preference'` (`:109`), so the media query says *animate* and cannot take credit; the precondition is asserted, not assumed. Per motion-consuming target: reveal the animated node (`REVEAL`, `:78`); assert `[data-dz-motion="reduce"]` is in the DOM (`:195`) — the policy resolved to reduced and reached CSS; then sample every frame for 20 frames (`:210`) and fail on any animation or transition inside that subtree whose `getComputedTiming().duration` exceeds 1 ms. `DzAnchor`, whose policy lives in script, is asserted on `window.scrollTo`: every call must be `behavior: 'auto'` (`:186`). Each result carries a `motion-policy` annotation (`marked=`, `governedAnimations=`, `lingering=`), so a report shows whether the end-state arm had anything to measure. |
| `e2e/matrix/fixtures.ts:187–300` | `FORCED_MOTION_PREFERENCE` (`:187`) and `forceMotionPolicy(page)` (`:198`) — the one `addInitScript` → `__DZ_MOTION__` writer; `MOTION_TARGETS` (`:249`) **derived from `component-meta.json` `providerHooks`**, compound parts credited to `parentComponent`, `attribute` vs `script` decided by reading each part's source for `useDzMotionAttribute(`; `MOTION_CONSUMERS_OUTSIDE_LANE` (`:276`); `storyCompleted(page)` (`:293`). |
| `e2e/matrix/conditions.spec.ts:35–64` | The `beforeEach` calls `forceMotionPolicy`; the comment now says what this cell proves (the WCAG half, under a real OS preference, over all 88 runnable Tier B–D targets) and what it does not, and points at the contract spec. The `getAnimations` assertion (`:105`) is **unchanged**. |
| `playwright.config.ts:78–82` | `testIgnore: /motion-policy\.spec\.ts$/` on every matrix project except `*-reduced-motion`. **No project renamed** — the 18 names are identical. `reducedMotion: 'reduce'` (`:58`) is kept, because the WCAG cell still needs it. |

A second spec on the existing projects rather than a seventh condition or an
in-spec skip: a seventh project is a matrix name the capability matrix does not
know, and a skip would print ~210 "skipped" cells across the other fifteen
projects (D81). `--list` confirms the scope: `motion-policy.spec.ts` appears 14×
under `matrix-webkit-reduced-motion` and 0× under `matrix-chromium-default` and
`matrix-firefox-rtl`.

**Two harness facts had to be measured on the way:**

1. Storybook sets `sb-show-main` **before** `play` runs, and `DzCommandPalette`'s
   `play` opens and closes its own dialog. The first wait, for
   `__STORYBOOK_PREVIEW__.currentRender.phase === 'completed'`, timed out on
   **14/14**; a probe of the built preview showed the phase settles on
   **`finished`**. `storyCompleted` accepts both, with the measurement in its doc
   comment.
2. The end-state arm first read `getAnimations()` once, straight after the
   attribute appeared. Seed A2 turned **7** red and left `DzDialog` green — yet a
   diagnostic listing every animation showed `DzDialog`'s overlay and content
   running `opacity`/`transform` transitions at the seeded 2000 ms on the next
   run. The attribute lands when the node mounts; the enter transition starts a
   frame or two later. Sampling 20 frames removed the race: the same seed now
   turns **8** red, `DzDialog` included, on chromium **and** webkit.

### E2.1 Which components — derived, not listed

`component-meta.json` has **17** records calling `useDzMotion` (writers
excluded). Credited to the component whose story renders them they are **16**
components; **14** are in the lane (Tier B–D with a story) and **2** are Tier A,
outside it (`DzAnimatedNumber`, `DzFloatLabel`):

| Family | Lane target (consuming parts) | Reveal |
|---|---|---|
| overlays | `DzCommandPalette` · `DzContextMenu` (Content) · `DzDialog` (Content, Overlay) · `DzDropdownMenu` (Content) · `DzPopconfirm` · `DzPopover` (Content) · `DzSheet` (Content) · `DzTooltip` (Content) · `DzTour` | the trigger a user would use: click, right-click, or focus for the tooltip |
| feedback | `DzBlockUI` | click "Block panel" |
| data | `DzAccordion` (Content) | expand the first item |
| forms | `DzSwitch` | toggle |
| navigation | `DzColorModeToggle` (rendered) · `DzAnchor` (script: `scrollTo`) | none · click the second link |

The run covers **every** lane consumer, not a sample: overlays 9/9, feedback 1/1,
plus data, forms and navigation.

### E2.2 Runs and pass counts

| Run | Exit | Result |
|---|---|---|
| **Before**, chromium, `e2e/matrix` (only `conditions.spec.ts` existed) | **0** | 176 passed · 1 skipped · 3.4 min |
| **After**, `e2e/matrix` × `matrix-{chromium,firefox,webkit}-reduced-motion`, 18:18–18:33 | **0** | **570 passed · 3 skipped · 0 unexpected · 0 flaky** · 14.8 min. Per project: `conditions.spec.ts` **176/176**, `motion-policy.spec.ts` **14/14**, 1 fixme skipped (`DzThemeProvider`, no story) — identical on all three engines |
| **Final** (after the 20-frame fix), `motion-policy.spec.ts` × 3 engines | **0** | **42/42** · 0 flaky · 1.3 min. `conditions.spec.ts` was not edited after the run above |
| **Independent re-run on the final code** (verified 2026-09-17, §E12), `e2e/matrix` × 3 reduced-motion projects | **0** | chromium **190 passed · 1 skipped** (4.4 min); firefox + webkit **380 passed · 2 skipped** (14.1 min) — **570 / 3** on the code as it stands. The 570 row above ran BEFORE the 20-frame fix, so until this re-run the full-lane number was not measured on the final spec |

Final-run annotations (`marked` · `governedAnimations` peak · `lingering`), every
cell `lingering=0`:

| Component | chromium | firefox | webkit |
|---|---|---|---|
| `DzAccordion` | 3 · 0 | 3 · 0 | 3 · 0 |
| `DzAnchor` | `scrollTo` ×1, `auto` | ×1, `auto` | ×1, `auto` |
| `DzBlockUI` | 2 · 1 | 2 · 0 | 2 · 1 |
| `DzColorModeToggle` | 1 · 0 | 1 · 0 | 1 · 0 |
| `DzCommandPalette` | 2 · 0 | 2 · 0 | 2 · 0 |
| `DzContextMenu` | 1 · 0 | 1 · 0 | 1 · 0 |
| `DzDialog` | 2 · 3 | 2 · 0 | 2 · 3 |
| `DzDropdownMenu` | 1 · 0 | 1 · 0 | 1 · 0 |
| `DzPopconfirm` | 1 · 0 | 1 · 0 | 1 · 0 |
| `DzPopover` | 1 · 0 | 1 · 0 | 1 · 3 |
| `DzSheet` | 2 · 0 | 2 · 0 | 2 · 0 |
| `DzSwitch` | 1 · 2 | 1 · 0 | 1 · 0 |
| `DzTooltip` | 1 · 0 | 1 · 0 | 1 · 3 |
| `DzTour` | 2 · 0 | 2 · 0 | 2 · 0 |

Under the real reduced rule a governed animation lasts 0.01 ms, so whether a
sampled frame catches one is timing-dependent; that is why the arm judges
computed durations rather than counting, and why seed A2 — not this column — is
the evidence the arm bites.

### E2.3 Seeded proofs — the new assertion bites, the old one could not

Every seed ran through a script that backs up the file, edits it, runs, and
restores the original buffer in `finally`; SHA-256 of both touched files was
checked unchanged afterwards (`sha256sum -c` OK).

| Seed | Engine | Exit | Result |
|---|---|---|---|
| **A1 — break the channel**: `FORCED_MOTION_PREFERENCE` `'reduced'` → `'reduce'` (a value `dzMotionTestMode()` rejects) | chromium | **1** | `motion-policy.spec.ts` **14 failed / 0 passed**: 13× `DzX rendered no [data-dz-motion="reduce"] under __DZ_MOTION__=reduce: the provider did not resolve the forced motion policy to reduced`, and `DzAnchor scrolled with ["smooth"]` |
| A1, the **old** `conditions.spec.ts` reduced-motion cell | chromium | **0** | **176 passed / 1 skipped** — blind to the broken channel |
| A1 | firefox | **1** | 14 failed / 0 passed |
| **A2 — keep the attribute, break the end state**: a 2 s `!important` duration on `[data-dz-motion="reduce"]` subtrees before the reveal | chromium | **1** | **8 failed / 6 passed**. Red: `DzAccordion` (`accordion-down`), `DzBlockUI`, `DzCommandPalette`, `DzDialog`, `DzPopover`, `DzSwitch`, `DzTooltip`, `DzTour` — each `still animates inside [data-dz-motion="reduce"]` |
| A2 | webkit | **1** | 8 failed / 6 passed, the same eight |
| every seed restored, unseeded | chromium | **0** | 14/14 |

The six A2 survivors are not misses. `DzAnchor` is the script arm, which CSS
cannot touch. `DzColorModeToggle` is not revealed. `DzContextMenu`,
`DzDropdownMenu`, `DzPopconfirm` and `DzSheet` ran **no** governed animation in
20 frames even at 2 s, because their `transition-*` utilities do not fire when a
node is inserted: there is no enter motion to reduce. For those four the
attribute arm is the one that counts, and seed A1 shows it biting on all four.
Recorded as **D82**.

## E3. D32(a) + D33(a) — `yarn validate:provider-defaults`

Built on the existing machinery, not beside it: a validator in
`packages/tooling/src/validators/` with a pure `check…()` the specs drive and a
`tsx` CLI; a `…-ceilings.json` data file whose ratchet fails on a rise **and** on
an unrecorded fall, the rule `component-meta-ceilings.json` and
`page-contract-ceilings.json` already follow; a `//validate:…` comment key in
`package.json`; one link in `validate:all`. It reads the **generated**
`component-meta.json`, so it is **link 29 of 43**, straight after
`validate:component-meta` (28) proves that artifact fresh and before
`validate:llms` (30).

| File | What |
|---|---|
| `packages/tooling/src/validators/provider-defaults.ts` (new, 465 lines) | **Clause 1 — D32(a).** Every `useDzDefaults` consumer in `providerHooks` (writers under `packages/core/src/providers/` excluded) must be mounted by a row of `adoptionCases` in `provider-adoption.spec.ts` that **can fail** — a non-empty `configured` map, a `classToken` or an `appearsWhenConfigured`. A row mounting a non-consumer is stale. The table must still be run by `describe.each(adoptionCases)`. Rows are read from source text by their `component:` field, not their title. **Clause 2 — D33(a).** Exclusions need a reason (≥ 20 characters), a real record, a declared axis, and a component that still does not resolve; the residual is ratcheted. `--all` lists the residual. |
| `packages/tooling/src/validators/provider-defaults-ceilings.json` (new) | `residual.ceiling` **76**; three exclusions, each with a reason and a decision. |
| `packages/tooling/src/validators/provider-defaults.spec.ts` (new) | **28** cases: every clause driven red with fabricated inputs, plus the real catalogue at zero violations and an exact partition invariant (`resolving + excluded + residual = canonical-axis`). No pinned count — the ceiling file holds the one number that moves. |
| `packages/core/src/composables/provider/provider-adoption.spec.ts` | **+4 audit rows** (`DzButton`, `DzIconButton`, `DzCopyButton`, `DzToggleButton`), §E3.1. File 62 → **70** cases; provider suites 107 → **115**. |
| `package.json` | `//validate:provider-defaults` + `validate:provider-defaults`; `validate:all` 42 → **43** links. |

**"Canonical axis", defined so the hand count reproduces.** A prop named `size`,
`tone` or `variant` whose type, minus `undefined`, is non-empty and not numeric.
That rules out `DzQRCode.size: number` (a pixel count) and the bare `undefined`
that `variant?: never` extracts to on `DzKnob`, `DzListbox` and `DzRating`.
Measured from the artifact: **101** canonical-axis components · **22** resolving ·
**79** unresolved — D33's hand numbers, reproduced exactly — · **3** excluded ·
**76** residual, the ceiling. Counting by prop name alone gives 102 / 80; the one
extra is `DzQRCode`.

**Exclusions** — per axis, so a component is excluded only when every axis it
declares is excluded:

| Component | Axes | Decision | Reason (full text in the JSON) |
|---|---|---|---|
| `DzButtonGroup` | size · tone · variant | D31 | its axes are forwarded as group context, which `DzButton` reads ahead of the provider; resolving in the group would invert ADR-20 §6 |
| `DzListItem` | tone | D33 | a per-row marker; the list-wide axes resolve on `DzList` and arrive through inject |
| `DzTimelineItem` | tone | D33 | one event's status colour; size and orientation resolve on `DzTimeline` |

### E3.1 What the gate found on its first run

**exit 1** — four consumers with no audit row: `DzButton`, `DzCopyButton`,
`DzIconButton`, `DzToggleButton`. These are the adopters that predate the table
(sessions 1–2), covered only by the hand-written `defaults` block, which pins one
attribute each. Rows added, each asserting the readers a root attribute cannot
see: `DzButton`'s recipe height, `DzIconButton`'s square-footprint lookup map
(`w-[…]`, which the shared recipe never emits), `DzCopyButton`'s icon-only recipe
and its own `sm` literal, and `DzToggleButton`'s `tone`, which must stay
**absent** with no provider. The new rows are not vacuous: seeding
`DzIconButton`'s `squareSizeClass` back to `props.size` turned
`provider-adoption.spec.ts` **exit 1, 2 failed / 68 passed**
(`expected [ Array(19) ] to include 'w-[var(--dz-button-lg-height)]'`); restored,
`cmp` exit 0.

### E3.2 Seeded proofs of the gate (live CLI)

Each seed backs up, mutates, runs `tsx …/provider-defaults.ts`, restores the
original buffer (`Buffer.compare` identical), and re-runs to exit 0. SHA-256 of
both touched files checked unchanged at the end.

| Seed | Exit | Violation |
|---|---|---|
| delete the `DzToggleButton` row | **1** | `[audit-row] DzToggleButton calls useDzDefaults … and has no row in the raw-binding audit` |
| keep that row but empty it (`configured: {}`, no `classToken`) | **1** | `[audit-row] DzToggleButton's raw-binding audit row asserts nothing` |
| `describe.each(adoptionCases)` → `describe.skip.each` | **1** | `[audit-table] … no describe.each(adoptionCases) runs it` |
| remove the `DzListItem` exclusion (a rise) | **1** | `[ratchet] The ADR-20 §6 residual ROSE 76 → 77` |
| ceiling 76 → 77 (a fall nobody recorded) | **1** | `[ratchet] … residual FELL 77 → 76. Lower residual.ceiling …` |
| blank `DzButtonGroup`'s reason | **1** | `[exclusion] exclusion DzButtonGroup (size, tone, variant) carries no reason` |
| after every restore | **0** | — |

The second seed exists because of a hole found while writing the first: a row
that mounts a component and asserts nothing would have satisfied a presence
check. The vacuity clause went in before the gate was called done.

## E4. Focused validation — exact commands and exit codes

All read from a log with `echo $?` straight after, never through a pipe.

| Command | Exit | Result |
|---|---|---|
| `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/provider-defaults.spec.ts packages/core/src/composables/provider` | **0** | 3 files, **143/143** (28 gate + 45 `provider.spec` + 70 `provider-adoption.spec`) |
| `yarn validate:provider-defaults` | **0** | 22 consumers · 22 audited · 101 / 22 / 79 / 3 / **76** (ceiling 76) |
| `yarn typecheck` | **0** | |
| `yarn lint` | **0** | |
| `node node_modules/eslint/bin/eslint.js e2e/matrix/{motion-policy.spec,fixtures,conditions.spec}.ts playwright.config.ts` (outside the `lint` target) | **0** | after one `--fix` for `style/operator-linebreak` |
| `node node_modules/typescript/bin/tsc --noEmit -p packages/tooling/tsconfig.json` | **2** | **12** errors, the pre-existing set (D78); **none** in the new files |
| `yarn test:ssr` | not run | no provider or composable source changed — the brief's condition for it |

## E5. Artifacts

Nothing this session touched feeds a generated artifact: no component source,
anatomy, story, token or manifest input changed. `component-meta.json` was read,
not regenerated; `validate:component-meta` (link 28) confirms it is still fresh.
No Playwright JSON was written to `test-results/`.

## E6. Aggregate qualification

```
yarn validate:all   → VALIDATE_ALL_EXIT=1   (18:26–18:29)
```

It fails at **link 19 of 43, `validate:capability-matrix`**: `22 stale cell(s)`,
`[tier-d] DzFileUpload … browser-matrix cell is unrun with no artifact`, and
`[freshness] packages/core/docs/capability-matrix.json is stale` — **the
pre-existing red TASK-R3-O4 recorded at link 19 of 42**, one link later in the
count only because `provider-defaults` sits after it. Links **1–18 passed** inside
the aggregate.

> **Attribution, verified 2026-09-17 (§E12).** The ledger's ratchet board still
> said **12** stale cells (bound to `99b963a`). The extra **10** are not from this
> session or any dirty-tree packet: all 22 are `perf-baseline` cells, and staleness
> is pure git history (`evidenceIsCurrent` = `merge-base --is-ancestor` of the
> component's last commit vs the baseline's `sourceCommit` `4c9fb7a`). Commit
> **`a01965f`** (2026-09-17 11:43, "land program-2026-09-04 R3/R5") touched every
> component source, flipping `DzCalendar`, `DzCommandPalette`, `DzDataGrid`,
> `DzDataView`, `DzMegaMenu`, `DzPersonaSelector`, `DzSidebar`, `DzTable`, `DzTour`,
> `DzTree` from `pass` to `stale`. The committed `capability-matrix.json` still
> records 12 (C 11 + D 1), which is most of its `freshness` failure; the rest is
> the `visual-baselines` input note going 8 → 12 components, from TASK-R5-O4's
> four text-stress fixtures. Nothing TASK-R5-O3 changed feeds this matrix. Links **20–43** were then run one by one, each to its own log, and
**all exit 0**:

```
20 visual-baselines 0 · 21 tokens 0 · 22 tokens:refs 0 · 23 tokens:dtcg 0 · 24 tokens:schema 0
25 exports 0 · 26 ownership 0 · 27 mcp 0 · 28 component-meta 0 · 29 provider-defaults 0
30 llms 0 · 31 docs-pages 0 · 32 playground-parity 0 · 33 package-names 0 · 34 doc-snippets 0
35 engines 0 · 36 adr-references 0 · 37 readme-facts 0 · 38 externals 0 · 39 dts 0
40 changelog 0 · 41 release-policy 0 · 42 peers 0 · 43 licenses 0
```

**Not called green.**

```
yarn test   → YARN_TEST_EXIT=1   (18:44–18:51, 388.7 s)
  Test Files  3 failed | 531 passed (534)
  Tests       3 failed | 9975 passed | 4 skipped | 1 todo (9983)
  Errors      695
```

The **three failures are the inherited set the brief names, and nothing else**:
`story-dod-tiers > countOpen > subtracts a waiver`, `landing token fallbacks > every
fallback matches the value its token resolves to`, and `dzup-resolution > the real
repository > covers exactly the specifiers the packages declare` (the inline snapshot
missing `high-contrast`). **All 695 unhandled errors** are
`ReferenceError: requestAnimationFrame is not defined` attributed to
`apps/landing/src/pages/AnimationsPage.v2.spec.ts` — the known load-dependent race
(R3-O4 counted 656). Both new spec files ran green inside the full suite:
`provider-adoption.spec.ts` 70 tests and `provider-defaults.spec.ts` 28 tests.
**New red introduced by this packet: none.**

## E7. Ratchet movements

| Ratchet | Old | New | Bound to |
|---|---|---|---|
| `validate:all` links / first failing link | 42 / 19 | **43 / 19** — `provider-defaults` is link 29, after the failing one | `569d887` + dirty tree |
| reduced-motion condition asserting the ADR-20 §7 policy through `__DZ_MOTION__` (lane consumers × engines) | 0 | **14 × 3**, derived from `providerHooks` | same |
| `useDzDefaults` consumers with no raw-binding audit row | 4 (unmeasured until now) | **0**, gated | same |
| ADR-20 §6 residual — canonical-axis components not resolving, net of argued exclusions | 79 of 101, hand-measured | **76**, generated ceiling | same |
| provider suites (`provider.spec` + `provider-adoption.spec`) | 107 | **115** | same |

## E8. Owner decisions

**D32 and D33 are taken as option (a), under delegation** (the brief's
instruction), and recorded as **D79** and **D80** in EXECUTION-STATUS. New
decisions: **D81** (the shape of the motion browser lane — recommendation: keep
it as built) and **D82** (four overlays with no enter motion — a design call).

## E9. Ranked next packet

1. **🟠 The defaults adoption tranche, against the new ceiling.** Start with the
   16 three-axis form controls (§C6). Each adoption now meets a forcing function
   from both sides: the gate fails until the component has an asserting audit
   row, and fails again until `residual.ceiling` is lowered.
2. **🟠 TASK-R0-O2 — ADR-20 acceptance**, using §4's table. D20-1's fix-code half
   now has browser evidence on three engines, not only jsdom.
3. **🟢 D82** — decide whether the four overlays get an enter motion; if they do,
   the end-state arm becomes load-bearing for them with no spec change.
4. **🟢 Persist a real matrix report** (`PLAYWRIGHT_JSON_OUTPUT=test-results/matrix-report.json`
   over all 18 projects). Its absence is what keeps the capability matrix's
   `browser-matrix` cells `unrun` and link 19 red. That belongs to TASK-R2-O1,
   not here.

## E10. `git status --short` at START and END

| | Paths |
|---|---|
| **START** (before any edit, HEAD `569d887`) | **271** |
| **END** (HEAD `569d887`, no commit) | **279** |

`diff <(sort start) <(sort end)` → **+8 additions, 0 removals**:

```
+  M e2e/matrix/conditions.spec.ts
+  M e2e/matrix/fixtures.ts
+  M packages/core/src/composables/provider/provider-adoption.spec.ts
+  M playwright.config.ts
+ ?? e2e/matrix/motion-policy.spec.ts
+ ?? packages/tooling/src/validators/provider-defaults.spec.ts
+ ?? packages/tooling/src/validators/provider-defaults.ts
+ ?? packages/tooling/src/validators/provider-defaults-ceilings.json
```

`package.json` was already dirty, and `docs/program-2026-09-04/` is untracked and
collapses to one `??` line, so the handoff and ledger edits add none.

> **Corrected, verified 2026-09-17 (§E12):** `docs/program-2026-09-04/` is
> **tracked** (committed in `a01965f`), not untracked. `EXECUTION-STATUS.md` was
> already ` M` from other packets, but this handoff was clean at HEAD (HEAD has §C8
> and no Continuation 2026-09-17), so the session added a ninth path,
> ` M docs/program-2026-09-04/reports/TASK-R5-O3-handoff.md`. Measured
> `git status --short | wc -l` = **280**, i.e. **271 → 280, +9**, not 279 / +8. No
`checkout`, `revert`, `stash` or `clean` was run. Every seeded edit (to
`DzIconButton.vue`, `fixtures.ts`, `motion-policy.spec.ts`,
`provider-adoption.spec.ts` and the ceilings file) was restored from a byte copy
and verified with `cmp`, `Buffer.compare` or `sha256sum -c`. `DzIconButton.vue` is
not in the added set because it was already dirty and its restored bytes equal its
pre-seed bytes. Failure artifacts the seeded Playwright runs left in the ignored
`test-results/` directory were deleted, so it is back to Playwright's own
`.last-run.json`.

## E11. Final state of TASK-R5-O3

| Context / requirement | Before this session | Now |
|---|---|---|
| motion / direction / formats / testIds consumers | 17 / 16 / 2 / 88 | unchanged — closed in session 1 |
| `useDzDefaults` consumers | 22 | 22 — unchanged; every one audited, gated |
| `<motion_test_mode>` unit half | done (session 1) | done |
| `<motion_test_mode>` browser half | "unrunnable" | **done** — the reduced-motion condition asserts through `__DZ_MOTION__` on 14 components × 3 engines, seeded red and restored |
| D32 / D33 | open | **taken (a)** — D79 / D80, one gate at link 29 |

**Task status: `[x]`.** What remains is outside this task's authority or its
scope, by construction:

1. **The five amend-ADR / open-question divergences (D20-5…D20-9)** — `[!owner]`,
   decision **D28**.
2. **The 76-component `defaults` residual** — the separately scoped adoption
   tranche, now a generated ceiling instead of a hand-typed list.

**Nothing in this session is CI, release or production evidence.** Every number
above is a local run against a dirty worktree bound to `569d887` — *locally
qualified* and browser-lane-qualified on this machine, and no further.

## E12. Independent verification (2026-09-17)

An adversarial re-check by an agent that did not write this work, same machine,
same `569d887` + dirty tree, same `storybook-static` (12:45). Every exit code read
from a log file, never through a pipe. **No source change resulted**; every seed
was restored and checked with `sha256sum -c` (OK). Only this section, the three
"verified 2026-09-17" notes above and the ledger annotations were written.

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | capability-matrix "22 stale cells, pre-existing" | **holds; attribution added** | `capability-matrix.ts --all` exit 1 lists 22 cells, **all `perf-baseline`**. Recomputed from git: at `99b963a` 12 of them were stale (the ledger's 12); at HEAD 22. The +10 (`DzCalendar`, `DzCommandPalette`, `DzDataGrid`, `DzDataView`, `DzMegaMenu`, `DzPersonaSelector`, `DzSidebar`, `DzTable`, `DzTour`, `DzTree`) are **commit `a01965f`** touching every component source after the `4c9fb7a` baselines. Staleness reads `git log` only, and `packages/core/perf/baselines.json` is clean, so **no dirty-tree packet (R5-O3, R5-O4, R3-O3, R3-O4) can move it**. A fresh-vs-committed cell diff shows exactly those 10 cells plus the `visual-baselines` input note (8 → 12 components, R5-O4's text-stress fixtures) |
| 2 | `testIgnore` scopes only `motion-policy.spec.ts` | **holds** | `playwright test --list` with the current config vs `git show HEAD:playwright.config.ts` (a temporary sibling copy, deleted; real config hash unchanged): 3807 vs 4017. Per project, `chromium`/`firefox`/`webkit` **193 = 193**; the three `*-reduced-motion` **191 = 191**; the other 15 matrix projects **191 → 177**. The 210 missing entries are all `motion-policy.spec.ts` (15 × 14); **0** other tests differ |
| 3 | `conditions.spec.ts` not weakened | **holds** | `git diff HEAD`: the comment block is rewritten and the inline `addInitScript` is replaced by `forceMotionPolicy(page)`, which writes the same `'reduced'`. The `getAnimations` assertion is untouched |
| 4 | the motion assertion bites | **holds** | Seed A1 (`FORCED_MOTION_PREFERENCE` → `'reduce'`), chromium, whole `e2e/matrix`: **exit 1, 14 failed / 176 passed / 1 skipped** — all 14 motion-policy cells red (13 × "rendered no `[data-dz-motion="reduce"]`", `DzAnchor` "scrolled with `["smooth"]`"), and every `conditions.spec.ts` cell still green, so the old cell's blindness is confirmed too. Not vacuous: `MOTION_TARGETS` has 14 entries in every reduced-motion project. A throwaway diagnostic (deleted) listed the marked nodes before and after each reveal: for the nine overlays the attribute appears **only after** the reveal, on the revealed `content`/`panel`/`overlay`, so the page-wide locator is not satisfied by an unrelated node; `DzAccordion`, `DzBlockUI`, `DzColorModeToggle` and `DzSwitch` carry it on their own root/content from mount, which is correct |
| 5 | the gate is real | **holds** | `yarn validate:provider-defaults` exit 0; `--all` prints 22 consumers · 101 / 22 / 79 / 3 / 76, computed by `measureResidual()` from `component-meta.json` (no constant except the ceiling). Seed: delete the `DzToggleButton` row → **exit 1** `[audit-row] DzToggleButton calls useDzDefaults … has no row`; restored, exit 0. Extra seed: `DzToggleButton.vue` `:data-tone="resolvedTone"` → `"tone"` → `provider-adoption.spec.ts` **1 failed / 69 passed** (its new row); restored. The three exclusions check out against source: `DzButton` resolves `[props.size, groupContext?.size.value]` before the provider (D31), `DzList`/`DzTimeline` resolve their axes through `useDzDefaults` and `provide` them, and the items' `tone` binds only that item's `data-tone` |
| 6 | gates | **holds** | `yarn typecheck` **0** · `yarn lint` **0** · eslint on the 6 new/changed e2e + tooling files **0** · vitest `provider-defaults.spec.ts` + `composables/provider` **143/143** (28 + 45 + 70) · `tsc -p packages/tooling` exit 2 with **12** errors, **0** in the new files · reduced-motion lane on the final code: chromium 190/1, firefox + webkit 380/2, **570 / 3, exit 0** |
| 7 | ledger/handoff counts | **two overclaims, corrected** | (a) the 570/3 lane figure was measured before the 20-frame fix; it now holds on the final code (§E2.2). (b) `git status` "271 → 279, +8" rested on `docs/program-2026-09-04/` being untracked; it is tracked, the handoff itself became ` M`, measured **280, +9** (§E10) |

**Status I would stand behind: `[x]`** for the task's agent-actionable scope — the
browser half of `<motion_test_mode>` and D32(a)/D33(a) are real and seeded red.
`validate:all` remains red at link 19 for reasons outside this packet (above), and
none of this is CI evidence.
