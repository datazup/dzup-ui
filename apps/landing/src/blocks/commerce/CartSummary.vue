<script setup lang="ts">
/**
 * Cart summary — an editable line-item list with live totals.
 *
 * A divided DzList stacks one DzListItem per product: a thumbnail + name/variant
 * in the `#prefix`, a quantity DzNumberInput (clamped 1–10) and a remove DzButton
 * in the `#suffix`. Editing a quantity or removing a row recomputes the subtotal,
 * shipping, tax and order total — all reactive. A DzDivider fences the cost rows
 * from the checkout action.
 *
 * Self-contained: local reactive state, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { computed, ref } from 'vue'
import { DzButton, DzDivider, DzHeading, DzList, DzListItem, DzNumberInput, DzText } from '@dzup-ui/core'

interface LineItem {
  id: number
  name: string
  variant: string
  src: string
  alt: string
  price: number
  qty: number
}

const items = ref<LineItem[]>([
  {
    id: 1,
    name: 'Aero Running Shoe',
    variant: 'Crimson · UK 9',
    src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
    alt: 'Red running shoe',
    price: 119,
    qty: 1,
  },
  {
    id: 2,
    name: 'Studio Headphones',
    variant: 'Matte black',
    src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80',
    alt: 'Black over-ear headphones',
    price: 199,
    qty: 1,
  },
  {
    id: 3,
    name: 'Field Daypack 18L',
    variant: 'Slate grey',
    src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80',
    alt: 'Grey canvas backpack',
    price: 89,
    qty: 2,
  },
])

const FREE_SHIPPING_OVER = 150
const TAX_RATE = 0.08

const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.qty, 0))
const shipping = computed(() => (subtotal.value === 0 || subtotal.value >= FREE_SHIPPING_OVER ? 0 : 9.95))
const tax = computed(() => subtotal.value * TAX_RATE)
const total = computed(() => subtotal.value + shipping.value + tax.value)

const money = (value: number) => `$${value.toFixed(2)}`

function remove(id: number) {
  items.value = items.value.filter((item) => item.id !== id)
}
</script>

<template>
  <section class="cs-wrap" aria-labelledby="cs-title">
    <header class="cs-head">
      <DzHeading id="cs-title" :level="4" size="md" weight="semibold" class="cs-heading">Your cart</DzHeading>
      <DzText size="sm" tone="muted" as="span">{{ items.length }} item{{ items.length === 1 ? '' : 's' }}</DzText>
    </header>

    <DzList v-if="items.length" variant="divided" size="md" class="cs-list">
      <DzListItem v-for="item in items" :key="item.id">
        <template #prefix>
          <span class="cs-thumb-wrap">
            <img :src="item.src" :alt="item.alt" class="cs-thumb" loading="lazy" decoding="async" />
          </span>
        </template>

        <span class="cs-detail">
          <DzText size="sm" weight="medium" as="span">{{ item.name }}</DzText>
          <DzText size="xs" tone="muted" as="span">{{ item.variant }}</DzText>
        </span>

        <template #suffix>
          <span class="cs-controls">
            <DzNumberInput
              v-model="item.qty"
              :min="1"
              :max="10"
              :step="1"
              size="sm"
              class="cs-qty"
              :aria-label="`Quantity for ${item.name}`"
            />
            <DzText size="sm" weight="semibold" as="span" class="cs-line">{{ money(item.price * item.qty) }}</DzText>
            <DzButton
              variant="ghost"
              tone="neutral"
              size="sm"
              :aria-label="`Remove ${item.name}`"
              @click="remove(item.id)"
            >
              Remove
            </DzButton>
          </span>
        </template>
      </DzListItem>
    </DzList>

    <DzText v-else size="sm" tone="muted" as="p" class="cs-empty">Your cart is empty.</DzText>

    <template v-if="items.length">
      <DzDivider class="cs-rule" />

      <dl class="cs-totals">
        <div class="cs-row">
          <dt><DzText size="sm" tone="muted" as="span">Subtotal</DzText></dt>
          <dd><DzText size="sm" as="span">{{ money(subtotal) }}</DzText></dd>
        </div>
        <div class="cs-row">
          <dt><DzText size="sm" tone="muted" as="span">Shipping</DzText></dt>
          <dd>
            <DzText size="sm" as="span">{{ shipping === 0 ? 'Free' : money(shipping) }}</DzText>
          </dd>
        </div>
        <div class="cs-row">
          <dt><DzText size="sm" tone="muted" as="span">Tax (8%)</DzText></dt>
          <dd><DzText size="sm" as="span">{{ money(tax) }}</DzText></dd>
        </div>
      </dl>

      <DzDivider class="cs-rule" />

      <div class="cs-row cs-row--total">
        <DzText size="md" weight="semibold" as="span">Total</DzText>
        <DzText size="lg" weight="bold" as="span">{{ money(total) }}</DzText>
      </div>

      <DzButton variant="solid" tone="primary" size="lg" class="cs-checkout">Checkout</DzButton>
      <DzButton variant="text" tone="neutral" size="sm" class="cs-continue">Continue shopping</DzButton>
    </template>
  </section>
</template>

<style scoped>
.cs-wrap {
  display: flex;
  flex-direction: column;
  padding: clamp(1.25rem, 4vw, 1.75rem);
  background: var(--dz-surface, var(--dz-background, #fff));
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-xl, 0.875rem);
  max-width: 30rem;
  margin: 0 auto;
}

.cs-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-3, 0.75rem);
}

.cs-heading {
  margin: 0;
}

.cs-thumb-wrap {
  display: block;
  width: 3rem;
  height: 3rem;
  border-radius: var(--dz-radius-md, 0.5rem);
  overflow: hidden;
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 70%, transparent);
  flex: none;
}

.cs-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cs-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cs-controls {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.cs-qty {
  width: 6rem;
}

.cs-line {
  min-width: 4rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.cs-empty {
  margin: var(--dz-space-4, 1rem) 0;
  text-align: center;
}

.cs-rule {
  margin: var(--dz-space-4, 1rem) 0;
}

.cs-totals {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  margin: 0;
}

.cs-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.cs-row dt,
.cs-row dd {
  margin: 0;
}

.cs-row dd,
.cs-row--total :last-child {
  font-variant-numeric: tabular-nums;
}

.cs-checkout {
  width: 100%;
  margin-top: var(--dz-space-4, 1rem);
}

.cs-continue {
  align-self: center;
  margin-top: var(--dz-space-2, 0.5rem);
}

/* On narrow viewports the qty + price + remove controls stack tidily. */
@media (max-width: 480px) {
  .cs-controls {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--dz-space-2, 0.5rem);
  }
}
</style>
