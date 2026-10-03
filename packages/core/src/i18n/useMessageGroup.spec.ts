import type { DzMessages } from '@dzup-ui/contracts'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { provideDzMessages } from '../composables/provider/useDzMessages.ts'
import { enAsyncOptionsMessages, enCascaderMessages, enMessages, enTransferMessages } from './messages.ts'
import { useMessageGroup } from './useMessageGroup.ts'

describe('scoped English message groups', () => {
  it('shares the exact defaults with the complete public catalog', () => {
    expect(enAsyncOptionsMessages).toBe(enMessages.DzAsyncOptions)
    expect(enCascaderMessages).toBe(enMessages.DzCascader)
    expect(enTransferMessages).toBe(enMessages.DzTransfer)
  })

  it('keeps per-key fallbacks and reacts when the host replaces its messages', async () => {
    const messages = ref<DzMessages>({ DzTransfer: { searchSource: 'Find source', sourceItems: { invalid: 'value' } } })
    const Child = defineComponent({
      setup() {
        const group = useMessageGroup('DzTransfer', enTransferMessages)
        return () => h('div', `${group.value.searchSource}|${group.value.sourceItems}|${group.value.moveToTarget}`)
      },
    })
    const Host = defineComponent({
      setup() {
        provideDzMessages(messages)
        return () => h(Child)
      },
    })
    const wrapper = mount(Host)
    expect(wrapper.text()).toBe('Find source|Source items|Move selected to target')
    messages.value = { DzTransfer: { sourceItems: 'Available' } }
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe('Search source items|Available|Move selected to target')
    messages.value = {}
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe('Search source items|Source items|Move selected to target')
    wrapper.unmount()
  })
})
