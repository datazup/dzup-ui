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
import { computed, reactive, ref, watch } from 'vue'
import SchemaFormRenderer from '../components/SchemaFormRenderer.vue'
import type { JsonSchema } from '../schema/jsonSchema.ts'
import { initialFormData, isFormReady } from '../schema/jsonSchema.ts'

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

// ─── Schema-driven form (inverse of the composed form above) ───

const basicSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft-07/schema',
  title: 'Workspace Setup',
  type: 'object',
  required: ['workspaceName', 'accountType', 'country', 'launchDate', 'frameworks', 'billingPlan', 'termsAccepted'],
  properties: {
    workspaceName: {
      type: 'string',
      title: 'Workspace Name',
      placeholder: 'e.g. Acme Platform',
      description: 'Shown to teammates and on invoices.',
      maxLength: 60,
    },
    contactEmail: {
      type: 'string',
      title: 'Contact Email',
      format: 'email',
      description: 'Used for billing receipts and security alerts.',
    },
    accountType: {
      type: 'string',
      title: 'Account Type',
      enum: ['personal', 'startup', 'enterprise'],
      enumLabels: {
        personal: 'Personal Workspace',
        startup: 'Startup Team',
        enterprise: 'Enterprise',
      },
    },
    country: {
      type: 'string',
      title: 'Country',
      enum: ['us', 'de', 'ba', 'uk', 'ca'],
      enumLabels: { us: 'United States', de: 'Germany', ba: 'Bosnia and Herzegovina', uk: 'United Kingdom', ca: 'Canada' },
    },
    launchDate: {
      type: 'string',
      title: 'Launch Date',
      format: 'date',
      minimum: '2026-01-01',
      maximum: '2027-12-31',
    },
    frameworks: {
      type: 'array',
      title: 'Preferred Stack',
      maxItems: 3,
      default: ['vue'],
      items: {
        type: 'string',
        enum: ['vue', 'react', 'angular', 'svelte', 'solid'],
        enumLabels: { vue: 'Vue', react: 'React', angular: 'Angular', svelte: 'Svelte', solid: 'Solid' },
      },
    },
    billingPlan: {
      type: 'string',
      title: 'Billing Plan',
      enum: ['starter', 'pro', 'enterprise'],
      enumLabels: { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' },
      default: 'pro',
      'x-widget': 'radio-group',
    },
    notifications: {
      type: 'array',
      title: 'Notification Channels',
      default: ['email'],
      items: {
        type: 'string',
        enum: ['email', 'sms', 'push'],
        enumLabels: { email: 'Email', sms: 'SMS', push: 'Push' },
      },
      'x-widget': 'checkbox-group',
    },
    budget: {
      type: 'integer',
      title: 'Budget Confidence',
      minimum: 0,
      maximum: 100,
      default: 55,
      description: 'Slider rendered because integer has bounded min/max.',
    },
    seats: {
      type: 'integer',
      title: 'Seats',
      minimum: 1,
      multipleOf: 1,
      default: 5,
      'x-widget': 'number',
    },
    notes: {
      type: 'string',
      title: 'Internal Notes',
      format: 'textarea',
      placeholder: 'Anything reviewers should know...',
    },
    autoRenew: {
      type: 'boolean',
      title: 'Auto-renew subscription',
      default: true,
    },
    termsAccepted: {
      type: 'boolean',
      title: 'I agree to the Terms of Service and Privacy Policy',
      'x-widget': 'checkbox',
    },
  },
}

const advancedSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft-07/schema',
  title: 'Workspace Setup',
  type: 'object',
  required: ['workspaceName', 'accountType', 'country', 'launchDate', 'frameworks', 'billingPlan', 'termsAccepted'],
  'x-layout': { columns: 12, gap: '14px' },
  'x-groups': [
    { id: 'identity', title: 'Identity', description: 'Who owns this workspace and how to reach you.', columns: 12 },
    { id: 'plan', title: 'Plan & Stack', description: 'Pick a plan and the frameworks you intend to ship with.', columns: 12 },
    { id: 'preferences', title: 'Preferences', columns: 12 },
    { id: 'consent', columns: 1 },
  ],
  properties: {
    workspaceName: {
      type: 'string', title: 'Workspace Name', placeholder: 'e.g. Acme Platform',
      description: 'Shown to teammates and on invoices.', maxLength: 60,
      'x-group': 'identity', 'x-layout': { colSpan: 8, order: 1 },
    },
    accountType: {
      type: 'string', title: 'Account Type',
      enum: ['personal', 'startup', 'enterprise'],
      enumLabels: { personal: 'Personal Workspace', startup: 'Startup Team', enterprise: 'Enterprise' },
      'x-group': 'identity', 'x-layout': { colSpan: 4, order: 2 },
    },
    contactEmail: {
      type: 'string', title: 'Contact Email', format: 'email',
      description: 'Used for billing receipts and security alerts.',
      'x-group': 'identity', 'x-layout': { colSpan: 6, order: 3 },
    },
    country: {
      type: 'string', title: 'Country',
      enum: ['us', 'de', 'ba', 'uk', 'ca'],
      enumLabels: { us: 'United States', de: 'Germany', ba: 'Bosnia and Herzegovina', uk: 'United Kingdom', ca: 'Canada' },
      'x-group': 'identity', 'x-layout': { colSpan: 3, order: 4 },
    },
    launchDate: {
      type: 'string', title: 'Launch Date', format: 'date',
      minimum: '2026-01-01', maximum: '2027-12-31',
      'x-group': 'identity', 'x-layout': { colSpan: 3, order: 5 },
    },
    billingPlan: {
      type: 'string', title: 'Billing Plan',
      enum: ['starter', 'pro', 'enterprise'],
      enumLabels: { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' },
      default: 'pro', 'x-widget': 'radio-group',
      'x-group': 'plan', 'x-layout': { colSpan: 6, order: 1 },
    },
    seats: {
      type: 'integer', title: 'Seats', minimum: 1, multipleOf: 1, default: 5,
      'x-widget': 'number', 'x-group': 'plan', 'x-layout': { colSpan: 3, order: 2 },
    },
    budget: {
      type: 'integer', title: 'Budget Confidence',
      minimum: 0, maximum: 100, default: 55,
      description: 'Slider rendered because integer has bounded min/max.',
      'x-group': 'plan', 'x-layout': { colSpan: 3, order: 3 },
    },
    frameworks: {
      type: 'array', title: 'Preferred Stack', maxItems: 3, default: ['vue'],
      items: {
        type: 'string',
        enum: ['vue', 'react', 'angular', 'svelte', 'solid'],
        enumLabels: { vue: 'Vue', react: 'React', angular: 'Angular', svelte: 'Svelte', solid: 'Solid' },
      },
      'x-group': 'plan', 'x-layout': { colSpan: 12, order: 4 },
    },
    notifications: {
      type: 'array', title: 'Notification Channels', default: ['email'],
      items: {
        type: 'string',
        enum: ['email', 'sms', 'push'],
        enumLabels: { email: 'Email', sms: 'SMS', push: 'Push' },
      },
      'x-widget': 'checkbox-group',
      'x-group': 'preferences', 'x-layout': { colSpan: 8, order: 1 },
    },
    autoRenew: {
      type: 'boolean', title: 'Auto-renew subscription', default: true,
      'x-group': 'preferences', 'x-layout': { colSpan: 4, order: 2 },
    },
    notes: {
      type: 'string', title: 'Internal Notes', format: 'textarea',
      placeholder: 'Anything reviewers should know...',
      'x-group': 'preferences', 'x-layout': { colSpan: 12, order: 3 },
    },
    termsAccepted: {
      type: 'boolean', title: 'I agree to the Terms of Service and Privacy Policy',
      'x-widget': 'checkbox', 'x-group': 'consent',
    },
  },
}

const showAdvanced = ref(false)
const schemaSource = ref(JSON.stringify(basicSchema, null, 2))
const parseError = ref<string | null>(null)
const activeSchema = ref<JsonSchema>(basicSchema)
const schemaFormData = reactive(initialFormData(basicSchema))
const lastSubmitted = ref<string | null>(null)
const advancedSchemaSource = JSON.stringify(advancedSchema, null, 2)

function toggleSource(): void {
  showAdvanced.value = !showAdvanced.value
}

watch(schemaSource, (next) => {
  try {
    const parsed = JSON.parse(next) as JsonSchema
    if (!parsed || parsed.type !== 'object' || !parsed.properties)
      throw new Error('Schema must be an object with `type: "object"` and `properties`.')
    parseError.value = null
    activeSchema.value = parsed
    const fresh = initialFormData(parsed)
    for (const k of Object.keys(schemaFormData)) delete schemaFormData[k]
    Object.assign(schemaFormData, fresh)
    lastSubmitted.value = null
  }
  catch (err) {
    parseError.value = err instanceof Error ? err.message : String(err)
  }
})

const schemaReady = computed(() => isFormReady(activeSchema.value, schemaFormData))
const schemaSnapshot = computed(() => JSON.stringify(schemaFormData, null, 2))

function submitSchemaForm(): void {
  if (!schemaReady.value) return
  lastSubmitted.value = schemaSnapshot.value
  // eslint-disable-next-line no-console
  console.info('[schema-form submit]', JSON.parse(schemaSnapshot.value))
}

function resetSchemaForm(): void {
  const fresh = initialFormData(activeSchema.value)
  for (const k of Object.keys(schemaFormData)) delete schemaFormData[k]
  Object.assign(schemaFormData, fresh)
  lastSubmitted.value = null
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

    <section class="demo-section">
      <div class="section-head">
        <h2 class="section-title">
          Render From JSON Schema
        </h2>
        <span class="section-badge" :class="{ ready: schemaReady }">
          {{ schemaReady ? 'Ready to submit' : 'Missing required fields' }}
        </span>
      </div>
      <p class="section-intro">
        Inverse of the composed form above: edit the JSON Schema on the left and the form is rendered from it.
        Layout is also schema-driven via <code>x-layout</code> (grid columns, per-field <code>colSpan</code> / <code>order</code>)
        and <code>x-groups</code> (named fieldsets).
      </p>

      <div class="three-column">
        <div class="schema-pane">
          <div class="pane-head">
            <h3 class="pane-title">
              JSON Schema (editable)
            </h3>
            <span v-if="parseError" class="parse-error">Invalid JSON</span>
            <span v-else class="parse-ok">Parsed</span>
          </div>
          <textarea
            v-model="schemaSource"
            class="schema-editor"
            spellcheck="false"
            aria-label="JSON Schema source"
          />
          <p v-if="parseError" class="error-message">
            {{ parseError }}
          </p>
        </div>

        <div class="form-pane">
          <h3 class="pane-title">
            Rendered Form
          </h3>
          <SchemaFormRenderer :schema="activeSchema" :model-value="schemaFormData" />

          <div class="actions-row">
            <button class="primary-btn" type="button" :disabled="!schemaReady" @click="submitSchemaForm">
              Submit
            </button>
            <button class="plain-btn" type="button" @click="resetSchemaForm">
              Reset
            </button>
          </div>
        </div>

        <aside class="preview-pane">
          <h3 class="pane-title">
            Live Form Data
          </h3>
          <pre class="preview-code">{{ schemaSnapshot }}</pre>
          <template v-if="lastSubmitted">
            <h4 class="preview-subtitle">
              Last submitted payload
            </h4>
            <pre class="preview-code submitted">{{ lastSubmitted }}</pre>
          </template>
        </aside>
      </div>

      <div class="source-reveal">
        <button
          type="button"
          class="source-reveal-button"
          :class="{ open: showAdvanced }"
          :aria-expanded="showAdvanced"
          aria-controls="schema-source-panel"
          @click="toggleSource"
        >
          <span class="source-reveal-chevron" aria-hidden="true">{{ showAdvanced ? '▾' : '▸' }}</span>
          <span>{{ showAdvanced ? 'Hide schema directives reference' : 'Show schema directives reference' }}</span>
          <span class="source-reveal-meta">{{ showAdvanced ? '' : 'See what x-* properties you can use to shape the form' }}</span>
        </button>

        <div v-if="showAdvanced" id="schema-source-panel" class="source-reveal-panel">
          <div class="source-reveal-grid">
            <section class="directive-section">
              <h4 class="directive-title">
                Available directives
              </h4>
              <p class="directive-intro">
                These vendor extensions live alongside standard JSON Schema fields. They influence layout and widget
                selection without altering the validated data shape.
              </p>
              <dl class="directive-list">
                <div class="directive-row">
                  <dt><code>x-widget</code> <span class="directive-scope">field</span></dt>
                  <dd>Override the inferred control: <code>radio-group</code>, <code>checkbox-group</code>, <code>checkbox</code>, <code>slider</code>, <code>number</code>, <code>textarea</code>, <code>switch</code>, <code>select</code>, <code>multi-select</code>, <code>date</code>, <code>email</code>, <code>password</code>.</dd>
                </div>
                <div class="directive-row">
                  <dt><code>x-layout</code> <span class="directive-scope">root</span></dt>
                  <dd>Default grid for groups that don't override: <code>{ columns: number, gap: string }</code>. Defaults to 2 columns.</dd>
                </div>
                <div class="directive-row">
                  <dt><code>x-groups</code> <span class="directive-scope">root</span></dt>
                  <dd>Ordered array of <code>{ id, title?, description?, columns? }</code>. Groups with a <code>title</code> render as <code>&lt;fieldset&gt;</code>; without, as a bare row.</dd>
                </div>
                <div class="directive-row">
                  <dt><code>x-group</code> <span class="directive-scope">field</span></dt>
                  <dd>Routes the field into the matching <code>x-groups</code> entry. Unset → default ungrouped bucket.</dd>
                </div>
                <div class="directive-row">
                  <dt><code>x-layout.colSpan</code> <span class="directive-scope">field</span></dt>
                  <dd>Grid column span, clamped to the group's column count. Use this for half-, third-, or full-width fields.</dd>
                </div>
                <div class="directive-row">
                  <dt><code>x-layout.order</code> <span class="directive-scope">field</span></dt>
                  <dd>Sort order within the group. Lower renders first; ties keep declaration order.</dd>
                </div>
                <div class="directive-row">
                  <dt><code>enumLabels</code> <span class="directive-scope">field</span></dt>
                  <dd>Map of <code>{ value: 'Display Label' }</code> applied to <code>enum</code> / <code>items.enum</code> options.</dd>
                </div>
                <div class="directive-row">
                  <dt><code>format</code> <span class="directive-scope">field</span></dt>
                  <dd>Standard JSON Schema hint. <code>date</code> → DzDatePicker, <code>email</code> / <code>password</code> / <code>textarea</code> swap the string control accordingly.</dd>
                </div>
              </dl>
            </section>

            <section class="source-section">
              <h4 class="directive-title">
                Reference schema
              </h4>
              <p class="directive-intro">
                A worked example using every directive above. Copy snippets into the editor on the left to try them out
                — the form will re-render automatically.
              </p>
              <pre class="reference-code">{{ advancedSchemaSource }}</pre>
            </section>
          </div>
        </div>
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

/* ─── Schema-driven section ─── */

.section-intro {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dz-muted-foreground, #64748b);
  max-width: 820px;
}

.section-intro code {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.three-column {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 16px;
  align-items: start;
}

.schema-pane,
.form-pane,
.preview-pane {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: var(--dz-radius-md, 6px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-background, #f8fafc);
}

.pane-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pane-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.parse-ok,
.parse-error {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--dz-radius-full, 9999px);
}

.parse-ok {
  color: var(--dz-success-muted-foreground, #166534);
  background: var(--dz-success-muted, #dcfce7);
}

.parse-error {
  color: var(--dz-danger-muted-foreground, #991b1b);
  background: var(--dz-danger-muted, #fee2e2);
}

.schema-editor {
  flex: 1;
  min-height: 520px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.45;
  padding: 12px;
  border-radius: var(--dz-radius-sm, 4px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
  color: var(--dz-foreground, #1a202c);
  outline: none;
}

.schema-editor:focus-visible {
  border-color: var(--dz-primary, #3b82f6);
  box-shadow: 0 0 0 3px var(--dz-primary-muted, #dbeafe);
}

.error-message {
  margin: 0;
  font-size: 12px;
  color: var(--dz-danger, #dc2626);
}

.preview-code.submitted {
  border-color: var(--dz-success, #16a34a);
}

.preview-subtitle {
  margin: 8px 0 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--dz-success, #16a34a);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.source-reveal {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-reveal-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--dz-radius-md, 6px);
  border: 1px dashed var(--dz-border, #e2e8f0);
  background: var(--dz-background, #f8fafc);
  color: var(--dz-foreground, #1a202c);
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.source-reveal-button:hover {
  border-color: var(--dz-colors-primary-300, #93c5fd);
  background: var(--dz-colors-primary-50, #eff6ff);
}

.source-reveal-button.open {
  border-style: solid;
  border-color: var(--dz-colors-primary-300, #93c5fd);
  background: var(--dz-colors-primary-50, #eff6ff);
  color: var(--dz-colors-primary-700, #1d4ed8);
}

.source-reveal-chevron {
  display: inline-block;
  width: 14px;
  text-align: center;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
  transition: transform var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.source-reveal-button.open .source-reveal-chevron {
  color: var(--dz-colors-primary-700, #1d4ed8);
}

.source-reveal-meta {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: var(--dz-muted-foreground, #64748b);
}

.source-reveal-panel {
  padding: 18px;
  border-radius: var(--dz-radius-md, 6px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
}

.source-reveal-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 20px;
  align-items: start;
}

.directive-title {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.directive-intro {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--dz-muted-foreground, #64748b);
}

.directive-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.directive-row {
  padding: 10px 12px;
  border-radius: var(--dz-radius-sm, 4px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-background, #f8fafc);
}

.directive-row dt {
  margin: 0 0 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.directive-row dt code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-colors-primary-50, #eff6ff);
  color: var(--dz-colors-primary-700, #1d4ed8);
  font-weight: 700;
}

.directive-scope {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
}

.directive-row dd {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--dz-foreground, #1a202c);
}

.directive-row dd code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  padding: 0 4px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.reference-code {
  margin: 0;
  max-height: 520px;
  overflow: auto;
  padding: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.5;
  border-radius: var(--dz-radius-sm, 4px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-background, #f8fafc);
  color: var(--dz-foreground, #1a202c);
}

@media (max-width: 1180px) {
  .three-column {
    grid-template-columns: 1fr;
  }

  .source-reveal-grid {
    grid-template-columns: 1fr;
  }

  .source-reveal-meta {
    display: none;
  }
}
</style>
