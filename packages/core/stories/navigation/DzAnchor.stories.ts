import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzAnchor } from '../../src/components/navigation'

/**
 * **DzAnchor** is an in-page table-of-contents navigation. It highlights the
 * section currently in view (scrollspy via `IntersectionObserver`) and
 * smooth-scrolls to a section on click (respecting `prefers-reduced-motion`).
 * Keyboard activation additionally moves focus to the target heading.
 *
 * Pass nested `items` ({ href, label, children? }). The active link exposes
 * `aria-current="location"` and is controllable via `v-model:active`. Set
 * `offset-top` to account for a sticky header, and `affix` to stick the nav.
 *
 * Status: **experimental**.
 */
const meta = {
  title: 'Core/Navigation/DzAnchor',
  component: DzAnchor,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Anchor entries (nested via `children`)',
      table: { category: 'Content' },
    },
    offsetTop: {
      control: 'number',
      description: 'Pixel offset for scrollspy detection + scroll landing',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    affix: {
      control: 'boolean',
      description: 'Stick the nav to the top while scrolling',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the nav landmark',
      table: { category: 'Accessibility', defaultValue: { summary: 'Page navigation' } },
    },
  },
} satisfies Meta<typeof DzAnchor>

export default meta
type Story = StoryObj<typeof meta>

// Shared demo content: a long article whose headings the anchor tracks.
const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'api', label: 'API Reference' },
  { id: 'faq', label: 'FAQ' },
]

function articleTemplate(): string {
  return sections
    .map(
      (s) => `
        <section id="${s.id}" class="min-h-[60vh] scroll-mt-4">
          <h2 class="text-xl font-semibold mb-2">${s.label}</h2>
          <p class="text-sm text-gray-500 max-w-prose">
            Placeholder content for the ${s.label} section. Scroll the page and
            watch the anchor on the left highlight the section in view.
          </p>
        </section>`,
    )
    .join('\n')
}

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzAnchor },
    setup() {
      const items = sections.map((s) => ({ href: `#${s.id}`, label: s.label }))
      return { items, article: articleTemplate() }
    },
    template: `
      <div class="flex gap-8">
        <DzAnchor :items="items" class="w-48 shrink-0" />
        <div class="flex-1 space-y-8" v-html="article" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Nav landmark is present
    const nav = canvas.getByRole('navigation')
    await expect(nav).toBeInTheDocument()
    // All 6 section links are rendered
    const links = canvas.getAllByRole('link')
    await expect(links.length).toBeGreaterThanOrEqual(sections.length)
    // Links are real anchor hrefs
    await expect(links[0]).toHaveAttribute('href', '#introduction')
    // Scroll the first section into view so the IntersectionObserver fires.
    const firstSection = canvasElement.querySelector('#introduction')
    firstSection?.scrollIntoView()
    // Wait for scrollspy to set aria-current="location" on the first link.
    await waitFor(() => expect(links[0]).toHaveAttribute('aria-current', 'location'), {
      timeout: 3000,
    })
    // Last link does not carry aria-current
    await expect(links[links.length - 1]).not.toHaveAttribute('aria-current')
  },
}

// ---------------------------------------------------------------------------
// Nested
// ---------------------------------------------------------------------------

export const Nested: Story = {
  name: 'Nested sections',
  render: () => ({
    components: { DzAnchor },
    setup() {
      const items = [
        { href: '#introduction', label: 'Introduction' },
        {
          href: '#installation',
          label: 'Installation',
          children: [
            { href: '#usage', label: 'Usage' },
            { href: '#configuration', label: 'Configuration' },
          ],
        },
        {
          href: '#api',
          label: 'API Reference',
          children: [{ href: '#faq', label: 'FAQ' }],
        },
      ]
      return { items, article: articleTemplate() }
    },
    template: `
      <div class="flex gap-8">
        <DzAnchor :items="items" class="w-56 shrink-0" />
        <div class="flex-1 space-y-8" v-html="article" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Affixed (sticky) with offset
// ---------------------------------------------------------------------------

export const Affixed: Story = {
  name: 'Affixed + offsetTop',
  render: () => ({
    components: { DzAnchor },
    setup() {
      const items = sections.map((s) => ({ href: `#${s.id}`, label: s.label }))
      return { items, article: articleTemplate() }
    },
    template: `
      <div class="flex gap-8">
        <DzAnchor
          :items="items"
          :offset-top="16"
          affix
          class="w-48 shrink-0 self-start"
        />
        <div class="flex-1 space-y-8" v-html="article" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Controlled (v-model:active)
// ---------------------------------------------------------------------------

export const Controlled: Story = {
  name: 'Controlled (v-model:active)',
  render: () => ({
    components: { DzAnchor },
    data() {
      return { active: '#introduction' }
    },
    computed: {
      items() {
        return sections.map((s) => ({ href: `#${s.id}`, label: s.label }))
      },
      article() {
        return articleTemplate()
      },
    },
    template: `
      <div class="flex gap-8">
        <div class="w-48 shrink-0 space-y-3">
          <DzAnchor v-model:active="active" :items="items" />
          <p class="text-sm text-gray-500">Active: <strong>{{ active || 'none' }}</strong></p>
        </div>
        <div class="flex-1 space-y-8" v-html="article" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzAnchor },
    setup() {
      const items = sections.map((s) => ({ href: `#${s.id}`, label: s.label }))
      return { items, article: articleTemplate() }
    },
    template: `
      <div class="flex gap-8">
        <DzAnchor :items="items" class="w-48 shrink-0" />
        <div class="flex-1 space-y-8" v-html="article" />
      </div>
    `,
  }),
}
