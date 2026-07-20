<script setup lang="ts">
import type { Component } from 'vue'
/**
 * Toolbar canvas — a design-tool shell: a DzToolbar over a tool rail, an
 * artboard, and a properties panel.
 *
 * DzToolbar lays out semantic start / center / end regions for the top chrome.
 * A vertical DzFlex forms the icon tool rail, with a DzSpacer (`size="auto"`)
 * pushing the settings button to the bottom. DzScrollArea holds the scrollable
 * canvas, and a DzPanel hosts the inspector — DzDivider splitting its groups.
 * Pure structural composition from the Layout family.
 *
 * Self-contained: local static data, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import {
  DzBadge,
  DzDivider,
  DzFlex,
  DzIconButton,
  DzPanel,
  DzScrollArea,
  DzSpacer,
  DzText,
  DzToolbar,
} from '@dzup-ui/core'
import {
  Frame,
  Hand,
  Image as ImageIcon,
  MousePointer2,
  PenTool,
  Redo2,
  Settings,
  Share2,
  Square,
  Type,
  Undo2,
} from 'lucide-vue-next'

interface Tool {
  icon: Component
  label: string
  active?: boolean
}

const tools: Tool[] = [
  { icon: MousePointer2, label: 'Select', active: true },
  { icon: Hand, label: 'Pan' },
  { icon: Frame, label: 'Frame' },
  { icon: Square, label: 'Rectangle' },
  { icon: PenTool, label: 'Pen' },
  { icon: Type, label: 'Text' },
  { icon: ImageIcon, label: 'Image' },
]

interface Field {
  label: string
  value: string
}

const position: Field[] = [
  { label: 'X', value: '120' },
  { label: 'Y', value: '64' },
  { label: 'W', value: '320' },
  { label: 'H', value: '200' },
]
</script>

<template>
  <section class="tc" aria-labelledby="tc-title">
    <DzText id="tc-title" class="dz-sr-only">
      Design canvas workspace
    </DzText>

    <!-- Top chrome -->
    <DzToolbar variant="elevated" size="sm" class="tc-toolbar">
      <template #start>
        <DzBadge variant="solid" tone="primary" size="sm">
          Untitled
        </DzBadge>
        <DzIconButton :icon="Undo2" aria-label="Undo" variant="ghost" tone="neutral" size="sm" />
        <DzIconButton :icon="Redo2" aria-label="Redo" variant="ghost" tone="neutral" size="sm" />
      </template>
      <template #center>
        <DzText size="sm" weight="semibold">
          Landing redesign
        </DzText>
      </template>
      <template #end>
        <DzBadge variant="subtle" tone="neutral" size="sm">
          100%
        </DzBadge>
        <DzIconButton :icon="Share2" aria-label="Share" variant="outline" tone="primary" size="sm" />
      </template>
    </DzToolbar>

    <div class="tc-body">
      <!-- Vertical tool rail -->
      <DzFlex direction="column" align="center" gap="xs" class="tc-rail">
        <DzIconButton
          v-for="tool in tools"
          :key="tool.label"
          :icon="tool.icon"
          :aria-label="tool.label"
          :variant="tool.active ? 'solid' : 'ghost'"
          :tone="tool.active ? 'primary' : 'neutral'"
          size="sm"
        />
        <DzSpacer size="auto" />
        <DzIconButton :icon="Settings" aria-label="Settings" variant="ghost" tone="neutral" size="sm" />
      </DzFlex>

      <!-- Scrollable canvas -->
      <DzScrollArea class="tc-canvas-scroll">
        <div class="tc-canvas">
          <div class="tc-artboard">
            <div class="tc-shape tc-shape--hero" />
            <div class="tc-shape tc-shape--bar" />
            <div class="tc-shape tc-shape--row">
              <span class="tc-shape tc-shape--tile" />
              <span class="tc-shape tc-shape--tile" />
              <span class="tc-shape tc-shape--tile" />
            </div>
          </div>
          <DzText size="xs" tone="muted" align="center" class="tc-artboard-label">
            Home / Desktop · 1440
          </DzText>
        </div>
      </DzScrollArea>

      <!-- Inspector -->
      <DzPanel header="Properties" variant="outlined" class="tc-inspector">
        <DzText size="xs" tone="muted" weight="semibold" class="tc-group-label">
          POSITION
        </DzText>
        <div class="tc-grid">
          <label v-for="field in position" :key="field.label" class="tc-field">
            <span class="tc-field-key">{{ field.label }}</span>
            <span class="tc-field-val">{{ field.value }}</span>
          </label>
        </div>

        <DzDivider class="tc-rule" />

        <DzText size="xs" tone="muted" weight="semibold" class="tc-group-label">
          APPEARANCE
        </DzText>
        <div class="tc-appearance">
          <div class="tc-swatch-row">
            <span class="tc-swatch tc-swatch--fill" />
            <DzText size="sm" as="span">
              Fill
            </DzText>
            <DzText size="sm" tone="muted" as="span" class="tc-swatch-hex">
              Primary
            </DzText>
          </div>
          <div class="tc-swatch-row">
            <span class="tc-swatch tc-swatch--stroke" />
            <DzText size="sm" as="span">
              Stroke
            </DzText>
            <DzText size="sm" tone="muted" as="span" class="tc-swatch-hex">
              Border · 1
            </DzText>
          </div>
        </div>
      </DzPanel>
    </div>
  </section>
</template>

<style scoped>
.tc {
  background: var(--dz-background, #fff);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.75rem);
  overflow: hidden;
  max-width: 56rem;
  margin: 0 auto;
}

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

.tc-toolbar {
  border-radius: 0;
}

.tc-body {
  display: flex;
  align-items: stretch;
  height: 22rem;
}

.tc-rail {
  flex: 0 0 auto;
  padding: var(--dz-space-2, 0.5rem);
  border-right: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-muted, #f9fafb);
}

.tc-canvas-scroll {
  flex: 1;
  min-width: 0;
  background:
    radial-gradient(circle, var(--dz-border, #e5e7eb) 1px, transparent 1px);
  background-size: 16px 16px;
  background-color: var(--dz-muted, #f9fafb);
}

.tc-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-8, 2rem);
  min-height: 100%;
}

.tc-artboard {
  width: min(28rem, 100%);
  background: var(--dz-background, #fff);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-md, 0.5rem);
  box-shadow: var(--dz-shadow-md, 0 4px 12px rgb(0 0 0 / 0.08));
  padding: var(--dz-space-4, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.tc-shape {
  border-radius: var(--dz-radius-sm, 0.25rem);
  background: var(--dz-muted, #eef0f3);
}

.tc-shape--hero {
  height: 5rem;
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 16%, transparent);
}

.tc-shape--bar {
  height: 1.25rem;
  width: 60%;
}

.tc-shape--row {
  display: flex;
  gap: var(--dz-space-3, 0.75rem);
  background: transparent;
}

.tc-shape--tile {
  flex: 1;
  height: 3rem;
}

.tc-artboard-label {
  margin: 0;
}

.tc-inspector {
  flex: 0 0 13rem;
  border-radius: 0;
  border-top: 0;
  border-bottom: 0;
  border-right: 0;
}

.tc-group-label {
  display: block;
  letter-spacing: 0.06em;
  margin-bottom: var(--dz-space-2, 0.5rem);
}

.tc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-2, 0.5rem);
}

.tc-field {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-1, 0.25rem) var(--dz-space-2, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-sm, 0.25rem);
  font-size: var(--dz-text-sm, 0.875rem);
}

.tc-field-key {
  color: var(--dz-muted-foreground, #9ca3af);
}

.tc-field-val {
  color: var(--dz-foreground, #111);
  margin-left: auto;
}

.tc-rule {
  margin: var(--dz-space-4, 1rem) 0;
}

.tc-appearance {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.tc-swatch-row {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.tc-swatch {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: var(--dz-radius-sm, 0.25rem);
  border: 1px solid var(--dz-border, #e5e7eb);
}

.tc-swatch--fill {
  background: var(--dz-primary, #6366f1);
}

.tc-swatch--stroke {
  background: var(--dz-foreground, #111);
}

.tc-swatch-hex {
  margin-left: auto;
}

/* Drop the inspector below on narrow widths; keep rail + canvas side by side. */
@media (max-width: 640px) {
  .tc-body {
    flex-wrap: wrap;
    height: auto;
  }

  .tc-canvas-scroll {
    height: 16rem;
    flex: 1 1 60%;
  }

  .tc-inspector {
    flex: 1 1 100%;
    border-top: 1px solid var(--dz-border, #e5e7eb);
  }
}
</style>
