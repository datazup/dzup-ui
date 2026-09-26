# Admission — DZUP-UI-ICON-SWAP-20260926-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-ICON-SWAP-20260926-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `87ba68d2c4f3029f52a7d074a3b7bb48891ec3f2` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-icon-swap-20260926` |
| Branch | `feat/icon-swap-20260926` |
| Plan reference | Owner decisions **D174** (a) and **D175** (b), taken 2026-09-26 (`docs/qa/owner-decisions-2026-09-26/ADMISSION.md`). Runbook: `docs/program-2026-09-04/reports/icon-swap-contract-2026-09.md` §5 |
| Authorisation | Operator, 2026-09-26: "do proceed with the recommended work" |

## Why now

`lucide-vue-next` is deprecated upstream in favour of `@lucide/vue`, and two
versions of it resolve in the lockfile, so `validate:peers` is red by design.
The visual baselines (TASK-R2-O6) and the AT matrix (TASK-R2-O2) are not yet
locked. Swapping before TASK-R2-O1 re-runs the browser evidence means the
evidence is recorded once, against the icons that ship.

## Scope

Runbook §5, in order, after one fix it needs:

0. **The codemod cannot rewrite a `.vue` file.** A dry run over
   `packages/core/src` modifies 0 of the 26 files that import the old package
   and reports a parse error for each: the transform parses the whole SFC as
   TypeScript. Its spec passed because the spec's helper extracted the script
   before calling the transform, which the runner does not do. The transform
   now rewrites every `<script>` block of an SFC itself, and the spec calls it
   the way the runner does, with a fixture that has both a `<script>` and a
   `<script setup>` block.
1. The four manifests: `packages/core`, `apps/landing`, `apps/sandbox` and the
   non-workspace `apps/landing/playground-template` go to `@lucide/vue ^1.47.0`.
   `yarn.lock` follows.
2. The codemod over `packages/core/src`, `packages/core/stories`,
   `apps/landing/src`, `apps/sandbox/src` and the playground template, then
   `yarn lint --fix` on the touched files.
3. The generated consumer surfaces, re-run: both landing registries,
   `generate:llms`, `generate:component-meta`, and the other landing generators
   CI diffs.
4. Consumer-facing docs that name the old package: `README.md`, three
   `apps/docs/components/*.md`, `apps/storybook/stories/Media.mdx`.
5. A `minor` changeset for `@dzup-ui/core` naming the three consumer-visible
   changes (rendered `class`, default `aria-hidden="true"`, three redrawn glyphs).
6. Baselines. The visual baselines that change are re-recorded from the Linux
   CI runner's `*-actual.png` output, as the 2026-09-24 landing baselines were.
   AT-matrix rows that depend on the icon's accessibility tree are re-recorded
   where a gate reports a change.

The tooling that names both packages (`validate:icon-duplicates`,
`report:peer-surface`, `tree-shake-check`, `export-sizes`) keeps both names. It
declares the identity set, so the old name staying in it is correct.

Not in scope: removing `apps/sandbox` (D177, its own packet), N5-04 option C (an
icon-slot provider), publishing.

## Allowed paths

The lease claims them exactly; the full list is in the lease receipt. By group:

- the files that import or name `lucide-vue-next` under `packages/core/src`,
  `packages/core/stories`, `apps/landing/src`, `apps/sandbox`,
  `apps/landing/playground-template`, plus `packages/core/package.json`,
  `apps/landing/package.json` and `yarn.lock`;
- generated: `apps/landing/public/r/**`, `apps/landing/public/llms*.txt`,
  `apps/landing/src/generated/**`, `packages/core/docs/component-meta.json`,
  `packages/core/docs/llms-full.txt`, `packages/core/llms.txt`;
- docs: `README.md`, `apps/docs/components/{DzIcon,DzIconButton,DzPopconfirm}.md`,
  `apps/storybook/stories/Media.mdx`;
- `.changeset/icons-come-from-lucide-vue.md` (new);
- `docs/qa/icon-swap-2026-09-26/**`;
- `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` (D174/D175 rows).

Baseline image paths are added by amendment when CI names them.

## Acceptance

1. `yarn validate:icon-duplicates` exits 0 (it is red on the base).
2. `git grep lucide-vue-next` finds the old name only in tooling that declares
   the identity set, in the codemod and its fixtures, in changelogs and
   changesets, and in historical reports.
3. `yarn typecheck`, `yarn lint`, `yarn test`, `yarn validate:all` and
   `yarn validate:published-imports` exit 0.
4. CI is green on the landed commit, including Landing E2E with any re-recorded
   baselines. The report-only visual lane's diffs are limited to glyphs and are
   re-recorded.

## Authority

| Class | Granted |
|---|---|
| Candidate commit | yes |
| Local integration (ff `main`) | yes |
| Push `refs/heads/main` | yes |
| Baseline re-recording from CI output | yes (D174 (a) includes the re-baseline) |
| Cleanup of this packet's worktree and branch | yes |
| Publish, tag, secrets, PR #3 merge, production | **no** |

### Amendment 1 (same epoch, before landing)

1. **Five brand icons do not exist in `@lucide/vue` 1.x.** `Github`,
   `Linkedin`, `Twitter`, `Youtube` and `Figma` are Lucide brand marks.
   `lucide-vue-next` still carried them; `@lucide/vue` dropped them. The contract
   measured core's 18 glyphs and never looked at the landing. After the swap, 13
   landing files imported an `undefined` component, and `render.spec.ts` failed
   on the sign-in, sign-up and SaaS landing templates. The marks are recreated
   with `@lucide/vue`'s own `createLucideIcon`, using the drawings copied from
   `lucide-vue-next@0.477.0` (ISC), so they render as before and take the same
   props:
   - site pages import them from `apps/landing/src/brand-icons.ts` (new);
   - the seven blocks and templates the registry ships to consumers define the
     mark inline, because a copied file cannot import a sibling module.

   A probe over all 225 source files that import `@lucide/vue` now finds no name
   the package does not export.
2. **The spec for `validate:icon-duplicates` pinned the old state.**
   `peer-icon-duplicates.spec.ts` "the real repository" expected `0.477.0` and
   `lucide-vue-next`. It now expects one `1.x` version of `@lucide/vue`, and that
   the old name is gone from the registry items.
3. **Generated evidence follows.** The swap touched 22 core components, so the
   capability matrix marks their recorded evidence cells stale (24 → 40 of the
   catalogue). The matrix, its Storybook copy, `component-meta.json` and every
   generated `apps/docs` page are regenerated. Refreshing the evidence is
   TASK-R2-O1, the next packet. This packet's commits are not squashed, because
   the matrix records per-file commit hashes.
4. **Installed version.** The lockfile resolved `@lucide/vue@1.48.0`. All 18
   glyphs core uses render the class and `aria-hidden` the contract recorded for
   1.47.0.

Added paths: `apps/landing/src/brand-icons.ts`,
`packages/tooling/src/validators/peer-icon-duplicates.spec.ts`,
`packages/core/docs/capability-matrix.json`,
`apps/storybook/stories/_data/capability.generated.ts`,
`apps/docs/components/**`, `apps/docs/evidence/**`, codemod fixture 09.
