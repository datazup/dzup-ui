# Appearance editor

A brand/theme customizer with a live preview — a DzColorPicker (presets + hex input) and two DzKnob rotary dials for radius and scale, reflected instantly in a preview panel.

- **Category:** Forms & Inputs
- **Components:** DzCard, DzColorPicker, DzKnob, DzFormField, DzFormLabel, DzButton, DzHeading, DzText
- **Preview:** /blocks/appearance-editor

```vue
<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzColorPicker,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzKnob,
  DzText,
} from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Appearance editor — a brand/theme customizer with a live preview.
 *
 * A DzColorPicker (with preset swatches + hex input) drives the brand color,
 * and two DzKnob rotary dials set corner radius and UI scale. A preview panel
 * on the right reflects every change instantly via bound inline styles. Local
 * ref() state only.
 *
 * Forms family: DzColorPicker, DzKnob, DzFormField, DzFormLabel.
 */

const brand = ref('#6366f1')
const radius = ref(12)
const scale = ref(100)

const PRESETS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
</script>

<template>
  <section class="ae-wrap" aria-labelledby="ae-title">
    <DzCard variant="elevated" padding="lg" class="ae-card">
      <header class="ae-head">
        <DzHeading id="ae-title" :level="4" size="xl" weight="semibold">
          Appearance
        </DzHeading>
        <DzText tone="muted" size="sm" as="p">Tune your brand and preview it live.</DzText>
      </header>

      <div class="ae-body">
        <!-- Controls -->
        <div class="ae-controls">
          <DzFormField>
            <DzFormLabel>Brand color</DzFormLabel>
            <DzColorPicker
              v-model="brand"
              :presets="PRESETS"
              show-input
              aria-label="Brand color"
            />
          </DzFormField>

          <div class="ae-knobs">
            <DzFormField>
              <DzFormLabel>Radius</DzFormLabel>
              <DzKnob
                v-model:value="radius"
                :min="0"
                :max="24"
                tone="primary"
                value-template="{value}px"
                show-value
                aria-label="Corner radius"
              />
            </DzFormField>
            <DzFormField>
              <DzFormLabel>Scale</DzFormLabel>
              <DzKnob
                v-model:value="scale"
                :min="80"
                :max="120"
                tone="primary"
                value-template="{value}%"
                show-value
                aria-label="UI scale"
              />
            </DzFormField>
          </div>
        </div>

        <!-- Live preview -->
        <div class="ae-preview" :style="{ '--ae-brand': brand, '--ae-radius': `${radius}px`, '--ae-scale': `${scale / 100}` }">
          <DzText size="xs" tone="muted" weight="medium" as="div" class="ae-preview-label">Preview</DzText>
          <div class="ae-card-demo">
            <div class="ae-swatch" aria-hidden="true" />
            <div class="ae-card-demo-body">
              <div class="ae-bar ae-bar--lg" aria-hidden="true" />
              <div class="ae-bar ae-bar--sm" aria-hidden="true" />
            </div>
            <button type="button" class="ae-demo-btn">Get started</button>
          </div>
        </div>
      </div>

      <div class="ae-actions">
        <DzButton variant="ghost" tone="neutral">Reset</DzButton>
        <DzButton variant="solid" tone="primary">Save theme</DzButton>
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.ae-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.ae-card {
  width: 100%;
  max-width: 40rem;
}

.ae-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.ae-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-5, 1.25rem);
  align-items: start;
}

.ae-controls {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.ae-knobs {
  display: flex;
  gap: var(--dz-space-5, 1.25rem);
}

/* Preview panel — reflects the bound brand/radius/scale custom properties. */
.ae-preview {
  padding: var(--dz-space-4, 1rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.75rem);
  background: var(--dz-muted, #f8fafc);
}

.ae-preview-label {
  margin-bottom: var(--dz-space-3, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ae-card-demo {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-4, 1rem);
  background: var(--dz-surface, #fff);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--ae-radius, 12px);
  transform: scale(var(--ae-scale, 1));
  transform-origin: top left;
}

.ae-swatch {
  height: 3rem;
  border-radius: calc(var(--ae-radius, 12px) * 0.6);
  background: var(--ae-brand, #6366f1);
}

.ae-card-demo-body {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.ae-bar {
  height: 0.5rem;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-border, #e5e7eb);
}

.ae-bar--lg {
  width: 80%;
}

.ae-bar--sm {
  width: 55%;
}

.ae-demo-btn {
  align-self: flex-start;
  padding: 0.4rem 0.9rem;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: #fff;
  background: var(--ae-brand, #6366f1);
  border: none;
  border-radius: calc(var(--ae-radius, 12px) * 0.6);
  cursor: pointer;
}

.ae-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-5, 1.25rem);
}

@media (max-width: 560px) {
  .ae-body {
    grid-template-columns: 1fr;
  }
}
</style>
```
