# 08 Product and Docs Consistency

## Repository Overview
`ui/dzup-ui` is a Yarn 4 monorepo for a Vue 3 component library with publishable packages (`core`, `tokens`, `contracts`, `compat`, `codemods`, `nuxt`, `tooling`) plus `apps/sandbox` and `apps/storybook`.  
The implementation surface is large and mature (160 component SFCs under `packages/core/src/components`, 229 spec files across `packages`, `apps`, and `e2e`), but several product-facing docs and generated artifacts are out of sync with current exports, route/demo completeness, and Nuxt integration metadata.  
This review prioritizes drift that can mislead roadmap, release, and onboarding decisions over stylistic doc issues.

## Documentation Sources Reviewed
- `README.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `CLAUDE.md`
- `SECURITY.md`
- `package.json`
- `.changeset/config.json`
- `packages/core/README.md`
- `packages/core/manifests/public-api.manifest.json`
- `packages/core/src/index.ts`
- `packages/core/src/components/*/index.ts`
- `packages/core/src/providers/index.ts`
- `packages/core/src/resolver.ts`
- `packages/core/src/resolver.spec.ts`
- `packages/nuxt/package.json`
- `packages/nuxt/src/module.ts`
- `packages/nuxt/src/module.spec.ts`
- `apps/sandbox/src/router.ts`
- `apps/sandbox/src/pages/*Page.vue`
- `apps/storybook/stories/Introduction.mdx`
- `apps/storybook/.storybook/main.ts`
- `playwright.config.ts`
- `.github/workflows/ci.yml`
- `docs/analyze-full_2026_04_21/01_current_state_inventory.md` through `07_operability_and_release_readiness.md`
- `out/workspace-repo-docs-static/DZUP_UI.md`
- `out/workspace-repo-docs-static-portable-markdown/DZUP_UI.md`
- `out/workspace-repo-docs-static/SUMMARY.md`
- `out/workspace-repo-docs-static/NEXT_TASKS.md`
- `out/code-features-current/extracted/ui-dzup-ui.md`
- `out/code-features-live-sample-3/summaries/repos/ui-dzup-ui.md`
- `out/workspace-commit-groups/ui-dzup-ui/plan.json`
- `out/workspace-commit-groups/ui-dzup-ui/planning-context.batch-01.md`

## Alignment Areas
- Repo identity is consistent across docs and code: Vue 3 + TypeScript component library on Yarn 4 (`README.md`, `package.json`).
- The 11-family product taxonomy still matches implementation structure (`packages/core/src/components/*` and root export barrels).
- Interaction contract guidance is documented and enforced by tooling (`README.md`, `packages/core/src/styles/INTERACTION_CONTRACT.md`, `package.json` script `validate:interaction-contract`).
- CI quality-gate narrative broadly matches actual workflow lanes (typecheck, lint, unit/contract/a11y/SSR tests, build, validation) in `.github/workflows/ci.yml`.
- Public package lineup in README is mostly aligned with actual workspace packages in `packages/`.

## Drift Findings
1. **High: multiple conflicting component inventory truths across docs and implementation.**  
`README.md` and Storybook intro still state 147 components, while `CHANGELOG.md` states 146 for core. Current manifest enumerates 149 components, and current family component barrels export 158 component defaults (159 including `DzThemeProvider`). This makes roadmap sizing, release notes, and “done” criteria inconsistent.

2. **High: canonical manifest does not match currently exported component barrels.**  
`packages/core/src/index.ts` is marked auto-generated from `public-api.manifest.json`, but 9 exported components are absent from the manifest: `DzAppShell`, `DzCodeBlock`, `DzConfirmDialog`, `DzCopyButton`, `DzSidebar`, `DzSidebarFooter`, `DzSidebarHeader`, `DzSidebarItem`, `DzSidebarSection`. This is contract drift between declared API metadata and actual importable surface.

3. **High: Nuxt auto-import documentation and implementation are not consistent with core exports.**  
`packages/nuxt/package.json` claims “auto-imports all Dz* components,” but `packages/nuxt/src/module.ts` uses a hardcoded list that is materially stale. Against current exported Dz defaults (components + provider), Nuxt misses 44 names and includes 17 names no longer exported by core (examples: `DzSearchBox`, `DzTabsList`, `DzTabsTrigger`, `DzTabsContent`, `DzToastContainer`, `DzDrawer`, `DzCollapsible`, `DzStepperStep`). `packages/nuxt/src/module.spec.ts` only checks module existence and does not enforce parity.

4. **Medium: pro/core boundary semantics are inconsistent for `DzAppShell`.**  
`DzAppShell` is exported from core layout barrels, but resolver pro-prefix logic and Nuxt pro component list classify it as pro-oriented. This creates ambiguity around `includePro` behavior and expected package origin.

5. **Medium: contributor workflow docs point to wrong modification points.**  
`CONTRIBUTING.md` instructs contributors to export from `packages/core/src/index.ts` and place stories under `apps/storybook/src/stories/`. In reality, root index is generated from manifest, and Storybook loads component stories from `packages/core/stories/**/*.stories.ts`. This can lead to PR churn and invalid edits.

6. **Medium: hidden architecture guidance (`CLAUDE.md`) is stale vs current code reality.**  
It claims 155 component `.vue` files and “No `<style scoped>`,” while current core has 160 component SFCs and 24 scoped-style occurrences under `packages/core/src/components`. This is likely to mislead agent-driven and human implementation decisions.

7. **Medium: routed sandbox product story overstates implemented demo coverage.**  
Router exposes all families, but 5 route pages are still “coming soon” placeholders (`Data`, `Layout`, `Navigation`, `Media`, `Typography`). Placeholder copy uses stale names like `DzBreadcrumbs`, `DzNavbar`, and `DzSteps`; home metrics also show stale “146+” and “2300+” values.

8. **Medium-Low: changelog release narrative is partially out of date with current repo boundaries and metrics.**  
`CHANGELOG.md` includes an in-repo `@dzup-ui/pro` package narrative and historical counts/stacks (for example Storybook 8.5-era details) that do not reflect the current repo layout where pro is externalized and package/stat numbers have moved.

9. **Low-Medium: `out/` generated planning/index artifacts are stale enough to mislead decisions if treated as current truth.**  
Examples: `out/code-features-current/extracted/ui-dzup-ui.md` reports `components=40` and `tests=80`; `out/code-features-live-sample-3/.../ui-dzup-ui.md` reports `Features: 0`; `out/workspace-repo-docs-static/DZUP_UI.md` reports `documentedPackageCount: 0` despite `packages/core/README.md` existing. These artifacts were generated earlier and need explicit staleness handling.

## Product-Surface Consistency Review
- **Routed UI:** Surface appears broad in router, but sandbox demo completeness is uneven due placeholder pages. Product perception from sandbox exceeds implemented demo depth.
- **Exposed APIs:** Core import surface in barrels exceeds manifest-declared component inventory. Consumers can import components that are absent from the canonical manifest.
- **Feature flags/options:** `includePro` behavior is conceptually present in resolver and Nuxt module, but boundary naming is inconsistent (`DzAppShell`) and Nuxt core list parity is not enforced.
- **Actual capabilities vs verification:** CI is strong overall, but integration checks do not currently guarantee Nuxt component registry parity with core exports. E2E is Storybook-centric (`playwright.config.ts` points to Storybook), so sandbox route fidelity is not directly guarded.

## Onboarding Risk Review
- New engineers can follow outdated instructions and edit generated files or wrong story locations, slowing delivery and increasing review friction.
- PMs/release owners can mis-scope work when component counts differ across README, changelog, manifest, and exports.
- Nuxt adopters risk broken expectations from “auto-import all Dz*” messaging when components are missing or stale in hardcoded registries.
- Operators/researchers consuming `out/` artifacts as planning truth may underestimate test/component scope or draw incorrect quality conclusions.

## Recommended Doc Refresh Plan
1. Define one canonical inventory source and generate downstream docs from it.  
Use a single generated component inventory (from barrel exports or authoritative manifest) to drive README counts, Storybook intro copy, Nuxt `CORE_COMPONENTS`, and parity tests.

2. Enforce manifest-barrel parity in CI.  
Add a validation step that fails when component barrel exports and `public-api.manifest.json` diverge.

3. Correct Nuxt module metadata and tests.  
Either generate `CORE_COMPONENTS` from canonical inventory or add strict parity assertions in `packages/nuxt/src/module.spec.ts`; update package description if “all Dz*” is not guaranteed.

4. Fix contributor instructions immediately.  
Update `CONTRIBUTING.md` to reference manifest-first or generator-first workflow and correct Storybook story location guidance.

5. Refresh hidden architecture docs with live facts.  
Update `CLAUDE.md` component/file counts and styling constraints to match current codebase policies.

6. Reconcile sandbox messaging with actual demo completeness.  
Replace stale home metrics, remove stale component names, and explicitly label placeholder pages as planned demos.

7. Normalize changelog context for current repo boundaries.  
Clarify historical entries vs current package ownership (especially pro package externalization) and avoid presenting stale inventory values as current-state facts.

8. Regenerate or quarantine stale `out/` artifacts.  
Regenerate `out/code-features-*` and `out/workspace-repo-docs-static*` for current commit, and add visible freshness metadata (`generatedAt`, commit SHA, stale threshold). Move older snapshots to an archive path to avoid accidental operational use.

## Overall Assessment
Documentation reliability is **moderate for engineering internals but low for product-surface and planning accuracy**.  
Implementation quality and CI rigor are strong, yet source-of-truth fragmentation (README/changelog/manifest/barrels/Nuxt list/sandbox copy/`out` artifacts) creates avoidable decision risk for release messaging, onboarding, and integration expectations.