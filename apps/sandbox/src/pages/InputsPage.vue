<script setup lang="ts">
import type { DzSelectItem } from '@dzup-ui/core'
import {
  DzCheckbox,
  DzCheckboxGroup,
  DzColorPicker,
  DzCombobox,
  DzDatePicker,
  DzDateRangePicker,
  DzFileUpload,
  DzInput,
  DzInputGroup,
  DzMultiSelect,
  DzNumberInput,
  DzOtpInput,
  DzPasswordInput,
  DzRadio,
  DzRadioGroup,
  DzRangeSlider,
  DzSearchInput,
  DzSelect,
  DzSlider,
  DzSwitch,
  DzTextarea,
  DzTimePicker,
} from '@dzup-ui/core'
import { ref } from 'vue'

// ── Text inputs ────────────────────────────────────────────────────────────
const textValue = ref('')
const emailValue = ref('')
const numberValue = ref(0)
const passwordValue = ref('')
const searchValue = ref('')
const textareaValue = ref('')
const clearableValue = ref('Clear me')
const clearLogCount = ref(0)

// ── Input groups ───────────────────────────────────────────────────────────
const urlValue = ref('')
const domainValue = ref('')
const priceCurrency = ref('')
const weightValue = ref('')

// ── Number constraints ─────────────────────────────────────────────────────
const priceValue = ref(10)
const quantityValue = ref(0)
const numberEventLog = ref<string[]>([])

function logNumberEvent(event: string): void {
  numberEventLog.value = [
    `${new Date().toLocaleTimeString()} — ${event}`,
    ...numberEventLog.value,
  ].slice(0, 5)
}

// ── OTP ────────────────────────────────────────────────────────────────────
const otp4 = ref('')
const otp6 = ref('')
const otpMasked = ref('')
const otpCompleteLog = ref<string[]>([])

function handleOtpComplete(label: string, value: string): void {
  otpCompleteLog.value = [
    `${new Date().toLocaleTimeString()} — ${label}: ${value}`,
    ...otpCompleteLog.value,
  ].slice(0, 5)
}

// ── Textarea config ────────────────────────────────────────────────────────
const textareaCounter = ref('')
const textareaAuto = ref('Try typing\nmultiple\nlines\nhere and watch it grow.')

// ── Validation ─────────────────────────────────────────────────────────────
const requiredField = ref('')
const errorField = ref('not-an-email')

// ── Toggles ────────────────────────────────────────────────────────────────
const cbSingle = ref(false)
const cbIndeterminate = ref(false)
const cbSizes = ref(true)
const cbGroup = ref<string[]>(['email'])
const radioPlan = ref('pro')
const radioSizes = ref('md')
const switchActive = ref(true)
const switchNotify = ref(false)

// ── Choice pickers ─────────────────────────────────────────────────────────
const selectCountry = ref('')
const selectFramework = ref('vue')
const multiSkills = ref<string[]>(['ts'])
const comboCity = ref('')

const countryItems: DzSelectItem[] = [
  { label: 'United States', value: 'us' },
  { label: 'Germany', value: 'de' },
  { label: 'Bosnia and Herzegovina', value: 'ba' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
  { label: 'Japan', value: 'jp', disabled: true },
]

const frameworkItems: DzSelectItem[] = [
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'solid' },
]

const skillItems: DzSelectItem[] = [
  { label: 'TypeScript', value: 'ts' },
  { label: 'CSS', value: 'css' },
  { label: 'Accessibility', value: 'a11y' },
  { label: 'Testing', value: 'test' },
  { label: 'Animation', value: 'anim' },
]

const cityItems: DzSelectItem[] = [
  { label: 'New York', value: 'nyc' },
  { label: 'San Francisco', value: 'sf' },
  { label: 'Berlin', value: 'ber' },
  { label: 'London', value: 'lon' },
  { label: 'Sarajevo', value: 'sjj' },
  { label: 'Tokyo', value: 'tok' },
]

// ── Date & time ────────────────────────────────────────────────────────────
const dateValue = ref('')
const dateRange = ref<{ start: string, end: string }>({ start: '', end: '' })
const timeValue = ref('')
const time24 = ref('14:30')

// ── Sliders ────────────────────────────────────────────────────────────────
const sliderValue = ref(40)
const sliderDanger = ref(85)
const rangeValue = ref<[number, number]>([20, 70])

// ── File & color ───────────────────────────────────────────────────────────
const fileSingle = ref<File[]>([])
const fileMulti = ref<File[]>([])
const colorValue = ref('#6366f1')

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const variants = ['outline', 'filled', 'underlined'] as const
const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
const groupSizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Inputs
    </h1>
    <p class="page-description">
      Form entry components — text inputs, selection controls, pickers, and ranges — with v-model bindings, variants,
      sizes, and states.
    </p>

    <!-- ═══ Text inputs ═══ -->
    <section class="demo-section">
      <h2 class="section-title">
        Text Input
      </h2>
      <div class="demo-stack">
        <DzInput v-model="textValue" placeholder="Type something..." />
        <span class="state-label">Value: "{{ textValue }}"</span>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Sizes
      </h2>
      <div class="demo-stack">
        <DzInput v-for="s in sizes" :key="s" :size="s" :placeholder="`Size: ${s}`" />
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Variants
      </h2>
      <div class="demo-stack">
        <DzInput variant="outline" placeholder="Outline variant" />
        <DzInput variant="filled" placeholder="Filled variant" />
        <DzInput variant="underlined" placeholder="Underlined variant" />
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Variant × Tone matrix
      </h2>
      <p class="section-hint">
        3 variants × 6 tones. Use this grid to spot compound-variant regressions visually.
      </p>
      <div class="matrix">
        <div class="matrix-row matrix-header">
          <span class="matrix-axis">variant \ tone</span>
          <span v-for="t in tones" :key="t" class="matrix-axis">{{ t }}</span>
        </div>
        <div v-for="v in variants" :key="v" class="matrix-row">
          <span class="matrix-axis">{{ v }}</span>
          <DzInput v-for="t in tones" :key="t" :variant="v" :tone="t" :placeholder="t" size="sm" />
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        States
      </h2>
      <div class="demo-stack">
        <DzInput placeholder="Normal input" />
        <DzInput placeholder="Disabled input" disabled />
        <DzInput placeholder="Readonly input" readonly model-value="Read only text" />
        <DzInput placeholder="Loading input" loading />
        <DzInput placeholder="Invalid input" invalid error="This field has an error" />
        <DzInput
          v-model="clearableValue"
          clearable
          placeholder="Clearable input"
          @clear="clearLogCount++"
        />
        <span class="state-label">Value: "{{ clearableValue }}" — clear fired {{ clearLogCount }}×</span>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Validation
      </h2>
      <p class="section-hint">
        Required, error message, and semantic tones side by side.
      </p>
      <div class="demo-stack">
        <DzInput v-model="requiredField" required placeholder="Required field *" />
        <DzInput
          v-model="errorField"
          invalid
          error="Enter a valid email address"
          placeholder="Field with error"
        />
        <DzInput tone="success" placeholder="tone=success" model-value="looks good" />
        <DzInput tone="warning" placeholder="tone=warning" model-value="careful here" />
        <DzInput tone="danger" placeholder="tone=danger" model-value="something broke" />
        <DzInput tone="info" placeholder="tone=info" model-value="just informational" />
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Prefix &amp; suffix slots (DzInput)
      </h2>
      <div class="demo-stack">
        <DzInput placeholder="Search the docs...">
          <template #prefix>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </template>
        </DzInput>
        <DzInput placeholder="you@example.com" type="email">
          <template #prefix>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          </template>
          <template #suffix>
            <span class="slot-text">.com</span>
          </template>
        </DzInput>
      </div>
    </section>

    <!-- ═══ Input groups ═══ -->
    <section class="demo-section input-group-section">
      <h2 class="section-title">
        Input groups (DzInputGroup)
      </h2>
      <p class="section-hint">
        Attach text or icon addons to either end of an input. Pass the same <code>size</code> to the group and the
        inner <code>DzInput</code> so the heights and corners align.
      </p>
      <div class="demo-stack">
        <!-- URL with prefix + suffix text -->
        <DzInputGroup size="md">
          <template #prefix>
            https://
          </template>
          <DzInput v-model="urlValue" size="md" placeholder="example" />
          <template #suffix>
            .com
          </template>
        </DzInputGroup>
        <span class="state-label">URL: "https://{{ urlValue || 'example' }}.com"</span>

        <!-- Subdomain suffix -->
        <DzInputGroup size="md">
          <DzInput v-model="domainValue" size="md" placeholder="mysite" />
          <template #suffix>
            .datazup.io
          </template>
        </DzInputGroup>

        <!-- Currency -->
        <DzInputGroup size="md">
          <template #prefix>
            $
          </template>
          <DzInput v-model="priceCurrency" size="md" placeholder="0.00" type="text" inputmode="decimal" />
          <template #suffix>
            USD
          </template>
        </DzInputGroup>

        <!-- Weight with unit -->
        <DzInputGroup size="md">
          <DzInput v-model="weightValue" size="md" placeholder="weight" />
          <template #suffix>
            kg
          </template>
        </DzInputGroup>
      </div>

      <h3 class="subsection-title">
        Group sizes (sm / md / lg)
      </h3>
      <p class="section-hint">
        Both group and inner input share the same size to keep addon and input edges aligned.
      </p>
      <div class="demo-stack">
        <DzInputGroup v-for="s in groupSizes" :key="s" :size="s">
          <template #prefix>
            @
          </template>
          <DzInput :size="s" :placeholder="`username (${s})`" />
          <template #suffix>
            .dev
          </template>
        </DzInputGroup>
      </div>
    </section>

    <!-- ═══ Numeric / specialty inputs ═══ -->
    <section class="demo-section">
      <h2 class="section-title">
        Email Input
      </h2>
      <div class="demo-stack">
        <DzInput v-model="emailValue" type="email" placeholder="Enter your email" />
        <span class="state-label">Value: "{{ emailValue }}"</span>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Number Input
      </h2>
      <div class="demo-stack">
        <DzNumberInput v-model="numberValue" placeholder="Enter a number" />
        <span class="state-label">Value: {{ numberValue }}</span>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Number Input — constraints
      </h2>
      <p class="section-hint">
        <code>min</code>, <code>max</code>, <code>step</code> plus the <code>prefix</code> slot.
        <code>@increment</code> / <code>@decrement</code> fire alongside <code>update:modelValue</code>.
      </p>
      <div class="demo-stack">
        <DzNumberInput
          v-model="priceValue"
          :min="0"
          :max="1000"
          :step="0.5"
          placeholder="0.00"
          @increment="logNumberEvent('price increment')"
          @decrement="logNumberEvent('price decrement')"
        >
          <template #prefix>
            <span class="slot-text">$</span>
          </template>
        </DzNumberInput>
        <span class="state-label">Price: ${{ priceValue }} (min 0, max 1000, step 0.5)</span>

        <DzNumberInput
          v-model="quantityValue"
          :min="0"
          :max="10"
          :step="1"
          placeholder="0"
          @increment="logNumberEvent('qty increment')"
          @decrement="logNumberEvent('qty decrement')"
        />
        <span class="state-label">Quantity: {{ quantityValue }} (min 0, max 10, step 1)</span>

        <div class="event-log">
          <strong>Event log:</strong>
          <p v-if="!numberEventLog.length" class="event-empty">
            No events yet — click ▲/▼ or press arrow keys.
          </p>
          <ul v-else>
            <li v-for="(entry, i) in numberEventLog" :key="i">
              {{ entry }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Password Input
      </h2>
      <div class="demo-stack">
        <DzPasswordInput v-model="passwordValue" placeholder="Enter password" />
        <span class="state-label">Value: "{{ passwordValue }}"</span>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Search Input
      </h2>
      <div class="demo-stack">
        <DzSearchInput v-model="searchValue" placeholder="Search..." />
        <span class="state-label">Query: "{{ searchValue }}"</span>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        OTP / PIN Input (DzOtpInput)
      </h2>
      <p class="section-hint">
        Fixed-length code entry powered by Reka UI PinInput. <code>@complete</code> fires when all digits are filled.
      </p>
      <div class="demo-stack">
        <div>
          <div class="state-label">
            4-digit (numeric)
          </div>
          <DzOtpInput
            v-model="otp4"
            :length="4"
            type="number"
            @complete="(v) => handleOtpComplete('4-digit', v)"
          />
          <span class="state-label">Value: "{{ otp4 }}"</span>
        </div>

        <div>
          <div class="state-label">
            6-digit (numeric)
          </div>
          <DzOtpInput
            v-model="otp6"
            :length="6"
            type="number"
            @complete="(v) => handleOtpComplete('6-digit', v)"
          />
          <span class="state-label">Value: "{{ otp6 }}"</span>
        </div>

        <div>
          <div class="state-label">
            6-digit (masked)
          </div>
          <DzOtpInput
            v-model="otpMasked"
            :length="6"
            type="number"
            mask
            @complete="(v) => handleOtpComplete('masked', v)"
          />
          <span class="state-label">Value: "{{ otpMasked }}"</span>
        </div>

        <div class="event-log">
          <strong>@complete log:</strong>
          <p v-if="!otpCompleteLog.length" class="event-empty">
            Fill any group above to log a complete event.
          </p>
          <ul v-else>
            <li v-for="(entry, i) in otpCompleteLog" :key="i">
              {{ entry }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Textarea
      </h2>
      <div class="demo-stack">
        <DzTextarea v-model="textareaValue" placeholder="Write something longer..." />
        <span class="state-label">Length: {{ textareaValue.length }} characters</span>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Textarea — configuration
      </h2>
      <p class="section-hint">
        <code>rows</code> sets initial height. <code>maxlength</code> hard-caps input. <code>autoResize</code> grows
        the textarea up to <code>maxRows</code> as the user types.
      </p>
      <div class="demo-stack">
        <div>
          <div class="state-label">
            rows=2
          </div>
          <DzTextarea :rows="2" placeholder="Compact (2 rows)" />
        </div>
        <div>
          <div class="state-label">
            rows=5
          </div>
          <DzTextarea :rows="5" placeholder="Standard (5 rows)" />
        </div>
        <div>
          <div class="state-label">
            rows=8
          </div>
          <DzTextarea :rows="8" placeholder="Tall (8 rows)" />
        </div>
        <div>
          <div class="state-label">
            maxlength=80 with counter
          </div>
          <DzTextarea v-model="textareaCounter" :rows="3" :maxlength="80" placeholder="Up to 80 characters..." />
          <span class="state-label" :class="{ 'counter-warn': textareaCounter.length >= 70 }">
            {{ textareaCounter.length }} / 80
          </span>
        </div>
        <div>
          <div class="state-label">
            autoResize (maxRows=8)
          </div>
          <DzTextarea v-model="textareaAuto" :rows="2" :max-rows="8" auto-resize placeholder="I grow as you type..." />
        </div>
      </div>
    </section>

    <!-- ═══ Toggles ═══ -->
    <section class="demo-section">
      <h2 class="section-title">
        Toggles — Checkbox
      </h2>
      <p class="section-hint">
        Standalone checkboxes, indeterminate state, and grouped selection via <code>DzCheckboxGroup</code>.
      </p>
      <div class="demo-stack">
        <DzCheckbox v-model="cbSingle">
          Subscribe to newsletter
        </DzCheckbox>
        <span class="state-label">Subscribed: {{ cbSingle }}</span>

        <DzCheckbox v-model="cbIndeterminate" indeterminate>
          Indeterminate (mixed) state
        </DzCheckbox>

        <DzCheckbox v-model="cbSizes" size="sm">
          Small
        </DzCheckbox>
        <DzCheckbox v-model="cbSizes" size="md">
          Medium
        </DzCheckbox>
        <DzCheckbox v-model="cbSizes" size="lg">
          Large
        </DzCheckbox>

        <DzCheckbox disabled :model-value="true">
          Disabled (checked)
        </DzCheckbox>

        <div class="subgroup">
          <div class="state-label">
            CheckboxGroup (horizontal)
          </div>
          <DzCheckboxGroup v-model="cbGroup" orientation="horizontal" aria-label="Notifications">
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
          <span class="state-label">Selected: [{{ cbGroup.join(', ') }}]</span>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Toggles — Radio
      </h2>
      <p class="section-hint">
        Radios must live inside a <code>DzRadioGroup</code>. The group owns the v-model.
      </p>
      <div class="demo-stack">
        <div class="subgroup">
          <div class="state-label">
            Billing plan (vertical)
          </div>
          <DzRadioGroup v-model="radioPlan" aria-label="Billing plan">
            <DzRadio value="starter">
              Starter — $0
            </DzRadio>
            <DzRadio value="pro">
              Pro — $19/mo
            </DzRadio>
            <DzRadio value="enterprise">
              Enterprise — contact us
            </DzRadio>
            <DzRadio value="legacy" disabled>
              Legacy (unavailable)
            </DzRadio>
          </DzRadioGroup>
          <span class="state-label">Selected: {{ radioPlan }}</span>
        </div>

        <div class="subgroup">
          <div class="state-label">
            Size (horizontal)
          </div>
          <DzRadioGroup v-model="radioSizes" orientation="horizontal" aria-label="Size">
            <DzRadio value="sm">
              Small
            </DzRadio>
            <DzRadio value="md">
              Medium
            </DzRadio>
            <DzRadio value="lg">
              Large
            </DzRadio>
          </DzRadioGroup>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Toggles — Switch
      </h2>
      <div class="demo-stack">
        <DzSwitch v-model="switchActive">
          Active
        </DzSwitch>
        <DzSwitch v-model="switchNotify">
          Email notifications
        </DzSwitch>
        <DzSwitch size="sm" :model-value="true">
          Small
        </DzSwitch>
        <DzSwitch size="md" :model-value="true">
          Medium
        </DzSwitch>
        <DzSwitch size="lg" :model-value="true">
          Large
        </DzSwitch>
        <DzSwitch disabled :model-value="true">
          Disabled
        </DzSwitch>
      </div>
    </section>

    <!-- ═══ Choice pickers ═══ -->
    <section class="demo-section">
      <h2 class="section-title">
        Choice — Select
      </h2>
      <p class="section-hint">
        Dropdown selection with optional search filter.
      </p>
      <div class="demo-stack">
        <DzSelect v-model="selectFramework" :items="frameworkItems" placeholder="Pick a framework" />
        <span class="state-label">Framework: {{ selectFramework }}</span>

        <DzSelect
          v-model="selectCountry"
          :items="countryItems"
          searchable
          placeholder="Pick a country (searchable)"
          search-placeholder="Type to filter..."
        />
        <span class="state-label">Country: {{ selectCountry || '(none)' }}</span>

        <DzSelect :items="frameworkItems" placeholder="Disabled" disabled />
        <DzSelect :items="frameworkItems" placeholder="Invalid" invalid error="Selection required" />
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Choice — MultiSelect &amp; Combobox
      </h2>
      <div class="demo-stack">
        <div>
          <div class="state-label">
            MultiSelect (max 3)
          </div>
          <DzMultiSelect
            v-model="multiSkills"
            :items="skillItems"
            :max-selections="3"
            placeholder="Pick up to 3 skills"
          />
          <span class="state-label">Skills: [{{ multiSkills.join(', ') }}]</span>
        </div>

        <div>
          <div class="state-label">
            Combobox (free-text + filter)
          </div>
          <DzCombobox v-model="comboCity" :items="cityItems" placeholder="Type or pick a city" />
          <span class="state-label">City: "{{ comboCity }}"</span>
        </div>
      </div>
    </section>

    <!-- ═══ Date & time ═══ -->
    <section class="demo-section">
      <h2 class="section-title">
        Date &amp; time pickers
      </h2>
      <p class="section-hint">
        Calendar-driven date selection and time entry. Date values are ISO 8601 strings.
      </p>
      <div class="demo-stack">
        <div>
          <div class="state-label">
            DatePicker
          </div>
          <DzDatePicker
            v-model="dateValue"
            placeholder="Select a date"
            min="2026-01-01"
            max="2026-12-31"
          />
          <span class="state-label">Value: "{{ dateValue }}"</span>
        </div>

        <div>
          <div class="state-label">
            DateRangePicker
          </div>
          <DzDateRangePicker
            v-model="dateRange"
            placeholder="Select a range"
            min="2026-01-01"
            max="2026-12-31"
          />
          <span class="state-label">Range: {{ dateRange.start || '∅' }} → {{ dateRange.end || '∅' }}</span>
        </div>

        <div>
          <div class="state-label">
            TimePicker (locale default)
          </div>
          <DzTimePicker v-model="timeValue" placeholder="Select a time" />
          <span class="state-label">Value: "{{ timeValue }}"</span>
        </div>

        <div>
          <div class="state-label">
            TimePicker (24h, 15-min steps)
          </div>
          <DzTimePicker v-model="time24" :hour12="false" :step="15" />
          <span class="state-label">Value: "{{ time24 }}"</span>
        </div>
      </div>
    </section>

    <!-- ═══ Sliders ═══ -->
    <section class="demo-section">
      <h2 class="section-title">
        Sliders
      </h2>
      <p class="section-hint">
        Single-thumb and dual-thumb range, with semantic tones.
      </p>
      <div class="demo-stack">
        <div>
          <div class="state-label">
            Slider — primary (default)
          </div>
          <DzSlider v-model="sliderValue" :min="0" :max="100" />
          <span class="state-label">Value: {{ sliderValue }}</span>
        </div>

        <div>
          <div class="state-label">
            Slider — tone=danger
          </div>
          <DzSlider v-model="sliderDanger" tone="danger" :min="0" :max="100" />
          <span class="state-label">Value: {{ sliderDanger }}</span>
        </div>

        <div>
          <div class="state-label">
            RangeSlider — dual thumbs
          </div>
          <DzRangeSlider v-model="rangeValue" :min="0" :max="100" />
          <span class="state-label">Range: [{{ rangeValue[0] }}, {{ rangeValue[1] }}]</span>
        </div>

        <DzSlider :model-value="50" disabled />
        <span class="state-label">Disabled</span>
      </div>
    </section>

    <!-- ═══ File & color ═══ -->
    <section class="demo-section">
      <h2 class="section-title">
        File upload
      </h2>
      <p class="section-hint">
        Single or multiple files, with optional MIME filter and size cap.
      </p>
      <div class="demo-stack">
        <div>
          <div class="state-label">
            Single file (images)
          </div>
          <DzFileUpload v-model="fileSingle" accept="image/*" :max-size="2 * 1024 * 1024" />
          <span class="state-label">Picked: {{ fileSingle.map(f => f.name).join(', ') || '(none)' }}</span>
        </div>

        <div>
          <div class="state-label">
            Multiple files (max 5)
          </div>
          <DzFileUpload v-model="fileMulti" multiple :max-files="5" />
          <span class="state-label">{{ fileMulti.length }} file(s) selected</span>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Color picker
      </h2>
      <div class="demo-stack">
        <DzColorPicker
          v-model="colorValue"
          show-input
          :presets="['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7', '#111827', '#ffffff']"
        />
        <span class="state-label">Value: {{ colorValue }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
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
  margin: 0 0 32px;
  line-height: 1.6;
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 16px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 24px 0 12px;
}

.section-hint {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: -8px 0 16px;
  line-height: 1.5;
}

.section-hint code {
  font-family: monospace;
  font-size: 12px;
  padding: 1px 5px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 4px;
}

.demo-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 420px;
}

.subgroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.state-label {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  font-family: monospace;
}

.counter-warn {
  color: var(--dz-warning, #d97706);
  font-weight: 600;
}

.slot-text {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
}

/* Variant × Tone matrix — tighter so it fits 960px without scrolling */
.matrix {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.matrix-row {
  display: grid;
  grid-template-columns: 88px repeat(6, minmax(0, 1fr));
  gap: 6px;
  align-items: center;
}

.matrix-header {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #64748b);
}

.matrix-axis {
  font-family: monospace;
  font-size: 11px;
  color: var(--dz-muted-foreground, #64748b);
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* DzInputGroup polish — DzInput's inner wrapper keeps its own rounded corners
   inside the group's middle slot, leaving a visible seam against the addons.
   Flatten those corners so the group renders as one continuous control.
   (Upstream fix: DzInputGroup's `.flex-1 [&>*]:rounded-none` selector only
   reaches DzInput's outer div, not the inner border-bearing wrapper.) */
.input-group-section :deep(div.flex-1 > div > div) {
  border-radius: 0 !important;
}

/* Event logs */
.event-log {
  margin-top: 8px;
  padding: 12px;
  background: var(--dz-muted, #f8fafc);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  font-size: 12px;
}

.event-log strong {
  display: block;
  margin-bottom: 6px;
  color: var(--dz-foreground, #1a202c);
}

.event-log ul {
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: monospace;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-empty {
  margin: 0;
  color: var(--dz-muted-foreground, #94a3b8);
  font-style: italic;
}
</style>
