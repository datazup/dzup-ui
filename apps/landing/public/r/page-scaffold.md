# Responsive page scaffold

A whole landing page assembled from layout primitives only — DzContainer for measure, DzFlex + DzSpacer for the header bar, DzStack for hero rhythm, a responsive DzGrid feature row, a DzFlex content/aside split and a DzDivider-fenced footer.

- **Category:** Layout
- **Components:** DzContainer, DzGrid, DzFlex, DzStack, DzSpacer, DzDivider, DzButton, DzBadge, DzHeading, DzText, DzIcon
- **Preview:** /blocks/page-scaffold

```vue
<script setup lang="ts">
/**
 * Page scaffold — a whole responsive page assembled from layout primitives.
 *
 * One block to show the family working together: DzContainer sets the measure,
 * DzFlex + DzSpacer build the header bar (brand left, nav and CTA pushed right),
 * DzStack drives the vertical rhythm of the hero, DzGrid lays out the responsive
 * feature row, a second DzFlex splits main content from an aside, and DzDivider
 * fences the footer. No CSS framework — just the primitives and `--dz-*` tokens.
 *
 * Self-contained: local static data, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 * Heading: the hero title uses level 4 within BlockPreview's H3 shell.
 *
 * Responsive: header nav, feature grid and content split all collapse at the
 * app's narrow breakpoints.
 */
import {
  DzBadge,
  DzButton,
  DzContainer,
  DzDivider,
  DzFlex,
  DzGrid,
  DzHeading,
  DzIcon,
  DzSpacer,
  DzStack,
  DzText,
} from '@dzup-ui/core'
import { Boxes, Gauge, Layers, ShieldCheck } from 'lucide-vue-next'
import type { Component } from 'vue'

const nav: string[] = ['Product', 'Pricing', 'Docs']

interface Feature {
  icon: Component
  title: string
  body: string
}

const features: Feature[] = [
  { icon: Layers, title: 'Composable', body: 'Stack primitives into any structure without bespoke CSS.' },
  { icon: Gauge, title: 'Fast', body: 'Token-driven styles ship lean and render instantly.' },
  { icon: ShieldCheck, title: 'Accessible', body: 'Landmarks and focus order survive every reflow.' },
]

const footerCols: { title: string, links: string[] }[] = [
  { title: 'Product', links: ['Components', 'Blocks', 'Themes'] },
  { title: 'Resources', links: ['Docs', 'Changelog', 'Status'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact'] },
]
</script>

<template>
  <section class="ps" aria-labelledby="ps-title">
    <!-- Header bar -->
    <header class="ps-header">
      <DzContainer max-width="xl">
        <DzFlex direction="row" align="center" gap="md" class="ps-bar">
          <DzFlex direction="row" align="center" gap="sm" class="ps-brand">
            <span class="ps-logo" aria-hidden="true"><DzIcon :icon="Boxes" size="sm" /></span>
            <DzText size="md" weight="bold" as="span">Stratus</DzText>
          </DzFlex>

          <DzSpacer size="auto" />

          <nav class="ps-nav" aria-label="Primary">
            <a v-for="item in nav" :key="item" href="#" class="ps-nav-link">{{ item }}</a>
          </nav>

          <DzFlex direction="row" align="center" gap="sm" class="ps-header-cta">
            <DzButton variant="ghost" tone="neutral" size="sm">Sign in</DzButton>
            <DzButton variant="solid" tone="primary" size="sm">Get started</DzButton>
          </DzFlex>
        </DzFlex>
      </DzContainer>
    </header>

    <!-- Hero -->
    <div class="ps-hero">
      <DzContainer max-width="md">
        <DzStack direction="vertical" align="center" gap="md" class="ps-hero-stack">
          <DzBadge variant="subtle" tone="primary" size="sm">v2.0 is here</DzBadge>
          <DzHeading id="ps-title" :level="4" size="2xl" weight="bold" align="center" class="ps-hero-title">
            Ship product UI, not plumbing
          </DzHeading>
          <DzText size="md" tone="muted" align="center" class="ps-hero-lede">
            A full page laid out with nothing but Container, Grid, Flex, Stack and Spacer —
            structure you can read at a glance.
          </DzText>
          <DzFlex direction="row" gap="sm" justify="center" wrap class="ps-hero-actions">
            <DzButton variant="solid" tone="primary">Start building</DzButton>
            <DzButton variant="outline" tone="neutral">View on GitHub</DzButton>
          </DzFlex>
        </DzStack>
      </DzContainer>
    </div>

    <!-- Feature grid -->
    <DzContainer max-width="lg" class="ps-section">
      <DzGrid :cols="{ sm: 1, lg: 3 }" gap="lg">
        <DzStack
          v-for="feature in features"
          :key="feature.title"
          direction="vertical"
          gap="sm"
          class="ps-feature"
        >
          <span class="ps-feature-icon" aria-hidden="true"><DzIcon :icon="feature.icon" size="md" /></span>
          <DzHeading :level="5" size="sm" weight="semibold">{{ feature.title }}</DzHeading>
          <DzText size="sm" tone="muted">{{ feature.body }}</DzText>
        </DzStack>
      </DzGrid>
    </DzContainer>

    <!-- Content split -->
    <DzContainer max-width="lg" class="ps-section">
      <DzFlex direction="row" gap="xl" align="start" class="ps-split">
        <div class="ps-split-main">
          <DzHeading :level="5" size="lg" weight="bold">Why teams switch</DzHeading>
          <DzText size="sm" tone="muted" class="ps-split-body">
            A primitive-first layout system means fewer one-off wrappers, a smaller stylesheet,
            and pages that stay consistent as they grow. Every value resolves from the same
            token scale, so spacing rhythm and theming come for free.
          </DzText>
          <DzFlex direction="row" gap="sm" wrap class="ps-chiprow">
            <DzBadge variant="outline" tone="neutral" size="sm">No utility soup</DzBadge>
            <DzBadge variant="outline" tone="neutral" size="sm">Tree-shakeable</DzBadge>
            <DzBadge variant="outline" tone="neutral" size="sm">SSR-safe</DzBadge>
          </DzFlex>
        </div>

        <aside class="ps-split-aside">
          <DzStack direction="vertical" gap="sm">
            <DzText size="xs" tone="muted" weight="semibold" class="ps-aside-head">AT A GLANCE</DzText>
            <DzFlex direction="row" align="baseline" gap="sm">
              <DzHeading :level="6" size="xl" weight="bold">14</DzHeading>
              <DzText size="sm" tone="muted">primitives</DzText>
            </DzFlex>
            <DzDivider />
            <DzFlex direction="row" align="baseline" gap="sm">
              <DzHeading :level="6" size="xl" weight="bold">0</DzHeading>
              <DzText size="sm" tone="muted">runtime deps</DzText>
            </DzFlex>
            <DzDivider />
            <DzFlex direction="row" align="baseline" gap="sm">
              <DzHeading :level="6" size="xl" weight="bold">AA</DzHeading>
              <DzText size="sm" tone="muted">contrast</DzText>
            </DzFlex>
          </DzStack>
        </aside>
      </DzFlex>
    </DzContainer>

    <!-- Footer -->
    <footer class="ps-footer">
      <DzContainer max-width="xl">
        <DzDivider class="ps-footer-rule" />
        <DzFlex direction="row" gap="xl" wrap align="start" class="ps-footer-row">
          <DzStack direction="vertical" gap="sm" class="ps-footer-brand">
            <DzFlex direction="row" align="center" gap="sm">
              <span class="ps-logo" aria-hidden="true"><DzIcon :icon="Boxes" size="sm" /></span>
              <DzText size="md" weight="bold" as="span">Stratus</DzText>
            </DzFlex>
            <DzText size="sm" tone="muted">Layout primitives for product teams.</DzText>
          </DzStack>

          <DzSpacer size="auto" />

          <DzFlex direction="row" gap="xl" wrap class="ps-footer-cols">
            <DzStack v-for="col in footerCols" :key="col.title" direction="vertical" gap="sm">
              <DzText size="sm" weight="semibold" as="span">{{ col.title }}</DzText>
              <a v-for="link in col.links" :key="link" href="#" class="ps-footer-link">{{ link }}</a>
            </DzStack>
          </DzFlex>
        </DzFlex>
      </DzContainer>
    </footer>
  </section>
</template>

<style scoped>
.ps {
  background: var(--dz-background, #fff);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.75rem);
  overflow: hidden;
}

/* Header */
.ps-header {
  border-bottom: 1px solid var(--dz-border, #e5e7eb);
  background: color-mix(in oklch, var(--dz-background, #fff) 80%, transparent);
}

.ps-bar {
  padding: var(--dz-space-3, 0.75rem) 0;
  width: 100%;
}

.ps-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--dz-radius-md, 0.5rem);
  background: var(--dz-primary, #6366f1);
  color: var(--dz-primary-foreground, #fff);
}

.ps-nav {
  display: flex;
  gap: var(--dz-space-5, 1.25rem);
}

.ps-nav-link,
.ps-footer-link {
  color: var(--dz-muted-foreground, #6b7280);
  text-decoration: none;
  font-size: var(--dz-text-sm, 0.875rem);
}

.ps-nav-link:hover,
.ps-footer-link:hover {
  color: var(--dz-foreground, #111);
}

.ps-footer-link {
  display: block;
}

/* Hero */
.ps-hero {
  padding: clamp(2.5rem, 7vw, 4.5rem) 0;
  background:
    radial-gradient(60% 120% at 50% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 10%, transparent), transparent);
}

.ps-hero-stack {
  width: 100%;
}

.ps-hero-title {
  margin: 0;
  max-width: 24ch;
}

.ps-hero-lede {
  margin: 0;
  max-width: 46ch;
  line-height: 1.6;
}

.ps-hero-actions {
  margin-top: var(--dz-space-2, 0.5rem);
}

/* Sections */
.ps-section {
  padding: clamp(2rem, 5vw, 3rem) var(--dz-space-6, 1.5rem);
}

.ps-feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--dz-radius-md, 0.5rem);
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 12%, transparent);
  color: var(--dz-primary, #6366f1);
}

/* Content split */
.ps-split {
  width: 100%;
}

.ps-split-main {
  flex: 1;
  min-width: 0;
}

.ps-split-body {
  margin: var(--dz-space-3, 0.75rem) 0;
  line-height: 1.65;
}

.ps-chiprow {
  margin-top: var(--dz-space-4, 1rem);
}

.ps-split-aside {
  flex: 0 0 14rem;
  padding: var(--dz-space-5, 1.25rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.75rem);
  background: var(--dz-muted, #f9fafb);
}

.ps-aside-head {
  letter-spacing: 0.06em;
}

/* Footer */
.ps-footer {
  padding: 0 var(--dz-space-6, 1.5rem) var(--dz-space-8, 2rem);
}

.ps-footer-rule {
  margin-bottom: var(--dz-space-6, 1.5rem);
}

.ps-footer-row {
  width: 100%;
}

.ps-footer-brand {
  flex: 0 1 18rem;
}

@media (max-width: 768px) {
  .ps-nav {
    display: none;
  }

  .ps-split {
    flex-direction: column;
  }

  .ps-split-aside {
    width: 100%;
    flex: 1 1 auto;
  }
}

@media (max-width: 480px) {
  .ps-header-cta :deep(button) {
    font-size: var(--dz-text-sm, 0.875rem);
  }
}
</style>
```
