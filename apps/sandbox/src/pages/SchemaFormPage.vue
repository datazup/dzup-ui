<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import SchemaFormRenderer from '../components/SchemaFormRenderer.vue'
import type { JsonSchema } from '../schema/jsonSchema.ts'
import { initialFormData, isFormReady } from '../schema/jsonSchema.ts'

const exampleSchema: JsonSchema = {
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
      description: 'Sets default limits and collaboration features.',
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
      description: 'Only dates between January 1, 2026 and December 31, 2027.',
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

const schemaSource = ref(JSON.stringify(exampleSchema, null, 2))
const parseError = ref<string | null>(null)
const activeSchema = ref<JsonSchema>(exampleSchema)
const formData = reactive(initialFormData(exampleSchema))
const lastSubmitted = ref<string | null>(null)

watch(schemaSource, (next) => {
  try {
    const parsed = JSON.parse(next) as JsonSchema
    if (!parsed || parsed.type !== 'object' || !parsed.properties)
      throw new Error('Schema must be an object with `type: "object"` and `properties`.')
    parseError.value = null
    activeSchema.value = parsed
    const fresh = initialFormData(parsed)
    for (const k of Object.keys(formData)) delete formData[k]
    Object.assign(formData, fresh)
    lastSubmitted.value = null
  }
  catch (err) {
    parseError.value = err instanceof Error ? err.message : String(err)
  }
})

const ready = computed(() => isFormReady(activeSchema.value, formData))
const snapshot = computed(() => JSON.stringify(formData, null, 2))

function submit(): void {
  if (!ready.value) return
  lastSubmitted.value = snapshot.value
  // eslint-disable-next-line no-console
  console.info('[schema-form submit]', JSON.parse(snapshot.value))
}

function reset(): void {
  const fresh = initialFormData(activeSchema.value)
  for (const k of Object.keys(formData)) delete formData[k]
  Object.assign(formData, fresh)
  lastSubmitted.value = null
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">
        Schema → Form
      </h1>
      <p class="page-description">
        Edit a JSON Schema document on the left; the form on the right is rendered from it and binds to a live data object.
        This is the inverse of <code>/forms</code>, which emits values from a static UI form.
      </p>
    </header>

    <section class="demo-section">
      <div class="section-head">
        <h2 class="section-title">
          Live Render
        </h2>
        <span class="section-badge" :class="{ ready }">
          {{ ready ? 'Ready to submit' : 'Missing required fields' }}
        </span>
      </div>

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
          <SchemaFormRenderer :schema="activeSchema" :model-value="formData" />

          <div class="actions-row">
            <button class="primary-btn" :disabled="!ready" @click="submit">
              Submit
            </button>
            <button class="plain-btn" @click="reset">
              Reset
            </button>
          </div>
        </div>

        <aside class="preview-pane">
          <h3 class="pane-title">
            Live Form Data
          </h3>
          <pre class="preview-code">{{ snapshot }}</pre>
          <template v-if="lastSubmitted">
            <h4 class="preview-subtitle">
              Last submitted payload
            </h4>
            <pre class="preview-code submitted">{{ lastSubmitted }}</pre>
          </template>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1280px;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-foreground);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-muted-foreground);
  margin: 0;
  line-height: 1.6;
  max-width: 820px;
}

.page-description code {
  font-size: 13px;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm);
  background: var(--dz-muted);
  color: var(--dz-foreground);
}

.demo-section {
  padding: 24px;
  border-radius: var(--dz-radius-lg);
  border: 1px solid var(--dz-border);
  background: var(--dz-surface);
  box-shadow: var(--dz-shadow-sm);
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
  color: var(--dz-foreground);
  margin: 0;
}

.section-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: var(--dz-radius-full);
  color: var(--dz-warning-muted-foreground);
  background: var(--dz-warning-muted);
}

.section-badge.ready {
  color: var(--dz-success-muted-foreground);
  background: var(--dz-success-muted);
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
  border-radius: var(--dz-radius-md);
  border: 1px solid var(--dz-border);
  background: var(--dz-background);
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
  color: var(--dz-foreground);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.parse-ok,
.parse-error {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--dz-radius-full);
}

.parse-ok {
  color: var(--dz-success-muted-foreground);
  background: var(--dz-success-muted);
}

.parse-error {
  color: var(--dz-danger-muted-foreground);
  background: var(--dz-danger-muted);
}

.schema-editor {
  flex: 1;
  min-height: 520px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.45;
  padding: 12px;
  border-radius: var(--dz-radius-sm);
  border: 1px solid var(--dz-border);
  background: var(--dz-surface);
  color: var(--dz-foreground);
  outline: none;
}

.schema-editor:focus-visible {
  border-color: var(--dz-primary);
  box-shadow: 0 0 0 3px var(--dz-primary-muted);
}

.error-message {
  margin: 0;
  font-size: 12px;
  color: var(--dz-danger);
}

.actions-row {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.primary-btn,
.plain-btn {
  border-radius: var(--dz-radius-md);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  cursor: pointer;
  transition: all var(--dz-duration-fast) var(--dz-ease-default);
}

.primary-btn {
  border: 1px solid transparent;
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.primary-btn:hover:not(:disabled) {
  background: var(--dz-primary-hover);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.plain-btn {
  border: 1px solid var(--dz-border);
  background: var(--dz-surface);
  color: var(--dz-foreground);
}

.plain-btn:hover {
  background: var(--dz-muted);
}

.preview-code {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  border-radius: var(--dz-radius-sm);
  border: 1px solid var(--dz-border);
  background: var(--dz-surface);
  padding: 12px;
  overflow: auto;
  max-height: 480px;
  color: var(--dz-foreground);
}

.preview-code.submitted {
  border-color: var(--dz-success);
}

.preview-subtitle {
  margin: 8px 0 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--dz-success);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 1180px) {
  .three-column {
    grid-template-columns: 1fr;
  }
}
</style>
