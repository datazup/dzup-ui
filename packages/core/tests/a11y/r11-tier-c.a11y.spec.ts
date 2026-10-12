/**
 * Axe scope for the thirteen Tier C components that had no running axe test
 * (DZUP-UI-R11-01-20261006-R1, GAP5-ui-dzup-ui-02).
 *
 * Every tree is mounted under a real `<main>` host landmark and scanned with
 * the default rule set: no rule is disabled. What each test measures is the
 * state it mounts — closed triggers for the components that portal their
 * popup through Reka, inline content for the rest. Open-portal content, human
 * AT and keyboard debt are separate cells and are not qualified here.
 */
import type { DzTourStep } from '../../src/components/overlays/DzTour.types.ts'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { h, nextTick } from 'vue'
import DzCalendar from '../../src/components/data/DzCalendar.vue'
import DzDataGrid from '../../src/components/data/DzDataGrid.vue'
import DzDataView from '../../src/components/data/DzDataView.vue'
import DzOrderList from '../../src/components/data/DzOrderList.vue'
import DzColorPicker from '../../src/components/forms/DzColorPicker.vue'
import DzDateRangePicker from '../../src/components/forms/DzDateRangePicker.vue'
import DzMention from '../../src/components/forms/DzMention.vue'
import DzPersonaSelector from '../../src/components/forms/DzPersonaSelector.vue'
import DzTimePicker from '../../src/components/forms/DzTimePicker.vue'
import DzTreeSelect from '../../src/components/forms/DzTreeSelect.vue'
import DzSidebar from '../../src/components/navigation/DzSidebar.vue'
import DzSidebarItem from '../../src/components/navigation/DzSidebarItem.vue'
import DzSidebarSection from '../../src/components/navigation/DzSidebarSection.vue'
import DzCommandPalette from '../../src/components/overlays/DzCommandPalette.vue'
import DzTour from '../../src/components/overlays/DzTour.vue'
import './register-matchers.ts'

const hosts: HTMLElement[] = []
function createLandmark(): HTMLElement {
  const landmark = document.createElement('main')
  document.body.append(landmark)
  hosts.push(landmark)
  return landmark
}
enableAutoUnmount(afterEach)
afterEach(() => {
  for (const host of hosts.splice(0))
    host.remove()
})

describe('r11 Tier C accessibility scope — data', () => {
  it('checks DzCalendar month grid with a selected day', async () => {
    const landmark = createLandmark()
    const wrapper = mount(DzCalendar, { props: { value: '2026-10-06', focusedDate: '2026-10-06', ariaLabel: 'Delivery date' }, attachTo: landmark })
    expect(wrapper.find('[role="grid"] [aria-selected="true"]').exists()).toBe(true)
    expect(await axe(landmark)).toHaveNoViolations()
  })

  it('checks DzDataGrid populated, empty and loading states', async () => {
    const landmark = createLandmark()
    const columns = [{ field: 'name', header: 'Name' }, { field: 'role', header: 'Role' }]
    const data = [{ name: 'Alice', role: 'Engineer' }, { name: 'Bob', role: 'Designer' }]
    const wrapper = mount(DzDataGrid, { props: { data, columns, ariaLabel: 'Team members' }, attachTo: landmark })
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ data: [] })
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ loading: true })
    expect(await axe(landmark)).toHaveNoViolations()
  })

  it('checks DzDataView list and grid layouts with rendered items', async () => {
    const landmark = createLandmark()
    const items = [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Bravo' }, { id: 3, name: 'Charlie' }]
    const wrapper = mount(DzDataView, {
      props: { items, layout: 'list', ariaLabel: 'Projects' },
      slots: { item: ({ item }: { item: { name: string } }) => h('span', item.name) },
      attachTo: landmark,
    })
    expect(wrapper.text()).toContain('Alpha')
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ layout: 'grid' })
    expect(await axe(landmark)).toHaveNoViolations()
  })

  it('checks DzOrderList rows with a selection', async () => {
    const landmark = createLandmark()
    const value = [{ id: 1, label: 'Alpha' }, { id: 2, label: 'Bravo' }, { id: 3, label: 'Charlie' }]
    const wrapper = mount(DzOrderList, {
      props: { value, dataKey: 'id', selectable: true, ariaLabel: 'Priority order' },
      slots: { item: ({ item }: { item: { label: string } }) => h('span', item.label) },
      attachTo: landmark,
    })
    expect(wrapper.text()).toContain('Bravo')
    expect(await axe(landmark)).toHaveNoViolations()
  })
})

describe('r11 Tier C accessibility scope — forms', () => {
  it('checks DzColorPicker closed trigger, valued and disabled', async () => {
    const landmark = createLandmark()
    const wrapper = mount(DzColorPicker, { props: { modelValue: '#ff0000', ariaLabel: 'Brand colour' }, attachTo: landmark })
    expect(wrapper.get('[data-part="trigger"]').attributes('aria-expanded')).toBe('false')
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ disabled: true })
    expect(await axe(landmark)).toHaveNoViolations()
  })

  it('checks DzDateRangePicker closed trigger, empty and with a range', async () => {
    const landmark = createLandmark()
    const wrapper = mount(DzDateRangePicker, { props: { placeholder: 'Pick a range', ariaLabel: 'Stay dates' }, attachTo: landmark })
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ modelValue: { start: '2026-10-01', end: '2026-10-06' } })
    expect(await axe(landmark)).toHaveNoViolations()
  })

  const mentionTriggers = [{ char: '@', options: [{ label: 'Alice', value: 'alice' }, { label: 'Bob', value: 'bob' }] }]

  it('checks DzMention single-line input with the menu closed', async () => {
    const landmark = createLandmark()
    const wrapper = mount(DzMention, { props: { triggers: mentionTriggers, multiline: false, ariaLabel: 'Comment' }, attachTo: landmark })
    expect(wrapper.get('input').attributes('role')).toBe('combobox')
    expect(await axe(landmark)).toHaveNoViolations()
  })

  // F2, an open defect and not a pass: the default multiline control is a
  // `<textarea role="combobox">`, a role ARIA in HTML does not allow on that
  // element. Pinned as an expected failure so the repair has to retire it.
  it.fails('pins DzMention multiline textarea failing aria-allowed-role', async () => {
    const landmark = createLandmark()
    mount(DzMention, { props: { triggers: mentionTriggers, ariaLabel: 'Comment' }, attachTo: landmark })
    expect(await axe(landmark)).toHaveNoViolations()
  })

  it('checks DzPersonaSelector closed trigger, populated, empty and disabled', async () => {
    const landmark = createLandmark()
    const personas = [{ id: '1', name: 'Alice Smith', role: 'Engineer' }, { id: '2', name: 'Bob Jones', role: 'Designer' }]
    const wrapper = mount(DzPersonaSelector, { props: { personas, placeholder: 'Choose persona', ariaLabel: 'Persona' }, attachTo: landmark })
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ personas: [] })
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ personas, disabled: true })
    expect(await axe(landmark)).toHaveNoViolations()
  })

  it('checks DzTimePicker closed combobox trigger, empty and valued', async () => {
    const landmark = createLandmark()
    const wrapper = mount(DzTimePicker, { props: { ariaLabel: 'Start time' }, attachTo: landmark })
    expect(wrapper.get('[data-part="trigger"]').attributes('aria-expanded')).toBe('false')
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ modelValue: '14:30' })
    expect(await axe(landmark)).toHaveNoViolations()
  })

  it('checks DzTreeSelect closed combobox, single and checkbox modes', async () => {
    const landmark = createLandmark()
    const nodes = [
      { key: 'fruit', label: 'Fruit', children: [{ key: 'apple', label: 'Apple' }, { key: 'banana', label: 'Banana' }] },
      { key: 'veg', label: 'Vegetable', disabled: true },
    ]
    const wrapper = mount(DzTreeSelect, { props: { nodes, ariaLabel: 'Category' }, attachTo: landmark })
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false')
    expect(await axe(landmark)).toHaveNoViolations()
    await wrapper.setProps({ selectionMode: 'checkbox', modelValue: ['apple'] })
    expect(await axe(landmark)).toHaveNoViolations()
  })
})

describe('r11 Tier C accessibility scope — navigation and overlays', () => {
  it('checks DzSidebar expanded and collapsed with sectioned items', async () => {
    // The sidebar is its own navigation landmark, so it is mounted beside the
    // host `<main>` rather than inside it, and the whole body is scanned.
    createLandmark().append(Object.assign(document.createElement('h1'), { textContent: 'Workspace' }))
    const wrapper = mount(DzSidebar, {
      props: { ariaLabel: 'Primary' },
      slots: {
        default: () => h(DzSidebarSection, { title: 'Workspace' }, () => [
          h(DzSidebarItem, { active: true, ariaLabel: 'Dashboard' }, () => 'Dashboard'),
          h(DzSidebarItem, { ariaLabel: 'Settings' }, () => 'Settings'),
        ]),
      },
      attachTo: document.body,
    })
    expect(wrapper.text()).toContain('Dashboard')
    expect(await axe(document.body)).toHaveNoViolations()
    await wrapper.setProps({ collapsed: true })
    expect(wrapper.find('[data-part="item-label"]').exists()).toBe(false)
    expect(await axe(document.body)).toHaveNoViolations()
  })

  // F3: a collapsed rail removes the label from the DOM, so the item's name is
  // the consumer's `ariaLabel`. Without it the item is nameless.
  it('records that a collapsed DzSidebar item without ariaLabel has no accessible name', async () => {
    createLandmark().append(Object.assign(document.createElement('h1'), { textContent: 'Workspace' }))
    mount(DzSidebar, {
      props: { ariaLabel: 'Primary', collapsed: true },
      slots: { default: () => h(DzSidebarItem, null, () => 'Dashboard') },
      attachTo: document.body,
    })
    const results = await axe(document.body)
    expect(results.violations.map(violation => violation.id)).toEqual(['button-name'])
  })

  it('checks DzCommandPalette open dialog and listbox rendered inline', async () => {
    Element.prototype.scrollIntoView = vi.fn()
    const landmark = createLandmark()
    const items = [{ id: 'edit', label: 'Edit File' }, { id: 'save', label: 'Save File' }]
    const wrapper = mount(DzCommandPalette, {
      props: { open: true, items, enableGlobalShortcut: false, portalDisabled: true },
      attachTo: landmark,
    })
    await flushPromises()
    await nextTick()
    const listbox = wrapper.get('[role="listbox"]')
    expect(listbox.attributes('id')).toBeTruthy()
    expect(wrapper.get('[role="combobox"]').attributes('aria-controls')).toBe(listbox.attributes('id'))
    expect(listbox.attributes('aria-label')).toBe('Command palette')
    expect(await axe(landmark)).toHaveNoViolations()
  })

  it('checks DzTour open step dialog teleported to the body', async () => {
    const landmark = createLandmark()
    const target = Object.assign(document.createElement('button'), { id: 'r11-tour-target', textContent: 'Create project' })
    landmark.append(target)
    const steps: DzTourStep[] = [
      { target: '#r11-tour-target', title: 'Create', description: 'Start a project here.' },
      { target: '#r11-tour-target', title: 'Done', description: 'That is the tour.' },
    ]
    mount(DzTour, { props: { steps, open: true }, attachTo: landmark })
    await flushPromises()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
