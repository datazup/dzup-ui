<script lang="ts">
import type { PropType, VNode } from 'vue'
import { cloneVNode, defineComponent, onBeforeUnmount, ref, watch } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzPresence — a Reka/Radix-style **presence bridge** for CSS exit animations
 * (docs/animations.md §3.2, §6 item 3 — Task N2).
 *
 * ## Why
 * Vue removes a `v-if` element from the DOM the instant the condition flips, so a
 * pure-CSS *leave* animation never gets to play. Headless libraries solve this
 * with a **Presence / forceMount** pattern: the closing element is kept mounted
 * while its exit animation runs, then unmounted on `animationend`. We already sit
 * on Reka UI via `@dzup-ui/core`, which exposes exactly this — `Presence` +
 * `forceMount`. `DzPresence` is the thin, dependency-free wrapper that formalises
 * the same contract for the gallery (and stays extractable into `@dzup-ui/motion`).
 *
 * ## The `data-[state]` convention
 * Reka/Radix components expose their open/closed phase as a `data-state` attribute
 * — `data-state="open"` while visible, `data-state="closed"` while leaving — so
 * the entire transition is authored in CSS with **no JS timing**:
 *
 * ```css
 * [data-state='open']   { animation: pop-in  var(--dz-duration-normal) var(--dz-ease-out); }
 * [data-state='closed'] { animation: pop-out var(--dz-duration-fast)  var(--dz-ease-in); }
 * ```
 *
 * `DzPresence` clones your single child element and writes `data-state` onto it for
 * you, keeping it mounted until the `closed` animation finishes. Wrap one root
 * element (it also passes the same value down as a `state` slot prop if you'd
 * rather bind it yourself):
 *
 * ```vue
 * <DzPresence :present="open">
 *   <div class="panel"><!-- animated via [data-state] in CSS --></div>
 * </DzPresence>
 * ```
 *
 * ## Measured-dimension vars (`--reka-*-content-height`)
 * For height/width transitions Reka publishes the **measured** size of a collapsing
 * region as CSS custom properties — e.g. `--reka-accordion-content-height` /
 * `--reka-collapsible-content-height` (and the `-width` variants) — because CSS
 * cannot animate to/from `height: auto`. Keyframes read those vars to animate a
 * real pixel height both ways:
 *
 * ```css
 * [data-state='open']   { animation: down var(--dz-duration-normal) var(--dz-ease-out); }
 * [data-state='closed'] { animation: up   var(--dz-duration-normal) var(--dz-ease-in); }
 * @keyframes down { from { height: 0 } to { height: var(--reka-accordion-content-height) } }
 * @keyframes up   { from { height: var(--reka-accordion-content-height) } to { height: 0 } }
 * ```
 * When a child carries such a var (mounted under a Reka Collapsible/Accordion),
 * `DzPresence`'s `data-state` lines up with it so the same CSS drives the exit.
 *
 * ## Accessibility (§7)
 * Reduced motion (OS **or** the page-level toggle via `useReducedMotion`) skips the
 * keep-alive wait entirely: the child mounts/unmounts instantly with no exit
 * animation. SSR-safe (no DOM access at import; the keep-alive runs only in a
 * browser). The bridge is motion-agnostic — keep your `[data-state]` CSS to
 * transform/opacity (or the measured-height vars) per the project's hard bar.
 */
export default defineComponent({
  name: 'DzPresence',
  props: {
    /** Whether the content should be present (open). */
    present: { type: Boolean as PropType<boolean>, required: true },
  },
  setup(props, { slots }) {
    const reduced = useReducedMotion()

    /** Whether the child is currently rendered (stays true while leaving). */
    const rendered = ref(props.present)
    /** The `data-state` written onto the child — drives the CSS animation. */
    const dataState = ref<'open' | 'closed'>(props.present ? 'open' : 'closed')
    /** The mounted child's DOM element (resolved from element- or component-vnode). */
    const childEl = ref<HTMLElement | null>(null)

    let exitTimer: ReturnType<typeof setTimeout> | null = null
    function clearExitTimer(): void {
      if (exitTimer !== null) {
        clearTimeout(exitTimer)
        exitTimer = null
      }
    }

    /** Parse a CSS `<time>` (`'200ms'` / `'0.3s'`) to milliseconds. */
    function toMs(value: string): number {
      const v = value.trim()
      if (!v) return 0
      return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000
    }

    /** Largest `duration + delay` across the comma-separated CSS time lists, in ms. */
    function longest(durations: string, delays: string): number {
      const d = durations.split(',')
      const l = delays.split(',')
      let max = 0
      for (let i = 0; i < d.length; i++) max = Math.max(max, toMs(d[i] ?? '0s') + toMs(l[i] ?? '0s'))
      return max
    }

    /**
     * Unmount once the child's `closed` animation/transition ends — mirrors Vue's
     * own `whenTransitionEnds`: read the computed duration + delay and either wait
     * for the matching end event (with a safety timeout) or unmount at once if no
     * motion is declared.
     */
    function unmountWhenDone(el: HTMLElement): void {
      const styles = getComputedStyle(el)
      const total = Math.max(
        longest(styles.animationDuration, styles.animationDelay),
        longest(styles.transitionDuration, styles.transitionDelay),
      )
      if (total <= 0) {
        rendered.value = false
        return
      }
      let settled = false
      const finish = (): void => {
        if (settled) return
        settled = true
        clearExitTimer()
        el.removeEventListener('animationend', onEnd)
        el.removeEventListener('transitionend', onEnd)
        rendered.value = false
      }
      const onEnd = (event: Event): void => {
        if (event.target === el) finish()
      }
      el.addEventListener('animationend', onEnd)
      el.addEventListener('transitionend', onEnd)
      // Safety net: never strand a closing element if the end event is missed.
      exitTimer = setTimeout(finish, total + 50)
    }

    watch(
      () => props.present,
      (present) => {
        clearExitTimer()
        if (present) {
          // Opening: mount and flip to open (CSS plays the enter animation).
          rendered.value = true
          dataState.value = 'open'
          return
        }
        // Closing: flip to closed so the exit animation starts; keep mounted until
        // it finishes. Reduced motion → unmount at once (instant, no exit anim).
        dataState.value = 'closed'
        if (reduced.value || typeof window === 'undefined') {
          rendered.value = false
          return
        }
        // Wait one frame for the closed-state styles to apply, then time the exit.
        requestAnimationFrame(() => {
          if (props.present) return
          if (childEl.value) unmountWhenDone(childEl.value)
          else rendered.value = false
        })
      },
    )

    onBeforeUnmount(clearExitTimer)

    /** Resolve the DOM element from either an element ref or a component instance. */
    function captureEl(value: unknown): void {
      const el = (value as { $el?: unknown })?.$el ?? value
      childEl.value = el instanceof HTMLElement ? el : null
    }

    return () => {
      if (!rendered.value) return null
      const nodes = slots.default?.({ state: dataState.value }) ?? []
      // Pick the single real element/component child, skipping whitespace text and
      // comment vnodes (whose `type` is a symbol).
      const child = nodes.find(
        (n): n is VNode => typeof n === 'object' && n !== null && 'type' in n && typeof n.type !== 'symbol',
      )
      if (!child) return null
      // Clone the single child so we can stamp data-state + capture its element
      // without requiring the consumer to forward anything.
      return cloneVNode(
        child,
        { 'data-state': dataState.value, 'ref': captureEl },
        true,
      )
    }
  },
})
</script>
