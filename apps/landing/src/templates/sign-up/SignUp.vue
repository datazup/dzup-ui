<script setup lang="ts">
/**
 * Sign Up — featured reference template (docs/templates.md §6.1).
 *
 * A chromeless, split-screen register page mirroring the shipped Sign In: a
 * marketing aside on wide screens collapses away on mobile, beside a DzCard with
 * name + email DzInputs, a DzPasswordInput wired to a live DzProgress strength
 * meter, a terms DzCheckbox, the primary DzButton, a labelled DzDivider and
 * social providers. Built only from free `@dzup-ui/core` components, token-styled,
 * light + dark, 390px → up.
 */
import {
  DzButton,
  DzCard,
  DzCheckbox,
  DzDivider,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzPasswordInput,
  DzProgress,
  DzText,
} from '@dzup-ui/core'
import { Boxes, Check, Github } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { PERKS, scorePassword, SOCIAL_PROOF, STRENGTH_LEVELS } from './data.ts'

const name = ref('Ava Kessler')
const email = ref('ava@northwind.io')
const password = ref('')
const agreed = ref(false)

/** 0–4 strength score derived live from the password field. */
const strengthScore = computed(() => scorePassword(password.value))

/**
 * The matching strength rung (label + tone), strongest first. The final rung has
 * `min: 0`, so a match is guaranteed for any 0–4 score (hence the assertion).
 */
const strength = computed(() => STRENGTH_LEVELS.find(level => strengthScore.value >= level.min)!)

/** Meter fill 0–100, leaving a visible sliver even at the lowest score. */
const strengthValue = computed(() => Math.max(8, (strengthScore.value / 4) * 100))
</script>

<template>
  <div class="auth-page">
    <!-- Marketing aside (decorative; hidden on mobile). -->
    <aside class="auth-aside" aria-hidden="true">
      <div class="aside-inner">
        <span class="brand brand--invert">
          <span class="brand-mark"><Boxes :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>

        <div class="aside-lead">
          <p class="aside-quote">
            Start building with Northwind today.
          </p>
          <p class="aside-sub">
            Join 12,000+ teams shipping faster with one connected workspace.
          </p>
        </div>

        <div class="aside-proof">
          <ul class="proof-avatars">
            <li v-for="initials in SOCIAL_PROOF" :key="initials">
              {{ initials }}
            </li>
          </ul>
          <span class="proof-label">Loved by teams at every stage</span>
        </div>

        <ul class="aside-list">
          <li v-for="perk in PERKS" :key="perk.title">
            <span class="perk-tick"><Check :size="14" /></span>
            <span class="perk-text">
              <span class="perk-title">{{ perk.title }}</span>
              <span class="perk-detail">{{ perk.detail }}</span>
            </span>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Form column. -->
    <main class="auth-main">
      <div class="auth-form-wrap">
        <span class="brand auth-brand">
          <span class="brand-mark"><Boxes :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>

        <header class="auth-head">
          <DzHeading :level="1" size="2xl" weight="semibold">
            Create your account
          </DzHeading>
          <DzText tone="muted" as="p">
            Free for 14 days. No credit card required.
          </DzText>
        </header>

        <DzCard variant="elevated" padding="lg" class="auth-card">
          <form class="auth-form" @submit.prevent>
            <DzFormField>
              <DzFormLabel>Full name</DzFormLabel>
              <DzInput
                v-model="name"
                type="text"
                placeholder="Jane Doe"
                autocomplete="name"
              />
            </DzFormField>

            <DzFormField>
              <DzFormLabel>Work email</DzFormLabel>
              <DzInput
                v-model="email"
                type="email"
                placeholder="you@company.com"
                autocomplete="email"
              />
            </DzFormField>

            <DzFormField>
              <DzFormLabel>Password</DzFormLabel>
              <DzPasswordInput
                v-model="password"
                placeholder="At least 8 characters"
                autocomplete="new-password"
              />
              <div class="strength" :hidden="!password">
                <DzProgress
                  :value="strengthValue"
                  :tone="strength.tone"
                  size="xs"
                  class="strength-bar"
                  :aria-label="`Password strength: ${strength.label}`"
                />
                <DzText size="xs" :tone="strength.tone === 'success' ? 'success' : 'muted'" as="span">
                  {{ strength.label }}
                </DzText>
              </div>
            </DzFormField>

            <DzCheckbox v-model="agreed">
              <span class="terms">
                I agree to the <a class="link" href="#">Terms</a> and
                <a class="link" href="#">Privacy Policy</a>.
              </span>
            </DzCheckbox>

            <DzButton
              type="submit"
              variant="solid"
              tone="primary"
              class="auth-submit"
              :disabled="!agreed"
            >
              Create account
            </DzButton>

            <div class="or-divider" role="separator" aria-label="or sign up with">
              <DzDivider decorative class="or-line" />
              <DzText size="xs" tone="muted" class="or-text">
                or sign up with
              </DzText>
              <DzDivider decorative class="or-line" />
            </div>

            <div class="social-row">
              <DzButton variant="outline" tone="neutral" class="social-btn">
                <template #prefix>
                  <Github :size="16" aria-hidden="true" />
                </template>
                GitHub
              </DzButton>
              <DzButton variant="outline" tone="neutral" class="social-btn">
                <template #prefix>
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12 11v2.8h4a3.8 3.8 0 0 1-1.6 2.5l2.5 2A7.6 7.6 0 0 0 19.6 12c0-.5 0-1-.1-1.4z"
                    />
                    <path
                      fill="currentColor"
                      d="M6.5 14.3 4 16.3A8 8 0 0 0 19 12h-7v2.8h4A4.8 4.8 0 0 1 6.5 14.3z"
                      opacity=".7"
                    />
                  </svg>
                </template>
                Google
              </DzButton>
            </div>
          </form>
        </DzCard>

        <DzText size="sm" tone="muted" class="auth-foot">
          Already have an account?
          <a class="link" href="#">Sign in</a>
        </DzText>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  width: 100%;
  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

/* ── Marketing aside ───────────────────────────────────────────── */
.auth-aside {
  position: relative;
  display: flex;
  align-items: center;
  padding: clamp(32px, 5vw, 72px);
  background:
    radial-gradient(circle at 82% 12%, color-mix(in oklch, var(--dz-primary) 34%, transparent), transparent 56%),
    var(--dz-primary);
  color: var(--dz-primary-foreground);
  overflow: hidden;
}

.aside-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 40ch;
}

.aside-lead {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.aside-quote {
  margin: 0;
  font-size: var(--dz-text-3xl);
  line-height: 1.25;
  font-weight: var(--dz-font-semibold);
  letter-spacing: -0.02em;
}

.aside-sub {
  margin: 0;
  font-size: var(--dz-text-base);
  line-height: 1.5;
  opacity: 0.86;
}

.aside-proof {
  display: flex;
  align-items: center;
  gap: 14px;
}

.proof-avatars {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.proof-avatars li {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-left: -8px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-primary-foreground) 22%, var(--dz-primary));
  border: 2px solid var(--dz-primary);
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-semibold);
}

.proof-avatars li:first-child {
  margin-left: 0;
}

.proof-label {
  font-size: var(--dz-text-sm);
  opacity: 0.84;
}

.aside-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.aside-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.perk-tick {
  display: grid;
  place-items: center;
  flex: none;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-primary-foreground) 20%, transparent);
}

.perk-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.perk-title {
  font-weight: var(--dz-font-semibold);
}

.perk-detail {
  font-size: var(--dz-text-sm);
  opacity: 0.82;
  line-height: 1.45;
}

/* ── Form column ──────────────────────────────────────────────── */
.auth-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 4vw, 56px);
}

.auth-form-wrap {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.brand--invert .brand-mark {
  background: var(--dz-primary-foreground);
  color: var(--dz-primary);
}

.auth-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-card {
  width: 100%;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.strength[hidden] {
  display: none;
}

.strength-bar {
  flex: 1;
}

.terms {
  font-size: var(--dz-text-sm);
  line-height: 1.4;
}

.link {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  color: var(--dz-primary);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.auth-submit {
  width: 100%;
  margin-top: 2px;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.or-line {
  flex: 1;
}

.or-text {
  white-space: nowrap;
}

.social-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.social-btn {
  width: 100%;
}

.auth-foot {
  text-align: center;
}

@media (max-width: 860px) {
  .auth-page {
    grid-template-columns: 1fr;
  }
  .auth-aside {
    display: none;
  }
}
</style>
