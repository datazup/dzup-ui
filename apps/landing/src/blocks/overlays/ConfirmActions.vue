<script setup lang="ts">
/**
 * Confirm actions — modal and inline confirmation (DzConfirmDialog + DzPopconfirm).
 *
 * A "danger zone" settings panel pairing the two confirmation patterns: heavy,
 * irreversible actions (reset, delete workspace) route through a modal
 * DzConfirmDialog — the delete one simulates an async, loading confirm — while
 * low-risk row deletes use an inline DzPopconfirm bubble anchored to each API
 * key's trash button. A status line reports the outcome.
 *
 * Self-contained — free @dzup-ui/core components and `--dz-*` tokens only.
 * Heading level 4 to nest under the BlockPreview H3.
 */
import {
  DzBadge,
  DzButton,
  DzConfirmDialog,
  DzDivider,
  DzHeading,
  DzIconButton,
  DzPopconfirm,
  DzText,
} from '@dzup-ui/core'
import { RotateCcw, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'

const status = ref('')

// — Reset (modal, default variant) —
const resetOpen = ref(false)
function confirmReset(): void {
  resetOpen.value = false
  status.value = 'Workspace reset to defaults.'
}

// — Delete workspace (modal, danger variant, async loading) —
const deleteOpen = ref(false)
const deleting = ref(false)
function confirmDelete(): void {
  deleting.value = true
  // Simulate a network round-trip, then close the dialog.
  setTimeout(() => {
    deleting.value = false
    deleteOpen.value = false
    status.value = 'Workspace deleted.'
  }, 1200)
}

// — API keys (inline popconfirm delete) —
const keys = ref([
  { id: 'k1', label: 'Production', masked: 'sk_live_••••  4f2a' },
  { id: 'k2', label: 'Staging', masked: 'sk_test_••••  9c01' },
  { id: 'k3', label: 'CI bot', masked: 'sk_ci_••••  7b88' },
])
function removeKey(id: string, label: string): void {
  keys.value = keys.value.filter(k => k.id !== id)
  status.value = `Revoked the "${label}" key.`
}
</script>

<template>
  <section class="ca-wrap" aria-labelledby="ca-title">
    <div class="ca-panel">
      <header class="ca-head">
        <DzHeading id="ca-title" :level="4" size="md" weight="semibold" class="ca-title">
          Danger zone
        </DzHeading>
        <DzText size="sm" tone="muted" as="p" class="ca-sub">
          Destructive actions ask for confirmation first.
        </DzText>
      </header>

      <!-- Reset row -->
      <div class="ca-row">
        <div class="ca-row-text">
          <DzText size="sm" weight="medium" as="span">
            Reset to defaults
          </DzText>
          <DzText size="xs" tone="muted" as="span">
            Restore the original workspace settings.
          </DzText>
        </div>
        <DzButton variant="outline" tone="neutral" size="sm" @click="resetOpen = true">
          <template #prefix>
            <RotateCcw :size="15" aria-hidden="true" />
          </template>
          Reset
        </DzButton>
      </div>

      <DzDivider />

      <!-- Delete workspace row -->
      <div class="ca-row">
        <div class="ca-row-text">
          <DzText size="sm" weight="medium" as="span">
            Delete this workspace
          </DzText>
          <DzText size="xs" tone="muted" as="span">
            Permanently removes all projects and data.
          </DzText>
        </div>
        <DzButton variant="solid" tone="danger" size="sm" @click="deleteOpen = true">
          Delete…
        </DzButton>
      </div>

      <DzDivider />

      <!-- API keys with inline popconfirm -->
      <div class="ca-keys">
        <DzText size="sm" weight="medium" as="p" class="ca-keys-title">
          API keys
        </DzText>
        <ul class="ca-key-list">
          <li v-for="key in keys" :key="key.id" class="ca-key">
            <span class="ca-key-meta">
              <DzText size="sm" weight="medium" as="span">{{ key.label }}</DzText>
              <DzText size="xs" tone="muted" as="span" class="ca-key-mask">{{ key.masked }}</DzText>
            </span>
            <DzPopconfirm
              title="Revoke this key?"
              description="Apps using it will stop working immediately."
              confirm-text="Revoke"
              tone="danger"
              placement="left"
              @confirm="removeKey(key.id, key.label)"
            >
              <DzIconButton :icon="Trash2" aria-label="Revoke key" variant="ghost" tone="danger" size="sm" />
            </DzPopconfirm>
          </li>
        </ul>
        <DzText v-if="!keys.length" size="sm" tone="muted" as="p">
          All keys revoked.
        </DzText>
      </div>

      <DzDivider />

      <div class="ca-status" role="status" aria-live="polite">
        <DzBadge v-if="status" variant="subtle" tone="warning" size="sm">
          {{ status }}
        </DzBadge>
        <DzText v-else size="sm" tone="muted" as="span">
          No actions taken.
        </DzText>
      </div>
    </div>

    <!-- Modal confirmations ------------------------------------------------ -->
    <DzConfirmDialog
      v-model:open="resetOpen"
      title="Reset to defaults?"
      message="This restores the original settings. Your projects and data are kept."
      confirm-label="Reset settings"
      @confirm="confirmReset"
    />
    <DzConfirmDialog
      v-model:open="deleteOpen"
      title="Delete this workspace?"
      message="This permanently deletes every project, dashboard and data source. This action cannot be undone."
      confirm-label="Delete workspace"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </section>
</template>

<style scoped>
.ca-wrap {
  max-width: 34rem;
  margin: 0 auto;
}

.ca-panel {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-5, 1.25rem);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-danger-border, var(--dz-border, #e5e7eb));
  background: var(--dz-surface, #fff);
}

.ca-head {
  margin-bottom: var(--dz-space-1, 0.25rem);
}

.ca-title {
  margin: 0;
  color: var(--dz-danger, #dc2626);
}

.ca-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.ca-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.ca-row-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

/* API keys ---------------------------------------------------------------- */
.ca-keys-title {
  margin: 0 0 var(--dz-space-2, 0.5rem);
}

.ca-key-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
}

.ca-key {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-1, 0.25rem) var(--dz-space-2, 0.5rem);
  border-radius: var(--dz-radius-md, 0.375rem);
}

.ca-key:hover {
  background: var(--dz-surface-raised, #f3f4f6);
}

.ca-key-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.ca-key-mask {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
}

.ca-status {
  min-height: 1.5rem;
}
</style>
