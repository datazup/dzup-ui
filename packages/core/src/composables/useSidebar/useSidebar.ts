/**
 * useSidebar — Composable for sidebar layout behavior.
 *
 * Manages collapsed/expanded state, mobile overlay, responsive breakpoint
 * detection, localStorage persistence, and keyboard shortcut (Ctrl/Cmd+B).
 *
 * @module @dzup-ui/core/composables/useSidebar
 */

import type { ComputedRef, Ref } from 'vue'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'

/** Options for the useSidebar composable */
export interface UseSidebarOptions {
  /** Start in collapsed state (default: false) */
  defaultCollapsed?: boolean
  /** Start with mobile overlay open (default: false) */
  defaultMobileOpen?: boolean
  /** Width when collapsed (default: '4rem') */
  collapsedWidth?: string
  /** Width when expanded (default: '16rem') */
  expandedWidth?: string
  /** Pixel breakpoint for mobile mode (default: 768) */
  mobileBreakpoint?: number
  /** localStorage key for persisting collapsed state */
  storageKey?: string
}

/** Return value of the useSidebar composable */
export interface UseSidebarReturn {
  /** Whether the sidebar is collapsed */
  collapsed: Ref<boolean>
  /** Whether the mobile overlay is open */
  mobileOpen: Ref<boolean>
  /** Whether the viewport is at or below the mobile breakpoint */
  isMobile: ComputedRef<boolean>
  /** Current sidebar width based on collapsed state */
  sidebarWidth: ComputedRef<string>
  /** Toggle collapsed state */
  toggle: () => void
  /** Expand the sidebar */
  expand: () => void
  /** Collapse the sidebar */
  collapse: () => void
  /** Toggle mobile overlay */
  toggleMobile: () => void
  /** Open mobile overlay */
  openMobile: () => void
  /** Close mobile overlay */
  closeMobile: () => void
}

/**
 * Read a boolean value from localStorage.
 * Returns `fallback` when storage is unavailable or key is absent.
 *
 * @internal
 */
function readStoredBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined')
    return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null)
      return fallback
    return raw === 'true'
  }
  catch {
    return fallback
  }
}

/**
 * Write a boolean value to localStorage.
 * Silently no-ops when storage is unavailable.
 *
 * @internal
 */
function writeStoredBoolean(key: string, value: boolean): void {
  if (typeof window === 'undefined')
    return
  try {
    localStorage.setItem(key, String(value))
  }
  catch {
    // Storage full or unavailable — silently ignore
  }
}

/**
 * Manages sidebar layout behavior including collapsed/expanded state,
 * mobile overlay, responsive breakpoint detection via matchMedia,
 * localStorage persistence, and Ctrl/Cmd+B keyboard shortcut.
 *
 * @param options - Configuration for the sidebar behavior
 * @returns Refs, computed values, and methods to control the sidebar
 *
 * @example
 * ```ts
 * const {
 *   collapsed,
 *   mobileOpen,
 *   isMobile,
 *   sidebarWidth,
 *   toggle,
 *   toggleMobile,
 * } = useSidebar({ storageKey: 'app-sidebar' })
 * ```
 */
export function useSidebar(options: UseSidebarOptions = {}): UseSidebarReturn {
  const {
    defaultCollapsed = false,
    defaultMobileOpen = false,
    collapsedWidth = '4rem',
    expandedWidth = '16rem',
    mobileBreakpoint = 768,
    storageKey,
  } = options

  // ---- State ----

  const initialCollapsed = storageKey
    ? readStoredBoolean(storageKey, defaultCollapsed)
    : defaultCollapsed

  const collapsed = ref(initialCollapsed)
  const mobileOpen = ref(defaultMobileOpen)
  const mobileMatch = ref(false)

  // ---- Computed ----

  const isMobile: ComputedRef<boolean> = computed(() => mobileMatch.value)

  const sidebarWidth: ComputedRef<string> = computed(() =>
    collapsed.value ? collapsedWidth : expandedWidth,
  )

  // ---- Actions ----

  /** Toggle collapsed state */
  function toggle(): void {
    collapsed.value = !collapsed.value
  }

  /** Expand the sidebar */
  function expand(): void {
    collapsed.value = false
  }

  /** Collapse the sidebar */
  function collapse(): void {
    collapsed.value = true
  }

  /** Toggle mobile overlay */
  function toggleMobile(): void {
    mobileOpen.value = !mobileOpen.value
  }

  /** Open mobile overlay */
  function openMobile(): void {
    mobileOpen.value = true
  }

  /** Close mobile overlay */
  function closeMobile(): void {
    mobileOpen.value = false
  }

  // ---- Persistence ----

  if (storageKey) {
    watch(collapsed, (value) => {
      writeStoredBoolean(storageKey, value)
    })
  }

  // ---- matchMedia for mobile detection ----

  let mediaQuery: MediaQueryList | null = null

  function handleMediaChange(event: MediaQueryListEvent | MediaQueryList): void {
    mobileMatch.value = event.matches
  }

  function setupMediaQuery(): void {
    if (typeof window === 'undefined')
      return
    mediaQuery = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`)
    mobileMatch.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handleMediaChange as (e: MediaQueryListEvent) => void)
  }

  function teardownMediaQuery(): void {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleMediaChange as (e: MediaQueryListEvent) => void)
      mediaQuery = null
    }
  }

  // ---- Close mobile sidebar on route change ----

  // Watch mobileMatch: when entering mobile mode, auto-close overlay;
  // this also acts as a proxy for viewport changes that a route change triggers.
  watch(isMobile, () => {
    if (mobileOpen.value) {
      closeMobile()
    }
  })

  // ---- Keyboard shortcut: Ctrl+B / Cmd+B ----

  function handleKeydown(event: KeyboardEvent): void {
    const isModifier = event.metaKey || event.ctrlKey
    if (isModifier && event.key === 'b') {
      event.preventDefault()
      if (isMobile.value) {
        toggleMobile()
      }
      else {
        toggle()
      }
    }
  }

  function setupKeyboard(): void {
    if (typeof document === 'undefined')
      return
    document.addEventListener('keydown', handleKeydown)
  }

  function teardownKeyboard(): void {
    if (typeof document === 'undefined')
      return
    document.removeEventListener('keydown', handleKeydown)
  }

  // ---- Lifecycle ----

  onMounted(() => {
    setupMediaQuery()
    setupKeyboard()
  })

  onUnmounted(() => {
    teardownMediaQuery()
    teardownKeyboard()
  })

  return {
    collapsed,
    mobileOpen,
    isMobile,
    sidebarWidth,
    toggle,
    expand,
    collapse,
    toggleMobile,
    openMobile,
    closeMobile,
  }
}
