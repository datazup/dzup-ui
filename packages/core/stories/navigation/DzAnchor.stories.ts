import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzAnchor } from '../../src/components/navigation'
import { darkModeDecorator } from '../_shared'

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
      s => `
        <section id="${s.id}" class="min-h-[60vh] scroll-mt-4">
          <h2 class="text-xl font-semibold mb-2">${s.label}</h2>
          <p class="text-sm text-[var(--dz-muted-foreground)] max-w-prose">
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
      const items = sections.map(s => ({ href: `#${s.id}`, label: s.label }))
      return { items, article: articleTemplate() }
    },
    template: `
      <div class="flex flex-wrap gap-8">
        <DzAnchor :items="items" class="w-48 max-w-full shrink-0" />
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
      <div class="flex flex-wrap gap-8">
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
      const items = sections.map(s => ({ href: `#${s.id}`, label: s.label }))
      return { items, article: articleTemplate() }
    },
    template: `
      <div class="flex flex-wrap gap-8">
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
        return sections.map(s => ({ href: `#${s.id}`, label: s.label }))
      },
      article() {
        return articleTemplate()
      },
    },
    template: `
      <div class="flex flex-wrap gap-8">
        <div class="w-48 shrink-0 space-y-3">
          <DzAnchor v-model:active="active" :items="items" />
          <p class="text-sm text-[var(--dz-muted-foreground)]">Active: <strong>{{ active || 'none' }}</strong></p>
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
      const items = sections.map(s => ({ href: `#${s.id}`, label: s.label }))
      return { items, article: articleTemplate() }
    },
    template: `
      <div class="flex flex-wrap gap-8">
        <DzAnchor :items="items" class="w-48 max-w-full shrink-0" />
        <div class="flex-1 space-y-8" v-html="article" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — active / inactive / disabled entry (tier B `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * The states a table-of-contents entry can be in. `disabled` is declared per
 * entry (`DzAnchorItem.disabled`), not on the nav, because a section that is not
 * ready yet is the real case — a whole disabled table of contents is not.
 *
 * Each state is exposed twice: to assistive technology
 * (`aria-current="location"`, `aria-disabled`, `tabindex="-1"`) and to the
 * styling contract (`data-active`). The play function asserts both, and that a
 * disabled entry refuses activation while its siblings still work.
 */
export const States: Story = {
  render: () => ({
    components: { DzAnchor },
    setup() {
      const items = [
        { href: '#introduction', label: 'Introduction' },
        { href: '#installation', label: 'Installation' },
        { href: '#draft', label: 'Draft section', disabled: true },
        { href: '#usage', label: 'Usage' },
      ]
      return { items }
    },
    data() {
      return { active: '#introduction' }
    },
    template: `
      <div class="flex flex-wrap gap-8">
        <DzAnchor
          :items="items"
          v-model:active="active"
          class="w-56 shrink-0"
          aria-label="States table of contents"
          data-testid="an-states"
        />
        <div class="flex-1 space-y-2">
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            The third entry is disabled — its section has not been published yet.
          </p>
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            Active: <strong data-testid="an-active">{{ active }}</strong>
          </p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByTestId('an-states')

    await expect(nav).toHaveAttribute('data-state', 'ready')

    const intro = within(nav).getByRole('link', { name: 'Introduction' })
    const install = within(nav).getByRole('link', { name: 'Installation' })
    const draft = within(nav).getByRole('link', { name: 'Draft section' })

    // Active: announced with `aria-current="location"` and flagged for CSS.
    await expect(intro).toHaveAttribute('aria-current', 'location')
    await expect(intro).toHaveAttribute('data-active')

    // Inactive: neither.
    await expect(install).not.toHaveAttribute('aria-current')
    await expect(install).not.toHaveAttribute('data-active')

    // Disabled: announced, and taken out of the tab order so a keyboard user is
    // not offered a link that goes nowhere.
    await expect(draft).toHaveAttribute('aria-disabled', 'true')
    await expect(draft).toHaveAttribute('tabindex', '-1')

    // Activating a live entry moves the active state…
    await userEvent.click(install)
    await waitFor(() => expect(install).toHaveAttribute('aria-current', 'location'))
    await expect(intro).not.toHaveAttribute('aria-current')
    await expect(canvas.getByTestId('an-active')).toHaveTextContent('#installation')

    // …while the disabled entry is unreachable by pointer as well: its variant
    // sets `pointer-events: none`, so the browser never delivers the click, and
    // the model stays where the last live activation left it.
    await expect(getComputedStyle(draft).pointerEvents).toBe('none')
    await expect(draft).not.toHaveAttribute('aria-current')
    await expect(canvas.getByTestId('an-active')).toHaveTextContent('#installation')
  },
}
