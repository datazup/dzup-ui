# 06 Performance and Scalability

## Repository Overview
`dzup-ui` is a frontend component-library monorepo, not an application backend. The dominant scalability surface is client-side rendering/state work in complex components and repository build/CI throughput as component count grows.

Evidence from the current tree:
- Large UI runtime surface in `@dzup-ui/core` with DataGrid/Tree/Select/CommandPalette and many compound components ([`packages/core/src/index.ts`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/index.ts), [`public-api.manifest.json`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/manifests/public-api.manifest.json)).
- Local static count confirms substantial component/test scale (160 Vue component files, 223 spec files).
- Secondary `out/` artifacts undercount live size (for example “40 components”), so they are weak for capacity planning without live-tree verification ([`out/code-features-current/extracted/ui-dzup-ui.md`](/media/ninel/Second/code/datazup/ai-internal-dev/out/code-features-current/extracted/ui-dzup-ui.md)).

Static-review caveat: no runtime profiling data was collected here; risk statements below are based on code structure and algorithmic behavior.

## Performance Profile
Main runtime paths likely to dominate latency/throughput/cost are:

- Data-grid transforms: full-array filtering, sorting, then pagination ([`useDataGridSort.ts:116`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGridSort.ts:116), [`useDataGridSort.ts:130`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGridSort.ts:130), [`useDataGridPagination.ts:91`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGridPagination.ts:91)).
- Grid header/body render loops: repeated lookup work per row/per column in template expressions ([`DzDataGridHeader.vue:100`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGridHeader.vue:100), [`DzDataGridBody.vue:71`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGridBody.vue:71)).
- Search-heavy controls on each keystroke: Combobox/Select/MultiSelect/CommandPalette all use client-side list filtering ([`DzCombobox.vue:136`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/forms/DzCombobox.vue:136), [`DzSelect.vue:110`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/forms/DzSelect.vue:110), [`DzMultiSelect.vue:92`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/forms/DzMultiSelect.vue:92), [`DzCommandPalette.vue:75`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/overlays/DzCommandPalette.vue:75)).
- Tree interactions: recursive node lookup and recursive subtree rendering ([`DzTree.vue:50`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzTree.vue:50), [`DzTreeItem.vue:150`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzTreeItem.vue:150)).
- Build/release throughput: many validations and package builds are serially chained in scripts/jobs ([`package.json`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json), [`ci.yml:116`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:116), [`ci.yml:158`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:158)).

## Strong Areas
- Many components use CSS containment (`contain: layout style`), reducing layout invalidation blast radius ([`DzDataGrid.vue:147`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGrid.vue:147), [`DzSelect.vue:185`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/forms/DzSelect.vue:185), [`DzCommandPalette.vue:156`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/overlays/DzCommandPalette.vue:156)).
- Toast memory is explicitly bounded by `maxToasts` ([`DzToastProvider.vue:24`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/feedback/DzToastProvider.vue:24), [`DzToastProvider.vue:54`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/feedback/DzToastProvider.vue:54)).
- Event/timer cleanup is generally disciplined (theme/media listener cleanup, carousel timer cleanup, dialog teardown) ([`DzThemeProvider.vue:130`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/providers/DzThemeProvider.vue:130), [`DzCarousel.vue:108`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/media/DzCarousel.vue:108), [`useDialog.ts:240`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDialog/useDialog.ts:240)).
- There are baseline non-functional gates: perf mount benchmarks and bundle budget checks in tooling/CI ([`perf-bench.spec.ts:95`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/src/perf-bench.spec.ts:95), [`bundle-budget-check.ts:209`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/src/bundle-budget-check.ts:209), [`ci.yml:179`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:179)).
- CI has parallel top-level jobs and run-cancellation via concurrency group, which helps scaling PR volume ([`ci.yml:9`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:9), [`ci.yml:18`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:18), [`ci.yml:64`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:64)).

## Performance Findings
1. **High: DataGrid performs full in-memory filter/sort before pagination.**  
Evidence: [`useDataGridSort.ts:121`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGridSort.ts:121), [`useDataGridSort.ts:135`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGridSort.ts:135), [`useDataGridPagination.ts:91`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGridPagination.ts:91).  
**Inference from static structure:** latency grows with total dataset size, not page size; large datasets will push main-thread cost even when rendering a small page.

2. **High: DataGrid selection state checks are algorithmically expensive in render paths.**  
Evidence: nested `every/some` membership checks in [`useDataGrid.ts:176`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGrid.ts:176), [`useDataGrid.ts:187`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useDataGrid/useDataGrid.ts:187), plus repeated `isRowSelected` calls per row in template [`DzDataGridBody.vue:71`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGridBody.vue:71).  
**Inference from static structure:** as selected row count and visible row count increase, selection toggles/rerenders become progressively heavier.

3. **Medium-High: Header-level DataGrid lookups repeat `.find()` work across every header cell render.**  
Evidence: multiple `sortModel.find(...)` invocations in template for each column ([`DzDataGridHeader.vue:100`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGridHeader.vue:100), [`DzDataGridHeader.vue:118`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGridHeader.vue:118), [`DzDataGridHeader.vue:119`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzDataGridHeader.vue:119)).  
**Inference from static structure:** this adds avoidable per-render overhead as column counts rise.

4. **Medium: Searchable controls perform full-list transforms on each input update with no built-in virtualization/windowing.**  
Evidence in Combobox/Select/MultiSelect/CommandPalette filtering paths ([`DzCombobox.vue:126`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/forms/DzCombobox.vue:126), [`DzSelect.vue:110`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/forms/DzSelect.vue:110), [`DzMultiSelect.vue:92`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/forms/DzMultiSelect.vue:92), [`DzCommandPalette.vue:75`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/overlays/DzCommandPalette.vue:75)).  
**Inference from static structure:** high-option counts can degrade keystroke responsiveness.

5. **Medium: Tree operations use recursive lookup and recursive rendering with array-membership checks.**  
Evidence: [`DzTree.vue:50`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzTree.vue:50), [`DzTree.vue:64`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzTree.vue:64), [`DzTreeItem.vue:27`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzTreeItem.vue:27), [`DzTreeItem.vue:150`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/data/DzTreeItem.vue:150).  
**Inference from static structure:** deeply nested or very wide trees will stress both JS and DOM.

6. **Low-Medium: Global shortcut/event work scales per mounted instance for some components/composables.**  
Evidence: command palette registers document keydown per instance ([`DzCommandPalette.vue:119`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/overlays/DzCommandPalette.vue:119)); sidebar adds its own document listener per consumer ([`useSidebar.ts:232`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useSidebar/useSidebar.ts:232)).  
**Inference from static structure:** many simultaneous instances can duplicate global listener work and increase coordination complexity.

## Frontend Responsiveness Review
- Rendering model is mostly reactive-computed + `v-for`; this is clean for typical datasets but there is no built-in view windowing for large grids/trees/long option lists.
- Data loading is caller-provided; components assume in-memory arrays and immediately process them client-side (not incremental streaming or server-paginated by contract), especially in DataGrid and search controls.
- Polling behavior is minimal, which is good. Timer usage is mostly UX timers (debounce, dismiss, autoplay). This limits background CPU pressure but autoplay/search can still add cumulative work at scale.
- State size is mostly bounded except user-provided arrays. Positive exception: toast queue has max cap.
- Known large-view stress points:
  - DataGrid selection/filter/sort compounds work as row count rises.
  - Tree recursion + `includes` checks can become sluggish with large expanded sets.
  - Option-heavy controls filter/render all candidates per search change.
- Existing perf checks are useful but narrow: current benchmark suite targets mount-time thresholds, not interaction latency under large fixtures ([`perf-bench.spec.ts:96`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tooling/src/perf-bench.spec.ts:96)).

## Backend And Data-Path Review
This repository has no traditional backend data path (no database access layer, queue workers, retry/backoff pipelines, event-stream processors, or cron orchestration in the reviewed source).  
Static scan signals support this: runtime code is UI-focused (`packages/core`, `packages/tokens`, `packages/nuxt`, `apps/storybook`, `apps/sandbox`) and network/provider calls are effectively absent in runtime source.

Applicable “backend-like” scalability path here is build/release automation:

- Validation/build flows are extensive and partially serial inside jobs ([`package.json`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json), [`ci.yml:96`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:96), [`ci.yml:137`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:137)).
- Token generation is synchronous and writes complete artifacts in one pass ([`generate.ts:421`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/tokens/src/generate.ts:421)).
- Nuxt module registers a large static component list loop at setup time ([`module.ts:22`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:22), [`module.ts:252`](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:252)).

## Scalability Constraints
- **Main-thread ceiling:** architecture assumes client-side in-memory transforms for most high-cardinality interactions.
- **DOM ceiling:** no virtualization/windowing primitives in heavy list/tree/grid surfaces.
- **Algorithmic ceiling:** frequent `.filter/.find/.some/.includes` patterns in render/computed paths produce superlinear behavior as cardinality grows.
- **Instance ceiling:** global keyboard listeners attached per component/composable instance can stack in large pages/apps.
- **CI cost-growth:** build and validation breadth is strong but total wall-clock cost will rise with package/component growth unless more work is parallelized/cached.
- **Planning-data ceiling:** secondary `out/` feature summaries underrepresent current size, weakening forecasting if used as primary telemetry.

## Recommended Optimization Plan
### Immediate (high leverage, low-medium effort)
1. Refactor DataGrid selection internals to `Set`-based membership keyed by row ID; avoid repeated nested `some` checks.
2. Cache per-column sort state in DataGrid header render cycle to eliminate repeated `sortModel.find(...)`.
3. Add optional debounce and render caps for large option lists in `DzSelect`, `DzMultiSelect`, `DzCombobox`, and `DzCommandPalette`.
4. Add an optional global shortcut coordinator so only one command-palette key handler is active per document.
5. Extend perf tests from mount-only to interaction scenarios (typing/filtering/selection with large fixtures: 1k/5k/10k).
6. Add CI metrics output trend for key checks (build time, test time, bundle sizes) to catch throughput regressions earlier.

### Structural (medium-high effort)
1. Introduce reusable virtualization primitives and adopt them in DataGrid, Tree, and long-option overlays.
2. Add a server-data mode to DataGrid contract (remote sort/filter/pagination callbacks) so large datasets are not fully transformed in-browser.
3. Build indexed tree state (`Map` + `Set`) for node lookup, expanded, and selected membership to reduce recursive/full-scan pressure.
4. Generate Nuxt component registry from the core manifest to reduce drift and allow scaling without manual list maintenance.
5. Parallelize independent validation lanes further and persist cache artifacts between jobs to control CI growth as the library expands.