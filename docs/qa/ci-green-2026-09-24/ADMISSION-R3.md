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
- `apps/landing/src/blocks/sources.ts`, and the lazy per-block source loader
  and its consumers on the block-detail route. The lease is amended with their
  exact paths before they are edited.

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
