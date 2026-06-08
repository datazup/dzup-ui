import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzCodeBlock } from '../../src/components/data'

/**
 * DzCodeBlock renders code in a semantic `<pre><code>` structure with an
 * optional file/language header, line numbers, and a clipboard copy button
 * (reusing `DzCopyButton`).
 *
 * It does not perform syntax highlighting itself — it attaches a
 * `language-{lang}` class to the `<code>` element so a downstream highlighter
 * (Shiki/Prism) can style it, and it owns the layout, scrolling, and copy UX.
 */

// ---------------------------------------------------------------------------
// Sample snippets
// ---------------------------------------------------------------------------

const tsSnippet = `import { DzButton } from '@dzup-ui/core'

const variant = 'solid'
const tone = 'primary'`

const bashSnippet = `yarn add @dzup-ui/core @dzup-ui/tokens`

const vueSnippet = `<script setup lang="ts">
import { DzCodeBlock } from '@dzup-ui/core'
</script>

<template>
  <DzCodeBlock :code="snippet" language="typescript" filename="example.ts" />
</template>`

const jsonSnippet = `{
  "name": "@dzup-ui/core",
  "version": "1.0.0",
  "type": "module"
}`

// A single very long line, used to demonstrate horizontal overflow.
const longLineSnippet = `const config = { theme: 'system', tokens: { primary: '#3b82f6', radius: '8px' }, components: ['DzButton', 'DzCard', 'DzInput', 'DzTable', 'DzDataGrid', 'DzAccordion'] }`

// A tall snippet, used to demonstrate max-height + vertical scroll.
const tallSnippet = Array.from(
  { length: 30 },
  (_, i) => `const line${i + 1} = ${i + 1} // generated row`,
).join('\n')

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Core/Data/DzCodeBlock',
  component: DzCodeBlock,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    language: {
      control: 'text',
      description: 'Programming language — shown in the header and emitted as a `language-*` class for highlighters',
      table: { category: 'Appearance' },
    },
    filename: {
      control: 'text',
      description: 'Filename displayed in the header bar',
      table: { category: 'Appearance' },
    },
    showLineNumbers: {
      control: 'boolean',
      description: 'Display a gutter of line numbers',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    // Behavior
    code: {
      control: 'text',
      description: 'The code content to display',
      table: { category: 'Behavior' },
    },
    copyable: {
      control: 'boolean',
      description: 'Show the copy-to-clipboard button in the header',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    maxHeight: {
      control: 'text',
      description: 'Max height (CSS value, e.g. "240px") — content scrolls vertically beyond it',
      table: { category: 'Behavior' },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the code region',
      table: { category: 'Accessibility' },
    },
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    code: tsSnippet,
    language: 'typescript',
    filename: 'button.ts',
    showLineNumbers: false,
    copyable: true,
  },
} satisfies Meta<typeof DzCodeBlock>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default (controls-driven)
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCodeBlock },
    setup() {
      return { args }
    },
    template: '<DzCodeBlock v-bind="args" class="max-w-xl" />',
  }),
}

// ---------------------------------------------------------------------------
// Languages Gallery
// ---------------------------------------------------------------------------

export const Languages: Story = {
  name: 'Languages Gallery',
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { tsSnippet, bashSnippet, vueSnippet, jsonSnippet }
    },
    template: `
      <div class="space-y-6 max-w-xl">
        <DzCodeBlock :code="tsSnippet" language="typescript" filename="button.ts" />
        <DzCodeBlock :code="bashSnippet" language="bash" filename="terminal" />
        <DzCodeBlock :code="vueSnippet" language="vue" filename="Example.vue" />
        <DzCodeBlock :code="jsonSnippet" language="json" filename="package.json" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Line Numbers
// ---------------------------------------------------------------------------

export const WithLineNumbers: Story = {
  name: 'With Line Numbers',
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { vueSnippet }
    },
    template: `
      <DzCodeBlock
        :code="vueSnippet"
        language="vue"
        filename="Example.vue"
        show-line-numbers
        class="max-w-xl"
      />
    `,
  }),
}

// ---------------------------------------------------------------------------
// States (header on/off)
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { bashSnippet }
    },
    template: `
      <div class="space-y-6 max-w-xl">
        <div>
          <p class="text-xs mb-1 text-[var(--dz-muted-foreground)]">With header (filename + language + copy)</p>
          <DzCodeBlock :code="bashSnippet" language="bash" filename="terminal" />
        </div>
        <div>
          <p class="text-xs mb-1 text-[var(--dz-muted-foreground)]">No header (copyable disabled, no filename/language)</p>
          <DzCodeBlock :code="bashSnippet" :copyable="false" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Scroll: max-height (vertical)
// ---------------------------------------------------------------------------

export const MaxHeightScroll: Story = {
  name: 'Scroll: Max Height',
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { tallSnippet }
    },
    template: `
      <DzCodeBlock
        :code="tallSnippet"
        language="typescript"
        filename="generated.ts"
        show-line-numbers
        max-height="240px"
        class="max-w-xl"
      />
    `,
  }),
}

// ---------------------------------------------------------------------------
// Overflow: long line (horizontal)
// ---------------------------------------------------------------------------

export const HorizontalOverflow: Story = {
  name: 'Overflow: Long Line',
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { longLineSnippet }
    },
    template: `
      <DzCodeBlock
        :code="longLineSnippet"
        language="typescript"
        filename="config.ts"
        class="max-w-xl"
      />
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom header / actions slots
// ---------------------------------------------------------------------------

export const WithActionSlot: Story = {
  name: 'With Extra Actions',
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { tsSnippet }
    },
    template: `
      <DzCodeBlock :code="tsSnippet" language="typescript" filename="button.ts" class="max-w-xl">
        <template #actions>
          <a
            href="#"
            class="text-xs underline text-[var(--dz-muted-foreground)] hover:text-[var(--dz-foreground)]"
            @click.prevent
          >Open in playground</a>
        </template>
      </DzCodeBlock>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [
    darkModeDecorator,
  ],
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { tsSnippet, bashSnippet }
    },
    template: `
      <div class="space-y-6 max-w-xl">
        <DzCodeBlock :code="tsSnippet" language="typescript" filename="button.ts" show-line-numbers />
        <DzCodeBlock :code="bashSnippet" language="bash" filename="terminal" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Region & Copy Label',
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { bashSnippet }
    },
    template: `
      <div class="space-y-3 max-w-xl">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          The block is a labelled <code>role="region"</code>. Pass <code>ariaLabel</code>
          to name it for screen readers. Line numbers are <code>aria-hidden</code> so they
          aren't read as part of the code. The copy button announces "Copied" after a copy.
        </p>
        <DzCodeBlock
          :code="bashSnippet"
          language="bash"
          filename="terminal"
          aria-label="Install command"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: install instructions
// ---------------------------------------------------------------------------

export const RealWorldInstall: Story = {
  name: 'Real World: Install Instructions',
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return {
        yarnSnippet: 'yarn add @dzup-ui/core @dzup-ui/tokens',
        importSnippet: `import '@dzup-ui/tokens/dist/tokens.css'\nimport { DzButton } from '@dzup-ui/core'`,
      }
    },
    template: `
      <div class="max-w-xl space-y-4">
        <h3 class="text-base font-semibold">Getting started</h3>
        <div>
          <p class="text-sm mb-1">1. Install the packages:</p>
          <DzCodeBlock :code="yarnSnippet" language="bash" filename="terminal" />
        </div>
        <div>
          <p class="text-sm mb-1">2. Import the tokens and a component:</p>
          <DzCodeBlock :code="importSnippet" language="typescript" filename="main.ts" show-line-numbers />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: copy flow (play)
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Copy Flow',
  render: () => ({
    components: { DzCodeBlock },
    setup() {
      return { bashSnippet }
    },
    template: `
      <DzCodeBlock :code="bashSnippet" language="bash" filename="terminal" class="max-w-xl" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The header copy button is the only button in the block.
    const copyButton = canvas.getByRole('button')
    await expect(copyButton).toHaveAttribute('data-state', 'idle')

    // Clicking it writes the code to the clipboard and flips to the copied state.
    await userEvent.click(copyButton)
    await waitFor(() => expect(copyButton).toHaveAttribute('data-state', 'copied'))
    await expect(copyButton).toHaveAccessibleName(/copied/i)

    // It resets back to idle after the ~2s timeout.
    await waitFor(() => expect(copyButton).toHaveAttribute('data-state', 'idle'), {
      timeout: 3000,
    })
  },
}
