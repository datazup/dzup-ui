# Feedback survey

A rating + survey card built from the scale controls — a half-step star DzRating, a frequency radio group, a 0–10 recommend slider with a live read-out, and a comments textarea.

- **Category:** Forms & Inputs
- **Components:** DzCard, DzRating, DzRadioGroup, DzRadio, DzSlider, DzTextarea, DzFormField, DzFormLabel, DzButton, DzHeading, DzText
- **Preview:** /blocks/feedback-form

```vue
<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzRadio,
  DzRadioGroup,
  DzRating,
  DzSlider,
  DzText,
  DzTextarea,
} from '@dzup-ui/core'
import { computed, ref } from 'vue'

/**
 * Feedback form — a rating + survey card built from the scale controls.
 *
 * Brings together the "value" form controls: DzRating for an overall star
 * score (v-model:value), a DzRadioGroup of frequency options, a DzSlider for a
 * 0–10 recommend score with a live read-out, and a DzTextarea for comments.
 * Self-contained: local ref() state only.
 *
 * Forms family: DzRating, DzRadioGroup, DzRadio, DzSlider, DzFormField,
 * DzFormLabel. Inputs family: DzTextarea.
 */

const rating = ref(0)
const frequency = ref('weekly')
const recommend = ref(8)
const comments = ref('')
const sent = ref(false)

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
const ratingLabel = computed(() => RATING_LABELS[Math.round(rating.value)] ?? '')

function submit() {
  sent.value = true
}
</script>

<template>
  <section class="fb-wrap" aria-labelledby="fb-title">
    <DzCard variant="elevated" padding="lg" class="fb-card">
      <header class="fb-head">
        <DzHeading id="fb-title" :level="4" size="xl" weight="semibold">
          Share your feedback
        </DzHeading>
        <DzText tone="muted" size="sm" as="p">
          A few quick questions — it takes less than a minute.
        </DzText>
      </header>

      <form class="fb-form" @submit.prevent="submit">
        <DzFormField>
          <DzFormLabel>Overall rating</DzFormLabel>
          <div class="fb-rating-row">
            <DzRating v-model:value="rating" allow-half aria-label="Overall rating" />
            <DzText v-if="ratingLabel" size="sm" tone="muted" as="span">{{ ratingLabel }}</DzText>
          </div>
        </DzFormField>

        <DzFormField>
          <DzFormLabel>How often do you use the product?</DzFormLabel>
          <DzRadioGroup v-model="frequency" orientation="vertical" aria-label="Usage frequency">
            <DzRadio value="daily">Every day</DzRadio>
            <DzRadio value="weekly">A few times a week</DzRadio>
            <DzRadio value="monthly">A few times a month</DzRadio>
            <DzRadio value="rarely">Rarely</DzRadio>
          </DzRadioGroup>
        </DzFormField>

        <DzFormField>
          <div class="fb-label-row">
            <DzFormLabel>How likely are you to recommend us?</DzFormLabel>
            <span class="fb-score">{{ recommend }}/10</span>
          </div>
          <DzSlider
            v-model="recommend"
            :min="0"
            :max="10"
            :step="1"
            tone="primary"
            aria-label="Likelihood to recommend"
          />
          <div class="fb-scale">
            <DzText size="xs" tone="muted" as="span">Not likely</DzText>
            <DzText size="xs" tone="muted" as="span">Very likely</DzText>
          </div>
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Anything else?</DzFormLabel>
          <DzTextarea
            v-model="comments"
            :rows="3"
            auto-resize
            placeholder="Tell us what's working well or what we could improve…"
          />
        </DzFormField>

        <div class="fb-actions">
          <DzText v-if="sent" size="sm" tone="success" as="span">
            Thanks for the feedback!
          </DzText>
          <DzButton type="submit" variant="solid" tone="primary" class="fb-submit">
            Submit feedback
          </DzButton>
        </div>
      </form>
    </DzCard>
  </section>
</template>

<style scoped>
.fb-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.fb-card {
  width: 100%;
  max-width: 32rem;
}

.fb-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.fb-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-5, 1.25rem);
}

.fb-rating-row {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.fb-label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.fb-score {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dz-primary, #4f46e5);
}

.fb-scale {
  display: flex;
  justify-content: space-between;
  margin-top: var(--dz-space-1, 0.25rem);
}

.fb-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--dz-space-3, 0.75rem);
}

@media (max-width: 480px) {
  .fb-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .fb-submit {
    width: 100%;
  }
}
</style>
```
