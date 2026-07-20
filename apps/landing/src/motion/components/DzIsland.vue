<script lang="ts">
// Module-scoped counter so each island's content region gets a unique id for
// aria-controls.
</script>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'
import { supportsInterpolateSize } from '../useViewTransition.ts'

const expanded = defineModel<boolean>('expanded', { default: false })

/**
 * DzIsland — a compact pill that morphs to reveal expanded content and back
 * (docs/animations.md §5.7, effect 56 — the "Dynamic Island" surface).
 *
 * Size morph: where `interpolate-size: allow-keywords` is supported (Chromium),
 * the container animates its `width`/`height` between the collapsed pill and the
 * expanded `auto` size on a real CSS transition (the native path). Elsewhere it
 * falls back to a **FLIP** (Web Animations API): snapshot the collapsed box,
 * expand, then invert-and-play the new box back to the old one. The expanded
 * content fades/rises in via `@starting-style` (behind `@supports`). Under
 * reduced motion (OS or the page toggle) the expand/collapse is instant.
 *
 * Accessibility (§5.7, §7):
 * - The pill is a real `<button>` with `aria-expanded` + `aria-controls`.
 * - Expanded content is announced **politely** via a persistent `aria-live`
 *   region (present before the content mounts so the insertion is read out).
 * - Custom keyframes never run under reduced motion: the FLIP is JS-gated on
 *   `useReducedMotion`, and the `@starting-style` / size transition live inside
 *   `@media (prefers-reduced-motion: no-preference)` and a `:not(.is-reduced)`
 *   guard for the page-level toggle the media query can't see.
 *
 * Extractable: token-only, no landing-only imports, transform/opacity-only motion.
 */

const props = withDefaults(
  defineProps<{
    /** Polite announcement made when the island expands (defaults to a generic line). */
    announce?: string
    /** Force instant expand/collapse (page-level reduced motion). Merged with the OS setting. */
    disabled?: boolean
  }>(),
  { announce: 'Expanded', disabled: false },
)

let islandUid = 0

const uid = ++islandUid
const contentId = `dz-island-content-${uid}`

const islandEl = ref<HTMLElement | null>(null)

const osReduced = useReducedMotion()
const reduced = computed(() => props.disabled || osReduced.value)

/** The CSS size transition (interpolate-size) owns the morph only when allowed. */
const canInterpolate = computed(() => supportsInterpolateSize() && !reduced.value)

/** Invert the container from its current box back to `from`, then play to rest. */
function flipResize(from: DOMRect): void {
  const el = islandEl.value
  if (!el)
    return
  const to = el.getBoundingClientRect()
  if (!to.width || !to.height)
    return
  const sx = from.width / to.width
  const sy = from.height / to.height
  if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001)
    return
  el.animate(
    [
      { transform: `scale(${sx.toFixed(3)}, ${sy.toFixed(3)})` },
      { transform: 'none' },
    ],
    { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  )
}

function toggle(): void {
  // Native size transition (CSS) or instant (reduced): just flip the flag.
  if (reduced.value || canInterpolate.value) {
    expanded.value = !expanded.value
    return
  }
  // FLIP fallback: snapshot, mutate, invert-and-play next frame.
  const from = islandEl.value?.getBoundingClientRect()
  expanded.value = !expanded.value
  void nextTick(() => {
    if (from)
      flipResize(from)
  })
}

function collapse(): void {
  if (!expanded.value)
    return
  if (reduced.value || canInterpolate.value) {
    expanded.value = false
    return
  }
  const from = islandEl.value?.getBoundingClientRect()
  expanded.value = false
  void nextTick(() => {
    if (from)
      flipResize(from)
  })
}

defineExpose({ toggle, collapse })
</script>

<template>
  <div
    ref="islandEl"
    class="dz-island"
    :class="{ 'is-expanded': expanded, 'is-reduced': reduced }"
  >
    <button
      type="button"
      class="dz-island__pill"
      :aria-expanded="expanded"
      :aria-controls="contentId"
      @click="toggle"
    >
      <slot name="pill" :expanded="expanded" :toggle="toggle" />
    </button>

    <div v-if="expanded" :id="contentId" class="dz-island__content">
      <slot :collapse="collapse" :expanded="expanded" />
    </div>

    <!-- Persistent polite live region: present before the content mounts so the
         expansion is announced to assistive tech. -->
    <p class="dz-sr-only" aria-live="polite">
      {{ expanded ? announce : '' }}
    </p>
  </div>
</template>

<style scoped>
.dz-island {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  /* Collapsed pill radius; relaxes toward a rounded rect when expanded. */
  border-radius: var(--dz-radius-full, 9999px);
  overflow: hidden;
  /* No transition by default — the native path below opts in where supported and
     motion is allowed; the FLIP path owns the morph everywhere else. */
}

.dz-island.is-expanded {
  border-radius: var(--dz-radius-xl, 0.875rem);
}

.dz-island__pill {
  appearance: none;
  border: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  background: transparent;
  cursor: pointer;
  /* The slotted pill owns its own padding/surface; this is a structural button. */
}

.dz-island__pill:focus-visible {
  outline: var(--dz-focus-ring-width, 2px) solid var(--dz-ring, var(--dz-primary, #0766ee));
  outline-offset: 2px;
}

.dz-island__content {
  /* Visible resting state; the @supports block animates it in from @starting-style. */
  opacity: 1;
  transform: none;
}

/* ── Native size morph — true width/height animation via interpolate-size.
   Only where supported AND motion is allowed (OS), and not under the page toggle
   (.is-reduced, which the @media can't see). ── */
@supports (interpolate-size: allow-keywords) {
  @media (prefers-reduced-motion: no-preference) {
    .dz-island:not(.is-reduced) {
      interpolate-size: allow-keywords;
      transition:
        width var(--dz-anim-duration-emphasis, 375ms) var(--dz-anim-ease-emphasis, ease-in-out),
        height var(--dz-anim-duration-emphasis, 375ms) var(--dz-anim-ease-emphasis, ease-in-out),
        border-radius var(--dz-anim-duration-emphasis, 375ms) var(--dz-anim-ease-emphasis, ease-in-out);
    }
  }
}

/* ── Content entrance — @starting-style fade + rise, gated the same way. ── */
@supports (transition-behavior: allow-discrete) {
  @media (prefers-reduced-motion: no-preference) {
    .dz-island:not(.is-reduced) .dz-island__content {
      transition:
        opacity var(--dz-anim-duration-enter, 225ms) var(--dz-anim-ease-entrance, ease-out),
        transform var(--dz-anim-duration-enter, 225ms) var(--dz-anim-ease-entrance, ease-out);
    }

    @starting-style {
      .dz-island:not(.is-reduced) .dz-island__content {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  }
}

/* Shared accessibility helper (mirrors tokens.css .dz-sr-only so the component is
   self-contained when extracted). */
.dz-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
