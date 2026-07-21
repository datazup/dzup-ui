<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzCheckbox,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzPasswordInput,
  DzProgress,
  DzText,
} from '@dzup-ui/core'
import { computed, ref } from 'vue'

/**
 * Sign-up card — centered registration form with password strength meter.
 *
 * Full name, email, password (with a DzProgress bar reflecting computed
 * strength), a terms-of-service checkbox, and a primary submit button.
 * Password strength is derived purely from ref state — no runtime dep beyond
 * Vue reactivity. Composed only from free `@dzup-ui/core` components and
 * `--dz-*` tokens; light/dark-ready.
 *
 * Heading level: `:level="4"` so it nests under BlockPreview's H3.
 */

const name = ref('')
const email = ref('')
const password = ref('')
const terms = ref(false)

/**
 * Compute a simple 0–100 strength score from the password ref.
 * Each check adds 25 points: length ≥8, uppercase, number, symbol.
 */
const passwordStrength = computed<number>(() => {
  const p = password.value
  if (!p)
    return 0
  let score = 0
  if (p.length >= 8)
    score += 25
  if (/[A-Z]/.test(p))
    score += 25
  if (/\d/.test(p))
    score += 25
  if (/[^A-Z0-9]/i.test(p))
    score += 25
  return score
})

const strengthTone = computed(() => {
  const s = passwordStrength.value
  if (s <= 25)
    return 'danger' as const
  if (s <= 50)
    return 'warning' as const
  if (s <= 75)
    return 'info' as const
  return 'success' as const
})

const strengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s === 0)
    return ''
  if (s <= 25)
    return 'Weak'
  if (s <= 50)
    return 'Fair'
  if (s <= 75)
    return 'Good'
  return 'Strong'
})
</script>

<template>
  <section class="su-wrap" aria-labelledby="su-title">
    <DzCard variant="elevated" padding="lg" class="su-card">
      <div class="su-head">
        <DzHeading id="su-title" :level="4" size="xl" weight="semibold" align="center">
          Create your account
        </DzHeading>
        <DzText tone="muted" align="center" size="sm" as="p">
          Free forever. No credit card required.
        </DzText>
      </div>

      <form class="su-form" @submit.prevent>
        <DzFormField>
          <DzFormLabel>Full name</DzFormLabel>
          <DzInput
            v-model="name"
            type="text"
            placeholder="Ada Lovelace"
            autocomplete="name"
          />
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Email</DzFormLabel>
          <DzInput
            v-model="email"
            type="email"
            placeholder="ada@company.com"
            autocomplete="email"
          />
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Password</DzFormLabel>
          <DzPasswordInput
            v-model="password"
            placeholder="Create a password"
            autocomplete="new-password"
          />

          <!-- Strength meter — only visible once the user has started typing -->
          <div v-if="password.length > 0" class="su-strength" aria-live="polite">
            <DzProgress
              :value="passwordStrength"
              :max="100"
              variant="bar"
              size="xs"
              :tone="strengthTone"
              aria-label="Password strength"
            />
            <DzText size="xs" :tone="strengthTone === 'danger' ? 'default' : 'muted'" as="span" class="su-strength-label">
              {{ strengthLabel }}
            </DzText>
          </div>
        </DzFormField>

        <DzCheckbox v-model="terms">
          I agree to the
          <a class="su-link" href="#">Terms of Service</a>
          and
          <a class="su-link" href="#">Privacy Policy</a>
        </DzCheckbox>

        <DzButton type="submit" variant="solid" tone="primary" class="su-submit">
          Create account
        </DzButton>
      </form>

      <DzText size="sm" tone="muted" align="center" as="p" class="su-foot">
        Already have an account?
        <a class="su-link" href="#">Sign in</a>
      </DzText>
    </DzCard>
  </section>
</template>

<style scoped>
.su-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.su-card {
  width: 100%;
  max-width: 26rem;
}

.su-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.su-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.su-strength {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-2, 0.5rem);
}

.su-strength > :first-child {
  flex: 1;
}

.su-strength-label {
  min-width: 3.5rem;
  text-align: right;
}

.su-submit {
  width: 100%;
  margin-top: var(--dz-space-1, 0.25rem);
}

.su-link {
  font-size: inherit;
  font-weight: var(--dz-font-medium, 500);
  color: var(--dz-primary, #6366f1);
  text-decoration: none;
}

.su-link:hover {
  text-decoration: underline;
}

.su-foot {
  margin-top: var(--dz-space-4, 1rem);
}
</style>
