<script setup lang="ts">
import {
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzBreadcrumbSeparator,
  DzMenu,
  DzMenuItem,
  DzMenuSeparator,
  DzPagination,
  DzSegmented,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzStepper,
  DzStepperItem,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
} from '@dzup-ui/core'
import type {
  CanonicalSize,
  CanonicalTone,
  TabsVariant,
} from '@dzup-ui/contracts'
import type {
  DzBreadcrumbProps,
  DzMenuProps,
  DzPaginationProps,
  DzSegmentedProps,
  DzSidebarProps,
  DzStepperProps,
  DzTabsProps,
  SegmentedItem,
  StepperOrientation,
} from '@dzup-ui/core'
import { computed, reactive, ref } from 'vue'
import DemoCode from '../components/DemoCode.vue'
import SandboxControl from '../components/SandboxControl.vue'
import { useDemoSnippet } from '../composables/useDemoSnippet.ts'
import { useUrlState } from '../composables/useUrlState.ts'

// ---------------------------------------------------------------------------
// DzTabs
// ---------------------------------------------------------------------------

const tabsVariantOptions: TabsVariant[] = ['line', 'enclosed', 'pills']
const tabsSizeOptions: CanonicalSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const tabsToneOptions: CanonicalTone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info']
const tabsOrientationOptions: Array<'horizontal' | 'vertical'> = ['horizontal', 'vertical']
const tabsActivationOptions: Array<'automatic' | 'manual'> = ['automatic', 'manual']

const tabsVariant = useUrlState<TabsVariant>('tabs-variant', 'line')
const tabsSize = useUrlState<CanonicalSize>('tabs-size', 'md')
const tabsTone = useUrlState<CanonicalTone>('tabs-tone', 'primary')
const tabsOrientation = useUrlState<'horizontal' | 'vertical'>('tabs-orient', 'horizontal')
const tabsActivation = useUrlState<'automatic' | 'manual'>('tabs-activate', 'automatic')
const activeTab = ref<string>('overview')

const closableTabs = ref<Array<{ value: string, label: string }>>([
  { value: 'editor', label: 'Editor' },
  { value: 'preview', label: 'Preview' },
  { value: 'logs', label: 'Logs' },
])
const activeClosable = ref<string>('editor')

function closeTab(value: string): void {
  const idx = closableTabs.value.findIndex(t => t.value === value)
  if (idx === -1) return
  closableTabs.value.splice(idx, 1)
  if (activeClosable.value === value) {
    activeClosable.value = closableTabs.value[0]?.value ?? ''
  }
}

function resetClosable(): void {
  closableTabs.value = [
    { value: 'editor', label: 'Editor' },
    { value: 'preview', label: 'Preview' },
    { value: 'logs', label: 'Logs' },
  ]
  activeClosable.value = 'editor'
}

const tabsSnippet = useDemoSnippet<Partial<DzTabsProps>>(() => ({
  tag: 'DzTabs',
  props: {
    variant: tabsVariant.value,
    size: tabsSize.value,
    tone: tabsTone.value,
    orientation: tabsOrientation.value,
    activationMode: tabsActivation.value,
  },
  defaults: { variant: 'line', size: 'md', tone: 'primary', orientation: 'horizontal', activationMode: 'automatic' },
  attrs: { 'v-model': 'active' },
  children: `  <DzTabList>
    <DzTabTrigger value="overview">Overview</DzTabTrigger>
    <DzTabTrigger value="usage">Usage</DzTabTrigger>
    <DzTabTrigger value="api">API</DzTabTrigger>
    <DzTabTrigger value="examples" disabled>Examples (disabled)</DzTabTrigger>
  </DzTabList>
  <DzTabContent value="overview">…</DzTabContent>
  <DzTabContent value="usage">…</DzTabContent>
  <DzTabContent value="api">…</DzTabContent>`,
}))

// ---------------------------------------------------------------------------
// DzBreadcrumb
// ---------------------------------------------------------------------------

const breadcrumbSeparator = useUrlState<string>('crumb-sep', '/')
const breadcrumbSeparatorOptions = ['/', '›', '→', '•', '|']

const breadcrumbSnippet = useDemoSnippet<Partial<DzBreadcrumbProps>>(() => ({
  tag: 'DzBreadcrumb',
  props: { separator: breadcrumbSeparator.value },
  defaults: { separator: '/' },
  children: `  <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
  <DzBreadcrumbSeparator />
  <DzBreadcrumbItem href="/library">Library</DzBreadcrumbItem>
  <DzBreadcrumbSeparator />
  <DzBreadcrumbItem current>Navigation</DzBreadcrumbItem>`,
}))

// ---------------------------------------------------------------------------
// DzNavbar (composed from raw layout primitives — no dedicated component yet)
// ---------------------------------------------------------------------------

const navbarActive = ref<'dashboard' | 'projects' | 'team' | 'settings'>('dashboard')
const navbarSections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projects', label: 'Projects' },
  { id: 'team', label: 'Team' },
  { id: 'settings', label: 'Settings' },
] as const

const navbarSnippet = `<!-- No dedicated DzNavbar yet — this is hand-rolled markup -->
<header class="navbar">
  <div class="navbar-brand">
    <span class="navbar-mark">dz</span>
    <strong>dzup-ui</strong>
  </div>
  <nav class="navbar-links" aria-label="Primary">
    <button
      v-for="item in sections"
      :key="item.id"
      type="button"
      class="navbar-link"
      :data-active="active === item.id"
      :aria-current="active === item.id ? 'page' : undefined"
      @click="active = item.id"
    >
      {{ item.label }}
    </button>
  </nav>
  <div class="navbar-actions">
    <button type="button" class="navbar-link navbar-trigger">Account</button>
  </div>
</header>`

// ---------------------------------------------------------------------------
// DzSidebar
// ---------------------------------------------------------------------------

const sidebarCollapsed = useUrlState<boolean>('sidebar-collapsed', false)
const sidebarActiveItem = ref<string>('dashboard')
const sidebarPersist = useUrlState<boolean>('sidebar-persist', false)
const sidebarStorageKey = computed(() => (sidebarPersist.value ? 'dz-sandbox-sidebar-collapsed' : undefined))

const sidebarSnippet = useDemoSnippet<Partial<DzSidebarProps>>(() => ({
  tag: 'DzSidebar',
  props: {
    width: '15rem',
    collapsedWidth: '3.5rem',
    storageKey: sidebarStorageKey.value,
  },
  attrs: { 'v-model:collapsed': 'collapsed' },
  children: `  <DzSidebarHeader>Workspace</DzSidebarHeader>
  <DzSidebarSection title="Main">
    <DzSidebarItem active>Dashboard</DzSidebarItem>
    <DzSidebarItem>Projects</DzSidebarItem>
    <DzSidebarItem>Reports</DzSidebarItem>
  </DzSidebarSection>
  <DzSidebarSection title="Admin" collapsible>
    <DzSidebarItem>Users</DzSidebarItem>
    <DzSidebarItem disabled>Billing</DzSidebarItem>
  </DzSidebarSection>
  <DzSidebarFooter>user@dzup</DzSidebarFooter>`,
}))

// ---------------------------------------------------------------------------
// DzStepper
// ---------------------------------------------------------------------------

const stepperOrientationOptions: StepperOrientation[] = ['horizontal', 'vertical']
const stepperOrientation = useUrlState<StepperOrientation>('stepper-orient', 'horizontal')
const stepperClickable = useUrlState<boolean>('stepper-clickable', false)
const stepperLastNavigate = ref<number | null>(null)

interface StepConfig {
  title: string
  description: string
  optional?: boolean
}

const stepperSteps: StepConfig[] = [
  { title: 'Account', description: 'Email and password' },
  { title: 'Profile', description: 'Name and avatar', optional: true },
  { title: 'Workspace', description: 'Choose a team' },
  { title: 'Review', description: 'Confirm and finish' },
]

const activeStep = ref<number>(1)
const stepperTotal = computed(() => stepperSteps.length)

function nextStep(): void {
  if (activeStep.value < stepperTotal.value - 1) activeStep.value += 1
}

function prevStep(): void {
  if (activeStep.value > 0) activeStep.value -= 1
}

const stepperSnippet = useDemoSnippet<Partial<DzStepperProps>>(() => ({
  tag: 'DzStepper',
  props: { orientation: stepperOrientation.value, clickable: stepperClickable.value },
  defaults: { orientation: 'horizontal', clickable: false },
  attrs: { 'v-model': 'activeStep' },
  children: `  <DzStepperItem title="Account" description="Email and password" />
  <DzStepperItem title="Profile" description="Name and avatar" optional />
  <DzStepperItem title="Workspace" description="Choose a team" />
  <DzStepperItem title="Review" description="Confirm and finish" />`,
}))

// ---------------------------------------------------------------------------
// DzMenu
// ---------------------------------------------------------------------------

const menuSizeOptions: CanonicalSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const menuSize = useUrlState<CanonicalSize>('menu-size', 'md')
const menuCollapsed = useUrlState<boolean>('menu-collapsed', false)
const menuActive = ref<'home' | 'reports' | 'inbox' | 'settings'>('home')

const menuSnippet = useDemoSnippet<Partial<DzMenuProps>>(() => ({
  tag: 'DzMenu',
  props: { size: menuSize.value, collapsed: menuCollapsed.value },
  defaults: { size: 'md', collapsed: false },
  attrs: { 'aria-label': 'Main navigation' },
  children: `  <DzMenuItem active>
    <template #icon>H</template>
    Home
  </DzMenuItem>
  <DzMenuItem>
    <template #icon>R</template>
    Reports
  </DzMenuItem>
  <DzMenuSeparator />
  <DzMenuItem disabled>
    <template #icon>S</template>
    Settings (disabled)
  </DzMenuItem>`,
}))

// ---------------------------------------------------------------------------
// DzPagination
// ---------------------------------------------------------------------------

const paginationSizeOptions: CanonicalSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const paginationPage = ref<number>(1)
const paginationTotal = useUrlState<number>('pg-total', 120)
const paginationPageSize = useUrlState<number>('pg-page-size', 10)
const paginationSiblings = useUrlState<number>('pg-siblings', 1)
const paginationShowEdges = useUrlState<boolean>('pg-edges', false)
const paginationSize = useUrlState<CanonicalSize>('pg-size', 'md')
const paginationDisabled = useUrlState<boolean>('pg-disabled', false)

const paginationSnippet = useDemoSnippet<Partial<DzPaginationProps>>(() => ({
  tag: 'DzPagination',
  props: {
    total: paginationTotal.value,
    pageSize: paginationPageSize.value,
    siblingCount: paginationSiblings.value,
    showEdges: paginationShowEdges.value,
    size: paginationSize.value,
    disabled: paginationDisabled.value,
  },
  defaults: { pageSize: 10, siblingCount: 1, showEdges: false, size: 'md', disabled: false },
  attrs: { 'v-model': 'page' },
  children: null,
}))

// ---------------------------------------------------------------------------
// DzSegmented
// ---------------------------------------------------------------------------

const segmentedSizeOptions: CanonicalSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const segmentedItems: SegmentedItem[] = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'table', label: 'Table' },
  { value: 'archive', label: 'Archive', disabled: true },
]
const segmentedValue = ref<string>('list')
const segmentedSize = useUrlState<CanonicalSize>('seg-size', 'md')
const segmentedDisabled = useUrlState<boolean>('seg-disabled', false)

const segmentedSnippet = useDemoSnippet<Partial<DzSegmentedProps>>(() => ({
  tag: 'DzSegmented',
  props: {
    items: segmentedItems,
    size: segmentedSize.value,
    disabled: segmentedDisabled.value,
  },
  defaults: { size: 'md', disabled: false },
  attrs: { 'v-model': 'view' },
  children: null,
}))

// ---------------------------------------------------------------------------
// Composition demo state
// ---------------------------------------------------------------------------

const compositionTab = ref<string>('overview')
const compositionState = reactive({
  collapsed: false,
})
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Navigation
    </h1>
    <p class="page-description">
      Wayfinding primitives -- tabs, breadcrumbs, sidebar, stepper, plus a composed navbar example.
      All components ship from <code>@dzup-ui/core</code> and respect the canonical size and variant
      taxonomies.
    </p>

    <!-- DzTabs -->
    <section class="demo-section">
      <h2 class="section-title">
        DzTabs
      </h2>
      <p class="section-description">
        Tabbed regions backed by Reka UI <code>TabsRoot</code>. Variants: <code>line</code>,
        <code>enclosed</code>, <code>pills</code>. Supports keyboard navigation and closable tabs.
      </p>

      <div class="control-row">
        <SandboxControl label="variant">
          <select v-model="tabsVariant">
            <option v-for="v in tabsVariantOptions" :key="v" :value="v">
              {{ v }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="size">
          <select v-model="tabsSize">
            <option v-for="s in tabsSizeOptions" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="tone">
          <select v-model="tabsTone">
            <option v-for="t in tabsToneOptions" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="orientation">
          <select v-model="tabsOrientation">
            <option v-for="o in tabsOrientationOptions" :key="o" :value="o">
              {{ o }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="activation">
          <select v-model="tabsActivation">
            <option v-for="a in tabsActivationOptions" :key="a" :value="a">
              {{ a }}
            </option>
          </select>
        </SandboxControl>
      </div>

      <div class="frame">
        <DzTabs
          v-model="activeTab"
          :variant="tabsVariant"
          :size="tabsSize"
          :tone="tabsTone"
          :orientation="tabsOrientation"
          :activation-mode="tabsActivation"
        >
          <DzTabList>
            <DzTabTrigger value="overview">
              Overview
            </DzTabTrigger>
            <DzTabTrigger value="usage">
              Usage
            </DzTabTrigger>
            <DzTabTrigger value="api">
              API
            </DzTabTrigger>
            <DzTabTrigger value="examples" disabled>
              Examples (disabled)
            </DzTabTrigger>
          </DzTabList>
          <DzTabContent value="overview">
            <p class="tab-body">
              <strong>Overview</strong> -- a short summary lives here. Arrow keys move focus between
              triggers; with <code>activation-mode="automatic"</code> the focused tab activates
              immediately.
            </p>
          </DzTabContent>
          <DzTabContent value="usage">
            <p class="tab-body">
              <strong>Usage</strong> -- import <code>DzTabs</code>, <code>DzTabList</code>,
              <code>DzTabTrigger</code>, and <code>DzTabContent</code> from
              <code>@dzup-ui/core</code>.
            </p>
          </DzTabContent>
          <DzTabContent value="api">
            <p class="tab-body">
              <strong>API</strong> -- props: <code>variant</code>, <code>size</code>,
              <code>orientation</code>, <code>activation-mode</code>. Emits: <code>change</code>,
              <code>close</code>. v-model binds the active value.
            </p>
          </DzTabContent>
        </DzTabs>
      </div>

      <h3 class="subsection-title">
        Closable tabs
      </h3>
      <p class="section-description">
        Mark a trigger with <code>closable</code> to render an inline close affordance. The parent
        emits <code>close</code> with the tab value -- consumers control removal.
      </p>
      <div class="frame">
        <DzTabs
          v-if="closableTabs.length"
          v-model="activeClosable"
          variant="enclosed"
          @close="closeTab"
        >
          <DzTabList>
            <DzTabTrigger
              v-for="t in closableTabs"
              :key="t.value"
              :value="t.value"
              closable
            >
              {{ t.label }}
            </DzTabTrigger>
          </DzTabList>
          <DzTabContent
            v-for="t in closableTabs"
            :key="t.value"
            :value="t.value"
          >
            <p class="tab-body">
              Content for <strong>{{ t.label }}</strong>. Close any tab via its
              <code>x</code> button.
            </p>
          </DzTabContent>
        </DzTabs>
        <p v-else class="muted-text">
          All tabs closed.
        </p>
        <div class="frame-footer">
          <button type="button" class="ghost-btn" @click="resetClosable">
            Reset
          </button>
        </div>
      </div>

      <DemoCode :code="tabsSnippet" />
    </section>

    <!-- DzBreadcrumb -->
    <section class="demo-section">
      <h2 class="section-title">
        DzBreadcrumb
      </h2>
      <p class="section-description">
        Accessible breadcrumb trail. Renders a semantic <code>&lt;nav&gt;</code> with an ordered
        list; the current item carries <code>aria-current="page"</code>.
      </p>

      <div class="control-row">
        <SandboxControl label="separator">
          <select v-model="breadcrumbSeparator">
            <option v-for="s in breadcrumbSeparatorOptions" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
      </div>

      <div class="frame">
        <DzBreadcrumb :separator="breadcrumbSeparator">
          <DzBreadcrumbItem href="/">
            Home
          </DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem href="/library">
            Library
          </DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem href="/library/navigation">
            Navigation
          </DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem current>
            Breadcrumb
          </DzBreadcrumbItem>
        </DzBreadcrumb>
      </div>

      <h3 class="subsection-title">
        Disabled item
      </h3>
      <div class="frame">
        <DzBreadcrumb>
          <DzBreadcrumbItem href="/">
            Home
          </DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem disabled>
            Admin (locked)
          </DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem current>
            Audit log
          </DzBreadcrumbItem>
        </DzBreadcrumb>
      </div>

      <DemoCode :code="breadcrumbSnippet" />
    </section>

    <!-- DzNavbar (composed) -->
    <section class="demo-section">
      <h2 class="section-title">
        DzNavbar
        <span class="title-badge">composed</span>
      </h2>
      <p class="section-description">
        There is no dedicated <code>DzNavbar</code> component yet. This demo is hand-rolled markup
        (plain <code>&lt;div&gt;</code> / <code>&lt;nav&gt;</code> / <code>&lt;button&gt;</code>)
        styled with the same token palette as the rest of the page. Promoting this pattern to a
        first-class component is on the suggested-improvements list below.
      </p>

      <div class="frame frame-flush">
        <div class="navbar">
          <div class="navbar-brand">
            <span class="navbar-mark">dz</span>
            <strong>dzup-ui</strong>
          </div>

          <nav class="navbar-links" aria-label="Primary">
            <button
              v-for="item in navbarSections"
              :key="item.id"
              type="button"
              class="navbar-link"
              :data-active="navbarActive === item.id"
              :aria-current="navbarActive === item.id ? 'page' : undefined"
              @click="navbarActive = item.id"
            >
              {{ item.label }}
            </button>
          </nav>

          <div class="navbar-actions">
            <button type="button" class="navbar-link navbar-trigger">
              Account
            </button>
          </div>
        </div>

        <div class="navbar-body">
          <span class="muted-text">Active section:</span>
          <strong>{{ navbarSections.find(s => s.id === navbarActive)?.label }}</strong>
        </div>
      </div>

      <DemoCode :code="navbarSnippet" />
    </section>

    <!-- DzSidebar -->
    <section class="demo-section">
      <h2 class="section-title">
        DzSidebar
      </h2>
      <p class="section-description">
        Collapsible side navigation. Children: <code>DzSidebarHeader</code>,
        <code>DzSidebarSection</code> (optionally collapsible), <code>DzSidebarItem</code>,
        <code>DzSidebarFooter</code>. Collapsed state shrinks the bar to an icon rail.
      </p>

      <div class="control-row">
        <SandboxControl label="collapsed">
          <input v-model="sidebarCollapsed" type="checkbox">
        </SandboxControl>
        <SandboxControl label="persist (localStorage)" hint="survives reload">
          <input v-model="sidebarPersist" type="checkbox">
        </SandboxControl>
        <button type="button" class="ghost-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          Toggle
        </button>
      </div>

      <div class="frame frame-flush sidebar-frame">
        <DzSidebar
          v-model:collapsed="sidebarCollapsed"
          width="15rem"
          collapsed-width="3.5rem"
          :storage-key="sidebarStorageKey"
          class="sidebar-demo"
        >
          <DzSidebarHeader>
            <template #default="{ collapsed }">
              <div class="sidebar-header-inner">
                <span class="sidebar-mark">dz</span>
                <strong v-if="!collapsed">Workspace</strong>
              </div>
            </template>
          </DzSidebarHeader>

          <DzSidebarSection title="Main">
            <DzSidebarItem
              :active="sidebarActiveItem === 'dashboard'"
              @click="sidebarActiveItem = 'dashboard'"
            >
              <template #icon>
                <span class="sidebar-icon">D</span>
              </template>
              Dashboard
            </DzSidebarItem>
            <DzSidebarItem
              :active="sidebarActiveItem === 'projects'"
              @click="sidebarActiveItem = 'projects'"
            >
              <template #icon>
                <span class="sidebar-icon">P</span>
              </template>
              Projects
            </DzSidebarItem>
            <DzSidebarItem
              :active="sidebarActiveItem === 'reports'"
              @click="sidebarActiveItem = 'reports'"
            >
              <template #icon>
                <span class="sidebar-icon">R</span>
              </template>
              Reports
            </DzSidebarItem>
          </DzSidebarSection>

          <DzSidebarSection title="Admin" collapsible>
            <DzSidebarItem
              :active="sidebarActiveItem === 'users'"
              @click="sidebarActiveItem = 'users'"
            >
              <template #icon>
                <span class="sidebar-icon">U</span>
              </template>
              Users
            </DzSidebarItem>
            <DzSidebarItem disabled>
              <template #icon>
                <span class="sidebar-icon">B</span>
              </template>
              Billing
            </DzSidebarItem>
          </DzSidebarSection>

          <DzSidebarFooter>
            <template #default="{ collapsed }">
              <div class="sidebar-footer-inner">
                <span class="sidebar-avatar">EI</span>
                <span v-if="!collapsed" class="sidebar-footer-meta">
                  <strong>Esmir</strong>
                  <span class="muted-text">esmir@dzup</span>
                </span>
              </div>
            </template>
          </DzSidebarFooter>
        </DzSidebar>

        <div class="sidebar-pane">
          <h4 class="sidebar-pane-title">
            {{ sidebarActiveItem }}
          </h4>
          <p class="muted-text">
            Click items to update active state. Toggle the control above to collapse the bar.
          </p>
        </div>
      </div>

      <DemoCode :code="sidebarSnippet" />

      <h3 class="subsection-title">
        Routed sidebar items
      </h3>
      <p class="section-description">
        <code>DzSidebarItem</code> resolves to <code>&lt;RouterLink&gt;</code> when given a
        <code>:to</code> prop, falling back to <code>&lt;a&gt;</code> outside a router context.
        These items navigate the sandbox itself -- click them to jump pages.
      </p>
      <div class="frame frame-flush sidebar-frame sidebar-router-frame">
        <DzSidebar width="13rem" collapsed-width="3rem" class="sidebar-demo">
          <DzSidebarHeader>
            <strong>Sandbox routes</strong>
          </DzSidebarHeader>
          <DzSidebarSection title="Pages">
            <DzSidebarItem to="/">
              <template #icon>
                <span class="sidebar-icon">H</span>
              </template>
              Home
            </DzSidebarItem>
            <DzSidebarItem to="/buttons">
              <template #icon>
                <span class="sidebar-icon">B</span>
              </template>
              Buttons
            </DzSidebarItem>
            <DzSidebarItem to="/layout">
              <template #icon>
                <span class="sidebar-icon">L</span>
              </template>
              Layout
            </DzSidebarItem>
            <DzSidebarItem
              :to="{ name: 'navigation', query: { from: 'sidebar' } }"
              :active="true"
            >
              <template #icon>
                <span class="sidebar-icon">N</span>
              </template>
              Navigation (this page)
            </DzSidebarItem>
          </DzSidebarSection>
          <DzSidebarSection title="External">
            <DzSidebarItem href="https://github.com" :aria-label="'Open GitHub in a new tab'">
              <template #icon>
                <span class="sidebar-icon">↗</span>
              </template>
              GitHub (href)
            </DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>
        <div class="sidebar-pane">
          <h4 class="sidebar-pane-title">
            Polymorphic rendering
          </h4>
          <p class="muted-text">
            Items with <code>:to</code> render as <code>RouterLink</code> (string path or
            location object); items with <code>href</code> render as <code>&lt;a&gt;</code>;
            everything else is a <code>&lt;button&gt;</code>.
          </p>
        </div>
      </div>

      <DemoCode
        code="<DzSidebar>
  <DzSidebarSection title=&quot;Pages&quot;>
    <DzSidebarItem to=&quot;/&quot;>Home</DzSidebarItem>
    <DzSidebarItem :to=&quot;{ name: 'navigation', query: { from: 'sidebar' } }&quot;>
      Navigation
    </DzSidebarItem>
    <DzSidebarItem href=&quot;https://github.com&quot;>GitHub (href)</DzSidebarItem>
  </DzSidebarSection>
</DzSidebar>"
      />
    </section>

    <!-- DzStepper -->
    <section class="demo-section">
      <h2 class="section-title">
        DzStepper
      </h2>
      <p class="section-description">
        Step-by-step progress indicator. v-model binds the 0-based active index; steps register
        themselves via context. Each step exposes <code>completed</code>, <code>active</code>, and
        <code>upcoming</code> status to a custom indicator slot.
      </p>

      <div class="control-row">
        <SandboxControl label="orientation">
          <select v-model="stepperOrientation">
            <option v-for="o in stepperOrientationOptions" :key="o" :value="o">
              {{ o }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="clickable" hint="completed/active jump">
          <input v-model="stepperClickable" type="checkbox">
        </SandboxControl>
        <SandboxControl label="active">
          <input
            v-model.number="activeStep"
            type="number"
            min="0"
            :max="stepperTotal - 1"
          >
        </SandboxControl>
        <button type="button" class="ghost-btn" :disabled="activeStep === 0" @click="prevStep">
          Back
        </button>
        <button
          type="button"
          class="ghost-btn"
          :disabled="activeStep >= stepperTotal - 1"
          @click="nextStep"
        >
          Next
        </button>
      </div>

      <div class="frame">
        <DzStepper
          v-model="activeStep"
          :orientation="stepperOrientation"
          :clickable="stepperClickable"
          @navigate="stepperLastNavigate = $event"
        >
          <DzStepperItem
            v-for="step in stepperSteps"
            :key="step.title"
            :title="step.title"
            :description="step.description"
            :optional="step.optional"
          />
        </DzStepper>
        <p v-if="stepperLastNavigate !== null" class="muted-text navigate-log">
          last <code>@navigate</code>: step {{ stepperLastNavigate + 1 }}
          (<code>{{ stepperSteps[stepperLastNavigate]?.title }}</code>)
        </p>
      </div>

      <DemoCode :code="stepperSnippet" />
    </section>

    <!-- DzMenu -->
    <section class="demo-section">
      <h2 class="section-title">
        DzMenu
      </h2>
      <p class="section-description">
        Vertical navigation menu. Children: <code>DzMenuItem</code> and
        <code>DzMenuSeparator</code>. Items can be active, disabled, or rendered as
        <code>&lt;a&gt;</code> via <code>href</code>. Collapsed mode hides labels and shows the
        icon slot only.
      </p>

      <div class="control-row">
        <SandboxControl label="size">
          <select v-model="menuSize">
            <option v-for="s in menuSizeOptions" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="collapsed">
          <input v-model="menuCollapsed" type="checkbox">
        </SandboxControl>
      </div>

      <div class="frame menu-frame">
        <DzMenu
          :size="menuSize"
          :collapsed="menuCollapsed"
          aria-label="Demo menu"
        >
          <DzMenuItem
            :active="menuActive === 'home'"
            @click="menuActive = 'home'"
          >
            <template #icon>
              <span class="sidebar-icon">H</span>
            </template>
            Home
          </DzMenuItem>
          <DzMenuItem
            :active="menuActive === 'reports'"
            @click="menuActive = 'reports'"
          >
            <template #icon>
              <span class="sidebar-icon">R</span>
            </template>
            Reports
          </DzMenuItem>
          <DzMenuItem
            :active="menuActive === 'inbox'"
            @click="menuActive = 'inbox'"
          >
            <template #icon>
              <span class="sidebar-icon">I</span>
            </template>
            Inbox
          </DzMenuItem>
          <DzMenuSeparator />
          <DzMenuItem disabled>
            <template #icon>
              <span class="sidebar-icon">S</span>
            </template>
            Settings (disabled)
          </DzMenuItem>
          <DzMenuItem href="https://github.com" aria-label="Open GitHub">
            <template #icon>
              <span class="sidebar-icon">↗</span>
            </template>
            GitHub (href)
          </DzMenuItem>
        </DzMenu>
      </div>

      <DemoCode :code="menuSnippet" />
    </section>

    <!-- DzPagination -->
    <section class="demo-section">
      <h2 class="section-title">
        DzPagination
      </h2>
      <p class="section-description">
        Page navigation backed by Reka UI <code>PaginationRoot</code>. v-model binds the 1-based
        current page; <code>siblingCount</code> controls how many neighbours of the active page are
        rendered before ellipses kick in. Enable <code>showEdges</code> for first/last buttons.
      </p>

      <div class="control-row">
        <SandboxControl label="total">
          <input
            v-model.number="paginationTotal"
            type="number"
            min="1"
          >
        </SandboxControl>
        <SandboxControl label="pageSize">
          <input
            v-model.number="paginationPageSize"
            type="number"
            min="1"
          >
        </SandboxControl>
        <SandboxControl label="siblingCount">
          <input
            v-model.number="paginationSiblings"
            type="number"
            min="0"
            max="4"
          >
        </SandboxControl>
        <SandboxControl label="size">
          <select v-model="paginationSize">
            <option v-for="s in paginationSizeOptions" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="showEdges">
          <input v-model="paginationShowEdges" type="checkbox">
        </SandboxControl>
        <SandboxControl label="disabled">
          <input v-model="paginationDisabled" type="checkbox">
        </SandboxControl>
      </div>

      <div class="frame">
        <DzPagination
          v-model="paginationPage"
          :total="paginationTotal"
          :page-size="paginationPageSize"
          :sibling-count="paginationSiblings"
          :show-edges="paginationShowEdges"
          :size="paginationSize"
          :disabled="paginationDisabled"
        />
        <p class="muted-text navigate-log">
          page <code>{{ paginationPage }}</code> of
          <code>{{ Math.max(1, Math.ceil(paginationTotal / Math.max(1, paginationPageSize))) }}</code>
        </p>
      </div>

      <DemoCode :code="paginationSnippet" />
    </section>

    <!-- DzSegmented -->
    <section class="demo-section">
      <h2 class="section-title">
        DzSegmented
      </h2>
      <p class="section-description">
        Segmented control (single-select toggle group) backed by Reka UI
        <code>ToggleGroupRoot</code>. Pass an array of <code>SegmentedItem</code>; v-model binds
        the active value. Useful for view-mode switches and short filter pickers.
      </p>

      <div class="control-row">
        <SandboxControl label="size">
          <select v-model="segmentedSize">
            <option v-for="s in segmentedSizeOptions" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="disabled">
          <input v-model="segmentedDisabled" type="checkbox">
        </SandboxControl>
      </div>

      <div class="frame">
        <DzSegmented
          v-model="segmentedValue"
          :items="segmentedItems"
          :size="segmentedSize"
          :disabled="segmentedDisabled"
          aria-label="View mode"
        />
        <p class="muted-text navigate-log">
          active: <code>{{ segmentedValue || '(none)' }}</code>
        </p>
      </div>

      <DemoCode :code="segmentedSnippet" />
    </section>

    <!-- Composition -->
    <section class="demo-section">
      <h2 class="section-title">
        Composition
      </h2>
      <p class="section-description">
        All five components in one shell: sidebar on the left, breadcrumb above tabs, stepper inside
        the active tab.
      </p>

      <div class="frame frame-flush composition-frame">
        <DzSidebar
          v-model:collapsed="compositionState.collapsed"
          width="13rem"
          collapsed-width="3rem"
        >
          <DzSidebarHeader>
            <template #default="{ collapsed }">
              <span v-if="!collapsed"><strong>Onboard</strong></span>
              <span v-else>O</span>
            </template>
          </DzSidebarHeader>
          <DzSidebarSection title="Setup">
            <DzSidebarItem active>
              <template #icon>
                <span class="sidebar-icon">G</span>
              </template>
              Getting started
            </DzSidebarItem>
            <DzSidebarItem>
              <template #icon>
                <span class="sidebar-icon">T</span>
              </template>
              Team
            </DzSidebarItem>
          </DzSidebarSection>
          <DzSidebarFooter>
            <template #default="{ collapsed }">
              <button type="button" class="ghost-btn ghost-btn-block" @click="compositionState.collapsed = !compositionState.collapsed">
                {{ collapsed ? '»' : 'Collapse' }}
              </button>
            </template>
          </DzSidebarFooter>
        </DzSidebar>

        <div class="composition-main">
          <DzBreadcrumb separator="›">
            <DzBreadcrumbItem href="/">
              Home
            </DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem href="/onboarding">
              Onboarding
            </DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem current>
              Getting started
            </DzBreadcrumbItem>
          </DzBreadcrumb>

          <DzTabs v-model="compositionTab" variant="line">
            <DzTabList>
              <DzTabTrigger value="overview">
                Overview
              </DzTabTrigger>
              <DzTabTrigger value="progress">
                Progress
              </DzTabTrigger>
            </DzTabList>
            <DzTabContent value="overview">
              <p class="tab-body">
                Welcome. Follow the steps in the Progress tab to finish onboarding.
              </p>
            </DzTabContent>
            <DzTabContent value="progress">
              <DzStepper v-model="activeStep" orientation="horizontal">
                <DzStepperItem
                  v-for="step in stepperSteps"
                  :key="step.title"
                  :title="step.title"
                  :description="step.description"
                  :optional="step.optional"
                />
              </DzStepper>
            </DzTabContent>
          </DzTabs>
        </div>
      </div>
    </section>

    <!-- Next steps -->
    <section class="demo-section demo-section-suggestions">
      <h2 class="section-title">
        Suggested next improvements
      </h2>
      <p class="section-description">
        Gaps and follow-ups surfaced while building this page.
      </p>

      <ol class="suggestion-list">
        <li>
          <strong>Add a first-class <code>DzNavbar</code></strong> family. The composed example here
          re-implements common patterns (brand + link group + actions, collapsing into a mobile
          drawer) that consumers will keep duplicating. Mirror the <code>DzSidebar</code> compound
          shape: <code>DzNavbar</code> / <code>DzNavbarBrand</code> / <code>DzNavbarLinks</code> /
          <code>DzNavbarActions</code>, with built-in mobile breakpoint behavior.
        </li>
        <li>
          <strong>Make <code>DzSidebar</code> positioning opt-in</strong>. The root currently
          hardcodes <code>position: fixed; inset-y: 0; left: 0; z-40</code>, which means every
          instance escapes its parent and pins to the viewport -- breaking any embedded/demo
          usage (this page works around it with scoped overrides). Add a prop such as
          <code>floating</code> (default <code>true</code> for backwards compatibility, opt to
          <code>false</code> for in-flow rendering) or split the fixed positioning into a
          dedicated <code>app-shell</code> variant.
        </li>
        <li>
          <strong>Honour <code>width</code> / <code>collapsedWidth</code> props</strong>. The
          component writes <code>--dz-sidebar-width</code> / <code>--dz-sidebar-collapsed-width</code>
          as inline CSS vars, but the variants use literal Tailwind <code>w-64</code> /
          <code>w-16</code> so the prop values never take effect. Either consume the vars in the
          variants or document that the prop is decorative.
        </li>
        <li>
          <strong>Storybook story for <code>DzSidebar</code></strong>. Every other navigation
          component has a story under <code>packages/core/stories/navigation/</code>;
          <code>DzSidebar</code> is the lone holdout. Bring it in line with the rest of the family.
        </li>
        <li>
          <strong>Migrate <code>DzTabTrigger</code> off <code>&lt;style scoped&gt;</code></strong>.
          The trigger ships a scoped style block for the close-button affordance, which violates
          the ADR-04 "no scoped styles -- use <code>tv()</code> in
          <code>.variants.ts</code>" rule. Fold it into <code>tabsVariants</code> (or a sibling
          slot in the same <code>tv()</code> call).
        </li>
        <li>
          <strong>Route-aware <code>:active</code> on routed <code>DzSidebarItem</code></strong>.
          The current "Navigation (this page)" item hardcodes <code>:active="true"</code>. A
          built-in active-by-current-route mode (or a documented pattern using
          <code>useRoute()</code>) would remove that footgun.
        </li>
        <li>
          <strong>Wire <code>DzMenu</code> into the navbar example</strong>. Once
          <code>DzMenu</code> covers the typical horizontal nav-link list (it currently targets
          vertical menus), the composed navbar here can shed its hand-rolled
          <code>&lt;button&gt;</code> loop in favor of <code>DzMenu</code>.
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
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
  margin: 0 0 32px;
}

.demo-section {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.demo-section-suggestions {
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 4%, var(--dz-surface, #ffffff));
  border-color: color-mix(in srgb, var(--dz-primary, #2563eb) 25%, var(--dz-border, #e2e8f0));
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.title-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.section-description {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 16px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 20px 0 8px;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.frame {
  padding: 16px;
  background: var(--dz-muted, #f8fafc);
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  min-height: 80px;
}

.frame-flush {
  padding: 0;
  overflow: hidden;
}

.frame-footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.tab-body {
  margin: 0;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-sm, 4px);
}

.muted-text {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
}

/* Navbar (composed) */
.navbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px;
  height: 56px;
  background: var(--dz-surface, #ffffff);
  border-bottom: 1px solid var(--dz-border, #e2e8f0);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--dz-foreground, #1a202c);
}

.navbar-mark,
.sidebar-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-primary, #2563eb);
  color: var(--dz-primary-foreground, #ffffff);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.navbar-links {
  display: flex;
  gap: 4px;
}

.navbar-link {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--dz-muted-foreground, #64748b);
  background: transparent;
  border: none;
  border-radius: var(--dz-radius-sm, 4px);
  cursor: pointer;
}

.navbar-link:hover {
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.navbar-link[data-active='true'] {
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 12%, transparent);
  color: var(--dz-primary, #2563eb);
}

.navbar-actions {
  margin-left: auto;
}

.navbar-trigger {
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
}

.navbar-body {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: var(--dz-muted, #f8fafc);
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
}

/* Sidebar demo */
.sidebar-frame {
  display: flex;
  align-items: stretch;
  min-height: 360px;
  background: var(--dz-surface, #ffffff);
  position: relative;
}

.sidebar-demo {
  flex-shrink: 0;
  border-right: 1px solid var(--dz-border, #e2e8f0);
}

/*
 * DzSidebar ships `position: fixed; inset-y-0; left-0; z-40` on its root
 * (see DzSidebar.variants.ts), which makes every instance escape its
 * parent and pin to the viewport. For these in-page demos we want it to
 * render in-flow inside the frame container, so we reset the positioning
 * for the sidebar roots that live under demo frames. Library-side fix
 * (e.g. a `floating` prop opt-out) is tracked in the suggestions list.
 */
.sidebar-frame > :deep(nav[role='navigation']),
.composition-frame > :deep(nav[role='navigation']) {
  position: relative;
  top: auto;
  bottom: auto;
  left: auto;
  right: auto;
  transform: none;
  z-index: auto;
  height: auto;
  align-self: stretch;
}

.sidebar-header-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
}

.sidebar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: var(--dz-muted, #f1f5f9);
  font-size: 11px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
}

.sidebar-footer-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.sidebar-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 16%, transparent);
  color: var(--dz-primary, #2563eb);
  font-size: 11px;
  font-weight: 700;
}

.sidebar-footer-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  color: var(--dz-foreground, #1a202c);
}

.sidebar-pane {
  flex: 1;
  padding: 20px 24px;
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 3%, var(--dz-surface, #ffffff));
}

.sidebar-pane-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  text-transform: capitalize;
}

.sidebar-router-frame {
  margin-top: 8px;
  min-height: 280px;
}

.menu-frame {
  max-width: 280px;
  background: var(--dz-surface, #ffffff);
}

.navigate-log {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

/* Composition */
.composition-frame {
  display: flex;
  align-items: stretch;
  min-height: 380px;
  background: var(--dz-surface, #ffffff);
}

.composition-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 2%, var(--dz-surface, #ffffff));
}

/* Suggestions */
.suggestion-list {
  margin: 0;
  padding: 0 0 0 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--dz-foreground, #1a202c);
}

.suggestion-list strong {
  color: var(--dz-foreground, #1a202c);
}

/* Buttons */
.ghost-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dz-primary, #2563eb);
  background: transparent;
  border: 1px solid var(--dz-primary, #2563eb);
  border-radius: var(--dz-radius-sm, 4px);
  cursor: pointer;
}

.ghost-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dz-primary, #2563eb) 8%, transparent);
}

.ghost-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ghost-btn-block {
  width: 100%;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 4px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 3px;
}
</style>
