<script setup lang="ts">
/**
 * Account Centre — full-page account-management template (docs/templates.md §6.6).
 *
 * A DzAppShell whose sidebar doubles as the section switcher: clicking a section
 * drives the DzTabs across Profile, Security, Notifications and Billing. Profile
 * pairs an avatar-upload block with DzFormField inputs; Security holds a password
 * change, a 2FA DzSwitch and a revocable active-sessions list; Notifications is a
 * matrix of DzSwitches (event × channel); Billing shows the current plan DzBadge,
 * the payment method and an invoices snippet (DzDescriptions for the facts). A
 * sticky save bar appears only when there are unsaved edits and confirms the save
 * with a DzAlert. Built only from free `@dzup-ui/core` components, token-styled,
 * correct in light + dark, reflows to 390px.
 */
import {
  DzAlert,
  DzAppShell,
  DzAvatar,
  DzBadge,
  DzButton,
  DzDescriptions,
  DzDescriptionsItem,
  DzDivider,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
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
import {
  Bell,
  Boxes,
  CheckCircle2,
  CreditCard,
  Download,
  LogOut,
  MapPin,
  Monitor,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'
import {
  INVOICES,
  LANGUAGES,
  NOTIFY_CHANNELS,
  NOTIFY_SEED,
  SESSIONS_SEED,
  TIMEZONES,
  VISIBILITY,
} from './data.ts'

// ── Section model ────────────────────────────────────────────────────────────
// The four tabs are also the sidebar's "Account" items, so the rail and the tab
// strip stay in lock-step from one source of truth.
const SECTIONS = [
  { value: 'profile', label: 'Profile', icon: UserRound },
  { value: 'security', label: 'Security', icon: ShieldCheck },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'billing', label: 'Billing', icon: CreditCard },
] as const

const tab = ref<string>('profile')

// ── Editable state ───────────────────────────────────────────────────────────
// Everything that the save bar tracks lives in one reactive object so "dirty" is
// a pure JSON diff against the last-saved snapshot — Cancel restores it verbatim.
const form = reactive({
  // Profile
  fullName: 'Ava Restić',
  username: 'ava',
  bio: 'Design-systems lead at Northwind. I keep the gap between Figma and production small.',
  email: 'ava@northwind.io',
  timezone: 'cet',
  language: 'en-us',
  visibility: 'workspace',
  // Security
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: true,
  loginAlerts: true,
  // Notifications (event × channel matrix)
  notify: NOTIFY_SEED.map((row) => ({ ...row })),
})

// Sessions are an immediate action (revoke), not part of the save batch.
const sessions = reactive(SESSIONS_SEED.map((s) => ({ ...s })))

const pristine = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== pristine.value)

const justSaved = ref(false)
// The moment the user edits again, retire the confirmation banner.
watch(dirty, (isDirty) => {
  if (isDirty) justSaved.value = false
})

function save(): void {
  pristine.value = JSON.stringify(form)
  justSaved.value = true
}

function cancel(): void {
  Object.assign(form, JSON.parse(pristine.value))
}

function revokeSession(id: string): void {
  const i = sessions.findIndex((s) => s.id === id)
  if (i !== -1) sessions.splice(i, 1)
}

// ── Derived display ──────────────────────────────────────────────────────────
const initials = computed(() =>
  form.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const passwordHint = computed(() => {
  if (!form.newPassword) return ''
  if (form.confirmPassword && form.newPassword !== form.confirmPassword) {
    return 'Passwords do not match.'
  }
  if (form.newPassword.length < 8) return 'Use at least 8 characters.'
  return 'Looks good.'
})

const invoiceTone = (status: string): 'success' | 'warning' | 'danger' =>
  status === 'Paid' ? 'success' : status === 'Pending' ? 'warning' : 'danger'
</script>

<template>
  <DzAppShell aria-label="Account Centre" class="ac-shell">
    <template #sidebar>
      <DzSidebar aria-label="Account navigation">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Northwind</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Account">
          <DzSidebarItem
            v-for="s in SECTIONS"
            :key="s.value"
            :active="tab === s.value"
            href="#"
            @click.prevent="tab = s.value"
          >
            <template #icon><component :is="s.icon" :size="18" /></template>
            {{ s.label }}
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarFooter>
          <span class="user">
            <DzAvatar :fallback="initials" size="sm" />
            <span class="user-meta">
              <DzText size="sm" weight="medium" as="span">{{ form.fullName }}</DzText>
              <DzText size="xs" tone="muted" as="span">{{ form.email }}</DzText>
            </span>
          </span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="ac-title">
        <DzHeading :level="1" size="lg" weight="semibold">Account Centre</DzHeading>
        <DzText size="sm" tone="muted" as="p">Manage your profile, security and billing.</DzText>
      </div>
    </template>

    <div class="ac-body">
      <!-- Save confirmation — announced, dismissible, retires on next edit. -->
      <div class="ac-live" role="status" aria-live="polite">
        <DzAlert
          v-if="justSaved && !dirty"
          tone="success"
          variant="subtle"
          closable
          title="Changes saved"
          :icon="CheckCircle2"
          @close="justSaved = false"
        >
          Your account settings are up to date.
        </DzAlert>
      </div>

      <DzTabs v-model="tab" variant="line" aria-label="Account sections">
        <DzTabList>
          <DzTabTrigger v-for="s in SECTIONS" :key="s.value" :value="s.value">
            {{ s.label }}
          </DzTabTrigger>
        </DzTabList>

        <!-- ── Profile ───────────────────────────────────────────────── -->
        <DzTabContent value="profile">
          <div class="panel">
            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">Public profile</DzHeading>
              <DzText size="sm" tone="muted" as="p">
                This is how you appear to teammates across the workspace.
              </DzText>
            </header>

            <div class="avatar-row">
              <DzAvatar :fallback="initials" size="xl" class="avatar-lg" />
              <div class="avatar-actions">
                <div class="avatar-btns">
                  <DzButton variant="outline" tone="neutral" size="sm">
                    <template #prefix><Upload :size="15" aria-hidden="true" /></template>
                    Upload
                  </DzButton>
                  <DzButton variant="ghost" tone="danger" size="sm">
                    <template #prefix><Trash2 :size="15" aria-hidden="true" /></template>
                    Remove
                  </DzButton>
                </div>
                <DzText size="xs" tone="muted" as="p">PNG, JPG or GIF — up to 2&nbsp;MB.</DzText>
              </div>
            </div>

            <DzDivider />

            <div class="grid-2">
              <DzFormField>
                <DzFormLabel>Full name</DzFormLabel>
                <DzInput v-model="form.fullName" autocomplete="name" />
              </DzFormField>
              <DzFormField>
                <DzFormLabel>Username</DzFormLabel>
                <DzInput v-model="form.username" autocomplete="username">
                  <template #prefix><span class="at">@</span></template>
                </DzInput>
              </DzFormField>
            </div>

            <DzFormField>
              <DzFormLabel>Bio</DzFormLabel>
              <DzInput v-model="form.bio" :maxlength="160" />
              <DzFormDescription>A short line shown on your profile. Max 160 characters.</DzFormDescription>
            </DzFormField>

            <div class="grid-2">
              <DzFormField>
                <DzFormLabel>Timezone</DzFormLabel>
                <DzSelect v-model="form.timezone" :items="TIMEZONES" aria-label="Timezone" />
              </DzFormField>
              <DzFormField>
                <DzFormLabel>Language</DzFormLabel>
                <DzSelect v-model="form.language" :items="LANGUAGES" aria-label="Language" />
              </DzFormField>
            </div>

            <DzFormField>
              <DzFormLabel>Profile visibility</DzFormLabel>
              <DzSelect v-model="form.visibility" :items="VISIBILITY" aria-label="Profile visibility" />
              <DzFormDescription>Controls who can find and view your profile.</DzFormDescription>
            </DzFormField>
          </div>
        </DzTabContent>

        <!-- ── Security ──────────────────────────────────────────────── -->
        <DzTabContent value="security">
          <div class="panel">
            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">Password</DzHeading>
              <DzText size="sm" tone="muted" as="p">
                Choose a strong password you don't use elsewhere.
              </DzText>
            </header>

            <DzFormField>
              <DzFormLabel>Current password</DzFormLabel>
              <DzInput v-model="form.currentPassword" type="password" autocomplete="current-password" />
            </DzFormField>

            <div class="grid-2">
              <DzFormField>
                <DzFormLabel>New password</DzFormLabel>
                <DzInput v-model="form.newPassword" type="password" autocomplete="new-password" />
              </DzFormField>
              <DzFormField>
                <DzFormLabel>Confirm new password</DzFormLabel>
                <DzInput v-model="form.confirmPassword" type="password" autocomplete="new-password" />
                <DzFormDescription v-if="passwordHint">{{ passwordHint }}</DzFormDescription>
              </DzFormField>
            </div>

            <DzDivider />

            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">Two-factor authentication</DzHeading>
            </header>

            <div class="switch-row">
              <div class="switch-copy">
                <div class="switch-title">
                  <DzText weight="medium" as="span">Authenticator app</DzText>
                  <DzBadge v-if="form.twoFactor" variant="subtle" tone="success" size="sm">On</DzBadge>
                  <DzBadge v-else variant="subtle" tone="neutral" size="sm">Off</DzBadge>
                </div>
                <DzText size="sm" tone="muted" as="div">
                  Require a one-time code from your authenticator at sign-in.
                </DzText>
              </div>
              <DzSwitch v-model="form.twoFactor" aria-label="Two-factor authentication" />
            </div>

            <div class="switch-row">
              <div class="switch-copy">
                <DzText weight="medium" as="div">New-device sign-in alerts</DzText>
                <DzText size="sm" tone="muted" as="div">Email me when a new device signs in.</DzText>
              </div>
              <DzSwitch v-model="form.loginAlerts" aria-label="New-device sign-in alerts" />
            </div>

            <DzDivider />

            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">Active sessions</DzHeading>
              <DzText size="sm" tone="muted" as="p">Devices currently signed in to your account.</DzText>
            </header>

            <ul class="session-list">
              <li v-for="session in sessions" :key="session.id" class="session">
                <span class="session-icon" aria-hidden="true">
                  <component :is="session.kind === 'monitor' ? Monitor : Smartphone" :size="18" />
                </span>
                <div class="session-main">
                  <div class="session-head">
                    <DzText weight="medium" as="span">{{ session.device }}</DzText>
                    <DzBadge v-if="session.current" variant="subtle" tone="primary" size="sm">
                      This device
                    </DzBadge>
                  </div>
                  <DzText size="sm" tone="muted" as="div" class="session-meta">
                    <MapPin :size="13" aria-hidden="true" /> {{ session.location }} · {{ session.meta }}
                  </DzText>
                  <DzText size="xs" tone="muted" as="div">{{ session.lastActive }}</DzText>
                </div>
                <DzButton
                  v-if="!session.current"
                  variant="ghost"
                  tone="danger"
                  size="sm"
                  @click="revokeSession(session.id)"
                >
                  <template #prefix><LogOut :size="15" aria-hidden="true" /></template>
                  Revoke
                </DzButton>
                <DzBadge v-else variant="outline" tone="success" size="sm">Current</DzBadge>
              </li>
            </ul>
          </div>
        </DzTabContent>

        <!-- ── Notifications (matrix) ────────────────────────────────── -->
        <DzTabContent value="notifications">
          <div class="panel">
            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">Notifications</DzHeading>
              <DzText size="sm" tone="muted" as="p">
                Pick how each kind of update reaches you.
              </DzText>
            </header>

            <div class="matrix" role="group" aria-label="Notification preferences">
              <div class="matrix-head" aria-hidden="true">
                <span></span>
                <span v-for="channel in NOTIFY_CHANNELS" :key="channel" class="matrix-channel">
                  {{ channel }}
                </span>
              </div>

              <template v-for="(row, i) in form.notify" :key="row.key">
                <DzDivider v-if="i > 0" />
                <div class="matrix-row">
                  <div class="matrix-copy">
                    <DzText weight="medium" as="div">{{ row.label }}</DzText>
                    <DzText size="sm" tone="muted" as="div">{{ row.desc }}</DzText>
                  </div>
                  <span class="matrix-cell">
                    <DzSwitch v-model="row.email" size="sm" :aria-label="`${row.label} — Email`" />
                  </span>
                  <span class="matrix-cell">
                    <DzSwitch v-model="row.push" size="sm" :aria-label="`${row.label} — Push`" />
                  </span>
                  <span class="matrix-cell">
                    <DzSwitch v-model="row.sms" size="sm" :aria-label="`${row.label} — SMS`" />
                  </span>
                </div>
              </template>
            </div>
          </div>
        </DzTabContent>

        <!-- ── Billing ───────────────────────────────────────────────── -->
        <DzTabContent value="billing">
          <div class="panel">
            <header class="panel-head">
              <DzHeading :level="2" size="md" weight="semibold">Plan &amp; billing</DzHeading>
              <DzText size="sm" tone="muted" as="p">Manage your subscription and payment method.</DzText>
            </header>

            <div class="plan">
              <div class="plan-main">
                <div class="plan-name">
                  <DzText weight="semibold" as="span">Team</DzText>
                  <DzBadge variant="solid" tone="primary" size="sm">Current plan</DzBadge>
                </div>
                <DzText size="sm" tone="muted" as="p">
                  <span class="plan-price">$48</span> / month · renews Jul 1, 2026
                </DzText>
              </div>
              <div class="plan-actions">
                <DzButton variant="ghost" tone="neutral" size="sm">Cancel plan</DzButton>
                <DzButton variant="solid" tone="primary" size="sm">Change plan</DzButton>
              </div>
            </div>

            <DzDescriptions :columns="{ base: 1, sm: 3 }" layout="vertical" size="sm" class="plan-facts">
              <DzDescriptionsItem label="Billing cycle">Monthly</DzDescriptionsItem>
              <DzDescriptionsItem label="Seats">8 of 10 used</DzDescriptionsItem>
              <DzDescriptionsItem label="Next invoice">Jul 1, 2026</DzDescriptionsItem>
            </DzDescriptions>

            <DzDivider />

            <header class="panel-head">
              <DzHeading :level="3" size="sm" weight="semibold">Payment method</DzHeading>
            </header>
            <div class="pay">
              <span class="pay-card" aria-hidden="true"><CreditCard :size="18" /></span>
              <div class="pay-main">
                <DzText weight="medium" as="div">Visa ending in 4242</DzText>
                <DzText size="sm" tone="muted" as="div">Expires 09 / 2027</DzText>
              </div>
              <DzButton variant="outline" tone="neutral" size="sm">Update</DzButton>
            </div>

            <DzDivider />

            <header class="panel-head">
              <DzHeading :level="3" size="sm" weight="semibold">Recent invoices</DzHeading>
            </header>
            <ul class="invoice-list">
              <li v-for="inv in INVOICES" :key="inv.id" class="invoice">
                <div class="invoice-id">
                  <DzText weight="medium" as="span">{{ inv.id }}</DzText>
                  <DzText size="sm" tone="muted" as="span">{{ inv.date }}</DzText>
                </div>
                <DzBadge variant="subtle" :tone="invoiceTone(inv.status)" size="sm">
                  {{ inv.status }}
                </DzBadge>
                <DzText weight="medium" as="span" class="invoice-amount">{{ inv.amount }}</DzText>
                <DzButton variant="ghost" tone="neutral" size="sm" aria-label="Download invoice">
                  <template #prefix><Download :size="15" aria-hidden="true" /></template>
                  PDF
                </DzButton>
              </li>
            </ul>
          </div>
        </DzTabContent>
      </DzTabs>
    </div>

    <!-- Sticky save bar — only surfaces when there are pending edits. -->
    <Transition name="ac-bar">
      <div v-if="dirty" class="save-bar" role="region" aria-label="Unsaved changes">
        <DzText size="sm" tone="muted" as="span" class="save-msg">
          You have unsaved changes.
        </DzText>
        <div class="save-actions">
          <DzButton variant="ghost" tone="neutral" @click="cancel">Cancel</DzButton>
          <DzButton variant="solid" tone="primary" @click="save">Save changes</DzButton>
        </div>
      </div>
    </Transition>
  </DzAppShell>
</template>

<style scoped>
.ac-shell {
  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

/* ── Sidebar bits (mirrors the shipped app-settings brand/user pattern) ── */
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

.ac-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Body + panels ── */
.ac-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 760px;
  padding-bottom: 72px; /* room for the sticky save bar */
}

.ac-live:empty {
  display: none;
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

.at {
  color: var(--dz-muted-foreground);
}

/* ── Profile: avatar block ── */
.avatar-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar-lg {
  flex-shrink: 0;
  outline: 3px solid var(--dz-card);
  border-radius: var(--dz-radius-full);
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-btns {
  display: flex;
  gap: 8px;
}

/* ── Switch rows (security toggles) ── */
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.switch-copy {
  line-height: 1.3;
  min-width: 0;
}

.switch-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Security: sessions ── */
.session-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-card);
}

.session-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: var(--dz-radius-md);
  background: var(--dz-muted);
  color: var(--dz-muted-foreground);
}

.session-main {
  flex: 1;
  min-width: 0;
  line-height: 1.35;
}

.session-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.session-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ── Notifications matrix ── */
.matrix {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.matrix-head,
.matrix-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(3, 56px);
  align-items: center;
  gap: 12px;
}

.matrix-channel {
  justify-self: center;
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-medium);
  color: var(--dz-muted-foreground);
}

.matrix-copy {
  min-width: 0;
  line-height: 1.3;
}

.matrix-cell {
  display: grid;
  place-items: center;
}

/* ── Billing ── */
.plan {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--dz-primary) 12%, transparent), transparent 55%),
    var(--dz-card);
}

.plan-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--dz-text-lg);
}

.plan-price {
  color: var(--dz-foreground);
  font-weight: var(--dz-font-semibold);
}

.plan-actions {
  display: flex;
  gap: 8px;
}

.plan-facts {
  padding: 0 2px;
}

.pay {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-card);
}

.pay-card {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: var(--dz-radius-md);
  background: var(--dz-muted);
  color: var(--dz-muted-foreground);
}

.pay-main {
  flex: 1;
  min-width: 0;
}

.invoice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.invoice {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 2px;
}

.invoice + .invoice {
  border-top: 1px solid var(--dz-border);
}

.invoice-id {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.invoice-amount {
  font-variant-numeric: tabular-nums;
}

/* ── Sticky save bar ── */
.save-bar {
  position: sticky;
  bottom: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding: 12px 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: color-mix(in oklch, var(--dz-card) 92%, transparent);
  backdrop-filter: blur(8px);
  box-shadow: var(--dz-shadow-xl);
}

.save-actions {
  display: flex;
  gap: 8px;
}

.ac-bar-enter-active,
.ac-bar-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.ac-bar-enter-from,
.ac-bar-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .ac-bar-enter-active,
  .ac-bar-leave-active {
    transition: none;
  }
}

/* ── Responsive ── */
@media (max-width: 560px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }

  .matrix-head,
  .matrix-row {
    grid-template-columns: minmax(0, 1fr) repeat(3, 44px);
    gap: 8px;
  }

  .avatar-row {
    align-items: flex-start;
  }

  .save-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .save-actions {
    justify-content: flex-end;
  }

  .invoice {
    grid-template-columns: 1fr auto;
    row-gap: 6px;
  }

  .invoice-amount {
    text-align: right;
  }
}
</style>
