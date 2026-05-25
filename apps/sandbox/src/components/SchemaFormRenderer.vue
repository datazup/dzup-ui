<script setup lang="ts">
import {
  DzCheckbox,
  DzCheckboxGroup,
  DzDatePicker,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzInput,
  DzMultiSelect,
  DzNumberInput,
  DzPasswordInput,
  DzRadio,
  DzRadioGroup,
  DzSelect,
  DzSlider,
  DzSwitch,
  DzTextarea,
} from '@dzup-ui/core'
import type { DzSelectItem } from '@dzup-ui/core'
import { computed } from 'vue'
import type { JsonSchema, JsonSchemaProperty, Widget } from '../schema/jsonSchema.ts'
import { widgetFor } from '../schema/jsonSchema.ts'

const props = defineProps<{
  schema: JsonSchema
  modelValue: Record<string, unknown>
}>()

interface Field {
  key: string
  schema: JsonSchemaProperty
  widget: Widget
  required: boolean
}

const fields = computed<Field[]>(() => {
  const required = new Set(props.schema.required ?? [])
  return Object.entries(props.schema.properties ?? {}).map(([key, sub]) => ({
    key,
    schema: sub,
    widget: widgetFor(sub),
    required: required.has(key),
  }))
})

function toItems(values: readonly (string | number)[] | undefined, labels?: Record<string, string>): DzSelectItem[] {
  if (!values) return []
  return values.map((v) => {
    const value = String(v)
    return { value, label: labels?.[value] ?? value }
  })
}
</script>

<template>
  <div class="schema-form">
    <template v-for="field in fields" :key="field.key">
      <DzFormField :required="field.required">
        <DzFormLabel v-if="field.schema.title">
          {{ field.schema.title }}
        </DzFormLabel>

        <DzInput
          v-if="field.widget === 'input'"
          :model-value="(modelValue[field.key] as string) ?? ''"
          :placeholder="field.schema.placeholder"
          :maxlength="field.schema.maxLength"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <DzInput
          v-else-if="field.widget === 'email'"
          type="email"
          :model-value="(modelValue[field.key] as string) ?? ''"
          :placeholder="field.schema.placeholder ?? 'name@example.com'"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <DzPasswordInput
          v-else-if="field.widget === 'password'"
          :model-value="(modelValue[field.key] as string) ?? ''"
          :placeholder="field.schema.placeholder"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <DzTextarea
          v-else-if="field.widget === 'textarea'"
          :model-value="(modelValue[field.key] as string) ?? ''"
          :placeholder="field.schema.placeholder"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <DzNumberInput
          v-else-if="field.widget === 'number'"
          :model-value="modelValue[field.key] as number"
          :min="(field.schema.minimum as number | undefined)"
          :max="(field.schema.maximum as number | undefined)"
          :step="field.schema.type === 'integer' ? 1 : (field.schema.multipleOf ?? 1)"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <DzSlider
          v-else-if="field.widget === 'slider'"
          :model-value="modelValue[field.key] as number"
          :min="(field.schema.minimum as number | undefined) ?? 0"
          :max="(field.schema.maximum as number | undefined) ?? 100"
          :step="field.schema.multipleOf ?? 1"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <DzSwitch
          v-else-if="field.widget === 'switch'"
          :model-value="Boolean(modelValue[field.key])"
          @update:model-value="v => (modelValue[field.key] = v)"
        >
          {{ field.schema.title ?? field.key }}
        </DzSwitch>

        <DzCheckbox
          v-else-if="field.widget === 'checkbox'"
          :model-value="Boolean(modelValue[field.key])"
          @update:model-value="v => (modelValue[field.key] = v)"
        >
          {{ field.schema.title ?? field.key }}
        </DzCheckbox>

        <DzSelect
          v-else-if="field.widget === 'select'"
          :model-value="(modelValue[field.key] as string) ?? ''"
          :items="toItems(field.schema.enum, field.schema.enumLabels)"
          :placeholder="field.schema.placeholder ?? 'Select...'"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <DzRadioGroup
          v-else-if="field.widget === 'radio-group'"
          :model-value="(modelValue[field.key] as string) ?? ''"
          orientation="horizontal"
          :aria-label="field.schema.title ?? field.key"
          @update:model-value="v => (modelValue[field.key] = v)"
        >
          <DzRadio
            v-for="option in toItems(field.schema.enum, field.schema.enumLabels)"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </DzRadio>
        </DzRadioGroup>

        <DzMultiSelect
          v-else-if="field.widget === 'multi-select'"
          :model-value="(modelValue[field.key] as string[]) ?? []"
          :items="toItems(field.schema.items?.enum, field.schema.items?.enumLabels)"
          :max-selections="field.schema.maxItems"
          :placeholder="field.schema.placeholder ?? 'Select...'"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <DzCheckboxGroup
          v-else-if="field.widget === 'checkbox-group'"
          :model-value="(modelValue[field.key] as string[]) ?? []"
          orientation="horizontal"
          :aria-label="field.schema.title ?? field.key"
          @update:model-value="v => (modelValue[field.key] = v)"
        >
          <DzCheckbox
            v-for="option in toItems(field.schema.items?.enum, field.schema.items?.enumLabels)"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </DzCheckbox>
        </DzCheckboxGroup>

        <DzDatePicker
          v-else-if="field.widget === 'date'"
          :model-value="(modelValue[field.key] as string) ?? ''"
          :min="field.schema.minimum as string | undefined"
          :max="field.schema.maximum as string | undefined"
          :placeholder="field.schema.placeholder ?? 'Pick a date'"
          @update:model-value="v => (modelValue[field.key] = v)"
        />

        <p v-else class="unsupported">
          Unsupported schema for "{{ field.key }}"
        </p>

        <DzFormDescription v-if="field.schema.description">
          {{ field.schema.description }}
        </DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    </template>
  </div>
</template>

<style scoped>
.schema-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.unsupported {
  margin: 0;
  font-size: 12px;
  color: var(--dz-danger, #dc2626);
}

@media (max-width: 900px) {
  .schema-form {
    grid-template-columns: 1fr;
  }
}
</style>
