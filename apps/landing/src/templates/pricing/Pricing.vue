<script setup lang="ts">
import type { BillingCycle, MatrixCell, Plan } from './data.ts'
/**
 * Pricing Page — featured Marketing reference template (docs/templates.md §6.2).
 *
 * A chromeless conversion page: a sticky nav, a hero with a live monthly/annual
 * DzSegmented toggle that re-prices three plan DzCards (the recommended tier
 * flagged "Most popular" via DzBadge), a grouped feature-comparison DzTable with
 * DzTooltip explainers, an FAQ teaser and a closing CTA. Built only from free
 * `@dzup-ui/core` components, token-styled (no `lp-*`) and correct in light +
 * dark from 390px upward.
 *
 * The brand accent is re-skinned to violet entirely through `--dz-*` tokens — we
 * remap the whole `--dz-colors-primary-*` ramp to the violet spectrum, so every
 * Dz component re-tints and the remap resolves to the right shade in both themes
 * (light reads `…-500/600`, dark reads `…-400/300`). No raw colour anywhere.
 */
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDivider,
  DzHeading,
  DzSegmented,
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzText,
  DzTooltip,
  DzTooltipContent,
  DzTooltipTrigger,
} from '@dzup-ui/core'
import { ArrowRight, Boxes, Check, HelpCircle, Minus } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import {
  ANNUAL_DISCOUNT,
  BILLING_CYCLES,

  COMPARISON,

  PLANS,
  PRICING_FAQS,
} from './data.ts'

const cycle = ref<BillingCycle>('monthly')
const cycleItems = BILLING_CYCLES.map(c => ({ value: c.value, label: c.label }))

/** Effective per-month price for the active cycle, rounded to a whole dollar. */
function perMonth(monthly: number): number {
  if (cycle.value === 'annual')
    return Math.round(monthly * (1 - ANNUAL_DISCOUNT))
  return monthly
}

/** Large headline figure for a plan card ("$0", "$24" or "Custom"). */
function priceLabel(plan: Plan): string {
  if (plan.monthly === null)
    return 'Custom'
  return `$${perMonth(plan.monthly)}`
}

/** Sub-line under the price explaining the billing basis. */
function billingNote(plan: Plan): string {
  if (plan.monthly === null)
    return 'Tailored to your team'
  if (plan.monthly === 0)
    return 'Free forever'
  if (cycle.value === 'annual') {
    return `$${perMonth(plan.monthly) * 12} billed annually`
  }
  return 'Billed monthly'
}

const annualActive = computed(() => cycle.value === 'annual')

/** Per-plan column metadata, kept in PLANS order for the table header. */
const planColumns = computed(() => PLANS.map(p => ({ id: p.id, name: p.name, popular: !!p.popular })))

/** True when a matrix cell is a boolean include/exclude flag. */
function isFlag(cell: MatrixCell): cell is boolean {
  return typeof cell === 'boolean'
}
</script>

<template>
  <div class="pr">
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
          <span class="brand-name">Halcyon</span>
        </span>
        <nav class="nav-links" aria-label="Primary">
          <a href="#plans">Plans</a>
          <a href="#compare">Compare</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div class="nav-cta">
          <DzButton variant="ghost" tone="neutral" size="sm">
            Sign in
          </DzButton>
          <DzButton variant="solid" tone="primary" size="sm">
            Start free
          </DzButton>
        </div>
      </div>
    </header>

    <main>
      <!-- ── Hero + cycle toggle ──────────────────────────────── -->
      <section class="hero">
        <DzBadge variant="subtle" tone="primary" size="sm">
          Pricing
        </DzBadge>
        <h1 class="hero-title">
          Pricing that scales with your team
        </h1>
        <DzText size="lg" tone="muted" as="p" class="hero-lede">
          Start free, upgrade when you grow. Every plan includes the full editor,
          unlimited viewers and a 14-day trial of Pro — no credit card required.
        </DzText>

        <div class="cycle">
          <DzSegmented
            v-model="cycle"
            :items="cycleItems"
            size="md"
            aria-label="Billing cycle"
          />
          <DzText
            v-if="annualActive"
            size="sm"
            tone="success"
            as="span"
            class="cycle-save"
          >
            You're saving 20% with annual billing
          </DzText>
          <DzText v-else size="sm" tone="muted" as="span" class="cycle-save">
            Switch to annual to save 20%
          </DzText>
        </div>
      </section>

      <!-- ── Plan cards ───────────────────────────────────────── -->
      <section id="plans" class="plans" aria-label="Plans">
        <DzCard
          v-for="plan in PLANS"
          :key="plan.id"
          :variant="plan.popular ? 'elevated' : 'outlined'"
          padding="lg"
          class="plan"
          :class="{ 'plan--popular': plan.popular }"
        >
          <div class="plan-head">
            <DzHeading :level="2" size="md" weight="semibold">
              {{ plan.name }}
            </DzHeading>
            <DzBadge v-if="plan.popular" variant="solid" tone="primary" size="sm">
              Most popular
            </DzBadge>
          </div>
          <DzText size="sm" tone="muted" as="p" class="plan-blurb">
            {{ plan.blurb }}
          </DzText>

          <p class="price">
            <span class="price-amount">{{ priceLabel(plan) }}</span>
            <span v-if="plan.monthly !== null && plan.monthly > 0" class="price-period">
              / mo per seat
            </span>
          </p>
          <DzText size="sm" tone="muted" as="p" class="price-note">
            {{ billingNote(plan) }}
          </DzText>

          <DzButton
            :variant="plan.popular ? 'solid' : 'outline'"
            :tone="plan.popular ? 'primary' : 'neutral'"
            size="lg"
            class="plan-cta"
          >
            {{ plan.cta }}
            <template #suffix>
              <ArrowRight :size="17" aria-hidden="true" />
            </template>
          </DzButton>

          <DzDivider class="plan-rule" />

          <ul class="plan-feats">
            <li v-for="h in plan.highlights" :key="h">
              <Check :size="16" aria-hidden="true" /><span>{{ h }}</span>
            </li>
          </ul>
        </DzCard>
      </section>

      <!-- ── Comparison matrix ────────────────────────────────── -->
      <section id="compare" class="compare">
        <div class="section-head">
          <h2 class="section-title">
            Compare every plan
          </h2>
          <DzText size="lg" tone="muted" as="p">
            All the detail, side by side. Hover a
            <HelpCircle :size="15" class="inline-help" aria-hidden="true" /> for what it means.
          </DzText>
        </div>

        <div class="table-scroll">
          <DzTable class="compare-table">
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header class="feat-col">
                  Features
                </DzTableCell>
                <DzTableCell
                  v-for="col in planColumns"
                  :key="col.id"
                  header
                  align="center"
                  :class="{ 'col--popular': col.popular }"
                >
                  <span class="col-name">{{ col.name }}</span>
                  <DzBadge v-if="col.popular" variant="subtle" tone="primary" size="sm">
                    Popular
                  </DzBadge>
                </DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <template v-for="grp in COMPARISON" :key="grp.group">
                <DzTableRow class="group-row">
                  <DzTableCell :colspan="4">
                    <span class="group-label">{{ grp.group }}</span>
                  </DzTableCell>
                </DzTableRow>
                <DzTableRow v-for="row in grp.rows" :key="row.feature">
                  <DzTableCell class="feat-col">
                    <span class="feat-name">
                      {{ row.feature }}
                      <DzTooltip v-if="row.hint">
                        <DzTooltipTrigger>
                          <button type="button" class="hint" :aria-label="`What is ${row.feature}?`">
                            <HelpCircle :size="14" aria-hidden="true" />
                          </button>
                        </DzTooltipTrigger>
                        <DzTooltipContent side="top" class="hint-pop">
                          {{ row.hint }}
                        </DzTooltipContent>
                      </DzTooltip>
                    </span>
                  </DzTableCell>
                  <DzTableCell
                    v-for="col in planColumns"
                    :key="col.id"
                    align="center"
                    :class="{ 'col--popular': col.popular }"
                  >
                    <template v-if="isFlag(row.values[col.id])">
                      <Check
                        v-if="row.values[col.id]"
                        :size="17"
                        class="cell-yes"
                        aria-label="Included"
                      />
                      <Minus v-else :size="16" class="cell-no" aria-label="Not included" />
                    </template>
                    <span v-else class="cell-val">{{ row.values[col.id] }}</span>
                  </DzTableCell>
                </DzTableRow>
              </template>
            </DzTableBody>
          </DzTable>
        </div>
      </section>

      <!-- ── FAQ teaser ───────────────────────────────────────── -->
      <section id="faq" class="faq">
        <div class="section-head">
          <h2 class="section-title">
            Frequently asked
          </h2>
        </div>
        <ul class="faq-grid">
          <li v-for="f in PRICING_FAQS" :key="f.q">
            <DzHeading :level="3" size="sm" weight="semibold" class="faq-q">
              {{ f.q }}
            </DzHeading>
            <DzText size="sm" tone="muted" as="p">
              {{ f.a }}
            </DzText>
          </li>
        </ul>
      </section>

      <!-- ── Closing CTA ──────────────────────────────────────── -->
      <section class="cta">
        <div class="cta-inner">
          <h2 class="cta-title">
            Ready to ship faster?
          </h2>
          <DzText size="lg" as="p" class="cta-lede">
            Join 12,000+ teams building on Halcyon. Free to start, no card required.
          </DzText>
          <div class="cta-actions">
            <DzButton variant="solid" tone="neutral" size="lg">
              Start free
            </DzButton>
            <DzButton variant="outline" tone="neutral" size="lg">
              Talk to sales
            </DzButton>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="16" /></span>
        <span class="brand-name">Halcyon</span>
      </span>
      <DzText size="sm" tone="muted">
        © 2026 Halcyon, Inc. Pricing in USD.
      </DzText>
    </footer>
  </div>
</template>

<style scoped>
/* ── Violet re-skin (token-only) ──────────────────────────────────
   Alias the consumed `--dz-primary*` family (+ the focus ring, which reads the
   ramp directly) to the violet spectrum — the same approach the shipped emerald
   checkout / teal order-tracking pages use, redeclaring the variables components
   actually read so every Dz control re-tints. We mirror the token layer's own
   light→dark shade choices, so the skin stays correct when the preview flips
   `data-theme` (light below; the dark block follows). No raw colour. */
.pr {
  --dz-primary: var(--dz-colors-violet-500);
  --dz-primary-foreground: var(--dz-colors-violet-50);
  --dz-primary-hover: var(--dz-colors-violet-600);
  --dz-primary-active: var(--dz-colors-violet-700);
  --dz-primary-muted: var(--dz-colors-violet-100);
  --dz-primary-muted-foreground: var(--dz-colors-violet-700);
  --dz-primary-border: var(--dz-colors-violet-200);
  --dz-ring: var(--dz-colors-violet-500);

  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  min-height: 100vh;
}

/* Dark theme: track the token layer's dark primary mapping (lighter ramp steps
   on dark surfaces) so contrast holds — both for an explicit `data-theme="dark"`
   (the preview toggle / thumbnail shooter) and for the token layer's own
   prefers-dark fallback when no theme is pinned. */
[data-theme='dark'] .pr {
  --dz-primary: var(--dz-colors-violet-400);
  --dz-primary-foreground: var(--dz-colors-violet-950);
  --dz-primary-hover: var(--dz-colors-violet-300);
  --dz-primary-active: var(--dz-colors-violet-200);
  --dz-primary-muted: var(--dz-colors-violet-900);
  --dz-primary-muted-foreground: var(--dz-colors-violet-300);
  --dz-primary-border: var(--dz-colors-violet-800);
  --dz-ring: var(--dz-colors-violet-400);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .pr {
    --dz-primary: var(--dz-colors-violet-400);
    --dz-primary-foreground: var(--dz-colors-violet-950);
    --dz-primary-hover: var(--dz-colors-violet-300);
    --dz-primary-active: var(--dz-colors-violet-200);
    --dz-primary-muted: var(--dz-colors-violet-900);
    --dz-primary-muted-foreground: var(--dz-colors-violet-300);
    --dz-primary-border: var(--dz-colors-violet-800);
    --dz-ring: var(--dz-colors-violet-400);
  }
}

/* ── Nav ──────────────────────────────────────────────────────── */
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in oklch, var(--dz-background) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--dz-border);
}

.nav-inner,
.hero,
.plans,
.compare,
.faq,
.cta-inner,
.footer {
  max-width: 1080px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
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

.nav-links {
  display: flex;
  gap: 28px;
}

.nav-links a {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  color: var(--dz-muted-foreground);
  text-decoration: none;
}

.nav-links a:hover {
  color: var(--dz-foreground);
}

.nav-cta {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding-top: clamp(40px, 6vw, 80px);
  padding-bottom: clamp(28px, 4vw, 48px);
}

.hero-title {
  margin: 0;
  font-size: clamp(2rem, 4.4vw, 3.1rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
  font-weight: var(--dz-font-bold);
}

.hero-lede {
  margin: 0;
  line-height: 1.6;
  max-width: 56ch;
}

.cycle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.cycle-save {
  font-weight: var(--dz-font-medium);
  min-height: 1.2em;
}

/* ── Plan cards ───────────────────────────────────────────────── */
.plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  align-items: start;
  padding-top: 16px;
  padding-bottom: clamp(40px, 6vw, 72px);
}

.plan {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.plan--popular {
  outline: 1.5px solid var(--dz-primary);
  position: relative;
}

.plan-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.plan-blurb {
  min-height: 2.8em;
  margin: 0;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 10px 0 0;
}

.price-amount {
  font-size: var(--dz-text-4xl);
  font-weight: var(--dz-font-bold);
  letter-spacing: -0.02em;
  line-height: 1;
}

.price-period {
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
}

.price-note {
  margin: 0;
  min-height: 1.2em;
}

.plan-cta {
  width: 100%;
  margin-top: 14px;
}

.plan-rule {
  margin: 18px 0 4px;
}

.plan-feats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.plan-feats li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--dz-text-sm);
}

.plan-feats svg {
  color: var(--dz-primary);
  flex: none;
}

/* ── Shared section heads ─────────────────────────────────────── */
.section-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  margin-bottom: 32px;
}

.section-title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: var(--dz-font-semibold);
}

.inline-help {
  display: inline;
  vertical-align: -2px;
  color: var(--dz-muted-foreground);
}

/* ── Comparison matrix ────────────────────────────────────────── */
.compare {
  padding-top: clamp(16px, 3vw, 40px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.table-scroll {
  overflow-x: auto;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-xl);
}

.compare-table {
  min-width: 640px;
}

.feat-col {
  text-align: left;
  width: 40%;
}

.col-name {
  font-weight: var(--dz-font-semibold);
}

.col--popular {
  background: var(--dz-primary-muted);
}

.group-row td {
  background: var(--dz-muted);
}

.group-label {
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dz-muted-foreground);
}

.feat-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hint {
  display: inline-grid;
  place-items: center;
  padding: 2px;
  border: 0;
  background: none;
  color: var(--dz-muted-foreground);
  cursor: help;
  border-radius: var(--dz-radius-full);
}

.hint:hover {
  color: var(--dz-primary);
}

.hint:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 1px;
}

.hint-pop {
  max-width: 240px;
}

.cell-yes {
  color: var(--dz-success);
}

.cell-no {
  color: var(--dz-muted-foreground);
  opacity: 0.6;
}

.cell-val {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
}

/* ── FAQ ──────────────────────────────────────────────────────── */
.faq {
  padding-top: clamp(16px, 3vw, 40px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.faq-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px 40px;
  max-width: 880px;
  margin-inline: auto;
}

.faq-q {
  margin-bottom: 6px;
}

/* ── CTA ──────────────────────────────────────────────────────── */
.cta {
  padding: clamp(24px, 4vw, 48px) 24px;
}

.cta-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: clamp(40px, 6vw, 72px) clamp(24px, 5vw, 56px);
  border-radius: var(--dz-radius-2xl);
  background:
    radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--dz-primary) 36%, transparent), transparent 60%),
    var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.cta-title {
  margin: 0;
  font-size: clamp(1.6rem, 3.2vw, 2.4rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: var(--dz-font-bold);
}

.cta-lede {
  margin: 0;
  max-width: 48ch;
  opacity: 0.92;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}

/* ── Footer ───────────────────────────────────────────────────── */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 28px;
  padding-bottom: 28px;
  border-top: 1px solid var(--dz-border);
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 860px) {
  .plans {
    grid-template-columns: 1fr;
    max-width: 460px;
  }
  .nav-links {
    display: none;
  }
}

@media (max-width: 560px) {
  .faq-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
