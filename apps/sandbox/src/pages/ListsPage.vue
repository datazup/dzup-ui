<script setup lang="ts">
/**
 * ListsPage — review playground for every list-driven component.
 *
 * For each family, a list is *passed in* (via an `items`/`data`/`source` prop
 * or via `v-for` over a data array for slot-based components) and its current
 * content / selection is reflected back to the parent — through `v-model`
 * where the component exposes one, or via an `@click` / `@select` / `@change`
 * handler otherwise. The "Bound content" panel beside each demo shows the live
 * value so you can verify what the list emits to the parent.
 */
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
  DzAvatar,
  DzAvatarGroup,
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzBreadcrumbSeparator,
  DzButton,
  DzCheckbox,
  DzCheckboxGroup,
  DzCombobox,
  DzCommandPalette,
  DzDataGrid,
  DzList,
  DzListItem,
  DzMenu,
  DzMenuItem,
  DzMultiSelect,
  DzPersonaSelector,
  DzRadio,
  DzRadioGroup,
  DzSegmented,
  DzSelect,
  DzStepper,
  DzStepperItem,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzTimeline,
  DzTimelineItem,
  DzTransfer,
  DzTree,
} from '@dzup-ui/core'
import type {
  ColumnDef,
  CommandGroup,
  CommandItem,
  DzSelectItem,
  Persona,
  SegmentedItem,
  TransferItem,
  TreeNode,
} from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'
import { computed, ref } from 'vue'

// ── Shared sample lists ──────────────────────────────────────────────────────

const fruitItems: DzSelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
]

const frameworkItems: DzSelectItem[] = [
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'solid' },
]

// ── Forms: DzSelect ──────────────────────────────────────────────────────────
const selectValue = ref('')

// ── Forms: DzMultiSelect ─────────────────────────────────────────────────────
const multiSelectValue = ref<string[]>(['vue'])

// ── Forms: DzCombobox ────────────────────────────────────────────────────────
const comboboxValue = ref('')

// ── Forms: DzCheckboxGroup ───────────────────────────────────────────────────
const checkboxValue = ref<string[]>(['email'])
const channelItems: DzSelectItem[] = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Push', value: 'push' },
]

// ── Forms: DzRadioGroup ──────────────────────────────────────────────────────
const radioValue = ref('pro')
const planItems: DzSelectItem[] = [
  { label: 'Starter', value: 'starter' },
  { label: 'Pro', value: 'pro' },
  { label: 'Enterprise', value: 'enterprise' },
]

// ── Forms: DzSegmented ───────────────────────────────────────────────────────
const segmentedValue = ref('grid')
const viewItems: SegmentedItem[] = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
  { label: 'Board', value: 'board' },
]

// ── Forms: DzTransfer ────────────────────────────────────────────────────────
const transferSource: TransferItem[] = [
  { key: 'read', label: 'Read' },
  { key: 'write', label: 'Write' },
  { key: 'deploy', label: 'Deploy' },
  { key: 'admin', label: 'Admin' },
  { key: 'billing', label: 'Billing' },
]
const transferTarget = ref<string[]>(['read'])

// ── Forms: DzPersonaSelector ─────────────────────────────────────────────────
const personas: Persona[] = [
  { id: 'ada', name: 'Ada Lovelace', role: 'Engineering Lead' },
  { id: 'grace', name: 'Grace Hopper', role: 'Compiler Pioneer' },
  { id: 'alan', name: 'Alan Turing', role: 'Research' },
]
const personaValue = ref('')

// ── Data: DzList (slot-based; selection tracked via @click) ──────────────────
const listSelected = ref('')

// ── Data: DzTree ─────────────────────────────────────────────────────────────
const fileTree: TreeNode[] = [
  {
    key: 'src',
    label: 'src',
    children: [
      { key: 'components', label: 'components', children: [{ key: 'button', label: 'DzButton.vue' }] },
      { key: 'main', label: 'main.ts' },
    ],
  },
  { key: 'readme', label: 'README.md' },
  { key: 'pkg', label: 'package.json' },
]
const treeExpanded = ref<string[]>(['src'])
const treeSelected = ref<string[]>([])

// ── Data: DzAccordion ────────────────────────────────────────────────────────
const accordionValue = ref<string>('shipping')
const faqItems = [
  { value: 'shipping', title: 'Shipping', body: 'Orders ship within 2 business days.' },
  { value: 'returns', title: 'Returns', body: 'Returns accepted within 30 days.' },
  { value: 'support', title: 'Support', body: 'Reach us 24/7 via the help center.' },
]

// ── Data: DzTimeline (display list, driven by v-for) ─────────────────────────
const timeline: { id: string, text: string, tone: CanonicalTone }[] = [
  { id: 'created', text: 'Order created', tone: 'neutral' },
  { id: 'paid', text: 'Payment confirmed', tone: 'success' },
  { id: 'shipped', text: 'Shipped', tone: 'info' },
  { id: 'delayed', text: 'Delivery delayed', tone: 'warning' },
]

// ── Data: DzDataGrid ─────────────────────────────────────────────────────────
interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  role: string
  status: string
}
const gridData: UserRow[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Grace Hopper', role: 'Editor', status: 'Invited' },
  { id: 3, name: 'Alan Turing', role: 'Editor', status: 'Active' },
  { id: 4, name: 'Tim Berners-Lee', role: 'Viewer', status: 'Suspended' },
]
const gridColumns: ColumnDef<UserRow>[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'role', header: 'Role', align: 'center' },
  { field: 'status', header: 'Status', align: 'center' },
]
const gridSelected = ref<UserRow[]>([])

// ── Navigation: DzMenu (slot-based; active tracked via @click) ───────────────
const menuItems = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'reports', label: 'Reports' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'settings', label: 'Settings' },
]
const menuActive = ref('dashboard')

// ── Navigation: DzBreadcrumb (display list, driven by v-for) ─────────────────
const crumbs = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Components', href: '/library/components' },
  { label: 'Lists', href: '/library/components/lists' },
]

// ── Navigation: DzTabs ───────────────────────────────────────────────────────
const tabsValue = ref('overview')
const tabItems = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'settings', label: 'Settings' },
]

// ── Navigation: DzStepper ────────────────────────────────────────────────────
const stepperValue = ref(1)
const steps = [
  { title: 'Account', description: 'Create your account' },
  { title: 'Profile', description: 'Add your details' },
  { title: 'Confirm', description: 'Review and finish' },
]

// ── Overlays: DzCommandPalette ───────────────────────────────────────────────
const paletteOpen = ref(false)
const commandItems: CommandItem[] = [
  { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', group: 'file' },
  { id: 'open-file', label: 'Open File', shortcut: 'Ctrl+O', group: 'file' },
  { id: 'search', label: 'Search', shortcut: 'Ctrl+F', group: 'edit' },
  { id: 'toggle-dark', label: 'Toggle Dark Mode', group: 'view' },
]
const commandGroups: CommandGroup[] = [
  { id: 'file', label: 'File' },
  { id: 'edit', label: 'Edit' },
  { id: 'view', label: 'View' },
]
const lastCommand = ref<CommandItem | null>(null)
function onCommandSelect(item: CommandItem): void {
  lastCommand.value = item
}

// ── Media: DzAvatarGroup (display list, driven by v-for) ─────────────────────
const team = [
  { id: 'ada', name: 'Ada Lovelace' },
  { id: 'grace', name: 'Grace Hopper' },
  { id: 'alan', name: 'Alan Turing' },
  { id: 'tim', name: 'Tim Berners-Lee' },
  { id: 'don', name: 'Donald Knuth' },
]
const avatarMax = ref(3)

// ── Live "bound content" projections ─────────────────────────────────────────
function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

const selectedTreeLabels = computed(() =>
  treeSelected.value.map((key) => {
    function find(nodes: TreeNode[]): string | undefined {
      for (const n of nodes) {
        if (n.key === key) return n.label
        if (n.children) {
          const hit = find(n.children)
          if (hit) return hit
        }
      }
      return undefined
    }
    return find(fileTree) ?? key
  }),
)
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">
        Lists & Selection
      </h1>
      <p class="page-description">
        Every list-driven component, grouped by family. Each demo shows how to
        <strong>pass a list in</strong> and how the component
        <strong>reflects its content back to the parent</strong> — via
        <code>v-model</code> where one exists, or an event handler otherwise.
        The panel beside each demo is the live bound value.
      </p>
    </header>

    <!-- ─── Forms ─────────────────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        Forms
      </h2>

      <div class="demo-grid">
        <div class="demo">
          <p class="demo-title">
            DzSelect <span class="demo-meta">:items · v-model</span>
          </p>
          <DzSelect v-model="selectValue" :items="fruitItems" placeholder="Pick a fruit" />
          <pre class="bound">{{ pretty({ modelValue: selectValue }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzMultiSelect <span class="demo-meta">:items · v-model</span>
          </p>
          <DzMultiSelect v-model="multiSelectValue" :items="frameworkItems" placeholder="Pick frameworks" />
          <pre class="bound">{{ pretty({ modelValue: multiSelectValue }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzCombobox <span class="demo-meta">:items · v-model</span>
          </p>
          <DzCombobox v-model="comboboxValue" :items="fruitItems" placeholder="Search fruit" />
          <pre class="bound">{{ pretty({ modelValue: comboboxValue }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzCheckboxGroup <span class="demo-meta">v-for · v-model</span>
          </p>
          <DzCheckboxGroup v-model="checkboxValue" aria-label="Channels">
            <DzCheckbox v-for="c in channelItems" :key="c.value" :value="c.value">
              {{ c.label }}
            </DzCheckbox>
          </DzCheckboxGroup>
          <pre class="bound">{{ pretty({ modelValue: checkboxValue }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzRadioGroup <span class="demo-meta">v-for · v-model</span>
          </p>
          <DzRadioGroup v-model="radioValue" aria-label="Plan">
            <DzRadio v-for="p in planItems" :key="p.value" :value="p.value">
              {{ p.label }}
            </DzRadio>
          </DzRadioGroup>
          <pre class="bound">{{ pretty({ modelValue: radioValue }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzSegmented <span class="demo-meta">:items · v-model</span>
          </p>
          <DzSegmented v-model="segmentedValue" :items="viewItems" aria-label="View mode" />
          <pre class="bound">{{ pretty({ modelValue: segmentedValue }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzTransfer <span class="demo-meta">:source · v-model (target keys)</span>
          </p>
          <DzTransfer v-model="transferTarget" :source="transferSource" searchable />
          <pre class="bound">{{ pretty({ targetKeys: transferTarget }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzPersonaSelector <span class="demo-meta">:personas · v-model (id)</span>
          </p>
          <DzPersonaSelector v-model="personaValue" :personas="personas" placeholder="Assign teammate" />
          <pre class="bound">{{ pretty({ modelValue: personaValue }) }}</pre>
        </div>
      </div>
    </section>

    <!-- ─── Data ──────────────────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        Data
      </h2>

      <div class="demo-grid">
        <div class="demo">
          <p class="demo-title">
            DzList <span class="demo-meta">v-for · @click → selection</span>
          </p>
          <DzList variant="bordered" interactive>
            <DzListItem
              v-for="item in fruitItems"
              :key="item.value"
              :active="listSelected === item.value"
              @click="listSelected = item.value"
            >
              {{ item.label }}
            </DzListItem>
          </DzList>
          <pre class="bound">{{ pretty({ selected: listSelected }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzTree <span class="demo-meta">:items · v-model:selected-keys</span>
          </p>
          <DzTree
            v-model:expanded-keys="treeExpanded"
            v-model:selected-keys="treeSelected"
            :items="fileTree"
            selectable
          />
          <pre class="bound">{{ pretty({ expanded: treeExpanded, selected: treeSelected, selectedLabels: selectedTreeLabels }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzAccordion <span class="demo-meta">v-for · v-model</span>
          </p>
          <DzAccordion v-model="accordionValue" type="single" collapsible>
            <DzAccordionItem v-for="f in faqItems" :key="f.value" :value="f.value">
              <DzAccordionTrigger>{{ f.title }}</DzAccordionTrigger>
              <DzAccordionContent>{{ f.body }}</DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
          <pre class="bound">{{ pretty({ openItem: accordionValue }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzTimeline <span class="demo-meta">v-for (display list)</span>
          </p>
          <DzTimeline>
            <DzTimelineItem v-for="e in timeline" :key="e.id" :tone="e.tone">
              {{ e.text }}
            </DzTimelineItem>
          </DzTimeline>
          <pre class="bound">{{ pretty({ events: timeline.map(e => e.id) }) }}</pre>
        </div>

        <div class="demo demo-wide">
          <p class="demo-title">
            DzDataGrid <span class="demo-meta">:data · :columns · v-model:selected-rows</span>
          </p>
          <DzDataGrid
            v-model:selected-rows="gridSelected"
            :data="gridData"
            :columns="gridColumns"
            selectable="multiple"
          />
          <pre class="bound">{{ pretty({ selectedRows: gridSelected.map(r => r.name) }) }}</pre>
        </div>
      </div>
    </section>

    <!-- ─── Navigation ────────────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        Navigation
      </h2>

      <div class="demo-grid">
        <div class="demo">
          <p class="demo-title">
            DzMenu <span class="demo-meta">v-for · @click → active</span>
          </p>
          <DzMenu>
            <DzMenuItem
              v-for="item in menuItems"
              :key="item.value"
              :active="menuActive === item.value"
              @click="menuActive = item.value"
            >
              {{ item.label }}
            </DzMenuItem>
          </DzMenu>
          <pre class="bound">{{ pretty({ active: menuActive }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzBreadcrumb <span class="demo-meta">v-for (display list)</span>
          </p>
          <DzBreadcrumb>
            <template v-for="(crumb, i) in crumbs" :key="crumb.href">
              <DzBreadcrumbItem :href="crumb.href" :current="i === crumbs.length - 1">
                {{ crumb.label }}
              </DzBreadcrumbItem>
              <DzBreadcrumbSeparator v-if="i < crumbs.length - 1" />
            </template>
          </DzBreadcrumb>
          <pre class="bound">{{ pretty({ path: crumbs.map(c => c.label) }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzTabs <span class="demo-meta">v-for · v-model</span>
          </p>
          <DzTabs v-model="tabsValue">
            <DzTabList>
              <DzTabTrigger v-for="t in tabItems" :key="t.value" :value="t.value">
                {{ t.label }}
              </DzTabTrigger>
            </DzTabList>
            <DzTabContent v-for="t in tabItems" :key="t.value" :value="t.value">
              {{ t.label }} panel
            </DzTabContent>
          </DzTabs>
          <pre class="bound">{{ pretty({ activeTab: tabsValue }) }}</pre>
        </div>

        <div class="demo">
          <p class="demo-title">
            DzStepper <span class="demo-meta">v-for · v-model (index)</span>
          </p>
          <DzStepper v-model="stepperValue" clickable>
            <DzStepperItem
              v-for="s in steps"
              :key="s.title"
              :title="s.title"
              :description="s.description"
            />
          </DzStepper>
          <pre class="bound">{{ pretty({ activeStep: stepperValue }) }}</pre>
        </div>
      </div>
    </section>

    <!-- ─── Overlays ──────────────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        Overlays
      </h2>

      <div class="demo-grid">
        <div class="demo">
          <p class="demo-title">
            DzCommandPalette <span class="demo-meta">:items · :groups · @select</span>
          </p>
          <DzButton @click="paletteOpen = true">
            Open Command Palette
          </DzButton>
          <DzCommandPalette
            v-model:open="paletteOpen"
            :items="commandItems"
            :groups="commandGroups"
            :enable-global-shortcut="false"
            @select="onCommandSelect"
          />
          <pre class="bound">{{ pretty({ open: paletteOpen, lastSelected: lastCommand?.id ?? null }) }}</pre>
        </div>
      </div>
    </section>

    <!-- ─── Media ─────────────────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        Media
      </h2>

      <div class="demo-grid">
        <div class="demo">
          <p class="demo-title">
            DzAvatarGroup <span class="demo-meta">v-for · :max (display list)</span>
          </p>
          <DzAvatarGroup :max="avatarMax">
            <DzAvatar v-for="member in team" :key="member.id" :alt="member.name" />
          </DzAvatarGroup>
          <label class="range-row">
            max
            <input v-model.number="avatarMax" type="range" min="1" :max="team.length">
            <span>{{ avatarMax }}</span>
          </label>
          <pre class="bound">{{ pretty({ members: team.map(m => m.id), max: avatarMax, overflow: Math.max(0, team.length - avatarMax) }) }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1120px;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0;
  line-height: 1.6;
  max-width: 820px;
}

.page-description code {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
  box-shadow: var(--dz-shadow-sm, 0 1px 3px rgb(0 0 0 / 0.08));
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 16px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: var(--dz-radius-md, 6px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-background, #f8fafc);
}

.demo-wide {
  grid-column: 1 / -1;
}

.demo-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.demo-meta {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--dz-muted-foreground, #64748b);
}

.bound {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  border-radius: var(--dz-radius-sm, 4px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
  padding: 10px;
  overflow: auto;
  max-height: 220px;
  color: var(--dz-foreground, #1a202c);
}

.range-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

@media (max-width: 900px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
