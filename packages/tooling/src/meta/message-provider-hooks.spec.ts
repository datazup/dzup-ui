import { describe, expect, it } from 'vitest'
import { buildComponentMeta } from './generate-component-meta.ts'

describe('scoped messages retain their published provider context', () => {
  it('reports message adoption for Cascader and Transfer in the actual catalog', () => {
    const { artifact } = buildComponentMeta()
    for (const name of ['DzCascader', 'DzTransfer']) {
      const component = artifact.components.find(component => component.name === name)
      expect(component, name).toBeDefined()
      expect(component!.providerHooks, name).toContain('useDzMessages')
    }
  }, 60_000)
})
