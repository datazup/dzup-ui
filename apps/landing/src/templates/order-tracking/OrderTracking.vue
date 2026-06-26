<script setup lang="ts">
/**
 * Order Tracking — Commerce template (docs/templates.md §6.4).
 *
 * A chromeless post-purchase page for a home-goods store ("Atlas Supply"): a
 * DzResult success header with recovery actions, a DzStepper horizontal delivery
 * tracker, an ordered-items card with token-tinted thumbnails and totals, a
 * DzDescriptions order-facts grid with the shipping address, a DzTimeline of the
 * granular shipment history, and a help card. The natural continuation of the
 * Checkout template's "Place order".
 *
 * Built only from free `@dzup-ui/core` components and token-styled (no `lp-*`).
 * The brand accent is re-skinned to teal entirely through `--dz-*` tokens (no
 * raw hex), so every Dz component re-tints and stays correct in light + dark
 * from 390px upward.
 */
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDescriptions,
  DzDescriptionsItem,
  DzDivider,
  DzHeading,
  DzResult,
  DzStepper,
  DzStepperItem,
  DzText,
  DzTimeline,
  DzTimelineItem,
} from '@dzup-ui/core'
import { LifeBuoy, MapPin, Package, Receipt, Truck } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import {
  ACTIVE_STAGE,
  DELIVERY_STAGES,
  ORDER_FACTS,
  ORDER_LINES,
  SHIPPING_ADDRESS,
  TRACKING_EVENTS,
} from './data.ts'

// Bound to the stepper; the tracker is presentational, so it isn't clickable.
const stage = ref(ACTIVE_STAGE)

const subtotal = computed(() => ORDER_LINES.reduce((sum, l) => sum + l.price * l.qty, 0))
const tax = computed(() => subtotal.value * 0.08)
const total = computed(() => subtotal.value + tax.value)

function money(n: number): string {
  return `$${n.toFixed(2)}`
}
</script>

<template>
  <div class="track">
    <!-- ── Store bar ──────────────────────────────────────────── -->
    <header class="topbar">
      <div class="topbar-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Package :size="18" /></span>
          <span class="brand-name">Atlas Supply</span>
        </span>
        <DzBadge variant="subtle" tone="neutral" size="sm">Order #ATL-20461</DzBadge>
      </div>
    </header>

    <main class="wrap">
      <!-- ── Success header ───────────────────────────────────── -->
      <DzResult
        status="success"
        title="Your order is confirmed"
        description="Thanks, Maya — we've emailed your receipt to maya.okafor@example.com. You can track every step below."
        class="result"
      >
        <template #actions>
          <DzButton variant="solid" tone="primary" href="#history">
            <template #prefix><Truck :size="17" aria-hidden="true" /></template>
            Track shipment
          </DzButton>
          <DzButton variant="outline" tone="neutral">
            <template #prefix><Receipt :size="17" aria-hidden="true" /></template>
            View receipt
          </DzButton>
        </template>
      </DzResult>

      <!-- ── Delivery tracker ─────────────────────────────────── -->
      <DzCard variant="outlined" padding="lg" class="tracker">
        <div class="tracker-head">
          <div>
            <DzText size="sm" weight="semibold" as="span" class="eyebrow">Estimated delivery</DzText>
            <DzHeading :level="2" size="lg" weight="bold" class="tracker-eta">Arriving today</DzHeading>
            <DzText size="sm" tone="muted" as="p">Atlas Express · 9:00 AM – 1:00 PM</DzText>
          </div>
          <DzBadge variant="solid" tone="primary" size="sm">On the way</DzBadge>
        </div>
        <DzStepper v-model="stage" class="stages" aria-label="Delivery progress">
          <DzStepperItem
            v-for="s in DELIVERY_STAGES"
            :key="s.title"
            :title="s.title"
            :description="s.description"
          />
        </DzStepper>
      </DzCard>

      <!-- ── Items + details ──────────────────────────────────── -->
      <div class="cols">
        <DzCard variant="outlined" padding="lg" class="items">
          <DzHeading :level="2" size="md" weight="semibold" class="card-title">
            Items in this order
          </DzHeading>
          <ul class="lines">
            <li v-for="l in ORDER_LINES" :key="l.id" class="line">
              <span class="line-thumb" :style="{ '--tint': `var(${l.tint})` }" aria-hidden="true">
                <component :is="l.icon" :size="22" />
              </span>
              <span class="line-meta">
                <DzText weight="medium" as="span">{{ l.name }}</DzText>
                <DzText size="sm" tone="muted" as="span">{{ l.variant }}</DzText>
                <DzText size="sm" tone="muted" as="span">Qty {{ l.qty }}</DzText>
              </span>
              <span class="line-price">{{ money(l.price * l.qty) }}</span>
            </li>
          </ul>

          <DzDivider class="items-rule" />

          <dl class="totals">
            <div class="total-row">
              <dt>Subtotal</dt>
              <dd>{{ money(subtotal) }}</dd>
            </div>
            <div class="total-row">
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
            <div class="total-row">
              <dt>Tax</dt>
              <dd>{{ money(tax) }}</dd>
            </div>
            <div class="total-row total-row--grand">
              <dt>Total paid</dt>
              <dd>{{ money(total) }}</dd>
            </div>
          </dl>
        </DzCard>

        <DzCard variant="outlined" padding="lg" class="details">
          <DzHeading :level="2" size="md" weight="semibold" class="card-title">Order details</DzHeading>
          <DzDescriptions :columns="{ base: 1, sm: 2 }" layout="vertical" size="sm">
            <DzDescriptionsItem v-for="f in ORDER_FACTS" :key="f.label" :label="f.label">
              {{ f.value }}
            </DzDescriptionsItem>
          </DzDescriptions>

          <DzDivider class="details-rule" />

          <div class="address">
            <span class="address-icon" aria-hidden="true"><MapPin :size="18" /></span>
            <div class="address-body">
              <DzText size="sm" weight="semibold" as="span" class="address-title">
                Shipping to
              </DzText>
              <address class="address-lines">
                <span v-for="line in SHIPPING_ADDRESS" :key="line">{{ line }}</span>
              </address>
            </div>
          </div>
        </DzCard>
      </div>

      <!-- ── Shipment history ─────────────────────────────────── -->
      <DzCard id="history" variant="outlined" padding="lg" class="history">
        <DzHeading :level="2" size="md" weight="semibold" class="card-title">Shipment history</DzHeading>
        <DzTimeline>
          <DzTimelineItem
            v-for="(event, i) in TRACKING_EVENTS"
            :key="i"
            :tone="event.tone"
            :status="event.when"
          >
            <DzText weight="medium" as="div">{{ event.title }}</DzText>
            <DzText size="sm" tone="muted" as="div">{{ event.detail }}</DzText>
          </DzTimelineItem>
        </DzTimeline>
      </DzCard>

      <!-- ── Help ─────────────────────────────────────────────── -->
      <DzCard variant="flat" padding="lg" class="help">
        <span class="help-icon" aria-hidden="true"><LifeBuoy :size="22" /></span>
        <div class="help-copy">
          <DzText weight="semibold" as="div">Something not right?</DzText>
          <DzText size="sm" tone="muted" as="div">
            Our support team replies within a few hours, every day.
          </DzText>
        </div>
        <DzButton variant="outline" tone="neutral" class="help-cta">Contact support</DzButton>
      </DzCard>
    </main>

    <footer class="foot">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Package :size="16" /></span>
        <span class="brand-name">Atlas Supply</span>
      </span>
      <DzText size="sm" tone="muted">© 2026 Atlas Supply. Considered things for the home.</DzText>
    </footer>
  </div>
</template>

<style scoped>
/* Re-skin the brand accent to teal entirely through tokens (ADR-04) — every Dz
   component below inherits it and stays correct in light + dark. */
.track {
  --dz-primary: var(--dz-info);
  --dz-primary-hover: var(--dz-info);
  --dz-primary-foreground: var(--dz-info-foreground);
  --dz-primary-muted: var(--dz-info-muted);
  --dz-primary-muted-foreground: var(--dz-info-muted-foreground);
  --dz-ring: var(--dz-info);

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
  max-width: 960px;
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

/* ── Layout ────────────────────────────────────────────────────── */
.wrap {
  padding-top: clamp(28px, 4vw, 48px);
  padding-bottom: 64px;
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 3vw, 28px);
}

.result {
  padding: clamp(20px, 4vw, 36px) 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-xl);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-success) 8%, transparent), transparent 60%),
    var(--dz-surface);
}

/* ── Delivery tracker ──────────────────────────────────────────── */
.tracker-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

/* Let the horizontal step row scroll rather than overflow at 390px. */
.stages {
  overflow-x: auto;
  scrollbar-width: none;
}

.stages::-webkit-scrollbar {
  display: none;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dz-primary);
}

.tracker-eta {
  margin: 4px 0 2px;
  letter-spacing: -0.01em;
}

/* ── Items + details ───────────────────────────────────────────── */
.cols {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: clamp(16px, 3vw, 24px);
  align-items: start;
}

.card-title {
  margin-bottom: 18px;
}

.lines {
  list-style: none;
  margin: 0;
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

.line-price {
  font-weight: var(--dz-font-semibold);
  font-size: var(--dz-text-sm);
  white-space: nowrap;
}

.items-rule,
.details-rule {
  margin: 18px 0;
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

/* Address */
.address {
  display: flex;
  gap: 12px;
}

.address-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
}

.address-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address-lines {
  display: flex;
  flex-direction: column;
  font-style: normal;
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
  line-height: 1.5;
}

/* ── Help ──────────────────────────────────────────────────────── */
.help {
  display: flex;
  align-items: center;
  gap: 16px;
}

.help-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: var(--dz-radius-lg);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
}

.help-copy {
  flex: 1;
  min-width: 0;
  line-height: 1.35;
}

.help-cta {
  flex: none;
}

/* ── Footer ────────────────────────────────────────────────────── */
.foot {
  max-width: 960px;
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
@media (max-width: 720px) {
  .cols {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .help {
    flex-wrap: wrap;
  }
  .help-cta {
    width: 100%;
  }
}
</style>
