import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, onBeforeUnmount, ref, toValue, watch } from 'vue'
import { useReducedMotion } from './useReducedMotion.ts'

/** Options for {@link useTypewriter}. */
export interface UseTypewriterOptions {
  /** Milliseconds per character while typing (default `55`). */
  typeSpeed?: number
  /** Milliseconds per character while erasing (default `30`). */
  eraseSpeed?: number
  /** Milliseconds to hold a fully-typed phrase before erasing (default `1600`). */
  holdDelay?: number
  /** Milliseconds to pause after erasing before the next phrase (default `400`). */
  pauseDelay?: number
  /** Loop back to the first phrase after the last (default `true`). */
  loop?: boolean
}

/** Reactive state returned by {@link useTypewriter}. */
export interface UseTypewriterReturn {
  /** The currently visible substring (reactive). */
  text: Ref<string>
  /** Whether the caret is currently typing (vs. holding/erasing). */
  isTyping: Ref<boolean>
  /** The longest phrase — use it to reserve width/height (no layout shift). */
  longest: ComputedRef<string>
}

/**
 * useTypewriter — types and erases a rotating list of phrases (docs/animations.md
 * §6.2, effect 8).
 *
 * Drives a single `text` ref one character at a time via `setTimeout`, cycling
 * through `phrases` (type → hold → erase → next). SSR-safe (no work until a
 * browser timer fires) and self-cleaning (clears its timer on unmount).
 *
 * Reduced motion (OS setting or the page-level toggle, via
 * {@link useReducedMotion}) shows the first phrase instantly and runs no
 * animation — the accessible, motion-free fallback. The caller is responsible
 * for reserving space from {@link UseTypewriterReturn.longest} so the typing
 * never shifts layout (§7).
 *
 * @param phrases - the phrases to rotate through (ref/getter/array).
 * @param options - timing + loop behaviour, see {@link UseTypewriterOptions}.
 */
export function useTypewriter(
  phrases: MaybeRefOrGetter<string[]>,
  options: UseTypewriterOptions = {},
): UseTypewriterReturn {
  const { typeSpeed = 55, eraseSpeed = 30, holdDelay = 1600, pauseDelay = 400, loop = true } = options

  const text = ref('')
  const isTyping = ref(true)
  const reduced = useReducedMotion()

  const list = computed(() => {
    const value = toValue(phrases)
    return value.length > 0 ? value : ['']
  })
  const longest = computed(() =>
    list.value.reduce((a, b) => (b.length > a.length ? b : a), ''),
  )

  let timer: ReturnType<typeof setTimeout> | null = null
  let phraseIndex = 0
  let charIndex = 0
  let erasing = false

  function clear(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function schedule(fn: () => void, delay: number): void {
    clear()
    timer = setTimeout(fn, delay)
  }

  function tick(): void {
    const phrase = list.value[phraseIndex] ?? ''

    if (!erasing) {
      // Typing forward.
      charIndex += 1
      text.value = phrase.slice(0, charIndex)
      if (charIndex >= phrase.length) {
        // Fully typed: hold, then (if more phrases) start erasing.
        const atEnd = phraseIndex === list.value.length - 1
        if (atEnd && !loop) {
          isTyping.value = false
          return
        }
        isTyping.value = false
        erasing = true
        schedule(tick, holdDelay)
        return
      }
      isTyping.value = true
      schedule(tick, typeSpeed)
      return
    }

    // Erasing backward.
    charIndex -= 1
    text.value = phrase.slice(0, Math.max(charIndex, 0))
    if (charIndex <= 0) {
      erasing = false
      phraseIndex = (phraseIndex + 1) % list.value.length
      schedule(tick, pauseDelay)
      return
    }
    schedule(tick, eraseSpeed)
  }

  function start(): void {
    clear()
    if (reduced.value) {
      // Reduced motion: show the first phrase instantly, no animation.
      phraseIndex = 0
      charIndex = list.value[0]?.length ?? 0
      erasing = false
      isTyping.value = false
      text.value = list.value[0] ?? ''
      return
    }
    phraseIndex = 0
    charIndex = 0
    erasing = false
    isTyping.value = true
    text.value = ''
    schedule(tick, typeSpeed)
  }

  // (Re)start when the reduced-motion preference or the phrase list changes.
  watch([reduced, list], start, { immediate: true })

  onBeforeUnmount(clear)

  return { text, isTyping, longest }
}
