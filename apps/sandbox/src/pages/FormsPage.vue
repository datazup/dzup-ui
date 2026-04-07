<script setup lang="ts">
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
} from '@dzup-ui/core'
import type { DzSelectItem } from '@dzup-ui/core'
import { computed, ref } from 'vue'

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

const budgetTone = computed<'danger' | 'warning' | 'success'>(() => {
  if (budget.value < 35)
    return 'danger'
  if (budget.value < 70)
    return 'warning'
  return 'success'
})

const formReady = computed(() => {
  return Boolean(
    accountType.value
    && country.value
    && city.value
    && launchDate.value
    && billingPlan.value
    && frameworks.value.length > 0
    && termsAccepted.value,
  )
})

const snapshot = computed(() => {
  return JSON.stringify({
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
  }, null, 2)
})

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
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">
        Forms
      </h1>
      <p class="page-description">
        Interactive form controls with composed fields, validation state, and live data preview.
      </p>
    </header>

    <section class="demo-section">
      <div class="section-head">
        <h2 class="section-title">
          Composed Form
        </h2>
        <span class="section-badge" :class="{ ready: formReady }">
          {{ formReady ? 'Ready to submit' : 'Missing required fields' }}
        </span>
      </div>

      <div class="form-layout">
        <div class="form-column">
          <div class="field-grid">
            <DzFormField required>
              <DzFormLabel>Account Type</DzFormLabel>
              <DzSelect
                v-model="accountType"
                :items="accountTypeItems"
                placeholder="Choose account type"
              />
              <DzFormDescription>
                Sets default limits and collaboration features.
              </DzFormDescription>
              <DzFormMessage />
            </DzFormField>

            <DzFormField required>
              <DzFormLabel>Country</DzFormLabel>
              <DzSelect
                v-model="country"
                :items="countryItems"
                placeholder="Choose country"
              />
              <DzFormMessage />
            </DzFormField>

            <DzFormField required>
              <DzFormLabel>City</DzFormLabel>
              <DzCombobox
                v-model="city"
                :items="cityItems"
                placeholder="Search city"
              />
              <DzFormDescription>
                Type to filter city options.
              </DzFormDescription>
              <DzFormMessage />
            </DzFormField>

            <DzFormField required>
              <DzFormLabel>Launch Date</DzFormLabel>
              <DzDatePicker
                v-model="launchDate"
                min="2026-01-01"
                max="2027-12-31"
                placeholder="Select launch date"
              />
              <DzFormDescription>
                Only dates between January 1, 2026 and December 31, 2027.
              </DzFormDescription>
              <DzFormMessage />
            </DzFormField>

            <DzFormField required>
              <DzFormLabel>Preferred Stack</DzFormLabel>
              <DzMultiSelect
                v-model="frameworks"
                :items="frameworkItems"
                :max-selections="3"
                placeholder="Select up to 3 frameworks"
              />
              <DzFormMessage />
            </DzFormField>
          </div>

          <div class="option-grid">
            <DzFormField required>
              <DzFormLabel>Billing Plan</DzFormLabel>
              <DzRadioGroup v-model="billingPlan" orientation="horizontal" aria-label="Billing plan">
                <DzRadio value="starter">
                  Starter
                </DzRadio>
                <DzRadio value="pro">
                  Pro
                </DzRadio>
                <DzRadio value="enterprise">
                  Enterprise
                </DzRadio>
              </DzRadioGroup>
              <DzFormMessage />
            </DzFormField>

            <DzFormField>
              <DzFormLabel>Notification Channels</DzFormLabel>
              <DzCheckboxGroup v-model="notifications" orientation="horizontal" aria-label="Notification channels">
                <DzCheckbox value="email">
                  Email
                </DzCheckbox>
                <DzCheckbox value="sms">
                  SMS
                </DzCheckbox>
                <DzCheckbox value="push">
                  Push
                </DzCheckbox>
              </DzCheckboxGroup>
              <DzFormMessage />
            </DzFormField>
          </div>

          <div class="range-stack">
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

          <div class="switch-stack">
            <DzSwitch v-model="autoRenew">
              Auto-renew subscription
            </DzSwitch>
            <DzSwitch v-model="publicProfile">
              Publish public project profile
            </DzSwitch>
          </div>

          <DzFormField :invalid="!termsAccepted" :error="!termsAccepted ? 'Terms must be accepted before submit.' : ''">
            <DzCheckbox v-model="termsAccepted">
              I agree to the Terms of Service and Privacy Policy
            </DzCheckbox>
            <DzFormMessage />
          </DzFormField>

          <div class="actions-row">
            <button class="primary-btn" :disabled="!formReady">
              Create Workspace
            </button>
            <button class="plain-btn" @click="resetForm">
              Reset
            </button>
          </div>
        </div>

        <aside class="preview-card">
          <h3 class="preview-title">
            Live Form State
          </h3>
          <p class="preview-description">
            Use this panel to verify bindings and payload shape while interacting with controls.
          </p>
          <pre class="preview-code">{{ snapshot }}</pre>
        </aside>
      </div>
    </section>

    <section class="demo-section compact">
      <h2 class="section-title">
        Control Variants and Sizes
      </h2>

      <div class="gallery-grid">
        <div class="gallery-item">
          <p class="gallery-title">
            Select Variants
          </p>
          <DzSelect :items="countryItems" placeholder="Outline" variant="outline" />
          <DzSelect :items="countryItems" placeholder="Filled" variant="filled" />
          <DzSelect :items="countryItems" placeholder="Underlined" variant="underlined" />
        </div>

        <div class="gallery-item">
          <p class="gallery-title">
            Switch Sizes
          </p>
          <DzSwitch size="sm" :model-value="false">
            Small
          </DzSwitch>
          <DzSwitch size="md" :model-value="true">
            Medium
          </DzSwitch>
          <DzSwitch size="lg" :model-value="true">
            Large
          </DzSwitch>
        </div>

        <div class="gallery-item">
          <p class="gallery-title">
            Slider Tones
          </p>
          <DzSlider :model-value="30" tone="danger" />
          <DzSlider :model-value="55" tone="warning" />
          <DzSlider :model-value="80" tone="success" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1120px;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0;
  line-height: 1.6;
  max-width: 780px;
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background:
    linear-gradient(180deg, color-mix(in oklch, var(--dz-surface, #fff) 95%, var(--dz-primary, #3b82f6) 5%), var(--dz-surface, #fff));
  box-shadow: var(--dz-shadow-sm, 0 1px 3px rgb(0 0 0 / 0.08));
}

.demo-section.compact {
  background: var(--dz-surface, #fff);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0;
}

.section-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-warning-muted-foreground, #92400e);
  background: var(--dz-warning-muted, #fef3c7);
}

.section-badge.ready {
  color: var(--dz-success-muted-foreground, #166534);
  background: var(--dz-success-muted, #dcfce7);
}

.form-layout {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 18px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.range-stack,
.switch-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-card {
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: color-mix(in oklch, var(--dz-surface, #fff) 96%, var(--dz-muted, #f1f5f9) 4%);
  padding: 16px;
  height: fit-content;
  position: sticky;
  top: 16px;
}

.preview-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
}

.preview-description {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
  line-height: 1.5;
}

.preview-code {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  border-radius: var(--dz-radius-md, 6px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-background, #f8fafc);
  padding: 12px;
  overflow: auto;
  max-height: 520px;
}

.actions-row {
  display: flex;
  gap: 10px;
  margin-top: 2px;
}

.primary-btn,
.plain-btn {
  border-radius: var(--dz-radius-md, 6px);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  cursor: pointer;
  transition: all var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.primary-btn {
  border: 1px solid transparent;
  background: var(--dz-primary, #3b82f6);
  color: var(--dz-primary-foreground, #fff);
}

.primary-btn:hover:not(:disabled) {
  background: var(--dz-primary-hover, #2563eb);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.plain-btn {
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
  color: var(--dz-foreground, #1a202c);
}

.plain-btn:hover {
  background: var(--dz-muted, #f1f5f9);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.gallery-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: var(--dz-radius-md, 6px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
}

.gallery-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
}

@media (max-width: 1180px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .preview-card {
    position: static;
  }
}

@media (max-width: 900px) {
  .field-grid,
  .option-grid,
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .demo-section {
    padding: 18px;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
