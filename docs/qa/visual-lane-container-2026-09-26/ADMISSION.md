# Admission — DZUP-UI-VISUAL-LANE-CONTAINER-20260926-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-VISUAL-LANE-CONTAINER-20260926-R1 (TASK-R2-O6, owner decisions O6-D2 and O6-D6) |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `94621fbb307dac9ee8d506e7ec1802601a0712a9` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-visual-lane-container-20260926` |
| Branch | `chore/visual-lane-container-20260926` |
| Authorisation | Owner, 2026-09-26: O6-D2 option (b), a dedicated `visual` CI job in the pinned Playwright container, with Linux baselines captured in that image, starting by re-verifying the 34 screen baselines (O6-D6 option a) |
| Image | `mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48` (the TASK-R2-O6 handoff's digest; `@playwright/test` is 1.61.1 in `yarn.lock`) |

## Outcome

The visual lane runs in CI in the image its baselines were captured in, and
every baseline it compares was captured or re-verified there.

Deferred: widening coverage beyond `buttons`, which is waves 0–4, with
`visual:accept` per family as the owner's act; the `play()` race (O6-D3); overlay
state (O6-D4); Chromatic (O6-D1); the `EvidenceKind` (O6-D5); and the landing hero
snapshot, which runs in `landing-e2e` on a bare runner.

## Measured before any edit (pinned image, host Docker, `--ipc=host`)

- **Screen lanes against the committed Linux baselines (O6-D6):** 4 of 34 pass.
  - 18 fail on pixels or size, by 1–5 px of height. The grandfathered images
    were not captured in this image.
  - 12 fail before the screenshot. With the Storybook toolbar set to Dark,
    `<html>` carries `data-theme-mode="dark"` but `data-theme="light"`.
- **Cause of the 12:** `apps/storybook/.storybook/preview.ts` wraps every story
  in two `DzProvider` decorators that sit outside `withThemeRecipe`. A
  `DzProvider` with no theme context above it owns the theme, resolves `'system'`
  from the OS, and writes `data-theme` after mount. That overwrites the toolbar
  in the published Storybook too, whenever the OS preference differs.
- **Per-component lane:** there were no Linux baselines. Three cold
  `DZUP_VISUAL_PROBE` runs after the fix: 24 of 24 byte-identical.

## Scope

1. **Storybook fix.** An outermost `withThemeContext` decorator provides
   `DZ_THEME_KEY` from the toolbar recipe, so nested providers do not own the
   theme. After the fix the screen lanes give 0 attribute failures (was 12) and
   8 of 34 pass against the old images.
2. **Screen baselines (O6-D6).**
   - 8 pass unchanged and are kept as re-verified.
   - 26 are recaptured in the image. Their ledger records get a new digest, the
     capture commit, author and reason, and `replaces` set to the old digest.
     This mirrors `visual:accept`'s `record()`, because the tool has no
     re-accept path for screen snapshots.
   - After the recapture, three cold comparison runs gave 34 of 34 each time.
3. **Per-component baselines.**
   - The 24 `chromium-win32` images and their records are retired;
     `scope.platform` becomes `linux`.
   - 24 `yarn visual:accept` invocations run inside the image, one snapshot each.
4. **CI.** A new `visual` job runs in the pinned container. The visual step
   leaves `e2e`. The step stays `continue-on-error` until the lane is green
   three consecutive times in CI, which is the handoff's `<ci_gate>` rule; that
   flip is its own commit.
5. Regenerate the capability-matrix chain, and update the TASK-R2-O6 status
   rows and the lane README.

## Allowed paths

- `apps/storybook/.storybook/preview.ts`
- `.github/workflows/ci.yml`
- `e2e/visual/**`
- `docs/qa/visual-lane-container-2026-09-26/**`
- `docs/program-2026-09-04/evidence-completion-tasks.md`
- `docs/program-2026-09-22-planning/EXECUTION-STATUS.md`
- Generated projections:
  - `packages/core/docs/{capability-matrix,component-meta}.json`
  - `packages/core/docs/llms.txt`, `packages/core/docs/llms-full.txt`
  - `apps/storybook/stories/_data/capability.generated.ts`
  - `apps/docs/{components,evidence}/**`
  - `apps/docs/.vitepress/generated/nav.json`
  - `apps/docs/public/playground/seeds.json`
  - `apps/landing/{public/r,src/generated}/**`

## Acceptance

- `yarn validate:visual-baselines` passes with `platform = ciPlatform = linux`.
- `yarn validate:all`, `yarn lint` and `yarn typecheck` pass.
- In CI on the pushed head:
  - the `visual` job's lane passes, and Storybook Tests stay green;
  - the lane is then green three times before the `continue-on-error` flip.

## Authority

| Class | Granted |
|---|---|
| Candidate commit, local integration, push `refs/heads/main` | yes |
| Baseline acceptance for the `buttons` pilot scope and the 34 screen snapshots (O6-D6) | yes (owner's pick above) |
| Baseline acceptance for any other family | **no**; that is the owner's act, per family |
| Cleanup of this packet's worktree and branch | yes |
| Publish, tag, secrets, PR #3 merge, production | **no** |
