<script setup lang="ts">
import type { DzMentionTrigger, Persona, TransferItem } from '@dzup-ui/core'
import {
  DzButton,
  DzCard,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzMention,
  DzPersonaSelector,
  DzText,
  DzTransfer,
} from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Access transfer — a sharing / permissions panel.
 *
 * A DzTransfer dual-list moves capabilities from "Available" to "Granted", a
 * DzPersonaSelector assigns an owner (avatar + name + role), and a DzMention
 * note lets you @-mention teammates. Local ref() state only.
 *
 * Forms family: DzTransfer, DzPersonaSelector, DzMention, DzFormField,
 * DzFormLabel.
 */

const granted = ref<string[]>(['read', 'comment'])
const owner = ref('jamie')
const note = ref('')

const CAPABILITIES: TransferItem[] = [
  { key: 'read', label: 'View content' },
  { key: 'comment', label: 'Comment' },
  { key: 'edit', label: 'Edit content' },
  { key: 'publish', label: 'Publish' },
  { key: 'invite', label: 'Invite members' },
  { key: 'admin', label: 'Manage settings' },
]

const PEOPLE: Persona[] = [
  { id: 'jamie', name: 'Jamie Rivera', role: 'Design Lead' },
  { id: 'priya', name: 'Priya Patel', role: 'Engineering Manager' },
  { id: 'marco', name: 'Marco Rossi', role: 'Product Manager' },
  { id: 'lena', name: 'Lena Müller', role: 'Content Strategist' },
]

const MENTION_TRIGGERS: DzMentionTrigger[] = [
  {
    char: '@',
    options: [
      { label: 'jamie', value: 'jamie' },
      { label: 'priya', value: 'priya' },
      { label: 'marco', value: 'marco' },
      { label: 'lena', value: 'lena' },
    ],
  },
]
</script>

<template>
  <section class="at-wrap" aria-labelledby="at-title">
    <DzCard variant="elevated" padding="lg" class="at-card">
      <header class="at-head">
        <DzHeading id="at-title" :level="4" size="xl" weight="semibold">
          Share access
        </DzHeading>
        <DzText tone="muted" size="sm" as="p">
          Grant capabilities, set an owner, and leave a note for the team.
        </DzText>
      </header>

      <div class="at-form">
        <DzFormField>
          <DzFormLabel>Capabilities</DzFormLabel>
          <DzTransfer
            v-model="granted"
            :source="CAPABILITIES"
            searchable
            aria-label="Capabilities"
          />
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Owner</DzFormLabel>
          <DzPersonaSelector
            v-model="owner"
            :personas="PEOPLE"
            placeholder="Assign an owner…"
          />
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Note</DzFormLabel>
          <DzMention
            v-model:value="note"
            :triggers="MENTION_TRIGGERS"
            multiline
            filter
            :rows="3"
            placeholder="Add a note — type @ to mention a teammate"
            aria-label="Note"
          />
        </DzFormField>

        <div class="at-actions">
          <DzButton variant="ghost" tone="neutral">
            Cancel
          </DzButton>
          <DzButton variant="solid" tone="primary">
            Share
          </DzButton>
        </div>
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.at-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.at-card {
  width: 100%;
  max-width: 36rem;
}

.at-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.at-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-5, 1.25rem);
}

.at-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
}
</style>
