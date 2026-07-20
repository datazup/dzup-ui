import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BrandScope from './BrandScope.vue'
import DzupStates from './dzup/DzupStates.vue'
import FreestyleStates from './freestyle/FreestyleStates.vue'

const meta: Meta = {
  title: 'Visual Refresh/States',
  // Demo screen, not a component reference — deliberately no status:* tag.
  // See ./README.md.
  tags: ['gallery'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleStates },
    template: '<FreestyleStates />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupStates },
    template: '<DzupStates />',
  }),
}

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupStates },
    template: '<BrandScope><DzupStates /></BrandScope>',
  }),
}
