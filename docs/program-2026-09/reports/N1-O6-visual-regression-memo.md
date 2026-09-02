# TASK-N1-O6 — Visual regression: options, and the recommendation

> **Decision memo.** Written before the implementation, revised once with the
> numbers the implementation measured (the determinism section and §5 are
> measurement, not estimate). The implementation and its evidence are in the
> companion [handoff](./N1-O6-visual-regression-handoff.md).
>
> Bound to `ui/dzup-ui` `main` @ `51dec93`, worktree **dirty** (104 changed
> paths across N0-05, N1-O1, N1-O2, N1-O3 and this task). Every number below is
> **locally qualified, worktree-dirty — not CI, release or production
> evidence.** Node v24.14.1 · Yarn 4.16.0 (via corepack) · Playwright 1.61.1 ·
> chromium 149.0.7827.55 · Windows 11, `win32`.

---

## 1. What is actually here today, before choosing anything

The task brief calls the existing state "2 specs with committed snapshots". That
is true and it is not the interesting part. Four facts found by reading the repo
change what the decision is about:

| # | fact | where |
|---|---|---|
| **A** | **The visual lane is already in CI and is already `continue-on-error: true`.** `yarn test:e2e:visual --project=chromium --retries=0` runs in the `e2e` job, marked *"report-only"*, so **a visual regression cannot fail a build today.** | `.github/workflows/ci.yml:528-533` |
| **B** | **Chromatic is already wired.** `apps/storybook` carries `chromatic ^11.0.0` and a `chromatic` script; `.github/workflows/chromatic.yml` runs `chromaui/action@latest` with TurboSnap; `preview.ts` defines `chromatic.modes` for light and dark. It is `continue-on-error: true` **and** `exitZeroOnChanges: true`, and it needs `secrets.CHROMATIC_PROJECT_TOKEN`, which is not in the repository. | `chromatic.yml`, `apps/storybook/.storybook/preview.ts:346-352` |
| **C** | **The 34 committed baselines have no recorded origin.** No ledger, no author, no reason, no capture commit. `yarn test:e2e:update` was `playwright test --update-snapshots` — one command that rewrote all 34 anonymously. | `e2e/visual/*-snapshots/`, `package.json` |
| **D** | **Baselines are platform-locked and every committed one is `chromium-linux`.** Playwright writes `{arg}-{project}-{platform}.png`. On this Windows host the same assertion writes `-chromium-win32.png` — a *different file*, never compared to the Linux one. | measured; `e2e/visual/` file names |

So the repository does not have "no visual regression". It has **two**
visual-regression systems, both configured never to fail, and **no authority
model for either**. That reframes the problem: the missing thing is not a
comparator. Playwright's comparator works. The missing thing is a reason to
believe a green run means anything, and that is a governance artifact, not a
tool.

This is worth stating plainly because it is the exact failure the task's
motivation describes from the other end: TASK-N1-O3 changed geometry on 24
components and **no gate caught any of it** — not because no comparator existed,
but because the comparator that existed covered eight demo screens at a 1 %
tolerance, ran report-only, and had baselines anyone could rewrite in one
command.

---

## 2. Option 1 — Chromatic

**What it is.** Hosted Storybook snapshotting. Uploads the built Storybook,
renders every story in its own Linux containers, diffs against the last accepted
build, and presents a review UI where a named human clicks *Accept*.

**For**

- It is the only option that solves **C** properly. Acceptance is a person, in a
  UI, against a visible diff, recorded server-side. That is the authority model
  this repo lacks, bought rather than built.
- It solves **D** by construction — one rendering environment, no
  Mac-vs-Linux-vs-Windows baseline problem. `chromatic.yml`'s own header comment
  says exactly this, and it was right.
- Already configured. Turning it on is a token, not a project.
- TurboSnap keeps per-PR cost proportional to the diff.
- Light and dark modes are already declared in `preview.ts`.

**Against**

- **It is a paid service and the decision is not an agent's.** `[!owner]`
- **Volume.** The built Storybook has **1,440 stories** (plus 195 docs entries).
  At the two declared modes that is **2,880 snapshots per full build**. TurboSnap
  reduces the steady state, but a dependency bump or a token change touches
  everything, and the OSS tier that would have to absorb that is the question the
  owner has to price.
- The evidence lives off-repository. Everything else in this program is a
  committed artifact bound to a commit (`<evidence_rules>`); a Chromatic build
  URL is not, and the capability matrix cannot join against it without a network
  call.
- It snapshots *stories*, and the repository's unit of evidence is the
  *component*. 1,440 stories over 144 components means the matrix would have to
  reduce ~10 story results into one component state with rules nobody has
  written.

## 3. Option 2 — Argos

**What it is.** The same shape as Chromatic — hosted diffing and a review UI —
but consuming Playwright screenshots rather than driving Storybook itself, with
an OSS free tier.

**For**

- Keeps the *capture* in Playwright, so the lane stays in-repo and the scope
  stays ours; only the diffing and the approval move out.
- Cheaper for OSS, and the review UI is the piece that is genuinely hard to
  build.

**Against**

- Still a paid/account decision. `[!owner]`
- Adds a second reporting integration to a repository that already has one
  configured-and-unused (**B**). Two half-wired hosted services is worse than
  one, and the honest first move is to finish or retire Chromatic, not to add a
  third system beside it.
- Baselines still live off-repository, with the same `<evidence_rules>` problem.

## 4. Option 3 — self-hosted Playwright `toHaveScreenshot()`

**For**

- Zero new dependencies, zero services, zero accounts. It is `playwright.config.ts`
  and two specs that already exist — `<validation>`'s "do not build second
  machinery" is satisfied literally.
- Baselines are committed files bound to a commit, which is what the rest of this
  program's evidence is.
- Per-component scoping is free: `e2e/matrix/targets.generated.ts` already picks
  one canonical story per component for the browser matrix, so the visual lane can
  drive **the same component in the same state** and a visual diff can be read
  next to a matrix cell.
- The capability matrix can join against it with `readFileSync`.

**Against**

- **It has no authority model at all.** `--update-snapshots` and a green run are
  indistinguishable from "nothing changed". This is the real gap, and it must be
  built rather than assumed.
- Platform-locked baselines (**D**) become the team's problem, not the vendor's.
- No review UI. The diff is three PNGs in an output directory.

---

## 5. Determinism — measured, not assumed

The task's stop condition names Windows font rasterisation as a real risk. It was
measured before the threshold was chosen, not after.

**Method.** The pilot spec has a probe mode (`DZUP_VISUAL_PROBE=<dir>`) that
writes the raw `element.screenshot()` bytes instead of comparing them. Three
**cold** runs — each with its own `vite preview` server and its own browser
process — wrote 16 PNGs each. Then the acceptance pass captured a fourth set
through the normal `toHaveScreenshot` write path.

**Result.**

| runs | snapshots | SHA-256 collisions |
|---|---|---|
| probe 1 / 2 / 3 | 16 each | **16/16 identical across all three** |
| acceptance capture (4th) | 16 | **16/16 identical to the probes** |

64 captures, one digest per snapshot, zero divergence. Two full Storybook
rebuilds later (see the handoff's perturbation experiment) the same baselines
still matched at `maxDiffPixels: 0`.

**Verdict: no nondeterminism was found on this host.** That is a statement about
*one* host. What is genuinely non-portable is **D**: the digests above are
`win32` digests and would not match a Linux capture of the same component. The
platform lock is not flakiness — it is a fact of the format, and the answer is to
name the authoritative platform rather than to widen a tolerance until two
platforms agree.

**Threshold.** Because determinism is exact, the per-component lane runs at
`maxDiffPixels: 0`. The existing screen-level lanes run at
`maxDiffPixelRatio: 0.01`, which on the measured 154 × 122 `DzButton` canvas is
**187 pixels** — enough to lose a glyph. No tolerance above zero was bought,
so the stop condition about loosening past 0.1 % never engaged.

---

## 6. Recommendation

**Self-hosted Playwright, per-component story snapshots, scoped by family, with
a committed acceptance ledger as the authority model. Chromatic stays `[!owner]`.**

Four reasons, in order of weight.

1. **The missing piece is authority, and authority is buildable here.** Chromatic
   and Argos are worth their price for the *review UI*, which is genuinely hard.
   But the rule this task is asked to enforce — *a changed baseline needs a stated
   cause, and a bulk update must be impossible* — is a digest ledger and a guard,
   and it took two files. Buying a service to get a rule you can write is the
   wrong trade; buying it to get a review UI is a real one, and that decision can
   be made later on top of this work rather than instead of it.

2. **Per-component, not per-surface.** The failure that motivated this task was
   per-component: 24 components moved, six visibly, and the screen-level lane
   could not have named one of them. `targets.generated.ts` makes per-component
   scoping nearly free and keeps the visual lane and the browser matrix pointed at
   the same story. Per-surface stays — the two existing specs are not replaced,
   because compositions catch integration drift a component snapshot never sees.

3. **Committed evidence is what this program deals in.** `<evidence_rules>`
   requires a metric to be bound to a commit. A PNG plus a ledger entry naming its
   capture commit satisfies that; a Chromatic build URL does not.

4. **Adding a third system to two unfinished ones is the wrong move.** Fact **B**
   means the honest sequence is: build the in-repo lane that costs nothing, then
   let the owner decide whether Chromatic is finished or retired — with the
   volume number (2,880 snapshots/build) in hand.

**Pilot: `buttons`.** The task suggests it and the data agrees — 8 components,
all with stories, 16 snapshots, and every one of them a composition target for
`DzButtonGroup`, `DzSplitButton` and `DzSpeedDial`, so the fan-out behaviour of
the lane is testable inside the pilot itself. It is not the family with the most
churn; that is the point of a pilot.

**Themes and directions: light + dark, LTR, chromium, one viewport.** The task's
stated floor, taken as the floor and not exceeded. RTL and density are already
covered per-surface by `theme-recipe-matrix.spec.ts`'s nine-case array;
duplicating them per component would quadruple 288 snapshots to prove what the
recipe matrix proves once, and the rollout section of the handoff says when that
becomes worth revisiting.

---

## 7. Recorded decisions and non-decisions

| # | decision | status |
|---|---|---|
| 1 | Self-hosted Playwright, in-repo baselines | **decided, implemented** |
| 2 | Per-component story snapshots scoped by family; screen-level lanes retained | **decided, implemented** |
| 3 | `maxDiffPixels: 0`, justified by measured byte-identity | **decided, implemented** |
| 4 | Acceptance ledger + in-run guard + `test:e2e:update` removed | **decided, implemented** |
| 5 | **Chromatic: finish it (buy a token, make it blocking) or retire it** | **`[!owner]` — a paid-service decision. Volume: 2,880 snapshots per full build.** |
| 6 | **The authoritative baseline platform.** Committed baselines are `linux`; the pilot's are `win32`. Until one accept pass runs on Linux the per-component lane cannot gate CI. | **`[!owner]`** |
| 7 | **The CI visual step is `continue-on-error`.** Making it blocking is a separate decision from any of the above, and without it none of this fails a build. | **`[!owner]`** |
| 8 | **Promoting `visual-baseline` to an `EvidenceKind`** in `@dzup-ui/contracts`, so it becomes a tier obligation with a cell per component. Rejected here: it changes what all 144 components owe, and the tier table is transcribed from the 2026-08-11 reassessment. `<generated_authority>` says a generator reports and never decides that. | **`[!owner]`** |
| 9 | Argos | **not pursued** — same account decision as Chromatic, with the added cost of being a third system beside two unfinished ones. |
