/**
 * The English message catalog (TASK-OSS-P4-03, ADR-20).
 *
 * Every user-visible string `@dzup-ui/core` renders that is not supplied by the
 * consumer lives here, keyed by component and then by message. Before this file
 * existed the same strings were literals in 51 component templates and
 * `withDefaults` blocks, which had two consequences worth stating separately
 * because they need different fixes:
 *
 *   - **54 static `aria-label` values across 27 components** (50 distinct) that
 *     **no application could change at all** — not with a prop, not with a
 *     provider. An Arabic application shipped `aria-label="Clear input"`.
 *   - **39 literal defaults on `*Text`/`*Label`/`*Placeholder` props across 24
 *     components** (28 distinct) that an application could only change one
 *     instance at a time. Setting `noResultsText` on every `DzSelect` in a
 *     codebase is not localisation, it is repetition.
 *
 * Both are now looked up through {@link useComponentMessages}, which resolves
 * an application's catalog over these defaults. **Every value here is
 * byte-identical to the literal it replaced**, so a component behaves exactly
 * as it did until a host supplies a catalog — the property that let this land
 * as one mechanical change rather than 51 behavioural ones.
 *
 * **Count-bearing messages (TASK-R5-O4)** are the one exception to "byte-identical":
 * they are written in the message syntax (`{count, plural, one {# day} other
 * {# days}}`, `packages/core/docs/i18n.md`) and typed as `DzMessage<Args>`, and
 * they render the same English below 1,000 and group digits from 1,000. They
 * were never literals in a template — each was a concatenation in a `<script>`
 * block, which `validate:hardcoded-strings` does not read.
 *
 * **What is deliberately NOT here.** Strings inside JSDoc `@example` blocks —
 * 11 of them, in `DzFab`, `DzIconButton`, `DzSpeedDial`, `DzSplitButtonMenu`,
 * `DzInplace`, `DzIcon`, `DzQRCode`, `DzMenu` and `DzPopconfirm`. They are
 * documentation showing a consumer what to pass, they never reach the DOM, and
 * translating them would be translating the manual. The first inventory pass
 * swept them up with the real ones; the second separated them, and
 * `validate:hardcoded-strings` reads the `<template>` block only for the same
 * reason.
 *
 * **Not exported from the package barrel.** Same rule as the `provideDz*`
 * writers in TASK-OSS-P4-01: nothing consumes it at runtime — `read()` falls
 * back to these values automatically, so a host supplies *overrides*, never a
 * full catalog — and the ownership schema has no `utility` kind, so exporting
 * it would land one more `unclassified` entry and push a ratchet that is only
 * allowed to fall. The **type** is public through `@dzup-ui/contracts`, which
 * is what a translator needs in order to type their own catalog.
 *
 * @module @dzup-ui/core/i18n/messages
 */

import type { DzMessage, DzMessageCatalog } from '@dzup-ui/contracts'

declare module '@dzup-ui/contracts' {
  /**
   * Core's contribution to the shared catalog.
   *
   * Core augments `@dzup-ui/contracts` exactly the way Pro is required to
   * (ADR-20 §9). One mechanism, no privileged tier.
   */
  interface DzMessageCatalog {
    DzAlert: { close: string }
    DzAnchor: { ariaLabel: string }
    /**
     * The async-options rows, shared by every selection control that can be
     * driven from a remote source (TASK-FORM-OSS-03, renderer contract C9).
     *
     * One group rather than the same three keys repeated under seven component
     * names: a translator writes "Loading options" once, and seven controls
     * cannot end up saying it three different ways.
     */
    DzAsyncOptions: {
      loading: string
      empty: string
      error: string
      retry: string
    }
    DzBackTop: { ariaLabel: string }
    DzBreadcrumb: { ariaLabel: string }
    DzCarouselDots: { slideNavigation: string }
    DzCarouselNext: { nextSlide: string }
    DzCarouselPrevious: { previousSlide: string }
    DzCascader: {
      clearSelection: string
      searchPaths: string
      matchingPaths: string
      searchPlaceholder: string
      noResults: string
    }
    DzColorPicker: { ariaLabel: string, colorArea: string, hexValue: string }
    DzCombobox: {
      clearSelection: string
      toggleOptions: string
      loading: string
      empty: string
      noResults: string
    }
    DzCommandPalette: { ariaLabel: string }
    DzConfirmDialog: { confirm: string, cancel: string }
    /**
     * The live-region phrase a running countdown announces (TASK-R5-O4).
     * `remaining` receives the unit phrases already joined by `Intl.ListFormat`
     * for the locale, so a translator orders the sentence, not the list.
     */
    DzCountdown: {
      finished: string
      days: DzMessage<{ count: number }>
      hours: DzMessage<{ count: number }>
      minutes: DzMessage<{ count: number }>
      seconds: DzMessage<{ count: number }>
      remaining: DzMessage<{ duration: string }>
    }
    DzDataGridHeader: { selectAllRows: string }
    DzDataGridPagination: { rowsPerPage: string, previousPage: string, nextPage: string }
    DzDataView: {
      sortBy: string
      viewLayout: string
      loading: string
      showingAll: DzMessage<{ count: number }>
      showingRange: DzMessage<{ start: number, end: number, total: number }>
    }
    DzFileUpload: { ariaLabel: string }
    DzInput: { clear: string, loading: string }
    DzLightbox: { close: string, previous: string, next: string }
    DzListbox: { filterOptions: string, filterPlaceholder: string, empty: string }
    DzMention: {
      loading: string
      noResults: string
      suggestionsAvailable: DzMessage<{ count: number }>
    }
    DzMultiSelect: { clearAll: string, toggleOptions: string }
    DzNotification: { dismiss: string }
    DzNumberInput: { decrease: string, increase: string }
    DzOrderList: {
      reorderControls: string
      moveUp: string
      moveDown: string
      moveTop: string
      moveBottom: string
      dragHandle: string
    }
    DzPagination: {
      ariaLabel: string
      firstPage: string
      previousPage: string
      nextPage: string
      lastPage: string
    }
    DzPasswordInput: { loading: string, showPassword: string, hidePassword: string }
    DzPopconfirm: { confirm: string, cancel: string }
    DzRating: { starTitle: DzMessage<{ count: number }> }
    /**
     * The SC 2.5.7 stepper pair on a splitter gutter (TASK-R2-O5, D117/A).
     * `DzSplitterHandle` reads the same two keys: it renders the same control.
     */
    DzResizableHandle: { shrinkPane: string, growPane: string }
    DzScrollProgress: { ariaLabel: string }
    DzSearchInput: { clear: string, loading: string }
    DzSelect: { filterOptions: string, searchPlaceholder: string, noResults: string }
    DzSidebar: { ariaLabel: string }
    DzTabTrigger: { closeTab: string }
    /**
     * `narrowColumn` / `widenColumn` are the SC 2.5.7 stepper pair on a
     * resizable header cell (TASK-R2-O5, D117/A).
     */
    DzTableCell: { resizeColumn: string, narrowColumn: string, widenColumn: string }
    DzTagsInput: {
      count: DzMessage<{ count: number }>
      countOfMax: DzMessage<{ count: number, max: number }>
    }
    DzTextarea: { loading: string }
    DzTimePicker: {
      clearTime: string
      hours: string
      minutes: string
      seconds: string
      dayPeriod: string
      selectHours: string
      selectMinutes: string
      selectSeconds: string
      selectDayPeriod: string
      confirm: string
      cancel: string
    }
    DzToast: { close: string }
    DzTokenProgressBar: { tokenUsage: string }
    DzTransfer: {
      ariaLabel: string
      searchSource: string
      sourceItems: string
      moveToTarget: string
      moveToSource: string
      searchTarget: string
      targetItems: string
      searchPlaceholder: string
    }
    DzTreeSelect: { filterOptions: string, filterPlaceholder: string, noResults: string }
  }
}

/**
 * The shipped English defaults.
 *
 * `satisfies DzMessageCatalog` is the sync mechanism between the interface
 * above and the values below: a key declared and not supplied — or supplied and
 * not declared — is a type error, not a string that silently resolves to
 * `undefined` at runtime in whichever locale nobody tested.
 */
export const enMessages = {
  DzAlert: { close: 'Close' },
  DzAnchor: { ariaLabel: 'Page navigation' },
  DzAsyncOptions: {
    loading: 'Loading options',
    empty: 'No options found',
    error: 'Could not load options',
    retry: 'Try again',
  },
  DzBackTop: { ariaLabel: 'Back to top' },
  DzBreadcrumb: { ariaLabel: 'Breadcrumb' },
  DzCarouselDots: { slideNavigation: 'Slide navigation' },
  DzCarouselNext: { nextSlide: 'Next slide' },
  DzCarouselPrevious: { previousSlide: 'Previous slide' },
  DzCascader: {
    clearSelection: 'Clear selection',
    searchPaths: 'Search paths',
    matchingPaths: 'Matching paths',
    // Note the character: U+2026, not three periods. `DzSelect` and `DzListbox`
    // use three. The inconsistency is preserved rather than tidied — every
    // value here is byte-identical to the literal it replaced, and normalising
    // ellipses is a visible change that belongs in its own commit.
    searchPlaceholder: 'Search…',
    noResults: 'No matching paths',
  },
  DzColorPicker: {
    ariaLabel: 'Choose a color',
    colorArea: 'Color area',
    hexValue: 'Hex color value',
  },
  DzCombobox: {
    clearSelection: 'Clear selection',
    toggleOptions: 'Toggle options',
    loading: 'Loading options…',
    empty: 'No options available',
    noResults: 'No results found',
  },
  DzCommandPalette: { ariaLabel: 'Command palette' },
  DzConfirmDialog: { confirm: 'Confirm', cancel: 'Cancel' },
  // Count-bearing messages (TASK-R5-O4). Each was built by concatenation —
  // `${n} day${n === 1 ? '' : 's'}` — which is English's two forms and nobody
  // else's. English output is unchanged below 1,000; from 1,000 the number
  // gains the locale's grouping separator, which is the point of formatting it.
  DzCountdown: {
    finished: 'Countdown finished',
    days: '{count, plural, one {# day} other {# days}}',
    hours: '{count, plural, one {# hour} other {# hours}}',
    minutes: '{count, plural, one {# minute} other {# minutes}}',
    seconds: '{count, plural, one {# second} other {# seconds}}',
    remaining: '{duration} remaining',
  },
  DzDataGridHeader: { selectAllRows: 'Select all rows' },
  DzDataGridPagination: {
    rowsPerPage: 'Rows per page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
  },
  DzDataView: {
    sortBy: 'Sort by',
    viewLayout: 'View layout',
    loading: 'Loading items',
    showingAll: '{count, plural, one {Showing # item} other {Showing # items}}',
    // The one deliberate English change: the literal said "of 1 items".
    showingRange: '{total, plural, one {Showing {start} to {end} of # item} other {Showing {start} to {end} of # items}}',
  },
  DzFileUpload: { ariaLabel: 'Upload files' },
  DzInput: { clear: 'Clear input', loading: 'Loading' },
  DzLightbox: {
    close: 'Close lightbox',
    previous: 'Previous image',
    next: 'Next image',
  },
  DzListbox: {
    filterOptions: 'Filter options',
    filterPlaceholder: 'Search...',
    empty: 'No options',
  },
  DzMention: {
    loading: 'Loading…',
    noResults: 'No matches',
    suggestionsAvailable: '{count, plural, one {# suggestion available} other {# suggestions available}}',
  },
  DzMultiSelect: { clearAll: 'Clear all', toggleOptions: 'Toggle options' },
  DzNotification: { dismiss: 'Dismiss notification' },
  DzNumberInput: { decrease: 'Decrease value', increase: 'Increase value' },
  DzOrderList: {
    reorderControls: 'Reorder controls',
    moveUp: 'Move up',
    moveDown: 'Move down',
    moveTop: 'Move to top',
    moveBottom: 'Move to bottom',
    dragHandle: 'Drag to reorder',
  },
  DzPagination: {
    ariaLabel: 'Pagination',
    firstPage: 'Go to first page',
    previousPage: 'Go to previous page',
    nextPage: 'Go to next page',
    lastPage: 'Go to last page',
  },
  DzPasswordInput: { loading: 'Loading', showPassword: 'Show password', hidePassword: 'Hide password' },
  DzPopconfirm: { confirm: 'Confirm', cancel: 'Cancel' },
  DzRating: { starTitle: '{count, plural, one {# star} other {# stars}}' },
  DzResizableHandle: { shrinkPane: 'Shrink panel', growPane: 'Grow panel' },
  DzScrollProgress: { ariaLabel: 'Page scroll progress' },
  DzSearchInput: { clear: 'Clear search', loading: 'Loading' },
  DzSelect: {
    filterOptions: 'Filter options',
    searchPlaceholder: 'Search...',
    noResults: 'No results found',
  },
  DzSidebar: { ariaLabel: 'Sidebar navigation' },
  DzTabTrigger: { closeTab: 'Close tab' },
  DzTableCell: {
    resizeColumn: 'Resize column',
    narrowColumn: 'Narrow column',
    widenColumn: 'Widen column',
  },
  DzTagsInput: {
    count: '{count, plural, one {# tag} other {# tags}}',
    countOfMax: '{count, plural, one {# tag of {max}} other {# tags of {max}}}',
  },
  DzTextarea: { loading: 'Loading' },
  DzTimePicker: {
    clearTime: 'Clear time',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    dayPeriod: 'AM/PM',
    selectHours: 'Select hours',
    selectMinutes: 'Select minutes',
    selectSeconds: 'Select seconds',
    selectDayPeriod: 'Select AM/PM',
    confirm: 'OK',
    cancel: 'Cancel',
  },
  DzToast: { close: 'Close notification' },
  DzTokenProgressBar: { tokenUsage: 'Token usage' },
  DzTransfer: {
    ariaLabel: 'Transfer list',
    searchSource: 'Search source items',
    sourceItems: 'Source items',
    moveToTarget: 'Move selected to target',
    moveToSource: 'Move selected to source',
    searchTarget: 'Search target items',
    targetItems: 'Target items',
    searchPlaceholder: 'Search...',
  },
  DzTreeSelect: {
    filterOptions: 'Filter options',
    filterPlaceholder: 'Search...',
    noResults: 'No results found',
  },
} as const satisfies DzMessageCatalog

/**
 * The component groups Core contributes to `DzMessageCatalog`.
 *
 * Exported so that `@dzup-ui/core`'s declarations reference this module — and
 * with it the `declare module '@dzup-ui/contracts'` augmentation above. Before
 * TASK-R5-O4 nothing reachable from `dist/index.d.ts` did, so a consumer's
 * TypeScript saw the empty interface `contracts` declares (N5-04 F9).
 */
export type DzCoreMessageGroup = keyof typeof enMessages
