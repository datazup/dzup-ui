<script setup lang="ts">
import type { CartLine, SuggestedProduct, ThumbPalette } from './data.ts'
/**
 * Shopping Cart — Commerce template (docs/templates.md §6.5).
 *
 * A chromeless cart page for the same specialty grocer as the Checkout template
 * ("Verdant Market"), so browse → cart → checkout reads as one store. Editable
 * line items (DzImage thumb, a DzNumberInput quantity stepper and a remove
 * action), a promo DzInput, a free-shipping nudge DzAlert and a sticky order
 * summary with live totals — quantities, the promo code and every total are
 * real and client-side. Emptying the cart reveals a proper empty state, and a
 * "You might also like" rail can add items back in one click. Product
 * thumbnails are inline SVG painted from resolved `--dz-*` tokens, so the page
 * ships no image assets and re-themes.
 *
 * Built only from free `@dzup-ui/core` components and token-styled (no `lp-*`).
 * The brand accent is re-skinned to emerald entirely through `--dz-*` tokens
 * (no raw hex) — matching the Commerce category and the Checkout sibling — so
 * every Dz component re-tints and stays correct in light + dark from 390px up.
 */
import {
  DzAlert,
  DzBadge,
  DzButton,
  DzCard,
  DzDivider,
  DzHeading,
  DzImage,
  DzInput,
  DzList,
  DzListItem,
  DzNumberInput,
  DzText,
} from '@dzup-ui/core'
import { ArrowLeft, Leaf, Lock, Plus, RotateCcw, ShoppingBag, Tag, Trash2, Truck } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  buildThumb,
  CART_LINES,

  FREE_SHIPPING_THRESHOLD,
  PROMO_CODE,
  PROMO_RATE,
  STANDARD_SHIPPING,
  SUGGESTED,

  TAX_RATE,

} from './data.ts'

// ── Token-painted thumbnails ─────────────────────────────────────
/** Resolve a `--dz-*` token to its computed value, with a neutral fallback. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined')
    return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const palette = ref<ThumbPalette>({
  bg: '#f1f5f9',
  panel: '#ffffff',
  primary: '#10b981',
  line: '#e2e8f0',
})

function paint(): void {
  palette.value = {
    bg: token('--dz-muted', '#f1f5f9'),
    panel: token('--dz-background', '#ffffff'),
    primary: token('--dz-primary', '#10b981'),
    line: token('--dz-border', '#e2e8f0'),
  }
}

/** Per-hue product thumbnail; recomputes when the palette (theme) changes. */
function thumb(hue: number): string {
  return buildThumb(palette.value, hue)
}

// Repaint whenever the theme attribute flips so thumbnails track the page
// (the preview detail page toggles `data-theme` on the iframe document).
let observer: MutationObserver | null = null
onMounted(() => {
  paint()
  observer = new MutationObserver(paint)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => observer?.disconnect())

// ── Cart lines (quantities are live) ─────────────────────────────
const lines = ref<CartLine[]>(CART_LINES.map(l => ({ ...l })))

function removeLine(id: string): void {
  lines.value = lines.value.filter(l => l.id !== id)
}

function addSuggested(product: SuggestedProduct): void {
  const existing = lines.value.find(l => l.id === product.id)
  if (existing) {
    existing.qty = Math.min(existing.max, existing.qty + 1)
    return
  }
  lines.value = [
    ...lines.value,
    {
      id: product.id,
      name: product.name,
      variant: product.variant,
      price: product.price,
      qty: 1,
      max: 9,
      hue: product.hue,
    },
  ]
}

// ── Promo code ───────────────────────────────────────────────────
const promo = ref('')
const promoApplied = ref(false)
const promoError = ref(false)
function applyPromo(): void {
  if (promo.value.trim().toUpperCase() === PROMO_CODE) {
    promoApplied.value = true
    promoError.value = false
  }
  else {
    promoApplied.value = false
    promoError.value = true
  }
}

// ── Totals (all live) ────────────────────────────────────────────
const count = computed(() => lines.value.reduce((sum, l) => sum + l.qty, 0))
const subtotal = computed(() => lines.value.reduce((sum, l) => sum + l.price * l.qty, 0))
const discount = computed(() => (promoApplied.value ? subtotal.value * PROMO_RATE : 0))
const freeShipping = computed(() => subtotal.value >= FREE_SHIPPING_THRESHOLD)
const amountToFree = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value))
const shippingCost = computed(() => (freeShipping.value ? 0 : STANDARD_SHIPPING))
const tax = computed(() => (subtotal.value - discount.value) * TAX_RATE)
const total = computed(() => subtotal.value - discount.value + shippingCost.value + tax.value)

/** Progress toward the free-shipping threshold, clamped to 0–100. */
const shippingProgress = computed(() =>
  Math.min(100, Math.round((subtotal.value / FREE_SHIPPING_THRESHOLD) * 100)),
)

/** Format a number as a 2-dp price string. */
function money(n: number): string {
  return `$${n.toFixed(2)}`
}
</script>

<template>
  <div class="cart">
    <!-- ── Store bar ──────────────────────────────────────────── -->
    <header class="topbar">
      <div class="topbar-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Leaf :size="18" /></span>
          <span class="brand-name">Verdant Market</span>
        </span>
        <span class="topbar-cart">
          <ShoppingBag :size="18" aria-hidden="true" />
          <DzBadge variant="solid" tone="primary" size="sm">{{ count }}</DzBadge>
        </span>
      </div>
    </header>

    <main class="wrap">
      <div class="page-head">
        <div>
          <DzHeading :level="1" size="2xl" weight="bold">
            Your cart
          </DzHeading>
          <DzText size="sm" tone="muted" as="p">
            {{ count === 0 ? 'Nothing here yet.' : `${count} ${count === 1 ? 'item' : 'items'} ready to check out.` }}
          </DzText>
        </div>
        <DzButton variant="ghost" tone="neutral" size="sm" class="continue" href="#">
          <template #prefix>
            <ArrowLeft :size="16" aria-hidden="true" />
          </template>
          Continue shopping
        </DzButton>
      </div>

      <div class="layout" :class="{ 'layout--empty': !lines.length }">
        <!-- ── Cart lines / empty state ────────────────────────── -->
        <section class="items" aria-label="Cart items">
          <DzCard v-if="lines.length" variant="outlined" padding="none" class="items-card">
            <DzList variant="divided" aria-label="Items in your cart">
              <DzListItem v-for="l in lines" :key="l.id" class="line">
                <div class="line-grid">
                  <DzImage
                    :src="thumb(l.hue)"
                    :alt="`${l.name} thumbnail`"
                    aspect-ratio="1/1"
                    fit="cover"
                    class="line-thumb"
                  />
                  <div class="line-body">
                    <div class="line-top">
                      <div class="line-id">
                        <DzText weight="semibold" as="span">
                          {{ l.name }}
                        </DzText>
                        <DzText size="sm" tone="muted" as="span">
                          {{ l.variant }}
                        </DzText>
                        <DzText
                          v-if="l.note"
                          size="xs"
                          tone="warning"
                          as="span"
                          class="line-note"
                        >
                          {{ l.note }}
                        </DzText>
                      </div>
                      <DzText weight="semibold" as="span" class="line-price">
                        {{ money(l.price * l.qty) }}
                      </DzText>
                    </div>
                    <div class="line-controls">
                      <DzNumberInput
                        v-model="l.qty"
                        :min="1"
                        :max="l.max"
                        size="sm"
                        class="line-qty"
                        :aria-label="`Quantity for ${l.name}`"
                      />
                      <DzText size="xs" tone="muted" as="span" class="line-unit">
                        {{ money(l.price) }} each
                      </DzText>
                      <DzButton
                        variant="ghost"
                        tone="neutral"
                        size="sm"
                        class="line-remove"
                        :aria-label="`Remove ${l.name}`"
                        @click="removeLine(l.id)"
                      >
                        <template #prefix>
                          <Trash2 :size="15" aria-hidden="true" />
                        </template>
                        Remove
                      </DzButton>
                    </div>
                  </div>
                </div>
              </DzListItem>
            </DzList>
          </DzCard>

          <!-- Empty cart -->
          <DzCard v-else variant="outlined" padding="lg" class="empty">
            <span class="empty-mark" aria-hidden="true"><ShoppingBag :size="30" /></span>
            <DzHeading :level="2" size="lg" weight="semibold">
              Your cart is empty
            </DzHeading>
            <DzText tone="muted" as="p" class="empty-copy">
              Browse the market and your picks will show up here, ready to check out.
            </DzText>
            <DzButton variant="solid" tone="primary" href="#">
              <template #prefix>
                <ArrowLeft :size="16" aria-hidden="true" />
              </template>
              Start shopping
            </DzButton>
          </DzCard>

          <!-- Free-shipping nudge under the lines (mirrored in the summary) -->
          <DzAlert
            v-if="lines.length"
            :tone="freeShipping ? 'success' : 'info'"
            variant="subtle"
            :icon="Truck"
            class="ship-nudge"
          >
            <template v-if="freeShipping">
              Nice — you've unlocked free standard shipping.
            </template>
            <template v-else>
              You're {{ money(amountToFree) }} away from free standard shipping.
            </template>
            <div class="ship-track" :aria-hidden="true">
              <div class="ship-fill" :style="{ width: `${shippingProgress}%` }" />
            </div>
          </DzAlert>
        </section>

        <!-- ── Order summary ───────────────────────────────────── -->
        <aside v-if="lines.length" class="summary" aria-label="Order summary">
          <DzCard variant="outlined" padding="lg" class="summary-card">
            <DzHeading :level="2" size="md" weight="semibold" class="summary-title">
              Order summary
            </DzHeading>

            <!-- Promo code -->
            <div class="promo">
              <div class="promo-row">
                <DzInput
                  v-model="promo"
                  placeholder="Promo code"
                  size="sm"
                  aria-label="Promo code"
                  class="promo-input"
                >
                  <template #prefix>
                    <Tag :size="15" aria-hidden="true" />
                  </template>
                </DzInput>
                <DzButton variant="outline" tone="neutral" size="sm" @click="applyPromo">
                  Apply
                </DzButton>
              </div>
              <DzText v-if="promoApplied" size="xs" tone="success" as="span" class="promo-msg">
                Code {{ PROMO_CODE }} applied — 10% off.
              </DzText>
              <DzText v-else-if="promoError" size="xs" tone="danger" as="span" class="promo-msg">
                That code isn't valid. Try {{ PROMO_CODE }}.
              </DzText>
            </div>

            <DzDivider class="summary-rule" />

            <dl class="totals">
              <div class="total-row">
                <dt>Subtotal</dt>
                <dd>{{ money(subtotal) }}</dd>
              </div>
              <div v-if="discount > 0" class="total-row is-discount">
                <dt>Discount</dt>
                <dd>−{{ money(discount) }}</dd>
              </div>
              <div class="total-row">
                <dt>Shipping</dt>
                <dd>{{ shippingCost === 0 ? 'Free' : money(shippingCost) }}</dd>
              </div>
              <div class="total-row">
                <dt>Tax</dt>
                <dd>{{ money(tax) }}</dd>
              </div>
              <DzDivider class="summary-rule" />
              <div class="total-row total-row--grand">
                <dt>Total</dt>
                <dd>{{ money(total) }}</dd>
              </div>
            </dl>

            <DzButton variant="solid" tone="primary" size="lg" class="checkout-btn">
              <template #prefix>
                <Lock :size="17" aria-hidden="true" />
              </template>
              Checkout · {{ money(total) }}
            </DzButton>

            <ul class="trust">
              <li><Lock :size="15" aria-hidden="true" /><span>Encrypted, PCI-compliant payment</span></li>
              <li><RotateCcw :size="15" aria-hidden="true" /><span>14-day returns on unopened goods</span></li>
            </ul>

            <span class="badges">
              <DzBadge variant="subtle" tone="neutral" size="sm">Apple Pay</DzBadge>
              <DzBadge variant="subtle" tone="neutral" size="sm">Google Pay</DzBadge>
              <DzBadge variant="subtle" tone="neutral" size="sm">Visa</DzBadge>
            </span>
          </DzCard>
        </aside>
      </div>

      <!-- ── Cross-sell ──────────────────────────────────────────── -->
      <section class="suggest" aria-label="You might also like">
        <DzHeading :level="2" size="lg" weight="semibold" class="suggest-title">
          You might also like
        </DzHeading>
        <ul class="suggest-grid">
          <li v-for="s in SUGGESTED" :key="s.id">
            <DzCard variant="outlined" padding="md" class="suggest-card">
              <DzImage
                :src="thumb(s.hue)"
                :alt="`${s.name} thumbnail`"
                aspect-ratio="1/1"
                fit="cover"
                class="suggest-thumb"
              />
              <div class="suggest-meta">
                <DzText weight="medium" as="span">
                  {{ s.name }}
                </DzText>
                <DzText size="sm" tone="muted" as="span">
                  {{ s.variant }}
                </DzText>
              </div>
              <div class="suggest-foot">
                <DzText weight="semibold" as="span">
                  {{ money(s.price) }}
                </DzText>
                <DzButton
                  variant="outline"
                  tone="primary"
                  size="sm"
                  :aria-label="`Add ${s.name} to cart`"
                  @click="addSuggested(s)"
                >
                  <template #prefix>
                    <Plus :size="15" aria-hidden="true" />
                  </template>
                  Add
                </DzButton>
              </div>
            </DzCard>
          </li>
        </ul>
      </section>
    </main>

    <footer class="foot">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Leaf :size="16" /></span>
        <span class="brand-name">Verdant Market</span>
      </span>
      <DzText size="sm" tone="muted">
        © 2026 Verdant Market. Good food, sourced well.
      </DzText>
    </footer>
  </div>
</template>

<style scoped>
/* Re-skin the brand accent to emerald entirely through tokens (ADR-04) — every
   Dz component below inherits it and stays correct in light + dark. */
.cart {
  --dz-primary: var(--dz-success);
  --dz-primary-hover: var(--dz-success);
  --dz-primary-foreground: var(--dz-success-foreground);
  --dz-primary-muted: var(--dz-success-muted);
  --dz-primary-muted-foreground: var(--dz-success-muted-foreground);
  --dz-ring: var(--dz-success);

  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  min-height: 100vh;
}

/* ── Store bar ─────────────────────────────────────────────────── */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in oklch, var(--dz-background) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--dz-border);
}

.topbar-inner,
.wrap {
  max-width: 1140px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 60px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.topbar-cart {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--dz-muted-foreground);
}

/* ── Layout ────────────────────────────────────────────────────── */
.wrap {
  padding-top: clamp(24px, 4vw, 40px);
  padding-bottom: 64px;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: clamp(20px, 3vw, 32px);
}

.continue {
  flex: none;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: clamp(24px, 4vw, 48px);
  align-items: start;
}

.layout--empty {
  grid-template-columns: 1fr;
}

/* ── Cart lines ────────────────────────────────────────────────── */
.items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.items-card {
  overflow: hidden;
}

.line {
  padding-block: 18px;
}

.line-grid {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  width: 100%;
}

.line-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--dz-radius-lg);
  border: 1px solid var(--dz-border);
  overflow: hidden;
}

.line-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.line-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.line-id {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  line-height: 1.35;
}

.line-note {
  font-weight: var(--dz-font-medium);
}

.line-price {
  white-space: nowrap;
}

.line-controls {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.line-qty {
  width: 116px;
}

.line-unit {
  margin-right: auto;
}

/* ── Free-shipping nudge ───────────────────────────────────────── */
.ship-track {
  margin-top: 10px;
  height: 6px;
  border-radius: var(--dz-radius-full);
  background: color-mix(in oklch, var(--dz-muted-foreground) 18%, transparent);
  overflow: hidden;
}

.ship-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--dz-primary);
  transition: width var(--dz-duration-base, 240ms) var(--dz-ease-out, ease-out);
}

/* ── Empty state ───────────────────────────────────────────────── */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding-block: clamp(40px, 8vw, 72px);
}

.empty-mark {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: var(--dz-radius-full);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
  margin-bottom: 4px;
}

.empty-copy {
  max-width: 38ch;
  margin: 0 0 8px;
  line-height: 1.6;
}

/* ── Order summary ─────────────────────────────────────────────── */
.summary {
  position: sticky;
  top: 84px;
  min-width: 0;
}

.summary-title {
  margin-bottom: 16px;
}

.promo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.promo-row {
  display: flex;
  gap: 8px;
}

.promo-input {
  flex: 1;
  min-width: 0;
}

.promo-msg {
  font-weight: var(--dz-font-medium);
}

.summary-rule {
  margin: 16px 0;
}

.totals {
  margin: 0;
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
  margin-bottom: 10px;
}

.total-row dt,
.total-row dd {
  margin: 0;
}

.total-row dd {
  font-weight: var(--dz-font-medium);
  color: var(--dz-foreground);
}

.total-row.is-discount dd {
  color: var(--dz-success);
}

.total-row--grand {
  font-size: var(--dz-text-lg);
  color: var(--dz-foreground);
  margin-bottom: 0;
}

.total-row--grand dt {
  font-weight: var(--dz-font-semibold);
}

.total-row--grand dd {
  font-weight: var(--dz-font-bold);
}

.checkout-btn {
  width: 100%;
  margin-top: 18px;
}

.trust {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.trust li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
}

.trust svg {
  color: var(--dz-primary);
  flex: none;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 16px;
}

/* ── Cross-sell ────────────────────────────────────────────────── */
.suggest {
  margin-top: clamp(36px, 6vw, 64px);
}

.suggest-title {
  margin-bottom: 18px;
}

.suggest-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.suggest-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.suggest-thumb {
  width: 100%;
  border-radius: var(--dz-radius-lg);
  border: 1px solid var(--dz-border);
  overflow: hidden;
}

.suggest-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.35;
}

.suggest-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

/* ── Footer ────────────────────────────────────────────────────── */
.foot {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 28px 24px;
  border-top: 1px solid var(--dz-border);
}

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 920px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .suggest-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .line-grid {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 12px;
  }
  .line-thumb {
    width: 56px;
    height: 56px;
  }
  .line-unit {
    width: 100%;
    margin-right: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ship-fill {
    transition: none;
  }
}
</style>
