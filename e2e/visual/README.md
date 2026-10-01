# Visual regression — scope, review workflow, and the authority rule

> TASK-N1-O6. The decision and its reasoning are in
> [`docs/program-2026-09/reports/N1-O6-visual-regression-memo.md`](../../docs/program-2026-09/reports/N1-O6-visual-regression-memo.md);
> what was built and measured is in the companion handoff. This file is the
> operating manual, and it lives next to the config on purpose.

## The three lanes in this directory

| lane | spec | what it snapshots | baselines |
|---|---|---|---|
| screen-level | `gallery.spec.ts` | 8 demo screens × light/dark | 16, `chromium-linux` |
| theme recipes | `theme-recipe-matrix.spec.ts` | 2 screens × 9 theme/density/direction/motion cases | 18, `chromium-linux` |
| **per-component** | `component-baselines.spec.ts` | every component in an opted-in **family**, light + dark — plus declared **stress fixtures** over those families | 16 + 8 fixture, `chromium-linux` (pilot: `buttons`) |

The first two answer "does the composition still look right". Only the third
answers "which component moved", which is the question TASK-N1-O3 had to answer
by hand after changing geometry on 24 components.

## Scope is declared, not discovered

`visual-baselines.json` → `scope.families` is the whole scope. Everything else
follows from it:

- `coverage.ts` joins those families against `e2e/matrix/targets.generated.ts`,
  so a component covered here is driven through the **same story** the browser
  matrix drives it through, and a component added to a covered family is covered
  the moment `generate:matrix-targets` runs. Nobody maintains a component list.
- `generate-capability-matrix.ts` performs the same join against the quality
  matrix, so every component outside the scope reads **`not-covered`** — a
  declared gap with a rollout rank, never `unknown`.
- `validate:visual-baselines` fails if a component *inside* the scope is missing
  a theme, so widening `scope.families` without capturing the baselines breaks
  the build rather than quietly covering nothing.

To widen the scope: add the family, run `visual:accept` once per component per
theme, regenerate the capability matrix.

### Stress fixtures (schema 1.1.0, TASK-R5-O4)

`scope.fixtures` declares stories that render a covered family's text-bearing
components under text English never produces — today four, over `buttons`:
CJK, combining marks, a 4,096-character run and +40 % pseudo expansion
(`packages/core/stories/compositions/i18n/TextStress.stories.ts`). Each owes every
theme, is recorded as `component: "fixture:<id>"` (a name no capability-matrix
row can match, so fixtures never change a component's `visual` cell), and is
accepted one snapshot at a time exactly like a component:

```bash
yarn visual:accept --fixture text-stress-cjk --theme light --by "<name>" --reason "<why>"
```

A fixture over a family that is not in `scope.families` fails the gate — it
would be a declaration nothing drives. The first captures record **current**
behaviour, including a finding rather than a pass: button labels neither wrap
nor truncate, so CJK, combining-mark and 4,096-character labels overflow a
16rem container.

## Baselines are platform-locked. This is not a bug

Playwright writes `{arg}-{project}-{platform}.png`. A Linux baseline and a
Windows baseline are **different files** and are never compared to each other,
because font rasterisation, subpixel antialiasing and scrollbar metrics
genuinely differ between them. So "which platform is authoritative" is a
decision somebody makes.

### The decision: `linux` (TASK-S1-O3)

`scope.authoritativePlatform` is **`linux`**, and the reasoning, evidence and
owner action sit next to it in `scope.platformAuthority`. Short version: 18 of
18 jobs across `.github/workflows/` are `runs-on: ubuntu-latest`, there is no
Windows or macOS runner anywhere, and since the 2026-09-26 recapture all 58
accepted baselines are `chromium-linux`. A baseline captured for a platform
no runner has cannot gate anything.

### One authority, three lanes

The platform is declared **per lane**, in `lanes[]`, because the lanes did not
agree when this was written and one global could only ever describe one of them:

| lane | `capturedOn` | `role` | can fail CI? |
|---|---|---|---|
| `gallery` | `linux` | `gate` | yes |
| `theme-recipe` | `linux` | `gate` | yes |
| `component-baselines` | `linux` | `gate` | yes — promoted 2026-09-26 (O6-D2 b), recorded at the merge of 2026-10-01 |

A `gate` lane whose `capturedOn` is not `scope.authoritativePlatform` is a hard
`validate:visual-baselines` error: it could never pass wherever it ran.

### What happens on the wrong platform

**It refuses. Once, by name — it does not diff and it does not capture.**

```
$ yarn test:e2e:visual            # on win32
✗ visual:platform — 2 lane(s) refused: gallery, theme-recipe

visual: baselines for lane `gallery` are authoritative on "linux"; this run is
on "win32". Re-run on linux, or re-declare the authoritative platform in
e2e/visual/visual-baselines.json (owner action).
```

This matters more than it looks. Playwright's default answer to a missing
baseline is to **write** one — so before TASK-S1-O3, one `yarn test:e2e:visual`
on a developer's Windows machine would have written 34 new unattributed
baselines and called itself a verification run. Three things now prevent it:

1. **`yarn visual:platform`** (`e2e/visual/preflight-platform.ts`) runs first in
   both lane scripts, before the tokens build, the Storybook build and the
   browser. Exit 1 with one message, ~1 second.
2. **`guardVisualLane`** (`e2e/visual/platform-guard.ts`) is the backstop for
   `playwright test e2e/visual` invoked directly. A refusing lane registers
   **no snapshot tests at all**, and a process-scope singleton registers exactly
   **one** refusal however many lanes refuse.
3. **`updateSnapshots: 'none'`** in `playwright.config.ts` — a missing baseline
   fails, writing nothing, even on the right platform.

Run `yarn visual:platform` on its own any time to see where you are.

## Capturing and accepting baselines — inside the CI image

Since 2026-09-26 `scope.platform` and `scope.ciPlatform` are both `linux`, and
"linux" means one exact environment: the Playwright image the CI `visual` job
runs in, pinned by digest in `.github/workflows/ci.yml`. A bare Linux host is
not enough. Two apt font packages changed 20 of 24 baselines in the TASK-R2-O6
probes, 10 of them in size. So **capture and accept inside that image**, with
the repository mounted at its own path:

```bash
docker run --rm --ipc=host -u "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "$PWD:$PWD" -w "$PWD" <the image@digest from ci.yml> bash -c \
  'mkdir -p /tmp/bin && corepack enable --install-directory /tmp/bin \
   && PATH=/tmp/bin:$PATH yarn visual:accept --component … --theme … --by … --reason …'
```

Build Storybook first (`DZUP_GALLERY=1 yarn storybook:build`); the bytes it
serves do not depend on the host. From a linked worktree, also mount the owning
repository's `.git` so the tool can read the capture commit.

## The authority rule

> **A baseline changes only by an explicit act, with a named author and a stated
> cause. There is no bulk path.**

This mirrors the perf lane's downward ratchet. A perf threshold may only move in
one direction, and moving it costs a number. A visual baseline has no direction
to ratchet along — a different image is not "worse" — so the equivalent
constraint is *cardinality plus attribution*: one snapshot per invocation, and
neither `--by` nor `--reason` is optional. Sixteen changed baselines cost sixteen
invocations and sixteen sentences. That is the design, not friction to be
optimised away: the cost of accepting should scale with how much changed, which
is exactly what `--update-snapshots` destroys.

It is enforced in three places that fail for different reasons:

1. **`authority.ts`, inside the run.** `--update-snapshots` with no snapshot
   named throws on the first test it reaches. Naming one and reaching a second
   also throws.
2. **`validate:visual-baselines`, with no browser.** Every committed PNG must
   match the SHA-256 in the ledger. A changed digest with no new acceptance is an
   error; so is a PNG with no ledger entry at all. This is the one that catches a
   baseline edited around the guard — including by a Playwright version that
   changes its PNG encoder. It runs inside `yarn validate:all`.
3. **`yarn test:e2e:update` is gone.** It used to be
   `playwright test --update-snapshots`. It now prints this workflow and exits 1.

Neither control is sufficient alone. The guard is bypassed by writing the PNG by
hand; the digest gate is satisfied by anyone willing to run the accept tool
without looking at the diff — which is why the tool records *who* and *why*
rather than only re-digesting.

## Review workflow

**1. See what changed.**

```bash
yarn storybook:build                 # the lane runs against the static build
yarn test:e2e:visual:pilot           # per-component lane
yarn test:e2e:visual                 # screen-level lanes (needs DZUP_GALLERY=1)
```

A failure writes `-expected`, `-actual` and `-diff` PNGs into the Playwright
output directory and names all three in the error. Look at the diff before doing
anything else.

**2. Decide which kind of change it is.**

| the diff is | do |
|---|---|
| an unintended regression | fix the component. Do not accept the baseline. |
| an intended product change | accept it, once per snapshot, with the reason |
| environment drift (a new Playwright, a different host) | **stop.** Accepting hides it. Record it, and see the memo's determinism section. |

**3. Accept, one snapshot at a time.**

```bash
yarn visual:accept --component DzButton --theme dark \
  --by "<name>" \
  --reason "<what changed in the product, and why the new image is correct>"
```

The reason must be at least 24 characters and must not be one of the placeholder
words (`update`, `fix`, `wip`, `chore`, …). It is stored beside the digest, the
capture commit, the dirty-worktree flag and the digest it replaced, so the next
person reading the ledger can tell what happened without reading the diff again.

`--record-only` re-digests an image already on disk without running a browser.
`--bootstrap` records baselines that have **no** entry yet; it can never
re-accept one whose digest already disagrees, so it cannot launder a change.

**4. Regenerate the matrix.**

```bash
yarn generate:capability-matrix
yarn validate:visual-baselines
```

### Who may accept, and where the acceptance is recorded

| question | answer |
|---|---|
| **who may accept** | The repository owner, or a maintainer the owner has named. **No agent, in any programme, may capture or replace a baseline** — it is withheld by the `<authority>` block every prompt carries. An agent may build the mechanism, prove the refusal, and write the command down. |
| **where it is recorded** | `e2e/visual/visual-baselines.json` → the baseline's entry: `acceptedBy`, `acceptedAt`, `reason` (24+ chars, no placeholder words), `sourceCommit`, `worktreeDirty`, and `replaces` (the digest this image superseded). The ledger is the record; there is no second place to look. |
| **what a reviewer sees** | The `-expected` / `-actual` / `-diff` PNGs in the Playwright output directory, all three named in the failure. Then the ledger entry that explains why the new image is correct. |
| **how it is enforced** | `authority.ts` in-run (one snapshot per invocation, `--by` and `--reason` required, no bulk path), `validate:visual-baselines` out-of-run (digest, orphan, attribution, coverage, lane-platform), and `updateSnapshots: 'none'` under both. |

**Known gap:** `yarn visual:accept` addresses `--component` and `--fixture` in
the **per-component lane only**. The 34 screen-level baselines predate the
authority rule and were committed by hand, so they have no per-snapshot
acceptance path — their digests are gated, but a change to one is accepted by
committing the file. That asymmetry is raised as owner decision **D-S1O3-2** in
`docs/program-2026-09-22-architecture/reports/TASK-S1-O3-handoff.md`.

## Threshold

The per-component lane runs at `maxDiffPixels: 0`. The screen-level lanes run at
`maxDiffPixelRatio: 0.01`, which on a 154 × 122 button canvas is 187 pixels —
enough to lose a glyph. Determinism was measured before the threshold was
chosen: three cold runs plus the acceptance capture produced **byte-identical**
PNGs for all 16 pilot snapshots, so zero tolerance is reachable on this host and
anything looser would be a tolerance nobody had to buy.

If a snapshot becomes flaky, the answer is to find the source (a font that has
not loaded, an animation that is not disabled, a caret, a date in a fixture) and
fix it. Raising the tolerance past 0.1 % requires an entry in the memo saying
what was measured and why.
