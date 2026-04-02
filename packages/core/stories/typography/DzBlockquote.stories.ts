import type { Meta, StoryObj } from '@storybook/vue3'
import { DzBlockquote } from '../../src/components/typography'

/**
 * DzBlockquote renders a semantically correct `<blockquote>` element
 * with a left border accent. Supports an optional `cite` attribute
 * and a `footer` slot for attribution text.
 */
const meta = {
  title: 'Core/Typography/DzBlockquote',
  component: DzBlockquote,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    cite: {
      control: 'text',
      description: 'Attribution source URL (HTML cite attribute)',
      table: { category: 'Behavior' },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {},
} satisfies Meta<typeof DzBlockquote>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzBlockquote },
    setup() {
      return { args }
    },
    template: `
      <DzBlockquote v-bind="args">
        The only way to do great work is to love what you do.
      </DzBlockquote>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Attribution (Footer Slot)
// ---------------------------------------------------------------------------

export const WithAttribution: Story = {
  name: 'With Attribution',
  render: () => ({
    components: { DzBlockquote },
    template: `
      <DzBlockquote cite="https://example.com/steve-jobs">
        The only way to do great work is to love what you do.
        <template #footer>
          &mdash; Steve Jobs
        </template>
      </DzBlockquote>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Multiple Quotes
// ---------------------------------------------------------------------------

export const MultipleQuotes: Story = {
  name: 'Multiple Quotes',
  render: () => ({
    components: { DzBlockquote },
    template: `
      <div class="space-y-6 max-w-lg">
        <DzBlockquote>
          Simplicity is the ultimate sophistication.
          <template #footer>&mdash; Leonardo da Vinci</template>
        </DzBlockquote>
        <DzBlockquote>
          Code is like humor. When you have to explain it, it's bad.
          <template #footer>&mdash; Cory House</template>
        </DzBlockquote>
        <DzBlockquote>
          First, solve the problem. Then, write the code.
          <template #footer>&mdash; John Johnson</template>
        </DzBlockquote>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Long Quote
// ---------------------------------------------------------------------------

export const LongQuote: Story = {
  name: 'Long Quote',
  render: () => ({
    components: { DzBlockquote },
    template: `
      <div class="max-w-lg">
        <DzBlockquote cite="https://example.com/clean-code">
          Any fool can write code that a computer can understand.
          Good programmers write code that humans can understand.
          The ratio of time spent reading versus writing code is
          well over 10 to 1. We are constantly reading old code
          as part of the effort to write new code.
          <template #footer>&mdash; Martin Fowler, <cite>Refactoring</cite></template>
        </DzBlockquote>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Without Footer
// ---------------------------------------------------------------------------

export const WithoutFooter: Story = {
  name: 'Without Footer',
  render: () => ({
    components: { DzBlockquote },
    template: `
      <DzBlockquote>
        Talk is cheap. Show me the code.
      </DzBlockquote>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Cite Attribute
// ---------------------------------------------------------------------------

export const WithCiteAttribute: Story = {
  name: 'With Cite Attribute',
  render: () => ({
    components: { DzBlockquote },
    template: `
      <div class="space-y-4 max-w-lg">
        <p class="text-sm text-gray-500">
          The cite attribute provides a machine-readable source URL
          (not visually rendered by browsers, but useful for SEO and
          assistive technology).
        </p>
        <DzBlockquote cite="https://www.brainyquote.com/quotes/albert_einstein">
          Imagination is more important than knowledge.
          <template #footer>&mdash; Albert Einstein</template>
        </DzBlockquote>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzBlockquote },
    template: `
      <div class="space-y-6 max-w-lg">
        <DzBlockquote>
          In the middle of difficulty lies opportunity.
          <template #footer>&mdash; Albert Einstein</template>
        </DzBlockquote>
        <DzBlockquote>
          The best error message is the one that never shows up.
          <template #footer>&mdash; Thomas Fuchs</template>
        </DzBlockquote>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic HTML',
  render: () => ({
    components: { DzBlockquote },
    template: `
      <div class="space-y-4 max-w-lg">
        <p class="text-sm text-gray-500">
          DzBlockquote renders a native &lt;blockquote&gt; element, which is
          recognized by screen readers as quoted content. The cite attribute
          provides the source URL. The footer slot renders inside a
          &lt;footer&gt; element for semantic attribution.
        </p>
        <DzBlockquote id="quote-1" cite="https://example.com">
          Accessible quotes use semantic HTML so screen readers can identify
          them as quoted content, distinct from the surrounding text.
          <template #footer>&mdash; Accessibility Guidelines</template>
        </DzBlockquote>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Testimonial Section
// ---------------------------------------------------------------------------

export const RealWorldTestimonials: Story = {
  name: 'Real World: Testimonial Section',
  render: () => ({
    components: { DzBlockquote },
    template: `
      <div class="space-y-4 max-w-lg">
        <h2 class="text-xl font-bold">What Our Users Say</h2>
        <DzBlockquote>
          This component library has dramatically improved our development speed.
          The consistent API and excellent TypeScript support make it a joy to use.
          <template #footer>&mdash; Sarah Chen, Lead Developer at TechCorp</template>
        </DzBlockquote>
        <DzBlockquote>
          We migrated from a custom component set and the transition was seamless.
          The accessibility-first approach saved us weeks of remediation work.
          <template #footer>&mdash; Marcus Johnson, CTO at StartupXYZ</template>
        </DzBlockquote>
      </div>
    `,
  }),
}
