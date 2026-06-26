<script setup lang="ts">
/**
 * Tooltip toolbar — labelled icon actions on hover/focus (DzTooltip).
 *
 * A formatting toolbar where every DzIconButton is wrapped in a DzTooltip that
 * reveals its name and keyboard shortcut (DzKbd) on hover or keyboard focus.
 * Tooltips demonstrate per-side placement and a short open delay; DzDividers
 * separate the action groups. Toggle actions (bold/italic/underline) keep live
 * pressed state.
 *
 * Self-contained — free @dzup-ui/core components and `--dz-*` tokens only.
 * Heading level 4 to nest under the BlockPreview H3.
 */
import {
  DzDivider,
  DzHeading,
  DzIconButton,
  DzKbd,
  DzText,
  DzTooltip,
  DzTooltipContent,
  DzTooltipTrigger,
} from '@dzup-ui/core'
import type { TooltipSide } from '@dzup-ui/core'
import type { Component } from 'vue'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Image,
  Italic,
  Link,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-vue-next'
import { reactive } from 'vue'

interface Tip {
  key: string
  icon: Component
  label: string
  keys: string[]
  side: TooltipSide
  toggle?: boolean
}

const toolbar: Tip[][] = [
  [
    { key: 'undo', icon: Undo2, label: 'Undo', keys: ['mod', 'z'], side: 'top' },
    { key: 'redo', icon: Redo2, label: 'Redo', keys: ['mod', 'shift', 'z'], side: 'top' },
  ],
  [
    { key: 'bold', icon: Bold, label: 'Bold', keys: ['mod', 'b'], side: 'bottom', toggle: true },
    { key: 'italic', icon: Italic, label: 'Italic', keys: ['mod', 'i'], side: 'bottom', toggle: true },
    { key: 'underline', icon: Underline, label: 'Underline', keys: ['mod', 'u'], side: 'bottom', toggle: true },
  ],
  [
    { key: 'left', icon: AlignLeft, label: 'Align left', keys: ['mod', 'shift', 'l'], side: 'bottom' },
    { key: 'center', icon: AlignCenter, label: 'Align center', keys: ['mod', 'shift', 'e'], side: 'bottom' },
    { key: 'right', icon: AlignRight, label: 'Align right', keys: ['mod', 'shift', 'r'], side: 'bottom' },
  ],
  [
    { key: 'link', icon: Link, label: 'Insert link', keys: ['mod', 'k'], side: 'top' },
    { key: 'image', icon: Image, label: 'Insert image', keys: ['mod', 'shift', 'i'], side: 'top' },
  ],
]

const pressed = reactive<Record<string, boolean>>({})

function onClick(tip: Tip): void {
  if (tip.toggle) pressed[tip.key] = !pressed[tip.key]
}
</script>

<template>
  <section class="tt-wrap" aria-labelledby="tt-title">
    <header class="tt-head">
      <DzHeading id="tt-title" :level="4" size="md" weight="semibold" class="tt-title">
        Editor toolbar
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="tt-sub">
        Hover or focus any action to reveal its tooltip and shortcut.
      </DzText>
    </header>

    <div class="tt-bar" role="toolbar" aria-label="Text formatting">
      <template v-for="(group, gi) in toolbar" :key="gi">
        <DzDivider v-if="gi > 0" orientation="vertical" class="tt-sep" />
        <div class="tt-group">
          <DzTooltip
            v-for="tip in group"
            :key="tip.key"
            :delay-duration="150"
          >
            <DzTooltipTrigger as-child>
              <DzIconButton
                :icon="tip.icon"
                :ariaLabel="tip.label"
                variant="ghost"
                :tone="tip.toggle && pressed[tip.key] ? 'primary' : 'neutral'"
                size="sm"
                :aria-pressed="tip.toggle ? !!pressed[tip.key] : undefined"
                @click="onClick(tip)"
              />
            </DzTooltipTrigger>
            <DzTooltipContent :side="tip.side">
              <span class="tt-tip">
                <span class="tt-tip-label">{{ tip.label }}</span>
                <DzKbd :keys="tip.keys" size="sm" />
              </span>
            </DzTooltipContent>
          </DzTooltip>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.tt-wrap {
  max-width: 38rem;
  margin: 0 auto;
}

.tt-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.tt-title {
  margin: 0;
}

.tt-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.tt-bar {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
  padding: var(--dz-space-1, 0.25rem);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #fff);
}

.tt-group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.tt-sep {
  height: 1.5rem;
  margin: 0 var(--dz-space-1, 0.25rem);
}

.tt-tip {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.tt-tip-label {
  font-size: var(--dz-text-xs, 0.75rem);
}
</style>
