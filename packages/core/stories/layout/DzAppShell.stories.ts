import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'
import { DzAppShell } from '../../src/components/layout'

/**
 * `DzAppShell` is the application-level layout primitive. It composes a sidebar
 * slot, a header band with three sub-slots (`header-start`, `header`,
 * `header-end`), and a scrollable main content area.
 *
 * The sidebar slot is rendered as a flex sibling of the content panel — there
 * is no auto-margin. Apps that need a fixed-position sidebar can use
 * `DzSidebar` with `position="fixed"` inside the slot.
 *
 * Header height, header bg/border, header z-index, header padding, main bg,
 * and main padding are all token-driven via the `--dz-appshell-*` token
 * family. Apps and brand themes override these tokens at `:root` to retheme
 * the shell without component code changes.
 *
 * Slots: `sidebar`, `header-start`, `header`, `header-end`, default.
 */
const meta = {
  title: 'Core/Layout/DzAppShell',
  component: DzAppShell,
  tags: ['autodocs'],
  argTypes: {
    sidebarWidth: {
      control: 'text',
      description: 'CSS width of the expanded sidebar (informational; the sidebar slot owns its own width).',
      table: { category: 'Layout', defaultValue: { summary: '16rem' } },
    },
    sidebarCollapsedWidth: {
      control: 'text',
      description: 'CSS width of the collapsed sidebar.',
      table: { category: 'Layout', defaultValue: { summary: '4rem' } },
    },
    headerHeight: {
      control: 'text',
      description: 'CSS height of the header bar (drives --dz-appshell-header-height).',
      table: { category: 'Layout', defaultValue: { summary: '4rem' } },
    },
    hasSidebar: {
      control: 'boolean',
      description: 'Whether to render the sidebar slot region.',
      table: { category: 'Layout', defaultValue: { summary: 'true' } },
    },
    hasHeader: {
      control: 'boolean',
      description: 'Whether to render the header bar.',
      table: { category: 'Layout', defaultValue: { summary: 'true' } },
    },
    id: {
      control: 'text',
      description: 'Unique element ID.',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the shell landmark.',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    hasSidebar: true,
    hasHeader: true,
  },
} satisfies Meta<typeof DzAppShell>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default — sidebar + header + main, all three header sub-slots populated
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => ({
    components: { DzAppShell },
    setup() {
      return { args }
    },
    template: `
      <DzAppShell v-bind="args" aria-label="Sample app">
        <template #sidebar>
          <aside style="width:16rem;background:var(--dz-sidebar-bg);color:var(--dz-sidebar-foreground);padding:var(--dz-spacing-4);">
            Sidebar slot — apps render <code>DzSidebar</code> here.
          </aside>
        </template>
        <template #header-start>
          <button type="button" aria-label="Toggle sidebar" style="background:transparent;border:none;color:var(--dz-muted-foreground);cursor:pointer;padding:var(--dz-spacing-2);">☰</button>
        </template>
        <template #header>
          <span style="color:var(--dz-foreground);font-weight:500;">Page title or breadcrumb</span>
        </template>
        <template #header-end>
          <button type="button" style="background:transparent;border:none;color:var(--dz-muted-foreground);cursor:pointer;padding:var(--dz-spacing-2);">User</button>
        </template>
        <div style="padding:var(--dz-spacing-4);">Main content area. Background and padding come from --dz-appshell-main-* tokens.</div>
      </DzAppShell>
    `,
  }),
}

// ---------------------------------------------------------------------------
// NoHeader — full-height main content
// ---------------------------------------------------------------------------

export const NoHeader: Story = {
  args: { hasHeader: false },
  render: (args) => ({
    components: { DzAppShell },
    setup() {
      return { args }
    },
    template: `
      <DzAppShell v-bind="args" aria-label="Headerless shell">
        <template #sidebar>
          <aside style="width:16rem;background:var(--dz-sidebar-bg);color:var(--dz-sidebar-foreground);padding:var(--dz-spacing-4);">Sidebar</aside>
        </template>
        <div style="padding:var(--dz-spacing-4);">No header — main area takes the full viewport height.</div>
      </DzAppShell>
    `,
  }),
}

// ---------------------------------------------------------------------------
// NoSidebar — header + main only
// ---------------------------------------------------------------------------

export const NoSidebar: Story = {
  args: { hasSidebar: false },
  render: (args) => ({
    components: { DzAppShell },
    setup() {
      return { args }
    },
    template: `
      <DzAppShell v-bind="args" aria-label="Sidebarless shell">
        <template #header>Page title</template>
        <div style="padding:var(--dz-spacing-4);">No sidebar — useful for marketing or auth pages that share the header chrome.</div>
      </DzAppShell>
    `,
  }),
}

// ---------------------------------------------------------------------------
// CustomHeaderHeight — token override
// ---------------------------------------------------------------------------

export const CustomHeaderHeight: Story = {
  args: { headerHeight: '3rem' },
  render: (args) => ({
    components: { DzAppShell },
    setup() {
      return { args }
    },
    template: `
      <DzAppShell v-bind="args" aria-label="Custom header height">
        <template #sidebar>
          <aside style="width:16rem;background:var(--dz-sidebar-bg);color:var(--dz-sidebar-foreground);padding:var(--dz-spacing-3);">Sidebar</aside>
        </template>
        <template #header-start>☰</template>
        <template #header>Slim header — 3rem</template>
        <div style="padding:var(--dz-spacing-4);">The header height token is set via the <code>headerHeight</code> prop, which writes <code>--dz-appshell-header-height</code> on the root.</div>
      </DzAppShell>
    `,
  }),
}

// ---------------------------------------------------------------------------
// HeaderSlots — demonstrates the three header sub-slots in order
// ---------------------------------------------------------------------------

export const HeaderSlots: Story = {
  render: () => ({
    components: { DzAppShell },
    template: `
      <DzAppShell aria-label="Header slot demo">
        <template #sidebar>
          <aside style="width:16rem;background:var(--dz-sidebar-bg);color:var(--dz-sidebar-foreground);padding:var(--dz-spacing-3);">Sidebar</aside>
        </template>
        <template #header-start>
          <span style="background:var(--dz-muted);padding:0.25rem 0.5rem;border-radius:var(--dz-radius-sm);font-size:var(--dz-text-xs);">START</span>
        </template>
        <template #header>
          <span style="background:var(--dz-muted);padding:0.25rem 0.5rem;border-radius:var(--dz-radius-sm);font-size:var(--dz-text-xs);">CENTER (flex-1)</span>
        </template>
        <template #header-end>
          <span style="background:var(--dz-muted);padding:0.25rem 0.5rem;border-radius:var(--dz-radius-sm);font-size:var(--dz-text-xs);">END</span>
        </template>
        <div style="padding:var(--dz-spacing-4);">
          The center slot sits inside <code>flex-1 min-w-0</code> so it grows to fill, while start/end are <code>shrink-0</code>.
          Apps put a sidebar toggle in <code>header-start</code>, a breadcrumb or page title in <code>header</code>, and user/theme/notification controls in <code>header-end</code>.
        </div>
      </DzAppShell>
    `,
  }),
}
