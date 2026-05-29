<script setup lang="ts">
// Gallery-only wrapper that applies the @datazup/dzup-theme "datazup-classic" brand
// token overrides to its subtree, so Visual Refresh stories can show the BRAND look
// (purple accent + dark sidebar) without importing the shared-kit CSS into Storybook.
//
// Values mirror shared-kit/shared-app-kit/dzup-theme/src/styles/base.css :root block.
// This is a STORY-ONLY helper — not a published component. Token values only.
</script>

<template>
  <div class="dz-brand-scope">
    <slot />
  </div>
</template>

<style>
/* Brand token overrides — scoped to the gallery subtree (not :root). */
.dz-brand-scope {
  /* Brand (primary) — purple-blue 264° */
  --dz-primary: oklch(0.59 0.22 264);
  --dz-primary-hover: oklch(0.49 0.24 264);
  --dz-primary-foreground: oklch(1 0 0);
  --dz-primary-muted: oklch(0.965 0.035 264);
  --dz-ring: var(--dz-primary);

  /* Dark sidebar — regardless of content-area theme */
  --dz-sidebar-bg: oklch(0.16 0 0);
  --dz-sidebar-border: oklch(0.22 0 0);
  --dz-sidebar-header-bg: oklch(0.16 0 0);
  --dz-sidebar-footer-bg: oklch(0.16 0 0);
  --dz-sidebar-foreground: oklch(0.72 0 0);
  --dz-sidebar-foreground-hover: oklch(0.95 0 0);
  --dz-sidebar-text: oklch(0.72 0 0);
  --dz-sidebar-text-hover: oklch(0.95 0 0);
  --dz-sidebar-heading: oklch(0.55 0 0);
  --dz-sidebar-item-hover-bg: oklch(0.24 0 0);
  --dz-sidebar-item-active-bg: oklch(0.49 0.24 264);
  --dz-sidebar-item-active-text: oklch(1 0 0);

  /* Generous brand rounding */
  --dz-card-radius: var(--dz-radius-xl);
  --dz-button-radius: var(--dz-radius-xl);
  --dz-input-radius: var(--dz-radius-xl);
}
</style>
