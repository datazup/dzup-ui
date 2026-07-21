import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BrandScope from './BrandScope.vue'
import DzupSettings from './dzup/DzupSettings.vue'
import FreestyleSettings from './freestyle/FreestyleSettings.vue'

const meta: Meta = {
  title: 'Visual Refresh/Settings',
  // Demo screen, not a component reference — deliberately no status:* tag.
  // See ./README.md.
  tags: ['gallery'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleSettings },
    template: '<FreestyleSettings />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupSettings },
    template: '<DzupSettings />',
  }),
}

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupSettings },
    template: '<BrandScope><DzupSettings /></BrandScope>',
  }),
}
