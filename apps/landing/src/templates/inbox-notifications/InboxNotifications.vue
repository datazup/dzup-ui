<script setup lang="ts">
import type { Notification } from './data.ts'
/**
 * Inbox / Notifications — full-page template (docs/templates.md §6.1).
 *
 * A DzAppShell with a DzSidebar of folders and a notifications feed: a DzTabs
 * filter (All / Unread / Mentions), a DzList of DzListItems with a DzAvatar
 * actor, DzBadge unread markers and per-row DzButton actions, plus a DzEmpty
 * caught-up state once everything is read. Built only from free `@dzup-ui/core`
 * components, token-styled, light + dark, reflows to 390px.
 */
import {
  DzAppShell,
  DzAvatar,
  DzBadge,
  DzButton,
  DzEmpty,
  DzHeading,
  DzList,
  DzListItem,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
} from '@dzup-ui/core'
import { Boxes, CheckCheck, Inbox as InboxIcon } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import {
  INBOX_TABS,

  NOTIFICATIONS,
  PRIMARY_NAV,
  SECONDARY_NAV,
} from './data.ts'

const tab = ref('all')
// Local, mutable copy so "Mark all read" feels live in the preview.
const items = reactive<Notification[]>(NOTIFICATIONS.map(n => ({ ...n })))

const filtered = computed(() => {
  if (tab.value === 'unread')
    return items.filter(n => n.unread)
  if (tab.value === 'mentions')
    return items.filter(n => n.mention)
  return items
})

const unreadCount = computed(() => items.filter(n => n.unread).length)

function markAllRead() {
  items.forEach((n) => {
    n.unread = false
  })
}

function open(n: Notification) {
  n.unread = false
}
</script>

<template>
  <DzAppShell aria-label="Notifications" class="inbox-shell">
    <template #sidebar>
      <DzSidebar aria-label="Folders">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Northwind</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Notifications">
          <DzSidebarItem v-for="item in PRIMARY_NAV" :key="item.label" :active="item.active" href="#">
            <template #icon>
              <component :is="item.icon" :size="18" />
            </template>
            {{ item.label }}
            <template v-if="item.badge" #badge>
              <DzBadge variant="solid" tone="primary" size="sm">
                {{ item.badge }}
              </DzBadge>
            </template>
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarSection title="Account">
          <DzSidebarItem v-for="item in SECONDARY_NAV" :key="item.label" href="#">
            <template #icon>
              <component :is="item.icon" :size="18" />
            </template>
            {{ item.label }}
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarFooter>
          <span class="user">
            <DzAvatar fallback="AR" size="sm" />
            <span class="user-meta">
              <DzText size="sm" weight="medium" as="span">Ava Restić</DzText>
              <DzText size="xs" tone="muted" as="span">ava@northwind.io</DzText>
            </span>
          </span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="inbox-title">
        <DzHeading :level="1" size="lg" weight="semibold">
          Notifications
        </DzHeading>
        <DzBadge v-if="unreadCount" variant="subtle" tone="primary" size="sm">
          {{ unreadCount }} unread
        </DzBadge>
      </div>
    </template>

    <template #header-end>
      <DzButton size="sm" variant="outline" tone="neutral" :disabled="!unreadCount" @click="markAllRead">
        <template #prefix>
          <CheckCheck :size="15" aria-hidden="true" />
        </template>
        Mark all read
      </DzButton>
    </template>

    <div class="inbox-body">
      <DzTabs v-model="tab" variant="line" size="sm" aria-label="Filter notifications">
        <DzTabList>
          <DzTabTrigger v-for="t in INBOX_TABS" :key="t.value" :value="t.value">
            {{ t.label }}
          </DzTabTrigger>
        </DzTabList>
      </DzTabs>

      <DzEmpty
        v-if="!filtered.length"
        :icon="InboxIcon"
        title="You're all caught up"
        description="No notifications here right now. New activity will show up automatically."
      />

      <DzList v-else variant="divided" class="feed">
        <DzListItem v-for="n in filtered" :key="n.id" :class="{ 'is-unread': n.unread }">
          <template #prefix>
            <span class="actor">
              <DzAvatar :fallback="n.actor" size="sm" />
              <span v-if="n.unread" class="unread-dot" aria-hidden="true" />
            </span>
          </template>

          <div class="note">
            <DzText size="sm" as="div" class="note-text">
              <strong>{{ n.name }}</strong> {{ n.action }}
              <span class="note-target">{{ n.target }}</span>
            </DzText>
            <div class="note-meta">
              <DzText size="xs" tone="muted" as="span">
                {{ n.when }}
              </DzText>
              <DzBadge v-if="n.mention" variant="subtle" tone="warning" size="sm">
                Mention
              </DzBadge>
            </div>
          </div>

          <template #suffix>
            <DzButton size="sm" variant="ghost" tone="neutral" @click="open(n)">
              View
            </DzButton>
          </template>
        </DzListItem>
      </DzList>
    </div>
  </DzAppShell>
</template>

<style scoped>
.inbox-shell {
  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.inbox-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.inbox-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 720px;
}

.feed {
  width: 100%;
}

.actor {
  position: relative;
  display: inline-flex;
}

.unread-dot {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 9px;
  height: 9px;
  border-radius: var(--dz-radius-full);
  background: var(--dz-primary);
  outline: 2px solid var(--dz-card);
}

.note {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.note-text {
  line-height: 1.45;
}

.note-target {
  color: var(--dz-primary);
  font-weight: var(--dz-font-medium);
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
