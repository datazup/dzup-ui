import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BrandScope from './BrandScope.vue'
import DzupForm from './dzup/DzupForm.vue'
import FreestyleForm from './freestyle/FreestyleForm.vue'

const meta: Meta = {
  title: 'Visual Refresh/Form',
  // Demo screen, not a component reference — deliberately no status:* tag.
  // See ./README.md.
  tags: ['gallery'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleForm },
    template: '<FreestyleForm />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupForm },
    template: '<DzupForm />',
  }),
}

export const DzupUIBrand: Story = {
  name: 'dzup-ui (datazup brand)',
  render: () => ({
    components: { BrandScope, DzupForm },
    template: '<BrandScope><DzupForm /></BrandScope>',
  }),
}
