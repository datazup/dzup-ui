# API diff — `@dzup-ui/*` published packages

> Generated 2026-09-24T20:39:27.441Z by `release:api-diff`.
> Source: `0a47569ece7f5a1c41f05e2eb8fcb3281256ee8c` on `release-evidence-20260924` · worktree **clean** · **admissible: true**

| Package | Baseline (fidelity) | Added | Removed | Changed | Level required | Changeset declares |
|---|---|---|---|---|---|---|
| `@dzup-ui/contracts` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/core` | public-api.manifest.json@worktree (manifest-only) | 455 | 6 | 0 | **minor** | minor |
| `@dzup-ui/mcp` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | patch |
| `@dzup-ui/nuxt` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/testing` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/tokens` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | patch |

## `generate:exports` drift — what the generator would actually change

### `@dzup-ui/core` (`packages/core/src/index.ts`) — **drifted**

- **would DROP 5 line(s)** — every symbol behind them leaves the public surface (breaking, VERSIONING.md §2.1, requires `minor`):
  - `export * from './composables/useAffix/index.ts'`
  - `export * from './composables/useCalendar/index.ts'`
  - `export * from './composables/useInfiniteScroll/index.ts'`
  - `export * from './composables/useScrollSpy/index.ts'`
  - `export * from './composables/useScrollToTop/index.ts'`
- **would ADD 2 line(s)** the manifest declares and the barrel lacks:
  - `export * from './composables/useCountdown/index.ts'`
  - `export * from './composables/useIntersection/index.ts'`

  Reported, never resolved: which side is right — the barrel or the manifest — is an owner call, routed to **TASK-R0-O1**.

## Manifest reconciliation — packed surface vs the documented name lists

**A different question from the drift above.** The generator star-re-exports components, composables and providers and enumerates names only for `utilities`, so a manifest name list is documentation a star re-export never consults. These rows measure how stale that documentation is against what a consumer receives.

### `@dzup-ui/core` — manifest declares version 0.0.1, package is 0.2.0

- **455 exported and undocumented** — by kind: 43 component, 26 const, 68 function, 223 interface, 95 type
- **6 documented and undelivered**: `UseIntersectionOptions`, `UseIntersectionReturn`, `formatRemaining`, `toRemainingParts`, `useCountdown`, `useIntersection`

## Stop conditions (doc 08 §Release stop conditions)

| Code | Detail |
|---|---|
| `unexplained-api-diff` | @dzup-ui/core: `yarn generate:exports` would DROP 5 barrel line(s) — every symbol behind them leaves the public surface. Breaking under VERSIONING.md §2.1, requiring a `minor`, performed by a generator with no changeset behind it: export * from './composables/useAffix/index.ts' / export * from './composables/useCalendar/index.ts' / export * from './composables/useInfiniteScroll/index.ts' / export * from './composables/useScrollSpy/index.ts' / export * from './composables/useScrollToTop/index.ts'. Owner decision, routed to TASK-R0-O1. |
| `manifest-omission` | @dzup-ui/core: `yarn generate:exports` would ADD 2 barrel line(s) the manifest declares and the barrel does not have: export * from './composables/useCountdown/index.ts' / export * from './composables/useIntersection/index.ts'. |
| `manifest-omission` | @dzup-ui/core: 455 symbol(s) reach a consumer through the root barrel and are absent from public-api.manifest.json's documented name lists. Not a generator action (the barrel star-re-exports); a stale document other tooling has already been moved off (TASK-N2-A1). |
| `manifest-omission` | @dzup-ui/core: 6 symbol(s) are promised by public-api.manifest.json and absent from the packed build. |

## Changes

### `@dzup-ui/contracts` — 1 change(s), fidelity `none`

| Kind | Symbol | Severity | Level | Detail |
|---|---|---|---|---|
| unbaselined | `167 symbol(s)` | none | none | no baseline of any kind exists for this package — nothing has been published and no snapshot has been recorded. The surface is reported, not diffed. |

### `@dzup-ui/core` — 461 change(s), fidelity `manifest-only`

| Kind | Symbol | Severity | Level | Detail |
|---|---|---|---|---|
| added | `AnchorVariantProps` | additive | patch | new type on ., ./navigation |
| added | `AppShellVariantProps` | additive | patch | new type on ., ./layout |
| added | `AsyncOptionsMessages` | additive | patch | new interface on . |
| added | `AsyncOptionsRow` | additive | patch | new type on . |
| added | `BackTopVariantProps` | additive | patch | new type on ., ./navigation |
| added | `BlockUiVariantProps` | additive | patch | new type on ., ./feedback |
| added | `CalendarDay` | additive | patch | new interface on . |
| added | `CalendarMode` | additive | patch | new type on ., ./data |
| added | `CalendarPanelChangePayload` | additive | patch | new interface on ., ./data |
| added | `CalendarRangeValue` | additive | patch | new interface on ., ./data |
| added | `CalendarVariantProps` | additive | patch | new type on ., ./data |
| added | `CalendarView` | additive | patch | new type on . |
| added | `CascaderVariantProps` | additive | patch | new type on ., ./forms |
| added | `CodeBlockVariantProps` | additive | patch | new type on ., ./data |
| added | `ColorModeToggleVariantProps` | additive | patch | new type on ., ./navigation |
| added | `ConfirmDialogVariantProps` | additive | patch | new type on ., ./overlays |
| added | `CoordinatorPattern` | additive | patch | new type on ., ./feedback |
| added | `CopyButtonVariantProps` | additive | patch | new type on ., ./buttons |
| added | `DZ_DESCRIPTIONS_KEY` | additive | patch | new const on ., ./data |
| added | `DZ_SIDEBAR_KEY` | additive | patch | new const on ., ./navigation |
| added | `DataViewLayout` | additive | patch | new type on ., ./data |
| added | `DataViewSortOption` | additive | patch | new interface on ., ./data |
| added | `DataViewSortOrder` | additive | patch | new type on ., ./data |
| added | `DataViewSortPayload` | additive | patch | new interface on ., ./data |
| added | `DataViewVariantProps` | additive | patch | new type on ., ./data |
| added | `DescriptionsColumns` | additive | patch | new type on ., ./data |
| added | `DescriptionsItem` | additive | patch | new interface on ., ./data |
| added | `DescriptionsLayout` | additive | patch | new type on ., ./data |
| added | `DescriptionsResponsiveColumns` | additive | patch | new interface on ., ./data |
| added | `DescriptionsVariantProps` | additive | patch | new type on ., ./data |
| added | `DzAffix` | additive | patch | new component on ., ./layout |
| added | `DzAffixEmits` | additive | patch | new interface on ., ./layout |
| added | `DzAffixProps` | additive | patch | new interface on ., ./layout |
| added | `DzAffixSlots` | additive | patch | new interface on ., ./layout |
| added | `DzAnchor` | additive | patch | new component on ., ./navigation |
| added | `DzAnchorEmits` | additive | patch | new interface on ., ./navigation |
| added | `DzAnchorItem` | additive | patch | new interface on ., ./navigation |
| added | `DzAnchorItemSlotProps` | additive | patch | new interface on ., ./navigation |
| added | `DzAnchorProps` | additive | patch | new interface on ., ./navigation |
| added | `DzAnchorSlots` | additive | patch | new interface on ., ./navigation |
| added | `DzAppShell` | additive | patch | new component on ., ./layout |
| added | `DzAppShellProps` | additive | patch | new interface on ., ./layout |
| added | `DzAppShellSlots` | additive | patch | new interface on ., ./layout |
| added | `DzAsyncBoundary` | additive | patch | new component on ., ./feedback |
| added | `DzAsyncBoundaryEmits` | additive | patch | new interface on ., ./feedback |
| added | `DzAsyncBoundaryProps` | additive | patch | new interface on ., ./feedback |
| added | `DzAsyncBoundarySlots` | additive | patch | new interface on ., ./feedback |
| added | `DzBackTop` | additive | patch | new component on ., ./navigation |
| added | `DzBackTopEmits` | additive | patch | new interface on ., ./navigation |
| added | `DzBackTopProps` | additive | patch | new interface on ., ./navigation |
| added | `DzBackTopSlots` | additive | patch | new interface on ., ./navigation |
| added | `DzBlockUI` | additive | patch | new component on ., ./feedback |
| added | `DzBlockUIEmits` | additive | patch | new interface on ., ./feedback |
| added | `DzBlockUIProps` | additive | patch | new interface on ., ./feedback |
| added | `DzBlockUISlotProps` | additive | patch | new interface on ., ./feedback |
| added | `DzBlockUISlots` | additive | patch | new interface on ., ./feedback |
| added | `DzCalendar` | additive | patch | new component on ., ./data |
| added | `DzCalendarDaySlotProps` | additive | patch | new interface on ., ./data |
| added | `DzCalendarEmits` | additive | patch | new interface on ., ./data |
| added | `DzCalendarModelValue` | additive | patch | new type on ., ./data |
| added | `DzCalendarProps` | additive | patch | new interface on ., ./data |
| added | `DzCalendarSlots` | additive | patch | new interface on ., ./data |
| added | `DzCascader` | additive | patch | new component on ., ./forms |
| added | `DzCascaderEmits` | additive | patch | new interface on ., ./forms |
| added | `DzCascaderExpandTrigger` | additive | patch | new type on ., ./forms |
| added | `DzCascaderFlatPath` | additive | patch | new interface on ., ./forms |
| added | `DzCascaderKey` | additive | patch | new type on ., ./forms |
| added | `DzCascaderOption` | additive | patch | new interface on ., ./forms |
| added | `DzCascaderProps` | additive | patch | new interface on ., ./forms |
| added | `DzCascaderSlots` | additive | patch | new interface on ., ./forms |
| added | `DzCascaderValue` | additive | patch | new type on ., ./forms |
| added | `DzCodeBlock` | additive | patch | new component on ., ./data |
| added | `DzCodeBlockProps` | additive | patch | new interface on ., ./data |
| added | `DzCodeBlockSlots` | additive | patch | new interface on ., ./data |
| added | `DzColorModeToggleEmits` | additive | patch | new interface on ., ./navigation |
| added | `DzColorModeToggleLabels` | additive | patch | new interface on ., ./navigation |
| added | `DzColorModeToggleProps` | additive | patch | new interface on ., ./navigation |
| added | `DzColorModeToggleSlots` | additive | patch | new interface on ., ./navigation |
| added | `DzColorModeToggleVariant` | additive | patch | new type on ., ./navigation |
| added | `DzComboboxItem` | additive | patch | new type on ., ./forms |
| added | `DzComboboxResolvedItem` | additive | patch | new interface on ., ./forms |
| added | `DzConfirmDialog` | additive | patch | new component on ., ./overlays |
| added | `DzConfirmDialogEmits` | additive | patch | new interface on ., ./overlays |
| added | `DzConfirmDialogProps` | additive | patch | new interface on ., ./overlays |
| added | `DzConfirmDialogSlots` | additive | patch | new interface on ., ./overlays |
| added | `DzCopyButton` | additive | patch | new component on ., ./buttons |
| added | `DzCopyButtonEmits` | additive | patch | new interface on ., ./buttons |
| added | `DzCopyButtonProps` | additive | patch | new interface on ., ./buttons |
| added | `DzCopyButtonSlots` | additive | patch | new interface on ., ./buttons |
| added | `DzDataGridFilter` | additive | patch | new interface on ., ./data |
| added | `DzDataView` | additive | patch | new function on ., ./data |
| added | `DzDataViewEmits` | additive | patch | new interface on ., ./data |
| added | `DzDataViewItemSlotProps` | additive | patch | new interface on ., ./data |
| added | `DzDataViewProps` | additive | patch | new interface on ., ./data |
| added | `DzDataViewSlots` | additive | patch | new interface on ., ./data |
| added | `DzDataViewSortSlotProps` | additive | patch | new interface on ., ./data |
| added | `DzDescriptions` | additive | patch | new component on ., ./data |
| added | `DzDescriptionsContext` | additive | patch | new interface on ., ./data |
| added | `DzDescriptionsItem` | additive | patch | new component on ., ./data |
| added | `DzDescriptionsItemProps` | additive | patch | new interface on ., ./data |
| added | `DzDescriptionsItemSlots` | additive | patch | new interface on ., ./data |
| added | `DzDescriptionsProps` | additive | patch | new interface on ., ./data |
| added | `DzDescriptionsSlots` | additive | patch | new interface on ., ./data |
| added | `DzDialogCloseProps` | additive | patch | new interface on ., ./overlays |
| added | `DzErrorBoundary` | additive | patch | new component on ., ./feedback |
| added | `DzErrorBoundaryProps` | additive | patch | new interface on ., ./feedback |
| added | `DzErrorBoundarySlots` | additive | patch | new interface on ., ./feedback |
| added | `DzFab` | additive | patch | new component on ., ./buttons |
| added | `DzFabEmits` | additive | patch | new interface on ., ./buttons |
| added | `DzFabPosition` | additive | patch | new type on ., ./buttons |
| added | `DzFabProps` | additive | patch | new interface on ., ./buttons |
| added | `DzFabSlots` | additive | patch | new interface on ., ./buttons |
| added | `DzFabVariant` | additive | patch | new type on ., ./buttons |
| added | `DzFieldArray` | additive | patch | new function on ., ./forms |
| added | `DzFieldArrayEmits` | additive | patch | new interface on ., ./forms |
| added | `DzFieldArrayProps` | additive | patch | new interface on ., ./forms |
| added | `DzFieldArraySlotProps` | additive | patch | new interface on ., ./forms |
| added | `DzFieldArraySlots` | additive | patch | new interface on ., ./forms |
| added | `DzFloatLabel` | additive | patch | new component on ., ./forms |
| added | `DzFloatLabelProps` | additive | patch | new interface on ., ./forms |
| added | `DzFloatLabelSlots` | additive | patch | new interface on ., ./forms |
| added | `DzFloatLabelVariant` | additive | patch | new type on ., ./forms |
| added | `DzImageComparison` | additive | patch | new component on ., ./media |
| added | `DzImageComparisonEmits` | additive | patch | new interface on ., ./media |
| added | `DzImageComparisonProps` | additive | patch | new interface on ., ./media |
| added | `DzImageComparisonSlots` | additive | patch | new interface on ., ./media |
| added | `DzInfiniteScroll` | additive | patch | new component on ., ./data |
| added | `DzInfiniteScrollEmits` | additive | patch | new interface on ., ./data |
| added | `DzInfiniteScrollErrorSlotProps` | additive | patch | new interface on ., ./data |
| added | `DzInfiniteScrollExpose` | additive | patch | new interface on ., ./data |
| added | `DzInfiniteScrollProps` | additive | patch | new interface on ., ./data |
| added | `DzInfiniteScrollSlots` | additive | patch | new interface on ., ./data |
| added | `DzInplace` | additive | patch | new function on ., ./forms |
| added | `DzInplaceDisplaySlotProps` | additive | patch | new interface on ., ./forms |
| added | `DzInplaceEditSlotProps` | additive | patch | new interface on ., ./forms |
| added | `DzInplaceEmits` | additive | patch | new interface on ., ./forms |
| added | `DzInplaceProps` | additive | patch | new interface on ., ./forms |
| added | `DzInplaceSaveOn` | additive | patch | new type on ., ./forms |
| added | `DzInplaceSlots` | additive | patch | new interface on ., ./forms |
| added | `DzInputMask` | additive | patch | new component on ., ./inputs |
| added | `DzInputMaskEmits` | additive | patch | new interface on ., ./inputs |
| added | `DzInputMaskProps` | additive | patch | new interface on ., ./inputs |
| added | `DzInputMaskSlots` | additive | patch | new interface on ., ./inputs |
| added | `DzKnob` | additive | patch | new component on ., ./forms |
| added | `DzKnobEmits` | additive | patch | new interface on ., ./forms |
| added | `DzKnobProps` | additive | patch | new interface on ., ./forms |
| added | `DzKnobSlots` | additive | patch | new interface on ., ./forms |
| added | `DzMasonry` | additive | patch | new component on ., ./layout |
| added | `DzMasonryProps` | additive | patch | new interface on ., ./layout |
| added | `DzMasonrySlots` | additive | patch | new interface on ., ./layout |
| added | `DzMegaMenu` | additive | patch | new component on ., ./navigation |
| added | `DzMegaMenuEmits` | additive | patch | new interface on ., ./navigation |
| added | `DzMegaMenuGroup` | additive | patch | new interface on ., ./navigation |
| added | `DzMegaMenuGroupSlotProps` | additive | patch | new interface on ., ./navigation |
| added | `DzMegaMenuItem` | additive | patch | new interface on ., ./navigation |
| added | `DzMegaMenuItemSlotProps` | additive | patch | new interface on ., ./navigation |
| added | `DzMegaMenuLink` | additive | patch | new interface on ., ./navigation |
| added | `DzMegaMenuLinkSlotProps` | additive | patch | new interface on ., ./navigation |
| added | `DzMegaMenuOrientation` | additive | patch | new type on ., ./navigation |
| added | `DzMegaMenuProps` | additive | patch | new interface on ., ./navigation |
| added | `DzMegaMenuSlots` | additive | patch | new interface on ., ./navigation |
| added | `DzMention` | additive | patch | new component on ., ./forms |
| added | `DzMentionEmits` | additive | patch | new interface on ., ./forms |
| added | `DzMentionOption` | additive | patch | new interface on ., ./forms |
| added | `DzMentionOptionResolver` | additive | patch | new type on ., ./forms |
| added | `DzMentionProps` | additive | patch | new interface on ., ./forms |
| added | `DzMentionSlots` | additive | patch | new interface on ., ./forms |
| added | `DzMentionTrigger` | additive | patch | new interface on ., ./forms |
| added | `DzMessageReader` | additive | patch | new type on . |
| added | `DzMeterGroup` | additive | patch | new component on ., ./feedback |
| added | `DzMeterGroupComputedSegment` | additive | patch | new interface on ., ./feedback |
| added | `DzMeterGroupOrientation` | additive | patch | new type on ., ./feedback |
| added | `DzMeterGroupProps` | additive | patch | new interface on ., ./feedback |
| added | `DzMeterGroupSegment` | additive | patch | new interface on ., ./feedback |
| added | `DzMeterGroupSlotProps` | additive | patch | new interface on ., ./feedback |
| added | `DzMeterGroupSlots` | additive | patch | new interface on ., ./feedback |
| added | `DzOrderList` | additive | patch | new function on ., ./data |
| added | `DzOrderListEmits` | additive | patch | new interface on ., ./data |
| added | `DzOrderListItemSlotProps` | additive | patch | new interface on ., ./data |
| added | `DzOrderListProps` | additive | patch | new interface on ., ./data |
| added | `DzOrderListSlots` | additive | patch | new interface on ., ./data |
| added | `DzPageHero` | additive | patch | new component on ., ./layout |
| added | `DzPageHeroProps` | additive | patch | new interface on ., ./layout |
| added | `DzPageHeroSlots` | additive | patch | new interface on ., ./layout |
| added | `DzPanel` | additive | patch | new component on ., ./layout |
| added | `DzPanelEmits` | additive | patch | new interface on ., ./layout |
| added | `DzPanelProps` | additive | patch | new interface on ., ./layout |
| added | `DzPanelSlots` | additive | patch | new interface on ., ./layout |
| added | `DzPersonaSelectorEmits` | additive | patch | new interface on ., ./forms |
| added | `DzPersonaSelectorProps` | additive | patch | new interface on ., ./forms |
| added | `DzPersonaSelectorSlots` | additive | patch | new interface on ., ./forms |
| added | `DzPopconfirm` | additive | patch | new component on ., ./overlays |
| added | `DzPopconfirmEmits` | additive | patch | new interface on ., ./overlays |
| added | `DzPopconfirmProps` | additive | patch | new interface on ., ./overlays |
| added | `DzPopconfirmSlots` | additive | patch | new interface on ., ./overlays |
| added | `DzQRCode` | additive | patch | new component on ., ./media |
| added | `DzQRCodeEmits` | additive | patch | new interface on ., ./media |
| added | `DzQRCodeProps` | additive | patch | new interface on ., ./media |
| added | `DzQRCodeSlots` | additive | patch | new interface on ., ./media |
| added | `DzQRErrorLevel` | additive | patch | new type on ., ./media |
| … | _261 more — see the JSON_ | | | |

### `@dzup-ui/mcp` — 1 change(s), fidelity `none`

| Kind | Symbol | Severity | Level | Detail |
|---|---|---|---|---|
| unbaselined | `27 symbol(s)` | none | none | no baseline of any kind exists for this package — nothing has been published and no snapshot has been recorded. The surface is reported, not diffed. |

### `@dzup-ui/nuxt` — 1 change(s), fidelity `none`

| Kind | Symbol | Severity | Level | Detail |
|---|---|---|---|---|
| unbaselined | `9 symbol(s)` | none | none | no baseline of any kind exists for this package — nothing has been published and no snapshot has been recorded. The surface is reported, not diffed. |

### `@dzup-ui/testing` — 1 change(s), fidelity `none`

| Kind | Symbol | Severity | Level | Detail |
|---|---|---|---|---|
| unbaselined | `79 symbol(s)` | none | none | no baseline of any kind exists for this package — nothing has been published and no snapshot has been recorded. The surface is reported, not diffed. |

### `@dzup-ui/tokens` — 1 change(s), fidelity `none`

| Kind | Symbol | Severity | Level | Detail |
|---|---|---|---|---|
| unbaselined | `4 symbol(s)` | none | none | no baseline of any kind exists for this package — nothing has been published and no snapshot has been recorded. The surface is reported, not diffed. |

