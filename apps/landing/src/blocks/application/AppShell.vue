<script setup lang="ts">
/**
 * App shell — sidebar nav + top bar + content area.
 *
 * Demonstrates the DzAppShell / DzSidebar compound layout: a collapsible
 * sidebar with branded header, primary nav, user footer; a top bar with
 * breadcrumb, page title and a user avatar menu; and a placeholder main
 * content area. Self-contained — no router, no props, local ref() state only.
 *
 * Heading level: H4 so it nests cleanly under the BlockPreview H3 title
 * (docs/blocks.md §3.6). Raise :level on your own page.
 *
 * Height is constrained to ~540 px so it renders inside the preview card
 * without relying on 100vh.
 */
import {
  DzAppShell,
  DzAvatar,
  DzBadge,
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzButton,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
  DzHeading,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzText,
} from '@dzup-ui/core'
import {
  BarChart2,
  Bell,
  Boxes,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-vue-next'
import { ref } from 'vue'

const sidebarCollapsed = ref(false)

const primaryNav = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Analytics', icon: BarChart2 },
  { label: 'Projects', icon: FolderOpen, badge: '3' },
  { label: 'Team', icon: Users },
  { label: 'Reports', icon: FileText },
]

const secondaryNav = [
  { label: 'Notifications', icon: Bell },
  { label: 'Settings', icon: Settings },
]
</script>

<template>
  <section class="shell-wrap" aria-label="App shell preview">
    <DzAppShell
      aria-label="Application workspace"
      class="shell-root"
      :sidebar-collapsed-width="sidebarCollapsed ? '4rem' : '14rem'"
    >
      <!-- ── Sidebar ──────────────────────────────────────────────────── -->
      <template #sidebar>
        <DzSidebar
          :collapsed="sidebarCollapsed"
          aria-label="Primary navigation"
          @update:collapsed="(v) => (sidebarCollapsed = v === true)"
        >
          <DzSidebarHeader>
            <span class="brand">
              <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
              <span class="brand-name">Northwind</span>
            </span>
          </DzSidebarHeader>

          <DzSidebarSection title="Main">
            <DzSidebarItem
              v-for="item in primaryNav"
              :key="item.label"
              :active="item.active"
              href="#"
            >
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

          <DzSidebarSection title="System">
            <DzSidebarItem v-for="item in secondaryNav" :key="item.label" href="#">
              <template #icon>
                <component :is="item.icon" :size="18" />
              </template>
              {{ item.label }}
            </DzSidebarItem>
          </DzSidebarSection>

          <DzSidebarFooter>
            <span class="user-row">
              <DzAvatar fallback="JD" alt="Jamie Doe" size="sm" />
              <span class="user-meta">
                <DzText size="sm" weight="medium" as="span">Jamie Doe</DzText>
                <DzText size="xs" tone="muted" as="span">jamie@acme.io</DzText>
              </span>
            </span>
          </DzSidebarFooter>
        </DzSidebar>
      </template>

      <!-- ── Top bar ──────────────────────────────────────────────────── -->
      <template #header-start>
        <DzButton
          variant="ghost"
          tone="neutral"
          size="sm"
          :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <Boxes :size="16" aria-hidden="true" />
        </DzButton>
      </template>

      <template #header>
        <DzBreadcrumb aria-label="Page location">
          <DzBreadcrumbItem href="#">
            Home
          </DzBreadcrumbItem>
          <DzBreadcrumbItem href="#">
            Projects
          </DzBreadcrumbItem>
          <DzBreadcrumbItem :current="true">
            Dashboard
          </DzBreadcrumbItem>
        </DzBreadcrumb>
      </template>

      <template #header-end>
        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <button class="avatar-btn" aria-label="Open user menu">
              <DzAvatar fallback="JD" alt="Jamie Doe" size="sm" />
            </button>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent align="end">
            <DzDropdownMenuItem>Profile</DzDropdownMenuItem>
            <DzDropdownMenuItem>Account settings</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Sign out</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </template>

      <!-- ── Main content ─────────────────────────────────────────────── -->
      <div class="shell-content">
        <DzHeading :level="4" size="xl" weight="semibold" class="shell-page-title">
          Dashboard
        </DzHeading>
        <DzText tone="muted" size="sm">
          Welcome back, Jamie. Here's what's happening today.
        </DzText>
        <div class="shell-placeholder" aria-hidden="true" />
      </div>
    </DzAppShell>
  </section>
</template>

<style scoped>
.shell-wrap {
  min-height: 540px;
  height: 540px;
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
}

.shell-root {
  height: 100%;
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
  border-radius: var(--dz-radius-md, 0.375rem);
  background: var(--dz-primary, #6366f1);
  color: var(--dz-primary-foreground, #fff);
  flex-shrink: 0;
}

.user-row {
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
  overflow: hidden;
}

.avatar-btn {
  all: unset;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-btn:focus-visible {
  outline: 2px solid var(--dz-ring, #6366f1);
  outline-offset: 2px;
}

.shell-content {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-6, 1.5rem);
}

.shell-page-title {
  margin: 0;
}

.shell-placeholder {
  margin-top: var(--dz-space-4, 1rem);
  height: 180px;
  border-radius: var(--dz-radius-md, 0.375rem);
  background: var(--dz-muted, #f3f4f6);
  opacity: 0.5;
}
</style>
