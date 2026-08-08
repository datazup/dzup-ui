import { mount } from '@vue/test-utils'
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

describe('dzCascader — columns', () => {
  afterEach(() => {
    document.body.innerHTML = ''
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
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
})

describe('dzCascader — trigger combobox semantics', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
