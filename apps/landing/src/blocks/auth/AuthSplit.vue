<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzPasswordInput,
  DzText,
} from '@dzup-ui/core'
import { ShieldCheck, Zap, Globe } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * Two-column auth — sign-in form left, brand/marketing panel right.
 *
 * On wide screens the layout is a 50/50 grid split: the left column holds a
 * DzCard sign-in form; the right column is a token-gradient brand panel with
 * a heading, a short blurb, and three feature callouts (lucide icons).
 * Below 768 px the brand panel collapses and the form column fills the width.
 * Composed only from free `@dzup-ui/core` components and `--dz-*` tokens.
 *
 * Heading levels: form heading `:level="4"`, brand panel heading `:level="4"`
 * (both nest under BlockPreview's H3 title).
 */

const email = ref('')
const password = ref('')

const features = [
  { icon: ShieldCheck, text: 'SOC 2 Type II certified' },
  { icon: Zap, text: 'Sub-100 ms p99 latency' },
  { icon: Globe, text: 'Global edge network' },
]
</script>

<template>
  <div class="as-root">
    <!-- ── Left: sign-in form ─────────────────────────────────────────── -->
    <div class="as-form-col">
      <DzCard variant="elevated" padding="lg" class="as-card">
        <div class="as-head">
          <DzHeading id="as-form-title" :level="4" size="xl" weight="semibold">
            Sign in
          </DzHeading>
          <DzText tone="muted" size="sm" as="p">
            Enter your credentials to access your workspace.
          </DzText>
        </div>

        <form class="as-form" @submit.prevent aria-labelledby="as-form-title">
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
            <DzFormLabel>Password</DzFormLabel>
            <DzPasswordInput
              v-model="password"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
          </DzFormField>

          <DzButton type="submit" variant="solid" tone="primary" class="as-submit">
            Sign in
          </DzButton>

          <DzText size="sm" tone="muted" align="center" as="p">
            <a class="as-link" href="#">Forgot your password?</a>
          </DzText>
        </form>
      </DzCard>

      <DzText size="sm" tone="muted" align="center" as="p" class="as-foot">
        New here?
        <a class="as-link" href="#">Create an account</a>
      </DzText>
    </div>

    <!-- ── Right: brand panel (decorative, hidden on mobile) ─────────── -->
    <aside class="as-brand" aria-hidden="true">
      <div class="as-brand-inner">
        <DzHeading :level="4" size="2xl" weight="bold" class="as-brand-heading">
          The fastest way to ship great products
        </DzHeading>

        <DzText size="md" as="p" class="as-brand-blurb">
          Thousands of teams rely on our platform to move from idea to production
          in a fraction of the time.
        </DzText>

        <ul class="as-features" role="list">
          <li v-for="f in features" :key="f.text" class="as-feature">
            <component :is="f.icon" :size="18" class="as-feature-icon" aria-hidden="true" />
            <span>{{ f.text }}</span>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.as-root {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100%;
  background: var(--dz-background, #fff);
}

/* ── Form column ─────────────────────────────────────────────────────── */
.as-form-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--dz-space-4, 1rem);
  padding: clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem);
}

.as-card {
  width: 100%;
  max-width: 24rem;
}

.as-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.as-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.as-submit {
  width: 100%;
  margin-top: var(--dz-space-1, 0.25rem);
}

.as-link {
  font-weight: var(--dz-font-medium, 500);
  color: var(--dz-primary, #6366f1);
  text-decoration: none;
}

.as-link:hover {
  text-decoration: underline;
}

.as-foot {
  max-width: 24rem;
  width: 100%;
}

/* ── Brand panel ─────────────────────────────────────────────────────── */
.as-brand {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2.5rem, 6vw, 5rem);
  overflow: hidden;

  /* Token-only gradient — re-themes with the global color toggle */
  background:
    radial-gradient(ellipse 70% 70% at 20% 20%, color-mix(in oklch, var(--dz-primary, #6366f1) 30%, transparent), transparent 60%),
    radial-gradient(ellipse 60% 60% at 80% 80%, color-mix(in oklch, var(--dz-primary, #6366f1) 18%, transparent), transparent 60%),
    var(--dz-primary, #6366f1);

  color: var(--dz-primary-foreground, #fff);
}

.as-brand-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-5, 1.25rem);
  max-width: 32rem;
}

.as-brand-heading {
  color: var(--dz-primary-foreground, #fff);
  line-height: 1.2;
}

.as-brand-blurb {
  color: color-mix(in oklch, var(--dz-primary-foreground, #fff) 85%, transparent);
  line-height: 1.6;
}

.as-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.as-feature {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  font-size: var(--dz-text-sm, 0.875rem);
  color: color-mix(in oklch, var(--dz-primary-foreground, #fff) 90%, transparent);
}

.as-feature-icon {
  flex-shrink: 0;
  opacity: 0.9;
}

/* ── Responsive: collapse brand panel on narrow viewports ────────────── */
@media (max-width: 768px) {
  .as-root {
    grid-template-columns: 1fr;
  }

  .as-brand {
    display: none;
  }
}
</style>
