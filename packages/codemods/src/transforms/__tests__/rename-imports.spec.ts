/**
 * Tests for the rename-imports transform.
 *
 * Uses jscodeshift's test utilities to verify that import paths are correctly
 * rewritten from the old dzup-ui package names to the vNext scoped packages.
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

  it('rewrites bare "dzup-ui" to "@dzup-ui/core"', () => {
    const input = `import { DzButton } from 'dzup-ui'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzup-ui/core'`)
    expect(result).toContain('DzButton')
  })

  it('rewrites "@dzup-ui/components" to "@dzup-ui/core"', () => {
    const input = `import { DzInput, DzButton } from '@dzup-ui/components'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzup-ui/core'`)
    expect(result).toContain('DzInput')
    expect(result).toContain('DzButton')
  })

  it('rewrites "dzup-ui/pro" to "@dzup-ui/pro"', () => {
    const input = `import { DzKanbanBoard } from 'dzup-ui/pro'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzup-ui/pro'`)
    expect(result).toContain('DzKanbanBoard')
  })

  it('rewrites "@dzup-ui/pro-components" to "@dzup-ui/pro"', () => {
    const input = `import { DzGantt } from '@dzup-ui/pro-components'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzup-ui/pro'`)
  })

  // -----------------------------------------------------------------------
  // Pro component detection
  // -----------------------------------------------------------------------

  it('splits mixed core/pro imports from "dzup-ui"', () => {
    const input = `import { DzButton, DzKanbanBoard } from 'dzup-ui'`
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    // DzButton should go to core, DzKanbanBoard to pro
    expect(result).toContain(`from '@dzup-ui/core'`)
    expect(result).toContain(`from '@dzup-ui/pro'`)
  })

  // -----------------------------------------------------------------------
  // Idempotency
  // -----------------------------------------------------------------------

  it('does not modify already-correct imports', () => {
    const input = `import { DzButton } from '@dzup-ui/core'`
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
    const input = `import { DzButton as MyButton } from 'dzup-ui'`
    const result = applyTransform(input)
    expect(result).toContain(`from '@dzup-ui/core'`)
    expect(result).toContain('MyButton')
  })

  it('handles side-effect imports', () => {
    const input = `import 'dzup-ui'`
    const result = applyTransform(input)
    expect(result).toContain(`'@dzup-ui/core'`)
  })

  it('preserves multiple import statements', () => {
    const input = [
      `import { DzButton } from 'dzup-ui'`,
      `import { ref } from 'vue'`,
      `import { DzGantt } from 'dzup-ui/pro'`,
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain(`from '@dzup-ui/core'`)
    expect(result).toContain(`from '@dzup-ui/pro'`)
    expect(result).toContain(`from 'vue'`)
  })

  it('returns null when source has no imports', () => {
    const input = `const x = 42`
    const result = applyTransform(input)
    expect(result).toBeNull()
  })
})
