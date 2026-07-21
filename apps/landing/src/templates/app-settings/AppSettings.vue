<script setup lang="ts">
import type { DzSelectItem } from '@dzup-ui/core'
/**
 * App Settings — full-page settings template (docs/templates.md §6.1).
 *
 * A DzAppShell with a DzTabs-driven settings surface: a Profile panel of
 * DzFormField + DzInput + DzSelect, a Notifications panel of DzSwitch rows, and
 * an Appearance panel with a DzRadioGroup theme picker. DzDivider separates
 * groups; a footer pairs the primary DzButton with a cancel. Built only from
 * free `@dzup-ui/core` components, token-styled, light + dark, reflows to 390px.
 */
import {
  DzAppShell,
  DzAvatar,
  DzButton,
  DzDivider,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzRadio,
  DzRadioGroup,
  DzSelect,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzSwitch,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
} from '@dzup-ui/core'
import { Bell, Boxes, CreditCard, Palette, Plug, Shield, User } from 'lucide-vue-next'
import { ref } from 'vue'

const NAV = [
  { label: 'Profile', icon: User, active: true },
  { label: 'Notifications', icon: Bell },
  { label: 'Appearance', icon: Palette },
  { label: 'Security', icon: Shield },
  { label: 'Billing', icon: CreditCard },
  { label: 'Integrations', icon: Plug },
]

const TIMEZONES: DzSelectItem[] = [
  { label: '(UTC−08:00) Pacific Time', value: 'pst' },
  { label: '(UTC−05:00) Eastern Time', value: 'est' },
  { label: '(UTC+00:00) London', value: 'gmt' },
  { label: '(UTC+01:00) Central European', value: 'cet' },
  { label: '(UTC+09:00) Tokyo', value: 'jst' },
]

const DENSITY: DzSelectItem[] = [
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Cozy', value: 'cozy' },
  { label: 'Compact', value: 'compact' },
]

const tab = ref('profile')

// Form state — seeded with plausible values so the preview reads as a real account.
const fullName = ref('Ava Restić')
const email = ref('ava@northwind.io')
const role = ref('Product Lead')
const timezone = ref('cet')

const notifyProduct = ref(true)
const notifyWeekly = ref(true)
const notifySecurity = ref(true)
const notifyMarketing = ref(false)

const theme = ref('system')
const density = ref('comfortable')
const reduceMotion = ref(false)
</script>

<template>
  <DzAppShell aria-label="Settings" class="set-shell">
    <template #sidebar>
      <DzSidebar aria-label="Settings sections">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Northwind</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Settings">
          <DzSidebarItem v-for="item in NAV" :key="item.label" :active="item.active" href="#">
            <template #icon>
              <component :is="item.icon" :size="18" />
            </template>
            {{ item.label }}
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarFooter>
          <span class="user">
            <DzAvatar fallback="AR" size="sm" />
            <span class="user-meta">
              <DzText size="sm" weight="medium" as="span">Ava Restić</DzText>
              <DzText size="xs" tone="muted" as="span">ava@northwind.io</DzText>
            </span>
          </span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="set-title">
        <DzHeading :level="1" size="lg" weight="semibold">
          Settings
        </DzHeading>
      </div>
    </template>

    <div class="set-body">
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

        <!-- ── Profile ─────────────────────────────────────────────── -->
        <DzTabContent value="profile">
          <div class="panel">
            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">
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
                <DzFormLabel>Role</DzFormLabel>
                <DzInput v-model="role" />
              </DzFormField>
            </div>

            <DzFormField>
              <DzFormLabel>Email</DzFormLabel>
              <DzInput v-model="email" type="email" autocomplete="email" />
              <DzFormDescription>Used for sign-in and account notifications.</DzFormDescription>
            </DzFormField>

            <DzFormField>
              <DzFormLabel>Timezone</DzFormLabel>
              <DzSelect v-model="timezone" :items="TIMEZONES" aria-label="Timezone" />
            </DzFormField>
          </div>
        </DzTabContent>

        <!-- ── Notifications ───────────────────────────────────────── -->
        <DzTabContent value="notifications">
          <div class="panel">
            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">
                Email notifications
              </DzHeading>
              <DzText size="sm" tone="muted" as="p">
                Choose what Northwind sends to your inbox.
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
              <DzDivider />
              <li class="switch-row">
                <div class="switch-copy">
                  <DzText weight="medium" as="div">
                    Weekly digest
                  </DzText>
                  <DzText size="sm" tone="muted" as="div">
                    A Monday summary of your workspace.
                  </DzText>
                </div>
                <DzSwitch v-model="notifyWeekly" aria-label="Weekly digest" />
              </li>
              <DzDivider />
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
              <DzDivider />
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

        <!-- ── Appearance ──────────────────────────────────────────── -->
        <DzTabContent value="appearance">
          <div class="panel">
            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">
                Appearance
              </DzHeading>
              <DzText size="sm" tone="muted" as="p">
                Customize how the app looks for you.
              </DzText>
            </header>

            <DzFormField>
              <DzFormLabel>Theme</DzFormLabel>
              <DzRadioGroup v-model="theme" orientation="horizontal" aria-label="Theme">
                <DzRadio value="light">
                  Light
                </DzRadio>
                <DzRadio value="dark">
                  Dark
                </DzRadio>
                <DzRadio value="system">
                  Match system
                </DzRadio>
              </DzRadioGroup>
            </DzFormField>

            <DzDivider />

            <DzFormField>
              <DzFormLabel>Density</DzFormLabel>
              <DzSelect v-model="density" :items="DENSITY" aria-label="Density" />
              <DzFormDescription>Controls spacing in tables and lists.</DzFormDescription>
            </DzFormField>

            <div class="switch-row switch-row--bare">
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

      <DzDivider />
      <footer class="set-foot">
        <DzButton variant="ghost" tone="neutral">
          Cancel
        </DzButton>
        <DzButton variant="solid" tone="primary">
          Save changes
        </DzButton>
      </footer>
    </div>
  </DzAppShell>
</template>

<style scoped>
.set-shell {
  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
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

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.set-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 720px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 20px;
}

.panel-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.switch-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.switch-row--bare {
  margin-top: 2px;
}

.switch-copy {
  line-height: 1.3;
  min-width: 0;
}

.set-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 560px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
