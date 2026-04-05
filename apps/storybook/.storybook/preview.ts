import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { definePreview } from '@storybook/vue3-vite'

// Import Tailwind CSS 4 (processes utility classes used in component variants)
import '../src/tailwind.css'
// Import design tokens CSS for all stories
import '@dzip-ui/tokens/css'

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    docs: {
      toc: true,
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
})
