# 05 Code Quality and Maintainability

## Repository Overview
`dzup-ui` is a Yarn 4 monorepo with package-level separation across core UI runtime, contracts, tokens, compatibility adapters, Nuxt integration, codemods, and internal tooling. The current surface is large and still expanding.

- Core implementation scale: ~160 Vue components in `packages/core/src/components` and ~52 composable TS files in `packages/core/src/composables`.
- Test/docs scale: 223 package-level spec files, 6 e2e specs, and 97 Storybook story files.
- Build/governance posture is mature (typecheck, lint, contracts/a11y/SSR test lanes, boundary/export/d.ts validators): [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:14).
- Secondary static artifact underreports real scale (40 components), which creates planning noise: [ui-dzup-ui.md](/media/ninel/Second/code/datazup/ai-internal-dev/out/code-features-current/extracted/ui-dzup-ui.md:9).

## Maintainability Overview
Maintainability is above average for a UI library of this size. The repo has strong structure and governance, but risk is increasingly concentrated in cross-package drift and a handful of oversized, multi-responsibility modules. The most serious issues are not style-level; they are contract synchronization, duplicated source-of-truth logic, and implicit runtime invariants that weaken refactor safety.

## Strengths
- Strong type/lint baseline: `strict` and `noUncheckedIndexedAccess` are enabled: [tsconfig.base.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/tsconfig.base.json:7).
- No explicit `any` usage found in source files (`: any`, `as any`, `<any>` patterns absent), which keeps API contracts cleaner over time.
- Good package boundary governance with explicit dependency rules and deep-import checks: [import-boundary.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/src/validators/import-boundary.ts:44).
- Manifest-driven export generation avoids manual barrel churn and supports consistent API publishing: [manifest-generator.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/src/manifest-generator.ts:90).
- Test footprint is broad and includes behavior-rich composable tests (e.g., DataGrid): [useDataGrid.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGrid.spec.ts:29).

## Maintainability Findings
1. **High: Cross-package API naming drift (core manifest vs Nuxt auto-registration)**
- Nuxt maintains a hardcoded `CORE_COMPONENTS` list: [module.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:22).
- The canonical core API lives in manifest exports: [public-api.manifest.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/manifests/public-api.manifest.json:6).
- There are concrete mismatches (`DzSearchBox` vs `DzSearchInput`, `DzTabsList` vs `DzTabList`, `DzToastContainer` vs `DzToastViewport`, etc.): [module.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:90), [public-api.manifest.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/manifests/public-api.manifest.json:38), [public-api.manifest.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/manifests/public-api.manifest.json:93), [public-api.manifest.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/manifests/public-api.manifest.json:155).
- Nuxt tests are mostly import/smoke checks and do not validate parity with core manifest: [module.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.spec.ts:5).
- **Why this is maintainability risk:** rename/add/remove operations require manual updates in multiple places and regressions can ship silently.

2. **High: Duplicated source-of-truth for theme bootstrap behavior**
- Theme init logic exists in tokens as an inline script constant: [theme-script.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tokens/src/utils/theme-script.ts:23).
- Core has a separate generator with richer options: [theme-script.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/providers/theme-script.ts:45).
- Nuxt injects another inline variant directly in module setup: [module.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:275).
- **Why this is maintainability risk:** behavior can diverge by host environment (storage fallback/system resolution), and fixes must be repeated across three implementations.

3. **Medium: DataGrid type contracts rely on implicit invariants and casts**
- Filter/sort keys use broad `string` types: [DzDataGrid.types.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGrid.types.ts:61), [DzDataGrid.types.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGrid.types.ts:78), [DzDataGrid.types.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGrid.types.ts:131).
- Runtime logic compensates with casts (`as keyof T`): [useDataGridSort.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGridSort.ts:123), [useDataGridSort.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGridSort.ts:140).
- Row identity falls back to object reference when `rowKey` is absent: [useDataGrid.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGrid.ts:165).
- **Why this is maintainability risk:** compiler guarantees are weaker than they appear; immutable data refreshes can break selection/filter behavior subtly.

4. **Medium: Config duplication increases environment skew risk**
- Alias definitions are duplicated across TS paths, vitest, sandbox Vite, and Storybook configs: [tsconfig.base.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/tsconfig.base.json:24), [vitest.config.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/vitest.config.ts:8), [sandbox vite.config.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/apps/sandbox/vite.config.ts:9), [storybook vite.config.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/apps/storybook/vite.config.ts:9), [storybook main.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/apps/storybook/.storybook/main.ts:28).
- **Why this is maintainability risk:** path changes require multi-file synchronization and tend to break one toolchain first.

5. **Low-Medium: TODO/stub debt and placeholder duplication**
- Core includes explicit stub components with unresolved contract/test artifacts: [TeamMemberBadge.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/feedback/TeamMemberBadge.vue:2), [GovernanceBadge.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/feedback/GovernanceBadge.vue:2).
- Sandbox has repeated “coming soon” page structures with copy-pasted styles/comments: [NavigationPage.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/apps/sandbox/src/pages/NavigationPage.vue:2), [MediaPage.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/apps/sandbox/src/pages/MediaPage.vue:2), [LayoutPage.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/apps/sandbox/src/pages/LayoutPage.vue:2).
- **Why this is maintainability risk:** low immediate runtime risk, but it dilutes signal and makes completion boundaries ambiguous.

6. **Low: Documentation/telemetry drift around scale claims**
- Public docs still market “147 components”: [README.md](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/README.md:3), [Introduction.mdx](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/apps/storybook/stories/Introduction.mdx:8).
- External extracted artifact reports 40 components: [ui-dzup-ui.md](/media/ninel/Second/code/datazup/ai-internal-dev/out/code-features-current/extracted/ui-dzup-ui.md:9).
- **Why this matters:** planning, QA scope, and onboarding are affected by inconsistent repository metadata.

**Stylistic nits (non-risk)**
- Test title typo (`cORE_COMPONENTS`) is cosmetic: [module.spec.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.spec.ts:11).
- Repeated placeholder page styling is mostly polish debt unless placeholders persist long-term.

## Large-Module And Legacy Risk
- `packages/tokens/src/generate.ts` (~445 LOC): multi-output generator (CSS/TS/Tailwind concerns in one place) increases change coupling.
- `packages/tooling/scripts/validate-dts.ts` (~361 LOC) and `validate-exports.ts` (~350 LOC): important gatekeepers, but single-file complexity raises onboarding and modification cost.
- `packages/core/src/components/forms/DzCombobox.vue` (~347 LOC): combines rendering, state, and accessibility interactions in one SFC.
- `packages/core/src/components/overlays/DzCommandPalette.vue` (~299 LOC): repeated item markup across grouped/ungrouped/flat branches creates high edit blast radius: [DzCommandPalette.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/overlays/DzCommandPalette.vue:204), [DzCommandPalette.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/overlays/DzCommandPalette.vue:233), [DzCommandPalette.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/overlays/DzCommandPalette.vue:262).
- `packages/core/src/composables/useDialog/useDialog.ts` (~291 LOC): many side effects (scroll lock, aria hiding, outside click, focus trap, RAF timing) in a single composable: [useDialog.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDialog/useDialog.ts:118).
- `apps/sandbox/src/pages/FormsPage.vue` (~560 LOC) and `CardsPage.vue` (~422 LOC): demo harness pages are becoming monolithic and harder to evolve.

Legacy risk indicators:
- Compatibility package intentionally carries deprecated adapters (useful but long-tail maintenance load): [compat index](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/compat/src/index.ts:1).
- Deprecated re-export remains for `useTheme`: [useTheme.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useTheme/useTheme.ts:2).

## Testability And Refactorability
What helps:
- Extensive automated validation and test lanes for contracts, a11y, SSR, and e2e: [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:21), [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:22), [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:23), [package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:43).
- Composable-first architecture in core creates reusable seams and unit-testable behavior blocks (DataGrid, Sidebar, Dialog).
- Tooling validators catch structural contract drift before publishing.

What blocks safe change:
- Nuxt integration lacks robust parity tests for the registration list; refactors there are high-risk/low-feedback.
- Side-effect-dense composables (especially dialog/focus/DOM orchestration) require timing-sensitive tests and are easier to make flaky.
- Manual registries and duplicate configs increase cross-file coordination for what should be single-change operations.
- Type looseness in DataGrid key models reduces compile-time safety during schema evolution.

## Recommended Refactoring Priorities
1. Replace Nuxt `CORE_COMPONENTS` hardcoding with generated data from core manifest, and add a parity test that fails on drift.
2. Consolidate theme bootstrap into one canonical generator and consume it from tokens/Nuxt instead of embedding variants.
3. Tighten DataGrid contracts (`field`/`column` as keyed generics), then remove cast-based access paths.
4. Split `DzCommandPalette` repeated item markup into a reusable render fragment/component to reduce branch duplication.
5. Decompose `useDialog` side effects into focused helpers (`scrollLock`, `ariaSiblings`, `focusTrap`, `outsideClick`) with isolated tests.
6. Centralize workspace alias resolution in one shared helper imported by Vitest/Vite/Storybook configs.
7. Decide explicitly on stub components/pages: complete contract+tests or remove/feature-flag to reduce ambiguous TODO surface.
8. Add lightweight consistency checks for published component-count metadata in README/Storybook/out artifacts.

## Overall Assessment
Code quality is solid and engineering discipline is strong. The primary maintainability threat is cross-surface drift, not local coding style. If single-source generation is enforced for component registration and theme bootstrap, and DataGrid key typing is tightened, refactor safety and long-term change velocity should improve materially.