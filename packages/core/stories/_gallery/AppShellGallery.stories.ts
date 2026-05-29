import type { Meta, StoryObj } from '@storybook/vue3'
import BrandScope from './BrandScope.vue'
import DzupAppShell from './dzup/DzupAppShell.vue'

const meta: Meta = {
  title: 'Visual Refresh/App Shell',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

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
