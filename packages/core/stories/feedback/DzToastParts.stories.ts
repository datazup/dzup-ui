import type { Meta, StoryObj } from '@storybook/vue3'
import type { DzToastContext } from '../../src/components/feedback'
import { inject } from 'vue'
import { DzButton } from '../../src/components/buttons'
import {
  DZ_TOAST_KEY,
  DzToast,
  DzToastProvider,
  DzToastViewport,
} from '../../src/components/feedback'

/**
 * DzToast compound sub-parts: DzToastProvider and DzToastViewport.
 *
 * DzToastProvider wraps the application and provides toast context (add, remove, clear).
 * DzToastViewport renders active toasts at a configurable screen position.
 * DzToast renders individual toast notifications with title, description, tone, and actions.
 *
 * Built on Reka UI Toast primitives (ADR-07). Context injection via ADR-08.
 */

const meta = {
  title: 'Core/Feedback/DzToastParts',
  component: DzToastProvider,
  subcomponents: { DzToastViewport, DzToast },
  tags: ['autodocs'],
  argTypes: {
    duration: {
      control: 'number',
      description: 'Default auto-dismiss duration in milliseconds (0 = persistent)',
      table: { category: 'Behavior', defaultValue: { summary: '5000' } },
    },
    maxToasts: {
      control: 'number',
      description: 'Maximum number of visible toasts',
      table: { category: 'Behavior', defaultValue: { summary: '5' } },
    },
    swipeDirection: {
      control: 'select',
      options: ['right', 'left', 'up', 'down'],
      description: 'Swipe direction for dismissal',
      table: { category: 'Behavior', defaultValue: { summary: 'right' } },
    },
  },
} satisfies Meta<typeof DzToastProvider>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Helper: Toast Trigger Component
// ---------------------------------------------------------------------------

const ToastTrigger = {
  name: 'ToastTrigger',
  components: { DzButton },
  setup() {
    const ctx = inject<DzToastContext>(DZ_TOAST_KEY)
    const addToast = (tone: string) => {
      ctx?.add({
        title: `${tone.charAt(0).toUpperCase() + tone.slice(1)} Toast`,
        description: `This is a ${tone} toast notification.`,
        tone: tone as 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info',
      })
    }
    return { addToast }
  },
  template: `
    <div class="flex flex-wrap gap-2">
      <DzButton v-for="t in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']"
        :key="t" size="sm" variant="outline" @click="addToast(t)" class="capitalize">{{ t }}</DzButton>
    </div>
  `,
}

// ---------------------------------------------------------------------------
// Default: Provider + Viewport + Triggers
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzToastProvider, DzToastViewport, ToastTrigger },
    template: `
      <DzToastProvider>
        <div class="space-y-4">
          <p class="text-sm text-gray-500">Click a button to add a toast notification.</p>
          <ToastTrigger />
        </div>
        <DzToastViewport position="bottom-right" />
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Viewport Positions
// ---------------------------------------------------------------------------

export const ViewportPositions: Story = {
  name: 'Viewport Positions',
  render: () => ({
    components: { DzToastProvider, DzToastViewport, DzButton },
    setup() {
      const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'] as const
      return { positions }
    },
    template: `
      <DzToastProvider>
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            DzToastViewport supports six positions: top-right, top-left, bottom-right,
            bottom-left, top-center, and bottom-center. The viewport anchor point
            determines where toasts stack.
          </p>
          <p class="text-xs text-gray-400">
            Positions: {{ positions.join(', ') }}
          </p>
        </div>
        <DzToastViewport position="bottom-right" />
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Action
// ---------------------------------------------------------------------------

export const WithAction: Story = {
  name: 'With Action Button',
  render: () => ({
    components: { DzToastProvider, DzToastViewport, DzButton },
    setup() {
      const ctx = { add: null as ReturnType<typeof inject<DzToastContext>> }
      return { ctx }
    },
    mounted() {
      const toastCtx = inject<DzToastContext>(DZ_TOAST_KEY)
      if (toastCtx) {
        this.ctx.add = toastCtx.add as ReturnType<typeof inject<DzToastContext>>
      }
    },
    template: `
      <DzToastProvider>
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Toasts can include an action button via the actionLabel and onAction properties.
          </p>
          <ToastTrigger />
        </div>
        <DzToastViewport position="bottom-right" />
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Persistent Toasts
// ---------------------------------------------------------------------------

export const Persistent: Story = {
  name: 'Persistent (No Auto-Dismiss)',
  render: () => ({
    components: { DzToastProvider, DzToastViewport, DzButton },
    setup() {
      return {}
    },
    template: `
      <DzToastProvider :duration="0">
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            With duration=0 on the provider, toasts persist until manually dismissed.
          </p>
          <ToastTrigger />
        </div>
        <DzToastViewport position="bottom-right" />
      </DzToastProvider>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Live Region',
  render: () => ({
    components: { DzToastProvider, DzToastViewport, ToastTrigger },
    template: `
      <DzToastProvider>
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            DzToastViewport renders as a Reka UI ToastViewport with role="region"
            and aria-live="polite". New toasts are announced to screen readers
            as they appear. Each toast has role="status" and includes its title
            and description text.
          </p>
          <ToastTrigger />
        </div>
        <DzToastViewport position="bottom-right" />
      </DzToastProvider>
    `,
  }),
}
