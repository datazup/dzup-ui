import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { DzPageHero } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

/**
 * DzPageHero is a dark gradient hero band for top-level views: eyebrow,
 * gradient h1, description, meta row, and a glass-treated actions cluster.
 * Extracted from docs-app's DocsPageHero so every app on the neural-indigo
 * preset can share the band. All styling keys off `--dz-page-hero-*` tokens
 * with `--dz-auth-brand-*` fallbacks.
 */
const meta = {
  title: 'Core/Layout/DzPageHero',
  component: DzPageHero,
  tags: ['autodocs', 'status:beta'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main heading, rendered as a level-1 heading with gradient text',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Supporting copy under the heading; the description slot overrides it',
      table: { category: 'Content' },
    },
    eyebrow: {
      control: 'text',
      description: 'Uppercase kicker above the heading',
      table: { category: 'Content' },
    },
  },
  args: {
    title: 'Library',
  },
} satisfies Meta<typeof DzPageHero>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Bare
// ---------------------------------------------------------------------------

export const Bare: Story = {
  args: { title: 'Library' },
  render: args => ({
    components: { DzPageHero },
    setup: () => ({ args }),
    template: `<DzPageHero v-bind="args" />`,
  }),
}

// ---------------------------------------------------------------------------
// Full (eyebrow + description + meta)
// ---------------------------------------------------------------------------

export const Full: Story = {
  args: {
    title: 'Library',
    eyebrow: 'Docs',
    description: 'Every document in this workspace, with coverage and freshness at a glance.',
  },
  render: args => ({
    components: { DzPageHero },
    setup: () => ({ args }),
    template: `
      <DzPageHero v-bind="args">
        <template #meta>
          <span>128 documents</span>
          <span>12 stale</span>
          <span>Updated 2h ago</span>
        </template>
      </DzPageHero>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Actions
// ---------------------------------------------------------------------------

export const WithActions: Story = {
  name: 'With Actions',
  args: {
    title: 'Raw Explorer',
    eyebrow: 'Evidence',
    description: 'Inspect ingested sources before they become documents.',
  },
  render: args => ({
    components: { DzPageHero },
    setup: () => ({ args }),
    template: `
      <DzPageHero v-bind="args">
        <template #actions>
          <button class="rounded-[var(--dz-radius-md)] px-3 py-1.5 text-sm font-semibold">
            Refresh
          </button>
          <button class="rounded-[var(--dz-radius-md)] px-3 py-1.5 text-sm font-semibold">
            New source
          </button>
        </template>
      </DzPageHero>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  args: {
    title: 'Help Portal',
    eyebrow: 'Support',
    description: 'Guides, feedback, and release notes for every workspace app.',
  },
  render: args => ({
    components: { DzPageHero },
    setup: () => ({ args }),
    template: `<DzPageHero v-bind="args" />`,
  }),
}
