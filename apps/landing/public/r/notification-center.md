# Notification center

A dismissible feed of persistent DzNotifications inside an outlined panel — tone-coded icons, titles, per-item action buttons, a live unread count badge, "Clear all", and an empty state.

- **Category:** Feedback
- **Components:** DzNotification, DzCard, DzBadge, DzButton, DzHeading, DzText
- **Preview:** /blocks#notification-center

```vue
<script setup lang="ts">
/**
 * Notification center — a dismissible feed of persistent DzNotifications.
 *
 * An outlined panel with a header (live unread count badge + "Clear all") over
 * a stack of DzNotification items. Unlike toasts these persist until dismissed:
 * each renders a tone, a leading icon, a title/description, an optional
 * `#actions` slot, and a close control wired to `@close`. Clearing the last
 * one swaps in an empty state; "Restore" repopulates the feed.
 *
 * Self-contained: local reactive state. Composed only from free @dzup-ui/core
 * components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { BellOff, GitPullRequestArrow, MessageSquare, TriangleAlert, UserPlus } from 'lucide-vue-next'
import { DzBadge, DzButton, DzCard, DzHeading, DzNotification, DzText } from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'

interface Note {
  id: number
  title: string
  description: string
  tone: CanonicalTone
  icon: Component
  action?: string
}

const SEED: Note[] = [
  { id: 1, title: 'Maya requested a review', description: 'PR #318 — "Refactor billing webhooks" is waiting on you.', tone: 'primary', icon: GitPullRequestArrow, action: 'Review' },
  { id: 2, title: 'New teammate joined', description: 'Jonas Weber accepted your invite to the Platform workspace.', tone: 'info', icon: UserPlus, action: 'Say hi' },
  { id: 3, title: 'Build failed on main', description: 'Pipeline #4,920 failed at the "e2e" stage 6 minutes ago.', tone: 'danger', icon: TriangleAlert, action: 'View logs' },
  { id: 4, title: 'Sofia mentioned you', description: '"@you can you confirm the launch copy?" in #marketing.', tone: 'neutral', icon: MessageSquare, action: 'Reply' },
]

const notes = ref<Note[]>([...SEED])
const count = computed(() => notes.value.length)

function dismiss(id: number) {
  notes.value = notes.value.filter((note) => note.id !== id)
}
function clearAll() {
  notes.value = []
}
function restore() {
  notes.value = [...SEED]
}
</script>

<template>
  <section class="nc-wrap" aria-labelledby="nc-title">
    <DzCard variant="outlined" padding="none">
      <header class="nc-head">
        <div class="nc-head-text">
          <DzHeading id="nc-title" :level="4" size="md" weight="semibold" class="nc-title">Notifications</DzHeading>
          <DzBadge v-if="count" variant="subtle" tone="primary" size="sm">{{ count }} new</DzBadge>
        </div>
        <DzButton v-if="count" size="sm" variant="ghost" tone="neutral" @click="clearAll">Clear all</DzButton>
      </header>

      <div v-if="count" class="nc-list">
        <DzNotification
          v-for="note in notes"
          :key="note.id"
          :title="note.title"
          :description="note.description"
          :tone="note.tone"
          :icon="note.icon"
          closable
          @close="dismiss(note.id)"
        >
          <template v-if="note.action" #actions>
            <DzButton size="sm" variant="outline" :tone="note.tone">{{ note.action }}</DzButton>
          </template>
        </DzNotification>
      </div>

      <div v-else class="nc-empty">
        <BellOff class="nc-empty-icon" aria-hidden="true" />
        <DzText size="sm" tone="muted" as="p" class="nc-empty-text">You're all caught up.</DzText>
        <DzButton size="sm" variant="outline" tone="neutral" @click="restore">Restore notifications</DzButton>
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.nc-wrap {
  background: var(--dz-background, #fff);
  max-width: 32rem;
  margin: 0 auto;
}

.nc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-4, 1rem);
  border-bottom: 1px solid var(--dz-border, #e2e8f0);
}

.nc-head-text {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.nc-title {
  margin: 0;
}

.nc-list {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-3, 0.75rem);
}

.nc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-8, 2rem) var(--dz-space-4, 1rem);
  text-align: center;
}

.nc-empty-icon {
  width: 2rem;
  height: 2rem;
  color: var(--dz-muted-foreground, #94a3b8);
}

.nc-empty-text {
  margin: 0;
}
</style>
```
