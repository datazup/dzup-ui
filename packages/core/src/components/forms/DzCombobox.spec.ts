import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
/**
 * DzCombobox — Unit / behavior tests.
 */
import { defineComponent, h, nextTick, ref } from 'vue'
import DzCombobox from './DzCombobox.vue'
import DzFormField from './DzFormField.vue'
import DzFormLabel from './DzFormLabel.vue'

const items = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

const richItems = [
  { id: 'eng', name: 'Engineer', detail: 'Builds product flows' },
  { id: 'rev', name: 'Reviewer', detail: 'Checks correctness and quality' },
]

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView

describe('dzCombobox — controlled and uncontrolled value ownership', () => {
  it.each([false, true])('selection, controlled=%s', async (controlled) => {
    const wrapper = mount(DzCombobox, { attachTo: document.body, props: { items, modelValue: 'apple', defaultOpen: true, portalDisabled: true, ...(controlled ? { 'onUpdate:modelValue': () => {} } : {}) } })
    await nextTick()
    const banana = wrapper.findAll('[role="option"]').find(option => option.text() === 'Banana')!
    expect(banana.exists()).toBe(true)
    await banana.trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['banana'])
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe(controlled ? 'Apple' : 'Banana')
    await wrapper.setProps({ modelValue: 'cherry' })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('Cherry')
    wrapper.unmount()
  })
})

enableAutoUnmount(afterEach)

describe('dzCombobox — Unit Tests', () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = () => {}
  })

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView
  })

  it('renders the combobox root', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    expect(wrapper.find('[class~="[contain:layout_style]"]').exists()).toBe(true)
  })

  it('displays placeholder text', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, placeholder: 'Search...' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search...')
  })

  it('resets native input chrome so focus styling stays on the outer field', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const classList = wrapper.find('input').attributes('class') ?? ''
    expect(classList).toContain('dz-field-input-reset')
    expect(classList).toContain('border-none')
    expect(classList).toContain('focus:ring-0')
    expect(classList).toContain('focus-visible:ring-0')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, size: 'sm' },
    })
    expect(wrapper.html()).toContain('dz-input-sm-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('applies variant classes (filled)', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, variant: 'filled' },
    })
    expect(wrapper.html()).toContain('dz-muted')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, disabled: true },
    })
    const root = wrapper.find('[data-disabled]')
    expect(root.exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, invalid: true },
    })
    const root = wrapper.find('[data-invalid]')
    expect(root.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
      attrs: { class: 'my-combobox' },
    })
    expect(wrapper.html()).toContain('my-combobox')
  })

  it('emits focus on input focus', async () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const input = wrapper.find('input')
    await input.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur on input blur', async () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const input = wrapper.find('input')
    await input.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('opens when the input is clicked', async () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const input = wrapper.find('input')
    await input.trigger('click')
    expect(wrapper.emitted('open')).toBeTruthy()
  })

  it('has contain: layout style on anchor', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const el = wrapper.find('[class~="[contain:layout_style]"]')
    expect(el.exists()).toBe(true)
  })

  it('renders chevron icon', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('shows clear button when value is selected', () => {
    const wrapper = mount(DzCombobox, {
      props: {
        items,
        'modelValue': 'apple',
        'onUpdate:modelValue': () => {},
      },
    })
    const clearBtn = wrapper.find('[aria-label="Clear selection"]')
    expect(clearBtn.exists()).toBe(true)
  })

  it('does not show clear button when no value', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const clearBtn = wrapper.find('[aria-label="Clear selection"]')
    expect(clearBtn.exists()).toBe(false)
  })

  it('shows the selected item label in the input when controlled by v-model', () => {
    const Host = defineComponent({
      components: { DzCombobox },
      setup() {
        const selected = ref('banana')
        return { selected, items }
      },
      template: '<DzCombobox v-model="selected" :items="items" />',
    })

    const wrapper = mount(Host)
    expect(wrapper.find('input').element.value).toBe('Banana')
  })

  it('supports richer item shapes through resolver props', () => {
    const Host = defineComponent({
      components: { DzCombobox },
      setup() {
        const selected = ref('rev')
        return { selected, richItems }
      },
      template: `
        <DzCombobox
          v-model="selected"
          :items="richItems"
          :get-item-value="(item) => item.id"
          :get-item-label="(item) => item.name"
        />
      `,
    })

    const wrapper = mount(Host)
    expect(wrapper.find('input').element.value).toBe('Reviewer')
  })

  it('commits typed custom values when allowCustomValue is enabled', async () => {
    const Host = defineComponent({
      components: { DzCombobox },
      setup() {
        const selected = ref('')
        return { selected, items }
      },
      template: `
        <div>
          <DzCombobox
            v-model="selected"
            :items="items"
            allow-custom-value
          />
          <span data-testid="selected-value">{{ selected }}</span>
        </div>
      `,
    })

    const wrapper = mount(Host)
    await wrapper.find('input').setValue('Tech Lead')

    expect(wrapper.get('[data-testid="selected-value"]').text()).toBe('Tech Lead')
  })

  it('shows the full option list when opened from a selected value', async () => {
    const Host = defineComponent({
      components: { DzCombobox },
      setup() {
        const selected = ref('banana')
        return { selected, items }
      },
      template: '<DzCombobox v-model="selected" :items="items" />',
    })

    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.find('input').trigger('click')
    await nextTick()

    const optionTexts = Array
      .from(document.body.querySelectorAll('[role="option"]'))
      .map(node => node.textContent?.trim() ?? '')

    expect(optionTexts).toContain('Apple')
    expect(optionTexts).toContain('Banana')
    expect(optionTexts).toContain('Cherry')

    wrapper.unmount()
  })

  it('renders the loading state when open', async () => {
    const wrapper = mount(DzCombobox, {
      attachTo: document.body,
      props: {
        items,
        loading: true,
        loadingText: 'Loading roles…',
        defaultOpen: true,
      },
    })

    await nextTick()
    expect(document.body.textContent).toContain('Loading roles…')
    wrapper.unmount()
  })

  it('renders an inline error message linked via aria-describedby', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, error: 'Selection required' },
    })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Selection required')
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })

  it('renders real Reka options inline when portalDisabled is true', async () => {
    const wrapper = mount(DzCombobox, {
      props: { items, defaultOpen: true, portalDisabled: true },
      attachTo: document.body,
    })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(items.length)
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mount(DzCombobox, {
      props: { items, defaultOpen: true },
      attachTo: document.body,
    })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(items.length)
    wrapper.unmount()
  })
})

describe('dzCombobox — Accessible Name (axe aria-input-field-name)', () => {
  it('falls back to the placeholder so the input always has an accessible name', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, placeholder: 'Search cities...' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('aria-labelledby')).toBeUndefined()
    expect(input.attributes('aria-label')).toBe('Search cities...')
  })

  it('uses an explicit ariaLabel over the placeholder', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, placeholder: 'Search cities...', ariaLabel: 'City search' },
    })
    expect(wrapper.find('input').attributes('aria-label')).toBe('City search')
  })

  it('associates with the DzFormField label and drops the redundant aria-label', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => [
          h(DzFormLabel, () => 'Assignee'),
          h(DzCombobox, { items, placeholder: 'Search team members...' }),
        ],
      },
    })
    const input = wrapper.find('input')
    const labelledby = input.attributes('aria-labelledby')!
    expect(labelledby).toBeTruthy()
    const label = wrapper.find(`#${labelledby}`)
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Assignee')
    // aria-labelledby supplies the name, so no competing aria-label.
    expect(input.attributes('aria-label')).toBeUndefined()
  })
})

describe('dzCombobox — D9: a disabled control has no live clear button', () => {
  it('defect D9 -- the clear control is disabled when the combobox is', () => {
    // `ComboboxCancel`'s button had no `:disabled` binding while its sibling
    // `ComboboxTrigger` did, so a disabled combobox holding a value still
    // rendered a live, clickable Clear. `tabindex="-1"` kept keyboard users
    // safe; pointer and AT users were not (N1-O1 defect D9).
    const wrapper = mount(DzCombobox, {
      props: { items, modelValue: 'apple', disabled: true },
    })

    const clear = wrapper.find('[data-part="clear"]')
    expect(clear.exists()).toBe(true)
    expect((clear.element as HTMLButtonElement).disabled).toBe(true)

    // Nothing enabled inside a disabled control.
    const enabled = wrapper.findAll('button').filter(b => !(b.element as HTMLButtonElement).disabled)
    expect(enabled).toHaveLength(0)
  })

  it('defect D9 -- the clear control stays enabled when the combobox is not disabled', () => {
    const wrapper = mount(DzCombobox, { props: { items, modelValue: 'apple' } })
    const clear = wrapper.find('[data-part="clear"]')
    expect(clear.exists()).toBe(true)
    expect((clear.element as HTMLButtonElement).disabled).toBe(false)
  })
})

// DZUP-UI-R11-05A-20261006-C1: actual declared key dispatch, no marker-only credit.
describe('dzCombobox — declared keyboard actions', () => {
  it('opens, navigates both directions and endpoints, selects and dismisses', async () => {
    const wrapper = mount(DzCombobox, { attachTo: document.body, props: { items, portalDisabled: true, openOnFocus: false } })
    const input = wrapper.get('input')
    ;(input.element as HTMLInputElement).focus()
    const press = async (key: string) => {
      await input.trigger('keydown', { key })
      await flushPromises()
      await new Promise(resolve => setTimeout(resolve, 30))
    }
    const highlighted = () => document.getElementById(input.attributes('aria-activedescendant') ?? '')?.textContent?.trim()
    await press('ArrowDown')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(highlighted()).toBe('Apple')
    await press('ArrowDown')
    expect(highlighted()).toBe('Banana')
    await press('ArrowUp')
    expect(highlighted()).toBe('Apple')
    await press('End')
    expect(highlighted()).toBe('Cherry')
    await press('Home')
    expect(highlighted()).toBe('Apple')
    await press('Enter')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['apple'])
    expect(input.attributes('aria-expanded')).toBe('false')
    await press('ArrowUp')
    expect(input.attributes('aria-expanded')).toBe('true')
    await press('End')
    await press('Escape')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect((input.element as HTMLInputElement).value).toBe('Apple')
    await press('ArrowDown')
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    input.element.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    await nextTick()
    expect(input.attributes('aria-expanded')).toBe('false')
    // jsdom cannot perform native Tab traversal: move to its destination explicitly.
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    await flushPromises()
    outside.remove()
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    // Native focus traversal is qualified by e2e/matrix/combobox-keyboard.spec.ts.
  })
})

describe('dzCombobox — items that arrive after the value', () => {
  it('shows the label once the matching item arrives', async () => {
    const wrapper = mount(DzCombobox, { props: { modelValue: 'us', items: [] } })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('us')
    await wrapper.setProps({ items: [{ value: 'us', label: 'United States' }] })
    await nextTick()
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('United States')
  })

  it('re-resolves when displayValue changes while closed', async () => {
    const wrapper = mount(DzCombobox, { props: { modelValue: 'apple', items } })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('Apple')
    await wrapper.setProps({ displayValue: (item: { label: string } | undefined) => (item ? item.label.toUpperCase() : '') })
    await nextTick()
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('APPLE')
  })
})
