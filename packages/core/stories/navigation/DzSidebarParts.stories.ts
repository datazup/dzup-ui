import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
} from '../../src/components/navigation'
import { darkModeDecorator } from '../_shared'

/**
 * DzSidebar compound sub-parts: DzSidebarItem, DzSidebarHeader, DzSidebarFooter,
 * and DzSidebarSection.
 *
 * DzSidebarItem is a polymorphic navigation item that supports active/disabled
 * states, icon, label, and badge slots. It renders as `<button>`, `<a>`, or
 * `<RouterLink>` depending on props, and reads collapsed state from the parent
 * DzSidebar context via inject (ADR-08).
 *
 * DzSidebarHeader and DzSidebarFooter are structural slots that receive a
 * `{ collapsed }` slot prop so their content can adapt to collapsed mode.
 *
 * DzSidebarSection is an optional titled group wrapper for DzSidebarItems. It
 * supports a collapsible prop and hides its title text when the sidebar is
 * collapsed.
 *
 * All four subparts receive visual context (collapsed, activeStyle) exclusively
 * from the DzSidebar root via inject — they should never be used standalone.
 */

const meta = {
  title: 'Core/Navigation/DzSidebarParts',
  component: DzSidebarItem,
  subcomponents: { DzSidebarHeader, DzSidebarFooter, DzSidebarSection },
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Whether this item is currently active/selected',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether this item is disabled',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    href: {
      control: 'text',
      description: 'URL to navigate to (renders as <a>)',
      table: { category: 'Behavior' },
    },
    as: {
      control: 'text',
      description: 'Element or component to render as (overrides polymorphic detection)',
      table: { category: 'Behavior' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the item',
      table: { category: 'Accessibility' },
    },
  },
} satisfies Meta<typeof DzSidebarItem>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Full sidebar anatomy using all 4 subparts
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    template: `
      <div class="h-[400px] flex">
        <DzSidebar aria-label="App navigation">
          <template #default>
            <DzSidebarHeader>
              <template #default="{ collapsed }">
                <div class="flex items-center gap-2 px-4 py-3">
                  <div class="w-7 h-7 rounded-md bg-[var(--dz-primary)] shrink-0" />
                  <span v-if="!collapsed" class="font-semibold text-sm text-[var(--dz-sidebar-foreground)]">
                    Datazup
                  </span>
                </div>
              </template>
            </DzSidebarHeader>

            <DzSidebarSection title="Main">
              <DzSidebarItem active>
                <template #icon>
                  <span class="w-4 h-4 flex items-center justify-center text-xs">H</span>
                </template>
                Home
              </DzSidebarItem>
              <DzSidebarItem>
                <template #icon>
                  <span class="w-4 h-4 flex items-center justify-center text-xs">U</span>
                </template>
                Users
                <template #badge>
                  <span class="text-xs px-1.5 py-0.5 rounded-full bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]">
                    3
                  </span>
                </template>
              </DzSidebarItem>
              <DzSidebarItem>
                <template #icon>
                  <span class="w-4 h-4 flex items-center justify-center text-xs">A</span>
                </template>
                Analytics
              </DzSidebarItem>
            </DzSidebarSection>

            <DzSidebarSection title="Settings">
              <DzSidebarItem>
                <template #icon>
                  <span class="w-4 h-4 flex items-center justify-center text-xs">S</span>
                </template>
                Settings
              </DzSidebarItem>
              <DzSidebarItem disabled>
                <template #icon>
                  <span class="w-4 h-4 flex items-center justify-center text-xs">X</span>
                </template>
                Admin (No Access)
              </DzSidebarItem>
            </DzSidebarSection>

            <DzSidebarFooter>
              <template #default="{ collapsed }">
                <div class="flex items-center gap-2 px-4 py-3">
                  <div class="w-7 h-7 rounded-full bg-[var(--dz-muted)] shrink-0" />
                  <span v-if="!collapsed" class="text-sm text-[var(--dz-sidebar-foreground)]">
                    ninel@datazup.com
                  </span>
                </div>
              </template>
            </DzSidebarFooter>
          </template>
        </DzSidebar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Active item advertises aria-current="page".
    const homeItem = canvas.getByRole('button', { name: /Home/ })
    await expect(homeItem).toHaveAttribute('aria-current', 'page')

    // Inactive items do not carry aria-current.
    const usersItem = canvas.getByRole('button', { name: /Users/ })
    await expect(usersItem).not.toHaveAttribute('aria-current')

    // Disabled item carries aria-disabled.
    const adminItem = canvas.getByRole('button', { name: /Admin/ })
    await expect(adminItem).toHaveAttribute('aria-disabled', 'true')
  },
}

// ---------------------------------------------------------------------------
// CompoundComposition: Annotated anatomy of the full sidebar tree
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound Composition',
  render: () => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    template: `
      <div class="flex gap-8 items-start flex-wrap">
        <!-- Live sidebar -->
        <div class="h-[400px] flex">
          <DzSidebar aria-label="Composed sidebar">
            <template #default>
              <!-- DzSidebarHeader: branding / logo row -->
              <DzSidebarHeader>
                <template #default="{ collapsed }">
                  <div class="flex items-center gap-2 px-4 py-3">
                    <div class="w-7 h-7 rounded-md bg-[var(--dz-primary)] shrink-0" />
                    <span v-if="!collapsed" class="font-semibold text-sm text-[var(--dz-sidebar-foreground)]">App</span>
                  </div>
                </template>
              </DzSidebarHeader>

              <!-- DzSidebarSection: titled item group -->
              <DzSidebarSection title="Navigate">
                <!-- DzSidebarItem: polymorphic nav entry -->
                <DzSidebarItem active>
                  <template #icon><span class="w-4 h-4 inline-flex items-center justify-center text-xs font-mono">H</span></template>
                  Home
                </DzSidebarItem>
                <DzSidebarItem>
                  <template #icon><span class="w-4 h-4 inline-flex items-center justify-center text-xs font-mono">D</span></template>
                  Data
                </DzSidebarItem>
              </DzSidebarSection>

              <!-- DzSidebarFooter: user / bottom row -->
              <DzSidebarFooter>
                <template #default="{ collapsed }">
                  <div class="flex items-center gap-2 px-4 py-3">
                    <div class="w-6 h-6 rounded-full bg-[var(--dz-muted)] shrink-0" />
                    <span v-if="!collapsed" class="text-xs text-[var(--dz-sidebar-foreground)]">User</span>
                  </div>
                </template>
              </DzSidebarFooter>
            </template>
          </DzSidebar>
        </div>

        <!-- Anatomy legend -->
        <dl class="text-sm space-y-2 max-w-xs">
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzSidebar</dt>
            <dd class="text-[var(--dz-muted-foreground)]">Root — provides collapsed/activeStyle context via inject (ADR-08). Renders the outer shell with header, body, and footer regions.</dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzSidebarHeader</dt>
            <dd class="text-[var(--dz-muted-foreground)]">Sticky top region. Slot receives <code>{ collapsed }</code> so branding can adapt.</dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzSidebarSection</dt>
            <dd class="text-[var(--dz-muted-foreground)]">Optional titled group. Supports <code>collapsible</code> + <code>defaultOpen</code>. Title is hidden when sidebar is collapsed.</dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzSidebarItem</dt>
            <dd class="text-[var(--dz-muted-foreground)]">Polymorphic nav row. Renders as <code>&lt;button&gt;</code>, <code>&lt;a&gt;</code>, or <code>&lt;RouterLink&gt;</code>. Slots: icon, default (label), badge.</dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzSidebarFooter</dt>
            <dd class="text-[var(--dz-muted-foreground)]">Sticky bottom region. Slot receives <code>{ collapsed }</code> — same pattern as header.</dd>
          </div>
        </dl>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// RealWorld: Realistic sidebar nav with multiple sections and interactive state
// ---------------------------------------------------------------------------

export const RealWorld: Story = {
  name: 'Real-World Sidebar Nav',
  render: () => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    data() {
      return { active: 'dashboard' }
    },
    template: `
      <div class="h-[400px] flex">
        <DzSidebar aria-label="Main app navigation">
          <template #default="{ collapsed }">
            <DzSidebarHeader>
              <template #default="{ collapsed }">
                <div class="flex items-center gap-2 px-4 py-3">
                  <div class="w-7 h-7 rounded-md bg-[var(--dz-primary)] shrink-0 flex items-center justify-center text-[var(--dz-primary-foreground)] font-bold text-xs">
                    D
                  </div>
                  <span v-if="!collapsed" class="font-semibold text-sm text-[var(--dz-sidebar-foreground)]">
                    Datazup
                  </span>
                </div>
              </template>
            </DzSidebarHeader>

            <DzSidebarSection title="Workspace">
              <DzSidebarItem
                :active="active === 'dashboard'"
                @click="active = 'dashboard'"
              >
                <template #icon><span class="w-4 h-4 inline-flex items-center justify-center">⊞</span></template>
                Dashboard
              </DzSidebarItem>
              <DzSidebarItem
                :active="active === 'projects'"
                @click="active = 'projects'"
              >
                <template #icon><span class="w-4 h-4 inline-flex items-center justify-center">⬡</span></template>
                Projects
                <template #badge>
                  <span class="text-xs px-1.5 rounded-full bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]">5</span>
                </template>
              </DzSidebarItem>
              <DzSidebarItem
                :active="active === 'analytics'"
                @click="active = 'analytics'"
              >
                <template #icon><span class="w-4 h-4 inline-flex items-center justify-center">◈</span></template>
                Analytics
              </DzSidebarItem>
            </DzSidebarSection>

            <DzSidebarSection title="Team">
              <DzSidebarItem
                :active="active === 'members'"
                @click="active = 'members'"
              >
                <template #icon><span class="w-4 h-4 inline-flex items-center justify-center">◎</span></template>
                Members
              </DzSidebarItem>
              <DzSidebarItem
                :active="active === 'roles'"
                @click="active = 'roles'"
              >
                <template #icon><span class="w-4 h-4 inline-flex items-center justify-center">◇</span></template>
                Roles
              </DzSidebarItem>
              <DzSidebarItem disabled>
                <template #icon><span class="w-4 h-4 inline-flex items-center justify-center">⛔</span></template>
                Billing (Upgrade)
              </DzSidebarItem>
            </DzSidebarSection>

            <DzSidebarFooter>
              <template #default="{ collapsed }">
                <div class="flex items-center gap-2 px-4 py-3 border-t border-[var(--dz-sidebar-border)]">
                  <div class="w-7 h-7 rounded-full bg-[var(--dz-muted)] shrink-0 flex items-center justify-center text-xs font-semibold text-[var(--dz-muted-foreground)]">
                    N
                  </div>
                  <div v-if="!collapsed" class="min-w-0">
                    <p class="text-xs font-medium text-[var(--dz-sidebar-foreground)] truncate">Ninel Hodzic</p>
                    <p class="text-xs text-[var(--dz-muted-foreground)] truncate">ninel@datazup.com</p>
                  </div>
                </div>
              </template>
            </DzSidebarFooter>
          </template>
        </DzSidebar>

        <div class="flex-1 p-6 text-sm text-[var(--dz-muted-foreground)]">
          Active: <strong class="text-[var(--dz-foreground)]">{{ active }}</strong>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dashboard = canvas.getByRole('button', { name: /Dashboard/ })
    const projects = canvas.getByRole('button', { name: /Projects/ })

    // Dashboard starts active.
    await expect(dashboard).toHaveAttribute('aria-current', 'page')
    await expect(projects).not.toHaveAttribute('aria-current')

    // Clicking Projects moves the active marker.
    await userEvent.click(projects)
    await waitFor(() => expect(projects).toHaveAttribute('aria-current', 'page'))
    await expect(dashboard).not.toHaveAttribute('aria-current')
  },
}

// ---------------------------------------------------------------------------
// DarkMode: all four subparts previewed on a forced-dark surface
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzSidebar, DzSidebarHeader, DzSidebarSection, DzSidebarItem, DzSidebarFooter },
    template: `
      <div class="h-[400px] flex">
        <DzSidebar aria-label="Dark mode app navigation">
          <template #default>
            <DzSidebarHeader>
              <template #default="{ collapsed }">
                <div class="flex items-center gap-2 px-4 py-3">
                  <div class="w-7 h-7 rounded-md bg-[var(--dz-primary)] shrink-0" />
                  <span v-if="!collapsed" class="font-semibold text-sm text-[var(--dz-sidebar-foreground)]">
                    Datazup
                  </span>
                </div>
              </template>
            </DzSidebarHeader>

            <DzSidebarSection title="Main">
              <DzSidebarItem active>
                <template #icon>
                  <span class="w-4 h-4 flex items-center justify-center text-xs">H</span>
                </template>
                Home
              </DzSidebarItem>
              <DzSidebarItem>
                <template #icon>
                  <span class="w-4 h-4 flex items-center justify-center text-xs">U</span>
                </template>
                Users
                <template #badge>
                  <span class="text-xs px-1.5 py-0.5 rounded-full bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]">
                    3
                  </span>
                </template>
              </DzSidebarItem>
              <DzSidebarItem disabled>
                <template #icon>
                  <span class="w-4 h-4 flex items-center justify-center text-xs">X</span>
                </template>
                Admin (No Access)
              </DzSidebarItem>
            </DzSidebarSection>

            <DzSidebarFooter>
              <template #default="{ collapsed }">
                <div class="flex items-center gap-2 px-4 py-3">
                  <div class="w-7 h-7 rounded-full bg-[var(--dz-muted)] shrink-0" />
                  <span v-if="!collapsed" class="text-sm text-[var(--dz-sidebar-foreground)]">
                    ninel@datazup.com
                  </span>
                </div>
              </template>
            </DzSidebarFooter>
          </template>
        </DzSidebar>
      </div>
    `,
  }),
}
