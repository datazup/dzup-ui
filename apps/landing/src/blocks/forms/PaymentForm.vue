<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzDivider,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzInputGroup,
  DzInputMask,
  DzSelect,
  DzText,
} from '@dzup-ui/core'
import type { DzSelectItem } from '@dzup-ui/core'
import { CreditCard, Lock, Tag } from 'lucide-vue-next'
import { computed, ref } from 'vue'

/**
 * Payment form — a checkout-style card-details panel.
 *
 * Showcases the masked / grouped inputs: DzInputMask formats the card number
 * ("9999 9999 9999 9999") and expiry ("99 / 99") as the user types, DzInput
 * handles the CVC, and a DzInputGroup pairs a promo DzInput with a Tag prefix
 * addon and an inline "Apply" suffix button. A small order summary and a
 * lock-icon submit close the card. Self-contained: local ref() state only.
 *
 * Inputs family: DzInput, DzInputMask, DzInputGroup.
 * Forms family: DzFormField, DzFormLabel, DzSelect.
 */

const cardName = ref('')
const cardNumber = ref('')
const expiry = ref('')
const cvc = ref('')
const country = ref('us')
const promo = ref('')
const promoApplied = ref(false)
const cardComplete = ref(false)

const COUNTRIES: DzSelectItem[] = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Germany', value: 'de' },
  { label: 'Bosnia and Herzegovina', value: 'ba' },
  { label: 'Japan', value: 'jp' },
]

const total = computed(() => (promoApplied.value ? '$39.00' : '$49.00'))

function applyPromo() {
  if (promo.value.trim() !== '') promoApplied.value = true
}
</script>

<template>
  <section class="pf-wrap" aria-labelledby="pf-title">
    <DzCard variant="elevated" padding="lg" class="pf-card">
      <header class="pf-head">
        <div>
          <DzHeading id="pf-title" :level="4" size="xl" weight="semibold">
            Payment details
          </DzHeading>
          <DzText tone="muted" size="sm" as="p">Pro plan · billed monthly</DzText>
        </div>
        <div class="pf-total">
          <DzText size="xs" tone="muted" as="div">Due today</DzText>
          <DzText size="xl" weight="bold" as="div" class="pf-total-amt">{{ total }}</DzText>
        </div>
      </header>

      <DzDivider decorative class="pf-rule" />

      <form class="pf-form" novalidate @submit.prevent>
        <DzFormField required>
          <DzFormLabel>Name on card</DzFormLabel>
          <DzInput v-model="cardName" placeholder="Jane Doe" autocomplete="cc-name" />
        </DzFormField>

        <DzFormField required>
          <DzFormLabel>Card number</DzFormLabel>
          <DzInputMask
            v-model="cardNumber"
            mask="9999 9999 9999 9999"
            placeholder="1234 5678 9012 3456"
            aria-label="Card number"
            @complete="cardComplete = true"
          >
            <template #prefix>
              <CreditCard :size="16" aria-hidden="true" />
            </template>
          </DzInputMask>
        </DzFormField>

        <div class="pf-grid">
          <DzFormField required>
            <DzFormLabel>Expiry</DzFormLabel>
            <DzInputMask
              v-model="expiry"
              mask="99 / 99"
              placeholder="MM / YY"
              aria-label="Expiry date"
            />
          </DzFormField>
          <DzFormField required>
            <DzFormLabel>CVC</DzFormLabel>
            <DzInput
              v-model="cvc"
              inputmode="numeric"
              :maxlength="4"
              placeholder="123"
              autocomplete="cc-csc"
            />
          </DzFormField>
        </div>

        <DzFormField required>
          <DzFormLabel>Billing country</DzFormLabel>
          <DzSelect
            v-model="country"
            :items="COUNTRIES"
            searchable
            search-placeholder="Search countries…"
            aria-label="Billing country"
          />
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Promo code</DzFormLabel>
          <DzInputGroup>
            <template #prefix>
              <Tag :size="15" aria-hidden="true" />
            </template>
            <DzInput v-model="promo" placeholder="WELCOME20" aria-label="Promo code" />
            <template #suffix>
              <DzButton
                variant="ghost"
                tone="primary"
                size="sm"
                :disabled="promoApplied"
                @click="applyPromo"
              >
                {{ promoApplied ? 'Applied' : 'Apply' }}
              </DzButton>
            </template>
          </DzInputGroup>
        </DzFormField>

        <DzButton type="submit" variant="solid" tone="primary" class="pf-submit">
          <template #prefix>
            <Lock :size="16" aria-hidden="true" />
          </template>
          Pay {{ total }}
        </DzButton>

        <DzText size="xs" tone="muted" align="center" as="p" class="pf-secure">
          Payments are encrypted and securely processed.
        </DzText>
      </form>
    </DzCard>
  </section>
</template>

<style scoped>
.pf-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.pf-card {
  width: 100%;
  max-width: 30rem;
}

.pf-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-4, 1rem);
}

.pf-total {
  text-align: right;
  flex-shrink: 0;
}

.pf-total-amt {
  line-height: 1.1;
  color: var(--dz-foreground, #111827);
}

.pf-rule {
  margin: var(--dz-space-4, 1rem) 0;
}

.pf-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.pf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-4, 1rem);
}

.pf-submit {
  width: 100%;
  margin-top: var(--dz-space-1, 0.25rem);
}

.pf-secure {
  margin: 0;
}
</style>
