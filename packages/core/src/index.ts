/**
 * AUTO-GENERATED — Do not edit manually.
 * Generated from public-api.manifest.json (ADR-01).
 * Run: tsx packages/tooling/src/manifest-generator.ts <package-dir>
 */

import './styles/base.css'

// ── Components ──

// Buttons family
export * from './components/buttons/index.ts'

// Cards family
export * from './components/cards/index.ts'

// Data family
export * from './components/data/index.ts'

// Feedback family
export * from './components/feedback/index.ts'

// Forms family
export * from './components/forms/index.ts'

// Inputs family
export * from './components/inputs/index.ts'

// Layout family
export * from './components/layout/index.ts'

// Media family
export * from './components/media/index.ts'

// Navigation family
export * from './components/navigation/index.ts'

// Overlays family
export * from './components/overlays/index.ts'

// Typography family
export * from './components/typography/index.ts'

// ── Composables ──

// Provider composables (TASK-OSS-P4-01, ADR-20).
//
// This barrel is maintained BY HAND and carries comments `yarn generate:exports`
// would strip. Its export lines match public-api.manifest.json: the owner
// decision of 2026-09-25 (docs/qa/release-decisions-2026-09-25/ADMISSION.md)
// kept useAffix, useCalendar, useInfiniteScroll, useScrollSpy and useScrollToTop
// public and left useCountdown and useIntersection internal, and moved the
// manifest to match. `yarn release:api-diff` reports any line a regeneration
// would drop or add. Keep the two in step: a composable added here needs a
// manifest entry, and the reverse.
export * from './composables/provider/index.ts'

export * from './composables/useAffix/index.ts'
// `useDualModel` merges a control's default and named v-model so a renderer can
// bind either (TASK-FORM-OSS-02); `useAsyncOptions` is the one async-options
// seam all seven selection controls share (TASK-FORM-OSS-03). Both carry an
// entry in public-api.manifest.json, as the block above requires.
export * from './composables/useAsyncOptions/index.ts'
export * from './composables/useCalendar/index.ts'
export * from './composables/useClickOutside/index.ts'
export * from './composables/useCollapse/index.ts'
export * from './composables/useDataGrid/index.ts'
export * from './composables/useDataGridHeader/index.ts'
export * from './composables/useDatePicker/index.ts'
export * from './composables/useDialog/index.ts'
export * from './composables/useDualModel/index.ts'
export * from './composables/useEscapeKey/index.ts'
export * from './composables/useFloating/index.ts'
export * from './composables/useFocusTrap/index.ts'
export * from './composables/useFormField/index.ts'
export * from './composables/useInfiniteScroll/index.ts'
export * from './composables/useRevealAndFocus/index.ts'
export * from './composables/useScrollSpy/index.ts'
export * from './composables/useScrollToTop/index.ts'
export * from './composables/useSelect/index.ts'
export * from './composables/useSidebar/index.ts'
export * from './composables/useTabs/index.ts'
export * from './composables/useToast/index.ts'
export * from './composables/useTransfer/index.ts'

// i18n (TASK-R5-O4). Two
// jobs: `useDzMessageFormat` joins the provider readers, and re-exporting this
// module makes `dist/index.d.ts` reference `i18n/messages.d.ts` — the file that
// augments `DzMessageCatalog`. Before, nothing reachable from the root
// declarations did, so a consumer's TypeScript saw an empty catalog (N5-04 F9).
// The same module is the `./i18n` subpath; the manifest carries an `i18n`
// composables entry for it.
export * from './i18n/index.ts'

// ── Providers ──

export * from './providers/index.ts'

// ── Utilities ──

export { cn } from './utilities/cn.ts'
