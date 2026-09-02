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
import { darkModeDecorator } from '../_shared'

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

// ---------------------------------------------------------------------------
// DarkMode — the --dz-sidebar-* namespace re-resolved under data-theme="dark"
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    template: `
      <div style="height:32rem;display:flex;background:var(--dz-background);">
        <DzSidebar>
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
        <div style="flex:1;padding:var(--dz-spacing-6);color:var(--dz-foreground);">
          The sidebar paints exclusively from the <code>--dz-sidebar-*</code> namespace, so it
          follows <code>data-theme="dark"</code> with no per-theme component code.
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — expanded / collapsed / active / disabled item (tier C `states` item)
// ---------------------------------------------------------------------------

/**
 * Every state the sidebar publishes, in one canvas.
 *
 * The root carries `data-state="expanded" | "collapsed"`; each `DzSidebarItem`
 * carries `data-state="active" | "inactive"` and adds `aria-current="page"` when
 * active, so route highlighting is announced and not merely painted. A disabled
 * item is announced with `aria-disabled` and removed from the tab order.
 *
 * The play function asserts all four, including the one a screenshot cannot
 * show: that the collapsed rail drops its labels rather than clipping them.
 */
export const States: Story = {
  render: () => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem },
    template: `
      <div style="display:flex;gap:2rem;height:22rem;background:var(--dz-background);">
        <DzSidebar aria-label="Expanded sidebar" data-testid="sb-expanded">
          <DzSidebarHeader>Datazup</DzSidebarHeader>
          <DzSidebarSection title="Workspace">
            <DzSidebarItem :active="true" data-testid="sb-active">Dashboard</DzSidebarItem>
            <DzSidebarItem data-testid="sb-inactive">Sessions</DzSidebarItem>
            <DzSidebarItem disabled data-testid="sb-disabled">Billing (no access)</DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>

        <DzSidebar :collapsed="true" aria-label="Collapsed sidebar" data-testid="sb-collapsed">
          <DzSidebarHeader>D</DzSidebarHeader>
          <DzSidebarSection title="Workspace">
            <DzSidebarItem :active="true" aria-label="Dashboard">
              <template #icon>⌂</template>
              Dashboard
            </DzSidebarItem>
            <DzSidebarItem aria-label="Sessions">
              <template #icon>⧉</template>
              Sessions
            </DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>

        <div style="flex:1;padding:var(--dz-spacing-4);color:var(--dz-foreground);font-size:var(--dz-text-sm);">
          Expanded, collapsed, active, and disabled states side by side.
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const expanded = canvas.getByTestId('sb-expanded')
    const collapsed = canvas.getByTestId('sb-collapsed')

    // Root state is published for the styling contract.
    await expect(expanded).toHaveAttribute('data-state', 'expanded')
    await expect(collapsed).toHaveAttribute('data-state', 'collapsed')
    await expect(expanded).toHaveAttribute('role', 'navigation')

    // Active: announced as the current page AND flagged for CSS.
    const active = canvas.getByTestId('sb-active')
    await expect(active).toHaveAttribute('data-state', 'active')
    await expect(active).toHaveAttribute('aria-current', 'page')

    // Inactive: neither.
    const inactive = canvas.getByTestId('sb-inactive')
    await expect(inactive).toHaveAttribute('data-state', 'inactive')
    await expect(inactive).not.toHaveAttribute('aria-current')
    await expect(inactive).toHaveAttribute('tabindex', '0')

    // Disabled: announced and out of the tab order.
    const disabled = canvas.getByTestId('sb-disabled')
    await expect(disabled).toHaveAttribute('aria-disabled', 'true')
    await expect(disabled).toHaveAttribute('tabindex', '-1')

    // Collapsed: the rail keeps its items reachable and named, but the expanded
    // sidebar's text labels are not rendered into it at all.
    await expect(within(collapsed).getByLabelText('Dashboard')).toBeVisible()
    await expect(within(expanded).getByText('Dashboard')).toBeVisible()
    await expect(within(collapsed).queryByText('Sessions')).toBeNull()
  },
}

// ---------------------------------------------------------------------------
// Accessibility — landmark, current page, keyboard order (tier C item)
// ---------------------------------------------------------------------------

/**
 * What a screen-reader and keyboard user get from the sidebar: a named
 * `navigation` landmark, `aria-current="page"` on exactly one item, a tab order
 * that skips disabled entries, and Enter activation on every live one.
 *
 * The play function walks the sidebar with Tab alone, asserts where focus lands
 * and where it refuses to, and activates an entry from the keyboard — no pointer
 * is used anywhere.
 */
export const Accessibility: Story = {
  name: 'Accessibility: Landmark & Keyboard Order',
  render: () => ({
    components: { DzSidebar, DzSidebarSection, DzSidebarItem },
    setup() {
      const current = ref('dashboard')
      return { current }
    },
    template: `
      <div style="display:flex;height:22rem;background:var(--dz-background);">
        <DzSidebar aria-label="Workspace navigation" data-testid="sb-a11y">
          <DzSidebarSection title="Workspace">
            <DzSidebarItem
              :active="current === 'dashboard'"
              data-testid="sb-k-dashboard"
              @click="current = 'dashboard'"
            >Dashboard</DzSidebarItem>
            <DzSidebarItem
              :active="current === 'sessions'"
              data-testid="sb-k-sessions"
              @click="current = 'sessions'"
            >Sessions</DzSidebarItem>
            <DzSidebarItem disabled data-testid="sb-k-billing">Billing</DzSidebarItem>
            <DzSidebarItem
              :active="current === 'settings'"
              data-testid="sb-k-settings"
              @click="current = 'settings'"
            >Settings</DzSidebarItem>
          </DzSidebarSection>
        </DzSidebar>
        <div style="flex:1;padding:var(--dz-spacing-4);color:var(--dz-foreground);font-size:var(--dz-text-sm);">
          Current route: <strong data-testid="sb-route">{{ current }}</strong>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByTestId('sb-a11y')

    // A named navigation landmark — findable by role, not by class name.
    await expect(canvas.getByRole('navigation', { name: 'Workspace navigation' })).toBe(nav)

    // Exactly one item claims to be the current page.
    await expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    await expect(canvas.getByTestId('sb-k-dashboard')).toHaveAttribute('aria-current', 'page')

    // Tab reaches the first live item.
    for (let i = 0; i < 6 && !nav.contains(document.activeElement); i++)
      await userEvent.tab()
    await expect(canvas.getByTestId('sb-k-dashboard')).toHaveFocus()

    // Tab skips the disabled item entirely — the tab order goes
    // Dashboard → Sessions → Settings.
    await userEvent.tab()
    await expect(canvas.getByTestId('sb-k-sessions')).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByTestId('sb-k-settings')).toHaveFocus()
    await expect(canvas.getByTestId('sb-k-billing')).not.toHaveFocus()

    // Enter activates the focused entry, and `aria-current` moves with it.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('sb-route')).toHaveTextContent('settings'))
    await expect(canvas.getByTestId('sb-k-settings')).toHaveAttribute('aria-current', 'page')
    await expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  },
}

// ---------------------------------------------------------------------------
// Real world — app shell navigation (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * The sidebar doing its actual job: the primary navigation of an application
 * shell, with a brand header, grouped sections, a live route highlight, a
 * user footer, and a collapse control that turns it into an icon rail.
 *
 * The composition is what makes it real — a standalone sidebar never shows that
 * collapsing has to preserve the route highlight and the accessible names while
 * dropping the visible labels.
 */
export const RealWorldAppShell: Story = {
  name: 'Real World: App Shell Navigation',
  render: () => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    setup() {
      const collapsed = ref(false)
      const route = ref('sessions')
      const nav = [
        { key: 'dashboard', label: 'Dashboard', icon: '⌂' },
        { key: 'sessions', label: 'Sessions', icon: '⧉' },
        { key: 'drafts', label: 'Drafts', icon: '✎' },
      ]
      return { collapsed, route, nav }
    },
    template: `
      <div style="display:flex;height:26rem;background:var(--dz-background);">
        <DzSidebar
          v-model:collapsed="collapsed"
          aria-label="Application navigation"
          data-testid="sb-rw"
        >
          <DzSidebarHeader>
            <span style="font-weight:600;color:var(--dz-sidebar-foreground-hover);">
              {{ collapsed ? 'D' : 'Datazup' }}
            </span>
          </DzSidebarHeader>
          <DzSidebarSection title="Workspace">
            <DzSidebarItem
              v-for="entry in nav"
              :key="entry.key"
              :active="route === entry.key"
              :aria-label="entry.label"
              :data-testid="'sb-rw-' + entry.key"
              @click="route = entry.key"
            >
              <template #icon>{{ entry.icon }}</template>
              {{ entry.label }}
            </DzSidebarItem>
          </DzSidebarSection>
          <DzSidebarFooter>
            <button
              type="button"
              data-testid="sb-rw-toggle"
              style="background:transparent;border:none;color:var(--dz-sidebar-foreground);cursor:pointer;font-size:var(--dz-text-xs);"
              @click="collapsed = !collapsed"
            >{{ collapsed ? 'Expand' : 'Collapse' }}</button>
          </DzSidebarFooter>
        </DzSidebar>
        <main style="flex:1;padding:var(--dz-spacing-6);color:var(--dz-foreground);">
          <h2 style="font-size:var(--dz-text-lg);font-weight:600;text-transform:capitalize;" data-testid="sb-rw-title">
            {{ route }}
          </h2>
        </main>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sidebar = canvas.getByTestId('sb-rw')

    // The shell opens on the Sessions route, and the sidebar says so.
    await expect(canvas.getByTestId('sb-rw-title')).toHaveTextContent('sessions')
    await expect(canvas.getByTestId('sb-rw-sessions')).toHaveAttribute('aria-current', 'page')

    // Navigating moves both the highlight and the main region.
    await userEvent.click(canvas.getByTestId('sb-rw-drafts'))
    await waitFor(() => expect(canvas.getByTestId('sb-rw-title')).toHaveTextContent('drafts'))
    await expect(canvas.getByTestId('sb-rw-drafts')).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByTestId('sb-rw-sessions')).not.toHaveAttribute('aria-current')

    // Collapsing to the rail drops the visible labels…
    await userEvent.click(canvas.getByTestId('sb-rw-toggle'))
    await waitFor(() => expect(sidebar).toHaveAttribute('data-state', 'collapsed'))
    await expect(within(sidebar).queryByText('Drafts')).toBeNull()

    // …but keeps the accessible names and the route highlight intact, which is
    // the part an icon rail most often loses.
    await expect(within(sidebar).getByLabelText('Drafts')).toHaveAttribute('aria-current', 'page')
    await expect(within(sidebar).getByLabelText('Dashboard')).toBeVisible()

    // Expanding restores the labels without changing the route.
    await userEvent.click(canvas.getByTestId('sb-rw-toggle'))
    await waitFor(() => expect(sidebar).toHaveAttribute('data-state', 'expanded'))
    await expect(within(sidebar).getByText('Drafts')).toBeVisible()
    await expect(canvas.getByTestId('sb-rw-title')).toHaveTextContent('drafts')
  },
}
