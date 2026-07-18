# Detail sheet

A slide-out record panel (DzSheet) — an orders list where each row opens a right-side sheet with a pinned header/close, a scrollable body of customer and line-item details, a status badge, and a footer action bar.

- **Category:** Overlays
- **Components:** DzSheet, DzSheetContent, DzSheetTitle, DzSheetDescription, DzSheetClose, DzAvatar, DzBadge, DzButton, DzIconButton, DzDivider, DzHeading, DzText
- **Preview:** /blocks/detail-sheet

```vue
<script setup lang="ts">
/**
 * Detail sheet — a slide-out record panel (DzSheet).
 *
 * A compact orders list where each row opens a right-side DzSheet showing the
 * full record: a pinned header (title, description, close), a scrollable body of
 * customer + line-item details, a status badge, and a footer action bar. One
 * sheet instance is driven by local state, re-targeted per row.
 *
 * Self-contained — free @dzup-ui/core components and `--dz-*` tokens only.
 * Heading level 4 to nest under the BlockPreview H3.
 */
import {
  DzAvatar,
  DzBadge,
  DzButton,
  DzDivider,
  DzHeading,
  DzIconButton,
  DzSheet,
  DzSheetClose,
  DzSheetContent,
  DzSheetDescription,
  DzSheetTitle,
  DzText,
} from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'
import { ArrowRight, X } from 'lucide-vue-next'
import { ref } from 'vue'

interface Order {
  id: string
  customer: string
  initials: string
  email: string
  total: string
  status: string
  tone: CanonicalTone
  placed: string
  items: { name: string, qty: number, price: string }[]
}

const orders: Order[] = [
  {
    id: 'ORD-3912',
    customer: 'Maya Chen',
    initials: 'MC',
    email: 'maya@acme.io',
    total: '$248.00',
    status: 'Paid',
    tone: 'success',
    placed: 'Jun 21, 2026',
    items: [
      { name: 'Pro plan — annual', qty: 1, price: '$192.00' },
      { name: 'Extra seats ×2', qty: 2, price: '$56.00' },
    ],
  },
  {
    id: 'ORD-3908',
    customer: 'Liam Patel',
    initials: 'LP',
    email: 'liam@northwind.io',
    total: '$24.00',
    status: 'Refunded',
    tone: 'danger',
    placed: 'Jun 20, 2026',
    items: [{ name: 'Starter plan — monthly', qty: 1, price: '$24.00' }],
  },
  {
    id: 'ORD-3901',
    customer: 'Sofia Rossi',
    initials: 'SR',
    email: 'sofia@vega.dev',
    total: '$96.00',
    status: 'Pending',
    tone: 'warning',
    placed: 'Jun 19, 2026',
    items: [{ name: 'Team plan — monthly', qty: 1, price: '$96.00' }],
  },
]

const open = ref(false)
const selected = ref<Order>(orders[0]!)

function view(order: Order): void {
  selected.value = order
  open.value = true
}
</script>

<template>
  <section class="ds-wrap" aria-labelledby="ds-title">
    <header class="ds-head">
      <DzHeading id="ds-title" :level="4" size="md" weight="semibold" class="ds-title">
        Recent orders
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="ds-sub">
        Open any row to inspect the order in a side panel.
      </DzText>
    </header>

    <ul class="ds-list">
      <li v-for="order in orders" :key="order.id" class="ds-row">
        <DzAvatar :fallback="order.initials" :alt="order.customer" size="sm" />
        <span class="ds-row-main">
          <DzText size="sm" weight="medium" as="span">{{ order.customer }}</DzText>
          <DzText size="xs" tone="muted" as="span">{{ order.id }} · {{ order.placed }}</DzText>
        </span>
        <DzBadge variant="subtle" :tone="order.tone" size="sm">{{ order.status }}</DzBadge>
        <DzText size="sm" weight="semibold" as="span" class="ds-row-total">{{ order.total }}</DzText>
        <DzButton variant="ghost" tone="neutral" size="sm" @click="view(order)">
          View
          <template #suffix><ArrowRight :size="14" aria-hidden="true" /></template>
        </DzButton>
      </li>
    </ul>

    <DzSheet v-model:open="open">
      <DzSheetContent side="right" size="md" class="ds-sheet">
        <header class="ds-sheet-head">
          <div>
            <DzSheetTitle class="ds-sheet-title">{{ selected.id }}</DzSheetTitle>
            <DzSheetDescription class="ds-sheet-desc">
              Placed {{ selected.placed }}
            </DzSheetDescription>
          </div>
          <DzSheetClose as-child>
            <DzIconButton :icon="X" ariaLabel="Close panel" variant="ghost" tone="neutral" size="sm" />
          </DzSheetClose>
        </header>

        <DzDivider />

        <div class="ds-sheet-body">
          <div class="ds-customer">
            <DzAvatar :fallback="selected.initials" :alt="selected.customer" size="md" />
            <div class="ds-customer-meta">
              <DzText size="sm" weight="semibold" as="span">{{ selected.customer }}</DzText>
              <DzText size="xs" tone="muted" as="span">{{ selected.email }}</DzText>
            </div>
            <DzBadge variant="subtle" :tone="selected.tone" size="sm">{{ selected.status }}</DzBadge>
          </div>

          <div class="ds-items">
            <DzText size="xs" weight="semibold" tone="muted" as="p" class="ds-items-title">
              LINE ITEMS
            </DzText>
            <div v-for="item in selected.items" :key="item.name" class="ds-item">
              <span class="ds-item-main">
                <DzText size="sm" as="span">{{ item.name }}</DzText>
                <DzText size="xs" tone="muted" as="span">Qty {{ item.qty }}</DzText>
              </span>
              <DzText size="sm" weight="medium" as="span">{{ item.price }}</DzText>
            </div>
            <DzDivider />
            <div class="ds-item ds-total">
              <DzText size="sm" weight="semibold" as="span">Total</DzText>
              <DzText size="sm" weight="bold" as="span">{{ selected.total }}</DzText>
            </div>
          </div>
        </div>

        <footer class="ds-sheet-footer">
          <DzSheetClose as-child>
            <DzButton variant="ghost" tone="neutral">Close</DzButton>
          </DzSheetClose>
          <DzButton variant="solid" tone="primary">Print invoice</DzButton>
        </footer>
      </DzSheetContent>
    </DzSheet>
  </section>
</template>

<style scoped>
.ds-wrap {
  max-width: 40rem;
  margin: 0 auto;
}

.ds-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.ds-title {
  margin: 0;
}

.ds-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

/* Orders list ------------------------------------------------------------- */
.ds-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  overflow: hidden;
  background: var(--dz-surface, #fff);
}

.ds-row {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-3, 0.75rem) var(--dz-space-4, 1rem);
  border-bottom: 1px solid var(--dz-border, #e5e7eb);
}

.ds-row:last-child {
  border-bottom: none;
}

.ds-row-main {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.ds-row-total {
  min-width: 4rem;
  text-align: right;
}

/* Sheet panel ------------------------------------------------------------- */
.ds-sheet {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.ds-sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-2, 0.5rem);
}

.ds-sheet-title {
  margin: 0;
}

.ds-sheet-desc {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.ds-sheet-body {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-5, 1.25rem);
  flex: 1;
  overflow-y: auto;
}

.ds-customer {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.ds-customer-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.ds-items-title {
  margin: 0 0 var(--dz-space-2, 0.5rem);
  letter-spacing: 0.05em;
}

.ds-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-2, 0.5rem) 0;
}

.ds-item-main {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ds-total {
  padding-top: var(--dz-space-2, 0.5rem);
}

.ds-sheet-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
  padding-top: var(--dz-space-2, 0.5rem);
  border-top: 1px solid var(--dz-border, #e5e7eb);
}

@media (max-width: 560px) {
  .ds-row-total {
    display: none;
  }
}
</style>
```
