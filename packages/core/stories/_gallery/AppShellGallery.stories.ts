import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BrandScope from './BrandScope.vue'
import DzupAppShell from './dzup/DzupAppShell.vue'
import FreestyleAppShell from './freestyle/FreestyleAppShell.vue'

const meta: Meta = {
  title: 'Visual Refresh/App Shell',
  // Demo screen, not a component reference — deliberately no status:* tag.
  // See ./README.md.
  tags: ['gallery'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleAppShell },
    template: '<FreestyleAppShell />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupAppShell },
    template: '<DzupAppShell />',
  }),
}

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupAppShell },
    template: '<BrandScope><DzupAppShell /></BrandScope>',
  }),
}
