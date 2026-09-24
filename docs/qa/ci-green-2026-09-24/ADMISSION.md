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

- `docs/qa/ci-green-2026-09-24/ADMISSION.md`
- `packages/codemods/tsconfig.json`
- `package.json` (the `test:prepare` script and its documenting comment only)
- `packages/tooling/src/validators/import-boundary.ts`

Any further red found once these layers are gone is added by amending this
record, and the reason is stated.

## Change

- codemods: exclude `src/**/__fixtures__/**`, the same rule
  `packages/tooling/tsconfig.json` uses. The specs read the fixtures through the
  file system, so they are unaffected.
- `test:prepare`: run `yarn generate:tokens:dtcg` as its own step, after
  `tokens:generate`. **This is a design change and needs owner review.** The
  N2-T1 note wanted the DTCG export kept out of `test:prepare`. That became
  impossible once `./dtcg` joined the `exports` map, because merged-source
  resolution needs the artifact before any Vite config loads. The export is
  still a separate script, not folded into `generate.ts`, and it writes only
  the git-ignored `dist/tokens.dtcg.json`.
- import-boundary validator:
  - `tooling` may import `tokens`, `contracts` and `core`.
  - A subpath declared in the target package's `exports` map is not a deep
    import.
  - `__fixtures__` directories are skipped.
  - Undeclared subpaths and disallowed package edges are still reported; the
    negative control below proves it.

## Acceptance

Every CI step is run independently, from a tree with no `dist/`, in the
Storage worktree through `storage-first-runtime.mjs exec`. The results are
recorded below at landing.

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
- Declaring `@dzup-ui/{tokens,contracts,core}` as `workspace:` devDependencies
  of `@dzup-ui/tooling`. That would change `yarn.lock`, a shared output.
