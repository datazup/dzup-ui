<script setup lang="ts">
/**
 * Checkout — Commerce template (docs/templates.md §6.4).
 *
 * A chromeless single-page checkout for a specialty grocer ("Verdant Market"):
 * a DzStepper order funnel, a contact + shipping form (DzFormField / DzInput /
 * DzSelect), a DzRadioGroup delivery picker, a card-payment block with a
 * "billing = shipping" DzCheckbox, and a sticky order summary with editable
 * DzNumberInput quantities, a working promo code, live totals and a DzAlert
 * free-shipping nudge. Quantities, the promo and the totals are all real and
 * client-side. "Place order" continues the journey to the Order Tracking
 * template.
 *
 * Built only from free `@dzup-ui/core` components and token-styled (no `lp-*`).
 * The brand accent is re-skinned to emerald entirely through `--dz-*` tokens
 * (no raw hex), so every Dz component re-tints and stays correct in light + dark
 * from 390px upward.
 */
import {
  DzAlert,
  DzBadge,
  DzButton,
  DzCard,
  DzCheckbox,
  DzDivider,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzNumberInput,
  DzRadio,
  DzRadioGroup,
  DzSelect,
  DzStepper,
  DzStepperItem,
  DzText,
} from '@dzup-ui/core'
import { Leaf, Lock, RotateCcw, ShoppingBag, Tag, Trash2, Truck } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import {
  COUNTRIES,
  DELIVERY_METHODS,
  FREE_SHIPPING_THRESHOLD,
  LINE_ITEMS,
  PROMO_CODE,
  PROMO_RATE,
  STANDARD_SHIPPING,
  TAX_RATE,
} from './data.ts'

// ── Checkout funnel (visual progress only) ───────────────────────
const STEPS = ['Cart', 'Details', 'Payment', 'Confirmation']
const step = ref(2)

// ── Form state ───────────────────────────────────────────────────
const email = ref('maya.okafor@example.com')
const firstName = ref('Maya')
const lastName = ref('Okafor')
const address = ref('14 Calthorpe Street')
const city = ref('London')
const postcode = ref('WC1X 0HG')
const country = ref('gb')
const delivery = ref('standard')
const cardName = ref('Maya Okafor')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const billingSame = ref(true)

// ── Cart lines (quantities are live) ─────────────────────────────
const lines = ref(LINE_ITEMS.map(l => ({ ...l })))
function removeLine(id: string): void {
  lines.value = lines.value.filter(l => l.id !== id)
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

// ── Totals ───────────────────────────────────────────────────────
const subtotal = computed(() => lines.value.reduce((sum, l) => sum + l.price * l.qty, 0))
const discount = computed(() => (promoApplied.value ? subtotal.value * PROMO_RATE : 0))
const freeShipping = computed(() => subtotal.value >= FREE_SHIPPING_THRESHOLD)
const amountToFree = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value))

const activeMethod = computed(
  () => DELIVERY_METHODS.find(m => m.value === delivery.value) ?? DELIVERY_METHODS[0]!,
)
const shippingCost = computed(() => {
  if (activeMethod.value.value === 'standard')
    return freeShipping.value ? 0 : STANDARD_SHIPPING
  return activeMethod.value.price
})

const tax = computed(() => (subtotal.value - discount.value) * TAX_RATE)
const total = computed(() => subtotal.value - discount.value + shippingCost.value + tax.value)

/** Format a number as a 2-dp price string. */
function money(n: number): string {
  return `$${n.toFixed(2)}`
}
</script>

<template>
  <div class="checkout">
    <!-- ── Store bar ──────────────────────────────────────────── -->
    <header class="topbar">
      <div class="topbar-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Leaf :size="18" /></span>
          <span class="brand-name">Verdant Market</span>
        </span>
        <span class="secure">
          <Lock :size="15" aria-hidden="true" />
          <DzText size="sm" tone="muted" as="span">Secure checkout</DzText>
        </span>
      </div>
    </header>

    <main class="wrap">
      <DzStepper v-model="step" class="funnel" aria-label="Checkout progress">
        <DzStepperItem
          v-for="(label, i) in STEPS"
          :key="label"
          :title="label"
          :description="i === step ? 'In progress' : i < step ? 'Done' : 'Up next'"
        />
      </DzStepper>

      <div class="layout">
        <!-- ── Checkout form ───────────────────────────────────── -->
        <form class="form" @submit.prevent>
          <!-- Contact -->
          <section class="block">
            <div class="block-head">
              <DzHeading :level="2" size="md" weight="semibold">
                Contact
              </DzHeading>
              <DzText size="sm" tone="muted" as="span">
                Step 1 of 3
              </DzText>
            </div>
            <DzFormField>
              <DzFormLabel>Email</DzFormLabel>
              <DzInput v-model="email" type="email" autocomplete="email" />
              <DzFormDescription>Order updates and your receipt go here.</DzFormDescription>
            </DzFormField>
          </section>

          <DzDivider />

          <!-- Shipping address -->
          <section class="block">
            <div class="block-head">
              <DzHeading :level="2" size="md" weight="semibold">
                Shipping address
              </DzHeading>
              <DzText size="sm" tone="muted" as="span">
                Step 2 of 3
              </DzText>
            </div>
            <div class="grid-2">
              <DzFormField>
                <DzFormLabel>First name</DzFormLabel>
                <DzInput v-model="firstName" autocomplete="given-name" />
              </DzFormField>
              <DzFormField>
                <DzFormLabel>Last name</DzFormLabel>
                <DzInput v-model="lastName" autocomplete="family-name" />
              </DzFormField>
            </div>
            <DzFormField>
              <DzFormLabel>Street address</DzFormLabel>
              <DzInput v-model="address" autocomplete="street-address" />
            </DzFormField>
            <div class="grid-2">
              <DzFormField>
                <DzFormLabel>City</DzFormLabel>
                <DzInput v-model="city" autocomplete="address-level2" />
              </DzFormField>
              <DzFormField>
                <DzFormLabel>Postcode</DzFormLabel>
                <DzInput v-model="postcode" autocomplete="postal-code" />
              </DzFormField>
            </div>
            <DzFormField>
              <DzFormLabel>Country</DzFormLabel>
              <DzSelect v-model="country" :items="COUNTRIES" aria-label="Country" />
            </DzFormField>
          </section>

          <DzDivider />

          <!-- Delivery -->
          <section class="block">
            <div class="block-head">
              <DzHeading :level="2" size="md" weight="semibold">
                Delivery
              </DzHeading>
            </div>
            <DzRadioGroup v-model="delivery" aria-label="Delivery method" class="methods">
              <div
                v-for="m in DELIVERY_METHODS"
                :key="m.value"
                class="method"
                :class="{ 'is-active': delivery === m.value }"
              >
                <DzRadio :value="m.value">
                  <span class="method-copy">
                    <DzText weight="medium" as="span">{{ m.label }}</DzText>
                    <DzText size="sm" tone="muted" as="span">{{ m.detail }}</DzText>
                  </span>
                </DzRadio>
                <span class="method-price">
                  {{ m.value === 'standard' && freeShipping ? 'Free' : m.price === 0 ? 'Free' : money(m.price) }}
                </span>
              </div>
            </DzRadioGroup>
          </section>

          <DzDivider />

          <!-- Payment -->
          <section class="block">
            <div class="block-head">
              <DzHeading :level="2" size="md" weight="semibold">
                Payment
              </DzHeading>
              <span class="secure">
                <Lock :size="14" aria-hidden="true" />
                <DzText size="sm" tone="muted" as="span">Encrypted</DzText>
              </span>
            </div>
            <DzFormField>
              <DzFormLabel>Name on card</DzFormLabel>
              <DzInput v-model="cardName" autocomplete="cc-name" />
            </DzFormField>
            <DzFormField>
              <DzFormLabel>Card number</DzFormLabel>
              <DzInput v-model="cardNumber" placeholder="1234 5678 9012 3456" autocomplete="cc-number" inputmode="numeric" />
            </DzFormField>
            <div class="grid-2">
              <DzFormField>
                <DzFormLabel>Expiry</DzFormLabel>
                <DzInput v-model="cardExpiry" placeholder="MM / YY" autocomplete="cc-exp" inputmode="numeric" />
              </DzFormField>
              <DzFormField>
                <DzFormLabel>CVC</DzFormLabel>
                <DzInput v-model="cardCvc" placeholder="123" autocomplete="cc-csc" inputmode="numeric" />
              </DzFormField>
            </div>
            <DzCheckbox v-model="billingSame" class="billing-same">
              Billing address is the same as shipping
            </DzCheckbox>
          </section>
        </form>

        <!-- ── Order summary ───────────────────────────────────── -->
        <aside class="summary" aria-label="Order summary">
          <DzCard variant="outlined" padding="lg" class="summary-card">
            <DzHeading :level="2" size="md" weight="semibold" class="summary-title">
              Order summary
            </DzHeading>

            <ul v-if="lines.length" class="lines">
              <li v-for="l in lines" :key="l.id" class="line">
                <span class="line-thumb" :style="{ '--tint': `var(${l.tint})` }" aria-hidden="true">
                  <component :is="l.icon" :size="22" />
                </span>
                <span class="line-meta">
                  <DzText weight="medium" as="span">{{ l.name }}</DzText>
                  <DzText size="sm" tone="muted" as="span">{{ l.variant }}</DzText>
                  <span class="line-controls">
                    <DzNumberInput
                      v-model="l.qty"
                      :min="1"
                      :max="9"
                      size="sm"
                      class="line-qty"
                      :aria-label="`Quantity for ${l.name}`"
                    />
                    <button
                      type="button"
                      class="line-remove"
                      :aria-label="`Remove ${l.name}`"
                      @click="removeLine(l.id)"
                    >
                      <Trash2 :size="15" aria-hidden="true" />
                    </button>
                  </span>
                </span>
                <span class="line-price">{{ money(l.price * l.qty) }}</span>
              </li>
            </ul>
            <DzText v-else tone="muted" as="p" class="lines-empty">
              Your bag is empty.
            </DzText>

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

            <!-- Totals -->
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

            <DzAlert
              :tone="freeShipping ? 'success' : 'info'"
              variant="subtle"
              :icon="Truck"
              class="ship-nudge"
            >
              <template v-if="freeShipping">
                You've unlocked free standard shipping.
              </template>
              <template v-else>
                Add {{ money(amountToFree) }} more for free standard shipping.
              </template>
            </DzAlert>

            <DzButton
              variant="solid"
              tone="primary"
              size="lg"
              class="place-order"
              :disabled="!lines.length"
            >
              <template #prefix>
                <ShoppingBag :size="18" aria-hidden="true" />
              </template>
              Place order · {{ money(total) }}
            </DzButton>

            <ul class="trust">
              <li><Lock :size="15" aria-hidden="true" /><span>Encrypted, PCI-compliant payment</span></li>
              <li><RotateCcw :size="15" aria-hidden="true" /><span>14-day returns on unopened goods</span></li>
            </ul>
          </DzCard>

          <span class="badges">
            <DzBadge variant="subtle" tone="neutral" size="sm">Apple Pay</DzBadge>
            <DzBadge variant="subtle" tone="neutral" size="sm">Google Pay</DzBadge>
            <DzBadge variant="subtle" tone="neutral" size="sm">Visa</DzBadge>
            <DzBadge variant="subtle" tone="neutral" size="sm">Mastercard</DzBadge>
          </span>
        </aside>
      </div>
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
.checkout {
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

.secure {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--dz-muted-foreground);
}

/* ── Layout ────────────────────────────────────────────────────── */
.wrap {
  padding-top: clamp(24px, 4vw, 40px);
  padding-bottom: 64px;
}

.funnel {
  margin-bottom: clamp(28px, 4vw, 40px);
  /* Let the horizontal step row scroll rather than overflow at 390px. */
  overflow-x: auto;
  scrollbar-width: none;
}

.funnel::-webkit-scrollbar {
  display: none;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: clamp(24px, 4vw, 48px);
  align-items: start;
}

/* ── Form ──────────────────────────────────────────────────────── */
.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Delivery methods */
.methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-surface);
  cursor: pointer;
  transition: border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.method:hover {
  border-color: var(--dz-border-hover);
}

.method.is-active {
  border-color: var(--dz-primary);
  box-shadow: 0 0 0 1px var(--dz-primary);
}

.method-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.35;
}

.method-price {
  flex: none;
  font-weight: var(--dz-font-semibold);
  font-size: var(--dz-text-sm);
}

.billing-same {
  margin-top: 2px;
}

/* ── Order summary ─────────────────────────────────────────────── */
.summary {
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-title {
  margin-bottom: 16px;
}

.lines {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.line {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
}

.line-thumb {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--dz-radius-lg);
  border: 1px solid var(--dz-border);
  color: var(--tint);
  background:
    radial-gradient(circle at 50% 25%, color-mix(in oklch, var(--tint) 18%, transparent), transparent 70%),
    var(--dz-muted);
}

.line-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  line-height: 1.35;
}

.line-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.line-qty {
  width: 104px;
}

.line-remove {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-md);
  background: var(--dz-surface);
  color: var(--dz-muted-foreground);
  cursor: pointer;
  transition: color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.line-remove:hover {
  color: var(--dz-danger);
  border-color: var(--dz-danger);
}

.line-remove:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
}

.line-price {
  font-weight: var(--dz-font-semibold);
  font-size: var(--dz-text-sm);
  white-space: nowrap;
}

.lines-empty {
  margin: 0 0 18px;
}

/* Promo */
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

/* Totals */
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

.ship-nudge {
  margin: 18px 0;
}

.place-order {
  width: 100%;
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

@media (max-width: 560px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .method,
  .line-remove {
    transition: none;
  }
}
</style>
