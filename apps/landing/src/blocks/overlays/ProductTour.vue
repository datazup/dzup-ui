<script setup lang="ts">
import type { DzTourStep } from '@dzup-ui/core'
/**
 * Product tour — a spotlight onboarding walkthrough (DzTour).
 *
 * A mini dashboard whose key controls carry stable ids; "Start tour" launches a
 * DzTour that dims the page, spotlights each target in turn, and shows an
 * anchored step popover with Back / Next / Finish controls and progress dots.
 * Step changes and completion are reported in a status line.
 *
 * Self-contained — free @dzup-ui/core components and `--dz-*` tokens only.
 * Heading level 4 to nest under the BlockPreview H3. Target ids are prefixed
 * (`ovt-`) so the selectors stay unique on the catalog page.
 */
import {
  DzBadge,
  DzButton,
  DzHeading,
  DzIconButton,
  DzText,
  DzTour,
} from '@dzup-ui/core'
import { Bell, Plus, Search, Sparkles } from 'lucide-vue-next'
import { ref } from 'vue'

const open = ref(false)
const current = ref(0)
const status = ref('')

const steps: DzTourStep[] = [
  {
    target: '#ovt-search',
    title: 'Find anything',
    description: 'Search projects, people and settings from one place.',
    placement: 'bottom',
  },
  {
    target: '#ovt-new',
    title: 'Create a project',
    description: 'Spin up a new dashboard in seconds with a template.',
    placement: 'bottom',
  },
  {
    target: '#ovt-stats',
    title: 'Track your metrics',
    description: 'Your key numbers update live as data flows in.',
    placement: 'top',
  },
  {
    target: '#ovt-help',
    title: 'Need a hand?',
    description: 'Reopen this tour or reach support any time.',
    placement: 'left',
  },
]

function start(): void {
  current.value = 0
  open.value = true
  status.value = ''
}

function onChange(index: number): void {
  status.value = `Step ${index + 1} of ${steps.length}`
}

function onFinish(): void {
  status.value = 'Tour complete 🎉'
}

function onClose(): void {
  if (!status.value.startsWith('Tour complete'))
    status.value = 'Tour skipped'
}
</script>

<template>
  <section class="pt-wrap" aria-labelledby="pt-title">
    <div class="pt-bar">
      <DzHeading id="pt-title" :level="4" size="md" weight="semibold" class="pt-bar-title">
        Overview
      </DzHeading>
      <div class="pt-bar-actions">
        <span id="ovt-search" class="pt-search" aria-hidden="true">
          <Search :size="15" />
          <span class="pt-search-text">Search…</span>
        </span>
        <DzButton id="ovt-new" variant="solid" tone="primary" size="sm">
          <template #prefix>
            <Plus :size="15" aria-hidden="true" />
          </template>
          New
        </DzButton>
        <DzIconButton id="ovt-help" :icon="Bell" aria-label="Notifications" variant="ghost" tone="neutral" size="sm" />
      </div>
    </div>

    <div id="ovt-stats" class="pt-stats">
      <div class="pt-stat">
        <DzText size="xs" tone="muted" as="span">
          Revenue
        </DzText>
        <DzText size="lg" weight="bold" as="span">
          $48.2k
        </DzText>
        <DzBadge variant="subtle" tone="success" size="sm">
          +12%
        </DzBadge>
      </div>
      <div class="pt-stat">
        <DzText size="xs" tone="muted" as="span">
          Active users
        </DzText>
        <DzText size="lg" weight="bold" as="span">
          2,910
        </DzText>
        <DzBadge variant="subtle" tone="success" size="sm">
          +4%
        </DzBadge>
      </div>
      <div class="pt-stat">
        <DzText size="xs" tone="muted" as="span">
          Churn
        </DzText>
        <DzText size="lg" weight="bold" as="span">
          1.8%
        </DzText>
        <DzBadge variant="subtle" tone="danger" size="sm">
          +0.3%
        </DzBadge>
      </div>
    </div>

    <div class="pt-foot">
      <DzButton variant="outline" tone="primary" size="sm" @click="start">
        <template #prefix>
          <Sparkles :size="15" aria-hidden="true" />
        </template>
        Start tour
      </DzButton>
      <DzText v-if="status" size="sm" tone="muted" as="span" role="status" aria-live="polite">
        {{ status }}
      </DzText>
    </div>

    <DzTour
      v-model:open="open"
      v-model:current="current"
      :steps="steps"
      :scroll-into-view="false"
      aria-label="Product tour"
      @change="onChange"
      @finish="onFinish"
      @close="onClose"
    />
  </section>
</template>

<style scoped>
.pt-wrap {
  max-width: 38rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
  padding: var(--dz-space-5, 1.25rem);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #fff);
}

.pt-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.pt-bar-title {
  margin: 0;
}

.pt-bar-actions {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.pt-search {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-1, 0.25rem) var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-md, 0.375rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  color: var(--dz-text-muted, #6b7280);
  font-size: var(--dz-text-sm, 0.875rem);
}

.pt-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-4, 1rem);
  border-radius: var(--dz-radius-md, 0.375rem);
  background: var(--dz-surface-sunken, #f9fafb);
}

.pt-stat {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  align-items: flex-start;
}

.pt-foot {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

@media (max-width: 560px) {
  .pt-search-text {
    display: none;
  }
}
</style>
