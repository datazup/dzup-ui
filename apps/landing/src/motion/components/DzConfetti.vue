<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { onBeforeUnmount, ref } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzConfetti — a celebratory particle burst for milestone moments (docs/animations.md
 * §6.9, effect 34). Drop it inside a positioned host (it fills the host as a
 * non-interactive overlay) and call its exposed `burst()` on a key action; it
 * spawns a short-lived fan of randomised, multi-colour pieces that fly outward,
 * spin and fade. The `.dz-confetti__piece` flight is owned by `tokens.css`; this
 * component generates the per-piece vectors/colours and cleans pieces up after
 * they land.
 *
 * Under reduced motion (OS or the page-level toggle) `burst()` is a no-op — a
 * particle storm is exactly the kind of non-essential motion reduced-motion users
 * opt out of; the triggering control's own state change carries the confirmation.
 */
const props = withDefaults(
  defineProps<{
    /** Number of pieces per burst. */
    count?: number
  }>(),
  { count: 28 },
)

const reduced = useReducedMotion()

interface Piece {
  id: number
  style: CSSProperties
}

const pieces = ref<Piece[]>([])
const timers = new Set<ReturnType<typeof setTimeout>>()
let seq = 0

// Brand-forward palette so the burst reads as celebratory, not monochrome.
const PALETTE = [
  'var(--dz-primary, #6366f1)',
  'var(--dz-colors-secondary-500, #a855f7)',
  'var(--dz-success, #16a34a)',
  'var(--dz-warning, #f59e0b)',
  'var(--dz-info, #0ea5e9)',
  'var(--dz-danger, #ef4444)',
]

function burst(): void {
  if (reduced.value) return

  const batch: Piece[] = []
  for (let i = 0; i < props.count; i += 1) {
    // Bias slightly upward (−110°..−70° plus full spread) so it arcs like a popper.
    const angle = Math.random() * Math.PI * 2
    const distance = 70 + Math.random() * 90
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * distance
    const spin = (Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 480)
    const dim = 7 + Math.round(Math.random() * 5)
    const round = Math.random() < 0.4

    batch.push({
      id: (seq += 1),
      style: {
        '--tx': `${tx.toFixed(1)}px`,
        '--ty': `${ty.toFixed(1)}px`,
        '--r': `${spin.toFixed(0)}deg`,
        '--c': PALETTE[i % PALETTE.length],
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: round ? '9999px' : 'var(--dz-radius-xs, 2px)',
        animationDelay: `${(Math.random() * 60).toFixed(0)}ms`,
      } as CSSProperties,
    })
  }

  pieces.value.push(...batch)
  const ids = new Set(batch.map((p) => p.id))
  const timer = setTimeout(() => {
    pieces.value = pieces.value.filter((p) => !ids.has(p.id))
    timers.delete(timer)
  }, 1100)
  timers.add(timer)
}

onBeforeUnmount(() => {
  timers.forEach((t) => clearTimeout(t))
  timers.clear()
})

defineExpose({ burst })
</script>

<template>
  <span class="dz-confetti" :class="{ 'dz-confetti--reduced': reduced }" aria-hidden="true">
    <span
      v-for="piece in pieces"
      :key="piece.id"
      class="dz-confetti__piece"
      :style="piece.style"
    />
  </span>
</template>
