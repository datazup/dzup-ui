import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzTabContent, DzTabList, DzTabs, DzTabTrigger } from '../../src/components/navigation'

/**
 * DzTabs compound sub-parts: DzTabList, DzTabTrigger, and DzTabContent.
 *
 * DzTabList is the keyboard-navigable tab strip built on Reka UI TabsList. It
 * implements the APG roving tabindex pattern so exactly one trigger is always
 * reachable via Tab, with Arrow keys moving focus within the list.
 *
 * DzTabTrigger is an individual tab button built on Reka UI TabsTrigger. It
 * reads variant, size, and tone from the parent DzTabs context (ADR-08) and
 * supports an optional `closable` prop that surfaces a close/remove button.
 *
 * DzTabContent is a tab panel built on Reka UI TabsContent. It is rendered (or
 * hidden) based on whether its `value` matches the active tab. The `forceMount`
 * prop keeps content mounted even when the panel is inactive — useful for SEO
 * or preserving expensive subtree state.
 *
 * All three subparts must be descendants of a DzTabs root.
 */

const meta = {
  title: 'Core/Navigation/DzTabsParts',
  component: DzTabList,
  subcomponents: { DzTabTrigger, DzTabContent },
  tags: ['autodocs', 'status:stable'],
  decorators: [darkModeDecorator],
  argTypes: {
    loop: {
      control: 'boolean',
      description: 'Whether Arrow-key focus wraps around at the ends of the tab list',
      table: { category: 'DzTabList / Behavior', defaultValue: { summary: 'true' } },
    },
  },
} satisfies Meta<typeof DzTabList>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: 3-tab setup with content panels
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    data() {
      return { tab: 'overview' }
    },
    template: `
      <DzTabs v-model="tab" aria-label="Product tabs">
        <DzTabList>
          <DzTabTrigger value="overview">Overview</DzTabTrigger>
          <DzTabTrigger value="features">Features</DzTabTrigger>
          <DzTabTrigger value="pricing">Pricing</DzTabTrigger>
        </DzTabList>

        <DzTabContent value="overview">
          <div class="p-4 text-sm text-[var(--dz-foreground)]">
            <p>Product overview — introductory description and hero image go here.</p>
          </div>
        </DzTabContent>

        <DzTabContent value="features">
          <div class="p-4 text-sm text-[var(--dz-foreground)]">
            <ul class="list-disc list-inside space-y-1">
              <li>Unlimited projects</li>
              <li>Real-time collaboration</li>
              <li>Advanced analytics</li>
            </ul>
          </div>
        </DzTabContent>

        <DzTabContent value="pricing">
          <div class="p-4 text-sm text-[var(--dz-foreground)]">
            <p>Free tier · Pro $12/mo · Enterprise — contact us.</p>
          </div>
        </DzTabContent>
      </DzTabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const overview = canvas.getByRole('tab', { name: 'Overview' })
    const features = canvas.getByRole('tab', { name: 'Features' })

    // Overview is active by default.
    await expect(overview).toHaveAttribute('aria-selected', 'true')
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(/overview/i)

    // Clicking Features activates it and swaps the panel.
    await userEvent.click(features)
    await waitFor(() => expect(features).toHaveAttribute('aria-selected', 'true'))
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(/unlimited projects/i)
  },
}

// ---------------------------------------------------------------------------
// CompoundComposition: Annotated anatomy of the full tabs tree
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound Composition',
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    data() {
      return { tab: 'alpha' }
    },
    template: `
      <div class="flex flex-col gap-6">
        <!-- Live tabs -->
        <DzTabs v-model="tab" aria-label="Anatomy demo">
          <DzTabList>
            <DzTabTrigger value="alpha">Alpha</DzTabTrigger>
            <DzTabTrigger value="beta">Beta</DzTabTrigger>
            <DzTabTrigger value="gamma" disabled>Gamma (disabled)</DzTabTrigger>
          </DzTabList>

          <DzTabContent value="alpha">
            <div class="p-4 text-sm text-[var(--dz-foreground)]">Alpha panel content.</div>
          </DzTabContent>
          <DzTabContent value="beta">
            <div class="p-4 text-sm text-[var(--dz-foreground)]">Beta panel content.</div>
          </DzTabContent>
          <DzTabContent value="gamma">
            <div class="p-4 text-sm text-[var(--dz-foreground)]">Gamma panel content (unreachable via keyboard when disabled).</div>
          </DzTabContent>
        </DzTabs>

        <!-- Anatomy legend -->
        <dl class="text-sm space-y-2 max-w-md border-t border-[var(--dz-border)] pt-4">
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzTabs</dt>
            <dd class="text-[var(--dz-muted-foreground)]">
              Root compound component. Provides variant, size, tone, orientation, and the active
              modelValue to children via inject (ADR-08). Wraps Reka UI TabsRoot.
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzTabList</dt>
            <dd class="text-[var(--dz-muted-foreground)]">
              Tab strip container with <code>role="tablist"</code>. Implements the APG roving
              tabindex so exactly one trigger holds <code>tabindex="0"</code> at all times.
              Arrow keys move focus; Tab/Shift+Tab exit the list.
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzTabTrigger</dt>
            <dd class="text-[var(--dz-muted-foreground)]">
              Individual tab button with <code>role="tab"</code>. Inherits variant and size from
              context. Supports <code>disabled</code> (skipped by keyboard) and <code>closable</code>
              (renders a remove button, emits <code>close</code> on DzTabs root).
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-[var(--dz-foreground)]">DzTabContent</dt>
            <dd class="text-[var(--dz-muted-foreground)]">
              Tab panel with <code>role="tabpanel"</code>. Visible when its <code>value</code>
              matches the root <code>modelValue</code>. Use <code>forceMount</code> to keep content
              in the DOM when inactive (e.g. for SEO or expensive trees).
            </dd>
          </div>
        </dl>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: role/tabindex explanation with live demo
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility (ARIA Roles)',
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    data() {
      return { tab: 'profile' }
    },
    template: `
      <div class="flex flex-col gap-6">
        <!--
          Keyboard contract (APG Tabs pattern):
            Tab           — enters / exits the tab list on the active trigger
            Left / Right  — moves focus between triggers (horizontal orientation)
            Up / Down     — moves focus between triggers (vertical orientation)
            Home          — focuses first enabled trigger
            End           — focuses last enabled trigger
            Enter / Space — activates the focused trigger (manual mode only)
        -->
        <DzTabs v-model="tab" aria-label="Account settings">
          <DzTabList aria-label="Account settings tabs">
            <DzTabTrigger value="profile">
              Profile
            </DzTabTrigger>
            <DzTabTrigger value="security">
              Security
            </DzTabTrigger>
            <DzTabTrigger value="notifications">
              Notifications
            </DzTabTrigger>
            <DzTabTrigger value="billing" disabled>
              Billing (locked)
            </DzTabTrigger>
          </DzTabList>

          <DzTabContent value="profile">
            <div class="p-4 text-sm text-[var(--dz-foreground)] space-y-1">
              <p><strong>role="tabpanel"</strong> — associated with the Profile trigger via aria-labelledby (managed by Reka UI).</p>
              <p class="text-[var(--dz-muted-foreground)]">Profile form content goes here.</p>
            </div>
          </DzTabContent>

          <DzTabContent value="security">
            <div class="p-4 text-sm text-[var(--dz-foreground)] space-y-1">
              <p><strong>role="tabpanel"</strong> — Security panel.</p>
              <p class="text-[var(--dz-muted-foreground)]">Password and 2FA settings go here.</p>
            </div>
          </DzTabContent>

          <DzTabContent value="notifications">
            <div class="p-4 text-sm text-[var(--dz-foreground)] space-y-1">
              <p><strong>role="tabpanel"</strong> — Notifications panel.</p>
              <p class="text-[var(--dz-muted-foreground)]">Email and push notification preferences go here.</p>
            </div>
          </DzTabContent>

          <DzTabContent value="billing">
            <div class="p-4 text-sm text-[var(--dz-foreground)]">Billing panel (unreachable — trigger is disabled).</div>
          </DzTabContent>
        </DzTabs>

        <!-- ARIA role summary -->
        <table class="text-xs border-collapse w-full max-w-lg border-t border-[var(--dz-border)] pt-2">
          <caption class="text-sm font-semibold text-[var(--dz-foreground)] text-left pb-2 pt-4">
            ARIA role map
          </caption>
          <thead>
            <tr class="text-[var(--dz-muted-foreground)]">
              <th class="text-left py-1 pr-4">Part</th>
              <th class="text-left py-1 pr-4">Element</th>
              <th class="text-left py-1">Role</th>
            </tr>
          </thead>
          <tbody class="text-[var(--dz-foreground)]">
            <tr>
              <td class="py-1 pr-4 font-mono">DzTabs</td>
              <td class="py-1 pr-4"><code>&lt;div&gt;</code></td>
              <td class="py-1">—</td>
            </tr>
            <tr>
              <td class="py-1 pr-4 font-mono">DzTabList</td>
              <td class="py-1 pr-4"><code>&lt;div&gt;</code></td>
              <td class="py-1"><code>tablist</code></td>
            </tr>
            <tr>
              <td class="py-1 pr-4 font-mono">DzTabTrigger</td>
              <td class="py-1 pr-4"><code>&lt;button&gt;</code></td>
              <td class="py-1"><code>tab</code> + roving <code>tabindex</code></td>
            </tr>
            <tr>
              <td class="py-1 pr-4 font-mono">DzTabContent</td>
              <td class="py-1 pr-4"><code>&lt;div&gt;</code></td>
              <td class="py-1"><code>tabpanel</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const profileTab = canvas.getByRole('tab', { name: 'Profile' })
    const securityTab = canvas.getByRole('tab', { name: 'Security' })
    const billingTab = canvas.getByRole('tab', { name: /billing/i })

    // Profile is the initial active tab.
    await expect(profileTab).toHaveAttribute('aria-selected', 'true')

    // tablist element exists and has the correct role.
    const tablist = canvas.getByRole('tablist')
    await expect(tablist).toBeInTheDocument()

    // Disabled trigger is aria-disabled and cannot be selected.
    await expect(billingTab).toHaveAttribute('aria-disabled', 'true')

    // Arrow key moves focus: click Profile, then ArrowRight lands on Security.
    await userEvent.click(profileTab)
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(securityTab).toHaveAttribute('aria-selected', 'true'))

    // Shift+Tab exits the tablist without selecting another tab.
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(/security/i)
  },
}
