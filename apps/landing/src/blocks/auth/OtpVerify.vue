<script setup lang="ts">
import { DzButton, DzHeading, DzOtpInput, DzText } from '@dzup-ui/core'
import { CheckCircle2, ShieldCheck } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * OTP verification — a one-time-code entry card.
 *
 * A DzOtpInput collects a 6-digit code; the Verify button enables once all
 * digits are filled, and `@complete` flips the card to a success state. A live
 * resend countdown (local timer) disables "Resend code" until it elapses.
 * Composed only from free `@dzup-ui/core` components and `--dz-*` tokens.
 *
 * Inputs family: DzOtpInput.
 *
 * Heading level: `:level="4"` nests cleanly under BlockPreview's H3.
 */

const LENGTH = 6
const code = ref('')
const verified = ref(false)
const seconds = ref(30)
let timer: ReturnType<typeof setInterval> | undefined

const canResend = computed(() => seconds.value === 0)
const canVerify = computed(() => code.value.length === LENGTH)

function tick() {
  if (seconds.value > 0)
    seconds.value -= 1
}

function resend() {
  if (!canResend.value)
    return
  seconds.value = 30
  code.value = ''
}

function verify() {
  if (canVerify.value)
    verified.value = true
}

onMounted(() => {
  timer = setInterval(tick, 1000)
})
onBeforeUnmount(() => {
  if (timer)
    clearInterval(timer)
})
</script>

<template>
  <section class="otp-wrap" aria-labelledby="otp-title">
    <div class="otp-card">
      <!-- Success state -->
      <div v-if="verified" class="otp-success">
        <span class="otp-success-icon" aria-hidden="true">
          <CheckCircle2 :size="30" />
        </span>
        <DzHeading :level="4" size="lg" weight="semibold" align="center">
          Verified
        </DzHeading>
        <DzText tone="muted" size="sm" align="center" as="p">
          Your email has been confirmed. You can close this window and continue.
        </DzText>
      </div>

      <!-- Entry state -->
      <template v-else>
        <span class="otp-badge" aria-hidden="true">
          <ShieldCheck :size="22" />
        </span>
        <DzHeading id="otp-title" :level="4" size="xl" weight="semibold" align="center">
          Verify your email
        </DzHeading>
        <DzText tone="muted" size="sm" align="center" as="p" class="otp-lede">
          Enter the {{ LENGTH }}-digit code we sent to <strong>jane@company.com</strong>.
        </DzText>

        <form class="otp-form" @submit.prevent="verify">
          <div class="otp-field">
            <DzOtpInput
              v-model="code"
              :length="LENGTH"
              type="number"
              aria-label="One-time verification code"
              @complete="verify"
            />
          </div>

          <DzButton
            type="submit"
            variant="solid"
            tone="primary"
            :disabled="!canVerify"
            class="otp-submit"
          >
            Verify
          </DzButton>

          <div class="otp-resend">
            <DzText size="sm" tone="muted" as="span">
              Didn't get a code?
            </DzText>
            <DzButton variant="text" tone="primary" size="sm" :disabled="!canResend" @click="resend">
              {{ canResend ? 'Resend code' : `Resend in ${seconds}s` }}
            </DzButton>
          </div>
        </form>
      </template>
    </div>
  </section>
</template>

<style scoped>
.otp-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.otp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 26rem;
  padding: clamp(1.5rem, 4vw, 2.25rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #fff);
  box-shadow: var(--dz-shadow-sm, 0 1px 2px rgb(0 0 0 / 0.06));
}

.otp-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-primary, #4f46e5);
  background: var(--dz-primary-muted, #eef2ff);
}

.otp-lede {
  margin: var(--dz-space-2, 0.5rem) 0 var(--dz-space-5, 1.25rem);
  max-width: 30ch;
}

.otp-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-4, 1rem);
  width: 100%;
}

.otp-field {
  display: flex;
  justify-content: center;
}

.otp-submit {
  width: 100%;
}

.otp-resend {
  display: flex;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
}

.otp-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-4, 1rem) 0;
}

.otp-success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: var(--dz-space-1, 0.25rem);
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-success, #16a34a);
  background: color-mix(in oklch, var(--dz-success, #16a34a) 14%, transparent);
}
</style>
