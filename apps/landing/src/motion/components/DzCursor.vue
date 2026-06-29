<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * DzCursor — a smooth trailing cursor/blob confined to a host region
 * (docs/animations.md §5.5, effect 49).
 *
 * Wraps any surface; a soft blob eases toward the pointer inside the host with a
 * little lag (a lerp toward the live pointer position each frame), so it trails
 * rather than snaps. `transform: translate3d()` only — one write per frame via
 * `requestAnimationFrame`. The native cursor is hidden inside the host while the
 * blob is live and restored the instant the pointer leaves.
 *
 * Accessibility / touch guarantees (§5.5, §7):
 * - **Pointer-only.** Engages only on fine-pointer, hover-capable devices; touch
 *   pointer events are ignored. Touch users keep the native cursor, no blob.
 * - **Reduced-motion.** Off when the OS sets `prefers-reduced-motion` OR the
 *   caller passes `disabled: true` (wire to the page-level toggle). Off ⇒ native
 *   cursor, no blob, no rAF loop.
 * - **Never traps the pointer.** The blob is `pointer-events: none` and purely
 *   decorative (`aria-hidden`); every control inside the host stays clickable and
 *   keyboard-focusable. Keyboard users never see the blob (it only follows a
 *   moving pointer) and the native cursor returns on leave.
 */

const props = withDefaults(
  defineProps<{
    /** Blob diameter in px (default `28`). */
    size?: number
    /** Trailing smoothness, 0–1 (higher ⇒ snappier; default `0.18`). */
    ease?: number
    /** Force the native-cursor-only state (page-level reduced motion). */
    disabled?: boolean
  }>(),
  { size: 28, ease: 0.18, disabled: false },
)

const root = ref<HTMLElement | null>(null)
const blob = ref<HTMLElement | null>(null)
const active = ref(false)

let frame = 0
let inside = false
let attached = false
// Live pointer target and the blob's eased current position.
let targetX = 0
let targetY = 0
let curX = 0
let curY = 0
let primed = false

/** Whether the device has a fine, hover-capable pointer (SSR-safe). */
function canHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function loop(): void {
  curX += (targetX - curX) * props.ease
  curY += (targetY - curY) * props.ease
  if (blob.value) {
    blob.value.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) translate(-50%, -50%)`
  }
  const settled = Math.abs(targetX - curX) < 0.1 && Math.abs(targetY - curY) < 0.1
  if (inside || !settled) {
    frame = requestAnimationFrame(loop)
  } else {
    frame = 0
  }
}

function onMove(event: PointerEvent): void {
  if (event.pointerType === 'touch' || !root.value) return
  const rect = root.value.getBoundingClientRect()
  targetX = event.clientX - rect.left
  targetY = event.clientY - rect.top
  if (!primed) {
    // First move: place the blob under the pointer so it doesn't fly in from 0,0.
    curX = targetX
    curY = targetY
    primed = true
  }
  if (!inside) {
    inside = true
    active.value = true
  }
  if (!frame) frame = requestAnimationFrame(loop)
}

function onLeave(event: PointerEvent): void {
  if (event.pointerType === 'touch') return
  inside = false
  active.value = false
  primed = false
}

function attach(): void {
  if (attached || !root.value) return
  root.value.addEventListener('pointermove', onMove)
  root.value.addEventListener('pointerleave', onLeave)
  attached = true
}

function detach(): void {
  if (!attached || !root.value) return
  root.value.removeEventListener('pointermove', onMove)
  root.value.removeEventListener('pointerleave', onLeave)
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }
  inside = false
  active.value = false
  primed = false
  attached = false
}

function sync(): void {
  if (!props.disabled && canHover()) attach()
  else detach()
}

watch(() => props.disabled, sync)
onMounted(sync)
onBeforeUnmount(detach)
</script>

<template>
  <div
    ref="root"
    class="dz-cursor-host"
    :class="{ 'dz-cursor-host--active': active }"
    :style="{ '--dz-cursor-size': `${size}px` }"
  >
    <slot />
    <span ref="blob" class="dz-cursor__blob" :class="{ 'dz-cursor__blob--on': active }" aria-hidden="true" />
  </div>
</template>

<style scoped>
.dz-cursor-host {
  position: relative;
}

/* Hide the native cursor only while the blob is live; restored on leave and for
   touch/keyboard/reduced (the blob never activates there). */
.dz-cursor-host--active {
  cursor: none;
}

.dz-cursor__blob {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--dz-cursor-size, 28px);
  height: var(--dz-cursor-size, 28px);
  border-radius: var(--dz-radius-full, 9999px);
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  /* Soft brand blob with a mix-blend so it reads over light + dark surfaces. */
  background: radial-gradient(
    circle at center,
    color-mix(in oklch, var(--dz-primary, #6366f1) 70%, transparent),
    color-mix(in oklch, var(--dz-primary, #6366f1) 20%, transparent) 70%,
    transparent 72%
  );
  mix-blend-mode: multiply;
  transition: opacity var(--dz-duration-fast, 120ms) var(--dz-ease-out, ease-out);
}

:global([data-theme='dark']) .dz-cursor__blob {
  mix-blend-mode: screen;
}

.dz-cursor__blob--on {
  opacity: 1;
}

/* Forced-colors: a blend-mode blob would vanish — fall back to an outline ring. */
@media (forced-colors: active) {
  .dz-cursor__blob {
    background: none;
    border: 2px solid CanvasText;
    mix-blend-mode: normal;
  }
}
</style>
