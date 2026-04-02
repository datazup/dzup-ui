import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: [
    // Colocated stories inside component source directories
    '../../../packages/core/src/**/*.stories.ts',
    '../../../packages/pro/src/**/*.stories.ts',
    // Standalone stories directories
    '../../../packages/core/stories/**/*.stories.ts',
    '../../../packages/pro/stories/**/*.stories.ts',
    // Local app stories (intro, etc.)
    '../stories/**/*.mdx',
    '../stories/**/*.stories.ts',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal(config) {
    // Optional peer dependencies used via dynamic import() in pro components.
    // These may not be installed in the Storybook dev environment.
    config.build = config.build || {}
    config.build.rollupOptions = config.build.rollupOptions || {}
    const external = config.build.rollupOptions.external || []
    config.build.rollupOptions.external = [
      ...(Array.isArray(external) ? external : [external]),
      '@tiptap/vue-3',
      '@tiptap/starter-kit',
      'monaco-editor',
      'chart.js',
    ]
    return config
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
  },
}

export default config
