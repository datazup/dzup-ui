<script setup lang="ts">
import type { DzListboxOption, DzSelectItem } from '@dzup-ui/core'
import {
  DzButton,
  DzCard,
  DzCombobox,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzListbox,
  DzMultiSelect,
  DzText,
  DzTextarea,
} from '@dzup-ui/core'
import { SignalHigh, SignalLow, SignalMedium } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * Record form — a "create issue" panel built from the selection inputs.
 *
 * A DzInput title, a searchable DzCombobox assignee, a DzMultiSelect for labels
 * (chips), a compact single-select DzListbox for priority (with icons + check
 * indicators), and a DzTextarea description. Per the combobox accessible-name
 * rule, the Combobox and MultiSelect carry explicit `aria-label`s. Local ref()
 * state only.
 *
 * Forms family: DzCombobox, DzMultiSelect, DzListbox, DzFormField, DzFormLabel.
 * Inputs family: DzInput, DzTextarea.
 */

const title = ref('')
const assignee = ref('')
const labels = ref<string[]>(['bug'])
const priority = ref<string | null>('medium')
const description = ref('')

const ASSIGNEES: DzSelectItem[] = [
  { label: 'Jamie Rivera', value: 'jamie' },
  { label: 'Priya Patel', value: 'priya' },
  { label: 'Marco Rossi', value: 'marco' },
  { label: 'Lena Müller', value: 'lena' },
  { label: 'Sam Okafor', value: 'sam' },
]

const LABELS: DzSelectItem[] = [
  { label: 'Bug', value: 'bug' },
  { label: 'Feature', value: 'feature' },
  { label: 'Documentation', value: 'docs' },
  { label: 'Good first issue', value: 'good-first' },
  { label: 'Needs triage', value: 'triage' },
]

const PRIORITIES: DzListboxOption[] = [
  { label: 'Low', value: 'low', icon: SignalLow },
  { label: 'Medium', value: 'medium', icon: SignalMedium },
  { label: 'High', value: 'high', icon: SignalHigh },
]
</script>

<template>
  <section class="rf-wrap" aria-labelledby="rf-title">
    <DzCard variant="elevated" padding="lg" class="rf-card">
      <header class="rf-head">
        <DzHeading id="rf-title" :level="4" size="xl" weight="semibold">
          Create issue
        </DzHeading>
        <DzText tone="muted" size="sm" as="p">
          Describe the problem and route it to the right person.
        </DzText>
      </header>

      <form class="rf-form" @submit.prevent>
        <DzFormField required>
          <DzFormLabel>Title</DzFormLabel>
          <DzInput v-model="title" placeholder="Summarize the issue" />
        </DzFormField>

        <div class="rf-grid">
          <DzFormField required>
            <DzFormLabel>Assignee</DzFormLabel>
            <DzCombobox
              v-model="assignee"
              :items="ASSIGNEES"
              placeholder="Search people…"
              aria-label="Assignee"
            />
          </DzFormField>

          <DzFormField>
            <DzFormLabel>Labels</DzFormLabel>
            <DzMultiSelect
              v-model="labels"
              :items="LABELS"
              placeholder="Add labels…"
              aria-label="Labels"
            />
          </DzFormField>
        </div>

        <DzFormField>
          <DzFormLabel>Priority</DzFormLabel>
          <DzListbox
            v-model="priority"
            :options="PRIORITIES"
            checkmark
            aria-label="Priority"
            class="rf-listbox"
          />
        </DzFormField>

        <DzFormField required>
          <DzFormLabel>Description</DzFormLabel>
          <DzTextarea
            v-model="description"
            :rows="3"
            auto-resize
            placeholder="Steps to reproduce, expected vs. actual…"
          />
        </DzFormField>

        <div class="rf-actions">
          <DzButton variant="ghost" tone="neutral">
            Cancel
          </DzButton>
          <DzButton type="submit" variant="solid" tone="primary">
            Create issue
          </DzButton>
        </div>
      </form>
    </DzCard>
  </section>
</template>

<style scoped>
.rf-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.rf-card {
  width: 100%;
  max-width: 34rem;
}

.rf-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.rf-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.rf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-4, 1rem);
}

.rf-listbox {
  max-width: 16rem;
}

.rf-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-1, 0.25rem);
}

@media (max-width: 540px) {
  .rf-grid {
    grid-template-columns: 1fr;
  }
}
</style>
