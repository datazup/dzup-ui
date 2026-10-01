import { describe, expect, it } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { BLOCKS } from './registry.ts'
import { loadBlockSource, useBlockSource } from './sourceLoader.ts'
import { getBlockSource } from './sources.ts'

/**
 * The lazy loader is the browser's copy of `sources.ts`. The two globs must
 * agree byte for byte, or the Code tab would show one source while the registry
 * build published another.
 */
describe('loadBlockSource', () => {
  it.each(BLOCKS.map(b => [b.id, b.path] as const))('%s loads exactly the synchronous source', async (_id, path) => {
    await expect(loadBlockSource(path)).resolves.toBe(getBlockSource(path))
  })

  it('shares one request between concurrent callers, then serves from cache', async () => {
    const path = BLOCKS[0]!.path
    const [a, b] = await Promise.all([loadBlockSource(path), loadBlockSource(path)])
    expect(a).toBe(b)
    await expect(loadBlockSource(path)).resolves.toBe(a)
  })

  it('rejects a path with no block, with the same message as getBlockSource', async () => {
    const missing = './nowhere/Missing.vue'
    expect(() => getBlockSource(missing)).toThrow(/No \.vue found at "\.\/nowhere\/Missing\.vue"/)
    await expect(loadBlockSource(missing)).rejects.toThrow(/No \.vue found at "\.\/nowhere\/Missing\.vue"/)
  })
})

describe('useBlockSource', () => {
  async function settle(): Promise<void> {
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 0))
      await nextTick()
    }
  }

  it('resolves to the source, follows a changed path, and reads empty for null', async () => {
    const [first, second] = [BLOCKS[1]!, BLOCKS[2]!]
    const path = ref<string | null>(first.path)
    const scope = effectScope()
    const source = scope.run(() => useBlockSource(path))!

    await settle()
    expect(source.value).toBe(getBlockSource(first.path))

    path.value = second.path
    await settle()
    expect(source.value).toBe(getBlockSource(second.path))

    path.value = null
    expect(source.value).toBe('')
    scope.stop()
  })
})
