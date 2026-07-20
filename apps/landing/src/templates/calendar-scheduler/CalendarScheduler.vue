<script setup lang="ts">
import type { CalendarEvent, EventPreset } from './data.ts'
/**
 * Calendar / Scheduler — app template (docs/templates.md §6.4).
 *
 * A DzAppShell calendar app: an app-nav rail with a colour-coded calendar legend,
 * a DzCalendar month/week view whose `#day` cells show token-coloured event dots,
 * a DzSegmented month/week switcher, a side agenda for the selected day where each
 * event opens a DzPopover of details (time, location, attendees via DzAvatarGroup,
 * category DzBadge), and a "New event" DzDialog that quick-adds from presets. Built
 * only from free `@dzup-ui/core` components, token-styled with an indigo re-skin,
 * correct in light + dark, and responsive down to 390px.
 */
import {
  DzAppShell,
  DzAvatar,
  DzAvatarGroup,
  DzBadge,
  DzButton,
  DzCalendar,
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogDescription,
  DzDialogTitle,
  DzDialogTrigger,
  DzHeading,
  DzPopover,
  DzPopoverContent,
  DzPopoverTrigger,
  DzSegmented,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzText,
} from '@dzup-ui/core'
import { CalendarRange, Clock, MapPin, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import {
  APP_NAV,
  APP_NAV_SECONDARY,

  CATEGORIES,
  EVENT_PRESETS,

  EVENTS,
  TEAM,
  TIME_SLOTS,
} from './data.ts'

// Local, mutable copy so creating / deleting events feels live in the preview.
const events = reactive<CalendarEvent[]>(EVENTS.map(e => ({ ...e, attendees: [...e.attendees] })))

const view = ref<'month' | 'week'>('month')
const viewItems = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
]

const selectedDate = ref<string | null>('2026-06-25')
const focusedDate = ref('2026-06-25')

// Legend toggles — each calendar can be shown/hidden, like a real client.
const categoryVisible = reactive<Record<string, boolean>>(
  Object.fromEntries(CATEGORIES.map(c => [c.key, true])),
)

const categoryByKey = computed(() => Object.fromEntries(CATEGORIES.map(c => [c.key, c])))

/** ISO 'YYYY-MM-DD' key for a native Date (matches the event `date` field). */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** A CSS custom-property style binding carrying the event's token colour. */
function eventColor(categoryKey: string): Record<string, string> {
  const palette = categoryByKey.value[categoryKey]?.palette ?? 'indigo'
  return { '--evt': `var(--dz-colors-${palette}-500)` }
}

const visibleEvents = computed(() => events.filter(e => categoryVisible[e.category]))

/** Visible events for a given ISO day, sorted by start time. */
function dayEvents(dayIso: string): CalendarEvent[] {
  return visibleEvents.value
    .filter(e => e.date === dayIso)
    .sort((a, b) => a.start.localeCompare(b.start))
}

const selectedDayEvents = computed(() =>
  selectedDate.value ? dayEvents(selectedDate.value) : [],
)

const monthLabel = computed(() =>
  new Date(`${focusedDate.value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }),
)

const selectedLabel = computed(() => {
  if (!selectedDate.value)
    return 'No date selected'
  return new Date(`${selectedDate.value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

// ── New-event dialog state ──────────────────────────────────────────────
const dialogOpen = ref(false)
const pickedPreset = ref<EventPreset>(EVENT_PRESETS[0]!)
const pickedSlot = ref(TIME_SLOTS[0]!.value)
let createdCount = 0

function createEvent() {
  const slot = TIME_SLOTS.find(s => s.value === pickedSlot.value) ?? TIME_SLOTS[0]!
  createdCount += 1
  events.push({
    id: `e-new-${createdCount}`,
    title: pickedPreset.value.title,
    date: selectedDate.value ?? focusedDate.value,
    start: slot.value,
    startLabel: slot.label,
    endLabel: pickedPreset.value.durationLabel,
    category: pickedPreset.value.category,
    attendees: TEAM.slice(0, 3),
    description: `Quick-added ${pickedPreset.value.durationLabel} ${pickedPreset.value.title.toLowerCase()}.`,
  })
  dialogOpen.value = false
}

function deleteEvent(id: string) {
  const index = events.findIndex(e => e.id === id)
  if (index !== -1)
    events.splice(index, 1)
}
</script>

<template>
  <DzAppShell aria-label="Calendar" class="cs">
    <template #sidebar>
      <DzSidebar aria-label="App">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><CalendarRange :size="18" /></span>
            <span class="brand-name">Cadence</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Workspace">
          <DzSidebarItem v-for="item in APP_NAV" :key="item.label" :active="item.active" href="#">
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

        <DzSidebarSection title="My calendars">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.key"
            type="button"
            class="legend"
            :class="{ off: !categoryVisible[cat.key] }"
            :aria-pressed="categoryVisible[cat.key]"
            @click="categoryVisible[cat.key] = !categoryVisible[cat.key]"
          >
            <span class="legend-dot" :style="eventColor(cat.key)" aria-hidden="true" />
            <DzText size="sm" as="span">
              {{ cat.label }}
            </DzText>
          </button>
        </DzSidebarSection>

        <DzSidebarSection title="Account">
          <DzSidebarItem v-for="item in APP_NAV_SECONDARY" :key="item.label" href="#">
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
      <div class="cs-title">
        <DzHeading :level="1" size="lg" weight="semibold">
          {{ monthLabel }}
        </DzHeading>
        <DzBadge variant="subtle" tone="primary" size="sm">
          {{ visibleEvents.length }} events
        </DzBadge>
      </div>
    </template>

    <template #header-end>
      <DzSegmented v-model="view" :items="viewItems" size="sm" aria-label="Calendar view" />
      <DzAvatarGroup :max="4" size="sm" class="team" aria-label="Shared with the team">
        <DzAvatar v-for="initials in TEAM" :key="initials" :fallback="initials" />
      </DzAvatarGroup>

      <DzDialog v-model:open="dialogOpen">
        <DzDialogTrigger as-child>
          <DzButton size="sm" variant="solid" tone="primary">
            <template #prefix>
              <Plus :size="15" aria-hidden="true" />
            </template>
            New event
          </DzButton>
        </DzDialogTrigger>
        <DzDialogContent size="sm">
          <DzDialogTitle>New event</DzDialogTitle>
          <DzDialogDescription>
            Quick-add to <strong>{{ selectedLabel }}</strong>. Pick a type and a time.
          </DzDialogDescription>

          <div class="dialog-body">
            <div class="field">
              <DzText size="sm" weight="medium" as="div" class="field-label">
                Event type
              </DzText>
              <div class="preset-grid">
                <button
                  v-for="preset in EVENT_PRESETS"
                  :key="preset.title"
                  type="button"
                  class="preset"
                  :class="{ active: pickedPreset.title === preset.title }"
                  :style="eventColor(preset.category)"
                  :aria-pressed="pickedPreset.title === preset.title"
                  @click="pickedPreset = preset"
                >
                  <span class="preset-dot" aria-hidden="true" />
                  <span class="preset-meta">
                    <DzText size="sm" weight="medium" as="span">{{ preset.title }}</DzText>
                    <DzText size="xs" tone="muted" as="span">{{ preset.durationLabel }}</DzText>
                  </span>
                </button>
              </div>
            </div>

            <div class="field">
              <DzText size="sm" weight="medium" as="div" class="field-label">
                Start time
              </DzText>
              <DzSegmented v-model="pickedSlot" :items="TIME_SLOTS" size="sm" aria-label="Start time" />
            </div>

            <div class="field">
              <DzText size="sm" weight="medium" as="div" class="field-label">
                Attendees
              </DzText>
              <DzAvatarGroup :max="5" size="sm" aria-label="Default attendees">
                <DzAvatar v-for="initials in TEAM" :key="initials" :fallback="initials" />
              </DzAvatarGroup>
            </div>
          </div>

          <template #footer>
            <div class="dialog-actions">
              <DzDialogClose as-child>
                <DzButton size="sm" variant="outline" tone="neutral">
                  Cancel
                </DzButton>
              </DzDialogClose>
              <DzButton size="sm" variant="solid" tone="primary" @click="createEvent">
                <template #prefix>
                  <Plus :size="15" aria-hidden="true" />
                </template>
                Add event
              </DzButton>
            </div>
          </template>
        </DzDialogContent>
      </DzDialog>
    </template>

    <div class="cs-body">
      <!-- Calendar grid ----------------------------------------------------- -->
      <section class="cal-wrap" aria-label="Calendar">
        <DzCalendar
          v-model:value="selectedDate"
          v-model:focused-date="focusedDate"
          :view="view"
          size="lg"
          :first-day-of-week="1"
          class="cal"
          aria-label="Event calendar"
        >
          <template #day="{ date, dayNumber, isOutsideMonth, isToday }">
            <span class="cell-num" :class="{ today: isToday, outside: isOutsideMonth }">
              {{ dayNumber }}
            </span>
            <span v-if="!isOutsideMonth && dayEvents(iso(date)).length" class="cell-dots">
              <span
                v-for="ev in dayEvents(iso(date)).slice(0, 4)"
                :key="ev.id"
                class="cell-dot"
                :style="eventColor(ev.category)"
                aria-hidden="true"
              />
            </span>
          </template>
        </DzCalendar>
      </section>

      <!-- Agenda for the selected day -------------------------------------- -->
      <aside class="agenda" aria-label="Schedule for the selected day">
        <header class="agenda-head">
          <div>
            <DzText size="xs" tone="muted" as="div">
              Schedule
            </DzText>
            <DzHeading :level="2" size="sm" weight="semibold">
              {{ selectedLabel }}
            </DzHeading>
          </div>
          <DzBadge variant="subtle" tone="neutral" size="sm">
            {{ selectedDayEvents.length }}
          </DzBadge>
        </header>

        <div v-if="selectedDayEvents.length" class="agenda-list">
          <DzPopover v-for="ev in selectedDayEvents" :key="ev.id">
            <DzPopoverTrigger as-child>
              <button type="button" class="agenda-event" :style="eventColor(ev.category)">
                <span class="agenda-rail" aria-hidden="true" />
                <span class="agenda-event-main">
                  <DzText size="sm" weight="medium" as="span" class="agenda-event-title">
                    {{ ev.title }}
                  </DzText>
                  <DzText size="xs" tone="muted" as="span">
                    {{ ev.startLabel }}<template v-if="ev.endLabel"> – {{ ev.endLabel }}</template>
                  </DzText>
                </span>
              </button>
            </DzPopoverTrigger>

            <DzPopoverContent side="left" size="md" class="event-pop">
              <div class="pop-head">
                <span class="pop-dot" :style="eventColor(ev.category)" aria-hidden="true" />
                <DzText size="sm" weight="semibold" as="div">
                  {{ ev.title }}
                </DzText>
              </div>
              <DzBadge variant="subtle" tone="neutral" size="sm" class="pop-cat">
                {{ categoryByKey[ev.category]?.label }}
              </DzBadge>

              <ul class="pop-facts">
                <li>
                  <Clock :size="14" aria-hidden="true" />
                  <DzText size="sm" as="span">
                    {{ ev.startLabel }}<template v-if="ev.endLabel">
                      – {{ ev.endLabel }}
                    </template>
                  </DzText>
                </li>
                <li v-if="ev.location">
                  <MapPin :size="14" aria-hidden="true" />
                  <DzText size="sm" as="span">
                    {{ ev.location }}
                  </DzText>
                </li>
              </ul>

              <DzText v-if="ev.description" size="sm" tone="muted" as="p" class="pop-desc">
                {{ ev.description }}
              </DzText>

              <div class="pop-attendees">
                <DzAvatarGroup :max="5" size="sm" aria-label="Attendees">
                  <DzAvatar v-for="initials in ev.attendees" :key="initials" :fallback="initials" />
                </DzAvatarGroup>
                <DzText size="xs" tone="muted" as="span">
                  {{ ev.attendees.length }} attending
                </DzText>
              </div>

              <div class="pop-actions">
                <DzButton size="sm" variant="outline" tone="neutral">
                  <template #prefix>
                    <Pencil :size="14" aria-hidden="true" />
                  </template>
                  Edit
                </DzButton>
                <DzButton size="sm" variant="ghost" tone="danger" @click="deleteEvent(ev.id)">
                  <template #prefix>
                    <Trash2 :size="14" aria-hidden="true" />
                  </template>
                  Delete
                </DzButton>
              </div>
            </DzPopoverContent>
          </DzPopover>
        </div>

        <div v-else class="agenda-empty">
          <DzText size="sm" tone="muted">
            Nothing scheduled. Pick a day or add an event.
          </DzText>
        </div>
      </aside>
    </div>
  </DzAppShell>
</template>

<style scoped>
/* ── Indigo re-skin (token-only) ──────────────────────────────────
   Alias the consumed `--dz-primary*` family (+ focus ring) to the indigo
   spectrum, mirroring the shipped violet pricing / teal order-tracking pages so
   every Dz control re-tints. Light below; the dark block tracks the token
   layer's lighter-on-dark ramp so contrast holds. No raw colour. */
.cs {
  --dz-primary: var(--dz-colors-indigo-500);
  --dz-primary-foreground: var(--dz-colors-indigo-50);
  --dz-primary-hover: var(--dz-colors-indigo-600);
  --dz-primary-active: var(--dz-colors-indigo-700);
  --dz-primary-muted: var(--dz-colors-indigo-100);
  --dz-primary-muted-foreground: var(--dz-colors-indigo-700);
  --dz-primary-border: var(--dz-colors-indigo-200);
  --dz-ring: var(--dz-colors-indigo-500);

  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

[data-theme='dark'] .cs {
  --dz-primary: var(--dz-colors-indigo-400);
  --dz-primary-foreground: var(--dz-colors-indigo-950);
  --dz-primary-hover: var(--dz-colors-indigo-300);
  --dz-primary-active: var(--dz-colors-indigo-200);
  --dz-primary-muted: var(--dz-colors-indigo-900);
  --dz-primary-muted-foreground: var(--dz-colors-indigo-300);
  --dz-primary-border: var(--dz-colors-indigo-800);
  --dz-ring: var(--dz-colors-indigo-400);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .cs {
    --dz-primary: var(--dz-colors-indigo-400);
    --dz-primary-foreground: var(--dz-colors-indigo-950);
    --dz-primary-hover: var(--dz-colors-indigo-300);
    --dz-primary-active: var(--dz-colors-indigo-200);
    --dz-primary-muted: var(--dz-colors-indigo-900);
    --dz-primary-muted-foreground: var(--dz-colors-indigo-300);
    --dz-primary-border: var(--dz-colors-indigo-800);
    --dz-ring: var(--dz-colors-indigo-400);
  }
}

/* Brand + user footer (mirrors the shipped app-shell references). */
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

/* Calendar legend toggles in the sidebar. */
.legend {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: var(--dz-radius-sm);
  background: transparent;
  color: var(--dz-foreground);
  cursor: pointer;
  text-align: left;
  transition: background var(--dz-transition-fast);
}

.legend:hover {
  background: var(--dz-muted);
}

.legend.off {
  opacity: 0.45;
}

.legend-dot {
  width: 11px;
  height: 11px;
  border-radius: var(--dz-radius-sm);
  background: var(--evt);
  flex: none;
}

.cs-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team {
  /* Hide the team roster on the most cramped header layouts. */
}

/* Main layout — calendar + agenda. */
.cs-body {
  display: grid;
  grid-template-columns: 1fr minmax(280px, 340px);
  gap: 18px;
  align-items: start;
}

.cal-wrap {
  min-width: 0;
}

/* Make the calendar fill its column and give cells room for a dot row. */
.cal {
  width: 100%;
}

.cal :deep(.dz-calendar) {
  display: flex;
  width: 100%;
  --dz-calendar-cell-size: 2.9rem;
}

.cal :deep(.dz-calendar [role='grid']),
.cal :deep(.dz-calendar) {
  background: var(--dz-card);
}

.cell-num {
  font-variant-numeric: tabular-nums;
}

.cell-num.today {
  font-weight: var(--dz-font-semibold);
}

.cell-dots {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 3px;
  height: 5px;
}

.cell-dot {
  width: 5px;
  height: 5px;
  border-radius: var(--dz-radius-full);
  background: var(--evt);
}

/* Agenda panel. */
.agenda {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-card);
}

.agenda-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agenda-event {
  display: flex;
  align-items: stretch;
  gap: 10px;
  width: 100%;
  padding: 10px;
  padding-left: 0;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-md);
  background: var(--dz-surface);
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  transition: border-color var(--dz-transition-fast), background var(--dz-transition-fast);
}

.agenda-event:hover {
  border-color: var(--evt);
  background: color-mix(in oklch, var(--evt) 8%, var(--dz-surface));
}

.agenda-rail {
  width: 4px;
  flex: none;
  border-radius: var(--dz-radius-full);
  background: var(--evt);
}

.agenda-event-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 2px 0;
}

.agenda-event-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agenda-empty {
  padding: 24px 8px;
  text-align: center;
  border: 1px dashed var(--dz-border);
  border-radius: var(--dz-radius-md);
}

/* Event popover. */
.event-pop {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 248px;
  max-width: 300px;
}

.pop-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pop-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--dz-radius-sm);
  background: var(--evt);
  flex: none;
}

.pop-cat {
  align-self: flex-start;
}

.pop-facts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pop-facts li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dz-muted-foreground);
}

.pop-desc {
  margin: 0;
  line-height: 1.45;
}

.pop-attendees {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pop-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--dz-border);
}

/* New-event dialog. */
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0 8px;
}

.field-label {
  margin-bottom: 8px;
}

.preset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.preset {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-md);
  background: var(--dz-surface);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--dz-transition-fast), background var(--dz-transition-fast);
}

.preset:hover {
  border-color: var(--evt);
}

.preset.active {
  border-color: var(--evt);
  background: color-mix(in oklch, var(--evt) 12%, var(--dz-surface));
}

.preset-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--dz-radius-full);
  background: var(--evt);
  flex: none;
}

.preset-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 980px) {
  .cs-body {
    grid-template-columns: 1fr;
  }
  .team {
    display: none;
  }
}

@media (max-width: 560px) {
  .preset-grid {
    grid-template-columns: 1fr;
  }
}
</style>
