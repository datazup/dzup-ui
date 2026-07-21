<script setup lang="ts">
import type { CSSProperties, VNode } from 'vue'
import { Comment, computed, Fragment, Text, useSlots } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzOrbit — slotted items orbiting a centre on one or more rings
 * (docs/animations.md §5.1, effect 38). Each default-slot child is laid on a
 * ring and the ring spins a full turn on a slow loop while the item
 * counter-rotates the same turn (opposite sign) so its content stays upright.
 *
 * Transform (`rotate`) only — GPU-cheap, no layout thrash. Each item gets its own
 * rotating frame at the shared per-ring speed/direction, so a ring's items spin
 * in perfect unison (visually one ring) without the component grouping vnodes.
 *
 * Accessibility (§7): the decorative ring tracks are `aria-hidden`; the slotted
 * content is NOT wrapped in anything hidden, so avatars/badges stay in the
 * accessibility tree. Under reduced motion (OS or the page-level toggle, via
 * {@link useReducedMotion}) the rings freeze to a static ring of icons.
 *
 * The looping rings/counters carry `will-change: transform` while animating; the
 * shared off-screen loop cap (`.dz-stage-idle`, tokens.css) pauses them and drops
 * the compositor hint when the card scrolls away, and the bound `--reduced` class
 * clears it under reduced motion. Extraction-ready: no landing-only imports.
 */
const props = withDefaults(
  defineProps<{
    /** Innermost ring radius, in px. */
    radius?: number
    /** Added radius per outer ring, in px. */
    ringGap?: number
    /** Number of concentric rings to spread items across. */
    rings?: number
    /** One full revolution duration (any CSS time). */
    speed?: string
    /** Flip the base spin direction. */
    reverse?: boolean
  }>(),
  {
    radius: 66,
    ringGap: 46,
    rings: 1,
    speed: 'var(--dz-anim-orbit-duration, 28s)',
    reverse: false,
  },
)

const reduced = useReducedMotion()
const slots = useSlots()

/**
 * Flatten the default slot to its real element/component children (drop comments
 * and whitespace-only text nodes, unwrap v-for / template fragments).
 */
function flatten(nodes: VNode[]): VNode[] {
  const out: VNode[] = []
  for (const node of nodes) {
    if (node.type === Fragment) {
      out.push(...flatten((node.children as VNode[]) ?? []))
    }
    else if (node.type === Comment) {
      continue
    }
    else if (node.type === Text) {
      if (typeof node.children !== 'string' || node.children.trim() !== '')
        out.push(node)
    }
    else {
      out.push(node)
    }
  }
  return out
}

const ringCount = computed(() => Math.max(1, Math.floor(props.rings)))

/** Per-ring radius, used for the decorative track circles. */
const tracks = computed(() =>
  Array.from({ length: ringCount.value }, (_, r) => props.radius + r * props.ringGap),
)

const outerRadius = computed(() => props.radius + (ringCount.value - 1) * props.ringGap)
// Size the container to the outer ring (+ a little room for item overflow).
const rootStyle = computed<CSSProperties>(() => ({
  width: `${outerRadius.value * 2 + 16}px`,
  height: `${outerRadius.value * 2 + 16}px`,
}))

interface OrbitNode {
  node: VNode
  nodeStyle: CSSProperties
  ringStyle: CSSProperties
  counterStyle: CSSProperties
}

/**
 * Each slotted item paired with its placement (position + spin/counter-spin).
 * Re-evaluates when the orbit props change (fresh vnodes from the slot).
 */
const nodes = computed<OrbitNode[]>(() => {
  const list = flatten(slots.default?.() ?? [])
  const count = list.length
  const rings = ringCount.value
  return list.map((node, i): OrbitNode => {
    const ringIndex = i % rings
    const radius = props.radius + ringIndex * props.ringGap
    // How many items share this ring, and this item's slot within it.
    const onRing = Math.ceil((count - ringIndex) / rings)
    const posOnRing = Math.floor(i / rings)
    const step = 360 / onRing
    // Start at 12 o'clock; nudge each ring's phase so rings don't line up.
    const deg = -90 + ringIndex * 24 + posOnRing * step
    const rad = (deg * Math.PI) / 180
    const x = Math.round(radius * Math.cos(rad) * 1000) / 1000
    const y = Math.round(radius * Math.sin(rad) * 1000) / 1000
    // Alternate direction per ring for a livelier system; `reverse` flips the base.
    const forward = (ringIndex % 2 === 0) !== props.reverse
    const spin = forward ? 'dz-anim-orbit-spin' : 'dz-anim-orbit-spin-reverse'
    const counter = forward ? 'dz-anim-orbit-spin-reverse' : 'dz-anim-orbit-spin'
    const loop: CSSProperties = {
      animationDuration: props.speed,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    }
    return {
      node,
      nodeStyle: { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` },
      ringStyle: { ...loop, animationName: spin },
      counterStyle: { ...loop, animationName: counter },
    }
  })
})

const orbitClass = computed(() => ({
  'dz-orbit': true,
  'dz-orbit--reduced': reduced.value,
}))

// Passthrough functional component so captured slot vnodes render in place.
const VNodeRenderer = (p: { node: VNode }): VNode => p.node
</script>

<template>
  <div :class="orbitClass" :style="rootStyle">
    <!-- Decorative ring outlines — hidden from assistive tech. -->
    <span
      v-for="(r, i) in tracks"
      :key="`track-${i}`"
      class="dz-orbit__track"
      :style="{ width: `${r * 2}px`, height: `${r * 2}px` }"
      aria-hidden="true"
    />

    <!-- One rotating frame per item (shared per-ring speed → they spin in unison).
         The item itself stays in the accessibility tree. -->
    <div
      v-for="(entry, i) in nodes"
      :key="`item-${i}`"
      class="dz-orbit__ring"
      :style="entry.ringStyle"
    >
      <div class="dz-orbit__node" :style="entry.nodeStyle">
        <div class="dz-orbit__counter" :style="entry.counterStyle">
          <VNodeRenderer :node="entry.node" />
        </div>
      </div>
    </div>

    <!-- Centre hub. -->
    <div class="dz-orbit__center">
      <slot name="center" />
    </div>
  </div>
</template>

<style scoped>
.dz-orbit {
  position: relative;
  display: grid;
  place-items: center;
  /* Items at the ring edges may extend past the track; let them breathe. */
  overflow: visible;
}

/* Decorative ring outline — a faint static circle the items ride. */
.dz-orbit__track {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid color-mix(in oklch, var(--dz-colors-primary-500, #6366f1) 18%, transparent);
  pointer-events: none;
}

/* Rotating frame: a full turn per loop, centred on the hub. */
.dz-orbit__ring {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  will-change: transform;
}

/* Static offset placing the item at its (x, y) point on the ring. */
.dz-orbit__node {
  position: absolute;
  top: 50%;
  left: 50%;
}

/* Counter-rotation: cancels the ring's turn so the content stays upright. */
.dz-orbit__counter {
  display: inline-flex;
  transform-origin: center center;
  will-change: transform;
}

/* Centre hub sits above the tracks and rings. */
.dz-orbit__center {
  position: relative;
  z-index: 1;
  display: inline-flex;
}

/* Reduced motion (OS or page toggle) → a static, upright ring of icons. The
 * !important wins over the inline animation props set per item. */
.dz-orbit--reduced .dz-orbit__ring,
.dz-orbit--reduced .dz-orbit__counter {
  animation: none !important;
  will-change: auto;
}
</style>
