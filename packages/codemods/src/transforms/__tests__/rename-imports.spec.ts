/**
 * Tests for the rename-imports transform.
 *
 * Uses jscodeshift's test utilities to verify that import paths are correctly
 * rewritten from the old dzip-ui package names to the vNext scoped packages.
 */

import jscodeshift from 'jscodeshift'
import { describe, expect, it } from 'vitest'
import transformer from '../rename-imports.js'

/** Helper to run the transform on a source string and return the result. */
function applyTransform(source: string): string | null {
  const fileInfo = { path: 'test.ts', source }
  const j = jscodeshift.withParser('tsx')
  const api = {
    jscodeshift: j,
    j,
    report: () => {},
    stats: () => {},
  }
  return transformer(fileInfo, api, {})
}

describe('rename-imports transform', () => {
  // -----------------------------------------------------------------------
  // Basic rewrites
  // -----------------------------------------------------------------------

  it('rewrites bare "dzip-ui" to "@dzip-ui/core"', () => {
    const input = `import { DzButton } from 'dzip-ui'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzip-ui/core'`)
    expect(result).toContain('DzButton')
  })

  it('rewrites "@dzip-ui/components" to "@dzip-ui/core"', () => {
    const input = `import { DzInput, DzButton } from '@dzip-ui/components'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzip-ui/core'`)
    expect(result).toContain('DzInput')
    expect(result).toContain('DzButton')
  })

  it('rewrites "dzip-ui/pro" to "@dzip-ui/pro"', () => {
    const input = `import { DzKanbanBoard } from 'dzip-ui/pro'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzip-ui/pro'`)
    expect(result).toContain('DzKanbanBoard')
  })

  it('rewrites "@dzip-ui/pro-components" to "@dzip-ui/pro"', () => {
    const input = `import { DzGantt } from '@dzip-ui/pro-components'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzip-ui/pro'`)
  })

  // -----------------------------------------------------------------------
  // Pro component detection
  // -----------------------------------------------------------------------

  it('splits mixed core/pro imports from "dzip-ui"', () => {
    const input = `import { DzButton, DzKanbanBoard } from 'dzip-ui'`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    // DzButton should go to core, DzKanbanBoard to pro
    expect(result).toContain(`from '@dzip-ui/core'`)
    expect(result).toContain(`from '@dzip-ui/pro'`)
  })

  // -----------------------------------------------------------------------
  // Idempotency
  // -----------------------------------------------------------------------

  it('does not modify already-correct imports', () => {
    const input = `import { DzButton } from '@dzip-ui/core'`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('does not modify unrelated imports', () => {
    const input = `import { ref } from 'vue'`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  it('handles renamed (aliased) imports', () => {
    const input = `import { DzButton as MyButton } from 'dzip-ui'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzip-ui/core'`)
    expect(result).toContain('MyButton')
  })

  it('handles side-effect imports', () => {
    const input = `import 'dzip-ui'`
    const result = applyTransform(input)
    expect(result).toContain(`'@dzip-ui/core'`)
  })

  it('preserves multiple import statements', () => {
    const input = [
      `import { DzButton } from 'dzip-ui'`,
      `import { ref } from 'vue'`,
      `import { DzGantt } from 'dzip-ui/pro'`,
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain(`from '@dzip-ui/core'`)
    expect(result).toContain(`from '@dzip-ui/pro'`)
    expect(result).toContain(`from 'vue'`)
  })

  it('returns null when source has no imports', () => {
    const input = `const x = 42`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })
})
