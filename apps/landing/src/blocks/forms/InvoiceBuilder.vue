<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzDivider,
  DzFieldArray,
  DzHeading,
  DzIconButton,
  DzInplace,
  DzInput,
  DzNumberInput,
  DzText,
} from '@dzup-ui/core'
import { Plus, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'

/**
 * Invoice builder — a dynamic line-items editor.
 *
 * A DzInplace click-to-edit "Bill to" field sits above a DzFieldArray of
 * line-item rows (description + qty + rate), each removable, with an "Add line
 * item" action from the array's #append slot and a live total. Local ref()
 * state only.
 *
 * Forms family: DzFieldArray, DzInplace. Inputs family: DzInput, DzNumberInput.
 */

interface LineItem {
  description: string
  qty: number | undefined
  rate: number | undefined
}

const billTo = ref('Acme Corporation')

const items = ref<LineItem[]>([
  { description: 'Design system audit', qty: 1, rate: 1800 },
  { description: 'Component implementation', qty: 24, rate: 120 },
])

const total = computed(() =>
  items.value.reduce((sum, it) => sum + (it.qty ?? 0) * (it.rate ?? 0), 0),
)

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <section class="ib-wrap" aria-labelledby="ib-title">
    <DzCard variant="elevated" padding="lg" class="ib-card">
      <header class="ib-head">
        <DzHeading id="ib-title" :level="4" size="xl" weight="semibold">
          New invoice
        </DzHeading>
        <div class="ib-billto">
          <DzText size="sm" tone="muted" as="span">
            Bill to
          </DzText>
          <DzInplace v-model:value="billTo" save-on="both" aria-label="Bill to" class="ib-inplace">
            <template #display="{ value, activate }">
              <span class="ib-billto-name" @click="activate">{{ value }}</span>
            </template>
          </DzInplace>
        </div>
      </header>

      <!-- Column headings -->
      <div class="ib-row ib-row--head">
        <DzText size="xs" tone="muted" weight="medium" as="span">
          Description
        </DzText>
        <DzText size="xs" tone="muted" weight="medium" as="span" class="ib-col-num">
          Qty
        </DzText>
        <DzText size="xs" tone="muted" weight="medium" as="span" class="ib-col-num">
          Rate
        </DzText>
        <DzText size="xs" tone="muted" weight="medium" as="span" class="ib-col-num">
          Amount
        </DzText>
        <span class="ib-col-act" aria-hidden="true" />
      </div>

      <DzFieldArray v-model="items" :min="1">
        <template #default="{ field, index, remove, canRemove }">
          <div class="ib-row">
            <DzInput
              v-model="field.description"
              :placeholder="`Line ${index + 1} description`"
              :aria-label="`Line ${index + 1} description`"
            />
            <DzNumberInput
              v-model="field.qty"
              :min="0"
              class="ib-col-num"
              :aria-label="`Line ${index + 1} quantity`"
            />
            <DzNumberInput
              v-model="field.rate"
              :min="0"
              class="ib-col-num"
              :aria-label="`Line ${index + 1} rate`"
            />
            <span class="ib-amount ib-col-num">{{ money((field.qty ?? 0) * (field.rate ?? 0)) }}</span>
            <DzIconButton
              :icon="Trash2"
              aria-label="Remove line item"
              variant="ghost"
              tone="danger"
              size="sm"
              :disabled="!canRemove"
              class="ib-col-act"
              @click="remove"
            />
          </div>
        </template>

        <template #append="{ append }">
          <DzButton
            variant="outline"
            tone="neutral"
            size="sm"
            class="ib-add"
            @click="append({ description: '', qty: 1, rate: 0 })"
          >
            <template #prefix>
              <Plus :size="15" aria-hidden="true" />
            </template>
            Add line item
          </DzButton>
        </template>
      </DzFieldArray>

      <DzDivider decorative class="ib-rule" />

      <div class="ib-total">
        <DzText size="sm" tone="muted" as="span">
          Total due
        </DzText>
        <DzText size="xl" weight="bold" as="span" class="ib-total-amt">
          {{ money(total) }}
        </DzText>
      </div>

      <div class="ib-actions">
        <DzButton variant="ghost" tone="neutral">
          Save draft
        </DzButton>
        <DzButton variant="solid" tone="primary">
          Send invoice
        </DzButton>
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.ib-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.ib-card {
  width: 100%;
  max-width: 42rem;
}

.ib-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.ib-billto {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.ib-inplace {
  font-weight: 600;
}

.ib-billto-name {
  font-weight: 600;
  color: var(--dz-foreground, #111827);
}

.ib-row {
  display: grid;
  grid-template-columns: 1fr 5rem 6rem 6rem 2.25rem;
  gap: var(--dz-space-2, 0.5rem);
  align-items: center;
  margin-bottom: var(--dz-space-2, 0.5rem);
}

.ib-row--head {
  margin-bottom: var(--dz-space-2, 0.5rem);
  padding: 0 var(--dz-space-1, 0.25rem);
}

.ib-col-num {
  text-align: right;
}

.ib-amount {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dz-foreground, #111827);
}

.ib-col-act {
  display: inline-flex;
  justify-content: center;
}

.ib-add {
  margin-top: var(--dz-space-1, 0.25rem);
}

.ib-rule {
  margin: var(--dz-space-4, 1rem) 0;
}

.ib-total {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: var(--dz-space-3, 0.75rem);
}

.ib-total-amt {
  font-variant-numeric: tabular-nums;
  color: var(--dz-foreground, #111827);
}

.ib-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-5, 1.25rem);
}

@media (max-width: 560px) {
  .ib-row {
    grid-template-columns: 1fr 4rem 5rem;
    grid-template-areas:
      'desc desc desc'
      'qty rate amt';
  }

  .ib-row--head,
  .ib-col-act {
    display: none;
  }
}
</style>
