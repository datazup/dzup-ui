<script setup lang="ts">
// dzup-ui gallery — record DETAIL page (project detail). ONLY @dzup-ui/core components + --dz-* tokens.

import { ref } from 'vue'
import {
  Activity,
  CheckCircle2,
  GitCommitHorizontal,
  Pencil,
  Rocket,
  UserPlus,
} from 'lucide-vue-next'
import { DzButton } from '../../../src/components/buttons'
import { DzCard } from '../../../src/components/cards'
import { DzBadge } from '../../../src/components/feedback'
import { DzAvatar, DzAvatarGroup } from '../../../src/components/media'
import {
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzBreadcrumbSeparator,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
} from '../../../src/components/navigation'
import { DzHeading, DzText } from '../../../src/components/typography'

const activeTab = ref('overview')

interface Stat {
  label: string
  value: string
  hint: string
  hintTone: 'success' | 'muted' | 'warning'
}

const stats: Stat[] = [
  { label: 'Deployments', value: '128', hint: '+12 this week', hintTone: 'success' },
  { label: 'Uptime', value: '99.9%', hint: 'Last 30 days', hintTone: 'muted' },
  { label: 'Avg response', value: '142ms', hint: '-8ms vs last week', hintTone: 'success' },
  { label: 'Open issues', value: '3', hint: '1 high priority', hintTone: 'warning' },
]

interface DetailRow {
  label: string
  value: string
}

const overviewRows: DetailRow[] = [
  { label: 'Owner', value: 'Mara Lindqvist' },
  { label: 'Environment', value: 'Production' },
  { label: 'Region', value: 'eu-central-1' },
  { label: 'Last deploy', value: '2 hours ago · dpl_8f21' },
]

interface ActivityEntry {
  icon: typeof Rocket
  title: string
  meta: string
  tone: 'success' | 'primary' | 'muted'
}

const activity: ActivityEntry[] = [
  {
    icon: Rocket,
    title: 'Deployed v2.14.0 to production',
    meta: 'Mara Lindqvist · 2 hours ago',
    tone: 'success',
  },
  {
    icon: GitCommitHorizontal,
    title: 'Merged PR #482 — Optimize index rebuild',
    meta: 'Devon Reyes · 5 hours ago',
    tone: 'primary',
  },
  {
    icon: CheckCircle2,
    title: 'All checks passed on staging',
    meta: 'CI pipeline · yesterday',
    tone: 'muted',
  },
  {
    icon: Activity,
    title: 'Scaled worker pool 4 → 6 instances',
    meta: 'Autoscaler · 2 days ago',
    tone: 'muted',
  },
]

interface Member {
  name: string
  role: string
  initials: string
}

const team: Member[] = [
  { name: 'Mara Lindqvist', role: 'Owner', initials: 'ML' },
  { name: 'Devon Reyes', role: 'Maintainer', initials: 'DR' },
  { name: 'Priya Nair', role: 'Contributor', initials: 'PN' },
]

const dotTone: Record<ActivityEntry['tone'], string> = {
  success: 'bg-[var(--dz-success)]',
  primary: 'bg-[var(--dz-primary)]',
  muted: 'bg-[var(--dz-border)]',
}
</script>

<template>
  <div class="min-h-screen bg-[var(--dz-muted)] text-[var(--dz-foreground)] antialiased">
    <div class="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <!-- Breadcrumb -->
      <DzBreadcrumb aria-label="Breadcrumb">
        <DzBreadcrumbItem href="#">Projects</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem current>Atlas Migration</DzBreadcrumbItem>
      </DzBreadcrumb>

      <!-- Page header -->
      <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <DzHeading :level="1" size="xl" weight="semibold">Atlas Migration</DzHeading>
            <DzBadge variant="subtle" tone="success" size="sm">Active</DzBadge>
          </div>
          <div class="mt-1.5">
            <DzText as="p" size="sm" tone="muted">Created 12 days ago</DzText>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2.5">
          <DzButton variant="outline" tone="neutral" size="md">
            <template #prefix>
              <Pencil class="h-4 w-4" aria-hidden="true" />
            </template>
            Edit
          </DzButton>
          <DzButton variant="solid" tone="primary" size="md">
            <template #prefix>
              <Rocket class="h-4 w-4" aria-hidden="true" />
            </template>
            Deploy
          </DzButton>
        </div>
      </header>

      <!-- Stat tiles -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DzCard v-for="stat in stats" :key="stat.label" variant="elevated" padding="none">
          <div style="padding: 1.5rem">
            <DzText as="p" size="xs" tone="muted" weight="medium">{{ stat.label }}</DzText>
            <p class="mt-2 text-2xl font-semibold leading-none tabular-nums">{{ stat.value }}</p>
            <div class="mt-2">
              <DzText
                as="span"
                size="xs"
                :tone="stat.hintTone === 'muted' ? 'muted' : stat.hintTone"
              >
                {{ stat.hint }}
              </DzText>
            </div>
          </div>
        </DzCard>
      </div>

      <!-- Main two-column area -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- LEFT: tabbed detail -->
        <DzCard variant="elevated" padding="none" class="lg:col-span-2">
          <div class="px-6 pt-4">
            <DzTabs
              v-model="activeTab"
              variant="line"
              size="md"
              aria-label="Project detail sections"
            >
              <DzTabList>
                <DzTabTrigger value="overview">Overview</DzTabTrigger>
                <DzTabTrigger value="activity">Activity</DzTabTrigger>
                <DzTabTrigger value="settings">Settings</DzTabTrigger>
              </DzTabList>

              <!-- Overview: definition list -->
              <DzTabContent value="overview">
                <dl class="divide-y divide-[var(--dz-border)] py-2">
                  <div
                    v-for="row in overviewRows"
                    :key="row.label"
                    class="flex items-center justify-between gap-4 py-3.5"
                  >
                    <dt>
                      <DzText as="span" size="sm" tone="muted">{{ row.label }}</DzText>
                    </dt>
                    <dd>
                      <DzText as="span" size="sm" weight="medium">{{ row.value }}</DzText>
                    </dd>
                  </div>
                </dl>
              </DzTabContent>

              <!-- Activity: timeline -->
              <DzTabContent value="activity">
                <ul class="space-y-5 py-5">
                  <li v-for="(entry, idx) in activity" :key="idx" class="flex items-start gap-3.5">
                    <span
                      class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--dz-radius-full)] bg-[var(--dz-muted)] text-[var(--dz-muted-foreground)]"
                    >
                      <component :is="entry.icon" class="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <DzText as="p" size="sm" weight="medium">{{ entry.title }}</DzText>
                      <div class="mt-0.5 flex items-center gap-2">
                        <span
                          class="h-1.5 w-1.5 rounded-[var(--dz-radius-full)]"
                          :class="dotTone[entry.tone]"
                          aria-hidden="true"
                        />
                        <DzText as="span" size="xs" tone="muted">{{ entry.meta }}</DzText>
                      </div>
                    </div>
                  </li>
                </ul>
              </DzTabContent>

              <!-- Settings: placeholder -->
              <DzTabContent value="settings">
                <div class="py-8 text-center">
                  <DzText as="p" size="sm" tone="muted">
                    Project settings live here — visibility, integrations, and danger zone.
                  </DzText>
                </div>
              </DzTabContent>
            </DzTabs>
          </div>
        </DzCard>

        <!-- RIGHT: team -->
        <DzCard variant="elevated" padding="none" class="lg:col-span-1">
          <div style="padding: 1.5rem">
            <div class="flex items-center justify-between">
              <DzHeading :level="2" size="sm" weight="semibold">Team</DzHeading>
              <DzButton variant="ghost" tone="neutral" size="sm">
                <template #prefix>
                  <UserPlus class="h-4 w-4" aria-hidden="true" />
                </template>
                Invite
              </DzButton>
            </div>

            <div class="mt-3">
              <DzAvatarGroup :max="3" size="sm" aria-label="Project team members">
                <DzAvatar fallback="ML" alt="Mara Lindqvist" />
                <DzAvatar fallback="DR" alt="Devon Reyes" />
                <DzAvatar fallback="PN" alt="Priya Nair" />
                <DzAvatar fallback="SO" alt="Sam Okafor" />
                <DzAvatar fallback="LF" alt="Lena Fischer" />
              </DzAvatarGroup>
            </div>

            <ul class="mt-5 space-y-4">
              <li v-for="member in team" :key="member.name" class="flex items-center gap-3">
                <DzAvatar :fallback="member.initials" :alt="member.name" size="sm" />
                <div class="min-w-0 flex-1">
                  <DzText as="p" size="sm" weight="medium" truncate>{{ member.name }}</DzText>
                  <DzText as="p" size="xs" tone="muted">{{ member.role }}</DzText>
                </div>
              </li>
            </ul>
          </div>
        </DzCard>
      </div>
    </div>
  </div>
</template>
