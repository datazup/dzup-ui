import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DzSelectItem } from '../../src/components/forms'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import { DzButton } from '../../src/components/buttons'
import { DzCard, DzCardBody, DzCardFooter, DzCardHeader } from '../../src/components/cards'
import {
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzSelect,
  DzSwitch,
} from '../../src/components/forms'
import { DzInput, DzTextarea } from '../../src/components/inputs'
import { DzAvatar } from '../../src/components/media'
import { DzTabContent, DzTabList, DzTabs, DzTabTrigger } from '../../src/components/navigation'
import { darkModeDecorator } from '../_shared'

/**
 * SettingsPage is a cross-family composition combining **navigation** (tabbed
 * section switching), **cards** (grouped setting panels), and **forms** (inputs,
 * select, textarea, switches) into a realistic account-settings screen.
 *
 * It shows the canonical pattern for a settings surface: a `DzTabs` rail across
 * the top, each panel a stack of `DzCard`s, and each card a set of
 * `DzFormField`-wrapped controls with a sticky save/cancel footer.
 */
const meta = {
  title: 'Core/Compositions/SettingsPage',
  component: undefined,
  tags: ['autodocs', 'composition', 'status:stable'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Cross-family composition: DzTabs (navigation) + DzCard (grouping) + DzFormField/DzInput/DzSelect/DzSwitch (forms) forming an account-settings page.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const timezoneItems: DzSelectItem[] = [
  { label: '(UTC−08:00) Pacific Time', value: 'pst' },
  { label: '(UTC−05:00) Eastern Time', value: 'est' },
  { label: '(UTC+00:00) UTC', value: 'utc' },
  { label: '(UTC+01:00) Central European Time', value: 'cet' },
]

const components = {
  DzTabs,
  DzTabList,
  DzTabTrigger,
  DzTabContent,
  DzCard,
  DzCardHeader,
  DzCardBody,
  DzCardFooter,
  DzFormField,
  DzFormLabel,
  DzFormDescription,
  DzFormMessage,
  DzSelect,
  DzSwitch,
  DzInput,
  DzTextarea,
  DzAvatar,
  DzButton,
}

function useSettings() {
  const name = ref('Jane Doe')
  const email = ref('jane@example.com')
  const bio = ref('Product designer focused on design systems.')
  const timezone = ref('utc')
  const emailNotifications = ref(true)
  const pushNotifications = ref(false)
  const weeklyDigest = ref(true)
  const twoFactor = ref(false)
  const publicProfile = ref(true)
  return {
    name,
    email,
    bio,
    timezone,
    timezoneItems,
    emailNotifications,
    pushNotifications,
    weeklyDigest,
    twoFactor,
    publicProfile,
  }
}

const template = `
  <div class="mx-auto max-w-3xl">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-[var(--dz-foreground)]">Settings</h1>
      <p class="mt-1 text-sm text-[var(--dz-muted-foreground)]">Manage your profile, notifications, and security.</p>
    </header>

    <DzTabs model-value="profile" variant="line">
      <DzTabList>
        <DzTabTrigger value="profile">Profile</DzTabTrigger>
        <DzTabTrigger value="notifications">Notifications</DzTabTrigger>
        <DzTabTrigger value="security">Security</DzTabTrigger>
      </DzTabList>

      <!-- Profile -->
      <DzTabContent value="profile">
        <DzCard variant="outlined" class="mt-4">
          <DzCardHeader>
            <h2 class="text-base font-semibold">Public profile</h2>
            <p class="text-sm text-[var(--dz-muted-foreground)]">This information may appear on your public profile.</p>
          </DzCardHeader>
          <DzCardBody>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <DzAvatar size="lg" fallback="JD" alt="Jane Doe" />
                <DzButton variant="outline" tone="neutral" size="sm">Change avatar</DzButton>
              </div>
              <DzFormField required>
                <DzFormLabel>Full name</DzFormLabel>
                <DzInput v-model="name" placeholder="Your name" />
                <DzFormMessage />
              </DzFormField>
              <DzFormField required>
                <DzFormLabel>Email address</DzFormLabel>
                <DzInput v-model="email" type="email" placeholder="you@example.com" />
                <DzFormDescription>Used for sign-in and account notifications.</DzFormDescription>
                <DzFormMessage />
              </DzFormField>
              <DzFormField>
                <DzFormLabel>Bio</DzFormLabel>
                <DzTextarea v-model="bio" :rows="3" placeholder="Tell us about yourself" />
                <DzFormDescription>Brief description for your profile.</DzFormDescription>
              </DzFormField>
              <DzFormField>
                <DzFormLabel>Timezone</DzFormLabel>
                <DzSelect v-model="timezone" :items="timezoneItems" placeholder="Choose timezone" />
              </DzFormField>
              <DzSwitch v-model="publicProfile">Make profile public</DzSwitch>
            </div>
          </DzCardBody>
          <DzCardFooter>
            <div class="flex justify-end gap-3 w-full">
              <DzButton variant="ghost" tone="neutral">Cancel</DzButton>
              <DzButton tone="primary">Save changes</DzButton>
            </div>
          </DzCardFooter>
        </DzCard>
      </DzTabContent>

      <!-- Notifications -->
      <DzTabContent value="notifications">
        <DzCard variant="outlined" class="mt-4">
          <DzCardHeader>
            <h2 class="text-base font-semibold">Notification preferences</h2>
            <p class="text-sm text-[var(--dz-muted-foreground)]">Choose how and when we contact you.</p>
          </DzCardHeader>
          <DzCardBody>
            <div class="space-y-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium">Email notifications</p>
                  <p class="text-xs text-[var(--dz-muted-foreground)]">Account activity and security alerts.</p>
                </div>
                <DzSwitch v-model="emailNotifications" aria-label="Email notifications" />
              </div>
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium">Push notifications</p>
                  <p class="text-xs text-[var(--dz-muted-foreground)]">Real-time alerts on your devices.</p>
                </div>
                <DzSwitch v-model="pushNotifications" aria-label="Push notifications" />
              </div>
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium">Weekly digest</p>
                  <p class="text-xs text-[var(--dz-muted-foreground)]">A summary of activity every Monday.</p>
                </div>
                <DzSwitch v-model="weeklyDigest" aria-label="Weekly digest" />
              </div>
            </div>
          </DzCardBody>
          <DzCardFooter>
            <div class="flex justify-end gap-3 w-full">
              <DzButton tone="primary">Save preferences</DzButton>
            </div>
          </DzCardFooter>
        </DzCard>
      </DzTabContent>

      <!-- Security -->
      <DzTabContent value="security">
        <DzCard variant="outlined" class="mt-4">
          <DzCardHeader>
            <h2 class="text-base font-semibold">Security</h2>
            <p class="text-sm text-[var(--dz-muted-foreground)]">Protect your account.</p>
          </DzCardHeader>
          <DzCardBody>
            <div class="space-y-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-medium">Two-factor authentication</p>
                  <p class="text-xs text-[var(--dz-muted-foreground)]">Require a one-time code at sign-in.</p>
                </div>
                <DzSwitch v-model="twoFactor" aria-label="Two-factor authentication" />
              </div>
              <DzFormField>
                <DzFormLabel>New password</DzFormLabel>
                <DzInput type="password" placeholder="••••••••" />
                <DzFormDescription>At least 12 characters.</DzFormDescription>
              </DzFormField>
            </div>
          </DzCardBody>
          <DzCardFooter>
            <div class="flex justify-end gap-3 w-full">
              <DzButton tone="primary">Update security</DzButton>
            </div>
          </DzCardFooter>
        </DzCard>
      </DzTabContent>
    </DzTabs>
  </div>
`

// ---------------------------------------------------------------------------
// Default — full settings page, interactive tab switching
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Settings Page',
  render: () => ({
    components,
    setup: useSettings,
    template,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Profile is the default tab.
    await expect(canvas.getByText('Public profile')).toBeInTheDocument()

    // Switching to the Notifications tab swaps the panel content.
    await userEvent.click(canvas.getByRole('tab', { name: 'Notifications' }))
    await expect(canvas.getByText('Notification preferences')).toBeInTheDocument()

    // And to Security.
    await userEvent.click(canvas.getByRole('tab', { name: 'Security' }))
    await expect(canvas.getByText('Two-factor authentication')).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Settings Page – Dark Mode',
  parameters: { layout: 'fullscreen' },
  decorators: [darkModeDecorator],
  render: () => ({
    components,
    setup: useSettings,
    template,
  }),
}
