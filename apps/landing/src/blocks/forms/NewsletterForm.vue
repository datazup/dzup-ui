<script setup lang="ts">
import { DzButton, DzCheckbox, DzHeading, DzInput, DzText } from '@dzup-ui/core'
import { CheckCircle2, Mail, Sparkles } from 'lucide-vue-next'
import { computed, ref } from 'vue'

/**
 * Newsletter form — a focused single-field subscribe card.
 *
 * A gradient accent panel over a DzInput (with a Mail icon prefix slot) and a
 * primary submit, a small consent DzCheckbox, and a success state that swaps in
 * once the (locally validated) email is submitted. Composed only from free
 * `@dzup-ui/core` components and `--dz-*` tokens, so it drops in already themed.
 *
 * Inputs family: DzInput. Forms family: DzCheckbox.
 *
 * Heading level: `:level="4"` nests cleanly under BlockPreview's H3.
 */

const email = ref('')
const consent = ref(false)
const submitted = ref(false)
const touched = ref(false)

const emailValid = computed(() => /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email.value.trim()))
const showError = computed(() => touched.value && !emailValid.value)

function subscribe() {
  touched.value = true
  if (!emailValid.value || !consent.value)
    return
  submitted.value = true
}
</script>

<template>
  <section class="nl-wrap" aria-labelledby="nl-title">
    <div class="nl-card">
      <div class="nl-glow" aria-hidden="true" />

      <!-- Success state -->
      <div v-if="submitted" class="nl-success">
        <span class="nl-success-icon" aria-hidden="true">
          <CheckCircle2 :size="28" />
        </span>
        <DzHeading :level="4" size="lg" weight="semibold" align="center">
          You're on the list
        </DzHeading>
        <DzText tone="muted" size="sm" align="center" as="p">
          We sent a confirmation to <strong>{{ email }}</strong>. Check your inbox to finish subscribing.
        </DzText>
      </div>

      <!-- Form state -->
      <template v-else>
        <span class="nl-eyebrow">
          <Sparkles :size="14" aria-hidden="true" />
          Weekly digest
        </span>
        <DzHeading id="nl-title" :level="4" size="xl" weight="semibold">
          Stay in the loop
        </DzHeading>
        <DzText tone="muted" size="sm" as="p" class="nl-lede">
          Product updates, design tips and the occasional changelog — one email a week, no noise.
        </DzText>

        <form class="nl-form" novalidate @submit.prevent="subscribe">
          <div class="nl-row">
            <DzInput
              v-model="email"
              type="email"
              class="nl-input"
              placeholder="you@company.com"
              autocomplete="email"
              :invalid="showError"
              aria-label="Email address"
              @blur="touched = true"
            >
              <template #prefix>
                <Mail :size="16" aria-hidden="true" />
              </template>
            </DzInput>
            <DzButton type="submit" variant="solid" tone="primary" class="nl-submit">
              Subscribe
            </DzButton>
          </div>

          <DzText v-if="showError" size="xs" tone="danger" as="p" class="nl-err">
            Enter a valid email address.
          </DzText>

          <DzCheckbox v-model="consent" size="sm" class="nl-consent">
            I agree to receive emails and accept the privacy policy.
          </DzCheckbox>
        </form>
      </template>
    </div>
  </section>
</template>

<style scoped>
.nl-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.nl-card {
  position: relative;
  width: 100%;
  max-width: 30rem;
  padding: clamp(1.5rem, 4vw, 2.25rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #fff);
  box-shadow: var(--dz-shadow-sm, 0 1px 2px rgb(0 0 0 / 0.06));
  overflow: hidden;
}

/* Soft token-tinted glow in the corner — pure decoration. */
.nl-glow {
  position: absolute;
  inset: -40% 30% auto -10%;
  height: 14rem;
  background: radial-gradient(
    circle at 30% 30%,
    color-mix(in oklch, var(--dz-primary, #6366f1) 22%, transparent),
    transparent 70%
  );
  pointer-events: none;
}

.nl-eyebrow {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-1, 0.375rem);
  margin-bottom: var(--dz-space-3, 0.75rem);
  padding: 0.25rem 0.625rem;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-primary, #4f46e5);
  background: var(--dz-primary-muted, #eef2ff);
}

.nl-lede {
  position: relative;
  margin: var(--dz-space-2, 0.5rem) 0 var(--dz-space-5, 1.25rem);
  line-height: 1.6;
  max-width: 40ch;
}

.nl-form {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.nl-row {
  display: flex;
  gap: var(--dz-space-2, 0.5rem);
}

.nl-input {
  flex: 1;
  min-width: 0;
}

.nl-submit {
  flex-shrink: 0;
}

.nl-err {
  margin: 0;
}

.nl-consent {
  margin-top: var(--dz-space-1, 0.25rem);
}

.nl-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-4, 1rem) 0;
  text-align: center;
}

.nl-success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: var(--dz-space-1, 0.25rem);
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-success, #16a34a);
  background: color-mix(in oklch, var(--dz-success, #16a34a) 14%, transparent);
}

@media (max-width: 420px) {
  .nl-row {
    flex-direction: column;
  }

  .nl-submit {
    width: 100%;
  }
}
</style>
