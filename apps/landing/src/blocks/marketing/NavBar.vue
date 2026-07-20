<script setup lang="ts">
import {
  DzButton,
  DzColorModeToggle,
  DzIconButton,
  DzSearchInput,
  DzSheet,
  DzSheetClose,
  DzSheetContent,
  DzSheetDescription,
  DzSheetTitle,
  DzSheetTrigger,
  DzText,
} from '@dzup-ui/core'
import { Menu, X, Zap } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * NavBar — responsive top navigation bar with logo/brand, nav links,
 * search, theme toggle, and a primary CTA button.
 *
 * On narrow viewports a DzIconButton reveals a DzSheet drawer that
 * reproduces the full nav so keyboard and screen-reader users can
 * reach every link. The drawer's open state is managed locally with
 * a single `ref<boolean>` (no props, no router).
 *
 * Heading level: the block is a landmark <header>, so no H-level
 * element is needed for the brand wordmark — it uses DzText instead.
 * Any page embedding this nav should supply its own H1 below.
 */

const mobileOpen = ref(false)
const searchQuery = ref('')
const mobileSearchQuery = ref('')

const navLinks = [
  { label: 'Product', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Docs', href: '#' },
  { label: 'Blog', href: '#' },
]
</script>

<template>
  <header class="navbar" role="banner">
    <!-- Brand ---------------------------------------------------------------->
    <a href="#" class="nb-brand" aria-label="Go to home page">
      <span class="nb-brand-icon" aria-hidden="true">
        <Zap :size="20" />
      </span>
      <DzText as="span" size="md" weight="bold" class="nb-brand-name">DataZup</DzText>
    </a>

    <!-- Desktop nav links ---------------------------------------------------->
    <nav class="nb-links" aria-label="Primary navigation">
      <a
        v-for="link in navLinks"
        :key="link.label"
        :href="link.href"
        class="nb-link"
      >{{ link.label }}</a>
    </nav>

    <!-- Desktop utility strip ----------------------------------------------->
    <div class="nb-utils">
      <DzSearchInput
        v-model="searchQuery"
        placeholder="Search…"
        clearable
        size="sm"
        class="nb-search"
        aria-label="Site search"
      />
      <DzColorModeToggle variant="icon" size="sm" />
      <DzButton variant="solid" tone="primary" size="sm">
        Get started
      </DzButton>
    </div>

    <!-- Mobile menu trigger ------------------------------------------------->
    <div class="nb-mobile-trigger">
      <DzColorModeToggle variant="icon" size="sm" />
      <DzSheet v-model:open="mobileOpen">
        <DzSheetTrigger as-child>
          <DzIconButton
            :icon="Menu"
            aria-label="Open navigation menu"
            variant="ghost"
            tone="neutral"
            size="sm"
          />
        </DzSheetTrigger>

        <DzSheetContent side="right" size="md">
          <div class="nb-drawer-head">
            <DzSheetTitle>Navigation</DzSheetTitle>
            <DzSheetDescription class="nb-sr-only">
              Site navigation links and actions
            </DzSheetDescription>
            <DzSheetClose as-child>
              <DzIconButton
                :icon="X"
                aria-label="Close navigation menu"
                variant="ghost"
                tone="neutral"
                size="sm"
              />
            </DzSheetClose>
          </div>

          <nav class="nb-drawer-links" aria-label="Mobile navigation">
            <a
              v-for="link in navLinks"
              :key="link.label"
              :href="link.href"
              class="nb-drawer-link"
              @click="mobileOpen = false"
            >{{ link.label }}</a>
          </nav>

          <div class="nb-drawer-actions">
            <DzSearchInput
              v-model="mobileSearchQuery"
              placeholder="Search…"
              clearable
              size="sm"
              aria-label="Site search"
            />
            <DzSheetClose as-child>
              <DzButton variant="solid" tone="primary" size="md" style="width: 100%">
                Get started
              </DzButton>
            </DzSheetClose>
          </div>
        </DzSheetContent>
      </DzSheet>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  gap: var(--dz-space-4, 1rem);
  padding: 0 var(--dz-space-6, 1.5rem);
  height: 3.5rem;
  background: var(--dz-surface, #fff);
  border-bottom: 1px solid var(--dz-border, #e5e7eb);
}

/* Brand ------------------------------------------------------------------*/
.nb-brand {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.nb-brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--dz-radius-md, 0.375rem);
  background: var(--dz-primary, #6366f1);
  color: var(--dz-primary-foreground, #fff);
}

.nb-brand-name {
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Desktop links ----------------------------------------------------------*/
.nb-links {
  display: flex;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
  flex: 1;
}

.nb-link {
  padding: var(--dz-space-1, 0.25rem) var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-md, 0.375rem);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--dz-text-muted, #6b7280);
  text-decoration: none;
  transition: background var(--dz-transition-fast, 150ms) ease,
              color var(--dz-transition-fast, 150ms) ease;
}

.nb-link:hover,
.nb-link:focus-visible {
  background: var(--dz-surface-raised, #f3f4f6);
  color: var(--dz-text, #111827);
  outline: none;
}

.nb-link:focus-visible {
  outline: 2px solid var(--dz-primary, #6366f1);
  outline-offset: 2px;
}

/* Desktop utility strip --------------------------------------------------*/
.nb-utils {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  flex-shrink: 0;
}

.nb-search {
  width: 14rem;
}

/* Mobile trigger (hidden on wide) ----------------------------------------*/
.nb-mobile-trigger {
  display: none;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  margin-left: auto;
}

/* Drawer content ---------------------------------------------------------*/
.nb-drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--dz-space-4, 1rem);
}

.nb-drawer-links {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-4, 1rem);
}

.nb-drawer-link {
  display: block;
  padding: var(--dz-space-2, 0.5rem) var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-md, 0.375rem);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--dz-text-muted, #6b7280);
  text-decoration: none;
  transition: background var(--dz-transition-fast, 150ms) ease,
              color var(--dz-transition-fast, 150ms) ease;
}

.nb-drawer-link:hover,
.nb-drawer-link:focus-visible {
  background: var(--dz-surface-raised, #f3f4f6);
  color: var(--dz-text, #111827);
  outline: none;
}

.nb-drawer-link:focus-visible {
  outline: 2px solid var(--dz-primary, #6366f1);
  outline-offset: 2px;
}

.nb-drawer-actions {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

/* Visually hidden but readable by screen readers -------------------------*/
.nb-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive breakpoint --------------------------------------------------*/
@media (max-width: 768px) {
  .nb-links,
  .nb-utils {
    display: none;
  }

  .nb-mobile-trigger {
    display: flex;
  }
}
</style>
