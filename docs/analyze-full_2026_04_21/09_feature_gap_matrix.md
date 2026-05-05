# 09 Feature Gap Matrix

## Feature Domains Reviewed
- Core component platform (`@dzup-ui/core`): component families, export surface, manifest/barrel alignment.
- Design system and theming (`@dzup-ui/tokens`, theme provider, theme bootstrap paths).
- Integration adapters (`@dzup-ui/nuxt`, resolver auto-import, pro/core split semantics).
- Migration layer (`@dzup-ui/compat`, `@dzup-ui/codemods`).
- Product-facing docs and demos (root README, Storybook intro, sandbox routed pages, contributing docs).
- Verification and release operations (CI, prerelease/release workflows, validation lanes, browser matrix).
- Secondary planning/analysis artifacts under `out/` (repo summaries, feature extraction outputs, planning batches).
- Security and scalability hotspots called out in prior analysis docs (`04`, `06`, `07`, `08`) and checked against source.

## Feature Matrix
Status legend: `implemented`, `partially implemented`, `not implemented`, `stale-doc-only`, `unclear`.

| Feature Area | Capability | Status | Confidence | Evidence | Notes |
|---|---|---|---|---|---|
| Core Component Surface | 11-family Vue component library with broad public exports | implemented | high | `packages/core/manifests/public-api.manifest.json`, `packages/core/src/components/*`, `packages/core/src/index.ts` | Manifest lists 149 components; barrel exports + provider surface reaches 159 (`DzThemeProvider` included). |
| API Source-of-Truth Integrity | Manifest-driven API inventory stays in sync with actual exports | partially implemented | high | `packages/core/manifests/public-api.manifest.json`, `packages/core/src/components/*/index.ts`, `packages/core/src/providers/index.ts` | 10 exported symbols are outside manifest (`DzCopyButton`, `DzCodeBlock`, `DzSidebar*`, `DzAppShell`, `DzConfirmDialog`, `DzThemeProvider`). |
| Token + Theme System | Token generation + provider-based theming with SSR/FOUC handling | implemented | high | `packages/tokens/src/generate.ts`, `packages/core/src/providers/DzThemeProvider.vue`, `packages/core/src/providers/theme-script.ts` | Core functionality exists and is shipped. |
| Theme Bootstrap Consistency Across Packages | Single canonical theme-init behavior reused by tokens/core/nuxt | partially implemented | medium | `packages/tokens/src/utils/theme-script.ts`, `packages/core/src/providers/theme-script.ts`, `packages/nuxt/src/module.ts` | Three separate implementations create drift risk and inconsistent CSP behavior. |
| Nuxt Integration | “Auto-import all Dz* components” contract in Nuxt module | partially implemented | high | `packages/nuxt/package.json`, `packages/nuxt/src/module.ts`, `packages/core/src/components/*/index.ts` | Hardcoded `CORE_COMPONENTS` is stale: 44 missing vs barrel exports, 17 extra legacy names. |
| Resolver Integration | `DzResolver()` component auto-resolution with optional pro support | implemented | medium | `packages/core/src/resolver.ts`, `packages/core/src/resolver.spec.ts` | Works, but pro/core boundary is fuzzy for names like `DzAppShell`. |
| Migration Path | Runtime adapters + codemod CLI for old API migration | implemented | high | `packages/compat/src/index.ts`, `packages/codemods/bin/dzup-codemod.js`, `packages/codemods/src/runner.ts` | Migration tooling exists and is publishable. |
| Migration Release Governance | Versioning/publish governance for compat/codemods | partially implemented | medium | `.changeset/config.json`, `packages/compat/package.json`, `packages/codemods/package.json` | Packages are public-publishable but ignored by Changesets, creating policy ambiguity. |
| Storybook Product Surface | Story coverage, usage docs, and smoke/e2e verification | implemented | high | `packages/core/stories/**`, `apps/storybook/.storybook/main.ts`, `e2e/smoke/storybook.spec.ts` | Story surface is strong; docs text inside Storybook is partially stale (count claims). |
| Sandbox Routed UI | Family demo pages for all routed domains | partially implemented | high | `apps/sandbox/src/router.ts`, `apps/sandbox/src/pages/*Page.vue` | 5 routed families are placeholders (`Data`, `Layout`, `Navigation`, `Media`, `Typography`) with TODO blocks. |
| Verification and CI Gates | Broad correctness/quality gates in CI | implemented | high | `.github/workflows/ci.yml`, `package.json` scripts | Strong pre-merge gates exist (typecheck/lint/tests/validate/build/e2e). |
| Release Hardening Parity | Publish workflows enforce same gate depth as CI | partially implemented | high | `.github/workflows/release.yml`, `.github/workflows/publish-prerelease.yml`, `.github/workflows/ci.yml` | Release/prerelease run only build+test, skipping key validate/a11y/SSR/e2e gates. |
| Browser Matrix Confidence | Multi-browser e2e in required automation | partially implemented | high | `playwright.config.ts`, `.github/workflows/ci.yml` | Config defines Chromium/Firefox/WebKit, CI executes Chromium only. |
| URL-Sink Safety in Navigable Components | Sanitization/allowlisting for `href` and string route props | not implemented | medium | `packages/core/src/components/buttons/DzButton.vue`, `navigation/DzMenuItem.vue`, `navigation/DzBreadcrumbItem.vue`, `navigation/DzSidebarItem.vue`, `04_security_review.md` | Unvalidated URL sink forwarding remains an exploitable integration risk in consumer apps. |
| Large-Data Runtime Scalability | Virtualization/windowing and server-mode patterns for grid/tree/search-heavy controls | not implemented | medium | `packages/core/src/composables/useDataGrid/*`, `DzDataGridHeader.vue`, `DzTree.vue`, `DzCombobox.vue`, `06_performance_and_scalability.md` | Current patterns are in-memory, full-list/full-array transforms; perf risk grows with data size. |
| Secondary `out/` Artifact Reliability | Current-state repository telemetry for planning/decisions | stale-doc-only | high | `out/code-features-current/extracted/ui-dzup-ui.md`, `out/code-features-live-sample-3/summaries/repos/ui-dzup-ui.md`, `out/workspace-repo-docs-static/DZUP_UI.md` | Examples include `components=40`, `Features:0`, and “no package docs detected,” all stale relative to live repo. |
| Orchestration Badge Surface | Team/governance badges as productized components | unclear | low | `packages/core/src/components/feedback/TeamMemberBadge.vue`, `.../GovernanceBadge.vue` | Present as stubs and not exported; unclear whether intentional future scope or abandoned experiment. |

## High-Value Gaps
- Canonical API inventory is fragmented (manifest vs barrel vs Nuxt list). This is the highest leverage gap because it drives integration correctness, docs accuracy, and release confidence.
- Nuxt auto-import parity is materially broken versus current core exports. This directly affects consumer adoption and causes runtime “component not found” risk.
- Sandbox route coverage is incomplete in 5/11 routed families, so the product demo narrative is weaker than actual package capabilities.
- Release workflows are under-gated relative to CI and can publish artifacts without full quality lanes.
- URL sink validation is missing in navigable components, leaving a practical security footgun for downstream apps.
- Large-data interaction model lacks built-in virtualization/server-mode pathways, creating clear scalability ceilings for DataGrid/tree/search surfaces.

## False-Positive Or Stale Claims
- “147 foundational components” claim in README/Storybook intro is stale versus current implementation surface (`README.md`, `apps/storybook/stories/Introduction.mdx` vs manifest/barrels).
- Changelog still frames historical inventory and package boundaries that no longer match current repository reality (`CHANGELOG.md` includes in-repo `@dzup-ui/pro` narrative).
- Nuxt package description claims auto-imports all Dz components, but current hardcoded registry is incomplete and includes legacy names (`packages/nuxt/package.json`, `packages/nuxt/src/module.ts`).
- Sandbox home metrics/copy are stale (`146+ core`, `2300+ tests`, and old names like `DzBreadcrumbs`, `DzNavbar`, `DzSteps` in placeholder pages).
- Contributing doc points to outdated contribution flow for stories and manual index export edits (`CONTRIBUTING.md` vs generated core index + story location in `packages/core/stories`).
- Several `out/` artifacts present incorrect feature/component counts and should not be treated as current truth without regeneration.

## Dependency And Sequencing Notes
- Sequence anchor: establish one canonical generated component inventory artifact first.  
This unlocks consistent fixes for manifest/barrels, Nuxt registration, README/Storybook counts, sandbox metrics, and stale telemetry regeneration.
- Nuxt parity and resolver boundary cleanup should follow canonical inventory generation.  
Otherwise fixes will re-drift as component names continue evolving.
- Verification hardening should be staged after parity fixes:  
1) add symbol-level parity checks, 2) unify `verify:release` gates, 3) expand browser coverage cadence.
- Security URL-sink hardening depends on shared utility adoption across multiple components (`DzButton`, `DzMenuItem`, `DzBreadcrumbItem`, `DzSidebarItem`) plus contract tests.
- Scalability improvements (virtualization, Set-based selection, remote data mode) are coupled to core component contracts and composable APIs; plan them as explicit semver-scoped changes.
- `out/` artifact cleanup should be done only after canonical inventory + CI telemetry improvements, so regenerated outputs become reliable.

## Priority Recommendations
1. Build and enforce a single API inventory source (generated), then gate parity in CI for manifest, core exports, and Nuxt component registration.
2. Fix Nuxt registry drift immediately and adjust package claim text until “all Dz*” is actually guaranteed by automation.
3. Complete sandbox placeholder families or clearly mark sandbox as partial preview; align home metrics and component naming to current exports.
4. Introduce a `verify:release` gate used by both release workflows, matching CI critical lanes (validate, contracts, a11y/SSR, and at least smoke e2e).
5. Add shared URL sanitization for all navigable props and back it with contract tests for dangerous schemes.
6. Start scalability track with DataGrid/Tree/Search hotspots: Set-based selection, reduced repeated lookups, and optional virtualization/server-mode contracts.
7. Regenerate or quarantine stale `out/` artifacts and attach freshness metadata (commit SHA + generated timestamp) so planning inputs are trustworthy.