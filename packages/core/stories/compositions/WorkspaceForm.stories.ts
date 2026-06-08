import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { computed, ref } from 'vue'
import { darkModeDecorator } from '../_shared'
import { DzButton } from '../../src/components/buttons'
import type { DzSelectItem } from '../../src/components/forms'
import {
  DzCheckbox,
  DzCheckboxGroup,
  DzCombobox,
  DzDatePicker,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzMultiSelect,
  DzRadio,
  DzRadioGroup,
  DzSelect,
  DzSlider,
  DzSwitch,
} from '../../src/components/forms'

/**
 * WorkspaceForm is the flagship real-world composition for the Forms family,
 * ported from the sandbox `FormsPage`.
 *
 * It composes nearly every form control — DzSelect, DzCombobox, DzDatePicker,
 * DzMultiSelect (with `max-selections`), DzRadioGroup, DzCheckboxGroup, tone-by-value
 * DzSlider, DzSwitch, and a terms DzCheckbox — inside accessible `DzFormField`
 * wrappers, alongside a **live JSON state preview** and a "Ready / Missing required
 * fields" status badge so consumers can verify bindings and payload shape while
 * interacting with the controls.
 */
const meta = {
  title: 'Core/Compositions/WorkspaceForm',
  component: undefined,
  tags: ['autodocs', 'composition', 'status:stable'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Flagship form composition: every form control wired through DzFormField, with a live JSON state preview and a required-fields readiness badge.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Shared option data
// ---------------------------------------------------------------------------

const accountTypeItems: DzSelectItem[] = [
  { label: 'Personal Workspace', value: 'personal' },
  { label: 'Startup Team', value: 'startup' },
  { label: 'Enterprise', value: 'enterprise' },
]

const countryItems: DzSelectItem[] = [
  { label: 'United States', value: 'us' },
  { label: 'Germany', value: 'de' },
  { label: 'Bosnia and Herzegovina', value: 'ba' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
]

const cityItems: DzSelectItem[] = [
  { label: 'New York', value: 'nyc' },
  { label: 'San Francisco', value: 'sf' },
  { label: 'Chicago', value: 'chi' },
  { label: 'Berlin', value: 'ber' },
  { label: 'London', value: 'lon' },
  { label: 'Toronto', value: 'tor' },
  { label: 'Sarajevo', value: 'sjj' },
]

const frameworkItems: DzSelectItem[] = [
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'solid' },
]

/** Shared `setup()` that wires the composed form state, derived tone, readiness, and JSON snapshot. */
function useWorkspaceForm() {
  const accountType = ref('')
  const country = ref('')
  const city = ref('')
  const launchDate = ref('')
  const frameworks = ref<string[]>(['vue'])
  const billingPlan = ref('pro')
  const notifications = ref<string[]>(['email'])
  const budget = ref(55)
  const usageLimit = ref(60)
  const autoRenew = ref(true)
  const publicProfile = ref(false)
  const termsAccepted = ref(false)

  const budgetTone = computed<'danger' | 'warning' | 'success'>(() => {
    if (budget.value < 35) return 'danger'
    if (budget.value < 70) return 'warning'
    return 'success'
  })

  const formReady = computed(() =>
    Boolean(
      accountType.value
      && country.value
      && city.value
      && launchDate.value
      && billingPlan.value
      && frameworks.value.length > 0
      && termsAccepted.value,
    ),
  )

  const snapshot = computed(() =>
    JSON.stringify(
      {
        accountType: accountType.value,
        country: country.value,
        city: city.value,
        launchDate: launchDate.value,
        frameworks: frameworks.value,
        billingPlan: billingPlan.value,
        notifications: notifications.value,
        budget: budget.value,
        usageLimit: usageLimit.value,
        autoRenew: autoRenew.value,
        publicProfile: publicProfile.value,
        termsAccepted: termsAccepted.value,
      },
      null,
      2,
    ),
  )

  function resetForm(): void {
    accountType.value = ''
    country.value = ''
    city.value = ''
    launchDate.value = ''
    frameworks.value = ['vue']
    billingPlan.value = 'pro'
    notifications.value = ['email']
    budget.value = 55
    usageLimit.value = 60
    autoRenew.value = true
    publicProfile.value = false
    termsAccepted.value = false
  }

  return {
    accountType,
    country,
    city,
    launchDate,
    frameworks,
    billingPlan,
    notifications,
    budget,
    usageLimit,
    autoRenew,
    publicProfile,
    termsAccepted,
    budgetTone,
    formReady,
    snapshot,
    resetForm,
    accountTypeItems,
    countryItems,
    cityItems,
    frameworkItems,
  }
}

const formComponents = {
  DzButton,
  DzCheckbox,
  DzCheckboxGroup,
  DzCombobox,
  DzDatePicker,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzMultiSelect,
  DzRadio,
  DzRadioGroup,
  DzSelect,
  DzSlider,
  DzSwitch,
}

const formTemplate = `
  <div class="mx-auto max-w-5xl">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-[var(--dz-foreground)]">Create Workspace</h1>
      <p class="mt-1 text-sm text-[var(--dz-muted-foreground)]">
        Interactive form controls with composed fields, validation state, and live data preview.
      </p>
    </header>

    <section class="rounded-[var(--dz-radius-lg)] border border-[var(--dz-border)] p-6 shadow-[var(--dz-shadow-sm)]">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-[var(--dz-foreground)]">Composed Form</h2>
        <span
          class="rounded-[var(--dz-radius-full)] px-2.5 py-1 text-xs font-semibold"
          :class="formReady
            ? 'bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)]'
            : 'bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)]'"
        >
          {{ formReady ? 'Ready to submit' : 'Missing required fields' }}
        </span>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr]">
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DzFormField required>
              <DzFormLabel>Account Type</DzFormLabel>
              <DzSelect v-model="accountType" :items="accountTypeItems" placeholder="Choose account type" />
              <DzFormDescription>Sets default limits and collaboration features.</DzFormDescription>
              <DzFormMessage />
            </DzFormField>

            <DzFormField required>
              <DzFormLabel>Country</DzFormLabel>
              <DzSelect v-model="country" :items="countryItems" placeholder="Choose country" />
              <DzFormMessage />
            </DzFormField>

            <DzFormField required>
              <DzFormLabel>City</DzFormLabel>
              <DzCombobox v-model="city" :items="cityItems" placeholder="Search city" />
              <DzFormDescription>Type to filter city options.</DzFormDescription>
              <DzFormMessage />
            </DzFormField>

            <DzFormField required>
              <DzFormLabel>Launch Date</DzFormLabel>
              <DzDatePicker v-model="launchDate" min="2026-01-01" max="2027-12-31" placeholder="Select launch date" />
              <DzFormDescription>Only dates between Jan 1, 2026 and Dec 31, 2027.</DzFormDescription>
              <DzFormMessage />
            </DzFormField>

            <DzFormField required>
              <DzFormLabel>Preferred Stack</DzFormLabel>
              <DzMultiSelect v-model="frameworks" :items="frameworkItems" :max-selections="3" placeholder="Select up to 3 frameworks" />
              <DzFormMessage />
            </DzFormField>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DzFormField required>
              <DzFormLabel>Billing Plan</DzFormLabel>
              <DzRadioGroup v-model="billingPlan" orientation="horizontal" aria-label="Billing plan">
                <DzRadio value="starter">Starter</DzRadio>
                <DzRadio value="pro">Pro</DzRadio>
                <DzRadio value="enterprise">Enterprise</DzRadio>
              </DzRadioGroup>
              <DzFormMessage />
            </DzFormField>

            <DzFormField>
              <DzFormLabel>Notification Channels</DzFormLabel>
              <DzCheckboxGroup v-model="notifications" orientation="horizontal" aria-label="Notification channels">
                <DzCheckbox value="email">Email</DzCheckbox>
                <DzCheckbox value="sms">SMS</DzCheckbox>
                <DzCheckbox value="push">Push</DzCheckbox>
              </DzCheckboxGroup>
              <DzFormMessage />
            </DzFormField>
          </div>

          <div class="flex flex-col gap-3">
            <DzFormField>
              <DzFormLabel>Budget Confidence</DzFormLabel>
              <DzSlider v-model="budget" :tone="budgetTone" :min="0" :max="100" />
              <DzFormDescription>{{ budget }}% confidence in allocated budget.</DzFormDescription>
              <DzFormMessage />
            </DzFormField>

            <DzFormField>
              <DzFormLabel>Usage Alert Threshold</DzFormLabel>
              <DzSlider v-model="usageLimit" tone="info" :min="10" :max="100" :step="5" />
              <DzFormDescription>Alerts trigger when usage goes above {{ usageLimit }}%.</DzFormDescription>
              <DzFormMessage />
            </DzFormField>
          </div>

          <div class="flex flex-col gap-3">
            <DzSwitch v-model="autoRenew">Auto-renew subscription</DzSwitch>
            <DzSwitch v-model="publicProfile">Publish public project profile</DzSwitch>
          </div>

          <DzFormField :invalid="!termsAccepted" :error="!termsAccepted ? 'Terms must be accepted before submit.' : ''">
            <DzCheckbox v-model="termsAccepted" aria-label="Accept terms and privacy policy">
              I agree to the Terms of Service and Privacy Policy
            </DzCheckbox>
            <DzFormMessage />
          </DzFormField>

          <div class="flex gap-2.5">
            <DzButton tone="primary" :disabled="!formReady">Create Workspace</DzButton>
            <DzButton variant="ghost" tone="neutral" @click="resetForm">Reset</DzButton>
          </div>
        </div>

        <aside class="sticky top-4 h-fit rounded-[var(--dz-radius-lg)] border border-[var(--dz-border)] bg-[var(--dz-muted)] p-4">
          <h3 class="text-sm font-bold text-[var(--dz-foreground)]">Live Form State</h3>
          <p class="mb-3 mt-1 text-xs text-[var(--dz-muted-foreground)]">
            Verify bindings and payload shape while interacting with controls.
          </p>
          <pre class="max-h-[520px] overflow-auto rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-background)] p-3 text-xs leading-relaxed text-[var(--dz-foreground)]">{{ snapshot }}</pre>
        </aside>
      </div>
    </section>
  </div>
`

// ---------------------------------------------------------------------------
// Default: the full composed form
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Workspace Form',
  render: () => ({
    components: formComponents,
    setup: useWorkspaceForm,
    template: formTemplate,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The readiness badge starts in the "missing" state.
    await expect(canvas.getByText(/missing required fields/i)).toBeInTheDocument()

    // Accepting the terms is a real interaction the a11y audit can also scan.
    const terms = canvas.getByRole('checkbox', { name: /accept terms/i })
    await userEvent.click(terms)
    await expect(terms).toBeChecked()

    // The live preview reflects the new state.
    await expect(canvas.getByText(/"termsAccepted": true/)).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Workspace Form – Dark Mode',
  decorators: [darkModeDecorator],
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: formComponents,
    setup: useWorkspaceForm,
    template: formTemplate,
  }),
}
