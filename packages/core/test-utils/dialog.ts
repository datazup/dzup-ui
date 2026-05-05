import type { ComponentMountingOptions } from '@vue/test-utils'
import { mount } from '@vue/test-utils'

const dialogStubs = {
  DialogRoot: { template: '<div data-testid="dialog-root"><slot /></div>' },
  DialogPortal: { template: '<div data-testid="dialog-portal"><slot /></div>' },
  DialogOverlay: { template: '<div data-testid="dialog-overlay"><slot /></div>' },
  DialogContent: { template: '<div data-testid="dialog-content"><slot /></div>' },
  DialogTitle: { template: '<h2 data-testid="dialog-title"><slot /></h2>' },
  DialogDescription: { template: '<p data-testid="dialog-description"><slot /></p>' },
  teleport: true,
}

type MountComponent = Parameters<typeof mount>[0]
type MountOptions = ComponentMountingOptions<unknown>

export function mountWithDialogStubs(
  component: MountComponent,
  options: MountOptions = {},
) {
  return mount(component, {
    ...options,
    global: {
      ...options.global,
      stubs: {
        ...dialogStubs,
        ...(options.global?.stubs ?? {}),
      },
    },
    attachTo: options.attachTo ?? document.body,
  })
}
