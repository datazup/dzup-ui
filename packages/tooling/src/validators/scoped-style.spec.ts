import { describe, expect, it } from 'vitest'
import { checkScopedStyles, checkVueSource } from './scoped-style.ts'

const FILE = 'packages/core/src/components/buttons/DzExample.vue'

describe('checkVueSource', () => {
  it('passes an SFC with no style block', () => {
    const source = `<script setup lang="ts">\nconst a = 1\n</script>\n\n<template>\n  <div />\n</template>\n`
    expect(checkVueSource(FILE, source)).toEqual([])
  })

  it('flags <style scoped>', () => {
    const source = `<template>\n  <div />\n</template>\n\n<style scoped>\n.a { color: red; }\n</style>\n`
    const violations = checkVueSource(FILE, source)
    expect(violations).toHaveLength(1)
    expect(violations[0]!.line).toBe(5)
    expect(violations[0]!.message).toContain('ADR-04')
    expect(violations[0]!.message).toContain('base.css')
  })

  it('flags a plain unscoped <style> block too', () => {
    expect(checkVueSource(FILE, `<style>\n.a {}\n</style>\n`)).toHaveLength(1)
  })

  it('flags <style lang="postcss" scoped>', () => {
    expect(checkVueSource(FILE, `<style lang="postcss" scoped>\n.a {}\n</style>\n`)).toHaveLength(1)
  })

  it('does not mistake the phrase <style> inside a doc comment for a block', () => {
    // DzThemeProvider.vue really contains this line — it must stay green.
    const source = ` * Injects a \`<style>\` tag, forces a reflow, then removes it on the next frame.\n`
    expect(checkVueSource(FILE, source)).toEqual([])
  })

  it('reports every block when a file somehow carries several', () => {
    const source = `<style scoped>\n.a {}\n</style>\n<style>\n.b {}\n</style>\n`
    expect(checkVueSource(FILE, source)).toHaveLength(2)
  })
})

describe('checkScopedStyles (whole repo)', () => {
  it('no .vue under packages/core/src carries a <style> block', () => {
    const violations = checkScopedStyles()
    // Print the offenders rather than a bare count, so CI output is actionable.
    const report = violations.map(v => `${v.file}:${v.line}`).join('\n')
    expect(report).toBe('')
  })
})
