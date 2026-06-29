<script setup lang="ts">
import { DzBadge } from '@dzup-ui/core'
import { ShieldCheck, SunMoon } from 'lucide-vue-next'
import type { Component } from 'vue'
import { CERTIFICATIONS, isCertified } from '../../blocks/certifications.ts'
import type { CertificationId } from '../../blocks/certifications.ts'

/**
 * BlockTrustMarks — the *earned* trust badges shown on BlockCard / BlockPreview
 * (docs/blocks.md §3.6, Task I3).
 *
 * Each mark corresponds 1:1 to a guarantee the CI a11y suite (`blocks/a11y.spec.ts`)
 * proves for this block: "Accessible" ← zero serious/critical axe violations,
 * "Light + dark" ← that audit runs under both themes. The marks and the checks
 * share ONE source of truth (`certifications.ts`), and a meta-test there asserts
 * they can't drift — so nothing here is decorative.
 *
 * Honesty over completeness: a block carrying known core-component a11y debt is
 * NOT certified, so this renders NOTHING for it rather than a mark the audit can't
 * back. Absence is the signal.
 *
 * The marks are token-only (DzBadge) and labelled by visible text plus a screen-
 * reader description of exactly what was verified — never colour alone.
 */
const props = defineProps<{
  /** The block these marks describe; gates rendering on its certification. */
  blockId: string
}>()

/** Lucide glyph per mark — decorative (aria-hidden); the text label is the name. */
const ICONS: Record<CertificationId, Component> = {
  'accessible': ShieldCheck,
  'light-dark': SunMoon,
}
</script>

<template>
  <ul v-if="isCertified(props.blockId)" class="tm-list" aria-label="Verified in CI">
    <li v-for="mark in CERTIFICATIONS" :key="mark.id" class="tm-item">
      <DzBadge variant="subtle" tone="success" size="sm" class="tm-badge" :title="mark.certifies">
        <component :is="ICONS[mark.id]" :size="13" aria-hidden="true" class="tm-icon" />
        <span>{{ mark.label }}</span>
        <!-- Spoken detail: the badge's accessible name becomes e.g. "Accessible —
             Audited every CI run …", so AT users hear what was verified, not just
             a coloured chip. Contains the visible label (WCAG 2.5.3). -->
        <span class="tm-sr"> — {{ mark.certifies }}</span>
      </DzBadge>
    </li>
  </ul>
</template>

<style scoped>
.tm-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--dz-space-2, 0.5rem);
}

.tm-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
}

.tm-icon {
  flex-shrink: 0;
}

/* Visually-hidden text — read by AT, not shown (same recipe as bp-copy-status). */
.tm-sr {
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
</style>
