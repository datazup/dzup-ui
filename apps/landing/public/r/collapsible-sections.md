# Collapsible settings sections

A settings page of expandable DzPanels (each owning its open state via v-model:collapsed) spaced by a DzStack, with DzSwitch rows and DzDivider inside — plus a standalone DzCollapse "advanced" region toggled by a button, the primitive DzPanel wraps.

- **Category:** Layout
- **Components:** DzPanel, DzCollapse, DzContainer, DzStack, DzDivider, DzSwitch, DzButton, DzHeading, DzText, DzIcon
- **Preview:** /blocks#collapsible-sections

```vue
<script setup lang="ts">
/**
 * Collapsible sections — a settings page of expandable panels built on DzPanel
 * and DzCollapse.
 *
 * DzContainer sets the column; a DzStack spaces a set of collapsible DzPanels
 * (each owning its open state via `v-model:collapsed`), with DzSwitch rows and
 * DzDivider inside. Below them, a standalone DzCollapse — toggled by a DzButton
 * — reveals an "advanced" region, showing the raw expand/collapse primitive
 * that DzPanel wraps.
 *
 * Self-contained: local reactive state, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { reactive, ref } from 'vue'
import {
  DzButton,
  DzCollapse,
  DzContainer,
  DzDivider,
  DzHeading,
  DzIcon,
  DzPanel,
  DzStack,
  DzSwitch,
  DzText,
} from '@dzup-ui/core'
import { ChevronDown } from 'lucide-vue-next'

/** Open state per panel (true = collapsed/hidden). */
const collapsed = reactive({
  account: false,
  notifications: true,
  privacy: true,
})

const prefs = reactive({
  email: true,
  push: false,
  digest: true,
  analytics: false,
  discoverable: true,
})

const advancedOpen = ref(false)
</script>

<template>
  <section class="cs" aria-labelledby="cs-title">
    <DzContainer max-width="md" :padding="false">
      <header class="cs-head">
        <DzHeading id="cs-title" :level="4" size="lg" weight="bold">Settings</DzHeading>
        <DzText size="sm" tone="muted">Collapsible sections from DzPanel · DzCollapse</DzText>
      </header>

      <DzStack direction="vertical" gap="md">
        <!-- Account -->
        <DzPanel header="Account" variant="outlined" collapsible v-model:collapsed="collapsed.account">
          <DzStack direction="vertical" gap="sm">
            <div class="cs-field">
              <DzText size="sm" weight="semibold" as="span">Display name</DzText>
              <DzText size="sm" tone="muted" as="span">Ava Restić</DzText>
            </div>
            <DzDivider />
            <div class="cs-field">
              <DzText size="sm" weight="semibold" as="span">Email</DzText>
              <DzText size="sm" tone="muted" as="span">ava@stratus.dev</DzText>
            </div>
            <DzDivider />
            <div class="cs-field">
              <DzText size="sm" weight="semibold" as="span">Plan</DzText>
              <DzText size="sm" tone="muted" as="span">Team · 8 seats</DzText>
            </div>
          </DzStack>
        </DzPanel>

        <!-- Notifications -->
        <DzPanel header="Notifications" variant="outlined" collapsible v-model:collapsed="collapsed.notifications">
          <DzStack direction="vertical" gap="md">
            <DzSwitch v-model="prefs.email">Email notifications</DzSwitch>
            <DzSwitch v-model="prefs.push">Push notifications</DzSwitch>
            <DzSwitch v-model="prefs.digest">Weekly digest</DzSwitch>
          </DzStack>
        </DzPanel>

        <!-- Privacy -->
        <DzPanel header="Privacy" variant="outlined" collapsible v-model:collapsed="collapsed.privacy">
          <DzStack direction="vertical" gap="md">
            <DzSwitch v-model="prefs.analytics">Share anonymous usage analytics</DzSwitch>
            <DzSwitch v-model="prefs.discoverable">Discoverable by teammates</DzSwitch>
          </DzStack>
        </DzPanel>
      </DzStack>

      <!-- Standalone DzCollapse: the primitive DzPanel wraps -->
      <div class="cs-advanced">
        <DzButton
          variant="ghost"
          tone="neutral"
          size="sm"
          :aria-expanded="advancedOpen"
          class="cs-advanced-toggle"
          @click="advancedOpen = !advancedOpen"
        >
          <DzIcon :icon="ChevronDown" size="sm" :class="['cs-chevron', { 'cs-chevron--open': advancedOpen }]" />
          Advanced options
        </DzButton>

        <DzCollapse v-model="advancedOpen">
          <div class="cs-advanced-body">
            <DzText size="sm" tone="muted" class="cs-advanced-text">
              These settings change how data is stored and synced. The region above animates open and closed
              via the same DzCollapse primitive that powers every collapsible panel on this page.
            </DzText>
            <DzStack direction="horizontal" gap="sm" class="cs-advanced-actions">
              <DzButton variant="outline" tone="danger" size="sm">Reset preferences</DzButton>
              <DzButton variant="outline" tone="neutral" size="sm">Export data</DzButton>
            </DzStack>
          </div>
        </DzCollapse>
      </div>
    </DzContainer>
  </section>
</template>

<style scoped>
.cs {
  background: var(--dz-background, #fff);
  padding: var(--dz-space-2, 0.5rem);
}

.cs-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.cs-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.cs-advanced {
  margin-top: var(--dz-space-4, 1rem);
}

.cs-advanced-toggle {
  --dz-button-gap: var(--dz-space-2, 0.5rem);
}

.cs-chevron {
  transition: transform var(--dz-duration-fast, 150ms) ease;
}

.cs-chevron--open {
  transform: rotate(180deg);
}

.cs-advanced-body {
  padding: var(--dz-space-4, 1rem) var(--dz-space-1, 0.25rem) var(--dz-space-2, 0.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.cs-advanced-text {
  margin: 0;
  line-height: 1.6;
}

.cs-advanced-actions {
  flex-wrap: wrap;
}

@media (prefers-reduced-motion: reduce) {
  .cs-chevron {
    transition: none;
  }
}
</style>
```
