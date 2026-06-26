import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import {
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
} from '../../src/components/navigation'

/**
 * `DzSidebar` is a collapsible navigation sidebar. It paints exclusively
 * through the `--dz-sidebar-*` token namespace. Override sidebar tokens at
 * `:root` (or in a brand preset like
 * `@datazup/dzup-theme/styles/preset-dark-sidebar.css`) to retheme the
 * sidebar without component code changes.
 *
 * Compound children: `DzSidebarHeader`, `DzSidebarSection`, `DzSidebarItem`,
 * `DzSidebarFooter`.
 *
 * Position modes: `static` (default) renders the root as a flex sibling
 * suitable for use inside `DzAppShell`'s sidebar slot. `fixed` positions
 * the sidebar absolutely; the parent must reserve content offset.
 *
 * Active item style: `filled` (default) paints the row in the active token
 * pair; `rail` adds a 3px left border accent. `activeStyle` is set on the
 * parent `DzSidebar` and inherited by `DzSidebarItem` via injection.
 *
 * Mobile drawer: when the viewport drops below `mobileBreakpoint`
 * (default 1024 px), or when the parent passes `isMobile=true`, the
 * sidebar transitions into a fixed overlay drawer controlled by
 * `mobileOpen`. A backdrop renders via Teleport.
 */
const meta = {
  title: 'Core/Navigation/DzSidebar',
  component: DzSidebar,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    collapsed: {
      control: 'boolean',
      description: 'Whether the sidebar is collapsed to icon-only mode.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    mobileOpen: {
      control: 'boolean',
      description: 'Whether the mobile-drawer overlay is open.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    position: {
      control: 'select',
      options: ['static', 'fixed'],
      description: 'Root positioning mode. `static` for flex-sibling layout; `fixed` for legacy fixed-position sidebars.',
      table: { category: 'Layout', defaultValue: { summary: 'static' } },
    },
    mobileBreakpoint: {
      control: 'number',
      description: 'Pixel breakpoint at or below which the sidebar enters mobile-drawer mode. Ignored when `isMobile` prop is supplied.',
      table: { category: 'Layout', defaultValue: { summary: '1024' } },
    },
    isMobile: {
      control: 'boolean',
      description: 'Externally controlled mobile-mode override. When defined, the sidebar will not run its own matchMedia listener.',
      table: { category: 'Layout' },
    },
    activeStyle: {
      control: 'select',
      options: ['filled', 'rail'],
      description: 'Visual treatment for active items.',
      table: { category: 'Appearance', defaultValue: { summary: 'filled' } },
    },
    width: {
      control: 'text',
      description: 'CSS value for `--dz-sidebar-width` (expanded width).',
      table: { category: 'Layout' },
    },
    collapsedWidth: {
      control: 'text',
      description: 'CSS value for `--dz-sidebar-collapsed-width`.',
      table: { category: 'Layout' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the navigation landmark.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Sidebar navigation' } },
    },
  },
  args: {
    collapsed: false,
    mobileOpen: false,
    position: 'static',
    mobileBreakpoint: 1024,
    activeStyle: 'filled',
  },
} satisfies Meta<typeof DzSidebar>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default — static, expanded, filled active
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    setup() {
      return { args }
    },
    template: `
      <div style="height:32rem;display:flex;background:var(--dz-background);">
        <DzSidebar v-bind="args">
          <DzSidebarHeader>
            <span style="font-weight:600;color:var(--dz-sidebar-foreground-hover);">Datazup</span>
          </DzSidebarHeader>
          <DzSidebarSection title="Workspace">
            <DzSidebarItem :active="true">Dashboard</DzSidebarItem>
            <DzSidebarItem>Sessions</DzSidebarItem>
            <DzSidebarItem>Drafts</DzSidebarItem>
          </DzSidebarSection>
          <DzSidebarSection title="Account">
            <DzSidebarItem>Profile</DzSidebarItem>
            <DzSidebarItem>Settings</DzSidebarItem>
          </DzSidebarSection>
          <DzSidebarFooter>
            <span style="font-size:var(--dz-text-xs);color:var(--dz-sidebar-foreground);">v0.1.0</span>
          </DzSidebarFooter>
        </DzSidebar>
        <div style="flex:1;padding:var(--dz-spacing-6);color:var(--dz-foreground);">Main content</div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Collapsed — icon-only rail
// ---------------------------------------------------------------------------

export const Collapsed: Story = {
  args: { collapsed: true },
  render: args => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    setup() {
      return { args }
    },
    template: `
      <div style="height:32rem;display:flex;background:var(--dz-background);">
        <DzSidebar v-bind="args">
          <DzSidebarHeader>D</DzSidebarHeader>
          <DzSidebarSection title="Workspace">
            <DzSidebarItem :active="true" aria-label="Dashboard">⌂</DzSidebarItem>
            <DzSidebarItem aria-label="Sessions">📁</DzSidebarItem>
            <DzSidebarItem aria-label="Drafts">📄</DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>
        <div style="flex:1;padding:var(--dz-spacing-6);color:var(--dz-foreground);">Section titles auto-collapse to <code>sr-only</code> when the sidebar is collapsed.</div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// FixedPosition — legacy fixed-position sidebar (overlays content)
// ---------------------------------------------------------------------------

export const FixedPosition: Story = {
  args: { position: 'fixed' },
  render: args => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem },
    setup() {
      return { args }
    },
    template: `
      <div style="height:32rem;position:relative;background:var(--dz-background);">
        <DzSidebar v-bind="args">
          <DzSidebarHeader>Fixed</DzSidebarHeader>
          <DzSidebarSection title="Items">
            <DzSidebarItem :active="true">Active</DzSidebarItem>
            <DzSidebarItem>Inactive</DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>
        <div style="margin-left:16rem;padding:var(--dz-spacing-6);color:var(--dz-foreground);">
          With <code>position="fixed"</code> the sidebar overlays the content. The parent layout must reserve its own content offset (here a manual <code>margin-left: 16rem</code>).
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// MobileDrawer — sidebar transitions to overlay below mobileBreakpoint
// ---------------------------------------------------------------------------

export const MobileDrawer: Story = {
  args: { isMobile: true, mobileOpen: true },
  parameters: {
    docs: {
      description: {
        story: 'Force-mounted in mobile mode (`isMobile=true`) with the drawer open. The Teleport-rendered backdrop appears outside the story root.',
      },
    },
  },
  render: args => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem },
    setup() {
      return { args }
    },
    template: `
      <div style="height:32rem;position:relative;background:var(--dz-background);overflow:hidden;">
        <DzSidebar v-bind="args">
          <DzSidebarHeader>Mobile</DzSidebarHeader>
          <DzSidebarSection title="Items">
            <DzSidebarItem :active="true">Dashboard</DzSidebarItem>
            <DzSidebarItem>Drafts</DzSidebarItem>
            <DzSidebarItem>Settings</DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>
        <div style="padding:var(--dz-spacing-6);color:var(--dz-foreground);">
          The sidebar slides in from the left. Tapping the backdrop sets <code>mobileOpen</code> to <code>false</code> via <code>v-model</code>.
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// ActiveStyleFilled — default; full-row brand fill
// ---------------------------------------------------------------------------

export const ActiveStyleFilled: Story = {
  args: { activeStyle: 'filled' },
  render: args => ({
    components: { DzSidebar, DzSidebarSection, DzSidebarItem },
    setup() {
      return { args }
    },
    template: `
      <div style="height:24rem;display:flex;background:var(--dz-background);">
        <DzSidebar v-bind="args">
          <DzSidebarSection title="Filled active">
            <DzSidebarItem>Idle</DzSidebarItem>
            <DzSidebarItem :active="true">Active (filled)</DzSidebarItem>
            <DzSidebarItem>Idle</DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>
        <div style="flex:1;padding:var(--dz-spacing-6);color:var(--dz-foreground);">Active item paints with <code>--dz-sidebar-item-active-bg</code> and <code>--dz-sidebar-item-active-text</code>.</div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// ActiveStyleRail — opt-in legacy left-border accent
// ---------------------------------------------------------------------------

export const ActiveStyleRail: Story = {
  args: { activeStyle: 'rail' },
  render: args => ({
    components: { DzSidebar, DzSidebarSection, DzSidebarItem },
    setup() {
      return { args }
    },
    template: `
      <div style="height:24rem;display:flex;background:var(--dz-background);">
        <DzSidebar v-bind="args">
          <DzSidebarSection title="Rail active">
            <DzSidebarItem>Idle</DzSidebarItem>
            <DzSidebarItem :active="true">Active (rail)</DzSidebarItem>
            <DzSidebarItem>Idle</DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>
        <div style="flex:1;padding:var(--dz-spacing-6);color:var(--dz-foreground);">Active item gets a 3 px left border in <code>--dz-sidebar-item-active-bg</code> with the dimmer hover-bg behind it. Use this when filled rows feel too heavy.</div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive — collapse / expand toggle controlled by v-model
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    setup() {
      const collapsed = ref(false)
      function toggle(): void {
        collapsed.value = !collapsed.value
      }
      return { collapsed, toggle }
    },
    template: `
      <div style="height:32rem;display:flex;background:var(--dz-background);">
        <DzSidebar v-model:collapsed="collapsed">
          <DzSidebarHeader>{{ collapsed ? 'D' : 'Datazup' }}</DzSidebarHeader>
          <DzSidebarSection title="Workspace">
            <DzSidebarItem :active="true" aria-label="Dashboard">{{ collapsed ? '⌂' : 'Dashboard' }}</DzSidebarItem>
            <DzSidebarItem aria-label="Drafts">{{ collapsed ? '📄' : 'Drafts' }}</DzSidebarItem>
          </DzSidebarSection>
          <DzSidebarFooter>
            <button type="button" @click="toggle" style="background:transparent;border:none;color:var(--dz-sidebar-foreground);cursor:pointer;font-size:var(--dz-text-xs);">
              {{ collapsed ? 'Expand →' : '← Collapse' }}
            </button>
          </DzSidebarFooter>
        </DzSidebar>
        <div style="flex:1;padding:var(--dz-spacing-6);color:var(--dz-foreground);">Click the footer button to toggle. v-model:collapsed drives the width transition.</div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Expanded: item labels are rendered.
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument()

    // Collapsing hides the labels (icon-only rail) and flips the toggle label.
    await userEvent.click(canvas.getByRole('button', { name: /Collapse/ }))
    await waitFor(() => expect(canvas.queryByText('Dashboard')).not.toBeInTheDocument())
    await expect(canvas.getByRole('button', { name: /Expand/ })).toBeInTheDocument()
  },
}
