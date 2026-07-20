<script setup lang="ts">
import type { Component } from 'vue'
/**
 * 404 — Page Not Found — Utility template (docs/templates.md §6.6).
 *
 * A chromeless, centered error page: a brand lockup, an oversized 404 glyph, a
 * DzResult headline + description, primary/secondary DzButtons to recover, and
 * a DzCard of helpful destinations so a dead link still ends somewhere useful.
 * Built only from free `@dzup-ui/core` components, token-styled, light + dark,
 * reflows cleanly 390px → up.
 */
import { DzButton, DzCard, DzDivider, DzResult, DzText } from '@dzup-ui/core'
import { ArrowRight, Boxes, Compass, Home, LifeBuoy, Search } from 'lucide-vue-next'

interface QuickLink {
  icon: Component
  label: string
  description: string
  href: string
}

const LINKS: QuickLink[] = [
  {
    icon: Compass,
    label: 'Dashboard',
    description: 'Your workspace overview',
    href: '#',
  },
  {
    icon: Search,
    label: 'Search docs',
    description: 'Find guides and references',
    href: '#',
  },
  {
    icon: LifeBuoy,
    label: 'Help center',
    description: 'Answers and how-tos',
    href: '#',
  },
]
</script>

<template>
  <main class="nf-page">
    <div class="nf-wrap">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
        <span class="brand-name">Northwind</span>
      </span>

      <p class="nf-code" aria-hidden="true">
        404
      </p>

      <DzResult
        status="info"
        title="We can't find that page"
        description="The page you're looking for may have moved, been renamed, or never existed. Let's get you back on track."
      >
        <template #actions>
          <DzButton variant="solid" tone="primary" href="#">
            <template #prefix>
              <Home :size="16" aria-hidden="true" />
            </template>
            Back to home
          </DzButton>
          <DzButton variant="outline" tone="neutral" href="#">
            Contact support
          </DzButton>
        </template>
      </DzResult>

      <DzCard variant="outlined" padding="none" class="nf-links">
        <DzText size="xs" tone="muted" weight="semibold" as="div" class="nf-links-label">
          OR JUMP TO
        </DzText>
        <ul class="nf-links-list">
          <template v-for="(link, i) in LINKS" :key="link.label">
            <DzDivider v-if="i > 0" />
            <li>
              <a class="nf-link" :href="link.href">
                <span class="nf-link-icon" aria-hidden="true">
                  <component :is="link.icon" :size="18" />
                </span>
                <span class="nf-link-meta">
                  <DzText weight="medium" as="span">{{ link.label }}</DzText>
                  <DzText size="sm" tone="muted" as="span">{{ link.description }}</DzText>
                </span>
                <ArrowRight :size="16" aria-hidden="true" class="nf-link-arrow" />
              </a>
            </li>
          </template>
        </ul>
      </DzCard>
    </div>
  </main>
</template>

<style scoped>
.nf-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: clamp(24px, 5vw, 64px);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-primary) 8%, transparent), transparent 60%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.nf-wrap {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
  margin-bottom: 8px;
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

.nf-code {
  margin: 0;
  font-size: clamp(5rem, 18vw, 8rem);
  font-weight: var(--dz-font-bold);
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(
    135deg,
    var(--dz-primary),
    color-mix(in oklch, var(--dz-primary) 55%, var(--dz-foreground))
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nf-links {
  width: 100%;
  margin-top: 24px;
  text-align: left;
  overflow: hidden;
}

.nf-links-label {
  letter-spacing: 0.06em;
  padding: 14px 16px 6px;
}

.nf-links-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nf-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  text-decoration: none;
  color: var(--dz-foreground);
  transition: background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.nf-link:hover {
  background: var(--dz-muted);
}

.nf-link:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: -2px;
}

.nf-link-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: var(--dz-radius-md);
  background: color-mix(in oklch, var(--dz-primary) 12%, transparent);
  color: var(--dz-primary);
}

.nf-link-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.nf-link-arrow {
  margin-left: auto;
  color: var(--dz-muted-foreground);
  flex: none;
}

@media (prefers-reduced-motion: reduce) {
  .nf-link {
    transition: none;
  }
}
</style>
