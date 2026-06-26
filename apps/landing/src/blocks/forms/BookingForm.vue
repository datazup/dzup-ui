<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzDatePicker,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzNumberInput,
  DzSelect,
  DzText,
  DzTimePicker,
} from '@dzup-ui/core'
import type { DzSelectItem } from '@dzup-ui/core'
import { CalendarCheck, Users } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * Booking form — a restaurant reservation card.
 *
 * Brings together the date / time / number controls in one realistic flow:
 * a DzDatePicker for the day, a DzTimePicker (30-minute steps) for the slot, a
 * DzNumberInput for party size (clamped 1–12), and a DzSelect for seating
 * preference. Self-contained: local ref() state only.
 *
 * Forms family: DzDatePicker, DzTimePicker, DzSelect, DzFormField, DzFormLabel,
 * DzFormDescription. Inputs family: DzNumberInput.
 */

const date = ref('')
const time = ref('19:00')
const guests = ref<number | undefined>(2)
const seating = ref('indoor')

const SEATING: DzSelectItem[] = [
  { label: 'Indoor', value: 'indoor' },
  { label: 'Outdoor terrace', value: 'outdoor' },
  { label: 'Bar', value: 'bar' },
  { label: 'No preference', value: 'any' },
]
</script>

<template>
  <section class="bk-wrap" aria-labelledby="bk-title">
    <DzCard variant="elevated" padding="lg" class="bk-card">
      <header class="bk-head">
        <span class="bk-badge" aria-hidden="true">
          <CalendarCheck :size="20" />
        </span>
        <div>
          <DzHeading id="bk-title" :level="4" size="xl" weight="semibold">
            Reserve a table
          </DzHeading>
          <DzText tone="muted" size="sm" as="p">Book in a few seconds — confirmation is instant.</DzText>
        </div>
      </header>

      <form class="bk-form" @submit.prevent>
        <DzFormField required>
          <DzFormLabel>Date</DzFormLabel>
          <DzDatePicker v-model="date" placeholder="Pick a date" aria-label="Reservation date" />
        </DzFormField>

        <div class="bk-grid">
          <DzFormField required>
            <DzFormLabel>Time</DzFormLabel>
            <DzTimePicker
              v-model="time"
              :step="30"
              placeholder="Select time"
              aria-label="Reservation time"
            />
          </DzFormField>

          <DzFormField required>
            <DzFormLabel>Guests</DzFormLabel>
            <DzNumberInput v-model="guests" :min="1" :max="12" :step="1" aria-label="Number of guests">
              <template #prefix>
                <Users :size="15" aria-hidden="true" />
              </template>
            </DzNumberInput>
          </DzFormField>
        </div>

        <DzFormField>
          <DzFormLabel>Seating preference</DzFormLabel>
          <DzSelect v-model="seating" :items="SEATING" aria-label="Seating preference" />
          <DzFormDescription>We'll do our best to honour your request.</DzFormDescription>
        </DzFormField>

        <DzButton type="submit" variant="solid" tone="primary" class="bk-submit">
          Confirm reservation
        </DzButton>
      </form>
    </DzCard>
  </section>
</template>

<style scoped>
.bk-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.bk-card {
  width: 100%;
  max-width: 30rem;
}

.bk-head {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.bk-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: var(--dz-radius-lg, 0.75rem);
  color: var(--dz-primary, #4f46e5);
  background: var(--dz-primary-muted, #eef2ff);
}

.bk-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.bk-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-4, 1rem);
}

.bk-submit {
  width: 100%;
  margin-top: var(--dz-space-1, 0.25rem);
}

@media (max-width: 480px) {
  .bk-grid {
    grid-template-columns: 1fr;
  }
}
</style>
