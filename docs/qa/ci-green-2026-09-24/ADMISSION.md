# dzup-ui main CI green — admission

Date: 2026-09-24 (Europe/Sarajevo). Owner: Claude Code session
`session_01G3dYK3JZAU4a7YFwGBzfDv`.

Packet: `DZUP-UI-CI-GREEN-20260924-R1`.

The operator authorized this packet in session on 2026-09-24. Their instruction
was "do proceed with the implementation as you see it - and do make sure we have
all work on main that is validated". That grants candidate commit, local
integration onto `main` and push for the paths below. It grants no tag, version
bump, npm publish or production authority.

## Finding

GitHub `CI` on `refs/heads/main` has concluded `failure` or `cancelled` on every
push from run 134 (2026-08-09) through run 179 (`eec0bce`, 2026-09-24); no run
in that window passed. `Release` fails at "Build all packages" on the same
commits, and so does `validate-min-runtime` ("Build at the floor").

A clean `yarn install --immutable` in a Storage worktree at `eec0bce`
reproduces the four failing CI steps exactly (logs are in
`evidence/dzup-ui-ci-green-20260924/`):

| CI step | Root cause |
| --- | --- |
| Typecheck, `typecheck:all` (exit 2); Build and Release `codemods build` | `packages/codemods/tsconfig.json` includes `src/**/*.ts`, which since `589be13` (2026-09-22) contains `__fixtures__/swap-icon-library/*.ts`. Those codemod input/output texts import `@lucide/vue`, which is not installed, and they would also be emitted into `dist/`. |
| Unit Tests, `yarn test` (exit 1) | `test:prepare` runs `landing build:counts`, whose Vite config builds the merged-source resolution. The resolution requires every `exports` target to exist. `@dzup-ui/tokens/dtcg` → `dist/tokens.dtcg.json` is emitted only by `generate:tokens:dtcg`, which `test:prepare` never ran, so on a clean checkout the config refuses to load. |
| Validate, `validate:boundaries` (exit 1, 59 violations) | (a) 37 are "tooling cannot import from contracts/core". `ALLOWED_DEPS.tooling` is `[]`, yet the private, unpublished generator package has read core and contracts in 15 files, and has done so for weeks. (b) 22 are "deep import" of `@dzup-ui/core/{forms,data,navigation,overlays}`. Those are public subpaths declared in core's `exports` map, not deep imports. (c) One is inside `tooling/src/ownership/__fixtures__/`, a deliberately broken scanner input. |

## Allowed paths

The four paths admitted first:

- `docs/qa/ci-green-2026-09-24/ADMISSION.md`
- `packages/codemods/tsconfig.json`
- `package.json` (the `tokens:generate` script and the `//generate:tokens:dtcg`
  comment)
- `packages/tooling/src/validators/import-boundary.ts`

The writer lease was amended to add the following paths. Each one is the next
red layer the earlier failures had hidden:

- `packages/tooling/src/validators/peer-icon-duplicates.spec.ts`,
  `apps/landing/package.json`, `apps/sandbox/package.json`, `yarn.lock` —
  `validate:peers`.
- `docs/program-2026-09-04/EXECUTION-STATUS.md`,
  `docs/program-2026-09-04/reports/TASK-R2-O1-handoff.md`,
  `docs/program-2026-09-22-architecture/custody-and-release-tasks.md`,
  `docs/program-2026-09-22-planning/{README.md,planning-docs-disposition.md}` —
  `validate:package-names` and `validate:adr-references` through `yarn test`.
- `packages/tooling/src/meta/component-meta.ts`,
  `packages/tooling/src/validators/component-meta.spec.ts`,
  `packages/core/docs/component-meta.json` — `validate:component-meta`.
- `apps/docs/.vitepress/generated/nav.json`,
  `apps/docs/public/playground/seeds.json` — `validate:docs-pages`, which is
  derived from the component-meta digest.
- `apps/landing/src/generated/releases.ts`,
  `apps/landing/public/r/component-meta.json` — the CI step "Landing generated
  artifacts unchanged".
- `apps/landing/src/test-support/autoAnimateTimers.ts`,
  `apps/landing/src/pages.interactions.spec.ts`,
  `apps/landing/src/pages.a11y.spec.ts` — a load-dependent `yarn test` failure
  (below).

## Change

- **codemods:** exclude `src/**/__fixtures__/**`, the same rule
  `packages/tooling/tsconfig.json` uses. The specs read the fixtures through the
  file system, so they are unaffected.
- **`tokens:generate`:** the root script runs `generate:tokens:dtcg` as a second
  step. `generate.ts` is unchanged.
  - **This is a design change and needs owner review.** The N2-T1 note kept
    the DTCG export out of `tokens:generate`/`test:prepare`. That stopped being
    tenable once `./dtcg` joined the `exports` map: every landing Vite config
    builds merged-source resolution, which needs the artifact. Those configs
    are `build:counts` in the test job and `build:registry` in the validate
    job.
  - The generator writes only the git-ignored `dist/tokens.dtcg.json`.
- **import-boundary validator:**
  - `tooling` may import `tokens`, `contracts` and `core`.
  - A subpath declared in the target's `exports` map is not a deep import.
  - `__fixtures__` directories are skipped.
- **lucide-vue-next:** landing and sandbox declare `^0.477.0`, the version core
  declares, so one version resolves.
  - The spec that recorded the duplication now asserts a single version.
  - The swap to `@lucide/vue` (D174) remains an open owner decision.
- **Doc gates:**
  - Two planning rows that record the Pro package rename carry the validator's
    `retired-name-ok:` marker.
  - Three lines that discuss the unwritten ADR number carry
    `adr-example-ok:`.
  - The status row that quoted both is reworded.
- **component-meta:** the artifact was "stale" only because of line endings.
  TypeScript joins multi-line JSDoc with the host newline, so a Windows
  extraction wrote `\r\n`.
  - `serializeComponentMeta`, which the generator and the gate share, now
    writes `\n` in every string. A new spec fails on the old serializer.
  - The artifact, its docs-pages derivatives and the landing `/r/` copy were
    regenerated.
- **Landing `releases.ts`:** regenerated. Its pending list was stale against
  `.changeset/*`.
- **auto-animate timer flake:** the confirmation run at `3ff9604` passed all
  10,531 tests but exited 1 with 28 unhandled
  `ReferenceError: requestAnimationFrame is not defined`. All of them came from
  `pages.interactions.spec.ts`, which mounts `/animations` through the router.
  - auto-animate's poll intervals outlive the file's jsdom environment. The
    earlier run of the same code had 0 errors.
  - `AnimationsPage.v2.spec.ts` already documented and guarded this (D155),
    but only for itself.
  - The guard now lives in `src/test-support/autoAnimateTimers.ts`. Both
    router-sweep specs that visit `/animations` call it.

## Acceptance

The CI steps ran in the Storage worktree through
`storage-first-runtime.mjs exec`. Each CI job started from a tree with no
`dist/`. `validate:all` was run as each of its 50 gates independently, because
the `&&` chain hides everything after the first failure. Logs are in
`evidence/dzup-ui-ci-green-20260924/`.

| Measurement | Base `eec0bce` | After |
| --- | --- | --- |
| `typecheck:all` | exit 2 (13 TS errors, codemods fixtures) | 0 |
| `lint` | 0 | 0 |
| `yarn test` | exit 1 (landing config refused to load) | 0 — 554 files, 10,531 passed, 4 skipped, 1 todo |
| `test:contracts` / `test:a11y` / `test:ssr` | not reached in CI | 0 / 0 / 0 |
| `validate:boundaries` | exit 1 (59 violations) | 0 |
| Validate job: interaction, parity, story-status, story-dod, tokens, exports, tokens-unchanged, changelog, peers, licenses | not reached | all 0 |
| Landing generated artifacts unchanged | not reached | 0 |
| `yarn build` | exit 1 (codemods) | 0 |
| `validate:engines`, floor build, and the 50 `validate:all` gates, each run independently | build exit 1 | all 0 |

**Negative control.** A temporary tooling file imported `@dzup-ui/compat`,
`@dzup-ui/core/src/internal` and `@dzup-ui/core/forms`.
`validate:boundaries` exited 1 and reported the first two, and did not report
the declared `./forms` subpath.

## Authority classes

| Class | Granted |
| --- | --- |
| Bounded edits in the paths above, local deterministic gates | yes |
| Candidate commit, local integration onto `main`, push `refs/heads/main` | yes, operator 2026-09-24 |
| Workflow file edits, tags, version bump, npm publish, production | no |

## Deferred

- The CI jobs that need browsers or services (Storybook build and tests,
  Playwright E2E, landing E2E and perf) are measured in GitHub after the push.
  They are not reproduced locally.
- A `yarn test` run writes `apps/landing/public/r/component-meta.json` as a side
  effect. It is now committed, so the copy it writes is identical.
- Declaring `@dzup-ui/{tokens,contracts,core}` as `workspace:` devDependencies
  of `@dzup-ui/tooling`. That would change `yarn.lock`, a shared output.
