<script setup lang="ts">
/**
 * Forgot / Reset Password — Auth template (docs/templates.md §6.1).
 *
 * A chromeless, centered card carrying two states in one page: the request form
 * (email + "Send reset link") and a sent confirmation (a DzResult "check your
 * inbox" with a DzAlert spam-folder note and resend). A back-to-sign-in link is
 * always present. Submitting the form flips to the confirmation client-side.
 * Built only from free `@dzup-ui/core` components, token-styled, light + dark,
 * reflows cleanly 390px → up.
 */
import { DzAlert, DzButton, DzCard, DzFormField, DzFormLabel, DzHeading, DzInput, DzResult, DzText } from '@dzup-ui/core'
import { ArrowLeft, Boxes, KeyRound, MailCheck } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const email = ref('ava@northwind.io')
const sent = ref(false)

/** Mask the local part for the confirmation copy: "a••@northwind.io". */
const maskedEmail = computed(() => {
  const [local, domain] = email.value.split('@')
  if (!domain || !local)
    return email.value
  const head = local.slice(0, 1)
  return `${head}${'•'.repeat(Math.max(2, local.length - 1))}@${domain}`
})

function submit(): void {
  if (!email.value.includes('@'))
    return
  sent.value = true
}

function resend(): void {
  // In a real app this would re-trigger the email; here it just re-affirms state.
  sent.value = true
}
</script>

<template>
  <main class="rp-page">
    <div class="rp-wrap">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
        <span class="brand-name">Northwind</span>
      </span>

      <!-- State 1: request a reset link. -->
      <DzCard v-if="!sent" variant="elevated" padding="lg" class="rp-card">
        <div class="rp-icon" aria-hidden="true">
          <KeyRound :size="22" />
        </div>

        <header class="rp-head">
          <DzHeading :level="1" size="xl" weight="semibold" align="center">
            Forgot your password?
          </DzHeading>
          <DzText tone="muted" as="p" align="center">
            Enter the email tied to your account and we'll send a link to reset it.
          </DzText>
        </header>

        <form class="rp-form" @submit.prevent="submit">
          <DzFormField>
            <DzFormLabel>Email address</DzFormLabel>
            <DzInput
              v-model="email"
              type="email"
              placeholder="you@company.com"
              autocomplete="email"
            />
          </DzFormField>

          <DzButton type="submit" variant="solid" tone="primary" class="rp-submit">
            Send reset link
          </DzButton>
        </form>
      </DzCard>

      <!-- State 2: confirmation. -->
      <DzCard v-else variant="elevated" padding="lg" class="rp-card">
        <DzResult
          status="success"
          title="Check your inbox"
          :description="`We sent a password-reset link to ${maskedEmail}. It expires in 30 minutes.`"
        >
          <template #icon>
            <span class="rp-result-icon"><MailCheck :size="28" /></span>
          </template>
          <template #actions>
            <DzButton variant="solid" tone="primary" href="#">
              Open email app
            </DzButton>
            <DzButton variant="outline" tone="neutral" @click="resend">
              Resend link
            </DzButton>
          </template>
        </DzResult>

        <DzAlert tone="info" variant="subtle" class="rp-alert">
          Didn't get it? Check your spam folder, or
          <a class="link" href="#" @click.prevent="sent = false">try a different email</a>.
        </DzAlert>
      </DzCard>

      <DzText size="sm" tone="muted" class="rp-foot">
        <a class="link link--row" href="#">
          <ArrowLeft :size="14" aria-hidden="true" /> Back to sign in
        </a>
      </DzText>
    </div>
  </main>
</template>

<style scoped>
.rp-page {
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

.rp-wrap {
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

.rp-card {
  width: 100%;
}

.rp-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 18px;
  border-radius: var(--dz-radius-lg, 14px);
  background: color-mix(in oklch, var(--dz-primary) 12%, transparent);
  color: var(--dz-primary);
}

.rp-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 22px;
}

.rp-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.rp-submit {
  width: 100%;
  margin-top: 2px;
}

.rp-result-icon {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-success) 14%, transparent);
  color: var(--dz-success);
}

.rp-alert {
  margin-top: 20px;
}

.rp-foot {
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
