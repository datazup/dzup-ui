import type { Meta, StoryObj } from '@storybook/vue3'
import DzupDataTable from './dzup/DzupDataTable.vue'
import FreestyleDataTable from './freestyle/FreestyleDataTable.vue'

const meta: Meta = {
  title: 'Visual Refresh/Data Table',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const FreeStyled: Story = {
  render: () => ({
    components: { FreestyleDataTable },
    template: '<FreestyleDataTable />',
  }),
}

export const DzupUI: Story = {
  render: () => ({
    components: { DzupDataTable },
    template: '<DzupDataTable />',
  }),
}
