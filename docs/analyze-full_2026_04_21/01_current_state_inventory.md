# 01 Current State Inventory

## Scope Reviewed
- Repository identity and public docs: `ui/dzup-ui/README.md:1`, `ui/dzup-ui/CONTRIBUTING.md:1`, `ui/dzup-ui/SECURITY.md:1`, `ui/dzup-ui/CHANGELOG.md:1`, `ui/dzup-ui/CLAUDE.md:1`.
- Workspace/package metadata and scripts: `ui/dzup-ui/package.json:1`, `ui/dzup-ui/.yarnrc.yml:1`, `.changeset/config.json:1`.
- Core build/lint/test config: `ui/dzup-ui/tsconfig.base.json:1`, `ui/dzup-ui/eslint.config.js:1`, `ui/dzup-ui/vitest.config.ts:1`, `ui/dzup-ui/playwright.config.ts:1`, `ui/dzup-ui/bundlesize.config.json:1`.
- CI/release automation: `ui/dzup-ui/.github/workflows/ci.yml:1`, `.github/workflows/release.yml:1`, `.github/workflows/publish-prerelease.yml:1`, `ui/dzup-ui/scripts/release-rehearsal.sh:1`, `ui/dzup-ui/scripts/credential-scan.sh:1`.
- Implementation entrypoints and manifests: `ui/dzup-ui/packages/core/src/index.ts:1`, `ui/dzup-ui/packages/core/manifests/public-api.manifest.json:1`, `ui/dzup-ui/packages/core/src/resolver.ts:1`, `ui/dzup-ui/packages/tokens/src/generate.ts:1`, `ui/dzup-ui/packages/contracts/src/index.ts:1`, `ui/dzup-ui/packages/compat/src/index.ts:1`, `ui/dzup-ui/packages/codemods/src/runner.ts:1`, `ui/dzup-ui/packages/nuxt/src/module.ts:1`.
- Quality tooling/validators: `ui/dzup-ui/packages/tooling/src/validators/import-boundary.ts:1`, `ui/dzup-ui/packages/tooling/scripts/validate-exports.ts:1`, `ui/dzup-ui/packages/tooling/scripts/validate-dts.ts:1`, `ui/dzup-ui/packages/tooling/scripts/validate-peers.ts:1`, `ui/dzup-ui/packages/tooling/src/license-audit.ts:1`.
- Runtime surfaces sampled: `ui/dzup-ui/packages/core/src/providers/DzThemeProvider.vue:1`, `ui/dzup-ui/packages/core/src/composables/useFloating/useFloating.ts:1`, `ui/dzup-ui/packages/core/src/components/data/DzDataGrid.vue:1`, `ui/dzup-ui/packages/core/src/components/overlays/DzDialog.vue:1`.
- Test surfaces sampled: `ui/dzup-ui/packages/core/tests/ssr/ssr-smoke.spec.ts:1`, `ui/dzup-ui/packages/core/tests/a11y/buttons.a11y.spec.ts:1`, `ui/dzup-ui/e2e/smoke/storybook.spec.ts:1`, `ui/dzup-ui/e2e/a11y/keyboard-nav.spec.ts:1`, `ui/dzup-ui/packages/nuxt/src/module.spec.ts:1`.
- Internal app surfaces sampled: `ui/dzup-ui/apps/sandbox/src/router.ts:1`, `ui/dzup-ui/apps/sandbox/src/App.vue:1`, `ui/dzup-ui/apps/storybook/.storybook/main.ts:1`, `ui/dzup-ui/apps/storybook/.storybook/preview.ts:1`, `ui/dzup-ui/apps/storybook/stories/Introduction.mdx:1`.
- Secondary `out/` artifacts reviewed for drift/context: `out/code-features-current/extracted/ui-dzup-ui.md:1`, `out/code-features-current/scored/ui-dzup-ui.md:1`, `out/code-features-live-sample-3/summaries/repos/ui-dzup-ui.md:1`.

## Repository Overview
- `ui/dzup-ui` is a multi-package UI platform monorepo centered on `@dzup-ui/core`, with support packages for tokens, contracts, migration compatibility, codemods, and Nuxt integration (`package.json:9`, `README.md:53`).
- The repo is tool-heavy and quality-gated: strict TypeScript, linting, unit/contract/a11y/SSR tests, E2E Storybook checks, boundary validation, export validation, peer/license audits, bundle checks, and release rehearsals (`package.json:13`, `.github/workflows/ci.yml:18`, `.github/workflows/ci.yml:96`, `scripts/release-rehearsal.sh:40`).
- Two internal apps (`apps/sandbox`, `apps/storybook`) serve as development and documentation/visual validation environments rather than end-user production apps (`apps/sandbox/package.json:2`, `apps/storybook/package.json:2`).

## Repository Identity
- Product role: open-source Vue 3 component library ecosystem with migration path from legacy dzup-ui APIs (`README.md:3`, `README.md:117`, `packages/compat/src/index.ts:2`, `packages/codemods/package.json:5`).
- Primary users: frontend application teams needing reusable components, design tokens, contract types, and optional Nuxt auto-registration (`README.md:53`, `packages/nuxt/src/module.ts:225`).
- Languages/frameworks: TypeScript + Vue SFCs (`package.json:4`, `README.md:72`), Vite library builds (`packages/core/vite.config.ts:23`), Vitest + Playwright testing (`package.json:18`, `package.json:43`).
- Package manager/runtime: Yarn 4 with Node >=20 (`package.json:5`, `package.json:7`), node-modules linker (`.yarnrc.yml:1`).
- Repository shape: workspaces at `packages/*` and `apps/*` (`package.json:9`), with publishable packages and internal tooling packages (`packages/*/package.json`).

## Implementation Surface
- Core API surface is manifest-driven and generated: `packages/core/manifests/public-api.manifest.json` feeds generated barrel exports in `packages/core/src/index.ts` (`manifest-generator.ts:4`, `manifest-generator.ts:90`, `core/src/index.ts:1`).
- Major component domains are explicit and broad: 11 families (buttons, cards, inputs, forms, layout, media, data, feedback, navigation, overlays, typography) (`core/src/index.ts:9`, `core/manifests/public-api.manifest.json:7`).
- Supporting libraries/services:
- `@dzup-ui/tokens` generates CSS variables, TS token types, and Tailwind theme artifacts (`tokens/src/generate.ts:4`, `tokens/src/generate.ts:421`).
- `@dzup-ui/contracts` publishes canonical prop/event/slot taxonomies (`contracts/src/canonical.types.ts:12`, `contracts/src/index.ts:14`).
- `@dzup-ui/compat` wraps legacy props/events and emits deprecation warnings (`compat/src/index.ts:24`, `compat/src/utils/deprecation.ts:20`).
- `@dzup-ui/codemods` provides automated transform runner/CLI (`codemods/bin/dzup-codemod.js:4`, `codemods/src/runner.ts:71`).
- `@dzup-ui/nuxt` injects CSS, transpile config, component auto-imports, and a head theme script (`nuxt/src/module.ts:240`, `nuxt/src/module.ts:252`, `nuxt/src/module.ts:272`).
- Runtime integration complexity is non-trivial: broad `reka-ui` usage, floating positioning, date handling, icons, and theme SSR/FOUC handling (`core/src/components/overlays/DzDialog.vue:3`, `core/src/composables/useFloating/useFloating.ts:11`, `core/src/components/forms/DzDatePicker.vue:24`, `core/src/providers/theme-script.ts:1`).
- Scale signals from local tree scan: `packages/core/src/components` currently contains 160 `.vue` files, overall repo has roughly ~2k files under `packages/`, and test files are dense (229 `*.spec/test*` files across `packages` + `e2e`).
- Large-module signals: highly complex files around data grid and advanced composables/tests, e.g. `useDataGrid.spec.ts` (627 LOC), `useSelect.spec.ts` (513 LOC), `DzDataGrid.vue` (multi-state compound component, context + pagination + selection) (`DzDataGrid.vue:12`).

## Maturity Signals
- Strong production-grade CI gates: typed checks, lint, unit tests across Node 20/22, contract/a11y/SSR test lanes, boundary/token/export/changelog/peer/license checks, build + declaration validation + bundle budgets + pack smoke tests (`ci.yml:18`, `ci.yml:64`, `ci.yml:89`, `ci.yml:91`, `ci.yml:94`, `ci.yml:116`, `ci.yml:177`, `ci.yml:185`).
- Release engineering is structured: Changesets-driven PR/version/publish flow with npm provenance and prerelease workflow (`release.yml:51`, `release.yml:53`, `publish-prerelease.yml:57`).
- Tooling hygiene is advanced for a UI repo: import-boundary validator, declaration parity checks, peer semver checks, and license audit scripts are all custom and integrated (`import-boundary.ts:4`, `validate-dts.ts:4`, `validate-peers.ts:4`, `license-audit.ts:4`).
- Testing breadth is substantial: contract specs, a11y specs, SSR smoke tests, and Playwright Storybook e2e checks exist; Storybook infra tests explicitly check console errors and story rendering health (`package.json:21`, `package.json:22`, `package.json:23`, `e2e/smoke/storybook.spec.ts:15`, `e2e/smoke/storybook.spec.ts:168`).
- Transitional/less-mature indicators:
- Nuxt module tests are mostly smoke-level and do not assert component parity correctness (`packages/nuxt/src/module.spec.ts:11`).
- Some governance docs are stale relative to implementation (details below).
- No backend-style migrations/jobs/workers exist (expected for UI library), so operational maturity is concentrated in frontend package quality gates rather than runtime ops infrastructure.

## Current-State Caveats
- Component-count/documentation drift is material:
- README and Storybook intro still claim 147 foundational components (`README.md:3`, `README.md:13`, `apps/storybook/stories/Introduction.mdx:8`).
- Changelog still references a different historical count and in-repo `@dzup-ui/pro` framing (`CHANGELOG.md:18`, `CHANGELOG.md:19`, `CHANGELOG.md:26`), while README now points pro users to a separate repo (`README.md:9`).
- Live manifest exports indicate a larger and changed component set (e.g. explicit entries for newer names like `DzSearchInput`, `DzTabList`, `DzTransfer`, `DzToastViewport`) (`core/manifests/public-api.manifest.json:38`, `core/manifests/public-api.manifest.json:93`, `core/manifests/public-api.manifest.json:66`, `core/manifests/public-api.manifest.json:155`).
- Architecture-doc drift inside repo:
- `CLAUDE.md` states “no `<style scoped>`” and “155 `.vue` files” (`CLAUDE.md:48`, `CLAUDE.md:72`), but current core has many scoped-style components (for example `DzDataGrid.vue:195`, `DzButton.vue:187`, `DzDialogContent.vue:106`) and current file count is higher by local scan.
- Nuxt integration drift risk:
- Nuxt core list still includes names like `DzSearchBox`, `DzTabsList`, `DzTabsTrigger`, `DzFAB`, `DzDrawer` (`nuxt/src/module.ts:31`, `nuxt/src/module.ts:90`, `nuxt/src/module.ts:141`, `nuxt/src/module.ts:152`).
- Core manifest exports now use different/current names (e.g. `DzSearchInput`, `DzTabList`, `DzTabTrigger`) (`core/manifests/public-api.manifest.json:38`, `core/manifests/public-api.manifest.json:93`, `core/manifests/public-api.manifest.json:94`).
- Export validation currently checks Nuxt as “flat export exists” and does not validate that its component registry matches manifest/core exports (`packages/tooling/scripts/validate-exports.ts:9`, `packages/tooling/scripts/validate-exports.ts:80`).
- Contributing docs mismatch on story location:
- Contribution guide says add stories under `apps/storybook/src/stories/` (`CONTRIBUTING.md:63`).
- Storybook config actually sources component stories from `packages/core/stories/**/*.stories.ts` (`apps/storybook/.storybook/main.ts:12`).
- Secondary `out/` artifacts are stale versus live tree:
- `out/code-features-current/extracted/ui-dzup-ui.md` reports static fallback counts (e.g., “40 components”, “80 test files”) (`out/code-features-current/extracted/ui-dzup-ui.md:9`, `out/code-features-current/extracted/ui-dzup-ui.md:17`, `out/code-features-current/extracted/ui-dzup-ui.md:75`), while current source has materially higher component/test volume.

## Overall Assessment
`dzup-ui` is currently a production-leaning, high-discipline component-platform monorepo with strong CI/release guardrails, substantial test coverage modes, and serious package-boundary/tooling rigor. The highest risk is not implementation immaturity; it is contract/documentation drift across README/changelog/architecture notes/Nuxt registry and static analysis artifacts. In practical terms, maintainers appear to be shipping real code faster than they are keeping all descriptive and integration metadata synchronized.