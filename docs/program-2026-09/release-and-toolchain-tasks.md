# dzup-ui — Release engineering & toolchain hygiene tasks (roadmap N5, OSS slice)

> Part of the [System Program 2026-09](./README.md). Every prompt assumes the
> `<repo_conventions>` block in [README.md §3](./README.md#3-how-these-tasks-are-written).
>
> **Sources:** reassessment `01-plan-challenge.md` §A6 (versioning/release
> policy undefined where it matters; toolchain currency), `02` §2 "Release
> engineering" row (17 unreleased changesets vs `workspace-changelog` stale
> since 2026-06-27; no 0.x statement; no 1.0 exit; `validate-min-runtime` CI
> written, never dispatched), `05` §A4 items 4–5, roadmap §N5.
>
> **Ordering:** N5-01 (0.x policy) unblocks N5-02 (the ARIA-prop breaking
> fixes) — a breaking change without a stated breaking-change convention is
> not reviewable. N5-03/04/05 are independent. Per the amended admission rule,
> **REL-class release closeout does not run while N1 admission debt is open.**

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

> ## Lane complete — 5/5 packets `[x]`, run 2026-09-03
>
> Executed synchronously (N5-05 overlapped N5-03's tail under a no-touch list).
> **`HEAD` `6f1f653` at open and at close** — nothing committed, pushed, dispatched,
> published or version-bumped. Live ledger:
> [`EXECUTION-STATUS-N5.md`](./EXECUTION-STATUS-N5.md). **38 owner decisions opened.**
>
> The lane was scheduled as the *publication* lane; what it repeatedly found was that
> **the gates and the consumer disagree, and only the gates were ever consulted** —
> `changeset status` fixed since August with no gate running it; 6 ARIA gaps that were
> 12; an ADR-debt ratchet that is status-blind; an i18n catalog unreachable from the
> published package; and `@dzup-ui/contracts` unable to be `import()`ed by Node beneath
> 37 green validator links and 9,187 passing tests.

---

### [x] TASK-N5-01 — 0.x semver statement, changelog system of record, changeset reconciliation 🟠

> **`[x]` done 2026-09-03 · 7 `[!owner]` ·** [`N5-01-release-policy-handoff.md`](./reports/N5-01-release-policy-handoff.md)
> · [`changelog-system-of-record-2026-09.md`](./reports/changelog-system-of-record-2026-09.md) `[!owner]`
> · [`1-0-exit-criteria-2026-09.md`](./reports/1-0-exit-criteria-2026-09.md) `[!owner]`
>
> Policy shipped as `packages/contracts/VERSIONING.md`. **`changeset status` was already
> green** — TASK-SK-1 fixed it in August; the live defect was that **no gate ever ran the
> command**, so the deliverable became a guard: `validate:release-policy` spawns the real
> command plus nine invariants, proven on six negative probes (including `major` on 0.x,
> which `changeset status` exits 0 on and would ship `1.0.0`). **16 changesets, not 17**;
> 5 correctly leveled, 10 over-declared, 0 under-declared, **0 edited** — re-levelling is
> release behaviour, filed as D3. `validate:all` 36 → 37 links. Zero version bumps.
> **D1 🔴:** `validate:changelog` and `validate:mcp` are mutually exclusive, so the first
> release turns `validate:all` red.

_Gap: the pre-1.0 convention (0.x minor = breaking, 0.x patch = additive) is
industry standard but stated nowhere; two changelog systems coexist (external
`workspace-changelog` stale since 2026-06-27 vs 17 live changesets, and
`changeset status` failed on `main` during SK-1); a 1.0 exit is undefined._

```xml
<role>You are a release engineer in ui/dzup-ui. Follow <repo_conventions>. Policy authorship + repo hygiene; no version is bumped, nothing is published.</role>

<task>(1) Write the versioning policy statement — 0.x minor = breaking, 0.x patch = additive, what "breaking" covers for this library (props, emitted parts/states per ADR-19, tokens as ABI per TOKENS-01, manifest-recorded public symbols) — into the contracts package and the READMEs via the generated-facts mechanism. (2) Diagnose and fix the `changeset status` failure. (3) Audit the 17 pending changesets against the actual changes they describe (correct semver level per the new policy?). (4) Write the changelog system-of-record recommendation (changesets vs workspace-changelog) and a proposed 1.0 exit-criteria list — both `[!owner]`.</task>

<motivation>TASK-N5-02 needs the policy to legally ship breaking a11y fixes; the docs site (N2-D1) needs a versioning page it can cite; and 17 unreleased changesets against a failing status command means the release machinery would misfire the day the owner asks for a release.</motivation>

<discovery>
  1. Reproduce `changeset status` on main; capture the exact error and root-cause it (config? ignored packages? pre-mode residue?).
  2. Read all 17 changesets; map each to its commits; classify each as correctly/incorrectly leveled under the new policy.
  3. Read the workspace-changelog integration (where it lives, what consumed it) to ground the system-of-record memo in how each system is actually wired.
  4. Read roadmap N5-R2's proposed 1.0 criteria (ADRs accepted, anatomy/ui ≥ Tier B, matrix failures 0, AT Tier C/D executed, DTCG shipped, docs site live, Pro ownership manifest feeding the resolver) as the starting proposal — refine against repo reality, don't invent a competing list.
</discovery>

<steps>
  1. Fix changeset status; add whatever regression guard prevents silent re-breakage.
  2. Author the policy statement in @dzup-ui/contracts (docs/ or package README section) with the breaking-surface definition; wire the README mention through generated facts, not hand-typed text.
  3. Write the changeset audit table (changeset · declared level · correct level · action) — corrections to changeset files are content edits, allowed; version bumps are not.
  4. Write the system-of-record memo + refined 1.0 criteria into docs/program-2026-09/reports/; mark both [!owner].
</steps>

<validation>
  yarn changeset status       # now green
  yarn validate:all
  yarn typecheck && yarn lint
</validation>

<success_criteria>Policy statement published and cited-able; changeset status green with a guard; all 17 changesets audited with explicit actions; two [!owner] memos filed; zero version bumps, zero publishes.</success_criteria>

<stop_conditions>Stop when fixing changeset status would require version bumps or removing changesets whose intent is unclear — list them for the owner; when the breaking-surface definition conflicts with an ADR — surface the conflict.</stop_conditions>
```

---

### [x] TASK-N5-02 — Close the six ARIA-prop gaps (breaking type change, policy-gated) 🟠

> **`[x]` done 2026-09-03 · 6 `[!owner]` ·** [`N5-02-aria-prop-gaps-handoff.md`](./reports/N5-02-aria-prop-gaps-handoff.md)
>
> **The six gap cells were twelve props** — the gate counts cells, not declarations.
> **3 implemented (`patch`) / 9 removed (`minor`)**, decided per prop: Reka proved
> irrelevant to five of six controls, the deciding fact being the element's role under
> ARIA 1.2. Gate **`245 pass / 6 gap` → `251 pass / 0 gap`**, C2 identity `38 → 44`, **no
> cell converted to `n-a`**, no gate edited to hide a cell. Root cause (**D1**):
> `ariaInvalid` sits in `BaseAccessibilityProps` instead of `BaseValidationProps`.
> **D3 🔴** records that `0 gap` still overstates — `DzInplace`'s reviewed C2 gap can
> never reach the matrix.

_Gap: 02 §4 debt register — six form controls declare ARIA props they cannot
honour (a promise-shaped lie to AT users), plus `DzOrderList.dragHandleLabel`
renders nothing. Removal is a breaking type change; it becomes legal once
TASK-N5-01's policy exists. The FORM-OSS gate lists these as its 6 remaining
"gap" cells._

```xml
<role>You are an accessibility-focused component engineer in ui/dzup-ui. Follow <repo_conventions>. Blocked-by: TASK-N5-01 (policy statement must exist first).</role>

<task>For each of the six form controls declaring un-honoured ARIA props: either implement the prop honestly (preferred where the underlying Reka primitive supports it) or remove the prop as a policy-conform breaking change with a changeset at the correct level and a codemod/compat note; fix DzOrderList.dragHandleLabel to actually render its label. Drive the FORM-OSS readiness gate's 6 "gap" cells to 0.</task>

<motivation>A declared aria-* prop that silently does nothing is worse than its absence: consumers believe they have satisfied their own a11y obligations. The FORM-OSS gate has carried these six as measured gaps since the audit; the Pro form renderer inherits whichever lie remains.</motivation>

<discovery>
  1. Read the form-readiness gate output to identify the exact six control/prop pairs and what "cannot honour" means for each (not forwarded? forwarded to an element that ignores it? conflicting with Reka's own management?).
  2. For each, check whether the current Reka primitive version CAN honour it — implement-vs-remove is decided per prop from evidence, not as a blanket.
  3. Read the codemods package's deprecation utilities for the removal mechanism precedent.
</discovery>

<requirements>
  <per_prop>Implementation must be verifiable (spec asserting the attribute lands on the right element with the right value); removal must ship: type removal, runtime dev-warning via the deprecation utility, codemod rename/strip entry, changeset at breaking level per policy.</per_prop>
  <gate>Re-run the form-readiness gate; the six gap cells become pass (implemented) or n/a-with-record (removed). Do not edit the gate to make cells disappear.</gate>
</requirements>

<steps>
  1. Discovery table: control · prop · why un-honoured · Reka support · decision.
  2. Implement/remove per decision; fix dragHandleLabel with a rendering spec.
  3. Changesets + codemod entries for removals; re-run the gate.
  4. Validation ladder; hand off with the before/after gate reading.
</steps>

<validation>
  yarn validate:form-readiness   # 6 gap → 0
  yarn test <touched controls + codemods>
  yarn typecheck && yarn lint && yarn validate:all
</validation>

<success_criteria>Zero un-honoured ARIA declarations remain; every removal has type+warning+codemod+changeset; dragHandleLabel renders and is spec-covered; gate cells resolved without gate edits.</success_criteria>

<stop_conditions>Stop when honouring a prop requires upstream Reka changes (file the upstream need, remove locally per policy or mark [!owner]); when TASK-N5-01's policy is not yet merged — this task may not define breaking-change policy ad hoc.</stop_conditions>
```

---

### [x] TASK-N5-03 — Toolchain currency: Vue 3.6-RC CI lane, Nuxt 4 retarget, Vapor statement, migration schedule 🟠

> **`[x]` done 2026-09-03 · 6 `[!owner]` ·** [`N5-03-toolchain-currency-handoff.md`](./reports/N5-03-toolchain-currency-handoff.md)
> · [`N5-03-toolchain-migration-memo.md`](./reports/N5-03-toolchain-migration-memo.md)
>
> Ran with an added **Item 0** (N5-01 D6): `componentCommit` is git provenance inside a
> byte comparison — **stale at birth**. Fixed via `stripComponentCommits()`, four probes,
> **link 15 green**; **link 16 stays red on genuine content staleness** (12 cells) and is
> filed as **D1** rather than regenerated — *the committed artifact overstates its
> evidence*. 3.6-RC lane **exists and ran**: 9,181 pass / 2 fail, **0 library defects, 0
> RC behaviour changes**. `@nuxt/kit` 3.14.0 → 4.5.2, `module.ts` unchanged, fixtures pass
> on **both** majors so the Nuxt 3 floor need not drop. Vapor statement is **generated** —
> delete the spec and the README says UNBACKED. **Untasked finding:**
> `@dzup-ui/contracts` **could not be `import()`ed by Node**, beneath 37 green links and
> 9,187 tests. Terminated mid-run by an HTTP 529 and **resumed, not restarted**.

_Gap: 01 §A6 / 04 §6. Vue 3.6-rc (alien-signals + Vapor interop) is exactly
the class of change that breaks libraries — a lane is cheap now. Nuxt 3 is EOL
(2026-07-31) so the `@dzup-ui/nuxt` `>=3.0.0` floor debate is moot: target
Nuxt 4 via `@nuxt/kit` v4 `[!owner]` for the floor itself. Vitest 4
browser-mode and tsdown/Vite 8 are scheduled hygiene, not urgent._

```xml
<role>You are a tooling engineer in ui/dzup-ui. Follow <repo_conventions>. CI workflow files may be edited; nothing is dispatched.</role>

<task>(1) Add a Vue 3.6-RC test lane (workspace-level dependency override → full unit + contract suite; document as advisory-not-blocking until 3.6 stable). (2) Retarget @dzup-ui/nuxt to @nuxt/kit v4 and run the tarball fixtures against a Nuxt 4 consumer; the declared compatibility floor change is prepared as a changeset + [!owner] note. (3) Publish the Vapor-interop compatibility statement (vDOM library, verified under vaporInteropPlugin — actually verify it in the 3.6 lane, don't just claim it). (4) Write the migration schedule memo for Vitest 4 browser mode and tsdown/Vite 8 (scope, risk, trigger conditions) — scheduled, not executed.</task>

<discovery>
  1. Check how the repo pins Vue and whether a one-lane override is expressible without touching the default resolution (yarn resolutions in a CI-only step, or an overrides file the lane applies).
  2. Read packages/nuxt/src/module.ts + tarball fixtures for @nuxt/kit v3-isms (module meta compatibility field, nuxt hooks changed in v4).
  3. Run the existing suite once under 3.6-RC locally to size the breakage before wiring CI.
</discovery>

<steps>
  1. Local 3.6-RC run; triage failures (library defect vs RC behavior change vs test-env issue); fix only library defects.
  2. Wire the CI lane (advisory); include the vaporInteropPlugin smoke in it.
  3. Nuxt 4 retarget + fixture run; changeset prepared; floor decision marked [!owner].
  4. Author the Vapor statement (docs site source or README-generated section); write the migration memo; validation ladder.
</steps>

<validation>
  yarn test              # default lane unaffected
  <the 3.6-RC lane command> # runs, result recorded honestly
  yarn test packages/nuxt && <tarball fixture command>
  yarn typecheck && yarn lint
</validation>

<success_criteria>3.6-RC lane exists and its current pass/fail state is recorded truthfully; Nuxt module builds and passes fixtures against Nuxt 4; Vapor statement backed by an actual interop run; migration memo filed; default toolchain untouched.</success_criteria>

<stop_conditions>Stop when 3.6-RC breakage indicates an upstream Vue bug (report upstream-shaped, don't work around in library code); when Nuxt 4 retarget forces dropping the Nuxt 3 floor NOW — that ships only with the [!owner] decision.</stop_conditions>
```

---

### [x] TASK-N5-04 — Peer & runtime hygiene: `reka-ui`, `lucide-vue-next`, Node 20, locale packs `[!owner]` 🟢

> **`[x]` done 2026-09-03 · 4 `[!owner]` · 0 dependency changes ·** [`N5-04-peer-hygiene-handoff.md`](./reports/N5-04-peer-hygiene-handoff.md)
> · [`peer-hygiene-2026-09.md`](./reports/peer-hygiene-2026-09.md)
>
> Both headline claims measured and wrong in the detail. **`reka-ui`:** install true,
> ship false — a Button-only bundle contains **zero** `reka` occurrences and the barrel
> reaches it through **exactly one edge, `DzSpeedDial → DzTooltip`**. **`lucide`:** 22
> modules / 18 glyphs / +1,206 B gzip for all 433 exports — and `lucide-vue-next@0.477.0`
> is **deprecated upstream** with **two versions installed simultaneously**, invisible to
> every gate. **The Node-floor premise this program handed it was false:**
> `getTextInfo()` first exists in **Node 24.0.0**, so the floor is **decoupled** from
> ADR-20 §4's RTL list (which has two errors of its own). **D4:** the i18n catalog is
> **unreachable from the published package by every path**. `packages/core/package.json`
> byte-identical to HEAD.

_Gap: 02 §4 packaging debt — `reka-ui ^2.0.0` is a non-optional peer
(Button-only apps must install it); `lucide-vue-next ^0.477.0` is a hard
dependency (icon lock-in, no swap contract); Node 20 (EOL April 2026) is
retained in the floor; one locale (`en`) ships with no contribution path.
Each ends in an owner decision; this task prepares the evidence and the
smallest reversible implementation per decision._

```xml
<role>You are a packaging engineer in ui/dzup-ui. Follow <repo_conventions>. Evidence-first: each of the four items gets measured facts, options, and a prepared (uncommitted-to) implementation path.</role>

<task>Produce the peer-hygiene decision packet: (1) measure which components actually import reka-ui and what an optional-peer + registration strategy would look like (cost to consumers, tree-shake effect measured with the existing bundle gates); (2) design the icon swap contract (icon-slot/provider indirection over lucide) with a sizing of the change; (3) the Node 20 drop analysis (what the floor buys, what EOL costs, what validate:engines/preflight changes); (4) the locale-pack architecture proposal (pack format over the existing i18n catalog, contribution path, pseudo-locale as the template). Implement only what is decision-independent and reversible; everything else lands as [!owner] options.</task>

<requirements>
  <measure>Claims like "Button-only apps must install reka-ui" get verified with an actual minimal-consumer fixture (reuse the tarball-fixture machinery). Bundle effects measured against the perf/bundle baselines, not estimated.</measure>
  <no_breaking>No peer/dependency change ships in this task — package.json changes are prepared as a reviewed diff in the report, applied only after the owner decision.</no_breaking>
</requirements>

<steps>
  1. Build the minimal-consumer fixture measurements for (1) and (2).
  2. Write the four-part packet into docs/program-2026-09/reports/peer-hygiene-2026-09.md with a recommendation each.
  3. Implement the reversible parts only (e.g. the locale-pack loader seam if it is additive; the icon indirection type if additive).
  4. Validation ladder; mark the four decisions [!owner] in the handoff.
</steps>

<success_criteria>Four decisions each have measured evidence + options + recommendation + prepared diff; anything implemented is additive and reversible; bundle baselines untouched or improved; no dependency graph change shipped.</success_criteria>

<stop_conditions>Stop when a "reversible" implementation turns out to touch public API; when measurement requires publishing packages.</stop_conditions>
```

---

### [x] TASK-N5-05 — ADR-19 / ADR-20 acceptance packets `[!owner]` 🟠

> **`[x]` done 2026-09-03 · 15 `[!owner]` · 0 files modified, both ADRs still `Proposed` ·**
> [`N5-05-adr-19-acceptance-packet.md`](./reports/N5-05-adr-19-acceptance-packet.md)
> · [`N5-05-adr-20-acceptance-packet.md`](./reports/N5-05-adr-20-acceptance-packet.md)
> · [`N5-05-adr-acceptance-handoff.md`](./reports/N5-05-adr-acceptance-handoff.md)
>
> **This task file's own figures were stale by an order of magnitude:** `ui`-prop pilots
> **5 → 27**, anatomy files **9 → 32**; only "ten context composables" survived.
> **The ADR-debt ceiling is not a lever** — `validate-adr-references` is **status-blind**,
> neither ADR is in `adr-registry.json`, and *nothing in the repository gates ADR status*,
> so acceptance moves the ceiling by **zero**. Divergences: **ADR-19 13** (8 amend / 4 fix)
> · **ADR-20 9** (8 / 1, **no clause the code contradicts**). Blockers: ADR-19 §4's
> `DataState` widening **was never performed**, so its own argument still describes the
> code; ADR-20 §7's motion policy has **zero consumers in 144 components**, so accepting
> it unamended would record an accessibility capability the library does not have. Only
> 3 of 6 cascade layers ship.

_Gap: N0-03 (OSS half). ADR-19 (styling contract) and ADR-20 (provider) are
both **Proposed** while shipped code builds on them — 5 `ui`-prop pilots, 9
anatomy files, `DzProvider` + ten context composables. Acceptance is an owner
decision; an acceptance packet makes it decidable. (ADR-16 is Pro-owned — see
the Pro program's custody tasks.)_

```xml
<role>You are a design-system architect in ui/dzup-ui preparing decision documents. Read-mostly; edits limited to the ADR files' consequence sections and the debt ledger.</role>

<task>For ADR-19 and ADR-20 each, produce an acceptance packet: what the ADR decided, what shipped against it (with file evidence), where implementation diverges from the ADR text (each divergence: amend-ADR vs fix-code recommendation), open questions folded in from this program (ADR-19: the data-scope evaluation from TASK-N2-S1, the DataState union widening that DzButton already violates, the hyphenated layer names kept for compat; ADR-20: portal chain evidence, SSR/hydration spec results), and the consequence-section updates acceptance would require. File both packets; mark Accepted/Rejected as [!owner].</task>

<requirements>
  <divergence_honesty>Every place the code does something the Proposed text doesn't say (or contradicts) is listed — acceptance of an ADR that silently mismatches its implementation is worse than Proposed status.</divergence_honesty>
  <ratchet>Note in each packet that acceptance lowers the ADR-debt ceiling (currently 14 undocumented ADRs cited in code) only when the decision is recorded in the ADR file itself.</ratchet>
</requirements>

<success_criteria>Both packets are complete enough that the owner's decision is a read-and-sign, not a research task; every divergence has a recommendation; no ADR status flipped by the agent.</success_criteria>

<stop_conditions>The agent never sets an ADR to Accepted/Rejected. Stop at packet delivery.</stop_conditions>
```
