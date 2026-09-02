# TASK-N1-O6 — Visual-regression ownership: the decision, the pilot, and the fifth matrix input

> **Companion memo:** [`N1-O6-visual-regression-memo.md`](./N1-O6-visual-regression-memo.md)
> — the options, the measurements behind the recommendation, and the `[!owner]`
> list. This document is what was built, what was measured, and what is still
> open.
>
> **Binding.** `ui/dzup-ui` `main` @ `51dec93c73214af2d1e424e3454a7122691fea48`,
> worktree **dirty** — **104 changed paths**, of which **17 are this task's**
> (9 new files, 8 modified, 3 of the latter already dirty from earlier packets
> and only regenerated here). The rest belong to N0-05 / N1-O1 / N1-O2 /
> N1-O3. `<authority>` forbids committing, so the tree stays dirty by
> instruction, and no unrelated dirty work was disturbed.
>
> **Admissibility.** Everything below is **locally qualified,
> worktree-dirty — not CI evidence, not release evidence, not production
> evidence.** The pilot baselines carry `worktreeDirty: true` in the ledger, per
> record, so the claim travels with the artifact rather than only with this file.
>
> Node v24.14.1 · Yarn 4.16.0 via corepack · Playwright 1.61.1 · chromium
> 149.0.7827.55 · Windows 11 (`win32`).
>
> **These baselines were captured AFTER TASK-N1-O3's geometry changes.** Every
> one of the 16 pilot records says so in its own `reason` field. Nobody reading
> this lane later should mistake a pilot baseline for pre-fix appearance — the
> before/after evidence for those changes is N1-O3 §7, and this lane starts from
> the *after*.

---

## 1. The decision, and its reasoning

**Self-hosted Playwright `toHaveScreenshot()`, per-component story snapshots,
scoped by family, with a committed acceptance ledger as the authority model.**

| axis | chosen | why |
|---|---|---|
| **tool** | self-hosted Playwright | The comparator was never the gap. The gap is that a green run cannot be distinguished from a rewritten baseline — see §1.1. That is a rule, and it took two files to write. Chromatic and Argos sell a review UI, which is worth buying; they do not sell a rule this repo could not write. Both remain `[!owner]`. |
| **scope** | **per-component**, driven from `e2e/matrix/targets.generated.ts`; the two screen-level specs kept | The failure that motivated the task was per-component. 24 components moved in N1-O3 and the screen-level lane could not have named one. Reusing the browser matrix's generated target list means the visual lane and the matrix drive **the same component in the same story**, and adding a component to a covered family covers it with no list to maintain. |
| **coverage unit** | **family**, declared in `e2e/visual/visual-baselines.json` → `scope.families` | A component list drifts the first time somebody adds a component. A family list does not, because the join is generated. It is also what lets every non-pilot component read a definite `not-covered` rather than an absence. |
| **themes / direction** | **light + dark, LTR**, chromium, 1280 × 720 | The task's stated floor, taken as the floor. RTL and density are already covered per-surface by `theme-recipe-matrix.spec.ts`'s nine-case array; duplicating them per component would take 288 snapshots to 1,152 to re-prove what the recipe matrix proves once. §6 says when that is worth revisiting. |
| **threshold** | **`maxDiffPixels: 0`** | Determinism was measured first (§2.3): 64 captures, 16 digests, zero divergence. Zero tolerance is reachable on this host, so no tolerance above zero was bought. For contrast the screen-level lanes run `maxDiffPixelRatio: 0.01`, which on the measured 154 × 122 `DzButton` canvas is **187 pixels** — enough to lose a glyph. |

### 1.1 The reasoning that actually drove it

Reading the repository before choosing changed the problem. Four facts:

- **The visual lane is already in CI and already `continue-on-error: true`**
  (`ci.yml:528`). A visual regression cannot fail a build today.
- **Chromatic is already wired** — dependency, workflow, TurboSnap, and
  light/dark modes in `preview.ts` — and is *also* `continue-on-error` **and**
  `exitZeroOnChanges`. It needs a token that is not in the repo.
- **The 34 committed baselines have no recorded origin.** No author, no reason,
  no capture commit. `yarn test:e2e:update` was `playwright test
  --update-snapshots`: one command, all 34 rewritten, anonymously.
- **Baselines are platform-locked.** Playwright writes
  `{arg}-{project}-{platform}.png`. Every committed baseline is
  `chromium-linux`; this host writes `chromium-win32`, a *different file* that is
  never compared to it.

So the repository already had two visual-regression systems, both configured
never to fail, and no authority model for either. The deliverable that was
missing is not a comparator — it is a reason to believe a green run means
something.

---

## 2. The pilot: `buttons`

### 2.1 What is snapshotted

8 components × 2 themes = **16 baselines**. The story for each is the one
`targets.generated.ts` already declares for the browser matrix.

| component | tier | story | light | dark |
|---|---|---|---|---|
| DzButton | B | `core-buttons-dzbutton--default` | ✅ | ✅ |
| DzButtonGroup | A | `core-buttons-dzbuttongroup--default` | ✅ | ✅ |
| DzCopyButton | B | `core-buttons-dzcopybutton--default` | ✅ | ✅ |
| DzFab | B | `core-buttons-dzfab--default` | ✅ | ✅ |
| DzIconButton | B | `core-buttons-dziconbutton--default` | ✅ | ✅ |
| DzSpeedDial | B | `core-buttons-dzspeeddial--fab` | ✅ | ✅ |
| DzSplitButton | B | `core-buttons-dzsplitbutton--default` | ✅ | ✅ |
| DzToggleButton | B | `core-buttons-dztogglebutton--default` | ✅ | ✅ |

Capture conditions, all set in the spec rather than left to the host: viewport
1280 × 720, `emulateMedia({ colorScheme, reducedMotion: 'reduce' })`, Storybook
globals `theme:<theme>;direction:ltr`, an assertion that `<html data-theme>`
actually reached the requested theme before the shot, `animations: 'disabled'`,
`caret: 'hide'`, `scale: 'css'`, and an `await document.fonts.ready` so no
capture is ever the fallback face.

Canvas sizes range from 112 × 118 (`DzCopyButton`) to 518 × 238
(`DzSpeedDial`); PNGs from 925 B to 14.4 kB; **96 kB for all 16** — the whole
pilot is smaller than one of the 34 screen-level baselines it sits beside.

### 2.2 Why `buttons`

The task suggested it and the data agreed: 8 components, 100 % story coverage,
and — the reason that mattered — `DzButtonGroup`, `DzSplitButton` and
`DzSpeedDial` **compose** `DzButton`, so the lane's fan-out behaviour is testable
inside the pilot itself. §3.4 exercises exactly that. It is deliberately not the
family with the most churn; N1-O3 touched **one** button-family component. A
pilot that starts where the drift is loudest proves less than one that starts
where the mechanism can be examined.

### 2.3 Determinism — 64 captures, 16 digests, zero divergence

The spec carries a probe mode (`DZUP_VISUAL_PROBE=<dir>`) that writes raw
`element.screenshot()` bytes instead of comparing them, because the question is
whether the *bytes* are stable and `toHaveScreenshot` hides bytes behind a
comparison.

Three **cold** runs — each starting its own `vite preview` server and its own
browser process — then a fourth capture through the normal acceptance write path:

| run | wall clock | snapshots | SHA-256 |
|---|---|---|---|
| probe 1 | 19.3 s | 16 | reference |
| probe 2 | 13.7 s | 16 | **16/16 identical to probe 1** |
| probe 3 | 14.3 s | 16 | **16/16 identical to probe 1** |
| acceptance capture | 16 × ~11 s | 16 | **16/16 identical to probe 1** |

A representative row, so the claim is checkable rather than asserted:

```
component-DzButton-light.png   154x122  1238 B
  0bb0c7e88d6adb3708e682f525f116a9f59e6f54e4d9e859e243dabdf99042cf   probe1
  0bb0c7e88d6adb3708e682f525f116a9f59e6f54e4d9e859e243dabdf99042cf   probe2
  0bb0c7e88d6adb3708e682f525f116a9f59e6f54e4d9e859e243dabdf99042cf   probe3
  0bb0c7e88d6adb3708e682f525f116a9f59e6f54e4d9e859e243dabdf99042cf   accepted baseline
```

Two full Storybook rebuilds later (§3.4) the same 16 baselines still passed at
`maxDiffPixels: 0`.

**Verdict: no source of nondeterminism was found on this host.** The stop
condition about Windows font rasterisation did **not** fire. What is genuinely
non-portable is the platform lock (§5.3) — those digests are `win32` digests and
would not match a Linux capture. That is a fact of the format, not flakiness, and
the answer is to name the authoritative platform rather than to widen a tolerance
until two platforms agree.

**Comparison runs:** the lane passes 16/16 at zero tolerance, repeatedly
(15.6 s, 14.3 s on separate invocations).

---

## 3. The review/update workflow and its authority rule

Documented next to the config, in **`e2e/visual/README.md`** (142 lines), which
covers the three lanes, how scope is declared, why baselines are platform-locked,
the rule itself, the four-step review workflow, and the threshold.

### 3.1 The rule

> **A baseline changes only by an explicit act, with a named author and a stated
> cause. There is no bulk path.**

The perf lane's downward ratchet is the model, adapted rather than copied: a perf
threshold has a direction to ratchet along and a visual baseline does not — a
different image is not "worse". So the equivalent constraint is **cardinality
plus attribution**: one snapshot per invocation, `--by` and `--reason` both
mandatory. Sixteen changed baselines cost sixteen invocations and sixteen
sentences. That is the design: the cost of accepting should scale with how much
changed, which is exactly what `--update-snapshots` destroys.

### 3.2 Where it is enforced

| # | control | file | fails on |
|---|---|---|---|
| 1 | **in-run guard** | `e2e/visual/authority.ts` | `--update-snapshots` with no snapshot named; a named snapshot when the run reaches a *second* one; a missing/short/placeholder reason; a missing author |
| 2 | **digest gate**, no browser | `packages/tooling/src/validators/visual-baselines.ts` → `yarn validate:visual-baselines`, wired into `validate:all` | a PNG whose SHA-256 disagrees with the ledger; a PNG with no ledger entry (orphan); a ledger entry whose file is gone; an entry with no reason/author/date/commit; a covered component missing a theme |
| 3 | **the bulk command is gone** | `packages/tooling/scripts/refuse-bulk-snapshot-update.ts` | `yarn test:e2e:update` prints the accept workflow and exits **1** |

Neither of the first two is sufficient alone. The guard is bypassed by writing
the PNG by hand; the digest gate is satisfied by anyone willing to run the accept
tool without reading the diff — which is why the tool records *who* and *why*
rather than only re-digesting. The gate is also the only control that survives a
Playwright upgrade that changes the PNG encoder.

The sanctioned path:

```bash
yarn visual:accept --component DzButton --theme dark \
  --by "<name>" --reason "<what changed in the product, and why it is correct>"
```

It runs the lane for exactly that one test, re-digests the image, and appends a
record carrying `sha256`, `sourceCommit`, `worktreeDirty`, `acceptedBy`,
`acceptedAt`, `reason` and `replaces` (the digest it superseded, or `null`).

### 3.3 Proof — every control demonstrated, not asserted

**P1 · an unexplained baseline change fails.** One baseline was overwritten with
different (still valid) image bytes and nothing else was touched:

```
✗ [changed] `…/component-DzButton-light-chromium-win32.png` changed with no recorded cause.
      accepted: 0bb0c7e88d6adb3708e682f525f116a9f59e6f54e4d9e859e243dabdf99042cf
      on disk:  7cd9fde80bd2dd1c5868e9a09e98e4a9e1cf12cbdb8e7e876e68ce89078202c4
      A changed baseline is a changed product. Accept it explicitly: …
1 visual-baseline violation(s).
```
`validate:visual-baselines` exit **1**. The Playwright lane failed on the same
file independently. Restored → exit **0**.

**P2 · bulk `--update-snapshots` is impossible.**
`playwright test e2e/visual/component-baselines.spec.ts --update-snapshots`:

```
Error: Refusing to run with `--update-snapshots` (mode: changed). No snapshot was
named, so this run would rewrite every baseline in the lane at once.
```
Exit **1**, and the ledger verified byte-intact afterwards.

**P2b · one snapshot per invocation.** Authorised for
`component-DzButton-light`, the run reached the next test and threw:

```
Error: This run is authorised for `component-DzButton-light` and reached
`component-DzButton-dark`. Acceptance is one snapshot per invocation.
```

**P3 · a reason is not optional.**

| invocation | result |
|---|---|
| `--by "someone"` (no reason) | `✗ --reason must describe … Got: (empty)` |
| `--reason "update"` | `✗ … not a placeholder word. Got: "update"` |
| `--reason "<24 chars>"`, no `--by` | `✗ --by is required. An accepted baseline has an author or it has nobody.` |

**P4 · `--bootstrap` cannot launder a change.** With a tampered baseline on disk,
`--bootstrap` recorded **0** entries and `validate:visual-baselines` still exited
**1**. With a legitimately missing entry it re-added exactly 1, parsing component,
theme, engine and platform back out of the file name.

### 3.4 And it catches real drift — measured end to end

The controls above prove the *authority* half. This proves the *comparator* half,
against an actual product change rather than a tampered file.

`DzButton.variants.ts`'s `md` size was changed from
`px-[var(--dz-button-md-padding-x)]` to
`px-[calc(var(--dz-button-md-padding-x)+1px)]` — a 1 px padding change, 2 px of
width, the same order as N1-O3's V3 (`DzRating` +2 px). Storybook was rebuilt
(1 m 57 s) and the lane re-run:

| snapshot | expected | received | differing px | ratio |
|---|---|---|---|---|
| DzButton light | 154 × 122 | 156 × 122 | 134 | 0.01 |
| DzButton dark | 154 × 122 | 156 × 122 | 406 | 0.03 |
| DzButtonGroup light | 274 × 122 | 280 × 122 | 522 | 0.02 |
| DzButtonGroup dark | 274 × 122 | 280 × 122 | 1240 | 0.04 |
| DzSplitButton light | 174 × 122 | 176 × 122 | 109 | 0.01 |
| DzSplitButton dark | 174 × 122 | 176 × 122 | 376 | 0.02 |

**6 failed, 10 passed.** Two things in that table matter more than the failure
itself:

1. **The fan-out was caught.** `DzButtonGroup` and `DzSplitButton` have their own
   source files, neither of which was edited; they compose `DzButton` and moved
   because it moved. That is precisely the class of drift N1-O3 produced across
   24 components and that no gate in this repository could see.
2. **The other five components did not move**, because they carry their own size
   variants. The lane distinguishes "this component changed" from "everything
   re-rendered", which a screen-level snapshot cannot.

The diff ratios land at **0.01–0.04**. The screen-level lanes' tolerance is
`maxDiffPixelRatio: 0.01`, and `0.01` is *within* it. Playwright fails these
anyway because the image *dimensions* changed, so this is not proof that the old
tolerance would have missed them — but it does show a real geometry change
producing diff ratios at the edge of a tolerance that was chosen without a
measurement behind it. That is why the per-component lane runs at zero.

The source was then restored (MD5 verified identical to the pre-experiment copy,
`git status` clean for `packages/core/src/components/buttons/`), Storybook rebuilt
(1 m 12 s), and the lane re-run: **16 passed**, same 16 baselines, **no baseline
replaced**.

---

## 4. The fifth capability-matrix input

### 4.1 First, the count, honestly

The task brief says the matrix "currently declares four inputs … plus the
`browser-engine-ratchets` input N1-O2 added". Reading the generator, `inputs`
already had **five** entries: `story-dod`, `at-matrix`, `perf-baselines`,
`browser-matrix`, `browser-engine-ratchets`. Visual evidence is therefore the
**fifth generated evidence source** in the sense the task means, and the **sixth
entry** in `inputs`. Both numbers are stated so nobody has to reconcile them
later.

### 4.2 Shape: a per-row field, not a new evidence cell

Visual coverage is reported as a `visual` field on every `CapabilityRow`, beside
the cells — **not** as a new `EvidenceKind`.

That was a deliberate refusal. A *cell* is an evidence row a component **owes**,
and what a component owes is fixed by `TIER_EVIDENCE_INCREMENT` in
`@dzup-ui/contracts` — a published contract whose header says it is transcribed
from the 2026-08-11 reassessment and that "where this file and it disagree, it
wins". Promoting `visual-baseline` to an evidence kind would change what all 144
components owe and would add 144 cells to a matrix whose totals other documents
quote. `<generated_authority>` is explicit: *a generator reports; it never
decides public API.* So the generator reports coverage, and the promotion is
recorded as owner decision **D4** with the evidence already in hand.

```ts
export interface VisualEvidence {
  readonly state: 'covered' | 'not-covered' | 'stale'
  readonly baselines: number
  readonly themes: readonly string[]
  readonly artifacts: readonly string[]
  readonly note?: string
}
```

Staleness uses **the same detection as the other inputs** —
`evidenceIsCurrent(record.sourceCommit, componentCommit)` from
`packages/tooling/src/quality/git.ts`, the `merge-base --is-ancestor` test that
`at-manual` and `perf-baseline` already use. Not a date, not a hash equality.

### 4.3 Regeneration result

```
capability-matrix: 144 components, 1661 evidence cells

  tier   pass  present  stale  unrun  excepted
  A       106      160      0     79         4
  B       326      234      0    348         9
  C       158       87     10    119         0
  D         7       10      1      1         2

  visual   covered 8  ·  stale 0  ·  not-covered 136
```

- **Cell counts are unchanged** (1,661) — the field is additive and inflates no
  tally.
- `schemaVersion` **1.0.0 → 1.1.0**. Additive: a 1.0.0 reader still finds every
  field it knew.
- Two consecutive generator runs are **byte-identical**, for both
  `capability-matrix.json` and the Storybook projection
  `apps/storybook/stories/_data/capability.generated.ts`.

**The success criterion, checked directly:**

```
state histogram: {"not-covered":136,"covered":8}
any unknown? false
```

A non-pilot component and its reason, quoted from the regenerated file:

```
== DzTree (data, tier C) -> not-covered
   note: The per-component visual lane covers families [buttons] on win32;
         `data` is not in scope yet. Ranked for rollout in
         docs/program-2026-09/reports/N1-O6-visual-regression-handoff.md.
```

and a pilot one:

```
== DzButton (buttons, tier B) -> covered
   themes ["dark","light"] baselines 2
   note: 2 accepted baseline(s), dark + light, chromium/win32, ltr.
         CI runs linux, so this is developer-local evidence, not a CI gate.
```

`not-covered` is a **declared** state: the scope lives in a committed file, so a
component outside it is a known gap with a rollout rank, which is a different
thing from `unknown`. The `inputs` entry carries the same caveat where the docs
page prints it:

```json
"visual-baselines": {
  "available": true,
  "path": "e2e/visual/visual-baselines.json",
  "note": "Per-component baselines for families [buttons]: 8 component(s), light + dark,
           chromium/win32, ltr. Every component outside those families reads `not-covered`,
           never `unknown`. Baselines are platform-locked and CI runs linux, so this lane is
           developer-local evidence until one accept pass is made there."
}
```

The Storybook page shows it too: `apps/storybook/stories/_blocks/CapabilityMatrix.ts`
appends `· visual <state>` to each row's header line.

---

## 5. Validation

### 5.1 The ladder

Every exit code captured bare, never through a pipe.

| step | command | result |
|---|---|---|
| pilot determinism probe ×3 | `playwright test e2e/visual/component-baselines.spec.ts --project=chromium` (probe mode) | **16/16 each, 48 PNGs, 16 digests, 0 divergence** |
| pilot comparison | same, comparison mode | **16 passed, exit 0** (repeated: 15.6 s, 14.3 s) |
| visual gate | `tsx packages/tooling/src/validators/visual-baselines.ts` | **exit 0** — 50 on disk, 50 accepted |
| capability matrix regen | `tsx …/generate-capability-matrix.ts` | **exit 0**, two runs byte-identical |
| capability matrix gate | `tsx …/validators/capability-matrix.ts` | **exit 0** — fresh, no Tier D cell unexplained |
| unit test, matrix validator | `vitest run packages/tooling/src/validators/capability-matrix.spec.ts` | **exit 0 — 10/10** |
| types | `vue-tsc --noEmit -p packages/core/tsconfig.json` | **exit 0** |
| lint (the repo's target) | `eslint packages/ apps/ --max-warnings 0` | **exit 0** |
| **aggregate** | `yarn validate:all` | **EXIT 0 — 28 links, all green** (27 before this task; `validate:visual-baselines` is the new link, inserted after `validate:capability-matrix`) |
| tooling unit suite | `vitest run packages/tooling` | **exit 1 — 603 passed, 2 failed, both pre-existing** (§5.2) |
| Storybook build | `storybook build` | **exit 0**, twice, 1 m 57 s and 1 m 12 s |

### 5.2 Tooling failures and component failures, separately

**Component failures: zero.** No file under `packages/core/src/` is changed by
this task. The only source edit made to a component was the §3.4 perturbation,
reverted and MD5-verified.

**Tooling failures: two, both pre-existing and both already on the ledger.**
`vitest run packages/tooling` → 41 files, 606 tests, **2 failed**:

| test | verdict |
|---|---|
| `token-checks/landing-token-fallbacks.spec.ts › every fallback matches the value its token resolves to` | **Pre-existing.** N1-O3 §8.3 T1. Belongs to the landing themes page. |
| `validators/story-dod-tiers.spec.ts › countOpen › subtracts a waiver` | **Pre-existing.** N1-O3 §8.3 T2 — the fixture asks the live repo for an open tier-required item and N1-O1 drove that count to 0. |

Neither is in this task's lane, and `validate:all` does not run `yarn test`,
which is why they stay invisible to the aggregate gate.

**Harness findings from this task** (tooling, not components):

| # | finding | consequence |
|---|---|---|
| **H1** | **`yarn lint` does not cover `e2e/`.** Its target is `packages/ apps/`. Running `eslint e2e/` finds **9 pre-existing errors** in `e2e/smoke/storybook.spec.ts` (4 unused vars, 4 operator-linebreak, 1 arrow-parens) and `e2e/utils/storybook.ts` (1 if-newline). The entire browser harness — 18 matrix projects, 3 visual specs, the AT scaffold — is outside the lint gate. This task's three new `e2e/visual/*.ts` files lint clean; the 9 are not mine. |
| **H2** | **Node refuses to spawn `npx.cmd` without a shell** (the CVE-2024-27980 fix), so the first version of `visual:accept` failed silently on Windows with no child output. Fixed by invoking `node node_modules/@playwright/test/cli.js` — which is the pattern `test:e2e:landing` already uses, for the same reason. Going through a shell instead would have put a free-text `--reason` on a command line. |
| **H3** | **Playwright's `--grep` matches the full title *path*** (project and file included), so a `^`-anchored pattern silently selects **zero tests** and the command exits 0 having done nothing. The first accept implementation used `^title$` and appeared to work. End-anchoring only. |
| **H4** | **A stale `vite preview` from N1-O3 was still holding port 6106**, and `STORYBOOK_E2E_STATIC=1` forces `reuseExistingServer: false`, so every Playwright invocation failed with "port already used". N1-O3's handoff says `.pw-out/` "is removed at task end"; it is not, and neither was the server. Killed (PID 14852, started 2026-08-31 20:27). |
| **H5** | **Bare `yarn` on this host is 1.22.22** and refuses the repo's `packageManager: yarn@4.16.0`. `corepack yarn <script>` works. This is the concrete form of the "`yarn <script>` exits 127" note carried by earlier sessions. |

### 5.3 The platform lock — stated, not worked around

Playwright names a baseline `{arg}-{project}-{platform}.png`. The 34 pre-existing
baselines are `chromium-linux`, because CI runs `ubuntu-latest`. This host writes
`chromium-win32`. The two are different files and are **never compared**, which is
correct — font rasterisation genuinely differs — and it means "which platform is
authoritative" is a decision, not an accident.

It is recorded in the ledger as `scope.platform: "win32"` and
`scope.ciPlatform: "linux"`, and `validate:visual-baselines` **reports** the
disagreement on every run:

```
! this ledger gates on `win32` and CI runs `linux`. Baselines are platform-locked,
  so the per-component lane is developer-local evidence and cannot fail a CI run
  until one accept pass is made on linux.
```

The alternatives were considered and rejected: removing `{platform}` from the
snapshot path template would make two incomparable images compare (a bug
disguised as portability), and raising the tolerance until Linux and Windows
renders agree would need a tolerance far past the 0.1 % the stop condition names.
Naming the platform and saying so is the honest option. **Owner decision D2.**

### 5.4 `matrix-report.json` integrity

`test-results/matrix-report.json` is git-ignored and is the only copy of the
2026-08-25 chromium run (N0-05 F4, N1-O2 §1e, N1-O3 §8.4).

| checkpoint | MD5 |
|---|---|
| task start | `15b4139314e12569cc160609fa0692a3` |
| after determinism probes 1–3 | `15b4139314e12569cc160609fa0692a3` |
| after the 16 acceptance captures | `15b4139314e12569cc160609fa0692a3` |
| after the P1/P2/P2b proof runs | `15b4139314e12569cc160609fa0692a3` |
| after the §3.4 perturbation run | `15b4139314e12569cc160609fa0692a3` |
| **task end** | **`15b4139314e12569cc160609fa0692a3`** |

**Verdict: intact and byte-identical throughout.** Method, unchanged from N1-O3's:
a copy was taken outside the repository before the first Playwright command; every
invocation passed `--output=.pw-out/…`; `PLAYWRIGHT_JSON_OUTPUT` was never set.
The 34 pre-existing baselines were also never rewritten — their digests are in the
ledger and the gate would say so.

### 5.5 Files

**New (9):**

| file | lines | what |
|---|---|---|
| `e2e/visual/component-baselines.spec.ts` | 112 | the per-component lane, with probe mode |
| `e2e/visual/coverage.ts` | 132 | the family→component join and the ledger types |
| `e2e/visual/authority.ts` | 140 | the in-run guard |
| `e2e/visual/visual-baselines.json` | 778 | scope + 50 acceptance records |
| `e2e/visual/README.md` | 142 | scope, workflow, authority rule, threshold |
| `e2e/visual/component-baselines.spec.ts-snapshots/` | 16 PNG, 96 kB | the pilot baselines |
| `packages/tooling/src/validators/visual-baselines.ts` | 295 | the digest gate |
| `packages/tooling/src/quality/accept-visual-baseline.ts` | 324 | `visual:accept` |
| `packages/tooling/scripts/refuse-bulk-snapshot-update.ts` | 35 | the removed bulk command |

**Changed (8, of which 3 were already dirty from earlier packets and are only regenerated here):**

| file | change |
|---|---|
| `package.json` | `+validate:visual-baselines` (and into `validate:all`), `+test:e2e:visual:pilot`, `+visual:accept`; `test:e2e:update` now refuses. Each with the `//`-prefixed documentation entry the file's convention requires. |
| `packages/tooling/src/quality/capability-matrix.ts` | `VisualEvidence` type; `CapabilityRow.visual`; schema 1.0.0 → 1.1.0 |
| `packages/tooling/src/quality/generate-capability-matrix.ts` | reads the ledger; `resolveVisual()`; the `visual-baselines` input; CLI totals line |
| `packages/tooling/src/quality/emit-capability-data.ts` | projects `visual` into the Storybook data module |
| `packages/tooling/src/validators/capability-matrix.spec.ts` | fixture gains `visual`; schema 1.1.0 |
| `apps/storybook/stories/_blocks/CapabilityMatrix.ts` | `· visual <state>` on each row header |
| `packages/core/docs/capability-matrix.json` | regenerated (already dirty from N0-05) |
| `apps/storybook/stories/_data/capability.generated.ts` | regenerated (already dirty from N0-05) |

**Zero files under `packages/core/src/`.**

---

## 6. Rollout order for the remaining 11 families

136 components remain, **272 snapshots**. Ranked by *where drift has actually
happened*, using the family distribution of the 24 + 13 components N1-O3 touched,
then by tier weight:

| rank | family | components | snapshots | N1-O3 touched | why here |
|---|---|---|---|---|---|
| **1** | **forms** | 28 | 56 | **15** | Every one of N1-O3's flagged changes V8 (checkbox/radio rows +3–6 px) and V1 (date pickers +8 px wide) lives here, plus the only Tier D component. Highest churn, highest tier weight, and the family a consumer sees most. |
| **2** | **data** | 19 | 38 | **9** | V5 lives here — tree rows **21 → 33 px**, the largest metric change in N1-O3 and one nobody has reviewed. `DzTable`/`DzDataGrid` reflow too. |
| **3** | **inputs** | 8 | 16 | **4** | The 12 TS-1 field-shell fixes (`input 159×21 → 159×34`). Small family, direct exposure to the same tokens as forms. |
| **4** | **media** | 10 | 20 | **2** | V6 — `DzLightbox` went from rendering **unstyled** to styled. The single largest visual change in the program and the least covered by anything else. |
| **5** | **navigation** | 12 | 24 | **1** | V2 (`DzBreadcrumb` rows +3 px), and navigation chrome is where composition drift shows first. |
| **6** | **layout** | 18 | 36 | **2** | V4 (splitter/resizable handles now capture ±11.5 px). Mostly Tier A otherwise. |
| **7** | **overlays** | 10 | 20 | **2** | Teleported; a snapshot needs the overlay open, so these stories need review before capture. Genuinely more work per component than 1–6. |
| **8** | **feedback** | 18 | 36 | 0 | 15 of 18 are Tier A. Cheap, low yield. |
| **9** | **typography** | 8 | 16 | 0 | All Tier A. Catches font/token drift and nothing else — but that is exactly what a token change breaks. |
| **10** | **cards** | 3 | 6 | 0 | Trivially small. |
| **11** | **providers** | 2 | 4 | 0 | Render nothing of their own; capture may not be meaningful. Decide before capturing. |

### 6.1 Estimate

Measured, not guessed: the pilot's 16 snapshots run in **~14 s** of test time
(~0.9 s/snapshot) after a ~6 s server start. All 288 snapshots would run in
**≈ 4.5 minutes**, plus one Storybook build (~1–2 min). **The steady-state cost
of full coverage is under 7 minutes.**

The cost is not the running, it is the accepting. `visual:accept` spawns
Playwright per snapshot (~11 s), so 272 first captures at one invocation each is
**~50 minutes of invocations**. There is a sanctioned path that does not require
that and does not weaken the rule:

> **Family rollout:** run the lane once (Playwright writes the missing baselines
> and fails, as it should) → **review the 2N images as a set** → one
> `visual:accept --bootstrap --by … --reason "<family> first capture, reviewed as
> a set at <commit>"`. `--bootstrap` **adds only**: it recorded 0 entries against
> a tampered file in the P4 proof and can never re-accept a changed baseline. So
> a first capture is batchable and a *change* never is, which is exactly what the
> authority rule says.

On that path, a family costs **10–20 minutes**, dominated by looking at the
images — which is the work, and the only part that should be expensive.
Ranks 1–4 (65 components, 130 snapshots, all six unreviewed N1-O3 changes) is
roughly **one working day** including the design review those changes are owed.

### 6.2 Two things to decide before rank 7

- **Overlays and teleported content.** The pilot's `DzSpeedDial` is captured
  closed. An overlay's interesting state is open, which needs a `play()`-style
  step before the shot. That is a spec change, not a scope change, and it should
  be designed once rather than per family.
- **RTL and density.** Deliberately out of the pilot (§1). Once forms and data
  are covered, re-measure: if per-surface `theme-recipe-matrix.spec.ts` keeps
  catching direction bugs the per-component lane misses, add `direction` to
  `scope` and pay the 2× — not before.

---

## 7. Stop conditions, and what is still open

### 7.1 Stop conditions fired

| condition | fired? | outcome |
|---|---|---|
| *"snapshots are non-deterministic in this environment (fonts/rendering)"* | **No.** | 64 captures across 4 cold runs produced 16 digests with zero divergence (§2.3). Windows font rasterisation was measured, not assumed, and is not a source of drift on this host. |
| *"record the exact source of nondeterminism instead of loosening thresholds past 0.1 %"* | **N/A.** | The threshold was tightened to `maxDiffPixels: 0`, not loosened. Nothing above zero was bought. |
| *"the choice requires a paid service decision — mark `[!owner]`"* | **Yes, twice.** | Chromatic and Argos are both `[!owner]`. Nothing was signed up for, no token was created. Chromatic is *already* half-wired in this repo (§1.1) — the decision is now "finish or retire", with the volume number (2,880 snapshots per full build) attached. |

### 7.2 Unresolved owner decisions

| # | decision | evidence | what is needed |
|---|---|---|---|
| **D1** | **Chromatic: finish it or retire it.** It has a workflow, a dependency, TurboSnap and light/dark modes, and no token — so it runs and does nothing. Leaving a configured-but-dead visual gate in the repository is worse than either outcome. | `.github/workflows/chromatic.yml`; `preview.ts:346-352`; `apps/storybook/package.json`. 1,440 stories × 2 modes = **2,880 snapshots per full build**. | A paid-service decision plus a token, or a deletion. **`[!owner]`** |
| **D2** | **The authoritative baseline platform.** Committed baselines are `chromium-linux`; the pilot's are `chromium-win32`. Until one accept pass runs on Linux, the per-component lane cannot gate CI. | §5.3. The ledger records both and the gate reports the disagreement every run. | Either run the accept pass on Linux (CI or a container) and set `scope.platform: "linux"`, or accept that this lane is a local pre-flight only. **`[!owner]`** |
| **D3** | **The CI visual step is `continue-on-error: true`.** A visual regression cannot fail a build today, and none of this work changes that on its own. | `ci.yml:528-533`. | Decide when the lane becomes blocking. Recommended order: resolve D2, roll out ranks 1–4, then flip. **`[!owner]`** |
| **D4** | **Promote `visual-baseline` to an `EvidenceKind`?** It would give every component a real matrix *cell* with a tier origin instead of a reported field — but it changes what all 144 components owe, and the tier table is transcribed from the 2026-08-11 reassessment. | §4.2. `TIER_EVIDENCE_INCREMENT` in `packages/contracts/src/quality-tiers.ts`; `<generated_authority>`. | An owner decision about the tier contract. The generator side is already built either way. **`[!owner]`** |
| **D5** | **The 34 pre-existing baselines are grandfathered, not reviewed.** They now have ledger entries with their true capture commits (`b550403`, `cfd4835`, `078c1dd`, `fd5dd49`) and a reason that says exactly this: *"Recorded as-is so that any FUTURE change needs a stated cause. This entry attests custody, not review."* | `e2e/visual/visual-baselines.json`. | Somebody should look at 34 images once, or accept that their origin is permanently unknown and that only changes from here are governed. |
| **D6** | **`yarn lint` does not cover `e2e/`.** 9 pre-existing errors sit there, and the whole browser harness is outside the gate. | §5.2 H1. | One-word change to the lint target plus 9 fixes. Not done here: `<validation>` says the narrowest owning command first, and widening a repo-wide gate mid-task would have mixed this task's result with somebody else's debt. |
| **D7** | **N1-O3's D7 is now actionable but still unactioned.** The six unreviewed visible changes (V1–V4, V5 tree 21→33 px, V6 DzLightbox unstyled→styled) are still unreviewed by a designer. This task built the lane that would hold them — and **captured its pilot baselines after those changes**, so nothing here reviews them. | N1-O3 §7.3–7.4; every pilot record's `reason`. | Roll out rollout ranks 1–4 (§6) and pair the capture with the design review. This is the same recommendation N1-O3 made; it now has a mechanism. |

### 7.3 What this task did **not** do

Stated so nobody infers it from a green gate:

- **It did not review any image.** The 16 pilot baselines were accepted because
  they are the first capture of the current appearance, not because anybody
  judged them correct. The reason field says so.
- **It did not make anything blocking in CI.** D3.
- **It did not roll out beyond `buttons`.** 136 components read `not-covered`,
  by design, with a rank.
- **It did not commit, push, dispatch CI, publish, or replace a baseline.** The
  34 pre-existing baselines are byte-identical to their state at task start.

### 7.4 Ranked next packet

| rank | packet | why |
|---|---|---|
| **1** | **D2 — one accept pass on Linux**, then set `scope.platform: "linux"`. | Everything else about this lane is developer-local until this is done. It is minutes of work on a Linux host and it converts the whole mechanism into something CI can enforce. |
| **2** | **Rollout ranks 1–4 (forms, data, inputs, media) paired with N1-O3's design review (D7).** | 65 components, 130 snapshots, and it is where all six unreviewed geometry changes live. One working day, and it closes the oldest open item in the ledger. |
| **3** | **D1 — finish or retire Chromatic.** | A dead gate in CI is a liability whichever way it is resolved, and the volume number is now known. |
| **4** | **D3 — make the visual lane blocking.** | After 1 and 2, not before: a blocking gate over 5.6 % coverage would be theatre. |
| **5** | **D6 — put `e2e/` under `yarn lint`.** | Small, and the harness is 18 matrix projects plus 3 visual specs of ungated code. |
| **6** | **D4 — decide the `EvidenceKind` promotion.** | Bookkeeping with real consequences for how the matrix reads, but nothing depends on it. |
| **7** | **TASK-N1-O5 (security corpus), then TASK-N1-O4 (AT cells).** | Unchanged programme order. O4 still terminates in an owner gate no agent can satisfy. |

---

## Appendix — reproduction

```bash
cd ui/dzup-ui
git rev-parse HEAD                       # 51dec93c73214af2d1e424e3454a7122691fea48
md5sum test-results/matrix-report.json   # 15b4139314e12569cc160609fa0692a3 — BEFORE and AFTER

# Bare `yarn` here is 1.22.22 and refuses packageManager: use corepack, or npx
# the binary directly. Never read a gate's exit code through a pipe.
corepack yarn --version                  # 4.16.0

# One Storybook build serves every run below.
yarn storybook:build

export STORYBOOK_E2E_STATIC=1 STORYBOOK_E2E_PREBUILT=1

# The lane. --output keeps Playwright's start-of-run cleaning away from
# test-results/. Do NOT set PLAYWRIGHT_JSON_OUTPUT.
npx playwright test e2e/visual/component-baselines.spec.ts \
  --project=chromium --output=.pw-out/visual
# → 16 passed

# Byte-level determinism: capture raw bytes instead of comparing, three times.
for n in 1 2 3; do
  DZUP_VISUAL_PROBE=/tmp/probe$n npx playwright test \
    e2e/visual/component-baselines.spec.ts --project=chromium --output=.pw-out/p$n
done
for n in 1 2 3; do (cd /tmp/probe$n && sha256sum *.png | sort -k2 > /tmp/h$n); done
diff /tmp/h1 /tmp/h2 && diff /tmp/h2 /tmp/h3   # → no output

# The authority rule, all three controls.
npx playwright test e2e/visual/component-baselines.spec.ts \
  --project=chromium --update-snapshots            # → refused, exit 1
yarn test:e2e:update                               # → refused, exit 1
cp <any other>.png e2e/visual/component-baselines.spec.ts-snapshots/component-DzButton-light-chromium-win32.png
yarn validate:visual-baselines                     # → [changed], exit 1
git checkout -- e2e/visual/component-baselines.spec.ts-snapshots/   # or restore the file

# The sanctioned path.
yarn visual:accept --component DzButton --theme dark \
  --by "<name>" --reason "<what changed and why the new image is correct>"

yarn generate:capability-matrix   # → visual  covered 8 · stale 0 · not-covered 136
yarn validate:all                 # → EXIT 0, 28 links
```

The workflow this appendix abbreviates is written in full, next to the config, in
[`e2e/visual/README.md`](../../../e2e/visual/README.md).
