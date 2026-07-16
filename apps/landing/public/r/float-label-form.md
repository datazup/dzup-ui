# Float-label contact form

A compact, modern contact variant — each control wrapped in a DzFloatLabel (notched "on" variant) whose label rests in-field and floats onto the border on focus/fill.

- **Category:** Forms & Inputs
- **Components:** DzCard, DzFloatLabel, DzInput, DzSelect, DzTextarea, DzButton, DzHeading, DzText
- **Preview:** /blocks/float-label-form

```vue
<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzFloatLabel,
  DzHeading,
  DzInput,
  DzSelect,
  DzText,
  DzTextarea,
} from '@dzup-ui/core'
import type { DzSelectItem } from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Float-label form — a compact, modern contact variant.
 *
 * Each control is wrapped in a DzFloatLabel (notched "on" variant): the label
 * rests inside the field and floats onto the border when focused or filled.
 * Native inputs auto-detect their filled state; the non-native DzSelect is told
 * via `:filled`. Local ref() state only.
 *
 * Forms family: DzFloatLabel, DzSelect. Inputs family: DzInput, DzTextarea.
 */

const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')

const SUBJECTS: DzSelectItem[] = [
  { label: 'Sales enquiry', value: 'sales' },
  { label: 'Support', value: 'support' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Other', value: 'other' },
]
</script>

<template>
  <section class="fl-wrap" aria-labelledby="fl-title">
    <DzCard variant="elevated" padding="lg" class="fl-card">
      <header class="fl-head">
        <DzHeading id="fl-title" :level="4" size="xl" weight="semibold">
          Say hello
        </DzHeading>
        <DzText tone="muted" size="sm" as="p">
          A cleaner, label-in-field take on the classic contact form.
        </DzText>
      </header>

      <form class="fl-form" @submit.prevent>
        <div class="fl-grid">
          <DzFloatLabel label="Full name" variant="on">
            <DzInput v-model="name" autocomplete="name" />
          </DzFloatLabel>
          <DzFloatLabel label="Email" variant="on">
            <DzInput v-model="email" type="email" autocomplete="email" />
          </DzFloatLabel>
        </div>

        <DzFloatLabel label="Subject" variant="on" :filled="!!subject">
          <DzSelect v-model="subject" :items="SUBJECTS" aria-label="Subject" />
        </DzFloatLabel>

        <DzFloatLabel label="Message" variant="on">
          <DzTextarea v-model="message" :rows="4" auto-resize />
        </DzFloatLabel>

        <DzButton type="submit" variant="solid" tone="primary" class="fl-submit">
          Send message
        </DzButton>
      </form>
    </DzCard>
  </section>
</template>

<style scoped>
.fl-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.fl-card {
  width: 100%;
  max-width: 32rem;
}

.fl-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.fl-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-5, 1.25rem);
}

.fl-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-4, 1rem);
}

.fl-submit {
  width: 100%;
}

@media (max-width: 480px) {
  .fl-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```
