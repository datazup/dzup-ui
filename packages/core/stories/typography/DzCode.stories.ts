import type { Meta, StoryObj } from '@storybook/vue3'
import { DzCode } from '../../src/components/typography'

/**
 * DzCode renders code content in monospace font with appropriate styling.
 *
 * Two variants:
 * - `inline` (default) -- renders as `<code>` for inline code snippets
 * - `block` -- renders as `<pre><code>` for multi-line code blocks
 *
 * Accepts an optional `language` prop as a hint for future syntax highlighting.
 */
const meta = {
  title: 'Core/Typography/DzCode',
  component: DzCode,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['inline', 'block'],
      description: 'Display variant: inline code or block code',
      table: { category: 'Appearance', defaultValue: { summary: 'inline' } },
    },
    language: {
      control: 'text',
      description: 'Programming language hint (for future syntax highlighting)',
      table: { category: 'Appearance' },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'inline',
  },
} satisfies Meta<typeof DzCode>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default (Inline)
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCode },
    setup() {
      return { args }
    },
    template: '<p>Use <DzCode v-bind="args">const x = 42</DzCode> to declare a constant.</p>',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzCode },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Inline</p>
          <p>The <DzCode>Array.from()</DzCode> method creates a new array.</p>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Block</p>
          <DzCode variant="block" language="typescript">function greet(name: string): string {
  return \`Hello, \${name}!\`
}

const message = greet('World')
console.log(message)</DzCode>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Inline Code
// ---------------------------------------------------------------------------

export const InlineCode: Story = {
  name: 'Inline Code in Paragraph',
  render: () => ({
    components: { DzCode },
    template: `
      <div class="space-y-3 max-w-lg">
        <p>
          Use <DzCode>npm install</DzCode> to install dependencies.
          You can also run <DzCode>yarn add</DzCode> if you prefer Yarn.
        </p>
        <p>
          The <DzCode>defineModel&lt;T&gt;()</DzCode> macro from Vue 3.4+
          simplifies v-model implementation.
        </p>
        <p>
          Set <DzCode>strict: true</DzCode> in your <DzCode>tsconfig.json</DzCode>
          for best type safety.
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Block Code
// ---------------------------------------------------------------------------

export const BlockCode: Story = {
  name: 'Block Code',
  render: () => ({
    components: { DzCode },
    template: `
      <div class="space-y-6 max-w-xl">
        <div>
          <p class="text-sm font-medium mb-2">TypeScript</p>
          <DzCode variant="block" language="typescript">interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

function getUser(id: string): Promise&lt;User&gt; {
  return fetch(\`/api/users/\${id}\`).then(r => r.json())
}</DzCode>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Vue Template</p>
          <DzCode variant="block" language="vue">&lt;template&gt;
  &lt;DzButton
    variant="solid"
    tone="primary"
    @click="handleSave"
  &gt;
    Save Changes
  &lt;/DzButton&gt;
&lt;/template&gt;</DzCode>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Language Hint
// ---------------------------------------------------------------------------

export const WithLanguage: Story = {
  name: 'With Language Hint',
  render: () => ({
    components: { DzCode },
    template: `
      <div class="space-y-4 max-w-xl">
        <p class="text-sm text-gray-500">
          The language prop sets data-language on the element for future
          syntax highlighting integration.
        </p>
        <DzCode variant="block" language="bash">npm install @dzip-ui/core @dzip-ui/tokens
yarn add @dzip-ui/core @dzip-ui/tokens</DzCode>
        <DzCode variant="block" language="json">{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext"
  }
}</DzCode>
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
    components: { DzCode },
    template: `
      <div class="space-y-4">
        <p>Use <DzCode>defineModel()</DzCode> for v-model bindings.</p>
        <DzCode variant="block" language="typescript">const model = defineModel&lt;boolean&gt;({ default: false })

function toggle(): void {
  model.value = !model.value
}</DzCode>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Elements',
  render: () => ({
    components: { DzCode },
    template: `
      <div class="space-y-4 max-w-lg">
        <p class="text-sm text-gray-500">
          Inline variant renders as a semantic &lt;code&gt; element.
          Block variant renders as &lt;pre&gt;&lt;code&gt;. Both are
          recognized by assistive technology as code content.
        </p>
        <p>The <DzCode id="inline-example">useId()</DzCode> composable generates unique IDs.</p>
        <DzCode id="block-example" variant="block" language="typescript">import { useId } from 'vue'

const id = useId()</DzCode>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Installation Guide
// ---------------------------------------------------------------------------

export const RealWorldInstallGuide: Story = {
  name: 'Real World: Installation Guide',
  render: () => ({
    components: { DzCode },
    template: `
      <div class="space-y-6 max-w-xl">
        <h2 class="text-xl font-bold">Getting Started</h2>

        <div>
          <h3 class="text-lg font-semibold mb-2">1. Install packages</h3>
          <DzCode variant="block" language="bash">yarn add @dzip-ui/core @dzip-ui/tokens</DzCode>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-2">2. Import the component</h3>
          <DzCode variant="block" language="typescript">import { DzButton } from '@dzip-ui/core'</DzCode>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-2">3. Use in your template</h3>
          <p class="text-sm text-gray-500 mb-2">
            Pass <DzCode>variant</DzCode>, <DzCode>tone</DzCode>, and <DzCode>size</DzCode> props to customize appearance.
          </p>
          <DzCode variant="block" language="vue">&lt;DzButton variant="solid" tone="primary" size="md"&gt;
  Click me
&lt;/DzButton&gt;</DzCode>
        </div>
      </div>
    `,
  }),
}
