<script setup lang="ts">
/**
 * Tasks / To-Do — full-page app template (docs/templates.md §6.4).
 *
 * A DzAppShell hosting a personal task list: a left rail of lists (My Day,
 * Important, …), a "My Day" header, a quick-add DzInput, a DzSegmented switch
 * between Today / Upcoming / Done, and a DzList of tasks — each with a DzCheckbox
 * completion toggle, a priority DzBadge, a label DzTag and a per-task
 * DzDropdownMenu (star / move / delete). Checking, adding, switching views,
 * starring, moving and deleting are all wired client-side. Built only from free
 * `@dzup-ui/core` components, token-styled (no `lp-*`), light + dark, to 390px.
 */
import {
  DzAppShell,
  DzAvatar,
  DzBadge,
  DzButton,
  DzCheckbox,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
  DzHeading,
  DzInput,
  DzList,
  DzListItem,
  DzSegmented,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import { Boxes, MoreHorizontal, Plus, Star } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { NAV, PRIORITY_TONE, TASKS, TODAY_LABEL, type TaskItem } from './data.ts'

// Local, mutable copy so every interaction feels live in the preview.
const tasks = reactive<TaskItem[]>(TASKS.map((t) => ({ ...t })))

const view = ref<'today' | 'upcoming' | 'done'>('today')
const draft = ref('')
let seq = 100

const counts = computed(() => ({
  today: tasks.filter((t) => !t.done && t.when === 'today').length,
  upcoming: tasks.filter((t) => !t.done && t.when === 'upcoming').length,
  done: tasks.filter((t) => t.done).length,
}))

const views = computed(() => [
  { value: 'today', label: `Today · ${counts.value.today}` },
  { value: 'upcoming', label: `Upcoming · ${counts.value.upcoming}` },
  { value: 'done', label: `Done · ${counts.value.done}` },
])

const filtered = computed(() => {
  if (view.value === 'done') return tasks.filter((t) => t.done)
  return tasks.filter((t) => !t.done && t.when === view.value)
})

function addTask(): void {
  const title = draft.value.trim()
  if (!title) return
  const when = view.value === 'upcoming' ? 'upcoming' : 'today'
  tasks.unshift({
    id: `new-${seq++}`,
    title,
    done: false,
    when,
    due: when === 'upcoming' ? 'Soon' : 'Today',
    priority: 'Medium',
    label: 'Task',
    labelTone: 'neutral',
    starred: false,
  })
  draft.value = ''
}

function toggleStar(task: TaskItem): void {
  task.starred = !task.starred
}

function move(task: TaskItem): void {
  task.when = task.when === 'today' ? 'upcoming' : 'today'
  task.due = task.when === 'upcoming' ? 'Soon' : 'Today'
}

function remove(task: TaskItem): void {
  const i = tasks.findIndex((t) => t.id === task.id)
  if (i !== -1) tasks.splice(i, 1)
}
</script>

<template>
  <DzAppShell aria-label="Tasks workspace" class="td-shell">
    <template #sidebar>
      <DzSidebar aria-label="Lists">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Northwind Tasks</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Lists">
          <DzSidebarItem v-for="item in NAV" :key="item.key" :active="item.active" href="#">
            <template #icon><component :is="item.icon" :size="18" /></template>
            {{ item.label }}
            <template #badge>
              <DzBadge variant="subtle" :tone="item.active ? 'primary' : 'neutral'" size="sm">
                {{ item.count }}
              </DzBadge>
            </template>
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
      <div class="td-title">
        <DzHeading :level="1" size="lg" weight="semibold">My Day</DzHeading>
        <DzText size="sm" tone="muted" as="span">{{ TODAY_LABEL }}</DzText>
      </div>
    </template>

    <template #header-end>
      <DzBadge variant="subtle" tone="success" size="sm">
        {{ counts.today }} left today
      </DzBadge>
    </template>

    <div class="td-body">
      <!-- Quick add -->
      <form class="quick-add" @submit.prevent="addTask">
        <DzInput
          v-model="draft"
          placeholder="Add a task and press Enter…"
          aria-label="Add a task"
          class="quick-add-input"
        />
        <DzButton type="submit" variant="solid" tone="primary" :disabled="!draft.trim()">
          <template #prefix><Plus :size="16" aria-hidden="true" /></template>
          Add
        </DzButton>
      </form>

      <!-- View switcher -->
      <DzSegmented v-model="view" :items="views" size="sm" aria-label="Filter tasks" class="td-views" />

      <!-- Task list -->
      <DzList v-if="filtered.length" variant="divided" class="td-list">
        <DzListItem v-for="task in filtered" :key="task.id">
          <template #prefix>
            <DzCheckbox v-model="task.done" :aria-label="`Mark ${task.title} done`" />
          </template>

          <div class="task" :class="{ 'task--done': task.done }">
            <div class="task-head">
              <DzText size="sm" weight="medium" as="span" class="task-title">{{ task.title }}</DzText>
              <Star v-if="task.starred" :size="14" class="task-star" aria-label="Starred" />
            </div>
            <div class="task-meta">
              <DzBadge variant="outline" :tone="PRIORITY_TONE[task.priority]" size="sm">
                {{ task.priority }}
              </DzBadge>
              <DzTag variant="subtle" :tone="task.labelTone" size="sm">{{ task.label }}</DzTag>
              <DzText size="xs" tone="muted" as="span" class="task-due">{{ task.due }}</DzText>
            </div>
          </div>

          <template #suffix>
            <DzDropdownMenu>
              <DzDropdownMenuTrigger as-child>
                <DzButton
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  class="task-menu"
                  :aria-label="`Actions for ${task.title}`"
                >
                  <MoreHorizontal :size="16" aria-hidden="true" />
                </DzButton>
              </DzDropdownMenuTrigger>
              <DzDropdownMenuContent align="end">
                <DzDropdownMenuItem @select="toggleStar(task)">
                  {{ task.starred ? 'Remove star' : 'Star task' }}
                </DzDropdownMenuItem>
                <DzDropdownMenuItem @select="move(task)">
                  {{ task.when === 'today' ? 'Move to Upcoming' : 'Move to Today' }}
                </DzDropdownMenuItem>
                <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
                <DzDropdownMenuSeparator />
                <DzDropdownMenuItem @select="remove(task)">Delete</DzDropdownMenuItem>
              </DzDropdownMenuContent>
            </DzDropdownMenu>
          </template>
        </DzListItem>
      </DzList>

      <!-- Empty -->
      <div v-else class="td-empty">
        <span class="td-empty-glyph" aria-hidden="true">
          <component :is="view === 'done' ? Star : Plus" :size="22" />
        </span>
        <DzText weight="semibold" as="div">
          {{ view === 'done' ? 'Nothing completed yet' : 'All clear' }}
        </DzText>
        <DzText size="sm" tone="muted" as="p">
          {{
            view === 'done'
              ? 'Tasks you finish will collect here.'
              : 'Add a task above to start planning your day.'
          }}
        </DzText>
      </div>
    </div>
  </DzAppShell>
</template>

<style scoped>
.td-shell {
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

.td-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.td-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}

.quick-add {
  display: flex;
  gap: 8px;
}

.quick-add-input {
  flex: 1;
  min-width: 0;
}

.td-views {
  align-self: flex-start;
}

.td-list {
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-surface);
  padding: 4px 12px;
}

.task {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.task-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.task-title {
  word-break: break-word;
}

.task--done .task-title {
  text-decoration: line-through;
  color: var(--dz-muted-foreground);
}

.task-star {
  flex-shrink: 0;
  color: var(--dz-warning);
  fill: var(--dz-warning);
}

.task-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.task-due {
  margin-left: 2px;
}

.task-menu {
  padding-inline: 6px;
}

.td-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  padding: 48px 16px;
  border: 1px dashed var(--dz-border);
  border-radius: var(--dz-radius-lg);
}

.td-empty-glyph {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 4px;
  border-radius: var(--dz-radius-full);
  color: var(--dz-primary);
  background: color-mix(in oklch, var(--dz-primary) 12%, transparent);
}

@media (max-width: 560px) {
  .quick-add {
    flex-direction: column;
  }
  .td-views {
    align-self: stretch;
  }
}
</style>
