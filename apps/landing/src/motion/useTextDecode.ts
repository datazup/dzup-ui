import type { MaybeRefOrGetter, Ref } from 'vue'
import { onBeforeUnmount, ref, toValue } from 'vue'

/** Options for {@link useTextDecode}. */
export interface UseTextDecodeOptions {
  /** Frame interval in ms (default `45`). */
  frameMs?: number
  /** Frames each character scrambles before it locks in (default `2`). */
  framesPerChar?: number
  /** Pool of glyphs used while scrambling. */
  charset?: string
}

/** Reactive state returned by {@link useTextDecode}. */
export interface UseTextDecodeReturn {
  /** The currently displayed (scrambling/resolving) string. */
  display: Ref<string>
  /** Start (or restart) the decode from scratch. */
  run: () => void
  /** Stop any running animation and show the final, resolved text. */
  resolve: () => void
}

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&$*'

/**
 * useTextDecode — scramble→resolve a string left-to-right (docs/animations.md
 * §6.2, effect 10).
 *
 * On {@link UseTextDecodeReturn.run} the text appears scrambled and resolves one
 * character at a time from the left; whitespace is never scrambled, so the word
 * shape (and box width) stays stable — no layout shift (§7). SSR-safe (work only
 * happens once a browser timer fires) and self-cleaning on unmount.
 *
 * This composable is motion-agnostic: the caller decides when to {@link run}
 * (e.g. on in-view) and should call {@link resolve} instead under reduced motion
 * to show the plain text with no animation.
 *
 * @param target - the final text (ref/getter/string).
 * @param options - timing + charset, see {@link UseTextDecodeOptions}.
 */
export function useTextDecode(
  target: MaybeRefOrGetter<string>,
  options: UseTextDecodeOptions = {},
): UseTextDecodeReturn {
  const { frameMs = 45, framesPerChar = 2, charset = DEFAULT_CHARSET } = options

  const display = ref(toValue(target))
  let timer: ReturnType<typeof setInterval> | null = null
  let frame = 0
  // Deterministic-enough pseudo-random index (Math.random is unavailable in some
  // sandboxes; a small LCG keyed off the frame keeps the scramble lively).
  let seed = 1

  function randIndex(max: number): number {
    seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
    return seed % max
  }

  function clear(): void {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function render(text: string, revealed: number): string {
    let out = ''
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i]
      if (i < revealed || ch === ' ' || ch === '\n' || ch === '\t')
        out += ch
      else out += charset[randIndex(charset.length)]
    }
    return out
  }

  function resolve(): void {
    clear()
    display.value = toValue(target)
  }

  function run(): void {
    clear()
    const text = toValue(target)
    frame = 0
    seed = text.length + 1
    display.value = render(text, 0)
    timer = setInterval(() => {
      frame += 1
      const revealed = Math.floor(frame / framesPerChar)
      display.value = render(text, revealed)
      if (revealed >= text.length)
        resolve()
    }, frameMs)
  }

  onBeforeUnmount(clear)

  return { display, run, resolve }
}
