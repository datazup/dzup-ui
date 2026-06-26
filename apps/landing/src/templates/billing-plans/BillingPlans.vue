<script setup lang="ts">
/**
 * Billing & Plans — full-page account billing template (docs/templates.md §6.1).
 *
 * A centered billing surface: a DzAlert trial banner, a DzSegmented billing-cycle
 * toggle, a row of plan DzCards with DzBadge markers, a usage card combining a
 * DzMeterGroup seat breakdown with DzProgress resource bars, and a DzTable of
 * invoices. Built only from free `@dzup-ui/core` components, token-styled,
 * light + dark, reflows to 390px.
 */
import {
  DzAlert,
  DzBadge,
  DzButton,
  DzCard,
  DzHeading,
  DzMeterGroup,
  DzProgress,
  DzSegmented,
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzText,
} from '@dzup-ui/core'
import { Check, Clock, Download } from 'lucide-vue-next'
import { ref } from 'vue'
import {
  INVOICE_TONE,
  INVOICES,
  PLANS,
  RESOURCE_USAGE,
  SEAT_LIMIT,
  USAGE_SEGMENTS,
} from './data.ts'

const cycle = ref('monthly')
const cycleItems = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly · save 20%' },
]

// Yearly bills 12 months at a 20% discount, shown as an effective per-month price.
function priceFor(monthly: number): string {
  if (monthly === 0) return '$0'
  if (cycle.value === 'yearly') return `$${Math.round(monthly * 0.8)}`
  return `$${monthly}`
}

const seatsUsed = USAGE_SEGMENTS.filter((s) => s.label !== 'Available').reduce(
  (sum, s) => sum + s.value,
  0,
)
</script>

<template>
  <div class="bill-page">
    <div class="bill-wrap">
      <header class="bill-head">
        <DzHeading :level="1" size="xl" weight="semibold">Billing & plans</DzHeading>
        <DzText tone="muted" as="p">Manage your subscription, usage and invoices.</DzText>
      </header>

      <DzAlert tone="info" variant="subtle" :icon="Clock" title="Your Team trial ends in 9 days">
        Add a payment method to keep advanced analytics and priority support.
        <template #actions>
          <DzButton size="sm" variant="solid" tone="primary">Add payment method</DzButton>
        </template>
      </DzAlert>

      <div class="cycle-row">
        <DzSegmented v-model="cycle" :items="cycleItems" size="sm" aria-label="Billing cycle" />
      </div>

      <section class="plans" aria-label="Plans">
        <DzCard
          v-for="plan in PLANS"
          :key="plan.id"
          :variant="plan.popular ? 'elevated' : 'outlined'"
          padding="lg"
          class="plan"
          :class="{ 'plan--popular': plan.popular }"
        >
          <div class="plan-head">
            <DzText weight="semibold" as="div" class="plan-name">{{ plan.name }}</DzText>
            <DzBadge v-if="plan.current" variant="subtle" tone="success" size="sm">Current</DzBadge>
            <DzBadge v-else-if="plan.popular" variant="solid" tone="primary" size="sm">
              Popular
            </DzBadge>
          </div>

          <div class="plan-price">
            <span class="price-value">{{ priceFor(plan.monthly) }}</span>
            <DzText v-if="plan.monthly > 0" size="sm" tone="muted" as="span">/mo per seat</DzText>
          </div>
          <DzText size="sm" tone="muted" as="p" class="plan-blurb">{{ plan.blurb }}</DzText>

          <ul class="feat-list">
            <li v-for="f in plan.features" :key="f">
              <Check :size="16" aria-hidden="true" /><span>{{ f }}</span>
            </li>
          </ul>

          <DzButton
            :variant="plan.current ? 'outline' : 'solid'"
            :tone="plan.current ? 'neutral' : 'primary'"
            class="plan-cta"
            :disabled="plan.current"
          >
            {{ plan.current ? 'Current plan' : plan.monthly === 0 ? 'Downgrade' : 'Upgrade' }}
          </DzButton>
        </DzCard>
      </section>

      <div class="usage-grid">
        <DzCard variant="outlined" padding="md">
          <div class="card-head-row">
            <DzText weight="semibold" as="div">Seats</DzText>
            <DzText size="sm" tone="muted">{{ seatsUsed }} of {{ SEAT_LIMIT }} used</DzText>
          </div>
          <DzMeterGroup
            :values="USAGE_SEGMENTS"
            :max="SEAT_LIMIT"
            class="seat-meter"
            aria-label="Seat usage"
          />
        </DzCard>

        <DzCard variant="outlined" padding="md">
          <DzText weight="semibold" as="div" class="usage-title">Resource usage</DzText>
          <ul class="resource-list">
            <li v-for="r in RESOURCE_USAGE" :key="r.label" class="resource-row">
              <div class="resource-head">
                <DzText size="sm">{{ r.label }}</DzText>
                <DzText size="sm" tone="muted">{{ r.used }} / {{ r.total }} {{ r.unit }}</DzText>
              </div>
              <DzProgress
                :value="Math.round((r.used / r.total) * 100)"
                size="sm"
                :tone="r.used / r.total > 0.85 ? 'warning' : 'primary'"
                :aria-label="`${r.label} usage`"
              />
            </li>
          </ul>
        </DzCard>
      </div>

      <DzCard variant="outlined" padding="none" class="invoice-card">
        <div class="invoice-head">
          <DzText weight="semibold">Invoices</DzText>
          <DzButton variant="link" tone="primary" size="sm">View all</DzButton>
        </div>
        <div class="table-scroll">
          <DzTable hoverable>
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header>Invoice</DzTableCell>
                <DzTableCell header>Date</DzTableCell>
                <DzTableCell header>Amount</DzTableCell>
                <DzTableCell header>Status</DzTableCell>
                <DzTableCell header align="right"><span class="sr-only">Download</span></DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow v-for="inv in INVOICES" :key="inv.id">
                <DzTableCell>
                  <DzText size="sm" weight="medium">{{ inv.id }}</DzText>
                </DzTableCell>
                <DzTableCell>
                  <DzText size="sm" tone="muted">{{ inv.date }}</DzText>
                </DzTableCell>
                <DzTableCell>
                  <span class="amount">{{ inv.amount }}</span>
                </DzTableCell>
                <DzTableCell>
                  <DzBadge variant="subtle" :tone="INVOICE_TONE[inv.status]" size="sm">
                    {{ inv.status }}
                  </DzBadge>
                </DzTableCell>
                <DzTableCell align="right">
                  <DzButton variant="ghost" tone="neutral" size="sm">
                    <template #prefix><Download :size="15" aria-hidden="true" /></template>
                    PDF
                  </DzButton>
                </DzTableCell>
              </DzTableRow>
            </DzTableBody>
          </DzTable>
        </div>
      </DzCard>
    </div>
  </div>
</template>

<style scoped>
.bill-page {
  min-height: 100vh;
  width: 100%;
  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  padding: clamp(20px, 4vw, 48px);
}

.bill-wrap {
  max-width: 940px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bill-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cycle-row {
  display: flex;
}

.plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;
}

.plan {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.plan--popular {
  outline: 1.5px solid var(--dz-primary);
}

.plan-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.plan-name {
  font-size: var(--dz-text-lg);
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-value {
  font-size: var(--dz-text-3xl);
  font-weight: var(--dz-font-semibold);
  line-height: 1;
}

.plan-blurb {
  min-height: 2.6em;
}

.feat-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.feat-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
}

.feat-list li svg {
  color: var(--dz-primary);
  flex-shrink: 0;
}

.plan-cta {
  width: 100%;
  margin-top: 4px;
}

.usage-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.card-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.seat-meter {
  margin-top: 4px;
}

.usage-title {
  margin-bottom: 16px;
}

.resource-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.resource-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.invoice-card {
  overflow: hidden;
}

.invoice-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--dz-border);
}

.table-scroll {
  overflow-x: auto;
}

.amount {
  font-variant-numeric: tabular-nums;
  font-weight: var(--dz-font-medium);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 820px) {
  .plans {
    grid-template-columns: 1fr;
  }
  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
