<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import { computed, ref, watch } from 'vue'
import { useInView } from '../useInView.ts'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzOdometer — a sliding-number / odometer figure (docs/animations.md §5.3,
 * effect 41). Each digit is its own vertical column; on first scroll into view
 * every column translateY-rolls from its current digit to the target digit on a
 * left-to-right stagger, the way a mechanical odometer settles. Distinct from the
 * count-up tween (effect 12, {@link DzCountUp}): there the *value* tweens and the
 * glyphs are re-rendered each frame; here the value is fixed and the *glyphs roll*.
 *
 * Number formatting (thousands separators, currency, percent, decimals…) reuses
 * the same `Intl.NumberFormat` approach as core's DzAnimatedNumber / DzCountUp —
 * the formatted target string is split into per-character columns: digits roll,
 * separators (`,`/`.`/`-`/spaces) render statically. Static `prefix`/`suffix`
 * strings render either side. `tabular-nums` keeps every digit the same width so
 * the figure never changes width as the columns roll.
 *
 * Performance (§7): only `transform` animates (the ribbon's translateY) — no
 * layout reflow per frame. `will-change: transform` is set on the rolling ribbons.
 *
 * Accessibility (§7):
 * - The rolling columns are decorative (a screen reader narrating a column of
 *   tumbling 0–9 glyphs reads as noise), so the visual is wrapped in a single
 *   `role="img"` host carrying the final value as its `aria-label`; the inner
 *   markup is `aria-hidden`. Assistive tech therefore announces just "48,200".
 * - Under reduced motion (OS setting OR the page-level toggle, via {@link
 *   useReducedMotion}) the columns are placed straight on their target with a 0ms
 *   transition — the final number shows instantly, no roll, no width jump.
 *
 * The roll fires once per in-view (shared {@link useInView}); the gallery's Replay
 * re-mounts the demo, which re-arms it. Extraction-ready: no landing-only imports.
 */
interface DzOdometerProps {
  /** The target value the digits roll to. */
  value: number
  /** Value the columns rest on before rolling (aligned from the right). @default 0 */
  from?: number
  /** Roll duration in ms (ignored under reduced motion). @default 1100 */
  duration?: number
  /** Extra delay per digit column for the left-to-right settle, in ms. @default 60 */
  stagger?: number
  /** `Intl.NumberFormat` options (currency, percent, decimals…). */
  format?: Intl.NumberFormatOptions
  /** BCP-47 locale(s) for formatting (defaults to the runtime locale). */
  locale?: string | string[]
  /** Static text rendered before the figure (e.g. "$"). */
  prefix?: string
  /** Static text rendered after the figure (e.g. "k", "+"). */
  suffix?: string
  /** Figure size — mirrors DzAnimatedNumber's `--dz-text-*` scale. @default 'md' */
  size?: CanonicalSize
  /** Semantic colour tone of the figure. @default 'neutral' */
  tone?: CanonicalTone
  /** Accessible label override; defaults to the formatted value with affixes. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<DzOdometerProps>(), {
  from: 0,
  duration: 1100,
  stagger: 60,
  format: undefined,
  locale: undefined,
  prefix: undefined,
  suffix: undefined,
  size: 'md',
  tone: 'neutral',
  ariaLabel: undefined,
})

const root = ref<HTMLElement | null>(null)
const inView = useInView(root)
const reduced = useReducedMotion()

/** A rolling digit column, or a static separator character. */
type Segment
  = | { kind: 'digit', start: number, target: number, order: number }
    | { kind: 'sep', char: string }

const formatter = computed(() => new Intl.NumberFormat(props.locale, props.format))
const targetStr = computed(() => formatter.value.format(props.value))
const fromStr = computed(() => formatter.value.format(props.from))

/**
 * Split the formatted target into per-character columns. Digit columns carry both
 * their resting (`from`) and `target` digit — the `from` digit is taken by
 * aligning the two formatted strings from the right (units to units), defaulting
 * to `0` when `from` has fewer digits. `order` is the left-to-right digit index,
 * driving the stagger.
 */
const segments = computed<Segment[]>(() => {
  const fromDigits = fromStr.value.replace(/\D/g, '')
  const chars = [...targetStr.value]
  const digitTotal = chars.reduce((n, c) => (/\d/.test(c) ? n + 1 : n), 0)
  let seen = 0
  return chars.map((ch) => {
    if (!/\d/.test(ch))
      return { kind: 'sep', char: ch }
    const fromRight = digitTotal - 1 - seen
    const startChar = fromDigits[fromDigits.length - 1 - fromRight] ?? '0'
    const seg: Segment = {
      kind: 'digit',
      start: Number(startChar),
      target: Number(ch),
      order: seen,
    }
    seen += 1
    return seg
  })
})

/** Becomes true once in view (or immediately under reduced motion) → roll. */
const rolled = ref(false)
watch(
  [inView, reduced],
  ([visible, isReduced]) => {
    if (isReduced || visible)
      rolled.value = true
  },
  { immediate: true },
)

/** Per-column inline timing: the digit offset (transform), duration and stagger. */
function ribbonStyle(seg: Segment): Record<string, string> {
  if (seg.kind !== 'digit')
    return {}
  const digit = rolled.value ? seg.target : seg.start
  return {
    transform: `translateY(calc(-1em * ${digit}))`,
    // Reduced motion snaps (0ms); otherwise roll with a left-to-right stagger.
    transitionDuration: reduced.value ? '0ms' : `var(--dz-anim-odometer-duration, ${props.duration}ms)`,
    transitionDelay: reduced.value ? '0ms' : `${seg.order * props.stagger}ms`,
  }
}

/** Figure scale + tone, mapped to the same tokens DzAnimatedNumber uses. */
const SIZE_FONT: Record<CanonicalSize, string> = {
  xs: '--dz-text-base',
  sm: '--dz-text-lg',
  md: '--dz-text-2xl',
  lg: '--dz-text-3xl',
  xl: '--dz-text-4xl',
  icon: '--dz-text-2xl',
}
const TONE_COLOR: Record<CanonicalTone, string> = {
  neutral: '--dz-foreground',
  primary: '--dz-primary',
  success: '--dz-success',
  warning: '--dz-warning',
  danger: '--dz-danger',
  info: '--dz-info',
}
const rootStyle = computed(() => ({
  fontSize: `var(${SIZE_FONT[props.size]})`,
  color: `var(${TONE_COLOR[props.tone]})`,
}))

/** Single accessible name — the affixed, formatted final value. */
const label = computed(
  () => props.ariaLabel ?? `${props.prefix ?? ''}${targetStr.value}${props.suffix ?? ''}`,
)
</script>

<template>
  <span ref="root" class="dz-odometer" role="img" :aria-label="label" :style="rootStyle">
    <span v-if="prefix" class="dz-odometer__affix" aria-hidden="true">{{ prefix }}</span>

    <span class="dz-odometer__track" aria-hidden="true">
      <template v-for="(seg, i) in segments" :key="i">
        <span v-if="seg.kind === 'digit'" class="dz-odometer__col">
          <span class="dz-odometer__ribbon" :style="ribbonStyle(seg)">
            <span v-for="n in 10" :key="n" class="dz-odometer__cell">{{ n - 1 }}</span>
          </span>
        </span>
        <span v-else class="dz-odometer__sep">{{ seg.char }}</span>
      </template>
    </span>

    <span v-if="suffix" class="dz-odometer__affix" aria-hidden="true">{{ suffix }}</span>
  </span>
</template>

<style scoped>
/* Single line box; every part is 1em tall and top-aligned so digit cells and
   separators share a baseline. tabular-nums fixes digit width (no jitter/shift). */
.dz-odometer {
  display: inline-flex;
  align-items: flex-start;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.dz-odometer__track {
  display: inline-flex;
  align-items: flex-start;
}

/* The viewport for one digit — clips the ribbon to a single 1em-tall window. */
.dz-odometer__col {
  display: inline-block;
  height: 1em;
  overflow: hidden;
}

/* The 0–9 strip; transform is the only animated property. */
.dz-odometer__ribbon {
  display: flex;
  flex-direction: column;
  will-change: transform;
  transition-property: transform;
  transition-timing-function: var(--dz-anim-ease-emphasis, cubic-bezier(0.4, 0, 0.2, 1));
}

.dz-odometer__cell {
  height: 1em;
  line-height: 1;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.dz-odometer__sep,
.dz-odometer__affix {
  display: inline-block;
  height: 1em;
  line-height: 1;
}
</style>
