# Social sign-in buttons

A stacked column of full-width provider buttons (Google, GitHub, Apple), a labelled divider, and an email fallback — drop-in for any auth screen.

- **Category:** Buttons
- **Components:** DzButton, DzDivider, DzText
- **Preview:** /blocks/social-auth-buttons

```vue
<script setup lang="ts">
import { DzButton, DzDivider, DzText } from '@dzup-ui/core'
import { Apple, Github, Mail } from 'lucide-vue-next'

/**
 * Social sign-in buttons — a stacked column of full-width provider buttons
 * (Google, GitHub, Apple), a labelled divider, and an email fallback. The
 * full-width treatment comes from a `class` on each DzButton (the parent
 * scope's width rule lands on the button root), so the button API stays
 * untouched.
 *
 * A drop-in for the social section of any auth screen. Composed from free
 * @dzup-ui/core components and `--dz-*` tokens; no raw color literals — the
 * Google glyph is drawn with `currentColor` (docs/blocks.md §3.6).
 */
</script>

<template>
  <section class="sab-wrap" aria-label="Social sign-in">
    <div class="sab-stack">
      <DzButton variant="outline" tone="neutral" size="lg" class="sab-btn">
        <template #prefix>
          <!-- Google "G" — tinted via currentColor, no raw brand color. -->
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M22 12.24c0-.78-.06-1.52-.18-2.24H12v4.24h5.6a4.78 4.78 0 0 1-2.07 3.14l3.35 2.6A10.3 10.3 0 0 0 22 12.24z" opacity=".9" />
            <path fill="currentColor" d="M12 22a10 10 0 0 0 6.93-2.54l-3.35-2.6a5.99 5.99 0 0 1-8.94-3.14H3.18A10.01 10.01 0 0 0 12 22z" opacity=".75" />
            <path fill="currentColor" d="M6.64 13.72A6.07 6.07 0 0 1 6.32 12c0-.6.1-1.18.31-1.72L3.18 7.68A10.03 10.03 0 0 0 2 12c0 1.62.39 3.15 1.18 4.5l3.46-2.78z" opacity=".6" />
            <path fill="currentColor" d="M12 6a5.7 5.7 0 0 1 4.04 1.58l3.01-3.02A10.01 10.01 0 0 0 12 2a10 10 0 0 0-8.82 5.68l3.46 2.6A5.96 5.96 0 0 1 12 6z" opacity=".45" />
          </svg>
        </template>
        Continue with Google
      </DzButton>

      <DzButton variant="outline" tone="neutral" size="lg" class="sab-btn">
        <template #prefix>
          <Github :size="18" aria-hidden="true" />
        </template>
        Continue with GitHub
      </DzButton>

      <DzButton variant="outline" tone="neutral" size="lg" class="sab-btn">
        <template #prefix>
          <Apple :size="18" aria-hidden="true" />
        </template>
        Continue with Apple
      </DzButton>
    </div>

    <div class="sab-or" role="separator" aria-label="or">
      <DzDivider decorative class="sab-or-line" />
      <DzText size="xs" tone="muted" as="span" class="sab-or-text">
        or
      </DzText>
      <DzDivider decorative class="sab-or-line" />
    </div>

    <DzButton variant="solid" tone="primary" size="lg" class="sab-btn">
      <template #prefix>
        <Mail :size="18" aria-hidden="true" />
      </template>
      Continue with email
    </DzButton>

    <DzText size="xs" tone="muted" align="center" as="p" class="sab-fine">
      By continuing you agree to our
      <a class="sab-link" href="#">Terms</a> and
      <a class="sab-link" href="#">Privacy Policy</a>.
    </DzText>
  </section>
</template>

<style scoped>
.sab-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
  width: 100%;
  max-width: 24rem;
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 2.5rem) var(--dz-space-4, 1rem);
  background: var(--dz-background, #fff);
}

.sab-stack {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

/* The parent scope id lands on the DzButton root, so this sizes the button. */
.sab-btn {
  width: 100%;
}

.sab-or {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.sab-or-line {
  flex: 1;
}

.sab-or-text {
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sab-fine {
  margin: 0;
  line-height: 1.6;
}

.sab-link {
  color: var(--dz-primary, #6366f1);
  text-decoration: none;
  font-weight: var(--dz-font-medium, 500);
}

.sab-link:hover {
  text-decoration: underline;
}
</style>
```
