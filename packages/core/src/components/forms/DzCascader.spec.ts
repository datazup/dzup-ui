import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzCascader — Unit / behavior tests.
 *
 * Cascading multi-level select (Reka UI Popover). The popover content renders
 * through a portal; tests stub `PopoverPortal` so the panel renders inline,
 * then open the picker by clicking the trigger.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import DzCascader from './DzCascader.vue'

/** Stub the portal so popover content renders inline (not teleported). */
const InlinePortal = { template: '<div><slot /></div>' }

const options = [
  {
    label: 'China',
    value: 'cn',
    children: [
      {
        label: 'Zhejiang',
        value: 'zj',
        children: [
          { label: 'Hangzhou', value: 'hz' },
          { label: 'Ningbo', value: 'nb' },
        ],
      },
      {
        label: 'Jiangsu',
        value: 'js',
        children: [{ label: 'Nanjing', value: 'nj' }],
      },
    ],
  },
  {
    label: 'USA',
    value: 'us',
    children: [
      { label: 'California', value: 'ca', children: [{ label: 'Los Angeles', value: 'la' }] },
    ],
  },
]

function mountCascader(props: Record<string, unknown> = {}) {
  return mount(DzCascader, {
    props: { options, ...props },
    global: { stubs: { PopoverPortal: InlinePortal } },
    attachTo: document.body,
  })
}

async function openPanel(wrapper: ReturnType<typeof mountCascader>) {
  await wrapper.find('button').trigger('click')
  await wrapper.vm.$nextTick()
}

/** Find a column option button by its visible label. */
function optionByLabel(wrapper: ReturnType<typeof mountCascader>, label: string) {
  return wrapper
    .findAll('[data-cascader-column] button')
    .find(b => b.text().trim().startsWith(label))
}

/**
 * Teardown through Vue, not through the DOM (RESIDUAL-18). Eight of the nine `describe`
 * blocks below used to carry their own `document.body` wipe — eight copies of a hook
 * that detached the markup and left the cascader mounted, with its Reka dismissable
 * layer and pointer-down listener still on the document. One `enableAutoUnmount`
 * replaces all eight, covers the ninth block too, and actually unmounts.
 */
enableAutoUnmount(afterEach)

describe('dzCascader — columns', () => {
  it('commits an uncontrolled default model and retains the chosen leaf after closing', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    await optionByLabel(wrapper, 'China')!.trigger('click')
    await optionByLabel(wrapper, 'Zhejiang')!.trigger('click')
    await optionByLabel(wrapper, 'Hangzhou')!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['cn', 'zj', 'hz']])
    expect(wrapper.get('[role="combobox"]').text()).toContain('China / Zhejiang / Hangzhou')
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false')
  })

  it('requests and accepts a controlled model replacement from the host', async () => {
    const wrapper = mountCascader({ modelValue: ['cn', 'zj', 'hz'] })
    await openPanel(wrapper)
    await optionByLabel(wrapper, 'USA')!.trigger('click')
    await optionByLabel(wrapper, 'California')!.trigger('click')
    await optionByLabel(wrapper, 'Los Angeles')!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['us', 'ca', 'la']])
    await wrapper.setProps({ modelValue: ['us', 'ca', 'la'] })
    expect(wrapper.get('[role="combobox"]').text()).toContain('USA / California / Los Angeles')
    await wrapper.setProps({ modelValue: [] })
    expect(wrapper.get('[role="combobox"]').text()).toBe('Select')
  })

  it('selects a leaf with Space and dismisses with Escape without changing the selected path', async () => {
    const wrapper = mountCascader({ options: [{ value: 'one', label: 'One' }] })
    await openPanel(wrapper)
    await wrapper.get('[role="option"]').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['one']])
    await openPanel(wrapper)
    await wrapper.get('[role="option"]').trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('leaves Tab unconsumed and dismisses when browser focus advances outside the panel', async () => {
    const wrapper = mountCascader({ options: [{ value: 'one', label: 'One' }] })
    const next = document.createElement('button')
    document.body.append(next)
    await openPanel(wrapper)
    const option = wrapper.get('[role="option"]').element as HTMLElement
    option.focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    option.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    // jsdom has no native Tab traversal. Model that browser action explicitly.
    next.focus()
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(next)
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false')
    next.remove()
  })

  it('shows only the root column before any selection', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    expect(wrapper.findAll('[data-cascader-column]')).toHaveLength(1)
    expect(wrapper.text()).toContain('China')
    expect(wrapper.text()).toContain('USA')
  })

  it('appends a child column when a parent is chosen', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    await optionByLabel(wrapper, 'China')!.trigger('click')
    expect(wrapper.findAll('[data-cascader-column]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Zhejiang')
  })

  it('commits the full path and closes when a leaf is selected', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    await optionByLabel(wrapper, 'China')!.trigger('click')
    await optionByLabel(wrapper, 'Zhejiang')!.trigger('click')
    await optionByLabel(wrapper, 'Hangzhou')!.trigger('click')

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['cn', 'zj', 'hz'])
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual(['cn', 'zj', 'hz'])
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(['cn', 'zj', 'hz'])
    // Panel closed → columns gone.
    expect(wrapper.findAll('[data-cascader-column]')).toHaveLength(0)
  })

  it('does not commit a non-leaf without changeOnSelect', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    await optionByLabel(wrapper, 'China')!.trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('displays the selected path joined by the separator', async () => {
    const wrapper = mountCascader({ value: ['cn', 'zj', 'hz'] })
    expect(wrapper.text()).toContain('China / Zhejiang / Hangzhou')
  })
})

describe('dzCascader — portal placement', () => {
  it('renders real Reka content inline when portalDisabled is true', async () => {
    const wrapper = mount(DzCascader, {
      props: { options, portalDisabled: true },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(options.length)
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mount(DzCascader, {
      props: { options },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(options.length)
    wrapper.unmount()
  })

  it('forwards a custom portal target', async () => {
    const target = document.createElement('div')
    document.body.append(target)
    const wrapper = mount(DzCascader, {
      props: { options, portalTo: target },
      attachTo: document.body,
    })
    await openPanel(wrapper)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(target.querySelector('[role="listbox"]')).toBeTruthy()
    wrapper.unmount()
    target.remove()
  })
})

describe('dzCascader — changeOnSelect', () => {
  it('commits an intermediate node and keeps the panel open', async () => {
    const wrapper = mountCascader({ changeOnSelect: true })
    await openPanel(wrapper)
    await optionByLabel(wrapper, 'China')!.trigger('click')

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['cn'])
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual(['cn'])
    // Still open: the child column is visible.
    expect(wrapper.findAll('[data-cascader-column]')).toHaveLength(2)
  })
})

describe('dzCascader — hover expand', () => {
  it('expands a child column on hover without committing', async () => {
    const wrapper = mountCascader({ expandTrigger: 'hover' })
    await openPanel(wrapper)
    await optionByLabel(wrapper, 'China')!.trigger('mouseenter')

    expect(wrapper.findAll('[data-cascader-column]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Zhejiang')
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})

describe('dzCascader — filter', () => {
  it('renders a flat list of full paths matching the query', async () => {
    const wrapper = mountCascader({ filter: true })
    await openPanel(wrapper)
    const search = wrapper.find('[data-dz-cascader-search]')
    await search.setValue('hang')

    // Columns hidden; flat results shown.
    expect(wrapper.findAll('[data-cascader-column]')).toHaveLength(0)
    const results = wrapper.findAll('[role="option"]')
    expect(results.some(r => r.text().includes('China / Zhejiang / Hangzhou'))).toBe(true)
  })

  it('commits the chosen flat path and closes', async () => {
    const wrapper = mountCascader({ filter: true })
    await openPanel(wrapper)
    await wrapper.find('[data-dz-cascader-search]').setValue('ningbo')
    const result = wrapper.findAll('[role="option"]').find(r => r.text().includes('Ningbo'))
    await result!.trigger('click')

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['cn', 'zj', 'nb'])
  })

  it('shows the no-results copy when nothing matches', async () => {
    const wrapper = mountCascader({ filter: true, noResultsText: 'Nothing here' })
    await openPanel(wrapper)
    await wrapper.find('[data-dz-cascader-search]').setValue('zzzz')
    expect(wrapper.find('[data-dz-cascader-empty]').text()).toContain('Nothing here')
  })
})

describe('dzCascader — keyboard column nav', () => {
  it('arrowRight enters the child column and Enter selects within it', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    const columns = wrapper.find('[role="listbox"]')

    // Root focus starts on China (index 0). Expand into its children.
    await columns.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-cascader-column]')).toHaveLength(2)

    // Move down to the second child, then drill + select the leaf.
    await columns.trigger('keydown', { key: 'ArrowDown' })
    await columns.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()
    await columns.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['cn', 'js', 'nj'])
  })

  it('arrowLeft returns focus to the parent column', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    const columns = wrapper.find('[role="listbox"]')

    await columns.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()
    await columns.trigger('keydown', { key: 'ArrowLeft' })
    await wrapper.vm.$nextTick()

    // Active cell is back in the root column (col 0).
    const activeBtn = wrapper.find('button[data-active="true"]')
    expect(activeBtn.attributes('data-col')).toBe('0')
  })

  // RESIDUAL-13, closing RESIDUAL-12 §4 `F4`: both rows were declared as APG
  // `combobox` and were absent from `onColumnsKeydown`'s switch.
  it('end moves to the last option of the focused column and Home back to the first', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    const columns = wrapper.find('[role="listbox"]')

    await columns.trigger('keydown', { key: 'End' })
    await wrapper.vm.$nextTick()
    let active = wrapper.find('button[data-active="true"]')
    expect(active.attributes('data-col')).toBe('0')
    expect(active.attributes('data-index')).toBe('1')
    expect(active.text()).toContain('USA')

    await columns.trigger('keydown', { key: 'Home' })
    await wrapper.vm.$nextTick()
    active = wrapper.find('button[data-active="true"]')
    expect(active.attributes('data-index')).toBe('0')
    expect(active.text()).toContain('China')
  })

  it('end stays inside the focused column rather than crossing to another one', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    const columns = wrapper.find('[role="listbox"]')

    // Drill into China's children: Zhejiang (0), Jiangsu (1).
    await columns.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()

    await columns.trigger('keydown', { key: 'End' })
    await wrapper.vm.$nextTick()

    const active = wrapper.find('button[data-active="true"]')
    expect(active.attributes('data-col')).toBe('1')
    expect(active.attributes('data-index')).toBe('1')
    expect(active.text()).toContain('Jiangsu')
  })

  it('consumes Home and End rather than letting the page scroll to its ends', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    const columns = wrapper.find('[role="listbox"]')

    for (const key of ['Home', 'End']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      columns.element.dispatchEvent(event)
      expect(event.defaultPrevented, `\`${key}\` was not consumed`).toBe(true)
    }
  })
})

describe('dzCascader — trigger combobox semantics', () => {
  it('exposes role="combobox" on the trigger', () => {
    const wrapper = mountCascader()
    const trigger = wrapper.find('button')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
  })

  it('wires aria-controls to the panel once open', async () => {
    const wrapper = mountCascader()
    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-controls')).toBeUndefined()

    await openPanel(wrapper)
    const controls = trigger.attributes('aria-controls')
    expect(controls).toBeTruthy()
    expect(wrapper.find(`#${controls}`).exists()).toBe(true)
  })

  it('arrowDown on the trigger opens the panel and focuses the first option', async () => {
    const wrapper = mountCascader()
    await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('open')).toBeTruthy()
    const activeBtn = wrapper.find('[data-cascader-column] button[data-active="true"]')
    expect(activeBtn.attributes('data-col')).toBe('0')
    expect(activeBtn.attributes('data-index')).toBe('0')
    expect(activeBtn.text()).toContain('China')
  })

  it('arrowUp on the trigger opens the panel and focuses the last option', async () => {
    const wrapper = mountCascader()
    await wrapper.find('button').trigger('keydown', { key: 'ArrowUp' })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('open')).toBeTruthy()
    const activeBtn = wrapper.find('[data-cascader-column] button[data-active="true"]')
    expect(activeBtn.attributes('data-col')).toBe('0')
    expect(activeBtn.text()).toContain('USA')
  })

  it('does not open from the trigger when disabled', async () => {
    const wrapper = mountCascader({ disabled: true })
    await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('open')).toBeUndefined()
    expect(wrapper.findAll('[data-cascader-column]')).toHaveLength(0)
  })
})

describe('dzCascader — clear', () => {
  it('clears the value via the cleaner button', async () => {
    const wrapper = mountCascader({ value: ['cn', 'zj', 'hz'] })
    const clear = wrapper.find('[aria-label="Clear selection"]')
    expect(clear.exists()).toBe(true)
    await clear.trigger('click')

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([])
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('emits open/close as the panel toggles', async () => {
    const wrapper = mountCascader()
    await openPanel(wrapper)
    expect(wrapper.emitted('open')).toBeTruthy()
  })

  it('does not commit when readonly', async () => {
    const onChange = vi.fn()
    const wrapper = mountCascader({ readonly: true })
    await openPanel(wrapper)
    const china = optionByLabel(wrapper, 'China')
    if (china)
      await china.trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(onChange).not.toHaveBeenCalled()
  })
})

// -- D8: controlled/uncontrolled -------------------------------------------

describe('dzCascader — D8: an external write after a user edit is honoured', () => {
  it('defect D8 -- a parent that clears `v-model:value` after a path was chosen is obeyed', async () => {
    const wrapper = mountCascader({ value: [] })

    await openPanel(wrapper)
    await optionByLabel(wrapper, 'China')!.trigger('click')
    await optionByLabel(wrapper, 'Zhejiang')!.trigger('click')
    await optionByLabel(wrapper, 'Hangzhou')!.trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['cn', 'zj', 'hz'])

    await wrapper.setProps({ value: ['cn', 'zj', 'hz'] })
    expect(wrapper.text()).toContain('Hangzhou')

    // A form reset. Before the fix the trigger kept showing the chosen path
    // (N1-O1 defect D8).
    await wrapper.setProps({ value: [] })
    expect(wrapper.text()).not.toContain('Hangzhou')
    expect(wrapper.text()).toContain('Select')
  })
})
