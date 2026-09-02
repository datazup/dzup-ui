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
| **per-component** | `component-baselines.spec.ts` | every component in an opted-in **family**, light + dark | 16, `chromium-win32` (pilot: `buttons`) |

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

## Baselines are platform-locked. This is not a bug

Playwright writes `{arg}-{project}-{platform}.png`. A Linux baseline and a
Windows baseline are **different files** and are never compared to each other,
because font rasterisation genuinely differs between them. So "which platform is
authoritative" is a decision somebody makes, and it is recorded as
`scope.platform`.

Right now `scope.platform` is `win32` and `scope.ciPlatform` is `linux`. They
disagree, and `validate:visual-baselines` says so on every run. Until one accept
pass is made on Linux, **the per-component lane is developer-local evidence and
cannot fail a CI run.**

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
