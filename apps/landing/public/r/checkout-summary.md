# Checkout order summary

An order review panel — a DzDescriptions ship-to / delivery / payment grid, an itemised list, a promo-code field (try “SAVE10”) that adds a live discount line, and recomputed totals above a place-order button.

- **Category:** Commerce
- **Components:** DzDescriptions, DzDescriptionsItem, DzInput, DzButton, DzDivider, DzBadge, DzHeading, DzText
- **Preview:** /blocks/checkout-summary

```vue
<script setup lang="ts">
import {
  DzBadge,
  DzButton,
  DzDescriptions,
  DzDescriptionsItem,
  DzDivider,
  DzHeading,
  DzInput,
  DzText,
} from '@dzup-ui/core'
/**
 * Checkout order summary — a review panel with a promo-code field.
 *
 * DzDescriptions renders the read-only "shipping to / method / payment" review
 * as a bordered term/definition grid. Below it, a DzInput + Apply DzButton row
 * redeems a promo code (try "SAVE10"): a valid code adds a live discount line
 * and a success DzBadge, an invalid one shows an inline message. A DzDivider
 * fences the recomputed totals from the "Place order" action.
 *
 * Self-contained: local reactive state, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { computed, ref } from 'vue'

interface OrderLine {
  id: number
  name: string
  qty: number
  price: number
}

const lines: OrderLine[] = [
  { id: 1, name: 'Aero Running Shoe', qty: 1, price: 119 },
  { id: 2, name: 'Studio Headphones', qty: 1, price: 199 },
  { id: 3, name: 'Field Daypack 18L', qty: 2, price: 89 },
]

const PROMO_CODE = 'SAVE10'
const PROMO_RATE = 0.1
const TAX_RATE = 0.08

const promo = ref('')
const applied = ref(false)
const promoError = ref(false)

const subtotal = computed(() => lines.reduce((sum, line) => sum + line.price * line.qty, 0))
const discount = computed(() => (applied.value ? subtotal.value * PROMO_RATE : 0))
const shipping = 0
const tax = computed(() => (subtotal.value - discount.value) * TAX_RATE)
const total = computed(() => subtotal.value - discount.value + shipping + tax.value)

const money = (value: number) => `$${value.toFixed(2)}`

function applyPromo() {
  if (promo.value.trim().toUpperCase() === PROMO_CODE) {
    applied.value = true
    promoError.value = false
  }
  else {
    applied.value = false
    promoError.value = true
  }
}
</script>

<template>
  <section class="ck-wrap" aria-labelledby="ck-title">
    <div class="ck-card">
      <header class="ck-head">
        <DzHeading id="ck-title" :level="4" size="md" weight="semibold" class="ck-heading">
          Order summary
        </DzHeading>
        <DzBadge variant="subtle" tone="neutral" size="sm">
          {{ lines.length }} items
        </DzBadge>
      </header>

      <DzDescriptions :columns="1" layout="horizontal" bordered size="sm" class="ck-review">
        <DzDescriptionsItem label="Ship to">
          <DzText size="sm" as="span">
            Ada Lovelace · 12 Analytical Ave, London EC1
          </DzText>
        </DzDescriptionsItem>
        <DzDescriptionsItem label="Delivery">
          <DzText size="sm" as="span">
            Standard · 3–5 business days
          </DzText>
        </DzDescriptionsItem>
        <DzDescriptionsItem label="Payment">
          <DzText size="sm" as="span" class="ck-mono">
            Visa •••• 4242
          </DzText>
        </DzDescriptionsItem>
      </DzDescriptions>

      <DzDivider class="ck-rule" />

      <ul class="ck-lines">
        <li v-for="line in lines" :key="line.id" class="ck-line">
          <DzText size="sm" as="span" class="ck-line-name">
            {{ line.name }}
            <DzText size="xs" tone="muted" as="span">
              × {{ line.qty }}
            </DzText>
          </DzText>
          <DzText size="sm" as="span" class="ck-line-price">
            {{ money(line.price * line.qty) }}
          </DzText>
        </li>
      </ul>

      <DzDivider class="ck-rule" />

      <!-- Promo code -->
      <form class="ck-promo" novalidate @submit.prevent="applyPromo">
        <DzInput
          v-model="promo"
          type="text"
          placeholder="Promo code"
          aria-label="Promo code"
          :invalid="promoError"
          class="ck-promo-input"
        />
        <DzButton type="submit" variant="outline" tone="neutral">
          Apply
        </DzButton>
      </form>
      <DzText v-if="applied" size="xs" tone="success" as="p" class="ck-promo-msg">
        Code “{{ PROMO_CODE }}” applied — 10% off.
      </DzText>
      <DzText v-else-if="promoError" size="xs" tone="danger" as="p" class="ck-promo-msg">
        That code isn’t valid. Try “{{ PROMO_CODE }}”.
      </DzText>

      <DzDivider class="ck-rule" />

      <dl class="ck-totals">
        <div class="ck-row">
          <dt>
            <DzText size="sm" tone="muted" as="span">
              Subtotal
            </DzText>
          </dt>
          <dd>
            <DzText size="sm" as="span">
              {{ money(subtotal) }}
            </DzText>
          </dd>
        </div>
        <div v-if="applied" class="ck-row">
          <dt>
            <DzText size="sm" tone="muted" as="span">
              Discount
            </DzText>
            <DzBadge variant="subtle" tone="success" size="sm" class="ck-disc-badge">
              {{ PROMO_CODE }}
            </DzBadge>
          </dt>
          <dd>
            <DzText size="sm" tone="success" as="span">
              −{{ money(discount) }}
            </DzText>
          </dd>
        </div>
        <div class="ck-row">
          <dt>
            <DzText size="sm" tone="muted" as="span">
              Shipping
            </DzText>
          </dt>
          <dd>
            <DzText size="sm" as="span">
              Free
            </DzText>
          </dd>
        </div>
        <div class="ck-row">
          <dt>
            <DzText size="sm" tone="muted" as="span">
              Estimated tax
            </DzText>
          </dt>
          <dd>
            <DzText size="sm" as="span">
              {{ money(tax) }}
            </DzText>
          </dd>
        </div>
      </dl>

      <DzDivider class="ck-rule" />

      <div class="ck-row ck-row--total">
        <DzText size="md" weight="semibold" as="span">
          Total
        </DzText>
        <DzText size="lg" weight="bold" as="span">
          {{ money(total) }}
        </DzText>
      </div>

      <DzButton variant="solid" tone="primary" size="lg" class="ck-place">
        Place order
      </DzButton>
      <DzText size="xs" tone="muted" align="center" as="p" class="ck-secure">
        Secured by 256-bit TLS encryption.
      </DzText>
    </div>
  </section>
</template>

<style scoped>
.ck-wrap {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.ck-card {
  display: flex;
  flex-direction: column;
  padding: clamp(1.25rem, 4vw, 1.75rem);
  background: var(--dz-surface, var(--dz-background, #fff));
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-xl, 0.875rem);
  max-width: 30rem;
  margin: 0 auto;
}

.ck-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-4, 1rem);
}

.ck-heading {
  margin: 0;
}

.ck-mono {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
}

.ck-rule {
  margin: var(--dz-space-4, 1rem) 0;
}

.ck-lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.ck-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.ck-line-name {
  min-width: 0;
}

.ck-line-price {
  font-variant-numeric: tabular-nums;
  flex: none;
}

.ck-promo {
  display: flex;
  gap: var(--dz-space-2, 0.5rem);
}

.ck-promo-input {
  flex: 1;
}

.ck-promo-msg {
  margin: var(--dz-space-2, 0.5rem) 0 0;
}

.ck-totals {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  margin: 0;
}

.ck-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.ck-row dt {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  margin: 0;
}

.ck-row dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.ck-row--total :last-child {
  font-variant-numeric: tabular-nums;
}

.ck-disc-badge {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
}

.ck-place {
  width: 100%;
  margin-top: var(--dz-space-4, 1rem);
}

.ck-secure {
  margin: var(--dz-space-3, 0.75rem) 0 0;
}
</style>
```
