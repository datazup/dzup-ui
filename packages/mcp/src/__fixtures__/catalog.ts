/**
 * A small, structurally faithful stand-in for the catalog artifacts the site
 * ships (TASK-N2-A1).
 *
 * WHY a fixture at all, when `registry.spec.ts` already reads the real files:
 * the real ones (`apps/storybook/public/llms.txt`, `llms-full.txt`) are
 * **git-ignored build outputs** (`apps/storybook/.gitignore:14-15`), so a spec
 * or generator that depends on them is green only on a machine that has run
 * `yarn workspace @dzup-ui/storybook build:llms`. That is exactly how this
 * package's original suite came to assert against files a clean checkout does
 * not have. The split is therefore deliberate:
 *
 *   • fixtures  → behaviour, contract and generated-artifact determinism.
 *                 Committed, so CI and a cold clone get the same answer.
 *   • real dirs → integration assertions in `registry.spec.ts`, which SKIP with
 *                 a named reason when the artifact is absent rather than failing
 *                 or silently passing.
 *
 * The fixture is NOT a second source of truth for the catalog: nothing here is
 * ever served to a consumer. It is the input side of a reader, chosen so every
 * branch of every tool is reachable (a block WITH deps and components, a block
 * WITHOUT them, two families, a component with details, a token in each theme).
 */

/** Site path → file contents, exactly as the reader contract expects. */
export const FIXTURE_FILES: Readonly<Record<string, string>> = Object.freeze({
  '/r/registry.json': JSON.stringify({
    name: 'dzup-ui',
    homepage: 'https://dzup-ui.com',
    items: [
      {
        name: 'hero-centered',
        type: 'registry:block',
        title: 'Centered hero',
        description: 'A centered hero section with a headline and two actions.',
        categories: ['marketing'],
        dependencies: ['@dzup-ui/core'],
        meta: { components: ['DzButton', 'DzHeading'], tier: 'free' },
        files: [{ path: 'blocks/hero-centered.vue', type: 'registry:block', target: 'components/blocks/HeroCentered.vue' }],
      },
      {
        name: 'pricing-3',
        type: 'registry:block',
        title: 'Three-tier pricing',
        description: 'Three pricing cards with a highlighted middle tier.',
        categories: ['marketing', 'commerce'],
        meta: { components: ['DzCard'] },
        files: [{ path: 'blocks/pricing-3.vue', type: 'registry:block' }],
      },
      {
        // No title, no description, no categories, no meta — the minimal item
        // shape a renderer must survive.
        name: 'bare-block',
        type: 'registry:block',
        files: [{ path: 'blocks/bare-block.vue', type: 'registry:block' }],
      },
    ],
  }),

  '/r/hero-centered.json': JSON.stringify({
    name: 'hero-centered',
    type: 'registry:block',
    title: 'Centered hero',
    description: 'A centered hero section with a headline and two actions.',
    categories: ['marketing'],
    dependencies: ['@dzup-ui/core', '@dzup-ui/tokens'],
    meta: { components: ['DzButton', 'DzHeading'] },
    files: [
      {
        path: 'blocks/hero-centered.vue',
        type: 'registry:block',
        target: 'components/blocks/HeroCentered.vue',
        content: '<template>\n  <section><DzHeading>Hi</DzHeading></section>\n</template>\n\n<script setup lang="ts">\nimport { DzHeading } from \'@dzup-ui/core\'\n</script>\n\n\n',
      },
    ],
  }),

  '/r/bare-block.json': JSON.stringify({
    name: 'bare-block',
    type: 'registry:block',
    files: [{ path: 'blocks/bare-block.vue', type: 'registry:block' }],
  }),

  '/r/templates/registry.json': JSON.stringify({
    name: 'dzup-ui-templates',
    homepage: 'https://dzup-ui.com',
    items: [
      {
        name: 'analytics-dashboard',
        type: 'registry:block',
        title: 'Analytics dashboard',
        description: 'A full analytics dashboard page.',
        categories: ['dashboards'],
        meta: { components: ['DzCard', 'DzTable'], tier: 'free' },
        files: [{ path: 'templates/analytics-dashboard.vue', type: 'registry:block' }],
      },
    ],
  }),

  '/r/templates/analytics-dashboard.json': JSON.stringify({
    name: 'analytics-dashboard',
    type: 'registry:block',
    title: 'Analytics dashboard',
    description: 'A full analytics dashboard page.',
    dependencies: ['@dzup-ui/core'],
    meta: { components: ['DzCard', 'DzTable'] },
    files: [
      {
        path: 'templates/analytics-dashboard.vue',
        type: 'registry:block',
        content: '<template>\n  <main><DzCard /></main>\n</template>\n',
      },
    ],
  }),

  '/r/tokens.json': JSON.stringify({
    name: 'dzup-theme',
    type: 'registry:theme',
    title: 'dzup-ui tokens',
    description: 'The --dz-* OKLCH design-token set.',
    cssVars: {
      light: {
        'dz-colors-primary-500': 'oklch(0.62 0.19 259)',
        'dz-radius-sm': '0.25rem',
      },
      dark: {
        'dz-colors-primary-500': 'oklch(0.71 0.16 259)',
      },
    },
  }),

  '/storybook/llms.txt': [
    '# dzup-ui components',
    '',
    '## Conventions',
    '- **Import** — everything is a named export of `@dzup-ui/core`.',
    '',
    '## Buttons',
    '',
    '- **DzButton** — Primary button component.',
    '  - props: `variant`, `size`, `tone`',
    '  - variant: `solid` `outline` · size: `md`',
    '- **DzIconButton** — Icon-only button component.',
    '  - props: `icon`, `ariaLabel`',
    '',
    '## Cards',
    '',
    '- **DzCard** — Surface container.',
    '  - props: `variant`',
    '',
  ].join('\n'),

  // The generated component-metadata artifact (TASK-N2-A2), in miniature.
  // Structurally faithful to `packages/core/docs/component-meta.json`: one
  // component with props/events/slots/exposed and a primary story carrying a
  // STATIC template, one with a story but no static template, one compound part,
  // and one component with no story at all — so the "no example published"
  // branch of `get_component_example` is reachable without the real 1.4 MB file.
  '/r/component-meta.json': JSON.stringify({
    schemaVersion: '1.0.0',
    sourceCommit: '0000000000000000000000000000000000000000',
    extractor: 'vue-component-meta@0.0.0-fixture',
    totals: { components: 4, publicComponents: 3, compoundParts: 1 },
    components: [
      {
        name: 'DzButton',
        kind: 'public-component',
        family: 'buttons',
        status: 'stable',
        subpaths: ['.', './buttons'],
        source: 'packages/core/src/components/buttons/DzButton.vue',
        typesSource: 'packages/core/src/components/buttons/DzButton.types.ts',
        componentCommit: 'aaaaaaa',
        componentType: 'class',
        tier: 'A',
        anatomy: { state: 'declared', parts: ['root', 'spinner'], source: 'packages/core/src/components/buttons/DzButton.anatomy.ts' },
        capability: {
          tier: 'A',
          pattern: 'button',
          securityBoundary: 'none',
          traits: [],
          cells: { pass: 3, present: 5, unrun: 2 },
          unrun: ['at-manual', 'browser-matrix'],
          stale: [],
        },
        props: [
          { name: 'disabled', type: 'boolean | undefined', required: false, default: 'false', description: 'Disabled state', descriptionSource: 'vue-component-meta' },
          { name: 'variant', type: 'ButtonVariant | undefined', required: false, default: 'undefined', description: 'Visual style variant', descriptionSource: 'vue-component-meta' },
        ],
        globalPropCount: 12,
        events: [
          { name: 'click', type: '[event: MouseEvent]', signature: '(event: "click", event: MouseEvent): void', description: 'Native click event', descriptionSource: 'emits-interface', modelDerived: false },
          { name: 'update:modelValue', type: '[value: string]', signature: '(event: "update:modelValue", value: string): void', description: '', descriptionSource: 'none', modelDerived: true },
        ],
        slots: [
          { name: 'default', type: 'any', description: 'Primary button content', descriptionSource: 'vue-component-meta', hasPayload: false },
        ],
        exposed: [],
        stories: {
          file: 'packages/core/stories/buttons/DzButton.stories.ts',
          titlePath: 'Core/Buttons/DzButton',
          stories: [
            { id: 'Default', lines: [77, 85] },
            { id: 'AllVariants', name: 'Variant Gallery', lines: [91, 104] },
          ],
          primary: {
            id: 'Default',
            lines: [77, 85],
            source: 'export const Default: Story = {\n  render: args => ({\n    components: { DzButton },\n    setup() {\n      return { args }\n    },\n    template: \'<DzButton v-bind="args">Button</DzButton>\',\n  }),\n}',
            template: '<DzButton v-bind="args">Button</DzButton>',
          },
        },
        extraction: { props: 2, propsWithDescription: 2 },
      },
      {
        // A story exists, but its template is computed — source only, no markup block.
        name: 'DzCard',
        kind: 'public-component',
        family: 'cards',
        subpaths: ['.', './cards'],
        source: 'packages/core/src/components/cards/DzCard.vue',
        componentCommit: 'bbbbbbb',
        componentType: 'class',
        tier: 'B',
        anatomy: { state: 'absent', parts: [] },
        props: [],
        globalPropCount: 12,
        events: [],
        slots: [{ name: 'default', type: '{}', description: '', descriptionSource: 'none', hasPayload: false }],
        exposed: [{ name: 'cardRef', type: 'HTMLElement | null', description: '', descriptionSource: 'none' }],
        stories: {
          file: 'packages/core/stories/cards/DzCard.stories.ts',
          stories: [{ id: 'Default', lines: [20, 30] }],
          primary: { id: 'Default', lines: [20, 30], source: 'export const Default: Story = {\n  render: () => ({ components: { DzCard }, template: buildTemplate() }),\n}' },
        },
        extraction: { props: 0, propsWithDescription: 0 },
      },
      {
        name: 'DzCardBody',
        kind: 'compound-part',
        parentComponent: 'DzCard',
        family: 'cards',
        subpaths: ['.', './cards'],
        source: 'packages/core/src/components/cards/DzCardBody.vue',
        componentCommit: 'ccccccc',
        componentType: 'class',
        anatomy: { state: 'absent', parts: [] },
        props: [],
        globalPropCount: 12,
        events: [],
        slots: [{ name: 'default', type: '{}', description: '', descriptionSource: 'none', hasPayload: false }],
        exposed: [],
        stories: { stories: [] },
        extraction: { props: 0, propsWithDescription: 0 },
      },
      {
        // No stories file at all — the honest "no example published" branch.
        name: 'DzThemeProvider',
        kind: 'public-component',
        family: 'providers',
        subpaths: ['.', './providers'],
        source: 'packages/core/src/providers/DzThemeProvider.vue',
        componentCommit: 'ddddddd',
        componentType: 'class',
        tier: 'B',
        anatomy: { state: 'absent', parts: [] },
        props: [],
        globalPropCount: 12,
        events: [],
        slots: [],
        exposed: [],
        stories: { stories: [] },
        extraction: { props: 0, propsWithDescription: 0 },
      },
    ],
  }),

  '/storybook/llms-full.txt': [
    '# dzup-ui components — full API',
    '',
    '## Buttons',
    '',
    '### DzButton',
    'Primary button component.',
    '',
    '| Prop | Type | Default |',
    '| --- | --- | --- |',
    '| `variant` | `ButtonVariant` | `solid` |',
    '',
    '### DzIconButton',
    'Icon-only button component.',
    '',
    '## Cards',
    '',
    '### DzCard',
    'Surface container.',
    '',
  ].join('\n'),
})

/** Site paths a tool may legitimately request. Anything else is a bug. */
export const FIXTURE_PATHS: readonly string[] = Object.freeze(Object.keys(FIXTURE_FILES))

/**
 * A reader over {@link FIXTURE_FILES} that RECORDS every site path requested.
 *
 * The recording is the data-source-binding probe: a tool that answers from a
 * hand-written list in its own module reads nothing, and that is visible here
 * as an empty `reads` array rather than having to be argued from the source.
 */
export function recordingFixtureReader(): {
  read: (sitePath: string) => Promise<string>
  reads: string[]
} {
  const reads: string[] = []
  return {
    reads,
    read: async (sitePath: string) => {
      reads.push(sitePath)
      const hit = FIXTURE_FILES[sitePath]
      if (hit === undefined)
        throw new Error(`fixture 404: ${sitePath}`)
      return hit
    },
  }
}
