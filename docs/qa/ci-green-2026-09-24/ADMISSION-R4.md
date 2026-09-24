# dzup-ui main CI green, R4: the last two reds — admission

Date: 2026-09-24 (Europe/Sarajevo). Owner: Claude Code session
`session_01G3dYK3JZAU4a7YFwGBzfDv`.

Packet: `DZUP-UI-CI-GREEN-20260924-R4`. It follows R3 (`ADMISSION-R3.md`, final
`9513f89`). Base: `9513f8900cdbce5512ca205532de450639880274`.

The operator decided both open items in session on 2026-09-24 ("do proceed
recommended 1 and 2"), taking the options R3's report recommended. As before,
that grants candidate commit, local integration onto `main` and push for the
paths below. It grants no tag, version bump, npm publish (PR #3 stays the
operator's) or production authority.

## Finding

CI run `36021797408` on `9513f89` had two red jobs, both recorded by R3 as owner
decisions:

| Job | Cause | Decision |
| --- | --- | --- |
| Landing E2E: `visual.spec.ts` hero snapshot, light and dark | Only `home-hero-*-chromium-win32.png` baselines exist; CI is `ubuntu-latest`, so Playwright has nothing to compare against and fails (TASK-R2-O6). | Commit Linux baselines shot **on the CI runner**. |
| validate-min-runtime: `validate:docs-size` | Under `CI` an unbuilt docs site or Storybook is an error, and this job builds neither, so the link could only fail and never measured anything. | Enforce the budget where the artifact is built (the `storybook` job) and opt the min-runtime chain out. |

## Change

1. `apps/landing/e2e/visual.spec.ts-snapshots/home-hero-{light,dark}-chromium-linux.png`
   are the `*-actual.png` captures from the `landing-e2e-report` artifact of run
   `36021797408` (artifact `10817496570`, zip sha256
   `bbae6df5208580f9abf55e12a6b1ee780c7576766a99a7fec25a56fc6d964ab8`, matching
   the digest GitHub recorded). Same runner, same build steps as the job that
   compares them; that is what `landing-e2e-snapshots.yml` would produce, without
   a throwaway branch push. PNG sha256: light
   `644f4e2ae1d6212976518331047f2d6df742b78f316d5e8fb8c8de5aa0035cb1`, dark
   `3cc55d0df382926726d7c06a460f14ad7733ea96b08187ac0b80ce3cd4486b77`. Both were
   inspected before commit: the correct theme, full content. The sticky site
   header overlaps the hero's first line in both. The win32 baseline shows the
   same overlap, so it is how this test has always framed the hero, not a new
   defect; it is left alone.
2. `validate:docs-size` accepts `DOCS_SIZE_ALLOW_MISSING_DIST=1` (exact value
   `1`) as the chain-level form of `--allow-missing-dist`. The min-runtime
   `Validators` step sets it.
3. The `storybook` job in `ci.yml` runs `yarn validate:docs-size
   --allow-missing-dist` right after `storybook:build`, so the storybook-static
   ceiling is enforced on the build it governs. On `9513f89` CI measured
   26,212,273 B against a ceiling of 27,262,976 B and a stale floor of
   26,162,976 B, so it passes with 49,297 B of headroom above the floor.

Deferred, not in scope: the VitePress docs-site budget is still enforced only
by `apps/docs`'s own build, which no CI job runs. It was not measured in CI
before this packet either.

## Allowed paths

- `docs/qa/ci-green-2026-09-24/ADMISSION-R4.md`
- `apps/landing/e2e/visual.spec.ts-snapshots/home-hero-light-chromium-linux.png`
- `apps/landing/e2e/visual.spec.ts-snapshots/home-hero-dark-chromium-linux.png`
- `packages/tooling/src/validators/docs-size.ts`
- `packages/tooling/src/validators/docs-size.spec.ts`
- `.github/workflows/validate-min-runtime.yml`
- `.github/workflows/ci.yml`

## Acceptance

- `docs-size.spec.ts` passes, including the new opt-out cases.
- Control: with `CI=1` and no artifacts, `validate:docs-size` exits 1. With
  `DOCS_SIZE_ALLOW_MISSING_DIST=1` added, it exits 0 and prints the SKIPPED
  warning.
- After a local `storybook:build`, `CI=1 yarn validate:docs-size
  --allow-missing-dist` measures storybook-static.
- Lint and `typecheck:tooling` are clean on the changed files.
- On GitHub, the push to `main` turns validate-min-runtime and Landing E2E green,
  and every job that was green on `9513f89` stays green.

Evidence: `/data/storage/datazup-runtime/ninel/evidence/dzup-ui-ci-green-r4-20260924/`.

## Epoch 2: capability-matrix freshness (base `312ab47`)

CI run `36025715330` on `312ab47` passed 12 of 13 jobs. The two changes above
worked: Landing E2E is green against the new Linux baselines. validate-min-runtime
still failed, at link 22 of `validate:all`, not link 38:

    ✗ [freshness] packages/core/docs/capability-matrix.json is stale.

Run `36021797408` on `9513f89` failed at the same link. R3's report named
docs-size as that job's red without re-reading its log; that was wrong. The cause
is R3 itself. `c02da02` changed `DzCombobox.vue` and `DzMultiSelect.vue` after
their browser-matrix evidence was recorded (`589be13`). A fresh generation
correctly moves those two `browser-matrix` cells from `pass` to `stale` (totals
pass 147 → 145, stale 21 → 23), and the committed matrix was never regenerated.
docs-size (link 38) was never reached on `9513f89`, so the docs-size change above
is still required.

Change: `yarn generate:capability-matrix` at `312ab47`, committed as is. It
touches `packages/core/docs/capability-matrix.json` and its Storybook projection
`apps/storybook/stories/_data/capability.generated.ts`. `stale` is the truthful
state: re-measuring the browser matrix would be the way back to `pass`, and that
is not in scope.

Added allowed path: `apps/storybook/stories/_data/capability.generated.ts`.

Added acceptance: the whole `validate:all` chain passes locally the way the
min-runtime job runs it (clean dist, `yarn build`, then `CI=1
DOCS_SIZE_ALLOW_MISSING_DIST=1 yarn validate:all`), followed by `yarn test`.

### Epoch 2, finding 2: component-meta.json

The first local run of that full sequence passed capability-matrix and
stopped two links later:

    ✗ [freshness] packages/core/docs/component-meta.json is STALE

`yarn test` failed `packages/tooling/src/docs/evidence.spec.ts`, "agrees with
the capability join in component-meta.json", for the same reason. The file
embeds each component's capability summary, so the same two components moved
from `pass` 7 / `stale` 1 to 6 / 2. Change: `yarn generate:component-meta`,
committed as is.

Added allowed path: `packages/core/docs/component-meta.json`.

Fencing note: the generator wrote this file before the lease covered it. The
amend was refused with `LEASE_BINDING_DRIFT`, because the epoch-2 commit had
moved the head. The lease was then rebound and amended (generation 4) before
this commit. Nothing else was written outside the lease.
