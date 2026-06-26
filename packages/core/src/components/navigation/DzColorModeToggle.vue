<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import type { ThemePreference } from '../../providers/DzThemeProvider.types.ts'
import type {
  DzColorModeToggleEmits,
  DzColorModeToggleProps,
  DzColorModeToggleSlots,
} from './DzColorModeToggle.types.ts'
/**
 * DzColorModeToggle — light / dark / system theme switch.
 *
 * A ready-made control bound to the existing DzThemeProvider via `useTheme`
 * (ADR-08/ADR-09). It introduces **no parallel theme store** — persistence,
 * live system-following (`prefers-color-scheme`), and FOUC suppression
 * (ADR-15) are all handled by the provider; this component only reflects and
 * mutates the provider's preference.
 *
 * Three variants:
 * - `icon` — a single DzIconButton that cycles modes.
 * - `switch` — a DzSwitch (light ⇄ dark) reflecting the resolved mode.
 * - `segmented` — an explicit DzSegmented (light / dark / system).
 *
 * @example
 * ```vue
 * <DzColorModeToggle variant="segmented" :show-system="true" />
 * ```
 */
import { computed, h, useAttrs } from 'vue'
import { useTheme } from '../../providers/useTheme.ts'
import { cn } from '../../utilities/cn.ts'
import DzIconButton from '../buttons/DzIconButton.vue'
import DzSwitch from '../forms/DzSwitch.vue'
import { colorModeToggleVariants } from './DzColorModeToggle.variants.ts'
import DzSegmented from './DzSegmented.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzColorModeToggleProps>(), {
  variant: 'icon',
  showSystem: true,
  size: 'md',
  labels: undefined,
})

const emit = defineEmits<DzColorModeToggleEmits>()
defineSlots<DzColorModeToggleSlots>()

const attrs = useAttrs()

// Bind to the provider. `optional` keeps the control resilient in SSR layouts
// or before the provider mounts — it degrades to a no-op instead of throwing.
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme({ optional: true })

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const DEFAULT_LABELS = { light: 'Light', dark: 'Dark', system: 'System' } as const

function labelFor(mode: ThemePreference): string {
  return props.labels?.[mode] ?? DEFAULT_LABELS[mode]
}

// ---------------------------------------------------------------------------
// Mode ordering (drives the icon cycle and the segmented options)
// ---------------------------------------------------------------------------

const order = computed<ThemePreference[]>(() =>
  props.showSystem ? ['light', 'dark', 'system'] : ['light', 'dark'],
)

/** The mode that an icon-cycle activation will move to next. */
const nextMode = computed<ThemePreference>(() => {
  const index = order.value.indexOf(theme.value)
  // indexOf === -1 (e.g. 'system' while showSystem is false) wraps to the first.
  return order.value[(index + 1) % order.value.length] ?? 'light'
})

// ---------------------------------------------------------------------------
// Inline glyphs (lucide-style). Functional components so the swap is cheap.
// ---------------------------------------------------------------------------

const svgAttrs = {
  'xmlns': 'http://www.w3.org/2000/svg',
  'viewBox': '0 0 24 24',
  'fill': 'none',
  'stroke': 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
} as const

const SunIcon: FunctionalComponent = () =>
  h('svg', svgAttrs, [
    h('circle', { cx: '12', cy: '12', r: '4' }),
    h('path', {
      d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
    }),
  ])

const MoonIcon: FunctionalComponent = () =>
  h('svg', svgAttrs, [h('path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' })])

const MonitorIcon: FunctionalComponent = () =>
  h('svg', svgAttrs, [
    h('rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }),
    h('path', { d: 'M8 21h8M12 17v4' }),
  ])

const ICONS: Record<'light' | 'dark' | 'system', FunctionalComponent> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
}

/** Glyph representing the current preference (system shows the monitor glyph). */
const currentIcon = computed<FunctionalComponent>(() => ICONS[theme.value])

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------

const styles = computed(() => colorModeToggleVariants({ variant: props.variant }))
const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
const glyphClasses = computed(() => styles.value.glyph())

// ---------------------------------------------------------------------------
// Accessible labels + live announcement
// ---------------------------------------------------------------------------

/** Action label for the icon button — states what activation will do. */
const iconAriaLabel = computed(
  () => props.ariaLabel ?? `Switch to ${labelFor(nextMode.value).toLowerCase()} theme`,
)

/** Whether the switch variant is currently "on" (dark). */
const isDark = computed(() => resolvedTheme.value === 'dark')

/** Action label for the switch — states the opposite of the current mode. */
const switchAriaLabel = computed(
  () => props.ariaLabel ?? `Switch to ${isDark.value ? 'light' : 'dark'} theme`,
)

const segmentedAriaLabel = computed(() => props.ariaLabel ?? 'Color theme')

/** Options for the segmented variant. */
const segmentedItems = computed(() =>
  order.value.map(mode => ({ value: mode, label: labelFor(mode) })),
)

/** Polite announcement of the active mode for screen readers. */
const announcement = computed(() => {
  if (theme.value === 'system') {
    return `System theme (${labelFor(resolvedTheme.value)})`
  }
  return `${labelFor(theme.value)} theme`
})

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function commit(next: ThemePreference): void {
  setTheme(next)
  emit('change', next)
}

function handleCycle(): void {
  commit(nextMode.value)
}

function handleSwitchChange(): void {
  // Capture the target *before* toggling — `toggleTheme()` mutates the provider
  // (and thus `isDark`) synchronously.
  const next: ThemePreference = isDark.value ? 'light' : 'dark'
  toggleTheme()
  emit('change', next)
}

function handleSegmentChange(value: string): void {
  commit(value as ThemePreference)
}
</script>

<template>
  <span
    :class="rootClasses"
    :data-variant="variant"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- icon variant: a single button that cycles modes -->
    <DzIconButton
      v-if="variant === 'icon'"
      :id="id"
      :icon="currentIcon"
      :aria-label="iconAriaLabel"
      :size="size"
      variant="ghost"
      tone="neutral"
      :data-mode="theme"
      @click="handleCycle"
    />

    <!-- switch variant: light ⇄ dark -->
    <DzSwitch
      v-else-if="variant === 'switch'"
      :id="id"
      :model-value="isDark"
      :size="size"
      :aria-label="switchAriaLabel"
      :data-mode="resolvedTheme"
      @change="handleSwitchChange"
    >
      <slot name="icon" :mode="resolvedTheme" :theme="theme">
        <component :is="currentIcon" :class="glyphClasses" />
      </slot>
    </DzSwitch>

    <!-- segmented variant: explicit light / dark / system -->
    <DzSegmented
      v-else
      :id="id"
      :model-value="theme"
      :items="segmentedItems"
      :size="size"
      :aria-label="segmentedAriaLabel"
      :data-mode="theme"
      @change="handleSegmentChange"
    />

    <!-- Live region: announces the active mode to assistive tech -->
    <span class="sr-only" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </span>
  </span>
</template>
