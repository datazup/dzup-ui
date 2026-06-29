# Multi-step form wizard

Three-step onboarding wizard with stepper nav, per-step form fields, Back/Continue buttons, and a completion state.

- **Category:** Auth & Forms
- **Components:** DzStepper, DzStepperItem, DzFormField, DzFormLabel, DzInput, DzButton, DzHeading, DzText
- **Preview:** /blocks#wizard

```vue
<script setup lang="ts">
import {
  DzButton,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzStepper,
  DzStepperItem,
  DzText,
} from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Multi-step form wizard — 3-step onboarding flow.
 *
 * DzStepper (v-model, 0-based) drives which step body is visible.
 * Each step uses DzFormField + DzInput for input capture; Back and Next
 * DzButtons navigate between steps; the final step shows a completion state.
 * Local refs hold per-step field values — no router, no props.
 *
 * Heading level: `:level="4"` nests under BlockPreview's H3 title.
 * The step body headings use `:level="5"` to preserve the document outline.
 */

const currentStep = ref(0)
const TOTAL_STEPS = 3

// Step 1 — Account
const email = ref('')
const password = ref('')

// Step 2 — Profile
const firstName = ref('')
const lastName = ref('')
const jobTitle = ref('')

// Step 3 — Confirmation (read-only summary, no additional inputs)

function next() {
  if (currentStep.value < TOTAL_STEPS - 1) currentStep.value++
}

function back() {
  if (currentStep.value > 0) currentStep.value--
}
</script>

<template>
  <section class="wz-wrap" aria-labelledby="wz-title">
    <div class="wz-inner">
      <DzHeading id="wz-title" :level="4" size="lg" weight="semibold" align="center" class="wz-title">
        Get started
      </DzHeading>

      <!-- Stepper nav — v-model keeps it in sync with currentStep ref -->
      <DzStepper
        v-model="currentStep"
        orientation="horizontal"
        aria-label="Registration steps"
        class="wz-stepper"
      >
        <DzStepperItem title="Account" description="Login credentials" />
        <DzStepperItem title="Profile" description="Personal details" />
        <DzStepperItem title="Done" description="All set!" />
      </DzStepper>

      <!-- Step bodies -->
      <div class="wz-body">
        <!-- Step 0: Account -->
        <div v-if="currentStep === 0" class="wz-step" role="group" aria-labelledby="wz-step0-title">
          <DzHeading id="wz-step0-title" :level="5" size="md" weight="semibold" class="wz-step-heading">
            Create your login
          </DzHeading>
          <DzText tone="muted" size="sm" as="p" class="wz-step-desc">
            You'll use these credentials every time you sign in.
          </DzText>

          <div class="wz-fields">
            <DzFormField>
              <DzFormLabel>Email address</DzFormLabel>
              <DzInput
                v-model="email"
                type="email"
                placeholder="you@company.com"
                autocomplete="email"
              />
            </DzFormField>

            <DzFormField>
              <DzFormLabel>Password</DzFormLabel>
              <DzInput
                v-model="password"
                type="password"
                placeholder="Min. 8 characters"
                autocomplete="new-password"
              />
            </DzFormField>
          </div>
        </div>

        <!-- Step 1: Profile -->
        <div v-else-if="currentStep === 1" class="wz-step" role="group" aria-labelledby="wz-step1-title">
          <DzHeading id="wz-step1-title" :level="5" size="md" weight="semibold" class="wz-step-heading">
            Tell us about yourself
          </DzHeading>
          <DzText tone="muted" size="sm" as="p" class="wz-step-desc">
            Your name and role help us personalise your experience.
          </DzText>

          <div class="wz-fields">
            <div class="wz-name-row">
              <DzFormField class="wz-name-field">
                <DzFormLabel>First name</DzFormLabel>
                <DzInput
                  v-model="firstName"
                  type="text"
                  placeholder="Ada"
                  autocomplete="given-name"
                />
              </DzFormField>

              <DzFormField class="wz-name-field">
                <DzFormLabel>Last name</DzFormLabel>
                <DzInput
                  v-model="lastName"
                  type="text"
                  placeholder="Lovelace"
                  autocomplete="family-name"
                />
              </DzFormField>
            </div>

            <DzFormField>
              <DzFormLabel>Job title</DzFormLabel>
              <DzInput
                v-model="jobTitle"
                type="text"
                placeholder="e.g. Product Engineer"
                autocomplete="organization-title"
              />
            </DzFormField>
          </div>
        </div>

        <!-- Step 2: Done -->
        <div v-else class="wz-step wz-step--done" role="group" aria-labelledby="wz-step2-title">
          <div class="wz-done-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="24" fill="color-mix(in oklch, var(--dz-primary, #6366f1) 12%, transparent)" />
              <path d="M14 24.5l7 7 13-14" stroke="var(--dz-primary, #6366f1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>

          <DzHeading id="wz-step2-title" :level="5" size="lg" weight="semibold" align="center">
            You're all set!
          </DzHeading>
          <DzText tone="muted" size="sm" align="center" as="p">
            Your account has been created.
            <br />
            Welcome, {{ firstName || 'there' }}.
          </DzText>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="wz-nav" :class="{ 'wz-nav--end': currentStep === 0 }">
        <DzButton
          v-if="currentStep > 0 && currentStep < TOTAL_STEPS - 1"
          variant="outline"
          tone="neutral"
          @click="back"
        >
          Back
        </DzButton>

        <DzButton
          v-if="currentStep < TOTAL_STEPS - 1"
          variant="solid"
          tone="primary"
          class="wz-next"
          @click="next"
        >
          {{ currentStep === TOTAL_STEPS - 2 ? 'Finish' : 'Continue' }}
        </DzButton>

        <DzButton
          v-if="currentStep === TOTAL_STEPS - 1"
          variant="solid"
          tone="primary"
          class="wz-next"
          @click="currentStep = 0"
        >
          Start over
        </DzButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wz-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  background: var(--dz-background, #fff);
  min-height: 100%;
}

.wz-inner {
  width: 100%;
  max-width: 36rem;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-6, 1.5rem);
}

.wz-title {
  margin: 0;
}

.wz-stepper {
  width: 100%;
}

/* ── Step body ───────────────────────────────────────────────────────── */
.wz-body {
  background: var(--dz-surface, var(--dz-background, #fff));
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.75rem);
  padding: var(--dz-space-6, 1.5rem);
  min-height: 14rem;
}

.wz-step {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.wz-step-heading {
  margin: 0;
}

.wz-step-desc {
  margin: 0;
}

.wz-fields {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.wz-name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-3, 0.75rem);
}

.wz-name-field {
  min-width: 0;
}

/* ── Done state ──────────────────────────────────────────────────────── */
.wz-step--done {
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--dz-space-3, 0.75rem);
  padding-top: var(--dz-space-4, 1rem);
}

.wz-done-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Navigation ──────────────────────────────────────────────────────── */
.wz-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.wz-nav--end {
  justify-content: flex-end;
}

.wz-next {
  margin-left: auto;
}

@media (max-width: 480px) {
  .wz-name-row {
    grid-template-columns: 1fr;
  }
}
</style>
```
