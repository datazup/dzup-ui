<script setup lang="ts">
import {
  DzCopyButton,
  DzIconButton,
  DzSplitButton,
  DzSplitButtonAction,
  DzSplitButtonMenu,
  DzText,
  DzToggleButton,
} from '@dzup-ui/core'
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
import { ref } from 'vue'

/**
 * Rich-text editor toolbar — a realistic document toolbar built almost entirely
 * from the Buttons family:
 *   • DzToggleButton — pressable inline-format and alignment controls (live,
 *     `v-model`-bound, exposing `aria-pressed`).
 *   • DzIconButton — undo / redo / insert affordances (icon-only, each with a
 *     required `ariaLabel`).
 *   • DzCopyButton — copies a share link with built-in copied feedback.
 *   • DzSplitButton — a primary "Publish" action paired with a dropdown trigger
 *     for related options.
 *
 * Self-contained: local state only, no props. Composed from free @dzup-ui/core
 * components and `--dz-*` tokens, so it drops in already themed and accessible
 * (docs/blocks.md §3.6).
 */

// Inline formatting (pressed state is real — toggle the buttons in the preview).
const bold = ref(true)
const italic = ref(false)
const underline = ref(false)

// Paragraph alignment — modelled as a single-choice set of toggles.
const align = ref<'left' | 'center' | 'right'>('left')
function setAlign(value: 'left' | 'center' | 'right'): void {
  align.value = value
}
</script>

<template>
  <section class="et-wrap" aria-label="Editor toolbar">
    <div class="et-bar" role="toolbar" aria-label="Text formatting">
      <!-- History -->
      <div class="et-cluster">
        <DzIconButton :icon="Undo2" ariaLabel="Undo" variant="ghost" tone="neutral" size="sm" />
        <DzIconButton :icon="Redo2" ariaLabel="Redo" variant="ghost" tone="neutral" size="sm" />
      </div>

      <span class="et-sep" aria-hidden="true" />

      <!-- Inline format -->
      <div class="et-cluster">
        <DzToggleButton v-model="bold" size="sm" ariaLabel="Bold">
          <Bold :size="16" aria-hidden="true" />
        </DzToggleButton>
        <DzToggleButton v-model="italic" size="sm" ariaLabel="Italic">
          <Italic :size="16" aria-hidden="true" />
        </DzToggleButton>
        <DzToggleButton v-model="underline" size="sm" ariaLabel="Underline">
          <Underline :size="16" aria-hidden="true" />
        </DzToggleButton>
      </div>

      <span class="et-sep" aria-hidden="true" />

      <!-- Alignment (single-choice) -->
      <div class="et-cluster">
        <DzToggleButton
          :model-value="align === 'left'"
          size="sm"
          ariaLabel="Align left"
          @change="setAlign('left')"
        >
          <AlignLeft :size="16" aria-hidden="true" />
        </DzToggleButton>
        <DzToggleButton
          :model-value="align === 'center'"
          size="sm"
          ariaLabel="Align center"
          @change="setAlign('center')"
        >
          <AlignCenter :size="16" aria-hidden="true" />
        </DzToggleButton>
        <DzToggleButton
          :model-value="align === 'right'"
          size="sm"
          ariaLabel="Align right"
          @change="setAlign('right')"
        >
          <AlignRight :size="16" aria-hidden="true" />
        </DzToggleButton>
      </div>

      <span class="et-sep" aria-hidden="true" />

      <!-- Insert -->
      <div class="et-cluster">
        <DzIconButton :icon="Link" ariaLabel="Insert link" variant="ghost" tone="neutral" size="sm" />
        <DzIconButton :icon="Image" ariaLabel="Insert image" variant="ghost" tone="neutral" size="sm" />
      </div>

      <!-- Right-aligned actions -->
      <div class="et-spacer" />

      <DzCopyButton
        value="https://app.example.com/docs/q3-launch-plan"
        aria-label="Copy share link"
        label="Copy link"
        copied-label="Link copied"
        variant="outline"
        tone="neutral"
        size="sm"
      />

      <DzSplitButton tone="primary" size="sm" aria-label="Publish actions">
        <DzSplitButtonAction>Publish</DzSplitButtonAction>
        <DzSplitButtonMenu ariaLabel="More publish options" />
      </DzSplitButton>
    </div>

    <!-- A small "document" so the toolbar reads in context. -->
    <div class="et-doc" :style="{ textAlign: align }">
      <DzText
        as="p"
        size="sm"
        tone="muted"
        class="et-doc-line"
        :style="{
          fontWeight: bold ? 'var(--dz-font-semibold, 600)' : 'var(--dz-font-normal, 400)',
          fontStyle: italic ? 'italic' : 'normal',
          textDecoration: underline ? 'underline' : 'none',
        }"
      >
        Toggle the controls above — this line reflects the active formatting and alignment in real time.
      </DzText>
    </div>
  </section>
</template>

<style scoped>
.et-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
  padding: clamp(1rem, 3vw, 1.5rem);
  background: var(--dz-background, #fff);
}

.et-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-2, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.5rem);
  background: var(--dz-surface, #fff);
  box-shadow: var(--dz-shadow-xs, 0 1px 2px rgb(0 0 0 / 0.04));
}

.et-cluster {
  display: flex;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
}

.et-sep {
  width: 1px;
  align-self: stretch;
  margin: var(--dz-space-1, 0.25rem) var(--dz-space-1, 0.25rem);
  background: var(--dz-border, #e5e7eb);
}

/* Pushes the publish/copy actions to the trailing edge; collapses on wrap. */
.et-spacer {
  flex: 1 1 var(--dz-space-4, 1rem);
  min-width: var(--dz-space-2, 0.5rem);
}

.et-doc {
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px dashed var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.5rem);
  background: var(--dz-surface-muted, var(--dz-surface, #fff));
}

.et-doc-line {
  margin: 0;
  line-height: 1.6;
  transition: font-weight var(--dz-transition-fast, 120ms) ease;
}

@media (max-width: 560px) {
  .et-spacer {
    flex-basis: 100%;
  }
}
</style>
