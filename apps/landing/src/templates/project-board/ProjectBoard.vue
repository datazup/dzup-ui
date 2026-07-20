<script setup lang="ts">
import type { Task } from './data.ts'
/**
 * Project / Task Board — full-page dashboard template (docs/templates.md §6.1).
 *
 * A DzAppShell hosting a kanban-style board: a DzTabs switch between Board and
 * List views, status lanes built from DzCard + DzList(+Item) with a DzCheckbox
 * per task, DzTag labels, DzBadge priority chips, DzAvatarGroup assignees and a
 * DzProgress completion bar per lane. Built only from free `@dzup-ui/core`
 * components, token-styled, light + dark, reflows to 390px.
 */
import {
  DzAppShell,
  DzAvatar,
  DzAvatarGroup,
  DzBadge,
  DzCard,
  DzCheckbox,
  DzHeading,
  DzList,
  DzListItem,
  DzProgress,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import { Boxes } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import {
  COLUMNS,
  PRIMARY_NAV,
  PRIORITY_TONE,
  SECONDARY_NAV,

  TASKS,
} from './data.ts'

const view = ref('board')
// Local, mutable copy so the DzCheckbox toggles feel live in the preview.
const tasks = reactive<Task[]>(TASKS.map(t => ({ ...t })))

function tasksFor(columnKey: string) {
  return tasks.filter(t => t.column === columnKey)
}

function laneProgress(columnKey: string): number {
  const rows = tasksFor(columnKey)
  if (!rows.length)
    return 0
  return Math.round((rows.filter(t => t.done).length / rows.length) * 100)
}

const completion = computed(() =>
  Math.round((tasks.filter(t => t.done).length / tasks.length) * 100),
)
</script>

<template>
  <DzAppShell aria-label="Project board workspace" class="board-shell">
    <template #sidebar>
      <DzSidebar aria-label="Primary">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Northwind</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Workspace">
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
              <DzText size="xs" tone="muted" as="span">Product</DzText>
            </span>
          </span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="board-title">
        <DzHeading :level="1" size="lg" weight="semibold">
          Platform Q3
        </DzHeading>
        <DzBadge variant="subtle" tone="success" size="sm">
          {{ completion }}% done
        </DzBadge>
      </div>
    </template>

    <template #header-end>
      <DzAvatarGroup :max="4" size="sm" aria-label="Project members">
        <DzAvatar fallback="AR" />
        <DzAvatar fallback="DR" />
        <DzAvatar fallback="PN" />
        <DzAvatar fallback="LF" />
        <DzAvatar fallback="SO" />
        <DzAvatar fallback="MP" />
      </DzAvatarGroup>
    </template>

    <div class="board-body">
      <DzProgress :value="completion" tone="primary" class="overall" aria-label="Overall completion" />

      <DzTabs v-model="view" variant="pills" size="sm" aria-label="Board view">
        <DzTabList>
          <DzTabTrigger value="board">
            Board
          </DzTabTrigger>
          <DzTabTrigger value="list">
            List
          </DzTabTrigger>
        </DzTabList>

        <DzTabContent value="board">
          <div class="lanes">
            <section v-for="col in COLUMNS" :key="col.key" class="lane">
              <header class="lane-head">
                <div class="lane-head-row">
                  <DzText weight="semibold" size="sm">
                    {{ col.title }}
                  </DzText>
                  <DzBadge variant="subtle" :tone="col.tone" size="sm">
                    {{ tasksFor(col.key).length }}
                  </DzBadge>
                </div>
                <DzProgress
                  :value="laneProgress(col.key)"
                  size="sm"
                  :tone="col.tone"
                  :aria-label="`${col.title} completion`"
                />
              </header>

              <DzCard variant="outlined" padding="sm" class="lane-card">
                <DzList variant="divided">
                  <DzListItem v-for="task in tasksFor(col.key)" :key="task.id">
                    <template #prefix>
                      <DzCheckbox v-model="task.done" :aria-label="`Mark ${task.title} done`" />
                    </template>
                    <div class="task" :class="{ 'task--done': task.done }">
                      <DzText size="sm" weight="medium" as="div" class="task-title">
                        {{ task.title }}
                      </DzText>
                      <div class="task-meta">
                        <DzTag variant="subtle" :tone="task.labelTone" size="sm">
                          {{ task.label }}
                        </DzTag>
                        <DzBadge variant="outline" :tone="PRIORITY_TONE[task.priority]" size="sm">
                          {{ task.priority }}
                        </DzBadge>
                      </div>
                    </div>
                    <template #suffix>
                      <DzAvatarGroup :max="2" size="xs" :aria-label="`${task.title} assignees`">
                        <DzAvatar v-for="a in task.assignees" :key="a" :fallback="a" />
                      </DzAvatarGroup>
                    </template>
                  </DzListItem>
                </DzList>
              </DzCard>
            </section>
          </div>
        </DzTabContent>

        <DzTabContent value="list">
          <DzCard variant="outlined" padding="none" class="list-card">
            <DzList variant="divided">
              <DzListItem v-for="task in tasks" :key="task.id">
                <template #prefix>
                  <DzCheckbox v-model="task.done" :aria-label="`Mark ${task.title} done`" />
                </template>
                <div class="task" :class="{ 'task--done': task.done }">
                  <DzText size="sm" weight="medium" as="div" class="task-title">
                    {{ task.title }}
                  </DzText>
                  <div class="task-meta">
                    <DzTag variant="subtle" :tone="task.labelTone" size="sm">
                      {{ task.label }}
                    </DzTag>
                    <DzBadge variant="outline" :tone="PRIORITY_TONE[task.priority]" size="sm">
                      {{ task.priority }}
                    </DzBadge>
                    <DzText size="xs" tone="muted" as="span" class="task-col">
                      {{ COLUMNS.find((c) => c.key === task.column)?.title }}
                    </DzText>
                  </div>
                </div>
                <template #suffix>
                  <DzAvatarGroup :max="3" size="xs" :aria-label="`${task.title} assignees`">
                    <DzAvatar v-for="a in task.assignees" :key="a" :fallback="a" />
                  </DzAvatarGroup>
                </template>
              </DzListItem>
            </DzList>
          </DzCard>
        </DzTabContent>
      </DzTabs>
    </div>
  </DzAppShell>
</template>

<style scoped>
.board-shell {
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

.board-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.board-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.overall {
  max-width: 320px;
}

.lanes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
  align-items: start;
}

.lane {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.lane-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lane-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lane-card {
  min-height: 80px;
}

.list-card {
  margin-top: 16px;
}

.task {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.task-title {
  word-break: break-word;
}

.task--done .task-title {
  text-decoration: line-through;
  color: var(--dz-muted-foreground);
}

.task-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.task-col {
  margin-left: 2px;
}

@media (max-width: 1024px) {
  .lanes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .lanes {
    grid-template-columns: 1fr;
  }
}
</style>
