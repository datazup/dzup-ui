<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzHeading,
  DzInput,
  DzText,
} from '@dzup-ui/core'
import { ArrowLeft, Mail, MailCheck } from 'lucide-vue-next'
import { computed, ref } from 'vue'

/**
 * Forgot password — a two-state reset-request card.
 *
 * State one collects an email in a validated DzFormField (inline error via
 * DzFormMessage). On submit it swaps to a confirmation state with a "check your
 * inbox" message, a resend action, and a back-to-sign-in link. Self-contained:
 * local ref() state only.
 *
 * Inputs family: DzInput.
 * Forms family: DzFormField, DzFormLabel, DzFormMessage.
 */

const email = ref('')
const sent = ref(false)
const attempted = ref(false)

const emailError = computed(() => {
  if (!attempted.value)
    return undefined
  if (email.value.trim() === '')
    return 'Email is required.'
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email.value.trim())
    ? undefined
    : 'Enter a valid email address.'
})

function submit() {
  attempted.value = true
  if (!emailError.value)
    sent.value = true
}

function reset() {
  sent.value = false
  attempted.value = false
}
</script>

<template>
  <section class="fp-wrap" aria-labelledby="fp-title">
    <DzCard variant="elevated" padding="lg" class="fp-card">
      <!-- Confirmation state -->
      <div v-if="sent" class="fp-sent">
        <span class="fp-sent-icon" aria-hidden="true">
          <MailCheck :size="28" />
        </span>
        <DzHeading :level="4" size="lg" weight="semibold" align="center">
          Check your inbox
        </DzHeading>
        <DzText tone="muted" size="sm" align="center" as="p">
          If an account exists for <strong>{{ email }}</strong>, we've sent a link to reset your password.
        </DzText>
        <DzButton variant="outline" tone="neutral" class="fp-resend" @click="reset">
          Use a different email
        </DzButton>
        <a class="fp-back" href="#">
          <ArrowLeft :size="14" aria-hidden="true" />
          Back to sign in
        </a>
      </div>

      <!-- Request state -->
      <template v-else>
        <header class="fp-head">
          <DzHeading id="fp-title" :level="4" size="xl" weight="semibold">
            Reset your password
          </DzHeading>
          <DzText tone="muted" size="sm" as="p">
            Enter the email associated with your account and we'll send a reset link.
          </DzText>
        </header>

        <form class="fp-form" novalidate @submit.prevent="submit">
          <DzFormField required :error="emailError">
            <DzFormLabel>Email</DzFormLabel>
            <DzInput
              v-model="email"
              type="email"
              placeholder="you@company.com"
              autocomplete="email"
              :invalid="!!emailError"
            >
              <template #prefix>
                <Mail :size="16" aria-hidden="true" />
              </template>
            </DzInput>
            <DzFormMessage>We'll never share your email.</DzFormMessage>
          </DzFormField>

          <DzButton type="submit" variant="solid" tone="primary" class="fp-submit">
            Send reset link
          </DzButton>

          <a class="fp-back fp-back--center" href="#">
            <ArrowLeft :size="14" aria-hidden="true" />
            Back to sign in
          </a>
        </form>
      </template>
    </DzCard>
  </section>
</template>

<style scoped>
.fp-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.fp-card {
  width: 100%;
  max-width: 26rem;
}

.fp-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.fp-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.fp-submit {
  width: 100%;
}

.fp-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dz-space-1, 0.375rem);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: var(--dz-font-medium, 500);
  color: var(--dz-primary, #6366f1);
  text-decoration: none;
}

.fp-back:hover {
  text-decoration: underline;
}

.fp-back--center {
  margin: 0 auto;
}

.fp-sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  text-align: center;
  padding: var(--dz-space-2, 0.5rem) 0;
}

.fp-sent-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-primary, #4f46e5);
  background: var(--dz-primary-muted, #eef2ff);
}

.fp-resend {
  margin-top: var(--dz-space-1, 0.25rem);
}
</style>
