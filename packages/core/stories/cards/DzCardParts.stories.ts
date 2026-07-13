import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { DzButton } from '../../src/components/buttons'
import { DzCard, DzCardBody, DzCardFooter, DzCardHeader } from '../../src/components/cards'
import { a11yError, darkModeDecorator } from '../_shared'

/**
 * DzCard compound sub-parts: DzCardHeader, DzCardBody, DzCardFooter.
 *
 * These sub-parts compose inside a `DzCard` root to produce a semantically
 * sectioned surface container. Each part manages its own padding, border
 * separators, and typography anchors via `--dz-card-*` tokens.
 *
 * - **DzCardHeader** -- top section; typically holds a title and optional action
 * - **DzCardBody** -- scrollable content area
 * - **DzCardFooter** -- bottom section; typically holds actions or metadata
 */

const meta = {
  title: 'Core/Cards/DzCardParts',
  component: DzCardBody,
  subcomponents: {
    DzCard,
    DzCardHeader,
    DzCardFooter,
  },
  tags: ['autodocs', 'status:stable'],
  // Cards is the first family on the enforced a11y gate (TASK-DS-06).
  parameters: { ...a11yError },
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding for the body section',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
  },
  args: {
    padding: 'md',
  },
} satisfies Meta<typeof DzCardBody>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Full card with all three parts
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCard, DzCardHeader, DzCardBody, DzCardFooter, DzButton },
    setup() {
      return { args }
    },
    template: `
      <DzCard variant="elevated" class="max-w-sm">
        <DzCardHeader>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Card Title</h3>
            <span class="text-xs text-[var(--dz-muted-foreground)]">Optional badge</span>
          </div>
        </DzCardHeader>
        <DzCardBody v-bind="args">
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            This is the card body. It can contain any content including text,
            images, form fields, or nested components.
          </p>
        </DzCardBody>
        <DzCardFooter>
          <div class="flex gap-2 justify-end">
            <DzButton variant="ghost" tone="neutral" size="sm">Cancel</DzButton>
            <DzButton tone="primary" size="sm">Confirm</DzButton>
          </div>
        </DzCardFooter>
      </DzCard>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', { level: 3 })
    await expect(heading).toBeInTheDocument()
    await expect(heading).toHaveTextContent('Card Title')
    const cancelButton = canvas.getByRole('button', { name: /cancel/i })
    await expect(cancelButton).toBeInTheDocument()
    const confirmButton = canvas.getByRole('button', { name: /confirm/i })
    await expect(confirmButton).toBeInTheDocument()
    await userEvent.click(confirmButton)
    await expect(confirmButton).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Compound Composition: Annotated anatomy
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound Composition: Anatomy',
  render: () => ({
    components: { DzCard, DzCardHeader, DzCardBody, DzCardFooter },
    template: `
      <div class="space-y-6">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          A DzCard is assembled from three named slots — DzCardHeader (top),
          DzCardBody (middle, scrollable), and DzCardFooter (bottom). Each part
          receives independent padding and a border separator token.
        </p>
        <DzCard variant="outlined" class="max-w-sm">
          <DzCardHeader>
            <div class="relative">
              <p class="text-sm font-semibold">DzCardHeader</p>
              <span class="absolute -top-2 -right-2 text-[10px] px-1 rounded bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]">header</span>
            </div>
          </DzCardHeader>
          <DzCardBody>
            <div class="relative min-h-[60px]">
              <p class="text-sm text-[var(--dz-muted-foreground)]">DzCardBody — main content area</p>
              <span class="absolute -top-2 -right-2 text-[10px] px-1 rounded bg-[var(--dz-success)] text-[var(--dz-success-foreground)]">body</span>
            </div>
          </DzCardBody>
          <DzCardFooter>
            <div class="relative">
              <p class="text-sm font-semibold">DzCardFooter</p>
              <!-- --dz-warning is a mid-scale fill: --dz-warning-foreground on it is 3.51:1 in light.
                   --dz-warning-solid is the darker fill that exists for exactly this pair (8.44:1). -->
              <span class="absolute -top-2 -right-2 text-[10px] px-1 rounded bg-[var(--dz-warning-solid)] text-[var(--dz-warning-foreground)]">footer</span>
            </div>
          </DzCardFooter>
        </DzCard>

        <div class="space-y-1 text-xs text-[var(--dz-muted-foreground)]">
          <p><strong>DzCard</strong> — root surface with variant (elevated / outlined / flat)</p>
          <p><strong>DzCardHeader</strong> — top region with bottom border separator</p>
          <p><strong>DzCardBody</strong> — main content with configurable padding prop</p>
          <p><strong>DzCardFooter</strong> — bottom region with top border separator</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Article card
// ---------------------------------------------------------------------------

export const RealWorldCard: Story = {
  name: 'Real World: Article Card',
  render: () => ({
    components: { DzCard, DzCardHeader, DzCardBody, DzCardFooter, DzButton },
    template: `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <DzCard
          v-for="article in articles"
          :key="article.id"
          variant="elevated"
          hoverable
          class="overflow-hidden"
          padding="none"
        >
          <div
            class="h-36 flex items-center justify-center text-[var(--dz-muted-foreground)] text-sm"
            style="background: var(--dz-muted);"
          >
            {{ article.category }} image
          </div>
          <DzCardHeader>
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold leading-snug">{{ article.title }}</p>
              <span
                class="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]"
              >
                {{ article.category }}
              </span>
            </div>
          </DzCardHeader>
          <DzCardBody>
            <p class="text-xs text-[var(--dz-muted-foreground)] line-clamp-2">
              {{ article.excerpt }}
            </p>
          </DzCardBody>
          <DzCardFooter>
            <div class="flex items-center justify-between text-xs text-[var(--dz-muted-foreground)]">
              <span>{{ article.author }} · {{ article.date }}</span>
              <DzButton variant="ghost" size="xs" tone="primary">Read</DzButton>
            </div>
          </DzCardFooter>
        </DzCard>
      </div>
    `,
    setup() {
      const articles = [
        {
          id: 1,
          title: 'Designing compound components in Vue 3',
          category: 'Design',
          excerpt:
            'Compound components use provide/inject to share context across nested children, enabling expressive declarative APIs.',
          author: 'Alice',
          date: 'Jun 20',
        },
        {
          id: 2,
          title: 'Token-first styling with tailwind-variants',
          category: 'Engineering',
          excerpt:
            'Using CSS custom properties with tv() keeps your components fully theme-able without hardcoding any color values.',
          author: 'Bob',
          date: 'Jun 22',
        },
      ]
      return { articles }
    },
  }),
}

// ---------------------------------------------------------------------------
// Body-only (no header or footer)
// ---------------------------------------------------------------------------

export const BodyOnly: Story = {
  name: 'Body Only (No Header / Footer)',
  render: () => ({
    components: { DzCard, DzCardBody },
    template: `
      <DzCard variant="outlined" class="max-w-sm">
        <DzCardBody>
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            DzCardBody can be used standalone without DzCardHeader or DzCardFooter.
            In this case no border separators are rendered.
          </p>
        </DzCardBody>
      </DzCard>
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
    components: { DzCard, DzCardHeader, DzCardBody, DzCardFooter, DzButton },
    template: `
      <DzCard variant="elevated" class="max-w-sm">
        <DzCardHeader>
          <h3 class="text-base font-semibold">Dark Mode Card</h3>
        </DzCardHeader>
        <DzCardBody>
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            Card surface and separator tokens adapt automatically to the dark
            theme via the dz-* token layer.
          </p>
        </DzCardBody>
        <DzCardFooter>
          <DzButton tone="primary" size="sm">Action</DzButton>
        </DzCardFooter>
      </DzCard>
    `,
  }),
}
