<script setup lang="ts">
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDivider,
  DzHeading,
  DzText,
} from '@dzup-ui/core'
import { Check } from 'lucide-vue-next'

/**
 * PricingThree — three-tier pricing (Free / Pro / Enterprise) in a
 * responsive 3 → 1 column grid.
 *
 * The Pro tier is highlighted with an `outlined` card variant and a
 * DzBadge "Most popular" chip so it stands out without a raw color.
 * Feature rows use the lucide Check icon — no DzIcon wrapper required
 * because lucide-vue-next components accept a `size` / `stroke-width`
 * prop directly and carry no extra runtime overhead.
 *
 * Heading level: section title at :level="4" (BlockPreview uses H3),
 * card names at :level="5" so the outline hierarchy is preserved.
 */

interface PricingTier {
  id: string
  name: string
  price: string
  period: string
  description: string
  cta: string
  popular: boolean
  features: string[]
}

const tiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to get started and explore the platform.',
    cta: 'Start for free',
    popular: false,
    features: [
      'Up to 3 projects',
      '5 GB storage',
      'Community support',
      'Core components',
      'Light / dark theme',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'Advanced features for individuals and growing teams.',
    cta: 'Start free trial',
    popular: true,
    features: [
      'Unlimited projects',
      '100 GB storage',
      'Priority email support',
      'All components + Pro',
      'Custom theme tokens',
      'Analytics dashboard',
      'API access',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'billed annually',
    description: 'Tailored solutions, SLAs, and dedicated support for large organisations.',
    cta: 'Contact sales',
    popular: false,
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'Dedicated support & SLA',
      'SSO / SAML',
      'Audit logs',
      'Custom contracts',
      'On-premise option',
    ],
  },
]
</script>

<template>
  <section class="pricing-three" aria-labelledby="pricing-three-title">
    <!-- Section header ----------------------------------------------------->
    <div class="pt-header">
      <DzBadge variant="subtle" tone="primary" size="sm">Pricing</DzBadge>
      <DzHeading id="pricing-three-title" :level="4" size="2xl" weight="bold" align="center" class="pt-title">
        Simple, transparent pricing
      </DzHeading>
      <DzText size="md" tone="muted" align="center" class="pt-subtitle">
        Start free — upgrade when your team is ready. No hidden fees.
      </DzText>
    </div>

    <!-- Cards grid: a real <ul>/<li> so the set carries list semantics. DzCard
         sets `inheritAttrs: false` and forwards only data/a11y/aria attrs, so a
         `role="listitem"` passed to it would be dropped — native <li> is robust. -->
    <ul class="pt-grid">
      <li
        v-for="tier in tiers"
        :key="tier.id"
        class="pt-grid-item"
        :class="{ 'pt-grid-item--popular': tier.popular }"
      >
        <!-- No aria-label on the card: its root is a generic <div>, where naming
             is prohibited (axe aria-prohibited-attr). The tier-name heading below
             is the card's accessible label, and the <li> carries the list slot. -->
        <DzCard
          :variant="tier.popular ? 'outlined' : 'elevated'"
          padding="lg"
          class="pt-card"
          :class="{ 'pt-card--popular': tier.popular }"
        >
        <!-- Card header ---->
        <div class="pt-card-head">
          <div class="pt-name-row">
            <DzHeading :level="5" size="lg" weight="semibold">{{ tier.name }}</DzHeading>
            <DzBadge
              v-if="tier.popular"
              variant="solid"
              tone="primary"
              size="xs"
              aria-label="Most popular plan"
            >
              Most popular
            </DzBadge>
          </div>

          <DzText size="sm" tone="muted" class="pt-desc">{{ tier.description }}</DzText>

          <div class="pt-price-row" aria-label="Price">
            <DzHeading :level="6" size="3xl" weight="bold" class="pt-price">
              {{ tier.price }}
            </DzHeading>
            <DzText size="sm" tone="muted" class="pt-period">/ {{ tier.period }}</DzText>
          </div>
        </div>

        <DzDivider decorative class="pt-divider" />

        <!-- Feature list ---->
        <ul class="pt-features" :aria-label="`${tier.name} plan features`">
          <li
            v-for="feature in tier.features"
            :key="feature"
            class="pt-feature"
          >
            <Check
              :size="16"
              class="pt-check"
              aria-hidden="true"
            />
            <DzText size="sm">{{ feature }}</DzText>
          </li>
        </ul>

        <!-- CTA ---->
        <DzButton
          :variant="tier.popular ? 'solid' : 'outline'"
          :tone="tier.popular ? 'primary' : 'neutral'"
          size="md"
          class="pt-cta"
        >
          {{ tier.cta }}
        </DzButton>
        </DzCard>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.pricing-three {
  padding: clamp(2.5rem, 6vw, 4rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

/* Section header ---------------------------------------------------------*/
.pt-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: clamp(2rem, 4vw, 3rem);
  text-align: center;
}

.pt-title {
  margin: 0;
}

.pt-subtitle {
  margin: 0;
  max-width: 38rem;
}

/* Cards grid -------------------------------------------------------------*/
.pt-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--dz-space-5, 1.25rem);
  max-width: 64rem;
  margin: 0 auto;
  padding: 0;
  align-items: start;
}

.pt-grid-item {
  display: flex;
}

.pt-grid-item > .pt-card {
  width: 100%;
}

/* Popular card lifts slightly and gets a coloured ring ------------------*/
.pt-card--popular {
  position: relative;
  /* Ring is the DzCard outlined border; visual lift via box-shadow token */
  box-shadow:
    0 0 0 2px var(--dz-primary, #6366f1),
    var(--dz-shadow-md, 0 4px 16px rgb(0 0 0 / 0.08));
  transform: translateY(-4px);
}

/* Card internals ---------------------------------------------------------*/
.pt-card-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  margin-bottom: var(--dz-space-4, 1rem);
}

.pt-name-row {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.pt-desc {
  margin: 0;
  line-height: 1.5;
}

.pt-price-row {
  display: flex;
  align-items: baseline;
  gap: var(--dz-space-1, 0.25rem);
  margin-top: var(--dz-space-2, 0.5rem);
}

.pt-price {
  margin: 0;
  line-height: 1;
}

.pt-period {
  margin: 0;
}

.pt-divider {
  margin: var(--dz-space-3, 0.75rem) 0;
}

/* Feature list -----------------------------------------------------------*/
.pt-features {
  list-style: none;
  margin: 0 0 var(--dz-space-5, 1.25rem);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.pt-feature {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.pt-check {
  flex-shrink: 0;
  color: var(--dz-success, #22c55e);
}

/* CTA button fills the card width ----------------------------------------*/
.pt-cta {
  width: 100%;
}

/* Responsive: 2 cols on tablet, 1 col on mobile --------------------------*/
@media (max-width: 900px) {
  .pt-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* The grid cell is the <li> now, so the span lives there; the card keeps its
     own visual treatment but stops lifting once it spans the full row. */
  .pt-grid-item--popular {
    grid-column: 1 / -1;
  }

  .pt-grid-item--popular > .pt-card--popular {
    transform: none;
  }
}

@media (max-width: 560px) {
  .pt-grid {
    grid-template-columns: 1fr;
  }

  .pt-grid-item--popular {
    grid-column: auto;
  }
}
</style>
