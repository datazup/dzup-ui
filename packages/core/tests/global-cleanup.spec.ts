import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h, onUnmounted } from 'vue'

/**
 * The per-test cleanup in `vitest.setup.ts` (UI-DZUP-UI-TEST-L-02).
 *
 * The tests in each block run in order and depend on it: the first leaves
 * state behind the way a spec whose assertion failed before its
 * `wrapper.unmount()` does, and the second asserts the setup file swept it.
 * The first test cannot be made to fail for real without failing this file,
 * so it simply returns early — which is what a thrown assertion amounts to as
 * far as teardown is concerned.
 */

let unmounted = 0
const Leaky = defineComponent({
  setup() {
    onUnmounted(() => {
      unmounted += 1
    })
    return () => h('div', { 'data-testid': 'leaky' }, 'left behind')
  },
})

describe('a body-attached mount left by a test', () => {
  it('is left mounted, as an early-failing test would leave it', () => {
    mount(Leaky, { attachTo: document.body })
    const stray = document.createElement('div')
    stray.setAttribute('data-testid', 'stray-node')
    document.body.append(stray)
    expect(document.querySelector('[data-testid="leaky"]')).not.toBeNull()
    // No unmount, no removal: the test "fails" here.
  })

  it('is unmounted, and the nodes it added are gone, before the next test', () => {
    expect(unmounted).toBe(1)
    expect(document.querySelector('[data-testid="leaky"]')).toBeNull()
    expect(document.querySelector('[data-testid="stray-node"]')).toBeNull()
  })
})

describe('state set up outside a test is shared, not swept', () => {
  let shared: ReturnType<typeof mount>
  const fixture = document.createElement('div')

  beforeAll(() => {
    fixture.setAttribute('data-testid', 'suite-fixture')
    document.body.append(fixture)
    shared = mount(Leaky, { attachTo: document.body })
  })

  it('keeps a beforeAll mount and node for the first test', () => {
    expect(fixture.isConnected).toBe(true)
    expect(shared.find('[data-testid="leaky"]').exists()).toBe(true)
  })

  it('and still has both in the second', () => {
    expect(fixture.isConnected).toBe(true)
    expect(document.querySelector('[data-testid="leaky"]')).not.toBeNull()
    shared.unmount()
    fixture.remove()
  })
})
