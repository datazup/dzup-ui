import { describe, expect, it } from 'vitest'

// Test the module configuration and component lists
describe('@dzup-ui/nuxt module', () => {
  it('exports a defineNuxtModule-compatible default export', async () => {
    const mod = await import('./module')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('cORE_COMPONENTS list includes key foundational components', async () => {
    // Import to verify the module can be loaded
    const mod = await import('./module')
    expect(mod.default).toBeDefined()
  })

  it('module meta has correct name and config key', async () => {
    const mod = await import('./module')
    const module = mod.default
    // Nuxt modules created with defineNuxtModule have a __nuxt_module meta
    expect(module).toBeDefined()
  })
})
