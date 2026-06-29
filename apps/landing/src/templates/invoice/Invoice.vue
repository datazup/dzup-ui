<script setup lang="ts">
/**
 * Invoice — Commerce template (docs/templates.md §6.5).
 *
 * A printable studio invoice: a no-print action bar (Download / Print / Send),
 * then a DzCard "sheet" with a branded header and status DzBadge, From / Bill-to
 * / details DzDescriptions, a line-item DzTable, a derived totals block, payment
 * notes and a footer. Every monetary figure is COMPUTED from the line items, so
 * subtotal → discount → tax → total are always arithmetically consistent.
 *
 * Built only from free `@dzup-ui/core` components and styled entirely with
 * `var(--dz-*)` tokens (no `lp-*`). Correct in light + dark; reflows to 390px.
 */
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDescriptions,
  DzDescriptionsItem,
  DzDivider,
  DzHeading,
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzText,
} from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'
import { Download, Printer, Send, Sparkles } from 'lucide-vue-next'
import { computed } from 'vue'
import {
  CLIENT,
  DISCOUNT_RATE,
  INVOICE_META,
  ISSUER,
  LINE_ITEMS,
  NOTES,
  TAX_RATE,
} from './data.ts'

const STATUS_TONE: Record<string, CanonicalTone> = {
  Due: 'warning',
  Paid: 'success',
  Overdue: 'danger',
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: INVOICE_META.currency,
  minimumFractionDigits: 2,
})

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(iso: string): string {
  const parts = iso.split('-')
  const m = Number(parts[1])
  return `${MONTHS[m - 1] ?? ''} ${Number(parts[2])}, ${parts[0]}`
}

function amountOf(qty: number, unit: number): number {
  return qty * unit
}

const subtotal = computed(() =>
  LINE_ITEMS.reduce((sum, l) => sum + amountOf(l.qty, l.unitPrice), 0),
)
const discount = computed(() => subtotal.value * DISCOUNT_RATE)
const taxable = computed(() => subtotal.value - discount.value)
const tax = computed(() => taxable.value * TAX_RATE)
const total = computed(() => taxable.value + tax.value)

function print() {
  if (typeof window !== 'undefined') window.print()
}
</script>

<template>
  <div class="inv">
    <main class="inv-wrap">
      <!-- ── Action bar (hidden when printing) ─────────────────── -->
      <div class="inv-actions no-print">
        <DzText size="sm" tone="muted">Invoice {{ INVOICE_META.number }}</DzText>
        <div class="inv-actions-end">
          <DzButton variant="outline" tone="neutral" size="sm">
            <template #prefix><Download :size="15" aria-hidden="true" /></template>
            Download
          </DzButton>
          <DzButton variant="outline" tone="neutral" size="sm" @click="print">
            <template #prefix><Printer :size="15" aria-hidden="true" /></template>
            Print
          </DzButton>
          <DzButton variant="solid" tone="primary" size="sm">
            <template #prefix><Send :size="15" aria-hidden="true" /></template>
            Send invoice
          </DzButton>
        </div>
      </div>

      <!-- ── The invoice sheet ─────────────────────────────────── -->
      <DzCard variant="outlined" padding="lg" class="sheet">
        <!-- Header -->
        <header class="sheet-head">
          <div class="issuer">
            <span class="brand-mark" aria-hidden="true"><Sparkles :size="20" /></span>
            <div>
              <DzText weight="semibold" size="lg" as="div">{{ ISSUER.name }}</DzText>
              <DzText size="sm" tone="muted" as="div">Design & engineering studio</DzText>
            </div>
          </div>
          <div class="head-meta">
            <DzHeading :level="1" size="xl" weight="bold" class="inv-word">Invoice</DzHeading>
            <DzText size="sm" tone="muted" as="div">{{ INVOICE_META.number }}</DzText>
            <DzBadge
              variant="subtle"
              :tone="STATUS_TONE[INVOICE_META.status]"
              size="sm"
              class="head-status"
            >
              {{ INVOICE_META.status }}
            </DzBadge>
          </div>
        </header>

        <DzDivider class="sheet-rule" />

        <!-- Parties + details -->
        <section class="parties">
          <div class="party">
            <DzText size="xs" weight="semibold" tone="muted" as="div" class="party-label">
              From
            </DzText>
            <DzText weight="medium" as="div">{{ ISSUER.name }}</DzText>
            <address class="party-lines">
              <span v-for="line in ISSUER.lines" :key="line">{{ line }}</span>
              <span>{{ ISSUER.email }}</span>
              <span>{{ ISSUER.refLabel }} {{ ISSUER.ref }}</span>
            </address>
          </div>

          <div class="party">
            <DzText size="xs" weight="semibold" tone="muted" as="div" class="party-label">
              Bill to
            </DzText>
            <DzText weight="medium" as="div">{{ CLIENT.name }}</DzText>
            <address class="party-lines">
              <span v-for="line in CLIENT.lines" :key="line">{{ line }}</span>
              <span>{{ CLIENT.email }}</span>
              <span>{{ CLIENT.refLabel }} {{ CLIENT.ref }}</span>
            </address>
          </div>

          <DzDescriptions
            :columns="1"
            layout="horizontal"
            size="sm"
            class="party-facts"
          >
            <DzDescriptionsItem label="Invoice no.">{{ INVOICE_META.number }}</DzDescriptionsItem>
            <DzDescriptionsItem label="Issued">{{ formatDate(INVOICE_META.issued) }}</DzDescriptionsItem>
            <DzDescriptionsItem label="Due">{{ formatDate(INVOICE_META.due) }}</DzDescriptionsItem>
            <DzDescriptionsItem label="Amount due">
              <span class="facts-due">{{ money.format(total) }}</span>
            </DzDescriptionsItem>
          </DzDescriptions>
        </section>

        <!-- Line items -->
        <div class="lines">
          <DzTable aria-label="Invoice line items">
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header>Description</DzTableCell>
                <DzTableCell header align="right">Qty</DzTableCell>
                <DzTableCell header align="right">Unit price</DzTableCell>
                <DzTableCell header align="right">Amount</DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow v-for="item in LINE_ITEMS" :key="item.id">
                <DzTableCell>
                  <DzText size="sm" weight="medium" as="div">{{ item.description }}</DzText>
                  <DzText size="xs" tone="muted" as="div">{{ item.detail }}</DzText>
                </DzTableCell>
                <DzTableCell align="right">
                  <span class="num">{{ item.qty }}</span>
                </DzTableCell>
                <DzTableCell align="right">
                  <span class="num">{{ money.format(item.unitPrice) }}</span>
                </DzTableCell>
                <DzTableCell align="right">
                  <span class="num num--strong">{{ money.format(amountOf(item.qty, item.unitPrice)) }}</span>
                </DzTableCell>
              </DzTableRow>
            </DzTableBody>
          </DzTable>
        </div>

        <!-- Totals -->
        <div class="totals-shell">
          <dl class="totals">
            <div class="total-row">
              <dt>Subtotal</dt>
              <dd>{{ money.format(subtotal) }}</dd>
            </div>
            <div class="total-row">
              <dt>Discount ({{ Math.round(DISCOUNT_RATE * 100) }}%)</dt>
              <dd>−{{ money.format(discount) }}</dd>
            </div>
            <div class="total-row">
              <dt>VAT ({{ Math.round(TAX_RATE * 100) }}%)</dt>
              <dd>{{ money.format(tax) }}</dd>
            </div>
            <DzDivider class="totals-rule" />
            <div class="total-row total-row--grand">
              <dt>Total due</dt>
              <dd>{{ money.format(total) }}</dd>
            </div>
          </dl>
        </div>

        <DzDivider class="sheet-rule" />

        <!-- Notes -->
        <section class="notes">
          <DzText size="xs" weight="semibold" tone="muted" as="div" class="party-label">Notes</DzText>
          <DzText size="sm" tone="muted" as="p">{{ NOTES }}</DzText>
        </section>

        <footer class="sheet-foot">
          <DzText size="xs" tone="muted">
            {{ ISSUER.name }} · {{ ISSUER.email }} · {{ ISSUER.refLabel }} {{ ISSUER.ref }}
          </DzText>
        </footer>
      </DzCard>
    </main>
  </div>
</template>

<style scoped>
.inv {
  min-height: 100vh;
  width: 100%;
  background: var(--dz-muted);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  padding: clamp(16px, 4vw, 48px);
}

.inv-wrap {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Action bar ────────────────────────────────────────────────── */
.inv-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.inv-actions-end {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── Sheet ─────────────────────────────────────────────────────── */
.sheet {
  background: var(--dz-surface);
}

.sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.issuer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: none;
  border-radius: var(--dz-radius-lg);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.head-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.inv-word {
  letter-spacing: -0.02em;
  line-height: 1;
}

.head-status {
  margin-top: 4px;
}

.sheet-rule {
  margin: 22px 0;
}

/* ── Parties ───────────────────────────────────────────────────── */
.parties {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: clamp(16px, 3vw, 28px);
  align-items: start;
}

.party-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.party-lines {
  display: flex;
  flex-direction: column;
  font-style: normal;
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
  line-height: 1.55;
  margin-top: 2px;
}

.party-facts {
  justify-self: end;
  width: 100%;
}

.facts-due {
  font-weight: var(--dz-font-semibold);
  color: var(--dz-foreground);
}

/* ── Line items ────────────────────────────────────────────────── */
.lines {
  margin-top: clamp(20px, 4vw, 32px);
  overflow-x: auto;
}

.num {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.num--strong {
  font-weight: var(--dz-font-semibold);
}

/* ── Totals ────────────────────────────────────────────────────── */
.totals-shell {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.totals {
  width: min(320px, 100%);
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
  font-variant-numeric: tabular-nums;
}

.totals-rule {
  margin: 6px 0 14px;
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

/* ── Notes + footer ────────────────────────────────────────────── */
.notes {
  line-height: 1.5;
}

.sheet-foot {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--dz-border);
  text-align: center;
}

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .parties {
    grid-template-columns: 1fr;
  }
  .party-facts {
    justify-self: stretch;
  }
}

/* ── Print ─────────────────────────────────────────────────────── */
@media print {
  .inv {
    background: var(--dz-surface);
    padding: 0;
  }
  .no-print {
    display: none !important;
  }
  .sheet {
    border: none;
  }
}
</style>
