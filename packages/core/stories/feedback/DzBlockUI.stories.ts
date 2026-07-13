import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { DzButton } from '../../src/components/buttons'
import { DzBlockUI } from '../../src/components/feedback'
import { darkModeDecorator } from '../_shared'

/**
 * DzBlockUI masks and disables an arbitrary region during async work — the
 * "freeze this panel while saving" overlay.
 *
 * Unlike `DzAsyncBoundary` (which swaps the subtree for a fallback), DzBlockUI
 * dims the content **in place**, preserving its DOM state and scroll position.
 * While blocked it captures pointer events, sets `aria-busy`, makes the content
 * `inert` (so keyboard users cannot tab into the disabled controls), and moves
 * focus into the overlay — restoring it on unblock. Blocked state is controlled
 * via `v-model:blocked`.
 */
const meta = {
  title: 'Core/Feedback/DzBlockUI',
  component: DzBlockUI,
  tags: ['autodocs', 'status:beta'],
  argTypes: {
    // Behavior
    blocked: {
      control: 'boolean',
      description: 'Whether the region is masked (v-model:blocked)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    fullScreen: {
      control: 'boolean',
      description: 'Mask the whole viewport instead of just the slotted region',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Appearance
    message: {
      control: 'text',
      description: 'Optional message beneath the default spinner',
      table: { category: 'Appearance' },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Default spinner tone',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    spinnerSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Default spinner size',
      table: { category: 'Appearance', defaultValue: { summary: 'lg' } },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the blocked region',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    blocked: false,
    fullScreen: false,
    tone: 'primary',
    spinnerSize: 'lg',
  },
  decorators: [darkModeDecorator],
} satisfies Meta<typeof DzBlockUI>

export default meta
type Story = StoryObj<typeof meta>

// A small demo panel reused across stories.
const panelTemplate = `
  <div style="max-width: 24rem; border border-[var(--dz-border)]: 1px solid var(--dz-border); border-radius: var(--dz-radius-md); padding: var(--dz-spacing-4); background: var(--dz-surface)">
    <h3 style="margin: 0 0 var(--dz-spacing-3); font-size: var(--dz-text-base); color: var(--dz-foreground)">Profile</h3>
    <label style="display: block; margin-bottom: var(--dz-spacing-2); font-size: var(--dz-text-sm); color: var(--dz-muted-foreground)">
      Name
      <input class="dz-native-field-sm" value="Ada Lovelace" />
    </label>
    <label style="display: block; margin-bottom: var(--dz-spacing-3); font-size: var(--dz-text-sm); color: var(--dz-muted-foreground)">
      Email
      <input class="dz-native-field-sm" value="ada@example.com" />
    </label>
    <DzButton tone="primary" size="sm">Save</DzButton>
  </div>
`

// ---------------------------------------------------------------------------
// PanelBlock — toggle a scoped mask over a panel
// ---------------------------------------------------------------------------

export const PanelBlock: Story = {
  render: args => ({
    components: { DzBlockUI, DzButton },
    setup() {
      const blocked = ref(args.blocked)
      return { args, blocked }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--dz-spacing-4); align-items: flex-start">
        <DzButton variant="outline" size="sm" @click="blocked = !blocked">
          {{ blocked ? 'Unblock' : 'Block' }} panel
        </DzButton>
        <DzBlockUI v-bind="args" v-model:blocked="blocked" aria-label="Profile panel">
          ${panelTemplate}
        </DzBlockUI>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// WithMessage — auto-unblocking save simulation with a message
// ---------------------------------------------------------------------------

export const WithMessage: Story = {
  args: { message: 'Saving changes…' },
  render: args => ({
    components: { DzBlockUI, DzButton },
    setup() {
      const blocked = ref(false)
      function save() {
        blocked.value = true
        setTimeout(() => {
          blocked.value = false
        }, 2000)
      }
      return { args, blocked, save }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--dz-spacing-4); align-items: flex-start">
        <DzButton tone="primary" size="sm" :disabled="blocked" @click="save">Simulate save</DzButton>
        <DzBlockUI v-bind="args" v-model:blocked="blocked" aria-label="Profile panel">
          ${panelTemplate}
        </DzBlockUI>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// FullScreen — mask the entire viewport
// ---------------------------------------------------------------------------

export const FullScreen: Story = {
  args: { fullScreen: true, message: 'Loading workspace…' },
  render: args => ({
    components: { DzBlockUI, DzButton },
    setup() {
      const blocked = ref(false)
      function block() {
        blocked.value = true
        setTimeout(() => {
          blocked.value = false
        }, 2000)
      }
      return { args, blocked, block }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--dz-spacing-4); align-items: flex-start">
        <p style="margin: 0; font-size: var(--dz-text-sm); color: var(--dz-muted-foreground)">
          Blocks the whole viewport for 2 seconds.
        </p>
        <DzButton tone="primary" size="sm" :disabled="blocked" @click="block">Block viewport</DzButton>
        <DzBlockUI v-bind="args" v-model:blocked="blocked" aria-label="Workspace">
          <span style="font-size: var(--dz-text-sm); color: var(--dz-foreground)">Page content stays mounted underneath.</span>
        </DzBlockUI>
      </div>
    `,
  }),
}
