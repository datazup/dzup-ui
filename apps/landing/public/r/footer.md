# Multi-column footer

Brand blurb, four link columns, social icon buttons, and a theme toggle; collapses to two columns on mobile.

- **Category:** Marketing
- **Components:** DzText, DzDivider, DzIconButton, DzColorModeToggle
- **Preview:** /blocks/footer

```vue
<script setup lang="ts">
import { DzColorModeToggle, DzDivider, DzIconButton, DzText } from '@dzup-ui/core'
import { Github, Linkedin, Twitter, Youtube } from 'lucide-vue-next'

/**
 * Multi-column footer — brand blurb, four link columns, social icon buttons,
 * and a theme toggle.
 *
 * Self-contained: no props, no external data. Composed only from free
 * @dzup-ui/core components and `--dz-*` tokens (no landing-only `--lp-*` props),
 * so it drops into any app already themed, accessible, and light/dark-ready
 * (docs/blocks.md §3.6).
 *
 * Note: DzColorModeToggle requires a DzThemeProvider ancestor in the component
 * tree. The landing app's root already provides one; when embedding this footer
 * in another app, ensure DzThemeProvider wraps the page.
 *
 * Links are rendered as plain `<a>` elements (no router dependency) — replace
 * with `<RouterLink>` or your framework's link component as needed.
 *
 * Responsive: four columns → two → single stack on narrow viewports.
 */

const year = new Date().getFullYear()

const links = [
  {
    heading: 'Product',
    items: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    heading: 'Developers',
    items: [
      { label: 'Documentation', href: '#' },
      { label: 'API reference', href: '#' },
      { label: 'SDKs', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
] as const

const socials = [
  { icon: Github, label: 'GitHub' },
  { icon: Twitter, label: 'X / Twitter' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Youtube, label: 'YouTube' },
] as const
</script>

<template>
  <footer class="site-footer" aria-label="Site footer">
    <div class="sf-inner">
      <!-- Top row: brand + link columns -->
      <div class="sf-top">
        <!-- Brand column -->
        <div class="sf-brand">
          <!-- Logotype — token-colored text mark; swap for an <img> if needed. -->
          <span class="sf-logo" aria-label="DataZup">DataZup</span>
          <DzText size="sm" tone="muted" class="sf-blurb">
            The fastest way to connect your data, build live dashboards, and
            share insights with your entire team.
          </DzText>
        </div>

        <!-- Link columns -->
        <nav class="sf-cols" aria-label="Footer navigation">
          <div v-for="col in links" :key="col.heading" class="sf-col">
            <DzText as="p" size="sm" weight="semibold" class="sf-col-heading">
              {{ col.heading }}
            </DzText>
            <ul class="sf-col-list" role="list">
              <li v-for="item in col.items" :key="item.label">
                <a :href="item.href" class="sf-link">
                  <DzText as="span" size="sm" tone="muted">{{ item.label }}</DzText>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <DzDivider decorative />

      <!-- Bottom bar: copyright, social icons, theme toggle -->
      <div class="sf-bottom">
        <DzText size="sm" tone="muted">
          &copy; {{ year }} DataZup, Inc. All rights reserved.
        </DzText>

        <div class="sf-bottom-controls">
          <!-- Social icon buttons -->
          <div class="sf-socials" role="list" aria-label="Social links">
            <div v-for="social in socials" :key="social.label" role="listitem">
              <DzIconButton
                :icon="social.icon"
                :aria-label="social.label"
                variant="ghost"
                tone="neutral"
                size="sm"
              />
            </div>
          </div>

          <!-- Theme toggle — requires DzThemeProvider ancestor -->
          <DzColorModeToggle variant="icon" size="sm" :show-system="true" />
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--dz-surface, #f8fafc);
  border-top: 1px solid var(--dz-border, #e2e8f0);
  padding: clamp(2.5rem, 6vw, 4rem) var(--dz-space-6, 1.5rem) clamp(1.5rem, 3vw, 2rem);
}

.sf-inner {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-8, 2rem);
  max-width: 72rem;
  margin: 0 auto;
}

/* Top row */
.sf-top {
  display: grid;
  grid-template-columns: 1.4fr 3fr;
  gap: var(--dz-space-10, 2.5rem);
  align-items: flex-start;
}

/* Brand */
.sf-brand {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

/* Logotype — primary-coloured wordmark, re-themes with the token. */
.sf-logo {
  font-size: var(--dz-text-xl, 1.25rem);
  font-weight: 700;
  color: var(--dz-primary, #6366f1);
  letter-spacing: -0.02em;
  line-height: 1;
}

.sf-blurb {
  margin: 0;
  line-height: 1.6;
  max-width: 18rem;
}

/* Link columns */
.sf-cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--dz-space-6, 1.5rem);
}

.sf-col {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.sf-col-heading {
  margin: 0;
  /* Slightly elevated from muted so it reads as a heading */
  color: var(--dz-foreground, #1e293b);
}

.sf-col-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

/* Links — token underline + focus ring, no raw colours. */
.sf-link {
  text-decoration: none;
  outline-offset: 2px;
  border-radius: var(--dz-radius-sm, 0.25rem);
}

.sf-link:hover > * {
  color: var(--dz-foreground, #1e293b);
}

.sf-link:focus-visible {
  outline: 2px solid var(--dz-primary, #6366f1);
}

/* Bottom bar */
.sf-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--dz-space-4, 1rem);
}

.sf-bottom-controls {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.sf-socials {
  display: flex;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
}

/* Responsive: collapse columns on tablet */
@media (max-width: 900px) {
  .sf-top {
    grid-template-columns: 1fr;
  }

  .sf-blurb {
    max-width: 100%;
  }

  .sf-cols {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Single column on mobile */
@media (max-width: 480px) {
  .sf-cols {
    grid-template-columns: 1fr 1fr;
  }

  .sf-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
```
