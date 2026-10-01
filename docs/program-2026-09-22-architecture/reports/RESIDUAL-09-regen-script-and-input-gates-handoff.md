# RESIDUAL-09 — `yarn regenerate:all` (`D-RES07-2`) and the four missing `inputs[].gate` blocks

> Repository `ui/dzup-ui` (OSS, `@dzup-ui/*`), HEAD
> **`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`**, worktree dirty **by design**
> (**331 paths handed in** — the 16-task architecture programme plus RESIDUAL-01…08).
> No commit, push, CI dispatch, publish, `yarn install`, baseline replacement or
> screenshot capture was performed. Written **incrementally**, phase by phase.

**Status: COMPLETE.** Both items done. Item 1 added `yarn regenerate:all` — the seven steps in
order, refusing to start on a step whose script `package.json` no longer declares, and
stopping at the first failure with the step, its exit code and the steps that did not run —
proved by **two seeded breaks** and by a **stale → regenerate → green** run from a
deliberately staled `.vue`, with the whole restore proved byte-identical over **182** files.
`CLAUDE.md`'s table is kept in full and is now **bound to the script by a spec**. Item 2
declared the four missing `inputs[].gate` blocks in the generator and proved
**byte-for-byte** that the four blocks are the *only* change to `capability-matrix.json` —
no cell, state or total moved. Both aggregates are green and handed back that way:
`validate:all` **61 links, `EXIT=0`, zero `✗`**; `yarn test` **575 files / 11,196 passed /
0 failed, `EXIT=0`** (+1 file / +14 tests, both this batch's); browser lane **170 / 1,462 /
0 failed**. Two decisions closed (`D-RES07-2`, RESIDUAL-03 items 3–4), one raised
(`D-RES09-1`).

## 0. Start state, recorded before anything was touched

The start listing was snapshotted **to the session scratchpad, outside the repository**,
by a command that creates nothing inside it (RESIDUAL-06 §6 / RESIDUAL-07 §0's lesson).

| Check | Value at start |
|---|---|
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` |
| `git status --porcelain \| wc -l` | **331** — full listing in `<scratchpad>/git-status-before.txt`, matching RESIDUAL-08's exit number exactly |
| ` M yarn.lock` present? | **yes** — the owner's `yarn install` of 2026-09-28 09:36 (RESIDUAL-07 §9.1). **Not touched by this batch.** |
| `sha256sum yarn.lock` | `dcef3ed26f23fd00ea99f64ba8c977442bdcc6abd776300c323dc99a63e076cf` — unchanged at end |
| `Object.keys(scripts).filter(/regenerate/)` | **`[]`** — there is no `regenerate*` script, as the brief measured |
| `validate:all` links | **61**, measured by splitting `scripts['validate:all']` on `&&` |

---

## 1. Item 1 (`D-RES07-2`) — the regeneration order is now executable

### 1.1 The seven script names, verified against `package.json` before wiring

The brief's warning is real in this repository (`validate:ownership` runs
`validators/ownership-manifest.ts`), so every name was resolved out of the manifest rather
than copied from a document:

| # | Script key | Resolves to |
|---|---|---|
| 1 | `generate:ownership` | `tsx packages/tooling/src/ownership/generate-ownership-manifest.ts` |
| 2 | `generate:quality-matrix` | `tsx packages/tooling/src/quality/generate-quality-matrix.ts` |
| 3 | `generate:capability-matrix` | `tsx packages/tooling/src/quality/generate-capability-matrix.ts` |
| 4 | `generate:component-meta` | `tsx packages/tooling/src/meta/generate-component-meta.ts` |
| 5 | `generate:llms` | `tsx packages/tooling/src/llms/generate-llms.ts` |
| 6 | `generate:docs-pages` | `tsx packages/tooling/src/docs/generate-docs-pages.ts` |
| 7 | `csp:inline-style-inventory` | `tsx packages/tooling/src/security/inline-style-inventory.ts --write` |

All seven exist. `validate:all` stays **61** links: a new script key is not a chain link.

### 1.2 Implemented files, and the API effect

| File | Change | API effect |
|---|---|---|
| `packages/tooling/src/regenerate-all.ts` | **new.** The order as **data** (`REGENERATE_STEPS`, seven rows of `{ step, script, owedWhen }`), plus `declaredScripts()`, `undeclaredSteps()`, `stopMessage()` and a `/* c8 ignore */`-guarded CLI entry in the house shape of `src/docs/verify.ts` | **none.** `@dzup-ui/tooling` is `private: true` and is not in `packages/tooling/scripts/release-policy.json`'s `published` list |
| `packages/tooling/src/regenerate-all.spec.ts` | **new, 14 tests.** Two have teeth: *"names only scripts the root `package.json` declares"* reads the **live** manifest, and *"agrees with `CLAUDE.md`'s table, step for step and in order"* parses the table out of `CLAUDE.md` and compares it to `REGENERATE_STEPS` | none |
| `package.json` | **+2 keys** — `"//regenerate:all"` (the documentation key, house convention) and `"regenerate:all": "tsx packages/tooling/src/regenerate-all.ts"`. **No existing key changed** | the root manifest gains a script. The root manifest is `private: true` and `tooling` is private and unpublished, so **no changeset is owed** and none was added |
| `CLAUDE.md` | the seven-row table and every line of its prose **kept verbatim**; a blockquote added beneath it pointing at `yarn regenerate:all`, stating what the script guarantees, and stating explicitly that the table is *not* redundant and is not to be deleted | none |

**Why a script and not a longer `&&` chain in `package.json`.** An `&&` chain stops at the
first failure and cannot say *which* step failed — this repository identifies a failing
`validate:all` link by counting `&&` separators, which is exactly the hand-work item 1
exists to remove. More importantly, only a script can **verify its own step names against
`package.json` before running anything**. That is the drift `D-RES07-2` was raised about,
turned into a refusal.

**The table and the script cannot drift.** `regenerate-all.spec.ts` parses
`CLAUDE.md`'s `### Regenerating generated artifacts` table (bounded at the next `##`) and
asserts the `yarn <script>` names it contains equal `REGENERATE_STEPS`, in order. Editing
one without the other is now a red unit test — the only durable answer to a fact that lives
in two places on purpose.

### 1.3 Stop at the first failure — proved by two seeded breaks, not asserted

Both seeds were taken on **non-test source**, run against the final bytes, and restored by
**byte copy** (never `git checkout`, which the brief forbids).

| # | Seed | Result | Exit (file-captured) | Restore |
|---|---|---|---|---|
| **A** | step 5's `script` renamed to `generate:llms-renamed-away` in `regenerate-all.ts` — nothing else | **refuses to START.** *"✗ regenerate:all refuses to start: 1 step(s) name a script the root package.json does not declare … step 5: yarn generate:llms-renamed-away"*. Count of `[n/7]` banners in the log → **0**: **not one step ran** | **`EXIT=1`** | `sha256sum` `e7e4441a…a274e` **identical**; all 182 artifacts `sha256sum -c` **OK** |
| **B** | `throw new Error('RESIDUAL-09 seeded break: step 2 must fail')` prepended to `generate-quality-matrix.ts` (ESM hoists the imports, so it throws before any generator logic) | step 1 runs and exits 0; **step 2 fails and the chain stops.** Banner count → **2**, `[1/7]` and `[2/7]` only, so steps 3–7 **never started** | **`EXIT=1`** — the failing step's own code, not a wrapper's | `sha256sum` `47e8cfbd…0aa12` **identical**; all 182 artifacts `sha256sum -c` **OK** |

Seed B's printed message, verbatim from the log:

```
✗ regenerate:all STOPPED at step 2 of 7: `yarn generate:quality-matrix` exited 1.

  The chain stops here on purpose. Every step after a failed one derives its
  artifact from that step's output, so continuing would produce artifacts built
  from a stale predecessor — which reads as fresh and is not.

  NOT RUN (5 step(s)) — these artifacts are NOT fresh:
    3. yarn generate:capability-matrix
    4. yarn generate:component-meta
    5. yarn generate:llms
    6. yarn generate:docs-pages
    7. yarn csp:inline-style-inventory
```

Listing the steps that did **not** run is the part that matters. The thing a reader
misreads is not *"step 2 failed"* — it is assuming `component-meta.json` and `nav.json` are
fresh because the command was run.

### 1.4 End to end from a deliberately stale state — the exact sequence, with exit codes

The stale state was made the way the trap actually happens: **one line inserted into a
`.vue` that carries an inline `style=`**. `packages/core/src/components/buttons/DzButton.vue`
was chosen because it was **clean at session start** (not one of the 331 dirty paths), so a
byte-identical restore returns it to *unlisted*. Its inline site is
`style="contain: layout style"` at line **209**.

| # | Command | Result | Exit (read from a log **file**) |
|---|---|---|---|
| 0 | `vitest run packages/core/security/inline-style-inventory.spec.ts` | **7 passed** — the baseline is green *before* the seed, so the red at step 2 is the seed's | **`EXIT=0`** |
| 1 | seed: one comment line inserted after line 3 of `DzButton.vue`; the style site moves **209 → 210** | `eslint --max-warnings 0` on the seeded file is clean, **`EXIT=0`** — so the seed is not itself a lint defect | — |
| 2 | the same spec again | **FAILS** — `AssertionError: expected [ Array(133) ] to deeply equal [ Array(133) ]` on *"is fresh — the artifact and the source agree, site for site"*. Same 133 sites, one moved line number | **`EXIT=1`** |
| 3 | **`yarn regenerate:all`** | `✓ regenerate:all — 7 of 7 steps exit 0`; all seven banners `[1/7]`…`[7/7]` present, in order | **`EXIT=0`** |
| 4 | the same spec a third time | **7 passed** | **`EXIT=0`** |
| 5 | **`yarn validate:all`** | **61 links · 1,305 lines · 52 `✓` · ZERO `✗`** | **`VALIDATE_ALL_EXIT=0`** |
| 6 | restore `DzButton.vue` by byte copy, then `yarn regenerate:all` again | `✓ 7 of 7 steps exit 0` | **`EXIT=0`** |
| 7 | `sha256sum -c` over **182 files** — the restored `.vue` plus every artifact the chain can write (`component-ownership.manifest.json`, `quality-matrix.json`, `capability-matrix.json`, `capability.generated.ts`, `component-meta.json`, `llms.txt`, `llms-full.txt`, `nav.json`, `inline-style-inventory.json`, all of `apps/docs/components/*.md` and the six `apps/docs/evidence/*.md`) | **182 of 182 `OK`** — the restore is byte-identical, and so is every artifact derived from it | **`EXIT=0`** |

`DzButton.vue` is back to `c7b177f6…767236` and `component-meta.json` to `347b2530…8bf5008`
— the same sha RESIDUAL-07 §2.2 recorded — so the chain is idempotent on this tree and step
7 is not quietly rewriting something else.

**Step 7's invisibility to `validate:all` is confirmed a fourth time.** The measurement is
step 2 → step 4 above: with the inventory stale, the **only** gate that went red was the
unit spec. `validate:all` was not run in that state precisely because it has nothing to say
about it; it was run at step 5, on the regenerated tree, and is green.

### 1.5 Focused validation for item 1

| # | Command | Result | Exit |
|---|---|---|---|
| 1 | `vitest run packages/tooling/src/regenerate-all.spec.ts` | **14 passed**, incl. the live-manifest and `CLAUDE.md`-binding tests | **`EXIT=0`** |
| 2 | `yarn typecheck:tooling` | no output | **`EXIT=0`** |
| 3 | `eslint --max-warnings 0` on both new files | clean. Two `style/quotes` errors were fixed **by hand**; `--fix` was **not** used | **`EXIT=0`** |
| 4 | `yarn regenerate:all --list` | the seven steps and their triggers, nothing run | **`EXIT=0`** |
| 5 | seeded break A (preflight refusal) | 0 banners, step 5 named | **`EXIT=1`** |
| 6 | seeded break B (step 2 fails) | 2 banners, steps 3–7 listed as NOT RUN | **`EXIT=1`** |
| 7 | restores after each seed | `sha256sum` identical on both files; 182/182 artifacts `OK`, twice | **`EXIT=0`** |
| 8 | the stale → regenerate → green sequence | §1.4 | as tabled |

---

## 2. Item 2 — the four missing `inputs[].gate` blocks, declared by measurement

### 2.1 What was missing, re-measured before anything was written

`inputs[].gate` separates *"an artifact was read"* from *"this can fail CI"* (TASK-S1-O3).
Four of the six inputs declared neither, and the rendered evidence page printed that as a
`—` in its **Can fail CI** column — a dash a reader cannot distinguish from *"the question
was not asked"*.

| Input | `gate` before | `gate` after |
|---|---|---|
| `story-dod` | **missing** | **declared** |
| `at-matrix` | **missing** | **declared** |
| `perf-baselines` | present (TASK-S1-O4) | unchanged |
| `browser-matrix` | **missing** (RESIDUAL-03 ranked item 3) | **declared** |
| `visual-baselines` | present (TASK-S1-O3) | unchanged |
| `browser-engine-ratchets` | **missing** (RESIDUAL-03 ranked item 4) | **declared** |

Filled in the **generator** (`packages/tooling/src/quality/generate-capability-matrix.ts`),
never by hand-editing `packages/core/docs/capability-matrix.json`, then regenerated with
item 1's own `yarn regenerate:all`.

### 2.2 The four blocks, and the measurement behind every field

Every `ciGate` below was decided by reading `.github/workflows/`, not by inference. Two
facts hold across all four and were measured once: **all 19 `runs-on:` values in the eight
workflow files are `ubuntu-latest`** (so `linux` is the only platform whose result can block
a merge), and **`validate:all` does run on every push and pull request** —
`.github/workflows/validate-min-runtime.yml:120`, a reusable workflow `ci.yml:121-122`
calls, on `ubuntu-latest`, with no `continue-on-error`.

#### `story-dod` — the only one of the six that gates

```json
{ "platform": "any", "authoritative": "any", "ciGate": true }
```

| Field | Measurement |
|---|---|
| `platform` / `authoritative` | **`any`.** This input is static analysis over the committed `.stories.ts` text — no browser, no AT, no timing, no rendered pixel. It is the one input with no host to be locked to, and saying `win32` would invent a constraint |
| `ciGate` | **`true`.** Workflow checked: **`.github/workflows/ci.yml`**, job **`validate`** (`runs-on: ubuntu-latest`), step *"Story definition of done"* at **line 163**, `run: yarn validate:story-dod`. **`continue-on-error`: none anywhere in that job** — a grep over its lines 124–253 returns nothing; the only `continue-on-error: true` in the whole file is at **line 515**, on the *visual* e2e step of the `e2e` job. Additionally `validate:story-dod-tiers` is link **21** of `validate:all` |
| `blockedOn` | **absent**, which is what the field means when the input already gates |

**The honest limit, recorded in the generator rather than smoothed over.** Five checks feed
cells here. Measured 2026-09-28 by running the gate:

```
✓ controls-driven  161 / 161  100%  (enforced)      · gallery        15 / 170   9%  (reported)
· controls-live    134 / 161   83%  (reported)      · accessibility 115 / 170  68%  (reported)
· states            53 /  56   95%  (reported)      · real-world    110 / 170  65%  (reported)
✓ dark-mode        170 / 170  100%  (enforced)      · play          158 / 170  93%  (reported)
✓ description      170 / 170  100%  (enforced)
→ yarn validate:story-dod EXIT=0 · yarn validate:story-dod-tiers EXIT=0
  accessibility tier C+ 0/0 · real-world tier C+ 0/0 · states tier B+ 0/0 · 312 advisory
```

The five checks the capability matrix reads are `dark-mode`, `states`, `accessibility`,
`real-world` and `play`. `dark-mode` is `level: 'error'` at 170/170, so a regression fails
outright. `states`, `accessibility` and `real-world` are `report` level but **tier-required
at `0 / 0` ceilings**, so a new violation on a component whose tier requires the check is
over its ceiling and red. `play` is reported and **no tier requires it** — a `play`
regression alone fails nothing. `true` with that edge written down is the accurate answer;
`false` would be the wrong one, because four of the five checks can and do turn a CI run red.

#### `at-matrix` — the honest hard case

```json
{
  "platform": "none — 0 of 534 cells executed, so no host has produced evidence for this input at all",
  "authoritative": "the AT pairing's own platform (Windows, macOS, iOS, Android) — a screen-reader result is only valid on the AT and OS that produced it, and no single runner can hold all six",
  "ciGate": false,
  "blockedOn": "a NAMED HUMAN TESTER and a date (register D112): 534 cells, 0 executed. No CI job can ever make this true — `yarn at:ingest` transcribes a session record a named person produced, and an agent may never write one. `validate:at-matrix` and `validate:at-runs` DO run in CI without `continue-on-error`, but they check the SHAPE of a record and exit 0 over an empty directory. Wave 1 is 44 cells / 20.6 tester-hours on one Windows 11 machine (TASK-S1-O1 wave-1 schedule)."
}
```

| Field | Measurement |
|---|---|
| `platform` | **`none`**, derived at generate time: `entries[].rows` is **534** rows and the count with `result !== 'unrun'` is **0**. The distinct set of `result` values across all 534 rows is `['unrun']` — one value, measured, not quoted from a report |
| `authoritative` | derived from `index.json`'s six declared pairs: `nvda-firefox` / `nvda-chrome` / `jaws-chrome` → **Windows**, `voiceover-safari` → **macOS**, `voiceover-ios` → **iOS**, `talkback-android` → **Android**. Four platforms, so **no single runner can be authoritative**, which is itself part of why this cannot be a CI lane |
| `ciGate` | **`false`.** Workflows checked: **all eight files** in `.github/workflows/` — a grep for `at-matrix`, `at-runs`, `at-scripts` and `at:ingest` returns **zero** matches, so no job names the AT lane directly. The structural gates reach CI only through `validate:all` (links **23** `validate:at-matrix` and **57** `validate:at-runs`, `ubuntu-latest`, **no `continue-on-error`**), and both **exit 0 over an empty directory by design** — every row in a new matrix starts `unrun`, and a gate that failed on that would be switched off the day it landed |
| `blockedOn` | **a named human tester**, register **`D112`** — *"the one thing that must happen: a person's name in D112 and a date"*. Stated plainly, as the brief required: no CI wiring can ever make this `true`, because `at:ingest` refuses anything an agent could produce |

#### `browser-matrix` — RESIDUAL-03's ranked item 3, closed

```json
{
  "platform": "win32 — node v24.14.1",
  "authoritative": "linux",
  "ciGate": false,
  "blockedOn": "two acts, in this order. (1) A CI job that runs the Playwright matrix lane on `ubuntu-latest` and projects its JSON report through `yarn generate:browser-evidence` — measured 2026-09-28, NO workflow in .github/ invokes `yarn test:e2e:matrix` or `yarn generate:browser-evidence`, and the only `continue-on-error: true` in ci.yml is on the visual e2e step. (2) One sweep on a CLEAN worktree — every run committed here carries worktreeDirty: true, which this ledger's own admissibility field calls locally qualified only. Until (1), these rows are developer-local evidence and cannot fail anything."
}
```

| Field | Measurement |
|---|---|
| `platform` | derived from the ledger: the distinct set of `runs[].platform` over all **24** runs is exactly one value, **`win32 — node v24.14.1`**. Every run's `state` is `run`; every run's `worktreeDirty` is `true`, at `sourceCommit 589be13` |
| `authoritative` | **`linux`**, measured: a grep for `runs-on:` over `.github/workflows/` → **19 occurrences, all `ubuntu-latest`**. If a job existed, linux is the platform whose result could block a merge |
| `ciGate` | **`false` — and the reason is stronger than a platform mismatch: no workflow runs the lane at all.** Workflows checked: **all eight**. A grep for `e2e:matrix`, `browser-evidence`, `engine-ratchets` and `e2e/matrix` over `.github/workflows/` → **zero matches** (grep exit 1). The `e2e` job (`ci.yml:486`, `ubuntu-latest`) runs `yarn test:e2e:functional --project=chromium` at line 511 with **no `continue-on-error`**, and `yarn test:e2e:visual` at line 516 **with `continue-on-error: true`** — neither is the matrix lane. `validate:capability-matrix` (link 24) does gate the **ledger's consistency** (its degradation and shape clauses), but nothing in CI ever *produces* a row |
| `blockedOn` | two acts, in order: a CI job on `ubuntu-latest` that runs the lane and projects it through `yarn generate:browser-evidence`; then one sweep on a **clean** worktree, because every committed run is `worktreeDirty: true` and the ledger's own `admissibility` string calls itself *"LOCALLY QUALIFIED ONLY"* |

#### `browser-engine-ratchets` — RESIDUAL-03's ranked item 4, closed

```json
{
  "platform": "win32 -- Windows 11 Pro 10.0.26200, node v24.14.1",
  "authoritative": "linux",
  "ciGate": false,
  "blockedOn": "the same two acts as `browser-matrix` — no workflow in .github/ runs the Playwright matrix lane, and all 19 CI jobs are `ubuntu-latest` while this ledger is win32. Measured 2026-08-31 at `51dec93c73214af2d1e424e3454a7122691fea48` on a DIRTY worktree, so it is locally qualified only."
}
```

| Field | Measurement |
|---|---|
| `platform` | read from the ledger's own `platform` field — `win32 -- Windows 11 Pro 10.0.26200, node v24.14.1`. The field has been declared since TASK-N1-O2 and **was never read by this generator until now**; reading it is why the local `EngineRatchets` interface gained four optional keys |
| `authoritative` | **`linux`**, the same 19-job measurement |
| `ciGate` | **`false`.** Same eight workflow files, same zero matches. This is the same lane as `browser-matrix`, and it is declared **separately rather than by reference** because the input is read on its own: it is what lets a `browser-matrix` cell say *which* of the 24 projects ran, so a reader trusting that sentence is trusting an ungated ledger |
| `blockedOn` | the same two acts, plus the provenance the ledger states itself: measured **2026-08-31** at **`51dec93c`** on a **dirty** worktree |

### 2.3 It moved no score — proved byte-for-byte, not by inspection

`gate` is metadata on `inputs`; no cell resolver reads it. That is the claim, and here is the
proof rather than the argument. The artifact's sha256 was recorded **before** item 2
(`563789e3f62f0f6ec9d6cc9d616b99bc788c2aa1c69863d4e8ab4adde491bbf0`, from the 182-file
manifest of §1.4). Afterwards the regenerated artifact was parsed, the **four new `gate`
keys deleted**, and re-serialized through the generator's own
`JSON.stringify(matrix, null, 2) + '\n'`:

```
sha of the new artifact with the four gate blocks removed and re-serialized
  563789e3f62f0f6ec9d6cc9d616b99bc788c2aa1c69863d4e8ab4adde491bbf0
sha recorded before item 2
  563789e3f62f0f6ec9d6cc9d616b99bc788c2aa1c69863d4e8ab4adde491bbf0
IDENTICAL — the four gate blocks are the ONLY change to the artifact
```

So not one cell, state, total, row, note or ordering moved — the whole diff is four objects.
The counted quantities, re-read from `.totals` after regenerating:

| | A | B | C | D | **total** | before |
|---|---|---|---|---|---|---|
| `pass` | 106 | 325 | 147 | 7 | **585** | 585 |
| `fail` | 0 | 0 | 0 | 0 | **0** | 0 |
| `present` | 175 | 304 | 117 | 12 | **608** | 608 |
| `stale` | 0 | 0 | 21 | 1 | **22** | 22 |
| `unrun` | 65 | 247 | 87 | 1 | **400** | 400 |
| `excepted` | 4 | 41 | 2 | 0 | **47** | 47 |

`rows` **144**, `cells` **1662** — both unchanged.

### 2.4 What a reader of the docs site now sees

`apps/docs/evidence/capability-matrix.md`, regenerated by step 6 of the chain. Before, four
rows read `—`; now every row is answered, and the one input that gates says so:

```
| Input                     | Available | Can fail CI |
| `story-dod`               | yes       | yes         |   <- was —
| `at-matrix`               | yes       | **no**      |   <- was —
| `perf-baselines`          | yes       | **no**      |
| `browser-matrix`          | yes       | **no**      |   <- was —
| `visual-baselines`        | yes       | **no**      |
| `browser-engine-ratchets` | yes       | **no**      |   <- was —
```

**Five of the six inputs to the capability matrix cannot fail a CI run.** That was true
before this batch and is merely now legible: `available: true` on six rows beside four dashes
reads as *"read, and presumably watched"*.

### 2.5 Implemented files for item 2, and the API effect

| File | Change | API effect |
|---|---|---|
| `packages/tooling/src/quality/generate-capability-matrix.ts` | **+4 gate functions** (`storyDodInputGate`, `atMatrixInputGate`, `browserMatrixInputGate`, `engineRatchetsInputGate`), a named `InputGate` interface restating the shape the two existing functions already return inline, and **4 optional keys** on the local `EngineRatchets` interface so the ledger's declared `platform` / `measuredAt` / `sourceCommit` / `worktreeDirty` can be read. The four are wired into `inputs`. `resolveCell`, `resolveVisual`, `loadSources` and the `totals` reducer are **untouched** | **none.** `@dzup-ui/tooling` is `private: true` and unpublished |
| `packages/core/docs/capability-matrix.json` | **regenerated** — four `gate` objects added under `inputs`, nothing else (proved byte-for-byte, §2.3) | published inside `@dzup-ui/core`'s `docs/`. **Additive**: `gate` is already optional in `packages/tooling/src/quality/capability-matrix.ts` and `packages/tooling/src/docs/evidence.ts`, and two inputs already carried it, so **no consumer type changes** and `schemaVersion` is unchanged |
| `apps/docs/evidence/capability-matrix.md` and the component pages | regenerated by the chain; the four `—` cells become `yes` / `**no**` | `apps/docs` is private |
| `packages/core/docs/component-meta.json`, `llms.txt`, `llms-full.txt`, `quality-matrix.json`, `component-ownership.manifest.json`, `security/inline-style-inventory.json`, `apps/docs/.vitepress/generated/nav.json`, `apps/storybook/stories/_data/capability.generated.ts` | re-run as part of the seven-step chain | — |

**No changeset was added, and that is a judgement the owner should see.** `@dzup-ui/core`'s
declared surface does not change: no prop, emit, slot, anatomy part, state value, message
key, variant, export or type. The one published file that changed is a **generated evidence
artifact under `docs/`** whose schema already declared `gate` as optional. Raised as
**`D-RES09-1`** rather than decided silently.

---

## 3. Aggregate qualification — pre-existing versus new

Every exit code below was read out of a **log file**, never from a completion notice. That
rule is not ceremony here: RESIDUAL-08 recorded the fifth instance in this session of a
reported exit code that did not match the gate's own.

| Lane | Handed baseline | **This batch** | Verdict |
|---|---|---|---|
| `yarn validate:all` | 61 links, `EXIT=0`, zero `✗` | **61 links (measured), `VALIDATE_ALL_EXIT=0`, 1,305 lines, 52 `✓`, ZERO `✗`** | **held — still fully green** |
| unit suite (`yarn test`) | 574 files · 11,182 passed · 3 skipped · 1 todo · 0 failed · `EXIT=0` | **575 files · 11,196 passed · 3 skipped · 1 todo · 0 failed · 377.06 s · `YARN_TEST_EXIT=0`** | **held, and +1 file / +14 tests, all this batch's** |
| browser lane (app-local runner, `apps/storybook`) | 170 files · 1,462 tests · 1,462 passed · 0 failed | **170 files · 1,462 tests · 1,462 passed · 0 failed · 101.52 s · `BROWSER_LANE_EXIT=0`**, `grep -c FAIL` → **0** | **identical — no regression** |
| `yarn typecheck:tooling` | 0 | **`EXIT=0`**, no output | held |
| `eslint --max-warnings 0` on every file this batch wrote | 0 | **`EXIT=0`**. Three errors were fixed **by hand** (two `style/quotes`, one `style/indent-binary-ops`); `--fix` was **not** used | held |

**The unit-suite arithmetic, stated so nothing is hidden.** 574 → **575** files is
`packages/tooling/src/regenerate-all.spec.ts`. 11,182 → **11,196** is exactly the **14**
tests in it, and nothing else: `11,182 + 14 = 11,196`, with `3 skipped` and `1 todo`
unchanged, and **0 failed**. The suite was green on the **first** run — no flake, no re-run,
and the documented `apps/landing` `requestAnimationFrame`-after-teardown flake did not
appear.

**`validate:all` is 61 links and stays 61.** Measured by splitting
`scripts['validate:all']` on `&&`, never quoted. Item 1 adds two *keys* to `package.json`
(`//regenerate:all` and `regenerate:all`); neither is a chain link, and no existing link was
touched, so every link number cited in this programme's reports still points where it did.

**Nothing in this batch is new red.** There is no red: the handed tree was fully green for
the first time (RESIDUAL-08) and it is handed back that way.

### 3.1 Order of operations, stated so the evidence can be trusted

Every source edit, every regeneration and both seeded-break restores happened **before** the
final `validate:all`, `yarn test` and browser-lane runs, so all three measured the final
tree. The only writes after them are this report, the register addendum and
`EXECUTION-STATUS.md` — three paths that were **already dirty** and that no chain link reads
(`validate:docs-size` measures the built `apps/docs/.vitepress/dist`; `validate:doc-snippets`
scans a fixed list of four `README.md` files).

---

## 4. Ratchet movements (old → new)

Every figure re-read from the artifact that owns it, not quoted from a prior report.
**No ceiling raised, no allowlist widened, and no `*ceilings*.json` opened for writing** —
`find packages -name '*ceiling*.json' -newermt <session start>` returns **nothing**.

| Ratchet / counted quantity | Old | **New** | Source of truth |
|---|---|---|---|
| `maxUnclassified` | 29 | **29** | `packages/tooling/src/ownership/unclassified-ceiling.json` |
| `maxWithoutAnatomy` | 41 | **41** | same file |
| `maxProposedCitedFromCode` | 3 | **3** | `packages/tooling/scripts/adr-registry.json` |
| capability `pass` | 585 | **585** (A 106 · B 325 · C 147 · D 7) | `packages/core/docs/capability-matrix.json` `.totals` |
| capability `fail` | 0 | **0** | same |
| capability `present` | 608 | **608** (175 · 304 · 117 · 12) | same |
| capability `stale` | 22 | **22** (0 · 0 · 21 · 1) | same |
| capability `unrun` | 400 | **400** (65 · 247 · 87 · 1) | same |
| capability `excepted` | 47 | **47** (4 · 41 · 2 · 0) | same |
| capability rows / cells | 144 / 1662 | **144 / 1662** | same |
| AT executed | 0 of 534 | **0 of 534** — measured directly: 534 rows in `e2e/at-matrix/index.json`, distinct `result` set `['unrun']` | `e2e/at-matrix/index.json`; `validate:at-runs` is link 57 of the green chain |
| locales ≥ 95 % | 1 | **1** (`minSupportedLocales: 1`, `minCompletenessPercent: 95`) | `i18n-completeness-ceilings.json` |
| inline-style sites | 133 | **133** (81 static / 52 bound) | `inline-style-inventory.json` `.totals` |
| inline-style dispositions | 78 / 3 / 0 / 19 / 33 | **78 / 3 / 0 / 19 / 33** | same |
| `validate:all` links | 61 | **61** (measured) | `package.json` |
| `validate:all` `✗` | 0 | **0** | §3 |
| Pending changesets | 48 | **48** — none added, and §2.5 says why | `ls .changeset/` excluding `README.md` and `config.json` |
| unit suite | 574 files / 11,182 | **575 / 11,196** — +1 file, +14 tests, both this batch's | §3 |
| browser lane | 170 files / 1,462 tests | **170 / 1,462** | unchanged |
| Dirty paths | **331** | **333** — +2, both attributed | §6 |

**Every frozen quantity is unmoved.** Item 1 added a script and a spec; item 2 declared four
existing facts in an existing optional field. Neither owes a ratchet movement and none was
taken. The only numbers that changed are the unit-suite counts and the dirty-path count,
both of which this report names line by line.

---

## 5. Owner decisions — two closed, one raised

Recorded in the register's **§15** addendum (appended; earlier rows keep their original text
and gain dated status rows).

### Closed

- **`D-RES07-2`** 🟢 → **CLOSED by option (c)**, the recommended one, and the
  recommendation **survived measurement**. `yarn regenerate:all` exists, runs the seven steps
  in order, **refuses to start** on a step naming an undeclared script, and **stops at the
  first failure** naming the step, its exit code and the steps that did not run — each half
  proved by a seeded break, each seed restored byte-identically. The annotated `CLAUDE.md`
  table is **kept in full** and is now **bound to the script by a spec**, so the two cannot
  drift; that binding is the part option (c) did not ask for and is what makes "keep both"
  safe rather than a second copy waiting to go wrong.
- **RESIDUAL-03 ranked items 3 and 4** 🟢 → **CLOSED.** `browser-matrix` and
  `browser-engine-ratchets` both declare a `gate`. RESIDUAL-03's ground for deferring —
  *"a win32 packet that cannot qualify a browser result has no business rewriting the artifact
  that records browser results"* — was respected rather than overridden: **not one cell,
  state, total or note moved**, proved byte-for-byte in §2.3, and the `platform` field the
  blocks now carry is exactly the `win32` admission RESIDUAL-03 wrote as prose.

### Raised

1. **`D-RES09-1` 🟡 — does declaring an existing truth in a published generated artifact owe
   a changeset?** `packages/core/docs/capability-matrix.json` ships inside `@dzup-ui/core`,
   and it changed: four `gate` objects were added under `inputs`. Nothing about the package's
   *declared surface* changed — no prop, emit, slot, anatomy part, state value, message key,
   variant, export or type — the field was already optional in the schema, two inputs already
   carried it, and `schemaVersion` is unchanged. This batch therefore added **no changeset**,
   and says so rather than leaving a reader to infer it. Options: (a) accept that a generated
   evidence artifact under `docs/` is not a release-worthy surface and record the rule in
   `release-policy.json`'s comment so the next packet does not have to re-decide it ·
   (b) require a `patch` for any byte change to a published `docs/` artifact, which makes
   every regeneration a release event · (c) exclude `core/docs/**` from the published files
   list, which is a bigger decision about what the package is for. **Recommend (a)**, ~10 min,
   and it closes a question three packets have now hit silently.

**Left explicitly to their owners, unchanged by this batch:** register #2 / `D127`, the
commit itself · **`D112`** — a named AT tester and a wave-1 date, which is now written into
`at-matrix`'s own `gate.blockedOn` and is the only thing between 534 cells and any AT
evidence · **`D-S1O4-1` / `D-S1O4-3`** — the perf capture host and the CI job that would run
it · the CI job that would run the Playwright matrix lane (now `browser-matrix`'s and
`browser-engine-ratchets`' `blockedOn`) · the visual baseline accept pass on linux ·
**`D-RES07-1`**, `DzSelect`'s undriven route · **`D-RES06-2`**, `aria-controls=""` upstream ·
**`D-RES04-2`**, the host-driven `searchable` double filter · the 193
structurally-verified-but-not-outcome-verified citations · the 25 body-wiping jsdom specs
(S5-O2) · `D91`, the coverage re-baseline · ADR-18 / 19 / 20 acceptance.

---

## 6. Residue — nothing left behind, proved by difference

| Check | Start | End |
|---|---|---|
| `git rev-parse HEAD` | `4e4e46f…410a` | **`4e4e46f…410a`** — unchanged |
| `git status --porcelain \| wc -l` | **331** | **333** — **+2, both attributed** |
| `diff` of the two full **listings** | — | **exactly 2 added lines, none removed, none modified** |
| `sha256sum yarn.lock` | `dcef3ed2…e076cf` | **`dcef3ed2…e076cf` — identical.** It is still ` M`, and that modification is **the owner's `yarn install` of 2026-09-28 09:36**, not this session's |
| `yarn install` run? | — | **no.** None owed: no dependency or version changed anywhere |
| `find packages apps e2e -name '__screenshots__'` | nothing | **nothing.** One browser-lane run, zero PNGs |
| Files temporarily modified and restored | — | **three**, each verified by `sha256sum` against a byte copy taken first: `packages/core/src/components/buttons/DzButton.vue` (the stale-state seed), `packages/tooling/src/quality/generate-quality-matrix.ts` (seeded break B) and `packages/tooling/src/regenerate-all.ts` (seeded break A). **All three byte-identical afterwards**, and all **182** chain artifacts `sha256sum -c` **OK** after each restore. None of the three appears in the end listing, and two of them were **clean at session start**, so the restore is provable from `git status` as well as from the shas |
| Restores done with `git checkout`? | — | **never.** The brief forbids it; every restore is a byte copy from the session scratchpad |
| Probe files inside the repository | — | **none.** Every log, byte copy and script lives in the session scratchpad **outside** the repository, so this batch's own tooling cannot appear in its own count |
| `git worktree list` | one entry | **one entry** |
| `*ceilings*.json` opened for writing | — | **none** — `find … -newermt <session start>` is empty |
| Commit / push / CI dispatch / publish / baseline capture / screenshot capture / `yarn install` | — | **none** |

### 6.1 The two paths, named

```
?? packages/tooling/src/regenerate-all.ts        ← item 1, the runner
?? packages/tooling/src/regenerate-all.spec.ts   ← item 1, its 14 tests
```

Everything else this batch touched was **already dirty at session start**, each verified by
name against the start listing: `CLAUDE.md`, `package.json`,
`packages/tooling/src/quality/generate-capability-matrix.ts`,
`packages/core/docs/capability-matrix.json`, `apps/docs/evidence/capability-matrix.md`,
`apps/storybook/stories/_data/capability.generated.ts`, `packages/core/docs/component-meta.json`,
`EXECUTION-STATUS.md`, and the register plus this report inside the already-`??` `reports/`
directory entry.

**331 + 2 = 333**, and `git status --porcelain | wc -l` prints **333**.

---

## 7. Ranked next packet

1. **Register #2 / `D127` — commit the 333-path worktree.** Owner-only. It has been the top
   of this list for five batches. The tree is now **fully green on both aggregates**
   (`validate:all` `EXIT=0`, `yarn test` `EXIT=0`), which is the state a commit wants and the
   first time this programme has had it.
2. **`D-RES09-1` option (a)** — record in `release-policy.json` whether a generated evidence
   artifact under `core/docs/` owes a changeset. **~10 min**, and it removes a question three
   packets have now answered privately.
3. **`D-RES07-1` option (a) — drive `DzSelect`'s list-showing → item-focused → host-reload
   route in its own story.** ~45 min; drives **two** currently-unproven pieces of C9.4 at
   once, and is the last untested route in a seam that has had four batches of work.
4. **Bind the four hand-measured `ciGate` values to the workflow files.** ~1 h. Every
   `ciGate` in §2.2 was measured by reading `.github/workflows/` **by hand**, and
   `perfInputGate`'s has been hardcoded since TASK-S1-O4 on the same basis. A workflow that
   gains `continue-on-error`, or a job renamed away, silently makes one of these blocks a lie
   — and the repository already has the mechanism: `validate:browser-lane`
   (`packages/tooling/src/validators/browser-lane.ts`) does a **textual** read of `ci.yml`'s
   `storybook-test` job for exactly this failure mode, `[ci-gate]` / `[ci-advisory]`. Extend
   it to assert each declared `ciGate` against the workflow that justifies it. **This is the
   only thing in this batch whose correctness depends on a human having grepped correctly.**
5. **`D112` — a named AT tester and a wave-1 date.** Owner-only, 44 cells / 20.6
   tester-hours on one Windows 11 machine. It is now printed in the artifact's own
   `blockedOn`, on 144 generated docs pages, which is the most visible it has ever been.
6. **A CI job for the Playwright matrix lane on `ubuntu-latest`.** ~2 h including the
   projection step. It is what turns `browser-matrix` and `browser-engine-ratchets` from
   *read* into *gating*, and 2,112 passing cells are currently invisible to CI.
7. **`D-RES06-2` step (b) — pin `aria-controls=""` with an assertion.** ~30 min, no
   behaviour change. Report it upstream in the same sitting.
8. **Outcome-verify the 193 surviving citations.** ~3 h. Unchanged in rank.
9. **`D-RES04-2` option (b)** — stop a host-driven `searchable` control re-filtering its
   host's rows. ~1 h, a `minor` to `@dzup-ui/core`.
10. **The 25 body-wiping jsdom specs** (S5-O2) — ~8 h, untouched, still the prerequisite for
    moving the 153 clean component specs into browser mode. Then **`D91`**, the owner's
    coverage re-baseline, still the keystone for Vitest 4 and therefore Vite 8.

---

## 8. State of the tree at handover

**Commit and tree.** HEAD is `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` with **333 dirty
paths, uncommitted by design** — the 16-task architecture programme plus RESIDUAL-01…09.
Nothing was reverted, stashed, checked out, cleaned, pulled, merged, rebased or committed.
`yarn.lock` is byte-identical to how it was found (`dcef3ed2…e076cf`) and its ` M` status is
**the owner's install of 2026-09-28 09:36**. No `__screenshots__`, no stray PNG, no probe
file, one worktree, no `*ceilings*.json` opened for writing.

**Both aggregates are green.**

| Lane | Result |
|---|---|
| `yarn validate:all` | **61 links · `EXIT=0` · 1,305 lines · 52 `✓` · ZERO `✗`** |
| `yarn test` | **575 files · 11,196 passed · 3 skipped · 1 todo · 0 failed · `EXIT=0`**, first run, no flake |
| browser lane (app-local runner from `apps/storybook`) | **170 files · 1,462 tests · 1,462 passed · 0 failed · `EXIT=0`**, `grep -c FAIL` → 0 |
| `yarn typecheck:tooling` · `eslint --max-warnings 0` | **`EXIT=0`** |

**What this batch leaves behind that a reader should not misread.**

- **`yarn regenerate:all` is not a replacement for `CLAUDE.md`'s table**, and the table is not
  a redundant copy. The script answers *what runs when several artifacts are stale*; the table
  answers *which steps are owed when only one is*. `regenerate-all.spec.ts` asserts they name
  the same seven commands in the same order, so the duplication is checked rather than
  trusted.
- **The four new `gate` blocks promoted nothing.** Five of the six inputs to the capability
  matrix cannot fail a CI run, and that was already true — the artifact simply said `—` where
  it now says `**no**`. §2.3 proves byte-for-byte that no score moved.
- **`story-dod`'s `ciGate: true` has one recorded edge**: the `play` check is reported and no
  tier requires it, so a `play` regression alone fails nothing. The other four checks the
  matrix reads are enforced or held at a `0 / 0` tier ceiling.
- **Every `ciGate` in this batch was measured by a human grep over `.github/workflows/`.**
  That is the weakest link in it, and it is ranked as next-packet item 4 rather than left for
  someone to discover.

**Status: COMPLETE**, to the limit of agent authority. Both items done, each proved able to
fail by a seeded break on non-test source, every seed restored byte-identically, two decisions
closed and one raised.

---

## 9. Closing re-measurement, after every write

§3's aggregates were measured before this report, the register addendum and
`EXECUTION-STATUS.md` were written. RESIDUAL-07 §3.4 argued that no chain link reads those
three paths; this batch **re-ran the aggregate afterwards rather than relying on the
argument**.

| Check | Result | Exit |
|---|---|---|
| `yarn validate:all`, re-run after all three documents were written | **61 links · 1,304 lines · 52 `✓` · ZERO `✗`** | **`VALIDATE_ALL_EXIT=0`** |
| `git status --porcelain \| wc -l` | **333**, and the `diff` against the start listing is still **exactly 2 added lines, none removed, none modified** | — |
| `sha256sum yarn.lock` | `dcef3ed26f23fd00ea99f64ba8c977442bdcc6abd776300c323dc99a63e076cf` — identical to the start value | — |
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` — unchanged | — |

The two `validate:all` runs report **1,305** and **1,304** lines; the difference is one
progress line from a build step, and both runs carry **52 `✓` and zero `✗`** at **`EXIT=0`**.

`yarn test` was **not** re-run after the three document writes, and the reason is checked
rather than assumed: a grep over every `*.spec.ts` in the repository for
`EXECUTION-STATUS`, `owner-decision-register` and `program-2026-09-22-architecture` returns
exactly **one** match — a prose comment in `packages/tooling/src/perf/capture-environment.spec.ts`
citing `TASK-S1-O4-handoff.md`, which reads no file. The one spec that does read a document,
`packages/tooling/src/regenerate-all.spec.ts`, reads `CLAUDE.md`, and `CLAUDE.md` was written
**before** the suite ran.
