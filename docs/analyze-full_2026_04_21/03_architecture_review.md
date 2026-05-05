# 03 Architecture Review

## Repository Overview
`dzup-ui` is a Yarn 4 workspace monorepo with 7 packages and 2 internal apps, organized as a UI platform rather than a single application runtime. The architecture centers on a layered package model:

- `@dzup-ui/core`: runtime component/composable/provider layer (largest surface, 160 Vue components, 17 composable groups).
- `@dzup-ui/tokens`: design-token source plus generation pipeline for CSS and TypeScript artifacts.
- `@dzup-ui/contracts`: canonical type contracts for props/events/slots and shared utility types.
- `@dzup-ui/compat`: migration adapters and deprecation utilities.
- `@dzup-ui/codemods`: source-level migration runner and transform registry.
- `@dzup-ui/nuxt`: framework integration package for registration and bootstrap.
- `apps/sandbox` and `apps/storybook`: local UI harnesses for manual validation and docs.

This is architecturally a package ecosystem with adapters and tooling, not a business app with server-side domains.

## Architectural Overview
The high-level design is a clean “platform + adapters + tooling” split:

- Platform core:
  UI primitives and compound components live in `core`, with composables orchestrating state transitions and providers handling cross-tree concerns (theme/context).
- Styling system:
  `tokens` generates CSS variable layers and Tailwind-compatible theme outputs; `core` consumes these through CSS imports and variant systems.
- Type system:
  `contracts` provides shared API vocabulary to keep component signatures consistent.
- Migration system:
  `compat` handles runtime backward compatibility while `codemods` handles source migration.
- Integration system:
  `nuxt` and resolver APIs provide framework-level auto-import and bootstrap extension points.
- Runtime harnesses:
  `sandbox` route wiring and Storybook story wiring form the primary request/UI flow for local interaction and visual verification.

Main UI/event flow boundaries are:

- Consumer flow:
  app entry -> component import/auto-resolve -> component local/composable state -> token-driven CSS resolution.
- Compound component flow:
  root component -> `provide` context -> child part `inject` -> coordinated behavior and slot rendering.
- Theme flow:
  head script bootstrap -> provider state resolution -> DOM theme attribute -> token layer activation.
- Dev/demo flow:
  route family pages / Storybook stories -> same package runtime surfaces as external consumers.

## Strong Architectural Areas
- Package segmentation is intentional and mostly coherent:
  foundational runtime (`core`), design system (`tokens`), types (`contracts`), migration (`compat` + `codemods`), and framework integration (`nuxt`) are distinct units.
- Manifest-driven export management in `core` is a strong architecture choice:
  it reduces manual barrel drift and keeps public API composition systematic.
- Compound component patterns are consistently implemented:
  typed context keys and `provide/inject` usage produce repeatable internal contracts across data/navigation/overlay families.
- State-management shape fits a component library:
  local refs/computed/watch and composables dominate; there is no unnecessary global store coupling.
- Theming architecture is well-structured:
  token tiers, provider APIs, and first-paint script support are clearly separated concerns.
- Validation architecture is mature:
  custom boundary, export, declaration, peer, and license checks create strong non-functional guardrails around the codebase.

## Architectural Tensions
- Domain leakage inside the foundational layer:
  orchestration-specific run-status/governance concerns and external orchestration typing are present in `core`, which weakens “framework-agnostic UI foundation” boundaries.
- Registry drift risk in integration:
  Nuxt uses a manually maintained component registry that is currently out of sync with core manifest reality (hard mismatch, not just naming style differences).
- Source-of-truth duplication for theme bootstrap:
  similar theme-init logic exists in multiple places (tokens utility, core provider utility, Nuxt inline script), increasing drift probability.
- Layer inversion between composables and component-local types:
  several composables import types from component folders, creating reverse dependency pressure and tighter coupling than necessary.
- Hotspot concentration:
  a small set of very large modules/composables now carries disproportionate complexity, especially advanced data and overlay behaviors.
- Configuration duplication:
  workspace alias mapping is repeated across sandbox, Storybook, and test config, creating maintenance overhead and possible environment skew.
- Tooling policy gaps:
  boundary validation policy coverage does not fully include all integration surfaces, leaving enforcement asymmetry at package edges.
- Observability drift in secondary artifacts:
  `out/` summaries undercount current component/test scale, reducing trust in generated architecture telemetry.

## Domain Boundary Review
Responsibility separation is good at package level, but several boundaries should be tightened.

- Apps vs packages:
  `sandbox` and Storybook are correctly local harnesses; routing, demo navigation, and showcase-only metadata should remain app-local.
- Core vs shared packages:
  `core` should remain domain-neutral component runtime; `tokens` and `contracts` are correctly positioned as shared foundational packages.
- Integration boundary:
  `nuxt` should consume canonical component metadata, not maintain an independent inventory list.
- Migration boundary:
  `compat` and `codemods` are correctly isolated as transitional layers and should not become long-term homes for new feature development.
- State boundary:
  current architecture favors component/composable-local state with scoped context sharing; this is the right shape for a reusable UI library.
- Shared logic candidates:
  component registry metadata and theme bootstrap script generation should be centralized and consumed by all adapters.
- Extraction candidates:
  orchestration/agent-specific UI primitives should move to an optional extension package to preserve clean domain boundaries in `core`.

## Operational Architecture Review
- Queues/workers:
  no runtime queue/worker subsystem exists, which is appropriate for this repository type.
- Feature flags and toggles:
  extension toggles are lightweight and package-scoped (`includePro`, naming prefix), not a global flag framework.
- Persistence boundaries:
  runtime persistence is intentionally minimal and client-only (theme/sidebar preferences via browser storage).
- Observability hooks:
  mostly local console warnings and test assertions; there is no cross-package runtime telemetry abstraction.
- Error handling:
  browser-API interactions are generally wrapped defensively with graceful fallback behavior.
- Failure isolation:
  strongest isolation is at build/CI stage boundaries, not runtime process isolation.
- Integration weak point:
  Nuxt registration and theme bootstrap wiring are the most fragile operational boundary due to manual lists and duplicated bootstrap logic.

## Structural Recommendations
| Priority | Recommendation | Leverage | Implementation Risk |
|---|---|---|---|
| 1 | Replace manual integration registries with one generated component-inventory artifact consumed by `core`, `nuxt`, and docs/harnesses. | Very high | Medium |
| 2 | Extract orchestration-specific badges/types from `core` into an optional extension package (keep core domain-neutral). | High | Medium |
| 3 | Consolidate theme bootstrap to a single generator API, and make Nuxt/tokens wrappers consume that source. | High | Low |
| 4 | Introduce an internal shared type layer for composables so composables no longer depend on component-local type modules. | High | Medium |
| 5 | Expand architecture policy gates to full package surface parity (including all integration adapters) and close validator coverage gaps. | High | Low |
| 6 | Split large hotspot modules into state, adapter, and render-focused slices with explicit internal contracts. | Medium | Medium |
| 7 | Centralize alias/config composition used by sandbox, Storybook, and tests to reduce config drift. | Medium | Low |
| 8 | Add lightweight architecture drift checks against generated metadata (component counts/inventories) to keep docs and secondary artifacts current. | Medium | Low |

## Overall Assessment
The architecture is fundamentally strong and maintainable: package-level layering is clear, composition patterns are consistent, and quality guardrails are above typical UI-library baselines. The main risks are boundary drift and source-of-truth duplication, not missing architectural foundations. With registry unification, domain extraction from `core`, and tighter adapter boundary enforcement, the codebase is architecturally ready for continued growth with manageable refactor cost.