# Release-exit verification — independent adversarial pass, 2026-09-22

**Scope:** the six tasks that closed `docs/program-2026-09-04/release-exit-tasks.md`
— TASK-R1-O3, R1-O4, R1-O5, R1-O6, R0-O1, R0-O2 — executed 2026-09-21/22 by six
implementation agents.

**Verifier:** a separate session that did none of that work. Nothing was fixed.
Every seed planted for a gate proof was restored byte-for-byte and re-hashed.

**Tree at start and at end:** `527dbd1` (`git rev-parse HEAD` →
`527dbd150036b5f07bd69e672825ff14ec3a592d`) + **302 uncommitted paths**.
`diff` of `git status --porcelain` taken before and after this pass:
**byte-identical**. The only path this pass adds to the tree is this document.

| Restored after seeding | sha256 before | sha256 after |
|---|---|---|
| `yarn.lock` | `6332fae9…87adb` | `6332fae9…87adb` |
| `docs/adr/ADR-19-public-styling-contract.md` | `c4a7b828…d7182` | `c4a7b828…d7182` |
| `packages/tooling/scripts/adr-registry.json` | `fa1db369…c87ae` | `fa1db369…c87ae` |
| `packages/tooling/src/validators/docs-size-ceilings.json` | `5e188151…c6e84` | `5e188151…c6e84` |

**Tally: 24 CONFIRMED · 6 REFUTED · 5 UNVERIFIABLE.**

---

## A. Gates that claim to fire

### A1. The status-aware ADR gate — **CONFIRMED, both directions, tree restored**

Seed 1: `docs/adr/ADR-19-public-styling-contract.md` line 3 `Proposed` → `Accepted`,
ceiling left at 3.

```
yarn validate:adr-references > V-adr-seed1.log 2>&1   → exit 1
✗ [proposed-ratchet] Only 2 Proposed ADR(s) are cited from code (ADR-18, ADR-20)
  but packages/tooling/scripts/adr-registry.json still declares
  maxProposedCitedFromCode: 3. Lower it to 2 in the same change…
```

Seed 2: ADR-19 restored, `"maxProposedCitedFromCode": 3` → `2`.

```
yarn validate:adr-references > V-adr-seed2.log 2>&1   → exit 1
✗ [proposed-ceiling] 3 Proposed ADR(s) are cited from code (ADR-18, ADR-19, ADR-20)
  but … declares maxProposedCitedFromCode: 2. …
```

Both reverted:

```
yarn validate:adr-references > V-adr-restored.log 2>&1 → exit 0
✓ adr-references: 17 ADR(s) cited · 3 documented · 14 registry-only (ceiling 14)
  status: 0/3 Accepted · 3 Proposed cited from code (ceiling 3) — ADR-18, ADR-19, ADR-20
git status --porcelain docs/adr/ → the same 3 ` M` rows as before the seed
```

R0-O2's §3.3 table reproduces exactly. The gate reads the document's own
`Status:` line (there is no mirror in the registry to fake), and acceptance
genuinely moves a number. `packages/tooling/scripts/validate-adr-references.spec.ts`
carries **44** `it(` blocks (R0-O2 claimed 44, up from 25) and passed in the full
suite run. **CONFIRMED.**

### A2. `validate:icon-duplicates` — **CONFIRMED on a real seeded defect, and it is not hardcoded red**

Self-test:

```
node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/peer-icon-duplicates.ts --self-test
→ exit 0 — "all 6 seeded cases behaved: 5 defects caught by their own clause, 1 clean control passed."
```

Live, un-seeded:

```
node … peer-icon-duplicates.ts → exit 1
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
```

The adversarial half — does the red follow the measurement, or is it a constant?
`yarn.lock`'s `lucide-vue-next@npm:^0.475.0` stanza was seeded to resolve
`0.477.0`:

```
node … peer-icon-duplicates.ts > V-icon-seeded-green.log 2>&1 → exit 0
✓ icon library: one name, one version.
```

Restored; `sha256 yarn.lock` back to `6332fae9…87adb`, `git status --porcelain yarn.lock`
empty. The gate is a live measurement of the lockfile. **CONFIRMED.**

**Finding S7 (medium).** In the seeded-green run the gate printed
`! [lock-vs-disk] yarn.lock resolves [0.477.0] but node_modules holds [0.475.0, 0.477.0]`
and **still exited 0**. The module header sells this as "a second, independent
route to the same fact"; it is a warning that cannot fail the build, so a
duplication present on disk but hidden by the lockfile passes the gate.

### A3. `validate:registry` — **CONFIRMED with a caveat**

```
node … packages/tooling/src/validators/registry.ts --self-test → exit 0
✓ all 8 seeded defects were caught by their own clause.
  [index] [resolves] [orphan] [item] [files] [pro-source] [theme] [dependency]
```

The header documents **nine** clauses; the ninth, `docs`, is `report`-level.
"9 clauses, 8/8 seeded" is therefore accurate, but **the ninth clause has no
seeded proof and cannot fail by construction** (S9, low).

### A4. `validate:docs-size` — **CONFIRMED it fires; REFUTED as coverage inside `validate:all`**

Seeded the real ceiling `36000000` → `30000000`:

```
yarn validate:docs-size > V-docssize-seed.log 2>&1 → exit 1
✗ [over] apps/docs/.vitepress/dist is 33.12 MB (34,731,159 B), over the 28.61 MB ceiling by 4.51 MB
```

Restored; hash back to `5e188151…c6e84`.

**Finding S6 (medium).** Both budgeted artifacts are gitignored
(`apps/docs/.gitignore:7` → `.vitepress/dist/`, `apps/storybook/.gitignore:2` →
`storybook-static/`), the validator **SKIPs and exits 0** when an artifact is
absent, and **nothing in the 50-link `validate:all` chain builds either of them**.
On a clean checkout — i.e. in CI — link 38 reports green having measured
nothing. The only enforcing call is `apps/docs`'s own
`build: … validate:docs-size --require-dist`. This is documented design, but the
link's presence in `validate:all` overstates what that chain covers.

### A5. `validate:tracked-build-output`, `validate:published-imports` — **UNVERIFIABLE (not independently seeded)**

`tracked-build-output` reads `git ls-files`; seeding it means staging a file into
the git index, and `published-imports` seeding means rebuilding tarballs. Neither
was attempted under the "preserve the tree" constraint. Both ship pinned seeded
cases as unit specs (**15** and **15** `it(` blocks) and **both spec files passed**
in the full `yarn test` run below. Both validators ran green in `validate:all`
(links 4 and 29).

### A6. No seed was left behind by the six implementation agents — **CONFIRMED**

`packages/tooling/api-surface/` contains only `527dbd1-INADMISSIBLE.json` and
`README.md`; R1-O3's `seedtest-INADMISSIBLE.json` is gone. `git status --porcelain`
matches its pre-pass snapshot at **302 paths** (45 `??`, 15 `D`, 242 `M`), and
`.changeset/`, `docs/adr/`, `yarn.lock` and the two ratchet JSONs are all in their
intended states.

---

## B. Aggregate truth

### B1. The chain is **50 links** — **CONFIRMED**

`node -e` split of `package.json → scripts["validate:all"]` on `&&` → **50**.
Link 48 is `validate:peers` (itself `validate-peers.ts && yarn validate:icon-duplicates`),
link 49 `validate:licenses`, link 50 `validate:tree-shake`.

### B2. `yarn validate:all` fails, and only at link 48 — **CONFIRMED**

```
yarn validate:all > va.log 2>&1 ; echo "exit $?"   → exit 1
```

424 lines. `grep -n "✗\|FAIL\|✖\|Error:"` over the whole log returns exactly **one**
hit — line 420, `✗ [single-version]`, inside `validate:icon-duplicates`. Links 1–47
all printed their success lines (`tracked-build-output`, `published-imports PASSED`,
`component-meta: fresh`, `llms: both documents fresh`, `docs pages fresh`,
`registry: every listed item resolves`, `docs-size: … inside its ceiling`,
`adr-references`, `readme-facts`, `release-policy`, `peers … Results: 7 compatible,
0 warnings, 0 incompatible`). `validate:peers` is red **by design**, as R1-O6 states.

### B3. Links 49 and 50, never previously measured — **CONFIRMED PASSING**

```
yarn validate:licenses  > V-licenses.log  2>&1 → exit 0   ("9 allowed, 0 blocked, 0 unknown")
yarn validate:tree-shake > V-treeshake.log 2>&1 → exit 0   ("All checks passed!" — 4 entry points)
```

So with the icon gate accepted as red-by-design, the chain is green end to end.
(Side note: `validate:licenses` lists `lucide-vue-next ISC v0.475.0` — a single
version — because it walks `node_modules` resolution, not the lockfile. It cannot
see the duplication the icon gate exists to catch.)

### B4. "`yarn test` really is green at ~10,478 passed" — **REFUTED**

```
yarn test > t.log 2>&1 ; echo "exit $?"   → exit 1
 Test Files  552 passed (552)
      Tests  10497 passed | 3 skipped | 1 todo (10501)
     Errors  52 errors
   Duration  297.10s
```

- **The count is fine.** R1-O6 measured 10,478; R0-O2 then added 19 tests to
  `validate-adr-references.spec.ts` (25 → 44). 10,478 + 19 = **10,497**. Consistent.
- **The exit code is not.** `yarn test` exits **1**. `grep -ac "Uncaught Exception"`
  → 52; `grep -a 'This error originated in'` → **52 of 52 from
  `apps/landing/src/pages/AnimationsPage.v2.spec.ts`** —
  `ReferenceError: requestAnimationFrame is not defined` raised from
  `@formkit/auto-animate` after teardown, preceded by 20 ×
  `Error: Async component timed out after 15000ms` and one `Error: chunk load failed`.
- In isolation the file is clean:
  `node node_modules/vitest/vitest.mjs run apps/landing/src/pages/AnimationsPage.v2.spec.ts`
  → **exit 0**, 1 file / 15 tests passed. It is load-dependent.

This is precisely R1-O3 §7 **F4 / D155** — *"`yarn test` can exit 1 with zero
failed tests, and did"* — recurring. **R1-O6 §5 reports `yarn test` → `0`,
552 files, 10,478 passed, 0 failed with no mention of the flake; R0-O1 §2
propagates "(10,478 passed)"; R0-O2 §4 defers to "the parent reports 10,478
passing".** The green is not reproducible on demand, and three documents rest on
it. See finding **S1**.

---

## C. Claims load-bearing for owner decisions

### C1. R0-O1 "**36 pending changesets**" — **REFUTED (stale by one)**

```
ls .changeset/ | grep -v '^README.md$' | grep -v '^config.json$' | wc -l   → 37
git ls-tree -r --name-only HEAD .changeset/ | grep -v 'README\|config'      → 36
git status --porcelain .changeset/ → ?? .changeset/aria-invalid-is-a-validation-prop-and-only-validation-props-carry-it.md
yarn validate:release-policy (inside validate:all, va.log:379) → "37 pending changeset(s), 0 major, 0 mixed"
```

36 was true at `527dbd1`+R0-O1's tree; **R0-O2 added the 37th 45 minutes later**
and its own §4 table records "37 pending changesets". The register's §1.2 and
§7.5 (*"The changeset count is quoted at 16, 20 and 37; it is **36**"*) are now
wrong, and §7.5 specifically brands **37** — the current truth — as an error.
See **S4**.

### C2. R0-O1 "**217 open decisions**" / "298 raised" — **UNVERIFIABLE, with two internal inconsistencies**

Recounting 298 decisions across 21 + 28 reports is not feasible in this pass.
What is checkable:

- `grep -c '^| '` → **348** table rows. R0-O1's claim of 348 rows: **CONFIRMED**.
- The §0 totals table sums correctly: 51 + 32 + 85 + 49 = **217**; §1.1's
  derivation 158 + 176 = 334 raised, 113 + 140 = 253 open, − 36 superseded = 298
  raised / **217** open is internally consistent.
- **Inconsistency 1.** §1.1's own heading reads *"the real figure is **298 raised,
  253 open**"* — 253 is the pre-de-duplication figure, and it contradicts the
  217 the rest of the document and the handoff use.
- **Inconsistency 2 (finding S3).** See D2 below — 14 of the 39 new decisions
  are absent from the register.
- A mechanical parse of the `State` column reproduces the §2.4/§3.4/§4.4/§5.5
  "further decisions" tables (27 + 4 + 58 + 27 = 116 open rows) but cannot
  reconcile the per-section totals from the other subsections, whose tables use
  different shapes. Not asserted as a refutation; flagged as not reproducible
  from the document alone.

### C3. R0-O1 "the under-declared changeset (`the-six-cascade-layers-…`)" — **conclusion CONFIRMED, stated reason REFUTED**

The changeset declares `@dzup-ui/{contracts,core,tokens}: patch`. D180's argument
is *"if declaring the three cascade layers changes precedence for existing
consumer overrides, a `patch` pushes a break into every consumer's next
`yarn install`."*

That mechanism does **not** hold, by the changeset's own analysis and by the CSS:
`packages/core/src/styles/base.css:51` is
`@layer dz-reset, dz-tokens, dz-base, dz-components, dz-utilities, dz-overrides;`
— `dz-overrides` is still **last**, so a consumer whose sheet loads after the
dzup sheets still wins exactly as before; and a consumer whose sheet loads first
already lost to `dz-components` before this change (the changeset says so
explicitly). Precedence for consumer overrides is unchanged in both load orders.

The **defensible** under-declaration ground is one R0-O1 does not name:
`packages/contracts/src/data-attributes.types.ts:65` types
`DataAttributes['data-state']` as `string`, widened from the closed `DataState`
union. The changeset itself states *"If you were assigning
`DataAttributes['data-state']` into a `DataState`-typed variable, that no longer
narrows on its own"* — consumer source that compiled stops compiling, which
`packages/contracts/VERSIONING.md` §1's 0.x mapping puts in the **minor**
position. Re-levelling is warranted; the owner should not act on D180's stated
reason. See **S5**.

### C4. R0-O2 `ariaInvalid` **98 → 32**, **66 lose, 0 gain** — **CONFIRMED**

Measured from `git show HEAD:packages/core/docs/component-meta.json` versus the
working tree, counting records whose own `props[]` declares `ariaInvalid`:

```
HEAD components 209 · tree components 209
HEAD ariaInvalid declarations: 98
tree ariaInvalid declarations: 32
lost: 66   gained: 0   (gained names: [])
```

The changeset's prose list was parsed and set-compared against the measured
`lost` set: **66 listed, 66 unique, 0 duplicates, `listed − lost` = ∅,
`lost − listed` = ∅**. The changeset names exactly the 66 components that lose
the prop, no more and no fewer. `grep -n ariaInvalid packages/contracts/src/props.types.ts`
confirms it survives only on `BaseValidationProps` (line 80), with the
`BaseAccessibilityProps` site replaced by a comment (line 97). **CONFIRMED.**

### C5. R1-O6 "**40 of 89** registry items inline `lucide-vue-next`" — **CONFIRMED**

```
ls apps/landing/public/r/*.json | wc -l → 89
of those: dependencies name lucide-vue-next → 40 · files[] source inlines it → 40 · both → 40
```

The live gate output corroborates independently:
`apps/landing/public/r/*.json  lucide-vue-next in 40 item(s)`.

### C6. R1-O6 "**+1,068 gzip** / +2,432 raw" — **CONFIRMED as arithmetic, UNVERIFIABLE as a re-measurement**

`@lucide/vue` is not installed (`node_modules/@lucide` does not exist) and no
network install was attempted. The preserved probe artifacts
(`scratchpad/lucide-probe/bundle-delta.json`, `bundle-delta.log`,
`bundle-delta.mjs`, the 18-glyph list, both bundled outputs) record
`old 3337 raw / 1376 gzip` vs `new 5769 raw / 2444 gzip` → **+2,432 / +1,068**,
which is correct arithmetic over a real esbuild run with `vue` external and
minify on. The method (bundled-minus-external, per-glyph scaling) is sound and
documented. Not re-bundled here.

### C7. R1-O5 "**12 → 0** bare-HTML descriptions" — **CONFIRMED**

Re-implemented `bareHtmlInDescription()` (strip fenced and inline code, then
`/<\/?[A-Z][\w-]*(?:\s[^<>]*)?>/i`) over every `description` field in
`component-meta.json`, at HEAD and in the tree:

```
HEAD: 12  — DzBreadcrumbItem.href <span> · DzList.ordered <ol> · DzMenuItem.href <a>
           · DzSidebarItem.href <a> · DzSidebarItem.to <RouterLink>
           · DzStepperItem.clickable <code> · DzTableCell.header <th>
           · DzTableBody <tbody> · DzTableCell <td> · DzTableFooter <tfoot>
           · DzTableHeader <thead> · DzTableRow <tr>
tree: 0
```

Exactly the twelve `component-meta-ceilings.json`'s `descriptionsWithBareHtml`
comment enumerates. **CONFIRMED.**

### C8. R1-O4 "dispatchable workflows 3 of 6 → 6 of 8" — **CONFIRMED**

`grep -c workflow_dispatch` per file: `ci.yml` 3, `landing-e2e-snapshots.yml` 3,
`min-peer.yml` 1, `publish-prerelease.yml` 1, `validate-min-runtime.yml` 2,
`vue-next.yml` 1; `chromatic.yml` 0, `release.yml` 0. **6 of 8.**
`ci.yml:122` is `uses: ./.github/workflows/validate-min-runtime.yml`, and that
file declares `workflow_call` at line 32 — the reusable extraction is real.

---

## D. Cross-task consistency

### D1. `D154`–`D192`: no duplicates, no skips — **CONFIRMED**

Parsed `### D<n>` headings and `| **D<n>** |` table rows from the six handoffs:

| Handoff | Ids raised |
|---|---|
| TASK-R1-O3 | 154–159 (6) |
| TASK-R1-O4 | 160–164 (5) |
| TASK-R1-O5 | 165–173 (9) |
| TASK-R1-O6 | 174–178 (5) |
| TASK-R0-O1 | 179–186 (8) |
| TASK-R0-O2 | 187–192 (6) |

39 distinct ids, range 154–192, **duplicates across handoffs: none**,
**missing in 154..192: none**, none below 154 re-raised. R1-O5's §8 header
*"continuing from **D164**"* initially looks like an off-by-one against R1-O4's
visible table, but `TASK-R1-O4-handoff.md:437` carries `### D164 — should min-peer
and nuxt-majors block?`, so the sequence joins cleanly. **CONFIRMED.**

### D2. The register omits 14 of those 39 — **REFUTED (finding S3, high)**

```
grep -c "D179\|D180\|…\|D192" docs/program-2026-09-04/reports/owner-decision-register-2026-09.md → 0
register missing D-ids in 154..192: [179,180,181,182,183,184,185,186,187,188,189,190,191,192]
register max D-id present: 178
```

The register's own front matter says *"**Status of this document:** the register
is complete"* and the handoff row advertises *"298 decisions consolidated, 217
open"*. Its §0 totals table scopes the R1 work as `D154`–`D178` and stops there —
so **R0-O1's own eight decisions (D179–D186) are absent from the register R0-O1
wrote**, and **R0-O2's six (D187–D192) were never appended**. D183 proposes
option (a) *"register is authoritative; ledgers link, never restate; new
decisions are appended here at the packet that raises them"*; the very next
packet did not. An owner treating the register as the system of record silently
loses 14 of the 39 decisions this programme raised.

### D3. The Node floor (N5-04 D3 vs D160 vs D176) — **CONFIRMED consistent**

Register §7.3 tables three reports / two answers:
N5-04 D3 → `>=22.13.0`; D160 → keep `^20.19.0 || >=22.13.0` and fix the one
`globSync` import; D176 → `>=22.13.0` with D160's fix as interim, explicitly
differing and saying so. `docs/adr/ADR-18-runtime-floor-and-validator-runner.md`
§A1 (lines 121–123) reproduces the same three rows with the same answers, the
same report paths and the same arguments. A2 cites D160 for the measurable
falsity on 20.x; A3 carries the RTL-decoupling that both N5-04 D3 and D176 ask
for. D181's compounding fact — `getTextInfo()` needs Node 24, so ADR-20 §4 is
wrong whichever floor wins — is present in the register §7.3 and executed as
ADR-20 **A8.1**. No divergence found. `yarn validate:engines` (link 41) passes
against the *current* declared floor, which is D160's.

### D4. Do the new documents inherit the `D<n>` namespace ambiguity? — **Yes, partially (finding S11, low)**

Register §7.1 names `D1`–`D11` as the worst collision band (defect register vs
09-04 global sequence vs per-report local sequences; 105 definition sites across
11 ids) and D179 recommends *"(a) prefix … (b) qualify every cross-report
citation."* `TASK-R0-O2-handoff.md:86` cites **`D6`** unqualified — inside that
band. It does resolve correctly (register line 169: `D6` = TASK-R3-O2's
`DZ_PROVIDER_DEFAULTS` sanitizer key), and `D10`/`D15` elsewhere in the same
handoff *are* qualified by source report. But D179 is still open, so writing
bare `D6` is defensible; it is recorded here only because it is the exact shape
D179 asks to stop, produced in the same hour D179 was raised.

---

## E. Regressions

### E1. The release-evidence bundle is materially stale — **REFUTED as "a point-in-time record with one deleted file" (finding S2, high)**

`docs/qa/release/2026-09-21-527dbd1/candidate-content-digest.json` records
3,581 files with sha256. Re-hashed against the current tree:

```
recorded: 3581   unchanged: 3375   changed: 205   missing: 1
digest recorded: e1e44b4da647601fd43912219bba0dfca49b4f8c0270bf543d3a90746958ee5c
```

Changed, by area: `apps/docs/components` **140** · `packages/core/src` **19** ·
`packages/tooling/{scripts,src}` **12** · `docs/adr` **3** · `packages/core/docs` **3** ·
`.github/workflows` **2** · `packages/contracts/src` **1** (`props.types.ts`) ·
plus `CLAUDE.md`, `package.json`, `eslint.config.js` and others.
Missing: `apps/docs/scripts/report-size.mjs`.

**D173 records only the one missing file** and recommends *"(b) leave — a
candidate digest is a point-in-time record of its commit … It is an output, not
a gate input — nothing reads it."* Two things make that framing unsafe:

1. **The bundle's own `ledger.md` §0 asserts** *"Content actually measured:
   `527dbd1` **plus 221 uncommitted paths**"* with that digest. The tree is now
   `527dbd1` + **302** paths and 205 of the digested files differ. The
   ledger's statement of what it measured is no longer true of anything that
   exists.
2. **`packages/contracts/src/props.types.ts` and 19 `packages/core/src/**` files
   are published-package sources.** R0-O2 removed `ariaInvalid` from
   `BaseAccessibilityProps` — a declared public-API removal — *after*
   `api-diff.json` and `hashes.json` were written. The bundle's api-diff
   therefore does not classify the one breaking change in the candidate, and its
   per-tarball sha256/sha512 describe artifacts a rebuild would no longer
   reproduce. `ledger.md` gate row 8 also records `yarn validate:all` → **0**;
   that chain now has 50 links and exits **1**.

Nothing in the tree was fixed. The bundle is honest about being inadmissible
(`admissible: false`), but any downstream reading of it as covering the current
candidate is wrong.

### E2. `validate:published-imports` now reports **two** stale packages, not one — **REFUTED as stated (finding S10, low)**

R1-O5 §6 records *"`validate:published-imports` prints `STALE @dzup-ui/core` …
mine, and deliberately left."* `va.log` lines 169–170:

```
STALE @dzup-ui/contracts: dist (2026-09-21T14:24:40.600Z) predates packages/contracts/src/props.types.ts (2026-09-22T08:11:38.987Z)
STALE @dzup-ui/core:      dist (2026-09-21T14:25:30.113Z) predates packages/core/src/components/inputs/DzInputGroup.types.ts (2026-09-22T08:11:07.245Z)
```

R0-O2's contracts edit added the second line and its handoff does not record it.
Both are reports, not failures — `validate:published-imports PASSED`, and the
link is green — but R0-O2's edits are **type-surface** edits, not R1-O5's
prose-only JSDoc, so "the next `yarn build` clears it" carries a different cost
now: rebuilding is what E1 says must happen anyway.

### E3. R1-O4's reusable-workflow move — **no surviving breakage found**

`ci.yml:122 uses: ./.github/workflows/validate-min-runtime.yml`;
`validate-min-runtime.yml:32 workflow_call`. The workflow-reading specs
(`packages/tooling/scripts/validate-engines.spec.ts`,
`packages/tooling/src/coverage-policy.spec.ts`, `packages/mcp/src/registry.spec.ts`)
all passed in the full run — 552 test files, 0 failed. The spec R1-O4 broke
(F-5, `validate-engines.spec.ts:84`) is fixed. **CONFIRMED.**

### E4. R0-O2's four regenerated artifacts — **CONFIRMED fresh, not hand-edited, `sourceCommit` == HEAD**

`packages/core/docs/component-meta.json:3` →
`"sourceCommit": "527dbd150036b5f07bd69e672825ff14ec3a592d"` = `git rev-parse HEAD`.
(`capability-matrix.json` and `quality-matrix.json` carry the same commit.)

Hand-editing is excluded by construction, not by inspection: all three freshness
gates re-render and byte-compare, and all three passed inside `validate:all`:

```
va.log:255  ✓ component-meta: fresh, complete for all 144 public components, and every debt number at its ceiling.
va.log:275  ✓ llms: both documents fresh against the metadata artifact …
va.log:276  ✓ docs pages fresh — 144 component pages + index + 6 evidence pages + nav + playground seeds
```

`validate:component-meta` *"re-extracts every component from source and fails on
any byte of disagreement (sourceCommit excluded)"*; `validate:llms` *"fails when
a committed file disagrees with a fresh render"*; `validate:docs-pages --check`
regenerates and compares. A hand-edit would have turned link 32, 34 or 35 red.

### E5. EXECUTION-STATUS dirty-path arithmetic does not join — **REFUTED (finding S8, low)**

Row 15 (TASK-R0-O1): *"278 paths at start and end"*. Row 16 (TASK-R0-O2):
*"285 paths at start, 302 at end"*. Nothing ran between them, and R0-O1 declares
itself read-only outside its own documents. Current measured: **302**
(`git status --porcelain | wc -l`), so R0-O2's *end* figure is right. One of the
two start/end counts is wrong by 7. Row 19 (R1-O3) 221, row 20/21 (R1-O4/O5) 231,
row 22 (R1-O6) 266→278 are self-consistent with 278 → so the suspect figure is
R0-O2's "285 at start".

---

## Findings, ranked

| # | Sev | Finding | Evidence |
|---|---|---|---|
| **S1** | **High** | **`yarn test` exits 1**, not 0. 552 files / 10,497 passed / 0 failed / **52 errors**, all 52 from `apps/landing/src/pages/AnimationsPage.v2.spec.ts`. R1-O6 §5 reports exit 0 with no mention; R0-O1 and R0-O2 rely on it; EXECUTION-STATUS row 22 is 🟢 on it. It is D155/R1-O3-F4 recurring, and it is load-dependent (the file alone: exit 0, 15 passed) | `t.exit` = `exit 1`; `V-anim.log` exit 0 |
| **S2** | **High** | Release-evidence bundle stale: **205 of 3,581** digested files changed, 1 missing, including `packages/contracts/src/props.types.ts` + 19 `packages/core/src` files. Its `api-diff` predates the `ariaInvalid` public-API removal; its `ledger.md` gate row 8 records `validate:all` → 0, now 1. D173 covers only the one deleted file and recommends leaving it | re-hash of `candidate-content-digest.json` |
| **S3** | **High** | The owner-decision register contains **none of D179–D192** while declaring itself complete over 298 decisions. R0-O1 omitted its own 8; R0-O2 appended none of its 6, an hour after D183 proposed exactly that rule | `grep -c 'D179…D192'` → 0 |
| **S4** | Medium | "36 pending changesets" is stale — it is **37**. §7.5 of the register brands **37** as one of three wrong quotes; 37 is now the truth | `ls .changeset` → 37; `validate:release-policy` → "37 pending changeset(s)" |
| **S5** | Medium | D180's *reason* for calling `the-six-cascade-layers-…` under-declared (cascade precedence changes for consumer overrides) does not hold; the real ground is the `DataAttributes['data-state']` union → `string` widening, which D180 never names. Conclusion survives, argument does not | `base.css:51`; `data-attributes.types.ts:65`; changeset prose |
| **S6** | Medium | `validate:docs-size` measures nothing on a clean checkout — both artifacts gitignored, validator SKIPs+exits 0, and `validate:all` builds neither. Link 38 will report green in CI having measured nothing | `git check-ignore -v`; `//validate:docs-size` in `package.json` |
| **S7** | Medium | The icon gate's `[lock-vs-disk]` cross-check is a **warning**: with the lockfile seeded green it printed the disk disagreement and still exited 0 | `V-icon-seeded-green.log`, exit 0 |
| **S8** | Low | EXECUTION-STATUS: R0-O1 "278 at end" vs R0-O2 "285 at start" with nothing in between | rows 15–16 |
| **S9** | Low | `validate:registry`'s 9th clause (`docs`) is report-only — no seeded proof, cannot fail | `registry.ts:36-60`; self-test output |
| **S10** | Low | `validate:published-imports` now prints **two** STALE lines (contracts + core); R0-O2 added the second and did not record it | `va.log:169-170` |
| **S11** | Low | R0-O2 cites `**D6**` unqualified, inside the `D1`–`D11` band §7.1 calls the worst collision surface | `TASK-R0-O2-handoff.md:86` |

## What could not be checked, and why

1. **"217 open / 298 raised"** — requires recounting the decisions sections of 21
   `program-2026-09` handoffs and 28 `program-2026-09-04` reports. Internal
   arithmetic is self-consistent; §1.1's heading ("253 open") contradicts the
   217 headline; S3 shows the register is not complete.
2. **"+1,068 gzip"** — `@lucide/vue` is not installed and no network install was
   made. The recorded measurement and its arithmetic check out from the preserved
   probe artifacts; it was not re-bundled.
3. **`validate:tracked-build-output` / `validate:published-imports` seeded
   proofs** — seeding requires staging into the git index or rebuilding tarballs,
   both excluded by the preserve-the-tree constraint. Their seeded cases are
   pinned as unit specs (15 + 15 `it(`) and passed in the full suite.
4. **Everything CI-side** — R1-O4's dispatch request, run ids, the min-peer and
   vue-next lanes. No dispatch was permitted, and the workflows have not been run.
5. **Whether `yarn test` is *usually* green** — one full run was made. The flake
   is load-dependent; a second full run was not budgeted. R1-O3 F4 records the
   same non-determinism from two rehearsals.

---

# Fixes applied 2026-09-22

**Who:** a separate fix pass, run after the verification above and holding the
same authority limits — no commit, push, CI dispatch, publish, deploy or DNS
change, and every one of the ~303 inherited uncommitted paths preserved.

**Tree:** started at `527dbd1` + **303** paths (the 302 the pass above measured,
plus this document). Ended at `527dbd1` + **304**. The single added path is
`apps/landing/src/pages/AnimationsPage.v2.spec.ts`, the only clean file this
pass had to modify; every other file it touched was already dirty. Nothing was
regenerated, no baseline replaced, no artifact rebuilt.

**Decisions raised:** **D193**, **D194** — continuing from `D192`, recorded in
[`owner-decision-register-2026-09.md`](./owner-decision-register-2026-09.md)
§5.7 and summarised in `EXECUTION-STATUS.md`.

| Finding | Outcome |
|---|---|
| **S1** `yarn test` exits 1 | **FIXED at the defect** |
| **S2** release bundle stale, asserts green | **RECORDED** — superseded in place, not regenerated (**D173**) |
| **S3** register omits `D179`–`D192` | **FIXED** — all 14 appended |
| **S4** "36 pending changesets" | **FIXED** — 37 confirmed two ways, register corrected |
| **S5** `D180`'s stated ground | **FIXED** — both halves verified, reason rewritten, conclusion kept |
| **S6** `validate:docs-size` measures nothing | **FIXED** — fails closed under CI, and a skip can no longer read as a pass |
| **S7** `[lock-vs-disk]` cannot fail | **RECORDED AS DECISION D193** + the module's own claim corrected |
| **S8** dirty-path arithmetic | **LEFT** — unresolvable after the fact; both rows now flag the discrepancy |
| **S9** `validate:registry` 9th clause | **RECORDED AS DECISION D194** + the bare green line removed |
| **S10** two `STALE` lines, not one | **FIXED** — recorded where R1-O5 stated the single |
| **S11** bare `D6` citation | **LEFT** — `D179` is open, so the citation is defensible; made visible, not changed |

## S1 — `yarn test` exits 1 — CONFIRMED FIXED

**Reproduced first, then diagnosed.** A full `yarn test` on the unmodified tree:

```
yarn test > test-baseline.log 2>&1 ; echo "exit $?"        → exit 1
 Test Files  552 passed (552)
      Tests  10497 passed | 3 skipped | 1 todo (10501)
     Errors  127 errors
```

**One correction to the verification's characterisation, and it moves where the
defect is.** All **127** unhandled errors are `ReferenceError:
requestAnimationFrame is not defined`; **none** is an async-component timeout.
The 40 `Error: Async component timed out after 15000ms` lines in the log are
`[Vue warn]` **stderr**, they originate in `BlocksIndexPage.atmosphere.spec.ts`
and its neighbours by way of `lazyComponent`'s `timeout: 15_000`, and they do not
touch the exit code. The exit code is driven entirely by the rAF errors.

**Root cause, from the stack rather than from a guess.** Every one of the 127
carries the same two frames:

```
ReferenceError: requestAnimationFrame is not defined
 ❯ lowPriority node_modules/@formkit/auto-animate/index.mjs:173:9
 ❯ Timeout._onTimeout node_modules/@formkit/auto-animate/index.mjs:161:45
 ❯ listOnTimeout node:internal/timers:605:17
This error was caught after test environment was torn down.
```

`index.mjs:161` is inside `poll()`:

```js
function poll(el) {                                                     // :159
  setTimeout(() => {
    intervals.set(el, setInterval(() => lowPriority(updatePos…), 2000))  // :161
  }, Math.round(2000 * Math.random()))
}
```

`AnimationsPage.vue:556` puts `v-auto-animate` on the bento, and `autoAnimate()`
runs `forEach(el, updatePos, poll, …)` — so `poll()` fires for the grid **and
every card**, on every one of the file's mounts. Two independent leaks follow,
and the library can close neither:

1. the `setInterval` id reaches the `intervals` map only when the **outer,
   untracked** `setTimeout` fires, so an interval created after the directive's
   `unmounted` hook has run is never recorded at all; and
2. `controller.destroy()` reaches the per-card ids through `forEach(el, …)`,
   which reads `parent.children` (`index.mjs:397`) — already empty once Vue has
   detached the grid.

`lowPriority()` (`:168`) prefers `requestIdleCallback`, which jsdom does not
have, so it lands on `requestAnimationFrame`. In a browser none of this matters:
nothing tears the page down under the interval. Under `yarn test` the file's
jsdom environment **is** torn down, the global disappears, and each surviving 2 s
interval raises an uncatchable error from a Node timer with no test to attach it
to. Run alone the file exits 0 because the process ends before anything is torn
down — which is precisely what made this look like a flake for three packets
(**D155** / R1-O3 **F4**, and the ratchet board's `656 unhandled errors` row from
R3-O4).

**So it is fixable, and it was fixed at the defect** — not skipped, not
`it.skip`ped, not papered over with a longer timeout.
`AnimationsPage.v2.spec.ts` now wraps `setTimeout`/`setInterval` for the duration
of the file, records **only** the ids whose call stack passes through
`@formkit/auto-animate`, and clears them in `afterEach` (after `cleanup()`, so
the library has already cancelled whatever it can reach) and again in `afterAll`,
where the native functions are restored so no other file inherits the wrapper.

A stack-string filter can stop matching silently, and that failure would look
exactly like the original bug, so the file also carries **a guard on the guard**:
one new test asserts the tracker still sees at least one AutoAnimate timer per
mount. If the dependency is upgraded and starts cancelling its own intervals,
that test fails and tells the next reader to delete the wrapper entirely.

**Proof — the same command, exit code read directly, never through a pipe:**

```
yarn test > test-after-fix.log 2>&1 ; echo "exit $?"       → exit 0
 Test Files  552 passed (552)
      Tests  10498 passed | 3 skipped | 1 todo (10502)
   Duration  291.90s
grep -c "requestAnimationFrame is not defined" test-after-fix.log   → 0
```

10,497 → **10,498** is the one added guard test. **0 errors, exit 0.**

The closing ladder below reads **10,504** rather than 10,498 for the same
command: the six `docs-size.spec.ts` tests from **S6** landed between the two
runs. Both runs exit 0 with zero errors.

## S3 — the register omits `D179`–`D192` — CONFIRMED FIXED

All fourteen appended to
[`owner-decision-register-2026-09.md`](./owner-decision-register-2026-09.md) in
its six-column shape (id · raised by · gates · options · recommendation ·
state), each citing its source handoff by path, **grouped by what they gate**
like every other row rather than dumped in an appendix:

| Section | Ids | Why there |
|---|---|---|
| **§2.5** Publication | `D180` `D182` `D185` `D186` `D190` `D192` | changeset levelling, `VERSIONING.md` §3, the A4-D1 option set, the MCP changelog and the two `ariaInvalid` consequences — each gates the first publish or a consumer surface |
| **§3.5** 1.0 | `D181` `D188` | ADR-20 §4's amendment and the order of the three acceptances — criteria **C1**/**C10** |
| **§5.6** Hygiene | `D179` `D183` `D184` `D187` `D189` `D191` | real, gating nothing on the critical path. Four of the six are about how decisions and numbers are *kept*, which is why losing them was the failure each describes |

Verified: `grep -c` for each of `D179`…`D192` is now ≥ 1 (it was **0** for all
fourteen); register rows **348 → 368**.

The document's own arithmetic was corrected with them, because appending rows and
leaving the totals at 217 would have replaced one false claim with another: §0
totals `51/32/85/49 = 217` → `57/34/85/57 = **233**` (with a fourth column
attributing the additions), §1.1 `298 raised / 217 open` → **314 / 233** and its
`D1`–`D178` row extended to `D1`–`D194`, and the front matter's *"the register is
complete"* qualified — it was false within an hour of being written, which is the
strongest available argument for **D183**. Every correction carries a dated
blockquote stating what the text used to say.

*(§1.1's heading also read "298 raised, **253 open**" — the pre-de-duplication
figure, contradicting the 217 in its own table. Corrected in the same pass, since
restating the totals without it would have left the heading disagreeing with the
table beneath it.)*

## S4 — "36 pending changesets" — CONFIRMED FIXED

Verified both ways:

```
ls .changeset/*.md | grep -v README | wc -l                     → 37
yarn validate:release-policy > relpol.log 2>&1 ; echo "exit $?"  → exit 0
  "… 37 pending changeset(s), 0 major, 0 mixed; changelog-format
   collisions at the ceiling of 1"
```

Register **§1.2** rewritten (heading `36` → `37`; the committed-tree 36 kept and
labelled the pre-R0-O2 snapshot, since `validate:release-policy` reads the
working tree, which is what `changeset version` will act on) and **§7.5**
rewritten — it had branded **37**, the current truth, as one of three wrong
quotes. `TASK-R1-O1-handoff.md` §7's 37 is now right on the merits while its
*derivation* (counting `.changeset/README.md`) stays wrong, and §7.5 says so
rather than silently promoting it. §7.5 downgraded 🟠 → 🟢.
`EXECUTION-STATUS.md` row 15 annotated; its ratchet row 95 already read **37**
and was left alone.

## S5 — `D180`'s stated ground — CONFIRMED FIXED (conclusion kept)

Both halves verified in the tree before anything was rewritten:

```
packages/core/src/styles/base.css:51
  @layer dz-reset, dz-tokens, dz-base, dz-components, dz-utilities, dz-overrides;
packages/contracts/src/data-attributes.types.ts:65
  'data-state'?: string
```

`dz-overrides` is **last**, so a consumer sheet loading after the dzup sheets
wins exactly as before, and one loading first already lost to `dz-components` —
precedence for consumer overrides is unchanged in both load orders, and
`.changeset/the-six-cascade-layers-…` says so itself (*"Repeating the statement
in both sheets does not fix it and nothing the library ships can"*). D180's
stated mechanism does not hold.

The changeset's own prose supplies the ground that does: *"If you were assigning
`DataAttributes['data-state']` into a `DataState`-typed variable, that no longer
narrows on its own."* Consumer source that compiled stops compiling.
`packages/contracts/VERSIONING.md` §1: **minor** = *"Something that used to work
no longer does"*, and the minor position is the only one `^0.2.0` protects.
**The re-levelling recommendation survives; its argument is replaced.** D180's
register row now carries the corrected reason, the refuted one, and an explicit
*"the owner should not act on the cascade argument"*. `EXECUTION-STATUS.md` row
15's copy of the claim is annotated in place.

## S6 — `validate:docs-size` measures nothing on a clean checkout — CONFIRMED FIXED

Two changes, in `packages/tooling/src/validators/docs-size.ts`:

1. **A skip can no longer read as a pass.** The unqualified `✓ docs-size: every
   budgeted artifact is inside its ceiling` is printed **only when every budget
   was actually measured**. Otherwise the run prints `⚠ docs-size: N of M
   budgeted artifact(s) measured … K SKIPPED, UNMEASURED and UNENFORCED:
   <paths>` plus *"This run proves NOTHING about the skipped artifact(s)"*. The
   per-budget report line gained *"so this run enforced NOTHING for it"*. Free,
   and it is most of the value.
2. **It fails closed where a skip is not honest.** A new exported, unit-tested
   `shouldRequireDist(argv, env)`: an absent artifact is an **error** when
   `--require-dist` is passed **or `CI` is set**; `--allow-missing-dist` opts a
   pre-build CI job back out. On the machine gating a merge, "the artifact was
   never built" is a finding, not an excuse.

**Fail-closed-in-CI was chosen over adding a build step**, and the reasoning is
in the module header: a build step inside `validate:all` puts a 40 s VitePress
build and a multi-minute Storybook build in front of *every* run and makes the
chain unrunnable on a freshly-edited tree — the trade **D149** already settles
for `validate:published-imports --built`. It is also free today: no workflow
invokes `validate:docs-size` or `validate:all`, so **this introduces no new CI
red**; it closes the hole for the moment one does.

**Proven on a tree with the artifacts absent.** Both budgeted directories were
moved aside, four modes run, and both restored (verified present afterwards; they
are gitignored, so `git status` is unchanged either way):

```
both absent, no CI                        → exit 0  + "⚠ … 0 of 2 … 2 SKIPPED, UNMEASURED and UNENFORCED"
both absent, CI=true                      → exit 1  ✗ [missing] ×2
both absent, CI=true --allow-missing-dist → exit 0
both absent, --require-dist (off CI)      → exit 1
docs present / storybook absent, no CI    → exit 0  + "⚠ … 1 of 2 … 1 SKIPPED …"
```

`docs-size.spec.ts` gained **6** tests pinning the decision table and the skip
message (14 → 20 `it(`), and the message now names the *right* build command per
budget (`yarn storybook:build` for `storybookStatic`, which previously told the
reader to run `yarn docs:build`). `package.json`'s `//validate:docs-size` prose
updated to match.

## S7 — `[lock-vs-disk]` cannot fail — RECORDED AS DECISION `D193`

**Judged, not reflexively promoted.** Making it an error is *not* honest today:

- `node_modules` is not a governed artifact. On a fresh checkout it does not
  exist, `onDisk` is `null`, and the clause is **unreachable** — an error there
  would be silent exactly where a gate matters most and red on a developer's
  half-installed tree.
- `test:min-peer` makes lock and disk disagree **on purpose**. The gate's own
  header says so.
- A narrower rule *is* defensible — fail when `node_modules` holds **more than
  one version** of the icon library, independent of the lockfile — but it would
  add a **second** error clause to the one gate TASK-R1-O6 deliberately ships
  red, changing what that red means without R1-O6's input. That is the owner's
  call, and it is **D193** option (c).

What was fixed is the **claim**, which was the dishonest part: the module header
called the cross-check *"a second, independent route to the same fact"*. It now
records the seeded proof, states that clause 1 (`single-version`, over the
lockfile) is the single enforcing route, and names the cost plainly — *a
duplication present on disk but hidden by the lockfile passes*. The runtime
message gained `REPORT ONLY — this line cannot fail the build (D193)`. **No exit
code changed**; `--self-test` still exits 0 (6/6 seeded cases).

## S9 — `validate:registry`'s 9th clause — RECORDED AS DECISION `D194`

The clause is not merely unproven, it is **firing**:

```
node … registry.ts --all → exit 0
  · [docs] animations/registry.json: 59 block(s) ship without a markdown mirror
  · [docs] templates/registry.json:  44 block(s) ship without a markdown mirror
✓ registry: every listed item resolves, every file is present, …
```

103 of 191 items, under a bare green line. Promoting the clause to `error` lands
103 reds immediately, and whether every animation and template block ever gets a
mirror is the `llms.txt` surface's question (**N2-A3 D2**), not this gate's. The
honest promotion is a **ratchet** — record 103, fail on a rise, the shape
`anatomy-parts` uses for `maxUnreviewedPartNames` and the one **D143** asks for
on `stale` cells — but that creates a governed ceiling file and a standing
commitment, so it is **D194**(c), recommended and left to the owner.

Fixed in the tree meanwhile, and it is a correction to the *claim* rather than to
the *coverage*: the summary now appends `⚠ …and N report-level finding(s) above
that NO clause can fail on. The ✓ covers the eight enforcing clauses only
(D194).`, and the module header records that clause 9 cannot fail, has no seeded
case, and is currently firing on 103 items — so *"nine clauses, 8/8 seeded"*
stops reading as fuller coverage than it is. `--self-test` still exits 0 (8/8).

## S2 — the release bundle — RECORDED, deliberately not regenerated

Re-hashed independently: **206 of 3,581** digested files changed, **1 missing**
(`apps/docs/scripts/report-size.mjs`). 206 rather than the verification's 205
because this pass modified one further digested file — the AnimationsPage spec.
By area: `apps/docs/components` 140 · `packages/core/src` 19 ·
`packages/tooling/{scripts,src}` 12 · `packages/core/docs` 3 · `docs/qa/release`
3 · `apps/landing/src` 3 · `.github/workflows` 2 ·
`packages/contracts/src/props.types.ts` · `CLAUDE.md` · `package.json` ·
`eslint.config.js`. And, measured rather than inferred:

```
grep -c ariaInvalid docs/qa/release/2026-09-21-527dbd1/api-diff.json → 0
```

The bundle's api-diff contains **no mention** of the one breaking change in the
candidate.

**Not regenerated**, and **D173(b)** is the reason: a candidate digest is a
point-in-time record, and rewriting it destroys evidence the owner has not
reviewed. The condition for regenerating — *"unless you can do so cleanly and
argue it is better"* — is not met: a clean regeneration needs a `yarn build`
(which is itself what **S10**/**D149** are arguing about, and which rewrites the
`dist` the tarball hashes describe) over a tree still 304 paths dirty, so it
would produce a *second* inadmissible bundle and lose the first.

What was added instead is what stops it being read as a green light — the
S1-F10 failure mode in its most expensive form. A dated **⛔ SUPERSEDED AS A
STATEMENT ABOUT THE CURRENT TREE — 2026-09-22** block at the top of
[`ledger.md`](../../qa/release/2026-09-21-527dbd1/ledger.md), with a six-row
table of what the bundle says against what is true: the 221 → 304 path count;
206 changed + 1 missing of 3,581; gate row 8 `validate:all` → 0 against a
now-50-link chain exiting 1; gate row 4 `yarn test` → 0 against the S1 run; the
api-diff's missing `ariaInvalid`; the tarball hashes against 20 changed
published-package sources. The same block at the top of
[`report.md`](../../qa/release/2026-09-21-527dbd1/report.md), plus inline ⛔
markers on the two sentences a skimmer actually reads — *"13 of 13 gates exit 0"*
and *"a chain of 48 links"*.

## S10 — two `STALE` lines, not one — CONFIRMED FIXED

Recorded where R1-O5 stated the single: a dated amendment row in
[`TASK-R1-O5-handoff.md`](./TASK-R1-O5-handoff.md) §"Still red, and whose it is",
directly beneath the original. It carries both live lines, attributes the
`@dzup-ui/contracts` one to TASK-R0-O2, and states why R1-O5's reasoning no
longer transfers: R1-O5 declined to rebuild because it would invalidate the
bundle's `hashes.json` for *prose-only* JSDoc, and R0-O2's edit is a **type
surface** change — while the evidence a rebuild would invalidate is, per **S2**,
already stale.

## S8 — dirty-path arithmetic — LEFT, and flagged in both rows

Not fixable after the fact: the two historical counts (R0-O1's "278 at start and
end", R0-O2's "285 at start") cannot be re-measured, and only their *end* state
can be — **302** then, **304** now. Both `EXECUTION-STATUS.md` rows now carry the
discrepancy rather than each asserting its own figure unqualified, and name
R0-O2's 285 as the suspect one on the verification's own reasoning (rows 19–22's
221 → 231 → 266 → 278 chain is self-consistent with 278, and R0-O1 declares
itself read-only outside its own documents). No decision id: there is nothing to
decide, only a number nobody can now recover.

## S11 — bare `D6` — LEFT

**D179** is open, and the verification says so itself: writing bare `D6` is
defensible until it is taken, and the citation resolves correctly. It is now
visible in the register's own `D179` row — which records that the rule D179 asks
for was broken in the same hour it was proposed — rather than being quietly
corrected in `TASK-R0-O2-handoff.md`, which would delete the evidence for D179.

## Closing ladder — every exit code read directly from the command

Run after all edits above, each as `cmd > logfile 2>&1 ; echo "exit $?"`, never
through a pipe.

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `yarn test` | **0** | 552 files passed · **10,504 passed** · 3 skipped · 1 todo · **0 errors** · 287 s. `grep -c "requestAnimationFrame is not defined"` → **0**. 10,497 → 10,504 is +1 AnimationsPage guard and +6 `docs-size.spec.ts` |
| 2 | `yarn validate:all` | **1** | 425 lines. `grep -n "✗\|FAIL\|✖\|Error:"` over the whole log returns **exactly one** hit — line 421, `✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.` Links 1–47 all printed their success lines. **Link 48 `validate:peers` is red BY DESIGN** (R1-O6's icon-duplicates gate, a live measurement of a real unwaived defect; **D174**/**D175** clear it, not this pass) |
| 3 | `yarn validate:licenses` (link 49, never starts under `&&`) | **0** | 9 allowed, 0 blocked, 0 unknown |
| 4 | `yarn validate:tree-shake` (link 50, never starts under `&&`) | **0** | all checks passed, 4 entry points |
| 5 | `yarn validate:docs-size` **(touched)** | **0** | both artifacts present and measured → the unqualified `✓` line, correctly |
| 6 | `yarn validate:registry` **(touched)** | **0** | `✓ registry: …` **followed by** `⚠ …and 2 report-level finding(s) above that NO clause can fail on. The ✓ covers the eight enforcing clauses only (D194).` |
| 7 | `node … peer-icon-duplicates.ts --self-test` **(touched)** | **0** | 6 of 6 seeded cases behaved — unchanged by the header/message correction |
| 8 | `node … registry.ts --self-test` **(touched)** | **0** | 8 of 8 seeded defects caught by their own clause — unchanged |
| 9 | `node … docs-size.ts` in five modes with the artifacts moved aside **(touched)** | **0/1/0/1/0** | the table in §S6 above; both artifacts restored and verified present afterwards |
| 10 | `node … vitest.mjs run docs-size.spec.ts` | **0** | 20 `it(` (was 14) |
| 11 | `yarn validate:release-policy` | **0** | *"37 pending changeset(s), 0 major, 0 mixed"* |
| 12 | `node node_modules/eslint/bin/eslint.js <5 changed source files> --max-warnings 0` | **0** | two errors found and fixed first: `test/prefer-hooks-in-order` on the new `afterAll`, and `style/multiline-ternary` in the skip message |
| 13 | `node node_modules/typescript/bin/tsc -p packages/tooling/tsconfig.json --noEmit` | **0** | — |

**So the ladder is where it was, minus S1:** `yarn validate:all` exits 1 at link
48 and nowhere else, which is the state R1-O6 shipped deliberately, and
`yarn test` now exits **0** instead of 1.

**Tree at close:** `527dbd1` + **304** uncommitted paths — the 303 this document
started with plus `apps/landing/src/pages/AnimationsPage.v2.spec.ts`. Nothing
committed, pushed, dispatched, published, deployed, or pointed at DNS; no
changeset written or edited; no ADR status flipped; no owner decision resolved;
no ratchet JSON, generated artifact or release-bundle data file touched.

### Nothing got worse

Checked explicitly rather than assumed:

- `validate:all`'s single `✗` is the same line, from the same clause, as the
  verification pass recorded.
- The two gates whose text was corrected still self-test 6/6 and 8/8, and
  **neither changed its exit code** on any input.
- `validate:docs-size` is **unchanged** on this tree (both artifacts present →
  measured → green). The new behaviour is reachable only when an artifact is
  absent, and no workflow invokes the validator, so no CI job changes colour.
- The two `STALE` lines are still reports and `validate:published-imports` still
  `PASSED`; nothing was rebuilt to clear them.
- `git status --porcelain` grew by exactly **one** path, and every file this pass
  edited other than that one was already dirty.

## Files changed by this pass

| Path | Why |
|---|---|
| `apps/landing/src/pages/AnimationsPage.v2.spec.ts` | S1 — the timer-leak fix and its guard test |
| `packages/tooling/src/validators/docs-size.ts` · `.spec.ts` | S6 — fail-closed under CI, loud skip, `shouldRequireDist` + 6 tests |
| `packages/tooling/src/validators/peer-icon-duplicates.ts` | S7 — header and message corrected; behaviour unchanged |
| `packages/tooling/src/validators/registry.ts` | S9 — header and summary corrected; behaviour unchanged |
| `package.json` | S6 — `//validate:docs-size` prose |
| `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` | S3, S4, S5, S7, S9 — 14 rows appended, `D193`/`D194` raised, totals corrected |
| `docs/program-2026-09-04/reports/TASK-R1-O5-handoff.md` | S10 |
| `docs/program-2026-09-04/EXECUTION-STATUS.md` | S1, S4, S5, S8 row corrections; `D193`/`D194`; two ratchet rows |
| `docs/qa/release/2026-09-21-527dbd1/ledger.md` · `report.md` | S2 — supersession notes |
| this file | the section you are reading |

**Not touched, deliberately:** `.changeset/`, `yarn.lock`, `docs/adr/`, any ADR
`Status:` line, any ratchet JSON, any generated artifact, the release bundle's
data files, and the `validate:peers` red — R1-O6's icon-duplicates gate is a live
measurement of a real unwaived defect and is **D174**/**D175**'s to clear, not
this pass's.
