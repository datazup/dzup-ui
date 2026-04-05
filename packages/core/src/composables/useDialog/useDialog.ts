/**
 * useDialog — Composable for modal dialog behavior.
 *
 * Manages focus trap, scroll lock, escape-to-close, click-outside-to-close,
 * focus restoration, and aria-hidden on sibling elements.
 *
 * @module @dzip-ui/core/composables/useDialog
 */

import type { MaybeRef, Ref } from 'vue'
import {
  onUnmounted,
  ref,
  toValue,
  useId,
  watch,
} from 'vue'

/** Options for the useDialog composable */
export interface UseDialogOptions {
  /** Reactive or static initial open state */
  open?: MaybeRef<boolean>
  /** Callback fired when the open state changes */
  onOpenChange?: (open: boolean) => void
  /** Whether the dialog behaves as a modal (default: true) */
  modal?: boolean
  /** Prevent closing via Escape or click-outside (default: false) */
  preventClose?: boolean
}

/** Return value of the useDialog composable */
export interface UseDialogReturn {
  /** Whether the dialog is currently open */
  isOpen: Ref<boolean>
  /** Open the dialog */
  open: () => void
  /** Close the dialog */
  close: () => void
  /** Toggle the dialog open/closed */
  toggle: () => void
  /** Ref to bind to the trigger element (for focus restoration) */
  triggerRef: Ref<HTMLElement | null>
  /** Ref to bind to the dialog content element (for focus trap) */
  contentRef: Ref<HTMLElement | null>
  /** Generated ID for the dialog title (aria-labelledby) */
  titleId: string
  /** Generated ID for the dialog description (aria-describedby) */
  descriptionId: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** @internal */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

/**
 * Manages modal dialog behavior including focus trap, scroll lock,
 * escape key handling, click-outside dismissal, and ARIA attributes.
 *
 * @param options - Configuration for the dialog behavior
 * @returns Refs, IDs, and methods to control the dialog
 *
 * @example
 * ```ts
 * const { isOpen, open, close, triggerRef, contentRef, titleId, descriptionId } = useDialog()
 * ```
 */
export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
  const {
    onOpenChange,
    modal = true,
    preventClose = false,
  } = options

  const baseId = useId()
  const titleId = `${baseId}-dialog-title`
  const descriptionId = `${baseId}-dialog-description`

  const isOpen = ref(toValue(options.open) ?? false)
  const triggerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  let previousActiveElement: HTMLElement | null = null
  let cleanupFns: Array<() => void> = []
  let hiddenSiblings: HTMLElement[] = []

  function setOpen(value: boolean): void {
    if (isOpen.value === value)
      return
    isOpen.value = value
    onOpenChange?.(value)
  }

  /** Open the dialog */
  function open(): void {
    setOpen(true)
  }

  /** Close the dialog */
  function close(): void {
    setOpen(false)
  }

  /** Toggle the dialog open/closed */
  function toggle(): void {
    setOpen(!isOpen.value)
  }

  function setupSideEffects(): void {
    if (typeof document === 'undefined')
      return
    const contentEl = contentRef.value
    if (!contentEl)
      return

    previousActiveElement = (document.activeElement as HTMLElement) ?? null

    // Scroll lock (modal only)
    if (modal) {
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      cleanupFns.push(() => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      })
    }

    // aria-hidden on siblings (modal only)
    if (modal && contentEl.parentElement) {
      const siblings = Array.from(contentEl.parentElement.children) as HTMLElement[]
      for (const sibling of siblings) {
        if (sibling === contentEl)
          continue
        if (sibling.getAttribute('aria-hidden') === 'true')
          continue
        sibling.setAttribute('aria-hidden', 'true')
        hiddenSiblings.push(sibling)
      }
      cleanupFns.push(() => {
        for (const sibling of hiddenSiblings) {
          sibling.removeAttribute('aria-hidden')
        }
        hiddenSiblings = []
      })
    }

    // Escape key handler
    function handleKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && !preventClose) {
        event.stopPropagation()
        close()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    cleanupFns.push(() => document.removeEventListener('keydown', handleKeydown))

    // Click outside handler
    function handleClickOutside(event: MouseEvent): void {
      if (preventClose)
        return
      if (!contentEl)
        return
      const target = event.target as Node
      if (!contentEl.contains(target)) {
        close()
      }
    }
    const clickTimer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    cleanupFns.push(() => {
      clearTimeout(clickTimer)
      document.removeEventListener('mousedown', handleClickOutside)
    })

    // Focus trap (modal only)
    if (modal) {
      function handleTabKey(event: KeyboardEvent): void {
        if (event.key !== 'Tab')
          return
        if (!contentEl)
          return

        const focusable = getFocusableElements(contentEl)
        if (focusable.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusable[0] as HTMLElement
        const last = focusable[focusable.length - 1] as HTMLElement

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault()
            last.focus()
          }
        }
        else {
          if (document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
      }
      document.addEventListener('keydown', handleTabKey)
      cleanupFns.push(() => document.removeEventListener('keydown', handleTabKey))
    }

    // Move focus into the dialog content
    const raf = requestAnimationFrame(() => {
      if (!contentEl)
        return
      const focusable = getFocusableElements(contentEl)
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus()
      }
      else {
        contentEl.setAttribute('tabindex', '-1')
        contentEl.focus()
      }
    })
    cleanupFns.push(() => cancelAnimationFrame(raf))
  }

  function teardownSideEffects(): void {
    for (let i = cleanupFns.length - 1; i >= 0; i--) {
      const fn = cleanupFns[i]
      if (fn)
        fn()
    }
    cleanupFns = []

    if (typeof document !== 'undefined') {
      const restoreTarget = triggerRef.value ?? previousActiveElement
      if (restoreTarget && typeof restoreTarget.focus === 'function') {
        restoreTarget.focus()
      }
      previousActiveElement = null
    }
  }

  watch(isOpen, (newOpen) => {
    if (newOpen) {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => setupSideEffects())
      }
    }
    else {
      teardownSideEffects()
    }
  })

  watch(
    () => toValue(options.open),
    (externalOpen) => {
      if (externalOpen !== undefined && externalOpen !== isOpen.value) {
        isOpen.value = externalOpen
      }
    },
  )

  onUnmounted(() => {
    teardownSideEffects()
  })

  return {
    isOpen,
    open,
    close,
    toggle,
    triggerRef,
    contentRef,
    titleId,
    descriptionId,
  }
}
