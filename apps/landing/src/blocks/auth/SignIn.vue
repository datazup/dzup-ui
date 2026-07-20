<script setup lang="ts">
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
  DzText,
} from '@dzup-ui/core'
import { Github } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * Sign-in card — centered, self-contained auth form.
 *
 * Email field, password field with visibility toggle, "remember me" checkbox,
 * a "Forgot password?" link, a primary submit, a labeled divider, and social
 * sign-in buttons (GitHub, Google). Composed only from free `@dzup-ui/core`
 * components and `--dz-*` tokens; drops into any themed app light/dark-ready.
 *
 * Heading level: `:level="4"` nests cleanly under BlockPreview's H3 while
 * `size="xl"` keeps the visual scale appropriate for a card header.
 */

const email = ref('')
const password = ref('')
const remember = ref(false)
</script>

<template>
  <section class="si-wrap" aria-labelledby="si-title">
    <DzCard variant="elevated" padding="lg" class="si-card">
      <div class="si-head">
        <DzHeading id="si-title" :level="4" size="xl" weight="semibold" align="center">
          Welcome back
        </DzHeading>
        <DzText tone="muted" align="center" size="sm" as="p">
          Sign in to your account to continue.
        </DzText>
      </div>

      <form class="si-form" @submit.prevent>
        <DzFormField>
          <DzFormLabel>Email</DzFormLabel>
          <DzInput
            v-model="email"
            type="email"
            placeholder="you@company.com"
            autocomplete="email"
          />
        </DzFormField>

        <DzFormField>
          <div class="si-label-row">
            <DzFormLabel>Password</DzFormLabel>
            <a class="si-link" href="#" tabindex="0">Forgot password?</a>
          </div>
          <DzPasswordInput
            v-model="password"
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </DzFormField>

        <DzCheckbox v-model="remember">
          Keep me signed in
        </DzCheckbox>

        <DzButton type="submit" variant="solid" tone="primary" class="si-submit">
          Sign in
        </DzButton>

        <div class="si-or" role="separator" aria-label="or continue with">
          <DzDivider decorative class="si-or-line" />
          <DzText size="xs" tone="muted" as="span" class="si-or-text">
            or continue with
          </DzText>
          <DzDivider decorative class="si-or-line" />
        </div>

        <div class="si-social">
          <DzButton variant="outline" tone="neutral" class="si-social-btn">
            <template #prefix>
              <Github :size="16" aria-hidden="true" />
            </template>
            GitHub
          </DzButton>
          <DzButton variant="outline" tone="neutral" class="si-social-btn">
            <template #prefix>
              <!-- Google "G" icon — no raw brand color, rendered via currentColor tint -->
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M22 12.24c0-.78-.06-1.52-.18-2.24H12v4.24h5.6a4.78 4.78 0 0 1-2.07 3.14l3.35 2.6A10.3 10.3 0 0 0 22 12.24z" opacity=".9" />
                <path fill="currentColor" d="M12 22a10 10 0 0 0 6.93-2.54l-3.35-2.6a5.99 5.99 0 0 1-8.94-3.14H3.18A10.01 10.01 0 0 0 12 22z" opacity=".75" />
                <path fill="currentColor" d="M6.64 13.72A6.07 6.07 0 0 1 6.32 12c0-.6.1-1.18.31-1.72L3.18 7.68A10.03 10.03 0 0 0 2 12c0 1.62.39 3.15 1.18 4.5l3.46-2.78z" opacity=".6" />
                <path fill="currentColor" d="M12 6a5.7 5.7 0 0 1 4.04 1.58l3.01-3.02A10.01 10.01 0 0 0 12 2a10 10 0 0 0-8.82 5.68l3.46 2.6A5.96 5.96 0 0 1 12 6z" opacity=".45" />
              </svg>
            </template>
            Google
          </DzButton>
        </div>
      </form>

      <DzText size="sm" tone="muted" align="center" as="p" class="si-foot">
        Don't have an account?
        <a class="si-link" href="#">Create one</a>
      </DzText>
    </DzCard>
  </section>
</template>

<style scoped>
.si-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.si-card {
  width: 100%;
  max-width: 26rem;
}

.si-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.si-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.si-label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.si-link {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: var(--dz-font-medium, 500);
  color: var(--dz-primary, #6366f1);
  text-decoration: none;
}

.si-link:hover {
  text-decoration: underline;
}

.si-submit {
  width: 100%;
  margin-top: var(--dz-space-1, 0.25rem);
}

.si-or {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.si-or-line {
  flex: 1;
}

.si-or-text {
  white-space: nowrap;
}

.si-social {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-3, 0.75rem);
}

.si-social-btn {
  width: 100%;
}

.si-foot {
  margin-top: var(--dz-space-4, 1rem);
}

@media (max-width: 400px) {
  .si-social {
    grid-template-columns: 1fr;
  }
}
</style>
