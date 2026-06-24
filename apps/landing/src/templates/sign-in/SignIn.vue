<script setup lang="ts">
/**
 * Sign In — featured reference template (docs/templates.md §6.2).
 *
 * A chromeless, centered authentication page: a brand lockup, a DzCard holding a
 * DzFormField email + DzPasswordInput, a "remember me" DzCheckbox, the primary
 * DzButton, a labelled DzDivider, and social DzButtons. A tinted marketing panel
 * sits beside the form on wide screens and collapses away on mobile. Built only
 * from free `@dzup-ui/core` components, token-styled, light + dark, 390px → up.
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
  DzText,
} from '@dzup-ui/core'
import { Boxes, Github, ShieldCheck } from 'lucide-vue-next'
import { ref } from 'vue'

const email = ref('ava@northwind.io')
const password = ref('')
const remember = ref(true)

const highlights = [
  'SOC 2 Type II compliant',
  'SSO & SAML on every plan',
  '99.99% uptime SLA',
]
</script>

<template>
  <div class="auth-page">
    <!-- Marketing panel (decorative on mobile it is hidden). -->
    <aside class="auth-aside" aria-hidden="true">
      <div class="aside-inner">
        <span class="brand brand--invert">
          <span class="brand-mark"><Boxes :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>
        <p class="aside-quote">
          “Northwind replaced four tools for us. The dashboards alone paid for the
          first year.”
        </p>
        <div class="aside-author">
          <span class="aside-author-name">Mara Petrović</span>
          <span class="aside-author-role">VP Operations, Lumen Labs</span>
        </div>
        <ul class="aside-list">
          <li v-for="h in highlights" :key="h">
            <ShieldCheck :size="16" /><span>{{ h }}</span>
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
          <DzHeading :level="1" size="2xl" weight="semibold">Welcome back</DzHeading>
          <DzText tone="muted" as="p">Sign in to your workspace to continue.</DzText>
        </header>

        <DzCard variant="elevated" padding="lg" class="auth-card">
          <form class="auth-form" @submit.prevent>
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
              <div class="label-row">
                <DzFormLabel>Password</DzFormLabel>
                <a class="link" href="#">Forgot password?</a>
              </div>
              <DzPasswordInput
                v-model="password"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
            </DzFormField>

            <DzCheckbox v-model="remember">Keep me signed in</DzCheckbox>

            <DzButton type="submit" variant="solid" tone="primary" class="auth-submit">
              Sign in
            </DzButton>

            <div class="or-divider" role="separator" aria-label="or continue with">
              <DzDivider decorative class="or-line" />
              <DzText size="xs" tone="muted" class="or-text">or continue with</DzText>
              <DzDivider decorative class="or-line" />
            </div>

            <div class="social-row">
              <DzButton variant="outline" tone="neutral" class="social-btn">
                <template #prefix><Github :size="16" aria-hidden="true" /></template>
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
          New to Northwind?
          <a class="link" href="#">Create an account</a>
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
    radial-gradient(circle at 18% 18%, color-mix(in oklch, var(--dz-primary) 32%, transparent), transparent 55%),
    var(--dz-primary);
  color: var(--dz-primary-foreground);
  overflow: hidden;
}

.aside-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 38ch;
}

.aside-quote {
  margin: 0;
  font-size: var(--dz-text-2xl);
  line-height: 1.4;
  font-weight: var(--dz-font-medium);
}

.aside-author {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.aside-author-name {
  font-weight: var(--dz-font-semibold);
}

.aside-author-role {
  font-size: var(--dz-text-sm);
  opacity: 0.8;
}

.aside-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.aside-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--dz-text-sm);
  opacity: 0.92;
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
  max-width: 400px;
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

.label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
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
