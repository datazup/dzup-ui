<script setup lang="ts">
import { computed } from 'vue'
import { DzButton, DzColorPicker, DzSegmented, DzSlider, DzText } from '@dzup-ui/core'
import type { SegmentedItem } from '@dzup-ui/core'
import { Palette, RotateCcw, TriangleAlert } from 'lucide-vue-next'
import { useBlockTheme } from '../../composables/useBlockTheme.ts'
import type { Density } from '../../composables/useBlockTheme.ts'
import { RADIUS_MAX, RADIUS_MIN, RADIUS_STEP } from '../../composables/useBlockTheme.ts'

/**
 * BlockThemeToolbar — the global /blocks token editor (docs/blocks.md §3.4;
 * tweakcn is the reference). The flagship single-source differentiator: a brand
 * colour picker, a radius slider and a density segmented control, all writing to
 * the one {@link useBlockTheme} store. Because every preview binds that store's
 * `vars` map and every copied snippet serialises the SAME map into a `:root{}`
 * block, changing a control here re-themes every live preview instantly AND makes
 * the copied code render identically — one state, never computed twice.
 *
 * One instance lives at the top of /blocks, so the editor is discovered once and
 * applies everywhere. Built entirely from @dzup-ui/core controls; all three are
 * keyboard-operable and labelled, and the only CSS here is layout (token-only).
 */
const theme = useBlockTheme()
const { brand, radiusScale, density, hasOverrides, contrastWarning, reset } = theme

/**
 * Brand presets (hex so the store can measure their contrast). The picker itself
 * is exempt from the token-only rule — colour is its payload — and an empty brand
 * means "the library's shipped primary", i.e. no override at all.
 */
const BRAND_PRESETS = [
  '#4f46e5',
  '#2563eb',
  '#0ea5e9',
  '#14b8a6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
] as const

const densityItems: SegmentedItem[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
]

/** DzSegmented models a plain string; narrow it back to the Density union on write. */
const densityModel = computed<string>({
  get: () => density.value,
  set: (value) => {
    density.value = (value as Density) ?? 'comfortable'
  },
})

/** Human radius readout, e.g. `1.00×` (multiplier of the shipped scale). */
const radiusLabel = computed(() => `${radiusScale.value.toFixed(2)}×`)
</script>

<template>
  <section class="block-theme" aria-labelledby="block-theme-title">
    <div class="block-theme-inner">
      <div class="bt-intro">
        <Palette :size="18" aria-hidden="true" class="bt-intro-icon" />
        <div class="bt-intro-text">
          <DzText id="block-theme-title" size="sm" weight="semibold" as="span" class="bt-title">
            Theme every preview
          </DzText>
          <DzText size="xs" tone="muted" as="p" class="bt-sub">
            Recolour, round and re-space all blocks at once — the copied code carries the same tokens.
          </DzText>
        </div>
      </div>

      <div class="bt-controls">
        <!-- Brand colour: writes `--dz-primary` (+ ring/link/hover) on every preview. -->
        <div class="bt-field">
          <DzText size="xs" weight="medium" as="span" id="bt-brand-label" class="bt-label">
            Brand
          </DzText>
          <DzColorPicker
            v-model="brand"
            :presets="[...BRAND_PRESETS]"
            size="sm"
            aria-labelledby="bt-brand-label"
          />
        </div>

        <!-- Radius scale: multiplies the named radius tokens. -->
        <div class="bt-field bt-field--slider">
          <DzText size="xs" weight="medium" as="span" id="bt-radius-label" class="bt-label">
            Radius
            <span class="bt-readout" aria-hidden="true">{{ radiusLabel }}</span>
          </DzText>
          <DzSlider
            v-model="radiusScale"
            :min="RADIUS_MIN"
            :max="RADIUS_MAX"
            :step="RADIUS_STEP"
            size="sm"
            class="bt-slider"
            aria-labelledby="bt-radius-label"
          />
        </div>

        <!-- Density: multiplies the spacing scale (component heights/paddings). -->
        <div class="bt-field">
          <DzText size="xs" weight="medium" as="span" id="bt-density-label" class="bt-label">
            Density
          </DzText>
          <DzSegmented
            v-model="densityModel"
            :items="densityItems"
            size="sm"
            aria-labelledby="bt-density-label"
          />
        </div>

        <DzButton
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="!hasOverrides"
          aria-label="Reset theme to the library defaults"
          class="bt-reset"
          @click="reset"
        >
          <template #prefix><RotateCcw :size="15" aria-hidden="true" /></template>
          Reset
        </DzButton>
      </div>
    </div>

    <!-- AA contrast guard: warns (role=alert) when the brand colour can't reach
         WCAG AA against its best text colour, without blocking the override. -->
    <div v-if="contrastWarning" class="block-theme-inner bt-warning-wrap">
      <p class="bt-warning" role="alert">
        <TriangleAlert :size="15" aria-hidden="true" class="bt-warning-icon" />
        <span>{{ contrastWarning }}</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.block-theme {
  padding: clamp(12px, 2vw, 20px) 24px 0;
}

.block-theme-inner {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 14px 16px;
  border: 1px solid var(--lp-hairline, var(--dz-border));
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
}

.bt-intro {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.bt-intro-icon {
  flex: none;
  color: var(--dz-primary);
}

.bt-intro-text {
  min-width: 0;
}

.bt-title {
  margin: 0;
}

.bt-sub {
  margin: 2px 0 0;
  line-height: 1.4;
}

.bt-controls {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.bt-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.bt-field--slider {
  min-width: 160px;
  flex: 1 1 160px;
}

.bt-label {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.bt-readout {
  font-variant-numeric: tabular-nums;
  color: var(--dz-muted-foreground);
}

.bt-slider {
  width: 100%;
}

.bt-reset {
  flex: none;
}

/* Contrast guard banner — warning tone, token-only. */
.bt-warning-wrap {
  margin-top: 8px;
  padding: 0;
  border: 0;
  box-shadow: none;
  background: transparent;
  justify-content: flex-start;
}

.bt-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px 14px;
  width: 100%;
  border: 1px solid var(--dz-warning-border);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-warning-muted);
  color: var(--dz-warning-muted-foreground);
  font-size: var(--dz-text-xs, 0.75rem);
  line-height: 1.5;
}

.bt-warning-icon {
  flex: none;
  margin-top: 1px;
  color: var(--dz-warning);
}

@media (max-width: 720px) {
  .block-theme-inner {
    align-items: stretch;
  }
  .bt-controls {
    align-items: stretch;
  }
}
</style>
