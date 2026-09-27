# TASK-R2-O6 — Visual-regression rollout and the CI gate

> **Bound to** `ui/dzup-ui` HEAD **`2d51eec`** ("feat: land program-2026-09-04
> R3/R5 — i18n, layout spans, async options, corpus schema"), worktree
> **dirty: 445 uncommitted paths at start, 448 at end** — the three added are
> this task's own three reports. Every other path was preserved untouched.
> Every number below is **locally qualified, worktree-dirty — not CI, release
> or production evidence.**
>
> Host: Windows 11 Pro 26200 (`win32`), Node v24.14.1, Yarn 4.16.0,
> Playwright 1.61.1.
> Container: `mcr.microsoft.com/playwright:v1.61.1-noble`
> (digest `sha256:5b8f294a…97e48`, Ubuntu 24.04.4, Node v24.17.0,
> Playwright 1.61.1, chromium-1228), Docker 29.3.1, `OSType: linux`, WSL2.
>
> Date: 2026-09-19. Companion packets:
> [Chromatic finish-or-retire](./TASK-R2-O6-chromatic-finish-or-retire.md) ·
> [`visual-baseline` EvidenceKind proposal](./TASK-R2-O6-evidence-kind-proposal.md).

---

## PROGRESS NOTE (kept live while the task ran — the filesystem is the memory)

- [x] Prompt, README §4/§5, N1-O6 memo + handoff, `e2e/visual/README.md`,
      TASK-R2-O1 §2.4/§2.8/§3 read in full.
- [x] `<done_check>` run and evaluated **by intent** — **0 of 4 pass**. Two of
      the four cannot be evaluated as written: **D136**, **D137**.
- [x] Container route probed: image pulled (**111 s, 3.45 GB**), repo mounted
      **read-only**, container-local install. **Probe A–F all ran.**
- [x] Platform delta measured against the 58 committed win32 PNGs.
- [x] Runtime budget measured at **full scope**, not extrapolated. Sharding
      decided.
- [x] Determinism measured at full scope. **4 flaky snapshots found and
      characterised** — excluded with a reason, never retried into green.
- [x] Chromatic finish-or-retire packet written.
- [x] `visual-baseline` EvidenceKind proposal written.
- [x] Fifth matrix input verified; **one correctness defect found and fixed**
      (**D138**); generated chain regenerated in the documented order.
- [x] CI gate analysed; the consequence of removing `continue-on-error`
      **measured, not derived**.
- [x] `yarn validate:all` re-run and handed back **green**, as received.
- [x] **Coverage ratchet did NOT move: 8 of 144, deliberately.** §6.

---

## 0. `<done_check>` result — by intent

Run from `ui/dzup-ui` at `2d51eec`. **0 of 4 pass by intent.** The task was run.

| # | check as written | literal result | **by intent** |
|---|---|---|---|
| 1 | `ls e2e/visual/baselines/ \| wc -l` → ≥ 89 Tier B+ components | **path does not exist**; `ls` errors, `wc -l` reads the empty pipe as `0` | **FAIL, correctly.** The real artifacts are three `*.spec.ts-snapshots/` directories (34 `chromium-linux` + 24 `chromium-win32` PNGs) and `e2e/visual/visual-baselines.json` (58 records). Covered components: **8 of 144**. 8 < 89. |
| 2 | `grep -n 'continue-on-error' .github/workflows/*.yml \| grep -i visual \| wc -l` → 0 | **0 — passes** | **FAIL.** See **D136**: this check cannot fail. |
| 3 | `ls docs/…/reports/ \| grep -i chromatic` → packet exists | no match, exit 1 | **FAIL, correctly.** No Chromatic packet existed. |
| 4 | `npx tsx …/validators/capability-matrix.ts` output shows visual cells `pass`/`fail` for Tier B+ | validator exits 0 and prints **no visual line at all** | **FAIL.** See **D137**: this check cannot pass. |

### 0.1 Check 2 cannot fail honestly — new defect **D136**

`grep -i visual` is applied to `grep -n`'s output, which is **one line per
match**. The matching lines are:

```
.github/workflows/chromatic.yml:28:    continue-on-error: true
.github/workflows/ci.yml:531:        continue-on-error: true
.github/workflows/vue-next.yml:55:    continue-on-error: true
.github/workflows/vue-next.yml:120:    continue-on-error: true
```

None of them contains the string `visual`, and none ever could: the word lives
in the step **name** on the line above (`ci.yml:529 — Run visual snapshot tests
(Chromium, report-only)`) and in comment lines the first `grep` also matches but
which the second one then filters *out* for the same reason. So the pipeline
returns `0` whatever the workflows say, including on the state the check exists
to detect. **It passed today over a `continue-on-error: true` that is still
there**, which is exactly the failure mode D108/D116/D122/D124/D131 describe.

The check that would have worked is `grep -A3 -i 'visual' .github/workflows/ci.yml | grep -c 'continue-on-error'`,
or simply reading `ci.yml:528-533`.

### 0.2 Check 4 cannot pass honestly — new defect **D137**

Two independent reasons:

1. **There are no visual cells.** N1-O6 §4.2 *deliberately refused* to make
   `visual-baseline` an `EvidenceKind`; visual coverage is a per-row **field**
   whose states are `covered` / `not-covered` / `stale`. The strings `pass` and
   `fail` never appear in it. A check looking for `pass`/`fail` visual cells is
   looking for a shape the artifact does not have and will not have until the
   owner takes decision D4 — which this task's companion packet prepares but
   cannot take.
2. **The named command prints nothing about visual.** The histogram is emitted
   by `generate:capability-matrix`, not by `validate:capability-matrix`. Before
   this task, `validate:capability-matrix` output contained no occurrence of the
   word `visual` at all.

Reason 2 is now fixed (§7.2) — the validator reports the histogram, clearly
labelled as reporting and gating nothing. Reason 1 is an owner decision and is
**not** fixed, so check 4 still cannot pass, and should be rewritten as
*"…shows `covered`/`stale` for Tier B+"* once the platform question is settled.

**Registered as D136 and D137. This programme has now produced eight
done-checks that pass or throw for the wrong reason** (D108, D116, D122, D124,
D131, and these two — plus this task's check 1, which fails correctly but only
by accident of `wc -l` reading an error as zero).

---

## 1. What was measured before anything was edited

| fact | value at `2d51eec` | how |
|---|---|---|
| committed baseline PNGs | **58** — 34 `chromium-linux`, 24 `chromium-win32` | `find e2e/visual -name '*.png'` |
| ledger records | **58** (8 components × 2 themes, 4 fixtures × 2 themes, 34 screen-level) | `visual-baselines.json` |
| covered components | **8 of 144** | capability matrix `visual` field |
| `visual` state histogram | `covered 0 · stale 8 · not-covered 136` | `generate:capability-matrix` |
| matrix evidence cells | **1,662** over 144 rows | `capability-matrix.json` |
| Tier distribution | A 55 · B 67 · C 21 · D 1 | `targets.generated.ts` |
| **Tier B+ components** | **89**, of which **88 have a story** | same |
| full-scope snapshot count | **278** component + **8** fixture = **286** | 139 story-bearing components × 2 themes |
| stories in the built Storybook | **1,453** (+195 docs) = **2,906** Chromatic snapshots/build | `storybook-static/index.json` |
| `validate:visual-baselines` | **exit 0** | read directly from a file |
| `validate:capability-matrix` | **exit 0**, 22 stale cells | read directly from a file |

`scope.platform` is `win32`; `scope.ciPlatform` is `linux`;
`scope.platformDecision.authoritative` is **`linux`** (D126, TASK-R2-O1 §2.8).

---

## 2. The container-route probe — result and evidence

**Verdict: the container route WORKS, is fast, and is deterministic — and it
does NOT unblock the rollout.** Both halves of that sentence are measured.

Total probe time **well inside the 60-minute box**. Times measured inside the
container and read from its log: image pull **111 s**; probe A **41 s** total;
probe C **187 s**; probe D **198 s**. Probe B's script aborted its own
*reporting* step on an unsorted `join` (my helper's bug, under `set -o
pipefail`) before it printed a total, so no total is claimed for it — its
capture run is logged at **16.7 s** and the comparison was redone on the host.
Probes E and F were not individually timed.

### 2.0 Method, and what it did not touch

```
docker run --rm --ipc=host --shm-size=1g \
  -v <repo>:/src:ro \            # READ-ONLY. The host node_modules is never written.
  -v <scratchpad>/probe:/probe \ # probe inputs + outputs only
  mcr.microsoft.com/playwright:v1.61.1-noble
```

Inside, `/src/e2e` and `/src/apps/storybook/storybook-static` are **copied** to
`/work`, and `@playwright/test@1.61.1` is installed into `/work/node_modules` —
a container-local tree, never the host's. Staging **4 s**, install **3 s**
(3 packages; the browsers are already in the image at `/ms-playwright`).

Two substitutions, both stated because they are confounds:

- **`vite preview` → a 50-line static file server** (`server.mjs`). `vite preview`
  needs a node_modules this container deliberately does not have. The **bytes
  served are identical**; only the HTTP layer differs.
- **A probe config replacing `playwright.config.ts`**, identical in viewport,
  device, `workers: 1` and timeout, differing only in `testDir`, `webServer` and
  (for probes C–F) a 20 s per-test timeout so an undriveable story costs 20 s
  rather than 90 s.

Captures use the spec's **built-in `DZUP_VISUAL_PROBE` mode**, which writes raw
`element.screenshot()` bytes and compares nothing. It is the mode N1-O6 used for
its own determinism evidence. **No baseline was written, none accepted, none
replaced, and `visual:accept` was never run.**

### 2.1 Probe A — does a linux capture work at all?

**Yes.** Two cold runs, own server and own browser process each:

| run | snapshots | wall | result |
|---|---|---|---|
| A-1 | 24 | **17.4 s** | 24 passed |
| A-2 | 24 | **15.2 s** | 24 passed |

**Digest comparison A-1 vs A-2: 24 of 24 byte-identical.** `maxDiffPixels: 0` is
reachable on linux, exactly as N1-O6 measured it to be on win32.

### 2.2 Probe A′ — the platform delta, against the committed win32 set

This is the number D126 needed and nobody had.

```
n = 24   byte-identical linux vs win32: 0   same dimensions: 12
```

**Twelve of twenty-four are not comparable at any tolerance** — the rendered
element has a different *size*, so `toHaveScreenshot` fails on the size check
before any pixel is compared:

| snapshot | linux | win32 |
|---|---|---|
| `component-DzButton-{light,dark}` | 154×**124** | 154×**122** |
| `component-DzButtonGroup-…` | **272**×124 | **274**×122 |
| `component-DzFab-…` | 128×**136** | 128×**134** |
| `component-DzIconButton-…` | 116×**124** | 116×**122** |
| `component-DzSpeedDial-…` | 518×**240** | 518×**238** |
| `component-DzSplitButton-…` | **176**×124 | **174**×122 |

The other twelve are the same size and **none is pixel-identical**:

| snapshot | differing px | share | max Δ/channel |
|---|---|---|---|
| `DzCopyButton` light/dark | 269 / 271 | 2.04 % / 2.05 % | 204 / 234 |
| `DzToggleButton` light/dark | 767 / 765 | 3.79 % / 3.78 % | 204 / 234 |
| `fixture-text-stress-cjk` | 9,130 / 9,127 | **10.61 %** | 249 / 242 |
| `fixture-text-stress-combining-marks` | 8,575 / 8,610 | ~10.0 % | 249 / 242 |
| `fixture-text-stress-long-run-4096` | 6,653 / 6,653 | 7.73 % | 249 / 212 |
| `fixture-text-stress-pseudo-expansion-40` | 7,997 / 8,082 | ~9.35 % | 249 / 242 |

Median differing-pixel share **9.3 %**; max channel delta 204–249 out of 255,
i.e. near-total inversion on the pixels that differ, not antialiasing.

**Conclusion.** The 58 committed win32 PNGs are worth **nothing** as linux
baselines, and this is not a tolerance that could be bought — half of them
cannot be compared at all. D126's decision that `linux` is authoritative
therefore implies **a complete recapture**, exactly as recorded. Nunito Sans is
self-hosted in the build (8 `woff2` files), so this is not a missing-webfont
artefact: it is FreeType-versus-DirectWrite metrics plus a different *fallback*
face for the glyphs Nunito Sans does not carry — which is why the four stress
fixtures, whose whole purpose is non-Latin text, are the worst.

### 2.3 Probe B — **the finding that decides the task**

The stock image resolves `fc-match sans-serif` to **WenQuanYi Zen Hei** and has
**20 font families**. A GitHub `ubuntu-latest` runner is Ubuntu 24.04 with a
*larger* preinstalled set. `npx playwright install --with-deps chromium` — what
`ci.yml:523` runs — installs Playwright's font dependencies **on top of**
whatever the runner image already carries; it can never remove one. So the
runner's font set is a strict superset of, or at best equal to, this image's.

So: install two font packages a general-purpose CI image carries, in the same
image, same browser, same served bytes, and re-capture.

```
fonts BEFORE: 20 families   fc-match sans-serif → WenQuanYi Zen Hei
+ fonts-dejavu-core fonts-ubuntu
fonts AFTER:  27 families   fc-match sans-serif → DejaVu Sans
```

**Result: 20 of 24 snapshots changed. 10 of 24 changed *dimensions*.**

| snapshot | stock | + 2 font packages |
|---|---|---|
| `component-DzButton-…` | 154×124 | **160**×124 |
| `component-DzButtonGroup-…` | 272×124 | **288**×124 |
| `component-DzSpeedDial-…` | 518×240 | **528**×240 |
| `component-DzSplitButton-…` | 176×124 | **180**×124 |
| `component-DzToggleButton-…` | 166×122 | **170**×122 |
| `component-DzFab-…` | same size | 49 px differ (0.28 %) |
| the four stress fixtures | same size | **8.3 %–10.6 %** differ |
| `DzCopyButton`, `DzIconButton` (icon-only, no text) | — | **0 px — unchanged** |

Only the four icon-only snapshots survived. **`DzButton` is 6 px wider because
of two `apt` packages.**

**This is the blocker, and it is not about Windows.** A linux baseline captured
here is valid **only** inside this exact image. `ci.yml` does not run in a
container — it runs on a bare `ubuntu-latest` runner — so baselines captured by
this route would be rejected by CI on the first run, in the same way and for the
same reason as the win32 ones. Capturing 89 components' worth of linux pixels
today would have produced ~176 baselines that CI cannot reproduce, and a ledger
claiming linux authority for images no runner can make. **So the capture half
was stopped here.**

*What could not be measured from this machine:* the actual font set of a GitHub
`ubuntu-latest` runner. Measuring it needs a CI dispatch, which `<authority>`
withholds. The argument above does not depend on the exact list — it depends
only on the runner's set being **different**, and probe B shows that a
difference of **two packages** is enough.

### 2.4 Probe C — the runtime budget, measured at full scope

`scope.families` widened to all twelve **in the container-local copy only**
(the host ledger is read-only and unchanged), probe mode, one worker:

```
setup            5 s
scale run      182 s   →  286 passed, 5 skipped, 0 failed   (3.0 min)
captured       286 PNGs
```

**Every one of the 139 story-bearing components rendered.** Zero stories failed
to drive — including the ten `overlays` components N1-O6 §6.2 flagged as needing
spec work before capture. That concern is real but it is about *what state* is
captured (`DzSpeedDial` is captured closed), not about whether capture works.

The 5 skipped are the `test.fixme` entries for components with no story —
visible, not hidden, as `coverage.ts` intends.

### 2.5 Probe D — determinism at full scope, and the flaky stories

A second cold full-scope run, digest-compared against probe C:

```
scale2 run     191 s   →  286 passed, 5 skipped   (3.2 min)
RESULT: 283 of 286 byte-identical; 3 diverged
```

The three: `component-DzFloatLabel-{dark,light}` and `component-DzInplace-dark`.

### 2.6 Probe E — characterising them, because two runs is not a measurement

Six **cold** invocations over `DzFloatLabel` and `DzInplace` only:

```
component-DzFloatLabel-dark    distinct=2   d2e30e0a d2e30e0a d2e30e0a 1d3c949d 1d3c949d 1d3c949d
component-DzFloatLabel-light   distinct=2   5ea3196e c8902cc8 5ea3196e 5ea3196e 5ea3196e c8902cc8
component-DzInplace-dark       distinct=3   81bd5110 3f63d37d 3f63d37d 3f63d37d 3f63d37d 908bffab
component-DzInplace-light      distinct=2   4712b2db 4712b2db 07847097 07847097 07847097 07847097
```

**Four snapshots are flaky, not three.** Probe D missed `DzInplace-light`
because a two-valued flake agrees with itself about half the time.

> **Methodological finding, and it governs the rollout: a two-run comparison
> under-detects flakes. It missed 1 of 4 here.** Any family accepted on the
> strength of two agreeing runs is accepted on a coin toss. The rollout
> procedure in §5 requires **three** cold runs per family before acceptance.

**Magnitude** (probe C vs probe D):

| snapshot | differing px | share | bounding box |
|---|---|---|---|
| `DzFloatLabel-dark` | 103 | 0.29 % | x146–164 y80–88 (a 19×9 region) |
| `DzFloatLabel-light` | 868 | 2.44 % | x37–203 y61–104 |
| `DzInplace-dark` | **8,307** | **7.63 %** | x41–327 y40–255 — most of the canvas |

**Mechanism — named, not guessed.** Both canonical stories declare a `play()`
function, which Storybook runs after the story renders:

- `core-forms-dzinplace--text-field` — `play()` clicks the trigger, opens the
  editor and asserts the textbox `toHaveFocus()`. Three distinct images is a
  capture landing in display mode, mid-transition, or edit mode.
- `core-forms-dzfloatlabel--over-input` — `play()` drives focus to assert the
  label floats.

The lane calls `loadStoryCanvas(…, { waitForMainClass: false })`, and even
`sb-show-main` would not help: Storybook sets it when the story **renders**,
before `play()` has finished. Nothing in the lane waits for `play()`.

**Scope of the mechanism: 57 of the 139 canonical stories (41 %) declare
`play()`** — across every family, at every tier. Having one is necessary but not
sufficient for flakiness (pilot member `DzIconButton` has a `play()` and is
byte-stable, because its `play()` only asserts). But it means **41 % of the
rollout is exposed to a race nobody has closed**, and the two components where
it bit are both in `forms`, which is rollout rank 1.

**These four snapshots are excluded, with the reason above. Nothing was retried
into green.**

### 2.7 Probe F — what removing `continue-on-error` would actually do

Comparison mode (not probe mode) on linux, against the committed baselines:

```
exit 1
Error: A snapshot doesn't exist at …/component-DzButton-light-chromium-linux.png, writing actual.
Error: A snapshot doesn't exist at …/component-DzButton-dark-chromium-linux.png, writing actual.
… (24 of 24)
```

Playwright then wrote 24 files named `…-chromium-linux.png`, which is the
platform lock demonstrated rather than quoted.

**Measured, not derived: the per-component lane fails 24 of 24 on linux today.**
`package.json`'s `test:e2e:visual` also passes `--max-failures=1`, so in CI it
would abort on the first.

---

## 3. The CI gate — analysis and decision

### 3.1 The three `continue-on-error` sites, triaged

| file:line | what it guards | verdict |
|---|---|---|
| `.github/workflows/ci.yml:531` | step *"Run visual snapshot tests (Chromium, report-only)"* | **the one this task is about. LEFT IN PLACE, with the reason below.** |
| `.github/workflows/chromatic.yml:28` | the whole Chromatic job | **left.** It is a paid-service decision — the [Chromatic packet](./TASK-R2-O6-chromatic-finish-or-retire.md) prepares it. Removing it while the token is absent would make every PR red on a vendor call with an empty secret. |
| `.github/workflows/vue-next.yml:55,120` | both jobs in the forward-compat lane | **left, and not a candidate.** Its header (lines 11–21) says every job there is non-blocking **by design**: "a red result is a fact about an unreleased Vue, not a defect claim against this repository", and promotion is triggered by `vue@latest` reaching 3.6.x. Read before touching; nothing about this task changes that trigger. |

### 3.2 Decision: `ci.yml:531` stays, and here is the measured reason

`<ci_gate>` allows the flip **only** when the lane has run green three
consecutive times on the authoritative platform. That cannot be demonstrated,
for three independent reasons, any one of which is sufficient:

1. **It is not green once, let alone three times.** Probe F: 24 of 24 fail on
   linux today, because there are zero linux per-component baselines (§2.7).
2. **It cannot be made green by capturing, either.** Probe B: baselines captured
   in the container do not survive a font-set change, and `ci.yml` runs on a bare
   runner whose font set differs from the container's (§2.3). A capture would
   produce a lane that fails on its first CI run for a *new* reason.
3. **The lane is not deterministic at `maxDiffPixels: 0` across the full scope.**
   Probe E: 4 snapshots are multi-valued, and 41 % of canonical stories share
   the mechanism (§2.6).

Removing the line today would turn the `e2e` job red on the next push and keep
it red. **Leaving it is the honest action, and the reason is recorded here so
the next agent does not re-derive it.**

### 3.3 The precondition, and the exact patch that follows it

The flip is blocked on **one CI infrastructure change**: pin the visual lane's
rendering environment to the image the baselines were captured in.

```diff
   e2e:
     name: E2E Tests (Playwright)
     runs-on: ubuntu-latest
+    # The visual lane compares pixels, and pixels depend on the installed font
+    # set: TASK-R2-O6 measured 20 of 24 baselines changing — 10 of them changing
+    # DIMENSIONS — after `apt-get install fonts-dejavu-core fonts-ubuntu` inside
+    # one image. A baseline is evidence only in the environment it was captured
+    # in, so the gate must run in that environment, pinned by digest.
+    container:
+      image: mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48
     timeout-minutes: 45
```

with, afterwards and **only** after the lane is green three consecutive times on
`main` in that container:

```diff
       - name: Run visual snapshot tests (Chromium, report-only)
         id: visual
         timeout-minutes: 20
-        continue-on-error: true
         run: yarn test:e2e:visual --project=chromium --retries=0
```

**Neither diff is applied.** Pinning a container changes how every step in the
`e2e` job runs — the Node setup, the yarn cache, the corepack call and the
`--with-deps` install all behave differently inside it — and none of that can be
validated from this machine without a CI dispatch, which `<authority>` withholds.
This is precisely the `<stop_conditions>` clause *"when the platform choice needs
CI infrastructure the repo does not have"*, and it is raised as owner decision
**O6-D2** rather than half-applied.

### 3.4 One thing found while reading `ci.yml`

The `e2e` job builds Storybook **twice**: `test:e2e:functional` runs
`yarn storybook:build`, then `test:e2e:visual` runs
`DZUP_GALLERY=1 yarn storybook:build` again, because the screen-level specs need
the gallery stories and the per-component spec does not. At ~1–2 minutes a
build, that is a minute or two per CI run spent rebuilding a mostly identical
artifact. Noted, **not fixed** — it is a CI-shape change with the same
un-validatable-from-here problem as §3.3, and it belongs with that decision.

---

## 4. The rollout plan, with a measured budget

### 4.1 Runtime — measured, not extrapolated

| | snapshots | wall clock | per snapshot |
|---|---|---|---|
| pilot (`buttons` + 4 fixtures) | 24 | 17.4 s / 15.2 s / 16.7 s | 0.70 s |
| **pilot × 18, linearly extrapolated** | 432 | *(313 s)* | — |
| **full scope, MEASURED** | **286** | **182 s and 191 s** | **0.64–0.67 s** |
| Tier B+ only (88 components × 2) | 176 | **≈ 115 s** | derived from the measured rate |

The `<discovery>` step asked for pilot × 18. Doing it literally over-states the
cost by ~14 %: the lane scales slightly **sub**-linearly, because the one-off
server start and browser launch amortise. The measured full-scope number is the
one to plan with.

### 4.2 Sharding decision: **no sharding**

Full coverage of all 144 components costs **≈ 3.2 minutes** of test time. The
step it would live in already has `timeout-minutes: 20`. Sharding would add a
fresh checkout, a yarn install, a browser install and a Storybook build — several
minutes each — to parallelise three minutes of work. **The runtime is not the
constraint and should not be engineered as though it were.** Revisit only if
RTL or density are ever added to `scope` (a 2× or 4× multiplier), and re-measure
before deciding even then.

### 4.3 Rollout order — N1-O6 §6 re-checked against `<rollout_order>`

`<rollout_order>` says **Tier D → C → B → A**; N1-O6 §6 ranked by *where drift
actually happened*. They agree more than they look:

| wave | families | components | snapshots | why |
|---|---|---|---|---|
| **0** | `forms` **Tier D + C** (`DzFileUpload` D; 11 C) | 12 | 24 | `<rollout_order>`'s literal start. Smallest possible slice, highest tier weight, and it exercises the whole procedure once. |
| **1** | `forms` (rest) + `data` | 35 | 70 | N1-O6 rank 1–2. All of N1-O3's unreviewed V8/V1/V5 changes. **Contains both known flaky components** — budget for the `play()` work here. |
| **2** | `inputs` + `media` | 18 | 36 | N1-O6 rank 3–4. V6 `DzLightbox` unstyled→styled, the largest single visual change in the programme. |
| **3** | `navigation` + `layout` + `overlays` | 40 | 80 | N1-O6 rank 5–7. Overlays need the open-state decision (O6-D4) first. |
| **4** | `feedback` + `typography` + `cards` + `providers` | 31 | 60 | Tier-A-heavy. Cheap; catches token/font drift and little else. |

Waves 0–3 reach **105 components / 89 Tier B+** — the `<done_check>`'s target.

**Per-family procedure** (this is the part that changed as a result of probe E):

1. Run the family **three times cold** in probe mode. Any snapshot with more
   than one distinct digest is **excluded with the measured reason** and does
   **not** enter `scope`. Do not retry it.
2. Run the lane once in comparison mode; Playwright writes the missing baselines
   and fails, as it should.
3. **Review the 2N images as a set** — this is the work, and the only part that
   should be expensive.
4. One `visual:accept --bootstrap --by … --reason "<family> first capture,
   reviewed as a set at <commit>"`. `--bootstrap` adds only and can never
   re-accept a changed baseline, so a first capture is batchable and a *change*
   never is — which is exactly what the authority rule says.
5. `yarn generate:capability-matrix && yarn validate:visual-baselines`.

**Step 4 is an owner action.** `<rollout_order>` says prepare, do not run. This
task ran `visual:accept` **zero** times, on the pilot or anything else.

---

## 5. Coverage ratchet: **8 → 8 of 144. It did not move, deliberately.**

This is the headline and it is a `[~]`, not an `[x]`.

Three routes to moving it were available, and all three are dishonest at
`2d51eec`:

| route | why not |
|---|---|
| **capture on win32** (this machine) | `<determinism>` says baselines are captured **on the authoritative platform only**, and D126 says that is `linux`. It would add ~176 PNGs that CI rejects on its first run (§2.2, §2.7). |
| **capture in the container** | Probe B: those pixels are locked to one image's font set, and `ci.yml` does not use that image. It would trade a known-wrong platform for a subtly-wrong one, which is worse, because the first is visible in the ledger and the second is not (§2.3). |
| **widen `scope.families` without capturing** | `validate:visual-baselines` fails by design on a covered component missing a theme — correctly. It would turn `validate:all` red for a coverage number. |

**A coverage number captured on the wrong platform is not coverage.** The
ratchet stays at 8, the blocker is measured, and the unblocking act is one CI
change (§3.3) followed by ~3 minutes of capture and the review that is the real
cost.

### What *did* move

| ratchet | old | new |
|---|---|---|
| visual coverage | 8 of 144 | **8 of 144** (unchanged, §5) |
| measured platform delta | **unknown** | **measured**: 0/24 identical, 12/24 not comparable |
| linux determinism | **unmeasured** | **measured**: 24/24 identical over 2 cold runs; **283/286** at full scope |
| full-scope runtime | **estimated ≈ 4.5 min** (N1-O6 §6.1) | **measured 182 s / 191 s** |
| known flaky visual stories | **0 known** | **4 identified, characterised and excluded with a cause** |
| canonical stories with a `play()` race | **unknown** | **57 of 139 (41 %)** |
| capability-matrix coverage note | **over-reported 12 components** | **8 components + 4 fixtures, stated separately** (D138) |
| `validate:capability-matrix` visual reporting | **absent** | **present** (reporting only, gates nothing) |
| Chromatic snapshot volume | 2,880 at `51dec93` | **2,906 at `2d51eec`** |
| Chromatic decision inputs | volume only | volume + pricing + **repo is public/MIT → OSS plan may apply** |
| owner decision D4 (`EvidenceKind`) | named | **schema change written, counts computed (1,662 → 1,751)** |

---

## 6. The fifth capability-matrix input

N1-O6 already wired it: `visual` is a field on all 144 `CapabilityRow`s and
`visual-baselines` is an entry in `inputs`. TASK-R2-O1's §2.4 gates 5
(`browser-degradation`) and 6 (`browser-shape`) were read first and are
**untouched and unweakened** — this task added no gate and removed none, and no
cell was hand-edited anywhere.

Verified still working at `2d51eec`: histogram `covered 0 · stale 8 ·
not-covered 136`, all 8 pilot rows `stale` (their source moved in `a01965f`
after capture — a provenance claim, not a pixel one, per R2-O1 §3.4).

### 6.1 One correctness defect found and fixed — **D138**

`visualInputNote()` counted **stress-fixture records as components**:

```
before: "…families [buttons]: 12 component(s), light + dark, chromium/win32, ltr."
after:  "…families [buttons]: 8 component(s), light + dark, chromium/win32, ltr.
         4 stress fixture(s) also carry baselines over these families; a fixture
         is not a component and changes no row's `visual` state. …"
```

There are 8 covered components and 4 fixtures. N1-O6 §4.2 introduced the
`fixture:<id>` prefix *precisely* so that no capability row could match one, and
the per-component **join was always right** — only this sentence was not. It was
introduced when TASK-R5-O4 added fixtures under schema 1.1.0, and it is printed
on **every one of the 144 generated docs pages**, over-reporting visual coverage
by 50 %.

Fixed in `generate-capability-matrix.ts`; the generated chain was regenerated in
the documented order (capability → component-meta → llms → docs-pages). **Cell
counts, tier totals and the `visual` histogram are unchanged** — 1,662 cells,
22 stale, 441 unrun before and after — which is the check that the fix touched
the note and nothing else.

### 6.2 `validate:capability-matrix` now reports visual coverage

Closing half of D137 (§0.2):

```
  visual coverage (a per-row field, not a cell — it is in neither total above):
    covered 0 · stale 8 · not-covered 136 of 144
```

Deliberately labelled, deliberately **reporting**: it creates no violation and
cannot change the exit code. The generator's own histogram is unchanged.

---

## 7. Focused validation — every exit code read directly from a file, never through a pipe

| command | exit | result |
|---|---|---|
| `node …/tsx …/validators/capability-matrix.ts` (before edits) | **0** | fresh, 22 stale cells, **no visual line** |
| `node …/tsx …/validators/capability-matrix.ts` (after generator edit, before regen) | **1** | `[freshness] … is stale` — the edit detected, as designed |
| `yarn generate:capability-matrix` | **0** | `visual covered 0 · stale 8 · not-covered 136` |
| `yarn generate:component-meta` | **0** | 209 components, 0 unclassifiable |
| `yarn generate:llms` | **0** | 209 components |
| `yarn generate:docs-pages` | **0** | 1,662 cells over 144 components — 441 unrun, 22 stale, 17 excepted |
| `node …/eslint …/capability-matrix.ts …/generate-capability-matrix.ts` | **0** | clean |
| `node …/tsx …/validators/capability-matrix.ts` (final) | **0** | fresh, visual line present |
| **`yarn validate:all` (first run)** | **1** | **one `prefer-template` lint error in this task's own edit** — found, fixed |
| **`yarn validate:all` (final)** | **0** | **the whole 44-link chain green, read from `validate-all-2.log`, never through a pipe** |

Container probes (exit codes from the container log, read from a file):
A exit 0 · B run exit 0 (the *script* exited 1 on an unsorted `join` in its own
reporting step — a bug in my comparison helper, not in the run; redone on the
host) · C exit 0 · D exit 0 · E exit 0 · F **exit 1, which is the finding**.

---

## 8. Aggregate qualification

`yarn validate:all` — **the chain was received green (TASK-R2-O7 closed the last
red link today) and is handed back green.** The one red it showed mid-task was
this task's own lint error, fixed before the final run. See §7.

**Inherited reds, re-stated and NOT touched** (each pre-existing at `2d51eec`,
none caused or fixed here):

| lane | state | note |
|---|---|---|
| `yarn test` | 3 failed / 10,230 passed | cited, not re-run |
| `eslint e2e/` | 9 errors | D6 from N1-O6; `e2e/` is outside `yarn lint`'s target |
| `packages/tooling` tsc | 17 | cited, not re-run |
| `storybook:test` | 1,451 / 1,453 | cited, not re-run |
| `storybook:build` | **25.02 MB against a 25 MB budget (D130)** | **not raised, not touched.** Relevant here: a visual rollout adds **no** bytes to the Storybook bundle (baselines are PNGs in `e2e/`, not in the build), but it does add ~176 PNGs to the *repository*. At the pilot's mean of ~3.5 KB per component PNG that is well under a megabyte — but nobody should assume it; measure at wave 1. |
| 20 of 22 `size:*` budgets | breached (D135) | cited, not touched |

---

## 9. Owner decisions raised

| # | decision | evidence | options | recommendation |
|---|---|---|---|---|
| **O6-D1** | **Chromatic: finish or retire.** | [packet](./TASK-R2-O6-chromatic-finish-or-retire.md). 2,906 snapshots/build; free commercial tier is 5,000/month ≈ 1.7 builds; repo is **public + MIT**. | (a) apply for the OSS plan → finish · (b) pay ~$149/mo → finish · (c) delete the workflow and the dependency | **Apply for the OSS plan first, then decide on the answer.** Granted → FINISH (it discharges the environment problem §2.3 by construction). Refused → RETIRE. Do not leave it as it is. |
| **O6-D2** 🔴 | **Pin the visual lane's CI container.** | §2.3 — 20 of 24 baselines change, 10 of them dimensionally, from two `apt` packages. §2.7 — the lane fails 24/24 on linux today. | (a) add `container:` to the `e2e` job (diff in §3.3) and capture in that image · (b) split a dedicated `visual` job with the container · (c) accept the lane as developer-local forever and delete the CI step | **(b).** (a) changes how every step in `e2e` runs; a dedicated job keeps the blast radius to the lane and makes the pin self-documenting. **This is the one decision the whole rollout waits on.** |
| **O6-D3** | **Close the `play()` race before rolling out.** | §2.6 — 4 flaky snapshots, 57 of 139 canonical stories (41 %) declare `play()`. | (a) wait for Storybook's story-finished signal before screenshotting (a spec change; `sb-show-main` is **not** it) · (b) declare a play-free variant story per affected component in the ledger · (c) exclude every `play()` story — loses 41 % of coverage | **(a), with (b) where a component's only story is an interaction.** Not implemented here: it is a spec change that needs its own determinism evidence, and doing it inside this task would have mixed an unvalidated change into a measurement. |
| **O6-D4** | **What state is an overlay captured in?** | §2.4 — all ten `overlays` components render, so this is a *design* question, not a blocker. `DzSpeedDial` is captured closed today. | (a) capture as the canonical story renders (closed) · (b) add a pre-shot step that opens it · (c) both, as two snapshots | Unchanged from N1-O6 §6.2 — decide **once**, before wave 3, not per family. |
| **O6-D5** | **Promote `visual-baseline` to an `EvidenceKind`?** | [packet](./TASK-R2-O6-evidence-kind-proposal.md). 1,662 → 1,751 cells; 82 `unrun` on day one; `@dzup-ui/contracts` 0.1.0 → 0.2.0 `minor`. | (a) promote now · (b) promote **with** O6-D2 · (c) leave it a field | **(b).** A `visual-baseline` cell reading `pass` on a platform CI does not run is a collapsed maturity level. Promote when the platform is settled — and **only** if the rollout is funded; otherwise (c). |
| **O6-D6** | **The 34 grandfathered screen-level baselines.** | N1-O6 D5, unchanged. They are `chromium-linux`, from `b550403`/`cfd4835`/`078c1dd`/`fd5dd49`, and **this task did not verify them** (§10). | (a) re-verify in the pinned container and re-accept or fix · (b) accept that their origin is permanently unknown | **(a), as the first act after O6-D2** — they are the only `linux` baselines in the repository and they are the cheapest possible test of the pinned container. |

---

## 10. What this task deliberately did **not** do

Stated so nothing is inferred from a green gate or a written packet.

- **It captured no baseline.** Every container run used `DZUP_VISUAL_PROBE`,
  which writes raw bytes to a scratchpad and compares nothing. The 58 committed
  PNGs are byte-identical to their state at task start.
- **It never ran `visual:accept`** — not on `buttons`, not on anything.
- **It did not widen `scope.families`.** The only widening was inside a
  container-local *copy* of the ledger, in a read-only mount, for measurement.
- **It did not remove any `continue-on-error`,** and it did not edit
  `ci.yml`, `chromatic.yml` or `vue-next.yml`. The §3.3 diffs are proposals.
- **It did not verify the 34 screen-level `chromium-linux` baselines.** Doing so
  needs a `DZUP_GALLERY=1` Storybook build, and the answer would not change the
  recommendation: those baselines were captured on *some* linux, not
  necessarily this image, so a pass would not be transferable either. Raised as
  O6-D6 instead of half-measured.
- **It did not measure a real GitHub `ubuntu-latest` runner.** That needs a CI
  dispatch. §2.3's argument is built so it does not depend on the runner's exact
  font list.
- **It did not fix the `play()` race** (O6-D3) or decide overlay capture state
  (O6-D4).
- **It did not promote `visual-baseline`** or touch
  `packages/contracts/src/quality-tiers.ts`.
- **It did not touch gates 5 or 6**, `known-failures.json`,
  `engine-exceptions.json`, `engine-ratchets.json`, any baseline PNG, any AT
  cell, or any of the ~445 dirty paths belonging to R2-O1/O2/O3/O4/O5/O7 and
  R3/R5.
- **It did not commit, push, dispatch CI, publish or deploy.**
- **It did not fix the inherited reds** in §8.

## 11. Files

**New (3), all reports:**

| path | what |
|---|---|
| `docs/program-2026-09-04/reports/TASK-R2-O6-handoff.md` | this file |
| `docs/program-2026-09-04/reports/TASK-R2-O6-chromatic-finish-or-retire.md` | owner packet, O6-D1 |
| `docs/program-2026-09-04/reports/TASK-R2-O6-evidence-kind-proposal.md` | owner packet, O6-D5 |

**Modified (2 source + the regenerated chain):**

| path | change |
|---|---|
| `packages/tooling/src/quality/generate-capability-matrix.ts` | `visualInputNote()` no longer counts `fixture:*` records as components, and names them separately (D138) |
| `packages/tooling/src/validators/capability-matrix.ts` | reports the visual-coverage histogram; creates no violation, changes no exit code |
| `packages/core/docs/capability-matrix.json` · `component-meta.json` · `llms.txt` · `llms-full.txt` · `apps/docs/**` · `apps/docs/.vitepress/generated/nav.json` | regenerated in the documented order, for the note change only |

**Not modified:** every `.github/workflows/*.yml`, every baseline PNG,
`e2e/visual/visual-baselines.json`, `packages/contracts/src/quality-tiers.ts`,
and everything else in the dirty tree.

---

## 12. Ranked next packet

| rank | packet | why |
|---|---|---|
| **1** | **O6-D2 — pin the visual lane's container in CI.** | Everything else in this lane waits on it. It is one `container:` key, and until it lands, *no* baseline anyone captures anywhere is CI evidence. |
| **2** | **O6-D6 — re-verify the 34 screen-level baselines in that container.** | The cheapest possible test of rank 1, using baselines the repo already has, and it closes the oldest open item in the visual ledger. |
| **3** | **O6-D3 — close the `play()` race.** | 41 % of the rollout is exposed to it, and the two measured offenders are both in wave 1. Doing it after wave 1 means re-reviewing wave 1's images. |
| **4** | **Wave 0 + wave 1 capture (47 components, 94 snapshots), paired with N1-O3's design review (D7).** | ~3 minutes of running, roughly one working day of *looking*, and it is where all six unreviewed geometry changes live. |
| **5** | **O6-D1 — Chromatic OSS application.** | Independent of 1–4 and may make them optional. Cheap to ask. |
| **6** | **O6-D5 — the `EvidenceKind` promotion**, once 1–4 have landed. | Bookkeeping with real consequences; promoting before the capture creates 82 permanent reds. |
| **7** | **Rewrite this task's `<done_check>`** (D136, D137) before anyone re-runs it. | Check 2 passes over the condition it exists to detect; check 4 cannot pass. A check-first protocol is only as good as its checks. |
