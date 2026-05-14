<script setup lang="ts">
import {
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzBreadcrumbSeparator,
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
  DzSidebarProps,
  DzStepperProps,
  DzTabsProps,
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
    <DzTabTrigger value="api" disabled>API</DzTabTrigger>
  </DzTabList>
  <DzTabContent value="overview">…</DzTabContent>
  <DzTabContent value="usage">…</DzTabContent>`,
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
// DzNavbar (composed from DzFlex + DzMenu)
// ---------------------------------------------------------------------------

const navbarActive = ref<'dashboard' | 'projects' | 'team' | 'settings'>('dashboard')
const navbarSections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projects', label: 'Projects' },
  { id: 'team', label: 'Team' },
  { id: 'settings', label: 'Settings' },
] as const

const navbarSnippet = `<!-- Composed from primitives: no dedicated DzNavbar yet -->
<header class="navbar">
  <DzFlex align="center" gap="md">
    <strong>dzup-ui</strong>
    <DzFlex tag="nav" gap="xs">
      <button
        v-for="item in sections"
        :key="item.id"
        :data-active="active === item.id"
        @click="active = item.id"
      >
        {{ item.label }}
      </button>
    </DzFlex>
    <DzSpacer size="auto" />
    <button class="navbar-account">Account</button>
  </DzFlex>
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
        There is no dedicated <code>DzNavbar</code> component yet -- the library exposes the
        primitives needed to build one. This demo composes a top navbar from layout primitives plus
        <code>DzMenu</code>. Promoting this to a first-class component is on the suggested-improvements
        list below.
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
        <span class="title-badge">requested as <code>DzSteps</code></span>
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
          <strong>Rename or alias <code>DzStepper</code> &rarr; <code>DzSteps</code></strong> (or
          export both). The CLAUDE.md component map and the placeholder <code>NavigationPage</code>
          comment both reference <code>DzSteps</code>, so the public taxonomy and implementation
          have drifted.
        </li>
        <li>
          <strong>Expose canonical <code>tone</code> on <code>DzTabs</code></strong>. Currently only
          <code>variant</code> and <code>size</code> are wired. Tabs frequently need to signal
          state (e.g. <code>danger</code> for a validation-failing pane). Add <code>tone</code> per
          ADR-02 to bring tabs in line with buttons/badges/alerts.
        </li>
        <li>
          <strong>Add closable-tab keyboard affordance</strong>. Today closing requires a click;
          <code>Backspace</code> / <code>Delete</code> on a focused trigger should emit
          <code>close</code> for parity with VS Code-style tab strips.
        </li>
        <li>
          <strong>Persist <code>DzSidebar</code> collapsed state</strong>. Add a
          <code>storageKey</code> prop that round-trips through <code>localStorage</code> so the
          rail survives reloads -- a recurring need in every app shell.
        </li>
        <li>
          <strong>Linkable <code>DzStepperItem</code></strong>. Make each item clickable
          (<code>:clickable</code> or <code>@click</code>) with an emitted <code>navigate</code>
          event so users can jump to completed steps without manually moving v-model.
        </li>
        <li>
          <strong>Storybook coverage for navigation family</strong>. Spot-check showed contract
          tests but uneven Storybook stories for <code>DzSidebar</code>/<code>DzStepper</code>;
          align with the buttons/inputs family for parity.
        </li>
        <li>
          <strong>Sandbox: stub <code>RouterLink</code> demo for <code>DzSidebarItem</code></strong>.
          The <code>to</code> prop is documented but unexercised in the sandbox -- worth a small
          example wiring it to <code>vue-router</code> so consumers see the integration.
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
}

.sidebar-demo {
  flex-shrink: 0;
  border-right: 1px solid var(--dz-border, #e2e8f0);
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
