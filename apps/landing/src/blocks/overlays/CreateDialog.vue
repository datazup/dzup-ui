<script setup lang="ts">
import type { DzSelectItem } from '@dzup-ui/core'
/**
 * Create dialog — a modal form in a focus-trapped dialog (DzDialog).
 *
 * A trigger button opens the DzDialog compound: a backdrop-dimmed, focus-trapped
 * panel with a title, description, a small "new project" form (name, description,
 * visibility select), a top-right close (DzDialogClose), and a footer with a
 * Cancel (DzDialogClose as-child) and a Create action. Submitting closes the
 * dialog and lists the created project below.
 *
 * Self-contained — free @dzup-ui/core components and `--dz-*` tokens only.
 * Heading level 4 to nest under the BlockPreview H3.
 */
import {
  DzBadge,
  DzButton,
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogDescription,
  DzDialogTitle,
  DzDialogTrigger,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzSelect,
  DzText,
  DzTextarea,
} from '@dzup-ui/core'
import { FolderGit2, Plus } from 'lucide-vue-next'
import { ref } from 'vue'

const open = ref(false)

const name = ref('')
const description = ref('')
const visibility = ref('private')

const VISIBILITY: DzSelectItem[] = [
  { label: 'Private — only you and invitees', value: 'private' },
  { label: 'Team — everyone in your org', value: 'team' },
  { label: 'Public — anyone with the link', value: 'public' },
]

const created = ref<{ name: string, visibility: string }[]>([])

function resetForm(): void {
  name.value = ''
  description.value = ''
  visibility.value = 'private'
}

function create(): void {
  const trimmed = name.value.trim()
  if (!trimmed)
    return
  created.value.unshift({ name: trimmed, visibility: visibility.value })
  open.value = false
  resetForm()
}
</script>

<template>
  <section class="cd-wrap" aria-labelledby="cd-title">
    <header class="cd-head">
      <DzHeading id="cd-title" :level="4" size="md" weight="semibold" class="cd-title">
        Create dialog
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="cd-sub">
        A focus-trapped modal form — Escape or the backdrop dismisses it.
      </DzText>
    </header>

    <DzDialog v-model:open="open">
      <DzDialogTrigger as-child>
        <DzButton variant="solid" tone="primary" size="md">
          <template #prefix>
            <Plus :size="16" aria-hidden="true" />
          </template>
          New project
        </DzButton>
      </DzDialogTrigger>

      <DzDialogContent size="md" aria-label="Create a new project">
        <DzDialogClose />

        <div class="cd-dialog-head">
          <span class="cd-dialog-icon" aria-hidden="true"><FolderGit2 :size="20" /></span>
          <div>
            <DzDialogTitle class="cd-dialog-title">
              Create a new project
            </DzDialogTitle>
            <DzDialogDescription class="cd-dialog-desc">
              Projects keep your dashboards, members and data sources together.
            </DzDialogDescription>
          </div>
        </div>

        <form class="cd-form" @submit.prevent="create">
          <DzFormField>
            <DzFormLabel>Project name</DzFormLabel>
            <DzInput v-model="name" placeholder="e.g. Growth analytics" autocomplete="off" />
          </DzFormField>

          <DzFormField>
            <DzFormLabel>Description</DzFormLabel>
            <DzTextarea v-model="description" :rows="3" placeholder="What is this project for?" />
          </DzFormField>

          <DzFormField>
            <DzFormLabel>Visibility</DzFormLabel>
            <DzSelect v-model="visibility" :items="VISIBILITY" aria-label="Visibility" />
          </DzFormField>
        </form>

        <footer class="cd-dialog-footer">
          <DzDialogClose as-child>
            <DzButton variant="ghost" tone="neutral">
              Cancel
            </DzButton>
          </DzDialogClose>
          <DzButton variant="solid" tone="primary" :disabled="!name.trim()" @click="create">
            Create project
          </DzButton>
        </footer>
      </DzDialogContent>
    </DzDialog>

    <!-- Created projects feedback ----------------------------------------- -->
    <div class="cd-created" role="status" aria-live="polite">
      <DzText v-if="!created.length" size="sm" tone="muted" as="p">
        No projects yet — create one to see it here.
      </DzText>
      <ul v-else class="cd-list">
        <li v-for="(p, i) in created" :key="i" class="cd-list-item">
          <DzText size="sm" weight="medium" as="span">
            {{ p.name }}
          </DzText>
          <DzBadge variant="subtle" tone="neutral" size="sm">
            {{ p.visibility }}
          </DzBadge>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.cd-wrap {
  max-width: 34rem;
  margin: 0 auto;
}

.cd-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.cd-title {
  margin: 0;
}

.cd-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

/* Dialog content ---------------------------------------------------------- */
.cd-dialog-head {
  display: flex;
  align-items: flex-start;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-4, 1rem);
}

.cd-dialog-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: var(--dz-radius-md, 0.375rem);
  background: var(--dz-primary-subtle, #eef2ff);
  color: var(--dz-primary, #6366f1);
}

.cd-dialog-title {
  margin: 0;
}

.cd-dialog-desc {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.cd-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.cd-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-5, 1.25rem);
}

/* Created list ------------------------------------------------------------ */
.cd-created {
  margin-top: var(--dz-space-4, 1rem);
}

.cd-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.cd-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-2, 0.5rem) var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-md, 0.375rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #fff);
}
</style>
