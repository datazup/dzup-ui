# Settings layout

Horizontal tab nav over three panels — profile form fields, notification switches, and appearance options — with a sticky footer.

- **Category:** Application
- **Components:** DzTabs, DzTabList, DzTabTrigger, DzTabContent, DzFormField, DzFormLabel, DzFormDescription, DzInput, DzSelect, DzSwitch, DzDivider, DzButton, DzText
- **Preview:** /blocks/settings-layout

```vue
<script setup lang="ts">
import type { DzSelectItem } from '@dzup-ui/core'
/**
 * Settings layout — tab section nav beside form panels.
 *
 * Horizontal DzTabs drive three settings panels: Profile (two DzFormField
 * text inputs + a DzSelect timezone picker), Notifications (DzSwitch rows
 * separated by DzDivider), and Appearance (a DzSelect density picker +
 * a DzSwitch). A sticky footer with Cancel / Save buttons closes the panel.
 *
 * API notes sourced from AppSettings.vue template:
 * - DzTabs uses v-model with a string value
 * - DzFormField wraps label + control; DzFormLabel and DzFormDescription
 *   are sibling sub-parts inside DzFormField's default slot
 * - DzSelect takes an `items: DzSelectItem[]` prop + v-model string
 * - DzSwitch uses v-model boolean
 *
 * Self-contained: no props, no router, local ref() state only.
 */
import {
  DzButton,
  DzDivider,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzSelect,
  DzSwitch,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
} from '@dzup-ui/core'
import { ref } from 'vue'

const tab = ref('profile')

// Form state
const fullName = ref('Jamie Doe')
const email = ref('jamie@acme.io')

const TIMEZONES: DzSelectItem[] = [
  { label: '(UTC−08:00) Pacific Time', value: 'pst' },
  { label: '(UTC−05:00) Eastern Time', value: 'est' },
  { label: '(UTC+00:00) London', value: 'gmt' },
  { label: '(UTC+01:00) Central European', value: 'cet' },
  { label: '(UTC+09:00) Tokyo', value: 'jst' },
]
const timezone = ref('cet')

const DENSITY: DzSelectItem[] = [
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Compact', value: 'compact' },
  { label: 'Cozy', value: 'cozy' },
]
const density = ref('comfortable')

const notifyProduct = ref(true)
const notifyDigest = ref(true)
const notifySecurity = ref(true)
const notifyMarketing = ref(false)
const reduceMotion = ref(false)
</script>

<template>
  <section class="sl-wrap" aria-label="Settings layout">
    <DzTabs v-model="tab" variant="line" aria-label="Settings categories">
      <DzTabList>
        <DzTabTrigger value="profile">
          Profile
        </DzTabTrigger>
        <DzTabTrigger value="notifications">
          Notifications
        </DzTabTrigger>
        <DzTabTrigger value="appearance">
          Appearance
        </DzTabTrigger>
      </DzTabList>

      <!-- ── Profile ─────────────────────────────────────────────────── -->
      <DzTabContent value="profile">
        <div class="panel">
          <header class="panel-head">
            <DzHeading :level="4" size="md" weight="semibold" class="panel-title">
              Public profile
            </DzHeading>
            <DzText size="sm" tone="muted" as="p">
              This information is visible to your teammates.
            </DzText>
          </header>

          <div class="grid-2">
            <DzFormField>
              <DzFormLabel>Full name</DzFormLabel>
              <DzInput v-model="fullName" autocomplete="name" />
            </DzFormField>
            <DzFormField>
              <DzFormLabel>Email</DzFormLabel>
              <DzInput v-model="email" type="email" autocomplete="email" />
              <DzFormDescription>Used for sign-in and notifications.</DzFormDescription>
            </DzFormField>
          </div>

          <DzFormField>
            <DzFormLabel>Timezone</DzFormLabel>
            <DzSelect v-model="timezone" :items="TIMEZONES" aria-label="Timezone" />
          </DzFormField>
        </div>
      </DzTabContent>

      <!-- ── Notifications ───────────────────────────────────────────── -->
      <DzTabContent value="notifications">
        <div class="panel">
          <header class="panel-head">
            <DzHeading :level="4" size="md" weight="semibold" class="panel-title">
              Email notifications
            </DzHeading>
            <DzText size="sm" tone="muted" as="p">
              Choose what Acme sends to your inbox.
            </DzText>
          </header>

          <ul class="switch-list">
            <li class="switch-row">
              <div class="switch-copy">
                <DzText weight="medium" as="div">
                  Product updates
                </DzText>
                <DzText size="sm" tone="muted" as="div">
                  New features and improvements.
                </DzText>
              </div>
              <DzSwitch v-model="notifyProduct" aria-label="Product updates" />
            </li>
            <DzDivider decorative />
            <li class="switch-row">
              <div class="switch-copy">
                <DzText weight="medium" as="div">
                  Weekly digest
                </DzText>
                <DzText size="sm" tone="muted" as="div">
                  A Monday summary of your workspace.
                </DzText>
              </div>
              <DzSwitch v-model="notifyDigest" aria-label="Weekly digest" />
            </li>
            <DzDivider decorative />
            <li class="switch-row">
              <div class="switch-copy">
                <DzText weight="medium" as="div">
                  Security alerts
                </DzText>
                <DzText size="sm" tone="muted" as="div">
                  Sign-ins from new devices.
                </DzText>
              </div>
              <DzSwitch v-model="notifySecurity" aria-label="Security alerts" />
            </li>
            <DzDivider decorative />
            <li class="switch-row">
              <div class="switch-copy">
                <DzText weight="medium" as="div">
                  Marketing
                </DzText>
                <DzText size="sm" tone="muted" as="div">
                  Occasional tips and offers.
                </DzText>
              </div>
              <DzSwitch v-model="notifyMarketing" aria-label="Marketing" />
            </li>
          </ul>
        </div>
      </DzTabContent>

      <!-- ── Appearance ──────────────────────────────────────────────── -->
      <DzTabContent value="appearance">
        <div class="panel">
          <header class="panel-head">
            <DzHeading :level="4" size="md" weight="semibold" class="panel-title">
              Appearance
            </DzHeading>
            <DzText size="sm" tone="muted" as="p">
              Customize how the app looks for you.
            </DzText>
          </header>

          <DzFormField>
            <DzFormLabel>Density</DzFormLabel>
            <DzSelect v-model="density" :items="DENSITY" aria-label="Density" />
            <DzFormDescription>Controls spacing in tables and lists.</DzFormDescription>
          </DzFormField>

          <DzDivider decorative />

          <div class="switch-row">
            <div class="switch-copy">
              <DzText weight="medium" as="div">
                Reduce motion
              </DzText>
              <DzText size="sm" tone="muted" as="div">
                Minimize non-essential animation.
              </DzText>
            </div>
            <DzSwitch v-model="reduceMotion" aria-label="Reduce motion" />
          </div>
        </div>
      </DzTabContent>
    </DzTabs>

    <DzDivider decorative />

    <footer class="sl-footer">
      <DzButton variant="ghost" tone="neutral">
        Cancel
      </DzButton>
      <DzButton variant="solid" tone="primary">
        Save changes
      </DzButton>
    </footer>
  </section>
</template>

<style scoped>
.sl-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
  padding: var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  max-width: 680px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
  margin-top: var(--dz-space-5, 1.25rem);
}

.panel-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
}

.panel-title {
  margin: 0;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-4, 1rem);
}

.switch-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-4, 1rem);
}

.switch-copy {
  line-height: 1.3;
  min-width: 0;
}

.sl-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
}

@media (max-width: 560px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
```
