<script setup lang="ts">
// dzup-ui Sidebar showcase — expanded grouped sidebar vs. collapsed icon-rail.
// ONLY @dzup-ui/core components + --dz-* tokens. No raw hex, no non-token colors.

import type { Component } from 'vue'
import {
  BarChart3,
  FolderKanban,
  Home,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Users,
} from 'lucide-vue-next'
import { DzBadge } from '../../../src/components/feedback'
import { DzAvatar } from '../../../src/components/media'
import {
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
} from '../../../src/components/navigation'
import { DzHeading, DzText } from '../../../src/components/typography'

interface NavItem {
  label: string
  icon: Component
  active?: boolean
  badge?: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

// Shared nav data — rendered twice (expanded + collapsed).
const groups: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Home', icon: Home },
      { label: 'Dashboard', icon: LayoutDashboard, active: true },
      { label: 'Inbox', icon: Inbox, badge: '12' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Projects', icon: FolderKanban, badge: '5' },
      { label: 'Team', icon: Users },
      { label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', icon: Settings },
      { label: 'Support', icon: LifeBuoy },
    ],
  },
]
</script>

<template>
  <div class="min-h-screen bg-[var(--dz-muted)] text-[var(--dz-foreground)] antialiased">
    <div class="mx-auto max-w-6xl px-6 py-10">
      <header class="mb-8">
        <DzText
          as="p"
          size="xs"
          weight="semibold"
          tone="muted"
          class="mb-1 uppercase tracking-[0.2em] text-[var(--dz-primary)]"
        >
          Navigation
        </DzText>
        <DzHeading :level="1" size="2xl" weight="semibold" class="tracking-tight">
          Sidebar
        </DzHeading>
        <DzText as="p" size="sm" tone="muted" class="mt-1">
          Grouped sections, count badges, and the icon-rail collapsed state.
        </DzText>
      </header>

      <div class="flex flex-wrap items-start gap-8">
        <!-- Expanded grouped sidebar -->
        <div class="flex flex-col gap-3">
          <div
            class="h-[640px] overflow-hidden rounded-[var(--dz-radius-lg)] border border-[var(--dz-border)] shadow-[var(--dz-shadow-lg)]"
          >
            <DzSidebar active-style="filled" width="17rem" class="h-full">
              <DzSidebarHeader>
                <template #default="{ collapsed }">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--dz-radius-md)] bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]"
                    >
                      <LayoutDashboard class="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span v-if="!collapsed" class="flex flex-col leading-tight">
                      <DzText as="span" size="sm" weight="semibold">Datazup</DzText>
                      <DzText as="span" size="xs" tone="muted">Workspace</DzText>
                    </span>
                  </div>
                </template>
              </DzSidebarHeader>

              <DzSidebarSection v-for="group in groups" :key="group.title" :title="group.title">
                <DzSidebarItem v-for="item in group.items" :key="item.label" :active="item.active">
                  <template #icon>
                    <component :is="item.icon" class="h-4.5 w-4.5" aria-hidden="true" />
                  </template>
                  {{ item.label }}
                  <template v-if="item.badge" #badge>
                    <DzBadge variant="subtle" tone="primary" size="sm" class="tabular-nums">
                      {{ item.badge }}
                    </DzBadge>
                  </template>
                </DzSidebarItem>
              </DzSidebarSection>

              <DzSidebarFooter>
                <template #default="{ collapsed }">
                  <div class="flex items-center gap-2.5">
                    <DzAvatar fallback="ML" size="sm" />
                    <span v-if="!collapsed" class="flex min-w-0 flex-col leading-tight">
                      <DzText as="span" size="sm" weight="medium" class="truncate">
                        Mara Lindqvist
                      </DzText>
                      <DzText as="span" size="xs" tone="muted" class="truncate"> Admin </DzText>
                    </span>
                  </div>
                </template>
              </DzSidebarFooter>
            </DzSidebar>
          </div>
          <DzText as="p" size="xs" weight="medium" tone="muted" class="text-center">
            Expanded
          </DzText>
        </div>

        <!-- Collapsed icon-rail — same data, :collapsed -->
        <div class="flex flex-col gap-3">
          <div
            class="h-[640px] overflow-hidden rounded-[var(--dz-radius-lg)] border border-[var(--dz-border)] shadow-[var(--dz-shadow-lg)]"
          >
            <DzSidebar
              :collapsed="true"
              active-style="filled"
              collapsed-width="4.5rem"
              class="h-full"
            >
              <DzSidebarHeader>
                <template #default="{ collapsed }">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--dz-radius-md)] bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]"
                    >
                      <LayoutDashboard class="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span v-if="!collapsed" class="flex flex-col leading-tight">
                      <DzText as="span" size="sm" weight="semibold">Datazup</DzText>
                      <DzText as="span" size="xs" tone="muted">Workspace</DzText>
                    </span>
                  </div>
                </template>
              </DzSidebarHeader>

              <DzSidebarSection v-for="group in groups" :key="group.title" :title="group.title">
                <DzSidebarItem
                  v-for="item in group.items"
                  :key="item.label"
                  :active="item.active"
                  :aria-label="item.label"
                >
                  <template #icon>
                    <component :is="item.icon" class="h-4.5 w-4.5" aria-hidden="true" />
                  </template>
                  {{ item.label }}
                  <template v-if="item.badge" #badge>
                    <DzBadge variant="subtle" tone="primary" size="sm" class="tabular-nums">
                      {{ item.badge }}
                    </DzBadge>
                  </template>
                </DzSidebarItem>
              </DzSidebarSection>

              <DzSidebarFooter>
                <template #default="{ collapsed }">
                  <div class="flex items-center justify-center gap-2.5">
                    <DzAvatar fallback="ML" size="sm" />
                    <span v-if="!collapsed" class="flex min-w-0 flex-col leading-tight">
                      <DzText as="span" size="sm" weight="medium" class="truncate">
                        Mara Lindqvist
                      </DzText>
                      <DzText as="span" size="xs" tone="muted" class="truncate"> Admin </DzText>
                    </span>
                  </div>
                </template>
              </DzSidebarFooter>
            </DzSidebar>
          </div>
          <DzText as="p" size="xs" weight="medium" tone="muted" class="text-center">
            Collapsed
          </DzText>
        </div>
      </div>
    </div>
  </div>
</template>
