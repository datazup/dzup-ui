<script setup lang="ts">
/**
 * Order status tracker — a fulfilment timeline for a single order.
 *
 * A DzStepper drives the progress rail: each DzStepperItem is a fulfilment stage
 * (placed → packed → shipped → out for delivery → delivered) and the active
 * index marks where the parcel is now. The header carries the order number and a
 * tone-coded status DzBadge; a details grid below restates the carrier, tracking
 * number and ETA. The stepper flips to a vertical rail on narrow viewports.
 *
 * Self-contained: local state, no props, no network. Composed only from free
 * @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { DzBadge, DzHeading, DzStepper, DzStepperItem, DzText } from '@dzup-ui/core'

interface Stage {
  title: string
  description: string
}

const stages: Stage[] = [
  { title: 'Order placed', description: 'Mon, 16 Jun' },
  { title: 'Packed', description: 'Tue, 17 Jun' },
  { title: 'Shipped', description: 'Wed, 18 Jun' },
  { title: 'Out for delivery', description: 'Today, 9:24 AM' },
  { title: 'Delivered', description: 'Est. by 6 PM' },
]

/** The parcel is currently "out for delivery" — the 4th stage (0-based index 3). */
const currentStage = ref(3)

/** Below 640px the horizontal rail would crowd; flip to a vertical timeline. */
const orientation = ref<'horizontal' | 'vertical'>('horizontal')
let media: MediaQueryList | null = null

function sync(event: MediaQueryList | MediaQueryListEvent) {
  orientation.value = event.matches ? 'vertical' : 'horizontal'
}

onMounted(() => {
  if (typeof window === 'undefined') return
  media = window.matchMedia('(max-width: 640px)')
  sync(media)
  media.addEventListener('change', sync)
})

onBeforeUnmount(() => {
  media?.removeEventListener('change', sync)
})
</script>

<template>
  <section class="os-wrap" aria-labelledby="os-title">
    <div class="os-card">
      <header class="os-head">
        <div class="os-head-text">
          <DzHeading id="os-title" :level="4" size="md" weight="semibold" class="os-heading">Order #DZ-90417</DzHeading>
          <DzText size="sm" tone="muted" as="p" class="os-sub">Placed 16 June · 3 items</DzText>
        </div>
        <DzBadge variant="subtle" tone="info" size="md">Out for delivery</DzBadge>
      </header>

      <DzStepper
        v-model="currentStage"
        :orientation="orientation"
        aria-label="Order progress"
        class="os-stepper"
      >
        <DzStepperItem
          v-for="stage in stages"
          :key="stage.title"
          :title="stage.title"
          :description="stage.description"
        />
      </DzStepper>

      <dl class="os-details">
        <div class="os-detail">
          <dt><DzText size="xs" tone="muted" as="span">Carrier</DzText></dt>
          <dd><DzText size="sm" weight="medium" as="span">DZ Express</DzText></dd>
        </div>
        <div class="os-detail">
          <dt><DzText size="xs" tone="muted" as="span">Tracking</DzText></dt>
          <dd><DzText size="sm" weight="medium" as="span" class="os-mono">1Z-DZ-88204613</DzText></dd>
        </div>
        <div class="os-detail">
          <dt><DzText size="xs" tone="muted" as="span">Estimated delivery</DzText></dt>
          <dd><DzText size="sm" weight="medium" as="span">Today by 6:00 PM</DzText></dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.os-wrap {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.os-card {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-6, 1.5rem);
  padding: clamp(1.25rem, 4vw, 1.75rem);
  background: var(--dz-surface, var(--dz-background, #fff));
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-xl, 0.875rem);
  max-width: 44rem;
  margin: 0 auto;
}

.os-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  flex-wrap: wrap;
}

.os-heading,
.os-sub {
  margin: 0;
}

.os-sub {
  margin-top: var(--dz-space-1, 0.25rem);
}

.os-stepper {
  width: 100%;
}

.os-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--dz-space-4, 1rem);
  margin: 0;
  padding-top: var(--dz-space-2, 0.5rem);
  border-top: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 70%, transparent);
}

.os-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.os-detail dt,
.os-detail dd {
  margin: 0;
}

.os-mono {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
}

@media (max-width: 560px) {
  .os-details {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--dz-space-3, 0.75rem);
  }
}
</style>
