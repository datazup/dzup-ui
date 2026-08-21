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
// Added BY HAND, not by `yarn generate:exports`. That generator rewrites this
// whole barrel from public-api.manifest.json, and the two have drifted: a
// regeneration today would DROP useAffix, useCalendar, useInfiniteScroll,
// useScrollSpy and useScrollToTop from the public API and ADD useCountdown and
// useIntersection to it. That drift is a recorded owner decision (TASK-OSS-P0-01
// finding 2) and resolving it is an API change, not a side effect of adding a
// composable. The manifest carries the `provider` entry too, so whenever the
// drift IS resolved, a regeneration keeps this line.
export * from './composables/provider/index.ts'

export * from './composables/useAffix/index.ts'
export * from './composables/useCalendar/index.ts'
export * from './composables/useClickOutside/index.ts'
export * from './composables/useCollapse/index.ts'
export * from './composables/useDataGrid/index.ts'
export * from './composables/useDataGridHeader/index.ts'
export * from './composables/useDatePicker/index.ts'
export * from './composables/useDialog/index.ts'
export * from './composables/useEscapeKey/index.ts'
export * from './composables/useFloating/index.ts'
export * from './composables/useFocusTrap/index.ts'
export * from './composables/useFormField/index.ts'
export * from './composables/useInfiniteScroll/index.ts'
export * from './composables/useScrollSpy/index.ts'
export * from './composables/useScrollToTop/index.ts'
export * from './composables/useSelect/index.ts'
export * from './composables/useSidebar/index.ts'
export * from './composables/useTabs/index.ts'
export * from './composables/useToast/index.ts'
export * from './composables/useTransfer/index.ts'

// ── Providers ──

export * from './providers/index.ts'

// ── Utilities ──

export { cn } from './utilities/cn.ts'
