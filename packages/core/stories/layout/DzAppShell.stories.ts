import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { RESPONSIVE_VIEWPORTS } from '../_shared'
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
  tags: ['autodocs', 'status:stable'],
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

// ---------------------------------------------------------------------------
// Real World: Dashboard (TASK-7.C) — a realistic full-page composition with a
// navigation sidebar, header chrome, and a content area of stat cards + a panel.
// ---------------------------------------------------------------------------

export const RealWorldDashboard: Story = {
  name: 'Real World: Dashboard',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { DzAppShell },
    data() {
      return {
        nav: [
          { label: 'Overview', active: true },
          { label: 'Analytics', active: false },
          { label: 'Reports', active: false },
          { label: 'Settings', active: false },
        ],
        stats: [
          { label: 'Revenue', value: '$24,500', delta: '+12.5%' },
          { label: 'Active users', value: '1,234', delta: '+3.1%' },
          { label: 'Orders', value: '567', delta: '-1.8%' },
          { label: 'Conversion', value: '4.7%', delta: '+0.4%' },
        ],
      }
    },
    template: `
      <DzAppShell aria-label="Analytics dashboard" style="height:32rem;">
        <template #sidebar>
          <aside style="width:16rem;height:100%;background:var(--dz-sidebar-bg);color:var(--dz-sidebar-foreground);padding:var(--dz-spacing-4);display:flex;flex-direction:column;gap:var(--dz-spacing-4);">
            <div style="font-weight:700;font-size:var(--dz-text-lg);">Acme Inc.</div>
            <nav aria-label="Primary" style="display:flex;flex-direction:column;gap:var(--dz-spacing-1);">
              <a v-for="item in nav" :key="item.label" href="#"
                :aria-current="item.active ? 'page' : undefined"
                :style="{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--dz-radius-md)',
                  fontSize: 'var(--dz-text-sm)',
                  textDecoration: 'none',
                  color: item.active ? 'var(--dz-primary-foreground)' : 'inherit',
                  background: item.active ? 'var(--dz-primary)' : 'transparent',
                }">
                {{ item.label }}
              </a>
            </nav>
          </aside>
        </template>
        <template #header-start>
          <button type="button" aria-label="Toggle sidebar" style="background:transparent;border:none;color:var(--dz-muted-foreground);cursor:pointer;padding:var(--dz-spacing-2);">☰</button>
        </template>
        <template #header>
          <span style="color:var(--dz-foreground);font-weight:600;">Overview</span>
        </template>
        <template #header-end>
          <div style="display:flex;align-items:center;gap:var(--dz-spacing-3);">
            <button type="button" aria-label="Notifications" style="background:transparent;border:none;color:var(--dz-muted-foreground);cursor:pointer;">🔔</button>
            <div style="width:2rem;height:2rem;border-radius:9999px;background:var(--dz-primary);color:var(--dz-primary-foreground);display:flex;align-items:center;justify-content:center;font-size:var(--dz-text-sm);font-weight:600;">JD</div>
          </div>
        </template>

        <div style="padding:var(--dz-spacing-6);display:flex;flex-direction:column;gap:var(--dz-spacing-6);">
          <section aria-label="Key metrics" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:var(--dz-spacing-4);">
            <div v-for="s in stats" :key="s.label"
              style="border:1px solid var(--dz-border);border-radius:var(--dz-radius-lg);padding:var(--dz-spacing-4);background:var(--dz-surface);">
              <p style="font-size:var(--dz-text-sm);color:var(--dz-muted-foreground);margin:0;">{{ s.label }}</p>
              <p style="font-size:var(--dz-text-2xl);font-weight:700;margin:0.25rem 0 0;color:var(--dz-foreground);">{{ s.value }}</p>
              <p :style="{ fontSize: 'var(--dz-text-xs)', margin: '0.25rem 0 0', color: s.delta.startsWith('-') ? 'var(--dz-danger)' : 'var(--dz-success)' }">
                {{ s.delta }} vs last week
              </p>
            </div>
          </section>
          <section aria-label="Recent activity" style="border:1px solid var(--dz-border);border-radius:var(--dz-radius-lg);background:var(--dz-surface);">
            <header style="padding:var(--dz-spacing-4);border-bottom:1px solid var(--dz-border);font-weight:600;color:var(--dz-foreground);">Recent activity</header>
            <ul style="margin:0;padding:0;list-style:none;">
              <li v-for="i in 4" :key="i"
                style="padding:var(--dz-spacing-3) var(--dz-spacing-4);border-bottom:1px solid var(--dz-border);font-size:var(--dz-text-sm);color:var(--dz-muted-foreground);">
                Event {{ i }} — processed {{ i * 7 }} records
              </li>
            </ul>
          </section>
        </div>
      </DzAppShell>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Responsive (TASK-7.D) — the shell at three breakpoints. On narrow viewports
// apps typically collapse/overlay the sidebar; switch via the Viewport toolbar.
// ---------------------------------------------------------------------------

function responsiveShell() {
  return {
    components: { DzAppShell },
    template: `
      <DzAppShell aria-label="Responsive shell" style="height:28rem;">
        <template #sidebar>
          <aside style="width:14rem;height:100%;background:var(--dz-sidebar-bg);color:var(--dz-sidebar-foreground);padding:var(--dz-spacing-4);">
            <div style="font-weight:700;margin-bottom:var(--dz-spacing-3);">Acme Inc.</div>
            <nav aria-label="Primary" style="display:flex;flex-direction:column;gap:var(--dz-spacing-1);font-size:var(--dz-text-sm);">
              <a href="#" style="padding:0.5rem 0.75rem;border-radius:var(--dz-radius-md);background:var(--dz-primary);color:var(--dz-primary-foreground);text-decoration:none;">Overview</a>
              <a href="#" style="padding:0.5rem 0.75rem;border-radius:var(--dz-radius-md);text-decoration:none;color:inherit;">Reports</a>
              <a href="#" style="padding:0.5rem 0.75rem;border-radius:var(--dz-radius-md);text-decoration:none;color:inherit;">Settings</a>
            </nav>
          </aside>
        </template>
        <template #header-start>
          <button type="button" aria-label="Toggle sidebar" style="background:transparent;border:none;color:var(--dz-muted-foreground);cursor:pointer;padding:var(--dz-spacing-2);">☰</button>
        </template>
        <template #header>
          <span style="color:var(--dz-foreground);font-weight:600;">Overview</span>
        </template>
        <div style="padding:var(--dz-spacing-4);color:var(--dz-foreground);">
          Below the <code>md</code> breakpoint the 14rem sidebar crowds the content — production apps
          move it behind the <code>header-start</code> toggle and overlay it. The header and main
          chrome stay intact at every width.
        </div>
      </DzAppShell>
    `,
  }
}

const responsiveParameters = {
  viewport: { options: RESPONSIVE_VIEWPORTS },
  layout: 'fullscreen',
} as const

export const ResponsiveMobile: Story = {
  name: 'Responsive: Mobile',
  parameters: responsiveParameters,
  globals: { viewport: { value: 'mobile' } },
  render: responsiveShell,
}

export const ResponsiveTablet: Story = {
  name: 'Responsive: Tablet',
  parameters: responsiveParameters,
  globals: { viewport: { value: 'tablet' } },
  render: responsiveShell,
}

export const ResponsiveDesktop: Story = {
  name: 'Responsive: Desktop',
  parameters: responsiveParameters,
  globals: { viewport: { value: 'desktop' } },
  render: responsiveShell,
}
