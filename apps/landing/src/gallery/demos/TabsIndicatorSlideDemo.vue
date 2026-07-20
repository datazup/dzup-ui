<script setup lang="ts">
import { DzTabContent, DzTabList, DzTabs, DzTabTrigger, DzText } from '@dzup-ui/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Tabs indicator slide demo (catalog `tabs-indicator-slide`, effect 31) — the
 * active-tab underline glides between tabs instead of snapping. It reuses the
 * accessible core DzTabs (Reka semantics, roving focus, keyboard) and only swaps
 * the visual indicator: the built-in per-trigger underline is neutralised (see
 * the scoped `:deep` rule) and a single bar is positioned under the active
 * trigger, animating `transform`/`width` between tabs.
 *
 * The bar is measured from the live DOM (active trigger vs. the tablist box) so
 * it stays correct across tab widths, font loading and container resizes. Under
 * reduced motion (OS or the page toggle) the transition is dropped, so the bar
 * moves instantly.
 */
const tabs = [
  { value: 'overview', label: 'Overview', body: 'A high-level tour of the gallery.' },
  { value: 'pricing', label: 'Pricing', body: 'Free forever; a Pro track for teams.' },
  { value: 'docs', label: 'Docs', body: 'Copy-paste snippets for every effect.' },
  { value: 'support', label: 'Support', body: 'Issues, discussions and changelog.' },
] as const

const active = ref<string>(tabs[0].value)
const reduced = useReducedMotion()

const rail = ref<HTMLElement | null>(null)
const bar = ref({ left: 0, width: 0 })

/** Measure the active trigger relative to the tablist and place the bar. */
function measure(): void {
  const root = rail.value
  if (!root)
    return
  const list = root.querySelector<HTMLElement>('[role="tablist"]')
  const activeTab = root.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
  if (!list || !activeTab)
    return
  const listRect = list.getBoundingClientRect()
  const tabRect = activeTab.getBoundingClientRect()
  bar.value = { left: tabRect.left - listRect.left, width: tabRect.width }
}

const barStyle = computed(() => ({
  transform: `translateX(${bar.value.left}px)`,
  width: `${bar.value.width}px`,
  // Drop the glide under reduced motion → the bar jumps to the active tab.
  transition: reduced.value
    ? 'none'
    : 'transform var(--dz-duration-normal, 200ms) var(--dz-ease-default, ease), width var(--dz-duration-normal, 200ms) var(--dz-ease-default, ease)',
}))

// Re-measure after Reka has patched data-state on the new active trigger.
watch(active, () => nextTick(measure), { flush: 'post' })

let observer: ResizeObserver | null = null
onMounted(() => {
  nextTick(measure)
  if (typeof ResizeObserver !== 'undefined' && rail.value) {
    observer = new ResizeObserver(() => measure())
    observer.observe(rail.value)
  }
})
onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="stage">
    <DzTabs v-model="active" variant="line" tone="primary" size="sm">
      <div ref="rail" class="rail">
        <DzTabList aria-label="Gallery sections">
          <DzTabTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
            {{ tab.label }}
          </DzTabTrigger>
        </DzTabList>
        <!-- The single gliding indicator; decorative, so hidden from a11y. -->
        <span class="indicator" :style="barStyle" aria-hidden="true" />
      </div>

      <DzTabContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <DzText size="sm" tone="muted" as="p" class="panel">
          {{ tab.body }}
        </DzText>
      </DzTabContent>
    </DzTabs>
  </div>
</template>

<style scoped>
.stage {
  width: min(340px, 100%);
}

/* Coordinate space for the indicator: the bar is positioned relative to this
   wrapper, which sits flush over the tablist. */
.rail {
  position: relative;
}

/* Neutralise the built-in snapping underline so the single gliding bar is the
   only indicator; the active text colour (tone) is left intact. */
.rail :deep([role="tab"]) {
  border-bottom-color: transparent !important;
}

.indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-primary, #0766ee);
  pointer-events: none;
}

.panel {
  margin: 0;
  padding-top: 4px;
}
</style>
