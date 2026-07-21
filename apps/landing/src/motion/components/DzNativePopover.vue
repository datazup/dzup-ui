<script lang="ts">
// Module-scoped counter so each popover's panel/trigger ids are unique.
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'
import { supportsPopover } from '../useViewTransition.ts'

defineOptions({ inheritAttrs: true })

/**
 * DzNativePopover — a tooltip/menu surface that opens with a native entrance
 * (docs/animations.md §5.7, effect 57).
 *
 * Native path (Popover API, Baseline): the trigger is a real `<button>` wired to
 * the panel via `popovertarget`, and the panel carries the `popover` attribute —
 * so it renders in the top layer with the browser's own **light-dismiss, Esc and
 * one-popover-at-a-time** behaviour, no JS. It animates in from `@starting-style`
 * with `transition-behavior: allow-discrete` (so the exit plays too) behind
 * `@supports`. The panel is positioned under its trigger by a tiny JS placer on
 * each open (CSS anchor positioning isn't Baseline yet), kept in sync while open.
 *
 * Where the Popover API is absent we fall back to a Vue `<Transition>` with a
 * manually-managed open state, re-adding Esc + outside-click dismissal so the
 * surface stays accessible. Under reduced motion (OS or the page toggle) the
 * surface shows/hides instantly on both paths.
 *
 * Constraints (§5.7, §7): progressive enhancement (the un-enhanced state is a
 * correct, visible popover), token-only, transform/opacity-only motion, no core
 * fork. Pairs with `DzTooltip` / `DzMenu`-style content rendered into the slot.
 */

const props = withDefaults(
  defineProps<{
    /** Accessible label for the surface (set on the panel). */
    ariaLabel?: string
    /**
     * Optional ARIA role for the panel — e.g. `tooltip` for a hint. Omit when the
     * slotted content owns its own semantics (a `DzMenu` is already a nav landmark).
     */
    role?: 'menu' | 'tooltip' | 'dialog'
    /** Gap in px between the trigger and the panel (default `8`). */
    offset?: number
    /** Force instant show/hide (page-level reduced motion). Merged with the OS setting. */
    disabled?: boolean
  }>(),
  { ariaLabel: undefined, role: undefined, offset: 8, disabled: false },
)

let popoverUid = 0

const uid = ++popoverUid
const panelId = `dz-native-popover-${uid}`

const native = supportsPopover()
const osReduced = useReducedMotion()
const reduced = computed(() => props.disabled || osReduced.value)

// ── Native path ─────────────────────────────────────────────────────────────
const triggerBtn = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)

/** Place the top-layer panel just under its trigger (fixed/viewport coords). */
function positionPanel(): void {
  const btn = triggerBtn.value
  const panel = panelEl.value
  if (!btn || !panel)
    return
  const r = btn.getBoundingClientRect()
  panel.style.left = `${Math.round(r.left)}px`
  panel.style.top = `${Math.round(r.bottom + props.offset)}px`
}

// `beforetoggle` fires before the state flips: position on the way IN so there is
// no first-frame flash; sync on scroll/resize while open; tidy up on the way OUT.
function onBeforeToggle(event: Event): void {
  const open = (event as Event & { newState?: string }).newState === 'open'
  if (open) {
    positionPanel()
    window.addEventListener('scroll', positionPanel, true)
    window.addEventListener('resize', positionPanel)
  }
  else {
    window.removeEventListener('scroll', positionPanel, true)
    window.removeEventListener('resize', positionPanel)
  }
}

// Attach the native `beforetoggle` listener directly to the panel element (rather
// than a template binding) so it works regardless of the DOM lib's event typings.
watch(panelEl, (el, prev) => {
  prev?.removeEventListener('beforetoggle', onBeforeToggle)
  el?.addEventListener('beforetoggle', onBeforeToggle)
})

function closeNative(): void {
  ;(panelEl.value as HTMLElement & { hidePopover?: () => void })?.hidePopover?.()
}

// ── Fallback path (no Popover API) ──────────────────────────────────────────
const fbOpen = ref(false)
const fbRoot = ref<HTMLElement | null>(null)

function toggleFb(): void {
  fbOpen.value = !fbOpen.value
}

function onDocPointerDown(event: PointerEvent): void {
  const root = fbRoot.value
  if (root && event.target instanceof Node && !root.contains(event.target))
    fbOpen.value = false
}
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape')
    fbOpen.value = false
}

// Light-dismiss + Esc, mounted only while the fallback surface is open (the
// native path gets these from the browser for free).
watch(fbOpen, (isOpen) => {
  if (typeof document === 'undefined')
    return
  if (isOpen) {
    document.addEventListener('pointerdown', onDocPointerDown)
    document.addEventListener('keydown', onKeydown)
  }
  else {
    document.removeEventListener('pointerdown', onDocPointerDown)
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  panelEl.value?.removeEventListener('beforetoggle', onBeforeToggle)
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', positionPanel, true)
    window.removeEventListener('resize', positionPanel)
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onDocPointerDown)
    document.removeEventListener('keydown', onKeydown)
  }
})

/** Unified close handed to the slot so menu items can dismiss either path. */
function close(): void {
  if (native)
    closeNative()
  else fbOpen.value = false
}
</script>

<template>
  <div ref="fbRoot" class="dz-native-pop">
    <!-- Native path: popovertarget + [popover]; browser owns dismiss/Esc/top-layer. -->
    <template v-if="native">
      <button ref="triggerBtn" type="button" class="dz-native-pop__trigger" :popovertarget="panelId">
        <slot name="trigger" />
      </button>
      <div
        :id="panelId"
        ref="panelEl"
        popover
        class="dz-native-pop__panel dz-native-pop__panel--native"
        :class="{ 'is-reduced': reduced }"
        :role="role"
        :aria-label="ariaLabel"
      >
        <slot :close="close" />
      </div>
    </template>

    <!-- Fallback path: manual open state + <Transition>, with Esc + outside-click. -->
    <template v-else>
      <button
        type="button"
        class="dz-native-pop__trigger"
        :aria-expanded="fbOpen"
        :aria-controls="panelId"
        @click="toggleFb"
      >
        <slot name="trigger" />
      </button>
      <Transition name="dz-native-pop" :css="!reduced">
        <div
          v-if="fbOpen"
          :id="panelId"
          class="dz-native-pop__panel dz-native-pop__panel--fallback"
          :role="role"
          :aria-label="ariaLabel"
        >
          <slot :close="close" />
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.dz-native-pop {
  position: relative;
  display: inline-flex;
}

.dz-native-pop__trigger {
  appearance: none;
  border: 0;
  margin: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

/* The panel owns only the motion + a positioning reset; the surface chrome is the
   consumer's (slotted DzMenu / tooltip card). */
.dz-native-pop__panel {
  background: transparent;
  overflow: visible;
}

/* Native [popover] panel: drop the UA's centred fixed positioning so the JS placer
   can pin it under the trigger (fixed/viewport coords set inline). */
.dz-native-pop__panel--native {
  margin: 0;
  inset: auto;
  border: 0;
  padding: 0;
}

/* Fallback panel sits just below the trigger inside the positioned wrapper. */
.dz-native-pop__panel--fallback {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 50;
}

/* ── Native entrance — @starting-style + transition-behavior: allow-discrete.
   The closed base (opacity 0 / offset) animates to the open state; the
   @starting-style row gives the enter-from frame; `overlay`/`display` are
   transitioned with allow-discrete so the EXIT animates before the top-layer
   element is removed. Gated to motion-allowed + not the page toggle. ── */
@supports (transition-behavior: allow-discrete) {
  @media (prefers-reduced-motion: no-preference) {
    .dz-native-pop__panel--native:not(.is-reduced) {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
      transition:
        opacity var(--dz-anim-duration-enter, 225ms) var(--dz-anim-ease-entrance, ease-out),
        transform var(--dz-anim-duration-enter, 225ms) var(--dz-anim-ease-entrance, ease-out),
        overlay var(--dz-anim-duration-enter, 225ms) var(--dz-anim-ease-entrance, ease-out) allow-discrete,
        display var(--dz-anim-duration-enter, 225ms) var(--dz-anim-ease-entrance, ease-out) allow-discrete;
    }

    .dz-native-pop__panel--native:not(.is-reduced):popover-open {
      opacity: 1;
      transform: none;
    }

    @starting-style {
      .dz-native-pop__panel--native:not(.is-reduced):popover-open {
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
      }
    }
  }
}

/* ── Fallback <Transition> — the same fade + rise for engines without Popover. ── */
.dz-native-pop-enter-active,
.dz-native-pop-leave-active {
  transition:
    opacity var(--dz-anim-duration-enter, 225ms) var(--dz-anim-ease-entrance, ease-out),
    transform var(--dz-anim-duration-enter, 225ms) var(--dz-anim-ease-entrance, ease-out);
}
.dz-native-pop-enter-from,
.dz-native-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

/* OS reduced motion → instant for the fallback transition (the native path is
   already neutralised by the @media guard on its rules above). */
@media (prefers-reduced-motion: reduce) {
  .dz-native-pop-enter-active,
  .dz-native-pop-leave-active {
    transition: none;
  }
}
</style>
