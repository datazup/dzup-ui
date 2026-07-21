# Contact form

A labeled "get in touch" card: two-column name/email row, topic select, message textarea with a live character counter, and consent — with inline email validation via DzFormMessage.

- **Category:** Forms & Inputs
- **Components:** DzCard, DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzInput, DzSelect, DzTextarea, DzCheckbox, DzButton, DzHeading, DzText
- **Preview:** /blocks/contact-form

```vue
<script setup lang="ts">
import type { DzSelectItem } from '@dzup-ui/core'
import {
  DzButton,
  DzCard,
  DzCheckbox,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzHeading,
  DzInput,
  DzSelect,
  DzText,
  DzTextarea,
} from '@dzup-ui/core'
import { computed, ref } from 'vue'

/**
 * Contact form — a labeled, validated "get in touch" card.
 *
 * A DzCard wrapping DzFormField groups: a two-column name/email row, a topic
 * DzSelect, a DzTextarea message with a live character counter, and a consent
 * DzCheckbox. The email field demonstrates inline validation via DzFormField's
 * `:error` + DzFormMessage (the message renders in danger tone with role=alert
 * when invalid). Self-contained: local ref() state only.
 *
 * Inputs family: DzInput, DzTextarea.
 * Forms family: DzFormField, DzFormLabel, DzFormDescription, DzFormMessage,
 * DzSelect, DzCheckbox.
 */

const name = ref('')
const email = ref('')
const topic = ref('')
const message = ref('')
const consent = ref(false)
const submitted = ref(false)

const MAX = 500

const TOPICS: DzSelectItem[] = [
  { label: 'General enquiry', value: 'general' },
  { label: 'Sales & pricing', value: 'sales' },
  { label: 'Technical support', value: 'support' },
  { label: 'Partnerships', value: 'partnerships' },
  { label: 'Something else', value: 'other' },
]

const emailError = computed(() => {
  if (!submitted.value || email.value.trim() === '')
    return undefined
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email.value.trim())
    ? undefined
    : 'Enter a valid email address.'
})

function submit() {
  submitted.value = true
}
</script>

<template>
  <section class="cf-wrap" aria-labelledby="cf-title">
    <DzCard variant="elevated" padding="lg" class="cf-card">
      <header class="cf-head">
        <DzHeading id="cf-title" :level="4" size="xl" weight="semibold">
          Get in touch
        </DzHeading>
        <DzText tone="muted" size="sm" as="p">
          Tell us a little about what you need — we usually reply within a business day.
        </DzText>
      </header>

      <form class="cf-form" novalidate @submit.prevent="submit">
        <div class="cf-grid">
          <DzFormField required>
            <DzFormLabel>Full name</DzFormLabel>
            <DzInput v-model="name" placeholder="Jane Doe" autocomplete="name" />
          </DzFormField>

          <DzFormField required :error="emailError">
            <DzFormLabel>Email</DzFormLabel>
            <DzInput
              v-model="email"
              type="email"
              placeholder="jane@company.com"
              autocomplete="email"
              :invalid="!!emailError"
            />
            <DzFormMessage>We'll only use this to reply.</DzFormMessage>
          </DzFormField>
        </div>

        <DzFormField required>
          <DzFormLabel>How can we help?</DzFormLabel>
          <DzSelect
            v-model="topic"
            :items="TOPICS"
            placeholder="Choose a topic"
            aria-label="How can we help?"
          />
        </DzFormField>

        <DzFormField required>
          <DzFormLabel>Message</DzFormLabel>
          <DzTextarea
            v-model="message"
            :rows="4"
            :maxlength="MAX"
            auto-resize
            placeholder="Share as much detail as you'd like…"
          />
          <DzFormDescription>
            <span class="cf-counter">{{ message.length }} / {{ MAX }}</span>
          </DzFormDescription>
        </DzFormField>

        <DzCheckbox v-model="consent" size="sm">
          I agree to be contacted about my enquiry.
        </DzCheckbox>

        <div class="cf-actions">
          <DzText v-if="submitted && consent" size="sm" tone="success" as="span">
            Thanks — your message is on its way.
          </DzText>
          <DzButton type="submit" variant="solid" tone="primary" class="cf-submit">
            Send message
          </DzButton>
        </div>
      </form>
    </DzCard>
  </section>
</template>

<style scoped>
.cf-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.cf-card {
  width: 100%;
  max-width: 34rem;
}

.cf-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.cf-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.cf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-4, 1rem);
}

.cf-counter {
  font-variant-numeric: tabular-nums;
}

.cf-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--dz-space-3, 0.75rem);
  margin-top: var(--dz-space-1, 0.25rem);
}

@media (max-width: 540px) {
  .cf-grid {
    grid-template-columns: 1fr;
  }

  .cf-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .cf-submit {
    width: 100%;
  }
}
</style>
```
