<script setup lang="ts">
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDialogDescription,
  DzDialogTitle,
  DzText,
} from '@dzup-ui/core'
import { ArrowUpRight, Users, X } from 'lucide-vue-next'
import { DzMorph, useReducedMotion } from '../../motion/index.ts'

/**
 * Morphing dialog demo (catalog `morphing-dialog`, effect 55) — a compact project
 * card expands into a modal dialog that shares its position and size.
 *
 * {@link DzMorph} drives core's DzDialog through its public `v-model:open` API
 * (no fork): where the View Transitions API is available the trigger card and the
 * dialog panel share a `view-transition-name`, so the browser morphs one box into
 * the other; otherwise a FLIP plays the same morph; under reduced motion (OS or
 * the page toggle) the dialog just opens/closes. Reka keeps the focus trap, Esc
 * and light-dismiss — DzMorph intercepts the close so the morph-out runs first.
 */
const reduced = useReducedMotion()
</script>

<template>
  <div class="stage">
    <DzMorph
      size="md"
      aria-label="Project Atlas details"
      :disabled="reduced"
    >
      <!-- Collapsed surface: a clickable summary card. -->
      <template #trigger="{ expand, expanded }">
        <DzCard
          variant="elevated"
          padding="md"
          clickable
          class="trigger-card"
          aria-haspopup="dialog"
          :aria-expanded="expanded"
          aria-label="Open Project Atlas details"
          @click="expand"
        >
          <div class="card-head">
            <span class="glyph" aria-hidden="true"><Users :size="18" /></span>
            <div class="card-headings">
              <DzText weight="semibold" as="div">
                Project Atlas
              </DzText>
              <DzText size="sm" tone="muted" as="div">
                8 collaborators · Active
              </DzText>
            </div>
            <ArrowUpRight :size="16" class="card-cue" aria-hidden="true" />
          </div>
        </DzCard>
      </template>

      <!-- Expanded surface: the dialog body. -->
      <template #default="{ collapse }">
        <div class="dialog-body">
          <div class="dialog-head">
            <span class="glyph glyph--lg" aria-hidden="true"><Users :size="22" /></span>
            <div>
              <DzDialogTitle class="dialog-title">
                Project Atlas
              </DzDialogTitle>
              <DzDialogDescription class="dialog-sub">
                A shared workspace for the design-systems team.
              </DzDialogDescription>
            </div>
            <DzButton
              variant="ghost"
              tone="neutral"
              size="sm"
              class="close-btn"
              aria-label="Close dialog"
              @click="collapse"
            >
              <template #prefix>
                <X :size="16" aria-hidden="true" />
              </template>
            </DzButton>
          </div>

          <div class="stats">
            <DzBadge variant="subtle" tone="primary">
              8 collaborators
            </DzBadge>
            <DzBadge variant="subtle" tone="success">
              Active
            </DzBadge>
            <DzBadge variant="subtle" tone="info">
              12 open tasks
            </DzBadge>
          </div>

          <DzText size="sm" tone="muted" as="p" class="dialog-copy">
            The card you clicked grew into this dialog, sharing its box across the
            View Transition. Press Esc, click outside, or use Close — the same
            morph plays in reverse.
          </DzText>

          <div class="dialog-actions">
            <DzButton variant="solid" tone="primary" size="sm" @click="collapse">
              Done
            </DzButton>
          </div>
        </div>
      </template>
    </DzMorph>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 160px;
}

.trigger-card {
  width: min(280px, 100%);
  text-align: left;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-headings {
  min-width: 0;
  flex: 1;
}

.glyph {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--dz-radius-md, 0.5rem);
  color: var(--dz-primary, #0766ee);
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 12%, transparent);
}

.glyph--lg {
  width: 44px;
  height: 44px;
  border-radius: var(--dz-radius-lg, 0.75rem);
}

.card-cue {
  color: var(--dz-muted-foreground, #585b60);
  flex-shrink: 0;
}

/* ── Dialog body ── */
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: min(380px, 80vw);
}

.dialog-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.dialog-title {
  margin: 0;
  font-size: var(--dz-text-lg, 1.125rem);
  font-weight: 600;
  color: var(--dz-foreground, #1b1d1f);
}

.dialog-sub {
  margin: 2px 0 0;
  font-size: var(--dz-text-sm, 0.875rem);
  color: var(--dz-muted-foreground, #585b60);
}

.close-btn {
  margin-inline-start: auto;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-copy {
  margin: 0;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
