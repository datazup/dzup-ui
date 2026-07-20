<script setup lang="ts">
/**
 * OTP / 2FA Verify — Auth template (docs/templates.md §6.1).
 *
 * A chromeless, centered card: a brand lockup, an explanatory DzText + DzAlert, a
 * six-box DzOtpInput, a DzCountdown resend timer that re-enables a "Resend code"
 * DzButton when it elapses, and verify / back actions. Entering the demo code
 * (123456) flips the card to a success state; a wrong code shows a danger DzAlert.
 * Built only from free `@dzup-ui/core` components, token-styled, light + dark,
 * reflows cleanly 390px → up.
 */
import { DzAlert, DzButton, DzCard, DzCountdown, DzHeading, DzOtpInput, DzText } from '@dzup-ui/core'
import { ArrowLeft, Boxes, CheckCircle2, ShieldCheck } from 'lucide-vue-next'
import { computed, ref } from 'vue'

/** Demo code that "verifies" — purely illustrative for the static template. */
const VALID_CODE = '123456'

const code = ref('')
const status = ref<'idle' | 'error' | 'success'>('idle')

/** Resend timer: 30s expressed in ms for DzCountdown's duration mode. */
const RESEND_MS = 30_000
const canResend = ref(false)
/** Bumping this remounts the DzCountdown so it restarts cleanly on resend. */
const resendKey = ref(0)

const verifyDisabled = computed(() => code.value.length < 6 || status.value === 'success')

function verify(): void {
  if (code.value.length < 6)
    return
  status.value = code.value === VALID_CODE ? 'success' : 'error'
}

function onComplete(value: string): void {
  code.value = value
  verify()
}

function clearError(): void {
  if (status.value === 'error')
    status.value = 'idle'
}

function resend(): void {
  if (!canResend.value)
    return
  canResend.value = false
  resendKey.value += 1
}
</script>

<template>
  <main class="otp-page">
    <div class="otp-wrap">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
        <span class="brand-name">Northwind</span>
      </span>

      <!-- Verification state. -->
      <DzCard v-if="status !== 'success'" variant="elevated" padding="lg" class="otp-card">
        <div class="otp-icon" aria-hidden="true">
          <ShieldCheck :size="22" />
        </div>

        <header class="otp-head">
          <DzHeading :level="1" size="xl" weight="semibold" align="center">
            Two-factor verification
          </DzHeading>
          <DzText tone="muted" as="p" align="center">
            Enter the 6-digit code from your authenticator app to finish signing in.
          </DzText>
        </header>

        <div class="otp-field">
          <DzOtpInput
            v-model="code"
            :length="6"
            type="number"
            :invalid="status === 'error'"
            aria-label="One-time verification code"
            @update:model-value="clearError"
            @complete="onComplete"
          />
        </div>

        <DzAlert
          v-if="status === 'error'"
          tone="danger"
          variant="subtle"
          class="otp-alert"
        >
          That code didn't match. Check your app and try again.
        </DzAlert>
        <DzAlert v-else tone="info" variant="subtle" class="otp-alert">
          Codes refresh every 30 seconds. Never share yours with anyone.
        </DzAlert>

        <DzButton
          variant="solid"
          tone="primary"
          class="otp-submit"
          :disabled="verifyDisabled"
          @click="verify"
        >
          Verify code
        </DzButton>

        <div class="otp-resend">
          <DzButton v-if="canResend" variant="text" tone="primary" size="sm" @click="resend">
            Resend code
          </DzButton>
          <DzText v-else size="sm" tone="muted" as="span" class="otp-resend-wait">
            Resend code in
            <DzCountdown
              :key="resendKey"
              :target="RESEND_MS"
              mode="duration"
              format="m:ss"
              size="sm"
              class="otp-timer"
              @finish="canResend = true"
            />
          </DzText>
        </div>
      </DzCard>

      <!-- Success state. -->
      <DzCard v-else variant="elevated" padding="lg" class="otp-card otp-card--center">
        <div class="otp-success-icon" aria-hidden="true">
          <CheckCircle2 :size="32" />
        </div>
        <DzHeading :level="1" size="xl" weight="semibold" align="center">
          You're verified
        </DzHeading>
        <DzText tone="muted" as="p" align="center" class="otp-success-text">
          Identity confirmed. Taking you to your workspace.
        </DzText>
        <DzButton variant="solid" tone="primary" class="otp-submit" href="#">
          Continue to dashboard
        </DzButton>
      </DzCard>

      <DzText size="sm" tone="muted" class="otp-foot">
        <a class="link link--row" href="#">
          <ArrowLeft :size="14" aria-hidden="true" /> Back to sign in
        </a>
      </DzText>
    </div>
  </main>
</template>

<style scoped>
.otp-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: clamp(24px, 5vw, 64px);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-primary) 9%, transparent), transparent 58%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.otp-wrap {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.otp-card {
  width: 100%;
}

.otp-card--center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.otp-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 18px;
  border-radius: var(--dz-radius-lg, 14px);
  background: color-mix(in oklch, var(--dz-primary) 12%, transparent);
  color: var(--dz-primary);
}

.otp-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 22px;
}

.otp-field {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.otp-alert {
  margin-bottom: 18px;
}

.otp-submit {
  width: 100%;
}

.otp-resend {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.otp-resend-wait {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.otp-timer {
  font-variant-numeric: tabular-nums;
}

.otp-success-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-success) 14%, transparent);
  color: var(--dz-success);
}

.otp-success-text {
  margin-bottom: 8px;
}

.otp-foot {
  text-align: center;
}

.link {
  font-weight: var(--dz-font-medium);
  color: var(--dz-primary);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.link--row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
