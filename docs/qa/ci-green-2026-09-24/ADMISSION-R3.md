# dzup-ui main CI green, R3: the browser-level reds — admission

Date: 2026-09-24 (Europe/Sarajevo). Owner: Claude Code session
`session_01G3dYK3JZAU4a7YFwGBzfDv`.

Packet: `DZUP-UI-CI-GREEN-20260924-R3`. It follows R1 and R2 (`ADMISSION.md`,
landed as `3147432` and `c290724`). Base: `c290724e5b1ac06a8bfc70bb784e4bbc40415e19`.

The operator authorized it in session on 2026-09-24 with "Do proceed
improvements and fixes if needed and implementation as planned". R2's report had
named this packet as the next one. As in R1, that grants candidate commit, local
integration onto `main` and push for the paths below. It grants no tag, version
bump, npm publish (PR #3 stays the operator's) or production authority.

## Finding

After R2, CI run `36006231470` on `c290724` still had four red jobs. Their logs
and artifacts are in `evidence/dzup-ui-ci-green-r3-20260924/`. Each one was
reproduced locally before it was fixed.

| Job | Root cause |
| --- | --- |
| E2E Tests (Playwright): `anatomy-parts.spec.ts`, 2 tests | Both tests load `core-buttons-dzspeeddial--fab`. That export is "DzFab (standalone)": it renders five `DzFab`s and no `DzSpeedDial`, so `data-part="list"` and a root nested inside a speed-dial root can never exist. The spec was wrong, not the component. |
| Storybook Tests: the Async Options play in `DzCombobox` and `DzMultiSelect` | A real bug. A mouse press on the error row's Retry moves focus onto the button. Retry sets the state to `loading`, which unmounts the button (it shows only on `error`), so focus falls to `<body>` and Reka's combobox closes. The list the user asked to reload disappears. `DzMention` already guards this under contract C9.4 with `@mousedown.prevent`; the two Reka-combobox hosts did not. |
| Landing E2E: `block-detail.spec.ts` overflow at 390px | Only when the runner's fallback font is wider (reproduced by forcing DejaVu Sans). The non-wrapping pager row "Previous / Browse all blocks / Next" is ~9px wider than the viewport. The same measurement found a second, hidden defect: `.bp-control-group` is `nowrap`, so on a phone the LTR/RTL toggle sat at x=393–482, past the preview's `overflow: hidden` edge, where no one could reach it. |
| Landing Perf: Lighthouse mobile LCP on `/blocks/hero-split` | 4171–4474ms on CI, 4283–4354ms locally, against a 4000ms gate. In July it measured 3559–3572ms. `e067d82` (2026-08-20) made the page preview-first and imports `BlockPreview` statically. `BlockPreview` imports `blocks/sources.ts`, the eager `?raw` glob of all 87 blocks (491 kB raw, 108 kB gzip). That put the whole catalogue's source text on the render path of every block page. Stubbing the glob out in a throwaway build measured 3534–3685ms. |

Not in this packet. Each one is recorded for its owner:

- The hero visual snapshots (light and dark). The baseline platform is decision
  TASK-R2-O6.
- min-runtime `validate:docs-size`. It fails closed under `CI` when neither docs
  nor Storybook has been built. Where the size budget should be measured is a
  design decision.

## Allowed paths

- `docs/qa/ci-green-2026-09-24/ADMISSION-R3.md`
- `e2e/components/anatomy-parts.spec.ts`
- `packages/core/src/components/forms/DzCombobox.vue`,
  `packages/core/src/components/forms/DzMultiSelect.vue`,
  `.changeset/combobox-retry-keeps-the-list-open.md`
- `apps/landing/src/pages/BlockDetailPage.vue`,
  `apps/landing/src/components/blocks/BlockPreview.vue`
- `apps/landing/src/blocks/sources.ts`, `apps/landing/src/blocks/sourceLoader.ts`,
  `apps/landing/src/blocks/sourceLoader.spec.ts`,
  `apps/landing/src/components/blocks/BlockManifest.vue` — the lazy per-block
  source loader and the detail route's consumers.
- `apps/landing/src/shellDirection.spec.ts` — its `DELIBERATE` list pins
  `BlockPreview.vue` declarations by line number, and those lines moved.
- `apps/landing/src/generated/releases.ts` — regenerated from the new changeset.
  CI's "Landing generated artifacts unchanged" step requires it.

## Acceptance

1. `anatomy-parts.spec.ts` passes in Chromium against the static Storybook
   (45 tests).
2. `DzCombobox.stories.ts` and `DzMultiSelect.stories.ts` pass under
   `--project=storybook`. Both failed before the fix.
3. At 390px, with the default font and with DejaVu Sans, the block-detail page
   has `scrollWidth <= innerWidth`, and the render control group ends inside
   the viewport. `block-detail.spec.ts` and `mobile.spec.ts` pass.
4. Lighthouse mobile LCP on `/blocks/hero-split` is under 4000ms locally
   (median of 3 runs). `/` is not reintroduced to the source text, which the
   entry-JS budget in `check-bundle-budget.ts` checks.
5. `typecheck:all`, `lint`, and the landing and core unit suites stay green.
6. On GitHub, the Playwright, Storybook Tests, Landing E2E (except the O6
   snapshots) and Landing Perf jobs pass.

## Epoch 2 — the `/blocks` regression that `16f1121` introduced

CI run `36016715115` on `16f1121` turned Playwright and Storybook Tests green.
`/blocks/hero-split` passed its mobile LCP budget, and Landing E2E failed only
on the two O6 snapshots. But `/blocks` mobile LCP rose to 4370–4970ms (FCP
3392–3616ms). The cause: `sourceLoader.ts` used the same `?raw` module ids as
`sources.ts`'s eager glob, which `BlockCard` still imports on `/blocks`, so
Rollup split every source into its own chunk. BlocksIndexPage then imported all
87 statically, and each was under `preload-route-chunk`'s 60 kB cap, so every
one was preloaded in competition with the entry chunk.

Fix, in a new worktree at `16f1121`: the lazy glob uses `?raw&lazy`, which gives
it module ids of its own, and `vite.config.ts` puts the eager sources in one
`block-sources` chunk. That restores the layout `/blocks` had before R3 (one
chunk over the preload cap). Without the second part, Rollup inlines the sources
into the always-preloaded BlocksIndexPage facade.

Additional allowed path: `apps/landing/vite.config.ts`.

Measured locally, Lighthouse 13 mobile, 3 runs: `/blocks` LCP 3003/3003/3004ms
and `/blocks/hero-split` 3534/3605/3607ms.

## Epoch 3 — the Lighthouse artifact name

CI run `36019588245` on `7057f01` passed every mobile Lighthouse assertion. The
two failing assertions of the earlier runs are gone; only the advisory FCP and
performance-score warnings remain. The step still failed: the desktop and mobile
`treosh/lighthouse-ci-action` steps both upload with the default
`artifactName`, so the second upload was refused with `409 Conflict`. No earlier
run reached the mobile upload with its assertions passing. The mobile step now
uploads as `lighthouse-results-mobile`, and its name states the 4s ceiling it
enforces.

Additional allowed path: `.github/workflows/ci.yml`.
