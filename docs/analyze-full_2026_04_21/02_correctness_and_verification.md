# 02 Correctness and Verification

## Repository Overview
`dzup-ui` is a Yarn 4 workspace monorepo with publishable packages in `packages/*` (`core`, `tokens`, `contracts`, `compat`, `codemods`, `nuxt`) plus local apps in `apps/*` (`storybook`, `sandbox`), defined in [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:9).  
Verification is split across root scripts, package-level scripts, and GitHub Actions workflows, with policy/tooling checks in `packages/tooling` and release hardening scripts in `scripts/`.

Evidence basis for this report:
- Source/config inspection in repo files.
- Existing local analysis artifacts in `docs/analyze-full_2026_04_21/`.
- No standalone Vitest/Playwright/JUnit/coverage run artifacts for this repo were found under `/out/`; runtime confidence is therefore inferred from configured checks, not from fresh local pass logs.

## Verification Surface
| Area | Main Commands | Primary Evidence | Sandbox-Safe vs Environment-Dependent |
|---|---|---|---|
| Build | `yarn build`, `yarn build:all` | [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:24) | Mostly sandbox-safe (local compile/package generation). |
| Typecheck | `yarn typecheck`, `yarn typecheck:all` | [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:14) | Sandbox-safe. |
| Lint | `yarn lint`, `yarn lint:fix` | [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:16) | Sandbox-safe. |
| Unit/contract/a11y/SSR tests | `yarn test`, `yarn test:contracts`, `yarn test:a11y`, `yarn test:ssr`, `yarn test:coverage` | [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:18), [vitest.config.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/vitest.config.ts:14) | Sandbox-safe. |
| Integration/E2E | `yarn test:e2e`, `yarn test:e2e:update` (Storybook-backed Playwright) | [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:43), [playwright.config.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/playwright.config.ts:19) | Environment-dependent (browser binaries, Storybook web server, CI OS deps). |
| Migration verification | `yarn workspace @dzup-ui/codemods codemod` (CLI), codemod unit specs | [packages/codemods/package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/codemods/package.json:24) | Sandbox-safe for local transforms; correctness depends on target code patterns. |
| Policy/quality validators | `validate:*`, `validate:all`, bundle/type/exports/license/peer checks | [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:29), [packages/tooling/package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/package.json:7) | Mostly sandbox-safe. Some checks need build artifacts first. |
| Release rehearsal and security hygiene | `rehearse:release`, `scan:credentials` | [scripts/release-rehearsal.sh](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/scripts/release-rehearsal.sh:50) | Mixed; credential scan depends on full git history, rehearsal depends on full toolchain. |
| CI gates | `typecheck`, `lint`, `test`, `validate`, `build`, `storybook`, `e2e`, `coverage` jobs | [ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:18) | Environment-dependent (GitHub runner, cache, browser install, artifacts). |

Notes:
- No DB migration commands are present; migration surface is codemod-based, not schema migration-based.
- Current test surface is broad by file count (`229` spec files total; `84` contract specs; `11` a11y specs; `6` Playwright specs; `1` SSR suite).

## Confidence Signals
Strong signals:
- CI has independent fail-fast lanes instead of one umbrella command: typecheck, lint, test matrix (Node 20/22), validation, build, and e2e in separate jobs ([ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:18)).
- Packaging/release correctness checks are strong: dist artifact checks, ESM-only guard, declaration validation, bundle budget, and `npm pack --dry-run` workspace/link leakage checks ([ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:160), [ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:185)).
- Core export governance exists via manifest-driven validation for `@dzup-ui/core` ([validate-exports.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/scripts/validate-exports.ts:4)).
- E2E suite tests Storybook shell health and console-error surfaces, not just single snapshots ([e2e/smoke/storybook.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/e2e/smoke/storybook.spec.ts:16)).

Weaker signals:
- Default local “full validation” path in contributing docs uses `yarn typecheck`, which only checks core package TS ([CONTRIBUTING.md](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/CONTRIBUTING.md:47), [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:14)).
- `typecheck:all` still omits some repo surfaces (notably `packages/nuxt`, `apps/storybook`) even though they contain TS and have package-level typecheck/build scripts ([package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:15), [packages/nuxt/package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/package.json:22)).
- Nuxt module tests are smoke-only and do not assert core export parity for auto-registered component list ([module.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.spec.ts:5)).
- Playwright config declares Chromium/Firefox/WebKit, but CI executes Chromium only ([playwright.config.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/playwright.config.ts:14), [ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:260)).
- SSR lane is explicitly smoke-only and includes a known skipped case ([ssr-smoke.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/tests/ssr/ssr-smoke.spec.ts:10), [ssr-smoke.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/tests/ssr/ssr-smoke.spec.ts:129)).

## Findings

### High: Nuxt auto-registration list can drift from actual core exports, and current verification does not enforce parity
**Impact:** Nuxt consumers can hit runtime/component-resolution failures when module auto-registers names not exported by `@dzup-ui/core` or misses canonical names.

**Evidence:**  
`CORE_COMPONENTS` in Nuxt includes names such as `DzSearchBox`, `DzTabsList`, `DzTabsTrigger`, `DzTabsContent`, `DzToastContainer`, `DzDrawer`, and `DzCollapsible` ([module.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:90)).  
Core manifest and exports use canonical names like `DzSearchInput`, `DzTabList`, `DzTabTrigger`, `DzTabContent`, `DzToastViewport`, `DzCollapse`, `DzSheet` ([public-api.manifest.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/manifests/public-api.manifest.json:31), [public-api.manifest.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/manifests/public-api.manifest.json:89), [public-api.manifest.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/manifests/public-api.manifest.json:143)).

**Why current verification does not catch it:**  
Nuxt is treated as a “flat-export package” and only validated for “entry exists + exports something,” not symbol-by-symbol parity against `@dzup-ui/core` ([validate-exports.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/scripts/validate-exports.ts:9), [validate-exports.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/scripts/validate-exports.ts:217)). Nuxt tests only assert module loadability/meta existence ([module.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.spec.ts:5)).

---

### Medium: Default typecheck/validation loop under-covers the repository surface
**Impact:** Contributors can get a “green” local check while leaving TypeScript regressions in non-core surfaces undetected.

**Evidence:**  
Root `typecheck` is core-only ([package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:14)).  
`typecheck:all` checks tokens/contracts/core/compat/codemods but not nuxt/tooling/storybook ([package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:15)).  
Contributing doc’s “full validation suite” still starts with `yarn typecheck` ([CONTRIBUTING.md](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/CONTRIBUTING.md:47)).  
`packages/nuxt` has its own `typecheck` script, implying an intended but currently detached lane ([packages/nuxt/package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/package.json:22)).

**Why current verification only partially catches it:**  
Build job may catch some errors later, but build-time transpilation is not a complete substitute for explicit typecheck coverage across all workspaces. The default local feedback loop remains narrower than repo scope.

---

### Medium: CI e2e confidence is Chromium-only despite multi-browser configuration intent
**Impact:** Browser-engine-specific regressions (focus handling, keyboard behavior, overlays) can pass CI and still fail in Firefox/WebKit.

**Evidence:**  
Playwright config defines projects for Chromium, Firefox, and WebKit ([playwright.config.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/playwright.config.ts:14)).  
CI installs Chromium only and executes `--project=chromium` ([ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:260), [ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:262)).

**Why current verification does not catch it:**  
Configured matrix breadth is not exercised in required CI path; non-Chromium issues depend on ad-hoc local runs.

---

### Medium-Low: Coverage and release verification are not uniformly enforced across all publish paths
**Impact:** Coverage/test-quality confidence can be inconsistent between PR validation and release/publish flows.

**Evidence:**  
Coverage threshold job runs only for pull requests ([ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:275)).  
Release and prerelease workflows run `yarn build` and `yarn test` but do not run lint/typecheck/validate lanes directly ([release.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/release.yml:45), [publish-prerelease.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/publish-prerelease.yml:51)).

**Why current verification only partially catches it:**  
Mainline branch policy may still protect quality, but workflow-level guarantees are not uniform by design.

---

### Low: SSR verification is intentionally smoke-level with a known skipped component path
**Impact:** Semantic SSR/hydration regressions can slip through if they do not produce immediate render-to-string crashes.

**Evidence:**  
SSR suite explicitly states it is non-behavioral smoke coverage ([ssr-smoke.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/tests/ssr/ssr-smoke.spec.ts:10)).  
`DzAccordion` SSR test is skipped ([ssr-smoke.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/tests/ssr/ssr-smoke.spec.ts:129)).

**Why current verification does not catch it:**  
Current lane validates “does not crash” rather than hydration fidelity or expected SSR semantics.

## Verification Path Risks
True product-risk findings:
- Nuxt export/registration drift can directly break consumer integration.
- Non-Chromium browser regressions are plausible for accessibility/interaction-heavy components.
- SSR semantics (beyond crash safety) remain partially unverified.

Harness/environment/CI confidence distortions:
- “Full validation” messaging and default commands are narrower than actual repo surface.
- Some quality checks are conditional (PR-only coverage) or not in every publish flow.
- Several quality scripts are available but not first-class required gates (`validate:tree-shake`, `test:perf`).
- No local `/out/` runtime artifacts for this repo were found to prove recent green execution; trust currently comes from configuration intent, not captured run evidence.

## Recommended Verification Restructure
1. Add a single authoritative script, `verify:repo`, and use it as the shared entrypoint for local docs, CI, and release rehearsal.
2. Add `typecheck:repo` that explicitly includes all TS surfaces: `packages/*` including `nuxt` and `tooling`, plus `apps/sandbox` and `apps/storybook`.
3. Replace hardcoded Nuxt `CORE_COMPONENTS` with generated data from core manifest/exports, or add a parity test that fails if any Nuxt-registered symbol is absent from `@dzup-ui/core`.
4. Expand lint scope from `packages/` to `packages/ apps/ e2e/ scripts/` so test harness and automation code are governed too.
5. Keep PR e2e on Chromium for speed, and add scheduled required reporting for Firefox/WebKit (nightly or at minimum pre-release).
6. Move coverage threshold enforcement into required checks for both PRs and pushes to `main`, not PR-only.
7. Track SSR skip debt explicitly: convert known skips to issue-linked expected failures and fail CI when skip count changes unexpectedly.
8. Promote dormant checks (`validate:tree-shake`, `test:perf`) into non-blocking CI report jobs so they stay healthy and informative.
9. Align docs with reality: update `CONTRIBUTING.md` so “full validation suite” points to `verify:repo` rather than partial command sets.

## Net Assessment
- **Core package correctness:** High confidence. Unit/contract/a11y coverage is dense and CI checks are robust.
- **Packaging/release artifact correctness:** Medium-high confidence. Dist/ESM/d.ts/pack checks are strong.
- **Nuxt integration correctness:** Low-medium confidence due to manual registry drift risk and weak parity testing.
- **Cross-browser interaction correctness:** Medium confidence; Chromium CI is useful, but not representative of full browser matrix.
- **Default engineering feedback loop trustworthiness:** Medium confidence; strong infrastructure exists, but entrypoint scope and gate consistency need tightening.

Overall: correctness posture is strong for core library behavior, but verification trust is materially reduced by Nuxt parity blind spots and uneven enforcement across typecheck/browser/coverage paths.