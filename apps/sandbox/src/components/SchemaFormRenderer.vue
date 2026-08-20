<script setup lang="ts">
import type { DzSelectItem } from '@dzup-ui/core'
import type { JsonSchema, ResolvedField, ResolvedGroup } from '../schema/jsonSchema.ts'
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
import { computed } from 'vue'
import { buildLayout } from '../schema/jsonSchema.ts'

const modelValue = defineModel<Record<string, unknown>>({ required: true })
const props = defineProps<{
  schema: JsonSchema
}>()

const groups = computed<ResolvedGroup[]>(() => buildLayout(props.schema))

function gridStyle(group: ResolvedGroup): Record<string, string> {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${group.columns}, minmax(0, 1fr))`,
    gap: group.gap,
  }
}

function fieldStyle(field: ResolvedField): Record<string, string> {
  return { gridColumn: `span ${field.colSpan}` }
}

function toItems(values: readonly (string | number)[] | undefined, labels?: Record<string, string>): DzSelectItem[] {
  if (!values)
    return []
  return values.map((v) => {
    const value = String(v)
    return { value, label: labels?.[value] ?? value }
  })
}

function updateField(key: string, value: unknown): void {
  modelValue.value = { ...modelValue.value, [key]: value }
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}
</script>

<template>
  <div class="schema-form">
    <component
      :is="group.title ? 'fieldset' : 'div'"
      v-for="group in groups"
      :key="group.id"
      class="schema-group"
      :class="{ 'has-legend': Boolean(group.title) }"
    >
      <legend v-if="group.title" class="group-legend">
        {{ group.title }}
      </legend>
      <p v-if="group.description" class="group-description">
        {{ group.description }}
      </p>

      <div :style="gridStyle(group)">
        <DzFormField
          v-for="field in group.fields"
          :key="field.key"
          :required="field.required"
          :style="fieldStyle(field)"
        >
          <DzFormLabel v-if="field.schema.title && field.widget !== 'switch' && field.widget !== 'checkbox'">
            {{ field.schema.title }}
          </DzFormLabel>

          <DzInput
            v-if="field.widget === 'input'"
            :model-value="(modelValue[field.key] as string) ?? ''"
            :placeholder="field.schema.placeholder"
            :maxlength="field.schema.maxLength"
            @update:model-value="v => updateField(field.key, v)"
          />

          <DzInput
            v-else-if="field.widget === 'email'"
            type="email"
            :model-value="(modelValue[field.key] as string) ?? ''"
            :placeholder="field.schema.placeholder ?? 'name@example.com'"
            @update:model-value="v => updateField(field.key, v)"
          />

          <DzPasswordInput
            v-else-if="field.widget === 'password'"
            :model-value="(modelValue[field.key] as string) ?? ''"
            :placeholder="field.schema.placeholder"
            @update:model-value="v => updateField(field.key, v)"
          />

          <DzTextarea
            v-else-if="field.widget === 'textarea'"
            :model-value="(modelValue[field.key] as string) ?? ''"
            :placeholder="field.schema.placeholder"
            @update:model-value="v => updateField(field.key, v)"
          />

          <DzNumberInput
            v-else-if="field.widget === 'number'"
            :model-value="modelValue[field.key] as number"
            :min="(field.schema.minimum as number | undefined)"
            :max="(field.schema.maximum as number | undefined)"
            :step="field.schema.type === 'integer' ? 1 : (field.schema.multipleOf ?? 1)"
            @update:model-value="v => updateField(field.key, v)"
          />

          <DzSlider
            v-else-if="field.widget === 'slider'"
            :model-value="modelValue[field.key] as number"
            :min="(field.schema.minimum as number | undefined) ?? 0"
            :max="(field.schema.maximum as number | undefined) ?? 100"
            :step="field.schema.multipleOf ?? 1"
            @update:model-value="v => updateField(field.key, v)"
          />

          <DzSwitch
            v-else-if="field.widget === 'switch'"
            :model-value="Boolean(modelValue[field.key])"
            @update:model-value="v => updateField(field.key, v)"
          >
            {{ field.schema.title ?? field.key }}
          </DzSwitch>

          <DzCheckbox
            v-else-if="field.widget === 'checkbox'"
            :model-value="Boolean(modelValue[field.key])"
            @update:model-value="v => updateField(field.key, v)"
          >
            {{ field.schema.title ?? field.key }}
          </DzCheckbox>

          <DzSelect
            v-else-if="field.widget === 'select'"
            :model-value="(modelValue[field.key] as string) ?? ''"
            :items="toItems(field.schema.enum, field.schema.enumLabels)"
            :placeholder="field.schema.placeholder ?? 'Select...'"
            @update:model-value="v => updateField(field.key, v)"
          />

          <DzRadioGroup
            v-else-if="field.widget === 'radio-group'"
            :model-value="(modelValue[field.key] as string) ?? ''"
            orientation="horizontal"
            :aria-label="field.schema.title ?? field.key"
            @update:model-value="v => updateField(field.key, v)"
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
            @update:model-value="v => updateField(field.key, v)"
          />

          <DzCheckboxGroup
            v-else-if="field.widget === 'checkbox-group'"
            :model-value="(modelValue[field.key] as string[]) ?? []"
            orientation="horizontal"
            :aria-label="field.schema.title ?? field.key"
            @update:model-value="v => updateField(field.key, v)"
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
            :min="toOptionalString(field.schema.minimum)"
            :max="toOptionalString(field.schema.maximum)"
            :placeholder="field.schema.placeholder ?? 'Pick a date'"
            @update:model-value="v => updateField(field.key, v)"
          />

          <p v-else class="unsupported">
            Unsupported schema for "{{ field.key }}"
          </p>

          <DzFormDescription v-if="field.schema.description">
            {{ field.schema.description }}
          </DzFormDescription>
          <DzFormMessage />
        </DzFormField>
      </div>
    </component>
  </div>
</template>

<style scoped>
.schema-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schema-group {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.schema-group.has-legend {
  padding: 14px 16px 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-md);
  background: var(--dz-surface);
}

.group-legend {
  padding: 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--dz-foreground);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.group-description {
  margin: 4px 0 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dz-muted-foreground);
}

.unsupported {
  margin: 0;
  font-size: 12px;
  color: var(--dz-danger);
}

@media (max-width: 720px) {
  .schema-form :deep([style*='grid-template-columns']) {
    grid-template-columns: 1fr !important;
  }

  .schema-form :deep([style*='grid-column']) {
    grid-column: span 1 !important;
  }
}
</style>
